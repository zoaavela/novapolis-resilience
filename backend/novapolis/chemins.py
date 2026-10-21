"""Module 2 et 3 : plus courts chemins.

Dijkstra : Enzo. Bellman-Ford et Floyd-Warshall : Elio.
Formats de sortie : voir resultats.py.
"""

from __future__ import annotations

import heapq
import math

from .graphe import Graphe
from .resultats import Chemin, ResultatChemins, ResultatToutesPaires


def dijkstra(graphe: Graphe, source: str) -> ResultatChemins:
    """Dijkstra avec tas binaire (heapq). Poids négatifs interdits :
    lever ValueError si le graphe en contient.

    Principe : on fixe les sommets un par un, toujours le plus proche pas
    encore fixé. Une fois fixé, sa distance ne peut plus baisser, car tous les
    poids sont positifs : passer par un autre sommet ne peut que rallonger.
    C'est exactement pour ça que Dijkstra refuse les poids négatifs.

    Le tas binaire donne le sommet le plus proche en O(log V).
    Complexité : O((V + E) log V).
    """
    if any(w < 0 for _, _, w in graphe.arcs()):
        raise ValueError("Dijkstra ne gère pas les poids négatifs : utiliser Bellman-Ford.")

    distances = {s: math.inf for s in graphe.sommets()}  # tout est inconnu
    predecesseurs: dict[str, str | None] = {s: None for s in graphe.sommets()}
    distances[source] = 0
    tas = [(0.0, source)]  # (distance provisoire, sommet)
    fixes: set[str] = set()

    while tas:
        d, u = heapq.heappop(tas)  # le plus proche pas encore fixé
        if u in fixes:  # entrée périmée : u a déjà été fixé plus court
            continue
        fixes.add(u)
        for v, w in graphe.voisins(u):
            nouvelle = d + w
            if nouvelle < distances[v]:  # on a trouvé mieux pour v
                distances[v] = nouvelle
                predecesseurs[v] = u
                heapq.heappush(tas, (nouvelle, v))

    return ResultatChemins(source=source, distances=distances, predecesseurs=predecesseurs)


def bellman_ford(graphe: Graphe, source: str) -> ResultatChemins:
    """Bellman-Ford. Met circuit_absorbant=True si un circuit absorbant est
    accessible depuis la source, et -math.inf pour les sommets dont la
    distance peut diminuer sans fin."""
    raise NotImplementedError


def floyd_warshall(graphe: Graphe) -> ResultatToutesPaires:
    """Floyd-Warshall, toutes paires. O(V³) : petits graphes seulement."""
    raise NotImplementedError


def reconstruire_chemin(resultat: ResultatChemins, cible: str) -> Chemin | None:
    """Chemin source -> cible à partir des prédécesseurs. None si inatteignable
    ou si la distance n'est pas finie (circuit absorbant)."""
    d = resultat.distances.get(cible, math.inf)
    if not math.isfinite(d):
        return None
    sommets = [cible]
    while sommets[-1] != resultat.source:
        precedent = resultat.predecesseurs.get(sommets[-1])
        if precedent is None or len(sommets) > len(resultat.distances):
            return None
        sommets.append(precedent)
    sommets.reverse()
    return Chemin(sommets=sommets, duree=d)
