"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";

const ACCENT = "#818cf8";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    const supabase = createClient();
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    if (error) {
      setError("Email ou senha incorretos.");
      setLoading(false);
      return;
    }
    router.push("/dashboard");
    router.refresh();
  }

  return (
    <div
      style={{
        minHeight: "100vh",
        backgroundColor: "#0A0A0A",
        color: "white",
        display: "flex",
        flexDirection: "column",
        position: "relative",
        overflow: "hidden",
      }}
    >
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600&family=Unbounded:wght@400;700;900&display=swap');
        *, *::before, *::after { box-sizing:border-box; margin:0; padding:0; }
        body { font-family:'Inter',sans-serif; -webkit-font-smoothing:antialiased; }
        .font-display { font-family:'Unbounded',serif; }

        .field-input {
          width:100%; background:#111; border:1px solid #1f1f1f;
          color:white; font-size:14px; padding:14px 16px;
          border-radius:12px; font-family:'Inter',sans-serif;
          font-weight:300; outline:none; transition:border-color .2s, background .2s;
        }
        .field-input:focus { border-color:rgba(129,140,248,0.4); background:#141414; }
        .field-input::placeholder { color:#2a2a2a; }

        .btn-submit {
          width:100%; background:#e5e7eb; color:#0A0A0A;
          padding:14px; border-radius:9999px;
          font-size:12px; font-weight:700; text-transform:uppercase; letter-spacing:.12em;
          border:none; cursor:pointer; font-family:'Inter',sans-serif;
          transition:background .2s, transform .15s, box-shadow .2s;
        }
        .btn-submit:hover { background:white; transform:translateY(-1px); box-shadow:0 8px 24px rgba(255,255,255,0.08); }
        .btn-submit:disabled { opacity:.4; cursor:not-allowed; transform:none; box-shadow:none; }

        @keyframes float1 { 0%,100%{transform:translate(0,0) scale(1)} 50%{transform:translate(20px,-30px) scale(1.05)} }
        @keyframes float2 { 0%,100%{transform:translate(0,0) scale(1)} 50%{transform:translate(-15px,20px) scale(0.95)} }
        @keyframes float3 { 0%,100%{transform:translate(0,0)} 33%{transform:translate(10px,15px)} 66%{transform:translate(-10px,-10px)} }
        @keyframes pulse-ring { 0%{transform:scale(.8);opacity:0} 50%{opacity:.4} 100%{transform:scale(1.4);opacity:0} }
      `}</style>

      {/* ── BACKGROUND ───────────────────────────────────────────── */}
      <div
        style={{
          position: "fixed",
          top: "15%",
          right: "10%",
          width: "420px",
          height: "420px",
          borderRadius: "9999px",
          background: `radial-gradient(ellipse, ${ACCENT}12 0%, transparent 70%)`,
          pointerEvents: "none",
          animation: "float1 8s ease-in-out infinite",
          filter: "blur(40px)",
        }}
      />
      <div
        style={{
          position: "fixed",
          bottom: "10%",
          left: "5%",
          width: "320px",
          height: "320px",
          borderRadius: "9999px",
          background: `radial-gradient(ellipse, ${ACCENT}08 0%, transparent 70%)`,
          pointerEvents: "none",
          animation: "float2 11s ease-in-out infinite",
          filter: "blur(40px)",
        }}
      />

      {/* SVG círculos top-left */}
      <svg
        style={{
          position: "fixed",
          top: "5%",
          left: "5%",
          opacity: 0.04,
          pointerEvents: "none",
          animation: "float3 14s ease-in-out infinite",
        }}
        width="280"
        height="280"
        viewBox="0 0 280 280"
        fill="none"
      >
        <circle
          cx="140"
          cy="140"
          r="130"
          stroke={ACCENT}
          strokeWidth="1"
          strokeDasharray="4 8"
        />
        <circle cx="140" cy="140" r="80" stroke={ACCENT} strokeWidth="0.5" />
        <circle
          cx="140"
          cy="140"
          r="30"
          stroke={ACCENT}
          strokeWidth="0.5"
          strokeDasharray="2 4"
        />
      </svg>

      {/* SVG cruz bottom-right */}
      <svg
        style={{
          position: "fixed",
          bottom: "8%",
          right: "4%",
          opacity: 0.03,
          pointerEvents: "none",
        }}
        width="180"
        height="180"
        viewBox="0 0 180 180"
        fill="none"
      >
        <line x1="90" y1="0" x2="90" y2="180" stroke={ACCENT} strokeWidth="1" />
        <line x1="0" y1="90" x2="180" y2="90" stroke={ACCENT} strokeWidth="1" />
        <circle
          cx="90"
          cy="90"
          r="60"
          stroke={ACCENT}
          strokeWidth="0.5"
          fill="none"
          strokeDasharray="3 6"
        />
      </svg>

      {/* dot pattern */}
      <svg
        style={{
          position: "fixed",
          inset: 0,
          width: "100%",
          height: "100%",
          pointerEvents: "none",
        }}
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <pattern
            id="dots"
            width="28"
            height="28"
            patternUnits="userSpaceOnUse"
          >
            <circle cx="1" cy="1" r="0.8" fill="white" opacity="0.022" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#dots)" />
      </svg>

      {/* ── NAVBAR ───────────────────────────────────────────────── */}
      <motion.nav
        initial={{ y: -40, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "20px 32px",
          borderBottom: "1px solid rgba(255,255,255,0.04)",
          position: "relative",
          zIndex: 10,
        }}
      >
        <Link
          href="/"
          className="font-display"
          style={{
            fontWeight: 700,
            letterSpacing: "-.02em",
            textTransform: "uppercase",
            fontSize: "15px",
            textDecoration: "none",
            color: "white",
          }}
        >
          TATTOO<span style={{ color: ACCENT }}>AGENDA</span>
        </Link>
        <Link
          href="/register"
          style={{
            fontSize: "12px",
            color: "#333",
            textDecoration: "none",
            fontWeight: 500,
            transition: "color .2s",
          }}
          onMouseEnter={(e) => (e.currentTarget.style.color = ACCENT)}
          onMouseLeave={(e) => (e.currentTarget.style.color = "#333")}
        >
          Criar conta →
        </Link>
      </motion.nav>

      {/* ── MAIN ─────────────────────────────────────────────────── */}
      <div
        style={{
          flex: 1,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "40px 24px",
          position: "relative",
          zIndex: 10,
        }}
      >
        <div style={{ width: "100%", maxWidth: "400px" }}>
          {/* ÍCONE + TÍTULO */}
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{
              duration: 0.55,
              delay: 0.1,
              ease: [0.22, 1, 0.36, 1],
            }}
            style={{ marginBottom: "40px" }}
          >
            {/* ícone animado */}
            <div
              style={{
                position: "relative",
                width: "48px",
                height: "48px",
                marginBottom: "24px",
              }}
            >
              {/* pulse ring */}
              <div
                style={{
                  position: "absolute",
                  inset: 0,
                  borderRadius: "14px",
                  border: `1px solid ${ACCENT}40`,
                  animation: "pulse-ring 2.5s ease-out infinite",
                }}
              />
              <motion.div
                initial={{ scale: 0.5, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ type: "spring", stiffness: 200, delay: 0.15 }}
                style={{
                  width: "48px",
                  height: "48px",
                  borderRadius: "14px",
                  background: "#141414",
                  border: `1px solid ${ACCENT}25`,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: "20px",
                  position: "relative",
                }}
              >
                ✦
              </motion.div>
            </div>

            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "10px",
                marginBottom: "8px",
              }}
            >
              <h1
                className="font-display"
                style={{
                  fontSize: "22px",
                  fontWeight: 900,
                  textTransform: "uppercase",
                  letterSpacing: "-.02em",
                  color: "#e5e7eb",
                }}
              >
                Bem-vindo de volta
              </h1>
              <div
                style={{
                  width: "6px",
                  height: "6px",
                  borderRadius: "9999px",
                  background: ACCENT,
                  boxShadow: `0 0 8px ${ACCENT}`,
                }}
              />
            </div>
            <p
              style={{
                fontSize: "13px",
                color: "#444",
                fontWeight: 300,
                lineHeight: 1.6,
              }}
            >
              Entre no painel do seu estúdio.
            </p>
          </motion.div>

          {/* FORM */}
          <motion.form
            onSubmit={handleLogin}
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{
              duration: 0.55,
              delay: 0.2,
              ease: [0.22, 1, 0.36, 1],
            }}
          >
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: "16px",
                marginBottom: "28px",
              }}
            >
              <div>
                <label
                  style={{
                    display: "block",
                    fontSize: "11px",
                    fontWeight: 600,
                    letterSpacing: ".12em",
                    textTransform: "uppercase",
                    color: "#3a3a3a",
                    marginBottom: "10px",
                  }}
                >
                  Email
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  placeholder="seu@email.com"
                  className="field-input"
                  autoFocus
                />
              </div>
              <div>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    marginBottom: "10px",
                  }}
                >
                  <label
                    style={{
                      fontSize: "11px",
                      fontWeight: 600,
                      letterSpacing: ".12em",
                      textTransform: "uppercase",
                      color: "#3a3a3a",
                    }}
                  >
                    Senha
                  </label>
                </div>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  placeholder="••••••••"
                  className="field-input"
                />
              </div>
            </div>

            {error && (
              <motion.div
                initial={{ opacity: 0, y: -4 }}
                animate={{ opacity: 1, y: 0 }}
                style={{
                  background: "rgba(239,68,68,0.08)",
                  border: "1px solid rgba(239,68,68,0.2)",
                  borderRadius: "10px",
                  padding: "10px 14px",
                  marginBottom: "16px",
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                }}
              >
                <span style={{ fontSize: "14px" }}>⚠</span>
                <p style={{ fontSize: "13px", color: "#ef4444" }}>{error}</p>
              </motion.div>
            )}

            <button type="submit" disabled={loading} className="btn-submit">
              {loading ? "Entrando..." : "Entrar no painel"}
            </button>
          </motion.form>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            style={{
              textAlign: "center",
              marginTop: "28px",
              fontSize: "12px",
              color: "#555",
            }}
          >
            Não tem conta?{" "}
            <Link
              href="/register"
              style={{
                color: "#e5e7eb",
                textDecoration: "none",
                fontWeight: 600,
              }}
            >
              Criar com convite
            </Link>
          </motion.p>
        </div>
      </div>

      {/* FOOTER */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
        style={{
          padding: "24px 32px",
          borderTop: "1px solid rgba(255,255,255,0.03)",
          textAlign: "center",
          position: "relative",
          zIndex: 10,
        }}
      >
        <p
          className="font-display"
          style={{
            fontSize: "10px",
            fontWeight: 700,
            textTransform: "uppercase",
            letterSpacing: ".2em",
            color: "#1a1a1a",
          }}
        >
          TATTOO
          <span style={{ color: ACCENT, opacity: 0.4 }}>AGENDA</span>
        </p>
      </motion.div>
    </div>
  );
}
