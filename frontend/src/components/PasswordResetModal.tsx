'use client'

import React, { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { X, Key, Mail, AlertTriangle, CheckCircle } from 'lucide-react'
import { pmbok } from '@/services/pmbok_service'

interface User {
  id: string
  email: string
  full_name: string
}

interface PasswordResetModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
  user: User
}

export default function PasswordResetModal({ isOpen, onClose, onSuccess, user }: PasswordResetModalProps) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const [resetMethod, setResetMethod] = useState<'email' | 'direct'>('email')
  const [newPassword, setNewPassword] = useState('')

  const generatePassword = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*'
    let password = ''
    for (let i = 0; i < 12; i++) {
      password += chars.charAt(Math.floor(Math.random() * chars.length))
    }
    setNewPassword(password)
  }

  const handleEmailReset = async () => {
    setLoading(true)
    setError('')
    setSuccess(false)

    try {
      const response = await pmbok.sendPasswordResetEmail(user.id)
      if (response.success) {
        setSuccess(true)
        setTimeout(() => {
          onSuccess()
          onClose()
        }, 2000)
      } else {
        setError(response.error || 'Failed to send password reset email')
      }
    } catch (err) {
      setError('An error occurred while sending the password reset email')
      console.error('Password reset email error:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleDirectReset = async () => {
    if (!newPassword) {
      setError('Please enter a new password')
      return
    }

    setLoading(true)
    setError('')
    setSuccess(false)

    try {
      const response = await pmbok.resetUserPassword(user.id, newPassword)
      if (response.success) {
        setSuccess(true)
        setTimeout(() => {
          onSuccess()
          onClose()
        }, 2000)
      } else {
        setError(response.error || 'Failed to reset password')
      }
    } catch (err) {
      setError('An error occurred while resetting the password')
      console.error('Direct password reset error:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleClose = () => {
    setError('')
    setSuccess(false)
    setNewPassword('')
    setResetMethod('email')
    onClose()
  }

  if (!isOpen || !user) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center">
                <Key className="h-5 w-5 mr-2" />
                Reset Password
              </CardTitle>
              <CardDescription>
                Reset password for {user.full_name}
              </CardDescription>
            </div>
            <Button variant="outline" size="sm" onClick={handleClose}>
              <X className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>

        <CardContent className="space-y-6">
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-md p-3">
              <div className="flex items-center">
                <AlertTriangle className="h-4 w-4 text-red-600 mr-2" />
                <p className="text-sm text-red-600">{error}</p>
              </div>
            </div>
          )}

          {success && (
            <div className="bg-green-50 border border-green-200 rounded-md p-3">
              <div className="flex items-center">
                <CheckCircle className="h-4 w-4 text-green-600 mr-2" />
                <p className="text-sm text-green-600">
                  {resetMethod === 'email' 
                    ? 'Password reset email sent successfully!'
                    : 'Password reset successfully!'
                  }
                </p>
              </div>
            </div>
          )}

          {!success && (
            <>
              {/* User Info */}
              <div className="bg-gray-50 border border-gray-200 rounded-md p-3">
                <div className="flex items-center">
                  <Mail className="h-4 w-4 text-gray-600 mr-2" />
                  <div>
                    <p className="text-sm font-medium text-gray-900">{user.full_name}</p>
                    <p className="text-sm text-gray-600">{user.email}</p>
                  </div>
                </div>
              </div>

              {/* Reset Method Selection */}
              <div className="space-y-4">
                <h3 className="text-sm font-medium text-gray-900">Reset Method</h3>
                
                <div className="space-y-3">
                  <div className="flex items-center">
                    <input
                      type="radio"
                      id="email_reset"
                      name="reset_method"
                      value="email"
                      checked={resetMethod === 'email'}
                      onChange={(e) => setResetMethod(e.target.value as 'email')}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                    />
                    <label htmlFor="email_reset" className="ml-2 text-sm text-gray-700">
                      Send reset email to user
                    </label>
                  </div>
                  <p className="text-xs text-gray-500 ml-6">
                    User will receive an email with instructions to reset their password
                  </p>

                  <div className="flex items-center">
                    <input
                      type="radio"
                      id="direct_reset"
                      name="reset_method"
                      value="direct"
                      checked={resetMethod === 'direct'}
                      onChange={(e) => setResetMethod(e.target.value as 'direct')}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                    />
                    <label htmlFor="direct_reset" className="ml-2 text-sm text-gray-700">
                      Set new password directly
                    </label>
                  </div>
                  <p className="text-xs text-gray-500 ml-6">
                    Set a temporary password that the user must change on next login
                  </p>
                </div>
              </div>

              {/* Direct Password Reset */}
              {resetMethod === 'direct' && (
                <div className="space-y-3">
                  <label className="block text-sm font-medium text-gray-700">
                    New Temporary Password
                  </label>
                  <div className="flex space-x-2">
                    <input
                      type="text"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Enter new password"
                    />
                    <Button type="button" onClick={generatePassword} variant="outline" size="sm">
                      Generate
                    </Button>
                  </div>
                  <p className="text-xs text-gray-500">
                    User will be required to change this password on their next login
                  </p>
                </div>
              )}

              {/* Actions */}
              <div className="flex justify-end space-x-3 pt-4 border-t">
                <Button variant="outline" onClick={handleClose} disabled={loading}>
                  Cancel
                </Button>
                <Button 
                  onClick={resetMethod === 'email' ? handleEmailReset : handleDirectReset}
                  disabled={loading || (resetMethod === 'direct' && !newPassword)}
                >
                  {loading ? 'Processing...' : resetMethod === 'email' ? 'Send Reset Email' : 'Reset Password'}
                </Button>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

