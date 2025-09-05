'use client'

import React, { useState, useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Button } from '@/components/ui/Button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card'
import { LogIn, Loader2, AlertCircle, Mail, Eye, EyeOff, CheckCircle } from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'
import { userManagement } from '@/lib/supabase'

interface ForgotPasswordState {
  email: string
  isLoading: boolean
  error: string | null
  success: boolean
}

function LoginForm() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [activeTab, setActiveTab] = useState<'login' | 'forgot'>('login')
  const { signIn } = useAuth()
  const router = useRouter()
  const searchParams = useSearchParams()

  const [forgotState, setForgotState] = useState<ForgotPasswordState>({
    email: '',
    isLoading: false,
    error: null,
    success: false
  })

  // Handle URL parameters and messages
  useEffect(() => {
    const urlMessage = searchParams.get('message')
    const tab = searchParams.get('tab')
    
    if (urlMessage) {
      setMessage(urlMessage)
    }
    
    if (tab === 'forgot') {
      setActiveTab('forgot')
    }
  }, [searchParams])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError('')

    try {
      await signIn(email, password)
      router.push('/dashboard')
    } catch (err: any) {
      setError(err.message || 'Login failed')
    } finally {
      setIsLoading(false)
    }
  }

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!forgotState.email) {
      setForgotState(prev => ({ ...prev, error: 'Please enter your email address' }))
      return
    }

    setForgotState(prev => ({ ...prev, isLoading: true, error: null }))

    try {
      await userManagement.sendPasswordReset(forgotState.email)
      setForgotState(prev => ({
        ...prev,
        isLoading: false,
        success: true
      }))
    } catch (err: any) {
      setForgotState(prev => ({
        ...prev,
        isLoading: false,
        error: err.message || 'Failed to send reset email. Please try again.'
      }))
    }
  }

  const fillTestCredentials = (role: 'host_admin' | 'host_manager' | 'primary_client_admin' | 'sub_client_user') => {
    const credentials = {
      host_admin: { email: 'kevin.shelton@outlook.com', password: 'TestPassword123!' },
      host_manager: { email: 'kt.shelton@outlook.com', password: 'TestPassword123!' },
      primary_client_admin: { email: 'ke.shelton@outlook.com', password: 'TestPassword123!' },
      sub_client_user: { email: 'kevin.shelton@invictusbpo.com', password: 'TestPassword123!' }
    }
    
    const cred = credentials[role]
    setEmail(cred.email)
    setPassword(cred.password)
    setActiveTab('login')
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold text-gray-900">ETLA Platform</CardTitle>
          <CardDescription className="text-gray-600">
            Sign in to access your account
          </CardDescription>
        </CardHeader>

        <CardContent>
          {message && (
            <div className="mb-4 bg-green-50 border border-green-200 rounded-md p-3">
              <div className="flex items-center">
                <CheckCircle className="h-4 w-4 text-green-600 mr-2" />
                <p className="text-sm text-green-600">{message}</p>
              </div>
            </div>
          )}

          {/* Tab Navigation */}
          <div className="flex mb-6 bg-gray-100 rounded-lg p-1">
            <button
              onClick={() => setActiveTab('login')}
              className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
                activeTab === 'login'
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <LogIn className="h-4 w-4 inline mr-2" />
              Sign In
            </button>
            <button
              onClick={() => setActiveTab('forgot')}
              className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
                activeTab === 'forgot'
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <Mail className="h-4 w-4 inline mr-2" />
              Forgot Password
            </button>
          </div>

          {activeTab === 'login' ? (
            <>
              {/* Login Form */}
              <form onSubmit={handleSubmit} className="space-y-4">
                {error && (
                  <div className="bg-red-50 border border-red-200 rounded-md p-3">
                    <div className="flex items-center">
                      <AlertCircle className="h-4 w-4 text-red-600 mr-2" />
                      <p className="text-sm text-red-600">{error}</p>
                    </div>
                  </div>
                )}

                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                    Email
                  </label>
                  <input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Enter your email"
                    required
                    disabled={isLoading}
                  />
                </div>

                <div>
                  <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                    Password
                  </label>
                  <div className="relative">
                    <input
                      id="password"
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 pr-10"
                      placeholder="Enter your password"
                      required
                      disabled={isLoading}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute inset-y-0 right-0 pr-3 flex items-center"
                      disabled={isLoading}
                    >
                      {showPassword ? (
                        <EyeOff className="h-4 w-4 text-gray-400" />
                      ) : (
                        <Eye className="h-4 w-4 text-gray-400" />
                      )}
                    </button>
                  </div>
                </div>

                <Button
                  type="submit"
                  className="w-full"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Signing In...
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
                    onClick={() => setActiveTab('forgot')}
                    className="text-sm text-blue-600 hover:text-blue-500"
                    disabled={isLoading}
                  >
                    Forgot your password?
                  </button>
                </div>
              </form>

              {/* Test Credentials */}
              <div className="mt-8 pt-6 border-t border-gray-200">
                <h3 className="text-sm font-medium text-gray-700 mb-3">Test Credentials</h3>
                <p className="text-xs text-gray-500 mb-3">Click to fill in test user credentials</p>
                
                <div className="space-y-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => fillTestCredentials('host_admin')}
                    className="w-full text-left justify-start"
                    disabled={isLoading}
                  >
                    <span className="w-2 h-2 bg-red-500 rounded-full mr-2"></span>
                    Host Admin
                  </Button>
                  
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => fillTestCredentials('host_manager')}
                    className="w-full text-left justify-start"
                    disabled={isLoading}
                  >
                    <span className="w-2 h-2 bg-blue-500 rounded-full mr-2"></span>
                    Host Manager
                  </Button>
                  
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => fillTestCredentials('primary_client_admin')}
                    className="w-full text-left justify-start"
                    disabled={isLoading}
                  >
                    <span className="w-2 h-2 bg-orange-500 rounded-full mr-2"></span>
                    Primary Client Admin
                  </Button>
                  
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => fillTestCredentials('sub_client_user')}
                    className="w-full text-left justify-start"
                    disabled={isLoading}
                  >
                    <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
                    Sub Client User
                  </Button>
                </div>

                <div className="mt-4 text-center">
                  <a
                    href="/rbac-test"
                    className="text-sm text-blue-600 hover:text-blue-500"
                  >
                    RBAC Test Page
                  </a>
                </div>
              </div>
            </>
          ) : (
            <>
              {/* Forgot Password Form */}
              {forgotState.success ? (
                <div className="text-center space-y-4">
                  <div className="mx-auto w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                    <CheckCircle className="h-6 w-6 text-green-600" />
                  </div>
                  <div>
                    <h3 className="text-lg font-medium text-gray-900 mb-2">Check Your Email</h3>
                    <p className="text-sm text-gray-600 mb-4">
                      We've sent a password reset link to <strong>{forgotState.email}</strong>
                    </p>
                    <p className="text-xs text-gray-500">
                      Didn't receive the email? Check your spam folder or try again.
                    </p>
                  </div>
                  <Button
                    onClick={() => setForgotState({ email: '', isLoading: false, error: null, success: false })}
                    variant="outline"
                    className="w-full"
                  >
                    Send Another Email
                  </Button>
                </div>
              ) : (
                <form onSubmit={handleForgotPassword} className="space-y-4">
                  <div className="text-center mb-4">
                    <h3 className="text-lg font-medium text-gray-900 mb-2">Reset Your Password</h3>
                    <p className="text-sm text-gray-600">
                      Enter your email address and we'll send you a link to reset your password.
                    </p>
                  </div>

                  {forgotState.error && (
                    <div className="bg-red-50 border border-red-200 rounded-md p-3">
                      <div className="flex items-center">
                        <AlertCircle className="h-4 w-4 text-red-600 mr-2" />
                        <p className="text-sm text-red-600">{forgotState.error}</p>
                      </div>
                    </div>
                  )}

                  <div>
                    <label htmlFor="forgot-email" className="block text-sm font-medium text-gray-700 mb-1">
                      Email Address
                    </label>
                    <input
                      id="forgot-email"
                      type="email"
                      value={forgotState.email}
                      onChange={(e) => setForgotState(prev => ({ ...prev, email: e.target.value, error: null }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Enter your email address"
                      required
                      disabled={forgotState.isLoading}
                    />
                  </div>

                  <Button
                    type="submit"
                    className="w-full"
                    disabled={forgotState.isLoading || !forgotState.email}
                  >
                    {forgotState.isLoading ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Sending Reset Link...
                      </>
                    ) : (
                      <>
                        <Mail className="h-4 w-4 mr-2" />
                        Send Reset Link
                      </>
                    )}
                  </Button>
                </form>
              )}
            </>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

function LoadingFallback() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardContent className="pt-6">
          <div className="flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <span className="ml-3 text-gray-600">Loading...</span>
          </div>
        </CardContent>
      </Card>
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

