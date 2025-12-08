import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

export default async function ProfilePage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth/login");
  }

  return (
    <div className="container mt-5">
      <h2>Profile</h2>
      <div className="card p-4 shadow-sm">
        <p><strong>ID:</strong> {user.id}</p>
        <p><strong>Name:</strong> {user.user_metadata?.full_name || "N/A"}</p>
        <p><strong>Email:</strong> {user.email}</p>
      </div>
    </div>
  );
}
