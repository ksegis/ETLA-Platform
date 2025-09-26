'use client'

import React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'

export default function RBACTestPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto py-8">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            RBAC Testing Dashboard
          </h1>
          <p className="text-gray-600">
            Role-Based Access Control testing interface
          </p>
        </div>

        <Card className="max-w-2xl mx-auto">
          <CardHeader>
            <CardTitle>RBAC Test Panel</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center py-8">
              <p className="text-gray-600 mb-4">
                RBAC testing functionality is temporarily disabled for build stability.
              </p>
              <p className="text-sm text-gray-500">
                This page will be restored with full testing capabilities in a future update.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
