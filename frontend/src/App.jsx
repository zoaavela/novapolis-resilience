import { lazy, Suspense } from 'react';
import { Navigate, Route, Routes, useParams } from 'react-router-dom';
import Gabarit, { MODULES } from './components/Gabarit.jsx';
import Accueil from './pages/Accueil.jsx';
import Credits from './pages/Credits.jsx';
import Outil from './pages/Outil.jsx';
import Mentions from './pages/Mentions.jsx';
import Introuvable from './pages/Introuvable.jsx';
import { Chargement } from './components/Blocs.jsx';

// Chart.js ne sert qu'à cette page : on ne le charge que si on l'ouvre.
const Benchmark = lazy(() => import('./pages/Benchmark.jsx'));

// Anciennes adresses (/outil/accessibilite...) : redirigées vers les nouvelles,
// pour que les liens déjà partagés continuent de marcher.
const ANCIENS = {
  accessibilite: 'access',
  itineraire: 'route',
  scenarios: 'scenarios',
  fibre: 'fiber',
  donnees: 'data',
  'a-propos': 'about',
};

function AncienneAdresse() {
  const { module } = useParams();
  return <Navigate to={`/${ANCIENS[module] ?? 'scenarios'}`} replace />;
}

export default function App() {
  return (
    <Routes>
      <Route index element={<Accueil />} />
      <Route path="credits" element={<Credits />} />
      <Route path="a-propos" element={<Navigate to="/credits" replace />} />
      <Route path="outil" element={<Navigate to="/scenarios" replace />} />
      <Route path="outil/:module" element={<AncienneAdresse />} />
      <Route path="mentions-legales" element={<Navigate to="/legal" replace />} />
      <Route element={<Gabarit />}>
        {MODULES.map(([id]) => (
          <Route key={id} path={id} element={<Outil module={id} />} />
        ))}
        <Route
          path="benchmark"
          element={
            <Suspense fallback={<div className="conteneur"><Chargement texte="Chargement des graphiques…" /></div>}>
              <Benchmark />
            </Suspense>
          }
        />
        <Route path="legal" element={<Mentions />} />
        <Route path="*" element={<Introuvable />} />
      </Route>
    </Routes>
  );
}