"use client";

import { useEffect, useState } from "react";
import { useParams, useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Calendar } from "@/components/ui/calendar";
import { ptBR } from "date-fns/locale";
import Link from "next/link";

type Servico = {
  id: string;
  nome: string;
  descricao: string | null;
  duracao_minutos: number;
  preco: number;
};
type Profissional = { id: string; nome: string; slug: string };
const STEPS = ["Serviço", "Data & hora", "Seus dados"];

export default function AgendarPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const slug = params.slug as string;
  const servicoParam = searchParams.get("servico");

  const [step, setStep] = useState(1);
  const [profissional, setProfissional] = useState<Profissional | null>(null);
  const [servicos, setServicos] = useState<Servico[]>([]);
  const [servicoSelecionado, setServicoSelecionado] = useState<Servico | null>(
    null,
  );
  const [dataSelecionada, setDataSelecionada] = useState<Date | undefined>(
    undefined,
  );
  const [horarioSelecionado, setHorarioSelecionado] = useState<string>("");
  const [slotsDisponiveis, setSlotsDisponiveis] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [nomeCliente, setNomeCliente] = useState("");
  const [telefone, setTelefone] = useState("");
  const [email, setEmail] = useState("");
  const [salvando, setSalvando] = useState(false);
  const [concluido, setConcluido] = useState(false);

  useEffect(() => {
    fetchDados();
  }, []);

  async function fetchDados() {
    const supabase = createClient();
    const { data: perfil } = await supabase
      .from("profissionais")
      .select("id, nome, slug")
      .eq("slug", slug)
      .single();
    if (!perfil) return;
    setProfissional(perfil);
    const { data: svcs } = await supabase
      .from("servicos")
      .select("*")
      .eq("profissional_id", perfil.id)
      .eq("ativo", true);
    setServicos(svcs || []);
    if (servicoParam && svcs) {
      const found = svcs.find((s) => s.id === servicoParam);
      if (found) {
        setServicoSelecionado(found);
        setStep(2);
      }
    }
    setLoading(false);
  }

  async function buscarSlots(data: Date) {
    if (!profissional || !servicoSelecionado) return;
    const supabase = createClient();
    const dataStr = data.toISOString().split("T")[0];
    const diaSemana = new Date(dataStr + "T12:00:00").getDay();
    const { data: disp } = await supabase
      .from("disponibilidade")
      .select("*")
      .eq("profissional_id", profissional.id)
      .eq("dia_semana", diaSemana)
      .eq("ativo", true)
      .single();
    if (!disp) {
      setSlotsDisponiveis([]);
      return;
    }
    const { data: ags } = await supabase
      .from("agendamentos")
      .select("hora_inicio, hora_fim")
      .eq("profissional_id", profissional.id)
      .eq("data", dataStr)
      .in("status", ["pendente", "confirmado"]);
    const slots: string[] = [];
    const dur = servicoSelecionado.duracao_minutos;
    const toMin = (t: string) => {
      const [h, m] = t.split(":").map(Number);
      return h * 60 + m;
    };
    const toTime = (m: number) =>
      `${Math.floor(m / 60)
        .toString()
        .padStart(2, "0")}:${(m % 60).toString().padStart(2, "0")}`;
    for (
      let a = toMin(disp.hora_inicio);
      a + dur <= toMin(disp.hora_fim);
      a += dur
    ) {
      const busy = ags?.some(
        (ag) => a < toMin(ag.hora_fim) && a + dur > toMin(ag.hora_inicio),
      );
      if (!busy) slots.push(toTime(a));
    }
    setSlotsDisponiveis(slots);
  }

  async function confirmarAgendamento() {
    if (
      !profissional ||
      !servicoSelecionado ||
      !dataSelecionada ||
      !horarioSelecionado
    )
      return;
    setSalvando(true);

    const [h, m] = horarioSelecionado.split(":").map(Number);
    const fimMin = h * 60 + m + servicoSelecionado.duracao_minutos;
    const horaFim = `${Math.floor(fimMin / 60)
      .toString()
      .padStart(2, "0")}:${(fimMin % 60).toString().padStart(2, "0")}`;

    // cria cliente e agendamento no servidor (seguro)
    const res = await fetch("/api/agendamentos", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        profissional_id: profissional.id,
        servico_id: servicoSelecionado.id,
        data: dataSelecionada.toISOString().split("T")[0],
        hora_inicio: horarioSelecionado,
        hora_fim: horaFim,
        valor: servicoSelecionado.preco,
        nome: nomeCliente,
        telefone,
        email,
      }),
    });

    if (!res.ok) {
      setSalvando(false);
      return;
    }

    // envia email
    const supabase = createClient();
    const { data: perfilCompleto } = await supabase
      .from("profissionais")
      .select("nome, email")
      .eq("id", profissional.id)
      .single();

    await fetch("/api/notificacoes/email", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        tatuadorEmail: perfilCompleto?.email,
        tatuadorNome: perfilCompleto?.nome,
        clienteNome: nomeCliente,
        clienteTelefone: telefone,
        servico: servicoSelecionado.nome,
        data: dataSelecionada.toLocaleDateString("pt-BR"),
        hora: horarioSelecionado,
      }),
    });

    setSalvando(false);
    setConcluido(true);
  }

  if (loading)
    return (
      <div
        style={{
          minHeight: "100vh",
          backgroundColor: "#0A0A0A",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <div
          style={{
            width: "28px",
            height: "28px",
            border: "2px solid #2a2a2a",
            borderTopColor: "#C5A059",
            borderRadius: "9999px",
            animation: "spin .7s linear infinite",
          }}
        />
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );

  if (concluido)
    return (
      <div
        style={{
          minHeight: "100vh",
          backgroundColor: "#0A0A0A",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "24px",
        }}
      >
        <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;600&family=Unbounded:wght@400;700;900&display=swap');
        @keyframes fadeUp { from { opacity:0; transform:translateY(16px); } to { opacity:1; transform:translateY(0); } }
        @keyframes scaleIn { from { opacity:0; transform:scale(.7); } to { opacity:1; transform:scale(1); } }
        .done-icon { animation: scaleIn .4s cubic-bezier(.34,1.56,.64,1) both; }
        .done-text { animation: fadeUp .4s .15s ease both; }
        .done-sub  { animation: fadeUp .4s .25s ease both; }
        .done-link { animation: fadeUp .4s .35s ease both; }
      `}</style>
        <div style={{ textAlign: "center", maxWidth: "360px" }}>
          <div
            className="done-icon"
            style={{
              width: "72px",
              height: "72px",
              borderRadius: "9999px",
              border: "2px solid rgba(197,160,89,0.4)",
              backgroundColor: "rgba(197,160,89,0.08)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              margin: "0 auto 24px",
              fontSize: "28px",
              color: "#C5A059",
            }}
          >
            ✓
          </div>
          <h2
            className="done-text"
            style={{
              fontFamily: "'Unbounded', serif",
              fontSize: "22px",
              fontWeight: 900,
              textTransform: "uppercase",
              color: "white",
              marginBottom: "12px",
            }}
          >
            Solicitação enviada!
          </h2>
          <p
            className="done-sub"
            style={{
              color: "#9ca3af",
              fontSize: "14px",
              lineHeight: "1.7",
              marginBottom: "32px",
              fontFamily: "'Inter', sans-serif",
              fontWeight: 300,
            }}
          >
            {profissional?.nome} entrará em contato pelo WhatsApp para confirmar
            sua sessão.
          </p>
          <Link
            href={`/${slug}`}
            className="done-link"
            style={{
              color: "#6b7280",
              fontSize: "12px",
              textTransform: "uppercase",
              letterSpacing: ".12em",
              textDecoration: "none",
              fontFamily: "'Inter', sans-serif",
              transition: "color .2s",
              display: "inline-block",
            }}
          >
            ← Voltar ao perfil
          </Link>
        </div>
      </div>
    );

  return (
    <div
      style={{ minHeight: "100vh", backgroundColor: "#0A0A0A", color: "white" }}
    >
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;600&family=Unbounded:wght@400;700;900&display=swap');
        *, *::before, *::after { box-sizing: border-box; margin:0; padding:0; }
        html { scroll-behavior: smooth; }
        body { font-family:'Inter',sans-serif; -webkit-font-smoothing:antialiased; }
        .font-display { font-family:'Unbounded',serif; }

        @keyframes fadeUp { from { opacity:0; transform:translateY(16px); } to { opacity:1; transform:translateY(0); } }
        .fade-in { animation: fadeUp .45s ease both; }
        .fade-in-2 { animation: fadeUp .45s .08s ease both; }
        .fade-in-3 { animation: fadeUp .45s .16s ease both; }

        /* PROGRESS STEP */
        .step-circle {
          width:28px; height:28px; border-radius:9999px;
          display:flex; align-items:center; justify-content:center;
          font-size:12px; font-weight:700; font-family:'Unbounded',serif;
          transition: all .3s ease;
        }
        .step-done { background:#C5A059; color:#0A0A0A; }
        .step-active { background:#1A1A1A; color:white; border:2px solid #C5A059; }
        .step-idle { background:#111; color:#444; border:2px solid #222; }

        /* SERVICE OPTION */
        .service-opt {
          width:100%; text-align:left; padding:20px;
          border-radius:14px; border:1px solid rgba(255,255,255,0.06);
          background:#1A1A1A; cursor:pointer;
          transition: border-color .2s, transform .2s, box-shadow .2s;
          display:block;
        }
        .service-opt:hover { border-color:rgba(197,160,89,0.3); transform:translateY(-2px); box-shadow:0 8px 24px rgba(0,0,0,0.4); }
        .service-opt.selected { border-color:#C5A059; background:rgba(197,160,89,0.05); }

        /* SLOT */
        .slot-btn {
          padding:10px 0; border-radius:10px;
          font-size:12px; font-weight:700; letter-spacing:.04em;
          border:1px solid #222; background:#1A1A1A; color:#666;
          cursor:pointer; transition: all .2s;
          font-family:'Inter',sans-serif;
        }
        .slot-btn:hover { border-color:rgba(197,160,89,0.4); color:#C5A059; }
        .slot-btn.selected { border-color:#C5A059; background:rgba(197,160,89,0.1); color:#C5A059; }

        /* INPUTS */
        .field-input {
          width:100%; background:#111; border:1px solid #222;
          color:white; font-size:14px; padding:14px 16px;
          border-radius:12px; font-family:'Inter',sans-serif;
          transition: border-color .2s; outline:none;
        }
        .field-input:focus { border-color:rgba(197,160,89,0.5); }
        .field-input::placeholder { color:#444; }

        /* BTNS */
        .btn-primary {
          flex:1; padding:14px; border-radius:9999px;
          background:#C5A059; color:#0A0A0A;
          font-size:12px; font-weight:700;
          text-transform:uppercase; letter-spacing:.12em;
          border:none; cursor:pointer; font-family:'Inter',sans-serif;
          transition: background .2s, transform .15s, box-shadow .2s;
        }
        .btn-primary:hover { background:white; transform:translateY(-1px); box-shadow:0 6px 16px rgba(197,160,89,0.3); }
        .btn-primary:disabled { opacity:.3; cursor:not-allowed; transform:none; box-shadow:none; }

        .btn-secondary {
          flex:1; padding:14px; border-radius:9999px;
          background:transparent; color:#666;
          font-size:12px; font-weight:700;
          text-transform:uppercase; letter-spacing:.12em;
          border:1px solid #2a2a2a; cursor:pointer; font-family:'Inter',sans-serif;
          transition: border-color .2s, color .2s;
        }
        .btn-secondary:hover { border-color:#444; color:white; }

        /* CALENDAR OVERRIDES */
        .rdp { --rdp-accent-color: #C5A059 !important; --rdp-background-color: rgba(197,160,89,0.1) !important; }
      `}</style>

      {/* NAV */}
      <nav
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "20px 24px",
          borderBottom: "1px solid rgba(255,255,255,0.05)",
        }}
      >
        <Link
          href={`/${slug}`}
          style={{
            color: "#666",
            fontSize: "12px",
            textTransform: "uppercase",
            letterSpacing: ".1em",
            textDecoration: "none",
            fontFamily: "'Inter',sans-serif",
            transition: "color .2s",
          }}
          onMouseEnter={(e) => (e.currentTarget.style.color = "white")}
          onMouseLeave={(e) => (e.currentTarget.style.color = "#666")}
        >
          ← {profissional?.nome}
        </Link>
        <span
          className="font-display"
          style={{
            fontSize: "13px",
            fontWeight: 700,
            textTransform: "uppercase",
            letterSpacing: "-.01em",
          }}
        >
          TATTOO<span style={{ color: "#C5A059" }}>AGENDA</span>
        </span>
      </nav>

      <div
        style={{
          maxWidth: "560px",
          margin: "0 auto",
          padding: "40px 24px 60px",
        }}
      >
        {/* PROGRESS */}
        <div className="fade-in" style={{ marginBottom: "40px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "0" }}>
            {STEPS.map((label, i) => (
              <div
                key={i}
                style={{
                  display: "flex",
                  alignItems: "center",
                  flex: i < STEPS.length - 1 ? "1" : "none",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "8px",
                    flexShrink: 0,
                  }}
                >
                  <div
                    className={`step-circle ${step > i + 1 ? "step-done" : step === i + 1 ? "step-active" : "step-idle"}`}
                  >
                    {step > i + 1 ? "✓" : i + 1}
                  </div>
                  <span
                    style={{
                      fontSize: "11px",
                      fontFamily: "'Inter',sans-serif",
                      color:
                        step === i + 1
                          ? "white"
                          : step > i + 1
                            ? "#666"
                            : "#333",
                      display: "none",
                    }}
                    className="sm-show"
                  >
                    {label}
                  </span>
                </div>
                {i < STEPS.length - 1 && (
                  <div
                    style={{
                      flex: 1,
                      height: "1px",
                      margin: "0 12px",
                      background: step > i + 1 ? "#C5A059" : "#222",
                      transition: "background .4s",
                    }}
                  />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* STEP 1 */}
        {step === 1 && (
          <div>
            <h2
              className="font-display fade-in"
              style={{
                fontSize: "20px",
                fontWeight: 900,
                textTransform: "uppercase",
                marginBottom: "6px",
              }}
            >
              Escolha o serviço
            </h2>
            <p
              className="fade-in-2"
              style={{
                color: "#666",
                fontSize: "13px",
                marginBottom: "24px",
                fontFamily: "'Inter',sans-serif",
              }}
            >
              Selecione o que você deseja realizar
            </p>
            <div
              className="fade-in-3"
              style={{
                display: "flex",
                flexDirection: "column",
                gap: "12px",
                marginBottom: "28px",
              }}
            >
              {servicos.map((s) => (
                <button
                  key={s.id}
                  onClick={() => setServicoSelecionado(s)}
                  className={`service-opt ${servicoSelecionado?.id === s.id ? "selected" : ""}`}
                >
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "flex-start",
                      gap: "12px",
                    }}
                  >
                    <div style={{ flex: 1 }}>
                      <p
                        style={{
                          fontFamily: "'Unbounded',serif",
                          fontSize: "14px",
                          fontWeight: 700,
                          marginBottom: "6px",
                          color: "white",
                        }}
                      >
                        {s.nome}
                      </p>
                      {s.descricao && (
                        <p
                          style={{
                            color: "#9ca3af",
                            fontSize: "13px",
                            lineHeight: "1.5",
                            marginBottom: "6px",
                            fontWeight: 300,
                          }}
                        >
                          {s.descricao}
                        </p>
                      )}
                      <p style={{ color: "#555", fontSize: "12px" }}>
                        {s.duracao_minutos} minutos
                      </p>
                    </div>
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "12px",
                        flexShrink: 0,
                      }}
                    >
                      <span
                        style={{
                          fontFamily: "'Unbounded',serif",
                          fontSize: "15px",
                          fontWeight: 700,
                          color: "#C5A059",
                        }}
                      >
                        R$ {Number(s.preco).toFixed(0)}
                      </span>
                      <div
                        style={{
                          width: "20px",
                          height: "20px",
                          borderRadius: "9999px",
                          border:
                            servicoSelecionado?.id === s.id
                              ? "2px solid #C5A059"
                              : "2px solid #333",
                          background:
                            servicoSelecionado?.id === s.id
                              ? "#C5A059"
                              : "transparent",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          transition: "all .2s",
                          flexShrink: 0,
                        }}
                      >
                        {servicoSelecionado?.id === s.id && (
                          <div
                            style={{
                              width: "7px",
                              height: "7px",
                              borderRadius: "9999px",
                              background: "#0A0A0A",
                            }}
                          />
                        )}
                      </div>
                    </div>
                  </div>
                </button>
              ))}
            </div>
            <button
              onClick={() => servicoSelecionado && setStep(2)}
              disabled={!servicoSelecionado}
              className="btn-primary"
              style={{ width: "100%" }}
            >
              Continuar
            </button>
          </div>
        )}

        {/* STEP 2 */}
        {step === 2 && (
          <div>
            <h2
              className="font-display fade-in"
              style={{
                fontSize: "20px",
                fontWeight: 900,
                textTransform: "uppercase",
                marginBottom: "6px",
              }}
            >
              Data e horário
            </h2>
            <p
              className="fade-in-2"
              style={{
                color: "#666",
                fontSize: "13px",
                marginBottom: "24px",
                fontFamily: "'Inter',sans-serif",
              }}
            >
              Escolha quando deseja ser atendido
            </p>
            <div
              className="fade-in-3"
              style={{
                background: "#1A1A1A",
                borderRadius: "16px",
                border: "1px solid rgba(255,255,255,0.05)",
                padding: "16px",
                marginBottom: "20px",
              }}
            >
              <Calendar
                mode="single"
                selected={dataSelecionada}
                onSelect={(date) => {
                  setDataSelecionada(date);
                  setHorarioSelecionado("");
                  if (date) buscarSlots(date);
                }}
                disabled={(date) =>
                  date < new Date(new Date().setHours(0, 0, 0, 0))
                }
                locale={ptBR}
                className="bg-transparent [--cell-size:2rem] text-sm w-full"
              />
            </div>
            {dataSelecionada && slotsDisponiveis.length === 0 && (
              <div
                style={{
                  background: "#1A1A1A",
                  borderRadius: "14px",
                  border: "1px solid rgba(255,255,255,0.05)",
                  padding: "24px",
                  textAlign: "center",
                  marginBottom: "20px",
                }}
              >
                <p style={{ color: "#555", fontSize: "13px" }}>
                  Nenhum horário disponível nesta data
                </p>
              </div>
            )}
            {slotsDisponiveis.length > 0 && (
              <div style={{ marginBottom: "28px" }}>
                <p
                  style={{
                    fontSize: "11px",
                    fontWeight: 700,
                    letterSpacing: ".15em",
                    textTransform: "uppercase",
                    color: "#555",
                    marginBottom: "12px",
                    fontFamily: "'Inter',sans-serif",
                  }}
                >
                  Horários disponíveis
                </p>
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(4,1fr)",
                    gap: "8px",
                  }}
                >
                  {slotsDisponiveis.map((slot) => (
                    <button
                      key={slot}
                      onClick={() => setHorarioSelecionado(slot)}
                      className={`slot-btn ${horarioSelecionado === slot ? "selected" : ""}`}
                    >
                      {slot}
                    </button>
                  ))}
                </div>
              </div>
            )}
            <div style={{ display: "flex", gap: "12px" }}>
              <button onClick={() => setStep(1)} className="btn-secondary">
                Voltar
              </button>
              <button
                onClick={() => horarioSelecionado && setStep(3)}
                disabled={!horarioSelecionado}
                className="btn-primary"
              >
                Continuar
              </button>
            </div>
          </div>
        )}

        {/* STEP 3 */}
        {step === 3 && (
          <div>
            <h2
              className="font-display fade-in"
              style={{
                fontSize: "20px",
                fontWeight: 900,
                textTransform: "uppercase",
                marginBottom: "6px",
              }}
            >
              Seus dados
            </h2>
            <p
              className="fade-in-2"
              style={{
                color: "#666",
                fontSize: "13px",
                marginBottom: "24px",
                fontFamily: "'Inter',sans-serif",
              }}
            >
              Precisamos de algumas informações
            </p>

            {/* RESUMO */}
            <div
              className="fade-in-3"
              style={{
                background: "#1A1A1A",
                borderRadius: "14px",
                border: "1px solid rgba(255,255,255,0.05)",
                padding: "20px",
                marginBottom: "24px",
              }}
            >
              {[
                { label: "Serviço", value: servicoSelecionado?.nome },
                {
                  label: "Data",
                  value: dataSelecionada?.toLocaleDateString("pt-BR"),
                },
                { label: "Horário", value: horarioSelecionado },
              ].map((row) => (
                <div
                  key={row.label}
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    marginBottom: "10px",
                  }}
                >
                  <span
                    style={{
                      color: "#555",
                      fontSize: "12px",
                      fontFamily: "'Inter',sans-serif",
                    }}
                  >
                    {row.label}
                  </span>
                  <span
                    style={{
                      color: "white",
                      fontSize: "12px",
                      fontWeight: 600,
                      fontFamily: "'Inter',sans-serif",
                    }}
                  >
                    {row.value}
                  </span>
                </div>
              ))}
              <div
                style={{
                  borderTop: "1px solid rgba(255,255,255,0.05)",
                  paddingTop: "12px",
                  marginTop: "4px",
                  display: "flex",
                  justifyContent: "space-between",
                }}
              >
                <span style={{ color: "#555", fontSize: "12px" }}>Valor</span>
                <span
                  style={{
                    color: "#C5A059",
                    fontSize: "15px",
                    fontWeight: 700,
                    fontFamily: "'Unbounded',serif",
                  }}
                >
                  R$ {Number(servicoSelecionado?.preco).toFixed(2)}
                </span>
              </div>
            </div>

            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: "16px",
                marginBottom: "28px",
              }}
            >
              {[
                {
                  label: "Nome completo",
                  value: nomeCliente,
                  set: setNomeCliente,
                  type: "text",
                  ph: "Seu nome",
                },
                {
                  label: "WhatsApp",
                  value: telefone,
                  set: setTelefone,
                  type: "tel",
                  ph: "(11) 99999-9999",
                },
                {
                  label: "E-mail (opcional)",
                  value: email,
                  set: setEmail,
                  type: "email",
                  ph: "seu@email.com",
                },
              ].map((f) => (
                <div key={f.label}>
                  <label
                    style={{
                      display: "block",
                      fontSize: "11px",
                      fontWeight: 700,
                      letterSpacing: ".15em",
                      textTransform: "uppercase",
                      color: "#555",
                      marginBottom: "8px",
                      fontFamily: "'Inter',sans-serif",
                    }}
                  >
                    {f.label}
                  </label>
                  <input
                    type={f.type}
                    value={f.value}
                    onChange={(e) => f.set(e.target.value)}
                    placeholder={f.ph}
                    className="field-input"
                  />
                </div>
              ))}
            </div>

            <div style={{ display: "flex", gap: "12px" }}>
              <button onClick={() => setStep(2)} className="btn-secondary">
                Voltar
              </button>
              <button
                onClick={confirmarAgendamento}
                disabled={salvando || !nomeCliente || !telefone}
                className="btn-primary"
              >
                {salvando ? "Enviando..." : "Confirmar"}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
