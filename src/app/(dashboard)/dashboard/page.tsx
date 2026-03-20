import { createClient } from "@/lib/supabase/server";
import { CalendarDays, AlertCircle } from "lucide-react";
import DashboardClient from "@/components/dashboard/DashboardClient";

export default async function DashboardPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const { data: perfil } = await supabase
    .from("profissionais")
    .select("id, nome")
    .eq("user_id", user.id)
    .single();

  if (!perfil) return null;

  const agora = new Date();
  const hoje = `${agora.getFullYear()}-${String(agora.getMonth() + 1).padStart(2, "0")}-${String(agora.getDate()).padStart(2, "0")}`;
  const hora = agora.getHours();
  const saudacao =
    hora < 12 ? "Bom dia" : hora < 18 ? "Boa tarde" : "Boa noite";

  const { data: agendamentosHoje } = await supabase
    .from("agendamentos")
    .select(`*, clientes(nome, telefone), servicos(nome, duracao_minutos)`)
    .eq("profissional_id", perfil.id)
    .eq("data", hoje)
    .in("status", ["pendente", "confirmado"])
    .order("hora_inicio", { ascending: true });

  const { data: pendentes } = await supabase
    .from("agendamentos")
    .select("id")
    .eq("profissional_id", perfil.id)
    .eq("status", "pendente");

  const { data: semana } = await supabase
    .from("agendamentos")
    .select("id")
    .eq("profissional_id", perfil.id)
    .in("status", ["pendente", "confirmado"])
    .gte("data", hoje);

  const confirmadosHoje =
    agendamentosHoje?.filter((ag) => ag.status === "confirmado").length ?? 0;

  return (
    <div className="space-y-8">
      {/* HEADER */}
      <div>
        <h1 className="text-2xl font-bold text-foreground">
          {saudacao}, {perfil.nome.split(" ")[0]} 👋
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          {agora.toLocaleDateString("pt-BR", {
            weekday: "long",
            day: "numeric",
            month: "long",
          })}
        </p>
      </div>

      {/* CARDS ESTÁTICOS */}
      <div className="grid grid-cols-2 gap-4">
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
            {agendamentosHoje?.length ?? 0}
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
          <p className="text-3xl font-bold text-foreground">
            {pendentes?.length ?? 0}
          </p>
          <p className="text-xs text-muted-foreground">
            Aguardando confirmação
          </p>
        </div>
      </div>

      {/* CARDS DINÂMICOS + LISTA — dependem do horário do browser */}
      <DashboardClient
        agendamentosHoje={agendamentosHoje || []}
        totalProximas={semana?.length ?? 0}
      />
    </div>
  );
}
