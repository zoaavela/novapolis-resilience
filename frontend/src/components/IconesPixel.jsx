// Icônes pixel génériques (pas de logos de marque) pour les liens de l'équipe.
// Grille 12 x 12, un rect par pixel allumé.

const GRILLES = {
  // Chevrons de code </> : GitHub
  code: [
    '............',
    '.....#......',
    '..#..#...#..',
    '.##..#...##.',
    '##...#....##',
    '#....#.....#',
    '##..#.....##',
    '.##.#....##.',
    '..#.#....#..',
    '....#.......',
    '............',
    '............',
  ],
  // Carte de profil : LinkedIn
  profil: [
    '............',
    '############',
    '#..........#',
    '#.###......#',
    '#.###.####.#',
    '#.###......#',
    '#.....###..#',
    '#.###......#',
    '#.###.####.#',
    '#..........#',
    '############',
    '............',
  ],
  // Cadre avec paysage : portfolio
  cadre: [
    '############',
    '#..........#',
    '#.......##.#',
    '#.......##.#',
    '#..........#',
    '#...#......#',
    '#..###...#.#',
    '#.#####.####',
    '############',
    '............',
    '............',
    '............',
  ],
};

export default function IconePixel({ nom, taille = 24 }) {
  const grille = GRILLES[nom];
  return (
    <svg width={taille} height={taille} viewBox="0 0 12 12" aria-hidden="true" shapeRendering="crispEdges">
      {grille.flatMap((ligne, y) =>
        [...ligne].map((c, x) => (c === '#' ? <rect key={`${x}-${y}`} x={x} y={y} width="1" height="1" fill="currentColor" /> : null)),
      )}
    </svg>
  );
}
