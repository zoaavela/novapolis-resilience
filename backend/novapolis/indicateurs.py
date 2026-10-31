"""Module 5 : indicateurs de résilience (carte « Scénarios et indicateurs », Elio).

Un scénario est jugé en comparant le temps d'intervention de chaque demande
avant et après la perturbation. On en tire des indicateurs chiffrés, comme le
demande le sujet : au moins deux par scénario.
"""

from __future__ import annotations

import math
from dataclasses import dataclass

from .donnees import Demande


@dataclass
class ImpactDemande:
    demande: str
    site: str
    caserne: str | None
    avant: float
    apres: float

    @property
    def accessible(self) -> bool:
        return self.apres != math.inf

    @property
    def devenue_inaccessible(self) -> bool:
        """Accessible avant le scénario, plus du tout après."""
        return self.avant != math.inf and self.apres == math.inf

    @property
    def retard(self) -> float:
        """Minutes perdues. inf si la demande est devenue inaccessible, 0 si
        elle l'était déjà avant (rien de mesurable n'a changé)."""
        if self.avant == math.inf:
            return 0.0 if self.apres == math.inf else self.apres - self.avant
        if self.apres == math.inf:
            return math.inf
        return self.apres - self.avant

    @property
    def retard_relatif(self) -> float:
        """Retard divisé par le temps initial (0.5 = 50 % plus long)."""
        if self.avant in (0, math.inf):  # pas de base pour un pourcentage
            return 0.0 if self.retard == 0 else math.inf
        return self.retard / self.avant

    @property
    def statut(self) -> str:
        """Résumé lisible : inchangé, retard, amélioré, devenu inaccessible
        ou toujours inaccessible."""
        if self.avant == math.inf and self.apres == math.inf:
            return "toujours inaccessible"
        if self.devenue_inaccessible:
            return "devenu inaccessible"
        if self.retard > 0:
            return "retard"
        if self.retard < 0:
            return "amélioré"
        return "inchangé"


@dataclass
class Indicateurs:
    """Bilan d'un scénario sur l'ensemble des demandes."""

    nb_demandes: int
    nb_inaccessibles: int
    """Demandes qu'aucune caserne n'atteint après le scénario."""
    nb_devenues_inaccessibles: int
    """Parmi elles, celles qui étaient accessibles avant."""
    nb_retardees: int
    retard_moyen: float
    """Moyenne sur les demandes accessibles avant et après, en minutes."""
    retard_max: float
    retard_relatif_max: float


def comparer(
    avant: dict[str, float],
    apres: dict[str, float],
    demandes: list[Demande] | None = None,
    casernes: dict[str, str | None] | None = None,
) -> list[ImpactDemande]:
    """Compare les temps d'intervention avant et après un scénario.

    Deux façons de l'appeler :
    - sans ``demandes`` : les clés de ``avant`` et ``apres`` sont les
      demandes elles-mêmes, une ligne par clé ;
    - avec ``demandes`` : ``avant`` et ``apres`` donnent le temps par site
      (temps de la caserne la plus proche), une ligne par demande, lue sur
      son site d'origine. C'est le format que calcule l'API.

    ``casernes`` donne, pour chaque clé, la caserne retenue après le
    scénario. Une clé absente d'un des deux dictionnaires vaut inf
    (inatteignable).

    Complexité : O(nombre de demandes).
    """
    casernes = casernes or {}
    if demandes is None:
        cles = sorted(set(avant) | set(apres))
        lignes = [(cle, cle) for cle in cles]
    else:
        lignes = [(d.id, d.origine) for d in demandes]
    return [
        ImpactDemande(
            demande=demande,
            site=site,
            caserne=casernes.get(site),
            avant=avant.get(site, math.inf),
            apres=apres.get(site, math.inf),
        )
        for demande, site in lignes
    ]


def resumer(impacts: list[ImpactDemande]) -> Indicateurs:
    """Indicateurs de résilience d'un scénario.

    Le retard moyen ne compte que les demandes accessibles avant et après :
    une demande devenue inaccessible a un retard infini qui écraserait la
    moyenne. Elle est comptée à part, dans ``nb_devenues_inaccessibles``.
    """
    mesurables = [i for i in impacts if i.avant != math.inf and i.apres != math.inf]
    retards = [i.retard for i in mesurables]
    return Indicateurs(
        nb_demandes=len(impacts),
        nb_inaccessibles=sum(1 for i in impacts if not i.accessible),
        nb_devenues_inaccessibles=sum(1 for i in impacts if i.devenue_inaccessible),
        nb_retardees=sum(1 for r in retards if r > 0),
        retard_moyen=sum(retards) / len(retards) if retards else 0.0,
        retard_max=max(retards, default=0.0),
        retard_relatif_max=max((i.retard_relatif for i in mesurables), default=0.0),
    )
