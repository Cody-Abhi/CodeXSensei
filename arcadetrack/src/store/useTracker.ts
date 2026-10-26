import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import { UI } from '@/config/arcade';
import { buildBadges } from '@/lib/badges';
import { calcPoints } from '@/lib/points';
import type { BadgeType, ProfilePayload, TrackedProfile } from '@/lib/types';

interface TrackerState {
  profiles: Record<string, TrackedProfile>;
  /** Stores a fetch result as a new snapshot. Returns how many badges are new since the previous snapshot. */
  savePull: (url: string, payload: ProfilePayload) => number;
  setOverride: (profileId: string, badgeId: string, type: BadgeType | null) => void;
  removeProfile: (profileId: string) => void;
}

export const useTracker = create<TrackerState>()(
  persist(
    (set, get) => ({
      profiles: {},

      savePull: (url, payload) => {
        const existing = get().profiles[payload.profileId];
        const overrides = existing?.overrides ?? {};
        const bonus = existing?.facilitatorBonus ?? 0;
        const points = calcPoints(buildBadges(payload.badges, overrides), bonus).points;
        const badgeIds = payload.badges.map((b) => b.id);

        const previous = existing?.snapshots.at(-1);
        const prevIds = new Set(previous?.badgeIds ?? []);
        const newBadgeIds = previous ? badgeIds.filter((id) => !prevIds.has(id)) : [];

        const profile: TrackedProfile = {
          profileId: payload.profileId,
          url,
          name: payload.name,
          avatar: payload.avatar,
          memberSince: payload.memberSince,
          badges: payload.badges,
          overrides,
          facilitatorBonus: bonus,
          lastFetchedAt: payload.fetchedAt,
          stats: payload.stats,
          snapshots: [...(existing?.snapshots ?? []), { fetchedAt: payload.fetchedAt, badgeIds, points }].slice(
            -UI.maxSnapshots,
          ),
          newBadgeIds: previous ? newBadgeIds : [],
        };
        set((s) => ({ profiles: { ...s.profiles, [payload.profileId]: profile } }));
        return newBadgeIds.length;
      },

      setOverride: (profileId, badgeId, type) =>
        set((s) => {
          const p = s.profiles[profileId];
          if (!p) return s;
          const overrides = { ...p.overrides };
          if (type) overrides[badgeId] = type;
          else delete overrides[badgeId];
          return { profiles: { ...s.profiles, [profileId]: { ...p, overrides } } };
        }),

      removeProfile: (profileId) =>
        set((s) => {
          const { [profileId]: _removed, ...rest } = s.profiles;
          return { profiles: rest };
        }),
    }),
    { name: 'arcadetrack-v1', storage: createJSONStorage(() => localStorage), version: 1 },
  ),
);
