// Explication du projet, affichée en bas de l'outil.
import { DEPOT, ECOLE } from '../equipe.js';

const ALGOS = [
  ['DFS, BFS', 'Accessibilité', 'Sites atteignables, cycles, sites isolés', 'O(V + E)'],
  ['Dijkstra (tas binaire)', 'Itinéraires', 'Plus court chemin, poids positifs', 'O((V + E) log V)'],
  ['Bellman-Ford', 'Itinéraires, circuits absorbants', 'Accepte les poids négatifs, détecte les circuits absorbants', 'O(V × E)'],
  ['Floyd-Warshall', 'Itinéraires, circuits absorbants', 'Toutes les paires d’un coup, petits graphes', 'O(V³)'],
  ['Kruskal + Union-Find', 'Fibre', 'Arbre couvrant minimal', 'O(E log E)'],
  ['Prim (tas binaire)', 'Fibre', 'Arbre couvrant minimal', 'O(E log V)'],
];

export default function CommentCaMarche() {
  return (
    <div id="comment-ca-marche" className="conteneur comment">
      <div className="comment-grille">
      <section className="panneau" aria-labelledby="t-pourquoi">
        <h2 id="t-pourquoi">Pourquoi Novapolis</h2>
        <p>
          Novapolis est le projet intégrateur du cours d’algorithmique et théorie des graphes ({ECOLE}, ING-APP1-BDML).
          La ville est fictive, la question est réelle : quand un réseau se dégrade, qui en paie le prix ?
        </p>
        <p>L’outil répond aux trois questions posées par le sujet :</p>
        <ol>
          <li>Quels quartiers ne sont pas assez accessibles depuis une caserne ou un hôpital ?</li>
          <li>Quels itinéraires recommander quand des routes sont congestionnées ou fermées ?</li>
          <li>Comment déployer la fibre au moindre coût, en gardant une solution de secours en cas de panne ?</li>
        </ol>
        <p>
          Chaque résultat doit pouvoir être vérifié : il vient d’un algorithme du cours, il est testé, et il se
          régénère à partir des fichiers et des commandes du dépôt.
        </p>
      </section>

      <section className="panneau" aria-labelledby="t-modele">
        <h2 id="t-modele">Le modèle</h2>
        <p>
          La ville est décrite par deux graphes qui partagent les mêmes sites. Le réseau routier est orienté : un arc
          est un trajet autorisé dans un sens, pondéré par un temps en minutes. Le réseau de fibre est non orienté :
          une arête est un tronçon constructible, pondéré par son coût.
        </p>
        <p>
          Chaque perturbation s’applique à une copie du graphe. La situation de référence ne change jamais, ce qui
          permet de comparer avant et après.
        </p>
      </section>

      <section className="panneau" aria-labelledby="t-algos">
        <h2 id="t-algos">Les algorithmes</h2>
        <div className="tableau-boite">
          <table>
            <caption className="visuellement-cache">Algorithmes utilisés, leur rôle et leur complexité</caption>
            <thead>
              <tr>
                <th scope="col">Algorithme</th>
                <th scope="col">Module</th>
                <th scope="col">Rôle</th>
                <th scope="col">Complexité</th>
              </tr>
            </thead>
            <tbody>
              {ALGOS.map(([nom, module, role, cplx]) => (
                <tr key={nom}>
                  <th scope="row">{nom}</th>
                  <td>{module}</td>
                  <td>{role}</td>
                  <td className="mono">{cplx}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p>
          V est le nombre de sites, E le nombre de routes ou de tronçons. Les graphes sont stockés en listes
          d’adjacence, adaptées à un réseau urbain où chaque site n’a que quelques voisins.
        </p>
      </section>

      <section className="panneau" aria-labelledby="t-donnees">
        <h2 id="t-donnees">Les données</h2>
        <p>Toutes les données sont synthétiques. Trois jeux, trois usages :</p>
        <ul>
          <li><strong>Petite ville, 10 sites</strong> : chaque résultat est vérifiable à la main, et sert de référence aux tests.</li>
          <li><strong>Novapolis, 100 sites</strong> : la ville de démonstration.</li>
          <li><strong>Graphe généré, 1 000 sommets</strong> : uniquement pour mesurer les performances, avec une graine aléatoire fixée.</li>
        </ul>
        <p>
          Les fichiers sont des CSV documentés, vérifiés par un validateur avant tout calcul.
        </p>
      </section>

      <section className="panneau" aria-labelledby="t-tech">
        <h2 id="t-tech">Comment c’est construit</h2>
        <p>
          Le moteur est écrit en Python, sans bibliothèque de graphes : chaque algorithme est codé à la main. Une API
          FastAPI le rend accessible au site, écrit en React. Les mêmes fonctions sont utilisables en ligne de
          commande. Des tests automatisés tournent à chaque modification du code.
        </p>
        <p>
          Code source, données et instructions : <a href={DEPOT}>dépôt GitHub du projet</a>.
        </p>
      </section>

            </div>
    </div>
  );
}
