import { useTitre } from '../hooks.js';

export default function Mentions() {
  useTitre('Mentions légales', 'Mentions légales du site Novapolis.');
  return (
    <div className="conteneur texte-page">
      <section className="panneau" aria-labelledby="t-mentions">
        <h1 id="t-mentions">Mentions légales</h1>

        <h2>Éditeur</h2>
        <p>
          Site réalisé dans le cadre d’un projet étudiant d’algorithmique et théorie des graphes,
          par Enzo Abdi, Elio Chalhoub et Max Soumahoro, EFREI Paris.
          Contact : enzooabdi@gmail.com
        </p>

        <h2>Hébergement</h2>
        <p>Site : Cloudflare, Inc., 101 Townsend Street, San Francisco, CA 94107, États-Unis. Téléphone : +1 888 993 5273.</p>
        <p>API : Render Services, Inc., 525 Brannan Street, Suite 300, San Francisco, CA 94107, États-Unis. Téléphone : +1 415 319 8186.</p>

        <h2>Données</h2>
        <p>Novapolis est une ville fictive. Toutes les données affichées sont synthétiques.</p>

        <h2>Cookies et mesure d’audience</h2>
        <p>Ce site ne dépose aucun cookie et ne mesure pas l’audience.</p>
      </section>
    </div>
  );
}
