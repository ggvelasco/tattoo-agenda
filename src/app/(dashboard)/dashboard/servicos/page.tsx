"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { User } from "lucide-react";

type Servico = {
  id: string;
  nome: string;
  descricao: string | null;
  duracao_minutos: number;
  preco: number;
  ativo: boolean;
};

export default function ServicosPage() {
  const [servicos, setServicos] = useState<Servico[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editando, setEditando] = useState<Servico | null>(null);

  const [nome, setNome] = useState("");
  const [descricao, setDescricao] = useState("");
  const [duracao, setDuracao] = useState("");
  const [preco, setPreco] = useState("");
  const [saving, setSaving] = useState(false);

  async function fetchServicos() {
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return;

    const { data: perfil } = await supabase
      .from("profissionais")
      .select("id")
      .eq("user_id", user.id)
      .single();

    if (!perfil) return;

    const { data, error: servicosError } = await supabase
      .from("servicos")
      .select("*")
      .eq("profissional_id", perfil.id)
      .order("created_at", { ascending: false });

    setServicos(data || []);
    setLoading(false);
  }

  useEffect(() => {
    fetchServicos();
  }, []);

  function abrirForm(servico?: Servico) {
    if (servico) {
      setEditando(servico);
      setNome(servico.nome);
      setDescricao(servico.descricao || "");
      setDuracao(String(servico.duracao_minutos));
      setPreco(String(servico.preco));
    } else {
      setEditando(null);
      setNome("");
      setDescricao("");
      setDuracao("");
      setPreco("");
    }
    setShowForm(true);
  }

  function fecharForm() {
    setShowForm(false);
    setEditando(null);
  }

  async function salvar() {
    if (!nome || !duracao || !preco) return;
    setSaving(true);

    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return;

    const { data: perfil, error: perfilError } = await supabase
      .from("profissionais")
      .select("id")
      .eq("user_id", user.id)
      .single();

    if (!perfil) return;

    if (editando) {
      await supabase
        .from("servicos")
        .update({
          nome,
          descricao,
          duracao_minutos: Number(duracao),
          preco: Number(preco),
        })
        .eq("id", editando.id);
    } else {
      await supabase.from("servicos").insert({
        profissional_id: perfil.id,
        nome,
        descricao,
        duracao_minutos: Number(duracao),
        preco: Number(preco),
      });
    }

    await fetchServicos();
    fecharForm();
    setSaving(false);
  }

  async function deletar(id: string) {
    if (!confirm("Tem certeza que deseja remover este serviço?")) return;
    const supabase = createClient();
    await supabase.from("servicos").delete().eq("id", id);
    await fetchServicos();
  }

  return (
    <div className="max-w-3xl">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Serviços</h1>
          <p className="text-muted-foreground text-sm mt-1">
            Gerencie os serviços que você oferece
          </p>
        </div>
        <button
          onClick={() => abrirForm()}
          className="bg-primary text-primary-foreground px-4 py-2 text-sm font-medium hover:opacity-90 transition rounded-md"
        >
          + Novo serviço
        </button>
      </div>

      {/* FORM */}
      {showForm && (
        <div className="bg-card border border-border rounded-lg p-6 mb-6">
          <h2 className="text-base font-semibold text-foreground mb-4">
            {editando ? "Editar serviço" : "Novo serviço"}
          </h2>
          <div className="space-y-4">
            <div>
              <label className="block text-xs uppercase tracking-widest text-muted-foreground mb-2">
                Nome
              </label>
              <input
                type="text"
                value={nome}
                onChange={(e) => setNome(e.target.value)}
                placeholder="Ex: Tatuagem Pequena"
                className="w-full bg-background border border-border text-foreground px-3 py-2 text-sm rounded-md focus:outline-none focus:border-ring"
              />
            </div>
            <div>
              <label className="block text-xs uppercase tracking-widest text-muted-foreground mb-2">
                Descrição (opcional)
              </label>
              <textarea
                value={descricao}
                onChange={(e) => setDescricao(e.target.value)}
                placeholder="Descreva o serviço..."
                rows={2}
                className="w-full bg-background border border-border text-foreground px-3 py-2 text-sm rounded-md focus:outline-none focus:border-ring resize-none"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs uppercase tracking-widest text-muted-foreground mb-2">
                  Duração (minutos)
                </label>
                <input
                  type="number"
                  value={duracao}
                  onChange={(e) => setDuracao(e.target.value)}
                  placeholder="Ex: 60"
                  className="w-full bg-background border border-border text-foreground px-3 py-2 text-sm rounded-md focus:outline-none focus:border-ring"
                />
              </div>
              <div>
                <label className="block text-xs uppercase tracking-widest text-muted-foreground mb-2">
                  Preço (R$)
                </label>
                <input
                  type="number"
                  value={preco}
                  onChange={(e) => setPreco(e.target.value)}
                  placeholder="Ex: 200"
                  className="w-full bg-background border border-border text-foreground px-3 py-2 text-sm rounded-md focus:outline-none focus:border-ring"
                />
              </div>
            </div>
          </div>
          <div className="flex gap-3 mt-6">
            <button
              onClick={salvar}
              disabled={saving}
              className="bg-primary text-primary-foreground px-4 py-2 text-sm font-medium hover:opacity-90 transition rounded-md disabled:opacity-50"
            >
              {saving ? "Salvando..." : "Salvar"}
            </button>
            <button
              onClick={fecharForm}
              className="text-muted-foreground text-sm hover:text-foreground transition px-4 py-2"
            >
              Cancelar
            </button>
          </div>
        </div>
      )}

      {/* LISTA */}
      {loading ? (
        <p className="text-muted-foreground text-sm">Carregando...</p>
      ) : servicos.length === 0 ? (
        <div className="border border-dashed border-border rounded-lg p-12 text-center">
          <p className="text-muted-foreground text-sm">
            Nenhum serviço cadastrado ainda.
          </p>
          <button
            onClick={() => abrirForm()}
            className="text-primary text-sm mt-2 hover:underline"
          >
            Criar primeiro serviço
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {servicos.map((s) => (
            <div
              key={s.id}
              className="bg-card border border-border rounded-lg p-4 flex items-center justify-between"
            >
              <div>
                <p className="text-sm font-medium text-foreground">{s.nome}</p>
                {s.descricao && (
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {s.descricao}
                  </p>
                )}
                <div className="flex gap-3 mt-1">
                  <span className="text-xs text-muted-foreground">
                    {s.duracao_minutos}min
                  </span>
                  <span className="text-xs text-muted-foreground">
                    R$ {Number(s.preco).toFixed(2)}
                  </span>
                </div>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => abrirForm(s)}
                  className="text-xs text-muted-foreground hover:text-foreground transition px-3 py-1 border border-border rounded-md"
                >
                  Editar
                </button>
                <button
                  onClick={() => deletar(s.id)}
                  className="text-xs text-destructive hover:opacity-70 transition px-3 py-1 border border-destructive/30 rounded-md"
                >
                  Remover
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
