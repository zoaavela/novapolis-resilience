# Le petit graphe de référence

Dix sites, assez petits pour tout calculer à la main. Fichiers : `data/petit/`.
**À faire ce soir : refaire chaque calcul à la main et vérifier qu'on trouve
les mêmes valeurs.** Ce sont ces valeurs que les tests attendent.

## Les sites

C1 et C2 : casernes. H1 : hôpital. E1 : école. T1 : centre télécom.
Q1 à Q5 : quartiers.

## Réseau routier (orienté, temps normal en minutes)

Dessinez-le sur papier à partir de cette liste, c'est la première étape.

| Liaison | Sens | Normal | Pointe |
|---|---|---|---|
| C1 – Q1 | double | 4 | 6 |
| C1 – Q2 | double | 7 | 10 |
| Q1 → Q2 | **unique** | 2 | 3 |
| Q1 – H1 | double | 6 | 9 |
| Q2 – Q3 | double | 3 | 5 |
| Q3 → H1 | **unique** | 2 | 4 |
| Q3 → E1 | **unique** | 8 | 11 |
| H1 – E1 | double | 5 | 7 |
| E1 – T1 | double | 3 | 4 |
| T1 – C2 | double | 4 | 5 |
| C2 – Q4 | double | 6 | 8 |
| Q5 → Q4 | **unique** | 3 | 4 |
| Q4 → T1 | unique, **fermée** | 9 | 12 |

Double sens = deux lignes dans `routes.csv`. À retenir :
- Q5 → Q4 est à sens unique : **personne ne peut atteindre Q5** ;
- Q4 → T1 existe mais est fermée, elle n'entre pas dans le graphe.

## Résultats attendus, réseau routier

### Dijkstra / Bellman-Ford depuis C1, temps normal

| Site | C1 | Q1 | Q2 | Q3 | H1 | E1 | T1 | C2 | Q4 | Q5 |
|---|---|---|---|---|---|---|---|---|---|---|
| Distance (min) | 0 | 4 | 6 | 9 | 10 | 15 | 18 | 22 | 28 | ∞ |

Chemin vers Q4 : C1 → Q1 → H1 → E1 → T1 → C2 → Q4, 28 min, 6 arcs.
Piège : Q2 vaut 6 via Q1 (4 + 2), pas 7 en direct.

### Depuis C2, temps normal

E1 = 7, T1 = 4, Q4 = 6, H1 = 12, Q1 = 18, C1 = 22.

### Heure de pointe, depuis C1

Q4 = 39 min (même chemin).

### BFS (nombre d'arcs) depuis C1

C1 0 · Q1 1 · Q2 1 · H1 2 · Q3 2 · E1 3 · T1 4 · C2 5 · Q4 6. Q5 non atteint.
Depuis {C1, C2} ensemble : T1 et Q4 passent à 1 arc, E1 à 2.

### Connexité

- Il existe un cycle orienté (C1 → Q1 → C1).
- Le graphe n'est **pas fortement connexe** : Q5 peut aller vers Q4, mais rien ne revient à Q5.
- Tous les autres sites forment une seule composante fortement connexe.

### Scénario S1 : fermeture de Q1 ↔ H1

- Depuis C1 : H1 passe de 10 à 11 (par Q2 et Q3), Q4 de 28 à 29.
- Depuis C2 : **Q1, Q2, Q3 et C1 deviennent inatteignables**. H1 → Q1 était le
  seul moyen de revenir vers l'ouest, car Q3 → H1 est à sens unique.
- Bon exemple pour la soutenance : une seule fermeture coupe la ville en deux
  pour une caserne, sans rien changer pour l'autre.

## Réseau de fibre (non orienté, coût en k€)

| Tronçon | Coût | | Tronçon | Coût |
|---|---|---|---|---|
| Q1 – Q2 | 2 | | Q4 – Q5 | 4 |
| E1 – T1 | 2 | | C1 – Q2 | 5 |
| C1 – Q1 | 3 | | C2 – Q4 | 5 |
| Q2 – Q3 | 3 | | H1 – E1 | 6 |
| T1 – C2 | 3 | | Q3 – E1 | 7 |
| Q1 – H1 | 4 | | T1 – Q4 | 8 |
| Q3 – H1 | 4 | | Q5 – E1 | 9, **indisponible** |

### Arbre couvrant minimal (Kruskal et Prim)

Coût total **32 k€**, 9 tronçons : Q1–Q2, E1–T1, C1–Q1, Q2–Q3, T1–C2,
Q1–H1 *ou* Q3–H1, Q4–Q5, C2–Q4, H1–E1.

Q1–H1 et Q3–H1 coûtent tous les deux 4 : il existe **deux arbres minimaux**
de même coût. L'algorithme prend l'un ou l'autre selon l'ordre de tri.

### Panne du tronçon H1–E1

L'arbre se coupe en {C1, Q1, Q2, Q3, H1} et {E1, T1, C2, Q4, Q5}.
Réparation la moins chère : **Q3–E1, 7 k€**. Q5–E1 serait possible mais il
est indisponible.

## Graphes à circuit absorbant (`data/tests/`)

**absorbant_accessible.csv** : S → A (2), A → B (1), B → C (−3), C → A (1), C → D (4).
Le circuit A → B → C → A vaut −1 et S l'atteint. A, B, C et D : distance −∞.

**absorbant_non_accessible.csv** : S → A (2), A → B (3), et à part
C → D (1), D → E (−3), E → C (1). Le circuit vaut −1 mais S ne l'atteint pas.
Bellman-Ford depuis S : pas de circuit détecté, B = 5, C = ∞.
Floyd-Warshall voit quand même C, D, E avec une diagonale négative.
