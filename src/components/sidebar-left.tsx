"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import {
  HomeIcon,
  CalendarIcon,
  ClipboardListIcon,
  ScissorsIcon,
  ClockIcon,
  UserIcon,
  LogOutIcon,
  ExternalLinkIcon,
} from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarRail,
} from "@/components/ui/sidebar";
import { AnimatedThemeToggler } from "./ui/animated-theme-toggler";

const ACCENT = "#818cf8";

const links = [
  { href: "/dashboard", label: "Início", icon: HomeIcon },
  { href: "/dashboard/agenda", label: "Agenda", icon: CalendarIcon },
  {
    href: "/dashboard/agendamentos",
    label: "Agendamentos",
    icon: ClipboardListIcon,
  },
  { href: "/dashboard/servicos", label: "Serviços", icon: ScissorsIcon },
  { href: "/dashboard/horarios", label: "Horários", icon: ClockIcon },
  { href: "/dashboard/perfil", label: "Perfil", icon: UserIcon },
];

type Perfil = { nome: string; slug: string; foto_url: string | null };

export function SidebarLeft({
  ...props
}: React.ComponentProps<typeof Sidebar>) {
  const pathname = usePathname();
  const router = useRouter();
  const [perfil, setPerfil] = useState<Perfil | null>(null);

  useEffect(() => {
    async function load() {
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return;
      const { data } = await supabase
        .from("profissionais")
        .select("nome, slug, foto_url")
        .eq("user_id", user.id)
        .single();
      if (data) setPerfil(data);
    }
    load();
  }, []);

  async function handleLogout() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  }

  return (
    <Sidebar className="border-r-0" {...props}>
      {/* HEADER — avatar + nome */}
      <SidebarHeader className="p-4 border-b border-sidebar-border">
        <div className="flex items-center gap-3">
          {/* avatar */}
          <div style={{ position: "relative", flexShrink: 0 }}>
            <div
              style={{
                width: "38px",
                height: "38px",
                borderRadius: "10px",
                overflow: "hidden",
                border: `1.5px solid ${ACCENT}30`,
                background: "#1a1a1a",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0,
              }}
            >
              {perfil?.foto_url ? (
                <img
                  src={perfil.foto_url}
                  alt={perfil.nome}
                  style={{ width: "100%", height: "100%", objectFit: "cover" }}
                />
              ) : (
                <span
                  style={{
                    fontFamily: "'Unbounded',sans-serif",
                    fontSize: "14px",
                    fontWeight: 700,
                    color: ACCENT,
                  }}
                >
                  {perfil?.nome?.charAt(0)?.toUpperCase() ?? "T"}
                </span>
              )}
            </div>
            <div
              style={{
                position: "absolute",
                bottom: "-2px",
                right: "-2px",
                width: "9px",
                height: "9px",
                borderRadius: "9999px",
                background: "#22c55e",
                border: "2px solid var(--sidebar-background)",
                boxShadow: "0 0 4px rgba(34,197,94,0.7)",
              }}
            />
          </div>

          <div className="min-w-0 flex-1">
            <p className="text-sm font-semibold text-sidebar-foreground truncate">
              {perfil?.nome ?? "Carregando..."}
            </p>
            {perfil?.slug && (
              <p
                className="text-xs text-muted-foreground truncate"
                style={{ color: "#333" }}
              >
                /{perfil.slug}
              </p>
            )}
          </div>
        </div>

        {/* link da página pública */}
        {perfil?.slug && (
          <Link
            href={`/${perfil.slug}`}
            target="_blank"
            className="mt-3 flex items-center justify-between gap-2 rounded-lg px-3 py-2 text-xs transition-colors group"
            style={{
              background: "rgba(255,255,255,0.03)",
              border: "1px solid rgba(255,255,255,0.06)",
              color: "#444",
              textDecoration: "none",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = `${ACCENT}10`;
              e.currentTarget.style.borderColor = `${ACCENT}25`;
              e.currentTarget.style.color = ACCENT;
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = "rgba(255,255,255,0.03)";
              e.currentTarget.style.borderColor = "rgba(255,255,255,0.06)";
              e.currentTarget.style.color = "#444";
            }}
          >
            <span className="font-medium truncate">Ver minha página</span>
            <ExternalLinkIcon className="w-3 h-3 shrink-0" />
          </Link>
        )}
      </SidebarHeader>

      {/* NAV */}
      <SidebarContent className="p-2">
        <SidebarMenu>
          {links.map(({ href, label, icon: Icon }) => {
            const active = pathname === href;
            return (
              <SidebarMenuItem key={href}>
                <SidebarMenuButton asChild isActive={active}>
                  <Link
                    href={href}
                    className="flex items-center gap-2"
                    style={active ? { color: ACCENT } : {}}
                  >
                    <Icon
                      className="size-4"
                      style={active ? { color: ACCENT } : {}}
                    />
                    <span>{label}</span>
                    {active && (
                      <div
                        style={{
                          marginLeft: "auto",
                          width: "4px",
                          height: "4px",
                          borderRadius: "9999px",
                          background: ACCENT,
                          boxShadow: `0 0 6px ${ACCENT}`,
                        }}
                      />
                    )}
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            );
          })}
        </SidebarMenu>
      </SidebarContent>

      {/* FOOTER */}
      <SidebarFooter className="p-2 border-t border-sidebar-border">
        <SidebarMenu>
          <SidebarMenuItem>
            <div className="hidden md:block fixed bottom-14 left-3 z-50">
              <AnimatedThemeToggler />
            </div>
            <SidebarMenuButton
              onClick={handleLogout}
              style={{ color: "#444", transition: "color .2s" }}
              onMouseEnter={(e) => (e.currentTarget.style.color = "#ef4444")}
              onMouseLeave={(e) => (e.currentTarget.style.color = "#444")}
            >
              <LogOutIcon className="size-4" />
              <span>Sair</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>

      <SidebarRail />
    </Sidebar>
  );
}
