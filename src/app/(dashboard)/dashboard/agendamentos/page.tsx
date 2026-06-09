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
  User,
  FileText,
} from "lucide-react";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { VisuallyHidden } from "radix-ui";

type Anamnese = {
  alergia: boolean | null;
  alergia_desc: string;
  diabetes: boolean | null;
  condicao_pele: boolean | null;
  condicao_pele_desc: string;
  gravida: boolean | null;
  medicamentos: boolean | null;
  medicamentos_desc: string;
  menor_idade: boolean | null;
  responsavel: string;
  aceite: boolean;
};

type Agendamento = {
  id: string;
  data: string;
  hora_inicio: string;
  hora_fim: string;
  status: string;
  valor: number;
  local_corpo: string | null;
  referencia_url: string | null;
  anamnese: Anamnese | null;
  clientes: { id?: string; nome: string; telefone: string; email: string } | null;
  servicos: { nome: string; duracao_minutos: number } | null;
  is_retornando?: boolean;
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

const PERGUNTAS_LABEL: Record<
  string,
  { label: string; descKey?: keyof Anamnese }
> = {
  alergia: { label: "Alergia", descKey: "alergia_desc" },
  diabetes: { label: "Diabetes" },
  condicao_pele: { label: "Condição de pele", descKey: "condicao_pele_desc" },
  gravida: { label: "Grávida / amamentando" },
  medicamentos: { label: "Medicamento contínuo", descKey: "medicamentos_desc" },
  menor_idade: { label: "Menor de idade", descKey: "responsavel" },
};

/* ── Modal de detalhes ─────────────────────────────────────────── */
function DetalhesModal({
  ag,
  onClose,
  onStatus,
}: {
  ag: Agendamento;
  onClose: () => void;
  onStatus: (id: string, status: string) => void;
}) {
  const [imagemAberta, setImagemAberta] = useState(false);

  function formatarData(data: string, hora: string) {
    const date = new Date(data + "T12:00:00");
    const diaSemana = date.toLocaleDateString("pt-BR", { weekday: "long" });
    const dataFormatada = date.toLocaleDateString("pt-BR");
    const horaFormatada = hora.slice(0, 5).replace(":", "h");
    return `${dataFormatada} · ${diaSemana.charAt(0).toUpperCase() + diaSemana.slice(1)} às ${horaFormatada}`;
  }

  const waUrl = ag.clientes?.telefone
    ? `https://wa.me/55${ag.clientes.telefone.replace(/\D/g, "")}?text=${encodeURIComponent(`Olá ${ag.clientes?.nome}! Sobre sua sessão de ${ag.servicos?.nome} no dia ${formatarData(ag.data, ag.hora_inicio)}.`)}`
    : null;

  // monta a mensagem de resumo completa
  const msgResumo = [
    `Olá ${ag.clientes?.nome}!`,
    "", // Linha vazia
    `Aqui está o resumo da sua sessão:`,
    "", // Linha vazia
    `*Serviço:* ${ag.servicos?.nome}`,
    "", // Linha vazia
    `*Data:* ${formatarData(ag.data, ag.hora_inicio)}`,
    "", // Linha vazia
    `*Duração:* ${formatarDuracao(ag.servicos?.duracao_minutos ?? 0)}`,
    "", // Linha vazia
    `*Valor:* R$ ${Number(ag.valor).toFixed(2)}`,
    "", // Linha vazia
    ag.local_corpo ? `*Local:* ${ag.local_corpo}` : null,
    "",
    `Aguardando sua confirmação!`,
  ]
    .filter(Boolean)
    .join("\n");

  const waResumoUrl = `https://wa.me/55${ag.clientes?.telefone?.replace(/\D/g, "")}?text=${encodeURIComponent(msgResumo)}`;

  return (
    <>
      <DialogContent className="max-w-lg max-h-[90vh] flex flex-col overflow-hidden p-0 gap-0">
        <VisuallyHidden.Root>
          <DialogTitle>Detalhes do agendamento</DialogTitle>
        </VisuallyHidden.Root>

        {/* HEADER */}
        <div className="p-6 pt-12 border-b border-border shrink-0">
          <div className="flex items-start justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <User className="w-4 h-4 text-muted-foreground" />
                <h2 className="font-semibold text-foreground text-base">
                  {ag.clientes?.nome}
                </h2>
              </div>
              <p className="text-sm text-muted-foreground">
                {ag.servicos?.nome} ·{" "}
                {formatarDuracao(ag.servicos?.duracao_minutos ?? 0)}
                {ag.valor ? ` · R$ ${Number(ag.valor).toFixed(0)}` : ""}
              </p>
              <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
                <CalendarDays className="w-3.5 h-3.5" />
                {formatarData(ag.data, ag.hora_inicio)}
              </p>
            </div>
            {waUrl && (
              <div className="flex gap-2 shrink-0">
                <a
                  href={waResumoUrl}
                  target="_blank"
                  className="flex items-center gap-1.5 bg-green-500/10 text-green-400 hover:bg-green-500/20 border border-green-500/20 px-3 py-1.5 rounded-xl text-xs font-semibold transition-colors shadow-sm"
                >
                  {WA_ICON} Enviar resumo
                </a>
              </div>
            )}
          </div>
        </div>

        <div className="p-6 space-y-6 overflow-y-scroll flex-1">
          {/* DADOS DO CLIENTE */}
          <div>
            <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-3">
              Contato
            </p>
            <div className="bg-muted/30 border border-border/20 rounded-2xl p-4 space-y-2.5">
              {ag.clientes?.telefone && (
                <div className="flex items-center gap-2.5 text-sm">
                  <Phone className="w-4 h-4 text-muted-foreground/60 shrink-0" />
                  <span className="text-foreground font-medium">
                    {ag.clientes.telefone}
                  </span>
                </div>
              )}
              {ag.clientes?.email && (
                <div className="flex items-center gap-2.5 text-sm">
                  <span className="text-muted-foreground/60 text-xs w-4 text-center font-bold">
                    @
                  </span>
                  <span className="text-foreground font-medium">{ag.clientes.email}</span>
                </div>
              )}
            </div>
          </div>

          {/* LOCAL DO CORPO */}
          {ag.local_corpo && (
            <div>
              <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-3">
                Local do corpo
              </p>
              <div className="bg-muted/30 border border-border/20 rounded-2xl p-4">
                <p className="text-sm text-foreground flex items-center gap-2 font-medium">
                  <span>📍</span> {ag.local_corpo}
                </p>
              </div>
            </div>
          )}

          {/* REFERÊNCIA */}
          {ag.referencia_url && (
            <div>
              <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-3">
                Referência
              </p>
              <button
                onClick={() => setImagemAberta(true)}
                className="w-full group relative overflow-hidden rounded-2xl border border-border hover:border-primary/40 transition-colors shadow-sm"
              >
                <img
                  src={ag.referencia_url}
                  alt="Referência"
                  className="w-full max-h-64 object-cover group-hover:scale-[1.01] transition-transform duration-200"
                />
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/35 transition-colors flex items-center justify-center">
                  <div className="opacity-0 group-hover:opacity-100 transition-opacity bg-background/90 backdrop-blur-sm rounded-xl px-3.5 py-2 flex items-center gap-1.5 text-xs font-semibold shadow-md">
                    <ImageIcon className="w-3.5 h-3.5" /> Ver em tamanho real
                  </div>
                </div>
              </button>
            </div>
          )}

          {/* FICHA DE ANAMNESE */}
          {ag.anamnese && (
            <div>
              <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-3 flex items-center gap-1.5">
                <FileText className="w-4 h-4 text-primary" /> Ficha de Anamnese
              </p>
              <div className="space-y-2">
                {Object.entries(PERGUNTAS_LABEL).map(
                  ([key, { label, descKey }]) => {
                    const val = ag.anamnese![key as keyof Anamnese];
                    const desc = descKey
                      ? (ag.anamnese![descKey] as string)
                      : null;
                    if (val === null || val === undefined) return null;
                    return (
                      <div
                        key={key}
                        className="flex items-start justify-between gap-3 bg-muted/20 border border-border/10 rounded-xl px-3.5 py-3"
                      >
                        <span className="text-xs font-medium text-muted-foreground mt-0.5">
                          {label}
                        </span>
                        <div className="text-right shrink-0">
                          <span
                            className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full uppercase tracking-wider ${
                              val === true
                                ? "bg-red-500/10 text-red-400 border border-red-500/20"
                                : "bg-green-500/10 text-green-400 border border-green-500/20"
                            }`}
                          >
                            {val ? "Sim" : "Não"}
                          </span>
                          {val && desc && (
                            <p className="text-xs text-muted-foreground mt-1.5 leading-relaxed bg-muted/40 p-2 rounded-lg text-left max-w-[250px]">
                              {desc}
                            </p>
                          )}
                        </div>
                      </div>
                    );
                  },
                )}
                {/* aceite */}
                <div className="flex items-center gap-2 px-3.5 py-3 rounded-xl bg-green-500/5 border border-green-500/10 mt-1">
                  <CheckCircle2 className="w-4 h-4 text-green-400 shrink-0" />
                  <span className="text-xs font-medium text-muted-foreground">
                    Declaração de veracidade assinada
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* AÇÕES DE STATUS */}
          {ag.status === "pendente" && (
            <div className="flex gap-3 pt-3 border-t border-border/40">
              <button
                onClick={() => {
                  onStatus(ag.id, "confirmado");
                  onClose();
                }}
                className="flex-1 flex items-center justify-center gap-1.5 bg-green-500/10 text-green-400 hover:bg-green-500/20 border border-green-500/20 py-3 text-xs font-bold rounded-xl transition-all shadow-sm"
              >
                <CheckCircle2 className="w-4 h-4" /> Confirmar Sessão
              </button>
              <button
                onClick={() => {
                  onStatus(ag.id, "cancelado");
                  onClose();
                }}
                className="flex-1 flex items-center justify-center gap-1.5 bg-red-500/10 text-red-400 hover:bg-red-500/20 border border-red-500/20 py-3 text-xs font-bold rounded-xl transition-all shadow-sm"
              >
                <XCircle className="w-4 h-4" /> Cancelar
              </button>
            </div>
          )}
        </div>
      </DialogContent>

      {/* modal da imagem */}
      <Dialog open={imagemAberta} onOpenChange={setImagemAberta}>
        <DialogContent className="max-w-2xl p-2">
          <VisuallyHidden.Root>
            <DialogTitle>Referência</DialogTitle>
          </VisuallyHidden.Root>
          {ag.referencia_url && (
            <img
              src={ag.referencia_url}
              alt="Referência do cliente"
              className="w-full rounded-xl object-contain max-h-[80vh] shadow-xl"
            />
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}

function formatarDuracao(minutos: number): string {
  if (minutos < 60) return `${minutos}min`;
  const h = Math.floor(minutos / 60);
  const m = minutos % 60;
  return m === 0 ? `${h}h` : `${h}h${m}min`;
}

/* ── Página principal ──────────────────────────────────────────── */
export default function AgendamentosPage() {
  const [agendamentos, setAgendamentos] = useState<Agendamento[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState("todos");
  const [agSelecionado, setAgSelecionado] = useState<Agendamento | null>(null);

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
        `*, clientes(id, nome, telefone, email), servicos(nome, duracao_minutos)`,
      )
      .eq("profissional_id", perfil.id)
      .order("data", { ascending: true })
      .order("hora_inicio", { ascending: true })
      .limit(50);

    const rawList = (data as any) || [];

    // Obter IDs de clientes únicos para contar agendamentos históricos
    const clientIds = Array.from(
      new Set(
        rawList
          .map((ag: any) => {
            const c = Array.isArray(ag.clientes) ? ag.clientes[0] : ag.clientes;
            return c?.id;
          })
          .filter(Boolean)
      )
    ) as string[];

    const returningClientIds = new Set<string>();
    if (clientIds.length > 0) {
      const { data: counts } = await supabase
        .from("agendamentos")
        .select("cliente_id")
        .in("cliente_id", clientIds)
        .eq("profissional_id", perfil.id);

      const countMap: Record<string, number> = {};
      counts?.forEach((c) => {
        if (c.cliente_id) {
          countMap[c.cliente_id] = (countMap[c.cliente_id] || 0) + 1;
        }
      });

      Object.entries(countMap).forEach(([cid, count]) => {
        if (count > 1) {
          returningClientIds.add(cid);
        }
      });
    }

    const agendamentosMapeados = rawList.map((ag: any) => {
      const clienteObj = Array.isArray(ag.clientes) ? ag.clientes[0] : ag.clientes;
      const servicoObj = Array.isArray(ag.servicos) ? ag.servicos[0] : ag.servicos;
      return {
        ...ag,
        clientes: clienteObj
          ? { id: clienteObj.id, nome: clienteObj.nome, telefone: clienteObj.telefone, email: clienteObj.email }
          : null,
        servicos: servicoObj ? { nome: servicoObj.nome, duracao_minutos: servicoObj.duracao_minutos } : null,
        is_retornando: clienteObj?.id ? returningClientIds.has(clienteObj.id) : false,
      };
    });

    setAgendamentos(agendamentosMapeados);
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
  const contagem = (s: string) =>
    s === "todos"
      ? agendamentos.length
      : agendamentos.filter((ag) => ag.status === s).length;

  const statusConfig: Record<
    string,
    { label: string; icon: React.ReactNode; badge: string }
  > = {
    pendente: {
      label: "Pendente",
      icon: <Clock className="w-3 h-3" />,
      badge: "bg-amber-500/10 text-amber-500 border border-amber-500/20",
    },
    confirmado: {
      label: "Confirmado",
      icon: <CheckCircle2 className="w-3 h-3" />,
      badge: "bg-green-500/10 text-green-400 border border-green-500/20",
    },
    cancelado: {
      label: "Cancelado",
      icon: <XCircle className="w-3 h-3" />,
      badge: "bg-red-500/10 text-red-400 border border-red-500/20",
    },
    concluido: {
      label: "Concluído",
      icon: <CheckCircle2 className="w-3 h-3" />,
      badge: "bg-blue-500/10 text-blue-400 border border-blue-500/20",
    },
  };

  return (
    <div className="space-y-6 max-w-3xl">
      {/* HEADER */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground font-display">Agendamentos</h1>
          <p className="text-xs text-muted-foreground mt-1.5">
            Gerencie e organize suas sessões de tatuagem solicitadas
          </p>
        </div>
        <div className="flex items-center gap-2 bg-muted/30 border border-border/30 rounded-xl px-3 py-1.5 text-xs text-muted-foreground font-medium">
          <Filter className="w-3.5 h-3.5 text-muted-foreground" />
          <span>{agendamentos.length} no total</span>
        </div>
      </div>

      {/* TABS */}
      <div className="grid grid-cols-2 sm:flex gap-1.5 bg-muted/30 p-1.5 rounded-2xl border border-border/30">
        {TABS.map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`whitespace-nowrap px-4 py-2 text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-2 ${
              tab === t.key
                ? "bg-background text-foreground shadow-sm border border-border/40"
                : "text-muted-foreground hover:text-foreground border border-transparent"
            }`}
          >
            {t.label}
            {contagem(t.key) > 0 && (
              <span
                className={`text-[10px] px-2 py-0.5 rounded-full font-black ${
                  tab === t.key 
                    ? "bg-primary/15 text-primary" 
                    : "bg-muted-foreground/10 text-muted-foreground"
                }`}
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
              className="bg-card border border-border rounded-2xl p-5 animate-pulse"
            >
              <div className="h-4 bg-muted rounded w-1/3 mb-3" />
              <div className="h-3 bg-muted rounded w-1/2" />
            </div>
          ))}
        </div>
      ) : filtrados.length === 0 ? (
        <div className="border border-dashed border-border rounded-2xl p-16 text-center shadow-sm">
          <CalendarDays className="w-10 h-10 text-muted-foreground mx-auto mb-4 opacity-30" />
          <p className="text-sm font-semibold text-foreground mb-1">
            Nenhum agendamento
          </p>
          <p className="text-xs text-muted-foreground">
            {tab === "todos"
              ? "Nenhuma sessão agendada no momento."
              : `Nenhuma sessão com o status "${tab}" encontrada.`}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtrados.map((ag) => {
            const cfg = statusConfig[ag.status] ?? statusConfig.pendente;
            return (
              <div
                key={ag.id}
                onClick={() => setAgSelecionado(ag)}
                className="bg-card border border-border rounded-2xl p-5 hover:border-primary/30 hover:bg-muted/5 transition-all duration-200 cursor-pointer shadow-sm group"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  {/* INFO */}
                  <div className="flex-1 min-w-0 space-y-2">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="font-bold text-foreground text-sm group-hover:text-primary transition-colors font-display">
                        {ag.clientes?.nome}
                      </p>
                      {ag.is_retornando && (
                        <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 uppercase tracking-wider">
                          ✦ Já é cliente
                        </span>
                      )}
                      <span
                        className={`inline-flex items-center gap-1 text-[10px] font-bold px-2.5 py-0.5 rounded-full uppercase tracking-wider ${cfg.badge}`}
                      >
                        {cfg.icon} {cfg.label}
                      </span>
                      {ag.anamnese && (
                        <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 uppercase tracking-wider">
                          <FileText className="w-3 h-3" /> Anamnese
                        </span>
                      )}
                    </div>
                    
                    <p className="text-xs text-muted-foreground">
                      <strong className="text-foreground font-semibold">{ag.servicos?.nome}</strong> ·{" "}
                      {formatarDuracao(ag.servicos?.duracao_minutos ?? 0)}
                      {ag.valor ? ` · R$ ${Number(ag.valor).toFixed(0)}` : ""}
                    </p>
                    
                    <div className="flex items-center gap-4 flex-wrap text-xs text-muted-foreground/80">
                      <span className="flex items-center gap-1.5">
                        <CalendarDays className="w-3.5 h-3.5 text-muted-foreground/60" />
                        {formatarData(ag.data, ag.hora_inicio)}
                      </span>
                      {ag.clientes?.telefone && (
                        <span className="flex items-center gap-1.5">
                          <Phone className="w-3.5 h-3.5 text-muted-foreground/60" /> 
                          {ag.clientes.telefone}
                        </span>
                      )}
                      {ag.local_corpo && (
                        <span className="flex items-center gap-1">
                          📍 {ag.local_corpo}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* THUMBNAIL + WA */}
                  <div className="flex items-center gap-3 shrink-0 self-end sm:self-center">
                    {ag.referencia_url && (
                      <div className="relative overflow-hidden rounded-xl border border-border shadow-inner">
                        <img
                          src={ag.referencia_url}
                          alt="Ref"
                          className="w-12 h-12 object-cover"
                        />
                        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/25 transition-colors flex items-center justify-center">
                          <ImageIcon className="w-3 h-3 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                        </div>
                      </div>
                    )}
                    <a
                      href={
                        ag.clientes?.telefone
                          ? `https://wa.me/55${ag.clientes.telefone.replace(/\D/g, "")}?text=${encodeURIComponent(`Olá ${ag.clientes.nome}! Sobre sua sessão de ${ag.servicos?.nome} no dia ${formatarData(ag.data, ag.hora_inicio)}.`)}`
                          : "#"
                      }
                      target="_blank"
                      onClick={(e) => e.stopPropagation()}
                      className="w-10 h-10 rounded-xl bg-green-500/10 flex items-center justify-center text-green-400 hover:bg-green-500/20 border border-green-500/10 transition-colors shadow-sm"
                    >
                      {WA_ICON}
                    </a>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* MODAL DETALHES */}
      <Dialog
        open={!!agSelecionado}
        onOpenChange={(open) => !open && setAgSelecionado(null)}
      >
        {agSelecionado && (
          <DetalhesModal
            ag={agSelecionado}
            onClose={() => setAgSelecionado(null)}
            onStatus={atualizarStatus}
          />
        )}
      </Dialog>
    </div>
  );
}
