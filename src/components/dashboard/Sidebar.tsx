"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";

const links = [
  { href: "/dashboard", label: "Início", icon: "◈" },
  { href: "/dashboard/agenda", label: "Agenda", icon: "◷" },
  { href: "/dashboard/agendamentos", label: "Agendamentos", icon: "◉" },
  { href: "/dashboard/servicos", label: "Serviços", icon: "◆" },
  { href: "/dashboard/horarios", label: "Horários", icon: "◑" },
  { href: "/dashboard/perfil", label: "Perfil", icon: "◎" },
];

export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();

  async function handleLogout() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  }

  return (
    <aside className="fixed left-0 top-0 h-screen w-64 bg-zinc-900 border-r border-zinc-800 flex flex-col">
      <div className="p-6 border-b border-zinc-800">
        <span className="text-white font-bold text-lg tracking-tight">
          Em desenvolvimento
        </span>
        <span className="text-zinc-500 text-xs block mt-1">
          Painel do estúdio
        </span>
      </div>

      <nav className="flex-1 p-4 space-y-1">
        {links.map((link) => {
          const active = pathname === link.href;
          return (
            <Link
              key={link.href}
              href={link.href}
              className={`flex items-center gap-3 px-3 py-2.5 text-sm transition-colors rounded-sm ${
                active
                  ? "bg-zinc-800 text-white"
                  : "text-zinc-400 hover:text-white hover:bg-zinc-800/50"
              }`}
            >
              <span className="text-base">{link.icon}</span>
              {link.label}
            </Link>
          );
        })}
      </nav>

      <div className="p-4 border-t border-zinc-800">
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-3 py-2.5 text-sm text-zinc-400 hover:text-white hover:bg-zinc-800/50 transition-colors rounded-sm"
        >
          <span>→</span>
          Sair
        </button>
      </div>
    </aside>
  );
}
