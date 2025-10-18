"use client";
import { createBrowserClient } from "@supabase/ssr";

export function createSupabaseBrowserClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}

// Support legacy imports like: import { createClient } from "lib/supabase/browser"
export { createBrowserClient as createClient } from "@supabase/ssr";

// Support default import: import createSupabaseBrowserClient from "lib/supabase/browser"
export default createSupabaseBrowserClient;
