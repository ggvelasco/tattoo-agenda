"use client";

import { motion, useScroll, useTransform, useInView } from "framer-motion";
import { useRef, useState } from "react";
import Link from "next/link";
import { Highlighter } from "./ui/highlighter";

const ACCENT = "#818cf8";
const ACCENT2 = "#a78bfa";

/* ── helpers ── */
function FadeUp({
  children,
  delay = 0,
  className = "",
}: {
  children: React.ReactNode;
  delay?: number;
  className?: string;
}) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-60px" });
  return (
    <motion.div
      ref={ref}
      className={className}
      initial={{ opacity: 0, y: 36 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.7, delay, ease: [0.22, 1, 0.36, 1] }}
    >
      {children}
    </motion.div>
  );
}

/* ── WA SVG ── */
const WaSvg = () => (
  <svg width="11" height="11" viewBox="0 0 24 24" fill="currentColor">
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
  </svg>
);

/* ── Grid pattern SVG ── */
const GridPattern = ({ opacity = 0.03 }: { opacity?: number }) => (
  <svg
    style={{
      position: "absolute",
      inset: 0,
      width: "100%",
      height: "100%",
      pointerEvents: "none",
    }}
    xmlns="http://www.w3.org/2000/svg"
  >
    <defs>
      <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
        <path
          d="M 40 0 L 0 0 0 40"
          fill="none"
          stroke="white"
          strokeWidth="0.5"
          opacity={opacity}
        />
      </pattern>
    </defs>
    <rect width="100%" height="100%" fill="url(#grid)" />
  </svg>
);

/* ── Diagonal lines SVG ── */
const DiagLines = () => (
  <svg
    style={{
      position: "absolute",
      inset: 0,
      width: "100%",
      height: "100%",
      pointerEvents: "none",
    }}
    xmlns="http://www.w3.org/2000/svg"
  >
    <defs>
      <pattern
        id="diag"
        width="20"
        height="20"
        patternUnits="userSpaceOnUse"
        patternTransform="rotate(45)"
      >
        <line
          x1="0"
          y1="0"
          x2="0"
          y2="20"
          stroke="white"
          strokeWidth="0.4"
          opacity="0.03"
        />
      </pattern>
    </defs>
    <rect width="100%" height="100%" fill="url(#diag)" />
  </svg>
);

/* ── Dot pattern SVG ── */
const DotPattern = () => (
  <svg
    style={{
      position: "absolute",
      inset: 0,
      width: "100%",
      height: "100%",
      pointerEvents: "none",
    }}
    xmlns="http://www.w3.org/2000/svg"
  >
    <defs>
      <pattern id="dots" width="24" height="24" patternUnits="userSpaceOnUse">
        <circle cx="1" cy="1" r="1" fill="white" opacity="0.04" />
      </pattern>
    </defs>
    <rect width="100%" height="100%" fill="url(#dots)" />
  </svg>
);

/* ── Dashboard Mockup ── */
function DashboardMockup() {
  const agendamentos = [
    {
      nome: "Rafael Lima",
      servico: "Fine Line · 2h",
      hora: "14:00",
      status: "confirmado",
      proximo: true,
    },
    {
      nome: "Juliana Souza",
      servico: "Traditional · 4h",
      hora: "16:00",
      status: "pendente",
    },
    {
      nome: "Mariana Costa",
      servico: "Blackwork · 3h",
      hora: "10:00",
      status: "confirmado",
      jaPassou: true,
    },
  ];
  return (
    <div
      style={{
        background: "#0D0D0D",
        borderRadius: "16px",
        border: "1px solid #1f1f1f",
        overflow: "hidden",
        fontFamily: "'Inter',sans-serif",
        position: "relative",
      }}
    >
      <GridPattern opacity={0.02} />
      {/* chrome */}
      <div
        style={{
          background: "#141414",
          borderBottom: "1px solid #1a1a1a",
          padding: "11px 16px",
          display: "flex",
          alignItems: "center",
          gap: "8px",
          position: "relative",
        }}
      >
        <div style={{ display: "flex", gap: "6px" }}>
          {["#2a2a2a", "#2a2a2a", "#2a2a2a"].map((c, i) => (
            <div
              key={i}
              style={{
                width: "9px",
                height: "9px",
                borderRadius: "50%",
                background: c,
              }}
            />
          ))}
        </div>
        <div
          style={{
            flex: 1,
            background: "#0A0A0A",
            borderRadius: "6px",
            padding: "4px 12px",
            textAlign: "center",
            fontSize: "10px",
            color: "#2a2a2a",
            border: "1px solid #1a1a1a",
          }}
        >
          tattooagenda.ink/dashboard
        </div>
      </div>
      <div
        style={{
          padding: "16px",
          display: "flex",
          flexDirection: "column",
          gap: "10px",
          position: "relative",
        }}
      >
        {/* stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
          {[
            {
              label: "Sessões hoje",
              value: "3",
              color: "#3b82f6",
              sub: "2 confirmadas",
            },
            {
              label: "Pendentes",
              value: "1",
              color: "#eab308",
              sub: "Aguardando",
            },
            {
              label: "Próximo",
              value: "Rafael Lima",
              color: "#22c55e",
              sub: "14:00",
            },
            {
              label: "Próximas",
              value: "9",
              color: ACCENT,
              sub: "A partir de hoje",
            },
          ].map((s, i) => (
            <motion.div
              key={s.label}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15 + i * 0.07, duration: 0.45 }}
              style={{
                background: "#191919",
                border: "1px solid #222",
                borderRadius: "10px",
                padding: "12px",
              }}
            >
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  marginBottom: "6px",
                }}
              >
                <span
                  style={{
                    fontSize: "8px",
                    textTransform: "uppercase",
                    letterSpacing: ".1em",
                    color: "#444",
                  }}
                >
                  {s.label}
                </span>
                <div
                  style={{
                    width: "6px",
                    height: "6px",
                    borderRadius: "50%",
                    background: s.color,
                    opacity: 0.6,
                  }}
                />
              </div>
              <div
                style={{
                  fontSize: s.label === "Próximo" ? "12px" : "22px",
                  fontWeight: 700,
                  color: "#e5e7eb",
                  lineHeight: 1,
                }}
              >
                {s.value}
              </div>
              <div style={{ fontSize: "9px", color: "#555", marginTop: "4px" }}>
                {s.sub}
              </div>
            </motion.div>
          ))}
        </div>
        {/* list */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.55 }}
          style={{
            background: "#191919",
            border: "1px solid #222",
            borderRadius: "10px",
            padding: "14px",
          }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              marginBottom: "12px",
            }}
          >
            <span
              style={{
                fontSize: "9px",
                textTransform: "uppercase",
                letterSpacing: ".15em",
                color: "#444",
                fontWeight: 600,
              }}
            >
              Agenda de hoje
            </span>
            <span style={{ fontSize: "9px", color: "#222" }}>3 sessões</span>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
            {agendamentos.map((ag) => (
              <div
                key={ag.nome}
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  padding: "9px 10px",
                  borderRadius: "8px",
                  border: ag.proximo
                    ? "1px solid #22c55e28"
                    : "1px solid #161616",
                  background: ag.proximo ? "#22c55e05" : "transparent",
                  opacity: ag.jaPassou ? 0.4 : 1,
                  transition: "opacity .2s",
                }}
              >
                <div
                  style={{ display: "flex", alignItems: "center", gap: "10px" }}
                >
                  <span
                    style={{
                      fontSize: "11px",
                      fontWeight: 700,
                      color: "#555",
                      minWidth: "36px",
                    }}
                  >
                    {ag.hora}
                  </span>
                  <div
                    style={{
                      width: "1px",
                      height: "22px",
                      background: "#1f1f1f",
                    }}
                  />
                  <div>
                    <div
                      style={{
                        fontSize: "11px",
                        fontWeight: 600,
                        color: "#e5e7eb",
                        display: "flex",
                        alignItems: "center",
                        gap: "6px",
                      }}
                    >
                      {ag.nome}
                      {ag.proximo && (
                        <span
                          style={{
                            fontSize: "8px",
                            background: "#22c55e12",
                            color: "#22c55e",
                            padding: "2px 7px",
                            borderRadius: "20px",
                          }}
                        >
                          próximo
                        </span>
                      )}
                    </div>
                    <div
                      style={{
                        fontSize: "9px",
                        color: "#555",
                        marginTop: "2px",
                      }}
                    >
                      {ag.servico}
                    </div>
                  </div>
                </div>
                <div
                  style={{ display: "flex", alignItems: "center", gap: "6px" }}
                >
                  <span
                    style={{
                      fontSize: "8px",
                      padding: "2px 8px",
                      borderRadius: "20px",
                      fontWeight: 700,
                      textTransform: "uppercase",
                      background:
                        ag.status === "confirmado" ? "#22c55e12" : "#eab30812",
                      color: ag.status === "confirmado" ? "#22c55e" : "#eab308",
                      border:
                        ag.status === "confirmado"
                          ? "1px solid #22c55e25"
                          : "1px solid #eab30825",
                    }}
                  >
                    {ag.status}
                  </span>
                  <div
                    style={{
                      width: "22px",
                      height: "22px",
                      borderRadius: "6px",
                      background: "#22c55e10",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      color: "#22c55e",
                    }}
                  >
                    <WaSvg />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
}

/* ── Feature Card ── */
function FeatureCard({
  icon,
  title,
  desc,
  delay,
  accent = false,
}: {
  icon: string;
  title: string;
  desc: string;
  delay: number;
  accent?: boolean;
}) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-40px" });
  const [hovered, setHovered] = useState(false);

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 32 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.6, delay, ease: [0.22, 1, 0.36, 1] }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        background: hovered ? "#1a1a1a" : "#141414",
        border: `1px solid ${hovered ? (accent ? ACCENT + "35" : "#2a2a2a") : "#1a1a1a"}`,
        borderRadius: "16px",
        padding: "28px",
        cursor: "default",
        transform: hovered ? "translateY(-4px)" : "translateY(0)",
        transition: "all .3s ease",
        boxShadow: hovered
          ? `0 20px 48px rgba(0,0,0,0.6)${accent ? `, 0 0 40px ${ACCENT}10` : ""}`
          : "none",
      }}
    >
      <div
        style={{
          width: "44px",
          height: "44px",
          borderRadius: "12px",
          background: accent ? `${ACCENT}18` : "#181818",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          marginBottom: "18px",
          fontSize: "20px",
          boxShadow: hovered && accent ? `0 0 20px ${ACCENT}30` : "none",
          transition: "all .3s",
        }}
      >
        {icon}
      </div>
      <h4
        style={{
          fontFamily: "'Unbounded',sans-serif",
          fontSize: "12px",
          fontWeight: 700,
          textTransform: "uppercase",
          letterSpacing: ".05em",
          color: "#e5e7eb",
          marginBottom: "10px",
        }}
      >
        {title}
      </h4>
      <p
        style={{
          fontSize: "13px",
          color: "#6b7280",
          lineHeight: "1.7",
          fontWeight: 300,
        }}
      >
        {desc}
      </p>
    </motion.div>
  );
}

/* ── STAT COUNTER ── */
function StatCard({
  num,
  label,
  delay,
}: {
  num: string;
  label: string;
  delay: number;
}) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true });
  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 24 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.6, delay }}
    >
      <div
        style={{
          fontFamily: "'Unbounded',sans-serif",
          fontSize: "clamp(36px,5vw,56px)",
          fontWeight: 900,
          color: "#e5e7eb",
          lineHeight: 1,
        }}
      >
        {num}
      </div>
      <div
        style={{
          fontSize: "12px",
          color: "#4b5563",
          letterSpacing: ".05em",
          marginTop: "8px",
        }}
      >
        {label}
      </div>
    </motion.div>
  );
}

/* ── MAIN ── */
export default function HomeContent({ isLoggedIn }: { isLoggedIn?: boolean }) {
  const heroRef = useRef(null);
  const { scrollYProgress } = useScroll({
    target: heroRef,
    offset: ["start start", "end start"],
  });
  const heroY = useTransform(scrollYProgress, [0, 1], ["0%", "28%"]);
  const heroOpacity = useTransform(scrollYProgress, [0, 0.65], [1, 0]);
  const imgScale = useTransform(scrollYProgress, [0, 1], [1, 1.15]);

  return (
    <div
      style={{
        backgroundColor: "#0D0D0D",
        color: "white",
        overflowX: "hidden",
      }}
    >
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Unbounded:wght@400;700;900&family=Inter:wght@300;400;500;600&display=swap');
        html{scroll-behavior:smooth}
        *,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
        body{font-family:'Inter',sans-serif;-webkit-font-smoothing:antialiased}
        .font-display{font-family:'Unbounded',sans-serif}

        .site-header{position:fixed;top:0;left:0;right:0;z-index:100;border-bottom:1px solid rgba(255,255,255,0.04);background:rgba(10,10,10,0.88);backdrop-filter:blur(20px);padding:18px 32px}
        .header-inner{max-width:1200px;margin:0 auto;display:flex;align-items:center;justify-content:space-between}
        .nav-link{font-size:10px;font-weight:600;text-transform:uppercase;letter-spacing:.15em;color:#555;text-decoration:none;transition:color .2s}
        .nav-link:hover{color:#e5e7eb}
        .btn-ghost{font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:.12em;color:#6b7280;text-decoration:none;transition:color .2s}
        .btn-ghost:hover{color:white}
        .btn-cta{background:#e5e7eb;color:#0A0A0A;padding:10px 22px;border-radius:9999px;font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:.12em;text-decoration:none;font-family:'Inter',sans-serif;transition:all .2s;display:inline-block}
        .btn-cta:hover{background:white;transform:scale(1.04)}

        .hero-badge{display:inline-flex;align-items:center;gap:8px;border-radius:9999px;border:1px solid rgba(129,140,248,0.25);background:rgba(129,140,248,0.07);padding:6px 18px;margin-bottom:28px;font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:.2em;color:${ACCENT}}
        .hero-badge::before{content:'';width:6px;height:6px;border-radius:9999px;background:${ACCENT};display:inline-block;animation:pulse-dot 2s ease-in-out infinite}
        @keyframes pulse-dot{0%,100%{opacity:1;transform:scale(1)}50%{opacity:.4;transform:scale(0.65)}}

        .hero-cta-primary{background:#e5e7eb;color:#0A0A0A;padding:16px 36px;border-radius:9999px;font-size:12px;font-weight:700;text-transform:uppercase;letter-spacing:.12em;text-decoration:none;font-family:'Inter',sans-serif;display:inline-block;transition:all .2s}
        .hero-cta-primary:hover{background:white;transform:translateY(-2px);box-shadow:0 12px 32px rgba(255,255,255,0.1)}
        .hero-cta-secondary{background:rgba(255,255,255,0.04);color:rgba(255,255,255,0.45);padding:16px 36px;border-radius:9999px;font-size:12px;font-weight:700;text-transform:uppercase;letter-spacing:.12em;text-decoration:none;font-family:'Inter',sans-serif;border:1px solid rgba(255,255,255,0.08);display:inline-block;transition:all .2s}
        .hero-cta-secondary:hover{background:rgba(255,255,255,0.07);color:white;border-color:rgba(255,255,255,0.15)}

        .marquee-wrap{overflow:hidden;border-top:1px solid rgba(255,255,255,0.04);border-bottom:1px solid rgba(255,255,255,0.04);background:#0D0D0D;padding:18px 0;position:relative}
        .marquee-track{display:flex;gap:48px;width:max-content;animation:marquee 28s linear infinite}
        .marquee-item{font-family:'Unbounded',sans-serif;font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:.15em;color:#1e1e1e;white-space:nowrap;display:flex;align-items:center;gap:48px}
        @keyframes marquee{from{transform:translateX(0)}to{transform:translateX(-50%)}}

        .step-card{background:#0D0D0D;border:1px solid #1a1a1a;border-radius:16px;padding:32px;display:flex;gap:24px;align-items:flex-start;transition:all .3s;position:relative;overflow:hidden}
        .step-card:hover{border-color:#222;background:#111;transform:translateX(6px)}

        .cta-btn-final{background:#e5e7eb;color:#0A0A0A;padding:18px 48px;border-radius:9999px;font-size:12px;font-weight:700;text-transform:uppercase;letter-spacing:.12em;text-decoration:none;font-family:'Inter',sans-serif;display:inline-block;transition:all .2s}
        .cta-btn-final:hover{background:white;transform:scale(1.04);box-shadow:0 0 40px rgba(255,255,255,0.08)}

        .footer-link{color:#252525;font-size:10px;text-transform:uppercase;letter-spacing:.15em;text-decoration:none;transition:color .2s}
        .footer-link:hover{color:#555}

        @media(max-width:768px){.site-header{padding:16px 20px}.nav-links{display:none}}
      `}</style>

      {/* ─── HERO ─────────────────────────────────────────────── */}
      <section
        ref={heroRef}
        style={{
          position: "relative",
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          overflow: "hidden",
        }}
      >
        {/* bg */}
        <motion.div style={{ position: "absolute", inset: 0, scale: imgScale }}>
          <img
            src="https://images.unsplash.com/photo-1611501275019-9b5cda994e8d?w=1600&q=80"
            alt=""
            style={{
              width: "100%",
              height: "100%",
              objectFit: "cover",
              opacity: 0.2,
            }}
          />
        </motion.div>
        <div
          style={{
            position: "absolute",
            inset: 0,
            background:
              "linear-gradient(to bottom, rgba(10,10,10,0.6) 0%, rgba(10,10,10,0.8) 50%, #0A0A0A 100%)",
          }}
        />

        {/* grid overlay */}
        <GridPattern opacity={0.025} />

        {/* accent glows */}
        <div
          style={{
            position: "absolute",
            top: "30%",
            left: "20%",
            width: "500px",
            height: "500px",
            background: `radial-gradient(ellipse, ${ACCENT}10 0%, transparent 65%)`,
            pointerEvents: "none",
            filter: "blur(40px)",
          }}
        />
        <div
          style={{
            position: "absolute",
            top: "50%",
            right: "15%",
            width: "400px",
            height: "400px",
            background: `radial-gradient(ellipse, ${ACCENT2}08 0%, transparent 65%)`,
            pointerEvents: "none",
            filter: "blur(40px)",
          }}
        />

        {/* decorative circle */}
        <svg
          style={{
            position: "absolute",
            top: "10%",
            right: "8%",
            opacity: 0.06,
            pointerEvents: "none",
          }}
          width="400"
          height="400"
          viewBox="0 0 400 400"
          fill="none"
        >
          <circle
            cx="200"
            cy="200"
            r="180"
            stroke={ACCENT}
            strokeWidth="1"
            strokeDasharray="4 8"
          />
          <circle cx="200" cy="200" r="120" stroke={ACCENT} strokeWidth="0.5" />
          <circle
            cx="200"
            cy="200"
            r="60"
            stroke={ACCENT}
            strokeWidth="0.5"
            strokeDasharray="2 4"
          />
        </svg>

        <motion.div
          style={{
            position: "relative",
            zIndex: 10,
            maxWidth: "900px",
            textAlign: "center",
            padding: "0 24px",
            y: heroY,
            opacity: heroOpacity,
          }}
        >
          <motion.div
            className="hero-badge"
            initial={{ opacity: 0, scale: 0.85 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.3 }}
          >
            Acesso antecipado
          </motion.div>
          <motion.h1
            className="font-display"
            initial={{ opacity: 0, y: 48 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9, delay: 0.4, ease: [0.22, 1, 0.36, 1] }}
            style={{
              fontSize: "clamp(38px,8vw,88px)",
              fontWeight: 900,
              lineHeight: 1.0,
              textTransform: "uppercase",
              letterSpacing: "-.03em",
              marginBottom: "24px",
            }}
          >
            DOMINE SUA
            <br />
            <motion.span
              style={{ color: "#e5e7eb" }}
              initial={{ opacity: 0, x: -24 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.7, delay: 0.6 }}
            >
              ARTE.
            </motion.span>{" "}
            DOMINE SUA
            <br />
            <motion.span
              style={{ color: ACCENT }}
              initial={{ opacity: 0, x: 24 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.7, delay: 0.75 }}
            >
              AGENDA.
            </motion.span>
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.85 }}
            style={{
              fontSize: "clamp(15px,2vw,18px)",
              color: "#6b7280",
              fontWeight: 300,
              maxWidth: "520px",
              margin: "0 auto 40px",
              lineHeight: 1.7,
            }}
          >
            Organize sua agenda, gerencie seus clientes e profissionalize seu
            atendimento — tudo em uma plataforma feita pra tatuadores.
          </motion.p>
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 1 }}
            style={{
              display: "flex",
              flexWrap: "wrap",
              gap: "12px",
              justifyContent: "center",
            }}
          >
            <Link href="/register" className="hero-cta-primary">
              Criar minha página grátis
            </Link>
            <Link href="/gus" className="hero-cta-secondary">
              Ver demonstração →
            </Link>
          </motion.div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.6 }}
          style={{
            position: "absolute",
            bottom: "40px",
            left: "50%",
            transform: "translateX(-50%)",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
          }}
        >
          <motion.div
            animate={{ scaleY: [0, 1, 0], originY: 0 }}
            transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
            style={{
              width: "1px",
              height: "48px",
              background: `linear-gradient(to bottom, transparent, ${ACCENT}60)`,
            }}
          />
        </motion.div>
      </section>

      {/* ─── MARQUEE ──────────────────────────────────────────── */}
      <div className="marquee-wrap">
        <DiagLines />
        <div className="marquee-track">
          {[...Array(2)].map((_, j) => (
            <div key={j} className="marquee-item">
              {[
                "Agendamento Online",
                "Sem No-Show",
                "Página Própria",
                "Notificações por Email",
                "Dashboard Completo",
                "Link na Bio",
                "Referência do Cliente",
                "Preços Flexíveis",
              ].map((t, i) => (
                <span key={i}>
                  {t} <span style={{ color: `${ACCENT}50` }}>✦</span>
                </span>
              ))}
            </div>
          ))}
        </div>
      </div>

      {/* ─── STATS ────────────────────────────────────────────── */}
      <section
        style={{
          padding: "80px 32px",
          borderBottom: "1px solid rgba(255,255,255,0.04)",
          position: "relative",
          overflow: "hidden",
        }}
      >
        <DotPattern />
        {/* horizontal gradient line */}
        <div
          style={{
            position: "absolute",
            top: 0,
            left: "10%",
            right: "10%",
            height: "1px",
            background: `linear-gradient(to right, transparent, ${ACCENT}30, transparent)`,
          }}
        />
        <div
          style={{
            maxWidth: "900px",
            margin: "0 auto",
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit,minmax(180px,1fr))",
            gap: "48px",
            textAlign: "center",
            position: "relative",
          }}
        >
          <StatCard num="100%" label="Grátis para começar" delay={0} />
          <StatCard num="3min" label="Para ter sua página no ar" delay={0.08} />
          <StatCard num="0" label="No-shows com confirmação" delay={0.16} />
          <StatCard num="24/7" label="Agendamentos automáticos" delay={0.24} />
        </div>
      </section>

      {/* ─── MOCKUP ───────────────────────────────────────────── */}
      <section
        style={{
          padding: "100px 24px",
          position: "relative",
          overflow: "hidden",
          background:
            "linear-gradient(180deg, #111 0%, #141414 50%, #111 100%)",
        }}
      >
        {/* big soft glow behind mockup */}
        <div
          style={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%,-50%)",
            width: "800px",
            height: "500px",
            background: `radial-gradient(ellipse, ${ACCENT}07 0%, transparent 65%)`,
            pointerEvents: "none",
            filter: "blur(60px)",
          }}
        />
        <GridPattern opacity={0.018} />
        <div
          style={{ maxWidth: "960px", margin: "0 auto", position: "relative" }}
        >
          <FadeUp>
            <div style={{ textAlign: "center", marginBottom: "60px" }}>
              <p
                className="font-display"
                style={{
                  fontSize: "10px",
                  fontWeight: 700,
                  textTransform: "uppercase",
                  letterSpacing: ".4em",
                  color: `${ACCENT}70`,
                  marginBottom: "14px",
                }}
              >
                O painel em ação
              </p>
              <h2
                className="font-display"
                style={{
                  fontSize: "clamp(24px,4vw,40px)",
                  fontWeight: 900,
                  color: "#e5e7eb",
                  textTransform: "uppercase",
                  letterSpacing: "-.02em",
                }}
              >
                Tudo que você precisa,
                <br />
                numa tela só
              </h2>
            </div>
          </FadeUp>
          <FadeUp delay={0.1}>
            <div style={{ position: "relative" }}>
              {/* frame glow */}
              <div
                style={{
                  position: "absolute",
                  inset: "-20px",
                  borderRadius: "24px",
                  background: `radial-gradient(ellipse at 50% 50%, ${ACCENT}0A 0%, transparent 70%)`,
                  pointerEvents: "none",
                }}
              />
              {/* subtle border glow */}
              <div
                style={{
                  position: "absolute",
                  inset: "-1px",
                  borderRadius: "17px",
                  background: `linear-gradient(135deg, ${ACCENT}20, transparent 50%, ${ACCENT2}15)`,
                  pointerEvents: "none",
                }}
              />
              <DashboardMockup />
            </div>
          </FadeUp>
        </div>
      </section>

      {/* ─── FEATURES ─────────────────────────────────────────── */}
      <section
        id="funcionalidades"
        style={{
          padding: "100px 24px",
          position: "relative",
          overflow: "hidden",
          background: "#0f0f0f",
        }}
      >
        <DiagLines />
        {/* corner glows */}
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            width: "400px",
            height: "400px",
            background: `radial-gradient(ellipse at 0% 0%, ${ACCENT}06 0%, transparent 70%)`,
            pointerEvents: "none",
          }}
        />
        <div
          style={{
            position: "absolute",
            bottom: 0,
            right: 0,
            width: "400px",
            height: "400px",
            background: `radial-gradient(ellipse at 100% 100%, ${ACCENT2}05 0%, transparent 70%)`,
            pointerEvents: "none",
          }}
        />

        <div
          style={{ maxWidth: "1200px", margin: "0 auto", position: "relative" }}
        >
          <FadeUp>
            <div style={{ marginBottom: "72px" }}>
              <p
                className="font-display"
                style={{
                  fontSize: "10px",
                  fontWeight: 700,
                  textTransform: "uppercase",
                  letterSpacing: ".4em",
                  color: `${ACCENT}70`,
                  marginBottom: "16px",
                }}
              >
                O sistema completo
              </p>
              <h2
                className="font-display"
                style={{
                  fontSize: "clamp(24px,4vw,40px)",
                  fontWeight: 900,
                  color: "#e5e7eb",
                  textTransform: "uppercase",
                  letterSpacing: "-.02em",
                  maxWidth: "560px",
                }}
              >
                Feito para tatuadores
                <br />
                que trabalham sério
              </h2>
            </div>
          </FadeUp>
          <div
            style={{
              display: "grid",
              gap: "12px",
              gridTemplateColumns: "repeat(auto-fit,minmax(240px,1fr))",
            }}
          >
            {[
              {
                icon: "🎛️",
                title: "Painel completo",
                desc: "Sessões do dia, próximo cliente e pendentes assim que abrir o sistema.",
                delay: 0,
                accent: false,
              },
              {
                icon: "🔗",
                title: "Página personalizada",
                desc: "tattooagenda.ink/seulink na bio. Clientes chegam, veem seus serviços e agendam.",
                delay: 0.06,
                accent: false,
              },
              {
                icon: "📅",
                title: "Slots automáticos",
                desc: "Configure horários e o sistema calcula os slots. Sem vai e vem.",
                delay: 0.12,
                accent: false,
              },
              {
                icon: "📧",
                title: "Email automático",
                desc: "Confirmação imediata pra você e pro cliente quando um agendamento chegar.",
                delay: 0.18,
                accent: false,
              },
              {
                icon: "🖼️",
                title: "Referência do cliente",
                desc: "Cliente manda a imagem de referência no agendamento. Sem procurar no DM.",
                delay: 0.24,
                accent: true,
              },
              {
                icon: "💰",
                title: "Preços flexíveis",
                desc: "Fixo, a partir de, ou sob consulta. Cada serviço do seu jeito.",
                delay: 0.3,
                accent: false,
              },
              {
                icon: "↕️",
                title: "Ordenação livre",
                desc: "Arraste e solte pra organizar seus serviços na ordem que quiser.",
                delay: 0.36,
                accent: false,
              },
              {
                icon: "📱",
                title: "WhatsApp integrado",
                desc: "Link direto pro WhatsApp em cada agendamento. Um toque pra confirmar.",
                delay: 0.42,
                accent: true,
              },
            ].map((f) => (
              <FeatureCard key={f.title} {...f} />
            ))}
          </div>
        </div>
      </section>

      {/* ─── HOW IT WORKS ─────────────────────────────────────── */}
      <section
        style={{
          padding: "100px 24px",
          position: "relative",
          overflow: "hidden",
          background: "#0A0A0A",
        }}
      >
        <DotPattern />
        {/* center glow */}
        <div
          style={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%,-50%)",
            width: "600px",
            height: "300px",
            background: `radial-gradient(ellipse, ${ACCENT}05 0%, transparent 70%)`,
            pointerEvents: "none",
          }}
        />
        {/* decorative SVG cross */}
        <svg
          style={{
            position: "absolute",
            bottom: "10%",
            left: "5%",
            opacity: 0.04,
            pointerEvents: "none",
          }}
          width="120"
          height="120"
          viewBox="0 0 120 120"
        >
          <line
            x1="60"
            y1="0"
            x2="60"
            y2="120"
            stroke={ACCENT}
            strokeWidth="1"
          />
          <line
            x1="0"
            y1="60"
            x2="120"
            y2="60"
            stroke={ACCENT}
            strokeWidth="1"
          />
          <circle
            cx="60"
            cy="60"
            r="40"
            stroke={ACCENT}
            strokeWidth="0.5"
            fill="none"
            strokeDasharray="3 6"
          />
        </svg>

        <div
          style={{ maxWidth: "800px", margin: "0 auto", position: "relative" }}
        >
          <FadeUp>
            <div style={{ textAlign: "center", marginBottom: "72px" }}>
              <p
                className="font-display"
                style={{
                  fontSize: "10px",
                  fontWeight: 700,
                  textTransform: "uppercase",
                  letterSpacing: ".4em",
                  color: `${ACCENT}70`,
                  marginBottom: "16px",
                }}
              >
                Como funciona
              </p>
              <h2
                className="font-display"
                style={{
                  fontSize: "clamp(24px,4vw,40px)",
                  fontWeight: 900,
                  color: "#e5e7eb",
                  textTransform: "uppercase",
                  letterSpacing: "-.02em",
                }}
              >
                Em 3 passos você está
                <br />
                recebendo agendamentos
              </h2>
            </div>
          </FadeUp>
          <div
            style={{ display: "flex", flexDirection: "column", gap: "12px" }}
          >
            {[
              {
                n: "01",
                title: "Crie sua conta",
                desc: "Cadastre-se em menos de 2 minutos com código de convite. Escolha seu link e configure seu perfil.",
              },
              {
                n: "02",
                title: "Configure serviços e horários",
                desc: "Adicione seus serviços com preços flexíveis e defina quais dias e horários você atende.",
              },
              {
                n: "03",
                title: "Mande o link no fechamento",
                desc: "Depois de conversar e fechar no direct, manda tattooagenda.ink/seulink. Cliente agenda sozinho.",
              },
            ].map((step, i) => (
              <FadeUp key={step.n} delay={i * 0.1}>
                <motion.div
                  className="step-card"
                  whileHover={{ x: 6 }}
                  transition={{ type: "spring", stiffness: 300 }}
                >
                  {/* accent corner */}
                  <div
                    style={{
                      position: "absolute",
                      top: 0,
                      left: 0,
                      width: "3px",
                      height: "100%",
                      background: `linear-gradient(to bottom, ${ACCENT}40, transparent)`,
                      borderRadius: "16px 0 0 16px",
                    }}
                  />
                  <span
                    className="font-display"
                    style={{
                      fontSize: "32px",
                      fontWeight: 900,
                      color: `${ACCENT}18`,
                      lineHeight: 1,
                      flexShrink: 0,
                    }}
                  >
                    {step.n}
                  </span>
                  <div>
                    <h4
                      className="font-display"
                      style={{
                        fontSize: "13px",
                        fontWeight: 700,
                        textTransform: "uppercase",
                        color: "#e5e7eb",
                        marginBottom: "8px",
                      }}
                    >
                      {step.title}
                    </h4>
                    <p
                      style={{
                        fontSize: "14px",
                        color: "#6b7280",
                        lineHeight: 1.7,
                        fontWeight: 300,
                      }}
                    >
                      {step.desc}
                    </p>
                  </div>
                </motion.div>
              </FadeUp>
            ))}
          </div>
        </div>
      </section>

      {/* ─── DEPOIMENTO ───────────────────────────────────────── */}
      <section
        style={{
          padding: "100px 24px",
          position: "relative",
          overflow: "hidden",
          background: "#0f0f0f",
        }}
      >
        <GridPattern opacity={0.02} />
        <div
          style={{
            position: "absolute",
            top: 0,
            left: "50%",
            transform: "translateX(-50%)",
            width: "100%",
            height: "1px",
            background: `linear-gradient(to right, transparent, ${ACCENT}25, transparent)`,
          }}
        />
        <div
          style={{ maxWidth: "680px", margin: "0 auto", position: "relative" }}
        >
          <FadeUp>
            <div
              style={{
                background: "#161616",
                border: "1px solid #222",
                borderRadius: "24px",
                padding: "48px",
                position: "relative",
                overflow: "hidden",
              }}
            >
              {/* top accent line */}
              <div
                style={{
                  position: "absolute",
                  top: 0,
                  left: "32px",
                  right: "32px",
                  height: "1px",
                  background: `linear-gradient(to right, transparent, ${ACCENT}35, transparent)`,
                }}
              />
              {/* big quote mark */}
              <div
                style={{
                  position: "absolute",
                  top: "-20px",
                  left: "24px",
                  fontFamily: "'Unbounded',sans-serif",
                  fontSize: "160px",
                  fontWeight: 900,
                  color: `${ACCENT}07`,
                  lineHeight: 1,
                  pointerEvents: "none",
                }}
              >
                "
              </div>
              {/* corner glow */}
              <div
                style={{
                  position: "absolute",
                  bottom: 0,
                  right: 0,
                  width: "200px",
                  height: "200px",
                  background: `radial-gradient(ellipse at 100% 100%, ${ACCENT}06 0%, transparent 70%)`,
                  pointerEvents: "none",
                }}
              />

              <p
                className="font-display"
                style={{
                  fontSize: "clamp(16px,2.5vw,22px)",
                  fontWeight: 700,
                  lineHeight: 1.35,
                  color: "#e5e7eb",
                  textTransform: "uppercase",
                  letterSpacing: "-.02em",
                  marginBottom: "36px",
                  position: "relative",
                  zIndex: 1,
                }}
              >
                "A Tattooagenda não organizou só minha agenda — ela elevou toda
                a experiência da minha marca."
              </p>
              <div
                style={{ display: "flex", alignItems: "center", gap: "16px" }}
              >
                <div
                  style={{
                    width: "48px",
                    height: "48px",
                    borderRadius: "9999px",
                    border: `1px solid ${ACCENT}30`,
                    background: "#181818",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontFamily: "'Unbounded',sans-serif",
                    fontSize: "18px",
                    color: ACCENT,
                    flexShrink: 0,
                  }}
                >
                  G
                </div>
                <div>
                  <p
                    className="font-display"
                    style={{
                      fontSize: "11px",
                      fontWeight: 700,
                      color: "#e5e7eb",
                      textTransform: "uppercase",
                      letterSpacing: ".12em",
                    }}
                  >
                    Gustavo Mendes
                  </p>
                  <p
                    style={{
                      fontSize: "10px",
                      fontWeight: 600,
                      color: `${ACCENT}55`,
                      textTransform: "uppercase",
                      letterSpacing: ".2em",
                      marginTop: "4px",
                    }}
                  >
                    Tatuador · São Paulo
                  </p>
                </div>
              </div>
            </div>
          </FadeUp>
        </div>
      </section>

      {/* ─── CTA FINAL ────────────────────────────────────────── */}
      <section
        id="precos"
        style={{
          position: "relative",
          padding: "120px 24px",
          background: "#111",
          textAlign: "center",
          overflow: "hidden",
        }}
      >
        {/* big radial glow */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            background: `radial-gradient(ellipse at 50% 100%, ${ACCENT}09 0%, transparent 60%)`,
            pointerEvents: "none",
          }}
        />
        <div
          style={{
            position: "absolute",
            inset: 0,
            background: `radial-gradient(ellipse at 50% 0%, ${ACCENT2}05 0%, transparent 50%)`,
            pointerEvents: "none",
          }}
        />
        <GridPattern opacity={0.02} />
        {/* top line */}
        <div
          style={{
            position: "absolute",
            top: 0,
            left: "15%",
            right: "15%",
            height: "1px",
            background: `linear-gradient(to right, transparent, ${ACCENT}20, transparent)`,
          }}
        />

        {/* decorative rings */}
        <svg
          style={{
            position: "absolute",
            bottom: "-10%",
            right: "-5%",
            opacity: 0.04,
            pointerEvents: "none",
          }}
          width="500"
          height="500"
          viewBox="0 0 500 500"
          fill="none"
        >
          <circle
            cx="250"
            cy="250"
            r="240"
            stroke={ACCENT}
            strokeWidth="1"
            strokeDasharray="6 10"
          />
          <circle cx="250" cy="250" r="160" stroke={ACCENT} strokeWidth="0.5" />
        </svg>

        <FadeUp>
          <p
            className="font-display"
            style={{
              fontSize: "10px",
              fontWeight: 700,
              textTransform: "uppercase",
              letterSpacing: ".4em",
              color: `${ACCENT}60`,
              marginBottom: "24px",
            }}
          >
            Comece hoje
          </p>
          <h2
            className="font-display"
            style={{
              fontSize: "clamp(32px,6vw,68px)",
              fontWeight: 900,
              textTransform: "uppercase",
              letterSpacing: "-.03em",
              color: "#e5e7eb",
              marginBottom: "24px",
              lineHeight: 1.05,
            }}
          >
            Pronto para o<br />
            próximo nível?
          </h2>
          <p
            style={{
              maxWidth: "420px",
              margin: "0 auto 48px",
              fontSize: "16px",
              fontWeight: 300,
              color: "#4b5563",
              lineHeight: 1.7,
            }}
          >
            Junte-se aos tatuadores que já transformaram sua rotina. Grátis pra
            começar, sem cartão de crédito.
          </p>
          <motion.div whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.97 }}>
            <Link href="/register" className="cta-btn-final">
              Criar minha conta grátis
            </Link>
          </motion.div>
        </FadeUp>
      </section>

      {/* ─── FOOTER ───────────────────────────────────────────── */}
      <footer
        style={{
          padding: "48px 32px",
          borderTop: "1px solid rgba(255,255,255,0.04)",
          backgroundColor: "#0D0D0D",
        }}
      >
        <div
          style={{ maxWidth: "1200px", margin: "0 auto", textAlign: "center" }}
        >
          <div
            className="font-display"
            style={{
              fontWeight: 700,
              letterSpacing: "-.02em",
              marginBottom: "20px",
              textTransform: "uppercase",
              fontSize: "15px",
              color: "#1c1c1c",
            }}
          >
            TATTOO<span style={{ color: "#222" }}>AGENDA</span>
          </div>
          <div
            style={{
              display: "flex",
              justifyContent: "center",
              gap: "28px",
              marginBottom: "24px",
            }}
          >
            <a
              href="https://www.instagram.com/gvelasco.js/"
              className="footer-link"
              target="_blank"
            >
              Instagram
            </a>
            <a href="#funcionalidades" className="footer-link">
              Funcionalidades
            </a>
          </div>
          <p
            style={{
              color: "#181818",
              fontSize: "10px",
              textTransform: "uppercase",
              letterSpacing: ".1em",
            }}
          >
            © {new Date().getFullYear()} Tattooagenda. Todos os direitos
            reservados.
          </p>
        </div>
      </footer>
    </div>
  );
}
