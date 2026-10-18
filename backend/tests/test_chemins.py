"""Tests des modules 2 et 3. Valeurs attendues : docs/PETIT_GRAPHE.md"""

import math

import pytest
from novapolis import chemins

ATTENDU_C1 = {
    "C1": 0, "Q1": 4, "Q2": 6, "Q3": 9, "H1": 10,
    "E1": 15, "T1": 18, "C2": 22, "Q4": 28, "Q5": math.inf,
}


@pytest.mark.parametrize("algo", [chemins.dijkstra, chemins.bellman_ford])
def test_distances_depuis_C1(routes, algo):
    r = algo(routes, "C1")
    assert r.distances == ATTENDU_C1
    assert not r.circuit_absorbant


def test_floyd_warshall_coherent_avec_dijkstra(routes):
    fw = chemins.floyd_warshall(routes)
    assert fw.distances["C1"] == ATTENDU_C1
    assert fw.distances["C2"]["E1"] == 7
    assert not fw.sommets_sur_circuit_absorbant


def test_chemin_reconstruit(routes):
    chemin = chemins.reconstruire_chemin(chemins.dijkstra(routes, "C1"), "Q4")
    assert chemin.sommets == ["C1", "Q1", "H1", "E1", "T1", "C2", "Q4"]
    assert chemin.duree == 28
    assert chemin.nb_arcs == 6


def test_heure_de_pointe(routes_pointe):
    r = chemins.dijkstra(routes_pointe, "C1")
    assert r.distances["Q4"] == 39


def test_scenario_S1_fermeture_Q1_H1(routes):
    g = routes.copie()
    g.retirer_arc("Q1", "H1")
    g.retirer_arc("H1", "Q1")
    r = chemins.dijkstra(g, "C1")
    assert r.distances["H1"] == 11
    assert r.distances["Q4"] == 29
    # C2 ne peut plus atteindre l'ouest : H1 -> Q1 était le seul passage
    r2 = chemins.dijkstra(g, "C2")
    assert r2.distances["Q1"] == math.inf
    assert routes.a_arc("Q1", "H1")  # l'original est intact


def test_dijkstra_refuse_les_poids_negatifs(absorbant_accessible):
    with pytest.raises(ValueError):
        chemins.dijkstra(absorbant_accessible, "S")


def test_absorbant_accessible_bellman_ford(absorbant_accessible):
    r = chemins.bellman_ford(absorbant_accessible, "S")
    assert r.circuit_absorbant
    for s in ("A", "B", "C", "D"):
        assert r.distances[s] == -math.inf
    assert chemins.reconstruire_chemin(r, "D") is None


def test_absorbant_non_accessible_bellman_ford(absorbant_non_accessible):
    r = chemins.bellman_ford(absorbant_non_accessible, "S")
    assert not r.circuit_absorbant
    assert r.distances["B"] == 5
    assert r.distances["C"] == math.inf


def test_absorbant_floyd_warshall(absorbant_accessible, absorbant_non_accessible):
    assert chemins.floyd_warshall(absorbant_accessible).sommets_sur_circuit_absorbant == {"A", "B", "C"}
    assert chemins.floyd_warshall(absorbant_non_accessible).sommets_sur_circuit_absorbant == {"C", "D", "E"}
