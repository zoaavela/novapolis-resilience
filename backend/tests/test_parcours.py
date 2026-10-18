"""Tests du module 1. Valeurs attendues : docs/PETIT_GRAPHE.md"""

from novapolis import parcours


def test_bfs_depuis_C1(routes):
    assert parcours.bfs(routes, ["C1"]) == {
        "C1": 0, "Q1": 1, "Q2": 1, "H1": 2, "Q3": 2,
        "E1": 3, "T1": 4, "C2": 5, "Q4": 6,
    }


def test_bfs_multi_sources(routes):
    niveaux = parcours.bfs(routes, ["C1", "C2"])
    assert niveaux["T1"] == 1
    assert niveaux["E1"] == 2
    assert "Q5" not in niveaux


def test_bfs_chemin_nombre_minimal_d_arcs(routes):
    chemin = parcours.bfs_chemin(routes, "C1", "Q4")
    assert chemin[0] == "C1" and chemin[-1] == "Q4"
    assert len(chemin) - 1 == 6  # deux chemins possibles, même longueur


def test_q5_inatteignable(routes):
    assert parcours.non_atteignables(routes, ["C1", "C2"]) == {"Q5"}
    assert parcours.bfs_chemin(routes, "C1", "Q5") is None


def test_cycle_oriente(routes):
    assert parcours.a_cycle_oriente(routes)  # C1 -> Q1 -> C1


def test_fibre_une_seule_composante(fibre):
    assert len(parcours.composantes_connexes(fibre)) == 1
