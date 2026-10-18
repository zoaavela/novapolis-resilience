# Contrat entre les modules

Chacun code dans son fichier, mais tout le monde respecte ces signatures.
Ne changez pas une signature sans prévenir les deux autres.

## La structure de graphe (`novapolis/graphe.py`, déjà écrite)

```python
g = Graphe(oriente=True)          # routes ; oriente=False pour la fibre
g.ajouter_sommet("C1", type="caserne")
g.ajouter_arc("C1", "Q1", 4)      # en non orienté, ajoute les deux sens
g.voisins("C1")                   # [("Q1", 4.0), ...]
g.arcs()                          # (u, v, poids), chaque arête une fois en non orienté
g.sommets(), g.nb_sommets, g.nb_arcs
g.a_arc(u, v), g.poids(u, v), g.retirer_arc(u, v), g.modifier_poids(u, v, w)
copie = g.copie()                 # pour les scénarios, l'original ne bouge pas
```

## Les résultats (`novapolis/resultats.py`, déjà écrit)

- `ResultatChemins(source, distances, predecesseurs, circuit_absorbant)`
- `ResultatToutesPaires(distances, successeurs, sommets_sur_circuit_absorbant)`
- `ResultatArbre(aretes, cout_total, composantes)`
- `Chemin(sommets, duree)` avec `chemin.nb_arcs`

Conventions : inatteignable = `math.inf`, diminuable sans fin = `-math.inf`.

## Qui écrit quoi

| Fichier | Fonctions | Qui |
|---|---|---|
| parcours.py | `bfs`, `bfs_chemin`, `dfs`, `a_cycle_oriente`, `composantes_connexes`, `non_atteignables` | Enzo |
| chemins.py | `dijkstra` | Enzo |
| chemins.py | `bellman_ford`, `floyd_warshall` | Elio |
| donnees.py | `valider` | Elio |
| scenarios.py | `appliquer` | Elio |
| indicateurs.py | `comparer` | Elio |
| arbres.py | `UnionFind`, `kruskal`, `prim`, `reparer_panne` | Max |
| generateur.py (à créer) | ville de 100 sites, graphe de 1 000 sommets | Max |
| benchmarks.py (à créer) | mesures et graphiques | Max |
| api/, frontend/ | API et interface web | Enzo |

Déjà fourni : `graphe.py`, `resultats.py`, le chargement des CSV dans
`donnees.py`, `reconstruire_chemin` dans `chemins.py`, la CLI et les tests.

## Comment savoir que c'est fini

Les tests de votre fonction sont dans `backend/tests/`. Tant que la fonction
lève `NotImplementedError`, ses tests apparaissent comme « skipped ». Quand
vous l'écrivez, ils doivent passer au vert : `pytest -q`.
