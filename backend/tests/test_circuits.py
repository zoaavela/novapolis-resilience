"""Module 3 : détection des circuits absorbants."""

from itertools import pairwise

from novapolis import chemins


def poids_du_circuit(graphe, circuit):
    return sum(graphe.poids(a, b) for a, b in pairwise(circuit))


def test_circuit_accessible(absorbant_accessible):
    r = chemins.diagnostiquer_circuit(absorbant_accessible, "S")
    assert r.existe and r.accessible_depuis_source
    assert set(r.circuit) == {"A", "B", "C"}
    assert r.circuit[0] == r.circuit[-1]
    assert r.poids == -1 == poids_du_circuit(absorbant_accessible, r.circuit)
    assert r.sommets_non_bornes == {"A", "B", "C", "D"}


def test_circuit_non_accessible(absorbant_non_accessible):
    r = chemins.diagnostiquer_circuit(absorbant_non_accessible, "S")
    assert r.existe
    assert r.accessible_depuis_source is False
    assert set(r.circuit) == {"C", "D", "E"}
    assert r.sommets_non_bornes == set()


def test_meme_circuit_accessible_depuis_un_de_ses_sommets(absorbant_non_accessible):
    assert chemins.diagnostiquer_circuit(absorbant_non_accessible, "C").accessible_depuis_source


def test_existence_sans_source(absorbant_non_accessible):
    r = chemins.diagnostiquer_circuit(absorbant_non_accessible)
    assert r.existe and r.accessible_depuis_source is None


def test_aucun_circuit_sur_le_petit_graphe(routes):
    assert chemins.trouver_circuit_absorbant(routes) is None
    r = chemins.diagnostiquer_circuit(routes, "C1")
    assert not r.existe and r.circuit is None
