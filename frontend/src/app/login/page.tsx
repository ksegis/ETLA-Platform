'use client'

import React, { useState, useEffect } from 'react'
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

export default function LoginPage() {
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

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError('')
    setMessage('')

    try {
      console.log(`Attempting login with: ${email}`)
      const { error } = await signIn(email, password)
      
      if (error) {
        console.error('Login error:', error)
        setError(`Login failed: ${error.message}`)
      } else {
        console.log('Login successful, redirecting...')
        router.push('/access-control')
      }
    } catch (err: any) {
      console.error('Login exception:', err)
      setError(`Login error: ${err.message || 'Unknown error'}`)
    } finally {
      setIsLoading(false)
    }
  }

  const handleForgotPasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!forgotState.email) {
      setForgotState(prev => ({ ...prev, error: 'Please enter your email address' }))
      return
    }

    setForgotState(prev => ({ ...prev, isLoading: true, error: null }))

    try {
      const result = await userManagement.sendPasswordReset(forgotState.email)

      if (result.success) {
        setForgotState(prev => ({
          ...prev,
          isLoading: false,
          success: true
        }))
      } else {
        setForgotState(prev => ({
          ...prev,
          isLoading: false,
          error: result.error || 'Failed to send password reset email'
        }))
      }
    } catch (err: any) {
      setForgotState(prev => ({
        ...prev,
        isLoading: false,
        error: err.message || 'Failed to send password reset email'
      }))
    }
  }

  const fillTestCredentials = (testEmail: string, testPassword: string) => {
    setEmail(testEmail)
    setPassword(testPassword)
    setActiveTab('login')
  }

  const switchToLogin = () => {
    setActiveTab('login')
    setForgotState({
      email: '',
      isLoading: false,
      error: null,
      success: false
    })
  }

  const switchToForgot = () => {
    setActiveTab('forgot')
    setForgotState(prev => ({
      ...prev,
      email: email // Pre-fill with login email if available
    }))
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            ETLA Platform
          </h1>
          <p className="text-gray-600">
            {activeTab === 'login' ? 'Sign in to access your account' : 'Reset your password'}
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              {activeTab === 'login' ? (
                <>
                  <LogIn className="h-5 w-5" />
                  Login
                </>
              ) : (
                <>
                  <Mail className="h-5 w-5" />
                  Reset Password
                </>
              )}
            </CardTitle>
            <CardDescription>
              {activeTab === 'login' 
                ? 'Enter your credentials to access the platform'
                : 'Enter your email to receive a password reset link'
              }
            </CardDescription>
          </CardHeader>
          <CardContent>
            {/* Tab Navigation */}
            <div className="flex mb-6 bg-gray-100 rounded-lg p-1">
              <button
                onClick={switchToLogin}
                className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
                  activeTab === 'login'
                    ? 'bg-white text-blue-600 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                Sign In
              </button>
              <button
                onClick={switchToForgot}
                className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
                  activeTab === 'forgot'
                    ? 'bg-white text-blue-600 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                Forgot Password
              </button>
            </div>

            {/* Success/Error Messages */}
            {message && (
              <div className="flex items-center gap-2 p-3 bg-green-50 border border-green-200 rounded-md mb-4">
                <CheckCircle className="h-4 w-4 text-green-500" />
                <span className="text-sm text-green-700">{message}</span>
              </div>
            )}

            {/* Login Form */}
            {activeTab === 'login' && (
              <form onSubmit={handleLogin} className="space-y-4">
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                    Email
                  </label>
                  <input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Enter your email"
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
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 pr-10"
                      placeholder="Enter your password"
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

                {error && (
                  <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-md">
                    <AlertCircle className="h-4 w-4 text-red-500" />
                    <span className="text-sm text-red-700">{error}</span>
                  </div>
                )}

                <Button
                  type="submit"
                  disabled={isLoading}
                  className="w-full"
                >
                  {isLoading ? (
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
                    onClick={switchToForgot}
                    className="text-sm text-blue-600 hover:text-blue-500"
                    disabled={isLoading}
                  >
                    Forgot your password?
                  </button>
                </div>
              </form>
            )}

            {/* Forgot Password Form */}
            {activeTab === 'forgot' && (
              <>
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
                    <div className="space-y-2">
                      <Button
                        onClick={() => setForgotState(prev => ({ ...prev, success: false }))}
                        variant="outline"
                        className="w-full"
                      >
                        Send Another Email
                      </Button>
                      <Button
                        onClick={switchToLogin}
                        className="w-full"
                      >
                        Back to Sign In
                      </Button>
                    </div>
                  </div>
                ) : (
                  <form onSubmit={handleForgotPasswordSubmit} className="space-y-4">
                    {forgotState.error && (
                      <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-md">
                        <AlertCircle className="h-4 w-4 text-red-500" />
                        <span className="text-sm text-red-700">{forgotState.error}</span>
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
                        className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="Enter your email address"
                        required
                        disabled={forgotState.isLoading}
                      />
                    </div>

                    <Button
                      type="submit"
                      className="w-full"
                      disabled={forgotState.isLoading}
                    >
                      {forgotState.isLoading ? (
                        <>
                          <Loader2 className="h-4 w-4 animate-spin mr-2" />
                          Sending Reset Link...
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
                        onClick={switchToLogin}
                        className="text-sm text-blue-600 hover:text-blue-500"
                        disabled={forgotState.isLoading}
                      >
                        Back to Sign In
                      </button>
                    </div>
                  </form>
                )}
              </>
            )}
          </CardContent>
        </Card>

        {/* Test Credentials - Only show on login tab */}
        {activeTab === 'login' && (
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Test Credentials</CardTitle>
              <CardDescription>
                Click to fill in test user credentials
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => fillTestCredentials('kevin.shelton@outlook.com', 'TestPassword123!')}
                >
                  Host Admin
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => fillTestCredentials('kt.shelton@outlook.com', 'TestPassword123!')}
                >
                  Host Manager
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => fillTestCredentials('ke.shelton@outlook.com', 'TestPassword123!')}
                >
                  Primary Client Admin
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => fillTestCredentials('kevin.shelton@invictusbpo.com', 'TestPassword123!')}
                >
                  Sub Client User
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        <div className="text-center">
          <p className="text-sm text-gray-600">
            Need help? Check the{' '}
            <a href="/rbac-test" className="text-blue-600 hover:text-blue-500">
              RBAC Test Page
            </a>
          </p>
        </div>
      </div>
    </div>
  )
}

