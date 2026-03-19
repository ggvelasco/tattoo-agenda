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
          {proximoCliente?.clientes?.telefone && (
            <a
              href={`https://wa.me/55${proximoCliente.clientes.telefone.replace(/\D/g, "")}?text=${encodeURIComponent(`Olá ${proximoCliente.clientes.nome}! Confirmando sua sessão de ${proximoCliente.servicos?.nome} hoje às ${proximoCliente.hora_inicio?.slice(0, 5)}.`)}`}
              target="_blank"
              className="inline-flex items-center gap-1.5 mt-3 text-xs text-green-400 hover:text-green-300 transition px-3 py-1.5 border border-green-400/30 rounded-md"
            >
              <svg
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="currentColor"
              >
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
              </svg>
              Chamar no WhatsApp
            </a>
          )}
        </div>
      </div>
    </div>
  );
}
