import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import Link from "next/link";
import SlugNavbarClient from "@/components/SlugNavbarClient";
import SlugPageClient from "@/components/SlugPageClient";
import { MapPin, Instagram } from "lucide-react";

function formatarPreco(s: { tipo_preco: string; preco: number }) {
  if (s.tipo_preco === "sob_consulta") return "Sob consulta";
  if (s.tipo_preco === "a_partir_de")
    return `A partir de R$ ${Number(s.preco).toFixed(0)}`;
  return `R$ ${Number(s.preco).toFixed(0)}`;
}

export default async function PerfilPublicoPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: perfilLogado } = user
    ? await supabase
        .from("profissionais")
        .select("nome, foto_url, slug")
        .eq("user_id", user.id)
        .single()
    : { data: null };

  const { data: perfil } = await supabase
    .from("profissionais")
    .select("*")
    .eq("slug", slug)
    .single();

  if (!perfil) notFound();

  const { data: servicos } = await supabase
    .from("servicos")
    .select("*")
    .eq("profissional_id", perfil.id)
    .eq("ativo", true)
    .order("ordem", { ascending: true });

  const primeiroNome = perfil.nome.split(" ")[0];
  const restoNome = perfil.nome.split(" ").slice(1).join(" ");

  const servicosFormatados = (servicos || []).map((s) => ({
    ...s,
    precoFormatado: formatarPreco(s),
  }));

  return (
    <div className="bg-[#0A0A0A] min-h-screen text-foreground relative overflow-hidden">
      {/* Background glow effects */}
      <div className="absolute -top-40 -right-40 w-96 h-96 rounded-full bg-primary/5 blur-3xl pointer-events-none" />
      <div className="absolute top-1/3 -left-40 w-80 h-80 rounded-full bg-indigo-500/5 blur-3xl pointer-events-none" />

      {/* NAV */}
      <SlugNavbarClient
        isLoggedIn={!!user}
        nome={perfilLogado?.nome}
        fotoUrl={perfilLogado?.foto_url || undefined}
      />

      <main className="max-w-xl mx-auto px-6 pt-12 pb-24 space-y-10 relative">
        {/* HERO */}
        <section className="flex flex-col items-center text-center space-y-5">
          <div className="p-1 bg-border/40 rounded-full hover:scale-105 transition-all duration-300 shadow-lg">
            {perfil.foto_url ? (
              <img
                src={perfil.foto_url}
                alt={perfil.nome}
                className="w-24 h-24 sm:w-28 sm:h-28 rounded-full object-cover block border-2 border-background"
              />
            ) : (
              <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-full bg-muted flex items-center justify-center text-2xl font-bold font-display text-primary border-2 border-background">
                {perfil.nome.charAt(0).toUpperCase()}
              </div>
            )}
          </div>

          <div className="space-y-2">
            <h1 className="font-display text-3xl sm:text-4xl font-black uppercase tracking-tight text-foreground leading-tight">
              {primeiroNome}
              {restoNome && <span className="text-muted-foreground block sm:inline"> {restoNome}</span>}
            </h1>

            {perfil.cidade && (
              <div className="inline-flex items-center gap-1.5 text-[10px] font-bold tracking-widest text-muted-foreground uppercase">
                <MapPin className="w-3.5 h-3.5 text-primary shrink-0" />
                <span>{perfil.cidade}</span>
              </div>
            )}
          </div>

          {perfil.bio && (
            <p className="text-sm text-muted-foreground/85 leading-relaxed max-w-sm font-light">
              {perfil.bio}
            </p>
          )}

          <div className="flex flex-wrap justify-center gap-3 pt-2">
            {perfil.instagram && (
              <a
                href={`https://instagram.com/${perfil.instagram.replace("@", "")}`}
                target="_blank"
                className="inline-flex items-center gap-2 border border-border/80 hover:border-foreground/45 bg-transparent text-muted-foreground hover:text-foreground px-5 py-2.5 rounded-full text-xs font-semibold transition-all shadow-sm"
              >
                <Instagram className="w-4 h-4 shrink-0" />
                Instagram
              </a>
            )}
            <Link
              href={`/${slug}/agendar`}
              className="inline-flex items-center gap-2 bg-primary text-primary-foreground hover:opacity-90 px-6 py-2.5 rounded-full text-xs font-bold transition-all shadow-md select-none border border-primary"
            >
              Agendar sessão
            </Link>
          </div>
        </section>

        {/* TABS + CONTEÚDO */}
        <SlugPageClient
          slug={slug}
          servicos={servicosFormatados}
          whatsapp={perfil.whatsapp}
          nome={perfil.nome}
        />
      </main>

      {/* FOOTER */}
      <footer className="border-t border-border/20 py-10 px-6 mt-12">
        <div className="max-w-xl mx-auto text-center space-y-4">
          <div className="font-display font-black tracking-tight text-xs uppercase text-muted-foreground/40">
            TATTOO<span className="text-primary/40">AGENDA</span>
          </div>
          {perfil.instagram && (
            <div>
              <a
                href={`https://instagram.com/${perfil.instagram.replace("@", "")}`}
                target="_blank"
                className="text-[10px] font-bold text-muted-foreground/50 hover:text-muted-foreground uppercase tracking-widest transition-colors"
              >
                Instagram
              </a>
            </div>
          )}
          <p className="text-[10px] font-medium text-muted-foreground/30 uppercase tracking-wider">
            © {new Date().getFullYear()} {perfil.nome} × Tattooagenda
          </p>
        </div>
      </footer>
    </div>
  );
}
