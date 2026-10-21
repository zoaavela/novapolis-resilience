"""Générateur de données synthétiques (carte « Générateur de données »).

Deux générateurs, tous deux reproductibles : même graine = mêmes fichiers.

1. generer_ville : Novapolis, 100 sites, crédible et documentée
   (règles détaillées dans docs/DONNEES_GENEREES.md).
2. generer_aleatoire : graphe de N sommets pour les mesures de performance,
   taille et densité réglables.

Les fichiers produits ont exactement le format de data/petit/.
"""

from __future__ import annotations

import csv
import itertools
import json
import math
import random
from pathlib import Path

# ---------------------------------------------------------------------------
# Écriture des CSV
# ---------------------------------------------------------------------------

def _ecrire(chemin: Path, colonnes: list[str], lignes: list[dict]) -> None:
    chemin.parent.mkdir(parents=True, exist_ok=True)
    with open(chemin, "w", encoding="utf-8", newline="") as f:
        w = csv.DictWriter(f, fieldnames=colonnes)
        w.writeheader()
        w.writerows(lignes)


def _ecrire_jeu(dossier: Path, sites, routes, fibre, demandes, scenarios) -> None:
    _ecrire(dossier / "sites.csv", ["id", "nom", "type", "longitude", "latitude"], sites)
    _ecrire(dossier / "routes.csv", ["u", "v", "temps_normal", "temps_pointe", "statut"], routes)
    _ecrire(dossier / "fibre.csv", ["u", "v", "cost", "statut"], fibre)
    _ecrire(dossier / "demandes.csv", ["id", "origine", "type", "priorite"], demandes)
    _ecrire(dossier / "scenarios.csv", ["scenario", "reseau", "u", "v", "action", "valeur"], scenarios)


def _distance(a: tuple[float, float], b: tuple[float, float]) -> float:
    return math.hypot(a[0] - b[0], a[1] - b[1])


# ---------------------------------------------------------------------------
# 1. Novapolis, 100 sites
# ---------------------------------------------------------------------------

COLONNES, LIGNES = 10, 10          # grille de 10 x 10 îlots = 100 sites
RIVIERE_APRES_COLONNE = 4          # la rivière coule entre les colonnes 4 et 5
PONTS = {2, 5, 8}                  # lignes où un pont traverse la rivière
AVENUE = 5                         # ligne de la grande avenue est-ouest

CASERNES = [(1, 1), (8, 2), (2, 8), (7, 7)]
HOPITAUX = [(3, 5), (6, 4)]

NOMS_QUARTIERS = [
    "des Halles", "du Port", "des Forges", "des Vignes", "du Moulin", "des Tilleuls",
    "de la Gare", "du Marché", "du Canal", "des Remparts", "des Prés", "de la Bastide",
    "de la Verrerie", "de la Corderie", "des Tanneurs", "des Oliviers", "de la Chapelle",
    "du Plateau", "de l’Écluse", "des Carrières",
]


def generer_ville(dossier: str | Path, graine: int = 42) -> dict[str, int]:
    """Écrit les 5 CSV de Novapolis dans `dossier`. Renvoie quelques comptes."""
    rng = random.Random(graine)
    dossier = Path(dossier)

    # --- Sites : une grille légèrement déformée pour ne pas faire trop géométrique
    cases = [(c, l) for l in range(LIGNES) for c in range(COLONNES)]
    autres = [p for p in cases if p not in CASERNES and p not in HOPITAUX]
    rng.shuffle(autres)
    ecoles, telecoms = autres[:6], autres[6:9]

    ident: dict[tuple[int, int], str] = {}
    sites = []
    compteurs = {"caserne": 0, "hopital": 0, "ecole": 0, "telecom": 0, "quartier": 0}
    prefixes = {"caserne": "C", "hopital": "H", "ecole": "E", "telecom": "T", "quartier": "Q"}
    noms = {"caserne": "Caserne", "hopital": "Hôpital", "ecole": "École", "telecom": "Centre télécom"}

    position: dict[str, tuple[float, float]] = {}
    for c, l in cases:
        if (c, l) in CASERNES:
            t = "caserne"
        elif (c, l) in HOPITAUX:
            t = "hopital"
        elif (c, l) in ecoles:
            t = "ecole"
        elif (c, l) in telecoms:
            t = "telecom"
        else:
            t = "quartier"
        compteurs[t] += 1
        sid = f"{prefixes[t]}{compteurs[t]}"
        if t == "quartier":
            k = compteurs[t] - 1
            base = NOMS_QUARTIERS[k % len(NOMS_QUARTIERS)]
            variante = ["", " Nord", " Sud", " Est", " Ouest"][k // len(NOMS_QUARTIERS)]
            nom = f"Quartier {base}{variante}"
        else:
            nom = f"{noms[t]} {compteurs[t]}"
        x = round(c * 2.0 + rng.uniform(-0.4, 0.4) + (0.8 if c > RIVIERE_APRES_COLONNE else 0), 2)
        y = round((LIGNES - 1 - l) * 1.3 + rng.uniform(-0.3, 0.3), 2)
        ident[(c, l)] = sid
        position[sid] = (x, y)
        sites.append({"id": sid, "nom": nom, "type": t, "longitude": x, "latitude": y})

    def traverse_riviere(a, b):
        return (a[0] <= RIVIERE_APRES_COLONNE) != (b[0] <= RIVIERE_APRES_COLONNE)

    # --- Liaisons candidates : voisins de grille (droite, bas) + quelques diagonales
    paires = []
    for c, l in cases:
        for dc, dl in [(1, 0), (0, 1)]:
            voisin = (c + dc, l + dl)
            if voisin in ident:
                paires.append(((c, l), voisin))
        if rng.random() < 0.15 and (c + 1, l + 1) in ident:
            paires.append(((c, l), (c + 1, l + 1)))

    # --- Routes
    routes = []
    avenue_arcs = []
    for a, b in paires:
        if traverse_riviere(a, b) and not (a[1] == b[1] and a[1] in PONTS):
            continue  # pas de pont ici : la route ne traverse pas
        u, v = ident[a], ident[b]
        est_avenue = a[1] == b[1] == AVENUE
        est_pont = traverse_riviere(a, b)
        d = _distance(position[u], position[v])
        normal = max(1, round(d * 2.5 + rng.randint(0, 2)))
        if est_avenue:
            normal = max(1, round(normal * 0.6))  # l'avenue est plus rapide
        pointe = max(normal, round(normal * rng.uniform(1.3, 1.8)))
        statut = "ferme" if (not est_avenue and not est_pont and rng.random() < 0.02) else "ouvert"

        if not est_avenue and not est_pont and rng.random() < 0.12:
            sens = [(u, v)] if rng.random() < 0.5 else [(v, u)]  # rue à sens unique
        else:
            sens = [(u, v), (v, u)]
        for x, y in sens:
            routes.append({"u": x, "v": y, "temps_normal": normal, "temps_pointe": pointe, "statut": statut})
            if est_avenue and 4 <= a[0] <= 6:  # S1 : le pont de l'avenue et ses abords
                avenue_arcs.append((x, y))

    # --- Fibre : voisins de grille et diagonales, coût selon la longueur
    fibre = []
    deja = set()
    for c, l in cases:
        for dc, dl in [(1, 0), (0, 1), (1, 1), (1, -1)]:
            b = (c + dc, l + dl)
            if b not in ident or ((c, l), b) in deja:
                continue
            if (dc, dl) in [(1, 1), (1, -1)] and rng.random() > 0.35:
                continue  # on ne garde qu'une partie des diagonales
            deja.add(((c, l), b))
            u, v = ident[(c, l)], ident[b]
            cout = round(_distance(position[u], position[v]) * 12 + rng.randint(0, 8))
            inondable = traverse_riviere((c, l), b) and not (dl == 0 and l in PONTS)
            travaux = rng.random() < 0.03
            statut = "indisponible" if (inondable or travaux) else "disponible"
            fibre.append({"u": u, "v": v, "cost": cout, "statut": statut})

    # --- Demandes d'intervention
    types = ["incendie", "malaise", "accident", "transfert", "inondation"]
    poids = [3, 4, 3, 1, 1]
    cibles = [s["id"] for s in sites if s["type"] in ("quartier", "ecole")]
    demandes = []
    for i, site in enumerate(rng.sample(cibles, 20), start=1):
        demandes.append({
            "id": f"D{i}",
            "origine": site,
            "type": rng.choices(types, poids)[0],
            "priorite": rng.choice([1, 1, 2, 2, 3]),
        })

    # --- Scénarios
    scenarios = [
        {"scenario": "S1", "reseau": "routes", "u": u, "v": v, "action": "fermer", "valeur": ""}
        for u, v in avenue_arcs
    ]
    hopital = ident[HOPITAUX[0]]
    troncon = next(f for f in fibre if hopital in (f["u"], f["v"]) and f["statut"] == "disponible")
    scenarios.append({"scenario": "S2", "reseau": "fibre", "u": troncon["u"], "v": troncon["v"], "action": "panne", "valeur": ""})
    scenarios.append({"scenario": "S3", "reseau": "routes", "u": "*", "v": "*", "action": "pointe", "valeur": ""})

    _ecrire_jeu(dossier, sites, routes, fibre, demandes, scenarios)

    # --- Décor pour le site web : le tracé de la rivière (aucun effet sur les calculs)
    milieu = (RIVIERE_APRES_COLONNE * 2.0 + (RIVIERE_APRES_COLONNE + 1) * 2.0 + 0.8) / 2
    haut = (LIGNES - 1) * 1.3 + 0.8
    trace = [[round(milieu + 0.15 * math.sin(i * 0.9), 2), round(-0.8 + i * (haut + 0.8) / 20, 2)] for i in range(21)]
    with open(dossier / "decor.json", "w", encoding="utf-8") as f:
        json.dump({"nom": "La Novelle", "riviere": trace}, f, ensure_ascii=False)

    return {"sites": len(sites), "routes": len(routes), "fibre": len(fibre), "demandes": len(demandes)}


# ---------------------------------------------------------------------------
# 2. Graphe aléatoire pour les mesures de performance
# ---------------------------------------------------------------------------

def generer_aleatoire(dossier: str | Path, n: int = 1000, degre: int = 4, graine: int = 1) -> dict[str, int]:
    """Graphe de `n` sommets placés au hasard, chacun relié à ses `degre`
    plus proches voisins (plus `degre` = plus dense). Une chaîne aléatoire
    passant par tous les sommets garantit que le graphe est connexe.

    Le calcul des plus proches voisins est en O(n²) : prévu jusqu'à
    quelques milliers de sommets.
    """
    rng = random.Random(graine)
    dossier = Path(dossier)
    ids = [f"S{i}" for i in range(n)]
    pos = {sid: (rng.uniform(0, 100), rng.uniform(0, 100)) for sid in ids}

    sites = [
        {"id": sid, "nom": sid, "type": "caserne" if i < max(1, n // 20) else "quartier",
         "longitude": round(pos[sid][0], 3), "latitude": round(pos[sid][1], 3)}
        for i, sid in enumerate(ids)
    ]

    aretes: set[tuple[str, str]] = set()
    for u in ids:
        proches = sorted(ids, key=lambda v: _distance(pos[u], pos[v]))[1:degre + 1]
        for v in proches:
            aretes.add(tuple(sorted((u, v))))
    ordre = ids[:]
    rng.shuffle(ordre)
    for u, v in itertools.pairwise(ordre):
        aretes.add(tuple(sorted((u, v))))

    routes, fibre = [], []
    for u, v in sorted(aretes):
        t = rng.randint(1, 20)
        p = round(t * rng.uniform(1.2, 1.8))
        routes.append({"u": u, "v": v, "temps_normal": t, "temps_pointe": p, "statut": "ouvert"})
        routes.append({"u": v, "v": u, "temps_normal": t, "temps_pointe": p, "statut": "ouvert"})
        fibre.append({"u": u, "v": v, "cost": rng.randint(5, 100), "statut": "disponible"})

    demandes = [
        {"id": f"D{i}", "origine": sid, "type": "incendie", "priorite": 1}
        for i, sid in enumerate(rng.sample(ids, min(50, n)), start=1)
    ]
    _ecrire_jeu(dossier, sites, routes, fibre, demandes, [])
    return {"sites": n, "routes": len(routes), "fibre": len(fibre), "demandes": len(demandes)}
