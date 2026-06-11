import { useEffect, useMemo, useRef, useState } from "react";
import { checkAnswer, type Player } from "@/data/players";
import { Clock, Zap, Check } from "lucide-react";
import { PlayerAvatar } from "./PlayerAvatar";
import { sfx } from "@/lib/sound";

type Status = "playing" | "won" | "lost";
export type GuessLog = { correct: boolean; text: string };

type Clue = { label: string; value: string; icon: string };

function buildClues(p: Player): Clue[] {
  return [
    { label: "Nacionalidade", value: p.nationality, icon: "🌍" },
    { label: "Posição", value: p.position, icon: "🎯" },
    { label: "Clube atual", value: p.currentClub, icon: "🏟️" },
    { label: "Número", value: `#${p.shirtNumber}`, icon: "👕" },
    { label: "Idade", value: `${p.age} anos`, icon: "🎂" },
    { label: "Ex-clubes", value: p.formerClubs.join(" • "), icon: "📜" },
    { label: "Troféus", value: p.trophies.join(" • "), icon: "🏆" },
  ];
}

export type GuessFinish = {
  won: boolean;
  xp: number;
  attempts: number;
  cluesUsed: number;
  timeLeft: number;
  guesses: GuessLog[];
};

export function GuessThePlayer({
  player,
  onFinish,
  startTime = 60,
}: {
  player: Player;
  onFinish: (result: GuessFinish) => void;
  startTime?: number;
}) {
  const clues = useMemo(() => buildClues(player), [player]);
  const [revealed, setRevealed] = useState(1);
  const [guesses, setGuesses] = useState<GuessLog[]>([]);
  const maxAttempts = 5;
  const [guess, setGuess] = useState("");
  const [flash, setFlash] = useState<"correct" | "wrong" | null>(null);
  const [status, setStatus] = useState<Status>("playing");
  const [timeLeft, setTimeLeft] = useState(startTime);
  const finished = useRef(false);
  const lastTickSound = useRef(0);

  // Timer with urgency ticks under 10s.
  useEffect(() => {
    if (status !== "playing") return;
    const id = setInterval(() => {
      setTimeLeft((t) => {
        if (t <= 1) { clearInterval(id); setStatus("lost"); sfx.play("lose"); return 0; }
        const next = t - 1;
        if (next <= 10 && next !== lastTickSound.current) {
          lastTickSound.current = next;
          sfx.play(next <= 5 ? "tickUrgent" : "tick");
        }
        return next;
      });
    }, 1000);
    return () => clearInterval(id);
  }, [status]);

  // Finish handoff (only once).
  useEffect(() => {
    if (status === "playing" || finished.current) return;
    finished.current = true;
    const won = status === "won";
    const base = won ? 200 : 0;
    const clueBonus = won ? Math.max(0, (clues.length - revealed)) * 25 : 0;
    const timeBonus = won ? Math.floor(timeLeft * 1.5) : 0;
    const attemptBonus = won ? (maxAttempts - guesses.filter((g) => !g.correct).length) * 15 : 0;
    // Small delay so the win/lose feedback animations land first.
    const id = setTimeout(() => {
      onFinish({
        won,
        xp: base + clueBonus + timeBonus + attemptBonus,
        attempts: guesses.filter((g) => !g.correct).length,
        cluesUsed: revealed,
        timeLeft,
        guesses,
      });
    }, 900);
    return () => clearTimeout(id);
  }, [status]);

  const wrongCount = guesses.filter((g) => !g.correct).length;

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const text = guess.trim();
    if (!text || status !== "playing") return;
    const isRight = checkAnswer(text, player);
    setGuesses((prev) => [...prev, { correct: isRight, text }]);
    setGuess("");
    if (isRight) {
      sfx.play("correct");
      setFlash("correct");
      setTimeout(() => setFlash(null), 500);
      setTimeout(() => { setStatus("won"); sfx.play("win"); }, 200);
      return;
    }
    sfx.play("wrong");
    setFlash("wrong");
    setTimeout(() => setFlash(null), 400);
    if (typeof navigator !== "undefined" && "vibrate" in navigator) navigator.vibrate?.(60);
    const nextWrong = wrongCount + 1;
    if (nextWrong >= maxAttempts) {
      setStatus("lost");
    } else if (revealed < clues.length) {
      setRevealed((r) => Math.min(clues.length, r + 1));
      sfx.play("reveal");
    }
  };

  const revealMore = () => {
    if (revealed < clues.length && status === "playing") {
      setRevealed(revealed + 1);
      sfx.play("reveal");
    }
  };

  const progress = (revealed / clues.length) * 100;
  const urgent = timeLeft <= 10 && status === "playing";
  const timeColor = timeLeft <= 10 ? "text-destructive" : timeLeft <= 25 ? "text-[var(--color-gold)]" : "text-primary";
  const timeBarPct = (timeLeft / startTime) * 100;

  return (
    <div className={`relative flex min-h-screen flex-col px-5 pt-6 transition-colors duration-300 ${
      flash === "wrong" ? "bg-destructive/15" : flash === "correct" ? "bg-primary/15" : ""
    } ${urgent ? "animate-heartbeat" : ""}`}>
      {/* Urgency vignette */}
      {urgent && (
        <div className="pointer-events-none fixed inset-0 z-20 ring-inset shadow-[inset_0_0_120px_30px_oklch(0.65_0.24_25/0.18)]" />
      )}

      {/* Flash overlay */}
      {flash && (
        <div className={`pointer-events-none fixed inset-0 z-30 animate-fade-in ${
          flash === "correct" ? "bg-primary/10" : "bg-destructive/10"
        }`} />
      )}

      {/* Top bar */}
      <div className="flex items-center justify-between">
        <div className={`flex items-center gap-2 rounded-full border border-border bg-card/80 px-4 py-2 backdrop-blur ${timeColor} ${urgent ? "animate-pulse border-destructive/50" : ""}`}>
          <Clock className="h-4 w-4" />
          <span className="font-mono text-base font-bold tabular-nums tracking-tight">
            {String(Math.floor(timeLeft / 60)).padStart(2, "0")}:{String(timeLeft % 60).padStart(2, "0")}
          </span>
        </div>
        <div className="flex gap-1.5">
          {Array.from({ length: maxAttempts }).map((_, i) => (
            <div
              key={i}
              className={`h-2.5 w-2.5 rounded-full transition-all duration-300 ${
                i < wrongCount ? "bg-destructive scale-110 shadow-[0_0_8px_oklch(0.65_0.24_25/0.6)]" : "bg-muted"
              }`}
            />
          ))}
        </div>
      </div>

      {/* Time bar */}
      <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-muted">
        <div
          className={`h-full transition-all duration-1000 ease-linear ${
            timeLeft <= 10 ? "bg-destructive shadow-[0_0_12px_oklch(0.65_0.24_25/0.8)]" : timeLeft <= 25 ? "bg-[var(--color-gold)]" : "gradient-primary"
          }`}
          style={{ width: `${timeBarPct}%` }}
        />
      </div>

      {/* Clue progress */}
      <div className="mt-4">
        <div className="flex items-center justify-between text-[11px] font-bold uppercase tracking-[0.18em] text-muted-foreground">
          <span>Pistas <span className="text-foreground">{revealed}</span>/{clues.length}</span>
          <span className="text-primary">+{Math.max(0, (clues.length - revealed)) * 25} XP bónus</span>
        </div>
        <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-muted">
          <div className="h-full gradient-primary transition-all duration-500" style={{ width: `${progress}%` }} />
        </div>
      </div>

      {/* Mystery avatar */}
      <div className="mt-6 flex flex-col items-center">
        <div className="relative">
          <div className={`absolute inset-0 rounded-full blur-2xl transition ${status === "won" ? "bg-primary/60" : "bg-primary/15"}`} />
          {status === "playing" ? (
            <div className="relative flex h-24 w-24 items-center justify-center rounded-full bg-gradient-to-br from-muted to-card text-5xl font-bold text-muted-foreground ring-2 ring-border">
              <span className="animate-pulse">?</span>
            </div>
          ) : (
            <div className="animate-pop">
              <PlayerAvatar initials={player.name.slice(0, 2)} gradient={player.gradient} size="xl" emoji={player.emoji} />
            </div>
          )}
        </div>
        <p className="mt-3 font-display text-[10px] font-bold uppercase tracking-[0.25em] text-muted-foreground">
          {status === "playing" ? "Quem é este jogador?" : player.name}
        </p>
      </div>

      {/* Clues — staggered on first paint, instant on reveal */}
      <div className="mt-5 space-y-2">
        {clues.slice(0, revealed).map((c, i) => {
          const isNewest = i === revealed - 1;
          return (
            <div
              key={c.label}
              className="flex items-center gap-3 rounded-2xl border border-border gradient-card p-3 shadow-sm animate-clue"
              style={{ animationDelay: isNewest && revealed === 1 ? `${i * 80}ms` : "0ms" }}
            >
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/15 text-lg ring-1 ring-primary/20">
                {c.icon}
              </div>
              <div className="min-w-0 flex-1">
                <p className="font-display text-[10px] font-bold uppercase tracking-[0.2em] text-primary">{c.label}</p>
                <p className="truncate text-[15px] font-semibold leading-tight">{c.value}</p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Past guesses */}
      {guesses.length > 0 && status === "playing" && (
        <div className="mt-4 flex flex-wrap gap-1.5">
          {guesses.map((g, i) => (
            <span
              key={i}
              className={`animate-pop rounded-full border px-2.5 py-1 text-xs font-semibold ${
                g.correct
                  ? "border-primary/50 bg-primary/15 text-primary"
                  : "border-destructive/40 bg-destructive/10 text-destructive line-through"
              }`}
            >
              {g.text}
            </span>
          ))}
        </div>
      )}

      <div className="flex-1" />

      {/* Reveal extra */}
      {status === "playing" && revealed < clues.length && (
        <button
          onClick={revealMore}
          className="mx-auto mt-4 flex items-center gap-2 rounded-full border border-border bg-card px-4 py-2 text-xs font-bold uppercase tracking-wider text-muted-foreground transition hover:border-primary/40 hover:text-foreground active:scale-95"
        >
          <Zap className="h-3.5 w-3.5" /> Pista extra <span className="text-destructive/80">–25 XP</span>
        </button>
      )}

      {/* Input */}
      {status === "playing" && (
        <form
          onSubmit={submit}
          className={`sticky bottom-0 -mx-5 mt-4 border-t border-border bg-background/95 px-5 pb-[max(1rem,env(safe-area-inset-bottom))] pt-4 backdrop-blur transition-all ${
            flash === "wrong" ? "animate-shake" : ""
          }`}
        >
          <div className="flex gap-2">
            <input
              autoFocus
              value={guess}
              onChange={(e) => setGuess(e.target.value)}
              placeholder="A tua resposta..."
              className={`flex-1 rounded-2xl border bg-input px-4 py-3.5 text-base font-medium outline-none transition focus:ring-2 ${
                flash === "wrong"
                  ? "border-destructive ring-destructive/30"
                  : flash === "correct"
                  ? "border-primary ring-primary/30"
                  : "border-border focus:border-primary focus:ring-primary/30"
              }`}
            />
            <button
              type="submit"
              disabled={!guess.trim()}
              className="rounded-2xl gradient-primary px-5 font-bold text-primary-foreground shadow-glow transition active:scale-95 disabled:opacity-50"
            >
              <Check className="h-5 w-5" />
            </button>
          </div>
        </form>
      )}

      <style>{`
        @keyframes clue-in {
          0% { opacity: 0; transform: translateY(-10px) scale(0.95); filter: blur(6px); }
          60% { opacity: 1; filter: blur(0); }
          100% { opacity: 1; transform: translateY(0) scale(1); }
        }
        .animate-clue { animation: clue-in 0.5s cubic-bezier(0.16, 1, 0.3, 1) both; }
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          20% { transform: translateX(-6px); }
          40% { transform: translateX(6px); }
          60% { transform: translateX(-4px); }
          80% { transform: translateX(4px); }
        }
        .animate-shake { animation: shake 0.4s ease-in-out; }
        @keyframes heartbeat {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.005); }
        }
        .animate-heartbeat { animation: heartbeat 1s ease-in-out infinite; }
      `}</style>
    </div>
  );
}
