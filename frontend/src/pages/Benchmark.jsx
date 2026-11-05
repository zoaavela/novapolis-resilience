// Page Benchmark : les mesures de performance du rapport, en graphiques.
// Les chiffres viennent de src/data/benchmarks.js, recopiés des mesures
// réelles. Tous les nombres affichés sont calculés à partir de ce fichier.

import { useTitre } from '../hooks.js';
import { MESURES } from '../data/benchmarks.js';
import Graphique from '../components/Graphique.jsx';
import { Tuile } from '../components/Blocs.jsx';

const COULEURS = {
  BFS: '#1d8ff2',
  DFS: '#7db9ec',
  Dijkstra: '#241b4b',
  'Bellman-Ford': '#d7262b',
  Kruskal: '#0a7a3b',
  Prim: '#d99a00',
};
const ALGOS = Object.keys(COULEURS);

const COMPLEXITES = {
  BFS: 'O(V + E)',
  DFS: 'O(V + E)',
  Dijkstra: 'O((V + E) log V)',
  'Bellman-Ford': 'O(V × E)',
  Kruskal: 'O(E log E)',
  Prim: 'O(E log V)',
};

// --- Lecture des mesures
const trouver = (liste, algo, cle, valeur) => liste.find((m) => m.algo === algo && m[cle] === valeur);
const tailles = [...new Set(MESURES.taille.map((m) => m.V))];
const petitV = 1000;
const grandV = tailles.at(-1);
const temps = (algo, V) => trouver(MESURES.taille, algo, 'V', V).ms;
const E = (V) => trouver(MESURES.taille, 'BFS', 'V', V).E;
const degres = [...new Set(MESURES.densite.map((m) => m.degre))];
const fw = MESURES.floyd.filter((m) => m.algo === 'Floyd-Warshall');
const dj1 = MESURES.floyd.filter((m) => m.algo === 'Dijkstra (1 source)');
const fwMax = fw.at(-1);

const ms = (v) => (v >= 1000 ? `${(v / 1000).toLocaleString('fr-FR', { maximumFractionDigits: 2 })} s` : `${v.toLocaleString('fr-FR', { maximumFractionDigits: 1 })} ms`);
const fois = (v) => `× ${v.toLocaleString('fr-FR', { maximumFractionDigits: 1 })}`;

// Rapport de temps attendu entre petitV et grandV selon la complexité.
const lnRatio = (a, b) => Math.log(b) / Math.log(a);
const rE = E(grandV) / E(petitV);
const ATTENDU = {
  BFS: rE,
  DFS: rE,
  Dijkstra: rE * lnRatio(petitV, grandV),
  'Bellman-Ford': (grandV / petitV) * rE,
  Kruskal: rE * lnRatio(E(petitV), E(grandV)),
  Prim: rE * lnRatio(petitV, grandV),
};

// --- Séries des trois graphiques (calculées une fois, hors du composant)
const SERIES_TAILLE = ALGOS.map((a) => ({
  nom: a,
  couleur: COULEURS[a],
  points: MESURES.taille.filter((m) => m.algo === a).map((m) => ({ x: m.V, y: m.ms, ecart: m.ecart })),
}));
const SERIES_DENSITE = ALGOS.map((a) => ({
  nom: a,
  couleur: COULEURS[a],
  points: MESURES.densite.filter((m) => m.algo === a).map((m) => ({ x: m.E, y: m.ms, ecart: m.ecart })),
}));
const c3 = fwMax.ms / fwMax.V ** 3; // courbe c × V³ calée sur le dernier point
const SERIES_FLOYD = [
  { nom: 'Floyd-Warshall, toutes les paires', couleur: '#d7262b', points: fw.map((m) => ({ x: m.V, y: m.ms, ecart: m.ecart })) },
  { nom: 'Dijkstra depuis chaque sommet', couleur: '#241b4b', points: dj1.map((m) => ({ x: m.V, y: m.ms * m.V })) },
  { nom: 'Dijkstra, une source', couleur: '#1d8ff2', points: dj1.map((m) => ({ x: m.V, y: m.ms, ecart: m.ecart })) },
  { nom: 'Courbe théorique c × V³', couleur: '#8a86a8', pointille: true, points: fw.map((m) => ({ x: m.V, y: c3 * m.V ** 3 })) },
];
const AXES_TAILLE = { x: { titre: 'Sommets V (échelle log)', log: true }, y: { titre: 'Temps en ms (log)', log: true } };
const AXES_DENSITE = { x: { titre: `Arcs E (V = ${MESURES.densite[0].V.toLocaleString('fr-FR')})` }, y: { titre: 'Temps en ms' } };
const AXES_FLOYD = { x: { titre: 'Sommets V' }, y: { titre: 'Temps en ms' } };

const d0 = (a) => trouver(MESURES.densite, a, 'degre', degres.at(0)).ms;
const d1 = (a) => trouver(MESURES.densite, a, 'degre', degres.at(-1)).ms;
const E0 = trouver(MESURES.densite, 'BFS', 'degre', degres.at(0)).E;
const E1 = trouver(MESURES.densite, 'BFS', 'degre', degres.at(-1)).E;
const fw100 = fw.find((m) => m.V === 100);

export default function Benchmark() {
  useTitre('Benchmark', 'Temps d’exécution mesurés des algorithmes de Novapolis selon la taille et la densité du graphe.');

  return (
    <div className="conteneur bench">
      <section className="panneau bench-tete" aria-labelledby="t-bench">
        <h1 id="t-bench">Benchmark</h1>
        <p className="bench-lead">
          À {grandV.toLocaleString('fr-FR')} sommets, Dijkstra calcule tous les trajets depuis une caserne en{' '}
          {ms(temps('Dijkstra', grandV))}. Floyd-Warshall met {ms(fwMax.ms)} pour {fwMax.V} sommets seulement.
        </p>
        <div className="tuiles bench-tuiles">
          <Tuile label={`BFS, ${grandV.toLocaleString('fr-FR')} sommets`} valeur={ms(temps('BFS', grandV))} />
          <Tuile label={`Dijkstra, ${grandV.toLocaleString('fr-FR')} sommets`} valeur={ms(temps('Dijkstra', grandV))} />
          <Tuile label={`Prim, ${grandV.toLocaleString('fr-FR')} sommets`} valeur={ms(temps('Prim', grandV))} />
          <Tuile label={`Floyd-Warshall, ${fwMax.V} sommets`} valeur={ms(fwMax.ms)} alerte />
        </div>
      </section>

      <section className="panneau bench-bloc" aria-labelledby="t-protocole">
        <h2 id="t-protocole" className="titre-panneau"><span className="puce" aria-hidden="true" />Comment on a mesuré</h2>
        <ul className="bench-liste">
          <li>Graphes générés avec la graine {MESURES.graine} : chaque sommet relié à ses plus proches voisins, une chaîne en plus pour que tout soit relié.</li>
          <li>Les mêmes graphes pour tous les algorithmes. Parcours et plus courts chemins sur les routes, Kruskal et Prim sur la fibre.</li>
          <li>On ne chronomètre que l’algorithme : la génération et la lecture des fichiers ont lieu avant.</li>
          <li>Un premier essai à vide, puis {MESURES.repetitions} mesures dont on affiche la moyenne. L’écart type apparaît au survol des points.</li>
        </ul>
        <p className="aide">Mesures faites sur un conteneur Linux avec Python 3.13. Sur une autre machine, les temps changent, les tendances non.</p>
      </section>

      <section className="panneau bench-bloc" aria-labelledby="t-taille">
        <h2 id="t-taille" className="titre-panneau"><span className="puce" aria-hidden="true" />Selon la taille du graphe</h2>
        <p className="bench-constat">
          Quatre fois plus de sommets, et à peine plus de quatre fois plus de temps : de {petitV.toLocaleString('fr-FR')} à{' '}
          {grandV.toLocaleString('fr-FR')} sommets, BFS passe de {ms(temps('BFS', petitV))} à {ms(temps('BFS', grandV))}.
        </p>
        <Graphique titre="Temps d'exécution selon le nombre de sommets" series={SERIES_TAILLE} axes={AXES_TAILLE} />
        <p className="aide">
          Degré 4 : chaque sommet a environ quatre voisins. Les deux échelles sont logarithmiques, donc des courbes parallèles
          signifient la même vitesse de croissance.
        </p>
      </section>

      <section className="panneau bench-bloc" aria-labelledby="t-densite">
        <h2 id="t-densite" className="titre-panneau"><span className="puce" aria-hidden="true" />Selon la densité</h2>
        <p className="bench-constat">
          Avec {fois(E1 / E0)} d’arcs, Kruskal ralentit le plus ({fois(d1('Kruskal') / d0('Kruskal'))}), parce qu’il trie
          toutes les arêtes avant de choisir. Dijkstra ne prend que {fois(d1('Dijkstra') / d0('Dijkstra'))}.
        </p>
        <Graphique titre="Temps d'exécution selon le nombre d'arcs" series={SERIES_DENSITE} axes={AXES_DENSITE} />
        <p className="aide">Toujours {MESURES.densite[0].V.toLocaleString('fr-FR')} sommets, de {degres.at(0)} à {degres.at(-1)} voisins par sommet.</p>
      </section>

      <section className="panneau bench-bloc" aria-labelledby="t-floyd">
        <h2 id="t-floyd" className="titre-panneau"><span className="puce" aria-hidden="true" />Floyd-Warshall et son V³</h2>
        <p className="bench-constat">
          Trois fois plus de sommets, {fois(fwMax.ms / fw100.ms)} plus de temps : de 100 à {fwMax.V} sommets, Floyd-Warshall
          passe de {ms(fw100.ms)} à {ms(fwMax.ms)}, proche du × 27 qu’annonce V³.
        </p>
        <Graphique titre="Floyd-Warshall face à une courbe en V au cube" series={SERIES_FLOYD} axes={AXES_FLOYD} />
        <p className="aide">
          Lancer Dijkstra depuis chacun des {fwMax.V} sommets donne le même résultat en {ms(dj1.at(-1).ms * fwMax.V)}.
          C’est pourquoi Floyd-Warshall est réservé aux petits graphes.
        </p>
      </section>

      <section className="panneau bench-bloc" aria-labelledby="t-theorie">
        <h2 id="t-theorie" className="titre-panneau"><span className="puce" aria-hidden="true" />Mesure contre théorie</h2>
        <p className="bench-constat">
          De {petitV.toLocaleString('fr-FR')} à {grandV.toLocaleString('fr-FR')} sommets, le temps grandit comme l’annonce
          la complexité, sauf pour Bellman-Ford, bien plus rapide que son pire cas.
        </p>
        <div className="tableau-boite">
          <table>
            <caption className="visuellement-cache">Rapport de temps mesuré et attendu</caption>
            <thead>
              <tr>
                <th scope="col">Algorithme</th>
                <th scope="col">Complexité</th>
                <th scope="col" className="nombre">{petitV.toLocaleString('fr-FR')} sommets</th>
                <th scope="col" className="nombre">{grandV.toLocaleString('fr-FR')} sommets</th>
                <th scope="col" className="nombre">Mesuré</th>
                <th scope="col" className="nombre">Attendu</th>
              </tr>
            </thead>
            <tbody>
              {ALGOS.map((a) => (
                <tr key={a}>
                  <td><span className="bench-pastille" style={{ background: COULEURS[a] }} aria-hidden="true" />{a}</td>
                  <td className="bench-complexite">{COMPLEXITES[a]}</td>
                  <td className="nombre">{ms(temps(a, petitV))}</td>
                  <td className="nombre">{ms(temps(a, grandV))}</td>
                  <td className="nombre">{fois(temps(a, grandV) / temps(a, petitV))}</td>
                  <td className="nombre">{fois(ATTENDU[a])}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <p className="tableau-note">
            Attendu : ce que la complexité prévoit quand on passe de {E(petitV).toLocaleString('fr-FR')} à{' '}
            {E(grandV).toLocaleString('fr-FR')} arcs. Pour Bellman-Ford, c’est le pire cas.
          </p>
        </div>
        <ul className="bench-liste">
          <li>
            <strong>Bellman-Ford</strong> devrait grandir comme V × E. Il s’arrête dès qu’un passage ne change plus rien :
            sur nos réseaux, après une dizaine de passages au lieu de V − 1.
          </li>
          <li>
            <strong>DFS</strong> est un peu plus lent que BFS pour la même complexité : en Python, la récursion coûte plus
            cher qu’une file.
          </li>
          <li>
            <strong>Kruskal</strong> est plus lent que Prim sur ces graphes peu denses. Il trie toutes les arêtes avant de
            commencer.
          </li>
        </ul>
      </section>

      <p className="aide bench-pied">
        Reproduire ces mesures : <code>python backend/cli.py benchmark --sortie resultats/benchmarks</code>
      </p>
    </div>
  );
}
