"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function RegisterPage() {
  const router = useRouter();
  const [nome, setNome] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [slug, setSlug] = useState("");

  async function handleRegister(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    const supabase = createClient();

    // 1. cria o usuário no Supabase Auth
    const { data, error: authError } = await supabase.auth.signUp({
      email,
      password,
    });

    if (authError || !data.user) {
      setError("Erro ao criar conta. Tente novamente.");
      setLoading(false);
      return;
    }

    // 2. cria o perfil na tabela profissionais
    const { error: profileError } = await supabase
      .from("profissionais")
      .insert({
        user_id: data.user.id,
        nome,
        slug,
        email: email,
      });

    if (profileError) {
      setError("Erro ao criar perfil. Tente novamente.");
      setLoading(false);
      return;
    }

    router.push("/dashboard");
    router.refresh();
  }

  return (
    <div className="min-h-screen bg-zinc-950 flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-white mb-1">Criar conta</h1>
          <p className="text-zinc-400 text-sm">
            Comece a receber agendamentos hoje
          </p>
        </div>

        <form onSubmit={handleRegister} className="space-y-4">
          <div>
            <label className="block text-xs uppercase tracking-widest text-zinc-500 mb-2">
              Seu nome
            </label>
            <input
              type="text"
              value={nome}
              onChange={(e) => setNome(e.target.value)}
              required
              className="w-full bg-zinc-900 border border-zinc-800 text-white px-4 py-3 text-sm focus:outline-none focus:border-zinc-500 transition-colors"
              placeholder="João Mendes"
            />
          </div>

          <div>
            <label className="block text-xs uppercase tracking-widest text-zinc-500 mb-2">
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full bg-zinc-900 border border-zinc-800 text-white px-4 py-3 text-sm focus:outline-none focus:border-zinc-500 transition-colors"
              placeholder="seu@email.com"
            />
          </div>
          <div>
            <label className="block text-xs uppercase tracking-widest text-zinc-500 mb-2">
              Seu usuário
            </label>
            <div className="flex items-center bg-zinc-900 border border-zinc-800 focus-within:border-zinc-500 transition-colors">
              <span className="text-zinc-500 text-sm px-3">/</span>
              <input
                type="text"
                value={slug}
                onChange={(e) =>
                  setSlug(
                    e.target.value.toLowerCase().replace(/[^a-z0-9]/g, ""),
                  )
                }
                required
                className="flex-1 bg-transparent text-white py-3 pr-4 text-sm focus:outline-none"
                placeholder="username"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs uppercase tracking-widest text-zinc-500 mb-2">
              Senha
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={6}
              className="w-full bg-zinc-900 border border-zinc-800 text-white px-4 py-3 text-sm focus:outline-none focus:border-zinc-500 transition-colors"
              placeholder="mínimo 6 caracteres"
            />
          </div>

          {error && <p className="text-red-400 text-sm">{error}</p>}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-white text-black py-3 text-sm uppercase tracking-widest font-medium hover:bg-zinc-200 transition-colors disabled:opacity-50"
          >
            {loading ? "Criando conta..." : "Criar conta"}
          </button>
        </form>

        <p className="text-zinc-500 text-sm text-center mt-6">
          Já tem conta?{" "}
          <Link
            href="/login"
            className="text-white hover:text-zinc-300 transition-colors"
          >
            Entrar
          </Link>
        </p>
      </div>
    </div>
  );
}
