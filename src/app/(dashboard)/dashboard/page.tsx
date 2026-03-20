import { createClient } from "@/lib/supabase/server";
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

      <DashboardClient
        agendamentosHoje={agendamentosHoje || []}
        totalProximas={semana?.length ?? 0}
        totalHoje={agendamentosHoje?.length ?? 0}
        confirmadosHoje={confirmadosHoje}
        totalPendentes={pendentes?.length ?? 0}
      />
    </div>
  );
}
