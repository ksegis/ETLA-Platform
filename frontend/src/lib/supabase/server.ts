import "server-only";
import { cookies } from "next/headers";
import { createServerClient, type CookieOptions } from "@supabase/ssr";

export function createSupabaseServerClient() {
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookies().get(name)?.value;
        },
        set(name: string, value: string, options: CookieOptions) {
          try {
            cookies().set({ name, value, ...options });
          } catch (error) {
            // The `cookies().set()` method can only be called in a Server Component or Route Handler. This error is typically thrown if you\"re calling it from a Client Component
          }
        },
        remove(name: string, options: CookieOptions) {
          try {
            cookies().set({ name, value: ", ...options });
          } catch (error) {
            // The `cookies().set()` method can only be called in a Server Component or Route Handler. This error is typically thrown if you\"re calling it from a Client Component
          }
        },
      },
    }
  );
}

