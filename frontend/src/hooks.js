import { useEffect, useState } from 'react';
import { sante } from './api.js';

/** Titre et description propres à chaque page. */
export function useTitre(titre, description) {
  useEffect(() => {
    document.title = titre ? `${titre} · Novapolis` : 'Novapolis';
    const meta = document.querySelector('meta[name="description"]');
    if (meta && description) meta.setAttribute('content', description);
  }, [titre, description]);
}

/**
 * Attend que le serveur réponde à /health. Sur Render en offre gratuite, le
 * serveur dort après 15 min et met environ une minute à se réveiller.
 * état : "reveil" | "pret" | "erreur"
 */
export function useServeur(delaiMax = 90000) {
  const [etat, setEtat] = useState('reveil');
  const [essai, setEssai] = useState(0);

  useEffect(() => {
    let fini = false;
    const debut = Date.now();
    let minuteur;

    async function ping() {
      try {
        const r = await sante();
        if (r.status === 'ok') {
          if (!fini) setEtat('pret');
          return;
        }
      } catch {
        /* serveur encore endormi */
      }
      if (Date.now() - debut > delaiMax) {
        if (!fini) setEtat('erreur');
        return;
      }
      minuteur = setTimeout(ping, 3000);
    }

    setEtat('reveil');
    ping();
    return () => {
      fini = true;
      clearTimeout(minuteur);
    };
  }, [delaiMax, essai]);

  return { etat, reessayer: () => setEssai((n) => n + 1) };
}

/** Lance une fonction asynchrone et suit chargement, résultat et erreur. */
export function useRequete() {
  const [etat, setEtat] = useState({ chargement: false, donnees: null, erreur: null });
  async function lancer(fonction) {
    setEtat({ chargement: true, donnees: null, erreur: null });
    try {
      const donnees = await fonction();
      setEtat({ chargement: false, donnees, erreur: null });
    } catch (e) {
      setEtat({ chargement: false, donnees: null, erreur: e.message || 'Erreur inconnue' });
    }
  }
  return [etat, lancer];
}
