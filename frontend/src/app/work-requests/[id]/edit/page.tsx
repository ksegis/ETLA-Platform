'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft, Save, X } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'

// Next.js 15 compatible component with async params
export default function EditWorkRequestPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter()
  const [requestId, setRequestId] = useState<string>('')

  // Handle async params in Next.js 15
  useEffect(() => {
    const getParams = async () => {
      const resolvedParams = await params
      setRequestId(resolvedParams.id)
    }
    getParams()
  }, [params])

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Button 
                variant="outline" 
                onClick={() => router.push(`/work-requests/${requestId}`)}
                className="flex items-center"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Request
              </Button>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Edit Work Request</h1>
                <p className="text-gray-600 mt-1">Update your work request details. Changes will be saved and reviewed by our team.</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <Button variant="outline" onClick={() => router.push(`/work-requests/${requestId}`)}>
                <X className="w-4 h-4 mr-2" />
                Cancel
              </Button>
              <Button className="flex items-center">
                <Save className="w-4 h-4 mr-2" />
                Save Changes
              </Button>
            </div>
          </div>
        </div>

        {/* Edit Form */}
        <Card>
          <CardHeader>
            <CardTitle>Work Request Details</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center py-12">
              <h3 className="text-lg font-medium text-gray-900 mb-2">Edit Functionality Coming Soon</h3>
              <p className="text-gray-600 mb-6">
                Work request editing functionality is currently under development. 
                For now, please contact support to make changes to your request.
              </p>
              <div className="space-x-4">
                <Button 
                  variant="outline" 
                  onClick={() => router.push(`/work-requests/${requestId}`)}
                >
                  Back to Request
                </Button>
                <Button 
                  onClick={() => router.push('/work-requests')}
                >
                  View All Requests
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

