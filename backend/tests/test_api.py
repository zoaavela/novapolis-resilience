"""L'API renvoie les bons résultats sur la petite ville (docs/PETIT_GRAPHE.md)."""

import pytest
from api.main import app
from fastapi.testclient import TestClient

client = TestClient(app)


def post(chemin, corps):
    r = client.post(chemin, json=corps)
    if r.status_code == 501:  
        pytest.skip("partie pas encore écrite")
    return r


def test_health():
    assert client.get("/health").json() == {"status": "ok"}


def test_reseau_petit():
    r = client.get("/reseau?jeu=petit").json()
    assert len(r["sites"]) == 10
    assert {"id", "nom", "type", "x", "y"} <= set(r["sites"][0])
    assert r["scenarios"][0]["id"] == "S0"


def test_reseau_ville():
    assert len(client.get("/reseau?jeu=ville").json()["sites"]) == 100


def test_jeu_inconnu_refuse():
    # liste fermée : impossible de demander un autre dossier
    assert client.get("/reseau?jeu=../../etc").status_code == 422


def test_itineraire_c1_q4():
    r = post("/itineraire", {"source": "C1", "cible": "Q4"}).json()
    assert r["accessible"] is True
    assert r["duree"] == 28
    assert r["chemin"][0] == "C1" and r["chemin"][-1] == "Q4"


def test_itineraire_q5_inaccessible():
    r = post("/itineraire", {"source": "C1", "cible": "Q5"}).json()
    assert r == {"accessible": False, "chemin": None, "duree": None, "nb_arcs": 0, "algo": "dijkstra"}


def test_site_inconnu():
    assert client.post("/itineraire", json={"source": "C1", "cible": "ZZ"}).status_code == 404


def test_accessibilite():
    r = post("/accessibilite", {"sources": ["C1"]}).json()
    assert r["niveaux"]["C1"] == 0
    assert "Q5" in r["non_atteints"]


def test_heure_de_pointe():
    r = post("/itineraire", {"scenario": "S3", "source": "C1", "cible": "Q1"}).json()
    assert r["duree"] == 6


def test_scenario_s1():
    r = post("/scenario", {"scenario": "S1"}).json()
    d5 = next(d for d in r["demandes"] if d["id"] == "D5")
    assert (d5["avant"], d5["apres"]) == (10, 11)


def test_fibre_panne():
    r = post("/fibre", {"panne": ["H1", "E1"]}).json()
    assert r["cout_total"] == 32
    assert r["nouveau_cout"] == 33


def test_itineraire_floyd_identique_a_dijkstra():
    for algo in ["dijkstra", "floyd-warshall"]:
        r = post("/itineraire", {"source": "C1", "cible": "Q4", "algo": algo}).json()
        assert r["duree"] == 28
        assert r["chemin"][0] == "C1" and r["chemin"][-1] == "Q4"