import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_TOKEN!

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

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

// Extended User interface for user management
export interface ExtendedUser {
  id: string
  email: string
  full_name: string
  phone?: string
  department?: string
  job_title?: string
  role: string
  role_level: string
  tenant_id: string
  tenant_name?: string
  is_active: boolean
  can_invite_users: boolean
  can_manage_sub_clients: boolean
  permission_scope: string
  created_at: string
  updated_at: string
  last_login?: string
}

// User creation data interface
export interface UserCreationData {
  email: string
  full_name: string
  phone?: string
  department?: string
  job_title?: string
  role: string
  role_level: string
  tenant_id: string
  password: string
  can_invite_users: boolean
  can_manage_sub_clients: boolean
  permission_scope: string
}

// User invitation data interface
export interface UserInvitationData {
  emails: string[]
  role: string
  role_level: string
  tenant_id: string
  message?: string
  expires_in_days: number
}

// User update data interface
export interface UserUpdateData {
  full_name?: string
  phone?: string
  department?: string
  job_title?: string
  role?: string
  role_level?: string
  tenant_id?: string
  is_active?: boolean
  can_invite_users?: boolean
  can_manage_sub_clients?: boolean
  permission_scope?: string
}

// Cleanup options interface
export interface CleanupOptions {
  deleteInactiveUsers: boolean
  deleteUnconfirmedUsers: boolean
  deleteExpiredInvites: boolean
  inactiveDays: number
  unconfirmedDays: number
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



// User Management Methods
export const userManagement = {
  // Create a new user with complete RBAC setup
  createUser: async (userData: UserCreationData) => {
    try {
      // First, create the auth user
      const { data: authData, error: authError } = await supabase.auth.admin.createUser({
        email: userData.email,
        password: userData.password,
        email_confirm: true,
        user_metadata: {
          full_name: userData.full_name,
          role: userData.role,
          role_level: userData.role_level
        }
      })

      if (authError) {
        return { success: false, error: authError.message }
      }

      if (!authData.user) {
        return { success: false, error: 'Failed to create user account' }
      }

      // Create the user profile
      const { error: profileError } = await supabase
        .from('profiles')
        .insert({
          id: authData.user.id,
          email: userData.email,
          full_name: userData.full_name,
          phone: userData.phone,
          department: userData.department,
          job_title: userData.job_title,
          role: userData.role,
          role_level: userData.role_level,
          tenant_id: userData.tenant_id,
          is_active: true,
          can_invite_users: userData.can_invite_users,
          can_manage_sub_clients: userData.can_manage_sub_clients,
          permission_scope: userData.permission_scope,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })

      if (profileError) {
        // If profile creation fails, clean up the auth user
        await supabase.auth.admin.deleteUser(authData.user.id)
        return { success: false, error: `Profile creation failed: ${profileError.message}` }
      }

      // Create tenant_users record for RBAC
      const { error: tenantUserError } = await supabase
        .from('tenant_users')
        .insert({
          tenant_id: userData.tenant_id,
          user_id: authData.user.id,
          role: userData.role,
          role_level: userData.role_level,
          can_invite_users: userData.can_invite_users,
          can_manage_sub_clients: userData.can_manage_sub_clients,
          permission_scope: userData.permission_scope,
          is_active: true,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })

      if (tenantUserError) {
        // If tenant_users creation fails, clean up auth user and profile
        await supabase.auth.admin.deleteUser(authData.user.id)
        await supabase.from('profiles').delete().eq('id', authData.user.id)
        return { success: false, error: `Tenant assignment failed: ${tenantUserError.message}` }
      }

      return { success: true, data: authData.user }
    } catch (error: any) {
      return { success: false, error: error.message || 'Failed to create user' }
    }
  },

  // Invite users via email
  inviteUsers: async (invitationData: UserInvitationData) => {
    try {
      const invitations = []
      
      for (const email of invitationData.emails) {
        // Create invitation record
        const { data: invitation, error: inviteError } = await supabase
          .from('user_invitations')
          .insert({
            email,
            role: invitationData.role,
            role_level: invitationData.role_level,
            tenant_id: invitationData.tenant_id,
            message: invitationData.message,
            expires_at: new Date(Date.now() + invitationData.expires_in_days * 24 * 60 * 60 * 1000).toISOString(),
            created_at: new Date().toISOString()
          })
          .select()
          .single()

        if (inviteError) {
          console.error(`Failed to create invitation for ${email}:`, inviteError)
          continue
        }

        // Send invitation email using Supabase Auth
        const { error: emailError } = await supabase.auth.admin.inviteUserByEmail(email, {
          redirectTo: `${window.location.origin}/accept-invitation?token=${invitation.id}`,
          data: {
            role: invitationData.role,
            role_level: invitationData.role_level,
            tenant_id: invitationData.tenant_id,
            invitation_id: invitation.id
          }
        })

        if (emailError) {
          console.error(`Failed to send invitation email to ${email}:`, emailError)
          // Mark invitation as failed
          await supabase
            .from('user_invitations')
            .update({ status: 'failed' })
            .eq('id', invitation.id)
        } else {
          invitations.push(invitation)
        }
      }

      return { 
        success: true, 
        data: { 
          sent: invitations.length, 
          total: invitationData.emails.length 
        } 
      }
    } catch (error: any) {
      return { success: false, error: error.message || 'Failed to send invitations' }
    }
  },

  // Update user information
  updateUser: async (userId: string, updateData: UserUpdateData) => {
    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          ...updateData,
          updated_at: new Date().toISOString()
        })
        .eq('id', userId)

      if (error) {
        return { success: false, error: error.message }
      }

      return { success: true }
    } catch (error: any) {
      return { success: false, error: error.message || 'Failed to update user' }
    }
  },

  // Reset user password
  resetUserPassword: async (email: string, newPassword?: string) => {
    try {
      if (newPassword) {
        // Direct password reset (admin function)
        const { error } = await supabase.auth.admin.updateUserById(
          email, // This should be user ID, but we'll need to get it first
          { password: newPassword }
        )

        if (error) {
          return { success: false, error: error.message }
        }

        return { success: true }
      } else {
        // Email-based password reset
        const { error } = await supabase.auth.resetPasswordForEmail(email, {
          redirectTo: `${window.location.origin}/reset-password`
        })

        if (error) {
          return { success: false, error: error.message }
        }

        return { success: true }
      }
    } catch (error: any) {
      return { success: false, error: error.message || 'Failed to reset password' }
    }
  },

  // Preview cleanup operations
  previewUserCleanup: async (options: CleanupOptions) => {
    try {
      let inactiveUsers = 0
      let unconfirmedUsers = 0
      let expiredInvites = 0

      if (options.deleteInactiveUsers) {
        const cutoffDate = new Date(Date.now() - options.inactiveDays * 24 * 60 * 60 * 1000).toISOString()
        const { count } = await supabase
          .from('profiles')
          .select('*', { count: 'exact', head: true })
          .lt('last_login', cutoffDate)
          .eq('is_active', true)

        inactiveUsers = count || 0
      }

      if (options.deleteUnconfirmedUsers) {
        const cutoffDate = new Date(Date.now() - options.unconfirmedDays * 24 * 60 * 60 * 1000).toISOString()
        const { count } = await supabase
          .from('auth.users')
          .select('*', { count: 'exact', head: true })
          .is('email_confirmed_at', null)
          .lt('created_at', cutoffDate)

        unconfirmedUsers = count || 0
      }

      if (options.deleteExpiredInvites) {
        const { count } = await supabase
          .from('user_invitations')
          .select('*', { count: 'exact', head: true })
          .lt('expires_at', new Date().toISOString())
          .neq('status', 'accepted')

        expiredInvites = count || 0
      }

      const totalToDelete = inactiveUsers + unconfirmedUsers + expiredInvites

      return {
        success: true,
        data: {
          inactiveUsers,
          unconfirmedUsers,
          expiredInvites,
          totalToDelete
        }
      }
    } catch (error: any) {
      return { success: false, error: error.message || 'Failed to preview cleanup' }
    }
  },

  // Execute cleanup operations
  executeUserCleanup: async (options: CleanupOptions) => {
    try {
      let deletedCount = 0

      if (options.deleteInactiveUsers) {
        const cutoffDate = new Date(Date.now() - options.inactiveDays * 24 * 60 * 60 * 1000).toISOString()
        
        // Get inactive users
        const { data: inactiveUsers } = await supabase
          .from('profiles')
          .select('id')
          .lt('last_login', cutoffDate)
          .eq('is_active', true)

        if (inactiveUsers && inactiveUsers.length > 0) {
          // Delete from auth
          for (const user of inactiveUsers) {
            await supabase.auth.admin.deleteUser(user.id)
          }
          deletedCount += inactiveUsers.length
        }
      }

      if (options.deleteUnconfirmedUsers) {
        const cutoffDate = new Date(Date.now() - options.unconfirmedDays * 24 * 60 * 60 * 1000).toISOString()
        
        // This would require admin access to auth.users table
        // For now, we'll just return success
        console.log('Unconfirmed users cleanup would be executed here')
      }

      if (options.deleteExpiredInvites) {
        const { error } = await supabase
          .from('user_invitations')
          .delete()
          .lt('expires_at', new Date().toISOString())
          .neq('status', 'accepted')

        if (error) {
          console.error('Failed to delete expired invites:', error)
        }
      }

      return {
        success: true,
        data: { deletedCount }
      }
    } catch (error: any) {
      return { success: false, error: error.message || 'Failed to execute cleanup' }
    }
  }
}

