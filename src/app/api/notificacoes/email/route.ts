import { resend } from "@/lib/resend";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const {
    tatuadorEmail,
    tatuadorNome,
    clienteNome,
    clienteTelefone,
    servico,
    data,
    hora,
  } = await req.json();

  await resend.emails.send({
    from: "Tattooagenda <onboarding@resend.dev>",
    to: tatuadorEmail,
    subject: `Você recebeu um novo agendamento! — ${clienteNome}`,
    html: `
      <div style="font-family: sans-serif; max-width: 480px; margin: 0 auto; padding: 32px;">
        <h2 style="font-size: 20px; margin-bottom: 8px;">Novo agendamento recebido</h2>
        <p style="color: #666; margin-bottom: 24px;">Olá ${tatuadorNome}, você recebeu um novo agendamento.</p>
        
        <div style="border: 1px solid #e5e5e5; padding: 20px; border-radius: 8px; margin-bottom: 24px;">
          <p style="margin: 0 0 8px;"><strong>Cliente:</strong> ${clienteNome}</p>
          <p style="margin: 0 0 8px;"><strong>WhatsApp:</strong> ${clienteTelefone}</p>
          <p style="margin: 0 0 8px;"><strong>Serviço:</strong> ${servico}</p>
          <p style="margin: 0 0 8px;"><strong>Data:</strong> ${data}</p>
          <p style="margin: 0;"><strong>Horário:</strong> ${hora}</p>
        </div>

        <p style="color: #666; font-size: 14px;">Acesse o painel para confirmar ou cancelar o agendamento.</p>
      </div>
    `,
  });

  return NextResponse.json({ ok: true });
}
