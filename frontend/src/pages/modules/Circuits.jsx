import { useState } from 'react';
import { circuits } from '../../api.js';
import { useRequete } from '../../hooks.js';
import Plan from '../../components/Plan.jsx';
import { Chargement, Erreur, Espace, Segments, Tuile, Vide } from '../../components/Blocs.jsx';

// Module 3 : graphes de test à poids négatifs. Ce ne sont pas des durées
// réelles (une route ne prend jamais -3 minutes) : ils servent seulement à
// vérifier que Bellman-Ford et Floyd-Warshall repèrent les circuits absorbants.
const CAS = [['accessible', 'Accessible'], ['non_accessible', 'Non accessible']];

const distance = (d) => (d === null ? 'inatteignable' : d === '-inf' ? '−∞' : `${d}`);

export default function Circuits() {
  const [cas, setCas] = useState('accessible');
  const [{ chargement, donnees, erreur }, lancer] = useRequete();

  return (
    <Espace
      titreCommandes="Circuits absorbants"
      commandes={
        <form className="formulaire" onSubmit={(e) => { e.preventDefault(); lancer(() => circuits({ cas, source: 'S' })); }}>
          <Segments legende="Graphe de test" valeur={cas} onChange={setCas} options={CAS} />
          <button type="submit" className="bouton bouton-principal" disabled={chargement}>
            {chargement ? 'Calcul…' : 'Analyser depuis S'}
          </button>
          <p className="aide">
            Un circuit absorbant est une boucle dont la somme des poids est négative : en tournant
            dedans, la distance baisse sans fin. Ces poids négatifs sont artificiels, aucun trajet réel
            ne dure moins de zéro minute.
          </p>
        </form>
      }
      titrePlan="Graphe de test"
      plan={donnees
        ? <Plan reseau={donnees.reseau} chemin={donnees.circuit} description="Graphe de test et circuit absorbant surligné" />
        : <Vide>Choisissez un graphe de test et lancez l’analyse.</Vide>}
      resultats={
        <>
          {chargement && <Chargement />}
          {erreur && <Erreur>{erreur}</Erreur>}
          {donnees && (
            <>
              <div className="tuiles">
                <Tuile label="Circuit absorbant" valeur={donnees.existe ? donnees.circuit.join(' → ') : 'aucun'} alerte={donnees.existe} />
                <Tuile label="Poids du circuit" valeur={donnees.poids ?? '–'} />
                <Tuile label="Atteint depuis S" valeur={donnees.accessible ? 'oui' : 'non'} alerte={donnees.accessible} />
              </div>
              <div className="tableau-boite">
                <table>
                  <caption className="visuellement-cache">Distances depuis S selon les deux algorithmes</caption>
                  <thead>
                    <tr>
                      <th scope="col">Site</th>
                      <th scope="col" className="nombre">Bellman-Ford</th>
                      <th scope="col" className="nombre">Floyd-Warshall</th>
                    </tr>
                  </thead>
                  <tbody>
                    {Object.keys(donnees.bellman_ford).map((s) => (
                      <tr key={s} className={donnees.bellman_ford[s] === '-inf' ? 'ligne-alerte' : undefined}>
                        <td>{s}</td>
                        <td className="nombre">{distance(donnees.bellman_ford[s])}</td>
                        <td className="nombre">{distance(donnees.floyd_warshall[s])}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                <p className="tableau-note">
                  −∞ : la distance peut diminuer sans fin, on n’affiche donc pas de nombre. Quand le circuit
                  n’est pas atteignable depuis S, les distances restent finies et justes.
                </p>
              </div>
            </>
          )}
        </>
      }
    />
  );
}
