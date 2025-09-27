'use client'

import React, { useState, useEffect } from 'react'

// Force dynamic rendering to prevent prerendering issues
export const dynamic = 'force-dynamic'

export default function ReportingPage() {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return <div>Loading...</div>
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-6">
          Operations Reporting Cockpit
        </h1>
        <p className="text-gray-600 mb-8">
          Unified employee reporting and document management
        </p>
        
        <div className="bg-white rounded-lg shadow p-6">
          <p>Reporting cockpit is loading successfully!</p>
          <p>This confirms the basic page structure works.</p>
        </div>
      </div>
    </div>
  )
}
