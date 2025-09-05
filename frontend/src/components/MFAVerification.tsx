'use client'

import React, { useState } from 'react'
import { Button } from '@/components/ui/Button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card'
import { Shield, Smartphone, Key, AlertCircle, ArrowLeft } from 'lucide-react'
import { supabase } from '@/lib/supabase'

interface MFAVerificationProps {
  onSuccess: () => void
  onBack: () => void
  userEmail: string
}

interface VerificationState {
  code: string
  isVerifying: boolean
  error: string
  useBackupCode: boolean
  backupCode: string
}

export default function MFAVerification({ onSuccess, onBack, userEmail }: MFAVerificationProps) {
  const [state, setState] = useState<VerificationState>({
    code: '',
    isVerifying: false,
    error: '',
    useBackupCode: false,
    backupCode: ''
  })

  const verifyTOTP = async () => {
    if (!state.code || state.code.length !== 6) {
      setState(prev => ({ ...prev, error: 'Please enter a 6-digit verification code' }))
      return
    }

    try {
      setState(prev => ({ ...prev, isVerifying: true, error: '' }))

      // Get the current session and MFA challenge
      const { data: { session }, error: sessionError } = await supabase.auth.getSession()
      
      if (sessionError || !session) {
        throw new Error('No active session found')
      }

      // List MFA factors for the user
      const { data: factors, error: factorsError } = await supabase.auth.mfa.listFactors()
      
      if (factorsError) {
        throw new Error(`Failed to get MFA factors: ${factorsError.message}`)
      }

      const totpFactor = factors?.totp?.[0]
      if (!totpFactor) {
        throw new Error('No TOTP factor found')
      }

      // Create MFA challenge
      const { data: challenge, error: challengeError } = await supabase.auth.mfa.challenge({
        factorId: totpFactor.id
      })

      if (challengeError) {
        throw new Error(`Failed to create challenge: ${challengeError.message}`)
      }

      // Verify the TOTP code
      const { data, error } = await supabase.auth.mfa.verify({
        factorId: totpFactor.id,
        challengeId: challenge.id,
        code: state.code
      })

      if (error) {
        throw new Error(`Verification failed: ${error.message}`)
      }

      // Success - call the success callback
      onSuccess()

    } catch (err: any) {
      console.error('MFA verification error:', err)
      setState(prev => ({
        ...prev,
        isVerifying: false,
        error: err.message || 'Verification failed. Please try again.'
      }))
    }
  }

  const verifyBackupCode = async () => {
    if (!state.backupCode || state.backupCode.length < 6) {
      setState(prev => ({ ...prev, error: 'Please enter a valid backup code' }))
      return
    }

    try {
      setState(prev => ({ ...prev, isVerifying: true, error: '' }))

      // In a real implementation, you would verify the backup code against your backend
      // For now, we'll simulate the verification
      
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 1000))

      // For demo purposes, accept any 6+ character backup code
      // In production, this would be verified against stored backup codes
      if (state.backupCode.length >= 6) {
        onSuccess()
      } else {
        throw new Error('Invalid backup code')
      }

    } catch (err: any) {
      console.error('Backup code verification error:', err)
      setState(prev => ({
        ...prev,
        isVerifying: false,
        error: err.message || 'Invalid backup code. Please try again.'
      }))
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (state.useBackupCode) {
      verifyBackupCode()
    } else {
      verifyTOTP()
    }
  }

  const toggleBackupCode = () => {
    setState(prev => ({
      ...prev,
      useBackupCode: !prev.useBackupCode,
      error: '',
      code: '',
      backupCode: ''
    }))
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Two-Factor Authentication
          </h1>
          <p className="text-gray-600">
            Enter the verification code to complete sign-in
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              {state.useBackupCode ? (
                <>
                  <Key className="h-5 w-5" />
                  Backup Code
                </>
              ) : (
                <>
                  <Shield className="h-5 w-5" />
                  Verification Code
                </>
              )}
            </CardTitle>
            <CardDescription>
              {state.useBackupCode ? (
                'Enter one of your backup codes'
              ) : (
                `Enter the 6-digit code from your authenticator app for ${userEmail}`
              )}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {!state.useBackupCode ? (
                <div className="space-y-3">
                  <div className="flex items-center justify-center mb-4">
                    <div className="p-3 bg-blue-50 rounded-full">
                      <Smartphone className="h-8 w-8 text-blue-600" />
                    </div>
                  </div>
                  <input
                    type="text"
                    placeholder="000000"
                    value={state.code}
                    onChange={(e) => setState(prev => ({ 
                      ...prev, 
                      code: e.target.value.replace(/\D/g, '').slice(0, 6),
                      error: ''
                    }))}
                    className="w-full px-3 py-3 border border-gray-300 rounded-md text-center text-xl font-mono tracking-widest"
                    maxLength={6}
                    autoComplete="one-time-code"
                    autoFocus
                  />
                  <p className="text-sm text-gray-600 text-center">
                    Open your authenticator app and enter the 6-digit code
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  <div className="flex items-center justify-center mb-4">
                    <div className="p-3 bg-amber-50 rounded-full">
                      <Key className="h-8 w-8 text-amber-600" />
                    </div>
                  </div>
                  <input
                    type="text"
                    placeholder="Enter backup code"
                    value={state.backupCode}
                    onChange={(e) => setState(prev => ({ 
                      ...prev, 
                      backupCode: e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, ''),
                      error: ''
                    }))}
                    className="w-full px-3 py-3 border border-gray-300 rounded-md text-center text-lg font-mono tracking-wider"
                    autoComplete="off"
                    autoFocus
                  />
                  <p className="text-sm text-gray-600 text-center">
                    Enter one of your 8-character backup codes
                  </p>
                </div>
              )}

              {state.error && (
                <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-md">
                  <AlertCircle className="h-4 w-4 text-red-500" />
                  <span className="text-sm text-red-700">{state.error}</span>
                </div>
              )}

              <Button
                type="submit"
                disabled={state.isVerifying || (!state.useBackupCode && state.code.length !== 6) || (state.useBackupCode && state.backupCode.length < 6)}
                className="w-full"
              >
                {state.isVerifying ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Verifying...
                  </>
                ) : (
                  <>
                    <Shield className="h-4 w-4 mr-2" />
                    Verify Code
                  </>
                )}
              </Button>

              <div className="text-center space-y-2">
                <button
                  type="button"
                  onClick={toggleBackupCode}
                  className="text-sm text-blue-600 hover:text-blue-500"
                  disabled={state.isVerifying}
                >
                  {state.useBackupCode ? (
                    'Use authenticator app instead'
                  ) : (
                    'Use backup code instead'
                  )}
                </button>
                
                <div>
                  <button
                    type="button"
                    onClick={onBack}
                    className="text-sm text-gray-600 hover:text-gray-500 flex items-center gap-1 mx-auto"
                    disabled={state.isVerifying}
                  >
                    <ArrowLeft className="h-3 w-3" />
                    Back to sign in
                  </button>
                </div>
              </div>
            </form>
          </CardContent>
        </Card>

        <div className="text-center">
          <p className="text-sm text-gray-600">
            Having trouble? Contact your administrator for help.
          </p>
        </div>
      </div>
    </div>
  )
}

