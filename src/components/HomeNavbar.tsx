import { createClient } from "@/lib/supabase/server";
import HomeNavbarClient from "./HomeNavbarClient";

export default async function HomeNavbar() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return <HomeNavbarClient isLoggedIn={!!user} />;
}
