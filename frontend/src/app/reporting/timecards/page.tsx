'use client'

import React from 'react'
import DashboardLayout from '@/components/layout/DashboardLayout'
import TimecardDailyReport from '@/components/timecard/TimecardDailyReport'

export default function TimecardsPage() {
  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Timecard Daily Summaries</h1>
            <p className="text-gray-600">
              View and manage daily timecard summaries with correction capabilities using v_timecard_daily_effective_v2
            </p>
          </div>
        </div>
        
        <TimecardDailyReport />
      </div>
    </DashboardLayout>
  )
}
