import { useState } from 'react';
import { circuits } from '../../api.js';
import { useCalculAuto } from '../../hooks.js';
import Plan from '../../components/Plan.jsx';
import { Chargement, Erreur, Espace, Legende, Segments, Selecteur } from '../../components/Blocs.jsx';

// Module 3 : graphes de test à poids négatifs. Ce ne sont pas des durées
// réelles (une route ne prend jamais −3 minutes) : ils servent seulement à
// vérifier que Bellman-Ford et Floyd-Warshall repèrent les circuits absorbants.
const CAS = [['accessible', 'Boucle atteignable'], ['non_accessible', 'Boucle isolée']];
const SITES = { accessible: ['S', 'A', 'B', 'C', 'D'], non_accessible: ['S', 'A', 'B', 'C', 'D', 'E'] };

const distance = (d) => (d === null ? 'inatteignable' : d === '-inf' ? '−∞' : `${d}`);
const signe = (n) => String(n).replace('-', '−'); // vrai signe moins
const liste = (l) => (l.length > 1 ? `${l.slice(0, -1).join(', ')} et ${l.at(-1)}` : l.join(''));

/** La phrase qui explique le résultat, construite à partir de la réponse. */
function Verdict({ donnees, source }) {
  if (!donnees.existe) {
    return <p className="verdict">Aucun circuit absorbant dans ce graphe : toutes les distances sont normales.</p>;
  }
  const boucle = donnees.circuit.join(' → ');
  if (donnees.accessible) {
    return (
      <div className="verdict verdict-alerte" role="status">
        <p><strong>Depuis {source}, on peut entrer dans la boucle {boucle}.</strong></p>
        <p>
          Un tour complet de cette boucle vaut {signe(donnees.poids)}. Chaque tour fait donc baisser la distance, et on peut
          tourner sans fin : il n’existe pas de plus court chemin vers {liste(donnees.non_bornes)}. Leur distance
          vaut −∞, et l’outil refuse d’afficher un trajet.
        </p>
      </div>
    );
  }
  const finis = Object.entries(donnees.bellman_ford).filter(([s, d]) => s !== source && typeof d === 'number');
  return (
    <div className="verdict" role="status">
      <p><strong>La boucle {boucle} existe, mais on ne peut pas l’atteindre depuis {source}.</strong></p>
      <p>
        Elle vaut {signe(donnees.poids)}, mais aucune route ne mène de {source} jusqu’à elle. Les distances depuis{' '}
        {source} restent donc normales et justes{finis.length ? ` : ${finis.map(([s, d]) => `${s} = ${d}`).join(', ')}` : ''}.
        Partez de {donnees.circuit[0]} pour voir la boucle devenir atteignable.
      </p>
    </div>
  );
}

export default function Circuits() {
  const [cas, setCas] = useState('accessible');
  const [source, setSource] = useState('S');
  const sourceValide = SITES[cas].includes(source) ? source : 'S';
  const { chargement, donnees, erreur } = useCalculAuto(() => circuits({ cas, source: sourceValide }), [cas, sourceValide]);

  return (
    <Espace
      titreCommandes="Circuits absorbants"
      commandes={
        <div className="formulaire">
          <p className="aide">
            Un <strong>circuit absorbant</strong> est une boucle dont la somme des poids est négative. En tournant
            dedans, la distance baisse à chaque tour : il n’y a plus de « plus court chemin ».
          </p>
          <p className="aide">
            Dans une vraie ville, aucun trajet ne dure moins de zéro minute, donc ce cas n’arrive jamais. Ces deux
            petits graphes de test servent à vérifier que Bellman-Ford et Floyd-Warshall le détectent.
          </p>
          <Segments legende="Graphe de test" valeur={cas} onChange={setCas} options={CAS} />
          <Selecteur id="ci-source" label="Site de départ" valeur={sourceValide} onChange={setSource}
            options={SITES[cas].map((s) => [s, s === 'S' ? 'S (source)' : s])} />
          <p className="aide">Le résultat se met à jour dès que vous changez de graphe ou de départ.</p>
        </div>
      }
      titrePlan="Graphe de test"
      badge={donnees?.existe ? `Boucle de poids ${signe(donnees.poids)}` : null}
      plan={donnees
        ? <Plan reseau={donnees.reseau} chemin={donnees.circuit} libellePoids="Poids des arcs (fictifs, parfois négatifs)"
            description="Graphe de test, la boucle de poids négatif surlignée en jaune" />
        : <Chargement texte="Chargement du graphe…" />}
      legende={<Legende elements={[['m-trajet', 'Boucle de poids négatif'], ['m-quartier', 'Site du graphe de test']]} />}
      resultats={
        <>
          {chargement && !donnees && <Chargement />}
          {erreur && <Erreur>{erreur}</Erreur>}
          {donnees && (
            <>
              <Verdict donnees={donnees} source={sourceValide} />
              <div className="tableau-boite">
                <table>
                  <caption className="visuellement-cache">Distances depuis le départ selon les deux algorithmes</caption>
                  <thead>
                    <tr>
                      <th scope="col">Vers</th>
                      <th scope="col" className="nombre">Bellman-Ford</th>
                      <th scope="col" className="nombre">Floyd-Warshall</th>
                    </tr>
                  </thead>
                  <tbody>
                    {[sourceValide, ...Object.keys(donnees.bellman_ford).filter((s) => s !== sourceValide)].map((s) => (
                      <tr key={s} className={donnees.bellman_ford[s] === '-inf' ? 'ligne-alerte' : undefined}>
                        <td>{s}{s === sourceValide ? ' (départ)' : ''}</td>
                        <td className="nombre">{distance(donnees.bellman_ford[s])}</td>
                        <td className="nombre">{distance(donnees.floyd_warshall[s])}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                <p className="tableau-note">
                  Distance la plus courte depuis {sourceValide}, calculée par les deux algorithmes : ils doivent
                  donner la même chose. −∞ veut dire « peut baisser sans fin », on n’affiche alors aucun nombre.
                </p>
              </div>
            </>
          )}
        </>
      }
    />
  );
}
