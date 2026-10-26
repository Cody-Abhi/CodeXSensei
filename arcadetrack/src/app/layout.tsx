import type { Metadata } from 'next';
import Link from 'next/link';
import type { ReactNode } from 'react';
import '@fontsource/space-grotesk/500.css';
import '@fontsource/space-grotesk/700.css';
import '@fontsource/ibm-plex-mono/500.css';
import '@fontsource/ibm-plex-mono/700.css';
import './globals.css';
import { DISCLAIMER } from '@/config/arcade';

export const metadata: Metadata = {
  title: 'ArcadeTrack — Arcade badge tracker',
  description: 'Paste a public Google Skills profile URL to see your Arcade badges, points and prize tier.',
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen antialiased">
        <header className="border-b-3 border-ink bg-yellow">
          <div className="mx-auto flex max-w-page items-center justify-between px-4 py-3">
            <Link href="/" className="text-xl font-extrabold uppercase tracking-tight">
              ArcadeTrack
            </Link>
            <span className="hidden font-mono text-xs sm:inline">Google Skills Arcade badge tracker</span>
          </div>
        </header>
        <main className="mx-auto max-w-page px-4 py-8">{children}</main>
        <footer className="border-t-3 border-ink bg-white">
          <p className="mx-auto max-w-page px-4 py-4 text-sm">{DISCLAIMER}</p>
        </footer>
      </body>
    </html>
  );
}
