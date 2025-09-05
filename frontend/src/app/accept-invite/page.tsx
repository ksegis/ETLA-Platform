'use client'

import React, { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Eye, EyeOff, UserPlus, AlertCircle, CheckCircle, ArrowLeft, Mail, User } from 'lucide-react'
import { supabase } from '@/lib/supabase'

interface InviteAcceptanceState {
  email: string
  fullName: string
  password: string
  confirmPassword: string
  isLoading: boolean
  error: string | null
  success: boolean
  isValidInvite: boolean
  isCheckingInvite: boolean
  inviteData: {
    email: string
    invited_by_name?: string
    tenant_name?: string
    role?: string
  } | null
}

export default function AcceptInvitePage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  
  const [state, setState] = useState<InviteAcceptanceState>({
    email: '',
    fullName: '',
    password: '',
    confirmPassword: '',
    isLoading: false,
    error: null,
    success: false,
    isValidInvite: false,
    isCheckingInvite: true,
    inviteData: null
  })

  // Validate invite session on component mount
  useEffect(() => {
    const validateInviteSession = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession()
        
        if (error) {
          setState(prev => ({
            ...prev,
            isValidInvite: false,
            isCheckingInvite: false,
            error: 'Invalid or expired invite link. Please contact your administrator for a new invitation.'
          }))
          return
        }

        // Check if this is an invite session (user exists but hasn't set password)
        if (session?.user) {
          const user = session.user
          
          // Check if user has confirmed their email and this is their first login
          if (user.email_confirmed_at && !user.last_sign_in_at) {
            setState(prev => ({
              ...prev,
              isValidInvite: true,
              isCheckingInvite: false,
              email: user.email || '',
              inviteData: {
                email: user.email || '',
                invited_by_name: user.user_metadata?.invited_by_name,
                tenant_name: user.user_metadata?.tenant_name,
                role: user.user_metadata?.role
              }
            }))
          } else {
            setState(prev => ({
              ...prev,
              isValidInvite: false,
              isCheckingInvite: false,
              error: 'This invite has already been used or is no longer valid.'
            }))
          }
        } else {
          setState(prev => ({
            ...prev,
            isValidInvite: false,
            isCheckingInvite: false,
            error: 'Invalid or expired invite link. Please contact your administrator for a new invitation.'
          }))
        }
      } catch (err) {
        setState(prev => ({
          ...prev,
          isValidInvite: false,
          isCheckingInvite: false,
          error: 'Failed to validate invite link. Please try again.'
        }))
      }
    }

    validateInviteSession()
  }, [])

  const validatePassword = (password: string): string | null => {
    if (password.length < 8) {
      return 'Password must be at least 8 characters long'
    }
    if (!/(?=.*[a-z])/.test(password)) {
      return 'Password must contain at least one lowercase letter'
    }
    if (!/(?=.*[A-Z])/.test(password)) {
      return 'Password must contain at least one uppercase letter'
    }
    if (!/(?=.*\d)/.test(password)) {
      return 'Password must contain at least one number'
    }
    if (!/(?=.*[!@#$%^&*])/.test(password)) {
      return 'Password must contain at least one special character (!@#$%^&*)'
    }
    return null
  }

  const handleFullNameChange = (value: string) => {
    setState(prev => ({
      ...prev,
      fullName: value,
      error: null
    }))
  }

  const handlePasswordChange = (value: string) => {
    setState(prev => ({
      ...prev,
      password: value,
      error: null
    }))
  }

  const handleConfirmPasswordChange = (value: string) => {
    setState(prev => ({
      ...prev,
      confirmPassword: value,
      error: null
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    // Validate passwords
    const passwordError = validatePassword(state.password)
    if (passwordError) {
      setState(prev => ({ ...prev, error: passwordError }))
      return
    }

    if (state.password !== state.confirmPassword) {
      setState(prev => ({ ...prev, error: 'Passwords do not match' }))
      return
    }

    setState(prev => ({ ...prev, isLoading: true, error: null }))

    try {
      // Update user password
      const { error: passwordError } = await supabase.auth.updateUser({
        password: state.password
      })

      if (passwordError) {
        setState(prev => ({
          ...prev,
          isLoading: false,
          error: passwordError.message
        }))
        return
      }

      // Update user metadata if full name is provided
      if (state.fullName.trim()) {
        const { error: metadataError } = await supabase.auth.updateUser({
          data: {
            full_name: state.fullName.trim()
          }
        })

        if (metadataError) {
          console.warn('Failed to update user metadata:', metadataError.message)
          // Don't fail the entire process for metadata update issues
        }

        // Also update the profiles table if it exists
        try {
          const { data: { user } } = await supabase.auth.getUser()
          if (user) {
            await supabase
              .from('profiles')
              .upsert({
                id: user.id,
                email: user.email,
                full_name: state.fullName.trim(),
                updated_at: new Date().toISOString()
              })
          }
        } catch (profileError) {
          console.warn('Failed to update profile:', profileError)
          // Don't fail the entire process for profile update issues
        }
      }

      setState(prev => ({
        ...prev,
        isLoading: false,
        success: true
      }))

      // Sign out the temporary session and redirect after a brief delay
      setTimeout(async () => {
        await supabase.auth.signOut()
        router.push('/login?message=Account setup completed successfully. Please sign in with your new password.')
      }, 2000)

    } catch (err: any) {
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: err.message || 'Failed to complete account setup. Please try again.'
      }))
    }
  }

  const handleContactAdmin = () => {
    // In a real app, this might open a support ticket or email
    router.push('/login?message=Please contact your administrator for a new invitation.')
  }

  // Loading state while checking invite
  if (state.isCheckingInvite) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6">
            <div className="flex items-center justify-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              <span className="ml-3 text-gray-600">Validating invitation...</span>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  // Invalid invite state
  if (!state.isValidInvite) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="mx-auto w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mb-4">
              <AlertCircle className="h-6 w-6 text-red-600" />
            </div>
            <CardTitle className="text-xl text-gray-900">Invalid Invitation</CardTitle>
            <CardDescription className="text-gray-600">
              {state.error || 'This invitation link is invalid, expired, or has already been used.'}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button 
              onClick={handleContactAdmin}
              className="w-full"
            >
              Contact Administrator
            </Button>
            <Button 
              variant="outline" 
              onClick={() => router.push('/login')}
              className="w-full"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Sign In
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  // Success state
  if (state.success) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="mx-auto w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mb-4">
              <CheckCircle className="h-6 w-6 text-green-600" />
            </div>
            <CardTitle className="text-xl text-gray-900">Welcome to ETLA Platform!</CardTitle>
            <CardDescription className="text-gray-600">
              Your account has been successfully set up. You will be redirected to sign in shortly.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-center">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
              <span className="ml-3 text-gray-600">Redirecting...</span>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  // Main invite acceptance form
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mb-4">
            <UserPlus className="h-6 w-6 text-blue-600" />
          </div>
          <CardTitle className="text-xl text-gray-900">Welcome to ETLA Platform</CardTitle>
          <CardDescription className="text-gray-600">
            Complete your account setup to get started
          </CardDescription>
        </CardHeader>

        <CardContent>
          {/* Invitation Details */}
          <div className="bg-blue-50 border border-blue-200 rounded-md p-4 mb-6">
            <div className="flex items-center mb-2">
              <Mail className="h-4 w-4 text-blue-600 mr-2" />
              <span className="text-sm font-medium text-blue-900">You've been invited to join</span>
            </div>
            <div className="text-sm text-blue-800 space-y-1">
              <p><strong>Email:</strong> {state.inviteData?.email}</p>
              {state.inviteData?.tenant_name && (
                <p><strong>Organization:</strong> {state.inviteData.tenant_name}</p>
              )}
              {state.inviteData?.role && (
                <p><strong>Role:</strong> {state.inviteData.role}</p>
              )}
              {state.inviteData?.invited_by_name && (
                <p><strong>Invited by:</strong> {state.inviteData.invited_by_name}</p>
              )}
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {state.error && (
              <div className="bg-red-50 border border-red-200 rounded-md p-3">
                <div className="flex items-center">
                  <AlertCircle className="h-4 w-4 text-red-600 mr-2" />
                  <p className="text-sm text-red-600">{state.error}</p>
                </div>
              </div>
            )}

            <div>
              <label htmlFor="fullName" className="block text-sm font-medium text-gray-700 mb-1">
                <User className="h-4 w-4 inline mr-1" />
                Full Name (Optional)
              </label>
              <input
                id="fullName"
                type="text"
                value={state.fullName}
                onChange={(e) => handleFullNameChange(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Enter your full name"
                disabled={state.isLoading}
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                Password *
              </label>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  value={state.password}
                  onChange={(e) => handlePasswordChange(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 pr-10"
                  placeholder="Create a secure password"
                  required
                  disabled={state.isLoading}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  disabled={state.isLoading}
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4 text-gray-400" />
                  ) : (
                    <Eye className="h-4 w-4 text-gray-400" />
                  )}
                </button>
              </div>
            </div>

            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-1">
                Confirm Password *
              </label>
              <div className="relative">
                <input
                  id="confirmPassword"
                  type={showConfirmPassword ? 'text' : 'password'}
                  value={state.confirmPassword}
                  onChange={(e) => handleConfirmPasswordChange(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 pr-10"
                  placeholder="Confirm your password"
                  required
                  disabled={state.isLoading}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  disabled={state.isLoading}
                >
                  {showConfirmPassword ? (
                    <EyeOff className="h-4 w-4 text-gray-400" />
                  ) : (
                    <Eye className="h-4 w-4 text-gray-400" />
                  )}
                </button>
              </div>
            </div>

            <div className="text-xs text-gray-500 space-y-1">
              <p>Password requirements:</p>
              <ul className="list-disc list-inside space-y-1">
                <li>At least 8 characters long</li>
                <li>Contains uppercase and lowercase letters</li>
                <li>Contains at least one number</li>
                <li>Contains at least one special character (!@#$%^&*)</li>
              </ul>
            </div>

            <Button
              type="submit"
              className="w-full"
              disabled={state.isLoading || !state.password || !state.confirmPassword}
            >
              {state.isLoading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Setting up account...
                </>
              ) : (
                'Complete Setup'
              )}
            </Button>

            <Button
              type="button"
              variant="outline"
              onClick={() => router.push('/login')}
              className="w-full"
              disabled={state.isLoading}
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Sign In
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}

