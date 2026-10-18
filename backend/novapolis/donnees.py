"""Lecture des fichiers CSV et construction des graphes.

Le chargement simple est écrit. La validation complète est à faire
(carte Trello « Validateur des fichiers CSV », Elio).
Format des fichiers : docs/FORMAT_DONNEES.md
"""

from __future__ import annotations

import csv
from dataclasses import dataclass
from pathlib import Path

from .graphe import Graphe

COLONNES = {
    "sites": ["id", "nom", "type", "longitude", "latitude"],
    "routes": ["u", "v", "temps_normal", "temps_pointe", "statut"],
    "fibre": ["u", "v", "cost", "statut"],
    "demandes": ["id", "origine", "type", "priorite"],
    "scenarios": ["scenario", "reseau", "u", "v", "action", "valeur"],
}


class DonneesInvalidesError(ValueError):
    """Levée quand un fichier ne respecte pas le format."""


@dataclass
class Demande:
    id: str
    origine: str
    type: str
    priorite: int


@dataclass
class Action:
    reseau: str  # "routes" ou "fibre"
    u: str
    v: str
    action: str  # "fermer", "panne", "pointe", "modifier"
    valeur: float | None


def lire_csv(chemin: str | Path) -> list[dict[str, str]]:
    with open(chemin, encoding="utf-8", newline="") as f:
        return list(csv.DictReader(f))


def charger_sites(chemin: str | Path) -> dict[str, dict]:
    sites: dict[str, dict] = {}
    for ligne in lire_csv(chemin):
        sites[ligne["id"]] = {
            "nom": ligne["nom"],
            "type": ligne["type"],
            "longitude": float(ligne["longitude"]),
            "latitude": float(ligne["latitude"]),
        }
    return sites


def _graphe_vide(sites: dict[str, dict], oriente: bool) -> Graphe:
    g = Graphe(oriente=oriente)
    for sid, infos in sites.items():
        g.ajouter_sommet(sid, **infos)
    return g


def charger_routes(
    chemin: str | Path, sites: dict[str, dict], mode: str = "normal"
) -> Graphe:
    """Graphe orienté des routes ouvertes. mode = "normal" ou "pointe"."""
    colonne = {"normal": "temps_normal", "pointe": "temps_pointe"}[mode]
    g = _graphe_vide(sites, oriente=True)
    for ligne in lire_csv(chemin):
        if ligne["statut"] != "ouvert":
            continue
        g.ajouter_arc(ligne["u"], ligne["v"], float(ligne[colonne]))
    return g


def charger_fibre(chemin: str | Path, sites: dict[str, dict]) -> Graphe:
    """Graphe non orienté des tronçons de fibre disponibles."""
    g = _graphe_vide(sites, oriente=False)
    for ligne in lire_csv(chemin):
        if ligne["statut"] != "disponible":
            continue
        g.ajouter_arc(ligne["u"], ligne["v"], float(ligne["cost"]))
    return g


def charger_demandes(chemin: str | Path) -> list[Demande]:
    return [
        Demande(l["id"], l["origine"], l["type"], int(l["priorite"]))
        for l in lire_csv(chemin)
    ]


def charger_scenarios(chemin: str | Path) -> dict[str, list[Action]]:
    scenarios: dict[str, list[Action]] = {}
    for l in lire_csv(chemin):
        valeur = float(l["valeur"]) if l["valeur"] else None
        action = Action(l["reseau"], l["u"], l["v"], l["action"], valeur)
        scenarios.setdefault(l["scenario"], []).append(action)
    return scenarios


def valider(dossier: str | Path) -> list[str]:
    """Vérifie les fichiers d'un dossier de données.

    Renvoie la liste des erreurs, vide si tout est correct. Chaque message
    cite le fichier et le numéro de ligne, par exemple :
    ``routes.csv ligne 14 : le site 'S999' n'existe pas``.

    À vérifier au minimum : colonnes attendues (voir COLONNES), identifiants
    de sites uniques, u et v existants, nombres valides, statuts connus.
    """
    raise NotImplementedError("À écrire : carte « Validateur des fichiers CSV »")
