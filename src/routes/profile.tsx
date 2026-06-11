import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { AppShell } from "@/components/AppShell";
import { services, defaultProfile } from "@/services";
import { useProfile, useStats } from "@/hooks/use-services";
import { Flame, Target, Trophy, Zap, LogOut } from "lucide-react";

export const Route = createFileRoute("/profile")({ component: Profile });

const colors = [
  "from-emerald-500 to-teal-700",
  "from-rose-500 to-red-700",
  "from-sky-500 to-indigo-700",
  "from-amber-500 to-orange-700",
  "from-violet-500 to-fuchsia-700",
];

function Profile() {
  const navigate = useNavigate();
  // → Supabase: useProfile/useStats become useSuspenseQuery on server fns.
  const [profile, setProfile] = useProfile();
  const [stats] = useStats();
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(defaultProfile);

  useEffect(() => { setDraft(profile); }, [profile]);

  const save = async () => {
    // → Supabase: services.profile.update() → server fn UPDATE on `profiles` with RLS auth.uid()=id.
    const next = await services.profile.update(draft);
    setProfile(next);
    setEditing(false);
  };

  const logout = async () => {
    // → Supabase: supabase.auth.signOut() + queryClient.clear()
    await services.auth.signOut();
    navigate({ to: "/" });
  };


  const accuracy = stats.gamesPlayed > 0 ? Math.round((stats.correct / stats.gamesPlayed) * 100) : 0;

  return (
    <AppShell>
      <div className="px-5 pt-10">
        {/* Hero */}
        <div className="glass relative overflow-hidden rounded-3xl p-6 text-center">
          <div className="pitch-lines absolute inset-0 opacity-20" />
          <div className="absolute -top-16 left-1/2 h-40 w-40 -translate-x-1/2 rounded-full bg-primary/30 blur-3xl" />
          <div className={`relative mx-auto flex h-24 w-24 items-center justify-center rounded-3xl bg-gradient-to-br ${profile.avatarColor} text-3xl font-black text-white shadow-glow ring-2 ring-white/15`}>
            {profile.username.slice(0, 2).toUpperCase()}
          </div>
          <h1 className="relative mt-4 text-2xl font-bold">{profile.username}</h1>
          <p className="relative mt-0.5 text-xs text-muted-foreground">
            {profile.isGuest ? "Convidado" : profile.email ?? ""}
          </p>
          {profile.favouriteClub && (
            <span className="relative mt-3 inline-flex items-center gap-1.5 rounded-full bg-primary/15 px-3 py-1 text-xs font-semibold text-primary ring-1 ring-primary/30">
              ⚽ {profile.favouriteClub}
            </span>
          )}
          <button
            onClick={() => setEditing(true)}
            className="relative mt-4 rounded-full border border-white/10 bg-white/5 px-4 py-1.5 text-xs font-semibold backdrop-blur transition hover:border-primary/50 hover:bg-primary/10"
          >
            Editar perfil
          </button>
        </div>

        {/* Stats grid */}
        <div className="mt-5 grid grid-cols-2 gap-3">
          <StatCard Icon={Zap} label="XP Total" value={stats.xp.toLocaleString()} color="text-primary" />
          <StatCard Icon={Flame} label="Melhor sequência" value={stats.bestStreak.toString()} color="text-orange-400" />
          <StatCard Icon={Trophy} label="Jogos" value={stats.gamesPlayed.toString()} color="text-[var(--color-gold)]" />
          <StatCard Icon={Target} label="Precisão" value={`${accuracy}%`} color="text-emerald-400" />
        </div>

        <button
          onClick={logout}
          className="mt-6 flex w-full items-center justify-center gap-2 rounded-2xl border border-destructive/30 bg-destructive/10 py-3.5 text-sm font-semibold text-destructive transition active:scale-[0.98]"
        >
          <LogOut className="h-4 w-4" /> Terminar sessão
        </button>
      </div>

      {editing && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/60 backdrop-blur animate-fade-in">
          <div className="w-full max-w-md rounded-t-3xl border-t border-border bg-card p-6 animate-slide-up">
            <div className="mx-auto mb-4 h-1 w-10 rounded-full bg-border" />
            <h2 className="text-lg font-bold">Editar perfil</h2>

            <label className="mt-4 block">
              <span className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-muted-foreground">Nome</span>
              <input
                value={draft.username}
                onChange={(e) => setDraft({ ...draft, username: e.target.value })}
                className="w-full rounded-2xl border border-border bg-input px-4 py-3 outline-none focus:border-primary"
              />
            </label>

            <label className="mt-3 block">
              <span className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-muted-foreground">Clube favorito</span>
              <input
                value={draft.favouriteClub}
                placeholder="Ex: Sporting CP"
                onChange={(e) => setDraft({ ...draft, favouriteClub: e.target.value })}
                className="w-full rounded-2xl border border-border bg-input px-4 py-3 outline-none focus:border-primary"
              />
            </label>

            <p className="mt-4 text-xs font-semibold uppercase tracking-wide text-muted-foreground">Avatar</p>
            <div className="mt-2 grid grid-cols-5 gap-2">
              {colors.map((c) => (
                <button
                  key={c}
                  onClick={() => setDraft({ ...draft, avatarColor: c })}
                  className={`h-12 rounded-2xl bg-gradient-to-br ${c} ring-2 transition ${
                    draft.avatarColor === c ? "ring-primary scale-105" : "ring-transparent"
                  }`}
                />
              ))}
            </div>

            <div className="mt-6 flex gap-2 pb-[env(safe-area-inset-bottom)]">
              <button onClick={() => setEditing(false)} className="flex-1 rounded-2xl border border-border py-3 font-semibold">
                Cancelar
              </button>
              <button onClick={save} className="flex-1 rounded-2xl gradient-primary py-3 font-bold text-primary-foreground shadow-glow">
                Guardar
              </button>
            </div>
          </div>
        </div>
      )}
    </AppShell>
  );
}

function StatCard({ Icon, label, value, color }: { Icon: typeof Zap; label: string; value: string; color: string }) {
  return (
    <div className="glass rounded-2xl p-4 lift">
      <Icon className={`h-5 w-5 ${color}`} />
      <p className="mt-2 text-2xl font-bold tabular-nums">{value}</p>
      <p className="text-[11px] uppercase tracking-wider text-muted-foreground">{label}</p>
    </div>
  );
}
