"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Clock, Save, Check, Calendar, Info } from "lucide-react";

const diasSemana = [
  { dia: 0, label: "Domingo" },
  { dia: 1, label: "Segunda-feira" },
  { dia: 2, label: "Terça-feira" },
  { dia: 3, label: "Quarta-feira" },
  { dia: 4, label: "Quinta-feira" },
  { dia: 5, label: "Sexta-feira" },
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
  const [savedRecently, setSavedRecently] = useState(false);
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
    setSavedRecently(true);
    setTimeout(() => setSavedRecently(false), 3000);
  }

  if (loading) {
    return (
      <div className="space-y-4 max-w-2xl">
        <div className="h-24 bg-card border border-border rounded-2xl animate-pulse" />
        <div className="space-y-3">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="h-16 bg-card border border-border rounded-2xl animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl space-y-6">
      {/* HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-card border border-border rounded-2xl p-6 shadow-sm">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <Calendar className="w-5 h-5 text-primary" />
            <h1 className="text-xl font-bold text-foreground font-display">Horários de Atendimento</h1>
          </div>
          <p className="text-muted-foreground text-xs">
            Configure seus dias de trabalho e faixas horárias para agendamentos online.
          </p>
        </div>
        <button
          onClick={salvar}
          disabled={saving}
          className={`inline-flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-semibold rounded-xl transition-all shadow-sm ${
            savedRecently
              ? "bg-green-500/10 text-green-400 border border-green-500/20 hover:bg-green-500/15"
              : "bg-primary text-primary-foreground hover:opacity-90 disabled:opacity-50"
          }`}
        >
          {saving ? (
            "Salvando..."
          ) : savedRecently ? (
            <>
              <Check className="w-4 h-4" /> Salvo!
            </>
          ) : (
            <>
              <Save className="w-4 h-4" /> Salvar Alterações
            </>
          )}
        </button>
      </div>

      {/* INFORMATIVO */}
      <div className="bg-muted/20 border border-border/40 rounded-2xl p-4 flex gap-3 text-xs text-muted-foreground">
        <Info className="w-4 h-4 text-primary shrink-0 mt-0.5" />
        <p className="leading-relaxed">
          Os dias desmarcados serão exibidos como <strong className="text-foreground">Folga</strong> na sua agenda e ficarão indisponíveis para escolha dos clientes na página de agendamento público.
        </p>
      </div>

      {/* DIAS DA SEMANA */}
      <div className="space-y-3">
        {agenda.map((d) => (
          <div
            key={d.dia}
            className={`border rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-all duration-200 ${
              d.ativo
                ? "border-primary/20 bg-primary/[0.01] shadow-sm"
                : "border-border/40 bg-card/45 opacity-55"
            }`}
          >
            <div className="flex items-center gap-3">
              <label className="relative flex items-center cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={d.ativo}
                  onChange={() => toggleDia(d.dia)}
                  className="sr-only peer"
                />
                <div className="w-9 h-5 bg-muted peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-primary"></div>
              </label>
              <span className="text-sm font-bold text-foreground font-display">
                {d.label}
              </span>
            </div>

            {d.ativo ? (
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2 bg-background border border-border/80 rounded-xl px-3 py-2 shadow-sm focus-within:border-primary/50 transition-colors">
                  <Clock className="w-3.5 h-3.5 text-muted-foreground/60" />
                  <input
                    type="time"
                    value={d.hora_inicio}
                    onChange={(e) =>
                      updateHorario(d.dia, "hora_inicio", e.target.value)
                    }
                    className="bg-transparent border-0 text-foreground text-xs focus:outline-none font-medium w-16"
                  />
                </div>
                <span className="text-muted-foreground text-[10px] font-bold uppercase tracking-wider select-none">até</span>
                <div className="flex items-center gap-2 bg-background border border-border/80 rounded-xl px-3 py-2 shadow-sm focus-within:border-primary/50 transition-colors">
                  <Clock className="w-3.5 h-3.5 text-muted-foreground/60" />
                  <input
                    type="time"
                    value={d.hora_fim}
                    onChange={(e) =>
                      updateHorario(d.dia, "hora_fim", e.target.value)
                    }
                    className="bg-transparent border-0 text-foreground text-xs focus:outline-none font-medium w-16"
                  />
                </div>
              </div>
            ) : (
              <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground bg-muted/60 px-3 py-1.5 rounded-lg border border-border/30 sm:ml-auto select-none">
                Folga / Fechado
              </span>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
