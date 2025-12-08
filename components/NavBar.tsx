import { createClient } from "@/lib/supabase/server";
import { NavBarClient } from "@/components/NavBarClient";

export async function NavBar() {
  let isLoggedIn = false;

  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    isLoggedIn = !!user;
  } catch {
    // Auth check failed, user remains logged out
  }

  return <NavBarClient isLoggedIn={isLoggedIn} />;
}
