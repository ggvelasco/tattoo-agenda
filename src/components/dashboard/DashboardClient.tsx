"use client";

import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { VisuallyHidden } from "radix-ui";
import Link from "next/link";
import {
  CalendarDays,
  Clock,
  AlertCircle,
  CheckCircle2,
  ImageIcon,
  Zap,
  Sparkles,
  ArrowRight,
} from "lucide-react";

type Agendamento = {
  id: string;
  data: string;
  hora_inicio: string;
  status: string;
  local_corpo: string | null;
  referencia_url: string | null;
  clientes: { nome: string; telefone: string } | null;
  servicos: { nome: string; duracao_minutos: number } | null;
  is_retornando?: boolean;
};

type Props = {
  nomeUsuario: string;
  fotoUrl?: string | null;
  slug?: string | null;
  agendamentosRaw: Agendamento[];
  totalPendentes: number;
  totalProximas: number;
  onboarding?: {
    hasServices: boolean;
    hasAvailability: boolean;
    hasProfile: boolean;
  };
};

const ACCENT = "var(--primary)";

const WaSvg = ({ size = 14 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
  </svg>
);

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  show: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.5,
      delay: i * 0.07,
      ease: [0.22, 1, 0.36, 1] as [number, number, number, number],
    },
  }),
};

export default function DashboardClient({
  nomeUsuario,
  fotoUrl,
  slug,
  agendamentosRaw = [],
  totalPendentes = 0,
  totalProximas = 0,
  onboarding = { hasServices: false, hasAvailability: false, hasProfile: false },
}: Props) {
  const [agora, setAgora] = useState<Date | null>(null);

  useEffect(() => {
    setAgora(new Date());
  }, []);

  const now = agora ?? new Date();
  const horaAtual = now.getHours() * 60 + now.getMinutes();
  const hora = now.getHours();
  const saudacao =
    hora < 12 ? "Bom dia" : hora < 18 ? "Boa tarde" : "Boa noite";
  const hoje = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;
  const [imagemAberta, setImagemAberta] = useState<string | null>(null);

  const steps = useMemo(() => [
    {
      id: "services",
      label: "Cadastrar seu primeiro serviço",
      desc: "Adicione os tipos de tatuagem e serviços que você oferece.",
      completed: onboarding.hasServices,
      link: "/dashboard/servicos",
    },
    {
      id: "availability",
      label: "Configurar horários de atendimento",
      desc: "Defina os dias da semana e horários em que você está disponível.",
      completed: onboarding.hasAvailability,
      link: "/dashboard/horarios",
    },
    {
      id: "profile",
      label: "Personalizar seu perfil e link público",
      desc: "Defina foto de perfil e escolha seu link exclusivo (ex: tattooagenda.ink/seu-nome).",
      completed: onboarding.hasProfile,
      link: "/dashboard/perfil",
    },
  ], [onboarding]);

  const completedCount = useMemo(() => steps.filter((s) => s.completed).length, [steps]);
  const isAllCompleted = useMemo(() => completedCount === steps.length, [completedCount, steps]);

  const agendamentosHoje = useMemo(
    () => agendamentosRaw.filter((ag) => ag.data === hoje),
    [agendamentosRaw, hoje],
  );

  const confirmadosHoje = agendamentosHoje.filter(
    (ag) => ag.status === "confirmado",
  ).length;

  const proximoCliente = agendamentosHoje.find((ag) => {
    const [h, m] = ag.hora_inicio.split(":").map(Number);
    return h * 60 + m >= horaAtual;
  });

  const agendamentosOrdenados = useMemo(
    () =>
      [...agendamentosHoje].sort((a, b) => {
        const toMin = (t: string) => {
          const [h, m] = t.split(":").map(Number);
          return h * 60 + m;
        };
        const aMin = toMin(a.hora_inicio),
          bMin = toMin(b.hora_inicio);
        const aPassou = aMin < horaAtual,
          bPassou = bMin < horaAtual;
        if (aPassou && !bPassou) return 1;
        if (!aPassou && bPassou) return -1;
        return aMin - bMin;
      }),
    [agendamentosHoje, horaAtual],
  );

  // progresso do dia — % do dia trabalhado
  const totalSessoes = agendamentosHoje.length;
  const sessoesPassadas = agendamentosHoje.filter((ag) => {
    const [h, m] = ag.hora_inicio.split(":").map(Number);
    return h * 60 + m < horaAtual;
  }).length;
  const progresso =
    totalSessoes > 0 ? Math.round((sessoesPassadas / totalSessoes) * 100) : 0;

  const STATS = [
    {
      label: "Sessões hoje",
      value: agendamentosHoje.length,
      sub: `${confirmadosHoje} confirmada${confirmadosHoje !== 1 ? "s" : ""}`,
      color: "#3b82f6",
      bg: "rgba(59,130,246,0.08)",
      border: "rgba(59,130,246,0.15)",
      icon: <CalendarDays className="w-4 h-4" style={{ color: "#3b82f6" }} />,
    },
    {
      label: "Pendentes",
      value: totalPendentes,
      sub: "Aguardando confirmação",
      color: "#f59e0b",
      bg: "rgba(245,158,11,0.08)",
      border: "rgba(245,158,11,0.15)",
      icon: <AlertCircle className="w-4 h-4" style={{ color: "#f59e0b" }} />,
    },
    {
      label: "Próximas sessões",
      value: totalProximas,
      sub: "A partir de hoje",
      color: ACCENT,
      bg: `color-mix(in srgb, ${ACCENT} 8%, transparent)`,
      border: `color-mix(in srgb, ${ACCENT} 15%, transparent)`,
      icon: <Zap className="w-4 h-4" style={{ color: ACCENT }} />,
    },
  ];

  return (
    <div className="space-y-8 max-w-4xl">
      {/* ── HERO ─────────────────────────────────────────────────── */}
      <motion.div
        initial="hidden"
        animate="show"
        variants={{ show: { transition: { staggerChildren: 0.08 } } }}
        className="relative overflow-hidden rounded-2xl p-6 md:p-8 bg-card border border-border"
        style={{ borderRadius: "1rem" }}
      >
        {/* glow de fundo */}
        <div
          style={{
            position: "absolute",
            top: "-40px",
            right: "-40px",
            width: "240px",
            height: "240px",
            borderRadius: "9999px",
            background: `radial-gradient(ellipse, color-mix(in srgb, ${ACCENT} 7%, transparent) 0%, transparent 70%)`,
            pointerEvents: "none",
            filter: "blur(30px)",
          }}
        />
        <div
          style={{
            position: "absolute",
            bottom: "-20px",
            left: "10%",
            width: "200px",
            height: "200px",
            borderRadius: "9999px",
            background:
              "radial-gradient(ellipse, rgba(59,130,246,0.06) 0%, transparent 70%)",
            pointerEvents: "none",
            filter: "blur(20px)",
          }}
        />

        {/* dot pattern */}
        <svg
          style={{
            position: "absolute",
            inset: 0,
            width: "100%",
            height: "100%",
            pointerEvents: "none",
            opacity: 0.5,
          }}
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            <pattern
              id="hero-dots"
              width="24"
              height="24"
              patternUnits="userSpaceOnUse"
            >
              <circle cx="1" cy="1" r="0.7" fill="white" opacity="0.04" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#hero-dots)" />
        </svg>

        <div className="relative flex items-start justify-between gap-4 flex-wrap">
          <div className="flex items-center gap-4">
            {/* avatar */}
            <motion.div
              variants={fadeUp}
              custom={0}
              className="relative shrink-0"
            >
              <div
                suppressHydrationWarning
                style={{
                  background: "hsl(var(--muted))",
                  width: "56px",
                  height: "56px",
                  borderRadius: "16px",
                  overflow: "hidden",
                  border: `1.5px solid color-mix(in srgb, ${ACCENT} 18%, transparent)`,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexShrink: 0,
                }}
              >
                {fotoUrl ? (
                  <img
                    src={fotoUrl}
                    alt={nomeUsuario}
                    style={{
                      width: "100%",
                      height: "100%",
                      objectFit: "cover",
                    }}
                  />
                ) : (
                  <span
                    style={{
                      fontFamily: "'Unbounded',sans-serif",
                      fontSize: "20px",
                      fontWeight: 700,
                      color: ACCENT,
                    }}
                  >
                    {nomeUsuario.charAt(0).toUpperCase()}
                  </span>
                )}
              </div>
              {/* status dot */}
              <div
                style={{
                  position: "absolute",
                  bottom: "-2px",
                  right: "-2px",
                  width: "12px",
                  height: "12px",
                  borderRadius: "9999px",
                  background: "#22c55e",
                  border: "2px solid #111",
                  boxShadow: "0 0 6px rgba(34,197,94,0.6)",
                }}
              />
            </motion.div>

            <div>
              <motion.div
                variants={fadeUp}
                custom={1}
                className="flex items-center gap-2 mb-0.5"
              >
                <span
                  style={{
                    fontFamily: "'Unbounded',sans-serif",
                    fontSize: "11px",
                    fontWeight: 700,
                    textTransform: "uppercase",
                    letterSpacing: ".2em",
                    color: `color-mix(in srgb, ${ACCENT} 50%, transparent)`,
                  }}
                >
                  {saudacao}
                </span>
                <div
                  style={{
                    width: "4px",
                    height: "4px",
                    borderRadius: "9999px",
                    background: ACCENT,
                    boxShadow: `0 0 6px color-mix(in srgb, ${ACCENT} 60%, transparent)`,
                  }}
                />
              </motion.div>
              <motion.h1
                variants={fadeUp}
                custom={2}
                style={{
                  fontFamily: "'Unbounded',sans-serif",
                  fontSize: "clamp(20px,3vw,26px)",
                  fontWeight: 900,
                  textTransform: "uppercase",
                  letterSpacing: "-.02em",
                  color: "var(--foreground)",
                  lineHeight: 1.1,
                }}
              >
                {nomeUsuario}
              </motion.h1>
              <motion.p
                variants={fadeUp}
                custom={3}
                className="text-sm mt-1 text-muted-foreground"
              >
                {now.toLocaleDateString("pt-BR", {
                  weekday: "long",
                  day: "numeric",
                  month: "long",
                })}
              </motion.p>
            </div>
          </div>

          {/* link da página pública */}
          {slug && (
            <motion.a
              variants={fadeUp}
              custom={2}
              href={`/${slug}`}
              target="_blank"
              className="flex items-center gap-1.5 bg-muted/40 hover:bg-muted border border-border rounded-full px-4 py-2 text-[11px] font-semibold text-muted-foreground hover:text-foreground transition-all uppercase tracking-wider"
            >
              <div className="w-1.5 h-1.5 rounded-full bg-green-500" />
              tattooagenda.ink/{slug}
            </motion.a>
          )}
        </div>

        {/* barra de progresso do dia */}
        {totalSessoes > 0 && (
          <motion.div variants={fadeUp} custom={4} className="mt-6 relative">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                Progresso do dia
              </span>
              <span
                style={{ fontSize: "10px", fontWeight: 700, color: ACCENT }}
              >
                {sessoesPassadas}/{totalSessoes} sessões
              </span>
            </div>
            <div
              style={{
                height: "3px",
                borderRadius: "9999px",
                background: "rgba(255,255,255,0.06)",
                overflow: "hidden",
              }}
            >
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${progresso}%` }}
                transition={{
                  duration: 1,
                  delay: 0.5,
                  ease: [0.22, 1, 0.36, 1],
                }}
                style={{
                  height: "100%",
                  borderRadius: "9999px",
                  background: `linear-gradient(to right, #3b82f6, ${ACCENT})`,
                }}
              />
            </div>
          </motion.div>
        )}
      </motion.div>

      {/* ── ONBOARDING CHECKLIST ─────────────────────────────────── */}
      {!isAllCompleted && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative overflow-hidden rounded-2xl p-6 bg-gradient-to-br from-indigo-500/[0.04] to-purple-500/[0.04] dark:from-indigo-500/10 dark:to-purple-500/10 border border-indigo-500/20 dark:border-indigo-500/30 shadow-[0_4px_20px_rgba(99,102,241,0.05)]"
        >
          {/* background glows */}
          <div
            style={{
              position: "absolute",
              top: "-50px",
              left: "-50px",
              width: "200px",
              height: "200px",
              borderRadius: "9999px",
              background: `radial-gradient(ellipse, rgba(129,140,248,0.06) 0%, transparent 70%)`,
              pointerEvents: "none",
              filter: "blur(25px)",
            }}
          />

          <div className="relative flex flex-col md:flex-row md:items-center justify-between gap-6 pb-6 border-b border-indigo-500/10">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-indigo-400 animate-pulse" />
                <h2 className="font-display text-xs font-bold uppercase tracking-wider text-foreground">
                  Configure seu Estúdio
                </h2>
              </div>
              <p className="text-sm text-muted-foreground">
                Complete os passos abaixo para começar a receber seus agendamentos online.
              </p>
            </div>
            
            <div className="flex flex-col items-end gap-1.5 shrink-0">
              <span className="text-xs font-semibold text-muted-foreground">
                Progresso: {completedCount} de {steps.length} concluídos
              </span>
              <div className="w-48 h-2 bg-muted rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${(completedCount / steps.length) * 100}%` }}
                  transition={{ duration: 0.5, ease: "easeOut" }}
                  className="h-full bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full"
                />
              </div>
            </div>
          </div>

          <div className="relative grid grid-cols-1 md:grid-cols-3 gap-4 pt-6">
            {steps.map((step, idx) => (
              <Link
                key={step.id}
                href={step.completed ? "#" : step.link}
                className={`flex flex-col justify-between p-4 rounded-xl border transition-all ${
                  step.completed
                    ? "bg-muted/10 border-green-500/20 opacity-70 cursor-default"
                    : "bg-muted/20 border-indigo-500/10 hover:border-indigo-500/30 cursor-pointer"
                }`}
                onClick={(e) => step.completed && e.preventDefault()}
              >
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    {step.completed ? (
                      <CheckCircle2 className="w-4 h-4 text-green-500 shrink-0" />
                    ) : (
                      <div className="w-4 h-4 rounded-full border border-muted-foreground/40 shrink-0" />
                    )}
                    <span className={`text-[10px] font-bold uppercase tracking-wider ${step.completed ? 'text-green-500' : 'text-foreground'}`}>
                      Passo {idx + 1}
                    </span>
                  </div>
                  <h3 className="text-sm font-semibold text-foreground mb-1">
                    {step.label}
                  </h3>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    {step.desc}
                  </p>
                </div>

                {!step.completed && (
                  <div className="flex items-center gap-1 text-[11px] font-bold text-indigo-400 hover:text-indigo-300 mt-4 transition-colors uppercase tracking-wider">
                    Configurar <ArrowRight className="w-3.5 h-3.5" />
                  </div>
                )}
              </Link>
            ))}
          </div>
        </motion.div>
      )}

      {/* ── STAT CARDS ───────────────────────────────────────────── */}
      <motion.div
        initial="hidden"
        animate="show"
        variants={{ show: { transition: { staggerChildren: 0.08 } } }}
        className="grid grid-cols-1 sm:grid-cols-3 gap-4"
      >
        {STATS.map((s, i) => (
          <motion.div
            key={s.label}
            variants={fadeUp}
            custom={i}
            className="relative overflow-hidden rounded-2xl p-5 border shadow-sm transition-all hover:scale-[1.01]"
            style={{
              background: s.bg,
              borderColor: s.border,
            }}
          >
            {/* glow corner */}
            <div
              style={{
                position: "absolute",
                top: "-20px",
                right: "-20px",
                width: "80px",
                height: "80px",
                borderRadius: "9999px",
                background: `radial-gradient(ellipse, ${s.color}20 0%, transparent 70%)`,
                pointerEvents: "none",
              }}
            />
            <div className="flex items-center justify-between mb-3">
              <span
                className="text-[10px] font-bold uppercase tracking-widest"
                style={{ color: s.color }}
              >
                {s.label}
              </span>
              <div
                className="w-9 h-9 rounded-xl flex items-center justify-center"
                style={{ background: `${s.color}15` }}
              >
                {s.icon}
              </div>
            </div>
            <div
              className="text-3xl font-black font-display text-foreground mb-1.5"
            >
              {s.value}
            </div>
            <p className="text-xs text-muted-foreground">{s.sub}</p>
          </motion.div>
        ))}
      </motion.div>

      {/* ── PRÓXIMO CLIENTE — destaque especial ──────────────────── */}
      {proximoCliente && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3, ease: [0.22, 1, 0.36, 1] }}
          className="relative overflow-hidden rounded-2xl p-5 md:p-6 bg-gradient-to-br from-green-500/[0.07] to-green-500/[0.03] border border-green-500/20 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-sm"
        >
          <div
            className="absolute top-0 left-0 right-0 h-[1px]"
            style={{
              background:
                "linear-gradient(to right, transparent, rgba(34,197,94,0.3), transparent)",
            }}
          />
          <div className="flex items-center gap-4">
            <div className="w-11 h-11 rounded-xl bg-green-500/10 border border-green-500/20 flex items-center justify-center shrink-0">
              <div className="w-2.5 h-2.5 rounded-full bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.8)]" />
            </div>
            <div>
              <div className="flex items-center gap-2 mb-0.5">
                <span className="text-[9px] font-bold uppercase tracking-widest text-green-400">
                  Próximo cliente
                </span>
              </div>
              <p className="text-base font-bold text-foreground font-display flex items-center gap-2 flex-wrap">
                {proximoCliente.clientes?.nome}
                {proximoCliente.is_retornando && (
                  <span className="text-[9px] font-bold bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 rounded-full px-2 py-0.5 uppercase tracking-wider">
                    ✦ Já é cliente
                  </span>
                )}
              </p>
              <p className="text-xs text-muted-foreground mt-0.5">
                {proximoCliente.servicos?.nome} · {proximoCliente.hora_inicio.slice(0, 5)}
                {proximoCliente.local_corpo && ` · 📍 ${proximoCliente.local_corpo}`}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3 shrink-0 self-end sm:self-center">
            {proximoCliente.referencia_url && (
              <button
                onClick={() => setImagemAberta(proximoCliente.referencia_url)}
                className="relative rounded-xl overflow-hidden w-10 h-10 border border-green-500/20 shadow-inner shrink-0 group bg-muted"
              >
                <img
                  src={proximoCliente.referencia_url}
                  alt="Referência"
                  className="w-full h-full object-cover group-hover:scale-[1.03] transition-transform duration-200"
                />
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors flex items-center justify-center">
                  <ImageIcon className="w-3.5 h-3.5 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
              </button>
            )}
            {proximoCliente.clientes?.telefone && (
              <a
                href={`https://wa.me/55${proximoCliente.clientes.telefone.replace(/\D/g, "")}?text=${encodeURIComponent(`Olá ${proximoCliente.clientes.nome}! Confirmando sua sessão de ${proximoCliente.servicos?.nome} hoje às ${proximoCliente.hora_inicio.slice(0, 5)}.`)}`}
                target="_blank"
                className="inline-flex items-center justify-center gap-1.5 bg-green-500/10 text-green-400 hover:bg-green-500/20 border border-green-500/20 px-4 py-2 rounded-full text-[11px] font-bold transition-all uppercase tracking-wider shrink-0 select-none shadow-sm"
              >
                <WaSvg size={12} /> WhatsApp
              </a>
            )}
          </div>
        </motion.div>
      )}

      {/* ── AGENDA DE HOJE ───────────────────────────────────────── */}
      <div className="space-y-4">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="flex items-center justify-between"
        >
          <div className="flex items-center gap-3">
            <h2 className="font-display text-xs font-bold uppercase tracking-widest text-muted-foreground">
              Agenda de hoje
            </h2>
            {agendamentosHoje.length > 0 && (
              <span
                style={{
                  fontSize: "10px",
                  fontWeight: 700,
                  background: `color-mix(in srgb, ${ACCENT} 8%, transparent)`,
                  color: ACCENT,
                  border: `1px solid color-mix(in srgb, ${ACCENT} 15%, transparent)`,
                  borderRadius: "9999px",
                  padding: "2px 10px",
                }}
              >
                {agendamentosHoje.length}{" "}
                {agendamentosHoje.length === 1 ? "sessão" : "sessões"}
              </span>
            )}
          </div>
        </motion.div>

        {agendamentosOrdenados.length > 0 ? (
          <div className="space-y-2.5">
            {agendamentosOrdenados.map((ag, i) => {
              const [h, m] = ag.hora_inicio.split(":").map(Number);
              const jaPassou = h * 60 + m < horaAtual;
              const isProximo = proximoCliente?.id === ag.id;

              return (
                <motion.div
                  key={ag.id}
                  initial={{ opacity: 0, x: -16 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{
                    duration: 0.4,
                    delay: 0.4 + i * 0.06,
                    ease: [0.22, 1, 0.36, 1],
                  }}
                  className={`border rounded-2xl p-4 flex items-center justify-between gap-4 transition-all duration-200 ${
                    isProximo
                      ? "bg-green-500/[0.04] border-green-500/20 shadow-sm"
                      : jaPassou
                        ? "bg-transparent border-border/20 opacity-45"
                        : "bg-muted/15 border-border/40 hover:border-primary/25 hover:bg-muted/20"
                  }`}
                >
                  {/* horário + linha + info */}
                  <div className="flex items-center gap-4 flex-1 min-w-0">
                    <div className="w-12 text-center shrink-0">
                      <span
                        className={`text-sm font-bold font-display ${
                          isProximo
                            ? "text-green-400"
                            : jaPassou
                              ? "text-muted-foreground/45"
                              : "text-muted-foreground"
                        }`}
                      >
                        {ag.hora_inicio.slice(0, 5)}
                      </span>
                    </div>
                    <div
                      className={`w-[1px] h-8 shrink-0 ${
                        isProximo ? "bg-green-500/30" : "bg-border/40"
                      }`}
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-sm font-bold text-foreground font-display">
                          {ag.clientes?.nome}
                        </span>
                        {ag.is_retornando && (
                          <span className="text-[9px] font-bold bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 rounded-full px-2 py-0.5 uppercase tracking-wider">
                            ✦ Já é cliente
                          </span>
                        )}
                        {isProximo && (
                          <span className="text-[9px] font-bold bg-green-500/10 text-green-400 border border-green-500/20 rounded-full px-2 py-0.5 uppercase tracking-wider">
                            próximo
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {ag.servicos?.nome}
                        {ag.local_corpo && ` · 📍 ${ag.local_corpo}`}
                      </p>
                    </div>
                  </div>

                  {/* ações */}
                  <div className="flex items-center gap-2.5 shrink-0">
                    {/* referência */}
                    {ag.referencia_url && (
                      <button
                        onClick={() => setImagemAberta(ag.referencia_url)}
                        className="relative rounded-xl overflow-hidden w-9 h-9 border border-border shrink-0 shadow-sm group bg-muted"
                      >
                        <img
                          src={ag.referencia_url}
                          alt="ref"
                          className="w-full h-full object-cover group-hover:scale-[1.03] transition-transform duration-200"
                        />
                        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors flex items-center justify-center">
                          <ImageIcon className="w-3.5 h-3.5 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                        </div>
                      </button>
                    )}

                    {/* status */}
                    <div className="flex items-center shrink-0">
                      {ag.status === "confirmado" ? (
                        <CheckCircle2 className="w-4 h-4 text-green-400" />
                      ) : (
                        <AlertCircle className="w-4 h-4 text-amber-500" />
                      )}
                    </div>

                    {/* whatsapp */}
                    {ag.clientes?.telefone && (
                      <a
                        href={`https://wa.me/55${ag.clientes.telefone.replace(/\D/g, "")}?text=${encodeURIComponent(`Olá ${ag.clientes.nome}! Sobre sua sessão de ${ag.servicos?.nome} hoje às ${ag.hora_inicio.slice(0, 5)}.`)}`}
                        target="_blank"
                        className="w-9 h-9 rounded-xl bg-green-500/10 border border-green-500/15 flex items-center justify-center text-green-400 hover:bg-green-500/20 transition-colors shrink-0 shadow-sm"
                      >
                        <WaSvg size={12} />
                      </a>
                    )}
                  </div>
                </motion.div>
              );
            })}
          </div>
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="border border-dashed border-border rounded-2xl p-12 text-center"
          >
            <CalendarDays className="w-8 h-8 text-muted-foreground/30 mx-auto mb-3" />
            <p className="text-sm text-muted-foreground font-medium">
              Nenhuma sessão hoje.
            </p>
            {!isAllCompleted ? (
              <div className="mt-2 max-w-sm mx-auto space-y-3">
                <p className="text-xs text-muted-foreground">
                  Seu estúdio ainda não está pronto para receber agendamentos. Complete os primeiros passos na lista acima para começar!
                </p>
              </div>
            ) : (
              <p className="text-xs text-muted-foreground/60 mt-1">
                Aproveite para descansar 🎨
              </p>
            )}
          </motion.div>
        )}
      </div>

      {/* dialog imagem */}
      <Dialog
        open={!!imagemAberta}
        onOpenChange={(open) => !open && setImagemAberta(null)}
      >
        <DialogContent className="max-w-2xl p-2">
          <VisuallyHidden.Root>
            <DialogTitle>Referência</DialogTitle>
          </VisuallyHidden.Root>
          {imagemAberta && (
            <img
              src={imagemAberta}
              alt="Referência"
              className="w-full rounded-lg object-contain max-h-[80vh]"
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
