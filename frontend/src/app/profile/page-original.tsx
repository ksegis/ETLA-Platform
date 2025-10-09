'use client'

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { 
  User, 
  Lock, 
  Camera, 
  Mail, 
  Phone, 
  Building, 
  Shield, 
  Eye, 
  EyeOff, 
  Save, 
  Upload, 
  AlertCircle, 
  CheckCircle,
  Settings,
  Key,
  Smartphone,
  QrCode,
  Download
} from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'
import { supabase } from '@/lib/supabase'

interface ProfileData {
  id: string
  email: string
  full_name: string
  phone: string
  department: string
  job_title: string
  avatar_url: string
  created_at: string
  updated_at: string
}

interface PasswordChangeData {
  currentPassword: string
  newPassword: string
  confirmPassword: string
}

interface ProfileState {
  profile: ProfileData | null
  Loading: boolean
  isSaving: boolean
  error: string
  success: string
  activeTab: 'profile' | 'security' | 'mfa'
  passwordData: PasswordChangeData
  showCurrentPassword: boolean
  showNewPassword: boolean
  showConfirmPassword: boolean
  isChangingPassword: boolean
  passwordError: string
  passwordSuccess: string
  isUploadingAvatar: boolean
  mfaEnabled: boolean
  mfaSecret: string
  mfaQrCode: string
  backupCodes: string[]
  showBackupCodes: boolean
}

export default function ProfilePage() {
  const router = useRouter()
  const { user, isAuthenticated, isDemoMode } = useAuth()
  
  const [state, setState] = useState<ProfileState>({
    profile: null,
    Loading: true,
    isSaving: false,
    error: '',
    success: '',
    activeTab: 'profile',
    passwordData: {
      currentPassword: '',
      newPassword: '',
      confirmPassword: ''
    },
    showCurrentPassword: false,
    showNewPassword: false,
    showConfirmPassword: false,
    isChangingPassword: false,
    passwordError: '',
    passwordSuccess: '',
    isUploadingAvatar: false,
    mfaEnabled: false,
    mfaSecret: '',
    mfaQrCode: '',
    backupCodes: [],
    showBackupCodes: false
  })

  // Redirect if not authenticated
  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login')
      return
    }
  }, [isAuthenticated, router])

  // Load profile data
  useEffect(() => {
    const loadProfile = async () => {
      try {
        if (isDemoMode) {
          // Use demo data when in demo mode
          setState(prev => ({
            ...prev,
            profile: {
              id: 'demo-user-id',
              email: 'demo@company.com',
              full_name: 'Demo User',
              phone: '+1 (555) 123-4567',
              department: 'IT Department',
              job_title: 'System Administrator',
              avatar_url: '',
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString()
            },
            mfaEnabled: false,
            Loading: false
          }))
          return
        }

        if (!user?.id) return

        // Load profile from profiles table
        const { data: profileData, error: profileError } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single()

        if (profileError) {
          console.error('Error loading profile:', profileError)
          setState(prev => ({ 
            ...prev, 
            error: 'Failed to load profile data',
            Loading: false 
          }))
          return
        }

        // Check MFA status
        const mfaEnabled = user.user_metadata?.mfa_enabled || false

        setState(prev => ({
          ...prev,
          profile: {
            id: user.id,
            email: user.email || '',
            full_name: profileData?.full_name || user.user_metadata?.full_name || '',
            phone: profileData?.phone || user.user_metadata?.phone || '',
            department: profileData?.department || '',
            job_title: profileData?.job_title || '',
            avatar_url: profileData?.avatar_url || user.user_metadata?.avatar_url || '',
            created_at: profileData?.created_at || user.created_at,
            updated_at: profileData?.updated_at || user.updated_at
          },
          mfaEnabled,
          Loading: false
        }))

      } catch (err: any) {
        console.error('Error loading profile:', err)
        setState(prev => ({ 
          ...prev, 
          error: 'Failed to load profile data',
          Loading: false 
        }))
      }
    }

    loadProfile()
  }, [user, isDemoMode])

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

  const handleProfileUpdate = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!state.profile) return

    setState(prev => ({ ...prev, isSaving: true, error: '', success: '' }))

    try {
      // Update auth user metadata
      const { error: authError } = await supabase.auth.updateUser({
        data: {
          full_name: state.profile.full_name,
          phone: state.profile.phone
        }
      })

      if (authError) {
        setState(prev => ({ 
          ...prev, 
          isSaving: false,
          error: authError.message 
        }))
        return
      }

      // Update profile table
      const { error: profileError } = await supabase
        .from('profiles')
        .upsert({
          id: state.profile.id,
          full_name: state.profile.full_name,
          phone: state.profile.phone,
          department: state.profile.department,
          job_title: state.profile.job_title,
          updated_at: new Date().toISOString()
        })

      if (profileError) {
        setState(prev => ({ 
          ...prev, 
          isSaving: false,
          error: profileError.message 
        }))
        return
      }

      setState(prev => ({ 
        ...prev, 
        isSaving: false,
        success: 'Profile updated successfully!' 
      }))

    } catch (err: any) {
      setState(prev => ({ 
        ...prev, 
        isSaving: false,
        error: err.message || 'Failed to update profile' 
      }))
    }
  }

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault()
    
    const { newPassword, confirmPassword } = state.passwordData

    // Validate new password
    const passwordError = validatePassword(newPassword)
    if (passwordError) {
      setState(prev => ({ ...prev, passwordError }))
      return
    }

    if (newPassword !== confirmPassword) {
      setState(prev => ({ ...prev, passwordError: 'Passwords do not match' }))
      return
    }

    setState(prev => ({ 
      ...prev, 
      isChangingPassword: true, 
      passwordError: '', 
      passwordSuccess: '' 
    }))

    try {
      const { error } = await supabase.auth.updateUser({
        password: newPassword
      })

      if (error) {
        setState(prev => ({ 
          ...prev, 
          isChangingPassword: false,
          passwordError: error.message 
        }))
        return
      }

      setState(prev => ({ 
        ...prev, 
        isChangingPassword: false,
        passwordSuccess: 'Password updated successfully!',
        passwordData: {
          currentPassword: '',
          newPassword: '',
          confirmPassword: ''
        }
      }))

    } catch (err: any) {
      setState(prev => ({ 
        ...prev, 
        isChangingPassword: false,
        passwordError: err.message || 'Failed to update password' 
      }))
    }
  }

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file || !user?.id) return

    setState(prev => ({ ...prev, isUploadingAvatar: true, error: '', success: '' }))

    try {
      // Upload to Supabase storage
      const fileExt = file.name.split('.').pop()
      const fileName = `${user.id}.${fileExt}`
      
      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(fileName, file, { upsert: true })

      if (uploadError) {
        setState(prev => ({ 
          ...prev, 
          isUploadingAvatar: false,
          error: uploadError.message 
        }))
        return
      }

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('avatars')
        .getPublicUrl(fileName)

      // Update profile with new avatar URL
      const { error: updateError } = await supabase.auth.updateUser({
        data: { avatar_url: publicUrl }
      })

      if (updateError) {
        setState(prev => ({ 
          ...prev, 
          isUploadingAvatar: false,
          error: updateError.message 
        }))
        return
      }

      // Update local state
      setState(prev => ({
        ...prev,
        isUploadingAvatar: false,
        success: 'Profile picture updated successfully!',
        profile: prev.profile ? {
          ...prev.profile,
          avatar_url: publicUrl
        } : null
      }))

    } catch (err: any) {
      setState(prev => ({ 
        ...prev, 
        isUploadingAvatar: false,
        error: err.message || 'Failed to upload profile picture' 
      }))
    }
  }

  const generateMFASecret = async () => {
    try {
      // In a real implementation, this would call a backend endpoint
      // For now, we'll simulate MFA setup
      const secret = 'JBSWY3DPEHPK3PXP' // Example secret
      const qrCodeUrl = `otpauth://totp/ETLA%20Platform:${user?.email}?secret=${secret}&issuer=ETLA%20Platform`
      
      setState(prev => ({
        ...prev,
        mfaSecret: secret,
        mfaQrCode: qrCodeUrl
      }))
    } catch (err: any) {
      setState(prev => ({ 
        ...prev, 
        error: err.message || 'Failed to generate MFA secret' 
      }))
    }
  }

  const enableMFA = async () => {
    try {
      // Update user metadata to enable MFA
      const { error } = await supabase.auth.updateUser({
        data: { mfa_enabled: true }
      })

      if (error) {
        setState(prev => ({ ...prev, error: error.message }))
        return
      }

      // Generate backup codes
      const backupCodes = Array.from({ length: 10 }, () => 
        Math.random().toString(36).substring(2, 8).toUpperCase()
      )

      setState(prev => ({
        ...prev,
        mfaEnabled: true,
        backupCodes,
        showBackupCodes: true,
        success: 'MFA enabled successfully!'
      }))

    } catch (err: any) {
      setState(prev => ({ 
        ...prev, 
        error: err.message || 'Failed to enable MFA' 
      }))
    }
  }

  const disableMFA = async () => {
    try {
      const { error } = await supabase.auth.updateUser({
        data: { mfa_enabled: false }
      })

      if (error) {
        setState(prev => ({ ...prev, error: error.message }))
        return
      }

      setState(prev => ({
        ...prev,
        mfaEnabled: false,
        mfaSecret: '',
        mfaQrCode: '',
        backupCodes: [],
        showBackupCodes: false,
        success: 'MFA disabled successfully!'
      }))

    } catch (err: any) {
      setState(prev => ({ 
        ...prev, 
        error: err.message || 'Failed to disable MFA' 
      }))
    }
  }

  if (state.Loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-2 text-gray-600">loading profile...</p>
        </div>
      </div>
    )
  }

  if (!state.profile) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6">
            <div className="text-center">
              <AlertCircle className="h-8 w-8 text-red-600 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">Profile Not Found</h3>
              <p className="text-gray-600 mb-4">Unable to load your profile information.</p>
              <Button onClick={() => router.push('/dashboard')}>
                Back to Dashboard
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Profile Settings</h1>
          <p className="text-gray-600">Manage your account settings and preferences</p>
        </div>

        {/* Tab Navigation */}
        <div className="mb-8">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8">
              <button
                onClick={() => setState(prev => ({ ...prev, activeTab: 'profile' }))}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  state.activeTab === 'profile'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <User className="h-4 w-4 inline mr-2" />
                Profile
              </button>
              <button
                onClick={() => setState(prev => ({ ...prev, activeTab: 'security' }))}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  state.activeTab === 'security'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <Lock className="h-4 w-4 inline mr-2" />
                Security
              </button>
              <button
                onClick={() => setState(prev => ({ ...prev, activeTab: 'mfa' }))}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  state.activeTab === 'mfa'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <Shield className="h-4 w-4 inline mr-2" />
                Two-Factor Auth
              </button>
            </nav>
          </div>
        </div>

        {/* Global Messages */}
        {state.error && (
          <div className="mb-6 bg-red-50 border border-red-200 rounded-md p-4">
            <div className="flex items-center">
              <AlertCircle className="h-4 w-4 text-red-600 mr-2" />
              <p className="text-sm text-red-700">{state.error}</p>
            </div>
          </div>
        )}

        {state.success && (
          <div className="mb-6 bg-green-50 border border-green-200 rounded-md p-4">
            <div className="flex items-center">
              <CheckCircle className="h-4 w-4 text-green-600 mr-2" />
              <p className="text-sm text-green-700">{state.success}</p>
            </div>
          </div>
        )}

        {/* Profile Tab */}
        {state.activeTab === 'profile' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Profile Picture */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Camera className="h-5 w-5" />
                  Profile Picture
                </CardTitle>
                <CardDescription>
                  Upload a profile picture to personalize your account
                </CardDescription>
              </CardHeader>
              <CardContent className="text-center">
                <div className="mb-4">
                  {state.profile.avatar_url ? (
                    <img
                      src={state.profile.avatar_url}
                      alt="Profile"
                      className="w-24 h-24 rounded-full mx-auto object-cover"
                    />
                  ) : (
                    <div className="w-24 h-24 rounded-full mx-auto bg-gray-200 flex items-center justify-center">
                      <User className="h-8 w-8 text-gray-400" />
                    </div>
                  )}
                </div>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleAvatarUpload}
                  className="hidden"
                  id="avatar-upload"
                  disabled={state.isUploadingAvatar}
                />
                <label htmlFor="avatar-upload">
                  <Button
                    type="button"
                    variant="outline"
                    disabled={state.isUploadingAvatar}
                    className="cursor-pointer"
                  >
                    {state.isUploadingAvatar ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600 mr-2"></div>
                        Uploading...
                      </>
                    ) : (
                      <>
                        <Upload className="h-4 w-4 mr-2" />
                        Upload Picture
                      </>
                    )}
                  </Button>
                </label>
              </CardContent>
            </Card>

            {/* Profile Information */}
            <div className="lg:col-span-2">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <User className="h-5 w-5" />
                    Personal Information
                  </CardTitle>
                  <CardDescription>
                    Update your personal details and contact information
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleProfileUpdate} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Full Name
                        </label>
                        <input
                          type="text"
                          value={state.profile.full_name}
                          onChange={(e: any) => setState(prev => ({
                            ...prev,
                            profile: prev.profile ? {
                              ...prev.profile,
                              full_name: e.target.value
                            } : null
                          }))}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          placeholder="Enter your full name"
                          disabled={state.isSaving}
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Email Address
                        </label>
                        <div className="relative">
                          <input
                            type="email"
                            value={state.profile.email}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50 text-gray-500"
                            disabled
                          />
                          <Mail className="absolute right-3 top-2.5 h-4 w-4 text-gray-400" />
                        </div>
                        <p className="text-xs text-gray-500 mt-1">
                          Email cannot be changed. Contact support if needed.
                        </p>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Phone Number
                        </label>
                        <div className="relative">
                          <input
                            type="tel"
                            value={state.profile.phone}
                            onChange={(e: any) => setState(prev => ({
                              ...prev,
                              profile: prev.profile ? {
                                ...prev.profile,
                                phone: e.target.value
                              } : null
                            }))}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 pl-10"
                            placeholder="Enter your phone number"
                            disabled={state.isSaving}
                          />
                          <Phone className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Job Title
                        </label>
                        <input
                          type="text"
                          value={state.profile.job_title}
                          onChange={(e: any) => setState(prev => ({
                            ...prev,
                            profile: prev.profile ? {
                              ...prev.profile,
                              job_title: e.target.value
                            } : null
                          }))}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          placeholder="Enter your job title"
                          disabled={state.isSaving}
                        />
                      </div>

                      <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Department
                        </label>
                        <div className="relative">
                          <input
                            type="text"
                            value={state.profile.department}
                            onChange={(e: any) => setState(prev => ({
                              ...prev,
                              profile: prev.profile ? {
                                ...prev.profile,
                                department: e.target.value
                              } : null
                            }))}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 pl-10"
                            placeholder="Enter your department"
                            disabled={state.isSaving}
                          />
                          <Building className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                        </div>
                      </div>
                    </div>

                    <div className="flex justify-end">
                      <Button
                        type="submit"
                        disabled={state.isSaving}
                      >
                        {state.isSaving ? (
                          <>
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                            Saving...
                          </>
                        ) : (
                          <>
                            <Save className="h-4 w-4 mr-2" />
                            Save Changes
                          </>
                        )}
                      </Button>
                    </div>
                  </form>
                </CardContent>
              </Card>
            </div>
          </div>
        )}

        {/* Security Tab */}
        {state.activeTab === 'security' && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Lock className="h-5 w-5" />
                Password & Security
              </CardTitle>
              <CardDescription>
                Update your password and security settings
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handlePasswordChange} className="space-y-4">
                {state.passwordError && (
                  <div className="bg-red-50 border border-red-200 rounded-md p-3">
                    <div className="flex items-center">
                      <AlertCircle className="h-4 w-4 text-red-600 mr-2" />
                      <p className="text-sm text-red-600">{state.passwordError}</p>
                    </div>
                  </div>
                )}

                {state.passwordSuccess && (
                  <div className="bg-green-50 border border-green-200 rounded-md p-3">
                    <div className="flex items-center">
                      <CheckCircle className="h-4 w-4 text-green-600 mr-2" />
                      <p className="text-sm text-green-600">{state.passwordSuccess}</p>
                    </div>
                  </div>
                )}

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Current Password
                  </label>
                  <div className="relative">
                    <input
                      type={state.showCurrentPassword ? 'text' : 'password'}
                      value={state.passwordData.currentPassword}
                      onChange={(e: any) => setState(prev => ({
                        ...prev,
                        passwordData: {
                          ...prev.passwordData,
                          currentPassword: e.target.value
                        }
                      }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 pr-10"
                      placeholder="Enter your current password"
                      disabled={state.isChangingPassword}
                    />
                    <button
                      type="button"
                      onClick={() => setState(prev => ({ 
                        ...prev, 
                        showCurrentPassword: !prev.showCurrentPassword 
                      }))}
                      className="absolute inset-y-0 right-0 pr-3 flex items-center"
                      disabled={state.isChangingPassword}
                    >
                      {state.showCurrentPassword ? (
                        <EyeOff className="h-4 w-4 text-gray-400" />
                      ) : (
                        <Eye className="h-4 w-4 text-gray-400" />
                      )}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    New Password
                  </label>
                  <div className="relative">
                    <input
                      type={state.showNewPassword ? 'text' : 'password'}
                      value={state.passwordData.newPassword}
                      onChange={(e: any) => setState(prev => ({
                        ...prev,
                        passwordData: {
                          ...prev.passwordData,
                          newPassword: e.target.value
                        }
                      }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 pr-10"
                      placeholder="Enter your new password"
                      disabled={state.isChangingPassword}
                    />
                    <button
                      type="button"
                      onClick={() => setState(prev => ({ 
                        ...prev, 
                        showNewPassword: !prev.showNewPassword 
                      }))}
                      className="absolute inset-y-0 right-0 pr-3 flex items-center"
                      disabled={state.isChangingPassword}
                    >
                      {state.showNewPassword ? (
                        <EyeOff className="h-4 w-4 text-gray-400" />
                      ) : (
                        <Eye className="h-4 w-4 text-gray-400" />
                      )}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Confirm New Password
                  </label>
                  <div className="relative">
                    <input
                      type={state.showConfirmPassword ? 'text' : 'password'}
                      value={state.passwordData.confirmPassword}
                      onChange={(e: any) => setState(prev => ({
                        ...prev,
                        passwordData: {
                          ...prev.passwordData,
                          confirmPassword: e.target.value
                        }
                      }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 pr-10"
                      placeholder="Confirm your new password"
                      disabled={state.isChangingPassword}
                    />
                    <button
                      type="button"
                      onClick={() => setState(prev => ({ 
                        ...prev, 
                        showConfirmPassword: !prev.showConfirmPassword 
                      }))}
                      className="absolute inset-y-0 right-0 pr-3 flex items-center"
                      disabled={state.isChangingPassword}
                    >
                      {state.showConfirmPassword ? (
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

                <div className="flex justify-end">
                  <Button
                    type="submit"
                    disabled={state.isChangingPassword || !state.passwordData.newPassword || !state.passwordData.confirmPassword}
                  >
                    {state.isChangingPassword ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        Updating password...
                      </>
                    ) : (
                      <>
                        <Key className="h-4 w-4 mr-2" />
                        Update Password
                      </>
                    )}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        )}

        {/* MFA Tab */}
        {state.activeTab === 'mfa' && (
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="h-5 w-5" />
                  Two-Factor Authentication
                </CardTitle>
                <CardDescription>
                  Add an extra layer of security to your account with two-factor authentication
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className={`p-2 rounded-full ${state.mfaEnabled ? 'bg-green-100' : 'bg-gray-100'}`}>
                      <Smartphone className={`h-5 w-5 ${state.mfaEnabled ? 'text-green-600' : 'text-gray-400'}`} />
                    </div>
                    <div>
                      <h3 className="text-sm font-medium text-gray-900">
                        Authenticator App
                      </h3>
                      <p className="text-sm text-gray-500">
                        {state.mfaEnabled ? 'Two-factor authentication is enabled' : 'Use an authenticator app to generate codes'}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                      state.mfaEnabled 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-gray-100 text-gray-800'
                    }`}>
                      {state.mfaEnabled ? 'Enabled' : 'Disabled'}
                    </span>
                    {state.mfaEnabled ? (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={disableMFA}
                      >
                        Disable
                      </Button>
                    ) : (
                      <Button
                        size="sm"
                        onClick={generateMFASecret}
                      >
                        Enable
                      </Button>
                    )}
                  </div>
                </div>

                {/* MFA Setup */}
                {state.mfaSecret && !state.mfaEnabled && (
                  <div className="mt-6 p-4 border border-blue-200 rounded-lg bg-blue-50">
                    <h4 className="text-sm font-medium text-blue-900 mb-3">
                      Set up your authenticator app
                    </h4>
                    <div className="space-y-4">
                      <div>
                        <p className="text-sm text-blue-800 mb-2">
                          1. Scan this QR code with your authenticator app:
                        </p>
                        <div className="bg-white p-4 rounded-lg inline-block">
                          <QrCode className="h-32 w-32 text-gray-400" />
                          <p className="text-xs text-gray-500 mt-2 text-center">
                            QR Code would appear here
                          </p>
                        </div>
                      </div>
                      <div>
                        <p className="text-sm text-blue-800 mb-2">
                          2. Or enter this secret key manually:
                        </p>
                        <code className="bg-white px-3 py-2 rounded border text-sm font-mono">
                          {state.mfaSecret}
                        </code>
                      </div>
                      <div>
                        <p className="text-sm text-blue-800 mb-2">
                          3. Enter the 6-digit code from your app to verify:
                        </p>
                        <div className="flex space-x-2">
                          <input
                            type="text"
                            placeholder="000000"
                            className="w-24 px-3 py-2 border border-gray-300 rounded-md text-center font-mono"
                            maxLength={6}
                          />
                          <Button onClick={enableMFA}>
                            Verify & Enable
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Backup Codes */}
                {state.showBackupCodes && state.backupCodes.length > 0 && (
                  <div className="mt-6 p-4 border border-yellow-200 rounded-lg bg-yellow-50">
                    <h4 className="text-sm font-medium text-yellow-900 mb-3 flex items-center">
                      <Key className="h-4 w-4 mr-2" />
                      Backup Recovery Codes
                    </h4>
                    <p className="text-sm text-yellow-800 mb-3">
                      Save these backup codes in a safe place. You can use them to access your account if you lose your authenticator device.
                    </p>
                    <div className="grid grid-cols-2 gap-2 mb-4">
                      {state.backupCodes.map((code, index: any) => (
                        <code key={index} className="bg-white px-3 py-2 rounded border text-sm font-mono">
                          {code}
                        </code>
                      ))}
                    </div>
                    <div className="flex space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          const codesText = state.backupCodes.join('\n')
                          navigator.clipboard.writeText(codesText)
                        }}
                      >
                        <Download className="h-4 w-4 mr-2" />
                        Copy Codes
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setState(prev => ({ ...prev, showBackupCodes: false }))}
                      >
                        I've Saved Them
                      </Button>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  )
}

