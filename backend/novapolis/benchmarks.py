"""Mesures de performance (section 5 du sujet).

Règles suivies :
- tous les algorithmes comparés tournent sur les MÊMES graphes ;
- on ne chronomètre que l'algorithme : génération et chargement des CSV
  sont faits avant de lancer le chronomètre ;
- chaque mesure est répétée (5 fois par défaut) et on garde la moyenne ;
- les graphes viennent de generer_aleatoire avec une graine fixée
  (GRAINE ci-dessous), donc les mesures sont reproductibles à la machine près.

Lancer :  python backend/cli.py benchmark --sortie resultats/benchmarks
"""

from __future__ import annotations

import json
import statistics
import sys
import tempfile
import time
from pathlib import Path

from . import arbres, chemins, donnees, generateur, parcours

GRAINE = 1
TAILLES = [100, 250, 500, 1000, 2000, 4000]  # nombre de sommets, degré fixé
DEGRE_REFERENCE = 4
DEGRES = [2, 4, 8, 16]  # densité, nombre de sommets fixé
TAILLE_DENSITE = 1000
TAILLES_FLOYD = [25, 50, 100, 150, 200, 300]  # O(V³) : petits graphes seulement

ALGOS = {
    "BFS": lambda g, f: parcours.bfs(g, ["S0"]),
    "DFS": lambda g, f: parcours.dfs(g, "S0"),
    "Dijkstra": lambda g, f: chemins.dijkstra(g, "S0"),
    "Bellman-Ford": lambda g, f: chemins.bellman_ford(g, "S0"),
    "Kruskal": lambda g, f: arbres.kruskal(f),
    "Prim": lambda g, f: arbres.prim(f),
}


def _charger(n: int, degre: int, dossier: Path):
    """Génère puis charge un graphe : routes (orienté) et fibre (non orienté)."""
    generateur.generer_aleatoire(dossier, n=n, degre=degre, graine=GRAINE)
    sites = donnees.charger_sites(dossier / "sites.csv")
    routes = donnees.charger_routes(dossier / "routes.csv", sites)
    fibre = donnees.charger_fibre(dossier / "fibre.csv", sites)
    return routes, fibre


def chronometrer(fonction, repetitions: int) -> dict[str, float]:
    """Temps moyen et écart type d'une fonction sans argument, en millisecondes."""
    fonction()  # un premier appel « à vide » pour chauffer les caches
    temps = []
    for _ in range(repetitions):
        debut = time.perf_counter()
        fonction()
        temps.append((time.perf_counter() - debut) * 1000)
    return {
        "moyenne_ms": statistics.mean(temps),
        "ecart_type_ms": statistics.stdev(temps) if len(temps) > 1 else 0.0,
    }


def mesurer(repetitions: int = 5, rapide: bool = False) -> dict:
    """Lance toutes les séries de mesures. rapide=True sert aux tests."""
    # Le DFS est récursif : un graphe de 4 000 sommets dépasse la limite
    # par défaut de Python (1 000 appels imbriqués).
    sys.setrecursionlimit(max(sys.getrecursionlimit(), 20000))
    tailles = TAILLES[:2] if rapide else TAILLES
    degres = DEGRES[:2] if rapide else DEGRES
    tailles_floyd = TAILLES_FLOYD[:2] if rapide else TAILLES_FLOYD
    taille_densite = 200 if rapide else TAILLE_DENSITE
    resultats = {"graine": GRAINE, "repetitions": repetitions, "taille": [], "densite": [], "floyd": []}

    with tempfile.TemporaryDirectory() as tmp:
        for n in tailles:
            routes, fibre = _charger(n, DEGRE_REFERENCE, Path(tmp) / f"t{n}")
            for nom, algo in ALGOS.items():
                m = chronometrer(lambda a=algo, g=routes, f=fibre: a(g, f), repetitions)
                resultats["taille"].append(
                    {"algo": nom, "V": routes.nb_sommets, "E": routes.nb_arcs, **m}
                )

        for degre in degres:
            routes, fibre = _charger(taille_densite, degre, Path(tmp) / f"d{degre}")
            for nom, algo in ALGOS.items():
                m = chronometrer(lambda a=algo, g=routes, f=fibre: a(g, f), repetitions)
                resultats["densite"].append(
                    {"algo": nom, "degre": degre, "V": routes.nb_sommets, "E": routes.nb_arcs, **m}
                )

        for n in tailles_floyd:
            routes, _ = _charger(n, DEGRE_REFERENCE, Path(tmp) / f"f{n}")
            m = chronometrer(lambda g=routes: chemins.floyd_warshall(g), repetitions)
            resultats["floyd"].append({"algo": "Floyd-Warshall", "V": routes.nb_sommets, "E": routes.nb_arcs, **m})
            m = chronometrer(lambda g=routes: chemins.dijkstra(g, "S0"), repetitions)
            resultats["floyd"].append({"algo": "Dijkstra (1 source)", "V": routes.nb_sommets, "E": routes.nb_arcs, **m})

    return resultats


def tracer(resultats: dict, dossier: Path) -> list[Path]:
    """Trois graphiques PNG, avec unités et légendes."""
    import matplotlib

    matplotlib.use("Agg")  # pas de fenêtre : on écrit directement les fichiers
    import matplotlib.pyplot as plt

    dossier.mkdir(parents=True, exist_ok=True)
    fichiers = []
    marqueurs = dict(zip(ALGOS, ["o", "s", "^", "v", "D", "P"], strict=True))

    # 1. Temps selon la taille du graphe
    fig, ax = plt.subplots(figsize=(8, 5))
    for nom in ALGOS:
        pts = [r for r in resultats["taille"] if r["algo"] == nom]
        ax.plot([r["V"] for r in pts], [r["moyenne_ms"] for r in pts], marker=marqueurs[nom], label=nom)
    ax.set_xscale("log")
    ax.set_yscale("log")
    ax.set_xlabel("Nombre de sommets |V| (échelle log)")
    ax.set_ylabel("Temps moyen (ms, échelle log)")
    ax.set_title(f"Temps d'exécution selon la taille (degré {DEGRE_REFERENCE}, moyenne de {resultats['repetitions']} essais)")
    ax.grid(True, which="both", alpha=0.3)
    ax.legend()
    fichiers.append(dossier / "1_taille.png")
    fig.tight_layout()
    fig.savefig(fichiers[-1], dpi=150)
    plt.close(fig)

    # 2. Temps selon la densité
    fig, ax = plt.subplots(figsize=(8, 5))
    for nom in ALGOS:
        pts = [r for r in resultats["densite"] if r["algo"] == nom]
        ax.plot([r["E"] for r in pts], [r["moyenne_ms"] for r in pts], marker=marqueurs[nom], label=nom)
    ax.set_xlabel(f"Nombre d'arcs |E| (|V| = {resultats['densite'][0]['V']})")
    ax.set_ylabel("Temps moyen (ms)")
    ax.set_title("Temps d'exécution selon la densité du graphe")
    ax.grid(True, alpha=0.3)
    ax.legend()
    fichiers.append(dossier / "2_densite.png")
    fig.tight_layout()
    fig.savefig(fichiers[-1], dpi=150)
    plt.close(fig)

    # 3. Floyd-Warshall face à une courbe en V³
    fig, ax = plt.subplots(figsize=(8, 5))
    fw = [r for r in resultats["floyd"] if r["algo"] == "Floyd-Warshall"]
    dj = [r for r in resultats["floyd"] if r["algo"] == "Dijkstra (1 source)"]
    xs = [r["V"] for r in fw]
    ax.plot(xs, [r["moyenne_ms"] for r in fw], marker="o", label="Floyd-Warshall (toutes les paires)")
    ax.plot(xs, [r["moyenne_ms"] for r in dj], marker="^", label="Dijkstra (une source)")
    ax.plot(xs, [r["moyenne_ms"] * r["V"] for r in dj], marker="v", linestyle=":",
            label="Dijkstra lancé depuis chaque sommet (V × une source)")
    k = fw[-1]["moyenne_ms"] / fw[-1]["V"] ** 3  # courbe c × V³ calée sur le dernier point
    ax.plot(xs, [k * x**3 for x in xs], linestyle="--", color="grey", label="courbe théorique c × |V|³")
    ax.set_xlabel("Nombre de sommets |V|")
    ax.set_ylabel("Temps moyen (ms)")
    ax.set_title("Floyd-Warshall : coût en |V|³")
    ax.grid(True, alpha=0.3)
    ax.legend()
    fichiers.append(dossier / "3_floyd.png")
    fig.tight_layout()
    fig.savefig(fichiers[-1], dpi=150)
    plt.close(fig)
    return fichiers


def lancer(dossier: str | Path, repetitions: int = 5, rapide: bool = False) -> dict:
    """Mesure, écrit resultats.json et les trois graphiques dans `dossier`."""
    dossier = Path(dossier)
    resultats = mesurer(repetitions, rapide)
    dossier.mkdir(parents=True, exist_ok=True)
    (dossier / "resultats.json").write_text(json.dumps(resultats, indent=2), encoding="utf-8")
    tracer(resultats, dossier)
    return resultats
