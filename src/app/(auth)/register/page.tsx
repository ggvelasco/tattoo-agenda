"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";

const STEPS = ["Perfil", "Acesso", "Convite"];

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
    if (authError || !authData.user) {
      setError("Erro ao criar conta. Tente novamente.");
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

  return (
    <div
      style={{
        minHeight: "100vh",
        backgroundColor: "#0D0D0D",
        color: "white",
        display: "flex",
        flexDirection: "column",
      }}
    >
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600&family=Unbounded:wght@400;700;900&display=swap');
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        body { font-family: 'Inter', sans-serif; -webkit-font-smoothing: antialiased; }
        .font-display { font-family: 'Unbounded', serif; }

        .field-input {
          width: 100%;
          background: #111;
          border: 1px solid #1f1f1f;
          color: white;
          font-size: 14px;
          padding: 14px 16px;
          border-radius: 10px;
          font-family: 'Inter', sans-serif;
          font-weight: 300;
          outline: none;
          transition: border-color .2s;
        }
        .field-input:focus { border-color: rgba(255,255,255,0.2); }
        .field-input::placeholder { color: #333; }

        .slug-prefix {
          background: #111;
          border: 1px solid #1f1f1f;
          border-right: none;
          color: #444;
          font-size: 13px;
          padding: 14px 12px;
          border-radius: 10px 0 0 10px;
          font-family: 'Inter', sans-serif;
          white-space: nowrap;
        }
        .slug-input {
          flex: 1;
          background: #111;
          border: 1px solid #1f1f1f;
          border-left: none;
          color: white;
          font-size: 14px;
          padding: 14px 16px 14px 0;
          border-radius: 0 10px 10px 0;
          font-family: 'Inter', sans-serif;
          outline: none;
          transition: border-color .2s;
        }
        .slug-input:focus { border-color: rgba(255,255,255,0.2); }
        .slug-input::placeholder { color: #333; }

        .btn-primary {
          width: 100%;
          background: #EBEBEB;
          color: #0D0D0D;
          padding: 14px;
          border-radius: 9999px;
          font-size: 12px;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: .12em;
          border: none;
          cursor: pointer;
          font-family: 'Inter', sans-serif;
          transition: background .2s, transform .15s;
        }
        .btn-primary:hover { background: white; transform: translateY(-1px); }
        .btn-primary:disabled { opacity: .4; cursor: not-allowed; transform: none; }

        .step-dot {
          width: 28px; height: 28px; border-radius: 9999px;
          display: flex; align-items: center; justify-content: center;
          font-size: 11px; font-weight: 700;
          transition: all .3s ease;
        }
        .step-done { background: #EBEBEB; color: #0D0D0D; }
        .step-active { background: #1A1A1A; color: white; border: 2px solid #EBEBEB; }
        .step-idle { background: #111; color: #333; border: 2px solid #1f1f1f; }
      `}</style>

      {/* NAVBAR */}
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
          TATTOO<span style={{ color: "#EBEBEB", opacity: 0.5 }}>AGENDA</span>
        </Link>
        <Link
          href="/login"
          style={{
            fontSize: "12px",
            color: "#444",
            textDecoration: "none",
            fontWeight: 500,
            transition: "color .2s",
          }}
          onMouseEnter={(e) => (e.currentTarget.style.color = "#EBEBEB")}
          onMouseLeave={(e) => (e.currentTarget.style.color = "#444")}
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
                          ? "#EBEBEB"
                          : step > i + 1
                            ? "#444"
                            : "#2a2a2a",
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
                      background: step > i + 1 ? "#EBEBEB" : "#1f1f1f",
                      transition: "background .4s",
                    }}
                  />
                )}
              </div>
            ))}
          </motion.div>

          {/* STEP 1 */}
          {step === 1 && (
            <motion.div
              key="step1"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.35 }}
            >
              <h1
                className="font-display"
                style={{
                  fontSize: "20px",
                  fontWeight: 900,
                  textTransform: "uppercase",
                  letterSpacing: "-.02em",
                  marginBottom: "6px",
                  color: "#EBEBEB",
                }}
              >
                Seu perfil
              </h1>
              <p
                style={{
                  fontSize: "13px",
                  color: "#555",
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
                      color: "#444",
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
                      color: "#444",
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

          {/* STEP 2 */}
          {step === 2 && (
            <motion.div
              key="step2"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.35 }}
            >
              <h1
                className="font-display"
                style={{
                  fontSize: "20px",
                  fontWeight: 900,
                  textTransform: "uppercase",
                  letterSpacing: "-.02em",
                  marginBottom: "6px",
                  color: "#EBEBEB",
                }}
              >
                Acesso
              </h1>
              <p
                style={{
                  fontSize: "13px",
                  color: "#555",
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
                      color: "#444",
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
                      color: "#444",
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
                      color: "#444",
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
                        color: "#EBEBEB",
                        marginTop: "8px",
                        opacity: 0.5,
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
                <button
                  onClick={() => setStep(1)}
                  style={{
                    flex: 1,
                    background: "transparent",
                    color: "#555",
                    padding: "14px",
                    borderRadius: "9999px",
                    fontSize: "12px",
                    fontWeight: 700,
                    textTransform: "uppercase",
                    letterSpacing: ".12em",
                    border: "1px solid #1f1f1f",
                    cursor: "pointer",
                    transition: "all .2s",
                    fontFamily: "'Inter', sans-serif",
                  }}
                >
                  Voltar
                </button>
                <button
                  onClick={nextStep}
                  className="btn-primary"
                  style={{ flex: 2 }}
                >
                  Continuar →
                </button>
              </div>
            </motion.div>
          )}

          {/* STEP 3 */}
          {step === 3 && (
            <motion.div
              key="step3"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.35 }}
            >
              <h1
                className="font-display"
                style={{
                  fontSize: "20px",
                  fontWeight: 900,
                  textTransform: "uppercase",
                  letterSpacing: "-.02em",
                  marginBottom: "6px",
                  color: "#EBEBEB",
                }}
              >
                Convite
              </h1>
              <p
                style={{
                  fontSize: "13px",
                  color: "#555",
                  marginBottom: "28px",
                  fontWeight: 300,
                }}
              >
                O Tattooagenda está em acesso antecipado. Insira seu código.
              </p>
              <div style={{ marginBottom: "28px" }}>
                <label
                  style={{
                    display: "block",
                    fontSize: "11px",
                    fontWeight: 600,
                    letterSpacing: ".12em",
                    textTransform: "uppercase",
                    color: "#444",
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
                    letterSpacing: ".15em",
                    fontSize: "16px",
                    fontWeight: 600,
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
                <button
                  onClick={() => setStep(2)}
                  style={{
                    flex: 1,
                    background: "transparent",
                    color: "#555",
                    padding: "14px",
                    borderRadius: "9999px",
                    fontSize: "12px",
                    fontWeight: 700,
                    textTransform: "uppercase",
                    letterSpacing: ".12em",
                    border: "1px solid #1f1f1f",
                    cursor: "pointer",
                    transition: "all .2s",
                    fontFamily: "'Inter', sans-serif",
                  }}
                >
                  Voltar
                </button>
                <button
                  onClick={handleRegister}
                  disabled={loading}
                  className="btn-primary"
                  style={{ flex: 2 }}
                >
                  {loading ? "Criando..." : "Criar conta"}
                </button>
              </div>
            </motion.div>
          )}

          <p
            style={{
              textAlign: "center",
              marginTop: "28px",
              fontSize: "12px",
              color: "#333",
            }}
          >
            Já tem conta?{" "}
            <Link
              href="/login"
              style={{
                color: "#EBEBEB",
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
