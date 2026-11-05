"""Module 4 : réseau de fibre (Max)."""

from __future__ import annotations
import heapq

from .graphe import Graphe
from .resultats import ResultatArbre


class UnionFind:
    """Structure union-find avec compression de chemin et union par rang."""

    def __init__(self, elements: list[str]) -> None:
        self.parent = {x: x for x in elements}
        self.rang = {x: 0 for x in elements}

    def trouver(self, x: str) -> str:
        if self.parent[x] != x:
            self.parent[x] = self.trouver(self.parent[x])
        return self.parent[x]

    def unir(self, x: str, y: str) -> bool:
        """Fusionne les ensembles de x et y. False s'ils étaient déjà ensemble."""
        chef_x = self.trouver(x)
        chef_y = self.trouver(y)
        if chef_x == chef_y:
            return False
        if self.rang[chef_x] < self.rang[chef_y]:
            chef_x, chef_y = chef_y, chef_x
        self.parent[chef_y] = chef_x
        if self.rang[chef_x] == self.rang[chef_y]:
            self.rang[chef_x] += 1
        return True


def kruskal(graphe: Graphe) -> ResultatArbre:
    """Arbre (ou forêt) couvrant minimal par Kruskal."""
    sommets = graphe.sommets()
    uf = UnionFind(sommets)

    aretes_triees = sorted(graphe.arcs(), key=lambda arete: arete[2])

    aretes_choisies = []
    cout_total = 0.0
    for u, v, cout in aretes_triees:
        if uf.unir(u, v):
            aretes_choisies.append((u, v, cout))
            cout_total += cout
            if len(aretes_choisies) == len(sommets) - 1:
                break

    groupes = {}
    for s in sommets:
        chef = uf.trouver(s)
        if chef not in groupes:
            groupes[chef] = set()
        groupes[chef].add(s)
    composantes = list(groupes.values())

    return ResultatArbre(aretes_choisies, cout_total, composantes)


def prim(graphe: Graphe) -> ResultatArbre:
    """Arbre (ou forêt) couvrant minimal par Prim avec tas binaire.
    Si le graphe n'est pas connexe, relancer depuis un sommet non couvert."""
    visites = set()
    aretes_choisies = []
    cout_total = 0.0
    composantes = []

    for depart in graphe.sommets():
        if depart in visites:
            continue

        composante = {depart}
        visites.add(depart)
        tas = []
        for voisin, cout in graphe.voisins(depart):
            heapq.heappush(tas, (cout, depart, voisin))

        while tas:
            cout, u, v = heapq.heappop(tas)
            if v in visites:
                continue
            visites.add(v)
            composante.add(v)
            aretes_choisies.append((u, v, cout))
            cout_total += cout
            for voisin, c in graphe.voisins(v):
                if voisin not in visites:
                    heapq.heappush(tas, (c, v, voisin))

        composantes.append(composante)

    return ResultatArbre(aretes_choisies, cout_total, composantes)


def reparer_panne(
    graphe: Graphe, arbre: ResultatArbre, u: str, v: str
) -> tuple[str, str, float] | None:
    """Le tronçon u-v de l'arbre tombe en panne. Renvoie l'arête disponible
    la moins chère du graphe initial qui recolle les deux morceaux, ou None."""
    voisins_arbre = {}
    trouve = False
    for a, b, _ in arbre.aretes:
        if {a, b} == {u, v}:
            trouve = True
            continue
        voisins_arbre.setdefault(a, []).append(b)
        voisins_arbre.setdefault(b, []).append(a)
    if not trouve:
        raise ValueError(f"Le tronçon {u}-{v} ne fait pas partie de l'arbre.")

    def morceau(depart):
        vus = {depart}
        a_traiter = [depart]
        while a_traiter:
            s = a_traiter.pop()
            for t in voisins_arbre.get(s, []):
                if t not in vus:
                    vus.add(t)
                    a_traiter.append(t)
        return vus

    cote_u = morceau(u)
    cote_v = morceau(v)

    meilleure = None
    for a, b, cout in graphe.arcs():
        if {a, b} == {u, v}:
            continue
        relie = (a in cote_u and b in cote_v) or (a in cote_v and b in cote_u)
        if relie and (meilleure is None or cout < meilleure[2]):
            meilleure = (a, b, cout)
    return meilleure
