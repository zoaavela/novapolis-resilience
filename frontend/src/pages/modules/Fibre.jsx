import { useState } from 'react';
import { fibre } from '../../api.js';
import { useRequete } from '../../hooks.js';
import Plan from '../../components/Plan.jsx';
import {
  Chargement, Erreur, Espace, Legende, Segments, Selecteur, Tuile, Vide,
} from '../../components/Blocs.jsx';

export default function Fibre({ reseau, jeu }) {
  const pannes = reseau.scenarios.filter((s) => s.reseau === 'fibre');
  const [algo, setAlgo] = useState('kruskal');
  const [panne, setPanne] = useState('aucune');
  const [{ chargement, donnees, erreur }, lancer] = useRequete();
  const tronconPanne = pannes.find((p) => p.id === panne)?.panne ?? null;

  return (
    <Espace
      titreCommandes="Fibre"
      commandes={
        <form className="formulaire" onSubmit={(e) => { e.preventDefault(); lancer(() => fibre({ jeu, algo, panne: tronconPanne })); }}>
          <Segments legende="Algorithme" valeur={algo} onChange={setAlgo} options={[['kruskal', 'Kruskal'], ['prim', 'Prim']]} />
          <Selecteur id="fi-panne" label="Panne" valeur={panne} onChange={setPanne}
            options={[['aucune', 'Aucune panne'], ...pannes.map((p) => [p.id, p.nom])]} />
          <button type="submit" className="bouton bouton-principal" disabled={chargement}>
            {chargement ? 'Calcul…' : 'Calculer le réseau'}
          </button>
          <p className="aide">Arbre couvrant minimal : relier tous les sites au moindre coût.</p>
        </form>
      }
      titrePlan="Réseau de fibre"
      badge={donnees?.reparation ? 'Tronçon en panne' : null}
      plan={<Plan reseau={reseau} mode="fibre" arbre={donnees?.aretes} panne={donnees?.reparation ? tronconPanne : null} reparation={donnees?.reparation} />}
      legende={<Legende elements={[['m-arbre', 'Tronçon retenu'], ['m-possible', 'Tronçon possible'], ['m-ferme', 'En panne'], ['m-trajet', 'Réparation']]} />}
      resultats={
        <>
          {chargement && <Chargement />}
          {erreur && <Erreur>{erreur}</Erreur>}
          {!chargement && !erreur && !donnees && <Vide>Lancez le calcul pour voir le réseau le moins cher.</Vide>}
          {donnees && (
            <>
              <div className="tuiles">
                <Tuile label="Coût total" valeur={donnees.cout_total} unite="k€" />
                <Tuile label="Tronçons" valeur={donnees.aretes.length} />
              </div>
              {donnees.reparation && (
                <div className="carte-alerte">
                  <strong>Réparation :</strong> {donnees.reparation[0]} – {donnees.reparation[1]}, {donnees.reparation[2]} k€.
                  Nouveau coût du réseau : {donnees.nouveau_cout} k€.
                </div>
              )}
              <div className="tableau-boite">
                <table>
                  <caption className="visuellement-cache">Tronçons de l’arbre couvrant</caption>
                  <thead>
                    <tr><th scope="col">Tronçon</th><th scope="col" className="nombre">Coût (k€)</th></tr>
                  </thead>
                  <tbody>
                    {donnees.aretes.map(([u, v, c]) => (
                      <tr key={`${u}-${v}`}><td>{u} – {v}</td><td className="nombre">{c}</td></tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          )}
        </>
      }
    />
  );
}
