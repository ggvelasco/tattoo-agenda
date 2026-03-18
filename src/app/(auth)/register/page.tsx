"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";

export default function RegisterPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [nome, setNome] = useState("");
  const [slug, setSlug] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [convite, setConvite] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [checkingSlug, setCheckingSlug] = useState(false);
  const [confirmPassword, setConfirmPassword] = useState("");

  const totalSteps = 3;

  async function handleRegister() {
    setLoading(true);
    setError("");

    const supabase = createClient();

    const { data: conviteData, error: conviteError } = await supabase
      .from("convites")
      .select("id, usado")
      .eq("codigo", convite)
      .single();

    if (conviteError || !conviteData) {
      setError("Código de convite inválido.");
      setLoading(false);
      return;
    }

    if (conviteData.usado) {
      setError("Este código de convite já foi utilizado.");
      setLoading(false);
      return;
    }

    const { data, error: authError } = await supabase.auth.signUp({
      email,
      password,
    });

    if (authError || !data.user) {
      setError("Erro ao criar conta. Tente novamente.");
      setLoading(false);
      return;
    }

    const { error: profileError } = await supabase
      .from("profissionais")
      .insert({ user_id: data.user.id, nome, slug, email });

    if (profileError) {
      setError("Erro ao criar perfil. Tente novamente.");
      setLoading(false);
      return;
    }

    await supabase
      .from("convites")
      .update({ usado: true, usado_por: data.user.id })
      .eq("id", conviteData.id);

    router.push("/dashboard");
    router.refresh();
  }

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
        setError("Esse usuário já está sendo usado. Escolha outro.");
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
    } else {
      if (!convite) {
        setError("Digite o código de convite.");
        return;
      }
      await handleRegister();
    }
  }

  const stepVariants = {
    enter: { opacity: 0, x: 32 },
    center: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: -32 },
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        backgroundColor: "#0A0A0A",
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

        .register-input {
          width: 100%;
          background: #111;
          border: 1px solid rgba(255,255,255,0.08);
          color: white;
          font-size: 15px;
          padding: 14px 16px;
          border-radius: 12px;
          font-family: 'Inter', sans-serif;
          font-weight: 300;
          outline: none;
          transition: border-color .2s, box-shadow .2s;
        }
        .register-input:focus {
          border-color: rgba(197,160,89,0.5);
          box-shadow: 0 0 0 3px rgba(197,160,89,0.06);
        }
        .register-input::placeholder { color: #333; }

        .slug-input-wrap {
          display: flex;
          align-items: center;
          background: #111;
          border: 1px solid rgba(255,255,255,0.08);
          border-radius: 12px;
          overflow: hidden;
          transition: border-color .2s, box-shadow .2s;
        }
        .slug-input-wrap:focus-within {
          border-color: rgba(197,160,89,0.5);
          box-shadow: 0 0 0 3px rgba(197,160,89,0.06);
        }
        .slug-prefix {
          padding: 14px 12px 14px 16px;
          font-size: 13px;
          color: #444;
          white-space: nowrap;
          font-family: 'Inter', sans-serif;
          border-right: 1px solid rgba(255,255,255,0.06);
        }
        .slug-field {
          flex: 1;
          background: transparent;
          border: none;
          color: white;
          font-size: 15px;
          padding: 14px 16px;
          font-family: 'Inter', sans-serif;
          outline: none;
        }
        .slug-field::placeholder { color: #333; }

        .btn-next {
          width: 100%;
          background: #C5A059;
          color: #0A0A0A;
          padding: 16px;
          border-radius: 9999px;
          font-size: 12px;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: .12em;
          border: none;
          cursor: pointer;
          font-family: 'Inter', sans-serif;
          transition: background .2s, transform .15s, box-shadow .2s;
        }
        .btn-next:hover { background: white; transform: translateY(-1px); box-shadow: 0 8px 24px rgba(197,160,89,0.25); }
        .btn-next:disabled { opacity: .4; cursor: not-allowed; transform: none; box-shadow: none; }

        .btn-back {
          background: transparent;
          color: #555;
          padding: 14px;
          border-radius: 9999px;
          font-size: 12px;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: .12em;
          border: 1px solid #222;
          cursor: pointer;
          font-family: 'Inter', sans-serif;
          transition: border-color .2s, color .2s;
        }
        .btn-back:hover { border-color: #444; color: white; }

        .convite-input {
          width: 100%;
          background: #111;
          border: 1px solid rgba(197,160,89,0.15);
          color: #C5A059;
          font-size: 18px;
          font-weight: 700;
          padding: 18px 20px;
          border-radius: 12px;
          font-family: 'Unbounded', serif;
          letter-spacing: .1em;
          text-transform: uppercase;
          text-align: center;
          outline: none;
          transition: border-color .2s, box-shadow .2s;
        }
        .convite-input:focus {
          border-color: rgba(197,160,89,0.5);
          box-shadow: 0 0 0 3px rgba(197,160,89,0.06);
        }
        .convite-input::placeholder { color: #2a2a2a; font-size: 14px; letter-spacing: .05em; }
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
          borderBottom: "1px solid rgba(255,255,255,0.05)",
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
          TATTOO<span style={{ color: "#C5A059" }}>AGENDA</span>
        </Link>
        <Link
          href="/login"
          style={{
            fontSize: "12px",
            color: "#555",
            textDecoration: "none",
            fontWeight: 600,
            letterSpacing: ".08em",
            transition: "color .2s",
          }}
          onMouseEnter={(e) => (e.currentTarget.style.color = "white")}
          onMouseLeave={(e) => (e.currentTarget.style.color = "#555")}
        >
          Já tenho conta →
        </Link>
      </motion.nav>

      {/* MAIN */}
      <div
        style={{
          flex: 1,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "40px 24px",
        }}
      >
        <div style={{ width: "100%", maxWidth: "420px" }}>
          {/* PROGRESS */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            style={{ marginBottom: "40px" }}
          >
            <div style={{ display: "flex", gap: "6px", marginBottom: "16px" }}>
              {Array.from({ length: totalSteps }).map((_, i) => (
                <motion.div
                  key={i}
                  animate={{
                    background: i < step ? "#C5A059" : "rgba(255,255,255,0.06)",
                  }}
                  transition={{ duration: 0.4 }}
                  style={{ flex: 1, height: "3px", borderRadius: "9999px" }}
                />
              ))}
            </div>
            <p
              style={{
                fontSize: "11px",
                color: "#444",
                letterSpacing: ".1em",
                textTransform: "uppercase",
                fontWeight: 600,
              }}
            >
              Passo {step} de {totalSteps}
            </p>
          </motion.div>

          {/* STEPS */}
          <AnimatePresence mode="wait">
            {/* STEP 1 — IDENTIDADE */}
            {step === 1 && (
              <motion.div
                key="step1"
                variants={stepVariants}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
              >
                <div style={{ marginBottom: "32px" }}>
                  <h1
                    className="font-display"
                    style={{
                      fontSize: "24px",
                      fontWeight: 900,
                      textTransform: "uppercase",
                      letterSpacing: "-.02em",
                      marginBottom: "8px",
                    }}
                  >
                    Sua identidade
                  </h1>
                  <p
                    style={{
                      fontSize: "14px",
                      color: "#555",
                      fontWeight: 300,
                      lineHeight: 1.6,
                    }}
                  >
                    Como você quer ser conhecido na plataforma?
                  </p>
                </div>

                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: "20px",
                    marginBottom: "32px",
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
                        color: "#555",
                        marginBottom: "10px",
                      }}
                    >
                      Seu nome artístico
                    </label>
                    <input
                      type="text"
                      value={nome}
                      onChange={(e) => setNome(e.target.value)}
                      placeholder="Ex: Higo Ramos"
                      className="register-input"
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
                        color: "#555",
                        marginBottom: "10px",
                      }}
                    >
                      Seu link personalizado
                    </label>
                    <div className="slug-input-wrap">
                      <span className="slug-prefix">tattooagenda.ink/</span>
                      <input
                        type="text"
                        value={slug}
                        onChange={(e) =>
                          setSlug(
                            e.target.value
                              .toLowerCase()
                              .replace(/[^a-z0-9]/g, ""),
                          )
                        }
                        placeholder="user"
                        className="slug-field"
                      />
                    </div>
                    {slug && (
                      <motion.p
                        initial={{ opacity: 0, y: -4 }}
                        animate={{ opacity: 1, y: 0 }}
                        style={{
                          fontSize: "12px",
                          color: "#C5A059",
                          marginTop: "8px",
                          fontWeight: 400,
                        }}
                      >
                        ✦ tattooagenda.ink/{slug}
                      </motion.p>
                    )}
                  </div>
                </div>

                {error && (
                  <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    style={{
                      fontSize: "13px",
                      color: "#ef4444",
                      marginBottom: "16px",
                    }}
                  >
                    {error}
                  </motion.p>
                )}

                <button
                  onClick={nextStep}
                  disabled={checkingSlug}
                  className="btn-next"
                >
                  {checkingSlug ? "Verificando..." : "Continuar →"}
                </button>
              </motion.div>
            )}

            {/* STEP 2 — ACESSO */}
            {step === 2 && (
              <motion.div
                key="step2"
                variants={stepVariants}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
              >
                <div style={{ marginBottom: "32px" }}>
                  <h1
                    className="font-display"
                    style={{
                      fontSize: "24px",
                      fontWeight: 900,
                      textTransform: "uppercase",
                      letterSpacing: "-.02em",
                      marginBottom: "8px",
                    }}
                  >
                    Seu acesso
                  </h1>
                  <p
                    style={{
                      fontSize: "14px",
                      color: "#555",
                      fontWeight: 300,
                      lineHeight: 1.6,
                    }}
                  >
                    Email e senha para entrar no painel.
                  </p>
                </div>

                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: "20px",
                    marginBottom: "32px",
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
                        color: "#555",
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
                      className="register-input"
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
                        color: "#555",
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
                      className="register-input"
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
                        color: "#555",
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
                      className="register-input"
                    />
                    {confirmPassword && password !== confirmPassword && (
                      <motion.p
                        initial={{ opacity: 0, y: -4 }}
                        animate={{ opacity: 1, y: 0 }}
                        style={{
                          fontSize: "12px",
                          color: "#ef4444",
                          marginTop: "8px",
                        }}
                      >
                        As senhas não coincidem
                      </motion.p>
                    )}
                    {confirmPassword && password === confirmPassword && (
                      <motion.p
                        initial={{ opacity: 0, y: -4 }}
                        animate={{ opacity: 1, y: 0 }}
                        style={{
                          fontSize: "12px",
                          color: "#C5A059",
                          marginTop: "8px",
                        }}
                      >
                        ✓ Senhas coincidem
                      </motion.p>
                    )}
                  </div>
                </div>

                {error && (
                  <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    style={{
                      fontSize: "13px",
                      color: "#ef4444",
                      marginBottom: "16px",
                    }}
                  >
                    {error}
                  </motion.p>
                )}

                <div style={{ display: "flex", gap: "12px" }}>
                  <button onClick={() => setStep(1)} className="btn-back">
                    ← Voltar
                  </button>
                  <button onClick={nextStep} className="btn-next">
                    Continuar →
                  </button>
                </div>
              </motion.div>
            )}

            {/* STEP 3 — CONVITE */}
            {step === 3 && (
              <motion.div
                key="step3"
                variants={stepVariants}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
              >
                <div style={{ marginBottom: "32px" }}>
                  <motion.div
                    initial={{ scale: 0.5, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ type: "spring", stiffness: 200, delay: 0.1 }}
                    style={{
                      width: "56px",
                      height: "56px",
                      borderRadius: "16px",
                      background: "rgba(197,160,89,0.1)",
                      border: "1px solid rgba(197,160,89,0.2)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      marginBottom: "20px",
                      fontSize: "24px",
                    }}
                  >
                    🔑
                  </motion.div>
                  <h1
                    className="font-display"
                    style={{
                      fontSize: "24px",
                      fontWeight: 900,
                      textTransform: "uppercase",
                      letterSpacing: "-.02em",
                      marginBottom: "8px",
                    }}
                  >
                    Código de convite
                  </h1>
                  <p
                    style={{
                      fontSize: "14px",
                      color: "#555",
                      fontWeight: 300,
                      lineHeight: 1.6,
                    }}
                  >
                    A Tattooagenda está em acesso antecipado. Digite seu código
                    exclusivo para entrar.
                  </p>
                </div>

                <div style={{ marginBottom: "32px" }}>
                  <input
                    type="text"
                    value={convite}
                    onChange={(e) => setConvite(e.target.value.toUpperCase())}
                    placeholder="SEU CÓDIGO AQUI"
                    className="convite-input"
                    autoFocus
                    maxLength={20}
                  />
                  <p
                    style={{
                      fontSize: "12px",
                      color: "#333",
                      marginTop: "10px",
                      textAlign: "center",
                      fontWeight: 300,
                    }}
                  >
                    Não tem um código? Entre em contato pelo Instagram.
                  </p>
                </div>

                {error && (
                  <motion.p
                    initial={{ opacity: 0, y: -4 }}
                    animate={{ opacity: 1, y: 0 }}
                    style={{
                      fontSize: "13px",
                      color: "#ef4444",
                      marginBottom: "16px",
                      textAlign: "center",
                    }}
                  >
                    {error}
                  </motion.p>
                )}

                <div style={{ display: "flex", gap: "12px" }}>
                  <button onClick={() => setStep(2)} className="btn-back">
                    ← Voltar
                  </button>
                  <button
                    onClick={nextStep}
                    disabled={loading}
                    className="btn-next"
                  >
                    {loading ? "Criando conta..." : "Criar conta ✦"}
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* FOOTER DO FORM */}
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            style={{
              textAlign: "center",
              marginTop: "32px",
              fontSize: "12px",
              color: "#333",
            }}
          >
            Já tem conta?{" "}
            <Link
              href="/login"
              style={{
                color: "#C5A059",
                textDecoration: "none",
                fontWeight: 600,
              }}
            >
              Entrar
            </Link>
          </motion.p>
        </div>
      </div>
    </div>
  );
}
