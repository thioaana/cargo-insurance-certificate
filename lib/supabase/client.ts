import { createBrowserClient } from "@supabase/ssr";

// Validate and get required environment variables
function getEnvVar(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Missing environment variable: ${name}`);
  }
  return value;
}

const supabaseUrl = getEnvVar("NEXT_PUBLIC_SUPABASE_URL");
const supabaseAnonKey = getEnvVar("NEXT_PUBLIC_SUPABASE_ANON_KEY");

export function createClient() {
  return createBrowserClient(supabaseUrl, supabaseAnonKey);
}
