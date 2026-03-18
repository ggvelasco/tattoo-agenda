"use client";

import Link from "next/link";
import { motion } from "framer-motion";

export default function HomeNavbarClient({
  isLoggedIn,
}: {
  isLoggedIn: boolean;
}) {
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
          {isLoggedIn ? (
            <Link href="/dashboard" className="btn-gold">
              Ir para o painel
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
      </div>
    </motion.header>
  );
}
