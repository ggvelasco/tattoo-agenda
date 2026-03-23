"use client";

import Link from "next/link";
import { useState } from "react";

type Props = {
  isLoggedIn: boolean;
  nome?: string;
  fotoUrl?: string;
};

export default function SlugNavbarClient({ isLoggedIn, nome, fotoUrl }: Props) {
  const [hovered, setHovered] = useState(false);

  return (
    <nav
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "20px 24px",
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
          fontSize: "13px",
          textDecoration: "none",
          color: "white",
        }}
      >
        TATTOO<span className="text-[#818cf8]">AGENDA</span>
      </Link>

      {isLoggedIn && nome ? (
        <Link
          href="/dashboard"
          onMouseEnter={() => setHovered(true)}
          onMouseLeave={() => setHovered(false)}
          style={{
            display: "flex",
            alignItems: "center",
            gap: "10px",
            textDecoration: "none",
            padding: "6px 14px",
            border: hovered
              ? "1px solid rgba(197,160,89,0.4)"
              : "1px solid rgba(255,255,255,0.08)",
            borderRadius: "9999px",
            transition: "border-color .2s, background .2s",
            background: hovered ? "rgba(197,160,89,0.05)" : "transparent",
          }}
        >
          <div
            style={{
              width: "28px",
              height: "28px",
              borderRadius: "9999px",
              overflow: "hidden",
              background: "#1A1A1A",
              border: "1px solid rgba(197,160,89,0.3)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0,
            }}
          >
            {fotoUrl ? (
              <img
                src={fotoUrl}
                alt={nome}
                style={{ width: "100%", height: "100%", objectFit: "cover" }}
              />
            ) : (
              <span
                style={{
                  fontSize: "12px",
                  fontWeight: 700,
                  color: "#C5A059",
                  fontFamily: "'Unbounded',serif",
                }}
              >
                {nome.charAt(0).toUpperCase()}
              </span>
            )}
          </div>
          <span
            style={{
              fontSize: "12px",
              color: hovered ? "white" : "#9ca3af",
              fontWeight: 500,
              transition: "color .2s",
            }}
          >
            {nome}
          </span>
          <span
            style={{
              fontSize: "10px",
              color: "#555",
              transform: hovered ? "translateX(2px)" : "none",
              transition: "transform .2s",
            }}
          >
            →
          </span>
        </Link>
      ) : (
        <Link
          href="/register"
          className="btn-gold"
          style={{ padding: "8px 20px", fontSize: "12px" }}
        >
          Criar minha página
        </Link>
      )}
    </nav>
  );
}
