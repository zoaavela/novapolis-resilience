"""API FastAPI : fait le lien entre le site web et les algorithmes.

Le site envoie une question (« quel trajet de C1 à Q4 ? »), l'API charge la
ville, lance le bon algorithme et renvoie la réponse en JSON. Le format de
chaque réponse est décrit dans frontend/src/api.js : c'est le contrat.

Lancer en local :  uvicorn api.main:app --reload --app-dir backend
Documentation interactive ensuite sur http://localhost:8000/docs
"""

from __future__ import annotations

import json
import math
import os
import tempfile
from functools import lru_cache
from pathlib import Path
from typing import Literal

from fastapi import FastAPI, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from novapolis import arbres, chemins, donnees, indicateurs, parcours, scenarios
from novapolis.resultats import Chemin
from pydantic import BaseModel, Field

app = FastAPI(title="Novapolis Résilience", version="0.2.0")

# Adresse exacte du front, jamais "*". En local : http://localhost:5173
origines = [
    o.strip()
    for o in os.environ.get("FRONT_ORIGIN", "http://localhost:5173").split(",")
    if o.strip()
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origines,
    allow_methods=["GET", "POST"],
    allow_headers=["Content-Type"],
)


@app.middleware("http")
async def entetes_securite(request: Request, call_next):
    reponse = await call_next(request)
    reponse.headers["X-Content-Type-Options"] = "nosniff"
    reponse.headers["X-Frame-Options"] = "DENY"
    reponse.headers["Referrer-Policy"] = "no-referrer"
    reponse.headers["Strict-Transport-Security"] = "max-age=31536000; includeSubDomains"
    return reponse


TAILLE_MAX_CORPS = 1_200_000  # octets : un CSV de 1 Mo plus l'enveloppe JSON


@app.middleware("http")
async def limiter_taille(request: Request, call_next):
    """Refuse les requêtes trop grosses avant même de les lire (envoi de fichiers)."""
    taille = request.headers.get("content-length")
    if taille is not None and (not taille.isdigit() or int(taille) > TAILLE_MAX_CORPS):
        return JSONResponse(status_code=413, content={"detail": "Fichier trop volumineux (1 Mo au plus)."})
    return await call_next(request)


@app.exception_handler(NotImplementedError)
async def pas_encore_ecrit(request: Request, exc: NotImplementedError):
    # Un algo de Max ou d'Elio n'est pas encore codé : on le dit proprement
    # au lieu de planter avec une erreur 500.
    return JSONResponse(
        status_code=501,
        content={"detail": "Cette partie n'est pas encore disponible, elle est en cours d'écriture."},
    )


# ---------------------------------------------------------------------------
# Chargement des jeux de données
# ---------------------------------------------------------------------------

DOSSIER_DATA = Path(__file__).resolve().parents[2] / "data"

# Liste fermée : le site ne peut demander QUE ces noms. Impossible de lui
# faire lire un autre dossier du serveur en changeant le paramètre.
JEUX = {"petit": DOSSIER_DATA / "petit", "ville": DOSSIER_DATA / "ville"}
Jeu = Literal["petit", "ville"]
Algo = Literal["dijkstra", "bellman-ford", "floyd-warshall"]


class Ville:
    """Tout ce qu'on a lu dans les CSV d'un jeu, gardé en mémoire."""

    def __init__(self, dossier: Path) -> None:
        self.sites = donnees.charger_sites(dossier / "sites.csv")
        self.routes_normal = donnees.charger_routes(dossier / "routes.csv", self.sites, "normal")
        self.routes_pointe = donnees.charger_routes(dossier / "routes.csv", self.sites, "pointe")
        self.fibre = donnees.charger_fibre(dossier / "fibre.csv", self.sites)
        self.demandes = donnees.charger_demandes(dossier / "demandes.csv")
        self.scenarios = donnees.charger_scenarios(dossier / "scenarios.csv")
        self.lignes_routes = donnees.lire_csv(dossier / "routes.csv")
        self.lignes_fibre = donnees.lire_csv(dossier / "fibre.csv")
        self.casernes = [s for s, infos in self.sites.items() if infos["type"] == "caserne"]
        # Décor facultatif (la rivière de Novapolis), seulement pour l'affichage.
        decor = dossier / "decor.json"
        self.decor = json.loads(decor.read_text(encoding="utf-8")) if decor.exists() else None


@lru_cache(maxsize=len(JEUX))
def ville(jeu: str) -> Ville:
    """On lit les CSV une seule fois par jeu, puis on garde le résultat."""
    return Ville(JEUX[jeu])


def verifier_site(v: Ville, site: str) -> None:
    if site not in v.sites:
        raise HTTPException(status_code=404, detail=f"Site inconnu : {site}")


def routes_du_scenario(v: Ville, scenario: str):
    """Graphe des routes une fois le scénario appliqué (sur une copie).

    S0 = situation normale. L'heure de pointe change les temps : on prend
    le graphe chargé en mode pointe. Les fermetures passent par
    scenarios.appliquer (Elio), qui travaille sur une copie.
    """
    if scenario == "S0":
        return v.routes_normal
    if scenario not in v.scenarios:
        raise HTTPException(status_code=404, detail=f"Scénario inconnu : {scenario}")
    actions = v.scenarios[scenario]
    pointe = any(a.action == "pointe" for a in actions)
    graphe = v.routes_pointe if pointe else v.routes_normal
    autres = [a for a in actions if a.reseau == "routes" and a.action != "pointe"]
    if autres:
        graphe = scenarios.appliquer(graphe, autres, "routes")
    return graphe


def minutes(d: float) -> float | None:
    """Le JSON ne connaît pas l'infini : inatteignable devient null."""
    return d if math.isfinite(d) else None


def nom_scenario(sid: str, actions: list[donnees.Action]) -> dict:
    """Nom lisible et détails d'un scénario, pour l'afficher sur le site."""
    fermes = [[a.u, a.v] for a in actions if a.action == "fermer"]
    pannes = [[a.u, a.v] for a in actions if a.action == "panne"]
    if any(a.action == "pointe" for a in actions):
        return {"id": sid, "nom": "Heure de pointe", "reseau": "routes", "pointe": True}
    if pannes:
        u, v = pannes[0]
        return {"id": sid, "nom": f"Panne fibre {u}, {v}", "reseau": "fibre", "panne": pannes[0]}
    if fermes:
        sites = sorted({s for arc in fermes for s in arc})
        nom = f"Fermeture {', '.join(sites)}" if len(sites) <= 3 else f"Fermeture de {len(fermes)} arcs"
        return {"id": sid, "nom": nom, "reseau": "routes", "fermes": fermes}
    return {"id": sid, "nom": sid, "reseau": actions[0].reseau if actions else "routes"}


# ---------------------------------------------------------------------------
# Formats des requêtes : FastAPI refuse tout seul ce qui ne colle pas (422)
# ---------------------------------------------------------------------------

IdSite = Field(min_length=1, max_length=20, pattern=r"^[A-Za-z0-9_-]+$")
IdScenario = Field(default="S0", min_length=1, max_length=20, pattern=r"^[A-Za-z0-9_-]+$")


class DemandeItineraire(BaseModel):
    jeu: Jeu = "petit"
    scenario: str = IdScenario
    source: str = IdSite
    cible: str = IdSite
    algo: Algo = "dijkstra"


class DemandeAccessibilite(BaseModel):
    jeu: Jeu = "petit"
    scenario: str = IdScenario
    sources: list[str] = Field(min_length=1, max_length=10)


class DemandeScenario(BaseModel):
    jeu: Jeu = "petit"
    scenario: str = IdScenario
    algo: Literal["dijkstra", "bellman-ford", "floyd-warshall"] = "dijkstra"
    source: str | None = Field(default=None, max_length=20, pattern=r"^[A-Za-z0-9_-]+$")
    cible: str | None = Field(default=None, max_length=20, pattern=r"^[A-Za-z0-9_-]+$")


class DemandeFermeture(BaseModel):
    jeu: Jeu = "petit"
    fermes: list[tuple[str, str]] = Field(default_factory=list, max_length=20)
    algo: Literal["dijkstra", "bellman-ford", "floyd-warshall"] = "dijkstra"
    source: str | None = Field(default=None, max_length=20, pattern=r"^[A-Za-z0-9_-]+$")
    cible: str | None = Field(default=None, max_length=20, pattern=r"^[A-Za-z0-9_-]+$")


class DemandeValidation(BaseModel):
    jeu: Jeu = "petit"
    fichier: Literal["sites", "routes", "fibre", "demandes", "scenarios"]
    contenu: str = Field(min_length=1, max_length=1_000_000)


class DemandeCircuit(BaseModel):
    cas: Literal["accessible", "non_accessible"] = "accessible"
    source: str = IdSite


class DemandeFibre(BaseModel):
    jeu: Jeu = "petit"
    algo: Literal["kruskal", "prim"] = "kruskal"
    panne: list[str] | None = Field(default=None, min_length=2, max_length=2)


# ---------------------------------------------------------------------------
# Routes
# ---------------------------------------------------------------------------

@app.get("/health")
def health() -> dict[str, str]:
    return {"status": "ok"}


@app.get("/reseau")
def reseau(jeu: Jeu = "petit") -> dict:
    """Tout ce qu'il faut pour dessiner la ville."""
    v = ville(jeu)
    return {
        "sites": [
            {"id": s, "nom": i["nom"], "type": i["type"], "x": i["longitude"], "y": i["latitude"]}
            for s, i in v.sites.items()
        ],
        "routes": [
            {"u": r["u"], "v": r["v"], "temps_normal": float(r["temps_normal"]),
             "temps_pointe": float(r["temps_pointe"]), "statut": r["statut"]}
            for r in v.lignes_routes
        ],
        "fibre": [
            {"u": f["u"], "v": f["v"], "cout": float(f["cost"]), "statut": f["statut"]}
            for f in v.lignes_fibre
        ],
        "demandes": [
            {"id": d.id, "site": d.origine, "type": d.type, "priorite": d.priorite}
            for d in v.demandes
        ],
        "scenarios": [{"id": "S0", "nom": "Situation normale", "reseau": "routes"}]
        + [nom_scenario(sid, actions) for sid, actions in v.scenarios.items()],
        "decor": v.decor,
    }


def chemin_floyd(resultat, source: str, cible: str) -> Chemin | None:
    """Reconstruit source -> cible avec la matrice des successeurs de Floyd-Warshall.

    successeurs[u][cible] donne le sommet qui suit u sur le chemin : on avance
    de proche en proche jusqu'à la cible. None si inatteignable ou si la
    distance n'est pas finie (circuit absorbant).
    """
    d = resultat.distances[source][cible]
    if not math.isfinite(d):
        return None
    sommets = [source]
    while sommets[-1] != cible:
        suivant = resultat.successeurs[sommets[-1]][cible]
        if suivant is None or len(sommets) > len(resultat.distances):
            return None
        sommets.append(suivant)
    return Chemin(sommets=sommets, duree=d)


@app.post("/itineraire")
def itineraire(req: DemandeItineraire) -> dict:
    """Plus court chemin d'un site à un autre (Dijkstra, Bellman-Ford ou Floyd-Warshall)."""
    v = ville(req.jeu)
    verifier_site(v, req.source)
    verifier_site(v, req.cible)
    graphe = routes_du_scenario(v, req.scenario)

    # Floyd-Warshall calcule toutes les paires d'un coup : trajet() lit la ligne de la source.
    return {**trajet(graphe, req.algo, req.source, req.cible), "algo": req.algo}


@app.post("/accessibilite")
def accessibilite(req: DemandeAccessibilite) -> dict:
    """Sites atteignables depuis les casernes choisies (BFS d'Enzo)."""
    v = ville(req.jeu)
    for s in req.sources:
        verifier_site(v, s)
    graphe = routes_du_scenario(v, req.scenario)
    niveaux = parcours.bfs(graphe, req.sources)
    return {
        "niveaux": niveaux,
        "non_atteints": sorted(parcours.non_atteignables(graphe, req.sources)),
    }


def temps_depuis_casernes(v: Ville, graphe, algo: str) -> dict[str, tuple[float, str | None]]:
    """Pour chaque site : (temps de la caserne la plus proche, cette caserne)."""
    meilleur = {s: (math.inf, None) for s in v.sites}
    if algo == "floyd-warshall":
        toutes = chemins.floyd_warshall(graphe).distances
        distances_par_caserne = {c: toutes[c] for c in v.casernes}
    else:
        f = {"dijkstra": chemins.dijkstra, "bellman-ford": chemins.bellman_ford}[algo]
        distances_par_caserne = {c: f(graphe, c).distances for c in v.casernes}
    for c, distances in distances_par_caserne.items():
        for s, d in distances.items():
            if d < meilleur[s][0]:
                meilleur[s] = (d, c)
    return meilleur


def impact(v: Ville, graphe_apres, algo: str) -> dict:
    """Temps de chaque demande avant et après, et indicateurs de résilience.

    Sert aux scénarios du fichier comme aux fermetures choisies sur le plan.
    """
    avant = temps_depuis_casernes(v, v.routes_normal, algo)
    apres = temps_depuis_casernes(v, graphe_apres, algo)

    # Indicateurs de résilience (module 5, Elio).
    impacts = indicateurs.comparer(
        {s: t for s, (t, _) in avant.items()},
        {s: t for s, (t, _) in apres.items()},
        demandes=v.demandes,
        casernes={s: c for s, (_, c) in apres.items()},
    )
    bilan = indicateurs.resumer(impacts)
    sensibles = [s for s, i in v.sites.items() if i["type"] in ("hopital", "ecole", "telecom")]
    sensibles_ok = sum(1 for s in sensibles if math.isfinite(apres[s][0]))
    return {
        "indicateurs": {
            "nb_demandes": bilan.nb_demandes,
            "nb_inaccessibles": bilan.nb_inaccessibles,
            "nb_devenues_inaccessibles": bilan.nb_devenues_inaccessibles,
            "nb_retardees": bilan.nb_retardees,
            "retard_moyen": round(bilan.retard_moyen, 2),
            "retard_max": bilan.retard_max,
            "retard_relatif_max": round(bilan.retard_relatif_max, 4),
            "sensibles_accessibles": sensibles_ok,
            "nb_sensibles": len(sensibles),
        },
        "demandes": [
            {
                "id": d.id,
                "site": d.origine,
                "type": d.type,
                "priorite": d.priorite,
                "caserne": apres[d.origine][1],
                "avant": minutes(avant[d.origine][0]),
                "apres": minutes(apres[d.origine][0]),
            }
            for d in v.demandes
        ],
    }


@app.post("/scenario")
def scenario(req: DemandeScenario) -> dict:
    """Temps d'intervention de chaque demande, avant et après le scénario."""
    v = ville(req.jeu)
    graphe = routes_du_scenario(v, req.scenario)
    reponse = impact(v, graphe, req.algo)
    ajouter_trajet(reponse, v, graphe, req.algo, req.source, req.cible)
    return reponse


def ajouter_trajet(reponse: dict, v: Ville, graphe, algo: str, source: str | None, cible: str | None) -> None:
    """Si un départ et une arrivée sont donnés, ajoute le trajet avant et après."""
    if not (source and cible) or source == cible:
        return
    verifier_site(v, source)
    verifier_site(v, cible)
    reponse["trajet"] = {
        "avant": trajet(v.routes_normal, algo, source, cible),
        "apres": trajet(graphe, algo, source, cible),
    }


def trajet(graphe, algo: str, source: str, cible: str) -> dict:
    """Le plus court chemin source -> cible, au format de /itineraire."""
    if algo == "floyd-warshall":
        chemin = chemin_floyd(chemins.floyd_warshall(graphe), source, cible)
    else:
        f = {"dijkstra": chemins.dijkstra, "bellman-ford": chemins.bellman_ford}[algo]
        chemin = chemins.reconstruire_chemin(f(graphe, source), cible)
    if chemin is None:
        return {"accessible": False, "chemin": None, "duree": None, "nb_arcs": 0}
    return {"accessible": True, "chemin": chemin.sommets, "duree": chemin.duree, "nb_arcs": chemin.nb_arcs}


@app.post("/fermeture")
def fermeture(req: DemandeFermeture) -> dict:
    """Fermeture choisie sur le plan : on ferme ces arcs sur une copie de la ville,
    puis on mesure l'impact sur toutes les demandes, comme pour un scénario.

    Si un départ et une arrivée sont donnés, on renvoie aussi le trajet avant et
    après la fermeture.
    """
    v = ville(req.jeu)
    for u, w in req.fermes:
        if not v.routes_normal.a_arc(u, w):
            raise HTTPException(status_code=422, detail=f"La route {u} → {w} n'existe pas ou est déjà fermée.")
    actions = [donnees.Action("routes", u, w, "fermer", None) for u, w in req.fermes]
    graphe = scenarios.appliquer(v.routes_normal, actions, "routes") if actions else v.routes_normal
    reponse = impact(v, graphe, req.algo)
    reponse["fermes"] = [[u, w] for u, w in req.fermes]
    ajouter_trajet(reponse, v, graphe, req.algo, req.source, req.cible)
    return reponse


@app.post("/fibre")
def fibre(req: DemandeFibre) -> dict:
    """Réseau de fibre le moins cher (Kruskal ou Prim de Max), et sa réparation."""
    v = ville(req.jeu)
    algo = {"kruskal": arbres.kruskal, "prim": arbres.prim}[req.algo]
    arbre = algo(v.fibre)
    reponse = {
        "aretes": [[a, b, w] for a, b, w in arbre.aretes],
        "cout_total": arbre.cout_total,
        "composantes": len(arbre.composantes),
        "reparation": None,
        "nouveau_cout": None,
        "algo": req.algo,
    }
    if req.panne:
        a, b = req.panne
        verifier_site(v, a)
        verifier_site(v, b)
        poids_panne = next((w for x, y, w in arbre.aretes if {x, y} == {a, b}), None)
        if poids_panne is None:
            raise HTTPException(status_code=422, detail=f"Le tronçon {a}, {b} n'est pas dans l'arbre.")
        rep = arbres.reparer_panne(v.fibre, arbre, a, b)
        if rep is not None:
            reponse["reparation"] = list(rep)
            reponse["nouveau_cout"] = arbre.cout_total - poids_panne + rep[2]
    return reponse

@app.post("/valider")
def valider(req: DemandeValidation) -> dict:
    """Vérifie un CSV envoyé par le site avec le validateur d'Elio.

    Le fichier reçu remplace celui du même nom dans une copie du jeu choisi :
    on peut ainsi vérifier un routes.csv contre les sites existants. Tout se
    passe dans un dossier temporaire, effacé juste après. Rien n'est gardé.
    """
    v = JEUX[req.jeu]
    with tempfile.TemporaryDirectory() as tmp:
        dossier = Path(tmp)
        for nom in ("sites", "routes", "fibre", "demandes", "scenarios"):
            source = v / f"{nom}.csv"
            if nom == req.fichier:
                (dossier / f"{nom}.csv").write_text(req.contenu, encoding="utf-8")
            elif source.exists():
                (dossier / f"{nom}.csv").write_bytes(source.read_bytes())
        erreurs = donnees.valider(dossier)
    return {"fichier": f"{req.fichier}.csv", "nb_erreurs": len(erreurs), "erreurs": erreurs[:50]}


DOSSIER_TESTS = DOSSIER_DATA / "tests"

# Positions pour dessiner les graphes de test (les CSV les mettent tous sur une ligne).
DISPOSITION = {
    "accessible": {"S": (0, 1), "A": (2, 1), "B": (3.5, 2.2), "C": (3.5, -0.2), "D": (5.5, -0.2)},
    "non_accessible": {"S": (0, 1.2), "A": (2.5, 1.2), "B": (5, 1.2), "C": (1.2, 0), "D": (3.8, 0), "E": (2.5, -0.9)},
}


@app.post("/circuits")
def circuits(req: DemandeCircuit) -> dict:
    """Module 3 : graphes de test à poids négatifs (Elio).

    Ces poids négatifs ne sont pas des durées réelles : ils servent seulement
    à vérifier que Bellman-Ford et Floyd-Warshall détectent les circuits
    absorbants.
    """
    sites = donnees.charger_sites(DOSSIER_TESTS / "absorbant_sites.csv")
    fichier = DOSSIER_TESTS / f"absorbant_{req.cas}.csv"
    graphe = donnees.charger_routes(fichier, sites)
    if req.source not in sites:
        raise HTTPException(status_code=404, detail=f"Site inconnu : {req.source}")
    r = chemins.diagnostiquer_circuit(graphe, req.source)
    bf = chemins.bellman_ford(graphe, req.source)
    fw = chemins.floyd_warshall(graphe)

    def lisible(d: float) -> float | str | None:
        if d == -math.inf:
            return "-inf"
        return d if math.isfinite(d) else None

    utilises = {x for a, b, _ in graphe.arcs() for x in (a, b)}  # sites présents dans ce graphe
    return {
        "reseau": {
            "sites": [
                {"id": s, "nom": i["nom"], "type": "quartier",
                 "x": DISPOSITION[req.cas][s][0], "y": DISPOSITION[req.cas][s][1]}
                for s, i in sites.items() if s in utilises
            ],
            "routes": [
                {"u": a, "v": b, "temps_normal": w, "temps_pointe": w, "statut": "ouvert"}
                for a, b, w in graphe.arcs()
            ],
            "fibre": [],
            "demandes": [],
            "scenarios": [],
        },
        "existe": r.existe,
        "circuit": r.circuit,
        "poids": r.poids,
        "accessible": r.accessible_depuis_source,
        "non_bornes": sorted(r.sommets_non_bornes),
        "bellman_ford": {s: lisible(d) for s, d in sorted(bf.distances.items()) if s in utilises},
        "floyd_warshall": {s: lisible(d) for s, d in sorted(fw.distances[req.source].items()) if s in utilises},
    }
