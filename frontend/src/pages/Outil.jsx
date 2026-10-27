import { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { chargerReseau, modeFactice } from '../api.js';
import { useServeur, useTitre } from '../hooks.js';
import { Chargement, Erreur } from '../components/Blocs.jsx';
import CommentCaMarche from '../components/CommentCaMarche.jsx';
import Accessibilite from './modules/Accessibilite.jsx';
import Itineraire from './modules/Itineraire.jsx';
import Scenarios from './modules/Scenarios.jsx';
import Fibre from './modules/Fibre.jsx';
import Donnees from './modules/Donnees.jsx';

const MODULES = {
  access: { titre: 'Accessibilité', composant: Accessibilite, desc: 'Quels sites les casernes de Novapolis peuvent-elles atteindre ?' },
  route: { titre: 'Itinéraire', composant: Itineraire, desc: 'Le trajet le plus rapide d’une caserne à un site, selon trois algorithmes.' },
  scenarios: { titre: 'Scénarios', composant: Scenarios, desc: 'Ce que coûte une route fermée : retards et quartiers coupés.' },
  fiber: { titre: 'Fibre', composant: Fibre, desc: 'Le réseau de fibre le moins cher, et sa réparation en cas de panne.' },
  data: { titre: 'Données', composant: Donnees, desc: 'Les jeux de données de Novapolis et leur format.' },
  about: { titre: 'À propos', composant: null, desc: 'Pourquoi Novapolis, le modèle, les algorithmes et les données.' },
};

export default function Outil({ module = 'scenarios' }) {
  const conf = MODULES[module];
  useTitre(conf?.titre, conf?.desc);
  const serveur = useServeur();
  const [reseau, setReseau] = useState(null);
  const [erreur, setErreur] = useState(null);
  const [jeu, setJeu] = useState('petit');

  useEffect(() => {
    if (serveur.etat !== 'pret' || module === 'about') return;
    let annule = false;
    setReseau(null);
    setErreur(null);
    chargerReseau(jeu)
      .then((r) => !annule && setReseau(r))
      .catch((e) => !annule && setErreur(e.message));
    return () => {
      annule = true;
    };
  }, [serveur.etat, jeu, module]);

  if (!conf) return <Navigate to="/scenarios" replace />;
  if (module === 'about') {
    return (
      <>
        <h1 className="visuellement-cache">À propos</h1>
        <CommentCaMarche />
      </>
    );
  }
  const Module = conf.composant;

  return (
    <>
      <h1 className="visuellement-cache">{conf.titre}</h1>
      {modeFactice && (
        <p className="bandeau-info conteneur">Mode démonstration : résultats pré-calculés sur la petite ville, en attendant l’API.</p>
      )}
      {serveur.etat === 'reveil' && (
        <div className="conteneur">
          <Chargement texte="Réveil du serveur, jusqu’à une minute la première fois…" />
        </div>
      )}
      {serveur.etat === 'erreur' && (
        <div className="conteneur">
          <Erreur>Le serveur ne répond pas.</Erreur>
          <button type="button" className="bouton" onClick={serveur.reessayer}>Réessayer</button>
        </div>
      )}
      {serveur.etat === 'pret' && erreur && (
        <div className="conteneur"><Erreur>Impossible de charger la ville : {erreur}</Erreur></div>
      )}
      {serveur.etat === 'pret' && !reseau && !erreur && (
        <div className="conteneur"><Chargement texte="Chargement de la ville…" /></div>
      )}
      {reseau && <Module reseau={reseau} jeu={jeu} setJeu={setJeu} />}
    </>
  );
}