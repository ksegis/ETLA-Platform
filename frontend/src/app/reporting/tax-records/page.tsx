'use client'

export const dynamic = 'force-dynamic';
export const revalidate = 0;
export const fetchCache = 'force-no-store';

import React from 'react'
import DashboardLayout from '@/components/layout/DashboardLayout'
import EnhancedTaxRecordsWithLocalTax from '@/components/reporting/EnhancedTaxRecordsWithLocalTax'

export default function TaxRecordsPage() {
  return (
    <DashboardLayout>
      <div className="p-6">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Tax Records</h1>
          <p className="text-gray-600">View and manage employee tax records and withholdings</p>
        </div>
        <EnhancedTaxRecordsWithLocalTax taxRecords={[]} />
      </div>
    </DashboardLayout>
  )
}
