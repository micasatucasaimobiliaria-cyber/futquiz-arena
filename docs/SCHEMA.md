# FutQuiz Arena — Database Schema Proposal

This document defines the Supabase schema the app will use once Lovable Cloud
is enabled. The current MVP runs entirely on `localStorage` through the
service layer in `src/services/`, so swapping to Supabase later only requires
replacing the `local` adapters with `supabase` ones — no UI changes needed.

## Tables

### `profiles`
Mirrors `auth.users` 1:1 — created via trigger on signup.

| column           | type          | notes                                              |
|------------------|---------------|----------------------------------------------------|
| `id`             | `uuid`        | PK, FK → `auth.users(id)` ON DELETE CASCADE        |
| `username`       | `text`        | unique, 3–24 chars                                 |
| `avatar_color`   | `text`        | tailwind gradient token (e.g. `from-emerald-500…`) |
| `favourite_club` | `text`        | free text                                          |
| `language`       | `text`        | `'pt' | 'en'`, default `'pt'`                      |
| `created_at`     | `timestamptz` | default `now()`                                    |
| `updated_at`     | `timestamptz` | default `now()`                                    |

**RLS**
- `select`: anyone authenticated can read (public-ish profiles for leaderboard)
- `update`: only `auth.uid() = id`
- `insert`: handled by the `handle_new_user` trigger

### `user_stats`
Aggregated counters per user — updated via RPC after each game.

| column           | type          | notes                              |
|------------------|---------------|------------------------------------|
| `user_id`        | `uuid`        | PK, FK → `auth.users(id)` CASCADE  |
| `xp`             | `integer`     | default 0                          |
| `streak`         | `integer`     | default 0 (resets on wrong answer) |
| `best_streak`    | `integer`     | default 0                          |
| `games_played`   | `integer`     | default 0                          |
| `correct_count`  | `integer`     | default 0                          |
| `last_daily_at`  | `date`        | nullable, prevents double scoring  |
| `last_daily_xp`  | `integer`     | nullable                           |
| `updated_at`     | `timestamptz` | default `now()`                    |

**RLS**
- `select`: own row + read-only projection used by leaderboard view
- `update`/`insert`: only via `record_game()` SECURITY DEFINER function

### `game_results`
Append-only log of every quiz attempt — source of truth for leaderboards.

| column        | type          | notes                                  |
|---------------|---------------|----------------------------------------|
| `id`          | `uuid`        | PK, default `gen_random_uuid()`        |
| `user_id`     | `uuid`        | FK → `auth.users(id)` CASCADE          |
| `mode`        | `text`        | `'guess_player' | 'daily' | …`         |
| `player_id`   | `text`        | id from `src/data/players.ts`          |
| `won`         | `boolean`     |                                        |
| `xp_gained`   | `integer`     |                                        |
| `attempts`    | `smallint`    |                                        |
| `clues_used`  | `smallint`    |                                        |
| `time_left`   | `smallint`    |                                        |
| `created_at`  | `timestamptz` | default `now()`, indexed               |

Indexes: `(user_id, created_at desc)`, `(mode, created_at desc)`.

**RLS**
- `select`: own rows only
- `insert`: `auth.uid() = user_id`

### `daily_challenge`
One row per calendar day so every user sees the same player.

| column       | type    | notes                              |
|--------------|---------|------------------------------------|
| `day`        | `date`  | PK                                 |
| `player_id`  | `text`  | references player in static data   |
| `mode`       | `text`  | default `'guess_player'`           |

**RLS**: public read, no writes (seeded via cron / migration).

## Views

### `leaderboard_global`, `leaderboard_weekly`, `leaderboard_daily`
Read-only views joining `profiles` + `user_stats` (or aggregated
`game_results` for time-bounded boards). Exposed via PostgREST with RLS
`select` for `authenticated`.

```sql
create view leaderboard_global as
select p.id, p.username, p.avatar_color, s.xp, s.streak
from profiles p join user_stats s on s.user_id = p.id
order by s.xp desc limit 100;
```

## Functions

### `handle_new_user()` — trigger on `auth.users` insert
Creates `profiles` + `user_stats` row with sensible defaults.

### `record_game(_mode text, _player_id text, _won bool, _xp int, _attempts int, _clues int, _time_left int)`
`SECURITY DEFINER`. Inserts into `game_results` and updates `user_stats`
atomically. Recomputes `streak` / `best_streak` / `last_daily_*`.

### `claim_daily(_day date, _player_id text, _xp int, …)`
Wraps `record_game` but enforces "one per day" via the `user_stats.last_daily_at`
guard so the client can't double-score.

## Service-Layer Mapping

| Service method                  | Local (today)               | Supabase (later)                                                |
|---------------------------------|-----------------------------|------------------------------------------------------------------|
| `authService.signUp`            | localStorage profile mock   | `supabase.auth.signUp` → trigger creates `profiles`+`user_stats` |
| `authService.signIn`            | localStorage profile mock   | `supabase.auth.signInWithPassword`                               |
| `authService.signInAsGuest`     | localStorage flag           | anonymous sign-in OR keep local-only                             |
| `authService.signOut`           | clear localStorage          | `supabase.auth.signOut`                                          |
| `profileService.get/update`     | localStorage                | server fn → `profiles` (RLS: self)                               |
| `statsService.get`              | localStorage                | server fn → `user_stats` (RLS: self)                             |
| `statsService.recordGame`       | localStorage counters       | server fn → `record_game()` RPC                                  |
| `statsService.recordDaily`      | localStorage `lastDailyAt`  | server fn → `claim_daily()` RPC                                  |
| `leaderboardService.get(scope)` | static fixtures             | server fn → `leaderboard_*` view                                 |
| `dailyChallengeService.today`   | deterministic local hash    | server fn → `daily_challenge` row of today                       |

The UI imports services only — never `storage` directly — so the migration
is mechanical: implement `src/services/adapters/supabase.ts` and switch
`createServices()` in `src/services/index.ts` to use it.
