"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";

type Perfil = {
  nome: string;
  bio: string;
  instagram: string;
  cidade: string;
  slug: string;
  foto_url: string;
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
  const [fotoUrl, setFotoUrl] = useState("");

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
  }
  async function salvar() {
    if (!perfilId) return;
    setSaving(true);

    const supabase = createClient();
    await supabase
      .from("profissionais")
      .update({ nome, bio, instagram, cidade, slug, foto_url: fotoUrl })
      .eq("id", perfilId);

    setSaving(false);
    alert("Perfil salvo!");
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
  return (
    <div className="max-w-2xl">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Perfil</h1>
          <p className="text-muted-foreground text-sm mt-1">
            Suas informações públicas
          </p>
        </div>
        <button
          onClick={salvar}
          disabled={saving}
          className="bg-primary text-primary-foreground px-4 py-2 text-sm font-medium hover:opacity-90 transition rounded-md disabled:opacity-50"
        >
          {saving ? "Salvando..." : "Salvar perfil"}
        </button>
      </div>

      <div className="space-y-4">
        <div>
          <label className="block text-xs uppercase tracking-widest text-muted-foreground mb-2">
            URL da foto de perfil
          </label>
          <input
            type="text"
            value={fotoUrl}
            onChange={(e) => setFotoUrl(e.target.value)}
            placeholder="https://..."
            className="w-full bg-background border border-border text-foreground px-3 py-2 text-sm rounded-md focus:outline-none focus:border-ring"
          />
        </div>
        <div>
          <label className="block text-xs uppercase tracking-widest text-muted-foreground mb-2">
            Nome
          </label>
          <input
            type="text"
            value={nome}
            onChange={(e) => setNome(e.target.value)}
            placeholder="Digite seu nome..."
            className="w-full bg-background border border-border text-foreground px-3 py-2 text-sm rounded-md focus:outline-none focus:border-ring"
          />
        </div>
        <div>
          <label className="block text-xs uppercase tracking-widest text-muted-foreground mb-2">
            Bio
          </label>
          <textarea
            type="text"
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            placeholder="Digite sua bio..."
            className="w-full bg-background border border-border text-foreground px-3 py-2 text-sm rounded-md focus:outline-none focus:border-ring"
          />
        </div>
        <div>
          <label className="block text-xs uppercase tracking-widest text-muted-foreground mb-2">
            Instagram
          </label>
          <input
            type="text"
            value={instagram}
            onChange={(e) => setInstagram(e.target.value)}
            placeholder="Digite seu Instagram..."
            className="w-full bg-background border border-border text-foreground px-3 py-2 text-sm rounded-md focus:outline-none focus:border-ring"
          />
        </div>
        <div>
          <label className="block text-xs uppercase tracking-widest text-muted-foreground mb-2">
            Cidade
          </label>
          <input
            type="text"
            value={cidade}
            onChange={(e) => setCidade(e.target.value)}
            placeholder="Digite sua cidade..."
            className="w-full bg-background border border-border text-foreground px-3 py-2 text-sm rounded-md focus:outline-none focus:border-ring"
          />
        </div>
        <div>
          <label className="block text-xs uppercase tracking-widest text-muted-foreground mb-2">
            Usuário
          </label>
          <input
            type="text"
            value={slug}
            onChange={(e) => setSlug(e.target.value)}
            placeholder="Digite seu usuário..."
            className="w-full bg-background border border-border text-foreground px-3 py-2 text-sm rounded-md focus:outline-none focus:border-ring"
          />
        </div>
      </div>
    </div>
  );
}
