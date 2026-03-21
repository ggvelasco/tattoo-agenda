"use client";

import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { useMemo, useState } from "react";
import {
  CalendarDays,
  Clock,
  User,
  AlertCircle,
  CheckCircle2,
  TrendingUp,
  ImageIcon,
} from "lucide-react";
import { VisuallyHidden } from "radix-ui";

type Agendamento = {
  id: string;
  data: string;
  hora_inicio: string;
  status: string;
  local_corpo: string | null;
  referencia_url: string | null;
  clientes: { nome: string; telefone: string } | null;
  servicos: { nome: string; duracao_minutos: number } | null;
};

type Props = {
  nomeUsuario: string;
  agendamentosRaw: Agendamento[];
  totalPendentes: number;
  totalProximas: number;
};

const WA_SVG = (size = 14) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
  </svg>
);

export default function DashboardClient({
  nomeUsuario,
  agendamentosRaw,
  totalPendentes,
  totalProximas,
}: Props) {
  const agora = new Date();
  const horaAtual = agora.getHours() * 60 + agora.getMinutes();
  const hora = agora.getHours();
  const saudacao =
    hora < 12 ? "Bom dia" : hora < 18 ? "Boa tarde" : "Boa noite";
  const hoje = `${agora.getFullYear()}-${String(agora.getMonth() + 1).padStart(2, "0")}-${String(agora.getDate()).padStart(2, "0")}`;

  const agendamentosHoje = useMemo(
    () => agendamentosRaw.filter((ag) => ag.data === hoje),
    [agendamentosRaw, hoje],
  );

  const confirmadosHoje = agendamentosHoje.filter(
    (ag) => ag.status === "confirmado",
  ).length;

  const proximoCliente = agendamentosHoje.find((ag) => {
    const [h, m] = ag.hora_inicio.split(":").map(Number);
    return h * 60 + m >= horaAtual;
  });

  const agendamentosOrdenados = useMemo(
    () =>
      [...agendamentosHoje].sort((a, b) => {
        const [ah, am] = a.hora_inicio.split(":").map(Number);
        const [bh, bm] = b.hora_inicio.split(":").map(Number);
        const aMin = ah * 60 + am;
        const bMin = bh * 60 + bm;
        const aPassou = aMin < horaAtual;
        const bPassou = bMin < horaAtual;
        if (aPassou && !bPassou) return 1;
        if (!aPassou && bPassou) return -1;
        return aMin - bMin;
      }),
    [agendamentosHoje, horaAtual],
  );

  const [imagemAberta, setImagemAberta] = useState<string | null>(null);

  return (
    <div className="space-y-8">
      {/* HEADER */}
      <div>
        <h1 className="text-2xl font-bold text-foreground">
          {saudacao}, {nomeUsuario} 👋
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          {agora.toLocaleDateString("pt-BR", {
            weekday: "long",
            day: "numeric",
            month: "long",
          })}
        </p>
      </div>

      {/* 4 CARDS */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-card border border-border rounded-xl p-5 space-y-3">
          <div className="flex items-center justify-between">
            <p className="text-xs font-medium uppercase tracking-widest text-muted-foreground">
              Sessões hoje
            </p>
            <div className="w-8 h-8 rounded-lg bg-blue-500/10 flex items-center justify-center">
              <CalendarDays className="w-4 h-4 text-blue-400" />
            </div>
          </div>
          <p className="text-3xl font-bold text-foreground">
            {agendamentosHoje.length}
          </p>
          <p className="text-xs text-muted-foreground">
            {confirmadosHoje} confirmado{confirmadosHoje !== 1 ? "s" : ""}
          </p>
        </div>

        <div className="bg-card border border-border rounded-xl p-5 space-y-3">
          <div className="flex items-center justify-between">
            <p className="text-xs font-medium uppercase tracking-widest text-muted-foreground">
              Pendentes
            </p>
            <div className="w-8 h-8 rounded-lg bg-yellow-500/10 flex items-center justify-center">
              <AlertCircle className="w-4 h-4 text-yellow-400" />
            </div>
          </div>
          <p className="text-3xl font-bold text-foreground">{totalPendentes}</p>
          <p className="text-xs text-muted-foreground">
            Aguardando confirmação
          </p>
        </div>

        <div className="bg-card border border-border rounded-xl p-5 space-y-3">
          <div className="flex items-center justify-between">
            <p className="text-xs font-medium uppercase tracking-widest text-muted-foreground">
              Próximo
            </p>
            <div className="w-8 h-8 rounded-lg bg-green-500/10 flex items-center justify-center">
              <User className="w-4 h-4 text-green-400" />
            </div>
          </div>
          <div>
            <p className="text-base font-bold text-foreground leading-tight">
              {proximoCliente?.clientes?.nome ?? "—"}
            </p>
            <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
              <Clock className="w-3 h-3" />
              {proximoCliente?.hora_inicio?.slice(0, 5) ?? "Nenhum hoje"}
            </p>
          </div>
          {proximoCliente?.clientes?.telefone && (
            <a
              href={`https://wa.me/55${proximoCliente.clientes.telefone.replace(/\D/g, "")}?text=${encodeURIComponent(`Olá ${proximoCliente.clientes.nome}! Confirmando sua sessão de ${proximoCliente.servicos?.nome} hoje às ${proximoCliente.hora_inicio?.slice(0, 5)}.`)}`}
              target="_blank"
              className="inline-flex items-center gap-1.5 text-xs text-green-400 hover:text-green-300 transition-colors"
            >
              {WA_SVG(12)}
              Chamar no WhatsApp
            </a>
          )}
        </div>

        <div className="bg-card border border-border rounded-xl p-5 space-y-3">
          <div className="flex items-center justify-between">
            <p className="text-xs font-medium uppercase tracking-widest text-muted-foreground">
              Próximas
            </p>
            <div className="w-8 h-8 rounded-lg bg-purple-500/10 flex items-center justify-center">
              <TrendingUp className="w-4 h-4 text-purple-400" />
            </div>
          </div>
          <p className="text-3xl font-bold text-foreground">{totalProximas}</p>
          <p className="text-xs text-muted-foreground">A partir de hoje</p>
        </div>
      </div>

      {/* LISTA DE HOJE */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold uppercase tracking-widest text-muted-foreground">
            Agenda de hoje
          </h2>
          {agendamentosHoje.length > 0 && (
            <span className="text-xs text-muted-foreground">
              {agendamentosHoje.length}{" "}
              {agendamentosHoje.length === 1 ? "sessão" : "sessões"}
            </span>
          )}
        </div>

        {agendamentosOrdenados.length > 0 ? (
          <div className="space-y-3">
            {agendamentosOrdenados.map((ag) => {
              const [h, m] = ag.hora_inicio.split(":").map(Number);
              const jaPassou = h * 60 + m < horaAtual;
              const isProximo = proximoCliente?.id === ag.id;

              return (
                <div
                  key={ag.id}
                  className={`bg-card border rounded-xl p-4 flex items-center justify-between gap-4 transition-all ${
                    isProximo
                      ? "border-green-500/30 bg-green-500/5"
                      : jaPassou
                        ? "border-border opacity-50"
                        : "border-border"
                  }`}
                >
                  <div className="flex items-center gap-4 flex-1 min-w-0">
                    {/* HORÁRIO */}
                    <div className="text-center min-w-[48px]">
                      <p
                        className={`text-base font-bold ${jaPassou ? "text-muted-foreground" : "text-foreground"}`}
                      >
                        {ag.hora_inicio.slice(0, 5)}
                      </p>
                    </div>
                    <div className="w-px h-10 bg-border flex-shrink-0" />

                    {/* INFO */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className="font-semibold text-foreground text-sm">
                          {ag.clientes?.nome}
                        </p>
                        {isProximo && (
                          <span className="text-xs bg-green-500/15 text-green-400 px-2 py-0.5 rounded-full">
                            próximo
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {ag.servicos?.nome} · {ag.servicos?.duracao_minutos}min
                      </p>
                      {ag.local_corpo && (
                        <p className="text-xs text-muted-foreground mt-0.5 flex items-center gap-1">
                          📍 {ag.local_corpo}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* AÇÕES */}
                  <div className="flex items-center gap-2 flex-shrink-0">
                    {/* THUMBNAIL REFERÊNCIA */}
                    {ag.referencia_url && (
                      <button
                        onClick={() => setImagemAberta(ag.referencia_url)}
                        title="Ver referência"
                        className="relative flex-shrink-0 group"
                      >
                        <img
                          src={ag.referencia_url}
                          alt="Referência"
                          className="w-10 h-10 rounded-lg object-cover border border-border group-hover:border-primary transition-colors"
                        />
                        <div className="absolute inset-0 rounded-lg bg-black/0 group-hover:bg-black/30 transition-colors flex items-center justify-center">
                          <ImageIcon className="w-3 h-3 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                        </div>
                      </button>
                    )}

                    {/* STATUS */}
                    <div className="flex items-center gap-1.5 w-24 justify-end">
                      {ag.status === "confirmado" ? (
                        <CheckCircle2 className="w-4 h-4 text-green-400" />
                      ) : (
                        <AlertCircle className="w-4 h-4 text-yellow-400" />
                      )}
                      <span
                        className={`text-xs font-medium ${ag.status === "confirmado" ? "text-green-400" : "text-yellow-400"}`}
                      >
                        {ag.status}
                      </span>
                    </div>

                    {/* WHATSAPP */}
                    {ag.clientes?.telefone && (
                      <a
                        href={`https://wa.me/55${ag.clientes.telefone.replace(/\D/g, "")}?text=${encodeURIComponent(`Olá ${ag.clientes.nome}! Sobre sua sessão de ${ag.servicos?.nome} hoje às ${ag.hora_inicio.slice(0, 5)}.`)}`}
                        target="_blank"
                        className="w-8 h-8 shrink-0 rounded-lg bg-green-500/10 flex items-center justify-center text-green-400 hover:bg-green-500/20 transition-colors"
                      >
                        {WA_SVG(14)}
                      </a>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="border border-dashed border-border rounded-xl p-12 text-center">
            <CalendarDays className="w-8 h-8 text-muted-foreground mx-auto mb-3 opacity-40" />
            <p className="text-sm text-muted-foreground">
              Nenhuma sessão hoje.
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              Aproveite para descansar! 🎨
            </p>
          </div>
        )}
        <Dialog
          open={!!imagemAberta}
          onOpenChange={(open) => !open && setImagemAberta(null)}
        >
          <DialogContent className="max-w-2xl p-2">
            <VisuallyHidden.Root>
              <DialogTitle>Imagem de referência</DialogTitle>
            </VisuallyHidden.Root>
            {imagemAberta && (
              <img
                src={imagemAberta}
                alt="Referência do cliente"
                className="w-full rounded-lg object-contain max-h-[80vh]"
              />
            )}
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
