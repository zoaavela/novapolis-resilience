# Novapolis Résilience

Projet d'algorithmique et théorie des graphes (ING-APP1-BDML).
Outil d'analyse du réseau routier et du réseau de fibre d'une ville fictive :
accessibilité des secours, itinéraires, circuits absorbants, arbre couvrant
de la fibre, scénarios de perturbation.

Équipe : Enzo, Elio, Max.

Site en ligne : https://novapolis.pages.dev (l'API se réveille en une minute au premier appel).
Hébergement détaillé dans `docs/HEBERGEMENT.md`.

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

Résultat attendu : `104 passed`.

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
python backend/cli.py arbre --donnees data/ville --algo prim
```

## Régénérer les résultats du rapport

Toutes les commandes partent de la racine du dépôt, l'environnement activé.

```bash
# Les deux jeux générés (mêmes fichiers à chaque fois grâce à la graine)
python backend/cli.py generer --type ville --sortie data/ville --graine 42
python backend/cli.py generer --type aleatoire --sortie data/genere_1000 --n 1000 --degre 4 --graine 1

# Les mesures de performance et les 3 graphiques (environ 30 secondes)
python backend/cli.py benchmark --sortie resultats/benchmarks
```

Le benchmark écrit `resultats/benchmarks/resultats.json` et trois images :
`1_taille.png`, `2_densite.png`, `3_floyd.png`. Les temps dépendent de la
machine, les tendances non.

Elle met aussi à jour `frontend/src/data/benchmarks.js`, que lit la page
Benchmark du site : il suffit ensuite de pousser pour que la page affiche les
nouvelles mesures.

## API

```bash
uvicorn api.main:app --reload --app-dir backend
# http://localhost:8000/docs : chaque route se teste à la main
```

| Route | Rôle | Module |
|---|---|---|
| `GET /health` | réveil du serveur | |
| `GET /reseau?jeu=petit` | sites, routes, fibre, demandes, scénarios | |
| `POST /accessibilite` | sites atteints depuis des casernes (BFS) | 1 |
| `POST /itineraire` | plus court chemin (Dijkstra, Bellman-Ford, Floyd-Warshall) | 2 |
| `POST /circuits` | détection des circuits absorbants sur les graphes de test | 3 |
| `POST /fibre` | arbre couvrant minimal (Kruskal, Prim) et réparation de panne | 4 |
| `POST /scenario` | temps avant et après une perturbation, indicateurs | 5 |
| `POST /valider` | vérification d'un CSV envoyé (1 Mo au plus) | données |

Le site (dossier `frontend/`) se lance avec `npm install` puis `npm run dev`
dans ce dossier. Avec `VITE_API_URL=http://localhost:8000` dans
`frontend/.env.local`, il utilise l'API locale ; sans, il tourne en mode
démonstration sur la petite ville.

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
    generateur.py    génération de la ville de 100 sites et des grands graphes
    benchmarks.py    mesures de performance et graphiques
  api/               API FastAPI
  cli.py             interface en ligne de commande
  tests/             tests automatisés (pytest)
data/
  petit/             graphe de 10 sites, vérifiable à la main
  ville/             Novapolis, 100 sites (généré, graine 42)
  genere_1000/       graphe de 1 000 sommets (généré, graine 1)
  tests/             graphes à circuit absorbant
resultats/
  benchmarks/        mesures et graphiques du rapport
docs/
  FORMAT_DONNEES.md  description des fichiers CSV
  CONTRAT.md         signatures et répartition
  PETIT_GRAPHE.md    résultats attendus, à vérifier à la main
  DONNEES_GENEREES.md règles de génération des jeux synthétiques
  HEBERGEMENT.md     mise en ligne (Cloudflare Pages et Render)
frontend/            interface web (React)
```

## Données

Toutes les données sont synthétiques : Novapolis est une ville inventée.
Aucune donnée externe n'est utilisée.
