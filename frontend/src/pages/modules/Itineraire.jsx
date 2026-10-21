import { useState } from 'react';
import { itineraire } from '../../api.js';
import { useRequete } from '../../hooks.js';
import Plan from '../../components/Plan.jsx';
import {
  Chargement, Erreur, Espace, Legende, LEGENDE_ROUTES, Segments, Selecteur, Tuile, Vide,
} from '../../components/Blocs.jsx';

const ALGOS = [['dijkstra', 'Dijkstra'], ['bellman-ford', 'Bellman'], ['floyd-warshall', 'Floyd']];

export default function Itineraire({ reseau, jeu }) {
  const casernes = reseau.sites.filter((s) => s.type === 'caserne');
  const scenarios = reseau.scenarios.filter((s) => s.reseau === 'routes');
  const [source, setSource] = useState(casernes[0]?.id);
  const [cible, setCible] = useState('Q4');
  const [scenario, setScenario] = useState('S0');
  const [algo, setAlgo] = useState('dijkstra');
  const [erreurForm, setErreurForm] = useState(null);
  const [{ chargement, donnees, erreur }, lancer] = useRequete();

  const sc = reseau.scenarios.find((s) => s.id === scenario);

  function calculer(e) {
    e.preventDefault();
    if (source === cible) {
      setErreurForm('Le départ et l’arrivée sont le même site.');
      return;
    }
    setErreurForm(null);
    lancer(() => itineraire({ jeu, scenario, source, cible, algo }));
  }

  return (
    <Espace
      titreCommandes="Itinéraire"
      commandes={
        <form onSubmit={calculer} className="formulaire" noValidate>
          <Selecteur id="it-source" label="Caserne de départ" valeur={source} onChange={setSource}
            options={casernes.map((s) => [s.id, `${s.id} · ${s.nom}`])} />
          <Selecteur id="it-cible" label="Site à atteindre" valeur={cible} onChange={setCible}
            options={reseau.sites.map((s) => [s.id, `${s.id} · ${s.nom}`])} />
          <Selecteur id="it-sc" label="Scénario" valeur={scenario} onChange={setScenario}
            options={scenarios.map((s) => [s.id, s.nom])} />
          <Segments legende="Algorithme" valeur={algo} onChange={setAlgo} options={ALGOS} />
          {erreurForm && <Erreur>{erreurForm}</Erreur>}
          <button type="submit" className="bouton bouton-principal" disabled={chargement}>
            {chargement ? 'Calcul…' : 'Tracer le trajet'}
          </button>
        </form>
      }
      titrePlan="Plan de la ville"
      badge={sc?.fermes ? sc.nom : null}
      plan={
        <Plan reseau={reseau} chemin={donnees?.chemin} fermes={sc?.fermes ?? []} pointe={sc?.nom === 'Heure de pointe'}
          isoles={donnees && !donnees.accessible ? [cible] : []}
          description={donnees?.chemin ? `Trajet ${donnees.chemin.join(' puis ')}` : 'Plan de la ville'} />
      }
      legende={<Legende elements={LEGENDE_ROUTES} />}
      resultats={
        <>
          {chargement && <Chargement />}
          {erreur && <Erreur>{erreur}</Erreur>}
          {!chargement && !erreur && !donnees && <Vide>Choisissez un départ et une arrivée, puis tracez le trajet.</Vide>}
          {donnees && !donnees.accessible && (
            <div className="carte-alerte">
              <strong>{cible} est inaccessible</strong> depuis {source}. Aucune route ne permet d’y arriver.
            </div>
          )}
          {donnees?.accessible && (
            <>
              <div className="tuiles">
                <Tuile label="Durée" valeur={donnees.duree} unite="min" />
                <Tuile label="Routes empruntées" valeur={donnees.nb_arcs} />
              </div>
              <div className="carte-sombre">
                <div className="carte-sombre-titre">Trajet {source} vers {cible}</div>
                <div className="mono">{donnees.chemin.join(' → ')}</div>
                <div>Calculé avec {ALGOS.find(([v]) => v === donnees.algo)?.[1]}</div>
              </div>
            </>
          )}
        </>
      }
    />
  );
}
