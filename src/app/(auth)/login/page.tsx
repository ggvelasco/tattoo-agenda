"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";

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

        .btn-submit {
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
        .btn-submit:hover { background: white; transform: translateY(-1px); }
        .btn-submit:disabled { opacity: .4; cursor: not-allowed; transform: none; }
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
          href="/register"
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
          Criar conta →
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
        <div style={{ width: "100%", maxWidth: "400px" }}>
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
            <motion.div
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ type: "spring", stiffness: 200, delay: 0.15 }}
              style={{
                width: "44px",
                height: "44px",
                borderRadius: "12px",
                background: "#1a1a1a",
                border: "1px solid #2a2a2a",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                marginBottom: "20px",
                fontSize: "18px",
              }}
            >
              ✦
            </motion.div>
            <h1
              className="font-display"
              style={{
                fontSize: "22px",
                fontWeight: 900,
                textTransform: "uppercase",
                letterSpacing: "-.02em",
                marginBottom: "8px",
                color: "#EBEBEB",
              }}
            >
              Bem-vindo de volta
            </h1>
            <p
              style={{
                fontSize: "13px",
                color: "#555",
                fontWeight: 300,
                lineHeight: 1.6,
              }}
            >
              Entre no painel do seu estúdio.
            </p>
          </motion.div>

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
                  required
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
                  required
                  placeholder="••••••••"
                  className="field-input"
                />
              </div>
            </div>

            {error && (
              <motion.p
                initial={{ opacity: 0, y: -4 }}
                animate={{ opacity: 1, y: 0 }}
                style={{
                  fontSize: "13px",
                  color: "#ef4444",
                  marginBottom: "16px",
                }}
              >
                {error}
              </motion.p>
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
              color: "#333",
            }}
          >
            Não tem conta?{" "}
            <Link
              href="/register"
              style={{
                color: "#EBEBEB",
                textDecoration: "none",
                fontWeight: 600,
              }}
            >
              Criar com convite
            </Link>
          </motion.p>
        </div>
      </div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
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
      </motion.div>
    </div>
  );
}
