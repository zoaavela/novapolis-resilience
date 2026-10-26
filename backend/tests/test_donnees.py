"""Tests du validateur des fichiers CSV."""

import shutil
from pathlib import Path

import pytest
from novapolis import donnees

RACINE = Path(__file__).resolve().parents[2]
PETIT = RACINE / "data" / "petit"


@pytest.fixture
def copie(tmp_path):
    """Copie du petit jeu, qu'on peut abîmer sans toucher à l'original."""
    dossier = tmp_path / "jeu"
    shutil.copytree(PETIT, dossier)
    return dossier


def remplacer(fichier, avant, apres):
    texte = fichier.read_text(encoding="utf-8")
    assert avant in texte
    fichier.write_text(texte.replace(avant, apres, 1), encoding="utf-8")


def ajouter(fichier, ligne):
    with open(fichier, "a", encoding="utf-8") as f:
        f.write(ligne + "\n")


@pytest.mark.parametrize("jeu", ["petit", "ville", "genere_1000"])
def test_jeux_fournis_valides(jeu):
    assert donnees.valider(RACINE / "data" / jeu) == []


def test_dossier_introuvable(tmp_path):
    assert "introuvable" in donnees.valider(tmp_path / "rien")[0]


def test_fichier_absent(copie):
    (copie / "fibre.csv").unlink()
    assert donnees.valider(copie) == ["fibre.csv : fichier absent"]


def test_colonne_manquante(copie):
    remplacer(copie / "fibre.csv", "u,v,cost,statut", "u,v,cout,statut")
    assert donnees.valider(copie) == ["fibre.csv ligne 1 : colonne(s) manquante(s) cost"]


def test_site_en_double(copie):
    ajouter(copie / "sites.csv", "C1,Doublon,caserne,0,0")
    assert donnees.valider(copie) == ["sites.csv ligne 12 : le site 'C1' apparaît deux fois"]


def test_route_vers_site_inexistant(copie):
    remplacer(copie / "routes.csv", "C1,Q1,4,6,ouvert", "C1,S999,4,6,ouvert")
    erreurs = donnees.valider(copie)
    assert "routes.csv ligne 2 : le site 'S999' n'existe pas" in erreurs


def test_fibre_vers_site_inexistant(copie):
    remplacer(copie / "fibre.csv", "C1,Q1,3,disponible", "X1,Q1,3,disponible")
    assert "fibre.csv ligne 2 : le site 'X1' n'existe pas" in donnees.valider(copie)


def test_nombre_illisible(copie):
    remplacer(copie / "routes.csv", "C1,Q1,4,6", "C1,Q1,quatre,6")
    assert donnees.valider(copie) == ["routes.csv ligne 2 : temps_normal illisible ('quatre')"]


def test_temps_negatif_refuse_hors_jeux_de_test(copie):
    remplacer(copie / "routes.csv", "C1,Q1,4,6", "C1,Q1,-4,6")
    assert "négatif" in donnees.valider(copie)[0]
    assert donnees.valider(copie, autoriser_negatifs=True) == []


def test_statut_et_type_inconnus(copie):
    remplacer(copie / "routes.csv", "C1,Q1,4,6,ouvert", "C1,Q1,4,6,bloque")
    remplacer(copie / "sites.csv", "H1,Hôpital Central,hopital", "H1,Hôpital Central,clinique")
    erreurs = donnees.valider(copie)
    assert any("statut 'bloque' inconnu" in e for e in erreurs)
    assert any("type 'clinique' inconnu" in e for e in erreurs)


def test_lien_en_double_et_boucle(copie):
    ajouter(copie / "routes.csv", "C1,Q1,9,9,ouvert")
    ajouter(copie / "routes.csv", "C2,C2,1,1,ouvert")
    ajouter(copie / "fibre.csv", "Q1,C1,7,disponible")
    erreurs = donnees.valider(copie)
    assert "routes.csv ligne 23 : le lien C1 -> Q1 apparaît deux fois" in erreurs
    assert "routes.csv ligne 24 : boucle sur le site 'C2'" in erreurs
    assert "fibre.csv ligne 16 : le lien Q1 - C1 apparaît deux fois" in erreurs


def test_demande_invalide(copie):
    ajouter(copie / "demandes.csv", "D9,S999,incendie,7")
    erreurs = donnees.valider(copie)
    assert "demandes.csv ligne 7 : le site 'S999' n'existe pas" in erreurs
    assert "demandes.csv ligne 7 : priorité '7' invalide (1, 2 ou 3)" in erreurs


def test_scenarios_invalides(copie):
    ajouter(copie / "scenarios.csv", "S4,routes,Q5,C1,fermer,")
    ajouter(copie / "scenarios.csv", "S5,fibre,Q1,Q2,fermer,")
    ajouter(copie / "scenarios.csv", "S6,routes,C1,Q1,modifier,")
    ajouter(copie / "scenarios.csv", "S7,routes,C1,Q1,pointe,")
    erreurs = donnees.valider(copie)
    assert "scenarios.csv ligne 6 : le lien Q5 -> C1 n'existe pas dans routes.csv" in erreurs
    assert any(e.startswith("scenarios.csv ligne 7 : action 'fermer' impossible") for e in erreurs)
    assert "scenarios.csv ligne 8 : l'action modifier exige une valeur" in erreurs
    assert "scenarios.csv ligne 9 : l'action pointe s'écrit avec u = v = '*'" in erreurs


def test_toutes_les_erreurs_sont_remontees(copie):
    remplacer(copie / "routes.csv", "C1,Q1,4,6,ouvert", "C1,S999,4,6,ouvert")
    remplacer(copie / "fibre.csv", "C1,Q1,3,disponible", "C1,Q1,-3,disponible")
    ajouter(copie / "demandes.csv", "D9,Q1,incendie,0")
    assert len(donnees.valider(copie)) == 3
