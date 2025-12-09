import { NavBarClient } from "@/components/NavBarClient";
import { getCurrentProfile } from "@/lib/services/profiles";
import type { Profile } from "@/lib/types/profile";

export async function NavBar() {
  let profile: Profile | null = null;

  try {
    profile = await getCurrentProfile();
  } catch {
    // Auth check failed, user remains logged out
  }

  return <NavBarClient profile={profile} />;
}
