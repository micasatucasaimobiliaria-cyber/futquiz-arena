import { createFileRoute, Link } from "@tanstack/react-router";
import { AppShell } from "@/components/AppShell";
import { Lock } from "lucide-react";

export const Route = createFileRoute("/modes")({ component: Modes });

const modes = [
  { id: "guess", icon: "🕵️", title: "Adivinha o Jogador", desc: "Recebe pistas e advinha em 5 tentativas", to: "/play" as const, available: true, color: "from-emerald-500 to-teal-700" },
  { id: "career", icon: "🛤️", title: "Carreira", desc: "Identifica jogadores pela carreira", available: false, color: "from-sky-500 to-indigo-700" },
  { id: "badges", icon: "🛡️", title: "Emblemas", desc: "Reconhece emblemas de clubes", available: false, color: "from-rose-500 to-red-700" },
  { id: "transfers", icon: "💸", title: "Mercado", desc: "Adivinha valores de transferência", available: false, color: "from-amber-500 to-orange-700" },
  { id: "ucl", icon: "🏆", title: "Lendas da Champions", desc: "Heróis das noites mágicas", available: false, color: "from-blue-600 to-violet-700" },
  { id: "ligapt", icon: "🇵🇹", title: "Clássicos Portugueses", desc: "Liga Portugal através dos anos", available: false, color: "from-green-600 to-red-600" },
];

function Modes() {
  return (
    <AppShell>
      <div className="px-5 pt-10">
        <p className="text-xs uppercase tracking-widest text-muted-foreground">Escolhe</p>
        <h1 className="mt-1 text-3xl font-bold">Modos de Jogo</h1>
        <p className="mt-2 text-sm text-muted-foreground">Seis formas de provar o teu conhecimento.</p>

        <div className="mt-6 space-y-3">
          {modes.map((m) => {
            const card = (
              <div className={`group glass shine relative overflow-hidden rounded-3xl p-5 ${
                m.available ? "lift" : "opacity-60"
              }`}>
                <div className={`absolute -right-10 -top-10 h-32 w-32 rounded-full bg-gradient-to-br ${m.color} opacity-25 blur-3xl transition group-hover:opacity-50`} />
                <div className="relative flex items-start gap-4">
                  <div className={`flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br ${m.color} text-3xl shadow-card ring-1 ring-white/15`}>
                    {m.icon}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <h3 className="font-bold">{m.title}</h3>
                      {!m.available && <Lock className="h-3.5 w-3.5 text-muted-foreground" />}
                    </div>
                    <p className="mt-0.5 text-sm text-muted-foreground">{m.desc}</p>
                    <div className={`mt-2 text-[11px] font-black uppercase tracking-wider ${m.available ? "text-primary" : "text-muted-foreground"}`}>
                      {m.available ? "Disponível →" : "Em breve"}
                    </div>
                  </div>
                </div>
              </div>
            );
            return m.available && m.to ? <Link key={m.id} to={m.to}>{card}</Link> : <div key={m.id}>{card}</div>;
          })}
        </div>
      </div>
    </AppShell>
  );
}
