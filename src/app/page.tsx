/**
 * Interim home / design-token specimen.
 * The full public landing (UI-01, §16) is built in phase T-16. This page is a
 * truthful token/type preview used to verify the "Survey Ledger" design system
 * renders — it contains no controls for features that do not yet exist.
 */

const PRIORITY = [
  { label: "Critical", fg: "text-prio-critical-fg", bg: "bg-prio-critical-bg" },
  { label: "High", fg: "text-prio-high-fg", bg: "bg-prio-high-bg" },
  { label: "Medium", fg: "text-prio-medium-fg", bg: "bg-prio-medium-bg" },
  { label: "Low", fg: "text-prio-low-fg", bg: "bg-prio-low-bg" },
] as const;

export default function HomePage() {
  return (
    <main
      id="main"
      className="mx-auto flex min-h-dvh max-w-[960px] flex-col gap-10 px-4 py-12 md:px-8"
    >
      <header className="flex flex-col gap-3">
        <span className="inline-flex w-fit items-center rounded-xs bg-demo-bg px-2 py-0.5 text-[13px] font-medium text-demo-fg">
          Build in progress · Foundation phase
        </span>
        <h1 className="text-[32px] font-bold leading-[1.1] tracking-[-0.02em] text-ink md:text-[48px]">
          CivicPulse AI
        </h1>
        <p className="max-w-[72ch] text-lg text-ink-secondary">
          Turning citizen voices into intelligent city action. Every report
          becomes evidence; every authority decision becomes explainable.
        </p>
      </header>

      <section className="flex flex-col gap-4">
        <h2 className="text-xl font-semibold text-ink">Priority receipt palette</h2>
        <div className="flex flex-wrap gap-2">
          {PRIORITY.map((p) => (
            <span
              key={p.label}
              className={`inline-flex items-center gap-1.5 rounded-xs px-2.5 py-1 text-sm font-medium ${p.bg} ${p.fg}`}
            >
              {p.label}
            </span>
          ))}
        </div>
      </section>

      <section className="grid gap-4 sm:grid-cols-2">
        <article className="rounded-md border border-border bg-surface p-5 shadow-e1">
          <h3 className="text-base font-semibold text-ink">Surface</h3>
          <p className="mt-1 text-sm text-muted">
            Panels and cards use a 1px border and no shadow at rest.
          </p>
          <code className="mt-3 inline-block font-mono text-[13px] tracking-[0.02em] text-ink">
            CP-BLR-2611-000124
          </code>
        </article>
        <article className="rounded-md border border-ai-border bg-ai-bg p-5">
          <h3 className="text-base font-semibold text-ink">AI-generated content</h3>
          <p className="mt-1 text-sm text-ink-secondary">
            Gemini suggestions are advisory and always clearly labelled.
          </p>
        </article>
      </section>

      <footer className="mt-auto border-t border-border pt-6 text-sm text-muted">
        Independent prototype. Not affiliated with any government body.
      </footer>
    </main>
  );
}
