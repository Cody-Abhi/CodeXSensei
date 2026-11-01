/**
 * CivicPulse AI — public landing / design-system specimen.
 * Full public landing (UI-01, §16) ships in T-16. This page showcases the
 * Modern Civic Minimalism design system with real component library pieces.
 * No mock data; no controls for features that don't yet exist.
 */
import { Shield, BarChart3, MapPin, Clock, Users, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge, PriorityBadge } from "@/components/ui/badge";
import { Icon } from "@/components/ui/icon";
import { BentoGrid, BentoItem } from "@/components/layout/bento";
import { KpiCard } from "@/components/data/kpi-card";
import { MetricStrip } from "@/components/data/metric-strip";

export default function HomePage() {
  return (
    <main
      id="main"
      className="mx-auto flex min-h-dvh max-w-[1120px] flex-col gap-12 px-4 py-12 md:px-8"
    >
      {/* ── Hero ── */}
      <header className="flex flex-col gap-5">
        <span className="inline-flex w-fit items-center gap-1.5 rounded-xs bg-demo-bg px-2.5 py-1 text-[13px] font-medium text-demo-fg">
          <Icon icon={Zap} size={16} />
          Build in progress · Foundation phase
        </span>
        <h1 className="text-[36px] font-bold leading-[1.08] tracking-[-0.025em] text-ink md:text-[56px]">
          CivicPulse AI
        </h1>
        <p className="max-w-[64ch] text-lg leading-relaxed text-ink-secondary">
          Turning citizen voices into intelligent city action. Every report
          becomes evidence; every authority decision becomes explainable.
        </p>
        <div className="flex flex-wrap items-center gap-3 pt-2">
          <Button size="lg">Get started</Button>
          <Button variant="outline" size="lg">
            Learn more
          </Button>
        </div>
      </header>

      {/* ── KPI strip (specimen values, labelled as demo) ── */}
      <section className="flex flex-col gap-3">
        <div className="flex items-center gap-2">
          <h2 className="text-lg font-semibold text-ink">Platform metrics</h2>
          <Badge variant="neutral" className="text-xs">
            Specimen
          </Badge>
        </div>
        <MetricStrip
          items={[
            { label: "Total received", value: 1_247, unit: "count" },
            { label: "Resolution rate", value: 87.3, unit: "percent", hint: "resolved / received × 100" },
            { label: "SLA compliance", value: 91.2, unit: "percent", hint: "slaMet / (slaMet + slaMissed) × 100" },
            { label: "Avg. resolution", value: 18.4, unit: "hours", hint: "resolutionHoursSum / resolutionCount" },
          ]}
        />
      </section>

      {/* ── Bento feature grid ── */}
      <section className="flex flex-col gap-5">
        <h2 className="text-xl font-semibold text-ink">Design system specimen</h2>
        <BentoGrid>
          <BentoItem span={3}>
            <div className="flex flex-col gap-3">
              <div className="flex items-center gap-2">
                <Icon icon={Shield} size={20} className="text-primary" />
                <h3 className="text-base font-semibold text-ink">Priority bands</h3>
              </div>
              <div className="flex flex-wrap gap-2">
                <PriorityBadge band="CRITICAL" />
                <PriorityBadge band="HIGH" />
                <PriorityBadge band="MEDIUM" />
                <PriorityBadge band="LOW" />
              </div>
              <p className="text-sm text-muted">
                Deterministic 7-factor weighted score (§29). AI is advisory —
                priority is always explainable.
              </p>
            </div>
          </BentoItem>

          <BentoItem span={3}>
            <div className="flex flex-col gap-3">
              <div className="flex items-center gap-2">
                <Icon icon={MapPin} size={20} className="text-primary" />
                <h3 className="text-base font-semibold text-ink">Geospatial intelligence</h3>
              </div>
              <p className="text-sm text-muted">
                OpenFreeMap with ward-level heatmaps, cluster markers, and
                hybrid duplicate detection (embedding cosine + TF-IDF fallback).
              </p>
              <code className="mt-1 inline-block max-w-full overflow-x-auto rounded-xs bg-sunken px-2 py-1 font-mono text-[13px] text-ink">
                geohash: u4pruydqqvj · radius 500 m
              </code>
            </div>
          </BentoItem>

          <BentoItem span={2}>
            <KpiCard
              label="Unique issues"
              value={1_043}
              unit="count"
              icon={Users}
              hint="received − duplicatesConfirmed"
              delta={{ value: 12, direction: "up", goodWhen: "down" }}
            />
          </BentoItem>

          <BentoItem span={2}>
            <KpiCard
              label="Resolution rate"
              value={87.3}
              unit="percent"
              icon={BarChart3}
              hint="resolved / received × 100"
              delta={{ value: 4.2, direction: "up", goodWhen: "up" }}
            />
          </BentoItem>

          <BentoItem span={2}>
            <KpiCard
              label="Avg. resolution"
              value={18.4}
              unit="hours"
              icon={Clock}
              hint="resolutionHoursSum / resolutionCount"
              delta={{ value: 2.1, direction: "down", goodWhen: "down" }}
            />
          </BentoItem>

          <BentoItem span={6}>
            <div className="flex flex-col gap-3">
              <div className="flex items-center gap-2">
                <h3 className="text-base font-semibold text-ink">Surface &amp; AI tokens</h3>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <article className="rounded-sm border border-border bg-surface p-4">
                  <h4 className="text-sm font-semibold text-ink">Surface card</h4>
                  <p className="mt-1 text-sm text-muted">
                    1px border, elevation shadow, consistent radius tokens.
                  </p>
                  <code className="mt-2 inline-block font-mono text-[13px] tracking-[0.02em] text-ink">
                    CP-BLR-2611-000124
                  </code>
                </article>
                <article className="rounded-sm border border-ai-border bg-ai-bg p-4">
                  <h4 className="text-sm font-semibold text-ink">AI-generated content</h4>
                  <p className="mt-1 text-sm text-ink-secondary">
                    Gemini suggestions are always advisory and clearly labelled.
                  </p>
                  <Badge variant="ai" className="mt-2">
                    AI suggested
                  </Badge>
                </article>
              </div>
            </div>
          </BentoItem>
        </BentoGrid>
      </section>

      {/* ── Glass specimen ── */}
      <section className="flex flex-col gap-3">
        <h2 className="text-lg font-semibold text-ink">Glassmorphism (selective)</h2>
        <p className="text-sm text-muted">
          Reserved for floating map controls and overlays — never full-site.
        </p>
        <div className="relative h-32 overflow-hidden rounded-md bg-gradient-to-br from-primary/20 to-accent/10">
          <div className="cp-glass absolute inset-x-4 bottom-4 flex items-center justify-between rounded-sm px-4 py-3">
            <span className="text-sm font-medium text-ink">Map overlay control</span>
            <Button variant="ghost" size="sm">
              Filters
            </Button>
          </div>
        </div>
      </section>

      {/* ── Button variants ── */}
      <section className="flex flex-col gap-3">
        <h2 className="text-lg font-semibold text-ink">Interaction states</h2>
        <div className="flex flex-wrap items-center gap-3">
          <Button>Primary</Button>
          <Button variant="secondary">Secondary</Button>
          <Button variant="outline">Outline</Button>
          <Button variant="ghost">Ghost</Button>
          <Button variant="destructive">Destructive</Button>
          <Button variant="link">Link</Button>
          <Button disabled>Disabled</Button>
        </div>
      </section>

      <footer className="mt-auto border-t border-border pt-6 text-sm text-muted">
        Independent prototype. Not affiliated with any government body.
      </footer>
    </main>
  );
}
