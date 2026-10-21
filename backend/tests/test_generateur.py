"""Le générateur produit des fichiers valides et toujours les mêmes pour une même graine."""

from novapolis import donnees, generateur


def _charger(dossier):
    sites = donnees.charger_sites(dossier / "sites.csv")
    routes = donnees.charger_routes(dossier / "routes.csv", sites)
    fibre = donnees.charger_fibre(dossier / "fibre.csv", sites)
    return sites, routes, fibre


def test_ville_100_sites_valide(tmp_path):
    generateur.generer_ville(tmp_path, graine=42)
    sites, routes, fibre = _charger(tmp_path)
    assert len(sites) == 100
    assert sum(1 for s in sites.values() if s["type"] == "caserne") == 4
    assert routes.nb_arcs > 150
    assert fibre.nb_arcs > 150
    for d in donnees.charger_demandes(tmp_path / "demandes.csv"):
        assert d.origine in sites


def test_ville_reproductible(tmp_path):
    generateur.generer_ville(tmp_path / "a", graine=7)
    generateur.generer_ville(tmp_path / "b", graine=7)
    for nom in ["sites.csv", "routes.csv", "fibre.csv", "demandes.csv", "scenarios.csv"]:
        assert (tmp_path / "a" / nom).read_text(encoding="utf-8") == (tmp_path / "b" / nom).read_text(encoding="utf-8")


def test_aleatoire_taille_et_connexite(tmp_path):
    generateur.generer_aleatoire(tmp_path, n=300, degre=3, graine=1)
    sites, routes, _ = _charger(tmp_path)
    assert len(sites) == 300
    # la chaîne aléatoire garantit que tout est relié : parcours simple depuis un sommet
    depart = next(iter(sites))
    vus, pile = {depart}, [depart]
    while pile:
        for v, _ in routes.voisins(pile.pop()):
            if v not in vus:
                vus.add(v)
                pile.append(v)
    assert len(vus) == 300