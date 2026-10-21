import { useTitre } from '../hooks.js';

// Les champs entre crochets sont À COMPLÉTER avec de vraies informations
// avant la mise en ligne. Ne pas les inventer.

export default function Mentions() {
  useTitre('Mentions légales', 'Mentions légales du site Novapolis.');
  return (
    <div className="conteneur texte-page">
      <section className="panneau" aria-labelledby="t-mentions">
        <h1 id="t-mentions">Mentions légales</h1>

        <h2>Éditeur</h2>
        <p>
          Site réalisé dans le cadre d’un projet étudiant d’algorithmique et théorie des graphes,
          par Enzo [NOM], Elio Chalhoub et Max [NOM], [NOM DE L’ÉCOLE].
          Contact : [ADRESSE DE CONTACT].
        </p>

        <h2>Hébergement</h2>
        <p>Site : [NOM, ADRESSE ET TÉLÉPHONE DE L’HÉBERGEUR DU FRONT].</p>
        <p>API : [NOM, ADRESSE ET TÉLÉPHONE DE L’HÉBERGEUR DE L’API].</p>

        <h2>Données</h2>
        <p>Novapolis est une ville fictive. Toutes les données affichées sont synthétiques.</p>

        <h2>Cookies et mesure d’audience</h2>
        <p>Ce site ne dépose aucun cookie et ne mesure pas l’audience.</p>
      </section>
    </div>
  );
}
