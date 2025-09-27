'use client'

import dynamic from 'next/dynamic'
import { Suspense } from 'react'
import DashboardLayout from '@/components/layout/DashboardLayout'
import { Loader2 } from 'lucide-react'

// Dynamically import the ReportingCockpitClient to avoid SSR issues
const ReportingCockpitClient = dynamic(
  () => import('@/components/reporting/ReportingCockpitClient'),
  {
    ssr: false,
    loading: () => (
      <DashboardLayout>
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center">
            <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-blue-600" />
            <p className="text-gray-600">Loading reporting cockpit...</p>
          </div>
        </div>
      </DashboardLayout>
    )
  }
)

export default function ReportingPage() {
  return (
    <Suspense fallback={
      <DashboardLayout>
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center">
            <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-blue-600" />
            <p className="text-gray-600">Loading reporting cockpit...</p>
          </div>
        </div>
      </DashboardLayout>
    }>
      <ReportingCockpitClient />
    </Suspense>
  )
}
