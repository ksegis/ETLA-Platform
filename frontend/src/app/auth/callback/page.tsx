'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { Loader2 } from 'lucide-react'

export default function AuthCallback() {
  const router = useRouter()

  useEffect(() => {
    const handleAuthCallback = async () => {
      try {
        // Check if this is a password reset or invitation flow
        const hashParams = new URLSearchParams(window.location.hash.substring(1))
        const type = hashParams.get('type')
        
        // If this is a password reset or invitation, redirect to set-password page
        if (type === 'recovery' || type === 'invite' || type === 'magiclink') {
          router.push('/auth/set-password')
          return
        }

        // Handle the OAuth callback
        const { data, error } = await supabase.auth.getSession()
        
        if (error) {
          console.error('Auth callback error:', error)
          router.push('/login?error=' + encodeURIComponent(error.message))
          return
        }

        if (data.session) {
          // Check if this is a new user (first time Google sign-in)
          const { data: profile } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', data.session.user.id)
            .single()

          if (!profile) {
            // Get a default tenant for new Google users (use the first available tenant)
            const { data: defaultTenant } = await supabase
              .from('tenants')
              .select('id, name')
              .eq('is_active', true)
              .limit(1)
              .single()

            if (!defaultTenant) {
              console.error('No active tenant found for new Google user')
              router.push('/login?error=' + encodeURIComponent('No tenant available for new users'))
              return
            }

            // Create complete user record across all tables
            try {
              // 1. Create profile
              const { error: profileError } = await supabase
                .from('profiles')
                .insert({
                  id: data.session.user.id,
                  full_name: data.session.user.user_metadata?.full_name || 
                            data.session.user.user_metadata?.name || 
                            'Google User',
                  phone: null,
                  department: null,
                  job_title: 'User',
                  avatar_url: data.session.user.user_metadata?.avatar_url,
                  email: data.session.user.email,
                  role: 'user',
                  role_level: 'sub_client',
                  tenant_id: defaultTenant.id,
                  is_active: true,
                  can_invite_users: false,
                  can_manage_sub_clients: false,
                  permission_scope: 'own',
                  last_login: new Date().toISOString(),
                  created_at: new Date().toISOString(),
                  updated_at: new Date().toISOString()
                })

              if (profileError) {
                console.error('Profile creation error:', profileError)
                throw profileError
              }

              // 2. Create tenant_users entry for RBAC
              const { error: tenantUserError } = await supabase
                .from('tenant_users')
                .insert({
                  tenant_id: defaultTenant.id,
                  user_id: data.session.user.id,
                  role: 'user',
                  permissions: ['read'],
                  is_active: true,
                  role_level: 'sub_client',
                  can_invite_users: false,
                  can_manage_sub_clients: false,
                  permission_scope: 'own',
                  feature_permissions: {},
                  last_login_at: new Date().toISOString(),
                  mfa_enabled: false,
                  created_at: new Date().toISOString(),
                  updated_at: new Date().toISOString()
                })

              if (tenantUserError) {
                console.error('Tenant user creation error:', tenantUserError)
                throw tenantUserError
              }

              // 3. Create user_invitations entry (if table exists)
              const { error: invitationError } = await supabase
                .from('user_invitations')
                .insert({
                  email: data.session.user.email,
                  invited_by: null, // Self-registered via Google
                  tenant_id: defaultTenant.id,
                  role: 'user',
                  status: 'accepted',
                  expires_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 days
                  accepted_at: new Date().toISOString(),
                  created_at: new Date().toISOString(),
                  updated_at: new Date().toISOString()
                })
                .select()

              // Don't throw error if user_invitations table doesn't exist
              if (invitationError && !invitationError.message.includes('does not exist')) {
                console.error('Invitation record creation error:', invitationError)
              }

              // 4. Create audit_logs entry (if table exists)
              const { error: auditError } = await supabase
                .from('audit_logs')
                .insert({
                  user_id: data.session.user.id,
                  tenant_id: defaultTenant.id,
                  action: 'user_created',
                  resource_type: 'user',
                  resource_id: data.session.user.id,
                  details: {
                    method: 'google_oauth',
                    email: data.session.user.email,
                    full_name: data.session.user.user_metadata?.full_name || data.session.user.user_metadata?.name,
                    tenant_assigned: defaultTenant.name
                  },
                  ip_address: null,
                  user_agent: navigator.userAgent,
                  created_at: new Date().toISOString()
                })

              // Don't throw error if audit_logs table doesn't exist
              if (auditError && !auditError.message.includes('does not exist')) {
                console.error('Audit log creation error:', auditError)
              }

              console.log('Complete user record created successfully for Google OAuth user')

            } catch (error) {
              console.error('Failed to create complete user record:', error)
              // Continue anyway - user can still access the app with partial setup
            }
          } else {
            // Existing user - update last login
            await supabase
              .from('profiles')
              .update({ 
                last_login: new Date().toISOString(),
                updated_at: new Date().toISOString()
              })
              .eq('id', data.session.user.id)

            // Update tenant_users last login
            await supabase
              .from('tenant_users')
              .update({ 
                last_login_at: new Date().toISOString(),
                updated_at: new Date().toISOString()
              })
              .eq('user_id', data.session.user.id)

            // Log the login activity
            const { data: userProfile } = await supabase
              .from('profiles')
              .select('tenant_id')
              .eq('id', data.session.user.id)
              .single()

            if (userProfile?.tenant_id) {
              await supabase
                .from('audit_logs')
                .insert({
                  user_id: data.session.user.id,
                  tenant_id: userProfile.tenant_id,
                  action: 'user_login',
                  resource_type: 'session',
                  resource_id: data.session.user.id,
                  details: {
                    method: 'google_oauth',
                    email: data.session.user.email
                  },
                  ip_address: null,
                  user_agent: navigator.userAgent,
                  created_at: new Date().toISOString()
                })
            }
          }

          // Successful authentication - redirect to dashboard
          router.push('/dashboard')
        } else {
          // No session - redirect to login
          router.push('/login')
        }
      } catch (err) {
        console.error('Auth callback exception:', err)
        router.push('/login?error=' + encodeURIComponent('Authentication failed'))
      }
    }

    handleAuthCallback()
  }, [router])

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
        <h2 className="text-lg font-medium text-gray-900 mb-2">Completing sign-in...</h2>
        <p className="text-gray-600">Please wait while we set up your account.</p>
      </div>
    </div>
  )
}

