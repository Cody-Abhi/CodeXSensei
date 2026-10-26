import { Route, Routes } from 'react-router-dom';

import { Layout } from './components/Layout';
import { PlanPage } from './features/plan/PlanPage';
import { Wizard } from './features/wizard/Wizard';
import { Home } from './pages/Home';
import { StyleGuide } from './pages/StyleGuide';

/**
 * Application routes. The shared {@link Layout} wraps every page; pages supply
 * their own single `h1`.
 *
 * @returns The routed application.
 */
export function App(): React.JSX.Element {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route path="/" element={<Home />} />
        <Route path="/plan/new" element={<Wizard />} />
        <Route path="/plan" element={<PlanPage />} />
        <Route path="/style-guide" element={<StyleGuide />} />
      </Route>
    </Routes>
  );
}
