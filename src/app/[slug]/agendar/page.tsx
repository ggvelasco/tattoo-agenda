"use client";

import { useEffect, useState } from "react";
import { useParams, useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Calendar } from "@/components/ui/calendar";
import { ptBR } from "date-fns/locale";
import Link from "next/link";
import { toast, Toaster } from "sonner";
import {
  Clock,
  Calendar as CalendarIcon,
  User,
  Phone,
  Mail,
  FileText,
  Upload,
  ArrowRight,
  ChevronLeft,
  CheckCircle2,
} from "lucide-react";

type Servico = {
  id: string;
  nome: string;
  descricao: string | null;
  duracao_minutos: number;
  preco: number;
  tipo_preco: string;
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
    label: "Faz uso contínuo de algum medicamento? (anticoagulantes, etc)",
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

function formatarDuracao(minutos: number): string {
  if (minutos < 60) return `${minutos}min`;
  const h = Math.floor(minutos / 60);
  const m = minutos % 60;
  return m === 0 ? `${h}h` : `${h}h${m}min`;
}

function formatarPreco(s: Servico) {
  if (s.tipo_preco === "sob_consulta") return "Sob consulta";
  if (s.tipo_preco === "a_partir_de")
    return `A partir de R$ ${Number(s.preco).toFixed(0)}`;
  return `R$ ${Number(s.preco).toFixed(0)}`;
}

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
  const [tamanhoTattoo, setTamanhoTattoo] = useState("");
  const [uploadedRefUrl, setUploadedRefUrl] = useState<string | null>(null);
  const [whatsappProfissional, setWhatsappProfissional] = useState("");
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
    !!localCorpo &&
    !!tamanhoTattoo &&
    anamneseCompleta &&
    anamnese.aceite;

  useEffect(() => {
    fetchDados();
  }, []);

  async function fetchDados() {
    const supabase = createClient();
    const { data: perfil } = await supabase
      .from("profissionais")
      .select("id, nome, slug, whatsapp")
      .eq("slug", slug)
      .single();
    if (!perfil) return;
    setProfissional(perfil);
    setWhatsappProfissional(perfil.whatsapp || "");
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
        setUploadedRefUrl(referenciaUrl);
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
        local_corpo: tamanhoTattoo ? `${localCorpo} (${tamanhoTattoo}cm)` : localCorpo || null,
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

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0A0A0A] flex items-center justify-center">
        <div className="w-6 h-6 border-2 border-border border-t-muted-foreground rounded-full animate-spin" />
      </div>
    );
  }

  if (concluido) {
    const formatarData = (data: Date) => {
      return data.toLocaleDateString("pt-BR");
    };

    const msgBriefing = [
      `Olá ${profissional?.nome}! Solicitei um agendamento pelo TattooAgenda. Aqui está o meu briefing:`,
      "",
      `*Cliente:* ${nomeCliente}`,
      `*Serviço:* ${servicoSelecionado?.nome}`,
      `*Data/Hora:* ${dataSelecionada ? formatarData(dataSelecionada) : ""} às ${horarioSelecionado}`,
      `*Especificações:* ${localCorpo} - ${tamanhoTattoo}cm`,
      uploadedRefUrl ? `*Referência:* ${uploadedRefUrl}` : null,
      `*Ficha de Anamnese:* Preenchida e assinada`,
      "",
      `Vamos conversar sobre a arte?`
    ]
      .filter(Boolean)
      .join("\n");

    const waBriefingUrl = whatsappProfissional
      ? `https://wa.me/55${whatsappProfissional.replace(/\D/g, "")}?text=${encodeURIComponent(msgBriefing)}`
      : null;

    return (
      <div className="min-h-screen bg-[#0A0A0A] text-foreground flex items-center justify-center p-6">
        <div className="max-w-md w-full text-center space-y-8 bg-card border border-border/85 p-8 rounded-3xl shadow-xl relative overflow-hidden">
          {/* Glows */}
          <div className="absolute -top-20 -right-20 w-44 h-44 rounded-full bg-primary/10 blur-3xl pointer-events-none" />
          <div className="absolute -bottom-20 -left-20 w-44 h-44 rounded-full bg-indigo-500/5 blur-3xl pointer-events-none" />

          <div className="w-16 h-16 rounded-full bg-green-500/10 border border-green-500/20 flex items-center justify-center mx-auto text-green-400 text-2xl shadow-inner animate-pulse">
            ✓
          </div>

          <div className="space-y-3">
            <h2 className="font-display text-lg font-black uppercase tracking-wider text-foreground">
              Solicitação Enviada!
            </h2>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Sua sessão foi pré-agendada no sistema. Agora, clique abaixo para enviar o briefing completo ao <strong>{profissional?.nome}</strong> e alinhar os detalhes da arte!
            </p>
          </div>

          {waBriefingUrl && (
            <div className="pt-2">
              <a
                href={waBriefingUrl}
                target="_blank"
                className="w-full inline-flex items-center justify-center gap-2 bg-green-500 hover:bg-green-600 text-white font-bold py-3.5 px-6 rounded-2xl transition-all shadow-md hover:scale-[1.01] uppercase tracking-wider text-xs select-none"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" className="shrink-0">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                </svg>
                Enviar Briefing no WhatsApp
              </a>
            </div>
          )}

          <div className="pt-4 border-t border-border/40">
            <Link
              href={`/${slug}`}
              className="text-xs font-semibold text-muted-foreground hover:text-foreground transition-colors uppercase tracking-widest"
            >
              ← Voltar ao perfil
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-[#0A0A0A] min-h-screen text-foreground relative overflow-hidden">
      <Toaster theme="dark" position="top-center" />
      {/* Background glow effects */}
      <div className="absolute -top-40 -right-40 w-96 h-96 rounded-full bg-primary/5 blur-3xl pointer-events-none" />
      <div className="absolute top-1/3 -left-40 w-80 h-80 rounded-full bg-indigo-500/5 blur-3xl pointer-events-none" />

      {/* NAV */}
      <nav className="flex items-center justify-between px-6 py-5 border-b border-border/30 relative bg-background/25 backdrop-blur-md">
        <Link
          href={`/${slug}`}
          className="text-xs font-bold text-muted-foreground hover:text-foreground transition-colors uppercase tracking-widest flex items-center gap-1.5"
        >
          <ChevronLeft className="w-4 h-4" /> {profissional?.nome}
        </Link>
        <span className="font-display text-xs font-black uppercase tracking-tight text-foreground select-none">
          TATTOO<span className="text-primary">AGENDA</span>
        </span>
      </nav>

      <div className="max-w-xl mx-auto px-6 py-10 pb-24 relative space-y-8">
        {/* PROGRESS STEPS */}
        <div className="bg-card border border-border/50 rounded-2xl p-4 md:p-5 shadow-sm">
          <div className="flex items-center justify-between">
            {STEPS.map((label, i) => (
              <div
                key={i}
                className={`flex items-center ${
                  i < STEPS.length - 1 ? "flex-1" : "flex-none"
                }`}
              >
                <div className="flex items-center gap-2 shrink-0">
                  <div
                    className={`w-7 h-7 rounded-full flex items-center justify-center font-display text-[10px] font-bold transition-all ${
                      step > i + 1
                        ? "bg-foreground text-background"
                        : step === i + 1
                          ? "bg-primary/10 border border-primary text-foreground shadow-[0_0_8px_rgba(129,140,248,0.15)]"
                          : "bg-muted/40 border border-border text-muted-foreground/50"
                    }`}
                  >
                    {step > i + 1 ? "✓" : i + 1}
                  </div>
                  <span
                    className={`text-[10px] font-bold uppercase tracking-wider ${
                      step === i + 1
                        ? "text-foreground"
                        : step > i + 1
                          ? "text-muted-foreground/60"
                          : "text-muted-foreground/35"
                    }`}
                  >
                    {label}
                  </span>
                </div>
                {i < STEPS.length - 1 && (
                  <div
                    className={`flex-1 h-[1px] mx-3 transition-colors duration-300 ${
                      step > i + 1 ? "bg-muted-foreground/60" : "bg-border/30"
                    }`}
                  />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* STEP 1 ─ SERVIÇO */}
        {step === 1 && (
          <div className="space-y-6">
            <div>
              <h2 className="font-display text-lg font-black uppercase tracking-wider text-foreground">
                Escolha o serviço
              </h2>
              <p className="text-xs text-muted-foreground mt-1">
                Selecione o procedimento de tatuagem que deseja realizar
              </p>
            </div>

            <div className="flex flex-col gap-3">
              {servicos.map((s) => (
                <button
                  key={s.id}
                  onClick={() => setServicoSelecionado(s)}
                  className={`w-full text-left p-5 rounded-2xl border transition-all duration-200 flex items-start justify-between gap-4 ${
                    servicoSelecionado?.id === s.id
                      ? "border-primary bg-primary/[0.02] shadow-sm"
                      : "border-border bg-card hover:border-border/80 hover:bg-muted/5"
                  }`}
                >
                  <div className="space-y-2 flex-1">
                    <p className="font-display text-xs font-bold text-foreground">
                      {s.nome}
                    </p>
                    {s.descricao && (
                      <p className="text-xs text-muted-foreground font-light leading-relaxed">
                        {s.descricao}
                      </p>
                    )}
                    <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-muted-foreground">
                      <Clock className="w-3.5 h-3.5 text-muted-foreground/60" /> {formatarDuracao(s.duracao_minutos)}
                    </span>
                  </div>
                  
                  <div className="flex items-center gap-3 shrink-0">
                    <span className="font-display text-xs font-bold text-foreground">
                      {formatarPreco(s)}
                    </span>
                    <div
                      className={`w-4 h-4 rounded-full border flex items-center justify-center transition-all ${
                        servicoSelecionado?.id === s.id
                          ? "border-primary bg-primary"
                          : "border-border bg-transparent"
                      }`}
                    >
                      {servicoSelecionado?.id === s.id && (
                        <div className="w-1.5 h-1.5 rounded-full bg-primary-foreground" />
                      )}
                    </div>
                  </div>
                </button>
              ))}
            </div>

            <button
              onClick={() => servicoSelecionado && setStep(2)}
              disabled={!servicoSelecionado}
              className="w-full inline-flex items-center justify-center gap-2 bg-primary text-primary-foreground font-bold py-3.5 px-6 rounded-2xl transition-all shadow-md disabled:opacity-35 disabled:cursor-not-allowed uppercase tracking-wider text-xs select-none border border-primary hover:opacity-95"
            >
              Continuar <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* STEP 2 ─ DATA E HORA */}
        {step === 2 && (
          <div className="space-y-6">
            <div>
              <h2 className="font-display text-lg font-black uppercase tracking-wider text-foreground">
                Data e horário
              </h2>
              <p className="text-xs text-muted-foreground mt-1">
                Escolha o dia e o horário ideal para a sua sessão
              </p>
            </div>

            <div className="bg-card border border-border/70 rounded-2xl p-4 md:p-5 flex justify-center shadow-sm">
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
                className="bg-transparent w-full text-xs"
              />
            </div>

            {dataSelecionada && slotsDisponiveis.length === 0 && (
              <div className="bg-card border border-border/60 rounded-2xl p-6 text-center shadow-inner">
                <p className="text-xs text-muted-foreground/70">
                  Nenhum horário disponível para esta data
                </p>
              </div>
            )}

            {slotsDisponiveis.length > 0 && (
              <div className="space-y-3">
                <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/60">
                  Horários disponíveis
                </p>
                <div className="grid grid-cols-4 gap-2">
                  {slotsDisponiveis.map((slot) => (
                    <button
                      key={slot.hora}
                      onClick={() =>
                        slot.disponivel && setHorarioSelecionado(slot.hora)
                      }
                      disabled={!slot.disponivel}
                      className={`py-2.5 rounded-xl border text-xs font-bold transition-all font-sans select-none ${
                        !slot.disponivel
                          ? "opacity-30 line-through cursor-not-allowed border-border bg-transparent text-muted-foreground/40"
                          : horarioSelecionado === slot.hora
                            ? "border-primary bg-primary/10 text-primary"
                            : "border-border bg-card text-muted-foreground hover:border-border/80 hover:text-foreground"
                      }`}
                    >
                      {slot.hora}
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div className="flex gap-3">
              <button
                onClick={() => setStep(1)}
                className="flex-1 py-3 px-6 rounded-2xl border border-border hover:border-border/85 bg-transparent hover:bg-muted/10 text-muted-foreground hover:text-foreground font-bold transition-all text-xs uppercase tracking-wider shadow-sm select-none"
              >
                Voltar
              </button>
              <button
                onClick={() => horarioSelecionado && setStep(3)}
                disabled={!horarioSelecionado}
                className="flex-1 bg-primary text-primary-foreground font-bold py-3 px-6 rounded-2xl transition-all shadow-md disabled:opacity-35 disabled:cursor-not-allowed uppercase tracking-wider text-xs select-none border border-primary hover:opacity-95"
              >
                Continuar
              </button>
            </div>
          </div>
        )}

        {/* STEP 3 ─ SEUS DADOS */}
        {step === 3 && (
          <div className="space-y-6">
            <div>
              <h2 className="font-display text-lg font-black uppercase tracking-wider text-foreground">
                Seus dados
              </h2>
              <p className="text-xs text-muted-foreground mt-1">
                Por favor, preencha as informações técnicas e clínicas para a sessão
              </p>
            </div>

            {/* RESUMO CARD */}
            <div className="bg-card border border-border/80 rounded-2xl p-5 shadow-sm space-y-3.5">
              {[
                { label: "Serviço", value: servicoSelecionado?.nome },
                {
                  label: "Data da Sessão",
                  value: dataSelecionada?.toLocaleDateString("pt-BR"),
                },
                { label: "Horário", value: horarioSelecionado },
                localCorpo ? { label: "Local do Corpo", value: localCorpo } : null,
                tamanhoTattoo ? { label: "Tamanho", value: `${tamanhoTattoo} cm` } : null,
              ]
                .filter((row): row is { label: string; value: string } => !!row && !!row.value)
                .map((row) => (
                  <div key={row.label} className="flex justify-between items-center text-xs">
                    <span className="text-muted-foreground/80">{row.label}</span>
                    <span className="text-foreground font-semibold">{row.value}</span>
                  </div>
                ))}
              <div className="border-t border-border/40 pt-3 flex justify-between items-center">
                <span className="text-muted-foreground text-xs font-semibold">Valor Estimado</span>
                <span className="text-sm font-bold font-display text-foreground">
                  {servicoSelecionado ? formatarPreco(servicoSelecionado) : ""}
                </span>
              </div>
            </div>

            {/* FORM FIELDS */}
            <div className="space-y-4">
              {[
                {
                  label: "Nome completo",
                  value: nomeCliente,
                  set: setNomeCliente,
                  type: "text",
                  ph: "Seu nome artístico ou completo",
                  icon: <User className="w-4 h-4 text-muted-foreground/60 shrink-0" />,
                },
                {
                  label: "WhatsApp",
                  value: telefone,
                  set: setTelefone,
                  type: "tel",
                  ph: "(11) 99999-9999",
                  icon: <Phone className="w-4 h-4 text-muted-foreground/60 shrink-0" />,
                },
                {
                  label: "E-mail (opcional)",
                  value: email,
                  set: setEmail,
                  type: "email",
                  ph: "seu@email.com",
                  icon: <Mail className="w-4 h-4 text-muted-foreground/60 shrink-0" />,
                },
              ].map((f) => (
                <div key={f.label} className="space-y-2">
                  <label className="block text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                    {f.label}
                  </label>
                  <div className="flex items-center gap-2 bg-background border border-border/80 rounded-2xl px-4 py-3 shadow-inner focus-within:border-primary/50 transition-colors">
                    {f.icon}
                    <input
                      type={f.type}
                      value={f.value}
                      onChange={(e) => f.set(e.target.value)}
                      placeholder={f.ph}
                      className="bg-transparent border-0 text-foreground text-sm focus:outline-none w-full"
                    />
                  </div>
                </div>
              ))}

              {/* LOCAL DO CORPO */}
              <div className="space-y-2">
                <label className="block text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                  Local do corpo *
                </label>
                <div className="flex items-center gap-2 bg-background border border-border/80 rounded-2xl px-4 py-3 shadow-inner focus-within:border-primary/50 transition-colors">
                  <span className="text-sm shrink-0">📍</span>
                  <input
                    type="text"
                    value={localCorpo}
                    onChange={(e) => setLocalCorpo(e.target.value)}
                    placeholder="Ex: antebraço direito, costela..."
                    className="bg-transparent border-0 text-foreground text-sm focus:outline-none w-full"
                  />
                </div>
              </div>

              {/* TAMANHO ESTIMADO */}
              <div className="space-y-2">
                <label className="block text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                  Tamanho aproximado (em cm) *
                </label>
                <div className="flex items-center gap-2 bg-background border border-border/80 rounded-2xl px-4 py-3 shadow-inner focus-within:border-primary/50 transition-colors">
                  <span className="text-sm shrink-0">📐</span>
                  <input
                    type="text"
                    value={tamanhoTattoo}
                    onChange={(e) => setTamanhoTattoo(e.target.value)}
                    placeholder="Ex: 15, 10, 5..."
                    className="bg-transparent border-0 text-foreground text-sm focus:outline-none w-full font-sans"
                  />
                </div>
              </div>

              {/* REFERÊNCIA */}
              <div className="space-y-2">
                <label className="block text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                  Imagem de referência <span className="opacity-50 text-[9px] normal-case tracking-normal">(opcional)</span>
                </label>
                <label className="block cursor-pointer select-none">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleReferenciaChange}
                    className="hidden"
                  />
                  {referenciaPreview ? (
                    <div className="relative rounded-2xl overflow-hidden border border-border shadow-sm">
                      <img
                        src={referenciaPreview}
                        alt="Referência"
                        className="w-full max-h-60 object-cover block"
                      />
                      <div className="absolute inset-0 bg-black/60 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity duration-200">
                        <span className="text-white text-xs font-bold uppercase tracking-wider flex items-center gap-1.5">
                          <Upload className="w-4 h-4" /> Trocar imagem
                        </span>
                      </div>
                    </div>
                  ) : (
                    <div className="border border-dashed border-border hover:border-primary/45 rounded-2xl py-8 px-6 text-center transition-all bg-card/10 hover:bg-muted/5">
                      <Upload className="w-5 h-5 text-muted-foreground/60 mx-auto mb-2" />
                      <p className="text-xs font-semibold text-muted-foreground/80 mb-1">
                        Clique para enviar uma referência
                      </p>
                      <p className="text-[10px] text-muted-foreground/45">
                        Formatos aceitos: JPG, PNG ou WEBP (Max 5MB)
                      </p>
                    </div>
                  )}
                </label>
              </div>
            </div>

            {/* FICHA DE ANAMNESE */}
            <div className="border-t border-border/20 pt-6 space-y-6">
              <div className="space-y-1">
                <label className="block text-[10px] font-bold uppercase tracking-widest text-muted-foreground flex items-center gap-1.5">
                  <FileText className="w-4 h-4 text-primary" /> Ficha de Anamnese *
                </label>
                <p className="text-[11px] text-muted-foreground/75 leading-relaxed font-light">
                  Essenciais para sua segurança. Responda todas as perguntas abaixo antes de prosseguir.
                </p>
              </div>

              <div className="space-y-2.5">
                {PERGUNTAS.map(({ key, label, descKey, descPlaceholder }) => (
                  <div
                    key={key}
                    className={`border rounded-2xl p-4 transition-all duration-200 bg-card ${
                      anamnese[key] === null
                        ? "border-border"
                        : anamnese[key] === true
                          ? "border-red-500/20 bg-red-500/[0.01]"
                          : "border-green-500/20 bg-green-500/[0.01]"
                    }`}
                  >
                    <div className="flex items-start justify-between gap-4">
                      <span className="text-xs text-foreground font-light leading-relaxed flex-1">
                        {label}
                      </span>
                      <div className="flex gap-1.5 shrink-0 select-none">
                        <button
                          type="button"
                          onClick={() => updateAnamnese(key, false)}
                          className={`px-3.5 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-wider border transition-all ${
                            anamnese[key] === false
                              ? "border-green-500/20 bg-green-500/10 text-green-400 font-bold"
                              : "border-border bg-transparent text-muted-foreground/50 hover:text-foreground hover:border-border/80"
                          }`}
                        >
                          Não
                        </button>
                        <button
                          type="button"
                          onClick={() => updateAnamnese(key, true)}
                          className={`px-3.5 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-wider border transition-all ${
                            anamnese[key] === true
                              ? "border-red-500/20 bg-red-500/10 text-red-400 font-bold"
                              : "border-border bg-transparent text-muted-foreground/50 hover:text-foreground hover:border-border/80"
                          }`}
                        >
                          Sim
                        </button>
                      </div>
                    </div>
                    {descKey && anamnese[key] === true && (
                      <div className="mt-3">
                        <input
                          type="text"
                          value={anamnese[descKey] as string}
                          onChange={(e) =>
                            updateAnamnese(descKey, e.target.value)
                          }
                          placeholder={descPlaceholder}
                          className="w-full bg-background border border-border/80 text-foreground px-3.5 py-2.5 text-xs rounded-xl focus:outline-none focus:border-primary/50 transition-all shadow-inner"
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
                className={`w-full text-left p-4 rounded-2xl border transition-all flex items-start gap-3 select-none ${
                  anamnese.aceite
                    ? "border-green-500/20 bg-green-500/[0.01]"
                    : "border-border bg-card"
                }`}
              >
                <div
                  className={`w-4.5 h-4.5 rounded-md border flex items-center justify-center shrink-0 mt-0.5 transition-all ${
                    anamnese.aceite
                      ? "border-green-500 bg-green-500 text-background"
                      : "border-border bg-transparent"
                  }`}
                >
                  {anamnese.aceite && (
                    <svg width="10" height="10" viewBox="0 0 10 10" fill="none" className="stroke-background shrink-0">
                      <path
                        d="M1.5 5L4 7.5L8.5 2.5"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  )}
                </div>
                <span
                  className={`text-[11px] leading-relaxed font-light transition-colors duration-200 ${
                    anamnese.aceite ? "text-foreground" : "text-muted-foreground/80"
                  }`}
                >
                  Declaro que as informações acima são verdadeiras e autorizo a realização do procedimento de tatuagem com pleno conhecimento dos riscos envolvidos.
                </span>
              </button>

              {!anamneseCompleta && (
                <p className="text-[10px] text-muted-foreground/50 text-center uppercase tracking-wider">
                  Responda todas as perguntas da anamnese para continuar
                </p>
              )}
            </div>

            {/* BUTTONS */}
            <div className="flex gap-3">
              <button
                onClick={() => setStep(2)}
                className="flex-1 py-3 px-6 rounded-2xl border border-border hover:border-border/85 bg-transparent hover:bg-muted/10 text-muted-foreground hover:text-foreground font-bold transition-all text-xs uppercase tracking-wider shadow-sm select-none"
              >
                Voltar
              </button>
              <button
                onClick={confirmarAgendamento}
                disabled={!podeConfirmar}
                className="flex-1 bg-primary text-primary-foreground font-bold py-3 px-6 rounded-2xl transition-all shadow-md disabled:opacity-35 disabled:cursor-not-allowed uppercase tracking-wider text-xs select-none border border-primary hover:opacity-95"
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
