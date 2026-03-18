"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";

const diasSemana = [
  { dia: 0, label: "Domingo" },
  { dia: 1, label: "Segunda" },
  { dia: 2, label: "Terça" },
  { dia: 3, label: "Quarta" },
  { dia: 4, label: "Quinta" },
  { dia: 5, label: "Sexta" },
  { dia: 6, label: "Sábado" },
];

type DiaAgenda = {
  dia: number;
  label: string;
  ativo: boolean;
  hora_inicio: string;
  hora_fim: string;
};

export default function HorariosPage() {
  const [agenda, setAgenda] = useState<DiaAgenda[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [perfilId, setPerfilId] = useState<string | null>(null);

  useEffect(() => {
    fetchHorarios();
  }, []);

  async function fetchHorarios() {
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
    setPerfilId(perfil.id);

    const { data: disponibilidade } = await supabase
      .from("disponibilidade")
      .select("*")
      .eq("profissional_id", perfil.id);

    // cruzamento — agora disponibilidade já existe
    const agendaMontada = diasSemana.map((d) => {
      const cadastrado = disponibilidade?.find((x) => x.dia_semana === d.dia);
      return {
        dia: d.dia,
        label: d.label,
        ativo: cadastrado ? true : false,
        hora_inicio: cadastrado?.hora_inicio || "09:00",
        hora_fim: cadastrado?.hora_fim || "18:00",
      };
    });

    setAgenda(agendaMontada);
    setLoading(false);
  }

  function toggleDia(dia: number) {
    setAgenda((prev) =>
      prev.map((d) => (d.dia === dia ? { ...d, ativo: !d.ativo } : d)),
    );
  }

  function updateHorario(
    dia: number,
    campo: "hora_inicio" | "hora_fim",
    valor: string,
  ) {
    setAgenda((prev) =>
      prev.map((d) => (d.dia === dia ? { ...d, [campo]: valor } : d)),
    );
  }

  async function salvar() {
    if (!perfilId) return;
    setSaving(true);

    const supabase = createClient();
    const diasAtivos = agenda.filter((d) => d.ativo);

    // deleta tudo e reinsere — mais simples que fazer upsert
    await supabase
      .from("disponibilidade")
      .delete()
      .eq("profissional_id", perfilId);

    if (diasAtivos.length > 0) {
      await supabase.from("disponibilidade").insert(
        diasAtivos.map((d) => ({
          profissional_id: perfilId,
          dia_semana: d.dia,
          hora_inicio: d.hora_inicio,
          hora_fim: d.hora_fim,
          ativo: true,
        })),
      );
    }

    setSaving(false);
    alert("Horários salvos!");
  }

  if (loading)
    return <p className="text-muted-foreground text-sm">Carregando...</p>;

  return (
    <div className="max-w-2xl">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Horários</h1>
          <p className="text-muted-foreground text-sm mt-1">
            Configure seus dias e horários de atendimento
          </p>
        </div>
        <button
          onClick={salvar}
          disabled={saving}
          className="bg-primary text-primary-foreground px-4 py-2 text-sm font-medium hover:opacity-90 transition rounded-md disabled:opacity-50"
        >
          {saving ? "Salvando..." : "Salvar horários"}
        </button>
      </div>

      <div className="space-y-3">
        {agenda.map((d) => (
          <div
            key={d.dia}
            className={`border rounded-lg p-4 flex items-center gap-4 transition-colors ${
              d.ativo
                ? "border-border bg-card"
                : "border-border/50 bg-card/50 opacity-60"
            }`}
          >
            <input
              type="checkbox"
              checked={d.ativo}
              onChange={() => toggleDia(d.dia)}
              className="w-4 h-4 cursor-pointer"
            />
            <span className="text-sm font-medium text-foreground w-20">
              {d.label}
            </span>

            {d.ativo && (
              <div className="flex items-center gap-2 ml-auto">
                <input
                  type="time"
                  value={d.hora_inicio}
                  onChange={(e) =>
                    updateHorario(d.dia, "hora_inicio", e.target.value)
                  }
                  className="bg-background border border-border text-foreground px-2 py-1 text-sm rounded-md focus:outline-none focus:border-ring"
                />
                <span className="text-muted-foreground text-sm">até</span>
                <input
                  type="time"
                  value={d.hora_fim}
                  onChange={(e) =>
                    updateHorario(d.dia, "hora_fim", e.target.value)
                  }
                  className="bg-background border border-border text-foreground px-2 py-1 text-sm rounded-md focus:outline-none focus:border-ring"
                />
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
