"use client";

import { createClient } from "@/lib/supabase/client";
import { useEffect, useState } from "react";

type Agendamento = {
  id: string;
  data: string;
  hora_inicio: string;
  hora_fim: string;
  status: string;
  valor: number;
  clientes: { nome: string; telefone: string; email: string } | null;
  servicos: { nome: string; duracao_minutos: number } | null;
};

export default function AgendamentosPage() {
  const [agendamentos, setAgendamentos] = useState<Agendamento[]>([]);
  const [loading, setLoading] = useState(true);

  async function fetchAgendamentos() {
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

    const { data } = await supabase
      .from("agendamentos")
      .select(
        `
      *,
      clientes(nome, telefone, email),
      servicos(nome, duracao_minutos)
    `,
      )
      .eq("profissional_id", perfil.id)
      .order("status", { ascending: false })
      .order("data", { ascending: false })
      .limit(50);
    setAgendamentos(data || []);
    setLoading(false);
  }
  useEffect(() => {
    fetchAgendamentos();
  }, []);

  async function atualizarStatus(id: string, status: string) {
    const supabase = createClient();
    await supabase.from("agendamentos").update({ status }).eq("id", id);
    await fetchAgendamentos();
  }

  function formatarData(data: string, hora: string) {
    const date = new Date(data + "T12:00:00");

    const diaSemana = date.toLocaleDateString("pt-BR", { weekday: "long" });
    const dataFormatada = date.toLocaleDateString("pt-BR");
    const horaFormatada = hora.slice(0, 5).replace(":", "h");

    return `${dataFormatada} - ${diaSemana.charAt(0).toUpperCase() + diaSemana.slice(1)} às ${horaFormatada}`;
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-foreground mb-6">Agendamentos</h1>
      {loading && (
        <p className="text-muted-foreground text-sm">Carregando...</p>
      )}
      {agendamentos.map((ag) => (
        <div key={ag.id} className="border border-border p-4 rounded-lg mb-3">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-foreground font-medium">{ag.clientes?.nome}</p>
              <p className="text-muted-foreground text-sm">
                {ag.servicos?.nome}
              </p>
              <p className="text-muted-foreground text-sm">
                {formatarData(ag.data, ag.hora_inicio)}
              </p>

              <p className="text-muted-foreground text-sm">
                📱 {ag.clientes?.telefone}
              </p>
            </div>
            <span
              className={`text-xs px-2 py-1 rounded-full ${
                ag.status === "confirmado"
                  ? "bg-green-900 text-green-300"
                  : ag.status === "cancelado"
                    ? "bg-red-900 text-red-300"
                    : "bg-yellow-900 text-yellow-300"
              }`}
            >
              {ag.status}
            </span>
          </div>

          {ag.status === "pendente" && (
            <div className="flex gap-2 mt-3 pt-3 border-t border-border">
              <button
                onClick={() => atualizarStatus(ag.id, "confirmado")}
                className="flex-1 bg-green-900 text-green-300 py-1.5 text-xs rounded-md hover:opacity-80 transition"
              >
                Confirmar
              </button>
              <button
                onClick={() => atualizarStatus(ag.id, "cancelado")}
                className="flex-1 bg-red-900/50 text-red-300 py-1.5 text-xs rounded-md hover:opacity-80 transition"
              >
                Cancelar
              </button>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
