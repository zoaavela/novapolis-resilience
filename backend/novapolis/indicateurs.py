"""Module 5 : indicateurs de résilience (carte « Scénarios et indicateurs »)."""

from __future__ import annotations

from dataclasses import dataclass


@dataclass
class ImpactDemande:
    demande: str
    site: str
    caserne: str | None
    avant: float
    apres: float

    @property
    def accessible(self) -> bool:
        return self.apres != float("inf")

    @property
    def retard(self) -> float:
        return self.apres - self.avant

    @property
    def retard_relatif(self) -> float:
        return self.retard / self.avant if self.avant else 0.0


def comparer(avant: dict[str, float], apres: dict[str, float]) -> list[ImpactDemande]:
    """Compare les temps d'intervention avant et après un scénario."""
    raise NotImplementedError
