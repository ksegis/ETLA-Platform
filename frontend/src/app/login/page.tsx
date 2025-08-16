'use client'

import { useState } from 'react'
import { Eye, EyeOff, LogIn, Mail, Lock, UserPlus } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { supabase } from '@/lib/supabase'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [isSignUp, setIsSignUp] = useState(false)

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError('')

    try {
      console.log('Attempting login with:', email)
      
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password: password,
      })

      if (error) {
        console.error('Login error:', error)
        setError(error.message)
        return
      }

      console.log('Login successful:', data)

      if (data.user) {
        alert('Login successful!')
        // Redirect to dashboard or work requests
        window.location.href = '/work-requests'
      }
    } catch (err) {
      console.error('Login exception:', err)
      const errorMessage = err instanceof Error ? err.message : 'An error occurred'
      setError(errorMessage)
    } finally {
      setIsLoading(false)
    }
  }

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!email || !password) {
      setError('Please enter email and password')
      return
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters')
      return
    }

    setIsLoading(true)
    setError('')

    try {
      console.log('Attempting signup with:', email)
      
      const { data, error } = await supabase.auth.signUp({
        email: email.trim(),
        password: password,
        options: {
          data: {
            first_name: 'Demo',
            last_name: 'User',
            role: 'client_user'
          }
        }
      })

      if (error) {
        console.error('Signup error:', error)
        setError(error.message)
        return
      }

      console.log('Signup response:', data)

      if (data.user) {
        if (data.user.email_confirmed_at) {
          // User is immediately confirmed
          alert('Account created and logged in successfully!')
          window.location.href = '/work-requests'
        } else {
          // Email confirmation required
          alert('Account created! Please check your email for confirmation, or try logging in directly.')
          setIsSignUp(false)
          
          // Try to sign in immediately (some Supabase configs allow this)
          setTimeout(async () => {
            try {
              const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
                email: email.trim(),
                password: password,
              })
              
              if (!signInError && signInData.user) {
                window.location.href = '/work-requests'
              }
            } catch (e) {
              console.log('Auto sign-in failed, user needs to confirm email')
            }
          }, 1000)
        }
      }
    } catch (err) {
      console.error('Signup exception:', err)
      const errorMessage = err instanceof Error ? err.message : 'An error occurred'
      setError(errorMessage)
    } finally {
      setIsLoading(false)
    }
  }

  const fillDemoCredentials = () => {
    setEmail('demo@example.com')
    setPassword('password123')
    setError('')
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="flex justify-center">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-lg">E</span>
            </div>
            <span className="text-2xl font-bold text-gray-900">ETLA</span>
          </div>
        </div>
        <h2 className="mt-6 text-center text-3xl font-bold text-gray-900">
          {isSignUp ? 'Create your account' : 'Sign in to your account'}
        </h2>
        <p className="mt-2 text-center text-sm text-gray-600">
          Access your work requests and project management
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          <form className="space-y-6" onSubmit={isSignUp ? handleSignUp : handleLogin}>
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg text-sm">
                {error}
              </div>
            )}

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                Email address
              </label>
              <div className="mt-1 relative">
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="appearance-none block w-full px-3 py-2 pl-10 border border-gray-300 rounded-lg placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Enter your email"
                />
                <Mail className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
              </div>
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                Password {isSignUp && <span className="text-xs text-gray-500">(min 6 characters)</span>}
              </label>
              <div className="mt-1 relative">
                <input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete={isSignUp ? 'new-password' : 'current-password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="appearance-none block w-full px-3 py-2 pl-10 pr-10 border border-gray-300 rounded-lg placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Enter your password"
                />
                <Lock className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-2.5 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? (
                    <EyeOff className="h-5 w-5" />
                  ) : (
                    <Eye className="h-5 w-5" />
                  )}
                </button>
              </div>
            </div>

            <div className="space-y-3">
              <Button
                type="submit"
                disabled={isLoading}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white"
              >
                {isLoading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    {isSignUp ? 'Creating account...' : 'Signing in...'}
                  </>
                ) : (
                  <>
                    {isSignUp ? (
                      <>
                        <UserPlus className="h-4 w-4 mr-2" />
                        Create Account
                      </>
                    ) : (
                      <>
                        <LogIn className="h-4 w-4 mr-2" />
                        Sign In
                      </>
                    )}
                  </>
                )}
              </Button>

              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setIsSignUp(!isSignUp)
                  setError('')
                }}
                disabled={isLoading}
                className="w-full"
              >
                {isSignUp ? 'Already have an account? Sign in' : 'Need an account? Sign up'}
              </Button>
            </div>
          </form>

          <div className="mt-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-gray-500">Demo Access</span>
              </div>
            </div>

            <div className="mt-4 space-y-3">
              <Button
                type="button"
                variant="outline"
                onClick={fillDemoCredentials}
                className="w-full"
              >
                Fill Demo Credentials
              </Button>
              
              <Button
                type="button"
                variant="outline"
                onClick={() => window.location.href = '/work-requests'}
                className="w-full"
              >
                Continue as Guest (Demo Mode)
              </Button>
            </div>

            <div className="mt-4 p-4 bg-gray-50 rounded-lg">
              <p className="text-sm text-gray-600 mb-2">Testing options:</p>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• <strong>Create account:</strong> Use any email/password</li>
                <li>• <strong>Demo credentials:</strong> demo@example.com / password123</li>
                <li>• <strong>Guest mode:</strong> No login required</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

