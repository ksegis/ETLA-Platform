// src/types/shims/missing-ui.d.ts

// Stub for any code that references a navigation module without importing the real one yet.
// Adjust later to point to your real module if you have it.
declare module '@/components/navigation' {
  export type NavigationItem = {
    id: string
    label: string
    href?: string
    items?: NavigationItem[]
  }

  export type NavigationGroup = {
    id: string
    label: string
    items?: NavigationItem[]
  }

  // No-op toggle used by some components; replace with real impl later.
  export function toggleGroupExpansion(id: string): void
}

// Some projects reference router utils. If you do not have these yet, this keeps TS happy.
// Remove or replace with your real file when available.
declare module '@/lib/router-utils' {
  export function isActivePath(pathname: string, href?: string): boolean
  export function joinPath(...parts: string[]): string
}
