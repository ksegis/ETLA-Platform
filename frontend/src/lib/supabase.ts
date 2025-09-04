// lib/supabase.ts
import { createClient as createSupabaseClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_TOKEN!

export const supabase = createSupabaseClient(supabaseUrl, supabaseAnonKey)

// Export createClient function for compatibility
export const createClient = () => createSupabaseClient(supabaseUrl, supabaseAnonKey)

// Database types
export interface WorkRequest {
  id: string
  tenant_id: string
  title: string
  description: string
  category: string
  priority: 'low' | 'medium' | 'high' | 'critical'
  urgency: 'low' | 'medium' | 'high' | 'urgent'
  status: 'submitted' | 'under_review' | 'approved' | 'rejected' | 'scheduled' | 'in_progress' | 'completed' | 'cancelled'
  customer_id: string
  assigned_to?: string
  estimated_hours?: number
  actual_hours: number
  budget?: number
  required_completion_date?: string
  created_at: string
  updated_at: string
}

export interface Project {
  id: string
  tenant_id: string
  work_request_id: string
  title: string
  description?: string
  status: 'scheduled' | 'in_progress' | 'completed' | 'on_hold' | 'cancelled'
  priority: 'low' | 'medium' | 'high' | 'critical'
  assigned_team_lead: string
  estimated_hours: number
  actual_hours: number
  budget?: number
  start_date: string
  end_date: string
  completion_percentage: number
  client_satisfaction_score?: number
  on_time_delivery?: boolean
  created_at: string
  updated_at: string
}

export interface Tenant {
  id: string
  company_name: string
  subdomain?: string
  industry?: string
  status: 'active' | 'trial' | 'suspended' | 'cancelled'
  subscription_plan: 'trial' | 'professional' | 'enterprise'
  created_at: string
}

export interface User {
  id: string
  email: string
  first_name: string
  last_name: string
  role: 'host_admin' | 'program_manager' | 'client_admin' | 'client_user'
  tenant_id?: string
  is_active: boolean
  created_at: string
}

// Auth helpers
export const signInWithRole = async (email: string, password: string) => {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password
  })
  
  if (data.user) {
    // Get user profile with role and tenant
    const { data: profile } = await supabase
      .from('users')
      .select('role, tenant_id, first_name, last_name')
      .eq('id', data.user.id)
      .single()
    
    return { user: data.user, profile, error }
  }
  
  return { user: null, profile: null, error }
}

export const signOut = async () => {
  const { error } = await supabase.auth.signOut()
  return { error }
}

// Database helpers
export const getCurrentUser = async () => {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null
  
  const { data: profile } = await supabase
    .from('users')
    .select('*')
    .eq('id', user.id)
    .single()
  
  return { ...user, profile }
}

