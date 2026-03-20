import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import Link from "next/link";
import SlugNavbarClient from "@/components/SlugNavbarClient";

function formatarPreco(s: { tipo_preco: string; preco: number }) {
  if (s.tipo_preco === "sob_consulta") return "Sob consulta";
  if (s.tipo_preco === "a_partir_de")
    return `A partir de R$ ${Number(s.preco).toFixed(0)}`;
  return `R$ ${Number(s.preco).toFixed(0)}`;
}

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
    .eq("ativo", true)
    .order("ordem", { ascending: true });

  const primeiroNome = perfil.nome.split(" ")[0];
  const restoNome = perfil.nome.split(" ").slice(1).join(" ");

  return (
    <div
      style={{ backgroundColor: "#0A0A0A", minHeight: "100vh", color: "white" }}
    >
      <style>{`
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(24px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes pulse-gold {
  0%, 100% { box-shadow: 0 0 0 0 rgba(197,160,89,0.4), 0 0 0 0 rgba(197,160,89,0.2); }
  50%       { box-shadow: 0 0 20px 8px rgba(197,160,89,0.2), 0 0 40px 16px rgba(197,160,89,0.08); }
}
        @keyframes shimmer {
          0% { background-position: -200% center; }
          100% { background-position: 200% center; }
        }

        .fade-1 { animation: fadeUp .6s ease both; }
        .fade-2 { animation: fadeUp .6s .1s ease both; }
        .fade-3 { animation: fadeUp .6s .2s ease both; }
        .fade-4 { animation: fadeUp .6s .3s ease both; }
        .fade-5 { animation: fadeUp .6s .4s ease both; }

        .font-display { font-family: 'Unbounded', serif; }

        .avatar-wrap {
          display: inline-block;
          border-radius: 9999px;
          padding: 3px;
          background: linear-gradient(135deg, #C5A059, #8B6914, #C5A059);
          background-size: 300% auto;
          animation: pulse-gold 8s ease-in-out infinite;
          transition: transform .3s ease;
        }
        .avatar-wrap:hover { transform: scale(1.04); }
        .avatar-inner {
          border-radius: 9999px;
          overflow: hidden;
          background: #0A0A0A;
          padding: 2px;
        }

        .service-card {
          background: linear-gradient(135deg, #141414 0%, #111 100%);
          border: 1px solid rgba(255,255,255,0.06);
          border-radius: 20px;
          padding: 28px;
          transition: all .3s ease;
          position: relative;
          overflow: hidden;
          opacity: 0;
          animation: fadeUp .5s ease forwards;
        }
        .service-card::before {
          content: '';
          position: absolute;
          inset: 0;
          border-radius: 20px;
          padding: 1px;
          background: linear-gradient(135deg, rgba(197,160,89,0) 0%, rgba(197,160,89,0.15) 50%, rgba(197,160,89,0) 100%);
          -webkit-mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
          mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
          -webkit-mask-composite: xor;
          mask-composite: exclude;
          opacity: 0;
          transition: opacity .3s;
          pointer-events: none;
        }
        .service-card:hover::before { opacity: 1; }
        .service-card:hover {
          border-color: rgba(197,160,89,0.2);
          transform: translateY(-4px);
          box-shadow: 0 20px 48px rgba(0,0,0,0.5), 0 0 0 1px rgba(197,160,89,0.1);
        }

        .service-number {
          font-family: 'Unbounded', serif;
          font-size: 11px;
          font-weight: 700;
          color: rgba(197,160,89,0.3);
          letter-spacing: .1em;
          margin-bottom: 16px;
        }

        .price-badge {
          display: inline-flex;
          align-items: center;
          background: rgba(197,160,89,0.08);
          border: 1px solid rgba(197,160,89,0.2);
          border-radius: 9999px;
          padding: 4px 14px;
          font-size: 13px;
          font-weight: 700;
          color: #C5A059;
          font-family: 'Unbounded', serif;
          white-space: nowrap;
        }

        .price-badge.consulta {
          background: rgba(255,255,255,0.04);
          border-color: rgba(255,255,255,0.1);
          color: rgba(255,255,255,0.4);
          font-family: 'Inter', sans-serif;
          font-weight: 400;
          font-size: 12px;
        }

        .btn-book {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          background: transparent;
          color: rgba(255,255,255,0.5);
          padding: 12px 20px;
          border-radius: 12px;
          font-size: 11px;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: .12em;
          text-decoration: none;
          border: 1px solid rgba(255,255,255,0.08);
          font-family: 'Inter', sans-serif;
          transition: all .25s;
          margin-top: 20px;
        }
        .btn-book:hover {
          background: #C5A059;
          color: #0A0A0A;
          border-color: #C5A059;
          transform: scale(1.02);
          box-shadow: 0 8px 24px rgba(197,160,89,0.3);
        }
        .btn-book svg { transition: transform .25s; }
        .btn-book:hover svg { transform: translateX(4px); }

        .btn-gold {
          background: #C5A059; color: #0A0A0A;
          padding: 14px 36px; border-radius: 9999px;
          font-size: 12px; font-weight: 700;
          text-transform: uppercase; letter-spacing: .12em;
          text-decoration: none; font-family: 'Inter', sans-serif;
          transition: all .2s; display: inline-block;
          box-shadow: 0 0 0 rgba(197,160,89,0);
        }
        .btn-gold:hover {
          background: white; color: #0A0A0A;
          transform: translateY(-2px);
          box-shadow: 0 12px 32px rgba(197,160,89,0.3);
        }

        .btn-white {
          background: rgba(255,255,255,0.06); color: white;
          padding: 14px 36px; border-radius: 9999px;
          font-size: 12px; font-weight: 700;
          text-transform: uppercase; letter-spacing: .12em;
          text-decoration: none; font-family: 'Inter', sans-serif;
          border: 1px solid rgba(255,255,255,0.1);
          transition: all .2s; display: inline-block;
        }
        .btn-white:hover {
          background: rgba(255,255,255,0.12);
          border-color: rgba(255,255,255,0.2);
          transform: translateY(-2px);
        }

        .divider-gold {
          width: 40px; height: 3px;
          background: linear-gradient(to right, #C5A059, rgba(197,160,89,0.3));
          border-radius: 9999px;
          margin-bottom: 8px;
        }

        .footer-link {
          color: #4b5563; font-size: 10px;
          text-transform: uppercase; letter-spacing: .15em;
          text-decoration: none; transition: color .2s;
        }
        .footer-link:hover { color: #C5A059; }

        .wa-btn {
          display: inline-flex; align-items: center; gap: 10px;
          width: 100%; justify-content: center;
          padding: 14px; border-radius: 14px;
          font-size: 12px; font-weight: 600;
          color: #4ade80; text-decoration: none;
          border: 1px solid rgba(74,222,128,0.15);
          background: rgba(74,222,128,0.04);
          font-family: 'Inter',sans-serif;
          transition: all .2s; margin-top: 12px;
        }
        .wa-btn:hover {
          background: rgba(74,222,128,0.1);
          border-color: rgba(74,222,128,0.3);
          transform: translateY(-1px);
        }
      `}</style>

      <SlugNavbarClient
        isLoggedIn={!!user}
        nome={perfilLogado?.nome}
        fotoUrl={perfilLogado?.foto_url || undefined}
      />

      {/* HERO */}
      <header
        style={{
          paddingTop: "72px",
          paddingBottom: "56px",
          paddingLeft: "24px",
          paddingRight: "24px",
          borderBottom: "1px solid rgba(255,255,255,0.04)",
        }}
      >
        <div
          style={{ maxWidth: "600px", margin: "0 auto", textAlign: "center" }}
        >
          {/* AVATAR */}
          <div className="fade-1" style={{ marginBottom: "28px" }}>
            <div className="avatar-wrap">
              <div className="avatar-inner">
                {perfil.foto_url ? (
                  <img
                    src={perfil.foto_url}
                    alt={perfil.nome}
                    style={{
                      width: "120px",
                      height: "120px",
                      borderRadius: "9999px",
                      objectFit: "cover",
                      display: "block",
                    }}
                  />
                ) : (
                  <div
                    style={{
                      width: "120px",
                      height: "120px",
                      borderRadius: "9999px",
                      backgroundColor: "#111",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: "44px",
                      fontFamily: "'Unbounded', serif",
                      color: "#C5A059",
                    }}
                  >
                    {perfil.nome.charAt(0).toUpperCase()}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* NOME */}
          <h1
            className="font-display fade-2"
            style={{
              fontSize: "clamp(26px,6vw,44px)",
              fontWeight: 900,
              textTransform: "uppercase",
              letterSpacing: "-0.03em",
              marginBottom: "16px",
              lineHeight: 1.1,
            }}
          >
            {primeiroNome}
            {restoNome && (
              <>
                {" "}
                <span style={{ color: "#C5A059" }}>{restoNome}</span>
              </>
            )}
          </h1>

          {/* CIDADE */}
          {perfil.cidade && (
            <p
              className="fade-2"
              style={{
                color: "#555",
                fontSize: "11px",
                letterSpacing: "0.2em",
                textTransform: "uppercase",
                marginBottom: "16px",
              }}
            >
              📍 {perfil.cidade}
            </p>
          )}

          {/* BIO */}
          {perfil.bio && (
            <p
              className="fade-3"
              style={{
                color: "#6b7280",
                lineHeight: "1.75",
                maxWidth: "440px",
                margin: "0 auto 32px",
                fontWeight: 300,
                fontSize: "15px",
              }}
            >
              {perfil.bio}
            </p>
          )}

          {/* BOTÕES */}
          <div
            className="fade-4"
            style={{
              display: "flex",
              flexWrap: "wrap",
              justifyContent: "center",
              gap: "10px",
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
        <section style={{ padding: "64px 24px" }}>
          <div style={{ maxWidth: "600px", margin: "0 auto" }}>
            {/* TÍTULO DA SEÇÃO */}
            <div className="fade-5" style={{ marginBottom: "40px" }}>
              <div className="divider-gold" />
              <h2
                className="font-display"
                style={{
                  fontSize: "11px",
                  fontWeight: 700,
                  textTransform: "uppercase",
                  letterSpacing: ".3em",
                  color: "#555",
                }}
              >
                Serviços
              </h2>
            </div>

            {/* GRID DE SERVIÇOS */}
            <div
              style={{ display: "flex", flexDirection: "column", gap: "16px" }}
            >
              {servicos.map((s, i) => (
                <div
                  key={s.id}
                  className="service-card"
                  style={{ animationDelay: `${0.45 + i * 0.08}s` }}
                >
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "flex-start",
                      gap: "16px",
                      flexWrap: "wrap",
                    }}
                  >
                    <div style={{ flex: 1 }}>
                      <div className="service-number">
                        {String(i + 1).padStart(2, "0")}
                      </div>
                      <h3
                        className="font-display"
                        style={{
                          fontSize: "16px",
                          fontWeight: 700,
                          marginBottom: "8px",
                          color: "white",
                        }}
                      >
                        {s.nome}
                      </h3>
                      {s.descricao && (
                        <p
                          style={{
                            color: "#6b7280",
                            fontSize: "13px",
                            lineHeight: "1.65",
                            marginBottom: "12px",
                            fontWeight: 300,
                          }}
                        >
                          {s.descricao}
                        </p>
                      )}
                      <p style={{ color: "#444", fontSize: "12px" }}>
                        ⏱ {s.duracao_minutos} minutos
                      </p>
                    </div>
                    <div
                      className={`price-badge ${s.tipo_preco === "sob_consulta" ? "consulta" : ""}`}
                    >
                      {formatarPreco(s)}
                    </div>
                  </div>

                  <Link
                    href={`/${slug}/agendar?servico=${s.id}`}
                    className="btn-book"
                  >
                    Agendar este serviço
                    <svg
                      width="14"
                      height="14"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M5 12h14M12 5l7 7-7 7" />
                    </svg>
                  </Link>
                </div>
              ))}
            </div>

            {/* WHATSAPP */}
            {perfil.whatsapp && (
              <a
                href={`https://wa.me/55${perfil.whatsapp.replace(/\D/g, "")}?text=${encodeURIComponent(`Olá ${perfil.nome}! Vi sua página no Tattooagenda e gostaria de tirar uma dúvida.`)}`}
                target="_blank"
                className="wa-btn"
              >
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                >
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                </svg>
                Tirar dúvida no WhatsApp
              </a>
            )}
          </div>
        </section>
      )}

      {/* FOOTER */}
      <footer
        style={{
          padding: "40px 24px",
          borderTop: "1px solid rgba(255,255,255,0.04)",
          backgroundColor: "#0A0A0A",
        }}
      >
        <div
          style={{ maxWidth: "600px", margin: "0 auto", textAlign: "center" }}
        >
          <div
            className="font-display"
            style={{
              fontWeight: 700,
              letterSpacing: "-0.02em",
              marginBottom: "16px",
              textTransform: "uppercase",
              fontSize: "14px",
            }}
          >
            TATTOO<span style={{ color: "#C5A059" }}>AGENDA</span>
          </div>
          {perfil.instagram && (
            <div style={{ marginBottom: "16px" }}>
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
              color: "#2a2a2a",
              fontSize: "10px",
              textTransform: "uppercase",
              letterSpacing: "0.1em",
            }}
          >
            © {new Date().getFullYear()} {perfil.nome} × Tattooagenda
          </p>
        </div>
      </footer>
    </div>
  );
}
