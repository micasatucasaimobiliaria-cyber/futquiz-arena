/**
 * Reactive accessors to keep components decoupled from the storage layer.
 * Each hook reads through `services.*` so swapping the adapter (local →
 * supabase) is invisible to the UI.
 */
import { useEffect, useState } from "react";
import { services, defaultProfile, defaultStats } from "@/services";
import type { AppSettings, UserProfile, UserStats } from "@/services/types";
import { sfx } from "@/lib/sound";

export function useProfile() {
  const [profile, setProfile] = useState<UserProfile>(defaultProfile);
  useEffect(() => {
    let alive = true;
    services.profile.get().then((p) => alive && setProfile(p));
    // → Supabase: auth state subscription will fire on sign-in/out + token refresh
    const unsub = services.auth.onChange((p) => p && setProfile(p));
    return () => { alive = false; unsub(); };
  }, []);
  return [profile, setProfile] as const;
}

export function useStats() {
  const [stats, setStats] = useState<UserStats>(defaultStats);
  useEffect(() => {
    let alive = true;
    services.stats.get().then((s) => alive && setStats(s));
    return () => { alive = false; };
  }, []);
  return [stats, setStats] as const;
}

export function useSettings() {
  const [settings, setSettings] = useState<AppSettings>(() => services.settings.get());
  const update = (patch: Partial<AppSettings>) => {
    const next = services.settings.update(patch);
    setSettings(next);
    sfx.setEnabled(next.soundOn);
    return next;
  };
  return [settings, update] as const;
}
