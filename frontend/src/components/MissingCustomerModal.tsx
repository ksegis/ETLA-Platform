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
  const [loading, setloading] = useState(false)
  const [availableCustomers, setAvailableCustomers] = useState<Array<{ id: string; name: string }>>([])
  
  // Create new customer form
  const [newCustomerName, setNewCustomerName] = useState('')
  const [newCustomerEmail, setNewCustomerEmail] = useState('')
  const [newCustomerPhone, setNewCustomerPhone] = useState('')
  const [newCustomerAddress, setNewCustomerAddress] = useState('')
  
  // Link to existing customer
  const [selectedCustomerId, setSelectedCustomerId] = useState('')

  useEffect(() => {
    if (isOpen && step === 'link') {
      loadAvailableCustomers()
    }
  }, [isOpen, step])

  const loadAvailableCustomers = async () => {
    try {
      setloading(true)
      const customers = await pmbok.getAvailableCustomers()
      setAvailableCustomers(customers)
    } catch (error) {
      console.error('Error loading customers:', error)
    } finally {
      setloading(false)
    }
  }

  const handleCreateCustomer = async () => {
    if (!newCustomerName.trim()) {
      alert('Customer name is required')
      return
    }

    try {
      setloading(true)
      
      // Create the customer using correct method signature
      const createResult = await pmbok.createMissingCustomer(
        newCustomerName.trim(), 
        newCustomerEmail.trim()
      )
      
      if (!createResult || !createResult.success || !createResult.customerId) {
        alert(createResult?.error || 'Failed to create customer')
        return
      }

      // Link the work request to the new customer
      const linkResult = await pmbok.linkWorkRequestToCustomer(workRequestId, createResult.customerId)
      
      if (!linkResult || !linkResult.success) {
        alert(linkResult?.error || 'Failed to link work request')
        return
      }

      console.log('✅ Customer created and linked successfully')
      onCustomerFixed()
      onClose()
      
    } catch (error) {
      console.error('Error creating customer:', error)
      alert('Failed to create customer')
    } finally {
      setloading(false)
    }
  }

  const handleLinkExistingCustomer = async () => {
    if (!selectedCustomerId) {
      alert('Please select a customer')
      return
    }

    try {
      setloading(true)
      
      const linkResult = await pmbok.linkWorkRequestToCustomer(workRequestId, selectedCustomerId)
      
      if (!linkResult || !linkResult.success) {
        alert(linkResult?.error || 'Failed to link work request')
        return
      }

      console.log('✅ Work request linked to existing customer successfully')
      onCustomerFixed()
      onClose()
      
    } catch (error) {
      console.error('Error linking customer:', error)
      alert('Failed to link customer')
    } finally {
      setloading(false)
    }
  }

  const resetForm = () => {
    setNewCustomerName('')
    setNewCustomerEmail('')
    setNewCustomerPhone('')
    setNewCustomerAddress('')
    setSelectedCustomerId('')
    setStep('choose')
  }

  const handleClose = () => {
    resetForm()
    onClose()
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <Card className="w-full max-w-md mx-4">
        <CardHeader>
          <div className="flex items-center gap-2">
            <AlertCircle className="h-5 w-5 text-amber-500" />
            <CardTitle>Missing Customer</CardTitle>
          </div>
          <CardDescription>
            Work request "{workRequestTitle}" needs a customer assigned
          </CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-4">
          {step === 'choose' && (
            <div className="space-y-3">
              <p className="text-sm text-gray-600">
                How would you like to resolve this?
              </p>
              
              <div className="space-y-2">
                <Button
                  onClick={() => setStep('create')}
                  className="w-full justify-start"
                  variant="outline"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Create New Customer
                </Button>
                
                <Button
                  onClick={() => setStep('link')}
                  className="w-full justify-start"
                  variant="outline"
                >
                  <Link className="h-4 w-4 mr-2" />
                  Link to Existing Customer
                </Button>
              </div>
              
              <div className="flex justify-end">
                <Button onClick={handleClose} variant="ghost">
                  Cancel
                </Button>
              </div>
            </div>
          )}

          {step === 'create' && (
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Customer Name *</label>
                <input
                  type="text"
                  value={newCustomerName}
                  onChange={(e: any) => setNewCustomerName(e.target.value)}
                  className="w-full px-3 py-2 border rounded-md"
                  placeholder="Enter customer name"
                />
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium">Email</label>
                <input
                  type="email"
                  value={newCustomerEmail}
                  onChange={(e: any) => setNewCustomerEmail(e.target.value)}
                  className="w-full px-3 py-2 border rounded-md"
                  placeholder="Enter email address"
                />
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium">Phone</label>
                <input
                  type="tel"
                  value={newCustomerPhone}
                  onChange={(e: any) => setNewCustomerPhone(e.target.value)}
                  className="w-full px-3 py-2 border rounded-md"
                  placeholder="Enter phone number"
                />
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium">Address</label>
                <textarea
                  value={newCustomerAddress}
                  onChange={(e: any) => setNewCustomerAddress(e.target.value)}
                  className="w-full px-3 py-2 border rounded-md"
                  placeholder="Enter address"
                  rows={2}
                />
              </div>
              
              <div className="flex justify-between">
                <Button onClick={() => setStep('choose')} variant="ghost">
                  Back
                </Button>
                <Button 
                  onClick={handleCreateCustomer} 
                  disabled={loading || !newCustomerName.trim()}
                >
                  {loading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                  Create & Link
                </Button>
              </div>
            </div>
          )}

          {step === 'link' && (
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Select Customer</label>
                {loading ? (
                  <div className="flex items-center justify-center py-4">
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    loading customers...
                  </div>
                ) : (
                  <select
                    value={selectedCustomerId}
                    onChange={(e: any) => setSelectedCustomerId(e.target.value)}
                    className="w-full px-3 py-2 border rounded-md"
                  >
                    <option value="">Choose a customer...</option>
                    {availableCustomers.map((customer: any) => (
                      <option key={customer.id} value={customer.id}>
                        {customer.name}
                      </option>
                    ))}
                  </select>
                )}
              </div>
              
              <div className="flex justify-between">
                <Button onClick={() => setStep('choose')} variant="ghost">
                  Back
                </Button>
                <Button 
                  onClick={handleLinkExistingCustomer} 
                  disabled={loading || !selectedCustomerId}
                >
                  {loading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                  Link Customer
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

