'use client'

import React, { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { X, Trash2, AlertTriangle, CheckCircle, Users, Calendar, Database } from 'lucide-react'
import { userManagement, type CleanupOptions } from "@/lib/supabase"

interface UserCleanupModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
}

interface CleanupFormOptions {
  deleteInactiveUsers: boolean
  deleteUnconfirmedUsers: boolean
  deleteExpiredInvites: boolean
  inactiveDays: number
  unconfirmedDays: number
}

interface CleanupPreview {
  inactiveUsers: number
  unconfirmedUsers: number
  expiredInvites: number
  totalToDelete: number
}

export default function UserCleanupModal({ isOpen, onClose, onSuccess }: UserCleanupModalProps) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const [step, setStep] = useState<'options' | 'preview' | 'confirm'>('options')
  const [cleanupOptions, setCleanupOptions] = useState<CleanupFormOptions>({
    deleteInactiveUsers: false,
    deleteUnconfirmedUsers: true,
    deleteExpiredInvites: true,
    inactiveDays: 90,
    unconfirmedDays: 30
  })
  const [preview, setPreview] = useState<CleanupPreview | null>(null)

  const handleOptionChange = (field: keyof CleanupFormOptions, value: boolean | number) => {
    setCleanupOptions(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const generatePreview = async () => {
    setLoading(true)
    setError('')

    try {
      // Convert form options to Supabase CleanupOptions format
      const options: CleanupOptions = {
        deleteInactiveUsers: cleanupOptions.deleteInactiveUsers,
        deleteUnconfirmedUsers: cleanupOptions.deleteUnconfirmedUsers,
        deleteExpiredInvites: cleanupOptions.deleteExpiredInvites,
        inactiveDays: cleanupOptions.inactiveDays,
        unconfirmedDays: cleanupOptions.unconfirmedDays
      }

      const response = await userManagement.previewUserCleanup(options)
      
      if (response.success && response.data) {
        setPreview(response.data)
        setStep('preview')
      } else {
        setError(response.error || 'Failed to generate cleanup preview')
      }
    } catch (err) {
      setError('An error occurred while generating the cleanup preview')
      console.error('Cleanup preview error:', err)
    } finally {
      setLoading(false)
    }
  }

  const executeCleanup = async () => {
    setLoading(true)
    setError('')

    try {
      // Convert form options to Supabase CleanupOptions format
      const options: CleanupOptions = {
        deleteInactiveUsers: cleanupOptions.deleteInactiveUsers,
        deleteUnconfirmedUsers: cleanupOptions.deleteUnconfirmedUsers,
        deleteExpiredInvites: cleanupOptions.deleteExpiredInvites,
        inactiveDays: cleanupOptions.inactiveDays,
        unconfirmedDays: cleanupOptions.unconfirmedDays
      }

      const response = await userManagement.executeUserCleanup(options)
      
      if (response.success) {
        setSuccess(true)
        setTimeout(() => {
          onSuccess()
          handleClose()
        }, 3000)
      } else {
        setError(response.error || 'Failed to execute cleanup')
      }
    } catch (err) {
      setError('An error occurred while executing the cleanup')
      console.error('Cleanup execution error:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleClose = () => {
    setError('')
    setSuccess(false)
    setStep('options')
    setPreview(null)
    setCleanupOptions({
      deleteInactiveUsers: false,
      deleteUnconfirmedUsers: true,
      deleteExpiredInvites: true,
      inactiveDays: 90,
      unconfirmedDays: 30
    })
    onClose()
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center">
                <Database className="h-5 w-5 mr-2" />
                User Cleanup Utility
              </CardTitle>
              <CardDescription>
                Clean up inactive users, unconfirmed accounts, and expired invitations
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
                  User cleanup completed successfully! The system has been cleaned up.
                </p>
              </div>
            </div>
          )}

          {!success && (
            <>
              {/* Step 1: Cleanup Options */}
              {step === 'options' && (
                <div className="space-y-6">
                  <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4">
                    <div className="flex items-start">
                      <AlertTriangle className="h-5 w-5 text-yellow-600 mr-2 mt-0.5" />
                      <div>
                        <h4 className="text-sm font-medium text-yellow-800">Warning</h4>
                        <p className="text-sm text-yellow-700 mt-1">
                          This operation will permanently delete user accounts and cannot be undone. 
                          Please review your selections carefully.
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h3 className="text-lg font-medium text-gray-900">Cleanup Options</h3>

                    {/* Inactive Users */}
                    <div className="border border-gray-200 rounded-md p-4">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center">
                          <input
                            type="checkbox"
                            id="deleteInactiveUsers"
                            checked={cleanupOptions.deleteInactiveUsers}
                            onChange={(e) => handleOptionChange('deleteInactiveUsers', e.target.checked)}
                            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                          />
                          <label htmlFor="deleteInactiveUsers" className="ml-2 text-sm font-medium text-gray-900">
                            Delete inactive users
                          </label>
                        </div>
                        <Users className="h-4 w-4 text-gray-400" />
                      </div>
                      <p className="text-sm text-gray-600 mb-3">
                        Remove users who haven't logged in for a specified period
                      </p>
                      {cleanupOptions.deleteInactiveUsers && (
                        <div className="flex items-center space-x-2">
                          <label className="text-sm text-gray-700">Inactive for more than:</label>
                          <select
                            value={cleanupOptions.inactiveDays}
                            onChange={(e) => handleOptionChange('inactiveDays', parseInt(e.target.value))}
                            className="px-2 py-1 border border-gray-300 rounded text-sm"
                          >
                            <option value={30}>30 days</option>
                            <option value={60}>60 days</option>
                            <option value={90}>90 days</option>
                            <option value={180}>180 days</option>
                            <option value={365}>1 year</option>
                          </select>
                        </div>
                      )}
                    </div>

                    {/* Unconfirmed Users */}
                    <div className="border border-gray-200 rounded-md p-4">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center">
                          <input
                            type="checkbox"
                            id="deleteUnconfirmedUsers"
                            checked={cleanupOptions.deleteUnconfirmedUsers}
                            onChange={(e) => handleOptionChange('deleteUnconfirmedUsers', e.target.checked)}
                            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                          />
                          <label htmlFor="deleteUnconfirmedUsers" className="ml-2 text-sm font-medium text-gray-900">
                            Delete unconfirmed users
                          </label>
                        </div>
                        <Calendar className="h-4 w-4 text-gray-400" />
                      </div>
                      <p className="text-sm text-gray-600 mb-3">
                        Remove users who haven't confirmed their email addresses
                      </p>
                      {cleanupOptions.deleteUnconfirmedUsers && (
                        <div className="flex items-center space-x-2">
                          <label className="text-sm text-gray-700">Created more than:</label>
                          <select
                            value={cleanupOptions.unconfirmedDays}
                            onChange={(e) => handleOptionChange('unconfirmedDays', parseInt(e.target.value))}
                            className="px-2 py-1 border border-gray-300 rounded text-sm"
                          >
                            <option value={7}>7 days</option>
                            <option value={14}>14 days</option>
                            <option value={30}>30 days</option>
                            <option value={60}>60 days</option>
                          </select>
                          <span className="text-sm text-gray-700">ago</span>
                        </div>
                      )}
                    </div>

                    {/* Expired Invites */}
                    <div className="border border-gray-200 rounded-md p-4">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center">
                          <input
                            type="checkbox"
                            id="deleteExpiredInvites"
                            checked={cleanupOptions.deleteExpiredInvites}
                            onChange={(e) => handleOptionChange('deleteExpiredInvites', e.target.checked)}
                            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                          />
                          <label htmlFor="deleteExpiredInvites" className="ml-2 text-sm font-medium text-gray-900">
                            Delete expired invitations
                          </label>
                        </div>
                        <Calendar className="h-4 w-4 text-gray-400" />
                      </div>
                      <p className="text-sm text-gray-600">
                        Remove invitation records that have expired and are no longer valid
                      </p>
                    </div>
                  </div>

                  <div className="flex justify-end space-x-3 pt-4 border-t">
                    <Button variant="outline" onClick={handleClose} disabled={loading}>
                      Cancel
                    </Button>
                    <Button 
                      onClick={generatePreview} 
                      disabled={loading || (!cleanupOptions.deleteInactiveUsers && !cleanupOptions.deleteUnconfirmedUsers && !cleanupOptions.deleteExpiredInvites)}
                    >
                      {loading ? 'Generating...' : 'Preview Cleanup'}
                    </Button>
                  </div>
                </div>
              )}

              {/* Step 2: Preview */}
              {step === 'preview' && preview && (
                <div className="space-y-6">
                  <div className="bg-blue-50 border border-blue-200 rounded-md p-4">
                    <h4 className="text-sm font-medium text-blue-800 mb-2">Cleanup Preview</h4>
                    <p className="text-sm text-blue-700">
                      Review what will be deleted before proceeding with the cleanup.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {cleanupOptions.deleteInactiveUsers && (
                      <div className="bg-gray-50 border border-gray-200 rounded-md p-4">
                        <div className="flex items-center justify-between">
                          <Users className="h-8 w-8 text-gray-600" />
                          <div className="text-right">
                            <p className="text-2xl font-bold text-gray-900">{preview.inactiveUsers}</p>
                            <p className="text-sm text-gray-600">Inactive Users</p>
                          </div>
                        </div>
                      </div>
                    )}

                    {cleanupOptions.deleteUnconfirmedUsers && (
                      <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4">
                        <div className="flex items-center justify-between">
                          <Calendar className="h-8 w-8 text-yellow-600" />
                          <div className="text-right">
                            <p className="text-2xl font-bold text-yellow-900">{preview.unconfirmedUsers}</p>
                            <p className="text-sm text-yellow-700">Unconfirmed Users</p>
                          </div>
                        </div>
                      </div>
                    )}

                    {cleanupOptions.deleteExpiredInvites && (
                      <div className="bg-red-50 border border-red-200 rounded-md p-4">
                        <div className="flex items-center justify-between">
                          <Trash2 className="h-8 w-8 text-red-600" />
                          <div className="text-right">
                            <p className="text-2xl font-bold text-red-900">{preview.expiredInvites}</p>
                            <p className="text-sm text-red-700">Expired Invites</p>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="bg-gray-900 text-white rounded-md p-4">
                    <div className="flex items-center justify-between">
                      <span className="text-lg font-medium">Total items to be deleted:</span>
                      <span className="text-2xl font-bold">{preview.totalToDelete}</span>
                    </div>
                  </div>

                  <div className="flex justify-end space-x-3 pt-4 border-t">
                    <Button variant="outline" onClick={() => setStep('options')} disabled={loading}>
                      Back
                    </Button>
                    <Button 
                      onClick={() => setStep('confirm')} 
                      disabled={loading || preview.totalToDelete === 0}
                      variant={preview.totalToDelete > 0 ? "destructive" : "outline"}
                    >
                      {preview.totalToDelete > 0 ? 'Proceed to Confirm' : 'Nothing to Clean'}
                    </Button>
                  </div>
                </div>
              )}

              {/* Step 3: Confirmation */}
              {step === 'confirm' && preview && (
                <div className="space-y-6">
                  <div className="bg-red-50 border border-red-200 rounded-md p-4">
                    <div className="flex items-start">
                      <AlertTriangle className="h-5 w-5 text-red-600 mr-2 mt-0.5" />
                      <div>
                        <h4 className="text-sm font-medium text-red-800">Final Confirmation</h4>
                        <p className="text-sm text-red-700 mt-1">
                          You are about to permanently delete <strong>{preview.totalToDelete}</strong> items from the system. 
                          This action cannot be undone.
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-white border border-gray-200 rounded-md p-4">
                    <h4 className="text-sm font-medium text-gray-900 mb-3">Summary of actions:</h4>
                    <ul className="space-y-2 text-sm text-gray-600">
                      {cleanupOptions.deleteInactiveUsers && (
                        <li>• Delete {preview.inactiveUsers} users inactive for more than {cleanupOptions.inactiveDays} days</li>
                      )}
                      {cleanupOptions.deleteUnconfirmedUsers && (
                        <li>• Delete {preview.unconfirmedUsers} unconfirmed users created more than {cleanupOptions.unconfirmedDays} days ago</li>
                      )}
                      {cleanupOptions.deleteExpiredInvites && (
                        <li>• Delete {preview.expiredInvites} expired invitation records</li>
                      )}
                    </ul>
                  </div>

                  <div className="flex justify-end space-x-3 pt-4 border-t">
                    <Button variant="outline" onClick={() => setStep('preview')} disabled={loading}>
                      Back
                    </Button>
                    <Button 
                      onClick={executeCleanup}
                      disabled={loading}
                      variant="destructive"
                    >
                      {loading ? 'Executing Cleanup...' : 'Execute Cleanup'}
                    </Button>
                  </div>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

