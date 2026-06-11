/**
 * Service registry — single import point for the UI.
 *
 *   import { services } from "@/services";
 *   const profile = await services.profile.get();
 *
 * To migrate to Lovable Cloud later:
 *   1. Implement `src/services/adapters/supabase.ts` mirroring `local.ts`.
 *   2. Replace `createLocalServices()` below with a feature-flag check:
 *
 *        const BACKEND = import.meta.env.VITE_BACKEND ?? "local";
 *        export const services =
 *          BACKEND === "supabase" ? createSupabaseServices() : createLocalServices();
 *
 *   3. (Optional) wrap with a read-through cache that falls back to local
 *      when offline — see notes in adapters/local.ts.
 *
 * No UI component should import from `@/lib/storage`, `@/data/leaderboard`,
 * or `@/data/players` for runtime user state — go through `services` instead.
 * Static reference data (player clues) is still imported directly from
 * `@/data/players` because it's content, not state.
 */

import { createLocalServices } from "./adapters/local";

export const services = createLocalServices();

export type { Services } from "./types";
export { defaultProfile, defaultStats } from "./adapters/local";
