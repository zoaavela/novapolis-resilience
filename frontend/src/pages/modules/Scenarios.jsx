import { useState } from 'react';
import { impactScenario } from '../../api.js';
import { useRequete } from '../../hooks.js';
import Plan from '../../components/Plan.jsx';
import {
  Chargement, Erreur, Espace, Legende, LEGENDE_ROUTES, Segments, Selecteur, Tuile, Vide, minutes,
} from '../../components/Blocs.jsx';

const ALGOS = [['dijkstra', 'Dijkstra'], ['bellman-ford', 'Bellman'], ['floyd-warshall', 'Floyd']];

function retard(d) {
  if (d.apres === null && d.avant !== null) return { texte: 'coupé', alerte: true };
  if (d.avant === null) return { texte: 'aucun accès', alerte: true };
  const r = d.apres - d.avant;
  if (r === 0) return { texte: '0', alerte: false };
  return { texte: `+${Math.round((r / d.avant) * 100)} %`, alerte: false };
}

export default function Scenarios({ reseau, jeu }) {
  const choix = reseau.scenarios.filter((s) => s.reseau === 'routes' && s.id !== 'S0');
  const [scenario, setScenario] = useState(choix[0]?.id);
  const [algo, setAlgo] = useState('dijkstra');
  const [{ chargement, donnees, erreur }, lancer] = useRequete();
  const sc = reseau.scenarios.find((s) => s.id === scenario);

  const lignes = donnees?.demandes ?? [];
  const inaccessibles = lignes.filter((d) => d.apres === null).length;
  const retards = lignes.filter((d) => d.avant !== null && d.apres !== null).map((d) => d.apres - d.avant);
  const retardMax = retards.length ? Math.max(...retards) : 0;
  const isoles = lignes.filter((d) => d.apres === null).map((d) => d.site);

  return (
    <Espace
      titreCommandes="Scénario"
      commandes={
        <form className="formulaire" onSubmit={(e) => { e.preventDefault(); lancer(() => impactScenario({ jeu, scenario, algo })); }}>
          <Selecteur id="sc-choix" label="Perturbation" valeur={scenario} onChange={setScenario}
            options={choix.map((s) => [s.id, s.nom])} />
          <Segments legende="Algorithme" valeur={algo} onChange={setAlgo} options={ALGOS} />
          <button type="submit" className="bouton bouton-principal" disabled={chargement}>
            {chargement ? 'Calcul…' : 'Appliquer'}
          </button>
          <p className="aide">Le scénario s’applique à une copie du réseau. La ville d’origine ne change jamais.</p>
        </form>
      }
      titrePlan="Plan de la ville"
      badge={donnees && sc?.fermes ? sc.nom : null}
      plan={<Plan reseau={reseau} fermes={donnees ? sc?.fermes ?? [] : []} isoles={isoles} />}
      legende={<Legende elements={LEGENDE_ROUTES} />}
      resultats={
        <>
          {chargement && <Chargement />}
          {erreur && <Erreur>{erreur}</Erreur>}
          {!chargement && !erreur && !donnees && <Vide>Choisissez une perturbation et appliquez-la pour voir son impact.</Vide>}
          {donnees && (
            <>
              <div className="tuiles">
                <Tuile label="Inaccessibles" valeur={`${inaccessibles} / ${lignes.length}`} alerte={inaccessibles > 0} />
                <Tuile label="Retard max" valeur={`+${retardMax}`} unite="min" />
              </div>
              <div className="tableau-boite">
                <table>
                  <caption className="visuellement-cache">Impact du scénario sur chaque demande</caption>
                  <thead>
                    <tr>
                      <th scope="col">Demande</th>
                      <th scope="col" className="nombre">Avant</th>
                      <th scope="col" className="nombre">Après</th>
                      <th scope="col" className="nombre">Retard</th>
                    </tr>
                  </thead>
                  <tbody>
                    {lignes.map((d) => {
                      const r = retard(d);
                      return (
                        <tr key={d.id} className={r.alerte ? 'ligne-alerte' : undefined}>
                          <td>{d.id} · {d.site}</td>
                          <td className="nombre">{minutes(d.avant)}</td>
                          <td className="nombre">{minutes(d.apres)}</td>
                          <td className="nombre">{r.texte}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
                <p className="tableau-note">Temps en minutes, depuis la caserne la plus rapide.</p>
              </div>
            </>
          )}
        </>
      }
    />
  );
}
