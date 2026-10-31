"""Application des scénarios (carte « Scénarios de fermeture et indicateurs », Elio).

Règle absolue : on travaille sur ``graphe.copie()``. Le graphe de base ne
change jamais.
"""

from __future__ import annotations

from .donnees import Action
from .graphe import Graphe

ACTIONS_PAR_RESEAU = {
    "routes": {"fermer", "modifier", "pointe"},
    "fibre": {"panne", "modifier"},
}


class ScenarioInvalideError(ValueError):
    """Levée quand une action ne peut pas s'appliquer au réseau demandé."""


def appliquer(graphe: Graphe, actions: list[Action], reseau: str) -> Graphe:
    """Renvoie une copie du graphe avec les actions du réseau donné appliquées.

    Actions :
    - ``fermer`` (routes) : retire l'arc u -> v
    - ``panne`` (fibre) : retire l'arête u - v
    - ``modifier`` : remplace le poids de u -> v par ``valeur``
    - ``pointe`` (routes, u = v = "*") : géré au chargement, mode="pointe"

    Principe : on copie d'abord le graphe, puis on applique les actions une
    par une sur la copie. On ne garde que les actions du réseau demandé, car
    un scénario peut toucher les routes et la fibre en même temps.

    Un lien déjà absent du graphe est ignoré : c'est une route déjà fermée
    dans routes.csv, ou un tronçon déjà indisponible. Le fermer une seconde
    fois ne change rien. Les liens inconnus sont repérés plus tôt, par
    ``donnees.valider``.

    Complexité : O(V + E) pour la copie, puis O(1) par action.
    """
    if reseau not in ACTIONS_PAR_RESEAU:
        raise ScenarioInvalideError(f"Réseau inconnu : {reseau!r} (routes ou fibre)")

    copie = graphe.copie()  # l'original ne sera jamais touché
    for a in actions:
        if a.reseau != reseau:  # action destinée à l'autre réseau
            continue
        if a.action not in ACTIONS_PAR_RESEAU[reseau]:
            raise ScenarioInvalideError(f"Action {a.action!r} impossible sur le réseau {reseau}")
        if a.action == "pointe":  # déjà pris en compte au chargement des temps
            continue
        if not copie.a_arc(a.u, a.v):  # déjà fermé ou indisponible au départ
            continue
        if a.action in ("fermer", "panne"):
            copie.retirer_arc(a.u, a.v)  # en non orienté, retire les deux sens
        else:  # modifier
            if a.valeur is None:
                raise ScenarioInvalideError(
                    f"L'action modifier sur {a.u} -> {a.v} exige une valeur"
                )
            copie.modifier_poids(a.u, a.v, a.valeur)
    return copie


def liens_retires(avant: Graphe, apres: Graphe) -> list[tuple[str, str]]:
    """Liens présents avant le scénario et absents après, triés.

    Sert à afficher ce que le scénario a coupé, et à repérer les demandes dont
    le chemin initial passait par une route fermée.
    """
    return sorted((u, v) for u, v, _ in avant.arcs() if not apres.a_arc(u, v))
