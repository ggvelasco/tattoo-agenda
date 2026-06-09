import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import AgendaClient from "@/components/dashboard/AgendaClient";

export default async function AgendaPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: perfil } = await supabase
    .from("profissionais")
    .select("id")
    .eq("user_id", user.id)
    .single();

  if (!perfil) redirect("/login");

  const { data: agendamentosRaw } = await supabase
    .from("agendamentos")
    .select(`
      *,
      clientes(nome, telefone, email),
      servicos(nome, duracao_minutos)
    `)
    .eq("profissional_id", perfil.id)
    .order("data", { ascending: true })
    .order("hora_inicio", { ascending: true });

  const { data: disponibilidadeRaw } = await supabase
    .from("disponibilidade")
    .select("*")
    .eq("profissional_id", perfil.id);

  return (
    <AgendaClient
      agendamentosRaw={agendamentosRaw || []}
      disponibilidade={disponibilidadeRaw || []}
      profissionalId={perfil.id}
    />
  );
}
