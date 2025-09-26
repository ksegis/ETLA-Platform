'use client'

import React from 'react'
import DashboardLayout from '@/components/layout/DashboardLayout'
import EnhancedEmployeeDocuments from '@/components/reporting/EnhancedEmployeeDocuments'

export default function EmployeeDocumentsPage() {
  return (
    <DashboardLayout>
      <div className="p-6">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Employee Documents</h1>
          <p className="text-gray-600">Manage and view employee documentation and records</p>
        </div>
        <EnhancedEmployeeDocuments />
      </div>
    </DashboardLayout>
  )
}
