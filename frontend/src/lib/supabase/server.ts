import { cookies } from "next/headers";
import { createServerClient, type CookieOptions } from "@supabase/ssr";

export function createSupabaseServerClient() {
  const store = cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return store.get(name)?.value;
        },
        set(name: string, value: string, options: CookieOptions) {
          // Next.js App Router API
          store.set(name, value, options);
        },
        remove(name: string, options: CookieOptions) {
          // Remove by setting maxAge=0
          store.set(name, "", { ...options, maxAge: 0 });
        },
      },
    }
  );
}



