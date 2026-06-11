import { type ReactNode } from "react";
import { BottomNav } from "./BottomNav";

export function AppShell({ children, showNav = true }: { children: ReactNode; showNav?: boolean }) {
  return (
    <div className="relative mx-auto min-h-screen max-w-md overflow-hidden">
      <div className="ambient-lights" aria-hidden />
      <main className={`relative z-10 animate-fade-in ${showNav ? "pb-28" : ""}`}>{children}</main>
      {showNav && <BottomNav />}
    </div>
  );
}
