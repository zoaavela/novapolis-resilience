"""Formats de résultat communs. C'est le contrat entre les modules.

Chaque algo renvoie l'un de ces objets, jamais un format maison. L'API et la
CLI les transforment ensuite en JSON ou en texte.

Conventions :
- distance inatteignable : ``math.inf``
- distance diminuable sans fin (circuit absorbant) : ``-math.inf``
"""

from __future__ import annotations

from dataclasses import dataclass, field


@dataclass
class ResultatChemins:
    """Plus courts chemins depuis une source (Dijkstra, Bellman-Ford)."""

    source: str
    distances: dict[str, float]
    predecesseurs: dict[str, str | None]
    circuit_absorbant: bool = False
    """True si un circuit absorbant est accessible depuis la source."""


@dataclass
class ResultatToutesPaires:
    """Floyd-Warshall : distances entre toutes les paires."""

    distances: dict[str, dict[str, float]]
    successeurs: dict[str, dict[str, str | None]]
    """successeurs[u][v] = premier sommet après u sur le chemin u -> v."""
    sommets_sur_circuit_absorbant: set[str] = field(default_factory=set)
    """Sommets i tels que distances[i][i] < 0."""


@dataclass
class ResultatArbre:
    """Arbre (ou forêt) couvrant minimal : Kruskal, Prim."""

    aretes: list[tuple[str, str, float]]
    cout_total: float
    composantes: list[set[str]]
    """Une composante par arbre de la forêt. Une seule si le graphe est connexe."""


@dataclass
class Chemin:
    """Chemin reconstruit, prêt à afficher."""

    sommets: list[str]
    duree: float

    @property
    def nb_arcs(self) -> int:
        return max(len(self.sommets) - 1, 0)
