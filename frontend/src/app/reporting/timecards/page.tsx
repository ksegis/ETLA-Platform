'use client'

import React from 'react'
import DashboardLayout from '@/components/layout/DashboardLayout'
import TimecardDailyReport from '@/components/timecard/TimecardDailyReport'

export default function TimecardsPage() {
  return (
    <DashboardLayout>
      <div className="p-6">
        <TimecardDailyReport />
      </div>
    </DashboardLayout>
  )
}
