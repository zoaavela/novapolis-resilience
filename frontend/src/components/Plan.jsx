// Plan de la ville dessiné en SVG à partir des coordonnées des sites.
//
// props :
//   reseau        { sites, routes, fibre }
//   mode          "routes" | "fibre"
//   chemin        [ids] trajet à surligner
//   fermes        [[u, v]] arcs fermés par le scénario
//   niveaux       { id: n } sites atteints (accessibilité)
//   arbre         [[u, v, cout]] arêtes de l'arbre couvrant
//   panne         [u, v] tronçon de fibre en panne
//   reparation    [u, v, cout] tronçon de remplacement
//   isoles        [ids] sites à signaler comme coupés
//   description   texte lu par les lecteurs d'écran
//   pointe        true pour afficher les temps de l'heure de pointe
//
// Le plan a sa propre barre d'outils : interrupteur des poids et zoom.

import { useEffect, useMemo, useRef, useState } from 'react';

const MARGE = 40;

// Calcule l'échelle à partir des coordonnées : le plan remplit le cadre quelle
// que soit la ville (10 ou 100 sites). Plus il y a de sites, plus le plan est
// grand : sur la ville de 100, on voit l'ensemble puis on zoome pour les détails.
function echelle(sites) {
  const xs = sites.map((s) => s.x);
  const ys = sites.map((s) => s.y);
  const minX = Math.min(...xs);
  const maxY = Math.max(...ys);
  const largeurDonnees = Math.max(...xs) - minX || 1;
  const hauteurDonnees = maxY - Math.min(...ys) || 1;
  const L = Math.max(760, Math.round(Math.sqrt(sites.length) * 150));
  const k = (L - 2 * MARGE) / largeurDonnees;
  const H = Math.round(hauteurDonnees * k + 2 * MARGE);
  const px = (s) => (s.x - minX) * k + MARGE;
  const py = (s) => (maxY - s.y) * k + MARGE; // y vers le haut sur la carte, vers le bas en SVG

  let ecart = Infinity; // distance entre les deux sites les plus proches, en pixels
  for (let i = 0; i < sites.length; i++) {
    for (let j = i + 1; j < sites.length; j++) {
      ecart = Math.min(ecart, Math.hypot(px(sites[i]) - px(sites[j]), py(sites[i]) - py(sites[j])));
    }
  }
  const taille = Math.max(0.6, Math.min(1, ecart / 80));
  return { L, H, k, px, py, taille };
}

// --- Placement des noms : on essaie 8 positions autour de l'icône et on garde
// celle qui touche le moins de routes, d'icônes et d'autres noms.
const POSITIONS = [
  { dx: 0, dy: 1, ancre: 'middle' }, // dessous
  { dx: 0, dy: -1, ancre: 'middle' }, // dessus
  { dx: 1, dy: 0, ancre: 'start' }, // droite
  { dx: -1, dy: 0, ancre: 'end' }, // gauche
  { dx: 1, dy: 1, ancre: 'start' },
  { dx: -1, dy: 1, ancre: 'end' },
  { dx: 1, dy: -1, ancre: 'start' },
  { dx: -1, dy: -1, ancre: 'end' },
];

// Le segment [a, b] traverse-t-il le rectangle r ? (découpage de Liang-Barsky)
function coupeRect(a, b, r) {
  let t0 = 0;
  let t1 = 1;
  const dx = b.x - a.x;
  const dy = b.y - a.y;
  const bords = [[-dx, a.x - r.x1], [dx, r.x2 - a.x], [-dy, a.y - r.y1], [dy, r.y2 - a.y]];
  for (const [pp, q] of bords) {
    if (pp === 0) {
      if (q < 0) return false;
    } else {
      const t = q / pp;
      if (pp < 0) t0 = Math.max(t0, t);
      else t1 = Math.min(t1, t);
      if (t0 > t1) return false;
    }
  }
  return true;
}
const chevauche = (r, s) => r.x1 < s.x2 && s.x1 < r.x2 && r.y1 < s.y2 && s.y1 < r.y2;

function placerNoms(sites, pos, segments, taille, police) {
  const demi = 17 * taille; // demi-côté de l'icône, avec un peu d'air
  const icones = sites.map((s) => ({ id: s.id, x1: pos[s.id].x - demi, x2: pos[s.id].x + demi, y1: pos[s.id].y - demi, y2: pos[s.id].y + demi }));
  const places = [];
  const resultat = {};
  for (const s of sites) {
    const p = pos[s.id];
    const largeur = s.id.length * police * 0.62;
    let meilleur = null;
    POSITIONS.forEach((c, rang) => {
      const cx = p.x + c.dx * (demi + 4);
      const cy = p.y + c.dy * (demi + police * 0.6);
      const x1 = c.ancre === 'start' ? cx : c.ancre === 'end' ? cx - largeur : cx - largeur / 2;
      const r = { x1, x2: x1 + largeur, y1: cy - police / 2, y2: cy + police / 2 };
      let score = rang * 0.1; // à égalité, on préfère « dessous »
      for (const [a, b] of segments) if (coupeRect(a, b, r)) score += 3;
      for (const ic of icones) if (ic.id !== s.id && chevauche(r, ic)) score += 5;
      for (const autre of places) if (chevauche(r, autre)) score += 4;
      if (!meilleur || score < meilleur.score) meilleur = { score, x: cx, y: cy, ancre: c.ancre, r };
    });
    places.push(meilleur.r);
    resultat[s.id] = meilleur;
  }
  return resultat;
}

const cle = (u, v) => [u, v].sort().join('|');

function raccourcir(a, b, marge) {
  const dx = b.x - a.x;
  const dy = b.y - a.y;
  const d = Math.hypot(dx, dy) || 1;
  return { x: b.x - (dx / d) * marge, y: b.y - (dy / d) * marge };
}

function Icone({ type, x, y, coupe }) {
  const bord = coupe ? '#D7262B' : '#241B4B';
  const ep = coupe ? 4 : 3;
  const base = { x: x - 15, y: y - 15, width: 30, height: 30, stroke: bord, strokeWidth: ep };
  switch (type) {
    case 'caserne':
      return (
        <g>
          <rect {...base} fill="#D7262B" />
          <rect x={x - 8} y={y - 2} width="16" height="13" fill="#FFFFFF" />
          <rect x={x - 6} y={y - 22} width="12" height="6" fill="#D7262B" className="nv-gyro" />
        </g>
      );
    case 'hopital':
      return (
        <g>
          <rect {...base} fill="#FFFFFF" />
          <rect x={x - 4} y={y - 10} width="8" height="20" fill="#D7262B" />
          <rect x={x - 10} y={y - 4} width="20" height="8" fill="#D7262B" />
        </g>
      );
    case 'ecole':
      return (
        <g>
          <rect {...base} fill="#4A4390" />
          <rect x={x - 9} y={y - 6} width="6" height="6" fill="#FFE27A" />
          <rect x={x + 3} y={y - 6} width="6" height="6" fill="#FFE27A" />
          <rect x={x - 4} y={y + 4} width="8" height="11" fill="#FFFFFF" />
        </g>
      );
    case 'telecom':
      return (
        <g>
          <rect {...base} fill="#C9C6DA" />
          <rect x={x - 2} y={y - 11} width="4" height="22" fill="#241B4B" />
          <rect x={x - 9} y={y - 4} width="18" height="3" fill="#241B4B" />
          <rect x={x - 3} y={y - 15} width="6" height="5" fill="#D7262B" className="nv-balise" />
        </g>
      );
    default:
      return (
        <g>
          <rect {...base} fill={coupe ? '#FFFFFF' : '#C9C6DA'} />
          <rect x={x - 6} y={y - 5} width="12" height="10" fill={coupe ? '#D7262B' : '#241B4B'} />
        </g>
      );
  }
}

function Barriere({ x, y }) {
  return (
    <g shapeRendering="crispEdges">
      <rect x={x - 14} y={y + 2} width="4" height="12" fill="#241B4B" />
      <rect x={x + 10} y={y + 2} width="4" height="12" fill="#241B4B" />
      <rect x={x - 20} y={y - 4} width="40" height="7" fill="#FFFFFF" stroke="#241B4B" strokeWidth="1.5" />
      {[-18, -6, 6].map((d) => (
        <rect key={d} x={x + d} y={y - 3} width="6" height="5" fill="#D7262B" />
      ))}
      <g className="nv-flamme">
        <rect x={x - 11} y={y - 16} width="8" height="12" fill="#FF8A3D" />
        <rect x={x - 9} y={y - 12} width="4" height="8" fill="#FFC628" />
      </g>
      <g className="nv-flamme nv-flamme-2">
        <rect x={x + 3} y={y - 14} width="8" height="10" fill="#FF8A3D" />
        <rect x={x + 5} y={y - 10} width="4" height="6" fill="#FFC628" />
      </g>
    </g>
  );
}

export default function Plan({
  reseau,
  mode = 'routes',
  chemin = null,
  fermes = [],
  niveaux = null,
  arbre = null,
  panne = null,
  reparation = null,
  isoles = [],
  pointe = false,
  description = 'Plan de la ville de Novapolis',
}) {
  const nbSites = reseau?.sites.length ?? 0;
  const dense = nbSites > 30; // la ville de 100 sites
  const [voirPoids, setVoirPoids] = useState(true);
  const [zoom, setZoom] = useState(1);
  const [centre, setCentre] = useState(null); // point regardé, en unités du plan
  const [plein, setPlein] = useState(false); // plein écran
  const svgRef = useRef(null);
  const glisse = useRef(null);

  // Ctrl + molette (ou pincer sur un pavé tactile) = zoom. La molette seule
  // continue de faire défiler la page.
  useEffect(() => {
    const svg = svgRef.current;
    if (!svg) return undefined;
    const molette = (e) => {
      if (!e.ctrlKey && !e.metaKey) return;
      e.preventDefault();
      setZoom((z) => borner(z * (e.deltaY < 0 ? 1.25 : 0.8), 1, 8));
    };
    svg.addEventListener('wheel', molette, { passive: false });
    return () => svg.removeEventListener('wheel', molette);
  }, []);

  // Échap ferme le plein écran.
  useEffect(() => {
    if (!plein) return undefined;
    const touche = (e) => e.key === 'Escape' && setPlein(false);
    window.addEventListener('keydown', touche);
    document.body.style.overflow = 'hidden';
    return () => {
      window.removeEventListener('keydown', touche);
      document.body.style.overflow = '';
    };
  }, [plein]);

  // Tous les calculs de mise en page, refaits seulement quand la ville change.
  const plan = useMemo(() => {
    if (!reseau) return null;
    const e = echelle(reseau.sites);
    const pos = Object.fromEntries(reseau.sites.map((s) => [s.id, { ...s, x: e.px(s), y: e.py(s) }]));
    const segments = (mode === 'routes' ? reseau.routes : reseau.fibre).map((r) => [pos[r.u], pos[r.v]]);
    const police = 13 * e.taille;
    const noms = placerNoms(reseau.sites, pos, segments, e.taille, police);
    const riviere = reseau.decor?.riviere?.map(([x, y]) => [e.px({ x }), e.py({ y })]) ?? null;
    return { ...e, pos, noms, police, riviere };
  }, [reseau, mode]);

  if (!plan) return null;
  const { L, H, k, pos, noms, police, taille, riviere } = plan;
  const fermesCles = new Set(fermes.map(([u, v]) => `${u}>${v}`));
  const isolesSet = new Set(isoles);

  // Fenêtre visible (viewBox) selon le zoom : plus on zoome, plus elle est petite.
  const vw = L / zoom;
  const vh = H / zoom;
  const c = centre ?? { x: L / 2, y: H / 2 };
  const vx = borner(c.x - vw / 2, 0, L - vw);
  const vy = borner(c.y - vh / 2, 0, H - vh);

  // Sur la grande ville, on n'affiche les détails qu'une fois zoomé.
  const detail = !dense || zoom >= 1.8;
  const nomsVisibles = (s) => detail || s.type !== 'quartier';
  const poidsLisibles = voirPoids;

  function debutGlisse(e) {
    if (zoom === 1) return;
    glisse.current = { x: e.clientX, y: e.clientY, cx: vx + vw / 2, cy: vy + vh / 2 };
    e.currentTarget.setPointerCapture(e.pointerId);
  }
  function enGlisse(e) {
    const g = glisse.current;
    if (!g) return;
    const parPixel = vw / svgRef.current.getBoundingClientRect().width;
    setCentre({ x: g.cx - (e.clientX - g.x) * parPixel, y: g.cy - (e.clientY - g.y) * parPixel });
  }
  function finGlisse() {
    glisse.current = null;
  }

  // Regroupe les arcs orientés en liaisons à dessiner.
  const liaisons = new Map();
  if (mode === 'routes') {
    for (const r of reseau.routes) {
      const kk = cle(r.u, r.v);
      const l = liaisons.get(kk) ?? { u: r.u, v: r.v, sens: [], temps: [], ferme: false, scenario: false };
      l.sens.push([r.u, r.v]);
      l.temps.push(pointe ? r.temps_pointe : r.temps_normal);
      if (r.statut !== 'ouvert') l.ferme = true;
      if (fermesCles.has(`${r.u}>${r.v}`)) {
        l.ferme = true;
        l.scenario = true;
      }
      liaisons.set(kk, l);
    }
  } else {
    for (const f of reseau.fibre) {
      liaisons.set(cle(f.u, f.v), { u: f.u, v: f.v, sens: [], ferme: f.statut !== 'disponible', cout: f.cout });
    }
  }

  // Une route qui franchit la rivière est un pont.
  const xRiviere = riviere ? riviere.reduce((t, [x]) => t + x, 0) / riviere.length : null;
  const estPont = (a, b) => xRiviere !== null && (a.x - xRiviere) * (b.x - xRiviere) < 0;

  const dansArbre = new Set((arbre ?? []).map(([u, v]) => cle(u, v)));
  const panneCle = panne ? cle(...panne) : null;
  const repCle = reparation ? cle(reparation[0], reparation[1]) : null;
  const marge = 19 * taille; // les flèches s'arrêtent au bord des icônes
  const policePoids = 12 * taille;
  const nsl = { vectorEffect: 'non-scaling-stroke' };
  const pastilles = []; // épaisseur constante à l'écran, même zoomé

  return (
    <div className={plein ? 'plan-cadre plan-plein' : 'plan-cadre'} role={plein ? 'dialog' : undefined} aria-label={plein ? 'Plan en plein écran' : undefined}>
      <div className="plan-outils">
        <label className="interrupteur">
          <input type="checkbox" role="switch" checked={voirPoids} onChange={(e) => setVoirPoids(e.target.checked)} />
          <span className="interrupteur-piste" aria-hidden="true"><span className="interrupteur-bouton" /></span>
          {mode === 'routes' ? `Temps des routes, en min${pointe ? ' (pointe)' : ''}` : 'Coûts de la fibre, en k€'}
        </label>
        <div className="plan-zoom" role="group" aria-label="Zoom du plan">
          <button type="button" onClick={() => setZoom((z) => borner(z * 1.5, 1, 8))} aria-label="Zoomer">+</button>
          <button type="button" onClick={() => setZoom((z) => borner(z / 1.5, 1, 8))} aria-label="Dézoomer" disabled={zoom === 1}>−</button>
          <button type="button" onClick={() => { setZoom(1); setCentre(null); }} disabled={zoom === 1}>Tout voir</button>
          <button type="button" onClick={() => setPlein((v) => !v)}>{plein ? 'Fermer' : 'Plein écran'}</button>
        </div>
      </div>
      <svg
        ref={svgRef}
        viewBox={`${vx} ${vy} ${vw} ${vh}`}
        role="img"
        aria-label={description}
        className={zoom > 1 ? 'plan plan-zoome' : 'plan'}
        onPointerDown={debutGlisse}
        onPointerMove={enGlisse}
        onPointerUp={finGlisse}
        onPointerCancel={finGlisse}
      >
        <defs>
          {/* auto-start-reverse : la même flèche sert aux deux bouts d'une route */}
          <marker id="fleche" viewBox="0 0 10 10" refX="9" refY="5" markerUnits="userSpaceOnUse"
            markerWidth={12 * taille} markerHeight={12 * taille} orient="auto-start-reverse">
            <path d="M0 0 L10 5 L0 10 z" fill="#6B6790" />
          </marker>
        </defs>

        {riviere && (
          <g aria-hidden="true">
            <polyline points={riviere.map((p) => p.join(',')).join(' ')} fill="none" stroke="#9CCBF0" strokeWidth={k * 1.15} strokeLinejoin="round" />
            <polyline points={riviere.map((p) => p.join(',')).join(' ')} fill="none" stroke="#5FA8E0" strokeWidth={k * 0.75} strokeLinejoin="round" />
            <polyline points={riviere.map((p) => p.join(',')).join(' ')} fill="none" stroke="#FFFFFF" strokeOpacity="0.5"
              strokeWidth={k * 0.06} strokeDasharray={`${k * 0.5} ${k * 0.9}`} className="nv-courant" />
            {reseau.decor?.nom && (
              <text x={xRiviere} y={H - 18} className="plan-riviere">{reseau.decor.nom}</text>
            )}
          </g>
        )}

        {[...liaisons.values()].map((l) => {
          const a = pos[l.u];
          const b = pos[l.v];
          const kk = cle(l.u, l.v);
          const unique = mode === 'routes' && l.sens.length === 1;
          const [su, sv] = unique ? l.sens[0] : [l.u, l.v];
          const depart = mode === 'routes' ? raccourcir(pos[sv], pos[su], marge) : pos[su];
          const arrivee = mode === 'routes' ? raccourcir(pos[su], pos[sv], marge) : pos[sv];
          const mx = (a.x + b.x) / 2;
          const my = (a.y + b.y) / 2;
          let trait = { stroke: '#9E9BB8', strokeWidth: 2.5 };
          if (mode === 'fibre') {
            trait = dansArbre.has(kk) ? { stroke: '#0A7A3B', strokeWidth: 5 } : { stroke: '#B8B5CC', strokeWidth: 1.5, strokeDasharray: '4 6' };
            if (l.ferme) trait = { stroke: '#D9D7E3', strokeWidth: 1.5, strokeDasharray: '2 6' };
            if (kk === panneCle) trait = { stroke: '#D7262B', strokeWidth: 4, strokeDasharray: '8 6' };
            if (kk === repCle) trait = { stroke: '#FFC628', strokeWidth: 6 };
          } else if (l.ferme) {
            trait = { stroke: '#D7262B', strokeWidth: 2.5, strokeDasharray: '7 5' };
          }
          const fleches = mode === 'routes' && !l.ferme;
          const poids = mode === 'routes' ? [...new Set(l.temps)].join(' / ') : String(l.cout);
          const infobulle = mode === 'routes'
            ? l.sens.map(([u, v], i) => `${u} → ${v} : ${l.temps[i]} min`).join('\n') + (l.ferme ? '\nfermée' : '')
            : `${l.u} – ${l.v} : ${l.cout} k€${l.ferme ? ' (indisponible)' : ''}`;
          const afficherPoids = mode === 'routes'
            ? poidsLisibles
            : dansArbre.has(kk) || kk === repCle || (voirPoids && !l.ferme);
          const largeurPoids = poids.length * 0.62 * policePoids + 8 * taille;
          // Les pastilles sont dessinées plus tard, par-dessus le trajet surligné.
          if (afficherPoids) {
            pastilles.push(
              <g key={`p-${kk}`} className="plan-poids">
                <rect x={mx - largeurPoids / 2} y={my - policePoids * 0.75} width={largeurPoids} height={policePoids * 1.5} rx={3 * taille} />
                <text x={mx} y={my} style={{ fontSize: policePoids }}>{poids}</text>
              </g>,
            );
          }

          return (
            <g key={kk}>
              <title>{infobulle}</title>
              {mode === 'routes' && estPont(a, b) && (
                <line x1={a.x} y1={a.y} x2={b.x} y2={b.y} stroke="#8C6A4A" strokeWidth="9" {...nsl} />
              )}
              {mode === 'fibre' && kk === repCle && (
                <line x1={a.x} y1={a.y} x2={b.x} y2={b.y} stroke="#241B4B" strokeWidth="10" {...nsl} />
              )}
              <line x1={a.x} y1={a.y} x2={b.x} y2={b.y} stroke="transparent" strokeWidth="12" {...nsl} />
              <line
                x1={depart.x} y1={depart.y} x2={arrivee.x} y2={arrivee.y}
                strokeLinecap="round"
                markerEnd={fleches ? 'url(#fleche)' : undefined}
                markerStart={fleches && !unique ? 'url(#fleche)' : undefined}
                {...trait}
                {...nsl}
              />
              {((mode === 'routes' && l.scenario) || (mode === 'fibre' && kk === panneCle)) && (
                <g transform={`translate(${mx} ${my}) scale(${taille}) translate(${-mx} ${-my})`}>
                  <Barriere x={mx} y={my} />
                </g>
              )}
            </g>
          );
        })}

        {chemin && chemin.length > 1 && (
          <g>
            <polyline points={chemin.map((id) => `${pos[id].x},${pos[id].y}`).join(' ')} fill="none" stroke="#241B4B" strokeWidth="11" strokeLinejoin="round" strokeLinecap="round" {...nsl} />
            <polyline points={chemin.map((id) => `${pos[id].x},${pos[id].y}`).join(' ')} fill="none" stroke="#FFC628" strokeWidth="6" strokeLinejoin="round" strokeLinecap="round" {...nsl} />
            <polyline points={chemin.map((id) => `${pos[id].x},${pos[id].y}`).join(' ')} fill="none" stroke="#241B4B" strokeWidth="2" strokeDasharray="4 12" strokeLinecap="round" className="nv-trajet" {...nsl} />
          </g>
        )}

        {pastilles}

        {reseau.sites.map((s) => {
          const p = pos[s.id];
          const atteint = niveaux ? s.id in niveaux : null;
          const coupe = isolesSet.has(s.id) || atteint === false;
          return (
            <g key={s.id} shapeRendering="crispEdges"
              transform={taille < 1 ? `translate(${p.x} ${p.y}) scale(${taille}) translate(${-p.x} ${-p.y})` : undefined}>
              <title>{`${s.id} · ${s.nom}`}</title>
              {niveaux && atteint && (
                <rect x={p.x - 21} y={p.y - 21} width="42" height="42" fill="none" stroke="#0A7A3B" strokeWidth="3" />
              )}
              {coupe && (
                <rect x={p.x - 22} y={p.y - 22} width="44" height="44" fill="none" stroke="#D7262B" strokeWidth="3" className="nv-pulse" />
              )}
              <Icone type={s.type} x={p.x} y={p.y} coupe={coupe} />
            </g>
          );
        })}

        {/* Les noms en dernier : ils passent au-dessus de tout le reste */}
        {reseau.sites.filter(nomsVisibles).map((s) => {
          const n = noms[s.id];
          const atteint = niveaux ? s.id in niveaux : null;
          const coupe = isolesSet.has(s.id) || atteint === false;
          return (
            <text key={s.id} x={n.x} y={n.y} textAnchor={n.ancre} style={{ fontSize: police }}
              className={coupe ? 'plan-etiquette plan-etiquette-alerte' : 'plan-etiquette'}>
              {s.id}
              {niveaux && atteint ? ` · ${niveaux[s.id]}` : ''}
            </text>
          );
        })}
      </svg>
      {dense && zoom < 1.8 && <p className="plan-astuce">Vue d’ensemble : zoomez avec + pour voir le nom de chaque quartier.</p>}
      {zoom > 1 && <p className="plan-astuce">Glissez pour vous déplacer. Ctrl + molette pour zoomer.</p>}
    </div>
  );
}

function borner(v, min, max) {
  return Math.min(Math.max(v, min), max);
}
