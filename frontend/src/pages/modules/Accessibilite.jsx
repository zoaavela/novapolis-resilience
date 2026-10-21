import { useState } from 'react';
import { accessibilite } from '../../api.js';
import { useRequete } from '../../hooks.js';
import Plan from '../../components/Plan.jsx';
import {
  Chargement, Erreur, Espace, Legende, Selecteur, Tuile, Vide,
} from '../../components/Blocs.jsx';

export default function Accessibilite({ reseau }) {
  const casernes = reseau.sites.filter((s) => s.type === 'caserne');
  const scenarios = reseau.scenarios.filter((s) => s.reseau === 'routes');
  const [choisies, setChoisies] = useState(casernes.map((c) => c.id));
  const [scenario, setScenario] = useState('S0');
  const [erreurForm, setErreurForm] = useState(null);
  const [{ chargement, donnees, erreur }, lancer] = useRequete();
  const sc = reseau.scenarios.find((s) => s.id === scenario);

  function basculer(id) {
    setChoisies((l) => (l.includes(id) ? l.filter((x) => x !== id) : [...l, id]));
  }

  function calculer(e) {
    e.preventDefault();
    if (choisies.length === 0) {
      setErreurForm('Cochez au moins une caserne.');
      return;
    }
    setErreurForm(null);
    lancer(() => accessibilite({ scenario, sources: choisies }));
  }

  const total = reseau.sites.length;
  const atteints = donnees ? Object.keys(donnees.niveaux).length : 0;

  return (
    <Espace
      titreCommandes="Accessibilité"
      commandes={
        <form className="formulaire" onSubmit={calculer} noValidate>
          <fieldset className="cases">
            <legend>Casernes de départ</legend>
            {casernes.map((c) => (
              <label key={c.id} className="case">
                <input type="checkbox" checked={choisies.includes(c.id)} onChange={() => basculer(c.id)} />
                {c.id} · {c.nom}
              </label>
            ))}
          </fieldset>
          <Selecteur id="ac-sc" label="Scénario" valeur={scenario} onChange={setScenario}
            options={scenarios.map((s) => [s.id, s.nom])} />
          {erreurForm && <Erreur>{erreurForm}</Erreur>}
          <button type="submit" className="bouton bouton-principal" disabled={chargement}>
            {chargement ? 'Calcul…' : 'Calculer'}
          </button>
          <p className="aide">Parcours en largeur (BFS). Le chiffre sous chaque site est le nombre de routes à emprunter.</p>
        </form>
      }
      titrePlan="Plan de la ville"
      plan={<Plan reseau={reseau} niveaux={donnees?.niveaux ?? null} fermes={sc?.fermes ?? []} />}
      legende={<Legende elements={[['m-atteint', 'Atteint'], ['m-coupe', 'Non atteint'], ['m-ferme', 'Route fermée']]} />}
      resultats={
        <>
          {chargement && <Chargement />}
          {erreur && <Erreur>{erreur}</Erreur>}
          {!chargement && !erreur && !donnees && <Vide>Choisissez les casernes, puis lancez le calcul.</Vide>}
          {donnees && (
            <>
              <div className="tuiles">
                <Tuile label="Sites atteints" valeur={`${atteints} / ${total}`} />
                <Tuile label="Non atteints" valeur={donnees.non_atteints.length} alerte={donnees.non_atteints.length > 0} />
              </div>
              {donnees.non_atteints.length > 0 && (
                <div className="carte-alerte">
                  <strong>Hors de portée :</strong> {donnees.non_atteints.join(', ')}. Aucune route ne mène à ces sites
                  depuis les casernes choisies.
                </div>
              )}
            </>
          )}
        </>
      }
    />
  );
}
