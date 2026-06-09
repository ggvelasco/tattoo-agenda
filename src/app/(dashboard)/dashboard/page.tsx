import { createClient } from "@/lib/supabase/server";
import DashboardClient from "@/components/dashboard/DashboardClient";
import { redirect } from "next/navigation";

export default async function DashboardPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: perfil } = await supabase
    .from("profissionais")
    .select("id, nome, foto_url, slug")
    .eq("user_id", user.id)
    .single();

  if (!perfil) redirect("/login");

  // Fetch agendamentos
  const { data: agendamentosRaw } = await supabase
    .from("agendamentos")
    .select(`
      id,
      data,
      hora_inicio,
      status,
      local_corpo,
      referencia_url,
      clientes (id, nome, telefone),
      servicos (nome, duracao_minutos)
    `)
    .eq("profissional_id", perfil.id)
    .order("data", { ascending: true })
    .order("hora_inicio", { ascending: true });

  const rawList = (agendamentosRaw as any) || [];

  // Obter IDs de clientes únicos para contar agendamentos históricos
  const clientIds = Array.from(
    new Set(
      rawList
        .map((ag: any) => {
          const c = Array.isArray(ag.clientes) ? ag.clientes[0] : ag.clientes;
          return c?.id;
        })
        .filter(Boolean)
    )
  ) as string[];

  const returningClientIds = new Set<string>();
  if (clientIds.length > 0) {
    const { data: counts } = await supabase
      .from("agendamentos")
      .select("cliente_id")
      .in("cliente_id", clientIds)
      .eq("profissional_id", perfil.id);

    const countMap: Record<string, number> = {};
    counts?.forEach((c) => {
      if (c.cliente_id) {
        countMap[c.cliente_id] = (countMap[c.cliente_id] || 0) + 1;
      }
    });

    Object.entries(countMap).forEach(([cid, count]) => {
      if (count > 1) {
        returningClientIds.add(cid);
      }
    });
  }

  const agendamentos = rawList.map((ag: any) => {
    const clienteObj = Array.isArray(ag.clientes) ? ag.clientes[0] : ag.clientes;
    const servicoObj = Array.isArray(ag.servicos) ? ag.servicos[0] : ag.servicos;
    return {
      id: ag.id,
      data: ag.data,
      hora_inicio: ag.hora_inicio,
      status: ag.status,
      local_corpo: ag.local_corpo,
      referencia_url: ag.referencia_url,
      clientes: clienteObj ? { nome: clienteObj.nome, telefone: clienteObj.telefone } : null,
      servicos: servicoObj ? { nome: servicoObj.nome, duracao_minutos: servicoObj.duracao_minutos } : null,
      is_retornando: clienteObj?.id ? returningClientIds.has(clienteObj.id) : false,
    };
  });
  const hoje = new Date().toISOString().split("T")[0];

  // ── MOCK TEMPORÁRIO PARA TESTES ─────────────────────────────────
  // const dateObj = new Date();
  // dateObj.setMinutes(dateObj.getMinutes() + 30);
  // const horaProximaMock = `${String(dateObj.getHours()).padStart(2, "0")}:${String(dateObj.getMinutes()).padStart(2, "0")}`;

  // const agendamentos = [
  //   {
  //     id: "mock-1",
  //     data: hoje,
  //     hora_inicio: horaProximaMock,
  //     status: "confirmado",
  //     local_corpo: "Antebraço",
  //     referencia_url: "https://images.unsplash.com/photo-1598371839696-5c5bb00bdc28?w=500&auto=format&fit=crop&q=60",
  //     clientes: { nome: "Gus Dev (Mock)", telefone: "11999999999" },
  //     servicos: { nome: "Tatuagem Blackwork", duracao_minutos: 120 }
  //   },
  //   {
  //     id: "mock-2",
  //     data: hoje,
  //     hora_inicio: "20:00",
  //     status: "pendente",
  //     local_corpo: "Perna",
  //     referencia_url: null,
  //     clientes: { nome: "Mariana Silva (Mock)", telefone: "11988888888" },
  //     servicos: { nome: "Fineline Delicada", duracao_minutos: 60 }
  //   }
  // ];
  // ────────────────────────────────────────────────────────────────

  const totalPendentes = agendamentos.filter((ag: any) => ag.status === "pendente").length;
  
  // Obter data de hoje no formato YYYY-MM-DD no fuso local/UTC (usando a data atual do servidor)
  const totalProximas = agendamentos.filter((ag: any) => ag.data >= hoje).length;

  // Onboarding Checks
  const { count: servicesCount } = await supabase
    .from("servicos")
    .select("*", { count: "exact", head: true })
    .eq("profissional_id", perfil.id)
    .eq("ativo", true);

  const { count: availabilityCount } = await supabase
    .from("disponibilidade")
    .select("*", { count: "exact", head: true })
    .eq("profissional_id", perfil.id);

  const onboarding = {
    hasServices: (servicesCount || 0) > 0,
    hasAvailability: (availabilityCount || 0) > 0,
    hasProfile: !!(perfil.slug && perfil.foto_url),
  };

  return (
    <DashboardClient
      nomeUsuario={perfil.nome.split(" ")[0]}
      fotoUrl={perfil.foto_url}
      slug={perfil.slug}
      agendamentosRaw={agendamentos}
      totalPendentes={totalPendentes}
      totalProximas={totalProximas}
      onboarding={onboarding}
    />
  );
}
