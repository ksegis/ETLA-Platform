'use client'

import React, { useState, useEffect } from 'react'
import DashboardLayout from '@/components/layout/DashboardLayout'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card'
import { HardDrive, TrendingUp, AlertTriangle, Download, Search, Filter } from 'lucide-react'

interface TenantStorage {
  id: string
  name: string
  totalStorage: number // in GB
  usedStorage: number // in GB
  fileCount: number
  lastUpdated: Date
  plan: 'free' | 'basic' | 'professional' | 'enterprise'
  storageLimit: number // in GB
  trend: 'increasing' | 'decreasing' | 'stable'
}

export default function TenantStorageDashboard() {
  const [tenants, setTenants] = useState<TenantStorage[]>([
    {
      id: '1',
      name: 'Acme Corporation',
      totalStorage: 250,
      usedStorage: 187.5,
      fileCount: 12450,
      lastUpdated: new Date(),
      plan: 'enterprise',
      storageLimit: 500,
      trend: 'increasing',
    },
    {
      id: '2',
      name: 'TechStart Inc',
      totalStorage: 100,
      usedStorage: 78.3,
      fileCount: 5230,
      lastUpdated: new Date(),
      plan: 'professional',
      storageLimit: 100,
      trend: 'stable',
    },
    {
      id: '3',
      name: 'Small Business LLC',
      totalStorage: 25,
      usedStorage: 23.8,
      fileCount: 1890,
      lastUpdated: new Date(),
      plan: 'basic',
      storageLimit: 25,
      trend: 'increasing',
    },
    {
      id: '4',
      name: 'Global Enterprises',
      totalStorage: 500,
      usedStorage: 342.7,
      fileCount: 28900,
      lastUpdated: new Date(),
      plan: 'enterprise',
      storageLimit: 1000,
      trend: 'increasing',
    },
    {
      id: '5',
      name: 'Startup Ventures',
      totalStorage: 50,
      usedStorage: 12.4,
      fileCount: 890,
      lastUpdated: new Date(),
      plan: 'professional',
      storageLimit: 100,
      trend: 'stable',
    },
    {
      id: '6',
      name: 'MidSize Corp',
      totalStorage: 150,
      usedStorage: 145.2,
      fileCount: 8760,
      lastUpdated: new Date(),
      plan: 'professional',
      storageLimit: 150,
      trend: 'increasing',
    },
  ])

  const [searchQuery, setSearchQuery] = useState('')
  const [filterPlan, setFilterPlan] = useState<string>('all')
  const [sortBy, setSortBy] = useState<'name' | 'usage' | 'files'>('usage')

  // Calculate totals
  const totalStorage = tenants.reduce((sum, t) => sum + t.usedStorage, 0)
  const totalFiles = tenants.reduce((sum, t) => sum + t.fileCount, 0)
  const avgUsage = tenants.reduce((sum, t) => sum + (t.usedStorage / t.storageLimit * 100), 0) / tenants.length
  const tenantsNearLimit = tenants.filter(t => (t.usedStorage / t.storageLimit) > 0.9).length

  // Filter and sort
  const filteredTenants = tenants
    .filter(t => {
      const matchesSearch = t.name.toLowerCase().includes(searchQuery.toLowerCase())
      const matchesPlan = filterPlan === 'all' || t.plan === filterPlan
      return matchesSearch && matchesPlan
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'name':
          return a.name.localeCompare(b.name)
        case 'usage':
          return (b.usedStorage / b.storageLimit) - (a.usedStorage / a.storageLimit)
        case 'files':
          return b.fileCount - a.fileCount
        default:
          return 0
      }
    })

  const getUsagePercentage = (tenant: TenantStorage) => {
    return (tenant.usedStorage / tenant.storageLimit) * 100
  }

  const getUsageStatus = (percentage: number) => {
    if (percentage >= 90) return 'critical'
    if (percentage >= 75) return 'warning'
    return 'good'
  }

  const getPlanBadge = (plan: TenantStorage['plan']) => {
    const styles = {
      free: 'bg-gray-100 text-gray-800',
      basic: 'bg-blue-100 text-blue-800',
      professional: 'bg-purple-100 text-purple-800',
      enterprise: 'bg-green-100 text-green-800',
    }
    return (
      <span className={`px-2 py-1 text-xs font-medium rounded-full ${styles[plan]}`}>
        {plan.charAt(0).toUpperCase() + plan.slice(1)}
      </span>
    )
  }

  const formatBytes = (gb: number) => {
    return `${gb.toFixed(1)} GB`
  }

  const exportToCSV = () => {
    const headers = ['Tenant Name', 'Plan', 'Used Storage (GB)', 'Storage Limit (GB)', 'Usage %', 'File Count', 'Trend']
    const rows = tenants.map(t => [
      t.name,
      t.plan,
      t.usedStorage.toFixed(2),
      t.storageLimit,
      ((t.usedStorage / t.storageLimit) * 100).toFixed(1),
      t.fileCount,
      t.trend,
    ])
    
    const csv = [headers, ...rows].map(row => row.join(',')).join('\n')
    const blob = new Blob([csv], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `tenant-storage-${new Date().toISOString().split('T')[0]}.csv`
    a.click()
  }

  return (
    <DashboardLayout>
      <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Tenant Storage Monitoring</h1>
          <p className="text-gray-600 mt-2">Monitor storage usage and limits across all tenants</p>
        </div>
        <button
          onClick={exportToCSV}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
        >
          <Download className="h-4 w-4" />
          Export CSV
        </button>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Storage Used</CardTitle>
            <HardDrive className="h-4 w-4 text-gray-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatBytes(totalStorage)}</div>
            <p className="text-xs text-gray-500 mt-1">Across all tenants</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Files</CardTitle>
            <HardDrive className="h-4 w-4 text-gray-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalFiles.toLocaleString()}</div>
            <p className="text-xs text-gray-500 mt-1">Files stored</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Usage</CardTitle>
            <TrendingUp className="h-4 w-4 text-gray-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{avgUsage.toFixed(1)}%</div>
            <p className="text-xs text-gray-500 mt-1">Average across tenants</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Near Limit</CardTitle>
            <AlertTriangle className="h-4 w-4 text-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">{tenantsNearLimit}</div>
            <p className="text-xs text-gray-500 mt-1">Tenants above 90%</p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row gap-4">
            {/* Search */}
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search tenants..."
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Plan Filter */}
            <div className="w-full md:w-48">
              <select
                value={filterPlan}
                onChange={(e) => setFilterPlan(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">All Plans</option>
                <option value="free">Free</option>
                <option value="basic">Basic</option>
                <option value="professional">Professional</option>
                <option value="enterprise">Enterprise</option>
              </select>
            </div>

            {/* Sort */}
            <div className="w-full md:w-48">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="usage">Sort by Usage</option>
                <option value="name">Sort by Name</option>
                <option value="files">Sort by Files</option>
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tenant List */}
      <Card>
        <CardHeader>
          <CardTitle>Tenant Storage Details</CardTitle>
          <CardDescription>
            Showing {filteredTenants.length} of {tenants.length} tenants
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {filteredTenants.map(tenant => {
              const usagePercentage = getUsagePercentage(tenant)
              const status = getUsageStatus(usagePercentage)

              return (
                <div
                  key={tenant.id}
                  className="p-4 border border-gray-200 rounded-lg hover:shadow-md transition-shadow"
                >
                  {/* Tenant Header */}
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <HardDrive className={`h-5 w-5 ${
                        status === 'critical' ? 'text-red-500' :
                        status === 'warning' ? 'text-yellow-500' :
                        'text-green-500'
                      }`} />
                      <div>
                        <h3 className="font-semibold text-gray-900">{tenant.name}</h3>
                        <p className="text-sm text-gray-500">
                          Last updated: {tenant.lastUpdated.toLocaleString()}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {getPlanBadge(tenant.plan)}
                      {status === 'critical' && (
                        <span className="px-2 py-1 text-xs font-medium rounded-full bg-red-100 text-red-800">
                          Near Limit
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Progress Bar */}
                  <div className="mb-3">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm font-medium text-gray-700">Storage Usage</span>
                      <span className={`text-sm font-medium ${
                        status === 'critical' ? 'text-red-600' :
                        status === 'warning' ? 'text-yellow-600' :
                        'text-green-600'
                      }`}>
                        {usagePercentage.toFixed(1)}%
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-3">
                      <div
                        className={`h-3 rounded-full transition-all duration-500 ${
                          status === 'critical' ? 'bg-red-500' :
                          status === 'warning' ? 'bg-yellow-500' :
                          'bg-green-500'
                        }`}
                        style={{ width: `${Math.min(usagePercentage, 100)}%` }}
                      />
                    </div>
                  </div>

                  {/* Storage Stats */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <div>
                      <p className="text-gray-500">Used</p>
                      <p className="font-semibold text-gray-900">{formatBytes(tenant.usedStorage)}</p>
                    </div>
                    <div>
                      <p className="text-gray-500">Limit</p>
                      <p className="font-semibold text-gray-900">{formatBytes(tenant.storageLimit)}</p>
                    </div>
                    <div>
                      <p className="text-gray-500">Available</p>
                      <p className="font-semibold text-gray-900">
                        {formatBytes(tenant.storageLimit - tenant.usedStorage)}
                      </p>
                    </div>
                    <div>
                      <p className="text-gray-500">Files</p>
                      <p className="font-semibold text-gray-900">{tenant.fileCount.toLocaleString()}</p>
                    </div>
                  </div>

                  {/* Warning Message */}
                  {status === 'critical' && (
                    <div className="mt-3 p-2 bg-red-50 border border-red-200 rounded text-sm text-red-800 flex items-center gap-2">
                      <AlertTriangle className="h-4 w-4" />
                      <span>Storage usage is above 90%. Consider upgrading plan or cleaning up files.</span>
                    </div>
                  )}
                  {status === 'warning' && (
                    <div className="mt-3 p-2 bg-yellow-50 border border-yellow-200 rounded text-sm text-yellow-800 flex items-center gap-2">
                      <AlertTriangle className="h-4 w-4" />
                      <span>Storage usage is above 75%. Monitor closely to avoid hitting limit.</span>
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </CardContent>
      </Card>
      </div>
    </DashboardLayout>
  )
}
