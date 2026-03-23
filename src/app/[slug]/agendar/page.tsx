"use client";

import { useEffect, useState } from "react";
import { useParams, useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Calendar } from "@/components/ui/calendar";
import { ptBR } from "date-fns/locale";
import Link from "next/link";
import { toast, Toaster } from "sonner";

type Servico = {
  id: string;
  nome: string;
  descricao: string | null;
  duracao_minutos: number;
  preco: number;
};
type Profissional = { id: string; nome: string; slug: string };

type Anamnese = {
  alergia: boolean | null;
  alergia_desc: string;
  diabetes: boolean | null;
  condicao_pele: boolean | null;
  condicao_pele_desc: string;
  gravida: boolean | null;
  medicamentos: boolean | null;
  medicamentos_desc: string;
  menor_idade: boolean | null;
  responsavel: string;
  aceite: boolean;
};

const ANAMNESE_INICIAL: Anamnese = {
  alergia: null,
  alergia_desc: "",
  diabetes: null,
  condicao_pele: null,
  condicao_pele_desc: "",
  gravida: null,
  medicamentos: null,
  medicamentos_desc: "",
  menor_idade: null,
  responsavel: "",
  aceite: false,
};

const PERGUNTAS: {
  key: keyof Anamnese;
  label: string;
  descKey?: keyof Anamnese;
  descPlaceholder?: string;
}[] = [
  {
    key: "alergia",
    label: "Tem alguma alergia?",
    descKey: "alergia_desc",
    descPlaceholder: "Qual alergia?",
  },
  { key: "diabetes", label: "Tem diabetes?" },
  {
    key: "condicao_pele",
    label: "Tem alguma condição de pele? (psoríase, eczema, queloides...)",
    descKey: "condicao_pele_desc",
    descPlaceholder: "Qual condição?",
  },
  { key: "gravida", label: "Está grávida ou amamentando?" },
  {
    key: "medicamentos",
    label:
      "Faz uso contínuo de algum medicamento? (anticoagulantes, antidepressivos, isotretinoína...)",
    descKey: "medicamentos_desc",
    descPlaceholder: "Qual medicamento?",
  },
  {
    key: "menor_idade",
    label: "É menor de idade?",
    descKey: "responsavel",
    descPlaceholder: "Nome completo do responsável",
  },
];

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
  const [slotsDisponiveis, setSlotsDisponiveis] = useState<
    { hora: string; disponivel: boolean }[]
  >([]);
  const [loading, setLoading] = useState(true);
  const [nomeCliente, setNomeCliente] = useState("");
  const [telefone, setTelefone] = useState("");
  const [email, setEmail] = useState("");
  const [salvando, setSalvando] = useState(false);
  const [concluido, setConcluido] = useState(false);
  const [localCorpo, setLocalCorpo] = useState("");
  const [referenciaFile, setReferenciaFile] = useState<File | null>(null);
  const [referenciaPreview, setReferenciaPreview] = useState<string | null>(
    null,
  );
  const [uploadando, setUploadando] = useState(false);
  const [anamnese, setAnamnese] = useState<Anamnese>(ANAMNESE_INICIAL);

  // verifica se todas as perguntas da anamnese foram respondidas
  const anamneseCompleta = PERGUNTAS.every((p) => anamnese[p.key] !== null);
  const podeConfirmar =
    !salvando &&
    !uploadando &&
    !!nomeCliente &&
    !!telefone &&
    anamneseCompleta &&
    anamnese.aceite;

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
    const slots: { hora: string; disponivel: boolean }[] = [];
    const dur = servicoSelecionado.duracao_minutos;
    const toMin = (t: string) => {
      const [h, m] = t.split(":").map(Number);
      return h * 60 + m;
    };
    const toTime = (m: number) =>
      `${Math.floor(m / 60)
        .toString()
        .padStart(2, "0")}:${(m % 60).toString().padStart(2, "0")}`;
    const agora = new Date();
    const dataHoje = `${agora.getFullYear()}-${String(agora.getMonth() + 1).padStart(2, "0")}-${String(agora.getDate()).padStart(2, "0")}`;
    const isHoje = dataStr === dataHoje;
    const minutosAgora = agora.getHours() * 60 + agora.getMinutes();
    for (
      let a = toMin(disp.hora_inicio);
      a + dur <= toMin(disp.hora_fim);
      a += dur
    ) {
      const busy = ags?.some(
        (ag) => a < toMin(ag.hora_fim) && a + dur > toMin(ag.hora_inicio),
      );
      const jaPassou = isHoje && a < minutosAgora;
      if (!jaPassou) slots.push({ hora: toTime(a), disponivel: !busy });
    }
    setSlotsDisponiveis(slots);
  }

  function handleReferenciaChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const tiposPermitidos = ["image/jpeg", "image/png", "image/webp"];
    if (!tiposPermitidos.includes(file.type)) {
      toast.error("Formato não suportado", {
        description: "Apenas imagens JPG, PNG ou WEBP são permitidas.",
      });
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      toast.error("Imagem muito grande", {
        description: "A imagem deve ter no máximo 5MB.",
      });
      return;
    }
    setReferenciaFile(file);
    const reader = new FileReader();
    reader.onload = () => setReferenciaPreview(reader.result as string);
    reader.readAsDataURL(file);
  }

  function updateAnamnese(
    field: keyof Anamnese,
    value: boolean | string | null,
  ) {
    setAnamnese((prev) => ({ ...prev, [field]: value }));
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

    let referenciaUrl = null;
    if (referenciaFile) {
      setUploadando(true);
      const supabase = createClient();
      const ext = referenciaFile.name.split(".").pop();
      const fileName = `${profissional.id}-${Date.now()}.${ext}`;
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from("referencias")
        .upload(fileName, referenciaFile);
      if (!uploadError && uploadData) {
        const { data: urlData } = supabase.storage
          .from("referencias")
          .getPublicUrl(uploadData.path);
        referenciaUrl = urlData.publicUrl;
      }
      setUploadando(false);
    }

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
        local_corpo: localCorpo,
        referencia_url: referenciaUrl,
        anamnese,
      }),
    });

    if (!res.ok) {
      setSalvando(false);
      return;
    }

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
            width: "24px",
            height: "24px",
            border: "2px solid #2a2a2a",
            borderTopColor: "#9ca3af",
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
              width: "64px",
              height: "64px",
              borderRadius: "9999px",
              border: "1px solid rgba(255,255,255,0.12)",
              backgroundColor: "rgba(255,255,255,0.04)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              margin: "0 auto 24px",
              fontSize: "22px",
              color: "#e5e7eb",
            }}
          >
            ✓
          </div>
          <h2
            className="done-text"
            style={{
              fontFamily: "'Unbounded', serif",
              fontSize: "20px",
              fontWeight: 900,
              textTransform: "uppercase",
              color: "#e5e7eb",
              marginBottom: "12px",
            }}
          >
            Solicitação enviada!
          </h2>
          <p
            className="done-sub"
            style={{
              color: "#6b7280",
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
              color: "#4b5563",
              fontSize: "11px",
              textTransform: "uppercase",
              letterSpacing: ".12em",
              textDecoration: "none",
              fontFamily: "'Inter', sans-serif",
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
      <Toaster theme="system" position="top-center" />
      <style>{`
        *, *::before, *::after { box-sizing: border-box; margin:0; padding:0; }
        body { font-family:'Inter',sans-serif; -webkit-font-smoothing:antialiased; }
        .font-display { font-family:'Unbounded',serif; }
        @keyframes fadeUp { from { opacity:0; transform:translateY(16px); } to { opacity:1; transform:translateY(0); } }
        .fade-in   { animation: fadeUp .45s ease both; }
        .fade-in-2 { animation: fadeUp .45s .08s ease both; }
        .fade-in-3 { animation: fadeUp .45s .16s ease both; }
        .step-circle { width:28px; height:28px; border-radius:9999px; display:flex; align-items:center; justify-content:center; font-size:11px; font-weight:700; font-family:'Unbounded',serif; transition: all .3s ease; }
        .step-done   { background:#e5e7eb; color:#0A0A0A; }
        .step-active { background:#1c1c1c; color:#e5e7eb; border:1.5px solid #e5e7eb; }
        .step-idle   { background:#141414; color:#4b5563; border:1.5px solid #262626; }
        .service-opt { width:100%; text-align:left; padding:20px; border-radius:14px; border:1px solid #222; background:#141414; cursor:pointer; transition: border-color .2s, background .2s, transform .2s, box-shadow .2s; display:block; }
        .service-opt:hover { border-color:#3a3a3a; background:#181818; transform:translateY(-1px); box-shadow:0 8px 24px rgba(0,0,0,0.35); }
        .service-opt.selected { border-color:#9ca3af; background:#1a1a1a; }
        .slot-btn { padding:10px 0; border-radius:10px; font-size:12px; font-weight:600; letter-spacing:.03em; border:1px solid #222; background:#141414; color:#6b7280; cursor:pointer; transition: all .2s; font-family:'Inter',sans-serif; }
        .slot-btn:hover:not(:disabled) { border-color:#6b7280; color:#e5e7eb; background:#1c1c1c; }
        .slot-btn.selected { border-color:#e5e7eb; background:#1c1c1c; color:#e5e7eb; }
        .field-input { width:100%; background:#141414; border:1px solid #2a2a2a; color:#e5e7eb; font-size:14px; padding:13px 16px; border-radius:12px; font-family:'Inter',sans-serif; font-weight:300; transition: border-color .2s, background .2s; outline:none; }
        .field-input:focus { border-color:#6b7280; background:#181818; }
        .field-input::placeholder { color:#4b5563; }
        .btn-primary { flex:1; padding:14px; border-radius:9999px; background:#e5e7eb; color:#0A0A0A; font-size:11px; font-weight:700; text-transform:uppercase; letter-spacing:.12em; border:none; cursor:pointer; font-family:'Inter',sans-serif; transition: background .2s, transform .15s, box-shadow .2s; }
        .btn-primary:hover { background:white; transform:translateY(-1px); box-shadow:0 8px 20px rgba(255,255,255,0.1); }
        .btn-primary:disabled { opacity:.35; cursor:not-allowed; transform:none; box-shadow:none; }
        .btn-secondary { flex:1; padding:14px; border-radius:9999px; background:transparent; color:#6b7280; font-size:11px; font-weight:700; text-transform:uppercase; letter-spacing:.12em; border:1px solid #2a2a2a; cursor:pointer; font-family:'Inter',sans-serif; transition: border-color .2s, color .2s; }
        .btn-secondary:hover { border-color:#6b7280; color:#e5e7eb; }
        .rdp { --rdp-accent-color:#e5e7eb !important; --rdp-background-color:rgba(255,255,255,0.06) !important; }
        .upload-area { border:1px dashed #2a2a2a; border-radius:12px; padding:32px; text-align:center; cursor:pointer; transition: border-color .2s, background .2s; }
        .upload-area:hover { border-color:#4b5563; background:#141414; }
        .toggle-btn { padding:5px 16px; border-radius:9999px; font-size:11px; font-weight:700; font-family:'Inter',sans-serif; cursor:pointer; transition: all .2s; border:1px solid #2a2a2a; background:transparent; color:#4b5563; }
        .toggle-btn.sim { border-color:#ef444450; background:rgba(239,68,68,0.1); color:#ef4444; }
        .toggle-btn.nao { border-color:#22c55e50; background:rgba(34,197,94,0.08); color:#22c55e; }
      `}</style>

      {/* NAV */}
      <nav
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "20px 24px",
          borderBottom: "1px solid #141414",
        }}
      >
        <Link
          href={`/${slug}`}
          style={{
            color: "#6b7280",
            fontSize: "12px",
            textTransform: "uppercase",
            letterSpacing: ".1em",
            textDecoration: "none",
            fontFamily: "'Inter',sans-serif",
            transition: "color .2s",
          }}
          onMouseEnter={(e) => (e.currentTarget.style.color = "#e5e7eb")}
          onMouseLeave={(e) => (e.currentTarget.style.color = "#6b7280")}
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
            color: "#e5e7eb",
          }}
        >
          <a href="/">
            TATTOO
            <span className="text-[#818cf8]">AGENDA</span>
          </a>
        </span>
      </nav>

      <div
        style={{
          maxWidth: "560px",
          margin: "0 auto",
          padding: "40px 24px 80px",
        }}
      >
        {/* PROGRESS */}
        <div className="fade-in" style={{ marginBottom: "40px" }}>
          <div style={{ display: "flex", alignItems: "center" }}>
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
                      color:
                        step === i + 1
                          ? "#e5e7eb"
                          : step > i + 1
                            ? "#6b7280"
                            : "#374151",
                    }}
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
                      background: step > i + 1 ? "#6b7280" : "#222",
                      transition: "background .4s",
                    }}
                  />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* STEP 1 — SERVIÇO */}
        {step === 1 && (
          <div>
            <h2
              className="font-display fade-in"
              style={{
                fontSize: "20px",
                fontWeight: 900,
                textTransform: "uppercase",
                marginBottom: "6px",
                color: "#e5e7eb",
              }}
            >
              Escolha o serviço
            </h2>
            <p
              className="fade-in-2"
              style={{
                color: "#6b7280",
                fontSize: "13px",
                marginBottom: "24px",
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
                          fontSize: "13px",
                          fontWeight: 700,
                          marginBottom: "6px",
                          color: "#e5e7eb",
                        }}
                      >
                        {s.nome}
                      </p>
                      {s.descricao && (
                        <p
                          style={{
                            color: "#6b7280",
                            fontSize: "13px",
                            lineHeight: "1.5",
                            marginBottom: "6px",
                            fontWeight: 300,
                          }}
                        >
                          {s.descricao}
                        </p>
                      )}
                      <p style={{ color: "#4b5563", fontSize: "12px" }}>
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
                          fontSize: "13px",
                          fontWeight: 700,
                          color: "#9ca3af",
                        }}
                      >
                        R$ {Number(s.preco).toFixed(0)}
                      </span>
                      <div
                        style={{
                          width: "18px",
                          height: "18px",
                          borderRadius: "9999px",
                          border:
                            servicoSelecionado?.id === s.id
                              ? "2px solid #e5e7eb"
                              : "2px solid #374151",
                          background:
                            servicoSelecionado?.id === s.id
                              ? "#e5e7eb"
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
                              width: "6px",
                              height: "6px",
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

        {/* STEP 2 — DATA E HORA */}
        {step === 2 && (
          <div>
            <h2
              className="font-display fade-in"
              style={{
                fontSize: "20px",
                fontWeight: 900,
                textTransform: "uppercase",
                marginBottom: "6px",
                color: "#e5e7eb",
              }}
            >
              Data e horário
            </h2>
            <p
              className="fade-in-2"
              style={{
                color: "#6b7280",
                fontSize: "13px",
                marginBottom: "24px",
              }}
            >
              Escolha quando deseja ser atendido
            </p>
            <div
              className="fade-in-3"
              style={{
                background: "#111",
                borderRadius: "16px",
                border: "1px solid #1e1e1e",
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
                  background: "#111",
                  borderRadius: "14px",
                  border: "1px solid #1e1e1e",
                  padding: "24px",
                  textAlign: "center",
                  marginBottom: "20px",
                }}
              >
                <p style={{ color: "#4b5563", fontSize: "13px" }}>
                  Nenhum horário disponível nesta data
                </p>
              </div>
            )}
            {slotsDisponiveis.length > 0 && (
              <div style={{ marginBottom: "28px" }}>
                <p
                  style={{
                    fontSize: "11px",
                    fontWeight: 600,
                    letterSpacing: ".15em",
                    textTransform: "uppercase",
                    color: "#4b5563",
                    marginBottom: "12px",
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
                      key={slot.hora}
                      onClick={() =>
                        slot.disponivel && setHorarioSelecionado(slot.hora)
                      }
                      disabled={!slot.disponivel}
                      className={`slot-btn ${!slot.disponivel ? "opacity-40 line-through cursor-not-allowed" : horarioSelecionado === slot.hora ? "selected" : ""}`}
                    >
                      {slot.hora}
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

        {/* STEP 3 — DADOS */}
        {step === 3 && (
          <div>
            <h2
              className="font-display fade-in"
              style={{
                fontSize: "20px",
                fontWeight: 900,
                textTransform: "uppercase",
                marginBottom: "6px",
                color: "#e5e7eb",
              }}
            >
              Seus dados
            </h2>
            <p
              className="fade-in-2"
              style={{
                color: "#6b7280",
                fontSize: "13px",
                marginBottom: "24px",
              }}
            >
              Precisamos de algumas informações
            </p>

            {/* RESUMO */}
            <div
              className="fade-in-3"
              style={{
                background: "#111",
                borderRadius: "14px",
                border: "1px solid #1e1e1e",
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
                  <span style={{ color: "#4b5563", fontSize: "12px" }}>
                    {row.label}
                  </span>
                  <span
                    style={{
                      color: "#d1d5db",
                      fontSize: "12px",
                      fontWeight: 500,
                    }}
                  >
                    {row.value}
                  </span>
                </div>
              ))}
              <div
                style={{
                  borderTop: "1px solid #1e1e1e",
                  paddingTop: "12px",
                  marginTop: "4px",
                  display: "flex",
                  justifyContent: "space-between",
                }}
              >
                <span style={{ color: "#4b5563", fontSize: "12px" }}>
                  Valor
                </span>
                <span
                  style={{
                    color: "#e5e7eb",
                    fontSize: "15px",
                    fontWeight: 700,
                    fontFamily: "'Unbounded',serif",
                  }}
                >
                  R$ {Number(servicoSelecionado?.preco).toFixed(2)}
                </span>
              </div>
            </div>

            {/* DADOS PESSOAIS */}
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
                      fontWeight: 600,
                      letterSpacing: ".12em",
                      textTransform: "uppercase",
                      color: "#6b7280",
                      marginBottom: "8px",
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

              {/* LOCAL DO CORPO */}
              <div>
                <label
                  style={{
                    display: "block",
                    fontSize: "11px",
                    fontWeight: 600,
                    letterSpacing: ".12em",
                    textTransform: "uppercase",
                    color: "#6b7280",
                    marginBottom: "8px",
                  }}
                >
                  Local do corpo
                </label>
                <input
                  type="text"
                  value={localCorpo}
                  onChange={(e) => setLocalCorpo(e.target.value)}
                  placeholder="Ex: antebraço direito, costela..."
                  className="field-input"
                />
              </div>

              {/* REFERÊNCIA */}
              <div>
                <label
                  style={{
                    display: "block",
                    fontSize: "11px",
                    fontWeight: 600,
                    letterSpacing: ".12em",
                    textTransform: "uppercase",
                    color: "#6b7280",
                    marginBottom: "8px",
                  }}
                >
                  Imagem de referência{" "}
                  <span
                    style={{
                      opacity: 0.5,
                      textTransform: "none",
                      letterSpacing: 0,
                      fontWeight: 400,
                    }}
                  >
                    (opcional)
                  </span>
                </label>
                <label style={{ display: "block", cursor: "pointer" }}>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleReferenciaChange}
                    style={{ display: "none" }}
                  />
                  {referenciaPreview ? (
                    <div
                      style={{
                        position: "relative",
                        borderRadius: "12px",
                        overflow: "hidden",
                        border: "1px solid #2a2a2a",
                      }}
                    >
                      <img
                        src={referenciaPreview}
                        alt="Referência"
                        style={{
                          width: "100%",
                          maxHeight: "220px",
                          objectFit: "cover",
                          display: "block",
                        }}
                      />
                      <div
                        style={{
                          position: "absolute",
                          inset: 0,
                          background: "rgba(0,0,0,0.55)",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          opacity: 0,
                          transition: "opacity .2s",
                        }}
                        onMouseEnter={(e) =>
                          (e.currentTarget.style.opacity = "1")
                        }
                        onMouseLeave={(e) =>
                          (e.currentTarget.style.opacity = "0")
                        }
                      >
                        <span
                          style={{
                            color: "#e5e7eb",
                            fontSize: "12px",
                            fontWeight: 600,
                          }}
                        >
                          Trocar imagem
                        </span>
                      </div>
                    </div>
                  ) : (
                    <div className="upload-area">
                      <p
                        style={{
                          color: "#6b7280",
                          fontSize: "13px",
                          marginBottom: "4px",
                        }}
                      >
                        Clique para enviar uma referência
                      </p>
                      <p style={{ color: "#374151", fontSize: "11px" }}>
                        JPG, PNG ou WEBP
                      </p>
                    </div>
                  )}
                </label>
              </div>
            </div>

            {/* ── FICHA DE ANAMNESE ─────────────────────────────── */}
            <div
              style={{
                borderTop: "1px solid #1f1f1f",
                paddingTop: "28px",
                marginBottom: "28px",
              }}
            >
              <div style={{ marginBottom: "20px" }}>
                <label
                  style={{
                    display: "block",
                    fontSize: "11px",
                    fontWeight: 600,
                    letterSpacing: ".12em",
                    textTransform: "uppercase",
                    color: "#6b7280",
                    marginBottom: "6px",
                  }}
                >
                  Ficha de Anamnese
                </label>
                <p
                  style={{
                    fontSize: "12px",
                    color: "#374151",
                    fontWeight: 300,
                    lineHeight: 1.6,
                  }}
                >
                  Informações necessárias para garantir sua segurança durante a
                  sessão. Responda todas as perguntas abaixo.
                </p>
              </div>

              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "10px",
                  marginBottom: "16px",
                }}
              >
                {PERGUNTAS.map(({ key, label, descKey, descPlaceholder }) => (
                  <div
                    key={key}
                    style={{
                      background: "#111",
                      border: `1px solid ${anamnese[key] === null ? "#1f1f1f" : anamnese[key] === true ? "#ef444425" : "#22c55e20"}`,
                      borderRadius: "12px",
                      padding: "14px 16px",
                      transition: "border-color .2s",
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        gap: "12px",
                      }}
                    >
                      <span
                        style={{
                          fontSize: "13px",
                          color: "#d1d5db",
                          fontWeight: 300,
                          lineHeight: 1.4,
                          flex: 1,
                        }}
                      >
                        {label}
                      </span>
                      <div
                        style={{ display: "flex", gap: "6px", flexShrink: 0 }}
                      >
                        <button
                          type="button"
                          onClick={() => updateAnamnese(key, false)}
                          className={`toggle-btn ${anamnese[key] === false ? "nao" : ""}`}
                        >
                          Não
                        </button>
                        <button
                          type="button"
                          onClick={() => updateAnamnese(key, true)}
                          className={`toggle-btn ${anamnese[key] === true ? "sim" : ""}`}
                        >
                          Sim
                        </button>
                      </div>
                    </div>
                    {descKey && anamnese[key] === true && (
                      <div style={{ marginTop: "10px" }}>
                        <input
                          type="text"
                          value={anamnese[descKey] as string}
                          onChange={(e) =>
                            updateAnamnese(descKey, e.target.value)
                          }
                          placeholder={descPlaceholder}
                          className="field-input"
                          style={{ fontSize: "13px", background: "#141414" }}
                        />
                      </div>
                    )}
                  </div>
                ))}
              </div>

              {/* ACEITE LEGAL */}
              <button
                type="button"
                onClick={() => updateAnamnese("aceite", !anamnese.aceite)}
                style={{
                  width: "100%",
                  textAlign: "left",
                  padding: "14px 16px",
                  borderRadius: "12px",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "flex-start",
                  gap: "12px",
                  border: anamnese.aceite
                    ? "1px solid rgba(34,197,94,0.25)"
                    : "1px solid #2a2a2a",
                  background: anamnese.aceite ? "rgba(34,197,94,0.05)" : "#111",
                  transition: "all .2s",
                }}
              >
                {/* checkbox visual */}
                <div
                  style={{
                    width: "18px",
                    height: "18px",
                    borderRadius: "5px",
                    flexShrink: 0,
                    marginTop: "1px",
                    border: anamnese.aceite
                      ? "2px solid #22c55e"
                      : "2px solid #374151",
                    background: anamnese.aceite ? "#22c55e" : "transparent",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    transition: "all .2s",
                  }}
                >
                  {anamnese.aceite && (
                    <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                      <path
                        d="M1.5 5L4 7.5L8.5 2.5"
                        stroke="#0A0A0A"
                        strokeWidth="1.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  )}
                </div>
                <span
                  style={{
                    fontSize: "12px",
                    color: anamnese.aceite ? "#d1d5db" : "#6b7280",
                    lineHeight: 1.6,
                    fontWeight: 300,
                    transition: "color .2s",
                  }}
                >
                  Declaro que as informações acima são verdadeiras e autorizo a
                  realização do procedimento de tatuagem com pleno conhecimento
                  dos riscos envolvidos.
                </span>
              </button>

              {/* aviso se ainda falta responder */}
              {!anamneseCompleta && (
                <p
                  style={{
                    fontSize: "11px",
                    color: "#4b5563",
                    marginTop: "10px",
                    textAlign: "center",
                  }}
                >
                  Responda todas as perguntas para continuar
                </p>
              )}
            </div>

            <div style={{ display: "flex", gap: "12px" }}>
              <button onClick={() => setStep(2)} className="btn-secondary">
                Voltar
              </button>
              <button
                onClick={confirmarAgendamento}
                disabled={!podeConfirmar}
                className="btn-primary"
              >
                {salvando || uploadando ? "Enviando..." : "Confirmar"}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
