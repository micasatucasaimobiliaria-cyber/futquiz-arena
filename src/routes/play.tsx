import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { players } from "@/data/players";
import { GuessThePlayer, type GuessFinish } from "@/components/GuessThePlayer";
import { ResultModal } from "@/components/ResultModal";
import { services } from "@/services";
import type { UserStats } from "@/services/types";
import { sfx } from "@/lib/sound";

export const Route = createFileRoute("/play")({ component: Play });

function Play() {
  const navigate = useNavigate();
  const [seed, setSeed] = useState(0);
  const player = useMemo(() => players[Math.floor(Math.random() * players.length)], [seed]);
  const [pending, setPending] = useState<{
    result: GuessFinish;
    prev: UserStats;
    next: UserStats;
  } | null>(null);

  // Sync sound enablement with user preference (in case it changed).
  useEffect(() => { sfx.setEnabled(services.settings.get().soundOn); }, []);

  const handleFinish = async (r: GuessFinish) => {
    // → Supabase: services.stats.recordGame() → server fn → rpc('record_game', ...)
    const prev = await services.stats.get();
    const next = await services.stats.recordGame({
      mode: "guess_player", playerId: player.id,
      won: r.won, xpGained: r.xp, attempts: r.attempts, cluesUsed: r.cluesUsed, timeLeft: r.timeLeft,
    });
    setPending({ result: r, prev, next });
  };

  return (
    <div className="mx-auto min-h-screen max-w-md">
      <div className="flex items-center justify-between px-5 pt-4">
        <button onClick={() => navigate({ to: "/home" })} className="text-sm text-muted-foreground hover:text-foreground">
          ← Sair
        </button>
        <p className="font-display text-[10px] font-bold uppercase tracking-[0.25em] text-primary">Adivinha o Jogador</p>
        <div className="w-10" />
      </div>
      <GuessThePlayer key={seed} player={player} onFinish={handleFinish} />

      {pending && (
        <ResultModal
          result={pending.result}
          player={player}
          prevStats={pending.prev}
          nextStats={pending.next}
          onReplay={() => { setPending(null); setSeed((s) => s + 1); }}
          onHome={() => navigate({ to: "/home" })}
        />
      )}
    </div>
  );
}
