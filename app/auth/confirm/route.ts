import { createClient } from "@/lib/supabase/server";
import { type EmailOtpType } from "@supabase/supabase-js";
import { redirect } from "next/navigation";
import { type NextRequest } from "next/server";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const token_hash = searchParams.get("token_hash");
  const type = searchParams.get("type") as EmailOtpType | null;
  const next = searchParams.get("next") ?? "/";

  // Validate redirect path to prevent open redirect attacks
  const allowedPaths = ["/", "/dashboard", "/new-proposal"];
  const safeNext = next.startsWith("/") && !next.startsWith("//") && allowedPaths.some(p => next === p || next.startsWith(p + "/")) ? next : "/";

  if (token_hash && type) {
    const supabase = await createClient();

    const { error } = await supabase.auth.verifyOtp({
      type,
      token_hash,
    });
    if (!error) {
      // redirect user to specified redirect URL or root of app
      redirect(safeNext);
    } else {
      // redirect the user to an error page with a generic error code
      // Actual error is not exposed to prevent information leakage
      redirect(`/auth/error?code=verification_failed`);
    }
  }

  // redirect the user to an error page with a generic error code
  redirect(`/auth/error?code=invalid_request`);
}
