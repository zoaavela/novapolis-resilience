"""Module 2 et 3 : plus courts chemins.

Dijkstra : Enzo. Bellman-Ford et Floyd-Warshall : Elio.
Formats de sortie : voir resultats.py.
"""

from __future__ import annotations

import math

from .graphe import Graphe
from .resultats import Chemin, ResultatChemins, ResultatToutesPaires


def dijkstra(graphe: Graphe, source: str) -> ResultatChemins:
    """Dijkstra avec tas binaire (heapq). Poids négatifs interdits :
    lever ValueError si le graphe en contient."""
    raise NotImplementedError


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
