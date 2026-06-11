/**
 * Premium result modal — animated XP counter, streak chip, level progress.
 *
 * Shows AFTER `services.stats.recordGame()` resolves so we can diff prev/next
 * stats and animate the gains.
 */
import { useEffect, useMemo, useState } from "react";
import { Check, X, Share2, Copy, Flame, Trophy, ArrowUp } from "lucide-react";
import confetti from "canvas-confetti";
import type { Player } from "@/data/players";
import type { UserStats } from "@/services/types";
import { getLevel, leveledUp } from "@/lib/leveling";
import { sfx } from "@/lib/sound";
import type { GuessFinish } from "./GuessThePlayer";

function fireConfetti() {
  const opts = { startVelocity: 35, spread: 80, ticks: 90, gravity: 0.9, zIndex: 100, scalar: 0.9 };
  confetti({ ...opts, particleCount: 120, origin: { x: 0.5, y: 0.35 }, colors: ["#22c55e", "#10b981", "#fde047", "#ffffff"] });
  setTimeout(() => confetti({ ...opts, particleCount: 60, angle: 60, origin: { x: 0, y: 0.6 } }), 200);
  setTimeout(() => confetti({ ...opts, particleCount: 60, angle: 120, origin: { x: 1, y: 0.6 } }), 350);
}

function useCountUp(target: number, duration = 1200) {
  const [value, setValue] = useState(0);
  useEffect(() => {
    if (target === 0) { setValue(0); return; }
    let raf = 0;
    const start = performance.now();
    const tick = (now: number) => {
      const t = Math.min(1, (now - start) / duration);
      const eased = 1 - Math.pow(1 - t, 3);
      setValue(Math.round(target * eased));
      if (t < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [target, duration]);
  return value;
}

function buildShareText(opts: { won: boolean; result: GuessFinish }) {
  const { won, result } = opts;
  const squares: string[] = result.guesses.map((g) => (g.correct ? "🟩" : "🟥"));
  while (squares.length < 5) squares.push("⬛");
  const r = won ? `${result.guesses.length}/5` : `X/5`;
  return `FutQuiz Arena · Adivinha o Jogador ${r}
${squares.join("")}
+${result.xp} XP · ${result.cluesUsed} pista${result.cluesUsed > 1 ? "s" : ""}
futquiz.arena`;
}

export function ResultModal({
  result,
  player,
  prevStats,
  nextStats,
  onReplay,
  onHome,
}: {
  result: GuessFinish;
  player: Player;
  prevStats: UserStats;
  nextStats: UserStats;
  onReplay: () => void;
  onHome: () => void;
}) {
  const won = result.won;
  const prevLevel = useMemo(() => getLevel(prevStats.xp), [prevStats.xp]);
  const nextLevel = useMemo(() => getLevel(nextStats.xp), [nextStats.xp]);
  const didLevelUp = useMemo(() => leveledUp(prevStats.xp, nextStats.xp), [prevStats.xp, nextStats.xp]);
  const xpCount = useCountUp(result.xp);
  const [barProgress, setBarProgress] = useState(prevLevel.progress);
  const [copied, setCopied] = useState(false);
  const [showLevelBadge, setShowLevelBadge] = useState(false);

  useEffect(() => {
    if (won) fireConfetti();
    // Animate XP bar after a beat — fills from previous level position to new.
    const tStart = setTimeout(() => setBarProgress(didLevelUp ? 1 : nextLevel.progress), 350);
    let tLvl: ReturnType<typeof setTimeout> | undefined;
    let tConfetti: ReturnType<typeof setTimeout> | undefined;
    if (didLevelUp) {
      tLvl = setTimeout(() => {
        setShowLevelBadge(true);
        sfx.play("levelUp");
        setBarProgress(nextLevel.progress); // settle into the new level's progress
      }, 1500);
      tConfetti = setTimeout(() => fireConfetti(), 1550);
    }
    return () => { clearTimeout(tStart); if (tLvl) clearTimeout(tLvl); if (tConfetti) clearTimeout(tConfetti); };
  }, []);

  const shareText = useMemo(() => buildShareText({ won, result }), [won, result]);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(shareText);
      setCopied(true);
      sfx.play("tap");
      setTimeout(() => setCopied(false), 1800);
    } catch { /* ignore */ }
  };

  const share = async () => {
    if (typeof navigator !== "undefined" && navigator.share) {
      try { await navigator.share({ title: "FutQuiz Arena", text: shareText }); return; } catch { /* fall through */ }
    }
    copy();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-background/80 backdrop-blur-md animate-fade-in sm:items-center">
      <div className="relative w-full max-w-md overflow-hidden rounded-t-3xl border border-border bg-card shadow-card animate-slide-up sm:rounded-3xl">
        {/* Header gradient */}
        <div className={`relative px-6 pt-8 pb-5 text-center ${won ? "bg-gradient-to-b from-primary/25 to-transparent" : "bg-gradient-to-b from-destructive/20 to-transparent"}`}>
          <div className={`mx-auto flex h-16 w-16 items-center justify-center rounded-2xl ${won ? "gradient-primary shadow-glow" : "bg-destructive/15 ring-1 ring-destructive/30"}`}>
            {won ? <Check className="h-9 w-9 text-primary-foreground" /> : <X className="h-9 w-9 text-destructive" />}
          </div>
          <h2 className="mt-4 font-display text-3xl font-bold tracking-tight">
            {won ? "Acertaste!" : "Sem sorte!"}
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">
            A resposta era <span className="font-bold text-foreground">{player.name}</span>
          </p>
        </div>

        <div className="px-6 pb-[max(1.25rem,env(safe-area-inset-bottom))]">
          {/* XP gain hero */}
          <div className="relative -mt-2 rounded-2xl border border-border gradient-card p-5 text-center shadow-sm">
            <p className="font-display text-[10px] font-bold uppercase tracking-[0.25em] text-muted-foreground">XP Ganho</p>
            <p className={`mt-1 font-display text-5xl font-bold tabular-nums ${won ? "text-primary" : "text-muted-foreground"}`}>
              +{xpCount}
            </p>
            {/* Streak + best */}
            <div className="mt-3 flex justify-center gap-2">
              <div className="flex items-center gap-1.5 rounded-full border border-border bg-background/50 px-3 py-1 text-xs font-bold">
                <Flame className={`h-3.5 w-3.5 ${nextStats.streak > 0 ? "text-[var(--color-gold)]" : "text-muted-foreground"}`} />
                <span className="tabular-nums">{nextStats.streak}</span>
                <span className="text-muted-foreground">série</span>
              </div>
              {nextStats.bestStreak > prevStats.bestStreak && (
                <div className="flex items-center gap-1.5 rounded-full bg-[var(--color-gold)]/15 px-3 py-1 text-xs font-bold text-[var(--color-gold)] animate-pop">
                  <Trophy className="h-3.5 w-3.5" />
                  Novo recorde
                </div>
              )}
            </div>
          </div>

          {/* Level progression */}
          <div className="mt-4 rounded-2xl border border-border bg-background/40 p-4">
            <div className="flex items-end justify-between">
              <div>
                <p className="font-display text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground">Nível</p>
                <p className="font-display text-2xl font-bold tabular-nums">
                  {showLevelBadge ? nextLevel.level : prevLevel.level}
                  <span className="ml-2 text-[11px] font-semibold uppercase tracking-wider text-primary">
                    {showLevelBadge ? nextLevel.title : prevLevel.title}
                  </span>
                </p>
              </div>
              {didLevelUp && showLevelBadge && (
                <div className="flex items-center gap-1 rounded-full gradient-primary px-3 py-1.5 text-xs font-bold text-primary-foreground shadow-glow animate-pop">
                  <ArrowUp className="h-3.5 w-3.5" /> Subiu de nível!
                </div>
              )}
            </div>
            <div className="mt-3 h-2 overflow-hidden rounded-full bg-muted">
              <div
                className="h-full gradient-primary transition-[width] duration-[1100ms] ease-out"
                style={{ width: `${Math.max(0.03, barProgress) * 100}%` }}
              />
            </div>
            <p className="mt-2 text-right text-[11px] font-semibold tabular-nums text-muted-foreground">
              {(showLevelBadge ? nextLevel.currentXp : prevLevel.currentXp)} / {(showLevelBadge ? nextLevel.neededXp : prevLevel.neededXp)} XP
            </p>
          </div>

          {/* Mini stats */}
          <div className="mt-3 grid grid-cols-3 gap-2">
            <Stat label="Tentativas" value={`${result.attempts}/5`} />
            <Stat label="Pistas" value={`${result.cluesUsed}`} />
            <Stat label="Tempo" value={`${result.timeLeft}s`} />
          </div>

          {/* Share */}
          <div className="mt-4 grid grid-cols-2 gap-2">
            <button onClick={copy} className="flex items-center justify-center gap-2 rounded-2xl border border-border bg-card py-3 text-sm font-bold transition active:scale-[0.97]">
              <Copy className="h-4 w-4" /> {copied ? "Copiado!" : "Copiar"}
            </button>
            <button onClick={share} className="flex items-center justify-center gap-2 rounded-2xl border border-border bg-card py-3 text-sm font-bold transition active:scale-[0.97]">
              <Share2 className="h-4 w-4" /> Partilhar
            </button>
          </div>

          {/* CTA */}
          <div className="mt-3 space-y-2">
            <button
              onClick={() => { sfx.play("tap"); onReplay(); }}
              className="w-full rounded-2xl gradient-primary py-4 font-bold text-primary-foreground shadow-glow transition active:scale-[0.98]"
            >
              Jogar novamente
            </button>
            <button
              onClick={() => { sfx.play("tap"); onHome(); }}
              className="w-full rounded-2xl border border-border bg-card py-3 text-sm font-semibold transition active:scale-[0.98]"
            >
              Voltar ao início
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-border bg-background/40 p-2.5 text-center">
      <p className="font-display text-[9px] font-bold uppercase tracking-widest text-muted-foreground">{label}</p>
      <p className="mt-0.5 text-base font-bold tabular-nums">{value}</p>
    </div>
  );
}
