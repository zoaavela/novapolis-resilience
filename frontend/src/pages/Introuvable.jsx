import { Link } from 'react-router-dom';
import { useTitre } from '../hooks.js';

export default function Introuvable() {
  useTitre('Page introuvable', 'Cette page n’existe pas.');
  return (
    <div className="introuvable conteneur">
      <section className="panneau introuvable-boite" aria-labelledby="t-404">
        <svg className="introuvable-barriere" viewBox="0 0 120 70" aria-hidden="true" shapeRendering="crispEdges">
          <rect x="22" y="34" width="8" height="30" fill="#241B4B" />
          <rect x="90" y="34" width="8" height="30" fill="#241B4B" />
          <rect x="8" y="24" width="104" height="14" fill="#FFFFFF" stroke="#241B4B" strokeWidth="3" />
          {[12, 36, 60, 84].map((x) => <rect key={x} x={x} y="27" width="12" height="8" fill="#D7262B" />)}
          <g className="nv-flamme"><rect x="34" y="4" width="14" height="20" fill="#FF8A3D" /><rect x="38" y="12" width="6" height="12" fill="#FFC628" /></g>
          <g className="nv-flamme nv-flamme-2"><rect x="70" y="8" width="14" height="16" fill="#FF8A3D" /><rect x="74" y="14" width="6" height="10" fill="#FFC628" /></g>
        </svg>
        <p className="introuvable-code">404</p>
        <h1 id="t-404">Route barrée</h1>
        <p>Cette page n’existe pas, ou elle a été déplacée. Même Dijkstra ne trouve pas de chemin jusqu’ici.</p>
        <Link to="/" className="bouton bouton-principal">Revenir à l’accueil</Link>
      </section>
    </div>
  );
}
