"""Interface en ligne de commande (exigée par le sujet).

Exemples :
    python backend/cli.py info --donnees data/petit
    python backend/cli.py chemin --donnees data/petit --source C1 --cible Q4 --algo dijkstra
    python backend/cli.py accessibilite --donnees data/petit --sources C1 C2
    python backend/cli.py arbre --donnees data/petit --algo kruskal
"""

from __future__ import annotations

import argparse
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))

from novapolis import arbres, chemins, donnees, parcours


def charger(dossier: str, mode: str = "normal"):
    d = Path(dossier)
    sites = donnees.charger_sites(d / "sites.csv")
    routes = donnees.charger_routes(d / "routes.csv", sites, mode=mode)
    fibre = donnees.charger_fibre(d / "fibre.csv", sites)
    return sites, routes, fibre


def cmd_info(args) -> None:
    sites, routes, fibre = charger(args.donnees)
    print(f"{len(sites)} sites")
    print(f"Routes : {routes}")
    print(f"Fibre  : {fibre}")


def cmd_chemin(args) -> None:
    _, routes, _ = charger(args.donnees, args.mode)
    algo = {"dijkstra": chemins.dijkstra, "bellman-ford": chemins.bellman_ford}[args.algo]
    resultat = algo(routes, args.source)
    chemin = chemins.reconstruire_chemin(resultat, args.cible)
    if chemin is None:
        print(f"{args.cible} : inaccessible depuis {args.source}")
    else:
        print(" -> ".join(chemin.sommets))
        print(f"{chemin.duree:g} min, {chemin.nb_arcs} arcs")


def cmd_accessibilite(args) -> None:
    _, routes, _ = charger(args.donnees)
    niveaux = parcours.bfs(routes, args.sources)
    for sommet, n in sorted(niveaux.items(), key=lambda x: x[1]):
        print(f"{sommet}: {n} arc(s)")
    manquants = set(routes.sommets()) - set(niveaux)
    print("Non atteints :", ", ".join(sorted(manquants)) or "aucun")


def cmd_arbre(args) -> None:
    _, _, fibre = charger(args.donnees)
    algo = {"kruskal": arbres.kruskal, "prim": arbres.prim}[args.algo]
    r = algo(fibre)
    for u, v, w in r.aretes:
        print(f"{u} - {v} : {w:g}")
    print(f"Coût total : {r.cout_total:g}, {len(r.composantes)} composante(s)")

def cmd_generer(args) -> None:
    from novapolis import generateur

    if args.type == "ville":
        comptes = generateur.generer_ville(args.sortie, graine=args.graine)
    else:
        comptes = generateur.generer_aleatoire(args.sortie, n=args.n, degre=args.degre, graine=args.graine)
    print(f"Écrit dans {args.sortie} : {comptes}")

def main() -> None:
    p = argparse.ArgumentParser(prog="novapolis")
    sous = p.add_subparsers(dest="commande", required=True)

    s = sous.add_parser("info", help="résumé d'un jeu de données")
    s.add_argument("--donnees", required=True)
    s.set_defaults(func=cmd_info)

    s = sous.add_parser("chemin", help="plus court chemin")
    s.add_argument("--donnees", required=True)
    s.add_argument("--source", required=True)
    s.add_argument("--cible", required=True)
    s.add_argument("--algo", choices=["dijkstra", "bellman-ford"], default="dijkstra")
    s.add_argument("--mode", choices=["normal", "pointe"], default="normal")
    s.set_defaults(func=cmd_chemin)

    s = sous.add_parser("accessibilite", help="sites atteignables (BFS)")
    s.add_argument("--donnees", required=True)
    s.add_argument("--sources", nargs="+", required=True)
    s.set_defaults(func=cmd_accessibilite)

    s = sous.add_parser("arbre", help="arbre couvrant minimal de la fibre")
    s.add_argument("--donnees", required=True)
    s.add_argument("--algo", choices=["kruskal", "prim"], default="kruskal")
    s.set_defaults(func=cmd_arbre)

    s = sous.add_parser("generer", help="générer un jeu de données synthétique")
    s.add_argument("--type", choices=["ville", "aleatoire"], required=True)
    s.add_argument("--sortie", required=True, help="dossier où écrire les CSV")
    s.add_argument("--graine", type=int, default=42)
    s.add_argument("--n", type=int, default=1000, help="nombre de sommets (aleatoire)")
    s.add_argument("--degre", type=int, default=4, help="voisins par sommet (aleatoire)")
    s.set_defaults(func=cmd_generer)

    args = p.parse_args()
    try:
        args.func(args)
    except NotImplementedError:
        print("Cette opération n'est pas encore implémentée.", file=sys.stderr)
        sys.exit(2)


if __name__ == "__main__":
    main()
