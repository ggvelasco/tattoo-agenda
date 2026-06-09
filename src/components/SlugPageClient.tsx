"use client";

import { useState } from "react";
import Link from "next/link";
import { Clock, ArrowRight, MessageCircle, Image as ImageIcon } from "lucide-react";

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

function formatarDuracao(minutos: number): string {
  if (minutos < 60) return `${minutos}min`;
  const h = Math.floor(minutos / 60);
  const m = minutos % 60;
  return m === 0 ? `${h}h` : `${h}h${m}min`;
}

export default function SlugPageClient({
  slug,
  servicos,
  whatsapp,
  nome,
}: Props) {
  const [tab, setTab] = useState<"servicos" | "portfolio">("servicos");

  return (
    <div className="space-y-6">
      {/* SEGMENTED TABS */}
      <div className="flex justify-center">
        <div className="inline-flex bg-muted/40 p-1.5 rounded-2xl border border-border/30 gap-1.5">
          <button
            className={`px-5 py-2 text-xs font-bold rounded-xl transition-all uppercase tracking-wider ${
              tab === "servicos"
                ? "bg-background text-foreground shadow-sm border border-border/40"
                : "text-muted-foreground hover:text-foreground border border-transparent"
            }`}
            onClick={() => setTab("servicos")}
          >
            Serviços
          </button>
          <button
            className="px-5 py-2 text-xs font-bold rounded-xl text-muted-foreground/30 border border-transparent cursor-not-allowed flex items-center gap-1.5"
            disabled
          >
            Portfólio
            <span className="text-[9px] bg-muted/45 text-muted-foreground/60 px-1.5 py-0.5 rounded-md uppercase tracking-wider font-semibold">Breve</span>
          </button>
        </div>
      </div>

      {/* SERVIÇOS */}
      {tab === "servicos" && (
        <div className="flex flex-col gap-3">
          {servicos.length === 0 ? (
            <div className="text-center py-16 text-muted-foreground text-sm border border-dashed border-border/60 rounded-2xl bg-card/40">
              Nenhum serviço cadastrado ainda.
            </div>
          ) : (
            servicos.map((s, i) => (
              <div
                key={s.id}
                className="bg-card border border-border rounded-2xl p-5 md:p-6 hover:border-primary/30 hover:bg-muted/5 transition-all duration-200 shadow-sm group"
                style={{
                  animationDelay: `${i * 0.05}s`,
                  animation: "fadeUp 0.4s ease both",
                }}
              >
                {/* TOPO */}
                <div className="flex justify-between items-start gap-4 mb-2 flex-wrap sm:flex-nowrap">
                  <h3 className="text-sm font-bold text-foreground font-display leading-tight flex-1">
                    {s.nome}
                  </h3>
                  <span
                    className={`inline-flex items-center text-[11px] font-bold px-3 py-1 rounded-full font-sans tracking-wide shrink-0 ${
                      s.tipo_preco === "sob_consulta"
                        ? "bg-muted text-muted-foreground border border-border/40"
                        : "bg-primary/10 text-primary border border-primary/20"
                    }`}
                  >
                    {s.precoFormatado}
                  </span>
                </div>

                {/* DESCRIÇÃO */}
                {s.descricao && (
                  <p className="text-xs text-muted-foreground leading-relaxed mb-4 font-light">
                    {s.descricao}
                  </p>
                )}

                {/* DURAÇÃO */}
                <div className="flex items-center gap-1.5 text-muted-foreground/75 text-[11px] font-semibold mb-5">
                  <Clock className="w-3.5 h-3.5 text-muted-foreground/60" />
                  <span>Duração: {formatarDuracao(s.duracao_minutos)}</span>
                </div>

                {/* BOTÃO */}
                <Link
                  href={`/${slug}/agendar?servico=${s.id}`}
                  className="w-full inline-flex items-center justify-center gap-2 bg-muted hover:bg-primary hover:text-primary-foreground border border-border/60 hover:border-primary py-3 px-4 rounded-xl text-xs font-bold transition-all uppercase tracking-wider shadow-sm select-none"
                >
                  Agendar este serviço
                  <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-1" />
                </Link>
              </div>
            ))
          )}

          {/* WHATSAPP */}
          {whatsapp && (
            <a
              href={`https://wa.me/55${whatsapp.replace(/\D/g, "")}?text=${encodeURIComponent(`Olá ${nome}! Vi sua página no Tattooagenda e gostaria de tirar uma dúvida.`)}`}
              target="_blank"
              className="w-full inline-flex items-center justify-center gap-2 border border-green-500/10 hover:border-green-500/25 bg-green-500/5 hover:bg-green-500/10 text-green-400 py-3.5 px-4 rounded-xl text-xs font-bold transition-all uppercase tracking-wider shadow-sm mt-2 select-none"
            >
              <MessageCircle className="w-4 h-4 shrink-0" />
              Tirar dúvida no WhatsApp
            </a>
          )}
        </div>
      )}

      {/* PORTFOLIO */}
      {tab === "portfolio" && (
        <div className="flex flex-col items-center justify-center py-20 px-6 text-center gap-3 border border-dashed border-border/60 rounded-2xl bg-card/40">
          <ImageIcon className="w-8 h-8 text-muted-foreground/30" />
          <p className="text-xs text-muted-foreground font-semibold uppercase tracking-wider">Portfólio em breve</p>
        </div>
      )}
    </div>
  );
}
