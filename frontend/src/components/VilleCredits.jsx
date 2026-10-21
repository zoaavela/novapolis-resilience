// Ville fixe de la page crédits. Les événements sont réglés en CSS
// (styles.css, section Crédits) sur une durée totale de 36 s.
//
//  3 s  le camion quitte la caserne
//  6 s  une route est barrée, la barrière prend feu
// 12 s  le câble de fibre lâche, l'antenne s'éteint
// 17 s  panne de courant, quartier par quartier
// 22 s  la nuit tombe
// 30 s  le courant revient

const F = '#FFE27A';

// [x, haut, largeur, couleur, quartier de panne (1 à 3), fenêtres]
const IMMEUBLES = [
  [10, 150, 70, '#4A4390', 1, [[22, 166], [52, 166], [22, 186]]],
  [92, 92, 48, '#2E2860', 1, [[102, 108], [122, 108], [102, 132], [122, 156], [102, 180]]],
  [330, 140, 60, '#3B3470', 1, [[342, 156], [366, 156], [342, 180]]],
  [520, 84, 46, '#2E2860', 2, [[530, 100], [548, 124], [530, 148], [548, 172]]],
  [578, 154, 78, '#4A4390', 2, [[590, 168], [620, 168], [590, 188]]],
  [668, 116, 54, '#3B3470', 2, [[680, 132], [700, 156], [680, 180]]],
  [880, 132, 100, '#4A4390', 3, [[896, 148], [926, 148], [956, 148], [896, 176]]],
  [1112, 100, 52, '#3B3470', 3, [[1124, 116], [1144, 140], [1124, 164], [1144, 188]]],
  [1176, 152, 84, '#2E2860', 3, [[1190, 166], [1222, 166], [1190, 186]]],
  [1272, 120, 58, '#4A4390', 3, [[1284, 136], [1306, 160], [1284, 184]]],
  [1342, 160, 98, '#3B3470', 3, [[1356, 176], [1392, 176]]],
];

const SOL = 214;

export default function VilleCredits() {
  return (
    <svg className="vc" viewBox="0 0 1440 260" preserveAspectRatio="xMidYMax slice" aria-hidden="true" shapeRendering="crispEdges">
      {IMMEUBLES.map(([x, haut, l, c, q, fen]) => (
        <g key={x}>
          <rect x={x} y={haut} width={l} height={SOL - haut} fill={c} />
          {fen.map(([fx, fy]) => (
            <rect key={`${fx}-${fy}`} x={fx} y={fy} width="10" height="10" fill={F} className={`vc-fen vc-q${q}`} />
          ))}
        </g>
      ))}

      {/* caserne */}
      <rect x="160" y="150" width="120" height={SOL - 150} fill="#D7262B" />
      <rect x="160" y="140" width="120" height="10" fill="#241B4B" />
      <rect x="210" y="128" width="20" height="12" fill="#D7262B" className="nv-gyro" />
      <rect x="174" y="172" width="40" height={SOL - 172} fill="#FFFFFF" />
      <rect x="226" y="172" width="40" height={SOL - 172} fill="#FFFFFF" />

      {/* hôpital */}
      <rect x="402" y="112" width="104" height={SOL - 112} fill="#FFFFFF" />
      <rect x="402" y="102" width="104" height="10" fill="#241B4B" />
      <rect x="444" y="124" width="20" height="44" fill="#D7262B" />
      <rect x="432" y="136" width="44" height="20" fill="#D7262B" />
      <rect x="418" y="186" width="12" height="12" fill="#9DA9E6" className="vc-fen vc-q1" />
      <rect x="478" y="186" width="12" height="12" fill="#9DA9E6" className="vc-fen vc-q1" />

      {/* antenne télécom et son câble de fibre vers l'école */}
      <rect x="790" y="40" width="8" height={SOL - 40} fill="#241B4B" />
      <rect x="776" y="80" width="36" height="5" fill="#241B4B" />
      <rect x="780" y="120" width="28" height="5" fill="#241B4B" />
      <rect x="788" y="30" width="12" height="10" fill="#D7262B" className="vc-balise" />
      <g className="vc-cable">
        {Array.from({ length: 16 }, (_, i) => (
          <rect key={i} x={800 + i * 5} y={84 + Math.round(i * 3.1)} width="5" height="3" fill="#0A7A3B" />
        ))}
      </g>
      <g className="vc-etincelle">
        <rect x="836" y="96" width="6" height="6" fill="#FFC628" />
        <rect x="830" y="90" width="4" height="4" fill="#FFFFFF" />
        <rect x="844" y="104" width="4" height="4" fill="#FF8A3D" />
        <rect x="844" y="90" width="4" height="4" fill="#FFC628" />
      </g>

      {/* école et son drapeau */}
      <rect x="880" y="124" width="4" height="8" fill="#241B4B" />
      <rect x="928" y="96" width="4" height="36" fill="#241B4B" />
      <rect x="932" y="96" width="18" height="12" fill="#FFC628" className="nv-drapeau" />

      {/* sol et route */}
      <rect x="0" y={SOL} width="1440" height="46" fill="#0A7A3B" />
      <rect x="0" y={SOL} width="1440" height="6" fill="#14B88F" />
      <rect x="0" y={SOL + 14} width="1440" height="18" fill="#3D3A52" />
      {[40, 200, 360, 520, 680, 840, 1000, 1160, 1320].map((x) => (
        <rect key={x} x={x} y={SOL + 22} width="30" height="3" fill={F} />
      ))}

      {/* barrière qui apparaît sur la route */}
      <g className="vc-barriere">
        <rect x="1000" y={SOL + 4} width="6" height="26" fill="#241B4B" />
        <rect x="1050" y={SOL + 4} width="6" height="26" fill="#241B4B" />
        <rect x="990" y={SOL - 6} width="76" height="12" fill="#FFFFFF" stroke="#241B4B" strokeWidth="2" />
        {[992, 1012, 1032, 1052].map((x) => (
          <rect key={x} x={x} y={SOL - 4} width="10" height="8" fill="#D7262B" />
        ))}
        <g className="nv-flamme">
          <rect x="1010" y={SOL - 26} width="14" height="20" fill="#FF8A3D" />
          <rect x="1014" y={SOL - 18} width="6" height="12" fill="#FFC628" />
        </g>
        <g className="nv-flamme nv-flamme-2">
          <rect x="1036" y={SOL - 22} width="14" height="16" fill="#FF8A3D" />
          <rect x="1040" y={SOL - 16} width="6" height="10" fill="#FFC628" />
        </g>
      </g>

      {/* camion de pompiers */}
      <g className="vc-camion">
        <rect x="150" y={SOL + 4} width="54" height="4" fill="#C3C3C3" />
        <rect x="146" y={SOL + 8} width="60" height="18" fill="#D7262B" />
        <rect x="206" y={SOL + 12} width="20" height="14" fill="#D7262B" />
        <rect x="212" y={SOL + 15} width="9" height="6" fill="#BFE3FF" />
        <rect x="212" y={SOL + 6} width="9" height="6" fill="#D7262B" className="nv-gyro" />
        <rect x="154" y={SOL + 26} width="12" height="6" fill="#241B4B" />
        <rect x="204" y={SOL + 26} width="12" height="6" fill="#241B4B" />
      </g>
    </svg>
  );
}
