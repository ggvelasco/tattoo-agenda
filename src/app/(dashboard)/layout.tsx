import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import {
  SidebarProvider,
  SidebarInset,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { SidebarLeft } from "@/components/sidebar-left";
import SidebarRightWrapper from "@/components/dashboard/SidebarRightWrapper";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  return (
    <SidebarProvider>
      <SidebarLeft />
      <SidebarInset>
        <header className="flex items-center gap-2 px-4 py-3 border-b border-border md:hidden">
          <SidebarTrigger />
          <span className="text-sm font-semibold">Tattooagenda</span>
        </header>
        <main className="flex-1 p-6">{children}</main>
      </SidebarInset>
      <SidebarRightWrapper />
    </SidebarProvider>
  );
}
