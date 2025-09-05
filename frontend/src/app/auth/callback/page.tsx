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
            // Create profile for new Google user
            const { error: profileError } = await supabase
              .from('profiles')
              .insert({
                id: data.session.user.id,
                full_name: data.session.user.user_metadata?.full_name || 
                          data.session.user.user_metadata?.name || 
                          'Google User',
                email: data.session.user.email,
                avatar_url: data.session.user.user_metadata?.avatar_url,
                role: 'user',
                role_level: 'sub_client',
                tenant_id: null, // Will need to be assigned by admin
                is_active: true,
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString()
              })

            if (profileError) {
              console.error('Profile creation error:', profileError)
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

