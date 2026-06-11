import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useState } from "react";
import { services } from "@/services";

export const Route = createFileRoute("/auth")({ component: Auth });

function Auth() {
  const navigate = useNavigate();
  const [mode, setMode] = useState<"login" | "signup">("login");
  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    try {
      // → Supabase: auth.signIn/signUp call supabase.auth.* under the hood.
      if (mode === "signup") await services.auth.signUp({ email, password, username });
      else await services.auth.signIn({ email, password });
      navigate({ to: "/home" });
    } finally {
      setBusy(false);
    }
  };

  const continueAsGuest = async () => {
    await services.auth.signInAsGuest();
    navigate({ to: "/home" });
  };


  return (
    <div className="mx-auto min-h-screen max-w-md px-6 pb-10 pt-12 animate-fade-in">
      <Link to="/" className="text-sm text-muted-foreground hover:text-foreground">← Voltar</Link>

      <div className="mt-6 text-center">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl gradient-primary shadow-glow">
          <span className="text-3xl">⚽</span>
        </div>
        <h1 className="mt-4 text-3xl font-bold">{mode === "login" ? "Bem-vindo de volta" : "Junta-te à Arena"}</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          {mode === "login" ? "Entra para continuar a tua sequência" : "Cria a tua conta e começa a marcar"}
        </p>
      </div>

      <div className="mt-6 grid grid-cols-2 gap-2 rounded-2xl border border-border bg-card p-1">
        {(["login", "signup"] as const).map((m) => (
          <button
            key={m}
            onClick={() => setMode(m)}
            className={`rounded-xl py-2.5 text-sm font-semibold transition ${
              mode === m ? "gradient-primary text-primary-foreground shadow" : "text-muted-foreground"
            }`}
          >
            {m === "login" ? "Entrar" : "Criar conta"}
          </button>
        ))}
      </div>

      <form onSubmit={submit} className="mt-6 space-y-3">
        {mode === "signup" && (
          <Input label="Nome de utilizador" value={username} onChange={setUsername} placeholder="o_teu_nick" />
        )}
        <Input label="Email" type="email" value={email} onChange={setEmail} placeholder="tu@email.com" required />
        <Input label="Palavra-passe" type="password" value={password} onChange={setPassword} placeholder="••••••••" required />

        <button
          type="submit"
          disabled={busy}
          className="mt-2 w-full rounded-2xl gradient-primary py-4 text-base font-bold text-primary-foreground shadow-glow transition active:scale-[0.98] disabled:opacity-60"
        >
          {busy ? "..." : mode === "login" ? "Entrar" : "Criar conta"}
        </button>
      </form>

      <div className="my-6 flex items-center gap-3">
        <div className="h-px flex-1 bg-border" />
        <span className="text-xs text-muted-foreground">ou</span>
        <div className="h-px flex-1 bg-border" />
      </div>

      <button
        onClick={continueAsGuest}
        className="w-full rounded-2xl border border-border bg-card py-4 text-base font-semibold transition hover:border-primary/50 active:scale-[0.98]"
      >
        Continuar como convidado
      </button>
    </div>
  );
}

function Input({
  label, value, onChange, type = "text", placeholder, required,
}: { label: string; value: string; onChange: (v: string) => void; type?: string; placeholder?: string; required?: boolean }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-muted-foreground">{label}</span>
      <input
        type={type}
        value={value}
        required={required}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full rounded-2xl border border-border bg-input px-4 py-3.5 text-base text-foreground placeholder:text-muted-foreground/60 outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/30"
      />
    </label>
  );
}
