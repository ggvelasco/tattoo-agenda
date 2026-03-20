"use client";

import { useState } from "react";
import Link from "next/link";

type Servico = {
  id: string;
  nome: string;
  descricao: string | null;
  duracao_minutos: number;
  preco: number;
  tipo_preco: string;
  precoFormatado: string;
};

type Props = {
  slug: string;
  servicos: Servico[];
  whatsapp: string | null;
  nome: string;
};

export default function SlugPageClient({
  slug,
  servicos,
  whatsapp,
  nome,
}: Props) {
  const [tab, setTab] = useState<"servicos" | "portfolio">("servicos");

  return (
    <>
      {/* SEGMENTED TABS */}
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          marginBottom: "32px",
        }}
      >
        <div className="tab-container">
          <button
            className={`tab-btn ${tab === "servicos" ? "active" : "inactive"}`}
            onClick={() => setTab("servicos")}
          >
            Serviços
          </button>
          <button className="tab-btn disabled" disabled>
            Portfólio
            <span className="soon-badge">Em breve</span>
          </button>
        </div>
      </div>

      {/* SERVIÇOS */}
      {tab === "servicos" && (
        <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
          {servicos.length === 0 ? (
            <div
              style={{
                textAlign: "center",
                padding: "48px 0",
                color: "#555",
                fontSize: "14px",
              }}
            >
              Nenhum serviço cadastrado ainda.
            </div>
          ) : (
            servicos.map((s, i) => (
              <div
                key={s.id}
                className="service-item"
                style={{
                  animationDelay: `${i * 0.06}s`,
                  animation: "fadeUp .4s ease both",
                }}
              >
                {/* TOPO */}
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "flex-start",
                    gap: "12px",
                    marginBottom: "8px",
                    flexWrap: "wrap",
                  }}
                >
                  <h3
                    style={{
                      fontSize: "15px",
                      fontWeight: 600,
                      color: "#EBEBEB",
                      flex: 1,
                      fontFamily: "'Inter', sans-serif",
                      letterSpacing: "-.01em",
                    }}
                  >
                    {s.nome}
                  </h3>
                  <span
                    className={`price-pill ${s.tipo_preco === "sob_consulta" ? "consulta" : ""}`}
                  >
                    {s.precoFormatado}
                  </span>
                </div>

                {/* DESCRIÇÃO */}
                {s.descricao && (
                  <p
                    style={{
                      color: "#6b6b6b",
                      fontSize: "13px",
                      lineHeight: "1.65",
                      marginBottom: "10px",
                      fontWeight: 300,
                    }}
                  >
                    {s.descricao}
                  </p>
                )}

                {/* DURAÇÃO */}
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "4px",
                    color: "#444",
                    fontSize: "11px",
                    marginBottom: "4px",
                  }}
                >
                  <span
                    className="material-symbols-outlined"
                    style={{ fontSize: "13px" }}
                  >
                    schedule
                  </span>
                  {s.duracao_minutos} min
                </div>

                {/* BOTÃO */}
                <Link
                  href={`/${slug}/agendar?servico=${s.id}`}
                  className="btn-agendar"
                >
                  Agendar este serviço
                  <svg
                    width="13"
                    height="13"
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
            ))
          )}

          {/* WHATSAPP */}
          {whatsapp && (
            <a
              href={`https://wa.me/55${whatsapp.replace(/\D/g, "")}?text=${encodeURIComponent(`Olá ${nome}! Vi sua página no Tattooagenda e gostaria de tirar uma dúvida.`)}`}
              target="_blank"
              className="wa-btn"
            >
              <svg
                width="15"
                height="15"
                viewBox="0 0 24 24"
                fill="currentColor"
              >
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
              </svg>
              Tirar dúvida no WhatsApp
            </a>
          )}
        </div>
      )}

      {tab === "portfolio" && (
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            padding: "80px 24px",
            textAlign: "center",
            gap: "12px",
          }}
        >
          <span
            className="material-symbols-outlined"
            style={{ fontSize: "36px", color: "#2a2a2a" }}
          >
            photo_library
          </span>
          <p style={{ color: "#444", fontSize: "13px" }}>Portfólio em breve</p>
        </div>
      )}
    </>
  );
}
