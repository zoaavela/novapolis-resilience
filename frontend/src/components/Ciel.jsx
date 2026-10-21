// Bandeau décoratif : nuages et ville en pixel qui défilent en boucle.
// Purement décoratif (aria-hidden). Toutes les animations s'arrêtent si
// l'utilisateur a demandé à réduire les animations (voir styles.css).

function Nuage({ x, y }) {
  return (
    <g transform={`translate(${x} ${y})`}>
      <rect x="0" y="40" width="144" height="12" fill="#A9B6EC" />
      <rect x="0" y="32" width="144" height="10" fill="#E3EEFB" />
      <rect x="16" y="20" width="112" height="14" fill="#E3EEFB" />
      <rect x="36" y="8" width="52" height="14" fill="#E3EEFB" />
      <rect x="44" y="12" width="12" height="6" fill="#FFFFFF" />
      <rect x="96" y="32" width="20" height="6" fill="#C9C0F4" />
    </g>
  );
}

function Nuages({ dx }) {
  return (
    <g transform={`translate(${dx} 0)`}>
      <Nuage x={120} y={22} />
      <Nuage x={520} y={60} />
      <Nuage x={860} y={16} />
      <Nuage x={1200} y={48} />
    </g>
  );
}

const F = '#FFE27A';

// Une fenêtre ; anim = "a" | "b" | "c" pour qu'elle s'allume et s'éteigne.
const Fen = ({ x, y, anim, c = F, t = 8 }) => (
  <rect x={x} y={y} width={t} height={t} fill={c} className={anim ? `nv-fen-${anim}` : undefined} />
);

function Ville({ dx }) {
  return (
    <g transform={`translate(${dx} 0)`} shapeRendering="crispEdges">
      <rect x="20" y="156" width="56" height="40" fill="#4A4390" />
      <rect x="28" y="148" width="40" height="8" fill="#4A4390" />
      <Fen x={32} y={168} anim="a" /><Fen x={56} y={168} />

      <rect x="90" y="96" width="44" height="100" fill="#2E2860" />
      <Fen x={100} y={110} /><Fen x={116} y={134} anim="b" /><Fen x={100} y={158} />

      {/* caserne */}
      <rect x="150" y="140" width="96" height="56" fill="#D7262B" />
      <rect x="150" y="132" width="96" height="8" fill="#241B4B" />
      <rect x="190" y="124" width="16" height="8" className="nv-gyro" fill="#D7262B" />
      <rect x="162" y="160" width="32" height="36" fill="#FFFFFF" />
      <rect x="202" y="160" width="32" height="36" fill="#FFFFFF" />

      <rect x="262" y="150" width="64" height="46" fill="#3B3470" />
      <Fen x={274} y={162} /><Fen x={302} y={162} anim="c" />

      {/* hôpital */}
      <rect x="340" y="116" width="84" height="80" fill="#FFFFFF" />
      <rect x="340" y="108" width="84" height="8" fill="#241B4B" />
      <rect x="374" y="126" width="16" height="36" fill="#D7262B" />
      <rect x="364" y="136" width="36" height="16" fill="#D7262B" />

      <rect x="440" y="80" width="40" height="116" fill="#2E2860" />
      <Fen x={450} y={94} anim="c" /><Fen x={462} y={118} /><Fen x={450} y={142} anim="b" />

      <rect x="494" y="160" width="72" height="36" fill="#4A4390" />
      <Fen x={508} y={170} /><Fen x={540} y={170} anim="a" />

      <rect x="580" y="110" width="52" height="86" fill="#3B3470" />
      <Fen x={592} y={124} /><Fen x={612} y={148} anim="b" />

      <rect x="646" y="164" width="96" height="32" fill="#2E2860" />
      <rect x="646" y="158" width="96" height="6" fill="#FFC628" />

      <rect x="756" y="90" width="48" height="106" fill="#4A4390" />
      <Fen x={768} y={104} /><Fen x={784} y={128} anim="c" />

      {/* école et son drapeau */}
      <rect x="896" y="140" width="100" height="56" fill="#4A4390" />
      <rect x="896" y="132" width="100" height="8" fill="#241B4B" />
      <rect x="944" y="104" width="4" height="28" fill="#241B4B" />
      <rect x="948" y="104" width="16" height="10" fill="#FFC628" className="nv-drapeau" />
      <Fen x={910} y={152} t={12} /><Fen x={938} y={152} t={12} anim="a" />

      {/* antenne télécom */}
      <rect x="1080" y="60" width="6" height="136" fill="#241B4B" />
      <rect x="1070" y="96" width="26" height="4" fill="#241B4B" />
      <rect x="1079" y="52" width="8" height="8" fill="#D7262B" className="nv-balise" />

      <rect x="1110" y="158" width="80" height="38" fill="#3B3470" />
      <Fen x={1126} y={168} anim="a" /><Fen x={1162} y={168} />

      <rect x="1206" y="104" width="56" height="92" fill="#4A4390" />
      <Fen x={1218} y={118} /><Fen x={1240} y={142} anim="b" />

      <rect x="1278" y="148" width="90" height="48" fill="#2E2860" />
      <Fen x={1292} y={160} anim="c" />

      <rect x="1384" y="164" width="56" height="32" fill="#4A4390" />

      <rect x="0" y="196" width="1440" height="24" fill="#0A7A3B" />
      <rect x="0" y="196" width="1440" height="6" fill="#14B88F" />
      <rect x="0" y="208" width="1440" height="10" fill="#3D3A52" />
      {[40, 240, 440, 640, 840, 1040, 1240].map((x) => (
        <rect key={x} x={x} y="212" width="24" height="2" fill={F} />
      ))}
    </g>
  );
}

export default function Ciel({ plein = false }) {
  return (
    <div className={plein ? 'ciel ciel-plein' : 'ciel'} aria-hidden="true">
      <svg className="ciel-nuages" width="2880" height="120" viewBox="0 0 2880 120" shapeRendering="crispEdges">
        <Nuages dx={0} />
        <Nuages dx={1440} />
      </svg>
      <svg className="ciel-ville" width="4320" height="220" viewBox="0 0 4320 220">
        <Ville dx={0} />
        <Ville dx={1440} />
        <Ville dx={2880} />
      </svg>
      <svg className="ciel-camion" width="56" height="24" viewBox="0 0 56 24" shapeRendering="crispEdges">
        <rect x="4" y="2" width="30" height="3" fill="#C3C3C3" />
        <rect x="0" y="6" width="40" height="14" fill="#D7262B" />
        <rect x="40" y="10" width="14" height="10" fill="#D7262B" />
        <rect x="44" y="12" width="6" height="4" fill="#BFE3FF" />
        <rect x="44" y="6" width="6" height="4" className="nv-gyro" fill="#D7262B" />
        <rect x="6" y="20" width="8" height="4" fill="#241B4B" />
        <rect x="40" y="20" width="8" height="4" fill="#241B4B" />
      </svg>
    </div>
  );
}
