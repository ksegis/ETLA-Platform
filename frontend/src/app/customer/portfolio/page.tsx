'use client'

import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/Input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import DashboardLayout from '@/components/layout/DashboardLayout'
import { useAuth } from '@/contexts/AuthContext'
import { useTenant } from '@/contexts/TenantContext'
import { 
  Building, 
  TrendingUp, 
  AlertTriangle, 
  DollarSign, 
  CheckCircle,
  Clock,
  Search,
  Filter,
  BarChart3
} from 'lucide-react'
import { InfoTooltip } from '@/components/ui/InfoTooltip'
import { TOOLTIP_CONTENT } from '@/lib/tooltips'

interface PortfolioSummary {
  total_projects: number
  active_projects: number
  at_risk_projects: number
  total_budget: number
  budget_spent: number
  avg_completion: number
  sub_clients: SubClientSummary[]
}

interface SubClientSummary {
  tenant_id: string
  tenant_name: string
  project_count: number
  active_count: number
  at_risk_count: number
  total_budget: number
  avg_completion: number
  projects: ProjectSummary[]
}

interface ProjectSummary {
  id: string
  project_name: string
  project_code: string
  health_status: 'green' | 'yellow' | 'red'
  completion_percentage: number
  budget: number
  budget_spent: number
  start_date: string
  end_date: string
  next_milestone: string
  at_risk: boolean
}

export default function CustomerPortfolioPage() {
  const { user } = useAuth()
  const { currentTenant } = useTenant()
  const [loading, setLoading] = useState(true)
  const [portfolio, setPortfolio] = useState<PortfolioSummary | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [subClientFilter, setSubClientFilter] = useState<string>('all')

  useEffect(() => {
    if (currentTenant?.id) {
      fetchPortfolioData()
    }
  }, [currentTenant?.id])

  const fetchPortfolioData = async () => {
    setLoading(true)
    try {
      const response = await fetch(`/api/customer/portfolio?tenant_id=${currentTenant?.id}`)
      if (!response.ok) throw new Error('Failed to fetch portfolio data')
      
      const data = await response.json()
      setPortfolio(data)
    } catch (error) {
      console.error('Error fetching portfolio:', error)
    } finally {
      setLoading(false)
    }
  }

  const getHealthColor = (status: string) => {
    switch (status) {
      case 'green':
        return 'bg-green-100 text-green-800 border-green-300'
      case 'yellow':
        return 'bg-yellow-100 text-yellow-800 border-yellow-300'
      case 'red':
        return 'bg-red-100 text-red-800 border-red-300'
      default:
        return 'bg-gray-100 text-gray-800 border-gray-300'
    }
  }

  const getHealthIcon = (status: string) => {
    switch (status) {
      case 'green':
        return <CheckCircle className="h-4 w-4 text-green-600" />
      case 'yellow':
        return <Clock className="h-4 w-4 text-yellow-600" />
      case 'red':
        return <AlertTriangle className="h-4 w-4 text-red-600" />
      default:
        return <Clock className="h-4 w-4 text-gray-600" />
    }
  }

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading portfolio data...</p>
          </div>
        </div>
      </DashboardLayout>
    )
  }

  if (!portfolio) {
    return (
      <DashboardLayout>
        <div className="text-center py-12">
          <Building className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No Portfolio Data</h3>
          <p className="text-gray-600">Unable to load portfolio information.</p>
        </div>
      </DashboardLayout>
    )
  }

  const filteredSubClients = portfolio.sub_clients.filter((subClient) => {
    if (subClientFilter !== 'all' && subClient.tenant_id !== subClientFilter) return false
    
    const matchesSearch = !searchTerm || 
      subClient.tenant_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      subClient.projects.some(p => 
        p.project_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.project_code?.toLowerCase().includes(searchTerm.toLowerCase())
      )
    
    return matchesSearch
  })

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
            Portfolio Overview
            <InfoTooltip content={TOOLTIP_CONTENT.customer?.portfolio || 'View all projects across your organization'} />
          </h1>
          <p className="text-gray-600 mt-1">
            Consolidated view of all projects across your sub-clients
          </p>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Projects</p>
                  <p className="text-2xl font-bold text-gray-900">{portfolio.total_projects}</p>
                </div>
                <Building className="h-8 w-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Active Projects</p>
                  <p className="text-2xl font-bold text-gray-900">{portfolio.active_projects}</p>
                </div>
                <TrendingUp className="h-8 w-8 text-green-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">At Risk</p>
                  <p className="text-2xl font-bold text-gray-900">{portfolio.at_risk_projects}</p>
                </div>
                <AlertTriangle className="h-8 w-8 text-red-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Budget</p>
                  <p className="text-2xl font-bold text-gray-900">
                    ${(portfolio.total_budget / 1000000).toFixed(1)}M
                  </p>
                </div>
                <DollarSign className="h-8 w-8 text-purple-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Budget Spent</p>
                  <p className="text-2xl font-bold text-gray-900">
                    ${(portfolio.budget_spent / 1000000).toFixed(1)}M
                  </p>
                </div>
                <BarChart3 className="h-8 w-8 text-orange-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Avg Progress</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {portfolio.avg_completion.toFixed(0)}%
                  </p>
                </div>
                <CheckCircle className="h-8 w-8 text-teal-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card>
          <CardContent className="p-4">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input
                    placeholder="Search projects or sub-clients..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              <div className="w-full md:w-48">
                <Select value={subClientFilter} onValueChange={setSubClientFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder="All Sub-Clients" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Sub-Clients</SelectItem>
                    {portfolio.sub_clients.map((sc) => (
                      <SelectItem key={sc.tenant_id} value={sc.tenant_id}>
                        {sc.tenant_name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Sub-Client Projects */}
        <div className="space-y-6">
          {filteredSubClients.map((subClient) => (
            <Card key={subClient.tenant_id}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <Building className="h-5 w-5" />
                    {subClient.tenant_name}
                  </CardTitle>
                  <div className="flex gap-4 text-sm text-gray-600">
                    <span>{subClient.project_count} projects</span>
                    <span>{subClient.active_count} active</span>
                    {subClient.at_risk_count > 0 && (
                      <span className="text-red-600 font-medium">
                        {subClient.at_risk_count} at risk
                      </span>
                    )}
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {subClient.projects.map((project) => (
                    <div
                      key={project.id}
                      className="border rounded-lg p-4 hover:bg-gray-50 transition-colors"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            {getHealthIcon(project.health_status)}
                            <h4 className="font-medium">{project.project_name}</h4>
                            {project.project_code && (
                              <Badge variant="outline" className="text-xs">
                                {project.project_code}
                              </Badge>
                            )}
                            {project.at_risk && (
                              <Badge variant="destructive" className="text-xs">
                                At Risk
                              </Badge>
                            )}
                          </div>
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                            <div>
                              <span className="text-gray-600">Progress:</span>{' '}
                              <span className="font-medium">{project.completion_percentage}%</span>
                            </div>
                            <div>
                              <span className="text-gray-600">Budget:</span>{' '}
                              <span className="font-medium">${(project.budget / 1000).toFixed(0)}K</span>
                            </div>
                            <div>
                              <span className="text-gray-600">Spent:</span>{' '}
                              <span className="font-medium">${(project.budget_spent / 1000).toFixed(0)}K</span>
                            </div>
                            <div>
                              <span className="text-gray-600">End Date:</span>{' '}
                              <span className="font-medium">
                                {new Date(project.end_date).toLocaleDateString()}
                              </span>
                            </div>
                          </div>
                          {project.next_milestone && (
                            <div className="mt-2 text-sm text-gray-600">
                              <strong>Next Milestone:</strong> {project.next_milestone}
                            </div>
                          )}
                        </div>
                        <div className={`px-3 py-1 rounded-full text-xs font-medium border ${getHealthColor(project.health_status)}`}>
                          {project.health_status.toUpperCase()}
                        </div>
                      </div>
                      {/* Progress Bar */}
                      <div className="mt-3">
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div
                            className={`h-2 rounded-full ${
                              project.completion_percentage >= 75
                                ? 'bg-green-600'
                                : project.completion_percentage >= 50
                                ? 'bg-yellow-600'
                                : 'bg-blue-600'
                            }`}
                            style={{ width: `${project.completion_percentage}%` }}
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {filteredSubClients.length === 0 && (
          <Card>
            <CardContent className="p-12 text-center">
              <Filter className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No Projects Found</h3>
              <p className="text-gray-600">Try adjusting your search or filters.</p>
            </CardContent>
          </Card>
        )}
      </div>
    </DashboardLayout>
  )
}
