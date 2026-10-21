import { useState } from 'react';
import { Link } from 'react-router-dom';
import VilleCredits from '../components/VilleCredits.jsx';
import { FaBriefcase, FaGithub, FaLinkedin } from 'react-icons/fa';
import { useTitre } from '../hooks.js';
import { DEPOT, EQUIPE } from '../equipe.js';

const BANDEROLES = [
  { titre: 'Novapolis', sous: 'Un projet d’algorithmique et théorie des graphes' },
  ...EQUIPE.map((p) => ({ titre: p.nom, sous: p.role })),
  { titre: 'Merci', sous: 'd’avoir regardé jusqu’à la nuit' },
];

function Avion() {
  return (
    <svg className="avion" viewBox="0 0 40 20" aria-hidden="true" shapeRendering="crispEdges">
      <rect x="4" y="8" width="26" height="6" fill="#FFFFFF" />
      <rect x="0" y="9" width="4" height="4" fill="#C3C3C3" />
      <rect x="10" y="2" width="8" height="6" fill="#D7262B" />
      <rect x="10" y="14" width="8" height="5" fill="#D7262B" />
      <rect x="28" y="4" width="6" height="6" fill="#D7262B" />
      <rect x="6" y="10" width="4" height="2" fill="#BFE3FF" />
      <rect x="30" y="10" width="10" height="2" fill="#241B4B" />
    </svg>
  );
}

function BoutonListe({ icone, nom, champ, ouvert, onBascule }) {
  const id = `liste-${champ}`;
  return (
    <div className="reseau">
      <button type="button" className="lien-pixel lien-pixel-grand" aria-expanded={ouvert} aria-controls={id} onClick={onBascule}>
        {icone}
        <span>{nom}</span>
      </button>
      {ouvert && (
        <ul id={id} className="reseau-liste">
          {EQUIPE.map((p) => (
            <li key={p.nom}>
              {p[champ] ? (
                <a href={p[champ]} target="_blank" rel="noopener noreferrer">{p.nom}</a>
              ) : (
                <span className="reseau-vide">{p.nom} · à venir</span>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default function Credits() {
  useTitre('Crédits', 'L’équipe derrière Novapolis, et où la retrouver.');
  const [tour, setTour] = useState(0);
  const [passe, setPasse] = useState(false);
  const [liste, setListe] = useState(null);

  return (
    <div className={passe ? 'credits credits-fin' : 'credits'} key={tour}>
      <div className="credits-ciel" aria-hidden="true">
        <div className="soleil" />
        <div className="lune" />
        <div className="etoiles">
          {[[8, 14], [17, 30], [26, 9], [38, 22], [47, 12], [59, 27], [66, 8], [74, 19], [83, 11], [91, 25], [12, 40], [53, 38], [86, 36]].map(([x, y]) => (
            <span key={`${x}-${y}`} style={{ left: `${x}%`, top: `${y}%` }} />
          ))}
        </div>
      </div>

      <div className="banderoles" aria-hidden="true">
        {BANDEROLES.map((b, i) => (
          <div key={b.titre} className="banderole" style={{ animationDelay: `${1 + i * 6.5}s`, top: `${10 + (i % 2) * 8}%` }}>
            <Avion />
            <span className="banderole-corde" />
            <span className="banderole-toile">
              <span className="banderole-titre">{b.titre}</span>
              <span className="banderole-sous">{b.sous}</span>
            </span>
          </div>
        ))}
      </div>

      <main id="contenu" className="credits-contenu">
        <h1 className="visuellement-cache">Crédits</h1>
        <div className="reseaux">
          <a className="lien-pixel lien-pixel-grand" href={DEPOT} target="_blank" rel="noopener noreferrer">
            <FaGithub aria-hidden="true" />
            <span>GitHub</span>
          </a>
          <BoutonListe icone={<FaLinkedin aria-hidden="true" />} nom="LinkedIn" champ="linkedin"
            ouvert={liste === 'linkedin'} onBascule={() => setListe((l) => (l === 'linkedin' ? null : 'linkedin'))} />
          <BoutonListe icone={<FaBriefcase aria-hidden="true" />} nom="Portfolio" champ="portfolio"
            ouvert={liste === 'portfolio'} onBascule={() => setListe((l) => (l === 'portfolio' ? null : 'portfolio'))} />
        </div>
        <div className="credits-actions">
          {passe ? (
            <button type="button" className="bouton-discret" onClick={() => { setPasse(false); setTour((t) => t + 1); }}>Revoir</button>
          ) : (
            <button type="button" className="bouton-discret" onClick={() => setPasse(true)}>Passer</button>
          )}
          <Link to="/" className="bouton-discret">Accueil</Link>
        </div>
      </main>

      <div className="credits-ville">
        <VilleCredits />
      </div>
    </div>
  );
}
