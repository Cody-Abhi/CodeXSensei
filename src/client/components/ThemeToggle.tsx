import { useTheme } from '../store/theme';
import './ThemeToggle.css';

/**
 * Accessible light/dark theme toggle. Conveys state with text (not colour
 * alone) and `aria-pressed` (PRD §10/§11).
 *
 * @returns A toggle button.
 */
export function ThemeToggle(): React.JSX.Element {
  const theme = useTheme((s) => s.theme);
  const toggle = useTheme((s) => s.toggle);
  const isDark = theme === 'dark';
  return (
    <button type="button" className="pp-theme-toggle" onClick={toggle} aria-pressed={isDark}>
      <span aria-hidden="true">{isDark ? '🌙' : '☀️'}</span>
      <span>{isDark ? 'Dark' : 'Light'}</span>
    </button>
  );
}
