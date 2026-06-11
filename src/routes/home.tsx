import { createFileRoute, Link } from "@tanstack/react-router";
import { AppShell } from "@/components/AppShell";
import { useProfile, useStats } from "@/hooks/use-services";
import { Flame, Zap, Trophy, ChevronRight, Calendar, Sparkles } from "lucide-react";
import { getLevel } from "@/lib/leveling";

export const Route = createFileRoute("/home")({ component: Home });

const modes = [
  { id: "guess-the-player", icon: "🕵️", title: "Adivinha o Jogador", desc: "Pistas progressivas", to: "/play" as const, available: true, color: "from-emerald-400 to-teal-700" },
  { id: "career-path", icon: "🛤️", title: "Carreira", desc: "Em breve", available: false, color: "from-sky-400 to-indigo-700" },
  { id: "club-badges", icon: "🛡️", title: "Emblemas", desc: "Em breve", available: false, color: "from-rose-400 to-red-700" },
  { id: "transfers", icon: "💸", title: "Mercado", desc: "Em breve", available: false, color: "from-amber-400 to-orange-700" },
];

function Home() {
  // → Supabase: useSuspenseQuery of getProfile/getStats server fns.
  const [profile] = useProfile();
  const [stats] = useStats();

  const todayKey = new Date().toISOString().slice(0, 10);
  const dailyDone = stats.lastDailyDate === todayKey;
  const lvl = getLevel(stats.xp);

  return (
    <AppShell>
      <div className="px-5 pt-10">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-[0.25em] text-muted-foreground">Bem-vindo</p>
            <h1 className="mt-1 text-2xl font-bold leading-tight">
              {profile.username} <span className="inline-block animate-float">👋</span>
            </h1>
          </div>
          <Link
            to="/profile"
            className={`relative flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br ${profile.avatarColor} font-bold text-white shadow-card ring-1 ring-white/15 lift`}
          >
            {profile.username.slice(0, 2).toUpperCase()}
            <span className="absolute -bottom-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-primary text-[9px] font-black text-primary-foreground ring-2 ring-background">
              {lvl.level}
            </span>
          </Link>
        </div>

        {/* Stats row */}
        <div className="mt-6 grid grid-cols-3 gap-3">
          <StatPill Icon={Zap} label="XP" value={stats.xp.toLocaleString()} color="text-primary" />
          <StatPill Icon={Flame} label="Sequência" value={stats.streak.toString()} color="text-orange-400" />
          <StatPill Icon={Trophy} label="Rank" value={`#${Math.max(1, 12 - Math.floor(stats.xp / 100))}`} color="text-[var(--color-gold)]" />
        </div>

        {/* Level progress */}
        <div className="mt-4 glass relative overflow-hidden rounded-3xl p-4">
          <div className="pitch-texture absolute inset-0 opacity-60" />
          <div className="relative flex items-end justify-between">
            <div>
              <p className="font-display text-[10px] font-bold uppercase tracking-[0.22em] text-muted-foreground">Nível</p>
              <p className="font-display text-2xl font-bold tabular-nums leading-tight">
                {lvl.level}
                <span className="ml-2 text-[11px] font-bold uppercase tracking-wider text-gradient">{lvl.title}</span>
              </p>
            </div>
            <p className="text-[11px] font-semibold tabular-nums text-muted-foreground">
              {lvl.currentXp}/{lvl.neededXp} XP
            </p>
          </div>
          <div className="relative mt-3 h-2 overflow-hidden rounded-full bg-black/40 ring-1 ring-white/5">
            <div
              className="h-full gradient-primary shadow-glow transition-[width] duration-700"
              style={{ width: `${Math.max(0.03, lvl.progress) * 100}%` }}
            />
            <div className="pointer-events-none absolute inset-0 animate-shimmer" />
          </div>
        </div>

        {/* Daily Challenge — hero card */}
        <Link
          to="/daily"
          className="mt-6 block lift shine relative overflow-hidden rounded-3xl ring-1 ring-primary/40 shadow-glow"
        >
          <div className="absolute inset-0 gradient-primary" />
          <div className="pitch-lines absolute inset-0 opacity-30" />
          <div className="absolute -right-10 -top-10 h-40 w-40 rounded-full bg-white/20 blur-3xl" />
          <div className="relative p-5 text-primary-foreground">
            <div className="flex items-center justify-between">
              <div>
                <div className="flex items-center gap-1.5 text-[10px] font-black uppercase tracking-[0.2em] opacity-90">
                  <Calendar className="h-3.5 w-3.5" /> Desafio Diário
                  <Sparkles className="h-3 w-3" />
                </div>
                <h3 className="mt-1.5 text-2xl font-black leading-none">
                  {dailyDone ? "Completo hoje ✓" : "Joga agora"}
                </h3>
                <p className="mt-1.5 text-sm font-medium opacity-90">
                  {dailyDone ? `+${stats.lastDailyScore ?? 0} XP ganhos` : "Mesmo jogador, todo o mundo"}
                </p>
              </div>
              <div className="text-5xl drop-shadow-lg">🎯</div>
            </div>
          </div>
        </Link>

        {/* Game modes */}
        <div className="mt-8">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-lg font-bold">Modos de Jogo</h2>
            <Link to="/modes" className="text-xs font-semibold text-primary">Ver todos →</Link>
          </div>
          <div className="grid grid-cols-2 gap-3">
            {modes.map((m) => (
              <ModeCard key={m.id} {...m} />
            ))}
          </div>
        </div>

        {/* Rank preview */}
        <div className="mt-8 glass relative overflow-hidden rounded-3xl p-5 lift">
          <div className="absolute -left-10 -bottom-10 h-32 w-32 rounded-full bg-primary/20 blur-3xl" />
          <div className="relative flex items-center justify-between">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-muted-foreground">Ranking Global</p>
              <h3 className="mt-1 text-lg font-bold">Sobe na Arena</h3>
            </div>
            <Link to="/leaderboard" className="text-primary"><ChevronRight /></Link>
          </div>
          <div className="relative mt-3 flex items-center gap-3">
            <div className="flex -space-x-2">
              {["FK", "GB", "MM"].map((a, i) => (
                <div key={a} className={`flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br ring-2 ring-card text-xs font-bold text-white ${
                  ["from-yellow-400 to-amber-600", "from-emerald-400 to-teal-600", "from-rose-400 to-pink-600"][i]
                }`}>{a}</div>
              ))}
            </div>
            <p className="text-sm text-muted-foreground">+1.2k jogadores online</p>
          </div>
        </div>
      </div>
    </AppShell>
  );
}

function StatPill({ Icon, label, value, color }: { Icon: typeof Zap; label: string; value: string; color: string }) {
  return (
    <div className="glass relative overflow-hidden rounded-2xl p-3 text-center lift">
      <Icon className={`mx-auto h-4 w-4 ${color}`} />
      <p className="mt-1.5 text-lg font-bold tabular-nums">{value}</p>
      <p className="text-[10px] uppercase tracking-wider text-muted-foreground">{label}</p>
    </div>
  );
}

function ModeCard({ icon, title, desc, to, available, color }: { icon: string; title: string; desc: string; to?: "/play"; available: boolean; color: string }) {
  const Inner = (
    <div className={`group glass shine relative h-full overflow-hidden rounded-3xl p-4 ${
      available ? "lift" : "opacity-55"
    }`}>
      <div className={`absolute -right-6 -top-6 h-20 w-20 rounded-full bg-gradient-to-br ${color} opacity-30 blur-2xl transition group-hover:opacity-60`} />
      <div className={`relative inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br ${color} text-2xl shadow-card ring-1 ring-white/15`}>
        {icon}
      </div>
      <h3 className="mt-3 text-sm font-bold leading-tight">{title}</h3>
      <p className="mt-0.5 text-[11px] text-muted-foreground">{desc}</p>
      {available && <div className="mt-2 text-[10px] font-black uppercase tracking-wider text-primary">Jogar →</div>}
    </div>
  );
  return available && to ? <Link to={to}>{Inner}</Link> : <div>{Inner}</div>;
}
