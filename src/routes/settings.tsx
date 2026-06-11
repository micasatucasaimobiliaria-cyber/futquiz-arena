import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { AppShell } from "@/components/AppShell";
import { services } from "@/services";
import { useSettings } from "@/hooks/use-services";
import { Volume2, VolumeX, Moon, Languages, RotateCcw } from "lucide-react";

export const Route = createFileRoute("/settings")({ component: Settings });

function Settings() {
  const navigate = useNavigate();
  // Settings stay device-local even after Supabase migration (UI prefs).
  const [s, update] = useSettings();
  const [confirming, setConfirming] = useState(false);

  const reset = async () => {
    // → Supabase: account deletion server fn (supabaseAdmin.auth.admin.deleteUser).
    await services.stats.reset();
    await services.auth.signOut();
    setConfirming(false);
    navigate({ to: "/" });
  };


  return (
    <AppShell>
      <div className="px-5 pt-10">
        <p className="text-xs uppercase tracking-widest text-muted-foreground">Personaliza</p>
        <h1 className="mt-1 text-3xl font-bold">Definições</h1>

        <div className="mt-6 space-y-3">
          <Row
            Icon={s.soundOn ? Volume2 : VolumeX}
            label="Som"
            desc="Efeitos sonoros do jogo"
            right={<Toggle on={s.soundOn} onChange={(v) => update({ soundOn: v })} />}
          />
          <Row
            Icon={Moon}
            label="Modo escuro"
            desc="Ativado por defeito"
            right={<Toggle on disabled />}
          />
          <Row
            Icon={Languages}
            label="Idioma"
            desc="Português / English"
            right={
              <div className="flex gap-1 rounded-xl border border-border bg-card p-1">
                {(["pt", "en"] as const).map((l) => (
                  <button
                    key={l}
                    onClick={() => update({ language: l })}
                    className={`rounded-lg px-3 py-1.5 text-xs font-bold uppercase transition ${
                      s.language === l ? "gradient-primary text-primary-foreground" : "text-muted-foreground"
                    }`}
                  >
                    {l}
                  </button>
                ))}
              </div>
            }
          />
        </div>

        <div className="mt-8">
          <p className="px-1 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Zona de perigo</p>
          <button
            onClick={() => setConfirming(true)}
            className="mt-2 flex w-full items-center gap-3 rounded-2xl border border-destructive/30 bg-destructive/10 p-4 text-left transition active:scale-[0.99]"
          >
            <RotateCcw className="h-5 w-5 text-destructive" />
            <div>
              <p className="text-sm font-bold text-destructive">Reiniciar progresso</p>
              <p className="text-xs text-destructive/80">Apaga XP, sequências e perfil</p>
            </div>
          </button>
        </div>

        <p className="mt-10 text-center text-[10px] uppercase tracking-widest text-muted-foreground">
          FutQuiz Arena · v1.0
        </p>
      </div>

      {confirming && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/60 backdrop-blur animate-fade-in">
          <div className="w-full max-w-md rounded-t-3xl border-t border-border bg-card p-6 animate-slide-up">
            <div className="mx-auto mb-4 h-1 w-10 rounded-full bg-border" />
            <h2 className="text-lg font-bold">Tens a certeza?</h2>
            <p className="mt-1 text-sm text-muted-foreground">Esta acção não pode ser desfeita.</p>
            <div className="mt-6 flex gap-2 pb-[env(safe-area-inset-bottom)]">
              <button onClick={() => setConfirming(false)} className="flex-1 rounded-2xl border border-border py-3 font-semibold">
                Cancelar
              </button>
              <button onClick={reset} className="flex-1 rounded-2xl bg-destructive py-3 font-bold text-destructive-foreground">
                Reiniciar
              </button>
            </div>
          </div>
        </div>
      )}
    </AppShell>
  );
}

function Row({ Icon, label, desc, right }: { Icon: typeof Moon; label: string; desc: string; right: React.ReactNode }) {
  return (
    <div className="flex items-center gap-3 rounded-2xl border border-border gradient-card p-4">
      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/15 text-primary">
        <Icon className="h-5 w-5" />
      </div>
      <div className="flex-1">
        <p className="text-sm font-bold">{label}</p>
        <p className="text-[11px] text-muted-foreground">{desc}</p>
      </div>
      {right}
    </div>
  );
}

function Toggle({ on, onChange, disabled }: { on: boolean; onChange?: (v: boolean) => void; disabled?: boolean }) {
  return (
    <button
      onClick={() => !disabled && onChange?.(!on)}
      disabled={disabled}
      className={`relative h-7 w-12 rounded-full transition ${on ? "gradient-primary" : "bg-muted"} ${disabled ? "opacity-60" : ""}`}
    >
      <span className={`absolute top-0.5 h-6 w-6 rounded-full bg-white shadow transition-transform ${on ? "translate-x-5" : "translate-x-0.5"}`} />
    </button>
  );
}
