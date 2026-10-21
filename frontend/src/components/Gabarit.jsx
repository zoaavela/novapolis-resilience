import { Link, NavLink, Outlet } from 'react-router-dom';
import Ciel from './Ciel.jsx';

const MODULES = [
  ['accessibilite', 'Accessibilité'],
  ['itineraire', 'Itinéraire'],
  ['scenarios', 'Scénarios'],
  ['fibre', 'Fibre'],
  ['donnees', 'Données'],
  ['a-propos', 'À propos'],
];

export { MODULES };

export default function Gabarit() {
  return (
    <div className="page">
      <a className="lien-evitement" href="#contenu">Aller au contenu</a>
      <header className="entete">
        <Ciel />
        <div className="entete-contenu conteneur">
          <Link to="/" className="marque">
            <span className="marque-nom">Novapolis</span>
            <span className="marque-sous">Régulation des secours et du réseau de fibre</span>
          </Link>
          <nav aria-label="Modules" className="onglets">
            {MODULES.map(([id, nom]) => (
              <NavLink key={id} to={`/outil/${id}`} className="onglet">
                {nom}
              </NavLink>
            ))}
          </nav>
        </div>
      </header>

      <main id="contenu" className="principal">
        <Outlet />
      </main>

      <footer className="pied conteneur">
        <p>Novapolis est une ville inventée. Toutes les données sont synthétiques.</p>
        <nav aria-label="Liens de bas de page" className="pied-liens">
          <Link to="/credits">Crédits</Link>
          <Link to="/mentions-legales">Mentions légales</Link>
          <a href="https://github.com/zoaavela/novapolis-resilience">Code source</a>
          <a href="mailto:[ADRESSE DE CONTACT]">Contact</a>
        </nav>
      </footer>
    </div>
  );
}
