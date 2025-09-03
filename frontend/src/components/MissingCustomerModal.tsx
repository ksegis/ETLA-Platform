'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/Button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card'
import { AlertCircle, User, Mail, Link, Plus, Loader2 } from 'lucide-react'
import { pmbok } from '@/services/pmbok_service'

interface MissingCustomerModalProps {
  isOpen: boolean
  onClose: () => void
  workRequestId: string
  workRequestTitle: string
  onCustomerFixed: () => void
}

export default function MissingCustomerModal({
  isOpen,
  onClose,
  workRequestId,
  workRequestTitle,
  onCustomerFixed
}: MissingCustomerModalProps) {
  const [step, setStep] = useState<'choose' | 'create' | 'link'>('choose')
  const [loading, setLoading] = useState(false)
  const [availableCustomers, setAvailableCustomers] = useState<Array<{ id: string; name: string; email: string }>>([])
  
  // Create new customer form
  const [newCustomerName, setNewCustomerName] = useState('')
  const [newCustomerEmail, setNewCustomerEmail] = useState('')
  
  // Link to existing customer
  const [selectedCustomerId, setSelectedCustomerId] = useState('')

  useEffect(() => {
    if (isOpen && step === 'link') {
      loadAvailableCustomers()
    }
  }, [isOpen, step])

  const loadAvailableCustomers = async () => {
    try {
      setLoading(true)
      const customers = await pmbok.getAvailableCustomers()
      setAvailableCustomers(customers)
    } catch (error) {
      console.error('Error loading customers:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleCreateCustomer = async () => {
    if (!newCustomerName.trim() || !newCustomerEmail.trim()) {
      alert('Please fill in both name and email')
      return
    }

    try {
      setLoading(true)
      
      // Create the customer
      const createResult = await pmbok.createMissingCustomer(newCustomerName.trim(), newCustomerEmail.trim())
      
      if (!createResult.success) {
        alert(`Error creating customer: ${createResult.error}`)
        return
      }

      // Link the work request to the new customer
      const linkResult = await pmbok.linkWorkRequestToCustomer(workRequestId, createResult.customerId!)
      
      if (!linkResult.success) {
        alert(`Error linking work request: ${linkResult.error}`)
        return
      }

      console.log('✅ Customer created and linked successfully')
      onCustomerFixed()
      onClose()
      
    } catch (error) {
      console.error('Error creating customer:', error)
      alert('Failed to create customer')
    } finally {
      setLoading(false)
    }
  }

  const handleLinkToExisting = async () => {
    if (!selectedCustomerId) {
      alert('Please select a customer')
      return
    }

    try {
      setLoading(true)
      
      const result = await pmbok.linkWorkRequestToCustomer(workRequestId, selectedCustomerId)
      
      if (!result.success) {
        alert(`Error linking work request: ${result.error}`)
        return
      }

      console.log('✅ Work request linked to existing customer successfully')
      onCustomerFixed()
      onClose()
      
    } catch (error) {
      console.error('Error linking to existing customer:', error)
      alert('Failed to link to existing customer')
    } finally {
      setLoading(false)
    }
  }

  const resetModal = () => {
    setStep('choose')
    setNewCustomerName('')
    setNewCustomerEmail('')
    setSelectedCustomerId('')
    setLoading(false)
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-orange-500" />
              Missing Customer Information
            </CardTitle>
            <CardDescription>
              Work request "{workRequestTitle}" is missing customer information. 
              Choose how to fix this issue.
            </CardDescription>
          </CardHeader>
          
          <CardContent className="space-y-4">
            {step === 'choose' && (
              <div className="space-y-3">
                <Button
                  onClick={() => setStep('create')}
                  className="w-full flex items-center gap-2"
                  variant="outline"
                >
                  <Plus className="h-4 w-4" />
                  Create New Customer
                </Button>
                
                <Button
                  onClick={() => setStep('link')}
                  className="w-full flex items-center gap-2"
                  variant="outline"
                >
                  <Link className="h-4 w-4" />
                  Link to Existing Customer
                </Button>
                
                <Button
                  onClick={() => { resetModal(); onClose(); }}
                  variant="ghost"
                  className="w-full"
                >
                  Cancel
                </Button>
              </div>
            )}

            {step === 'create' && (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Customer Name</label>
                  <div className="relative">
                    <User className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <input
                      type="text"
                      value={newCustomerName}
                      onChange={(e) => setNewCustomerName(e.target.value)}
                      placeholder="Enter customer name"
                      className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-1">Customer Email</label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <input
                      type="email"
                      value={newCustomerEmail}
                      onChange={(e) => setNewCustomerEmail(e.target.value)}
                      placeholder="Enter customer email"
                      className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>
                
                <div className="flex gap-2">
                  <Button
                    onClick={handleCreateCustomer}
                    disabled={loading || !newCustomerName.trim() || !newCustomerEmail.trim()}
                    className="flex-1"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Creating...
                      </>
                    ) : (
                      'Create Customer'
                    )}
                  </Button>
                  
                  <Button
                    onClick={() => setStep('choose')}
                    variant="outline"
                  >
                    Back
                  </Button>
                </div>
              </div>
            )}

            {step === 'link' && (
              <div className="space-y-4">
                {loading ? (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="h-6 w-6 animate-spin" />
                    <span className="ml-2">Loading customers...</span>
                  </div>
                ) : (
                  <>
                    <div>
                      <label className="block text-sm font-medium mb-2">Select Existing Customer</label>
                      <select
                        value={selectedCustomerId}
                        onChange={(e) => setSelectedCustomerId(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="">Choose a customer...</option>
                        {availableCustomers.map(customer => (
                          <option key={customer.id} value={customer.id}>
                            {customer.name} ({customer.email})
                          </option>
                        ))}
                      </select>
                    </div>
                    
                    {availableCustomers.length === 0 && (
                      <div className="text-center py-4 text-gray-500">
                        No existing customers found. Consider creating a new customer instead.
                      </div>
                    )}
                    
                    <div className="flex gap-2">
                      <Button
                        onClick={handleLinkToExisting}
                        disabled={loading || !selectedCustomerId}
                        className="flex-1"
                      >
                        {loading ? (
                          <>
                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                            Linking...
                          </>
                        ) : (
                          'Link Customer'
                        )}
                      </Button>
                      
                      <Button
                        onClick={() => setStep('choose')}
                        variant="outline"
                      >
                        Back
                      </Button>
                    </div>
                  </>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

