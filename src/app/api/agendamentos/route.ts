import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

export async function POST(req: NextRequest) {
  const supabase = createAdminClient();
  const body = await req.json();
  const {
    profissional_id,
    servico_id,
    data,
    hora_inicio,
    hora_fim,
    valor,
    nome,
    telefone,
    email,
    local_corpo,
    referencia_url,
    anamnese,
  } = body;

  let clienteId: string;
  const { data: existente } = await supabase
    .from("clientes")
    .select("id")
    .eq("telefone", telefone)
    .maybeSingle();

  if (existente) {
    clienteId = existente.id;
  } else {
    const { data: novo, error } = await supabase
      .from("clientes")
      .insert({ nome, telefone, email })
      .select("id")
      .single();
    if (error || !novo)
      return NextResponse.json(
        { error: "Erro ao criar cliente" },
        { status: 500 },
      );
    clienteId = novo.id;
  }

  const { error: agError } = await supabase.from("agendamentos").insert({
    profissional_id,
    cliente_id: clienteId,
    servico_id,
    data,
    hora_inicio,
    hora_fim,
    status: "pendente",
    valor,
    local_corpo: local_corpo || null,
    referencia_url: referencia_url || null,
    anamnese: anamnese || null,
  });

  if (agError)
    return NextResponse.json(
      { error: "Erro ao criar agendamento" },
      { status: 500 },
    );

  return NextResponse.json({ ok: true });
}
