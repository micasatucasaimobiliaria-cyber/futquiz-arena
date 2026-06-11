/**
 * Service-layer types — shared between local + Supabase adapters.
 *
 * These shapes intentionally mirror the eventual database columns so that
 * swapping `local.ts` for `supabase.ts` later requires no UI changes.
 * See docs/SCHEMA.md for the proposed Postgres schema.
 */

export type UserProfile = {
  id: string;            // auth.users.id (uuid) in Supabase; local uuid today
  username: string;
  email?: string;
  isGuest: boolean;
  favouriteClub: string;
  avatarColor: string;   // tailwind gradient token
};

export type UserStats = {
  xp: number;
  streak: number;
  bestStreak: number;
  gamesPlayed: number;
  correct: number;
  lastDailyDate?: string; // ISO yyyy-mm-dd
  lastDailyScore?: number;
};

export type AppSettings = {
  soundOn: boolean;
  language: "pt" | "en";
};

export type GameMode = "guess_player" | "daily" | "career" | "badges" | "transfers" | "ucl" | "liga_pt";

export type GameResultInput = {
  mode: GameMode;
  playerId: string;
  won: boolean;
  xpGained: number;
  attempts: number;
  cluesUsed: number;
  timeLeft: number;
};

export type LeaderboardScope = "daily" | "weekly" | "global";

export type LeaderboardRow = {
  rank: number;
  username: string;
  xp: number;
  streak: number;
  country: string;
  avatar: string;
  isCurrentUser?: boolean;
};

// =====================================================================
// SERVICE CONTRACTS — UI code depends only on these interfaces.
// =====================================================================

export interface AuthService {
  /** Returns the active session profile or null if signed out. */
  getCurrent(): UserProfile | null;
  /** Email/password signup. Supabase: supabase.auth.signUp + trigger creates profile. */
  signUp(input: { email: string; password: string; username?: string }): Promise<UserProfile>;
  /** Email/password login. Supabase: supabase.auth.signInWithPassword. */
  signIn(input: { email: string; password: string }): Promise<UserProfile>;
  /** Local-only anonymous session. Supabase: optionally supabase.auth.signInAnonymously. */
  signInAsGuest(): Promise<UserProfile>;
  /** Supabase: supabase.auth.signOut + clear caches. */
  signOut(): Promise<void>;
  /** Subscribe to auth state changes — wired to supabase.auth.onAuthStateChange later. */
  onChange(cb: (profile: UserProfile | null) => void): () => void;
}

export interface ProfileService {
  get(): Promise<UserProfile>;
  update(patch: Partial<UserProfile>): Promise<UserProfile>;
}

export interface StatsService {
  get(): Promise<UserStats>;
  /** Append a game_results row + atomically update user_stats counters. */
  recordGame(result: GameResultInput): Promise<UserStats>;
  /** Same as recordGame but enforces one-per-day on the server. */
  recordDaily(result: GameResultInput, day: string): Promise<UserStats>;
  /** Wipe local data — Supabase equivalent: account deletion flow. */
  reset(): Promise<void>;
}

export interface SettingsService {
  get(): AppSettings;
  update(patch: Partial<AppSettings>): AppSettings;
}

export interface LeaderboardService {
  get(scope: LeaderboardScope): Promise<LeaderboardRow[]>;
  /** Approximate the current user's rank for the "your card" widget. */
  getUserRank(scope: LeaderboardScope): Promise<number>;
}

export interface DailyChallengeService {
  /** Returns the player id chosen for today's challenge (same for every user). */
  todayPlayerId(): Promise<string>;
}

export interface Services {
  auth: AuthService;
  profile: ProfileService;
  stats: StatsService;
  settings: SettingsService;
  leaderboard: LeaderboardService;
  daily: DailyChallengeService;
}
