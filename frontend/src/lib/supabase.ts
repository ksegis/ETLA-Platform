import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_TOKEN || 'placeholder-key';

// Check if we're in a build environment or demo mode
const isBuildTime = typeof window === 'undefined' && !process.env.NEXT_PUBLIC_SUPABASE_URL;
const isDemoMode = supabaseUrl === 'https://placeholder.supabase.co' || 
                   supabaseAnonKey === 'placeholder-key' ||
                   supabaseUrl === 'https://demo.supabase.co' ||
                   supabaseAnonKey === 'demo_anon_key';

// Create a mock client for build time or demo mode
const createMockClient = () => ({
  from: (table: string) => ({
    select: (columns?: string) => ({
      eq: (column: string, value: any) => ({
        order: (column: string, options?: any) => ({
          limit: (limit: number) => Promise.resolve({ data: [], error: null }),
          then: (resolve: any) => resolve({ data: [], error: null })
        }),
        then: (resolve: any) => resolve({ data: [], error: null })
      }),
      in: (column: string, values: any[]) => ({
        order: (column: string, options?: any) => ({
          limit: (limit: number) => Promise.resolve({ data: [], error: null }),
          then: (resolve: any) => resolve({ data: [], error: null })
        }),
        then: (resolve: any) => resolve({ data: [], error: null })
      }),
      or: (condition: string) => ({
        order: (column: string, options?: any) => ({
          limit: (limit: number) => Promise.resolve({ data: [], error: null }),
          then: (resolve: any) => resolve({ data: [], error: null })
        }),
        then: (resolve: any) => resolve({ data: [], error: null })
      }),
      order: (column: string, options?: any) => ({
        then: (resolve: any) => resolve({ data: [], error: null })
      }),
      then: (resolve: any) => resolve({ data: [], error: null })
    }),
    insert: (data: any) => ({
      select: () => ({
        single: () => Promise.resolve({ data: null, error: null })
      }),
      then: (resolve: any) => resolve({ data: null, error: null })
    }),
    update: (data: any) => ({
      eq: (column: string, value: any) => Promise.resolve({ data: null, error: null })
    }),
    delete: () => ({
      eq: (column: string, value: any) => Promise.resolve({ data: null, error: null })
    })
  }),
  auth: {
    getSession: () => Promise.resolve({ data: { session: null }, error: null }),
    getUser: () => Promise.resolve({ data: { user: null }, error: null }),
    signInWithPassword: () => Promise.resolve({ data: { user: null, session: null }, error: null }),
    signUp: () => Promise.resolve({ data: { user: null, session: null }, error: null }),
    signOut: () => Promise.resolve({ error: null }),
    resetPasswordForEmail: () => Promise.resolve({ data: {}, error: null }),
    onAuthStateChange: () => ({ data: { subscription: { unsubscribe: () => {} } } }),
    admin: {
      createUser: () => Promise.resolve({ data: { user: null }, error: null }),
      deleteUser: () => Promise.resolve({ data: {}, error: null }),
      updateUserById: () => Promise.resolve({ data: { user: null }, error: null }),
      inviteUserByEmail: () => Promise.resolve({ data: {}, error: null })
    }
  }
});

export const supabase = (isBuildTime || isDemoMode) ? createMockClient() as any : createClient(supabaseUrl, supabaseAnonKey);
