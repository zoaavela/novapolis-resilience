"""Bellman-Ford et Floyd-Warshall : cas limites et cohérence avec Dijkstra."""

import math
import random

import pytest
from novapolis import chemins
from novapolis.graphe import Graphe


def test_poids_negatifs_sans_circuit():
    g = Graphe(oriente=True)
    for s in "SABC":
        g.ajouter_sommet(s)
    for u, v, w in [("S", "A", 4), ("S", "B", 2), ("B", "A", -1), ("A", "C", 3)]:
        g.ajouter_arc(u, v, w)
    attendu = {"S": 0, "A": 1, "B": 2, "C": 4}
    r = chemins.bellman_ford(g, "S")
    assert r.distances == attendu
    assert not r.circuit_absorbant
    assert chemins.reconstruire_chemin(r, "C").sommets == ["S", "B", "A", "C"]
    assert chemins.floyd_warshall(g).distances["S"] == attendu
    with pytest.raises(ValueError):
        chemins.dijkstra(g, "S")


def test_floyd_warshall_moins_infini(absorbant_accessible):
    fw = chemins.floyd_warshall(absorbant_accessible)
    assert fw.distances["S"]["D"] == -math.inf
    assert fw.distances["S"]["S"] == 0
    assert fw.distances["S"]["E"] == math.inf


def test_successeurs_floyd_warshall(routes):
    fw = chemins.floyd_warshall(routes)
    sommets, u = ["C1"], "C1"
    while u != "Q4":
        u = fw.successeurs[u]["Q4"]
        sommets.append(u)
    assert sommets == ["C1", "Q1", "H1", "E1", "T1", "C2", "Q4"]
    assert fw.successeurs["C1"]["Q5"] is None


def test_graphe_non_oriente(fibre):
    assert chemins.bellman_ford(fibre, "C1").distances == chemins.dijkstra(fibre, "C1").distances
    assert chemins.floyd_warshall(fibre).distances["C1"] == chemins.dijkstra(fibre, "C1").distances


def graphe_aleatoire(n, m, graine):
    alea = random.Random(graine)
    g = Graphe(oriente=True)
    for i in range(n):
        g.ajouter_sommet(f"S{i}")
    while g.nb_arcs < m:
        u, v = alea.sample(range(n), 2)
        if not g.a_arc(f"S{u}", f"S{v}"):
            g.ajouter_arc(f"S{u}", f"S{v}", alea.randint(1, 50))
    return g


@pytest.mark.parametrize("graine", range(10))
def test_trois_algorithmes_identiques(graine):
    g = graphe_aleatoire(40, 160, graine)
    fw = chemins.floyd_warshall(g)
    for source in ("S0", "S7"):
        d = chemins.dijkstra(g, source).distances
        assert chemins.bellman_ford(g, source).distances == d
        assert fw.distances[source] == d
