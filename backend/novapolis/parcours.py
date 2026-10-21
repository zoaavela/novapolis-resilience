"""Module 1 : parcours DFS et BFS (Enzo).

Rappel du sujet : ne pas confondre accessibilité depuis une source,
connexité ordinaire et connexité forte.
- Accessibilité : les sites qu'on peut atteindre en partant d'une caserne
  (bfs, non_atteignables). C'est ce qui compte pour les secours.
- Connexité (graphe non orienté, la fibre) : composantes_connexes.
- Connexité forte (graphe orienté) : chaque site peut atteindre chaque autre.
  La petite ville n'est pas fortement connexe, car rien ne revient à Q5.
"""

from __future__ import annotations

from collections import deque

from .graphe import Graphe


def bfs(graphe: Graphe, sources: list[str]) -> dict[str, int]:
    """Parcours en largeur depuis une ou plusieurs sources.

    Renvoie {sommet atteint: nombre minimal d'arcs depuis la source la plus
    proche}. Les sources valent 0. Les sommets non atteints sont absents.

    Principe : on avance par vagues. La file (FIFO) garantit qu'on traite
    tous les sommets à distance k avant ceux à distance k + 1, donc le premier
    niveau noté pour un sommet est le plus petit possible.
    Complexité : O(V + E), chaque sommet entre une fois dans la file et
    chaque arc est regardé une fois.
    """
    niveaux = {s: 0 for s in sources}  # les sources sont au niveau 0
    file = deque(sources)  # elles attendent toutes dans la file au départ

    while file:
        u = file.popleft()  # on sort le plus ancien de la file
        for v, _ in graphe.voisins(u):  # le temps de trajet ne compte pas ici
            if v not in niveaux:  # v n'a jamais été vu
                niveaux[v] = niveaux[u] + 1  # une route de plus que u
                file.append(v)  # on traitera ses voisins plus tard
    return niveaux


def bfs_chemin(graphe: Graphe, source: str, cible: str) -> list[str] | None:
    """Chemin minimisant le nombre d'arcs, ou None si la cible est inatteignable.

    Même parcours que bfs, mais on retient pour chaque sommet d'où on vient
    (son parent). On remonte ensuite les parents depuis la cible.
    """
    parents: dict[str, str | None] = {source: None}
    file = deque([source])

    while file:
        u = file.popleft()
        if u == cible:  # inutile d'aller plus loin
            break
        for v, _ in graphe.voisins(u):
            if v not in parents:
                parents[v] = u
                file.append(v)

    if cible not in parents:
        return None

    chemin = [cible]
    while parents[chemin[-1]] is not None:  # on remonte jusqu'à la source
        chemin.append(parents[chemin[-1]])
    chemin.reverse()  # on l'a construit à l'envers
    return chemin


def dfs(graphe: Graphe, source: str) -> list[str]:
    """Parcours en profondeur : sommets dans l'ordre de première visite.

    On utilise une pile (LIFO) au lieu d'une file : on part le plus loin
    possible sur une branche avant de revenir en arrière.
    Version itérative pour éviter la limite de récursion de Python
    sur le graphe de 1 000 sommets. Complexité : O(V + E).
    """
    vus: set[str] = set()
    ordre: list[str] = []
    pile = [source]

    while pile:
        u = pile.pop()  # le dernier ajouté sort en premier
        if u in vus:
            continue
        vus.add(u)
        ordre.append(u)
        # on empile les voisins à l'envers pour les visiter dans l'ordre naturel
        for v, _ in reversed(graphe.voisins(u)):
            if v not in vus:
                pile.append(v)
    return ordre


def a_cycle_oriente(graphe: Graphe) -> bool:
    """True si le graphe orienté contient un cycle.

    DFS avec trois couleurs :
    - BLANC : pas encore visité ;
    - GRIS : en cours de visite (on est quelque part dans ses descendants) ;
    - NOIR : terminé, tous ses descendants ont été explorés.
    Tomber sur un sommet GRIS veut dire qu'on est revenu sur un ancêtre :
    c'est un cycle. Tomber sur un NOIR n'en est pas un.
    """
    BLANC, GRIS, NOIR = 0, 1, 2
    couleur = {s: BLANC for s in graphe.sommets()}

    for depart in graphe.sommets():
        if couleur[depart] != BLANC:
            continue
        # pile de (sommet, itérateur sur ses voisins) : DFS itératif
        couleur[depart] = GRIS
        pile = [(depart, iter(graphe.voisins(depart)))]
        while pile:
            u, voisins = pile[-1]
            suivant = next(voisins, None)
            if suivant is None:  # plus de voisins : u est terminé
                couleur[u] = NOIR
                pile.pop()
                continue
            v, _ = suivant
            if couleur[v] == GRIS:
                return True
            if couleur[v] == BLANC:
                couleur[v] = GRIS
                pile.append((v, iter(graphe.voisins(v))))
    return False


def composantes_connexes(graphe: Graphe) -> list[set[str]]:
    """Composantes connexes d'un graphe NON orienté (réseau de fibre).

    On lance un parcours depuis chaque sommet pas encore rangé : tout ce
    qu'il atteint forme une composante.
    """
    restants = set(graphe.sommets())
    composantes: list[set[str]] = []
    for s in graphe.sommets():
        if s in restants:
            composante = set(bfs(graphe, [s]))
            composantes.append(composante)
            restants -= composante
    return composantes


def non_atteignables(graphe: Graphe, sources: list[str]) -> set[str]:
    """Sites qu'aucune source ne peut atteindre : tous les sites, moins ceux que bfs trouve."""
    return set(graphe.sommets()) - set(bfs(graphe, sources))