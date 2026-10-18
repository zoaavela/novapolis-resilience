"""Module 1 : parcours DFS et BFS (Enzo).

Rappel du sujet : ne pas confondre accessibilité depuis une source,
connexité ordinaire et connexité forte.
"""

from __future__ import annotations

from .graphe import Graphe


def bfs(graphe: Graphe, sources: list[str]) -> dict[str, int]:
    """Parcours en largeur depuis une ou plusieurs sources.

    Renvoie {sommet atteint: nombre minimal d'arcs depuis la source la plus
    proche}. Les sources valent 0. Les sommets non atteints sont absents.
    Astuce : mettre toutes les sources dans la file au départ.
    """
    raise NotImplementedError


def bfs_chemin(graphe: Graphe, source: str, cible: str) -> list[str] | None:
    """Chemin minimisant le nombre d'arcs, ou None si la cible est inatteignable."""
    raise NotImplementedError


def dfs(graphe: Graphe, source: str) -> list[str]:
    """Parcours en profondeur : sommets dans l'ordre de première visite."""
    raise NotImplementedError


def a_cycle_oriente(graphe: Graphe) -> bool:
    """True si le graphe orienté contient un cycle (DFS, sommets « en cours »)."""
    raise NotImplementedError


def composantes_connexes(graphe: Graphe) -> list[set[str]]:
    """Composantes connexes d'un graphe NON orienté (réseau de fibre)."""
    raise NotImplementedError


def non_atteignables(graphe: Graphe, sources: list[str]) -> set[str]:
    """Sites qu'aucune source ne peut atteindre."""
    raise NotImplementedError
