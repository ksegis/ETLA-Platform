'use client'

import React, { useState, useEffect } from 'react'

export default function ReportingDashboard() {
  const [loading, setLoading] = useState(true)
  const [user, setUser] = useState<any>(null)

  useEffect(() => {
    // Simple timeout to simulate loading
    const timer = setTimeout(() => {
      setUser({ email: 'test@example.com' })
      setLoading(false)
    }, 1000)

    return () => clearTimeout(timer)
  }, [])

  if (loading) {
    return (
      <div style={{ padding: '20px', textAlign: 'center' }}>
        <p>Loading...</p>
      </div>
    )
  }

  return (
    <div style={{ padding: '20px' }}>
      <h1>Reporting Dashboard</h1>
      <p>User: {user?.email}</p>
      
      <div style={{ marginTop: '20px' }}>
        <h2>Test Report</h2>
        <button 
          onClick={() => alert('Test button clicked')}
          style={{ 
            padding: '10px 20px', 
            backgroundColor: '#007bff', 
            color: 'white', 
            border: 'none', 
            borderRadius: '4px',
            cursor: 'pointer'
          }}
        >
          Generate Test Report
        </button>
      </div>
    </div>
  )
}

