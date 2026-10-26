"""Module 2 et 3 : plus courts chemins.

Dijkstra : Enzo. Bellman-Ford et Floyd-Warshall : Elio.
Formats de sortie : voir resultats.py.
"""

from __future__ import annotations

import heapq
import math
from collections import deque

from .graphe import Graphe
from .resultats import Chemin, ResultatChemins, ResultatToutesPaires


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
