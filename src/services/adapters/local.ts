/**
 * Local adapter — implements every service interface against localStorage.
 *
 * This is the only backend used while Lovable Cloud is disabled. When the
 * backend is enabled, swap `createServices()` in `src/services/index.ts` to
 * `createSupabaseServices()` and this file becomes the offline FALLBACK
 * cache (read-through pattern) — the function shapes stay identical, so no
 * UI component needs to change.
 *
 * Every public method that has a Supabase equivalent is annotated with
 * `// → Supabase:` comments to make the future migration mechanical.
 */

import { defaultProfile, defaultStats, storage } from "@/lib/storage";
import { players } from "@/data/players";
import {
  globalLeaderboard,
  dailyLeaderboard,
  weeklyLeaderboard,
} from "@/data/leaderboard";
import type {
  AuthService,
  DailyChallengeService,
  GameResultInput,
  LeaderboardRow,
  LeaderboardScope,
  LeaderboardService,
  ProfileService,
  Services,
  SettingsService,
  StatsService,
  UserProfile,
  UserStats,
} from "../types";

const listeners = new Set<(p: UserProfile | null) => void>();
function emit() {
  const p = storage.getProfile();
  listeners.forEach((cb) => cb(p));
}

const auth: AuthService = {
  getCurrent: () => storage.getProfile(),

  // → Supabase: const { data, error } = await supabase.auth.signUp({ email, password })
  //   The `handle_new_user` trigger creates the matching `profiles` row.
  async signUp({ email, password: _password, username }) {
    const profile: UserProfile = {
      ...defaultProfile,
      id: `local-${crypto.randomUUID()}`,
      email,
      username: username || email.split("@")[0] || "Jogador",
      isGuest: false,
    };
    storage.setProfile(profile);
    emit();
    return profile;
  },

  // → Supabase: supabase.auth.signInWithPassword({ email, password })
  async signIn({ email }) {
    const existing = storage.getProfile();
    const profile: UserProfile = {
      ...existing,
      email,
      username: existing.username || email.split("@")[0] || "Jogador",
      isGuest: false,
    };
    storage.setProfile(profile);
    emit();
    return profile;
  },

  // → Supabase: keep local-only, or use supabase.auth.signInAnonymously()
  async signInAsGuest() {
    const profile: UserProfile = { ...defaultProfile, id: `guest-${crypto.randomUUID()}` };
    storage.setProfile(profile);
    emit();
    return profile;
  },

  // → Supabase: await supabase.auth.signOut(); queryClient.clear();
  async signOut() {
    storage.reset();
    emit();
  },

  // → Supabase: const { data: { subscription } } = supabase.auth.onAuthStateChange(...)
  //   return () => subscription.unsubscribe();
  onChange(cb) {
    listeners.add(cb);
    return () => { listeners.delete(cb); };
  },
};

const profile: ProfileService = {
  // → Supabase: server fn → from('profiles').select().eq('id', userId).single()
  async get() { return storage.getProfile(); },
  // → Supabase: server fn → from('profiles').update(patch).eq('id', userId)
  async update(patch) {
    const next = { ...storage.getProfile(), ...patch };
    storage.setProfile(next);
    return next;
  },
};

const stats: StatsService = {
  // → Supabase: server fn → from('user_stats').select().eq('user_id', userId).single()
  async get() { return storage.getStats(); },

  // → Supabase: server fn → rpc('record_game', { ... })
  //   The RPC inserts into game_results AND updates user_stats atomically.
  async recordGame(r: GameResultInput) {
    const s = storage.getStats();
    const nextStreak = r.won ? s.streak + 1 : 0;
    const next: UserStats = {
      ...s,
      xp: s.xp + r.xpGained,
      gamesPlayed: s.gamesPlayed + 1,
      correct: s.correct + (r.won ? 1 : 0),
      streak: nextStreak,
      bestStreak: Math.max(s.bestStreak, nextStreak),
    };
    storage.setStats(next);
    return next;
  },

  // → Supabase: server fn → rpc('claim_daily', { _day, _player_id, ... })
  //   The RPC checks user_stats.last_daily_at to prevent double scoring.
  async recordDaily(r, day) {
    const updated = await stats.recordGame(r);
    const next: UserStats = { ...updated, lastDailyDate: day, lastDailyScore: r.xpGained };
    storage.setStats(next);
    return next;
  },

  // → Supabase: account deletion flow (server fn calling supabaseAdmin.auth.admin.deleteUser)
  async reset() { storage.reset(); emit(); },
};

const settings: SettingsService = {
  // Settings stay local forever — they're device-specific UI preferences.
  // (Language COULD move to profiles.language if you want cross-device sync.)
  get: () => storage.getSettings(),
  update: (patch) => {
    const next = { ...storage.getSettings(), ...patch };
    storage.setSettings(next);
    return next;
  },
};

const SCOPE_DATA = {
  daily: dailyLeaderboard,
  weekly: weeklyLeaderboard,
  global: globalLeaderboard,
};

const leaderboard: LeaderboardService = {
  // → Supabase: server fn → from('leaderboard_global' | 'leaderboard_weekly' | 'leaderboard_daily').select().limit(100)
  async get(scope: LeaderboardScope): Promise<LeaderboardRow[]> {
    return SCOPE_DATA[scope].map((r) => ({ ...r }));
  },

  // → Supabase: dense_rank() window over the same view, filtered by current user
  async getUserRank(scope) {
    const userStats = storage.getStats();
    const data = SCOPE_DATA[scope];
    return Math.max(1, data.length + 1 - Math.min(data.length - 1, Math.floor(userStats.xp / 500)));
  },
};

const daily: DailyChallengeService = {
  // → Supabase: server fn → from('daily_challenge').select('player_id').eq('day', today).single()
  async todayPlayerId() {
    const today = new Date();
    const seed = parseInt(today.toISOString().slice(0, 10).replace(/-/g, ""), 10);
    return players[seed % players.length].id;
  },
};

export function createLocalServices(): Services {
  return { auth, profile, stats, settings, leaderboard, daily };
}

// Export defaults for components that need synchronous initial render values.
export { defaultProfile, defaultStats };
