"""Le banc de mesures tourne et produit ses fichiers (version courte)."""

from novapolis import benchmarks


def test_benchmark_rapide(tmp_path):
    r = benchmarks.lancer(tmp_path, repetitions=2, rapide=True)
    assert (tmp_path / "resultats.json").exists()
    for nom in ["1_taille.png", "2_densite.png", "3_floyd.png"]:
        assert (tmp_path / nom).stat().st_size > 0
    algos = {m["algo"] for m in r["taille"]}
    assert algos == set(benchmarks.ALGOS)
    assert all(m["moyenne_ms"] >= 0 for m in r["taille"])
