# Données générées

Toutes les données de `data/ville` et `data/genere_1000` sont **synthétiques** : produites par `backend/novapolis/generateur.py`. Même graine, mêmes fichiers.

## Régénérer

```
python backend/cli.py generer --type ville --sortie data/ville --graine 42
python backend/cli.py generer --type aleatoire --sortie data/genere_1000 --n 1000 --degre 4 --graine 1
```

## Novapolis, 100 sites (`data/ville`)

La ville est une grille de 10 x 10 îlots légèrement déformée. Une rivière coule entre les colonnes 4 et 5 : seules trois lignes ont un pont (2, 5 et 8). La ligne 5 est une grande avenue, 40 % plus rapide.

Quatre casernes sont placées aux quatre coins de la ville, deux hôpitaux au centre. Six écoles et trois centres télécom sont tirés au hasard, le reste est fait de quartiers.

Routes : liaisons entre voisins de grille et quelques diagonales (15 %). Temps normal proportionnel à la distance, temps de pointe 1,3 à 1,8 fois plus long. 12 % des rues sont à sens unique et 2 % fermées (jamais l'avenue ni les ponts).

Fibre : voisins de grille et 35 % des diagonales, coût proportionnel à la longueur. Un tronçon qui traverse la rivière hors pont est indisponible, comme 3 % des tronçons pour cause de travaux.

20 demandes d'intervention sur des quartiers et des écoles.

Scénarios : S1 ferme l'avenue autour du pont central (6 arcs), S2 coupe un tronçon de fibre de l'hôpital H1, S3 passe en heure de pointe.

Résultat avec la graine 42 : 100 sites, 342 arcs ouverts, 221 tronçons disponibles, tous les sites atteignables depuis les casernes. S1 ralentit 3 sites de 3 minutes au plus : les casernes des deux rives compensent, ce qui est un résultat à commenter dans le rapport.

## Graphe de performance (`data/genere_1000`)

1 000 sommets placés au hasard, chacun relié à ses 4 plus proches voisins, plus une chaîne aléatoire qui garantit la connexité. Routes dans les deux sens, 5 % de casernes, 50 demandes. Sert uniquement aux mesures de temps. Changer `--n` et `--degre` pour faire varier taille et densité.
