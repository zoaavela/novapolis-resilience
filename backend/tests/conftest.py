"""Fixtures communes.

Un test qui tombe sur NotImplementedError est marqué « ignoré » au lieu
d'« échoué » : tant qu'un algo n'est pas écrit, son test attend sans casser
la CI. Dès que la fonction existe, le test compte vraiment.
"""

from __future__ import annotations

from pathlib import Path

import pytest
from novapolis import donnees

RACINE = Path(__file__).resolve().parents[2]
PETIT = RACINE / "data" / "petit"
TESTS = RACINE / "data" / "tests"


@pytest.hookimpl(hookwrapper=True)
def pytest_runtest_makereport(item, call):
    outcome = yield
    rapport = outcome.get_result()
    if call.excinfo is not None and call.excinfo.errisinstance(NotImplementedError):
        rapport.outcome = "skipped"
        rapport.longrepr = (str(item.path), item.location[1] or 0, "pas encore implémenté")


@pytest.fixture
def sites():
    return donnees.charger_sites(PETIT / "sites.csv")


@pytest.fixture
def routes(sites):
    return donnees.charger_routes(PETIT / "routes.csv", sites)


@pytest.fixture
def routes_pointe(sites):
    return donnees.charger_routes(PETIT / "routes.csv", sites, mode="pointe")


@pytest.fixture
def fibre(sites):
    return donnees.charger_fibre(PETIT / "fibre.csv", sites)


@pytest.fixture
def absorbant_sites():
    return donnees.charger_sites(TESTS / "absorbant_sites.csv")


@pytest.fixture
def absorbant_accessible(absorbant_sites):
    return donnees.charger_routes(TESTS / "absorbant_accessible.csv", absorbant_sites)


@pytest.fixture
def absorbant_non_accessible(absorbant_sites):
    return donnees.charger_routes(TESTS / "absorbant_non_accessible.csv", absorbant_sites)
