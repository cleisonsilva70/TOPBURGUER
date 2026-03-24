"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export function OwnerLoginForm() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSubmitting(true);
    setError("");

    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ password }),
      });

      if (!response.ok) {
        const data = await response.json();
        setError(data.error ?? "Senha invalida.");
        return;
      }

      router.push("/cozinha");
      router.refresh();
    } catch {
      setError("Nao foi possivel entrar agora.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr] lg:items-stretch">
      <section className="panel-card p-8 sm:p-10">
        <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[var(--brand-strong)]">
          Area restrita
        </p>
        <h1 className="mt-3 text-4xl font-black uppercase">
          Acesso interno da operacao
        </h1>
        <p className="mt-4 max-w-2xl text-base leading-7 text-[var(--muted)]">
          Esta entrada libera atendimento, cozinha e painel interno. Use a senha
          do proprietario para continuar.
        </p>

        <div className="mt-8 grid gap-4 sm:grid-cols-3">
          {[
            "Triagem do atendimento",
            "Liberacao manual para cozinha",
            "Atualizacao rapida do pedido",
          ].map((item) => (
            <div key={item} className="panel-subtle p-4 text-sm font-semibold leading-6 text-[var(--foreground)]">
              {item}
            </div>
          ))}
        </div>
      </section>

      <form onSubmit={handleSubmit} className="panel-card p-8 sm:p-10">
        <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[var(--brand-strong)]">
          Login
        </p>
        <h2 className="mt-3 text-3xl font-black uppercase">Entrar agora</h2>

        <label className="mt-8 block space-y-2">
          <span className="text-sm font-semibold">Senha do proprietario</span>
          <input
            type="password"
            required
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            className="w-full rounded-2xl border border-[var(--line)] bg-white/88 px-4 py-3 outline-none transition-colors focus:border-[var(--brand)]"
          />
        </label>

        {error ? (
          <p className="mt-5 rounded-2xl border border-[rgba(179,63,47,0.22)] bg-[rgba(179,63,47,0.08)] px-4 py-3 text-sm text-[var(--danger)]">
            {error}
          </p>
        ) : null}

        <button
          type="submit"
          disabled={isSubmitting}
          className="mt-6 inline-flex w-full items-center justify-center rounded-full bg-[linear-gradient(180deg,rgba(184,68,31,1),rgba(145,47,18,1))] px-6 py-4 text-sm font-bold uppercase tracking-[0.18em] text-white transition-colors hover:brightness-105 disabled:cursor-not-allowed disabled:bg-[rgba(184,68,31,0.45)]"
        >
          {isSubmitting ? "Entrando..." : "Entrar na operacao"}
        </button>
      </form>
    </div>
  );
}
