// Accès aux données. Tant que VITE_API_URL n'est pas défini, tout vient des
// données factices de src/mock/petit.js. Le jour où l'API est prête, on
// renseigne VITE_API_URL dans frontend/.env.local et le front l'utilise.
//
// Le format de chaque réponse ci-dessous EST le contrat avec l'API FastAPI.

import { reseau, resultats } from './mock/petit.js';

const API = import.meta.env.VITE_API_URL;
const attendre = (ms) => new Promise((r) => setTimeout(r, ms));

async function appel(chemin, corps) {
  const reponse = await fetch(`${API}${chemin}`, {
    method: corps ? 'POST' : 'GET',
    headers: corps ? { 'Content-Type': 'application/json' } : undefined,
    body: corps ? JSON.stringify(corps) : undefined,
  });
  if (!reponse.ok) {
    let message = `Erreur ${reponse.status}`;
    try {
      const d = await reponse.json();
      // FastAPI renvoie soit un texte, soit une liste d'erreurs de validation (422).
      if (typeof d.detail === 'string') message = d.detail;
      else if (Array.isArray(d.detail)) message = d.detail.map((e) => e.msg).join(', ');
    } catch {
      /* corps vide */
    }
    throw new Error(message);
  }
  return reponse.json();
}

/** GET /health -> { status: "ok" } */
export async function sante() {
  if (!API) return { status: 'ok' };
  return appel('/health');
}

/**
 * GET /reseau?jeu=petit
 * -> { sites: [{id, nom, type, x, y}], routes: [{u, v, temps_normal, temps_pointe, statut}],
 *      fibre: [{u, v, cout, statut}], demandes: [{id, site, type, priorite}],
 *      scenarios: [{id, nom, reseau}] }
 */
export async function chargerReseau(jeu = 'petit') {
  if (!API) {
    await attendre(300);
    return reseau;
  }
  return appel(`/reseau?jeu=${encodeURIComponent(jeu)}`);
}

/**
 * POST /itineraire { jeu, scenario, source, cible, algo }
 * -> { accessible, chemin: [ids] | null, duree: minutes | null, nb_arcs, algo }
 */
export async function itineraire({ jeu = 'petit', scenario = 'S0', source, cible, algo = 'dijkstra' }) {
  if (!API) {
    await attendre(400);
    const r = resultats.itineraires[scenario]?.[source]?.[cible];
    if (!r) throw new Error('Aucune donnée factice pour cette combinaison.');
    return {
      accessible: r.duree !== null,
      chemin: r.chemin,
      duree: r.duree,
      nb_arcs: r.chemin ? r.chemin.length - 1 : 0,
      algo,
    };
  }
  return appel('/itineraire', { jeu, scenario, source, cible, algo });
}

/**
 * POST /accessibilite { jeu, scenario, sources: [ids] }
 * -> { niveaux: { id: nb_arcs }, non_atteints: [ids] }
 */
export async function accessibilite({ jeu = 'petit', scenario = 'S0', sources }) {
  if (!API) {
    await attendre(300);
    const cle = [...sources].sort().join('|');
    const niveaux = resultats.accessibilite[scenario]?.[cle];
    if (!niveaux) throw new Error('Aucune donnée factice pour ces casernes.');
    const non_atteints = reseau.sites.map((s) => s.id).filter((id) => !(id in niveaux));
    return { niveaux, non_atteints };
  }
  return appel('/accessibilite', { jeu, scenario, sources });
}

/**
 * POST /scenario { jeu, scenario, algo }
 * -> { demandes: [{id, site, type, priorite, caserne, avant, apres}] }
 *    avant / apres en minutes, null si inaccessible
 */
export async function impactScenario({ jeu = 'petit', scenario, algo = 'dijkstra' }) {
  if (!API) {
    await attendre(500);
    const demandes = resultats.scenarios[scenario];
    if (!demandes) throw new Error('Aucune donnée factice pour ce scénario.');
    return { demandes };
  }
  return appel('/scenario', { jeu, scenario, algo });
}

/**
 * POST /fibre { jeu, algo, panne: [u, v] | null }
 * -> { aretes: [[u, v, cout]], cout_total, composantes,
 *      reparation: [u, v, cout] | null, nouveau_cout: number | null }
 */
export async function fibre({ jeu = 'petit', algo = 'kruskal', panne = null }) {
  if (!API) {
    await attendre(400);
    const f = resultats.fibre;
    const cle = panne ? panne.join('-') : null;
    const p = cle ? f.pannes[cle] ?? f.pannes[[...panne].reverse().join('-')] : null;
    if (panne && !p) throw new Error('Aucune donnée factice pour cette panne.');
    return {
      aretes: f.aretes,
      cout_total: f.cout_total,
      composantes: f.composantes,
      reparation: p ? p.reparation : null,
      nouveau_cout: p ? p.nouveau_cout : null,
      algo,
    };
  }
  return appel('/fibre', { jeu, algo, panne });
}

export const modeFactice = !API;