import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import Link from "next/link";
import SlugNavbarClient from "@/components/SlugNavbarClient";
import SlugPageClient from "@/components/SlugPageClient";

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

  const servicosFormatados = (servicos || []).map((s) => ({
    ...s,
    precoFormatado: formatarPreco(s),
  }));

  return (
    <div
      style={{ backgroundColor: "#0D0D0D", minHeight: "100vh", color: "white" }}
    >
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Unbounded:wght@400;700;900&family=Inter:wght@300;400;500;600&display=swap');

        * { box-sizing: border-box; margin: 0; padding: 0; }
        html { scroll-behavior: smooth; }
        body { font-family: 'Inter', sans-serif; -webkit-font-smoothing: antialiased; }
        .font-headline { font-family: 'Unbounded', cursive; }

        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(20px); }
          to   { opacity: 1; transform: translateY(0); }
        }

        .fade-1 { animation: fadeUp .5s ease both; }
        .fade-2 { animation: fadeUp .5s .08s ease both; }
        .fade-3 { animation: fadeUp .5s .16s ease both; }
        .fade-4 { animation: fadeUp .5s .24s ease both; }

        /* AVATAR */
        .avatar-ring {
          display: inline-block;
          border-radius: 9999px;
          padding: 2px;
          background: rgba(255,255,255,0.15);
          transition: transform .3s ease, box-shadow .3s ease;
        }
        .avatar-ring:hover {
          transform: scale(1.03);
          box-shadow: 0 0 0 4px rgba(255,255,255,0.06);
        }

        /* TABS */
        .tab-container {
          display: inline-flex;
          background: #1C1B1B;
          padding: 4px;
          border-radius: 12px;
          border: 1px solid rgba(255,255,255,0.06);
          gap: 2px;
        }
        .tab-btn {
          padding: 10px 24px;
          border-radius: 8px;
          font-size: 11px;
          font-family: 'Unbounded', cursive;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: .1em;
          border: none;
          cursor: pointer;
          transition: all .2s ease;
          white-space: nowrap;
        }
        .tab-btn.active { background: #EBEBEB; color: #0D0D0D; }
        .tab-btn.inactive { background: transparent; color: #555; }
        .tab-btn.inactive:hover { color: #EBEBEB; }
        .tab-btn.disabled {
          background: transparent;
          color: #333;
          cursor: default;
          display: flex; align-items: center; gap: 6px;
        }
        .soon-badge {
          font-size: 8px;
          background: #1a1a1a;
          color: #444;
          padding: 2px 6px;
          border-radius: 9999px;
          font-family: 'Inter', sans-serif;
          letter-spacing: .05em;
          text-transform: uppercase;
        }

        /* SERVICE CARDS */
        .service-item {
          background: #111;
          border: 1px solid #1f1f1f;
          border-radius: 12px;
          padding: 20px;
          transition: all .2s ease;
        }
        .service-item:hover {
          border-color: #2a2a2a;
          background: #141414;
          transform: translateY(-1px);
          box-shadow: 0 8px 32px rgba(0,0,0,0.4);
        }

        .price-pill {
          display: inline-flex;
          align-items: center;
          background: #EBEBEB;
          color: #0D0D0D;
          padding: 4px 12px;
          border-radius: 9999px;
          font-size: 11px;
          font-weight: 600;
          font-family: 'Inter', sans-serif;
          white-space: nowrap;
          flex-shrink: 0;
          letter-spacing: -.01em;
        }
        .price-pill.consulta {
          background: #1f1f1f;
          color: #555;
          font-weight: 400;
        }

        .btn-agendar {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          width: 100%;
          padding: 11px;
          border-radius: 8px;
          font-size: 10px;
          font-weight: 600;
          font-family: 'Inter', sans-serif;
          text-transform: uppercase;
          letter-spacing: .1em;
          text-decoration: none;
          color: #555;
          border: 1px solid #1f1f1f;
          background: transparent;
          transition: all .2s ease;
          margin-top: 14px;
        }
        .btn-agendar:hover {
          background: #EBEBEB;
          color: #0D0D0D;
          border-color: #EBEBEB;
        }
        .btn-agendar svg { transition: transform .2s; }
        .btn-agendar:hover svg { transform: translateX(4px); }

        /* WHATSAPP */
        .wa-btn {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 10px;
          width: 100%;
          padding: 13px;
          border-radius: 10px;
          font-size: 12px;
          font-weight: 400;
          color: #444;
          text-decoration: none;
          border: 1px solid #1a1a1a;
          background: transparent;
          transition: all .2s;
          font-family: 'Inter', sans-serif;
          margin-top: 8px;
        }
        .wa-btn:hover {
          color: #4ade80;
          border-color: rgba(74,222,128,0.2);
          background: rgba(74,222,128,0.03);
        }

        /* INSTAGRAM BTN */
        .btn-instagram {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          background: transparent;
          color: #555;
          padding: 11px 24px;
          border-radius: 9999px;
          font-size: 12px;
          font-weight: 500;
          font-family: 'Inter', sans-serif;
          text-decoration: none;
          border: 1px solid #1f1f1f;
          transition: all .2s;
        }
        .btn-instagram:hover {
          color: #EBEBEB;
          border-color: #333;
        }

        .btn-agendar-hero {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          background: #EBEBEB;
          color: #0D0D0D;
          padding: 11px 28px;
          border-radius: 9999px;
          font-size: 12px;
          font-weight: 600;
          font-family: 'Inter', sans-serif;
          text-decoration: none;
          letter-spacing: -.01em;
          transition: all .2s;
          border: 1px solid #EBEBEB;
        }
        .btn-agendar-hero:hover {
          background: transparent;
          color: #EBEBEB;
        }

        /* BOTTOM NAV */
        .bottom-nav {
          position: fixed;
          bottom: 0; left: 0;
          width: 100%;
          display: flex;
          justify-content: space-around;
          align-items: center;
          padding: 12px 16px 20px;
          background: rgba(13,13,13,0.95);
          backdrop-filter: blur(24px);
          border-top: 1px solid rgba(255,255,255,0.04);
          z-index: 50;
        }
        @media (min-width: 768px) {
          .bottom-nav { display: none !important; }
        }
        .bottom-nav-item {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 4px;
          color: #444;
          text-decoration: none;
          transition: color .2s;
          cursor: pointer;
          background: none;
          border: none;
        }
        .bottom-nav-item.active { color: #EBEBEB; }
        .bottom-nav-item span:first-child { font-size: 22px; }
        .bottom-nav-item span:last-child {
          font-size: 9px;
          font-family: 'Inter', sans-serif;
          font-weight: 500;
          letter-spacing: .1em;
          text-transform: uppercase;
        }

        /* FOOTER */
        .footer-link {
          color: #2a2a2a;
          font-size: 10px;
          text-transform: uppercase;
          letter-spacing: .15em;
          text-decoration: none;
          transition: color .2s;
          font-family: 'Inter', sans-serif;
        }
        .footer-link:hover { color: #555; }
        .footer-padding {
  padding: 32px 24px 200px;
}
@media (min-width: 768px) {
  .footer-padding {
    padding: 32px 24px 42px;
  }
}
      `}</style>

      {/* NAV */}
      <SlugNavbarClient
        isLoggedIn={!!user}
        nome={perfilLogado?.nome}
        fotoUrl={perfilLogado?.foto_url || undefined}
      />

      <main
        style={{
          maxWidth: "600px",
          margin: "0 auto",
          padding: "60px 20px 140px",
        }}
      >
        {/* HERO */}
        <section
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            textAlign: "center",
            marginBottom: "40px",
          }}
        >
          <div className="fade-1" style={{ marginBottom: "20px" }}>
            <div className="avatar-ring">
              {perfil.foto_url ? (
                <img
                  src={perfil.foto_url}
                  alt={perfil.nome}
                  style={{
                    width: "112px",
                    height: "112px",
                    borderRadius: "9999px",
                    objectFit: "cover",
                    display: "block",
                  }}
                />
              ) : (
                <div
                  style={{
                    width: "112px",
                    height: "112px",
                    borderRadius: "9999px",
                    backgroundColor: "#1a1a1a",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: "38px",
                    fontFamily: "'Unbounded', cursive",
                    color: "#EBEBEB",
                  }}
                >
                  {perfil.nome.charAt(0).toUpperCase()}
                </div>
              )}
            </div>
          </div>

          <h1
            className="font-headline fade-2"
            style={{
              fontSize: "clamp(26px,7vw,44px)",
              fontWeight: 900,
              textTransform: "uppercase",
              letterSpacing: "-0.03em",
              lineHeight: 1.1,
              marginBottom: "10px",
              color: "#EBEBEB",
            }}
          >
            {primeiroNome}
            {restoNome && <> {restoNome}</>}
          </h1>

          {perfil.cidade && (
            <div
              className="fade-2"
              style={{
                display: "flex",
                alignItems: "center",
                gap: "4px",
                color: "#444",
                fontSize: "11px",
                letterSpacing: ".2em",
                textTransform: "uppercase",
                marginBottom: "14px",
              }}
            >
              <span
                className="material-symbols-outlined"
                style={{ fontSize: "13px" }}
              >
                location_on
              </span>
              {perfil.cidade}
            </div>
          )}

          {perfil.bio && (
            <p
              className="fade-3"
              style={{
                color: "#555",
                lineHeight: "1.75",
                maxWidth: "420px",
                marginBottom: "24px",
                fontWeight: 300,
                fontSize: "14px",
              }}
            >
              {perfil.bio}
            </p>
          )}

          <div
            className="fade-4"
            style={{
              display: "flex",
              flexWrap: "wrap",
              justifyContent: "center",
              gap: "8px",
            }}
          >
            {perfil.instagram && (
              <a
                href={`https://instagram.com/${perfil.instagram.replace("@", "")}`}
                target="_blank"
                className="btn-instagram"
              >
                <svg
                  width="13"
                  height="13"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                >
                  <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
                </svg>
                Instagram
              </a>
            )}
            <Link href={`/${slug}/agendar`} className="btn-agendar-hero">
              Agendar sessão
            </Link>
          </div>
        </section>

        {/* TABS + CONTEÚDO */}
        <SlugPageClient
          slug={slug}
          servicos={servicosFormatados}
          whatsapp={perfil.whatsapp}
          nome={perfil.nome}
        />
      </main>

      {/* FOOTER */}
      <footer
        className="footer-padding"
        style={{ borderTop: "1px solid rgba(255,255,255,0.03)" }}
      >
        <div
          style={{ maxWidth: "600px", margin: "0 auto", textAlign: "center" }}
        >
          <div
            className="font-headline"
            style={{
              fontWeight: 700,
              letterSpacing: "-.02em",
              marginBottom: "12px",
              textTransform: "uppercase",
              fontSize: "13px",
              color: "#2a2a2a",
            }}
          >
            TATTOO<span style={{ color: "#919090" }}>AGENDA</span>
          </div>
          {perfil.instagram && (
            <div style={{ marginBottom: "12px", color: "#2a2a2a" }}>
              <a
                style={{ color: "#2a2a2a" }}
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
              color: "#919090",
              fontSize: "10px",
              textTransform: "uppercase",
              letterSpacing: "0.1em",
              fontFamily: "'Inter', sans-serif",
            }}
          >
            © {new Date().getFullYear()} {perfil.nome} × Tattooagenda
          </p>
        </div>
      </footer>

      {/* BOTTOM NAV MOBILE */}
      <nav className="bottom-nav">
        <button className="bottom-nav-item active">
          <span className="material-symbols-outlined">grid_view</span>
          <span>Serviços</span>
        </button>
        <button className="bottom-nav-item">
          <span className="material-symbols-outlined">auto_awesome_motion</span>
          <span>Portfólio</span>
        </button>
        <Link
          href={`/${slug}/agendar`}
          className="bottom-nav-item"
          style={{ textDecoration: "none" }}
        >
          <span className="material-symbols-outlined">event</span>
          <span>Agendar</span>
        </Link>
      </nav>
    </div>
  );
}
