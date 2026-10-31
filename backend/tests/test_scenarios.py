"""Tests de l'application des scénarios. Valeurs attendues : docs/PETIT_GRAPHE.md"""

import math
from pathlib import Path

import pytest
from novapolis import chemins, donnees, scenarios
from novapolis.donnees import Action

PETIT = Path(__file__).resolve().parents[2] / "data" / "petit"


@pytest.fixture
def actions():
    return donnees.charger_scenarios(PETIT / "scenarios.csv")


def test_S1_ferme_Q1_H1_dans_les_deux_sens(routes, actions):
    g = scenarios.appliquer(routes, actions["S1"], "routes")
    assert not g.a_arc("Q1", "H1") and not g.a_arc("H1", "Q1")
    assert scenarios.liens_retires(routes, g) == [("H1", "Q1"), ("Q1", "H1")]


def test_l_original_ne_change_jamais(routes, actions):
    avant = sorted(routes.arcs())
    scenarios.appliquer(routes, actions["S1"], "routes")
    assert sorted(routes.arcs()) == avant
    assert routes.a_arc("Q1", "H1")


def test_S1_effet_sur_les_distances(routes, actions):
    g = scenarios.appliquer(routes, actions["S1"], "routes")
    assert chemins.dijkstra(g, "C1").distances["H1"] == 11
    assert chemins.dijkstra(g, "C1").distances["Q4"] == 29
    assert chemins.dijkstra(g, "C2").distances["Q1"] == math.inf


def test_S2_panne_de_fibre(fibre, actions):
    g = scenarios.appliquer(fibre, actions["S2"], "fibre")
    assert not g.a_arc("H1", "E1") and not g.a_arc("E1", "H1")
    assert fibre.a_arc("H1", "E1")


def test_seules_les_actions_du_reseau_demande(routes, fibre, actions):
    assert scenarios.appliquer(routes, actions["S2"], "routes").nb_arcs == routes.nb_arcs
    assert scenarios.appliquer(fibre, actions["S1"], "fibre").nb_arcs == fibre.nb_arcs


def test_pointe_ignoree_car_geree_au_chargement(routes, actions):
    g = scenarios.appliquer(routes, actions["S3"], "routes")
    assert sorted(g.arcs()) == sorted(routes.arcs())


def test_modifier_un_poids(routes):
    g = scenarios.appliquer(routes, [Action("routes", "C1", "Q1", "modifier", 20.0)], "routes")
    assert g.poids("C1", "Q1") == 20
    assert routes.poids("C1", "Q1") == 4
    assert chemins.dijkstra(g, "C1").distances["Q1"] == 18  # C1 -> Q2 -> Q3 -> H1 -> Q1


def test_route_deja_fermee_ignoree(routes):
    g = scenarios.appliquer(routes, [Action("routes", "Q4", "T1", "fermer", None)], "routes")
    assert g.nb_arcs == routes.nb_arcs


def test_erreurs(routes):
    with pytest.raises(scenarios.ScenarioInvalideError):
        scenarios.appliquer(routes, [], "rails")
    with pytest.raises(scenarios.ScenarioInvalideError):
        scenarios.appliquer(routes, [Action("routes", "C1", "Q1", "panne", None)], "routes")
    with pytest.raises(scenarios.ScenarioInvalideError):
        scenarios.appliquer(routes, [Action("routes", "C1", "Q1", "modifier", None)], "routes")
