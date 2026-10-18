"""Application des scénarios (carte « Scénarios de fermeture et indicateurs »).

Règle absolue : on travaille sur ``graphe.copie()``. Le graphe de base ne
change jamais.
"""

from __future__ import annotations

from .donnees import Action
from .graphe import Graphe


def appliquer(graphe: Graphe, actions: list[Action], reseau: str) -> Graphe:
    """Renvoie une copie du graphe avec les actions du réseau donné appliquées.

    Actions :
    - ``fermer`` (routes) : retire l'arc u -> v
    - ``panne`` (fibre) : retire l'arête u - v
    - ``modifier`` : remplace le poids de u -> v par ``valeur``
    - ``pointe`` (routes, u = v = "*") : géré au chargement, mode="pointe"
    """
    raise NotImplementedError("À écrire : carte « Scénarios »")
