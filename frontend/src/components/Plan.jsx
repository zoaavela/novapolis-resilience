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

const L = 680;
const H = 430;
const px = (s) => s.x * 64 + 24;
const py = (s) => (5.4 - s.y) * 76 + 16;
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
  description = 'Plan de la ville de Novapolis',
}) {
  if (!reseau) return null;
  const pos = Object.fromEntries(reseau.sites.map((s) => [s.id, { ...s, x: px(s), y: py(s) }]));
  const fermesCles = new Set(fermes.map(([u, v]) => `${u}>${v}`));
  const isolesSet = new Set(isoles);

  // Regroupe les arcs orientés en liaisons à dessiner.
  const liaisons = new Map();
  if (mode === 'routes') {
    for (const r of reseau.routes) {
      const k = cle(r.u, r.v);
      const l = liaisons.get(k) ?? { u: r.u, v: r.v, sens: [], ferme: false, scenario: false, temps: r.temps_normal };
      l.sens.push([r.u, r.v]);
      if (r.statut !== 'ouvert') l.ferme = true;
      if (fermesCles.has(`${r.u}>${r.v}`)) {
        l.ferme = true;
        l.scenario = true;
      }
      liaisons.set(k, l);
    }
  } else {
    for (const f of reseau.fibre) {
      liaisons.set(cle(f.u, f.v), { u: f.u, v: f.v, sens: [], ferme: f.statut !== 'disponible', cout: f.cout });
    }
  }

  const dansArbre = new Set((arbre ?? []).map(([u, v]) => cle(u, v)));
  const panneCle = panne ? cle(...panne) : null;
  const repCle = reparation ? cle(reparation[0], reparation[1]) : null;

  return (
    <svg viewBox={`0 0 ${L} ${H}`} role="img" aria-label={description} className="plan">
      <defs>
        <marker id="fleche" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto">
          <path d="M0 0 L10 5 L0 10 z" fill="#6B6790" />
        </marker>
      </defs>

      {[...liaisons.values()].map((l) => {
        const a = pos[l.u];
        const b = pos[l.v];
        const k = cle(l.u, l.v);
        const unique = mode === 'routes' && l.sens.length === 1;
        const [su, sv] = unique ? l.sens[0] : [l.u, l.v];
        const depart = pos[su];
        const arrivee = unique ? raccourcir(pos[su], pos[sv], 20) : pos[sv];
        const mx = (a.x + b.x) / 2;
        const my = (a.y + b.y) / 2;
        let trait = { stroke: '#9E9BB8', strokeWidth: 3 };
        if (mode === 'fibre') {
          trait = dansArbre.has(k) ? { stroke: '#0A7A3B', strokeWidth: 6 } : { stroke: '#B8B5CC', strokeWidth: 2, strokeDasharray: '4 6' };
          if (l.ferme) trait = { stroke: '#D9D7E3', strokeWidth: 2, strokeDasharray: '2 6' };
          if (k === panneCle) trait = { stroke: '#D7262B', strokeWidth: 4, strokeDasharray: '8 6' };
          if (k === repCle) trait = { stroke: '#FFC628', strokeWidth: 7 };
        } else if (l.ferme) {
          trait = { stroke: '#D7262B', strokeWidth: 3, strokeDasharray: '8 6' };
        }
        return (
          <g key={k}>
            {mode === 'fibre' && k === repCle && (
              <line x1={a.x} y1={a.y} x2={b.x} y2={b.y} stroke="#241B4B" strokeWidth="11" />
            )}
            <line
              x1={depart.x}
              y1={depart.y}
              x2={arrivee.x}
              y2={arrivee.y}
              strokeLinecap="round"
              markerEnd={unique && !l.ferme ? 'url(#fleche)' : undefined}
              {...trait}
            />
            {mode === 'fibre' && (dansArbre.has(k) || k === repCle) && (
              <text x={mx} y={my - 8} className="plan-cote">{l.cout} k€</text>
            )}
            {((mode === 'routes' && l.scenario) || (mode === 'fibre' && k === panneCle)) && (
              <Barriere x={mx} y={my} />
            )}
          </g>
        );
      })}

      {chemin && chemin.length > 1 && (
        <g>
          <polyline points={chemin.map((id) => `${pos[id].x},${pos[id].y}`).join(' ')} fill="none" stroke="#241B4B" strokeWidth="12" strokeLinejoin="round" strokeLinecap="round" />
          <polyline points={chemin.map((id) => `${pos[id].x},${pos[id].y}`).join(' ')} fill="none" stroke="#FFC628" strokeWidth="7" strokeLinejoin="round" strokeLinecap="round" />
          <polyline points={chemin.map((id) => `${pos[id].x},${pos[id].y}`).join(' ')} fill="none" stroke="#241B4B" strokeWidth="2.5" strokeDasharray="4 12" strokeLinecap="round" className="nv-trajet" />
        </g>
      )}

      {reseau.sites.map((s) => {
        const p = pos[s.id];
        const atteint = niveaux ? s.id in niveaux : null;
        const coupe = isolesSet.has(s.id) || atteint === false;
        return (
          <g key={s.id} shapeRendering="crispEdges">
            {niveaux && atteint && (
              <rect x={p.x - 21} y={p.y - 21} width="42" height="42" fill="none" stroke="#0A7A3B" strokeWidth="3" />
            )}
            {coupe && (
              <rect x={p.x - 22} y={p.y - 22} width="44" height="44" fill="none" stroke="#D7262B" strokeWidth="3" className="nv-pulse" />
            )}
            <Icone type={s.type} x={p.x} y={p.y} coupe={coupe} />
            <text x={p.x} y={p.y + 34} className={coupe ? 'plan-etiquette plan-etiquette-alerte' : 'plan-etiquette'}>
              {s.id}
              {niveaux && atteint ? ` · ${niveaux[s.id]}` : ''}
            </text>
          </g>
        );
      })}
    </svg>
  );
}
