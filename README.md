# Novapolis Résilience

Projet d'algorithmique et théorie des graphes (ING-APP1-BDML).
Outil d'analyse du réseau routier et du réseau de fibre d'une ville fictive :
accessibilité des secours, itinéraires, circuits absorbants, arbre couvrant
de la fibre, scénarios de perturbation.

Équipe : Enzo, Elio, Max.

## Installation

Python 3.12 ou plus récent.

```bash
python -m venv .venv
source .venv/bin/activate        # Windows : .venv\Scripts\activate
pip install -e ".[dev]"
```

## Lancer les tests

```bash
pytest -q
```

Les tests d'un algo pas encore écrit sont « skipped ». Ils passent au vert
dès que la fonction est implémentée.

## Ligne de commande

```bash
python backend/cli.py info --donnees data/petit
python backend/cli.py chemin --donnees data/petit --source C1 --cible Q4 --algo dijkstra
python backend/cli.py accessibilite --donnees data/petit --sources C1 C2
python backend/cli.py arbre --donnees data/petit --algo kruskal
```

## API

```bash
cp .env.example .env
uvicorn api.main:app --reload --app-dir backend
# http://localhost:8000/health
```

## Organisation du dépôt

```
backend/
  novapolis/
    graphe.py        structure de graphe (listes d'adjacence)
    resultats.py     formats de résultat communs
    donnees.py       lecture et validation des CSV
    scenarios.py     application des scénarios sur une copie
    parcours.py      module 1 : DFS, BFS, accessibilité
    chemins.py       modules 2 et 3 : Dijkstra, Bellman-Ford, Floyd-Warshall
    arbres.py        module 4 : Union-Find, Kruskal, Prim, pannes
    indicateurs.py   module 5 : indicateurs de résilience
  api/               API FastAPI
  cli.py             interface en ligne de commande
  tests/             tests automatisés (pytest)
data/
  petit/             graphe de 10 sites, vérifiable à la main
  tests/             graphes à circuit absorbant
docs/
  FORMAT_DONNEES.md  description des fichiers CSV
  CONTRAT.md         signatures et répartition
  PETIT_GRAPHE.md    résultats attendus, à vérifier à la main
frontend/            interface web (React)
```

## Données

Toutes les données sont synthétiques : Novapolis est une ville inventée.
