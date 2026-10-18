"""Module 4 : réseau de fibre (Max)."""

from __future__ import annotations

from .graphe import Graphe
from .resultats import ResultatArbre


class UnionFind:
    """Structure union-find avec compression de chemin et union par rang."""

    def __init__(self, elements: list[str]) -> None:
        raise NotImplementedError

    def trouver(self, x: str) -> str:
        raise NotImplementedError

    def unir(self, x: str, y: str) -> bool:
        """Fusionne les ensembles de x et y. False s'ils étaient déjà ensemble."""
        raise NotImplementedError


def kruskal(graphe: Graphe) -> ResultatArbre:
    """Arbre (ou forêt) couvrant minimal par Kruskal."""
    raise NotImplementedError


def prim(graphe: Graphe) -> ResultatArbre:
    """Arbre (ou forêt) couvrant minimal par Prim avec tas binaire.
    Si le graphe n'est pas connexe, relancer depuis un sommet non couvert."""
    raise NotImplementedError


def reparer_panne(
    graphe: Graphe, arbre: ResultatArbre, u: str, v: str
) -> tuple[str, str, float] | None:
    """Le tronçon u-v de l'arbre tombe en panne. Renvoie l'arête disponible
    la moins chère du graphe initial qui recolle les deux morceaux, ou None."""
    raise NotImplementedError
