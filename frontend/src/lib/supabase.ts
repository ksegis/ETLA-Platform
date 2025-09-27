import { createClient } from '@supabase/supabase-js';

const NEXT_PUBLIC_SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co';
const NEXT_PUBLIC_SUPABASE_ANON_TOKEN = process.env.NEXT_PUBLIC_SUPABASE_ANON_TOKEN || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBsYWNlaG9sZGVyIiwicm9sZSI6ImFub24iLCJpYXQiOjE2NDUxMjM0NTYsImV4cCI6MTk2MDY5OTQ1Nn0.dummySignatureForBuildTime';

// Force real Supabase client usage - disable mock client detection
const useMockClient = false;

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

// Initialize the Supabase client conditionally with error handling
let supabaseClient: any;

try {
  if (useMockClient) {
    console.log('🔧 Using mock Supabase client (demo mode)');
    supabaseClient = createMockClient();
  } else if (NEXT_PUBLIC_SUPABASE_URL && NEXT_PUBLIC_SUPABASE_ANON_TOKEN) {
    console.log('🔗 Initializing real Supabase client');
    supabaseClient = createClient(NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_TOKEN);
  } else {
    console.warn('⚠️ Missing Supabase environment variables, falling back to mock client');
    supabaseClient = createMockClient();
  }
} catch (error) {
  console.error('❌ Error initializing Supabase client, using mock client:', error);
  supabaseClient = createMockClient();
}

export const supabase = supabaseClient;

// Export a function to check if the client is in demo mode
export const isSupabaseDemoMode = useMockClient;
