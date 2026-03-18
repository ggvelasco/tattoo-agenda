"use client";

import Link from "next/link";
import { motion, useScroll, useTransform, useInView } from "framer-motion";
import { useRef } from "react";

function FadeUp({
  children,
  delay = 0,
}: {
  children: React.ReactNode;
  delay?: number;
}) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });
  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 32 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.65, delay, ease: [0.22, 1, 0.36, 1] }}
    >
      {children}
    </motion.div>
  );
}

function FeatureCard({
  icon,
  title,
  desc,
  delay,
}: {
  icon: string;
  title: string;
  desc: string;
  delay: number;
}) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-60px" });
  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 40 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.6, delay, ease: [0.22, 1, 0.36, 1] }}
      whileHover={{
        y: -6,
        borderColor: "rgba(197,160,89,0.45)",
        boxShadow: "0 20px 48px rgba(0,0,0,0.5)",
      }}
      style={{
        borderRadius: "20px",
        border: "1px solid rgba(255,255,255,0.06)",
        background: "#111",
        padding: "36px",
        transition: "border-color 0.3s, box-shadow 0.3s",
        cursor: "default",
      }}
    >
      <motion.div
        whileHover={{ scale: 1.12, rotate: 3 }}
        transition={{ type: "spring", stiffness: 300 }}
        style={{
          width: "52px",
          height: "52px",
          borderRadius: "14px",
          background: "rgba(197,160,89,0.1)",
          color: "#C5A059",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          marginBottom: "20px",
          fontSize: "24px",
        }}
      >
        <span className="material-symbols-outlined">{icon}</span>
      </motion.div>
      <h4
        style={{
          fontFamily: "'Unbounded',serif",
          fontSize: "12px",
          fontWeight: 700,
          textTransform: "uppercase",
          letterSpacing: ".05em",
          color: "white",
          marginBottom: "10px",
        }}
      >
        {title}
      </h4>
      <p
        style={{
          fontSize: "13px",
          color: "#6b7280",
          lineHeight: "1.75",
          fontWeight: 300,
        }}
      >
        {desc}
      </p>
    </motion.div>
  );
}

export default function HomePage() {
  const heroRef = useRef(null);
  const { scrollYProgress } = useScroll({
    target: heroRef,
    offset: ["start start", "end start"],
  });
  const heroY = useTransform(scrollYProgress, [0, 1], ["0%", "25%"]);
  const heroOpacity = useTransform(scrollYProgress, [0, 0.7], [1, 0]);
  const imgScale = useTransform(scrollYProgress, [0, 1], [1, 1.12]);

  return (
    <div
      style={{
        backgroundColor: "#0A0A0A",
        minHeight: "100vh",
        color: "white",
        overflowX: "hidden",
      }}
    >
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600&family=Unbounded:wght@400;700;900&display=swap');
        @import url('https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@400,0&display=swap');
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        html { scroll-behavior: smooth; }
        body { font-family: 'Inter', sans-serif; -webkit-font-smoothing: antialiased; }
        .font-display { font-family: 'Unbounded', serif; }

        /* HEADER */
        .site-header {
          position: fixed; top: 0; left: 0; right: 0; z-index: 100;
          border-bottom: 1px solid rgba(255,255,255,0.05);
          background: rgba(10,10,10,0.8); backdrop-filter: blur(16px);
          padding: 18px 32px;
        }
        .header-inner { max-width: 1200px; margin: 0 auto; display: flex; align-items: center; justify-content: space-between; }
        .nav-link { font-size: 10px; font-weight: 600; text-transform: uppercase; letter-spacing: .15em; color: #6b7280; text-decoration: none; transition: color .2s; }
        .nav-link:hover { color: #C5A059; }

        .btn-ghost { font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: .12em; color: #9ca3af; text-decoration: none; transition: color .2s; }
        .btn-ghost:hover { color: white; }

        .btn-gold {
          background: #C5A059; color: #0A0A0A;
          padding: 10px 24px; border-radius: 9999px;
          font-size: 11px; font-weight: 700;
          text-transform: uppercase; letter-spacing: .12em;
          text-decoration: none; font-family: 'Inter', sans-serif;
          transition: background .2s, transform .15s, box-shadow .2s;
          display: inline-block;
        }
        .btn-gold:hover { background: white; transform: scale(1.04); box-shadow: 0 0 24px rgba(197,160,89,0.3); }

        /* HERO */
        .hero-badge {
          display: inline-flex; align-items: center; gap: 8px;
          border-radius: 9999px; border: 1px solid rgba(197,160,89,0.25);
          background: rgba(197,160,89,0.08);
          padding: 6px 18px; margin-bottom: 28px;
          font-size: 10px; font-weight: 700; text-transform: uppercase; letter-spacing: .2em; color: #C5A059;
        }
        .hero-badge::before { content:''; width:6px; height:6px; border-radius:9999px; background:#C5A059; display:inline-block; animation: pulse-dot 2s ease-in-out infinite; }
        @keyframes pulse-dot { 0%,100%{opacity:1;transform:scale(1)} 50%{opacity:.5;transform:scale(0.7)} }

        .hero-cta-primary {
          background: #C5A059; color: #0A0A0A;
          padding: 18px 40px; border-radius: 9999px;
          font-size: 12px; font-weight: 700; text-transform: uppercase; letter-spacing: .12em;
          text-decoration: none; font-family: 'Inter', sans-serif;
          display: inline-block; transition: background .2s, transform .15s, box-shadow .2s;
        }
        .hero-cta-primary:hover { background: white; transform: translateY(-2px); box-shadow: 0 12px 32px rgba(197,160,89,0.3); }

        .hero-cta-secondary {
          background: rgba(255,255,255,0.05); color: white;
          padding: 18px 40px; border-radius: 9999px;
          font-size: 12px; font-weight: 700; text-transform: uppercase; letter-spacing: .12em;
          text-decoration: none; font-family: 'Inter', sans-serif;
          border: 1px solid rgba(255,255,255,0.12); display: inline-block;
          transition: background .2s, border-color .2s;
        }
        .hero-cta-secondary:hover { background: rgba(255,255,255,0.1); border-color: rgba(255,255,255,0.2); }

        /* MARQUEE */
        .marquee-wrap { overflow: hidden; border-top: 1px solid rgba(255,255,255,0.05); border-bottom: 1px solid rgba(255,255,255,0.05); background: #0d0d0d; padding: 18px 0; }
        .marquee-track { display: flex; gap: 48px; width: max-content; animation: marquee 20s linear infinite; }
        .marquee-item { font-family: 'Unbounded', serif; font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: .15em; color: #2a2a2a; white-space: nowrap; display: flex; align-items: center; gap: 48px; }
        .marquee-item span { color: #C5A059; font-size: 10px; }
        @keyframes marquee { from{transform:translateX(0)} to{transform:translateX(-50%)} }

        /* STATS */
        .stat-number { font-family: 'Unbounded', serif; font-size: clamp(36px,5vw,56px); font-weight: 900; color: white; line-height: 1; }
        .stat-label { font-size: 12px; color: #6b7280; letter-spacing: .05em; margin-top: 8px; }

        /* QUOTE */
        .quote-card {
          background: linear-gradient(135deg, #111 0%, #0f0f0f 100%);
          border: 1px solid rgba(255,255,255,0.06);
          border-radius: 24px; padding: 48px;
          position: relative; overflow: hidden;
        }
        .quote-card::before {
          content: '"'; position: absolute; top: -20px; left: 24px;
          font-family: 'Unbounded', serif; font-size: 160px; font-weight: 900;
          color: rgba(197,160,89,0.06); line-height: 1; pointer-events: none;
        }

        /* CTA SECTION */
        .cta-glow {
          position: absolute; inset: 0;
          background: radial-gradient(ellipse at 50% 100%, rgba(197,160,89,0.08) 0%, transparent 70%);
          pointer-events: none;
        }
        .btn-cta-final {
          background: #C5A059; color: #0A0A0A;
          padding: 20px 52px; border-radius: 9999px;
          font-size: 12px; font-weight: 700; text-transform: uppercase; letter-spacing: .12em;
          text-decoration: none; font-family: 'Inter', sans-serif;
          display: inline-block; transition: background .2s, transform .15s, box-shadow .2s;
        }
        .btn-cta-final:hover { background: white; transform: scale(1.04); box-shadow: 0 0 40px rgba(197,160,89,0.25); }

        /* FOOTER */
        .footer-link { color: #4b5563; font-size: 10px; text-transform: uppercase; letter-spacing: .15em; text-decoration: none; transition: color .2s; }
        .footer-link:hover { color: #C5A059; }
      `}</style>

      {/* HEADER */}
      <motion.header
        className="site-header"
        initial={{ y: -80, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
      >
        <div className="header-inner">
          <div
            className="font-display"
            style={{
              fontWeight: 700,
              letterSpacing: "-.02em",
              textTransform: "uppercase",
              fontSize: "15px",
            }}
          >
            TATTOO<span style={{ color: "#C5A059" }}>AGENDA</span>
          </div>
          <nav style={{ display: "flex", alignItems: "center", gap: "36px" }}>
            <a href="#funcionalidades" className="nav-link">
              Funcionalidades
            </a>
            <a href="#precos" className="nav-link">
              Preços
            </a>
          </nav>
          <div style={{ display: "flex", alignItems: "center", gap: "20px" }}>
            <Link href="/login" className="btn-ghost">
              Entrar
            </Link>
            <Link href="/register" className="btn-gold">
              Começar grátis
            </Link>
          </div>
        </div>
      </motion.header>

      {/* HERO */}
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
        {/* BG PARALAX */}
        <motion.div style={{ position: "absolute", inset: 0, scale: imgScale }}>
          <img
            src="https://images.unsplash.com/photo-1611501275019-9b5cda994e8d?w=1600&q=85"
            alt="Tatuador"
            style={{
              width: "100%",
              height: "100%",
              objectFit: "cover",
              opacity: 0.3,
            }}
          />
        </motion.div>
        <div
          style={{
            position: "absolute",
            inset: 0,
            background:
              "linear-gradient(to bottom, rgba(10,10,10,0.3) 0%, rgba(10,10,10,0.7) 50%, #0A0A0A 100%)",
          }}
        />

        {/* HERO CONTENT */}
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
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.3 }}
          >
            O padrão moderno para tatuadores
          </motion.div>

          <motion.h1
            className="font-display"
            style={{
              fontSize: "clamp(40px,8vw,88px)",
              fontWeight: 900,
              lineHeight: 1.0,
              textTransform: "uppercase",
              letterSpacing: "-.03em",
              marginBottom: "28px",
            }}
            initial={{ opacity: 0, y: 48 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4, ease: [0.22, 1, 0.36, 1] }}
          >
            DOMINE SUA
            <br />
            <motion.span
              style={{ color: "#C5A059", display: "inline-block" }}
              initial={{ opacity: 0, x: -24 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{
                duration: 0.7,
                delay: 0.6,
                ease: [0.22, 1, 0.36, 1],
              }}
            >
              ARTE.
            </motion.span>{" "}
            DOMINE SUA
            <br />
            <motion.span
              style={{ color: "#C5A059", display: "inline-block" }}
              initial={{ opacity: 0, x: 24 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{
                duration: 0.7,
                delay: 0.7,
                ease: [0.22, 1, 0.36, 1],
              }}
            >
              AGENDA.
            </motion.span>
          </motion.h1>

          <motion.p
            style={{
              fontSize: "clamp(15px,2vw,19px)",
              color: "#9ca3af",
              fontWeight: 300,
              maxWidth: "580px",
              margin: "0 auto 40px",
              lineHeight: 1.7,
            }}
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.8, ease: [0.22, 1, 0.36, 1] }}
          >
            A plataforma feita exclusivamente para tatuadores profissionais.
            Elimine a bagunça do DM, reduza no-shows e organize sua rotina de
            verdade.
          </motion.p>

          <motion.div
            style={{
              display: "flex",
              flexWrap: "wrap",
              gap: "14px",
              justifyContent: "center",
            }}
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{
              duration: 0.7,
              delay: 0.95,
              ease: [0.22, 1, 0.36, 1],
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

        {/* SCROLL INDICATOR */}
        <motion.div
          style={{
            position: "absolute",
            bottom: "40px",
            left: "50%",
            x: "-50%",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: "8px",
          }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.5 }}
        >
          <motion.div
            style={{
              width: "1px",
              height: "48px",
              background:
                "linear-gradient(to bottom, transparent, rgba(197,160,89,0.6))",
            }}
            animate={{ scaleY: [0, 1, 0], originY: 0 }}
            transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
          />
        </motion.div>
      </section>

      {/* MARQUEE */}
      <div className="marquee-wrap">
        <div className="marquee-track">
          {[...Array(2)].map((_, j) => (
            <div key={j} className="marquee-item">
              {[
                "Agendamento Online",
                "Sem No-Show",
                "Página Própria",
                "Notificações Automáticas",
                "Dashboard Completo",
                "Link na Bio",
              ].map((t, i) => (
                <span key={i}>
                  {t} <span>✦</span>
                </span>
              ))}
            </div>
          ))}
        </div>
      </div>

      {/* STATS */}
      <section
        style={{
          padding: "80px 32px",
          borderBottom: "1px solid rgba(255,255,255,0.05)",
        }}
      >
        <div
          style={{
            maxWidth: "1000px",
            margin: "0 auto",
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
            gap: "48px",
            textAlign: "center",
          }}
        >
          {[
            { num: "100%", label: "Gratuito pra começar" },
            { num: "3min", label: "Pra ter sua página no ar" },
            { num: "0", label: "No-shows com lembretes" },
            { num: "24/7", label: "Agendamentos automáticos" },
          ].map((s, i) => (
            <FadeUp key={i} delay={i * 0.08}>
              <div className="stat-number">{s.num}</div>
              <div className="stat-label">{s.label}</div>
            </FadeUp>
          ))}
        </div>
      </section>

      {/* FEATURES */}
      <section
        id="funcionalidades"
        style={{ padding: "100px 32px", backgroundColor: "#0A0A0A" }}
      >
        <div style={{ maxWidth: "1200px", margin: "0 auto" }}>
          <FadeUp>
            <div style={{ textAlign: "center", marginBottom: "72px" }}>
              <p
                className="font-display"
                style={{
                  fontSize: "10px",
                  fontWeight: 700,
                  textTransform: "uppercase",
                  letterSpacing: ".4em",
                  color: "#C5A059",
                  marginBottom: "16px",
                }}
              >
                O sistema completo
              </p>
              <h3
                className="font-display"
                style={{
                  fontSize: "clamp(26px,4vw,44px)",
                  fontWeight: 900,
                  color: "white",
                  textTransform: "uppercase",
                  letterSpacing: "-.02em",
                }}
              >
                Tudo que você precisa para
                <br />
                rodar um estúdio profissional
              </h3>
            </div>
          </FadeUp>
          <div
            style={{
              display: "grid",
              gap: "16px",
              gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
            }}
          >
            {[
              {
                icon: "dashboard",
                title: "Painel do artista",
                desc: "Visão completa da sua agenda, histórico de clientes e controle total dos serviços em um só lugar.",
                delay: 0,
              },
              {
                icon: "link",
                title: "Página com seu usuário",
                desc: "Seu link personalizado pra colocar na bio do Instagram. Clientes chegam, veem seus serviços e agendam sozinhos.",
                delay: 0.08,
              },
              {
                icon: "calendar_month",
                title: "Agenda inteligente",
                desc: "Configure seus horários disponíveis e bloqueie dias facilmente. O sistema calcula os slots automaticamente.",
                delay: 0.16,
              },
              {
                icon: "notifications_active",
                title: "Notificações automáticas",
                desc: "Email de confirmação assim que um agendamento chegar. Sem precisar ficar checando o celular.",
                delay: 0.24,
              },
            ].map((f, i) => (
              <FeatureCard key={i} {...f} />
            ))}
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section
        style={{
          padding: "100px 32px",
          borderTop: "1px solid rgba(255,255,255,0.05)",
          background: "#080808",
        }}
      >
        <div style={{ maxWidth: "900px", margin: "0 auto" }}>
          <FadeUp>
            <div style={{ textAlign: "center", marginBottom: "72px" }}>
              <p
                className="font-display"
                style={{
                  fontSize: "10px",
                  fontWeight: 700,
                  textTransform: "uppercase",
                  letterSpacing: ".4em",
                  color: "#C5A059",
                  marginBottom: "16px",
                }}
              >
                Como funciona
              </p>
              <h3
                className="font-display"
                style={{
                  fontSize: "clamp(26px,4vw,40px)",
                  fontWeight: 900,
                  color: "white",
                  textTransform: "uppercase",
                  letterSpacing: "-.02em",
                }}
              >
                Em 3 passos você está
                <br />
                recebendo agendamentos
              </h3>
            </div>
          </FadeUp>
          <div
            style={{ display: "flex", flexDirection: "column", gap: "24px" }}
          >
            {[
              {
                n: "01",
                title: "Crie sua conta",
                desc: "Cadastre-se em menos de 2 minutos. Escolha seu slug e configure seu perfil público.",
              },
              {
                n: "02",
                title: "Configure seus serviços e horários",
                desc: "Adicione seus serviços com preços e defina quais dias e horários você atende.",
              },
              {
                n: "03",
                title: "Compartilhe seu link",
                desc: "Cole tattooagenda.vercel.app/seuusuario na bio do Instagram e comece a receber agendamentos automaticamente.",
              },
            ].map((step, i) => (
              <FadeUp key={i} delay={i * 0.1}>
                <motion.div
                  whileHover={{ x: 6 }}
                  transition={{ type: "spring", stiffness: 300 }}
                  style={{
                    display: "flex",
                    gap: "28px",
                    alignItems: "flex-start",
                    padding: "32px",
                    borderRadius: "16px",
                    border: "1px solid rgba(255,255,255,0.05)",
                    background: "#111",
                  }}
                >
                  <span
                    className="font-display"
                    style={{
                      fontSize: "32px",
                      fontWeight: 900,
                      color: "rgba(197,160,89,0.2)",
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
                        color: "white",
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

      {/* QUOTE */}
      <section
        style={{
          padding: "100px 32px",
          borderTop: "1px solid rgba(255,255,255,0.05)",
        }}
      >
        <div style={{ maxWidth: "700px", margin: "0 auto" }}>
          <FadeUp>
            <div className="quote-card">
              <p
                className="font-display"
                style={{
                  fontSize: "clamp(18px,3vw,26px)",
                  fontWeight: 700,
                  lineHeight: 1.3,
                  color: "white",
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
                <motion.div
                  whileHover={{ scale: 1.08 }}
                  style={{
                    width: "52px",
                    height: "52px",
                    borderRadius: "9999px",
                    border: "1px solid rgba(197,160,89,0.4)",
                    background: "#1A1A1A",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontFamily: "'Unbounded',serif",
                    fontSize: "20px",
                    color: "#C5A059",
                    flexShrink: 0,
                    boxShadow: "0 0 20px rgba(197,160,89,0.1)",
                  }}
                >
                  G
                </motion.div>
                <div>
                  <p
                    className="font-display"
                    style={{
                      fontSize: "11px",
                      fontWeight: 700,
                      color: "white",
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
                      color: "#C5A059",
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

      {/* CTA FINAL */}
      <section
        id="precos"
        style={{
          position: "relative",
          padding: "120px 32px",
          borderTop: "1px solid rgba(255,255,255,0.05)",
          textAlign: "center",
          overflow: "hidden",
        }}
      >
        <div className="cta-glow" />
        <FadeUp>
          <p
            className="font-display"
            style={{
              fontSize: "10px",
              fontWeight: 700,
              textTransform: "uppercase",
              letterSpacing: ".4em",
              color: "#C5A059",
              marginBottom: "24px",
            }}
          >
            Comece hoje
          </p>
          <h2
            className="font-display"
            style={{
              fontSize: "clamp(32px,6vw,72px)",
              fontWeight: 900,
              textTransform: "uppercase",
              letterSpacing: "-.03em",
              color: "white",
              marginBottom: "24px",
              lineHeight: 1.05,
            }}
          >
            Pronto para o<br />
            próximo nível?
          </h2>
          <p
            style={{
              maxWidth: "440px",
              margin: "0 auto 48px",
              fontSize: "16px",
              fontWeight: 300,
              color: "#6b7280",
              lineHeight: 1.7,
            }}
          >
            Junte-se aos tatuadores que já transformaram sua rotina. Grátis pra
            começar, sem cartão de crédito.
          </p>
          <motion.div whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.97 }}>
            <Link href="/register" className="btn-cta-final">
              Criar minha conta grátis
            </Link>
          </motion.div>
        </FadeUp>
      </section>

      {/* FOOTER */}
      <footer
        style={{
          padding: "48px 32px",
          borderTop: "1px solid rgba(255,255,255,0.05)",
          backgroundColor: "#0A0A0A",
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
            }}
          >
            TATTOO<span style={{ color: "#C5A059" }}>AGENDA</span>
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
              color: "#2a2a2a",
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
