# Format des données

Un jeu de données est un dossier contenant cinq fichiers CSV, encodés en UTF-8,
séparés par des virgules, avec une ligne d'en-tête. Exemple : `data/petit/`.

Les données de Novapolis sont **synthétiques** : la ville est inventée.

## sites.csv

| Colonne | Type | Description |
|---|---|---|
| id | texte | Identifiant unique (C1, H1, Q7…) |
| nom | texte | Nom affiché |
| type | texte | `caserne`, `hopital`, `ecole`, `telecom` ou `quartier` |
| longitude | nombre | Coordonnée horizontale, fictive |
| latitude | nombre | Coordonnée verticale, fictive |

## routes.csv (graphe orienté)

Une ligne = un trajet autorisé de `u` vers `v`. Une rue à double sens = deux lignes.

| Colonne | Type | Description |
|---|---|---|
| u | id de site | Départ |
| v | id de site | Arrivée |
| temps_normal | nombre ≥ 0 | Minutes hors heure de pointe |
| temps_pointe | nombre ≥ 0 | Minutes en heure de pointe |
| statut | texte | `ouvert` ou `ferme`. Une route fermée n'entre pas dans le graphe |

Seuls les jeux de test de `data/tests/` contiennent des temps négatifs, pour
vérifier Bellman-Ford et Floyd-Warshall. Un temps négatif n'a aucun sens physique.

## fibre.csv (graphe non orienté)

| Colonne | Type | Description |
|---|---|---|
| u, v | id de site | Extrémités du tronçon (une seule ligne par tronçon) |
| cost | nombre ≥ 0 | Coût de construction, en milliers d'euros |
| statut | texte | `disponible` ou `indisponible` (zone inondable, travaux…) |

## demandes.csv

| Colonne | Type | Description |
|---|---|---|
| id | texte | Identifiant de la demande |
| origine | id de site | Site où intervenir |
| type | texte | `incendie`, `malaise`, `accident`, `transfert`… |
| priorite | entier | 1 = urgente, 3 = faible |

La caserne retenue pour une demande est celle qui atteint le site le plus vite.

## scenarios.csv

Chaque ligne est une modification. Les lignes qui partagent le même `scenario`
forment un scénario. La situation normale n'a pas de ligne. Les fichiers
d'origine ne sont jamais modifiés : le scénario s'applique à une copie du graphe.

| Colonne | Description |
|---|---|
| scenario | Identifiant (S1, S2…) |
| reseau | `routes` ou `fibre` |
| u, v | Arc ou tronçon visé. `*` pour tout le réseau |
| action | `fermer` (route), `panne` (fibre), `modifier` (nouveau poids), `pointe` (temps de pointe partout) |
| valeur | Nouveau poids pour `modifier`, vide sinon |

## Règles de validation

Un fichier est rejeté, avec le nom du fichier et le numéro de ligne, si :
- une colonne attendue manque ;
- un identifiant de site apparaît deux fois ;
- `u` ou `v` désigne un site absent de `sites.csv` ;
- un nombre est illisible, ou négatif hors jeux de test ;
- un statut ou une action n'est pas dans la liste.
