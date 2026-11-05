// Graphique Chart.js dans le style du site : traits épais, points carrés,
// police à chiffres. On n'importe que les morceaux utiles de Chart.js
// pour garder un site léger.

import { useEffect, useRef } from 'react';
import {
  Chart, Legend, LinearScale, LineController, LineElement, LogarithmicScale, PointElement, Tooltip,
} from 'chart.js';

Chart.register(LineController, LineElement, PointElement, LinearScale, LogarithmicScale, Legend, Tooltip);

const POLICE = "'JetBrains Mono', ui-monospace, monospace";
const ENCRE = '#241b4b';
const GRILLE = '#dad8e6';

/**
 * series : [{ nom, couleur, points: [{x, y, ecart?}], pointille? }]
 * axes   : { x: {titre, log?}, y: {titre, log?} }
 * unite  : texte ajouté aux valeurs dans l'infobulle
 */
export default function Graphique({ series, axes, titre, unite = 'ms', hauteur = 340 }) {
  const toile = useRef(null);

  useEffect(() => {
    // Sur téléphone : textes plus petits pour laisser la place aux courbes.
    const etroit = window.matchMedia('(max-width: 560px)').matches;
    const taille = etroit ? 10 : 12;
    const echelle = (a) => ({
      type: a.log ? 'logarithmic' : 'linear',
      title: { display: true, text: a.titre, color: ENCRE, font: { family: POLICE, size: taille, weight: 'bold' } },
      ticks: { color: ENCRE, font: { family: POLICE, size: taille - 1 }, maxRotation: 0, autoSkipPadding: 12 },
      grid: { color: GRILLE },
      border: { color: ENCRE, width: 2 },
    });
    const graphique = new Chart(toile.current, {
      type: 'line',
      data: {
        datasets: series.map((s) => ({
          label: s.nom,
          data: s.points,
          borderColor: s.couleur,
          backgroundColor: s.couleur,
          borderWidth: 3,
          borderDash: s.pointille ? [6, 5] : [],
          pointStyle: 'rect',
          pointRadius: s.pointille ? 0 : 5,
          pointHoverRadius: 7,
          tension: 0,
        })),
      },
      options: {
        locale: 'fr-FR', // 4 000 plutôt que 4,000 sur les axes
        responsive: true,
        maintainAspectRatio: false,
        animation: false, // pas d'effet d'apparition : la donnée s'affiche tout de suite
        interaction: { mode: 'nearest', intersect: false },
        scales: { x: echelle(axes.x), y: echelle(axes.y) },
        plugins: {
          legend: {
            position: 'bottom',
            labels: { color: ENCRE, font: { family: POLICE, size: taille }, usePointStyle: true, pointStyle: 'rect', padding: etroit ? 8 : 16, boxWidth: etroit ? 8 : 12 },
          },
          tooltip: {
            backgroundColor: ENCRE,
            titleFont: { family: POLICE },
            bodyFont: { family: POLICE },
            cornerRadius: 0,
            callbacks: {
              title: (items) => `${axes.x.titre.split(' (')[0]} : ${items[0].parsed.x.toLocaleString('fr-FR')}`,
              label: (c) => {
                const e = c.raw.ecart;
                const v = c.parsed.y.toLocaleString('fr-FR', { maximumFractionDigits: 2 });
                return ` ${c.dataset.label} : ${v} ${unite}${e ? ` (± ${e.toLocaleString('fr-FR', { maximumFractionDigits: 2 })})` : ''}`;
              },
            },
          },
        },
      },
    });
    return () => graphique.destroy();
  }, [series, axes, unite]);

  return (
    <div className="graphique" style={{ height: hauteur }}>
      <canvas ref={toile} role="img" aria-label={titre} />
    </div>
  );
}
