# Novapolis Résilience

Projet d'algorithmique et théorie des graphes (ING-APP1-BDML).
Outil d'analyse du réseau routier et du réseau de fibre d'une ville fictive :
accessibilité des secours, itinéraires, circuits absorbants, arbre couvrant
de la fibre, scénarios de perturbation.

Équipe : Enzo, Elio, Max.

## Installation (une seule fois)

Il faut Python 3.12 ou plus récent, et Git.

**1. Récupérer le projet**

```bash
git clone https://github.com/zoaavela/novapolis-resilience.git
cd novapolis-resilience
```

**2. Créer l'environnement du projet**

```bash
python -m venv .venv
```

Ça ne doit rien afficher. Un dossier `.venv` apparaît.

**3. L'activer**

| Système | Commande |
|---|---|
| Windows (PowerShell) | `.venv\Scripts\Activate.ps1` |
| Windows (invite de commandes) | `.venv\Scripts\activate.bat` |
| Mac / Linux | `source .venv/bin/activate` |

La ligne du terminal doit commencer par `(.venv)`.
Si PowerShell refuse (« l'exécution de scripts est désactivée »), lancer une fois
`Set-ExecutionPolicy -Scope CurrentUser RemoteSigned`, puis réessayer.

**4. Installer les dépendances**

```bash
python -m pip install -e ".[dev]"
```

**5. Vérifier**

```bash
pytest -q
```

Au départ : `5 passed, 21 skipped`.

## Chaque fois qu'on se remet au travail

```bash
git pull                              # récupérer le travail des autres
.venv\Scripts\Activate.ps1            # ou : source .venv/bin/activate
pytest -q
```

Puis, une fois une modification faite et les tests au vert :

```bash
git add .
git commit -m "Ce que j'ai fait, en une phrase"
git pull
git push
```

Chacun code dans ses propres fichiers (voir `docs/CONTRAT.md`), ce qui évite
presque tous les conflits. Le `git pull` juste avant le `push` récupère ce
que les autres ont envoyé entre-temps.

## Lancer les tests

```bash
pytest -q                     # tout
pytest -q backend/tests/test_parcours.py    # un seul fichier
```

Chaque caractère est un test : `.` réussi, `s` mis de côté car l'algo n'est
pas encore écrit, `F` échoué. Un test passe de `s` à `.` dès que la
fonction est implémentée correctement.

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
