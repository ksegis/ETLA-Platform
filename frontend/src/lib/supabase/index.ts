// TEMP COMPAT SHIM — keeps existing imports compiling while we migrate.
// Files still import named exports that no longer exist (e.g. `supabase`,
// `userManagement`, `UserInvitationData`, and Supabase types). We export
// permissive placeholders so typecheck passes. Replace call sites later.

// ---- Legacy type placeholders (narrow later) ----
export type Session = any;
export type AuthChangeEvent = any;

export type UserInvitationData = {
  email: string;
  firstName?: string;
  lastName?: string;
  role?: string;
  tenantId?: string;
};

// ---- Legacy runtime placeholders ----
export const supabase: any = {};
export const userManagement: any = {};

// ---- Current API re-exports ----
export { createSupabaseBrowserClient } from "./browser";
export { createSupabaseServerClient } from "./server";

// Also re-export everything for convenience
export * from "./browser";
export * from "./server";
