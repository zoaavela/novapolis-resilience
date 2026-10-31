"""Tests du module 5. Scénario S1 de la petite ville : docs/PETIT_GRAPHE.md"""

import math
from pathlib import Path

import pytest
from novapolis import chemins, donnees, indicateurs, scenarios
from novapolis.indicateurs import ImpactDemande

PETIT = Path(__file__).resolve().parents[2] / "data" / "petit"


def temps_par_site(graphe, casernes=("C1", "C2")):
    """(temps de la caserne la plus proche, cette caserne) pour chaque site."""
    meilleur = {s: (math.inf, None) for s in graphe.sommets()}
    for c in casernes:
        for s, d in chemins.dijkstra(graphe, c).distances.items():
            if d < meilleur[s][0]:
                meilleur[s] = (d, c)
    return meilleur


@pytest.fixture
def impacts_S1(routes):
    actions = donnees.charger_scenarios(PETIT / "scenarios.csv")["S1"]
    avant = temps_par_site(routes)
    apres = temps_par_site(scenarios.appliquer(routes, actions, "routes"))
    return indicateurs.comparer(
        {s: t for s, (t, _) in avant.items()},
        {s: t for s, (t, _) in apres.items()},
        donnees.charger_demandes(PETIT / "demandes.csv"),
        {s: c for s, (_, c) in apres.items()},
    )


def test_comparer_une_ligne_par_demande(impacts_S1):
    assert [i.demande for i in impacts_S1] == ["D1", "D2", "D3", "D4", "D5"]
    d5 = impacts_S1[4]
    assert (d5.site, d5.caserne, d5.avant, d5.apres) == ("H1", "C1", 10, 11)
    assert d5.retard == 1
    assert d5.retard_relatif == pytest.approx(0.1)
    assert d5.statut == "retard"


def test_Q5_toujours_inaccessible(impacts_S1):
    d4 = impacts_S1[3]
    assert d4.caserne is None
    assert not d4.accessible and not d4.devenue_inaccessible
    assert d4.statut == "toujours inaccessible"


def test_resumer_S1(impacts_S1):
    r = indicateurs.resumer(impacts_S1)
    assert r.nb_demandes == 5
    assert r.nb_inaccessibles == 1
    assert r.nb_devenues_inaccessibles == 0
    assert r.nb_retardees == 1
    assert r.retard_moyen == pytest.approx(0.25)
    assert r.retard_max == 1
    assert r.retard_relatif_max == pytest.approx(0.1)


def test_comparer_sans_demandes():
    impacts = indicateurs.comparer({"D1": 5, "D2": 8}, {"D1": 7, "D2": math.inf})
    assert [(i.demande, i.retard) for i in impacts] == [("D1", 2), ("D2", math.inf)]
    assert impacts[1].statut == "devenu inaccessible"
    r = indicateurs.resumer(impacts)
    assert r.nb_devenues_inaccessibles == 1
    assert r.retard_moyen == 2


@pytest.mark.parametrize(
    ("avant", "apres", "retard", "relatif", "statut"),
    [
        (10, 10, 0, 0, "inchangé"),
        (10, 15, 5, 0.5, "retard"),
        (10, 8, -2, -0.2, "amélioré"),
        (10, math.inf, math.inf, math.inf, "devenu inaccessible"),
        (math.inf, math.inf, 0, 0, "toujours inaccessible"),
        (0, 0, 0, 0, "inchangé"),
    ],
)
def test_cas_limites(avant, apres, retard, relatif, statut):
    i = ImpactDemande("D", "S", "C1", avant, apres)
    assert i.retard == retard
    assert i.retard_relatif == pytest.approx(relatif)
    assert i.statut == statut


def test_resumer_liste_vide():
    r = indicateurs.resumer([])
    assert (r.nb_demandes, r.retard_moyen, r.retard_max) == (0, 0, 0)
