import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        bg: 'var(--bg)',
        ink: 'var(--ink)',
        yellow: 'var(--yellow)',
        pink: 'var(--pink)',
        blue: 'var(--blue)',
        green: 'var(--green)',
        orange: 'var(--orange)',
        purple: 'var(--purple)',
      },
      boxShadow: {
        brutal: 'var(--shadow)',
        'brutal-sm': 'var(--shadow-sm)',
        'brutal-hover': 'var(--shadow-hover)',
      },
      borderWidth: { 3: '3px' },
      fontFamily: {
        sans: ['"Space Grotesk"', 'system-ui', 'sans-serif'],
        mono: ['"IBM Plex Mono"', 'ui-monospace', 'monospace'],
      },
      maxWidth: { page: '1200px' },
    },
  },
  plugins: [],
};

export default config;
