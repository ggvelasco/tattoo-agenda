"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import {
  User,
  Image as ImageIcon,
  Instagram,
  Phone,
  MapPin,
  Globe,
  Check,
  Save,
  FileText,
  Link2,
} from "lucide-react";

type Perfil = {
  nome: string;
  bio: string;
  instagram: string;
  cidade: string;
  slug: string;
  foto_url: string;
  whatsapp: string;
};

export default function PerfilPage() {
  const [nome, setNome] = useState("");
  const [bio, setBio] = useState("");
  const [instagram, setInstagram] = useState("");
  const [cidade, setCidade] = useState("");
  const [slug, setSlug] = useState("");
  const [perfilId, setPerfilId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [savedRecently, setSavedRecently] = useState(false);
  const [fotoUrl, setFotoUrl] = useState("");
  const [whatsapp, setWhatsapp] = useState("");

  useEffect(() => {
    fetchProfile();
  }, []);

  function perfilMontado(perfil: Perfil) {
    setNome(perfil.nome || "");
    setBio(perfil.bio || "");
    setInstagram(perfil.instagram || "");
    setCidade(perfil.cidade || "");
    setSlug(perfil.slug || "");
    setFotoUrl(perfil.foto_url || "");
    setWhatsapp(perfil.whatsapp || "");
  }

  async function salvar() {
    if (!perfilId) return;
    setSaving(true);

    const supabase = createClient();
    await supabase
      .from("profissionais")
      .update({
        nome,
        bio,
        instagram,
        cidade,
        slug: slug.trim().toLowerCase().replace(/[^a-z0-9-_]/g, ""),
        foto_url: fotoUrl,
        whatsapp,
      })
      .eq("id", perfilId);

    setSaving(false);
    setSavedRecently(true);
    setTimeout(() => setSavedRecently(false), 3000);
  }

  async function fetchProfile() {
    const supabase = createClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return;

    const { data: perfil } = await supabase
      .from("profissionais")
      .select("*")
      .eq("user_id", user.id)
      .single();

    if (!perfil) return;
    setPerfilId(perfil.id);
    perfilMontado(perfil);
    setLoading(false);
  }

  if (loading) {
    return (
      <div className="space-y-4 max-w-2xl">
        <div className="h-24 bg-card border border-border rounded-2xl animate-pulse" />
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-44 bg-card border border-border rounded-2xl animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl space-y-6">
      {/* HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-card border border-border rounded-2xl p-6 shadow-sm">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <User className="w-5 h-5 text-primary" />
            <h1 className="text-xl font-bold text-foreground font-display">Perfil Profissional</h1>
          </div>
          <p className="text-muted-foreground text-xs">
            Gerencie as informações públicas exibidas em sua página de agendamentos.
          </p>
        </div>
        <button
          onClick={salvar}
          disabled={saving}
          className={`inline-flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-semibold rounded-xl transition-all shadow-sm ${
            savedRecently
              ? "bg-green-500/10 text-green-400 border border-green-500/20 hover:bg-green-500/15"
              : "bg-primary text-primary-foreground hover:opacity-90 disabled:opacity-50"
          }`}
        >
          {saving ? (
            "Salvando..."
          ) : savedRecently ? (
            <>
              <Check className="w-4 h-4" /> Salvo!
            </>
          ) : (
            <>
              <Save className="w-4 h-4" /> Salvar Perfil
            </>
          )}
        </button>
      </div>

      <div className="grid grid-cols-1 gap-6">
        {/* CARDS 1: APRESENTAÇÃO */}
        <div className="bg-card border border-border rounded-2xl p-6 space-y-5 shadow-sm">
          <h2 className="text-sm font-bold text-foreground uppercase tracking-widest border-b border-border/40 pb-3 flex items-center gap-2">
            <User className="w-4 h-4 text-muted-foreground" /> Apresentação
          </h2>

          {/* Foto & Nome */}
          <div className="flex flex-col sm:flex-row gap-5 items-start sm:items-center">
            {/* Preview da Foto */}
            <div className="relative group shrink-0">
              <div className="w-20 h-20 rounded-full overflow-hidden border-2 border-border bg-muted flex items-center justify-center shadow-inner">
                {fotoUrl ? (
                  <img
                    src={fotoUrl}
                    alt="Preview de perfil"
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = "";
                    }}
                  />
                ) : (
                  <User className="w-8 h-8 text-muted-foreground/45" />
                )}
              </div>
            </div>

            <div className="flex-1 w-full space-y-4">
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-1.5">
                  URL da Foto de Perfil
                </label>
                <div className="flex items-center gap-2 bg-background border border-border/80 rounded-xl px-3 py-2.5 shadow-sm focus-within:border-primary/50 transition-colors">
                  <ImageIcon className="w-4 h-4 text-muted-foreground/60 shrink-0" />
                  <input
                    type="text"
                    value={fotoUrl}
                    onChange={(e) => setFotoUrl(e.target.value)}
                    placeholder="https://sua-imagem.com/foto.jpg"
                    className="bg-transparent border-0 text-foreground text-xs focus:outline-none w-full"
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4">
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-1.5">
                Nome Artístico / Estúdio
              </label>
              <div className="flex items-center gap-2 bg-background border border-border/80 rounded-xl px-3 py-2.5 shadow-sm focus-within:border-primary/50 transition-colors">
                <User className="w-4 h-4 text-muted-foreground/60 shrink-0" />
                <input
                  type="text"
                  value={nome}
                  onChange={(e) => setNome(e.target.value)}
                  placeholder="Nome exibido para os clientes"
                  className="bg-transparent border-0 text-foreground text-xs focus:outline-none w-full font-medium"
                />
              </div>
            </div>

            <div>
              <label className="block text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-1.5">
                Biografia / Especialidades
              </label>
              <div className="flex items-start gap-2 bg-background border border-border/80 rounded-xl px-3 py-2.5 shadow-sm focus-within:border-primary/50 transition-colors">
                <FileText className="w-4 h-4 text-muted-foreground/60 shrink-0 mt-0.5" />
                <textarea
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  placeholder="Ex: Tatuador especialista em Blackwork e Fineline com mais de 5 anos de experiência..."
                  rows={3}
                  className="bg-transparent border-0 text-foreground text-xs focus:outline-none w-full resize-none leading-relaxed"
                />
              </div>
            </div>
          </div>
        </div>

        {/* CARD 2: LINK PÚBLICO E LOCAL */}
        <div className="bg-card border border-border rounded-2xl p-6 space-y-5 shadow-sm">
          <h2 className="text-sm font-bold text-foreground uppercase tracking-widest border-b border-border/40 pb-3 flex items-center gap-2">
            <Globe className="w-4 h-4 text-muted-foreground" /> Link e Localização
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-1.5">
                Link da sua Agenda (slug)
              </label>
              <div className="flex items-center bg-background border border-border/80 rounded-xl px-3 py-2.5 shadow-sm focus-within:border-primary/50 transition-colors">
                <span className="text-xs text-muted-foreground/65 font-medium select-none pr-1">/</span>
                <input
                  type="text"
                  value={slug}
                  onChange={(e) => setSlug(e.target.value)}
                  placeholder="nome-do-usuario"
                  className="bg-transparent border-0 text-foreground text-xs focus:outline-none w-full font-medium"
                />
              </div>
              <p className="text-[10px] text-muted-foreground mt-1.5">
                Apenas letras, números, hífen e underline.
              </p>
            </div>

            <div>
              <label className="block text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-1.5">
                Cidade / Região
              </label>
              <div className="flex items-center gap-2 bg-background border border-border/80 rounded-xl px-3 py-2.5 shadow-sm focus-within:border-primary/50 transition-colors">
                <MapPin className="w-4 h-4 text-muted-foreground/60 shrink-0" />
                <input
                  type="text"
                  value={cidade}
                  onChange={(e) => setCidade(e.target.value)}
                  placeholder="Cidade - Estado"
                  className="bg-transparent border-0 text-foreground text-xs focus:outline-none w-full font-medium"
                />
              </div>
            </div>
          </div>
        </div>

        {/* CARD 3: CONTATO E REDES */}
        <div className="bg-card border border-border rounded-2xl p-6 space-y-5 shadow-sm">
          <h2 className="text-sm font-bold text-foreground uppercase tracking-widest border-b border-border/40 pb-3 flex items-center gap-2">
            <Link2 className="w-4 h-4 text-muted-foreground" /> Contato e Redes Sociais
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-1.5">
                Instagram (@)
              </label>
              <div className="flex items-center bg-background border border-border/80 rounded-xl px-3 py-2.5 shadow-sm focus-within:border-primary/50 transition-colors">
                <Instagram className="w-4 h-4 text-muted-foreground/60 shrink-0 mr-1.5" />
                <span className="text-xs text-muted-foreground/65 font-medium select-none pr-0.5">@</span>
                <input
                  type="text"
                  value={instagram}
                  onChange={(e) => setInstagram(e.target.value)}
                  placeholder="seu_usuario"
                  className="bg-transparent border-0 text-foreground text-xs focus:outline-none w-full font-medium"
                />
              </div>
            </div>

            <div>
              <label className="block text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-1.5">
                WhatsApp
              </label>
              <div className="flex items-center gap-2 bg-background border border-border/80 rounded-xl px-3 py-2.5 shadow-sm focus-within:border-primary/50 transition-colors">
                <Phone className="w-4 h-4 text-muted-foreground/60 shrink-0" />
                <input
                  type="text"
                  value={whatsapp}
                  onChange={(e) => setWhatsapp(e.target.value)}
                  placeholder="Ex: 11999999999"
                  className="bg-transparent border-0 text-foreground text-xs focus:outline-none w-full font-medium"
                />
              </div>
              <p className="text-[10px] text-muted-foreground mt-1.5">
                Apenas números com DDD e o 9 (ex: 11999999999).
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
