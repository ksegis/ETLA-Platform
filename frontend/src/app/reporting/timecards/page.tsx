'use client'

import React from 'react'
import DashboardLayout from '@/components/layout/DashboardLayout'
import EnhancedTimecardGrid from '@/components/reporting/EnhancedTimecardGrid'

export default function TimecardsPage() {
  return (
    <DashboardLayout>
      <div className="p-6">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Timecard Reports</h1>
          <p className="text-gray-600">View and analyze employee timecard data and hours worked</p>
        </div>
        <EnhancedTimecardGrid timecardData={[]} />
      </div>
    </DashboardLayout>
  )
}
