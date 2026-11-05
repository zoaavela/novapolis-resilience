import { useState } from 'react';
import { Espace, Erreur, Selecteur } from '../../components/Blocs.jsx';
import Plan from '../../components/Plan.jsx';
import { useRequete } from '../../hooks.js';
import { modeFactice, validerFichier } from '../../api.js';

const TAILLE_MAX = 1000 * 1000; // 1 Mo, vérifié aussi côté serveur
const TYPES = [['sites', 'sites.csv'], ['routes', 'routes.csv'], ['fibre', 'fibre.csv'], ['demandes', 'demandes.csv'], ['scenarios', 'scenarios.csv']];

// Devine le type d'après le nom du fichier (« routes_v2.csv » -> routes).
const deviner = (nom) => TYPES.find(([t]) => nom.toLowerCase().includes(t))?.[0] ?? 'sites';

export default function Donnees({ reseau, jeu, setJeu }) {
  const [fichier, setFichier] = useState(null);
  const [erreur, setErreur] = useState(null);
  const [type, setType] = useState('sites');
  const [{ chargement, donnees, erreur: erreurServeur }, lancer] = useRequete();

  function choisir(e) {
    const f = e.target.files?.[0] ?? null;
    setErreur(null);
    setFichier(null);
    if (!f) return;
    if (!f.name.toLowerCase().endsWith('.csv')) {
      setErreur('Le fichier doit être un .csv.');
      return;
    }
    if (f.size > TAILLE_MAX) {
      setErreur('Le fichier dépasse 1 Mo.');
      return;
    }
    setFichier(f);
    setType(deviner(f.name));
  }

  function envoyer(e) {
    e.preventDefault();
    if (!fichier) {
      setErreur('Choisissez d’abord un fichier.');
      return;
    }
    lancer(async () => validerFichier({ jeu, fichier: type, contenu: await fichier.text() }));
  }

  const routesOuvertes = reseau.routes.filter((r) => r.statut === 'ouvert').length;

  return (
    <Espace
      titreCommandes="Données"
      commandes={
        <div className="formulaire">
          <Selecteur id="do-jeu" label="Jeu de données" valeur={jeu} onChange={setJeu}
            options={[['petit', 'Petite ville, 10 sites'], modeFactice ? ['ville', 'Novapolis, 100 sites (avec l’API)', true] : ['ville', 'Novapolis, 100 sites']]} />
          <form onSubmit={envoyer} className="formulaire" noValidate>
            <div className="champ">
              <label htmlFor="do-fichier">Vérifier un fichier CSV</label>
              <input id="do-fichier" type="file" accept=".csv,text/csv" onChange={choisir} />
            </div>
            {fichier && (
              <Selecteur id="do-type" label="Ce fichier remplace" valeur={type} onChange={setType} options={TYPES} />
            )}
            {erreur && <Erreur>{erreur}</Erreur>}
            <button type="submit" className="bouton" disabled={chargement}>{chargement ? 'Vérification…' : 'Vérifier'}</button>
            <p className="aide">Le fichier est comparé au reste du jeu choisi, puis effacé. Rien n’est enregistré.</p>
          </form>
          {erreurServeur && <Erreur>{erreurServeur}</Erreur>}
          {donnees && donnees.nb_erreurs === 0 && (
            <p className="confirmation" role="status">{donnees.fichier} : aucune erreur, le fichier est valide.</p>
          )}
          {donnees && donnees.nb_erreurs > 0 && (
            <div role="status">
              <Erreur>{donnees.fichier} : {donnees.nb_erreurs} erreur{donnees.nb_erreurs > 1 ? 's' : ''}.</Erreur>
              <ul className="liste-erreurs">
                {donnees.erreurs.map((e) => <li key={e}>{e}</li>)}
              </ul>
              {donnees.nb_erreurs > donnees.erreurs.length && <p className="aide">Seules les 50 premières sont affichées.</p>}
            </div>
          )}
        </div>
      }
      titrePlan="Aperçu"
      plan={<Plan reseau={reseau} description="Aperçu du jeu de données" />}
      resultats={
        <div className="tableau-boite">
          <table>
            <caption className="visuellement-cache">Contenu du jeu de données</caption>
            <tbody>
              <tr><th scope="row">Sites</th><td className="nombre">{reseau.sites.length}</td></tr>
              <tr><th scope="row">Routes ouvertes</th><td className="nombre">{routesOuvertes}</td></tr>
              <tr><th scope="row">Tronçons de fibre</th><td className="nombre">{reseau.fibre.length}</td></tr>
              <tr><th scope="row">Demandes</th><td className="nombre">{reseau.demandes.length}</td></tr>
            </tbody>
          </table>
          <p className="tableau-note">Ville inventée, données synthétiques.</p>
        </div>
      }
    />
  );
}
