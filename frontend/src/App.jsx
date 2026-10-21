import { Navigate, Route, Routes } from 'react-router-dom';
import Gabarit from './components/Gabarit.jsx';
import Accueil from './pages/Accueil.jsx';
import Credits from './pages/Credits.jsx';
import Outil from './pages/Outil.jsx';
import Mentions from './pages/Mentions.jsx';
import Introuvable from './pages/Introuvable.jsx';

export default function App() {
  return (
    <Routes>
      <Route index element={<Accueil />} />
      <Route path="credits" element={<Credits />} />
      <Route path="a-propos" element={<Navigate to="/credits" replace />} />
      <Route element={<Gabarit />}>
        <Route path="outil" element={<Outil />} />
        <Route path="outil/:module" element={<Outil />} />
        <Route path="mentions-legales" element={<Mentions />} />
        <Route path="*" element={<Introuvable />} />
      </Route>
    </Routes>
  );
}
