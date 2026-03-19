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
    from: "Tattooagenda <noreply@tattooagenda.ink>",
    to: tatuadorEmail,
    subject: `Você recebeu um novo agendamento! — ${clienteNome}`,
    html: `
<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Novo agendamento</title>
</head>
<body style="margin:0;padding:0;background-color:#0A0A0A;font-family:'Helvetica Neue',Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#0A0A0A;padding:40px 20px;">
    <tr>
      <td align="center">
        <table width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;">

          <!-- LOGO -->
          <tr>
            <td align="center" style="padding-bottom:32px;">
              <span style="font-family:'Helvetica Neue',Arial,sans-serif;font-size:20px;font-weight:900;text-transform:uppercase;letter-spacing:-0.02em;color:white;">
                TATTOO<span style="color:#C5A059;">AGENDA</span>
              </span>
            </td>
          </tr>

          <!-- CARD PRINCIPAL -->
          <tr>
            <td style="background-color:#111111;border-radius:16px;overflow:hidden;border:1px solid rgba(255,255,255,0.06);">

              <!-- HEADER DO CARD -->
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td style="padding:32px 32px 24px;border-bottom:1px solid rgba(255,255,255,0.06);">
                    <table cellpadding="0" cellspacing="0">
                      <tr>
                        <td style="width:40px;height:40px;background:rgba(197,160,89,0.1);border-radius:10px;text-align:center;vertical-align:middle;">
                          <span style="font-size:18px;">📅</span>
                        </td>
                        <td style="padding-left:14px;">
                          <p style="margin:0;font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:0.15em;color:#C5A059;">Novo agendamento</p>
                          <p style="margin:4px 0 0;font-size:18px;font-weight:700;color:white;">Você recebeu uma sessão!</p>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>

              <!-- DETALHES -->
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td style="padding:24px 32px;">
                    <p style="margin:0 0 20px;font-size:14px;color:#6b7280;font-weight:300;line-height:1.6;">
                      Olá <strong style="color:white;font-weight:600;">${tatuadorNome}</strong>, um novo agendamento foi realizado na sua página.
                    </p>

                    <!-- INFO ROWS -->
                    <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:24px;">
                      <tr>
                        <td style="padding:12px 0;border-bottom:1px solid rgba(255,255,255,0.04);">
                          <table width="100%" cellpadding="0" cellspacing="0">
                            <tr>
                              <td style="font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:0.1em;color:#555555;">Cliente</td>
                              <td align="right" style="font-size:14px;font-weight:600;color:white;">${clienteNome}</td>
                            </tr>
                          </table>
                        </td>
                      </tr>
                      <tr>
                        <td style="padding:12px 0;border-bottom:1px solid rgba(255,255,255,0.04);">
                          <table width="100%" cellpadding="0" cellspacing="0">
                            <tr>
                              <td style="font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:0.1em;color:#555555;">WhatsApp</td>
                              <td align="right" style="font-size:14px;font-weight:600;color:#C5A059;">${clienteTelefone}</td>
                            </tr>
                          </table>
                        </td>
                      </tr>
                      <tr>
                        <td style="padding:12px 0;border-bottom:1px solid rgba(255,255,255,0.04);">
                          <table width="100%" cellpadding="0" cellspacing="0">
                            <tr>
                              <td style="font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:0.1em;color:#555555;">Serviço</td>
                              <td align="right" style="font-size:14px;font-weight:600;color:white;">${servico}</td>
                            </tr>
                          </table>
                        </td>
                      </tr>
                      <tr>
                        <td style="padding:12px 0;border-bottom:1px solid rgba(255,255,255,0.04);">
                          <table width="100%" cellpadding="0" cellspacing="0">
                            <tr>
                              <td style="font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:0.1em;color:#555555;">Data</td>
                              <td align="right" style="font-size:14px;font-weight:600;color:white;">${data}</td>
                            </tr>
                          </table>
                        </td>
                      </tr>
                      <tr>
                        <td style="padding:12px 0;">
                          <table width="100%" cellpadding="0" cellspacing="0">
                            <tr>
                              <td style="font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:0.1em;color:#555555;">Horário</td>
                              <td align="right" style="font-size:14px;font-weight:600;color:white;">${hora}</td>
                            </tr>
                          </table>
                        </td>
                      </tr>
                    </table>

                    <!-- CTA -->
                    <table width="100%" cellpadding="0" cellspacing="0">
                      <tr>
                        <td align="center">
                          <a href="https://tattooagenda.ink/dashboard/agendamentos"
                            style="display:inline-block;background-color:#C5A059;color:#0A0A0A;text-decoration:none;padding:14px 32px;border-radius:9999px;font-size:12px;font-weight:700;text-transform:uppercase;letter-spacing:0.12em;">
                            Ver no painel →
                          </a>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>

            </td>
          </tr>

          <!-- FOOTER -->
          <tr>
            <td align="center" style="padding-top:28px;">
              <p style="margin:0 0 8px;font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:0.15em;color:#2a2a2a;">
                <span style="color:#FAF9F6;">TATTOO<span style="color:#C5A059;">AGENDA</span>
              </p>
              <p style="margin:0;font-size:11px;color:#D3D3D3;">
                tattooagenda.ink · Você está recebendo este email porque alguém agendou na sua página.
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
`,
  });

  return NextResponse.json({ ok: true });
}
