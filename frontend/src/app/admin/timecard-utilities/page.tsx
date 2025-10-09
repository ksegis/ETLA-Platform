'use client'

import React from 'react'
import DashboardLayout from '@/components/layout/DashboardLayout'
import TimecardRecalculationTool from '@/components/admin/TimecardRecalculationTool'

export default function TimecardUtilitiesPage() {
  return (
    <DashboardLayout>
      <div className="p-6">
        <TimecardRecalculationTool />
      </div>
    </DashboardLayout>
  )
}
