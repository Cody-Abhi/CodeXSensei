import { create } from 'zustand';

/** Explicit colour theme. `system` is represented by whichever the OS prefers. */
export type Theme = 'light' | 'dark';

const STORAGE_KEY = 'planpop-theme';

/**
 * Determine the initial theme: a previously saved choice wins, otherwise the
 * OS `prefers-color-scheme`, otherwise light.
 *
 * @returns The resolved initial theme.
 */
export function getInitialTheme(): Theme {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved === 'light' || saved === 'dark') {
      return saved;
    }
  } catch {
    // localStorage may be unavailable (private mode); fall through.
  }
  if (
    typeof window !== 'undefined' &&
    window.matchMedia?.('(prefers-color-scheme: dark)').matches
  ) {
    return 'dark';
  }
  return 'light';
}

/**
 * Apply a theme to the document root and persist it.
 *
 * @param theme - The theme to apply.
 */
export function applyTheme(theme: Theme): void {
  if (typeof document !== 'undefined') {
    document.documentElement.setAttribute('data-theme', theme);
  }
  try {
    localStorage.setItem(STORAGE_KEY, theme);
  } catch {
    // Ignore persistence failures.
  }
}

interface ThemeState {
  theme: Theme;
  /** Toggle between light and dark. */
  toggle: () => void;
  /** Set an explicit theme. */
  setTheme: (theme: Theme) => void;
}

/** Global theme store (Zustand). */
export const useTheme = create<ThemeState>((set, get) => ({
  theme: getInitialTheme(),
  toggle: () => {
    const next: Theme = get().theme === 'dark' ? 'light' : 'dark';
    applyTheme(next);
    set({ theme: next });
  },
  setTheme: (theme: Theme) => {
    applyTheme(theme);
    set({ theme });
  },
}));
