'use client'

import React, { useState, useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Button } from '@/components/ui/Button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card'
import { LogIn, Loader2, AlertCircle, Mail, Lock, CheckCircle } from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'
import { supabase } from '@/lib/supabase'

interface LoginState {
  email: string
  password: string
  isLoading: boolean
  error: string
  resetEmail: string
  isResetLoading: boolean
  resetError: string
  resetSuccess: boolean
  activeTab: 'login' | 'forgot'
  isGoogleLoading: boolean
}

function LoginForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { signIn } = useAuth()
  
  const [state, setState] = useState<LoginState>({
    email: '',
    password: '',
    isLoading: false,
    error: '',
    resetEmail: '',
    isResetLoading: false,
    resetError: '',
    resetSuccess: false,
    activeTab: 'login',
    isGoogleLoading: false
  })

  // Handle URL parameters and messages
  useEffect(() => {
    const tab = searchParams.get('tab')
    const message = searchParams.get('message')
    const error = searchParams.get('error')
    
    if (tab === 'forgot') {
      setState(prev => ({ ...prev, activeTab: 'forgot' }))
    }
    
    if (message) {
      setState(prev => ({ ...prev, error: message }))
    }
    
    if (error) {
      setState(prev => ({ ...prev, error: `Authentication error: ${error}` }))
    }
  }, [searchParams])

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setState(prev => ({ ...prev, isLoading: true, error: '' }))

    try {
      console.log(`Attempting login with: ${state.email}`)
      const { error } = await signIn(state.email, state.password)
      
      if (error) {
        console.error('Login error:', error)
        setState(prev => ({ 
          ...prev, 
          isLoading: false,
          error: `Login failed: ${error.message}` 
        }))
      } else {
        console.log('Login successful, redirecting...')
        router.push('/dashboard')
      }
    } catch (err: any) {
      console.error('Login exception:', err)
      setState(prev => ({ 
        ...prev, 
        isLoading: false,
        error: `Login error: ${err.message || 'Unknown error'}` 
      }))
    }
  }

  const handleGoogleSignIn = async () => {
    setState(prev => ({ ...prev, isGoogleLoading: true, error: '' }))

    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
          queryParams: {
            access_type: 'offline',
            prompt: 'consent',
          },
        }
      })

      if (error) {
        console.error('Google sign-in error:', error)
        setState(prev => ({ 
          ...prev, 
          isGoogleLoading: false,
          error: `Google sign-in failed: ${error.message}` 
        }))
      }
      // If successful, user will be redirected to Google OAuth
    } catch (err: any) {
      console.error('Google sign-in exception:', err)
      setState(prev => ({ 
        ...prev, 
        isGoogleLoading: false,
        error: `Google sign-in error: ${err.message || 'Unknown error'}` 
      }))
    }
  }

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault()
    setState(prev => ({ ...prev, isResetLoading: true, resetError: '', resetSuccess: false }))

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(state.resetEmail, {
        redirectTo: `${window.location.origin}/reset-password`
      })

      if (error) {
        setState(prev => ({ 
          ...prev, 
          isResetLoading: false,
          resetError: error.message 
        }))
      } else {
        setState(prev => ({ 
          ...prev, 
          isResetLoading: false,
          resetSuccess: true 
        }))
      }
    } catch (err: any) {
      setState(prev => ({ 
        ...prev, 
        isResetLoading: false,
        resetError: err.message || 'Failed to send reset email' 
      }))
    }
  }

  const fillTestCredentials = (testEmail: string, testPassword: string) => {
    setState(prev => ({ 
      ...prev, 
      email: testEmail, 
      password: testPassword,
      activeTab: 'login'
    }))
  }

  const switchTab = (tab: 'login' | 'forgot') => {
    setState(prev => ({ 
      ...prev, 
      activeTab: tab,
      error: '',
      resetError: '',
      resetSuccess: false
    }))
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            HelixBridge
          </h1>
          <p className="text-gray-600">
            {state.activeTab === 'login' ? 'Sign in to access your account' : 'Reset your password'}
          </p>
        </div>

        <Card>
          {/* Tab Navigation */}
          <div className="flex border-b border-gray-200">
            <button
              onClick={() => switchTab('login')}
              className={`flex-1 py-3 px-4 text-sm font-medium text-center border-b-2 transition-colors ${
                state.activeTab === 'login'
                  ? 'border-blue-500 text-blue-600 bg-blue-50'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <LogIn className="h-4 w-4 inline mr-2" />
              Sign In
            </button>
            <button
              onClick={() => switchTab('forgot')}
              className={`flex-1 py-3 px-4 text-sm font-medium text-center border-b-2 transition-colors ${
                state.activeTab === 'forgot'
                  ? 'border-blue-500 text-blue-600 bg-blue-50'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <Lock className="h-4 w-4 inline mr-2" />
              Forgot Password
            </button>
          </div>

          {/* Login Tab */}
          {state.activeTab === 'login' && (
            <>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <LogIn className="h-5 w-5" />
                  Sign In
                </CardTitle>
                <CardDescription>
                  Enter your credentials to access the platform
                </CardDescription>
              </CardHeader>
              <CardContent>
                {/* Google Sign-In Button */}
                <div className="mb-6">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleGoogleSignIn}
                    disabled={state.isGoogleLoading || state.isLoading}
                    className="w-full"
                  >
                    {state.isGoogleLoading ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin mr-2" />
                        Connecting to Google...
                      </>
                    ) : (
                      <>
                        <svg className="h-4 w-4 mr-2" viewBox="0 0 24 24">
                          <path
                            fill="#4285F4"
                            d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                          />
                          <path
                            fill="#34A853"
                            d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                          />
                          <path
                            fill="#FBBC05"
                            d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                          />
                          <path
                            fill="#EA4335"
                            d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                          />
                        </svg>
                        Continue with Google
                      </>
                    )}
                  </Button>
                </div>

                {/* Divider */}
                <div className="relative mb-6">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-gray-300" />
                  </div>
                  <div className="relative flex justify-center text-sm">
                    <span className="px-2 bg-white text-gray-500">Or continue with email</span>
                  </div>
                </div>

                <form onSubmit={handleLogin} className="space-y-4">
                  <div>
                    <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                      Email
                    </label>
                    <input
                      id="email"
                      type="email"
                      value={state.email}
                      onChange={(e: any) => setState(prev => ({ ...prev, email: e.target.value }))}
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Enter your email"
                      disabled={state.isLoading || state.isGoogleLoading}
                    />
                  </div>

                  <div>
                    <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                      Password
                    </label>
                    <input
                      id="password"
                      type="password"
                      value={state.password}
                      onChange={(e: any) => setState(prev => ({ ...prev, password: e.target.value }))}
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Enter your password"
                      disabled={state.isLoading || state.isGoogleLoading}
                    />
                  </div>

                  {state.error && (
                    <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-md">
                      <AlertCircle className="h-4 w-4 text-red-500" />
                      <span className="text-sm text-red-700">{state.error}</span>
                    </div>
                  )}

                  <Button
                    type="submit"
                    disabled={state.isLoading || state.isGoogleLoading}
                    className="w-full"
                  >
                    {state.isLoading ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin mr-2" />
                        Signing in...
                      </>
                    ) : (
                      <>
                        <LogIn className="h-4 w-4 mr-2" />
                        Sign In
                      </>
                    )}
                  </Button>

                  <div className="text-center">
                    <button
                      type="button"
                      onClick={() => switchTab('forgot')}
                      className="text-sm text-blue-600 hover:text-blue-500"
                      disabled={state.isLoading || state.isGoogleLoading}
                    >
                      Forgot your password?
                    </button>
                  </div>
                </form>
              </CardContent>
            </>
          )}

          {/* Forgot Password Tab */}
          {state.activeTab === 'forgot' && (
            <>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Lock className="h-5 w-5" />
                  Reset Password
                </CardTitle>
                <CardDescription>
                  Enter your email address and we'll send you a link to reset your password
                </CardDescription>
              </CardHeader>
              <CardContent>
                {state.resetSuccess ? (
                  <div className="text-center space-y-4">
                    <div className="mx-auto w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                      <CheckCircle className="h-6 w-6 text-green-600" />
                    </div>
                    <div>
                      <h3 className="text-lg font-medium text-gray-900 mb-2">Check your email</h3>
                      <p className="text-sm text-gray-600 mb-4">
                        We've sent a password reset link to <strong>{state.resetEmail}</strong>
                      </p>
                      <p className="text-xs text-gray-500">
                        Didn't receive the email? Check your spam folder or try again.
                      </p>
                    </div>
                    <Button
                      onClick={() => setState(prev => ({ 
                        ...prev, 
                        resetSuccess: false, 
                        resetEmail: '' 
                      }))}
                      variant="outline"
                      className="w-full"
                    >
                      Send another email
                    </Button>
                    <Button
                      onClick={() => switchTab('login')}
                      className="w-full"
                    >
                      Back to Sign In
                    </Button>
                  </div>
                ) : (
                  <form onSubmit={handleForgotPassword} className="space-y-4">
                    <div>
                      <label htmlFor="resetEmail" className="block text-sm font-medium text-gray-700 mb-1">
                        Email Address
                      </label>
                      <input
                        id="resetEmail"
                        type="email"
                        value={state.resetEmail}
                        onChange={(e: any) => setState(prev => ({ ...prev, resetEmail: e.target.value }))}
                        required
                        className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="Enter your email address"
                        disabled={state.isResetLoading}
                      />
                    </div>

                    {state.resetError && (
                      <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-md">
                        <AlertCircle className="h-4 w-4 text-red-500" />
                        <span className="text-sm text-red-700">{state.resetError}</span>
                      </div>
                    )}

                    <Button
                      type="submit"
                      disabled={state.isResetLoading}
                      className="w-full"
                    >
                      {state.isResetLoading ? (
                        <>
                          <Loader2 className="h-4 w-4 animate-spin mr-2" />
                          Sending reset link...
                        </>
                      ) : (
                        <>
                          <Mail className="h-4 w-4 mr-2" />
                          Send Reset Link
                        </>
                      )}
                    </Button>

                    <div className="text-center">
                      <button
                        type="button"
                        onClick={() => switchTab('login')}
                        className="text-sm text-blue-600 hover:text-blue-500"
                        disabled={state.isResetLoading}
                      >
                        Back to Sign In
                      </button>
                    </div>
                  </form>
                )}
              </CardContent>
            </>
          )}
        </Card>

        <div className="text-center">
          <p className="text-sm text-gray-600">
            © 2024 HelixBridge. All rights reserved.
          </p>
        </div>
      </div>
    </div>
  )
}

function LoadingFallback() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
        <p className="mt-2 text-gray-600">Loading...</p>
      </div>
    </div>
  )
}

export default function LoginPage() {
  return (
    <Suspense fallback={<LoadingFallback />}>
      <LoginForm />
    </Suspense>
  )
}

