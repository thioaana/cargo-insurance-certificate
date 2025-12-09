"use client";

import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";

export function LogoutButton() {
  const router = useRouter();

  const logout = async () => {
    try {
      const supabase = createClient();
      const { error } = await supabase.auth.signOut();

      if (error) {
        toast.error("Failed to logout. Please try again.");
        return;
      }

      toast.success("Logged out successfully");
      router.push("/");
      router.refresh();
    } catch {
      toast.error("Failed to logout. Please try again.");
    }
  };

  return <Button onClick={logout}>Logout</Button>;
}
