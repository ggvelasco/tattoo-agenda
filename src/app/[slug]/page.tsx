import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";

export default async function PerfilPublicoPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const supabase = await createClient();

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
    .eq("ativo", true);

  return (
    <div className="min-h-screen bg-zinc-950 text-white">
      {/* HERO */}
      <div className="max-w-3xl mx-auto px-6 pt-20 pb-12">
        <div className="flex items-start gap-6 mb-8">
          <div className="w-20 h-20 rounded-full bg-zinc-800 flex-shrink-0 overflow-hidden">
            {perfil.foto_url ? (
              <img
                src={perfil.foto_url}
                alt={perfil.nome}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-2xl">
                {perfil.nome.charAt(0).toUpperCase()}
              </div>
            )}
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white">{perfil.nome}</h1>
            {perfil.cidade && (
              <p className="text-zinc-400 text-sm mt-1">📍 {perfil.cidade}</p>
            )}
            {perfil.instagram && (
              <a
                href={`https://instagram.com/${perfil.instagram.replace("@", "")}`}
                target="_blank"
                className="text-zinc-400 text-sm hover:text-white transition"
              >
                @{perfil.instagram.replace("@", "")}
              </a>
            )}
            {perfil.bio && (
              <p className="text-zinc-300 text-sm mt-3 leading-relaxed max-w-lg">
                {perfil.bio}
              </p>
            )}
          </div>
        </div>

        {/* BOTÃO AGENDAR */}

        <a
          href={`/${slug}/agendar`}
          className="inline-block w-full text-center bg-white text-black py-4 text-sm font-medium uppercase tracking-widest hover:bg-zinc-200 transition mb-12"
        >
          Agendar sessão
        </a>

        {/* SERVIÇOS */}
        {servicos && servicos.length > 0 && (
          <div>
            <h2 className="text-xs uppercase tracking-widest text-zinc-500 mb-4">
              Serviços
            </h2>
            <div className="space-y-3">
              {servicos.map((s) => (
                <div
                  key={s.id}
                  className="border border-zinc-800 p-4 flex items-center justify-between"
                >
                  <div>
                    <p className="text-sm font-medium text-white">{s.nome}</p>
                    {s.descricao && (
                      <p className="text-xs text-zinc-500 mt-0.5">
                        {s.descricao}
                      </p>
                    )}
                    <p className="text-xs text-zinc-500 mt-1">
                      {s.duracao_minutos}min
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-white">
                      R$ {Number(s.preco).toFixed(2)}
                    </p>

                    <a
                      href={`/${slug}/agendar?servico=${s.id}`}
                      className="text-xs text-zinc-400 hover:text-white transition mt-1 block"
                    >
                      Agendar →
                    </a>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
