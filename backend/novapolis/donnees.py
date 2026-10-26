"""Lecture des fichiers CSV et construction des graphes.

Le chargement simple suppose des fichiers corrects. La validation complète
est dans ``valider`` (carte Trello « Validateur des fichiers CSV », Elio).
Format des fichiers : docs/FORMAT_DONNEES.md
"""

from __future__ import annotations

import csv
import math
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


TYPES_SITES = {"caserne", "hopital", "ecole", "telecom", "quartier"}
STATUTS = {"routes": {"ouvert", "ferme"}, "fibre": {"disponible", "indisponible"}}
ACTIONS = {"routes": {"fermer", "modifier", "pointe"}, "fibre": {"panne", "modifier"}}
PRIORITES = {1, 2, 3}


def valider(dossier: str | Path, autoriser_negatifs: bool = False) -> list[str]:
    """Vérifie les fichiers d'un dossier de données.

    Renvoie la liste des erreurs, vide si tout est correct. Chaque message
    cite le fichier et le numéro de ligne, par exemple :
    ``routes.csv ligne 14 : le site 'S999' n'existe pas``.

    Le validateur lit tout et accumule les erreurs au lieu de s'arrêter à la
    première : on corrige un fichier en une seule fois. Les temps et coûts
    négatifs sont refusés, sauf si ``autoriser_negatifs`` est vrai (jeux de
    test des circuits absorbants). Une ligne refusée n'est pas utilisée pour
    contrôler les fichiers suivants. Le numéro de ligne compte l'en-tête
    comme ligne 1.
    """
    dossier = Path(dossier)
    if not dossier.is_dir():
        return [f"{dossier} : dossier introuvable"]

    erreurs: list[str] = []
    contenus = {nom: _lire_pour_valider(dossier, nom, erreurs) for nom in COLONNES}
    if contenus["sites"] is None:
        return erreurs  # sans les sites, aucune référence ne peut être vérifiée
    sites = _valider_sites(contenus["sites"], erreurs)
    liens = {
        reseau: _valider_liens(contenus[reseau], reseau, sites, autoriser_negatifs, erreurs)
        for reseau in ("routes", "fibre")
        if contenus[reseau] is not None
    }
    if contenus["demandes"] is not None:
        _valider_demandes(contenus["demandes"], sites, erreurs)
    if contenus["scenarios"] is not None:
        _valider_scenarios(contenus["scenarios"], liens, autoriser_negatifs, erreurs)
    return erreurs


def _lire_pour_valider(
    dossier: Path, nom: str, erreurs: list[str]
) -> list[tuple[int, dict]] | None:
    """Lignes numérotées d'un fichier, ou None s'il est absent ou mal formé."""
    chemin = dossier / f"{nom}.csv"
    if not chemin.exists():
        erreurs.append(f"{nom}.csv : fichier absent")
        return None
    with open(chemin, encoding="utf-8", newline="") as f:
        lecteur = csv.DictReader(f)
        entete = [c.strip() for c in lecteur.fieldnames or []]
        manquantes = [c for c in COLONNES[nom] if c not in entete]
        if manquantes:
            erreurs.append(f"{nom}.csv ligne 1 : colonne(s) manquante(s) {', '.join(manquantes)}")
            return None
        lignes = []
        for numero, brute in enumerate(lecteur, start=2):
            ligne = {(k or "").strip(): (v or "").strip() for k, v in brute.items()}
            if any(ligne.values()):  # on ignore les lignes vides
                lignes.append((numero, ligne))
        return lignes


def _nombre(texte: str, nom: str, autoriser_negatifs: bool, ou: str, erreurs: list[str]):
    """Le nombre lu, ou None après avoir noté l'erreur."""
    try:
        valeur = float(texte)
    except ValueError:
        erreurs.append(f"{ou} : {nom} illisible ({texte!r})")
        return None
    if not math.isfinite(valeur):
        erreurs.append(f"{ou} : {nom} doit être un nombre fini ({texte!r})")
        return None
    if valeur < 0 and not autoriser_negatifs:
        erreurs.append(f"{ou} : {nom} négatif ({texte}), interdit hors jeux de test")
        return None
    return valeur


def _valider_sites(lignes: list[tuple[int, dict]], erreurs: list[str]) -> set[str]:
    sites: set[str] = set()
    for numero, l in lignes:
        ou = f"sites.csv ligne {numero}"
        ok = True
        if not l["id"]:
            erreurs.append(f"{ou} : identifiant vide")
            ok = False
        elif l["id"] in sites:
            erreurs.append(f"{ou} : le site {l['id']!r} apparaît deux fois")
            ok = False
        if not l["nom"]:
            erreurs.append(f"{ou} : nom vide")
        if l["type"] not in TYPES_SITES:
            erreurs.append(f"{ou} : type {l['type']!r} inconnu ({', '.join(sorted(TYPES_SITES))})")
        for coordonnee in ("longitude", "latitude"):
            _nombre(l[coordonnee], coordonnee, True, ou, erreurs)
        if ok:
            sites.add(l["id"])
    return sites


def _valider_liens(
    lignes: list[tuple[int, dict]],
    reseau: str,
    sites: set[str],
    autoriser_negatifs: bool,
    erreurs: list[str],
) -> set:
    """Routes (orientées) ou fibre (non orientée). Renvoie les liens valides."""
    oriente = reseau == "routes"
    colonnes_poids = ["temps_normal", "temps_pointe"] if oriente else ["cost"]
    liens: set = set()
    for numero, l in lignes:
        ou = f"{reseau}.csv ligne {numero}"
        ok = True
        for extremite in ("u", "v"):
            if l[extremite] not in sites:
                erreurs.append(f"{ou} : le site {l[extremite]!r} n'existe pas")
                ok = False
        if ok and l["u"] == l["v"]:
            erreurs.append(f"{ou} : boucle sur le site {l['u']!r}")
            ok = False
        for colonne in colonnes_poids:
            if _nombre(l[colonne], colonne, autoriser_negatifs, ou, erreurs) is None:
                ok = False
        if l["statut"] not in STATUTS[reseau]:
            erreurs.append(
                f"{ou} : statut {l['statut']!r} inconnu ({', '.join(sorted(STATUTS[reseau]))})"
            )
            ok = False
        cle = (l["u"], l["v"]) if oriente else frozenset((l["u"], l["v"]))
        if ok and cle in liens:
            fleche = "->" if oriente else "-"
            erreurs.append(f"{ou} : le lien {l['u']} {fleche} {l['v']} apparaît deux fois")
            ok = False
        if ok:
            liens.add(cle)
    return liens


def _valider_demandes(lignes: list[tuple[int, dict]], sites: set[str], erreurs: list[str]) -> None:
    vues: set[str] = set()
    for numero, l in lignes:
        ou = f"demandes.csv ligne {numero}"
        if not l["id"]:
            erreurs.append(f"{ou} : identifiant vide")
        elif l["id"] in vues:
            erreurs.append(f"{ou} : la demande {l['id']!r} apparaît deux fois")
        vues.add(l["id"])
        if l["origine"] not in sites:
            erreurs.append(f"{ou} : le site {l['origine']!r} n'existe pas")
        if not l["type"]:
            erreurs.append(f"{ou} : type vide")
        try:
            priorite_ok = int(l["priorite"]) in PRIORITES
        except ValueError:
            priorite_ok = False
        if not priorite_ok:
            erreurs.append(f"{ou} : priorité {l['priorite']!r} invalide (1, 2 ou 3)")


def _valider_scenarios(
    lignes: list[tuple[int, dict]],
    liens: dict[str, set],
    autoriser_negatifs: bool,
    erreurs: list[str],
) -> None:
    """Un lien visé n'est vérifié que si le fichier de son réseau a pu être lu."""
    for numero, l in lignes:
        ou = f"scenarios.csv ligne {numero}"
        reseau, action, u, v = l["reseau"], l["action"], l["u"], l["v"]
        if not l["scenario"]:
            erreurs.append(f"{ou} : nom de scénario vide")
        if reseau not in ACTIONS:
            erreurs.append(f"{ou} : réseau {reseau!r} inconnu (fibre, routes)")
            continue
        if action not in ACTIONS[reseau]:
            permises = ", ".join(sorted(ACTIONS[reseau]))
            erreurs.append(f"{ou} : action {action!r} impossible sur {reseau} ({permises})")
            continue
        if action == "pointe":
            if (u, v) != ("*", "*"):
                erreurs.append(f"{ou} : l'action pointe s'écrit avec u = v = '*'")
            continue
        cle = (u, v) if reseau == "routes" else frozenset((u, v))
        if reseau in liens and cle not in liens[reseau]:
            fleche = "->" if reseau == "routes" else "-"
            erreurs.append(f"{ou} : le lien {u} {fleche} {v} n'existe pas dans {reseau}.csv")
        if action == "modifier":
            if not l["valeur"]:
                erreurs.append(f"{ou} : l'action modifier exige une valeur")
            else:
                _nombre(l["valeur"], "valeur", autoriser_negatifs, ou, erreurs)
        elif l["valeur"]:
            erreurs.append(f"{ou} : valeur inattendue pour l'action {action}")
