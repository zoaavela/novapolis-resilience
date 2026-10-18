"""Structure de graphe commune à tout le projet.

Choix de structure : listes d'adjacence stockées sous forme de dictionnaires
imbriqués, ``adj[u][v] = poids``.

- Parcourir les voisins d'un sommet coûte O(degré), ce dont ont besoin
  DFS, BFS, Dijkstra, Bellman-Ford et Prim.
- Tester ou lire un arc précis coûte O(1) en moyenne, utile pour les
  scénarios (fermer un arc) et pour la validation.
- La mémoire est en O(|V| + |E|), adaptée à des réseaux urbains peu denses.
  Une matrice d'adjacence coûterait O(|V|²), soit 1 000 000 de cases pour
  1 000 sommets alors que la plupart seraient vides.

Un graphe non orienté stocke chaque arête dans les deux sens.
"""

from __future__ import annotations

import copy
from collections.abc import Iterator


class SiteInconnuError(KeyError):
    """Levée quand on référence un sommet absent du graphe."""


class Graphe:
    """Graphe pondéré, orienté (routes) ou non orienté (fibre)."""

    def __init__(self, oriente: bool) -> None:
        self.oriente = oriente
        self._adj: dict[str, dict[str, float]] = {}
        self._infos: dict[str, dict] = {}

    # ----- sommets -------------------------------------------------------
    def ajouter_sommet(self, sommet: str, **infos) -> None:
        """Ajoute un sommet. Les infos (nom, type, coordonnées) sont libres."""
        if sommet in self._adj:
            raise ValueError(f"Le sommet {sommet!r} existe déjà.")
        self._adj[sommet] = {}
        self._infos[sommet] = dict(infos)

    def contient(self, sommet: str) -> bool:
        return sommet in self._adj

    def sommets(self) -> list[str]:
        return list(self._adj)

    def infos(self, sommet: str) -> dict:
        self._verifier(sommet)
        return self._infos[sommet]

    @property
    def nb_sommets(self) -> int:
        return len(self._adj)

    # ----- arcs ----------------------------------------------------------
    def ajouter_arc(self, u: str, v: str, poids: float) -> None:
        """Ajoute l'arc u -> v (et v -> u si le graphe est non orienté)."""
        self._verifier(u)
        self._verifier(v)
        if v in self._adj[u]:
            raise ValueError(f"L'arc {u} -> {v} existe déjà.")
        self._adj[u][v] = float(poids)
        if not self.oriente:
            self._adj[v][u] = float(poids)

    def retirer_arc(self, u: str, v: str) -> None:
        """Retire l'arc u -> v (et v -> u si non orienté)."""
        self._verifier(u)
        self._verifier(v)
        if v not in self._adj[u]:
            raise ValueError(f"L'arc {u} -> {v} n'existe pas.")
        del self._adj[u][v]
        if not self.oriente:
            del self._adj[v][u]

    def a_arc(self, u: str, v: str) -> bool:
        return u in self._adj and v in self._adj[u]

    def poids(self, u: str, v: str) -> float:
        if not self.a_arc(u, v):
            raise ValueError(f"L'arc {u} -> {v} n'existe pas.")
        return self._adj[u][v]

    def modifier_poids(self, u: str, v: str, poids: float) -> None:
        if not self.a_arc(u, v):
            raise ValueError(f"L'arc {u} -> {v} n'existe pas.")
        self._adj[u][v] = float(poids)
        if not self.oriente:
            self._adj[v][u] = float(poids)

    def voisins(self, u: str) -> list[tuple[str, float]]:
        """Liste des (voisin, poids) accessibles depuis u."""
        self._verifier(u)
        return list(self._adj[u].items())

    def arcs(self) -> Iterator[tuple[str, str, float]]:
        """Tous les arcs (u, v, poids). En non orienté, chaque arête une fois."""
        vus: set[frozenset[str]] = set()
        for u, voisins in self._adj.items():
            for v, w in voisins.items():
                if not self.oriente:
                    cle = frozenset((u, v))
                    if cle in vus:
                        continue
                    vus.add(cle)
                yield u, v, w

    @property
    def nb_arcs(self) -> int:
        return sum(1 for _ in self.arcs())

    # ----- divers --------------------------------------------------------
    def copie(self) -> Graphe:
        """Copie indépendante : les scénarios modifient la copie, jamais l'original."""
        return copy.deepcopy(self)

    def _verifier(self, sommet: str) -> None:
        if sommet not in self._adj:
            raise SiteInconnuError(f"Site inconnu : {sommet!r}")

    def __repr__(self) -> str:
        genre = "orienté" if self.oriente else "non orienté"
        return f"Graphe({genre}, {self.nb_sommets} sommets, {self.nb_arcs} arcs)"
