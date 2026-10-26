'use client';
import { formatDistanceToNow, parseISO } from 'date-fns';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { SEASON, UI } from '@/config/arcade';
import { buildBadges, monthKey } from '@/lib/badges';
import { ClientError, fetchProfile } from '@/lib/fetchProfile';
import { calcPoints } from '@/lib/points';
import type { ErrorCode } from '@/lib/types';
import { useTracker } from '@/store/useTracker';
import { ErrorPanel } from '@/components/ErrorPanel';
import { Button, buttonClasses } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Toast } from '@/components/ui/Toast';
import { BadgeGrid } from './BadgeGrid';
import { Filters, type FilterState } from './Filters';
import { ProfileHeader } from './ProfileHeader';
import { StatCards } from './StatCards';
import { TierProgress } from './TierProgress';

const INITIAL: FilterState = { scope: 'season', type: 'ALL', month: 'ALL', query: '', sort: 'date-desc' };

export function DashboardView() {
  const id = useSearchParams().get('id') ?? '';
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const profile = useTracker((s) => s.profiles[id]);
  const savePull = useTracker((s) => s.savePull);
  const setOverride = useTracker((s) => s.setOverride);

  const [filters, setFilters] = useState<FilterState>(INITIAL);
  const [autoScoped, setAutoScoped] = useState(false);
  const [limit, setLimit] = useState<number>(UI.badgePageSize);
  const [toast, setToast] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<{ code: ErrorCode; message: string } | null>(null);
  const clearToast = useCallback(() => setToast(null), []);

  const badges = useMemo(() => (profile ? buildBadges(profile.badges, profile.overrides) : []), [profile]);
  const breakdown = useMemo(() => calcPoints(badges, profile?.facilitatorBonus ?? 0), [badges, profile?.facilitatorBonus]);
  const seasonCount = badges.filter((b) => b.inSeason).length;

  // A profile with nothing in the current season starts on the Lifetime view instead of an empty grid.
  useEffect(() => {
    if (profile && !autoScoped) {
      setAutoScoped(true);
      if (seasonCount === 0) setFilters((f) => ({ ...f, scope: 'lifetime' }));
    }
  }, [profile, autoScoped, seasonCount]);

  const scoped = useMemo(() => badges.filter((b) => filters.scope === 'lifetime' || b.inSeason), [badges, filters.scope]);
  const months = useMemo(
    () => [...new Set(scoped.map((b) => monthKey(b.earnedAt)).filter((m): m is string => !!m))].sort().reverse(),
    [scoped],
  );

  const visible = useMemo(() => {
    const q = filters.query.trim().toLowerCase();
    const list = scoped.filter(
      (b) =>
        (filters.type === 'ALL' || b.type === filters.type) &&
        (filters.month === 'ALL' || monthKey(b.earnedAt) === filters.month) &&
        (!q || b.title.toLowerCase().includes(q)),
    );
    const date = (b: { earnedAt: string | null }) => b.earnedAt ?? '';
    return list.sort((a, b) =>
      filters.sort === 'name'
        ? a.title.localeCompare(b.title)
        : filters.sort === 'date-asc'
          ? date(a).localeCompare(date(b))
          : date(b).localeCompare(date(a)),
    );
  }, [scoped, filters]);

  const patch = (p: Partial<FilterState>) => {
    setFilters((f) => ({ ...f, ...p }));
    setLimit(UI.badgePageSize);
  };

  async function refresh() {
    if (!profile) return;
    setRefreshing(true);
    setError(null);
    try {
      const data = await fetchProfile(profile.url, { refresh: true });
      const fresh = savePull(profile.url, data);
      setToast(fresh > 0 ? `${fresh} new badge${fresh === 1 ? '' : 's'}!` : 'Up to date');
    } catch (e) {
      const ce = e instanceof ClientError ? e : new ClientError('NETWORK', 'Network problem.');
      setError({ code: ce.code, message: ce.message });
    } finally {
      setRefreshing(false);
    }
  }

  if (!mounted) return <p className="font-mono">Loading…</p>;

  if (!profile) {
    return (
      <Card className="space-y-4">
        <h1 className="text-2xl uppercase">Profile not saved yet</h1>
        <p>We have no saved data for this profile on this device. Paste its URL to start tracking.</p>
        <Link href="/" className={buttonClasses('yellow', 'w-fit')}>
          Track a profile →
        </Link>
      </Card>
    );
  }

  const newIds = new Set(profile.newBadgeIds);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <Link href="/" className="font-bold uppercase underline decoration-2 underline-offset-4">
          ← All profiles
        </Link>
        <div className="flex items-center gap-3">
          <span className="font-mono text-xs">Updated {formatDistanceToNow(parseISO(profile.lastFetchedAt), { addSuffix: true })}</span>
          <Button onClick={refresh} disabled={refreshing} variant="white">
            {refreshing ? 'Refreshing…' : 'Refresh'}
          </Button>
        </div>
      </div>

      {error && <ErrorPanel code={error.code} message={error.message} />}

      <ProfileHeader name={profile.name} avatar={profile.avatar} memberSince={profile.memberSince} points={breakdown.points} />
      <TierProgress points={breakdown.points} />
      <StatCards b={breakdown} lifetimeTotal={badges.length} />

      <section aria-labelledby="badges-h" className="space-y-4">
        <h2 id="badges-h" className="text-2xl uppercase">
          Badges
        </h2>
        {badges.length === 0 ? (
          <Card className="space-y-3">
            <p className="text-lg font-bold">No badges on this profile yet.</p>
            <a
              href="https://www.skills.google/arcade"
              target="_blank"
              rel="noopener noreferrer"
              className={buttonClasses('yellow', 'w-fit')}
            >
              Start your first Arcade game
            </a>
          </Card>
        ) : (
          <>
            <Filters
              state={filters}
              months={months}
              onChange={patch}
              counts={{ season: seasonCount, lifetime: badges.length }}
            />
            <p className="font-mono text-sm" aria-live="polite">
              Showing {Math.min(limit, visible.length)} of {visible.length}
              {filters.scope === 'season' && ` · ${SEASON.label} only`}
            </p>
            {visible.length === 0 ? (
              <Card>
                <p className="font-bold">No badges match these filters.</p>
                {filters.scope === 'season' && seasonCount === 0 && (
                  <p className="mt-1 text-sm">Nothing earned in {SEASON.label} yet. Switch to Lifetime to see all {badges.length} badges.</p>
                )}
              </Card>
            ) : (
              <BadgeGrid badges={visible.slice(0, limit)} newIds={newIds} onOverride={(bid, t) => setOverride(profile.profileId, bid, t)} />
            )}
            {visible.length > limit && (
              <Button onClick={() => setLimit((l) => l + UI.badgePageSize)} className="mx-auto">
                Show more ({visible.length - limit} left)
              </Button>
            )}
          </>
        )}
      </section>

      <Toast message={toast} onDone={clearToast} />
    </div>
  );
}
