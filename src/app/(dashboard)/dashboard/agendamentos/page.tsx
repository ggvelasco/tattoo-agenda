"use client";

import { createClient } from "@/lib/supabase/client";
import { useEffect, useState } from "react";
import {
  CheckCircle2,
  XCircle,
  Clock,
  CalendarDays,
  Phone,
  Filter,
  ImageIcon,
} from "lucide-react";

import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { VisuallyHidden } from "radix-ui";

type Agendamento = {
  id: string;
  data: string;
  hora_inicio: string;
  hora_fim: string;
  status: string;
  valor: number;
  local_corpo: string | null;
  referencia_url: string | null;
  clientes: { nome: string; telefone: string; email: string } | null;
  servicos: { nome: string; duracao_minutos: number } | null;
};

const TABS = [
  { key: "todos", label: "Todos" },
  { key: "pendente", label: "Pendentes" },
  { key: "confirmado", label: "Confirmados" },
  { key: "cancelado", label: "Cancelados" },
];

const WA_ICON = (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
  </svg>
);

export default function AgendamentosPage() {
  const [imagemAberta, setImagemAberta] = useState<string | null>(null);

  const [agendamentos, setAgendamentos] = useState<Agendamento[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState("todos");

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
        `*, clientes(nome, telefone, email), servicos(nome, duracao_minutos)`,
      )
      .eq("profissional_id", perfil.id)
      .order("data", { ascending: false })
      .order("hora_inicio", { ascending: false })
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
    return `${dataFormatada} · ${diaSemana.charAt(0).toUpperCase() + diaSemana.slice(1)} às ${horaFormatada}`;
  }

  const filtrados =
    tab === "todos"
      ? agendamentos
      : agendamentos.filter((ag) => ag.status === tab);
  const contagem = (status: string) =>
    status === "todos"
      ? agendamentos.length
      : agendamentos.filter((ag) => ag.status === status).length;

  const statusConfig: Record<
    string,
    { label: string; icon: React.ReactNode; badge: string }
  > = {
    pendente: {
      label: "Pendente",
      icon: <Clock className="w-3.5 h-3.5" />,
      badge: "bg-yellow-500/10 text-yellow-400 border border-yellow-500/20",
    },
    confirmado: {
      label: "Confirmado",
      icon: <CheckCircle2 className="w-3.5 h-3.5" />,
      badge: "bg-green-500/10 text-green-400 border border-green-500/20",
    },
    cancelado: {
      label: "Cancelado",
      icon: <XCircle className="w-3.5 h-3.5" />,
      badge: "bg-red-500/10 text-red-400 border border-red-500/20",
    },
    concluido: {
      label: "Concluído",
      icon: <CheckCircle2 className="w-3.5 h-3.5" />,
      badge: "bg-blue-500/10 text-blue-400 border border-blue-500/20",
    },
  };

  return (
    <div className="space-y-6 max-w-3xl">
      {/* HEADER */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Agendamentos</h1>
          <p className="text-sm text-muted-foreground mt-1">
            {agendamentos.length} agendamento
            {agendamentos.length !== 1 ? "s" : ""} no total
          </p>
        </div>
        <Filter className="w-4 h-4 text-muted-foreground" />
      </div>

      {/* TABS */}
      <div className="grid grid-cols-2 sm:flex gap-1 bg-muted/50 p-1 rounded-lg">
        {TABS.map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`whitespace-nowrap px-3 py-1.5 text-xs font-medium rounded-md transition-all flex items-center justify-center gap-1.5 ${
              tab === t.key
                ? "bg-background text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            {t.label}
            {contagem(t.key) > 0 && (
              <span
                className={`text-[10px] px-1.5 py-0.5 rounded-full ${tab === t.key ? "bg-muted text-foreground" : "bg-muted/50"}`}
              >
                {contagem(t.key)}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* LISTA */}
      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="bg-card border border-border rounded-xl p-4 animate-pulse"
            >
              <div className="h-4 bg-muted rounded w-1/3 mb-2" />
              <div className="h-3 bg-muted rounded w-1/2" />
            </div>
          ))}
        </div>
      ) : filtrados.length === 0 ? (
        <div className="border border-dashed border-border rounded-xl p-12 text-center">
          <CalendarDays className="w-8 h-8 text-muted-foreground mx-auto mb-3 opacity-40" />
          <p className="text-sm text-muted-foreground">
            {tab === "todos"
              ? "Nenhum agendamento ainda."
              : `Nenhum agendamento ${tab}.`}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtrados.map((ag) => {
            const cfg = statusConfig[ag.status] ?? statusConfig.pendente;
            return (
              <div
                key={ag.id}
                className="bg-card border border-border rounded-xl p-4 hover:border-border/80 transition-colors"
              >
                <div className="flex items-start justify-between gap-4">
                  {/* INFO PRINCIPAL */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap mb-1">
                      <p className="font-semibold text-foreground text-sm">
                        {ag.clientes?.nome}
                      </p>
                      <span
                        className={`inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full font-medium ${cfg.badge}`}
                      >
                        {cfg.icon}
                        {cfg.label}
                      </span>
                    </div>

                    <p className="text-xs text-muted-foreground mb-1">
                      {ag.servicos?.nome} · {ag.servicos?.duracao_minutos}min
                      {ag.valor ? ` · R$ ${Number(ag.valor).toFixed(0)}` : ""}
                    </p>

                    <div className="flex items-center gap-3 flex-wrap">
                      <span className="text-xs text-muted-foreground flex items-center gap-1">
                        <CalendarDays className="w-3 h-3" />
                        {formatarData(ag.data, ag.hora_inicio)}
                      </span>
                      {ag.clientes?.telefone && (
                        <span className="text-xs text-muted-foreground flex items-center gap-1">
                          <Phone className="w-3 h-3" />
                          {ag.clientes.telefone}
                        </span>
                      )}
                    </div>

                    {ag.local_corpo && (
                      <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
                        📍 {ag.local_corpo}
                      </p>
                    )}
                  </div>

                  {/* AÇÕES */}
                  <div className="flex items-center gap-2 flex-shrink-0">
                    {/* THUMBNAIL REFERÊNCIA */}
                    {ag.referencia_url && (
                      <button
                        onClick={() => setImagemAberta(ag.referencia_url)}
                        title="Ver referência"
                        className="relative shrink-0 group"
                      >
                        <img
                          src={ag.referencia_url}
                          alt="Referência"
                          className="w-10 h-10 rounded-lg object-cover border border-border group-hover:border-primary transition-colors"
                        />
                        <div className="absolute inset-0 rounded-lg bg-black/0 group-hover:bg-black/30 transition-colors flex items-center justify-center">
                          <ImageIcon className="w-3 h-3 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                        </div>
                      </button>
                    )}

                    {/* WHATSAPP */}
                    {ag.clientes?.telefone && (
                      <a
                        href={`https://wa.me/55${ag.clientes.telefone.replace(/\D/g, "")}?text=${encodeURIComponent(`Olá ${ag.clientes.nome}! Sobre sua sessão de ${ag.servicos?.nome} no dia ${formatarData(ag.data, ag.hora_inicio)}.`)}`}
                        target="_blank"
                        className="w-8 h-8 rounded-lg bg-green-500/10 flex items-center justify-center text-green-400 hover:bg-green-500/20 transition-colors"
                        title="Chamar no WhatsApp"
                      >
                        {WA_ICON}
                      </a>
                    )}
                  </div>
                </div>

                {/* AÇÕES DE STATUS */}
                {ag.status === "pendente" && (
                  <div className="flex gap-2 mt-3 pt-3 border-t border-border">
                    <button
                      onClick={() => atualizarStatus(ag.id, "confirmado")}
                      className="flex-1 flex items-center justify-center gap-1.5 bg-green-500/10 text-green-400 hover:bg-green-500/20 border border-green-500/20 py-2 text-xs font-medium rounded-lg transition-colors"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" /> Confirmar
                    </button>
                    <button
                      onClick={() => atualizarStatus(ag.id, "cancelado")}
                      className="flex-1 flex items-center justify-center gap-1.5 bg-red-500/10 text-red-400 hover:bg-red-500/20 border border-red-500/20 py-2 text-xs font-medium rounded-lg transition-colors"
                    >
                      <XCircle className="w-3.5 h-3.5" /> Cancelar
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
      <Dialog
        open={!!imagemAberta}
        onOpenChange={(open) => !open && setImagemAberta(null)}
      >
        <DialogContent className="max-w-2xl p-2">
          <VisuallyHidden.Root>
            <DialogTitle>Imagem de referência</DialogTitle>
          </VisuallyHidden.Root>
          {imagemAberta && (
            <img
              src={imagemAberta}
              alt="Referência do cliente"
              className="w-full rounded-lg object-contain max-h-[80vh]"
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
