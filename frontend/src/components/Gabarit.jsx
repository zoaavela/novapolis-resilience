import { Link, NavLink, Outlet } from 'react-router-dom';
import Ciel from './Ciel.jsx';

const MODULES = [
  ['access', 'Accessibilité'],
  ['route', 'Itinéraire'],
  ['scenarios', 'Scénarios'],
  ['fiber', 'Fibre'],
  ['circuits', 'Circuits'],
  ['data', 'Données'],
  ['about', 'À propos'],
];

export { MODULES };

// Barre d'onglets : les modules, puis Benchmark juste avant À propos.
const ONGLETS = [...MODULES.slice(0, -1), ['benchmark', 'Benchmark'], MODULES.at(-1)];

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
            {ONGLETS.map(([id, nom]) => (
              <NavLink key={id} to={`/${id}`} className="onglet">
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
          <Link to="/legal">Mentions légales</Link>
          <a href="https://github.com/zoaavela/novapolis-resilience">Code source</a>
          <a href="mailto:enzooabdi@gmail.com">Contact</a>
        </nav>
      </footer>
    </div>
  );
}