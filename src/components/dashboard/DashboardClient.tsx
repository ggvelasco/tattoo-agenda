"use client";

import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { VisuallyHidden } from "radix-ui";
import {
  CalendarDays,
  Clock,
  AlertCircle,
  CheckCircle2,
  ImageIcon,
  Zap,
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
};

type Props = {
  nomeUsuario: string;
  fotoUrl?: string | null;
  slug?: string | null;
  agendamentosRaw: Agendamento[];
  totalPendentes: number;
  totalProximas: number;
};

const ACCENT = "#818cf8";

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
  agendamentosRaw,
  totalPendentes,
  totalProximas,
}: Props) {
  const agora = new Date();
  const horaAtual = agora.getHours() * 60 + agora.getMinutes();
  const hora = agora.getHours();
  const saudacao =
    hora < 12 ? "Bom dia" : hora < 18 ? "Boa tarde" : "Boa noite";
  const hoje = `${agora.getFullYear()}-${String(agora.getMonth() + 1).padStart(2, "0")}-${String(agora.getDate()).padStart(2, "0")}`;
  const [imagemAberta, setImagemAberta] = useState<string | null>(null);

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
      bg: `rgba(129,140,248,0.08)`,
      border: `rgba(129,140,248,0.15)`,
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
            background: `radial-gradient(ellipse, ${ACCENT}12 0%, transparent 70%)`,
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
                style={{
                  background: "hsl(var(--muted))",
                  width: "56px",
                  height: "56px",
                  borderRadius: "16px",
                  overflow: "hidden",
                  border: `1.5px solid ${ACCENT}30`,
                  background: "#1a1a1a",
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
                    color: `${ACCENT}80`,
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
                    boxShadow: `0 0 6px ${ACCENT}`,
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
                  color: "#e5e7eb",
                  lineHeight: 1.1,
                }}
              >
                {nomeUsuario}
              </motion.h1>
              <motion.p
                variants={fadeUp}
                custom={3}
                className="text-sm mt-1"
                style={{ color: "#444" }}
              >
                {agora.toLocaleDateString("pt-BR", {
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
              style={{
                display: "flex",
                alignItems: "center",
                gap: "6px",
                background: "rgba(255,255,255,0.04)",
                border: "1px solid rgba(255,255,255,0.08)",
                borderRadius: "9999px",
                padding: "8px 16px",
                fontSize: "11px",
                fontWeight: 600,
                color: "#555",
                textDecoration: "none",
                transition: "all .2s",
                textTransform: "uppercase",
                letterSpacing: ".1em",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = "rgba(255,255,255,0.08)";
                e.currentTarget.style.color = "#e5e7eb";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = "rgba(255,255,255,0.04)";
                e.currentTarget.style.color = "#555";
              }}
            >
              <div
                style={{
                  width: "6px",
                  height: "6px",
                  borderRadius: "9999px",
                  background: "#22c55e",
                }}
              />
              tattooagenda.ink/{slug}
            </motion.a>
          )}
        </div>

        {/* barra de progresso do dia */}
        {totalSessoes > 0 && (
          <motion.div variants={fadeUp} custom={4} className="mt-6 relative">
            <div className="flex items-center justify-between mb-2">
              <span
                style={{
                  fontSize: "10px",
                  fontWeight: 600,
                  textTransform: "uppercase",
                  letterSpacing: ".15em",
                  color: "#333",
                }}
              >
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
            style={{
              background: s.bg,
              border: `1px solid ${s.border}`,
              borderRadius: "16px",
              padding: "20px",
              position: "relative",
              overflow: "hidden",
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
                style={{
                  fontSize: "9px",
                  fontWeight: 700,
                  textTransform: "uppercase",
                  letterSpacing: ".2em",
                  color: s.color,
                  opacity: 0.8,
                }}
              >
                {s.label}
              </span>
              <div
                style={{
                  width: "32px",
                  height: "32px",
                  borderRadius: "10px",
                  background: `${s.color}15`,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                {s.icon}
              </div>
            </div>
            <div
              style={{
                fontSize: "36px",
                fontWeight: 900,
                fontFamily: "'Unbounded',sans-serif",
                color: "#e5e7eb",
                lineHeight: 1,
                marginBottom: "6px",
              }}
            >
              {typeof s.value === "number" ? s.value : s.value}
            </div>
            <p style={{ fontSize: "11px", color: "#444" }}>{s.sub}</p>
          </motion.div>
        ))}
      </motion.div>

      {/* ── PRÓXIMO CLIENTE — destaque especial ──────────────────── */}
      {proximoCliente && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3, ease: [0.22, 1, 0.36, 1] }}
          style={{
            background:
              "linear-gradient(135deg, rgba(34,197,94,0.08) 0%, rgba(34,197,94,0.04) 100%)",
            border: "1px solid rgba(34,197,94,0.2)",
            borderRadius: "16px",
            padding: "20px 24px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: "16px",
            flexWrap: "wrap",
            position: "relative",
            overflow: "hidden",
          }}
        >
          <div
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              right: 0,
              height: "1px",
              background:
                "linear-gradient(to right, transparent, rgba(34,197,94,0.4), transparent)",
            }}
          />
          <div className="flex items-center gap-4">
            <div
              style={{
                width: "44px",
                height: "44px",
                borderRadius: "12px",
                background: "rgba(34,197,94,0.12)",
                border: "1px solid rgba(34,197,94,0.2)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0,
              }}
            >
              <div
                style={{
                  width: "8px",
                  height: "8px",
                  borderRadius: "9999px",
                  background: "#22c55e",
                  boxShadow: "0 0 8px rgba(34,197,94,0.8)",
                }}
              />
            </div>
            <div>
              <div className="flex items-center gap-2 mb-0.5">
                <span
                  style={{
                    fontSize: "9px",
                    fontWeight: 700,
                    textTransform: "uppercase",
                    letterSpacing: ".2em",
                    color: "rgba(34,197,94,0.6)",
                  }}
                >
                  Próximo cliente
                </span>
              </div>
              <p
                style={{
                  fontFamily: "'Unbounded',sans-serif",
                  fontSize: "15px",
                  fontWeight: 700,
                  color: "#e5e7eb",
                }}
              >
                {proximoCliente.clientes?.nome}
              </p>
              <p style={{ fontSize: "12px", color: "#555", marginTop: "2px" }}>
                {proximoCliente.servicos?.nome} ·{" "}
                {proximoCliente.hora_inicio.slice(0, 5)}
                {proximoCliente.local_corpo &&
                  ` · 📍 ${proximoCliente.local_corpo}`}
              </p>
            </div>
          </div>
          {proximoCliente.clientes?.telefone && (
            <a
              href={`https://wa.me/55${proximoCliente.clientes.telefone.replace(/\D/g, "")}?text=${encodeURIComponent(`Olá ${proximoCliente.clientes.nome}! Confirmando sua sessão de ${proximoCliente.servicos?.nome} hoje às ${proximoCliente.hora_inicio.slice(0, 5)}.`)}`}
              target="_blank"
              style={{
                display: "flex",
                alignItems: "center",
                gap: "6px",
                background: "rgba(34,197,94,0.12)",
                border: "1px solid rgba(34,197,94,0.25)",
                borderRadius: "9999px",
                padding: "8px 16px",
                fontSize: "11px",
                fontWeight: 700,
                color: "#22c55e",
                textDecoration: "none",
                transition: "all .2s",
                textTransform: "uppercase",
                letterSpacing: ".08em",
              }}
              onMouseEnter={(e) =>
                (e.currentTarget.style.background = "rgba(34,197,94,0.2)")
              }
              onMouseLeave={(e) =>
                (e.currentTarget.style.background = "rgba(34,197,94,0.12)")
              }
            >
              <WaSvg size={12} /> WhatsApp
            </a>
          )}
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
            <h2
              style={{
                fontFamily: "'Unbounded',sans-serif",
                fontSize: "11px",
                fontWeight: 700,
                textTransform: "uppercase",
                letterSpacing: ".2em",
                color: "#333",
              }}
            >
              Agenda de hoje
            </h2>
            {agendamentosHoje.length > 0 && (
              <span
                style={{
                  fontSize: "10px",
                  fontWeight: 700,
                  background: `${ACCENT}15`,
                  color: ACCENT,
                  border: `1px solid ${ACCENT}25`,
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
          <div className="space-y-2">
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
                  style={{
                    background: isProximo
                      ? "rgba(34,197,94,0.05)"
                      : jaPassou
                        ? "transparent"
                        : "rgba(255,255,255,0.02)",
                    border: isProximo
                      ? "1px solid rgba(34,197,94,0.2)"
                      : jaPassou
                        ? "1px solid rgba(255,255,255,0.04)"
                        : "1px solid rgba(255,255,255,0.06)",
                    borderRadius: "14px",
                    padding: "14px 16px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    gap: "12px",
                    opacity: jaPassou ? 0.45 : 1,
                    transition: "all .2s",
                  }}
                >
                  {/* horário + linha + info */}
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <div style={{ minWidth: "44px", textAlign: "center" }}>
                      <span
                        style={{
                          fontFamily: "'Unbounded',sans-serif",
                          fontSize: "13px",
                          fontWeight: 700,
                          color: isProximo
                            ? "#22c55e"
                            : jaPassou
                              ? "#333"
                              : "#6b7280",
                        }}
                      >
                        {ag.hora_inicio.slice(0, 5)}
                      </span>
                    </div>
                    <div
                      style={{
                        width: "1px",
                        height: "32px",
                        background: isProximo
                          ? "rgba(34,197,94,0.3)"
                          : "rgba(255,255,255,0.06)",
                        flexShrink: 0,
                      }}
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span
                          style={{
                            fontSize: "13px",
                            fontWeight: 600,
                            color: "#e5e7eb",
                          }}
                        >
                          {ag.clientes?.nome}
                        </span>
                        {isProximo && (
                          <span
                            style={{
                              fontSize: "8px",
                              fontWeight: 700,
                              background: "rgba(34,197,94,0.15)",
                              color: "#22c55e",
                              border: "1px solid rgba(34,197,94,0.25)",
                              borderRadius: "9999px",
                              padding: "2px 8px",
                              textTransform: "uppercase",
                              letterSpacing: ".1em",
                            }}
                          >
                            próximo
                          </span>
                        )}
                      </div>
                      <p
                        style={{
                          fontSize: "11px",
                          color: "#3a3a3a",
                          marginTop: "2px",
                        }}
                      >
                        {ag.servicos?.nome}
                        {ag.local_corpo && ` · 📍 ${ag.local_corpo}`}
                      </p>
                    </div>
                  </div>

                  {/* ações */}
                  <div className="flex items-center gap-2 shrink-0">
                    {/* referência */}
                    {ag.referencia_url && (
                      <button
                        onClick={() => setImagemAberta(ag.referencia_url)}
                        style={{
                          position: "relative",
                          borderRadius: "8px",
                          overflow: "hidden",
                          width: "32px",
                          height: "32px",
                          border: "1px solid rgba(255,255,255,0.08)",
                          flexShrink: 0,
                          cursor: "pointer",
                        }}
                        className="group"
                      >
                        <img
                          src={ag.referencia_url}
                          alt="ref"
                          style={{
                            width: "100%",
                            height: "100%",
                            objectFit: "cover",
                          }}
                        />
                        <div
                          style={{
                            position: "absolute",
                            inset: 0,
                            background: "rgba(0,0,0,0)",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            transition: "background .2s",
                          }}
                          onMouseEnter={(e) =>
                            (e.currentTarget.style.background =
                              "rgba(0,0,0,0.4)")
                          }
                          onMouseLeave={(e) =>
                            (e.currentTarget.style.background = "rgba(0,0,0,0)")
                          }
                        >
                          <ImageIcon
                            style={{
                              width: "10px",
                              height: "10px",
                              color: "white",
                              opacity: 0,
                            }}
                          />
                        </div>
                      </button>
                    )}

                    {/* status */}
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "4px",
                      }}
                    >
                      {ag.status === "confirmado" ? (
                        <CheckCircle2
                          style={{
                            width: "14px",
                            height: "14px",
                            color: "#22c55e",
                          }}
                        />
                      ) : (
                        <AlertCircle
                          style={{
                            width: "14px",
                            height: "14px",
                            color: "#f59e0b",
                          }}
                        />
                      )}
                    </div>

                    {/* whatsapp */}
                    {ag.clientes?.telefone && (
                      <a
                        href={`https://wa.me/55${ag.clientes.telefone.replace(/\D/g, "")}?text=${encodeURIComponent(`Olá ${ag.clientes.nome}! Sobre sua sessão de ${ag.servicos?.nome} hoje às ${ag.hora_inicio.slice(0, 5)}.`)}`}
                        target="_blank"
                        style={{
                          width: "32px",
                          height: "32px",
                          borderRadius: "9px",
                          background: "rgba(34,197,94,0.1)",
                          border: "1px solid rgba(34,197,94,0.15)",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          color: "#22c55e",
                          textDecoration: "none",
                          transition: "background .2s",
                          flexShrink: 0,
                        }}
                        onMouseEnter={(e) =>
                          (e.currentTarget.style.background =
                            "rgba(34,197,94,0.2)")
                        }
                        onMouseLeave={(e) =>
                          (e.currentTarget.style.background =
                            "rgba(34,197,94,0.1)")
                        }
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
            style={{
              border: "1px dashed rgba(255,255,255,0.06)",
              borderRadius: "16px",
              padding: "48px 24px",
              textAlign: "center",
            }}
          >
            <CalendarDays
              style={{
                width: "32px",
                height: "32px",
                color: "#2a2a2a",
                margin: "0 auto 12px",
              }}
            />
            <p style={{ fontSize: "13px", color: "#333" }}>
              Nenhuma sessão hoje.
            </p>
            <p style={{ fontSize: "11px", color: "#252525", marginTop: "4px" }}>
              Aproveite para descansar 🎨
            </p>
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
