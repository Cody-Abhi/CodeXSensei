import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { applyTheme, getInitialTheme } from '../../src/client/store/theme';

describe('theme store helpers', () => {
  beforeEach(() => {
    localStorage.clear();
    document.documentElement.removeAttribute('data-theme');
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('getInitialTheme', () => {
    it('prefers a saved choice', () => {
      localStorage.setItem('planpop-theme', 'dark');
      expect(getInitialTheme()).toBe('dark');
    });

    it('falls back to the OS preference when none saved', () => {
      vi.spyOn(window, 'matchMedia').mockReturnValue({
        matches: true,
        media: '(prefers-color-scheme: dark)',
        onchange: null,
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        addListener: vi.fn(),
        removeListener: vi.fn(),
        dispatchEvent: vi.fn(),
      } as unknown as MediaQueryList);
      expect(getInitialTheme()).toBe('dark');
    });

    it('defaults to light', () => {
      vi.spyOn(window, 'matchMedia').mockReturnValue({
        matches: false,
        media: '',
        onchange: null,
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        addListener: vi.fn(),
        removeListener: vi.fn(),
        dispatchEvent: vi.fn(),
      } as unknown as MediaQueryList);
      expect(getInitialTheme()).toBe('light');
    });

    it('survives a throwing localStorage', () => {
      vi.spyOn(Storage.prototype, 'getItem').mockImplementation(() => {
        throw new Error('blocked');
      });
      vi.spyOn(window, 'matchMedia').mockReturnValue({
        matches: false,
        media: '',
        onchange: null,
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        addListener: vi.fn(),
        removeListener: vi.fn(),
        dispatchEvent: vi.fn(),
      } as unknown as MediaQueryList);
      expect(getInitialTheme()).toBe('light');
    });
  });

  describe('applyTheme', () => {
    it('sets the document attribute and persists', () => {
      applyTheme('dark');
      expect(document.documentElement.getAttribute('data-theme')).toBe('dark');
      expect(localStorage.getItem('planpop-theme')).toBe('dark');
    });

    it('ignores persistence failures', () => {
      vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
        throw new Error('blocked');
      });
      expect(() => applyTheme('light')).not.toThrow();
      expect(document.documentElement.getAttribute('data-theme')).toBe('light');
    });
  });
});
