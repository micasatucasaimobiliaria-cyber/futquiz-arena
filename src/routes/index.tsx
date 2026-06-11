import { createFileRoute, Link } from "@tanstack/react-router";
import { Trophy, Zap, Flame } from "lucide-react";

export const Route = createFileRoute("/")({ component: Landing });

function Landing() {
  return (
    <div className="mx-auto min-h-screen max-w-md overflow-hidden">
      <div className="relative min-h-screen gradient-hero pitch-lines px-6 pb-10 pt-16">
        {/* Logo */}
        <div className="animate-fade-in flex flex-col items-center text-center">
          <div className="relative mb-8">
            <div className="absolute inset-0 rounded-full bg-primary/30 blur-3xl" />
            <div className="relative flex h-28 w-28 items-center justify-center rounded-3xl gradient-primary shadow-glow">
              <span className="text-6xl">⚽</span>
            </div>
          </div>
          <h1 className="text-5xl font-black tracking-tight">
            Fut<span className="text-primary">Quiz</span>
          </h1>
          <p className="mt-1 text-xs font-bold uppercase tracking-[0.4em] text-muted-foreground">Arena</p>
          <p className="mt-6 max-w-xs text-balance text-lg text-muted-foreground">
            Prova o teu conhecimento de futebol.
          </p>
        </div>

        {/* Feature pills */}
        <div className="mt-10 grid grid-cols-3 gap-3 animate-slide-up">
          {[
            { Icon: Zap, label: "Rápido" },
            { Icon: Flame, label: "Sequências" },
            { Icon: Trophy, label: "Rankings" },
          ].map(({ Icon, label }) => (
            <div key={label} className="gradient-card rounded-2xl border border-border p-3 text-center">
              <Icon className="mx-auto h-5 w-5 text-primary" />
              <p className="mt-1 text-[11px] font-semibold text-muted-foreground">{label}</p>
            </div>
          ))}
        </div>

        {/* CTAs */}
        <div className="mt-10 space-y-3 animate-slide-up">
          <Link
            to="/auth"
            className="block w-full rounded-2xl gradient-primary py-4 text-center text-base font-bold text-primary-foreground shadow-glow transition active:scale-[0.98]"
          >
            Começar a Jogar
          </Link>
          <Link
            to="/daily"
            className="block w-full rounded-2xl border border-border bg-card py-4 text-center text-base font-semibold transition hover:border-primary/50 active:scale-[0.98]"
          >
            🎯 Desafio Diário
          </Link>
        </div>

        <p className="mt-10 text-center text-xs text-muted-foreground">
          15 lendas. Modos infinitos. Uma só bola.
        </p>
      </div>
    </div>
  );
}
