"""Module 2 et 3 : plus courts chemins.

Dijkstra : Enzo. Bellman-Ford, Floyd-Warshall et circuits absorbants : Elio.
Formats de sortie : voir resultats.py.
"""

from __future__ import annotations

import heapq
import math
from collections import deque
from itertools import pairwise

from .graphe import Graphe
from .resultats import Chemin, ResultatChemins, ResultatCircuit, ResultatToutesPaires


def dijkstra(graphe: Graphe, source: str) -> ResultatChemins:
    """Dijkstra avec tas binaire (heapq). Poids négatifs interdits :
    lever ValueError si le graphe en contient.

    Principe : on fixe les sommets un par un, toujours le plus proche pas
    encore fixé. Une fois fixé, sa distance ne peut plus baisser, car tous les
    poids sont positifs : passer par un autre sommet ne peut que rallonger.
    C'est exactement pour ça que Dijkstra refuse les poids négatifs.

    Le tas binaire donne le sommet le plus proche en O(log V).
    Complexité : O((V + E) log V).
    """
    if any(w < 0 for _, _, w in graphe.arcs()):
        raise ValueError("Dijkstra ne gère pas les poids négatifs : utiliser Bellman-Ford.")

    distances = {s: math.inf for s in graphe.sommets()}  # tout est inconnu
    predecesseurs: dict[str, str | None] = {s: None for s in graphe.sommets()}
    distances[source] = 0
    tas = [(0.0, source)]  # (distance provisoire, sommet)
    fixes: set[str] = set()

    while tas:
        d, u = heapq.heappop(tas)  # le plus proche pas encore fixé
        if u in fixes:  # entrée périmée : u a déjà été fixé plus court
            continue
        fixes.add(u)
        for v, w in graphe.voisins(u):
            nouvelle = d + w
            if nouvelle < distances[v]:  # on a trouvé mieux pour v
                distances[v] = nouvelle
                predecesseurs[v] = u
                heapq.heappush(tas, (nouvelle, v))

    return ResultatChemins(source=source, distances=distances, predecesseurs=predecesseurs)


def bellman_ford(graphe: Graphe, source: str) -> ResultatChemins:
    """Bellman-Ford. Met circuit_absorbant=True si un circuit absorbant est
    accessible depuis la source, et -math.inf pour les sommets dont la
    distance peut diminuer sans fin.

    Principe : on relâche tous les arcs, V - 1 fois. Un plus court chemin sans
    circuit a au plus V - 1 arcs, donc après le passage k toutes les distances
    des chemins de k arcs sont justes. Contrairement à Dijkstra, aucun sommet
    n'est fixé définitivement, c'est ce qui permet les poids négatifs.

    Arrêt anticipé : si un passage ne change plus rien, les distances sont
    définitives et on s'arrête. Le pire cas ne change pas, mais sur un réseau
    routier il suffit de quelques passages.

    Circuit absorbant : si un V-ième passage améliore encore un arc, son
    extrémité est touchée par un circuit de poids négatif. Tout ce qu'on
    atteint depuis elle peut aussi diminuer sans fin : on propage -inf par
    un parcours en largeur.

    Complexité : O(V × E) dans le pire cas.
    """
    distances = {s: math.inf for s in graphe.sommets()}
    predecesseurs: dict[str, str | None] = {s: None for s in graphe.sommets()}
    distances[source] = 0
    arcs = _arcs_orientes(graphe)

    for _ in range(graphe.nb_sommets - 1):
        modifie = False
        for u, v, w in arcs:
            if distances[u] + w < distances[v]:  # inf + w reste inf, jamais choisi
                distances[v] = distances[u] + w
                predecesseurs[v] = u
                modifie = True
        if not modifie:
            return ResultatChemins(source, distances, predecesseurs)

    instables = deque(v for u, v, w in arcs if distances[u] + w < distances[v])
    if not instables:
        return ResultatChemins(source, distances, predecesseurs)

    while instables:  # propagation de -inf à tout ce qui suit le circuit
        u = instables.popleft()
        if distances[u] == -math.inf:
            continue
        distances[u] = -math.inf
        instables.extend(v for v, _ in graphe.voisins(u) if distances[v] != -math.inf)
    return ResultatChemins(source, distances, predecesseurs, circuit_absorbant=True)


def floyd_warshall(graphe: Graphe) -> ResultatToutesPaires:
    """Floyd-Warshall, toutes paires. O(V³) : petits graphes seulement.

    Principe : programmation dynamique sur les sommets intermédiaires. Après
    l'étape k, d[i][j] est le plus court chemin de i à j qui n'utilise comme
    étapes que les k premiers sommets. On teste à chaque fois si passer par k
    raccourcit : d[i][j] = min(d[i][j], d[i][k] + d[k][j]).

    On travaille sur une matrice indexée par entiers, plus rapide qu'un
    dictionnaire dans la triple boucle. succ[i][j] garde le premier sommet
    après i sur le chemin i -> j, ce qui permet de reconstruire les chemins.

    Circuit absorbant : d[i][i] < 0 signifie qu'on revient sur i en ayant
    diminué, donc i est sur un circuit absorbant. Pour chaque tel sommet k,
    toute paire (i, j) avec i -> k et k -> j possibles vaut -inf.

    Complexité : O(V³) en temps, O(V²) en mémoire.
    """
    sommets = graphe.sommets()
    n = len(sommets)
    indice = {s: i for i, s in enumerate(sommets)}
    d = [[math.inf] * n for _ in range(n)]
    succ: list[list[int | None]] = [[None] * n for _ in range(n)]
    for i in range(n):
        d[i][i] = 0
        succ[i][i] = i
    for u, v, w in _arcs_orientes(graphe):
        i, j = indice[u], indice[v]
        if w < d[i][j]:
            d[i][j] = w
            succ[i][j] = j

    for k in range(n):
        dk = d[k]
        for i in range(n):
            dik = d[i][k]
            if dik == math.inf:  # i n'atteint pas k : rien à gagner
                continue
            di, si = d[i], succ[i]
            for j in range(n):
                if dik + dk[j] < di[j]:
                    di[j] = dik + dk[j]
                    si[j] = si[k]

    sur_circuit = [k for k in range(n) if d[k][k] < 0]
    for k in sur_circuit:
        for i in range(n):
            if d[i][k] == math.inf:
                continue
            for j in range(n):
                if d[k][j] != math.inf:
                    d[i][j] = -math.inf

    return ResultatToutesPaires(
        distances={sommets[i]: {sommets[j]: d[i][j] for j in range(n)} for i in range(n)},
        successeurs={
            sommets[i]: {
                sommets[j]: None if succ[i][j] is None else sommets[succ[i][j]] for j in range(n)
            }
            for i in range(n)
        },
        sommets_sur_circuit_absorbant={sommets[k] for k in sur_circuit},
    )


def trouver_circuit_absorbant(graphe: Graphe) -> list[str] | None:
    """Un circuit absorbant du graphe, où qu'il soit, ou None.

    Bellman-Ford depuis une seule source ne voit pas un circuit qu'elle
    n'atteint pas. On fait donc comme s'il existait une source fictive reliée
    à tous les sommets par un arc de poids 0 : toutes les distances partent
    de 0. S'il reste un arc relâchable au V-ième passage, un circuit existe.

    Pour l'extraire, on remonte V fois les prédécesseurs depuis le dernier
    sommet relâché : on est alors forcément dans le circuit. On suit ensuite
    les prédécesseurs jusqu'à revenir au même sommet.

    Complexité : O(V × E).
    """
    distances = {s: 0.0 for s in graphe.sommets()}
    predecesseurs: dict[str, str | None] = {s: None for s in graphe.sommets()}
    arcs = _arcs_orientes(graphe)
    dernier = None
    for _ in range(graphe.nb_sommets):
        dernier = None
        for u, v, w in arcs:
            if distances[u] + w < distances[v]:
                distances[v] = distances[u] + w
                predecesseurs[v] = u
                dernier = v
        if dernier is None:
            return None

    sommet = dernier
    for _ in range(graphe.nb_sommets):
        sommet = predecesseurs[sommet]
    circuit = [sommet]
    courant = predecesseurs[sommet]
    while courant != sommet:
        circuit.append(courant)
        courant = predecesseurs[courant]
    circuit.append(sommet)
    circuit.reverse()
    return circuit


def diagnostiquer_circuit(graphe: Graphe, source: str | None = None) -> ResultatCircuit:
    """Module 3 : un circuit absorbant existe-t-il, et la source l'atteint-elle ?

    Deux questions différentes. L'existence se teste sur tout le graphe avec
    ``trouver_circuit_absorbant``. L'accessibilité se lit sur Bellman-Ford
    lancé depuis la source. Un circuit peut exister sans être accessible :
    les distances depuis la source restent alors finies et justes.
    """
    if source is not None:
        resultat = bellman_ford(graphe, source)
        if resultat.circuit_absorbant:
            atteints = {s for s, d in resultat.distances.items() if d != math.inf}
            circuit = trouver_circuit_absorbant(_sous_graphe(graphe, atteints))
            non_bornes = {s for s, d in resultat.distances.items() if d == -math.inf}
            return ResultatCircuit(True, circuit, _poids(graphe, circuit), source, True, non_bornes)

    circuit = trouver_circuit_absorbant(graphe)
    if circuit is None:
        return ResultatCircuit(False, None, None, source, None if source is None else False)
    return ResultatCircuit(
        True, circuit, _poids(graphe, circuit), source, None if source is None else False
    )


def _sous_graphe(graphe: Graphe, garder: set[str]) -> Graphe:
    """Copie restreinte aux sommets atteints depuis la source."""
    g = Graphe(oriente=graphe.oriente)
    for s in graphe.sommets():
        if s in garder:
            g.ajouter_sommet(s, **graphe.infos(s))
    for u, v, w in graphe.arcs():
        if u in garder and v in garder:
            g.ajouter_arc(u, v, w)
    return g


def _poids(graphe: Graphe, circuit: list[str]) -> float:
    return sum(graphe.poids(a, b) for a, b in pairwise(circuit))


def _arcs_orientes(graphe: Graphe) -> list[tuple[str, str, float]]:
    """Tous les arcs dans le sens où on peut les parcourir.

    Un graphe non orienté ne donne chaque arête qu'une fois avec arcs() :
    on ajoute le sens inverse.
    """
    arcs = list(graphe.arcs())
    if not graphe.oriente:
        arcs += [(v, u, w) for u, v, w in arcs]
    return arcs


def reconstruire_chemin(resultat: ResultatChemins, cible: str) -> Chemin | None:
    """Chemin source -> cible à partir des prédécesseurs. None si inatteignable
    ou si la distance n'est pas finie (circuit absorbant)."""
    d = resultat.distances.get(cible, math.inf)
    if not math.isfinite(d):
        return None
    sommets = [cible]
    while sommets[-1] != resultat.source:
        precedent = resultat.predecesseurs.get(sommets[-1])
        if precedent is None or len(sommets) > len(resultat.distances):
            return None
        sommets.append(precedent)
    sommets.reverse()
    return Chemin(sommets=sommets, duree=d)
