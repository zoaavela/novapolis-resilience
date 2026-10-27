import { Link } from 'react-router-dom';
import Ciel from '../components/Ciel.jsx';
import { useTitre } from '../hooks.js';

export default function Accueil() {
  useTitre(null, 'Calculez les trajets des secours et le réseau de fibre de Novapolis, et mesurez ce qui change quand une route ferme.');
  return (
    <div className="accueil-plein">
      <Ciel plein />
      <main id="contenu" className="accueil-centre">
        <h1 className="accueil-titre">Novapolis</h1>
        <p className="accueil-texte">
          Une route ferme, un câble lâche. Combien de minutes perdent les pompiers, et quels quartiers deviennent
          impossibles à atteindre ? Novapolis calcule les trajets des secours et le réseau de fibre d’une ville
          inventée, puis mesure ce qui casse quand on la perturbe.
        </p>
        <div className="accueil-boutons">
          <Link to="/scenarios" className="bouton bouton-principal bouton-grand">Ouvrir l’outil</Link>
          <Link to="/credits" className="bouton-discret">Crédits</Link>
        </div>
      </main>
      <footer className="accueil-pied">
        <Link to="/legal">Mentions légales</Link>
      </footer>
    </div>
  );
}