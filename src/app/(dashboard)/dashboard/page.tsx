import { createClient } from "@/lib/supabase/server";

export default async function DashboardPage() {
  const hoje = new Date().toISOString().split("T")[0];

  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return;

  const { data: perfil } = await supabase
    .from("profissionais")
    .select("id")
    .eq("user_id", user.id)
    .single();

  if (!perfil) return;

  const { data: agendamentosHoje } = await supabase
    .from("agendamentos")
    .select(
      `
    *,
    clientes(nome, telefone),
    servicos(nome, duracao_minutos)
  `,
    )
    .eq("profissional_id", perfil.id)
    .eq("data", hoje)
    .in("status", ["pendente", "confirmado"])
    .order("hora_inicio", { ascending: true });

  const { data: pendentes } = await supabase
    .from("agendamentos")
    .select("id")
    .eq("profissional_id", perfil.id)
    .eq("status", "pendente");

  const agora = new Date();
  const horaAtual = agora.getHours() * 60 + agora.getMinutes(); // em minutos

  const proximoCliente = agendamentosHoje?.find((ag) => {
    const [h, m] = ag.hora_inicio.split(":").map(Number);
    const horaAg = h * 60 + m;
    return horaAg >= horaAtual;
  });
  return (
    <div>
      <h1 className="text-2xl font-bold text-foreground mb-8">Bom dia 👋</h1>
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-card border border-border rounded-lg p-6">
          <p className="text-xs uppercase tracking-widest text-muted-foreground mb-2">
            Sessões hoje
          </p>
          <p className="text-4xl font-bold text-foreground">
            {agendamentosHoje?.length ?? 0}
          </p>
        </div>
        <div className="bg-card border border-border rounded-lg p-6">
          <p className="text-xs uppercase tracking-widest text-muted-foreground mb-2">
            Pendentes
          </p>
          <p className="text-4xl font-bold text-foreground">
            {pendentes?.length ?? 0}
          </p>
        </div>
        <div className="bg-card border border-border rounded-lg p-6">
          <p className="text-xs uppercase tracking-widest text-muted-foreground mb-2">
            Próximo cliente
          </p>
          <p className="text-lg font-bold text-foreground">
            {proximoCliente?.clientes?.nome ?? "—"}
          </p>
          <p className="text-sm text-muted-foreground mt-1">
            {proximoCliente?.hora_inicio?.slice(0, 5) ?? "Nenhum hoje"}
          </p>
        </div>
      </div>
    </div>
  );
}
