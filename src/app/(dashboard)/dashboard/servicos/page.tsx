"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import {
  Plus,
  Pencil,
  Trash2,
  Scissors,
  Clock,
  Tag,
  GripVertical,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { CSS } from "@dnd-kit/utilities";

type Servico = {
  id: string;
  nome: string;
  descricao: string | null;
  duracao_minutos: number;
  preco: number;
  tipo_preco: string;
  ativo: boolean;
  ordem: number;
};

const TIPOS_PRECO = [
  { value: "fixo", label: "Fixo" },
  { value: "a_partir_de", label: "A partir de" },
  { value: "sob_consulta", label: "Sob consulta" },
];

function formatarPreco(s: Servico) {
  if (s.tipo_preco === "sob_consulta") return "Sob consulta";
  if (s.tipo_preco === "a_partir_de")
    return `A partir de R$ ${Number(s.preco).toFixed(0)}`;
  return `R$ ${Number(s.preco).toFixed(2)}`;
}

// Componente de card arrastável
function ServicoCard({
  s,
  onEditar,
  onDeletar,
}: {
  s: Servico;
  onEditar: (s: Servico) => void;
  onDeletar: (id: string) => void;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: s.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
    zIndex: isDragging ? 10 : undefined,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`bg-card border rounded-xl flex items-center gap-3 pr-4 hover:border-border/80 transition-colors group ${
        isDragging ? "border-primary shadow-lg" : "border-border"
      }`}
    >
      {/* HANDLE DE DRAG */}
      <div
        {...attributes}
        {...listeners}
        className="pl-4 py-5 cursor-grab active:cursor-grabbing text-muted-foreground hover:text-foreground transition-colors touch-none"
        title="Arrastar para reordenar"
      >
        <GripVertical className="w-4 h-4" />
      </div>

      {/* CONTEÚDO */}
      <div className="flex-1 min-w-0 py-4">
        <p className="text-sm font-semibold text-foreground mb-1">{s.nome}</p>
        {s.descricao && (
          <p className="text-xs text-muted-foreground mb-2 line-clamp-1">
            {s.descricao}
          </p>
        )}
        <div className="flex items-center gap-3 flex-wrap">
          <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
            <Clock className="w-3 h-3" />
            {s.duracao_minutos}min
          </span>
          <span className="inline-flex items-center gap-1 text-xs font-medium text-foreground">
            <Tag className="w-3 h-3" />
            {formatarPreco(s)}
          </span>
        </div>
      </div>

      {/* AÇÕES */}
      <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
        <button
          onClick={() => onEditar(s)}
          className="w-8 h-8 flex items-center justify-center rounded-lg border border-border text-muted-foreground hover:text-foreground hover:border-border/80 transition-colors"
          title="Editar"
        >
          <Pencil className="w-3.5 h-3.5" />
        </button>
        <button
          onClick={() => onDeletar(s.id)}
          className="w-8 h-8 flex items-center justify-center rounded-lg border border-destructive/30 text-destructive hover:bg-destructive/10 transition-colors"
          title="Remover"
        >
          <Trash2 className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
}

export default function ServicosPage() {
  const [servicos, setServicos] = useState<Servico[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalAberto, setModalAberto] = useState(false);
  const [editando, setEditando] = useState<Servico | null>(null);

  const [nome, setNome] = useState("");
  const [descricao, setDescricao] = useState("");
  const [duracao, setDuracao] = useState("");
  const [preco, setPreco] = useState("");
  const [tipoPreco, setTipoPreco] = useState("fixo");
  const [saving, setSaving] = useState(false);
  const [deletandoId, setDeletandoId] = useState<string | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 5 }, // evita drag acidental
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );

  async function fetchServicos() {
    const supabase = createClient();
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

    const { data } = await supabase
      .from("servicos")
      .select("*")
      .eq("profissional_id", perfil.id)
      .eq("ativo", true)
      .order("ordem", { ascending: true });

    setServicos(data || []);
    setLoading(false);
  }

  useEffect(() => {
    fetchServicos();
  }, []);

  async function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const oldIndex = servicos.findIndex((s) => s.id === active.id);
    const newIndex = servicos.findIndex((s) => s.id === over.id);
    const novaOrdem = arrayMove(servicos, oldIndex, newIndex);

    // atualiza localmente primeiro (optimistic update)
    setServicos(novaOrdem);

    // salva no banco
    const supabase = createClient();
    await Promise.all(
      novaOrdem.map((s, index) =>
        supabase.from("servicos").update({ ordem: index }).eq("id", s.id),
      ),
    );
  }

  function abrirModal(servico?: Servico) {
    if (servico) {
      setEditando(servico);
      setNome(servico.nome);
      setDescricao(servico.descricao || "");
      setDuracao(String(servico.duracao_minutos));
      setPreco(String(servico.preco));
      setTipoPreco(servico.tipo_preco || "fixo");
    } else {
      setEditando(null);
      setNome("");
      setDescricao("");
      setDuracao("");
      setPreco("");
      setTipoPreco("fixo");
    }
    setModalAberto(true);
  }

  function fecharModal() {
    setModalAberto(false);
    setEditando(null);
  }

  async function salvar() {
    if (!nome || !duracao) return;
    if (tipoPreco !== "sob_consulta" && !preco) return;
    setSaving(true);

    const supabase = createClient();
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

    const payload = {
      nome,
      descricao,
      duracao_minutos: Number(duracao),
      preco: tipoPreco !== "sob_consulta" ? Number(preco) : 0,
      tipo_preco: tipoPreco,
    };

    if (editando) {
      await supabase.from("servicos").update(payload).eq("id", editando.id);
    } else {
      // novo serviço vai pro final da lista
      const ordemNova = servicos.length;
      await supabase
        .from("servicos")
        .insert({ ...payload, profissional_id: perfil.id, ordem: ordemNova });
    }

    await fetchServicos();
    fecharModal();
    setSaving(false);
  }

  async function confirmarDelete() {
    if (!deletandoId) return;
    const supabase = createClient();
    await supabase
      .from("servicos")
      .update({ ativo: false })
      .eq("id", deletandoId);
    setDeletandoId(null);
    await fetchServicos();
  }

  return (
    <div className="max-w-3xl space-y-6">
      {/* HEADER */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Serviços</h1>
          <p className="text-muted-foreground text-sm mt-1">
            {servicos.length} serviço{servicos.length !== 1 ? "s" : ""} ·
            arraste para reordenar
          </p>
        </div>
        <button
          onClick={() => abrirModal()}
          className="inline-flex items-center gap-2 bg-primary text-primary-foreground px-4 py-2 text-sm font-medium hover:opacity-90 transition rounded-lg"
        >
          <Plus className="w-4 h-4" />
          Novo serviço
        </button>
      </div>

      {/* MODAL */}
      <Dialog open={modalAberto} onOpenChange={setModalAberto}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>
              {editando ? "Editar serviço" : "Novo serviço"}
            </DialogTitle>
            <DialogDescription>
              {editando
                ? "Atualize as informações do serviço."
                : "Adicione um novo serviço ao seu perfil."}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 pt-2">
            <div>
              <label className="block text-xs uppercase tracking-widest text-muted-foreground mb-2">
                Nome
              </label>
              <input
                type="text"
                value={nome}
                onChange={(e) => setNome(e.target.value)}
                placeholder="Ex: Tatuagem Pequena"
                autoFocus
                className="w-full bg-background border border-border text-foreground px-3 py-2.5 text-sm rounded-lg focus:outline-none focus:border-ring transition-colors"
              />
            </div>

            <div>
              <label className="block text-xs uppercase tracking-widest text-muted-foreground mb-2">
                Descrição{" "}
                <span className="normal-case tracking-normal">(opcional)</span>
              </label>
              <textarea
                value={descricao}
                onChange={(e) => setDescricao(e.target.value)}
                placeholder="Descreva o serviço..."
                rows={2}
                className="w-full bg-background border border-border text-foreground px-3 py-2.5 text-sm rounded-lg focus:outline-none focus:border-ring resize-none transition-colors"
              />
            </div>

            <div>
              <label className="block text-xs uppercase tracking-widest text-muted-foreground mb-2">
                Tipo de preço
              </label>
              <div className="grid grid-cols-3 gap-2">
                {TIPOS_PRECO.map((op) => (
                  <button
                    key={op.value}
                    type="button"
                    onClick={() => setTipoPreco(op.value)}
                    className={`py-2 text-xs font-medium rounded-lg border transition-all ${
                      tipoPreco === op.value
                        ? "border-primary bg-primary/10 text-foreground"
                        : "border-border text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    {op.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs uppercase tracking-widest text-muted-foreground mb-2">
                  Duração (min)
                </label>
                <input
                  type="number"
                  value={duracao}
                  onChange={(e) => setDuracao(e.target.value)}
                  placeholder="Ex: 60"
                  className="w-full bg-background border border-border text-foreground px-3 py-2.5 text-sm rounded-lg focus:outline-none focus:border-ring transition-colors"
                />
              </div>
              {tipoPreco !== "sob_consulta" && (
                <div>
                  <label className="block text-xs uppercase tracking-widest text-muted-foreground mb-2">
                    Preço (R$)
                  </label>
                  <input
                    type="number"
                    value={preco}
                    onChange={(e) => setPreco(e.target.value)}
                    placeholder="Ex: 200"
                    className="w-full bg-background border border-border text-foreground px-3 py-2.5 text-sm rounded-lg focus:outline-none focus:border-ring transition-colors"
                  />
                </div>
              )}
            </div>

            <div className="flex gap-3 pt-2">
              <button
                onClick={salvar}
                disabled={saving}
                className="flex-1 bg-primary text-primary-foreground py-2.5 text-sm font-medium hover:opacity-90 transition rounded-lg disabled:opacity-50"
              >
                {saving
                  ? "Salvando..."
                  : editando
                    ? "Salvar alterações"
                    : "Criar serviço"}
              </button>
              <button
                onClick={fecharModal}
                className="px-4 text-muted-foreground text-sm hover:text-foreground transition border border-border rounded-lg"
              >
                Cancelar
              </button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* LISTA COM DRAG AND DROP */}
      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="bg-card border border-border rounded-xl p-5 animate-pulse"
            >
              <div className="h-4 bg-muted rounded w-1/3 mb-3" />
              <div className="h-3 bg-muted rounded w-1/2" />
            </div>
          ))}
        </div>
      ) : servicos.length === 0 ? (
        <div className="border border-dashed border-border rounded-xl p-16 text-center">
          <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center mx-auto mb-4">
            <Scissors className="w-5 h-5 text-muted-foreground" />
          </div>
          <p className="text-sm font-medium text-foreground mb-1">
            Nenhum serviço ainda
          </p>
          <p className="text-xs text-muted-foreground mb-4">
            Adicione seus serviços para que os clientes possam agendar.
          </p>
          <button
            onClick={() => abrirModal()}
            className="inline-flex items-center gap-2 text-sm text-primary hover:opacity-80 transition font-medium"
          >
            <Plus className="w-4 h-4" />
            Criar primeiro serviço
          </button>
        </div>
      ) : (
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <SortableContext
            items={servicos.map((s) => s.id)}
            strategy={verticalListSortingStrategy}
          >
            <div className="space-y-3">
              {servicos.map((s) => (
                <ServicoCard
                  key={s.id}
                  s={s}
                  onEditar={abrirModal}
                  onDeletar={setDeletandoId}
                />
              ))}
            </div>
          </SortableContext>
        </DndContext>
      )}

      {servicos.length > 1 && (
        <p className="text-xs text-muted-foreground text-center flex items-center justify-center gap-1.5">
          <GripVertical className="w-3 h-3" />
          Arraste pelo ícone para reordenar
        </p>
      )}
      <AlertDialog
        open={!!deletandoId}
        onOpenChange={(open) => !open && setDeletandoId(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remover serviço</AlertDialogTitle>
            <AlertDialogDescription>
              Este serviço será removido da sua página pública. Agendamentos
              existentes não serão afetados.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmarDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Remover
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
