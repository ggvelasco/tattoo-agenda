import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import Link from "next/link";
import SlugNavbarClient from "@/components/SlugNavbarClient";

export default async function PerfilPublicoPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: perfilLogado } = user
    ? await supabase
        .from("profissionais")
        .select("nome, foto_url, slug")
        .eq("user_id", user.id)
        .single()
    : { data: null };

  const { data: perfil } = await supabase
    .from("profissionais")
    .select("*")
    .eq("slug", slug)
    .single();

  if (!perfil) notFound();

  const { data: servicos } = await supabase
    .from("servicos")
    .select("*")
    .eq("profissional_id", perfil.id)
    .eq("ativo", true);

  const primeiroNome = perfil.nome.split(" ")[0];
  const restoNome = perfil.nome.split(" ").slice(1).join(" ");

  return (
    <div
      style={{ backgroundColor: "#0A0A0A", minHeight: "100vh", color: "white" }}
    >
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;600&family=Unbounded:wght@400;700;900&display=swap');

        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        html { scroll-behavior: smooth; }
        body { font-family: 'Inter', sans-serif; -webkit-font-smoothing: antialiased; }

        .font-display { font-family: 'Unbounded', serif; }

        /* FADE IN STAGGERED */
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(20px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .fade-1 { animation: fadeUp .55s ease both; }
        .fade-2 { animation: fadeUp .55s .1s ease both; }
        .fade-3 { animation: fadeUp .55s .2s ease both; }
        .fade-4 { animation: fadeUp .55s .3s ease both; }
        .fade-5 { animation: fadeUp .55s .4s ease both; }

        /* AVATAR PULSE */
        @keyframes pulse-gold {
          0%, 100% { box-shadow: 0 0 0 0 rgba(197,160,89,0); }
          50%       { box-shadow: 0 0 24px 4px rgba(197,160,89,0.18); }
        }
        .avatar-wrap {
          display: inline-block;
          border-radius: 9999px;
          padding: 4px;
          border: 2px solid #C5A059;
          animation: pulse-gold 3s ease-in-out infinite;
          transition: transform .3s ease;
        }
        .avatar-wrap:hover { transform: scale(1.04); }

        /* BOTÕES */
        .btn-white {
          background: white; color: #0A0A0A;
          padding: 12px 32px; border-radius: 9999px;
          font-size: 13px; font-weight: 700;
          text-transform: uppercase; letter-spacing: .12em;
          text-decoration: none; font-family: 'Inter', sans-serif;
          transition: background .2s, transform .15s, box-shadow .2s;
          display: inline-block;
        }
        .btn-white:hover {
          background: #C5A059; color: #0A0A0A;
          transform: translateY(-2px);
          box-shadow: 0 8px 20px rgba(197,160,89,0.25);
        }
        .btn-gold {
          background: #C5A059; color: #0A0A0A;
          padding: 12px 32px; border-radius: 9999px;
          font-size: 13px; font-weight: 700;
          text-transform: uppercase; letter-spacing: .12em;
          text-decoration: none; font-family: 'Inter', sans-serif;
          transition: background .2s, transform .15s, box-shadow .2s;
          display: inline-block;
        }
        .btn-gold:hover {
          background: white; color: #0A0A0A;
          transform: translateY(-2px);
          box-shadow: 0 8px 20px rgba(255,255,255,0.15);
        }

        /* SERVICE CARD */
        .service-card {
          background: #1A1A1A;
          border: 1px solid rgba(255,255,255,0.05);
          border-radius: 16px;
          padding: 24px;
          display: flex;
          flex-direction: column;
          gap: 20px;
          transition: border-color .25s, transform .25s, box-shadow .25s;
          opacity: 0;
          animation: fadeUp .5s ease forwards;
        }
        .service-card:hover {
          border-color: rgba(197,160,89,0.3);
          transform: translateY(-3px);
          box-shadow: 0 12px 32px rgba(0,0,0,0.4);
        }
        .service-card h3 {
          transition: color .2s;
        }
        .service-card:hover h3 { color: #C5A059; }

        /* BOOK BTN */
        .btn-book {
          display: block; text-align: center;
          background: rgba(255,255,255,0.05);
          color: white;
          padding: 12px 24px; border-radius: 12px;
          font-size: 12px; font-weight: 700;
          text-transform: uppercase; letter-spacing: .12em;
          text-decoration: none;
          border: 1px solid rgba(255,255,255,0.1);
          font-family: 'Inter', sans-serif;
          transition: background .2s, color .2s, border-color .2s, transform .15s;
        }
        .btn-book:hover {
          background: #C5A059; color: #0A0A0A;
          border-color: #C5A059;
          transform: scale(1.03);
        }

        /* FOOTER LINKS */
        .footer-link {
          color: #9ca3af; font-size: 11px;
          text-transform: uppercase; letter-spacing: .15em;
          text-decoration: none;
          transition: color .2s;
        }
        .footer-link:hover { color: white; }

        /* DIVIDER SHINE */
        .divider {
          width: 100%; height: 1px;
          background: linear-gradient(to right, transparent, rgba(255,255,255,0.05), transparent);
        }
      `}</style>

      <SlugNavbarClient
        isLoggedIn={!!user}
        nome={perfilLogado?.nome}
        fotoUrl={perfilLogado?.foto_url || undefined}
      />

      {/* HEADER */}
      <header
        style={{
          paddingTop: "64px",
          paddingBottom: "48px",
          paddingLeft: "24px",
          paddingRight: "24px",
          borderBottom: "1px solid rgba(255,255,255,0.05)",
        }}
      >
        <div
          style={{ maxWidth: "672px", margin: "0 auto", textAlign: "center" }}
        >
          <div className="fade-1" style={{ marginBottom: "32px" }}>
            <div className="avatar-wrap">
              {perfil.foto_url ? (
                <img
                  src={perfil.foto_url}
                  alt={perfil.nome}
                  style={{
                    width: "128px",
                    height: "128px",
                    borderRadius: "9999px",
                    objectFit: "cover",
                    display: "block",
                  }}
                />
              ) : (
                <div
                  style={{
                    width: "128px",
                    height: "128px",
                    borderRadius: "9999px",
                    backgroundColor: "#1A1A1A",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: "48px",
                    fontFamily: "'Unbounded', serif",
                    color: "#C5A059",
                  }}
                >
                  {perfil.nome.charAt(0).toUpperCase()}
                </div>
              )}
            </div>
          </div>

          <h1
            className="font-display fade-2"
            style={{
              fontSize: "clamp(28px,6vw,42px)",
              fontWeight: 900,
              textTransform: "uppercase",
              letterSpacing: "-0.03em",
              marginBottom: "16px",
            }}
          >
            {primeiroNome} <span style={{ color: "#C5A059" }}>{restoNome}</span>
          </h1>

          {perfil.bio && (
            <p
              className="fade-3"
              style={{
                color: "#9ca3af",
                lineHeight: "1.7",
                maxWidth: "480px",
                margin: "0 auto 28px",
                fontWeight: 300,
              }}
            >
              {perfil.bio}
            </p>
          )}

          {perfil.cidade && (
            <p
              className="fade-3"
              style={{
                color: "#6b7280",
                fontSize: "12px",
                letterSpacing: "0.15em",
                textTransform: "uppercase",
                marginBottom: "28px",
              }}
            >
              {perfil.cidade}
            </p>
          )}

          <div
            className="fade-4"
            style={{
              display: "flex",
              flexWrap: "wrap",
              justifyContent: "center",
              gap: "12px",
            }}
          >
            {perfil.instagram && (
              <a
                href={`https://instagram.com/${perfil.instagram.replace("@", "")}`}
                target="_blank"
                className="btn-white"
              >
                Instagram
              </a>
            )}
            <Link href={`/${slug}/agendar`} className="btn-gold">
              Agendar sessão
            </Link>
          </div>
        </div>
      </header>

      {/* SERVIÇOS */}
      {servicos && servicos.length > 0 && (
        <section style={{ padding: "72px 24px" }}>
          <div style={{ maxWidth: "672px", margin: "0 auto" }}>
            <div className="fade-5" style={{ marginBottom: "48px" }}>
              <h2
                className="font-display"
                style={{
                  fontSize: "18px",
                  fontWeight: 700,
                  textTransform: "uppercase",
                  marginBottom: "8px",
                }}
              >
                Serviços
              </h2>
              <div
                style={{
                  width: "48px",
                  height: "4px",
                  backgroundColor: "#C5A059",
                  borderRadius: "2px",
                }}
              />
            </div>

            <div
              style={{ display: "flex", flexDirection: "column", gap: "20px" }}
            >
              {servicos.map((s, i) => (
                <div
                  key={s.id}
                  className="service-card"
                  style={{ animationDelay: `${0.45 + i * 0.08}s` }}
                >
                  <div>
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "flex-start",
                        marginBottom: "8px",
                        flexWrap: "wrap",
                        gap: "8px",
                      }}
                    >
                      <h3
                        className="font-display"
                        style={{ fontSize: "15px", fontWeight: 700 }}
                      >
                        {s.nome}
                      </h3>
                      <p
                        className="font-display"
                        style={{
                          fontSize: "15px",
                          fontWeight: 700,
                          color: "#C5A059",
                        }}
                      >
                        R$ {Number(s.preco).toFixed(0)}
                      </p>
                    </div>
                    {s.descricao && (
                      <p
                        style={{
                          color: "#9ca3af",
                          fontWeight: 300,
                          fontSize: "14px",
                          lineHeight: "1.6",
                          marginBottom: "8px",
                        }}
                      >
                        {s.descricao}
                      </p>
                    )}
                    <p style={{ color: "#6b7280", fontSize: "12px" }}>
                      {s.duracao_minutos} minutos
                    </p>
                  </div>
                  <Link
                    href={`/${slug}/agendar?servico=${s.id}`}
                    className="btn-book"
                  >
                    Agendar
                  </Link>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* FOOTER */}
      <footer
        style={{
          padding: "48px 24px",
          borderTop: "1px solid rgba(255,255,255,0.05)",
          backgroundColor: "#0A0A0A",
        }}
      >
        <div
          style={{ maxWidth: "672px", margin: "0 auto", textAlign: "center" }}
        >
          <div
            className="font-display"
            style={{
              fontWeight: 700,
              letterSpacing: "-0.02em",
              marginBottom: "16px",
              textTransform: "uppercase",
              fontSize: "16px",
            }}
          >
            TATTOO<span style={{ color: "#C5A059" }}>AGENDA</span>
          </div>
          {perfil.instagram && (
            <div style={{ marginBottom: "20px" }}>
              <a
                href={`https://instagram.com/${perfil.instagram.replace("@", "")}`}
                target="_blank"
                className="footer-link"
              >
                Instagram
              </a>
            </div>
          )}
          <p
            style={{
              color: "#6b7280",
              fontSize: "10px",
              textTransform: "uppercase",
              letterSpacing: "0.12em",
            }}
          >
            © {new Date().getFullYear()} {perfil.nome} × Tattooagenda
          </p>
        </div>
      </footer>
    </div>
  );
}
