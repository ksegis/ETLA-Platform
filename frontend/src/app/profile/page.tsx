'use client'

import React, { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { User, Mail, Phone, Building, ArrowLeft } from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'

export default function ProfilePage() {
  const router = useRouter()
  const { isDemoMode, isAuthenticated } = useAuth()

  // Redirect if not authenticated and not in demo mode
  useEffect(() => {
    if (!isAuthenticated && !isDemoMode) {
      router.push('/login')
    }
  }, [isAuthenticated, isDemoMode, router])

  // Show loading or return null during redirect
  if (!isAuthenticated && !isDemoMode) {
    return null
  }

  const demoProfile = {
    id: 'b224935f-732f-4b09-a4a0-16492c5ae563',
    email: 'demo@company.com',
    full_name: 'Demo User',
    phone: '+1 (555) 123-4567',
    department: 'IT Department',
    job_title: 'System Administrator'
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto py-8 px-4">
        {/* Header */}
        <div className="mb-8">
          <Button
            variant="outline"
            onClick={() => router.push('/dashboard')}
            className="mb-4"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Dashboard
          </Button>
          <h1 className="text-3xl font-bold text-gray-900">Profile Settings</h1>
          <p className="text-gray-600 mt-2">Manage your account settings and preferences</p>
        </div>

        {/* Profile Information */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center">
              <User className="h-5 w-5 mr-2" />
              Profile Information
            </CardTitle>
            <CardDescription>
              Your basic account information
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Full Name
                </label>
                <div className="flex items-center p-3 bg-gray-50 rounded-md">
                  <User className="h-4 w-4 mr-2 text-gray-500" />
                  <span>{demoProfile.full_name}</span>
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email
                </label>
                <div className="flex items-center p-3 bg-gray-50 rounded-md">
                  <Mail className="h-4 w-4 mr-2 text-gray-500" />
                  <span>{demoProfile.email}</span>
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Phone
                </label>
                <div className="flex items-center p-3 bg-gray-50 rounded-md">
                  <Phone className="h-4 w-4 mr-2 text-gray-500" />
                  <span>{demoProfile.phone}</span>
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Department
                </label>
                <div className="flex items-center p-3 bg-gray-50 rounded-md">
                  <Building className="h-4 w-4 mr-2 text-gray-500" />
                  <span>{demoProfile.department}</span>
                </div>
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Job Title
              </label>
              <div className="flex items-center p-3 bg-gray-50 rounded-md">
                <Building className="h-4 w-4 mr-2 text-gray-500" />
                <span>{demoProfile.job_title}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Demo Mode Notice */}
        {isDemoMode && (
          <Card className="border-blue-200 bg-blue-50">
            <CardContent className="pt-6">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="h-8 w-8 rounded-full bg-blue-600 flex items-center justify-center">
                    <span className="text-white text-sm font-medium">ℹ</span>
                  </div>
                </div>
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-blue-800">Demo Mode</h3>
                  <p className="text-sm text-blue-700 mt-1">
                    You are viewing demo data. In production, this would show your actual profile information.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}

