import { useState } from 'react';
import { Espace, Erreur, Selecteur } from '../../components/Blocs.jsx';
import Plan from '../../components/Plan.jsx';

const TAILLE_MAX = 1024 * 1024; // 1 Mo, vérifié aussi côté serveur

export default function Donnees({ reseau, jeu, setJeu }) {
  const [fichier, setFichier] = useState(null);
  const [erreur, setErreur] = useState(null);
  const [envoye, setEnvoye] = useState(false);

  function choisir(e) {
    const f = e.target.files?.[0] ?? null;
    setEnvoye(false);
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
  }

  function envoyer(e) {
    e.preventDefault();
    if (!fichier) {
      setErreur('Choisissez d’abord un fichier.');
      return;
    }
    // À brancher sur POST /valider quand l'API existera.
    setEnvoye(true);
  }

  const routesOuvertes = reseau.routes.filter((r) => r.statut === 'ouvert').length;

  return (
    <Espace
      titreCommandes="Données"
      commandes={
        <div className="formulaire">
          <Selecteur id="do-jeu" label="Jeu de données" valeur={jeu} onChange={setJeu}
            options={[['petit', 'Petite ville, 10 sites'], ['ville', 'Novapolis, 100 sites (bientôt)', true]]} />
          <form onSubmit={envoyer} className="formulaire" noValidate>
            <div className="champ">
              <label htmlFor="do-fichier">Vérifier un fichier CSV</label>
              <input id="do-fichier" type="file" accept=".csv,text/csv" onChange={choisir} />
            </div>
            {erreur && <Erreur>{erreur}</Erreur>}
            <button type="submit" className="bouton">Vérifier</button>
          </form>
          {envoye && (
            <p className="confirmation" role="status">
              Fichier reçu : {fichier.name}. La vérification sera disponible quand l’API sera branchée.
            </p>
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
