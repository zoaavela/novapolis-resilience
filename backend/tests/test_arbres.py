"""Tests du module 4. Valeurs attendues : docs/PETIT_GRAPHE.md"""

import pytest
from novapolis import arbres


@pytest.mark.parametrize("algo", [arbres.kruskal, arbres.prim])
def test_cout_minimal(fibre, algo):
    r = algo(fibre)
    assert r.cout_total == 32
    assert len(r.aretes) == 9  # 10 sites -> 9 arêtes
    assert len(r.composantes) == 1


def test_egalite_de_couts(fibre):
    """Q1-H1 et Q3-H1 coûtent 4 : deux arbres minimaux différents existent."""
    aretes = {frozenset((u, v)) for u, v, _ in arbres.kruskal(fibre).aretes}
    assert (frozenset(("Q1", "H1")) in aretes) != (frozenset(("Q3", "H1")) in aretes)


def test_union_find():
    uf = arbres.UnionFind(["A", "B", "C"])
    assert uf.unir("A", "B")
    assert not uf.unir("B", "A")
    assert uf.trouver("A") == uf.trouver("B") != uf.trouver("C")


def test_panne_H1_E1(fibre):
    arbre = arbres.kruskal(fibre)
    reparation = arbres.reparer_panne(fibre, arbre, "H1", "E1")
    u, v, cout = reparation
    assert {u, v} == {"Q3", "E1"}
    assert cout == 7
