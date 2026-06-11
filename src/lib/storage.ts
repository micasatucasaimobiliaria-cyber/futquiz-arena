/**
 * Local backend — primitive read/write helpers around localStorage.
 *
 * Keep this file dumb: no business logic, just typed get/set + defaults.
 * The service layer in `src/services/adapters/local.ts` builds on top of it
 * and is the only consumer outside of tests.
 *
 * When Lovable Cloud is enabled this file is still used as the FALLBACK
 * cache when the network is unreachable (see `adapters/local.ts` notes).
 */

import type { UserProfile, UserStats, AppSettings } from "@/services/types";
export type { UserProfile, UserStats, AppSettings };

const KEYS = {
  profile: "futquiz.profile",
  stats: "futquiz.stats",
  settings: "futquiz.settings",
} as const;

const isBrowser = typeof window !== "undefined";

function read<T>(key: string, fallback: T): T {
  if (!isBrowser) return fallback;
  try {
    const raw = localStorage.getItem(key);
    return raw ? { ...fallback, ...(JSON.parse(raw) as T) } : fallback;
  } catch {
    return fallback;
  }
}
function write<T>(key: string, value: T) {
  if (!isBrowser) return;
  localStorage.setItem(key, JSON.stringify(value));
}

export const defaultProfile: UserProfile = {
  id: "local-guest",
  username: "Jogador",
  isGuest: true,
  favouriteClub: "",
  avatarColor: "from-emerald-500 to-teal-700",
};
export const defaultStats: UserStats = {
  xp: 0, streak: 0, bestStreak: 0, gamesPlayed: 0, correct: 0,
};
export const defaultSettings: AppSettings = { soundOn: true, language: "pt" };

export const storage = {
  getProfile: () => read<UserProfile>(KEYS.profile, defaultProfile),
  setProfile: (p: UserProfile) => write(KEYS.profile, p),
  getStats: () => read<UserStats>(KEYS.stats, defaultStats),
  setStats: (s: UserStats) => write(KEYS.stats, s),
  getSettings: () => read<AppSettings>(KEYS.settings, defaultSettings),
  setSettings: (s: AppSettings) => write(KEYS.settings, s),
  reset: () => {
    if (!isBrowser) return;
    Object.values(KEYS).forEach((k) => localStorage.removeItem(k));
  },
};

// Kept for any legacy imports — new code should call `services.stats.recordGame()`.
export function recordGame(opts: { correct: boolean; xpGained: number }) {
  const s = storage.getStats();
  const nextStreak = opts.correct ? s.streak + 1 : 0;
  const next: UserStats = {
    ...s,
    xp: s.xp + opts.xpGained,
    gamesPlayed: s.gamesPlayed + 1,
    correct: s.correct + (opts.correct ? 1 : 0),
    streak: nextStreak,
    bestStreak: Math.max(s.bestStreak, nextStreak),
  };
  storage.setStats(next);
  return next;
}
