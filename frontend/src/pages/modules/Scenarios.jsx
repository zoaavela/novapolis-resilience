import { useState } from 'react';
import { fermeture, impactScenario, modeFactice } from '../../api.js';
import { useCalculAuto } from '../../hooks.js';
import Plan from '../../components/Plan.jsx';
import {
  Chargement, Erreur, Espace, Legende, LEGENDE_ROUTES, Segments, Selecteur, Tuile, minutes,
} from '../../components/Blocs.jsx';

const ALGOS = [['dijkstra', 'Dijkstra'], ['bellman-ford', 'Bellman'], ['floyd-warshall', 'Floyd']];
const MODES = [['fichier', 'Scénarios prévus'], ['main', 'Fermer des routes']];
const MAX_ARCS = 20; // limite vérifiée aussi par l'API


function retard(d) {
  if (d.apres === null && d.avant !== null) return { texte: 'coupé', alerte: true };
  if (d.avant === null) return { texte: 'aucun accès', alerte: true };
  const r = d.apres - d.avant;
  if (r === 0) return { texte: '0', alerte: false };
  return { texte: `+${Math.round((r / d.avant) * 100)} %`, alerte: false };
}

/** Indicateurs et tableau des demandes : communs aux deux modes. */
function Impact({ donnees }) {
  const lignes = donnees.demandes;
  const ind = donnees.indicateurs; // absent en mode démonstration
  const inaccessibles = lignes.filter((d) => d.apres === null).length;
  const retards = lignes.filter((d) => d.avant !== null && d.apres !== null).map((d) => d.apres - d.avant);
  const retardMax = retards.length ? Math.max(...retards) : 0;
  return (
    <>
      {ind ? (
        <div className="tuiles">
          <Tuile label="Demandes inaccessibles" valeur={`${ind.nb_inaccessibles} / ${ind.nb_demandes}`} alerte={ind.nb_inaccessibles > 0} />
          <Tuile label="Devenues inaccessibles" valeur={ind.nb_devenues_inaccessibles} alerte={ind.nb_devenues_inaccessibles > 0} />
          <Tuile label="Retard moyen" valeur={`+${ind.retard_moyen}`} unite="min" />
          <Tuile label="Retard max" valeur={`+${ind.retard_max}`} unite={`min (+${Math.round(ind.retard_relatif_max * 100)} %)`} />
          <Tuile label="Sites sensibles accessibles" valeur={`${ind.sensibles_accessibles} / ${ind.nb_sensibles}`} alerte={ind.sensibles_accessibles < ind.nb_sensibles} />
        </div>
      ) : (
        <div className="tuiles">
          <Tuile label="Inaccessibles" valeur={`${inaccessibles} / ${lignes.length}`} alerte={inaccessibles > 0} />
          <Tuile label="Retard max" valeur={`+${retardMax}`} unite="min" />
        </div>
      )}
      <div className="tableau-boite">
        <table>
          <caption className="visuellement-cache">Impact sur chaque demande</caption>
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
        <p className="tableau-note">
          Temps en minutes, depuis la caserne la plus rapide. Le retard moyen ne compte que les demandes accessibles
          avant et après. Sites sensibles : hôpitaux, écoles, centres télécom.
        </p>
      </div>
    </>
  );
}

/** Trajet avant / après une fermeture, côte à côte. */
function Comparaison({ trajet }) {
  const carte = (t, titre) => (
    <div className="tuile">
      <div className="tuile-label">{titre}</div>
      <div className={t.accessible ? 'tuile-valeur' : 'tuile-valeur alerte'}>
        {t.accessible ? t.duree : 'coupé'}
        {t.accessible && <span className="tuile-unite"> min</span>}
      </div>
      {t.accessible && <p className="chemin-texte">{t.nb_arcs} routes : {t.chemin.join(' → ')}</p>}
    </div>
  );
  const ecart = trajet.avant.accessible && trajet.apres.accessible ? trajet.apres.duree - trajet.avant.duree : null;
  return (
    <section aria-label="Trajet avant et après la fermeture">
      <div className="trajet-compare">
        {carte(trajet.avant, 'Avant')}
        {carte(trajet.apres, 'Après')}
      </div>
      <p className="aide">
        {ecart === null
          ? trajet.avant.accessible ? 'La fermeture coupe ce trajet : plus aucune route ne mène à l’arrivée.' : 'Ce site n’était déjà pas atteignable.'
          : ecart === 0 ? 'Aucun effet sur ce trajet.' : `La fermeture rallonge ce trajet de ${ecart} min.`}
      </p>
    </section>
  );
}

export default function Scenarios({ reseau, jeu }) {
  const choix = reseau.scenarios.filter((s) => s.reseau === 'routes' && s.id !== 'S0');
  const casernes = reseau.sites.filter((s) => s.type === 'caserne');
  const [mode, setMode] = useState('fichier');
  const [algo, setAlgo] = useState('dijkstra');

  // Mode « scénarios prévus » : ceux du fichier scenarios.csv
  const [scenario, setScenario] = useState(choix[0]?.id);
  const sc = reseau.scenarios.find((s) => s.id === scenario);
  const pointe = sc?.nom === 'Heure de pointe';
  const prevu = useCalculAuto(() => impactScenario({ jeu, scenario, algo }), [scenario, algo, jeu], mode === 'fichier');

  // Mode « fermer des routes » : arcs fermés à la main sur le plan
  const [fermes, setFermes] = useState([]);
  const [source, setSource] = useState(casernes[0]?.id);
  const [cible, setCible] = useState(reseau.sites.at(-1)?.id);
  const main = useCalculAuto(
    () => fermeture({ jeu, fermes, algo, source, cible: source === cible ? null : cible }),
    [fermes, algo, source, cible, jeu],
    mode === 'main' && !modeFactice,
  );
  const donneesMain = main.donnees;
  const [alerte, setAlerte] = useState(null);

  const estFerme = (u, v) => fermes.some(([a, b]) => a === u && b === v);

  function basculerRoute(u, v, sens) {
    setAlerte(null);
    const dejaFermee = sens.some(([a, b]) => estFerme(a, b));
    if (dejaFermee) {
      setFermes((f) => f.filter(([a, b]) => !sens.some(([x, y]) => x === a && y === b)));
      return;
    }
    if (fermes.length + sens.length > MAX_ARCS) {
      setAlerte(`${MAX_ARCS} arcs au plus. Rouvrez une route avant d’en fermer une autre.`);
      return;
    }
    setFermes((f) => [...f, ...sens]);
  }

  // Une route à double sens = deux arcs : on l'affiche une seule fois dans la liste.
  const routesFermees = [];
  for (const [u, v] of fermes) {
    if (!routesFermees.some((r) => (r.u === v && r.v === u))) routesFermees.push({ u, v, double: estFerme(v, u) });
  }
  function rouvrir(r) {
    setFermes((f) => f.filter(([a, b]) => !((a === r.u && b === r.v) || (a === r.v && b === r.u))));
  }

  const actif = mode === 'fichier' ? prevu : main;
  const lignes = actif.donnees?.demandes ?? [];
  const isoles = lignes.filter((d) => d.apres === null).map((d) => d.site);
  const fermesPlan = mode === 'fichier' ? sc?.fermes ?? [] : fermes;
  const cheminPlan = mode === 'main' ? donneesMain?.trajet?.apres?.chemin ?? null : null;

  const commandesFichier = (
    <div className="formulaire">
      <Selecteur id="sc-choix" label="Perturbation" valeur={scenario} onChange={setScenario}
        options={choix.map((s) => [s.id, s.nom])} />
      <Segments legende="Algorithme" valeur={algo} onChange={setAlgo} options={ALGOS} />
      <p className="aide">
        {sc?.fermes
          ? `Routes fermées, barrées en rouge sur le plan : ${sc.fermes.map(([u, v]) => `${u} → ${v}`).join(', ')}.`
          : pointe ? 'Tous les temps passent à ceux de l’heure de pointe, affichés sur le plan.' : ''}
        {' '}L’impact se recalcule dès que vous changez de perturbation ou d’algorithme.
      </p>
      <p className="aide">Scénarios du fichier scenarios.csv, appliqués à une copie du réseau : la ville d’origine ne change jamais.</p>
    </div>
  );

  const commandesMain = (
    <div className="formulaire">
      <p className="aide">
        Cliquez sur une route du plan pour la fermer, cliquez à nouveau pour la rouvrir. L’impact se recalcule tout seul.
      </p>
      <div className="champ">
        <span className="etiquette-champ" id="sc-fermes">Routes fermées ({routesFermees.length})</span>
        {routesFermees.length === 0 ? (
          <p className="aide">Aucune pour l’instant.</p>
        ) : (
          <ul className="fermetures" aria-labelledby="sc-fermes">
            {routesFermees.map((r) => (
              <li key={`${r.u}-${r.v}`} className="fermeture">
                {r.u} {r.double ? '↔' : '→'} {r.v}
                <button type="button" onClick={() => rouvrir(r)} aria-label={`Rouvrir ${r.u} – ${r.v}`}>×</button>
              </li>
            ))}
          </ul>
        )}
        {routesFermees.length > 0 && (
          <button type="button" className="lien-bouton" onClick={() => { setFermes([]); setAlerte(null); }}>Tout rouvrir</button>
        )}
      </div>
      {alerte && <Erreur>{alerte}</Erreur>}
      <Selecteur id="sc-source" label="Trajet à suivre : départ" valeur={source} onChange={setSource}
        options={casernes.map((s) => [s.id, `${s.id} · ${s.nom}`])} />
      <Selecteur id="sc-cible" label="Arrivée" valeur={cible} onChange={setCible}
        options={reseau.sites.map((s) => [s.id, `${s.id} · ${s.nom}`])} />
      <Segments legende="Algorithme" valeur={algo} onChange={setAlgo} options={ALGOS} />
    </div>
  );

  return (
    <Espace
      titreCommandes="Scénario"
      commandes={
        <>
          <Segments legende="Mode" valeur={mode} onChange={setMode} options={MODES} />
          {mode === 'fichier' ? commandesFichier : commandesMain}
        </>
      }
      titrePlan="Plan de la ville"
      badge={mode === 'fichier' && sc ? sc.nom : mode === 'main' && fermes.length ? `${routesFermees.length} fermée${routesFermees.length > 1 ? 's' : ''}` : null}
      plan={
        <Plan
          reseau={reseau}
          fermes={fermesPlan}
          isoles={isoles}
          chemin={cheminPlan}
          pointe={mode === 'fichier' && pointe}
          surClicRoute={mode === 'main' ? basculerRoute : null}
          description={mode === 'main' ? 'Plan de la ville : cliquez sur une route pour la fermer' : 'Plan de la ville'}
        />
      }
      legende={<Legende elements={mode === 'fichier' && pointe ? [...LEGENDE_ROUTES, ['m-pointe', 'Route ralentie à l’heure de pointe']] : LEGENDE_ROUTES} />}
      resultats={
        <>
          {mode === 'main' && modeFactice && <Erreur>La fermeture à la main demande l’API.</Erreur>}
          {actif.chargement && !actif.donnees && <Chargement />}
          {actif.chargement && actif.donnees && <p className="aide" role="status">Recalcul…</p>}
          {actif.erreur && <Erreur>{actif.erreur}</Erreur>}
          {mode === 'main' && donneesMain?.trajet && <Comparaison trajet={donneesMain.trajet} />}
          {actif.donnees && <Impact donnees={actif.donnees} />}
        </>
      }
    />
  );
}
