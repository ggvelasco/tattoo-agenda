"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";

const STEPS = ["Perfil", "Acesso", "Convite"];
const ACCENT = "#818cf8";

export default function RegisterPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [nome, setNome] = useState("");
  const [slug, setSlug] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [convite, setConvite] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [checkingSlug, setCheckingSlug] = useState(false);

  async function nextStep() {
    setError("");
    if (step === 1) {
      if (!nome || !slug) {
        setError("Preencha todos os campos.");
        return;
      }
      setCheckingSlug(true);
      const supabase = createClient();
      const { data: slugExistente } = await supabase
        .from("profissionais")
        .select("id")
        .eq("slug", slug)
        .maybeSingle();
      setCheckingSlug(false);
      if (slugExistente) {
        setError("Esse link já está sendo usado. Escolha outro.");
        return;
      }
      setStep(2);
    } else if (step === 2) {
      if (!email || !password) {
        setError("Preencha todos os campos.");
        return;
      }
      if (password.length < 6) {
        setError("Senha deve ter no mínimo 6 caracteres.");
        return;
      }
      if (password !== confirmPassword) {
        setError("As senhas não coincidem.");
        return;
      }

      // verifica se email já existe antes de avançar
      setLoading(true);
      const supabase = createClient();
      const { data: emailExistente } = await supabase
        .from("profissionais")
        .select("id")
        .eq("email", email)
        .maybeSingle();
      setLoading(false);

      // também tenta verificar via Auth — se signUp retorna user mas sem session, email já existe
      // a checagem definitiva é no handleRegister com tratamento do erro 422
      if (emailExistente) {
        setError("Esse email já possui uma conta. Tente fazer login.");
        return;
      }

      setStep(3);
    }
  }

  async function handleRegister() {
    if (!convite) {
      setError("Insira o código de convite.");
      return;
    }
    setLoading(true);
    setError("");
    const supabase = createClient();

    const { data: conviteData } = await supabase
      .from("convites")
      .select("*")
      .eq("codigo", convite.trim().toUpperCase())
      .eq("usado", false)
      .maybeSingle();
    if (!conviteData) {
      setError("Código de convite inválido ou já utilizado.");
      setLoading(false);
      return;
    }

    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
    });

    if (authError) {
      // trata erros específicos do Supabase Auth
      if (
        authError.status === 422 ||
        authError.message?.toLowerCase().includes("already registered") ||
        authError.message?.toLowerCase().includes("user already registered")
      ) {
        setError("Esse email já possui uma conta. Faça login em vez disso.");
      } else {
        setError("Erro ao criar conta. Tente novamente.");
      }
      setLoading(false);
      return;
    }

    // Supabase às vezes retorna user sem session quando email já existe
    if (!authData.user) {
      setError("Esse email já possui uma conta. Faça login em vez disso.");
      setLoading(false);
      return;
    }

    await supabase
      .from("profissionais")
      .insert({ user_id: authData.user.id, nome, slug });
    await supabase
      .from("convites")
      .update({ usado: true, usado_por: authData.user.id })
      .eq("id", conviteData.id);

    router.push("/dashboard");
  }

  const slideVariants = {
    enter: { opacity: 0, x: 24, filter: "blur(4px)" },
    center: { opacity: 1, x: 0, filter: "blur(0px)" },
    exit: { opacity: 0, x: -24, filter: "blur(4px)" },
  };

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
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        body { font-family: 'Inter', sans-serif; -webkit-font-smoothing: antialiased; }
        .font-display { font-family: 'Unbounded', serif; }

        .field-input {
          width: 100%; background: #111; border: 1px solid #1f1f1f;
          color: white; font-size: 14px; padding: 14px 16px;
          border-radius: 12px; font-family: 'Inter', sans-serif;
          font-weight: 300; outline: none; transition: border-color .2s, background .2s;
        }
        .field-input:focus { border-color: rgba(129,140,248,0.4); background: #141414; }
        .field-input::placeholder { color: #2a2a2a; }

        .slug-prefix {
          background: #111; border: 1px solid #1f1f1f; border-right: none;
          color: #333; font-size: 12px; padding: 14px 12px;
          border-radius: 12px 0 0 12px; font-family: 'Inter', sans-serif; white-space: nowrap;
        }
        .slug-input {
          flex: 1; background: #111; border: 1px solid #1f1f1f; border-left: none;
          color: white; font-size: 14px; padding: 14px 16px 14px 0;
          border-radius: 0 12px 12px 0; font-family: 'Inter', sans-serif;
          outline: none; transition: border-color .2s;
        }
        .slug-input:focus { border-color: rgba(129,140,248,0.4); }
        .slug-input::placeholder { color: #2a2a2a; }

        .btn-primary {
          width: 100%; background: #e5e7eb; color: #0A0A0A;
          padding: 14px; border-radius: 9999px;
          font-size: 12px; font-weight: 700; text-transform: uppercase; letter-spacing: .12em;
          border: none; cursor: pointer; font-family: 'Inter', sans-serif;
          transition: background .2s, transform .15s, box-shadow .2s;
        }
        .btn-primary:hover { background: white; transform: translateY(-1px); box-shadow: 0 8px 24px rgba(255,255,255,0.08); }
        .btn-primary:disabled { opacity: .4; cursor: not-allowed; transform: none; box-shadow: none; }

        .btn-secondary {
          flex: 1; background: transparent; color: #444;
          padding: 14px; border-radius: 9999px;
          font-size: 12px; font-weight: 700; text-transform: uppercase; letter-spacing: .12em;
          border: 1px solid #1f1f1f; cursor: pointer; font-family: 'Inter', sans-serif;
          transition: all .2s;
        }
        .btn-secondary:hover { border-color: #333; color: #e5e7eb; }

        .step-dot {
          width: 28px; height: 28px; border-radius: 9999px;
          display: flex; align-items: center; justify-content: center;
          font-size: 11px; font-weight: 700; transition: all .3s ease;
        }
        .step-done   { background: #e5e7eb; color: #0A0A0A; }
        .step-active { background: #141414; color: white; border: 1.5px solid #e5e7eb; }
        .step-idle   { background: #111; color: #2a2a2a; border: 1.5px solid #1a1a1a; }

        @keyframes float1 { 0%,100%{transform:translate(0,0) scale(1)} 50%{transform:translate(20px,-30px) scale(1.05)} }
        @keyframes float2 { 0%,100%{transform:translate(0,0) scale(1)} 50%{transform:translate(-15px,20px) scale(0.95)} }
        @keyframes float3 { 0%,100%{transform:translate(0,0)} 33%{transform:translate(10px,15px)} 66%{transform:translate(-10px,-10px)} }
      `}</style>

      {/* ── BACKGROUND DECORATIVO ─────────────────────────────── */}
      {/* glows */}
      <div
        style={{
          position: "fixed",
          top: "10%",
          left: "10%",
          width: "400px",
          height: "400px",
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
          bottom: "15%",
          right: "8%",
          width: "350px",
          height: "350px",
          borderRadius: "9999px",
          background: `radial-gradient(ellipse, ${ACCENT}08 0%, transparent 70%)`,
          pointerEvents: "none",
          animation: "float2 10s ease-in-out infinite",
          filter: "blur(40px)",
        }}
      />

      {/* SVG círculos decorativos */}
      <svg
        style={{
          position: "fixed",
          top: "5%",
          right: "5%",
          opacity: 0.04,
          pointerEvents: "none",
          animation: "float3 12s ease-in-out infinite",
        }}
        width="300"
        height="300"
        viewBox="0 0 300 300"
        fill="none"
      >
        <circle
          cx="150"
          cy="150"
          r="140"
          stroke={ACCENT}
          strokeWidth="1"
          strokeDasharray="4 8"
        />
        <circle cx="150" cy="150" r="90" stroke={ACCENT} strokeWidth="0.5" />
        <circle
          cx="150"
          cy="150"
          r="40"
          stroke={ACCENT}
          strokeWidth="0.5"
          strokeDasharray="2 4"
        />
      </svg>

      <svg
        style={{
          position: "fixed",
          bottom: "10%",
          left: "3%",
          opacity: 0.03,
          pointerEvents: "none",
        }}
        width="200"
        height="200"
        viewBox="0 0 200 200"
        fill="none"
      >
        <line
          x1="100"
          y1="0"
          x2="100"
          y2="200"
          stroke={ACCENT}
          strokeWidth="1"
        />
        <line
          x1="0"
          y1="100"
          x2="200"
          y2="100"
          stroke={ACCENT}
          strokeWidth="1"
        />
        <circle
          cx="100"
          cy="100"
          r="70"
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
          opacity: 0.8,
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
            <circle cx="1" cy="1" r="0.8" fill="white" opacity="0.025" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#dots)" />
      </svg>

      {/* ── NAVBAR ────────────────────────────────────────────── */}
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
          href="/login"
          style={{
            fontSize: "12px",
            color: "#333",
            textDecoration: "none",
            fontWeight: 500,
            transition: "color .2s",
          }}
          onMouseEnter={(e) => (e.currentTarget.style.color = ACCENT)}
          onMouseLeave={(e) => (e.currentTarget.style.color = "#555")}
        >
          Já tenho conta →
        </Link>
      </motion.nav>

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
          {/* PROGRESS */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            style={{
              display: "flex",
              alignItems: "center",
              marginBottom: "40px",
            }}
          >
            {STEPS.map((label, i) => (
              <div
                key={i}
                style={{
                  display: "flex",
                  alignItems: "center",
                  flex: i < STEPS.length - 1 ? 1 : "none",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "8px",
                    flexShrink: 0,
                  }}
                >
                  <div
                    className={`step-dot ${step > i + 1 ? "step-done" : step === i + 1 ? "step-active" : "step-idle"}`}
                  >
                    {step > i + 1 ? "✓" : i + 1}
                  </div>
                  <span
                    style={{
                      fontSize: "11px",
                      color:
                        step === i + 1
                          ? "#e5e7eb"
                          : step > i + 1
                            ? "#444"
                            : "#222",
                      fontWeight: 500,
                    }}
                  >
                    {label}
                  </span>
                </div>
                {i < STEPS.length - 1 && (
                  <div
                    style={{
                      flex: 1,
                      height: "1px",
                      margin: "0 12px",
                      background:
                        step > i + 1
                          ? `linear-gradient(to right, #e5e7eb, ${ACCENT}60)`
                          : "#1a1a1a",
                      transition: "background .4s",
                    }}
                  />
                )}
              </div>
            ))}
          </motion.div>

          {/* STEPS */}
          <AnimatePresence mode="wait">
            {/* STEP 1 — PERFIL */}
            {step === 1 && (
              <motion.div
                key="step1"
                variants={slideVariants}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
              >
                <div
                  style={{
                    marginBottom: "6px",
                    display: "flex",
                    alignItems: "center",
                    gap: "10px",
                  }}
                >
                  <h1
                    className="font-display"
                    style={{
                      fontSize: "20px",
                      fontWeight: 900,
                      textTransform: "uppercase",
                      letterSpacing: "-.02em",
                      color: "#e5e7eb",
                    }}
                  >
                    Seu perfil
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
                    marginBottom: "28px",
                    fontWeight: 300,
                  }}
                >
                  Como você quer aparecer pra seus clientes?
                </p>
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
                      Nome
                    </label>
                    <input
                      type="text"
                      value={nome}
                      onChange={(e) => setNome(e.target.value)}
                      placeholder="Seu nome artístico"
                      className="field-input"
                      autoFocus
                    />
                  </div>
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
                      Seu link
                    </label>
                    <div style={{ display: "flex" }}>
                      <span className="slug-prefix">tattooagenda.ink/</span>
                      <input
                        type="text"
                        value={slug}
                        onChange={(e) =>
                          setSlug(
                            e.target.value
                              .toLowerCase()
                              .replace(/[^a-z0-9-]/g, ""),
                          )
                        }
                        placeholder="seulink"
                        className="slug-input"
                      />
                    </div>
                    {slug && (
                      <p
                        style={{
                          fontSize: "11px",
                          color: `${ACCENT}80`,
                          marginTop: "8px",
                        }}
                      >
                        tattooagenda.ink/{slug}
                      </p>
                    )}
                  </div>
                </div>
                {error && (
                  <p
                    style={{
                      fontSize: "13px",
                      color: "#ef4444",
                      marginBottom: "16px",
                    }}
                  >
                    {error}
                  </p>
                )}
                <button
                  onClick={nextStep}
                  disabled={checkingSlug}
                  className="btn-primary"
                >
                  {checkingSlug ? "Verificando..." : "Continuar →"}
                </button>
              </motion.div>
            )}

            {/* STEP 2 — ACESSO */}
            {step === 2 && (
              <motion.div
                key="step2"
                variants={slideVariants}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
              >
                <div
                  style={{
                    marginBottom: "6px",
                    display: "flex",
                    alignItems: "center",
                    gap: "10px",
                  }}
                >
                  <h1
                    className="font-display"
                    style={{
                      fontSize: "20px",
                      fontWeight: 900,
                      textTransform: "uppercase",
                      letterSpacing: "-.02em",
                      color: "#e5e7eb",
                    }}
                  >
                    Acesso
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
                    marginBottom: "28px",
                    fontWeight: 300,
                  }}
                >
                  Seus dados de login.
                </p>
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
                      placeholder="seu@email.com"
                      className="field-input"
                      autoFocus
                    />
                  </div>
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
                      Senha
                    </label>
                    <input
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Mínimo 6 caracteres"
                      className="field-input"
                    />
                  </div>
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
                      Confirmar senha
                    </label>
                    <input
                      type="password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="Repita a senha"
                      className="field-input"
                    />
                    {confirmPassword && password !== confirmPassword && (
                      <p
                        style={{
                          fontSize: "12px",
                          color: "#ef4444",
                          marginTop: "8px",
                        }}
                      >
                        As senhas não coincidem
                      </p>
                    )}
                    {confirmPassword && password === confirmPassword && (
                      <p
                        style={{
                          fontSize: "12px",
                          color: `${ACCENT}`,
                          marginTop: "8px",
                        }}
                      >
                        ✓ Senhas coincidem
                      </p>
                    )}
                  </div>
                </div>
                {error && (
                  <p
                    style={{
                      fontSize: "13px",
                      color: "#ef4444",
                      marginBottom: "16px",
                    }}
                  >
                    {error}
                  </p>
                )}
                <div style={{ display: "flex", gap: "10px" }}>
                  <button onClick={() => setStep(1)} className="btn-secondary">
                    Voltar
                  </button>
                  <button
                    onClick={nextStep}
                    disabled={loading}
                    className="btn-primary"
                    style={{ flex: 2 }}
                  >
                    {loading ? "Verificando..." : "Continuar →"}
                  </button>
                </div>
              </motion.div>
            )}

            {/* STEP 3 — CONVITE */}
            {step === 3 && (
              <motion.div
                key="step3"
                variants={slideVariants}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
              >
                <div
                  style={{
                    marginBottom: "6px",
                    display: "flex",
                    alignItems: "center",
                    gap: "10px",
                  }}
                >
                  <h1
                    className="font-display"
                    style={{
                      fontSize: "20px",
                      fontWeight: 900,
                      textTransform: "uppercase",
                      letterSpacing: "-.02em",
                      color: "#e5e7eb",
                    }}
                  >
                    Convite
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
                    marginBottom: "28px",
                    fontWeight: 300,
                  }}
                >
                  O Tattooagenda está em acesso antecipado. Insira seu código.
                </p>

                {/* badge acesso antecipado */}
                <div
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "8px",
                    borderRadius: "9999px",
                    border: `1px solid ${ACCENT}25`,
                    background: `${ACCENT}08`,
                    padding: "6px 14px",
                    marginBottom: "24px",
                  }}
                >
                  <div
                    style={{
                      width: "5px",
                      height: "5px",
                      borderRadius: "9999px",
                      background: ACCENT,
                      boxShadow: `0 0 6px ${ACCENT}`,
                    }}
                  />
                  <span
                    style={{
                      fontSize: "10px",
                      fontWeight: 700,
                      textTransform: "uppercase",
                      letterSpacing: ".2em",
                      color: `${ACCENT}`,
                    }}
                  >
                    Acesso antecipado
                  </span>
                </div>

                <div style={{ marginBottom: "28px" }}>
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
                    Código de convite
                  </label>
                  <input
                    type="text"
                    value={convite}
                    onChange={(e) => setConvite(e.target.value)}
                    placeholder="XXXXXXXX"
                    className="field-input"
                    autoFocus
                    style={{
                      textTransform: "uppercase",
                      letterSpacing: ".2em",
                      fontSize: "16px",
                      fontWeight: 600,
                      textAlign: "center",
                    }}
                  />
                </div>
                {error && (
                  <p
                    style={{
                      fontSize: "13px",
                      color: "#ef4444",
                      marginBottom: "16px",
                    }}
                  >
                    {error}
                  </p>
                )}
                <div style={{ display: "flex", gap: "10px" }}>
                  <button onClick={() => setStep(2)} className="btn-secondary">
                    Voltar
                  </button>
                  <button
                    onClick={handleRegister}
                    disabled={loading}
                    className="btn-primary"
                    style={{ flex: 2 }}
                  >
                    {loading ? "Criando conta..." : "Criar conta →"}
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <p
            style={{
              textAlign: "center",
              marginTop: "28px",
              fontSize: "12px",
              color: "#222",
            }}
          >
            Já tem conta?{" "}
            <Link
              href="/login"
              style={{
                color: "#e5e7eb",
                textDecoration: "none",
                fontWeight: 600,
              }}
            >
              Entrar
            </Link>
          </p>
        </div>
      </div>

      <div
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
          TATTOOAGENDA
        </p>
      </div>
    </div>
  );
}
