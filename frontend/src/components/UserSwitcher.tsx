'use client'

import React, { useState } from 'react'
import { Button } from '@/components/ui/Button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card'
import { User, LogIn, LogOut, Loader2 } from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'

interface TestUser {
  email: string
  password: string
  name: string
  role: string
  roleLevel: string
  company: string
  description: string
}

const TEST_USERS: TestUser[] = [
  {
    email: 'admin@etla-platform.com',
    password: 'HostAdmin123!',
    name: 'System Administrator',
    role: 'admin',
    roleLevel: 'host',
    company: '🏢 ETLA Platform (Host)',
    description: 'Full system access across all tenants'
  },
  {
    email: 'manager@etla-platform.com',
    password: 'HostManager123!',
    name: 'Platform Manager',
    role: 'manager',
    roleLevel: 'host',
    company: '🏢 ETLA Platform (Host)',
    description: 'Host-level management functions'
  },
  {
    email: 'admin@acme.com',
    password: 'PrimaryAdmin123!',
    name: 'Michael Chen',
    role: 'admin',
    roleLevel: 'primary_client',
    company: '🏢 ACME Corporation (Primary)',
    description: 'ACME admin + subsidiary management'
  },
  {
    email: 'manager@acme.com',
    password: 'PrimaryManager123!',
    name: 'Sarah Johnson',
    role: 'manager',
    roleLevel: 'primary_client',
    company: '🏢 ACME Corporation (Primary)',
    description: 'ACME project management functions'
  },
  {
    email: 'admin@subsidiary.com',
    password: 'SubAdmin123!',
    name: 'Alex Thompson',
    role: 'admin',
    roleLevel: 'sub_client',
    company: '🏢 ACME Subsidiary (Sub)',
    description: 'Subsidiary administration only'
  },
  {
    email: 'user@subsidiary.com',
    password: 'SubUser123!',
    name: 'Emma Davis',
    role: 'user',
    roleLevel: 'sub_client',
    company: '🏢 ACME Subsidiary (Sub)',
    description: 'Basic user operations'
  },
  {
    email: 'viewer@subsidiary.com',
    password: 'SubViewer123!',
    name: 'Jordan Smith',
    role: 'viewer',
    roleLevel: 'sub_client',
    company: '🏢 ACME Subsidiary (Sub)',
    description: 'Read-only access'
  }
]

export default function UserSwitcher() {
  const { signIn, signOut, user, isAuthenticated } = useAuth()
  const [isLoading, setIsLoading] = useState(false)
  const [loadingUser, setLoadingUser] = useState<string | null>(null)

  const handleUserSwitch = async (testUser: TestUser) => {
    setIsLoading(true)
    setLoadingUser(testUser.email)
    
    try {
      // Sign out current user first
      if (isAuthenticated) {
        console.log('Signing out current user...')
        await signOut()
      }
      
      // Small delay to ensure signout completes
      await new Promise(resolve => setTimeout(resolve, 500))
      
      // Sign in as the test user
      console.log(`Attempting to sign in as: ${testUser.email}`)
      const { error } = await signIn(testUser.email, testUser.password)
      
      if (error) {
        console.error('Detailed login error:', {
          message: error.message,
          status: error.status,
          statusText: error.statusText,
          name: error.name,
          cause: error.cause
        })
        
        // Show detailed error message
        const errorDetails = [
          `Message: ${error.message}`,
          error.status ? `Status: ${error.status}` : '',
          error.statusText ? `Status Text: ${error.statusText}` : '',
          error.name ? `Error Type: ${error.name}` : ''
        ].filter(Boolean).join('\n')
        
        alert(`Failed to login as ${testUser.name}:\n\n${errorDetails}\n\nPlease check the browser console for more details.`)
      } else {
        console.log('Login successful, refreshing page...')
        // Small delay to ensure login completes
        await new Promise(resolve => setTimeout(resolve, 1000))
        
        // Refresh the page to update all components
        window.location.reload()
      }
    } catch (error: any) {
      console.error('Switch user error:', error)
      
      // Show detailed error for debugging
      const errorMessage = error?.message || 'Unknown error occurred'
      const errorStack = error?.stack || 'No stack trace available'
      
      alert(`Failed to switch to ${testUser.name}:\n\nError: ${errorMessage}\n\nCheck browser console for full details.`)
      console.error('Full error details:', { error, stack: errorStack })
    } finally {
      setIsLoading(false)
      setLoadingUser(null)
    }
  }

  const handleSignOut = async () => {
    setIsLoading(true)
    try {
      await signOut()
      window.location.reload()
    } catch (error) {
      console.error('Sign out error:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const getCurrentUser = () => {
    if (!user?.email) return null
    return TEST_USERS.find(testUser => testUser.email === user.email)
  }

  const currentUser = getCurrentUser()

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <User className="h-5 w-5" />
          RBAC Test User Switcher
        </CardTitle>
        <CardDescription>
          Switch between different test users to verify role-based access controls
        </CardDescription>
      </CardHeader>
      <CardContent>
        {/* Current User Display */}
        {isAuthenticated && currentUser && (
          <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-medium text-blue-900">Currently Logged In</h3>
                <p className="text-sm text-blue-700">
                  <span className="font-medium">{currentUser.name}</span> ({currentUser.email})
                </p>
                <p className="text-xs text-blue-600">
                  {currentUser.company} • {currentUser.role} • {currentUser.roleLevel}
                </p>
              </div>
              <Button
                onClick={handleSignOut}
                disabled={isLoading}
                variant="outline"
                size="sm"
                className="text-blue-700 border-blue-300 hover:bg-blue-100"
              >
                {isLoading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <LogOut className="h-4 w-4" />
                )}
                Sign Out
              </Button>
            </div>
          </div>
        )}

        {/* Test Users Grid */}
        <div className="space-y-4">
          <h3 className="font-medium text-gray-900">Available Test Users</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {TEST_USERS.map((testUser) => {
              const isCurrentUser = currentUser?.email === testUser.email
              const isLoadingThisUser = loadingUser === testUser.email
              
              return (
                <div
                  key={testUser.email}
                  className={`p-4 border rounded-lg transition-colors ${
                    isCurrentUser 
                      ? 'border-blue-500 bg-blue-50' 
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <h4 className="font-medium text-sm">{testUser.name}</h4>
                      <span className={`px-2 py-1 text-xs rounded-full ${
                        testUser.roleLevel === 'host' 
                          ? 'bg-purple-100 text-purple-800'
                          : testUser.roleLevel === 'primary_client'
                          ? 'bg-blue-100 text-blue-800'
                          : 'bg-green-100 text-green-800'
                      }`}>
                        {testUser.role}
                      </span>
                    </div>
                    
                    <p className="text-xs text-gray-600">{testUser.company}</p>
                    <p className="text-xs text-gray-500">{testUser.description}</p>
                    
                    <div className="pt-2">
                      <Button
                        onClick={() => handleUserSwitch(testUser)}
                        disabled={isLoading || isCurrentUser}
                        size="sm"
                        variant={isCurrentUser ? "secondary" : "default"}
                        className="w-full"
                      >
                        {isLoadingThisUser ? (
                          <>
                            <Loader2 className="h-4 w-4 animate-spin mr-2" />
                            Switching...
                          </>
                        ) : isCurrentUser ? (
                          <>
                            <User className="h-4 w-4 mr-2" />
                            Current User
                          </>
                        ) : (
                          <>
                            <LogIn className="h-4 w-4 mr-2" />
                            Switch to User
                          </>
                        )}
                      </Button>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* Instructions */}
        <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
          <h3 className="font-medium text-yellow-800 mb-2">Testing Instructions</h3>
          <ul className="text-sm text-yellow-700 space-y-1">
            <li>• Click "Switch to User" to login as different test users</li>
            <li>• The page will refresh automatically after switching users</li>
            <li>• Run RBAC tests after each user switch to compare permissions</li>
            <li>• Check that navigation menus and features change based on role</li>
            <li>• Verify cross-tenant data isolation between different companies</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  )
}

