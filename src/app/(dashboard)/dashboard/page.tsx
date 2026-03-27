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
    .select("id, nome, foto_url, slug")
    .eq("user_id", user.id)
    .single();

  if (!perfil) return null;

  // busca agendamentos dos próximos 2 dias pra cobrir virada de dia no cliente
  // o DashboardClient vai filtrar pelo dia correto usando o horário do browser
  const hoje = new Date();
  const amanha = new Date(hoje);
  amanha.setDate(amanha.getDate() + 1);

  const dataHojeUTC = hoje.toISOString().split("T")[0];
  const dataAmanhaUTC = amanha.toISOString().split("T")[0];

  // busca agendamentos dos dois dias possíveis
  const { data: agendamentosRaw } = await supabase
    .from("agendamentos")
    .select(`*, clientes(nome, telefone), servicos(nome, duracao_minutos)`)
    .eq("profissional_id", perfil.id)
    .in("data", [dataHojeUTC, dataAmanhaUTC])
    .in("status", ["pendente", "confirmado"])
    .order("hora_inicio", { ascending: true });

  const { data: pendentes } = await supabase
    .from("agendamentos")
    .select("id")
    .eq("profissional_id", perfil.id)
    .eq("status", "pendente");

  // para "próximas sessões" usamos data >= hoje UTC (pode ter 1 dia de diferença mas é aceitável)
  const { data: semana } = await supabase
    .from("agendamentos")
    .select("id")
    .eq("profissional_id", perfil.id)
    .in("status", ["pendente", "confirmado"])
    .gte("data", dataHojeUTC);

  return (
    <DashboardClient
      nomeUsuario={perfil.nome.split(" ")[0]}
      fotoUrl={perfil.foto_url}
      slug={perfil.slug}
      agendamentosRaw={agendamentosRaw || []}
      totalPendentes={pendentes?.length ?? 0}
      totalProximas={semana?.length ?? 0}
    />
  );
}
