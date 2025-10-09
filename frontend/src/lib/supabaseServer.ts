import { cookies } from "next/headers";
import { createClient } from "@supabase/supabase-js";

/**
 * Next.js 15: cookies() is async.
 * Make this helper async and ALWAYS `await getSupabaseServerClient()` at call sites.
 */
export async function getSupabaseServerClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
  const cookieStore = await cookies();

  const token =
    cookieStore.get("sb-access-token")?.value ??
    cookieStore.get("supabase-auth-token")?.value ??
    undefined;

  return createClient(url, anon, {
    auth: { persistSession: false, autoRefreshToken: false },
    global: token ? { headers: { Authorization: `Bearer ${token}` } } : undefined,
  });
}

export function publicUrl(bucket: string, path: string) {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  return `${url}/storage/v1/object/public/${bucket}/${path}`;
}
