// Petits blocs réutilisés dans tous les modules.

export function Espace({ titreCommandes, commandes, titrePlan, badge, plan, legende, resultats }) {
  return (
    <div className="espace conteneur">
      <section className="panneau commandes" aria-labelledby="t-commandes">
        <h2 id="t-commandes" className="titre-panneau">
          <span className="puce" aria-hidden="true" />
          {titreCommandes}
        </h2>
        {commandes}
      </section>

      <section className="panneau plan-panneau" aria-labelledby="t-plan">
        <div className="plan-entete">
          <h2 id="t-plan" className="titre-panneau">{titrePlan}</h2>
          {badge && <span className="badge-alerte">{badge}</span>}
        </div>
        <div className="plan-fond">{plan}</div>
        {legende}
      </section>

      <section className="resultats" aria-labelledby="t-resultats" aria-live="polite">
        <h2 id="t-resultats" className="titre-panneau">Résultats</h2>
        {resultats}
      </section>
    </div>
  );
}

export function Champ({ id, label, children }) {
  return (
    <div className="champ">
      <label htmlFor={id}>{label}</label>
      {children}
    </div>
  );
}

export function Selecteur({ id, label, valeur, onChange, options }) {
  return (
    <Champ id={id} label={label}>
      <select id={id} value={valeur} onChange={(e) => onChange(e.target.value)}>
        {options.map(([v, nom, desactive]) => (
          <option key={v} value={v} disabled={desactive}>
            {nom}
          </option>
        ))}
      </select>
    </Champ>
  );
}

export function Segments({ legende, valeur, onChange, options }) {
  return (
    <fieldset className="segments">
      <legend>{legende}</legend>
      <div className="segments-boutons">
        {options.map(([v, nom]) => (
          <button key={v} type="button" aria-pressed={valeur === v} onClick={() => onChange(v)}>
            {nom}
          </button>
        ))}
      </div>
    </fieldset>
  );
}

export function Tuile({ label, valeur, unite, alerte }) {
  return (
    <div className="tuile">
      <div className="tuile-label">{label}</div>
      <div className={alerte ? 'tuile-valeur alerte' : 'tuile-valeur'}>
        {valeur}
        {unite && <span className="tuile-unite"> {unite}</span>}
      </div>
    </div>
  );
}

export function Chargement({ texte = 'Calcul en cours…' }) {
  return (
    <div className="chargement" role="status">
      <span className="chargement-carres" aria-hidden="true">
        <span /><span /><span />
      </span>
      {texte}
    </div>
  );
}

export function Erreur({ children }) {
  return (
    <p className="message-erreur" role="alert">
      {children}
    </p>
  );
}

export function Vide({ children }) {
  return <p className="vide">{children}</p>;
}

export function Legende({ elements }) {
  return (
    <ul className="legende" aria-label="Légende">
      {elements.map(([classe, texte]) => (
        <li key={texte}>
          <span className={`legende-marque ${classe}`} aria-hidden="true" />
          {texte}
        </li>
      ))}
    </ul>
  );
}

export const LEGENDE_ROUTES = [
  ['m-caserne', 'Caserne'],
  ['m-hopital', 'Hôpital'],
  ['m-quartier', 'Quartier'],
  ['m-trajet', 'Trajet retenu'],
  ['m-ferme', 'Route fermée'],
];

export const minutes = (m) => (m === null || m === undefined ? '–' : `${m}`);
