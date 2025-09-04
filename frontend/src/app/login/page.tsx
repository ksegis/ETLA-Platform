'use client'

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/Button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card'
import { LogIn, Loader2, AlertCircle } from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const { signIn } = useAuth()
  const router = useRouter()

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError('')

    try {
      console.log(`Attempting login with: ${email}`)
      const { error } = await signIn(email, password)
      
      if (error) {
        console.error('Login error:', error)
        setError(`Login failed: ${error.message}`)
      } else {
        console.log('Login successful, redirecting...')
        router.push('/dashboard')
      }
    } catch (err: any) {
      console.error('Login exception:', err)
      setError(`Login error: ${err.message || 'Unknown error'}`)
    } finally {
      setIsLoading(false)
    }
  }

  const fillTestCredentials = (testEmail: string, testPassword: string) => {
    setEmail(testEmail)
    setPassword(testPassword)
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            ETLA Platform Login
          </h1>
          <p className="text-gray-600">
            Sign in to access your account
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <LogIn className="h-5 w-5" />
              Login
            </CardTitle>
            <CardDescription>
              Enter your credentials to access the platform
            </CardDescription>
          </CardHeader>
          <CardContent>
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
                />
              </div>

              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                  Password
                </label>
                <input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Enter your password"
                />
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
            </form>
          </CardContent>
        </Card>

        {/* Test Credentials */}
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
                onClick={() => fillTestCredentials('admin@etla-platform.com', 'HostAdmin123!')}
              >
                Host Admin
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => fillTestCredentials('admin@acme.com', 'PrimaryAdmin123!')}
              >
                Primary Client Admin
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => fillTestCredentials('user@subsidiary.com', 'SubUser123!')}
              >
                Sub Client User
              </Button>
            </div>
          </CardContent>
        </Card>

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

