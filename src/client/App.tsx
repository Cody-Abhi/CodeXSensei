import { lazy, Suspense } from 'react';
import { Route, Routes } from 'react-router-dom';

import { Layout } from './components/Layout';
import { Home } from './pages/Home';

const Wizard = lazy(() => import('./features/wizard/Wizard').then((m) => ({ default: m.Wizard })));
const PlanPage = lazy(() =>
  import('./features/plan/PlanPage').then((m) => ({ default: m.PlanPage })),
);
const StyleGuide = lazy(() =>
  import('./pages/StyleGuide').then((m) => ({ default: m.StyleGuide })),
);

function Loading(): React.JSX.Element {
  return <p className="pp-loading">Loading…</p>;
}

/**
 * Application routes. The shared {@link Layout} wraps every page; pages supply
 * their own single `h1`.
 *
 * @returns The routed application.
 */
export function App(): React.JSX.Element {
  return (
    <Suspense fallback={<Loading />}>
      <Routes>
        <Route element={<Layout />}>
          <Route path="/" element={<Home />} />
          <Route path="/plan/new" element={<Wizard />} />
          <Route path="/plan" element={<PlanPage />} />
          <Route path="/style-guide" element={<StyleGuide />} />
        </Route>
      </Routes>
    </Suspense>
  );
}
