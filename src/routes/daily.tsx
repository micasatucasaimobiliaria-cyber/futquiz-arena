import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { AppShell } from "@/components/AppShell";
import { players } from "@/data/players";
import { GuessThePlayer } from "@/components/GuessThePlayer";
import { services } from "@/services";

export const Route = createFileRoute("/daily")({ component: Daily });

function Daily() {
  const today = new Date();
  const todayKey = today.toISOString().slice(0, 10);
  // → Supabase: services.daily.todayPlayerId() → from('daily_challenge').select().eq('day', today)
  const [playerId, setPlayerId] = useState<string | null>(null);
  const player = useMemo(() => players.find((p) => p.id === playerId) ?? players[0], [playerId]);
  const [started, setStarted] = useState(false);
  const [doneToday, setDoneToday] = useState(false);
  const [lastScore, setLastScore] = useState(0);

  useEffect(() => {
    services.daily.todayPlayerId().then(setPlayerId);
    services.stats.get().then((s) => {
      if (s.lastDailyDate === todayKey) {
        setDoneToday(true);
        setLastScore(s.lastDailyScore ?? 0);
      }
    });
  }, [todayKey]);

  const handleFinish = async (r: { won: boolean; xp: number; attempts: number; cluesUsed: number; timeLeft: number }) => {
    // → Supabase: services.stats.recordDaily() → rpc('claim_daily', ...) — server enforces one-per-day.
    await services.stats.recordDaily(
      { mode: "daily", playerId: player.id, won: r.won, xpGained: r.xp, attempts: r.attempts, cluesUsed: r.cluesUsed, timeLeft: r.timeLeft },
      todayKey,
    );
    setLastScore(r.xp);
    setDoneToday(true);
    setStarted(false);
  };

  if (started && !doneToday) {
    return (
      <div className="mx-auto min-h-screen max-w-md">
        <div className="flex items-center justify-between px-5 pt-4">
          <button onClick={() => setStarted(false)} className="text-sm text-muted-foreground">← Sair</button>
          <p className="text-xs font-bold uppercase tracking-widest text-primary">🎯 Desafio Diário</p>
          <div className="w-10" />
        </div>
        <GuessThePlayer player={player} onFinish={handleFinish} startTime={90} />
      </div>
    );
  }

  return (
    <AppShell>
      <div className="px-5 pt-10">
        <Link to="/home" className="text-sm text-muted-foreground">← Voltar</Link>
        <div className="mt-6 text-center">
          <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-3xl gradient-primary text-4xl shadow-glow">🎯</div>
          <h1 className="mt-4 text-3xl font-bold">Desafio Diário</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {today.toLocaleDateString("pt-PT", { weekday: "long", day: "numeric", month: "long" })}
          </p>
        </div>

        <div className="mt-8 rounded-3xl border border-border gradient-card p-6 text-center">
          {doneToday ? (
            <>
              <p className="text-5xl">✅</p>
              <h2 className="mt-3 text-xl font-bold">Já completaste o desafio de hoje</h2>
              <p className="mt-1 text-sm text-muted-foreground">Volta amanhã para um novo desafio.</p>
              <div className="mt-5 inline-flex items-center gap-2 rounded-full bg-primary/15 px-4 py-2 text-sm font-bold text-primary">
                +{lastScore} XP
              </div>
            </>
          ) : (
            <>
              <p className="text-5xl">⚽</p>
              <h2 className="mt-3 text-xl font-bold">O mesmo jogador para todos</h2>
              <p className="mt-2 text-sm text-muted-foreground">
                Tens 90 segundos e 5 tentativas. Quanto menos pistas usares, mais XP ganhas.
              </p>
              <button
                onClick={() => setStarted(true)}
                className="mt-6 w-full rounded-2xl gradient-primary py-4 font-bold text-primary-foreground shadow-glow active:scale-[0.98]"
              >
                Iniciar Desafio
              </button>
            </>
          )}
        </div>
      </div>
    </AppShell>
  );
}
