import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { AppShell } from "@/components/AppShell";
import { services } from "@/services";
import type { LeaderboardRow, LeaderboardScope } from "@/services/types";
import { useProfile, useStats } from "@/hooks/use-services";

export const Route = createFileRoute("/leaderboard")({ component: Leaderboard });

const tabs: { id: LeaderboardScope; label: string }[] = [
  { id: "daily", label: "Diário" },
  { id: "weekly", label: "Semanal" },
  { id: "global", label: "Global" },
];

function Leaderboard() {
  const [tab, setTab] = useState<LeaderboardScope>("global");
  const [profile] = useProfile();
  const [stats] = useStats();
  const [data, setData] = useState<LeaderboardRow[]>([]);
  const [userRank, setUserRank] = useState(1);

  useEffect(() => {
    let alive = true;
    // → Supabase: services.leaderboard.get(tab) → server fn → from('leaderboard_<scope>').select()
    Promise.all([services.leaderboard.get(tab), services.leaderboard.getUserRank(tab)]).then(
      ([rows, rank]) => {
        if (!alive) return;
        setData(rows);
        setUserRank(rank);
      }
    );
    return () => { alive = false; };
  }, [tab]);

  if (data.length === 0) return <AppShell><div className="px-5 pt-10 text-muted-foreground">A carregar...</div></AppShell>;


  return (
    <AppShell>
      <div className="px-5 pt-10">
        <p className="text-xs uppercase tracking-widest text-muted-foreground">Competição</p>
        <h1 className="mt-1 text-3xl font-bold">Ranking</h1>

        {/* Tabs */}
        <div className="glass mt-5 grid grid-cols-3 gap-1 rounded-2xl p-1">
          {tabs.map((tg) => (
            <button
              key={tg.id}
              onClick={() => setTab(tg.id)}
              className={`rounded-xl py-2.5 text-sm font-bold transition ${
                tab === tg.id ? "gradient-primary text-primary-foreground shadow-glow" : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {tg.label}
            </button>
          ))}
        </div>

        {/* Podium */}
        <div className="mt-6 grid grid-cols-3 items-end gap-2">
          {[data[1], data[0], data[2]].map((entry, idx) => {
            const place = idx === 1 ? 1 : idx === 0 ? 2 : 3;
            const heights = ["h-20", "h-28", "h-16"];
            const medals = ["🥈", "🥇", "🥉"];
            return (
              <div key={entry.username} className="flex flex-col items-center">
                <div className="text-2xl">{medals[idx]}</div>
                <div className="my-1.5 flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-emerald-500 to-teal-700 text-sm font-bold text-white ring-2 ring-card">
                  {entry.avatar}
                </div>
                <p className="text-center text-[11px] font-bold leading-tight">{entry.username}</p>
                <p className="text-[10px] text-muted-foreground">{entry.xp.toLocaleString()} XP</p>
                <div className={`mt-2 w-full rounded-t-xl gradient-card border border-b-0 border-border ${heights[idx]} flex items-start justify-center pt-2`}>
                  <span className="text-lg font-black text-primary">{place}</span>
                </div>
              </div>
            );
          })}
        </div>

        {/* List */}
        <div className="mt-5 space-y-2">
          {data.slice(3).map((e) => (
            <Row key={e.username} entry={e} />
          ))}
        </div>

        {/* Your card */}
        <div className="glass my-6 rounded-2xl p-3 ring-glow">
          <div className="flex items-center gap-3">
            <div className="flex h-6 w-8 items-center justify-center rounded-md bg-primary/20 text-xs font-bold text-primary">
              #{userRank}
            </div>
            <div className={`flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br ${profile.avatarColor} text-sm font-bold text-white ring-1 ring-white/10`}>
              {profile.username.slice(0, 2).toUpperCase()}
            </div>
            <div className="flex-1">
              <p className="text-sm font-bold">{profile.username} <span className="text-xs text-muted-foreground">(tu)</span></p>
              <p className="text-[11px] text-muted-foreground">Sequência {stats.streak} 🔥</p>
            </div>
            <div className="text-right">
              <p className="text-sm font-black tabular-nums text-gradient">{stats.xp.toLocaleString()}</p>
              <p className="text-[10px] uppercase tracking-wider text-muted-foreground">XP</p>
            </div>
          </div>
        </div>
      </div>
    </AppShell>
  );
}

function Row({ entry }: { entry: LeaderboardRow }) {
  return (
    <div className="glass flex items-center gap-3 rounded-2xl p-3 lift">
      <div className="w-6 text-center text-sm font-bold text-muted-foreground">{entry.rank}</div>
      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-slate-600 to-slate-800 text-xs font-bold text-white ring-1 ring-white/10">
        {entry.avatar}
      </div>
      <div className="flex-1">
        <p className="text-sm font-semibold">{entry.username} {entry.country}</p>
        <p className="text-[11px] text-muted-foreground">🔥 {entry.streak}</p>
      </div>
      <p className="text-sm font-bold tabular-nums">{entry.xp.toLocaleString()}</p>
    </div>
  );
}
