import { Link, useRouterState } from "@tanstack/react-router";
import { Home, Gamepad2, Trophy, User, Settings } from "lucide-react";

const items = [
  { to: "/home", label: "Início", Icon: Home },
  { to: "/modes", label: "Modos", Icon: Gamepad2 },
  { to: "/leaderboard", label: "Ranking", Icon: Trophy },
  { to: "/profile", label: "Perfil", Icon: User },
  { to: "/settings", label: "Definições", Icon: Settings },
] as const;

export function BottomNav() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  return (
    <nav className="fixed bottom-0 left-1/2 z-40 w-full max-w-md -translate-x-1/2 px-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] pt-2">
      <div className="glass-strong relative flex items-center justify-around rounded-3xl px-2 py-2 shadow-card">
        <div className="pointer-events-none absolute inset-x-6 -top-px h-px bg-gradient-to-r from-transparent via-primary/60 to-transparent" />
        {items.map(({ to, label, Icon }) => {
          const active = pathname === to;
          return (
            <Link
              key={to}
              to={to}
              className={`relative flex min-w-[56px] flex-col items-center gap-0.5 rounded-2xl px-2.5 py-1.5 text-[10px] font-semibold transition-all duration-300 ${
                active ? "text-primary-foreground" : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {active && (
                <span className="absolute inset-0 -z-10 rounded-2xl gradient-primary shadow-glow" />
              )}
              <div className={`flex h-6 items-center transition-transform duration-300 ${active ? "scale-110" : ""}`}>
                <Icon className="h-5 w-5" strokeWidth={active ? 2.6 : 2} />
              </div>
              <span className="tracking-wide">{label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
