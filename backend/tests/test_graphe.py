import pytest
from novapolis.graphe import Graphe, SiteInconnuError


def test_oriente_un_seul_sens():
    g = Graphe(oriente=True)
    g.ajouter_sommet("A")
    g.ajouter_sommet("B")
    g.ajouter_arc("A", "B", 3)
    assert g.a_arc("A", "B")
    assert not g.a_arc("B", "A")
    assert g.voisins("A") == [("B", 3.0)]


def test_non_oriente_deux_sens_compte_une_fois():
    g = Graphe(oriente=False)
    for s in "ABC":
        g.ajouter_sommet(s)
    g.ajouter_arc("A", "B", 2)
    g.ajouter_arc("B", "C", 5)
    assert g.a_arc("B", "A")
    assert g.nb_arcs == 2


def test_site_inconnu_rejete():
    g = Graphe(oriente=True)
    g.ajouter_sommet("A")
    with pytest.raises(SiteInconnuError):
        g.ajouter_arc("A", "Z", 1)


def test_copie_ne_touche_pas_l_original():
    g = Graphe(oriente=True)
    g.ajouter_sommet("A")
    g.ajouter_sommet("B")
    g.ajouter_arc("A", "B", 1)
    c = g.copie()
    c.retirer_arc("A", "B")
    assert g.a_arc("A", "B")
    assert not c.a_arc("A", "B")


def test_chargement_petit_graphe(routes, fibre):
    assert routes.nb_sommets == 10
    assert routes.nb_arcs == 20  # 21 lignes, dont 1 route fermée
    assert not routes.a_arc("Q4", "T1")
    assert fibre.nb_arcs == 13  # 14 lignes, dont 1 tronçon indisponible
