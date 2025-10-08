'use client'

import React, { useState, useEffect } from 'react'
import { Button } from '@/components/ui/Button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card'
import { Shield, Smartphone, Key, Copy, Check, AlertCircle, Download } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import QRCode from 'qrcode'

interface MFASetupProps {
  onComplete?: () => void
  onCancel?: () => void
}

interface MFAState {
  step: 'setup' | 'verify' | 'complete'
  qrCodeUrl: string
  secret: string
  verificationCode: string
  backupCodes: string[]
  Loading: boolean
  error: string
  isVerifying: boolean
  secretCopied: boolean
}

export default function MFASetup({ onComplete, onCancel }: MFASetupProps) {
  const [state, setState] = useState<MFAState>({
    step: 'setup',
    qrCodeUrl: '',
    secret: '',
    verificationCode: '',
    backupCodes: [],
    Loading: true,
    error: '',
    isVerifying: false,
    secretCopied: false
  })

  useEffect(() => {
    initializeMFA()
  }, [])

  const initializeMFA = async () => {
    try {
      setState(prev => ({ ...prev, Loading: true, error: '' }))

      // Get current user
      const { data: { user }, error: userError } = await supabase.auth.getUser()
      if (userError || !user) {
        throw new Error('User not authenticated')
      }

      // Enroll for MFA
      const { data: enrollData, error: enrollError } = await supabase.auth.mfa.enroll({
        factorType: 'totp',
        friendlyName: 'ETLA Platform TOTP'
      })

      if (enrollError) {
        throw new Error(`MFA enrollment failed: ${enrollError.message}`)
      }

      const { id: factorId, totp } = enrollData
      if (!totp) {
        throw new Error('TOTP data not received')
      }

      // Generate QR code
      const qrCodeUrl = await QRCode.toDataURL(totp.uri)

      // Generate backup codes (simulated - in production, these would come from your backend)
      const backupCodes = Array.from({ length: 8 }, () => 
        Math.random().toString(36).substring(2, 8).toUpperCase()
      )

      setState(prev => ({
        ...prev,
        qrCodeUrl,
        secret: totp.secret,
        backupCodes,
        Loading: false,
        factorId
      }))

    } catch (err: any) {
      console.error('MFA initialization error:', err)
      setState(prev => ({
        ...prev,
        Loading: false,
        error: err.message || 'Failed to initialize MFA setup'
      }))
    }
  }

  const verifyMFA = async () => {
    if (!state.verificationCode || state.verificationCode.length !== 6) {
      setState(prev => ({ ...prev, error: 'Please enter a 6-digit verification code' }))
      return
    }

    try {
      setState(prev => ({ ...prev, isVerifying: true, error: '' }))

      // Verify the TOTP code
      const { data, error } = await supabase.auth.mfa.verify({
        factorId: (state as any).factorId,
        challengeId: (state as any).challengeId || '',
        code: state.verificationCode
      })

      if (error) {
        throw new Error(`Verification failed: ${error.message}`)
      }

      // Update user profile to indicate MFA is enabled
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        await supabase
          .from('profiles')
          .update({ 
            mfa_enabled: true,
            updated_at: new Date().toISOString()
          })
          .eq('id', user.id)
      }

      setState(prev => ({
        ...prev,
        step: 'complete',
        isVerifying: false
      }))

    } catch (err: any) {
      console.error('MFA verification error:', err)
      setState(prev => ({
        ...prev,
        isVerifying: false,
        error: err.message || 'Verification failed. Please try again.'
      }))
    }
  }

  const copySecret = async () => {
    try {
      await navigator.clipboard.writeText(state.secret)
      setState(prev => ({ ...prev, secretCopied: true }))
      setTimeout(() => {
        setState(prev => ({ ...prev, secretCopied: false }))
      }, 2000)
    } catch (err) {
      console.error('Failed to copy secret:', err)
    }
  }

  const downloadBackupCodes = () => {
    const content = `ETLA Platform - MFA Backup Codes
Generated: ${new Date().toLocaleString()}

IMPORTANT: Store these codes in a safe place. Each code can only be used once.

${state.backupCodes.map((code, index: any) => `${index + 1}. ${code}`).join('\n')}

Instructions:
- Use these codes if you lose access to your authenticator app
- Each code can only be used once
- Generate new codes if you use all of them
- Keep these codes secure and private`

    const blob = new Blob([content], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `etla-platform-backup-codes-${new Date().toISOString().split('T')[0]}.txt`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  if (state.Loading) {
    return (
      <Card className="w-full max-w-md mx-auto">
        <CardContent className="flex items-center justify-center py-8">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Setting up MFA...</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="w-full max-w-2xl mx-auto space-y-6">
      {/* Setup Step */}
      {state.step === 'setup' && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              Set Up Two-Factor Authentication
            </CardTitle>
            <CardDescription>
              Secure your account with an authenticator app
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Step 1: Download App */}
            <div className="space-y-3">
              <h3 className="font-medium flex items-center gap-2">
                <span className="bg-blue-100 text-blue-800 text-xs font-medium px-2 py-1 rounded-full">1</span>
                Download an Authenticator App
              </h3>
              <p className="text-sm text-gray-600">
                Install one of these apps on your phone:
              </p>
              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 border rounded-lg">
                  <div className="font-medium text-sm">Google Authenticator</div>
                  <div className="text-xs text-gray-500">iOS & Android</div>
                </div>
                <div className="p-3 border rounded-lg">
                  <div className="font-medium text-sm">Microsoft Authenticator</div>
                  <div className="text-xs text-gray-500">iOS & Android</div>
                </div>
              </div>
            </div>

            {/* Step 2: Scan QR Code */}
            <div className="space-y-3">
              <h3 className="font-medium flex items-center gap-2">
                <span className="bg-blue-100 text-blue-800 text-xs font-medium px-2 py-1 rounded-full">2</span>
                Scan QR Code
              </h3>
              <div className="flex flex-col items-center space-y-4">
                {state.qrCodeUrl && (
                  <div className="p-4 bg-white border rounded-lg">
                    <img 
                      src={state.qrCodeUrl} 
                      alt="MFA QR Code" 
                      className="w-48 h-48"
                    />
                  </div>
                )}
                <div className="text-center">
                  <p className="text-sm text-gray-600 mb-2">
                    Can't scan? Enter this code manually:
                  </p>
                  <div className="flex items-center gap-2 p-2 bg-gray-50 rounded border">
                    <code className="text-sm font-mono">{state.secret}</code>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={copySecret}
                      className="h-8 w-8 p-0"
                    >
                      {state.secretCopied ? (
                        <Check className="h-3 w-3 text-green-600" />
                      ) : (
                        <Copy className="h-3 w-3" />
                      )}
                    </Button>
                  </div>
                </div>
              </div>
            </div>

            {/* Step 3: Verify */}
            <div className="space-y-3">
              <h3 className="font-medium flex items-center gap-2">
                <span className="bg-blue-100 text-blue-800 text-xs font-medium px-2 py-1 rounded-full">3</span>
                Enter Verification Code
              </h3>
              <div className="space-y-3">
                <input
                  type="text"
                  placeholder="000000"
                  value={state.verificationCode}
                  onChange={(e: any) => setState(prev => ({ 
                    ...prev, 
                    verificationCode: e.target.value.replace(/\D/g, '').slice(0, 6)
                  }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-center text-lg font-mono tracking-widest"
                  maxLength={6}
                />
                <p className="text-sm text-gray-600">
                  Enter the 6-digit code from your authenticator app
                </p>
              </div>
            </div>

            {state.error && (
              <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-md">
                <AlertCircle className="h-4 w-4 text-red-500" />
                <span className="text-sm text-red-700">{state.error}</span>
              </div>
            )}

            <div className="flex gap-3">
              <Button
                onClick={verifyMFA}
                disabled={state.isVerifying || state.verificationCode.length !== 6}
                className="flex-1"
              >
                {state.isVerifying ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Verifying...
                  </>
                ) : (
                  <>
                    <Shield className="h-4 w-4 mr-2" />
                    Verify & Enable MFA
                  </>
                )}
              </Button>
              {onCancel && (
                <Button variant="outline" onClick={onCancel}>
                  Cancel
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Complete Step */}
      {state.step === 'complete' && (
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-green-600">
                <Check className="h-5 w-5" />
                MFA Successfully Enabled
              </CardTitle>
              <CardDescription>
                Your account is now protected with two-factor authentication
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                  <div className="flex items-start gap-3">
                    <Shield className="h-5 w-5 text-green-600 mt-0.5" />
                    <div>
                      <h4 className="font-medium text-green-800">Security Enhanced</h4>
                      <p className="text-sm text-green-700">
                        Your account now requires both your password and a code from your authenticator app to sign in.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Backup Codes */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Key className="h-5 w-5" />
                Backup Codes
              </CardTitle>
              <CardDescription>
                Save these codes in a safe place. Use them if you lose access to your authenticator app.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-2 p-4 bg-gray-50 border rounded-lg font-mono text-sm">
                  {state.backupCodes.map((code, index: any) => (
                    <div key={index} className="flex items-center gap-2">
                      <span className="text-gray-500">{index + 1}.</span>
                      <span>{code}</span>
                    </div>
                  ))}
                </div>
                
                <div className="flex gap-3">
                  <Button
                    onClick={downloadBackupCodes}
                    variant="outline"
                    className="flex-1"
                  >
                    <Download className="h-4 w-4 mr-2" />
                    Download Codes
                  </Button>
                </div>

                <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg">
                  <div className="flex items-start gap-2">
                    <AlertCircle className="h-4 w-4 text-amber-600 mt-0.5" />
                    <div className="text-sm text-amber-800">
                      <strong>Important:</strong> Each backup code can only be used once. 
                      Store them securely and generate new ones if you use them all.
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="flex justify-center">
            <Button onClick={onComplete} className="px-8">
              Complete Setup
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}

