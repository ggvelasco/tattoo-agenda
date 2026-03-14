"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import {
  HomeIcon,
  CalendarIcon,
  ClipboardListIcon,
  ScissorsIcon,
  ClockIcon,
  UserIcon,
  LogOutIcon,
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

export function SidebarLeft({
  ...props
}: React.ComponentProps<typeof Sidebar>) {
  const pathname = usePathname();
  const router = useRouter();

  async function handleLogout() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  }

  return (
    <Sidebar className="border-r-0" {...props}>
      <SidebarHeader className="p-4 border-b border-sidebar-border">
        <div>
          <span className="text-sm font-semibold text-sidebar-foreground">
            GUSDEV INK STUDIO 🔥
          </span>
          <span className="text-xs text-muted-foreground block">
            Painel do estúdio
          </span>
        </div>
      </SidebarHeader>

      <SidebarContent className="p-2">
        <SidebarMenu>
          {links.map((link) => {
            const Icon = link.icon;
            const active = pathname === link.href;
            return (
              <SidebarMenuItem key={link.href}>
                <SidebarMenuButton asChild isActive={active}>
                  <Link href={link.href} className="flex items-center gap-2">
                    <Icon className="size-4" />
                    <span>{link.label}</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            );
          })}
        </SidebarMenu>
      </SidebarContent>

      <SidebarFooter className="p-2 border-t border-sidebar-border">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton onClick={handleLogout}>
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
