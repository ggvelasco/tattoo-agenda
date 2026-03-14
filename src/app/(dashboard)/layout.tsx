import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";
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
        <main className="flex-1 p-6">{children}</main>
      </SidebarInset>
      <SidebarRightWrapper />
    </SidebarProvider>
  );
}
