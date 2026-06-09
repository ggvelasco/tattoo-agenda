"use client";

import { useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ChevronLeft,
  ChevronRight,
  Calendar,
  Clock,
  Phone,
  User,
  AlertCircle,
  CheckCircle2,
  XCircle,
  FileText,
  ImageIcon,
} from "lucide-react";
import Link from "next/link";
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
  clientes: { nome: string; telefone: string; email: string } | null;
  servicos: { nome: string; duracao_minutos: number } | null;
};

type Disponibilidade = {
  id: string;
  profissional_id: string;
  dia_semana: number;
  hora_inicio: string;
  hora_fim: string;
  ativo: boolean;
};

type Props = {
  agendamentosRaw: Agendamento[];
  disponibilidade: Disponibilidade[];
  profissionalId: string;
};

const diasSemanaSiglas = ["DOM", "SEG", "TER", "QUA", "QUI", "SEX", "SÁB"];
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

const horasDia = Array.from({ length: 15 }, (_, i) => i + 8); // 08:00 às 22:00

// Helper: converter 'HH:MM' para minutos do dia
const timeToMinutes = (timeStr: string) => {
  const [h, m] = timeStr.split(":").map(Number);
  return h * 60 + m;
};

export default function AgendaClient({
  agendamentosRaw,
  disponibilidade = [],
  profissionalId,
}: Props) {
  const [currentDate, setCurrentDate] = useState<Date>(new Date());
  const [selectedAg, setSelectedAg] = useState<Agendamento | null>(null);
  const [isMobile, setIsMobile] = useState(false);
  const [viewMode, setViewMode] = useState<"week" | "day">("week");
  const [showPending, setShowPending] = useState(true);

  // Responsividade
  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth < 768;
      setIsMobile(mobile);
      if (mobile) setViewMode("day");
      else setViewMode("week");
    };
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Calcular segunda-feira da semana ativa
  const startOfWeek = useMemo(() => {
    const date = new Date(currentDate);
    const day = date.getDay();
    const diff = date.getDate() - day + (day === 0 ? -6 : 1); // segunda-feira
    return new Date(date.setDate(diff));
  }, [currentDate]);

  // Gerar os 7 dias da semana ativa
  const weekDays = useMemo(() => {
    return Array.from({ length: 7 }, (_, i) => {
      const d = new Date(startOfWeek);
      d.setDate(startOfWeek.getDate() + i);
      return d;
    });
  }, [startOfWeek]);

  // Formatar dia selecionado para modo Diário
  const selectedDayStr = useMemo(() => {
    return currentDate.toISOString().split("T")[0];
  }, [currentDate]);

  const navegaSemana = (direcao: number) => {
    setCurrentDate((prev) => {
      const d = new Date(prev);
      if (viewMode === "week") {
        d.setDate(prev.getDate() + direcao * 7);
      } else {
        d.setDate(prev.getDate() + direcao);
      }
      return d;
    });
  };

  const vaiParaHoje = () => {
    setCurrentDate(new Date());
  };

  // Filtrar agendamentos do período ativo
  const agendamentosFiltrados = useMemo(() => {
    let list = agendamentosRaw.filter((ag) => ag.status !== "cancelado");
    if (!showPending) {
      list = list.filter((ag) => ag.status !== "pendente");
    }

    if (viewMode === "week") {
      const inicioSemanaStr = weekDays[0].toISOString().split("T")[0];
      const fimSemanaStr = weekDays[6].toISOString().split("T")[0];
      return list.filter(
        (ag) => ag.data >= inicioSemanaStr && ag.data <= fimSemanaStr
      );
    } else {
      return list.filter((ag) => ag.data === selectedDayStr);
    }
  }, [agendamentosRaw, weekDays, selectedDayStr, viewMode, showPending]);

  // Título do cabeçalho de data
  const dateTitle = useMemo(() => {
    if (viewMode === "week") {
      const primeiroDia = weekDays[0];
      const ultimoDia = weekDays[6];
      const optionsMonth: Intl.DateTimeFormatOptions = { month: "long" };
      const mesInicio = primeiroDia.toLocaleDateString("pt-BR", optionsMonth);
      const ano = primeiroDia.getFullYear();
      return `${mesInicio.charAt(0).toUpperCase() + mesInicio.slice(1)} de ${ano}`;
    } else {
      return currentDate.toLocaleDateString("pt-BR", {
        weekday: "long",
        day: "numeric",
        month: "long",
      });
    }
  }, [weekDays, currentDate, viewMode]);

  // Configuração de cores por status
  const statusStyles: Record<
    string,
    { bg: string; border: string; text: string; label: string; icon: React.ReactNode }
  > = {
    pendente: {
      label: "Pendente",
      bg: "bg-amber-500/10 hover:bg-amber-500/15",
      border: "border-amber-500/30",
      text: "text-amber-500 dark:text-amber-400",
      icon: <Clock className="w-3.5 h-3.5" />,
    },
    confirmado: {
      label: "Confirmado",
      bg: "bg-green-500/10 hover:bg-green-500/15",
      border: "border-green-500/30",
      text: "text-green-500 dark:text-green-400",
      icon: <CheckCircle2 className="w-3.5 h-3.5" />,
    },
    cancelado: {
      label: "Cancelado",
      bg: "bg-red-500/10 hover:bg-red-500/15",
      border: "border-red-500/30",
      text: "text-red-500 dark:text-red-400",
      icon: <XCircle className="w-3.5 h-3.5" />,
    },
    concluido: {
      label: "Concluído",
      bg: "bg-blue-500/10 hover:bg-blue-500/15",
      border: "border-blue-500/30",
      text: "text-blue-500 dark:text-blue-400",
      icon: <CheckCircle2 className="w-3.5 h-3.5" />,
    },
  };

  const WA_ICON = (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
    </svg>
  );

  return (
    <div className="space-y-6">
      {/* ── HEADER DE NAVEGAÇÃO ─────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-card border border-border rounded-2xl p-4">
        <div className="flex items-center gap-3">
          <Calendar className="w-5 h-5 text-primary" />
          <h1 className="font-display text-lg font-bold text-foreground">
            {dateTitle}
          </h1>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={() => setShowPending(!showPending)}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg border transition-all flex items-center gap-1.5 ${
              showPending
                ? "bg-amber-500/10 text-amber-500 border-amber-500/30 hover:bg-amber-500/15"
                : "bg-muted border-border/30 text-muted-foreground hover:text-foreground"
            }`}
          >
            <Clock className="w-3.5 h-3.5" />
            {showPending ? "Ocultar Pendentes" : "Mostrar Pendentes"}
          </button>
          
          <button
            onClick={vaiParaHoje}
            className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-muted hover:bg-muted/80 text-foreground transition-colors"
          >
            Hoje
          </button>
          <div className="flex items-center rounded-lg bg-muted p-0.5 border border-border/30">
            <button
              onClick={() => navegaSemana(-1)}
              className="p-1 hover:bg-card rounded-md text-muted-foreground hover:text-foreground transition-all"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={() => navegaSemana(1)}
              className="p-1 hover:bg-card rounded-md text-muted-foreground hover:text-foreground transition-all"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          {!isMobile && (
            <div className="flex items-center rounded-lg bg-muted p-0.5 border border-border/30 ml-2">
              <button
                onClick={() => setViewMode("week")}
                className={`px-3 py-1 text-xs font-medium rounded-md transition-all ${
                  viewMode === "week"
                    ? "bg-background text-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                Semana
              </button>
              <button
                onClick={() => setViewMode("day")}
                className={`px-3 py-1 text-xs font-medium rounded-md transition-all ${
                  viewMode === "day"
                    ? "bg-background text-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                Dia
              </button>
            </div>
          )}
        </div>
      </div>

      {/* ── CALENDÁRIO ───────────────────────────────────────────── */}
      <div className="bg-card border border-border rounded-2xl overflow-hidden flex flex-col h-[calc(100vh-190px)] min-h-[500px] relative">
        
        {/* Cabeçalho dos Dias */}
        <div className="grid grid-cols-[60px_1fr] border-b border-border bg-muted/20 shrink-0">
          <div className="h-12 flex items-center justify-center border-r border-border text-[9px] font-bold text-muted-foreground uppercase tracking-wider">
            GMT-3
          </div>
          <div className={`grid ${viewMode === "week" ? "grid-cols-7" : "grid-cols-1"} h-12`}>
            {(viewMode === "week" ? weekDays : [currentDate]).map((date, idx) => {
              const sigla = diasSemanaSiglas[date.getDay()];
              const diaNum = date.getDate();
              const isHoje =
                new Date().toISOString().split("T")[0] ===
                date.toISOString().split("T")[0];

              return (
                <div
                  key={idx}
                  className={`flex flex-col items-center justify-center border-r border-border/30 last:border-r-0 ${
                    isHoje ? "bg-primary/[0.03]" : ""
                  }`}
                >
                  <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
                    {sigla}
                  </span>
                  <span
                    className={`text-sm font-black mt-0.5 w-6 h-6 rounded-full flex items-center justify-center font-display ${
                      isHoje ? "bg-primary text-primary-foreground" : "text-foreground"
                    }`}
                  >
                    {diaNum}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Corpo com Scroll */}
        <div className="flex-1 overflow-y-auto relative flex" data-lenis-prevent>
          {/* Horas Laterais */}
          <div className="w-[60px] border-r border-border bg-muted/10 shrink-0 relative select-none">
            {horasDia.map((hora) => (
              <div
                key={hora}
                className="h-[60px] flex items-start justify-center pt-1 text-[10px] font-semibold text-muted-foreground/60"
              >
                {String(hora).padStart(2, "0")}:00
              </div>
            ))}
          </div>

          {/* Colunas do Grid Semanal */}
          <div className="flex-1 relative">
            
            {/* Linhas Horizontais de Fundo */}
            <div className="absolute inset-0 pointer-events-none">
              {horasDia.map((hora, idx) => (
                <div
                  key={hora}
                  className="h-[60px] border-b border-border/30 last:border-b-0"
                />
              ))}
            </div>

            {/* Agendamentos */}
            <div
              className={`absolute inset-0 grid ${
                viewMode === "week" ? "grid-cols-7" : "grid-cols-1"
              }`}
            >
              {(viewMode === "week" ? weekDays : [currentDate]).map((date, dayIdx) => {
                const dateStr = date.toISOString().split("T")[0];
                const sessoesDia = agendamentosFiltrados.filter(
                  (ag) => ag.data === dateStr
                );
                
                const dayOfWeek = date.getDay();
                const config = disponibilidade.find((d) => d.dia_semana === dayOfWeek);
                const isFolga = !config || !config.ativo;

                return (
                  <div
                    key={dayIdx}
                    className="relative h-[900px] border-r border-border/30 last:border-r-0"
                  >
                    {/* overlays de indisponibilidade */}
                    {isFolga ? (
                      <div 
                        className="absolute inset-0 z-0 flex items-center justify-center pointer-events-none select-none"
                        style={{
                          backgroundImage: "repeating-linear-gradient(45deg, currentColor 0px, currentColor 1px, transparent 1px, transparent 10px)",
                          color: "var(--muted-foreground)",
                          opacity: 0.12
                        }}
                      >
                        <span className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest bg-card px-2 py-1 rounded-md border border-border/30 rotate-90 md:rotate-0">
                          Folga
                        </span>
                      </div>
                    ) : (
                      <>
                        {/* Shading antes do expediente */}
                        {config && timeToMinutes(config.hora_inicio) > 480 && (
                          <div 
                            className="absolute left-0 right-0 z-0 select-none pointer-events-none"
                            style={{
                              top: "0px",
                              height: `${timeToMinutes(config.hora_inicio) - 480}px`,
                              backgroundImage: "repeating-linear-gradient(45deg, currentColor 0px, currentColor 1px, transparent 1px, transparent 10px)",
                              color: "var(--muted-foreground)",
                              opacity: 0.08
                            }}
                          />
                        )}
                        {/* Shading depois do expediente */}
                        {config && timeToMinutes(config.hora_fim) < 1380 && (
                          <div 
                            className="absolute left-0 right-0 z-0 select-none pointer-events-none"
                            style={{
                              top: `${timeToMinutes(config.hora_fim) - 480}px`,
                              height: `${1380 - timeToMinutes(config.hora_fim)}px`,
                              backgroundImage: "repeating-linear-gradient(45deg, currentColor 0px, currentColor 1px, transparent 1px, transparent 10px)",
                              color: "var(--muted-foreground)",
                              opacity: 0.08
                            }}
                          />
                        )}
                      </>
                    )}

                    {sessoesDia.map((ag) => {
                      const startMin = timeToMinutes(ag.hora_inicio);
                      const duracao = ag.servicos?.duracao_minutos ?? 60;
                      
                      // Grid inicia às 08:00 (480 minutos)
                      const startFromEight = startMin - 480;
                      
                      // 1 minuto = 1 pixel
                      const topPx = Math.max(0, startFromEight);
                      const heightPx = Math.max(30, duracao); // mínimo de 30px

                      const cfg = statusStyles[ag.status] ?? statusStyles.pendente;

                      return (
                        <div
                          key={ag.id}
                          onClick={() => setSelectedAg(ag)}
                          style={{
                            position: "absolute",
                            top: `${topPx}px`,
                            height: `${heightPx}px`,
                            left: "4px",
                            right: "4px",
                          }}
                          className={`rounded-xl border p-2 flex flex-col justify-between cursor-pointer transition-all select-none shadow-sm ${cfg.bg} ${cfg.border} hover:scale-[1.01]`}
                        >
                          <div className="min-w-0">
                            <div className="flex items-center gap-1">
                              <span className={`text-[10px] font-bold truncate ${cfg.text}`}>
                                {ag.clientes?.nome}
                              </span>
                            </div>
                            <p className="text-[9px] text-muted-foreground truncate">
                              {ag.servicos?.nome}
                            </p>
                          </div>
                          {heightPx >= 45 && (
                            <div className="flex items-center justify-between mt-1 pt-1 border-t border-border/10">
                              <span className="text-[8px] font-semibold text-muted-foreground flex items-center gap-0.5">
                                <Clock className="w-2 h-2" /> {ag.hora_inicio.slice(0, 5)}
                              </span>
                              {ag.local_corpo && (
                                <span className="text-[8px] text-muted-foreground truncate max-w-[50%]">
                                  📍 {ag.local_corpo}
                                </span>
                              )}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* ── MODAL DE DETALHES DO AGENDAMENTO ─────────────────────── */}
      <Dialog
        open={!!selectedAg}
        onOpenChange={(open) => !open && setSelectedAg(null)}
      >
        {selectedAg && (
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
                      {selectedAg.clientes?.nome}
                    </h2>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {selectedAg.servicos?.nome} · {selectedAg.servicos?.duracao_minutos}min
                    {selectedAg.valor ? ` · R$ ${Number(selectedAg.valor).toFixed(0)}` : ""}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
                    <Calendar className="w-3 h-3" />
                    {new Date(selectedAg.data + "T12:00:00").toLocaleDateString(
                      "pt-BR"
                    )}{" "}
                    às {selectedAg.hora_inicio.slice(0, 5)}
                  </p>
                </div>
                {selectedAg.clientes?.telefone && (
                  <a
                    href={`https://wa.me/55${selectedAg.clientes.telefone.replace(/\D/g, "")}?text=${encodeURIComponent(`Olá ${selectedAg.clientes?.nome}! Confirmando seu agendamento no dia ${selectedAg.data} às ${selectedAg.hora_inicio.slice(0, 5)}.`)}`}
                    target="_blank"
                    className="flex items-center gap-1.5 bg-green-500/10 text-green-400 hover:bg-green-500/20 border border-green-500/20 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors shrink-0"
                  >
                    {WA_ICON} Mensagem
                  </a>
                )}
              </div>
            </div>

            {/* CONTEÚDO SCROLL */}
            <div className="p-6 space-y-6 overflow-y-scroll flex-1">
              <div>
                <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-3">
                  Contato
                </p>
                <div className="bg-muted/30 rounded-xl p-4 space-y-2">
                  {selectedAg.clientes?.telefone && (
                    <div className="flex items-center gap-2 text-sm text-foreground">
                      <Phone className="w-3.5 h-3.5 text-muted-foreground" />
                      <span>{selectedAg.clientes.telefone}</span>
                    </div>
                  )}
                  {selectedAg.clientes?.email && (
                    <div className="flex items-center gap-2 text-sm text-foreground">
                      <span className="text-muted-foreground text-xs w-3.5 text-center">@</span>
                      <span>{selectedAg.clientes.email}</span>
                    </div>
                  )}
                </div>
              </div>

              {selectedAg.local_corpo && (
                <div>
                  <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-3">
                    Local do corpo
                  </p>
                  <div className="bg-muted/30 rounded-xl p-4 text-sm text-foreground">
                    📍 {selectedAg.local_corpo}
                  </div>
                </div>
              )}

              {selectedAg.referencia_url && (
                <div>
                  <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-3">
                    Referência
                  </p>
                  <a
                    href={selectedAg.referencia_url}
                    target="_blank"
                    className="block rounded-xl overflow-hidden border border-border"
                  >
                    <img
                      src={selectedAg.referencia_url}
                      alt="Referência"
                      className="w-full max-h-64 object-cover hover:scale-[1.02] transition-transform"
                    />
                  </a>
                </div>
              )}

              {/* FICHA DE ANAMNESE */}
              {selectedAg.anamnese && (
                <div>
                  <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-3 flex items-center gap-1.5">
                    <FileText className="w-3.5 h-3.5" /> Ficha de Anamnese
                  </p>
                  <div className="space-y-2">
                    {Object.entries(PERGUNTAS_LABEL).map(
                      ([key, { label, descKey }]) => {
                        const val = selectedAg.anamnese![key as keyof Anamnese];
                        const desc = descKey
                          ? (selectedAg.anamnese![descKey] as string)
                          : null;
                        if (val === null || val === undefined) return null;
                        return (
                          <div
                            key={key}
                            className="flex items-start justify-between gap-3 bg-muted/30 rounded-lg px-3 py-2.5"
                          >
                            <span className="text-sm text-muted-foreground">
                              {label}
                            </span>
                            <div className="text-right shrink-0">
                              <span
                                className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
                                  val === true
                                    ? "bg-red-500/10 text-red-400 border border-red-500/20"
                                    : "bg-green-500/10 text-green-400 border border-green-500/20"
                                }`}
                              >
                                {val ? "Sim" : "Não"}
                              </span>
                              {val && desc && (
                                <p className="text-xs text-muted-foreground mt-1">
                                  {desc}
                                </p>
                              )}
                            </div>
                          </div>
                        );
                      }
                    )}
                    {/* aceite */}
                    <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-green-500/5 border border-green-500/10 mt-1">
                      <CheckCircle2 className="w-3.5 h-3.5 text-green-400 shrink-0" />
                      <span className="text-xs text-muted-foreground">
                        Declaração de veracidade assinada
                      </span>
                    </div>
                  </div>
                </div>
              )}

            </div>
          </DialogContent>
        )}
      </Dialog>
    </div>
  );
}
