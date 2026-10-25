import { useEffect } from 'react';
import { Link, Outlet } from 'react-router-dom';

import { APP_NAME } from '../../shared/version';
import { applyTheme, useTheme } from '../store/theme';
import { SkipLink } from './SkipLink';
import { ThemeToggle } from './ThemeToggle';
import './Layout.css';

/**
 * App shell: skip link, header (brand + nav + theme toggle), the routed main
 * content, and footer. One `h1` lives in each page, not here (PRD §11).
 *
 * @returns The layout wrapper with a routed outlet.
 */
export function Layout(): React.JSX.Element {
  const theme = useTheme((s) => s.theme);

  // Apply the resolved initial theme to the document on mount.
  useEffect(() => {
    applyTheme(theme);
    // Only on mount; subsequent changes are applied by the store actions.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <>
      <SkipLink />
      <header className="pp-header no-print">
        <Link to="/" className="pp-header__brand">
          {APP_NAME}
        </Link>
        <nav aria-label="Primary" className="pp-header__nav">
          <Link to="/">Home</Link>
          <Link to="/style-guide">Style guide</Link>
          <ThemeToggle />
        </nav>
      </header>
      <main id="main" className="pp-main">
        <Outlet />
      </main>
      <footer className="pp-footer no-print">
        <p>Your plans stay in your browser. Built for PromptWars. No account, no tracking.</p>
      </footer>
    </>
  );
}
