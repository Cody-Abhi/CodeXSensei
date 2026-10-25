import { APP_NAME, APP_TAGLINE } from '../shared/version';

/**
 * Root application shell. Phase 1 renders accessible landmarks and the brand
 * heading; routes and features are layered on in later phases.
 */
export function App(): React.JSX.Element {
  return (
    <>
      <a className="skip-link" href="#main">
        Skip to content
      </a>
      <header>
        <nav aria-label="Primary">
          <strong>{APP_NAME}</strong>
        </nav>
      </header>
      <main id="main">
        <h1>{APP_NAME}</h1>
        <p>{APP_TAGLINE}</p>
      </main>
      <footer>
        <p>Your plans stay in your browser. Built for PromptWars.</p>
      </footer>
    </>
  );
}
