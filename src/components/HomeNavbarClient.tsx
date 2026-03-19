"use client";

import Link from "next/link";
import { useState } from "react";
import { motion } from "framer-motion";

export default function HomeNavbarClient({
  isLoggedIn,
}: {
  isLoggedIn: boolean;
}) {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
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
            flexShrink: 0,
          }}
        >
          TATTOO<span style={{ color: "#C5A059" }}>AGENDA</span>
        </div>

        {/* NAV DESKTOP */}
        <nav
          style={{ display: "flex", alignItems: "center", gap: "36px" }}
          className="desktop-nav"
        >
          <a href="#funcionalidades" className="nav-link">
            Funcionalidades
          </a>
          <a href="#precos" className="nav-link">
            Preços
          </a>
        </nav>

        {/* BOTÕES DESKTOP */}
        <div
          style={{ display: "flex", alignItems: "center", gap: "16px" }}
          className="desktop-nav"
        >
          {isLoggedIn ? (
            <Link href="/dashboard" className="btn-gold">
              Painel
            </Link>
          ) : (
            <>
              <Link href="/login" className="btn-ghost">
                Entrar
              </Link>
              <Link href="/register" className="btn-gold">
                Começar grátis
              </Link>
            </>
          )}
        </div>

        {/* HAMBURGUER MOBILE */}
        <button
          onClick={() => setMenuOpen(!menuOpen)}
          className="mobile-menu-btn"
          style={{
            background: "none",
            border: "none",
            cursor: "pointer",
            padding: "4px",
            display: "none",
          }}
        >
          <div
            style={{
              width: "22px",
              display: "flex",
              flexDirection: "column",
              gap: "5px",
            }}
          >
            <motion.span
              animate={{ rotate: menuOpen ? 45 : 0, y: menuOpen ? 7 : 0 }}
              style={{
                display: "block",
                height: "1.5px",
                background: "white",
                borderRadius: "2px",
              }}
            />
            <motion.span
              animate={{ opacity: menuOpen ? 0 : 1 }}
              style={{
                display: "block",
                height: "1.5px",
                background: "white",
                borderRadius: "2px",
              }}
            />
            <motion.span
              animate={{ rotate: menuOpen ? -45 : 0, y: menuOpen ? -7 : 0 }}
              style={{
                display: "block",
                height: "1.5px",
                background: "white",
                borderRadius: "2px",
              }}
            />
          </div>
        </button>
      </div>

      {/* MENU MOBILE */}
      <motion.div
        initial={false}
        animate={{ height: menuOpen ? "auto" : 0, opacity: menuOpen ? 1 : 0 }}
        style={{
          overflow: "hidden",
          borderTop: menuOpen ? "1px solid rgba(255,255,255,0.05)" : "none",
        }}
      >
        <div
          style={{
            padding: "20px 24px",
            display: "flex",
            flexDirection: "column",
            gap: "16px",
          }}
        >
          <a
            href="#funcionalidades"
            onClick={() => setMenuOpen(false)}
            className="nav-link"
            style={{ fontSize: "13px" }}
          >
            Funcionalidades
          </a>
          <a
            href="#precos"
            onClick={() => setMenuOpen(false)}
            className="nav-link"
            style={{ fontSize: "13px" }}
          >
            Preços
          </a>
          <div
            style={{
              paddingTop: "8px",
              borderTop: "1px solid rgba(255,255,255,0.05)",
              display: "flex",
              flexDirection: "column",
              gap: "10px",
            }}
          >
            {isLoggedIn ? (
              <Link
                href="/dashboard"
                className="btn-gold"
                style={{ textAlign: "center" }}
              >
                Ir para o painel
              </Link>
            ) : (
              <>
                <Link
                  href="/login"
                  style={{
                    textAlign: "center",
                    fontSize: "12px",
                    color: "#9ca3af",
                    textDecoration: "none",
                    padding: "12px",
                  }}
                >
                  Entrar
                </Link>
                <Link
                  href="/register"
                  className="btn-gold"
                  style={{ textAlign: "center" }}
                >
                  Começar grátis
                </Link>
              </>
            )}
          </div>
        </div>
      </motion.div>

      <style>{`
        @media (max-width: 768px) {
          .desktop-nav { display: none !important; }
          .mobile-menu-btn { display: block !important; }
        }
      `}</style>
    </motion.header>
  );
}
