'use client'

import { useState, useEffect } from 'react'
import { 
  Building2, 
  Users, 
  TrendingUp, 
  Clock, 
  DollarSign,
  AlertCircle,
  CheckCircle,
  Calendar,
  Search,
  Filter,
  MoreHorizontal,
  Eye,
  Settings,
  BarChart3
} from 'lucide-react'
import { Button } from '@/components/ui/Button'
import DashboardLayout from '@/components/layout/DashboardLayout'
import { supabase, Tenant } from '@/lib/supabase'
import { useTenant } from '@/contexts/TenantContext'

interface ClientStats {
  id: string
  company_name: string
  industry: string
  status: string
  subscription_plan: string
  active_projects: number
  total_projects: number
  total_value: number
  last_activity: string
  satisfaction_score: number
  on_time_rate: number
}

interface GlobalStats {
  totalClients: number
  activeProjects: number
  totalRevenue: number
  teamUtilization: number
  avgSatisfaction: number
  onTimeDelivery: number
}

export default function HostAdminDashboard() {
  const { availableTenants, switchTenant } = useTenant()
  const [clients, setClients] = useState<ClientStats[]>([])
  const [globalStats, setGlobalStats] = useState<GlobalStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [industryFilter, setIndustryFilter] = useState('all')

  useEffect(() => {
    fetchClientStats()
    fetchGlobalStats()
  }, [])

  const fetchClientStats = async () => {
    try {
      // Use Supabase view for client dashboard data
      const { data, error } = await supabase
        .from('client_dashboard_data')
        .select('*')
        .order('company_name')

      if (error) throw error

      // Transform data to match interface
      const clientStats = data?.map(client => ({
        id: client.tenant_id,
        company_name: client.company_name,
        industry: client.industry || 'Unknown',
        status: client.status || 'active',
        subscription_plan: client.subscription_plan || 'professional',
        active_projects: client.active_projects || 0,
        total_projects: client.total_projects || 0,
        total_value: client.total_value || 0,
        last_activity: client.last_activity || new Date().toISOString(),
        satisfaction_score: client.avg_satisfaction || 0,
        on_time_rate: client.on_time_rate || 0
      })) || []

      setClients(clientStats)
    } catch (error) {
      console.error('Error fetching client stats:', error)
    }
  }

  const fetchGlobalStats = async () => {
    try {
      // Fetch global analytics
      const { data: analytics, error } = await supabase
        .from('global_analytics')
        .select('*')
        .order('calculation_date', { ascending: false })
        .limit(1)
        .single()

      if (error) throw error

      if (analytics) {
        setGlobalStats({
          totalClients: analytics.total_clients || 0,
          activeProjects: analytics.total_active_projects || 0,
          totalRevenue: analytics.total_revenue || 0,
          teamUtilization: analytics.average_team_utilization || 0,
          avgSatisfaction: analytics.global_satisfaction_score || 0,
          onTimeDelivery: analytics.global_on_time_rate || 0
        })
      }
    } catch (error) {
      console.error('Error fetching global stats:', error)
      // Set default values if no data
      setGlobalStats({
        totalClients: availableTenants.length,
        activeProjects: 0,
        totalRevenue: 0,
        teamUtilization: 0,
        avgSatisfaction: 0,
        onTimeDelivery: 0
      })
    } finally {
      setLoading(false)
    }
  }

  const filteredClients = clients.filter(client => {
    const matchesSearch = client.company_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         client.industry.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = statusFilter === 'all' || client.status === statusFilter
    const matchesIndustry = industryFilter === 'all' || client.industry === industryFilter
    
    return matchesSearch && matchesStatus && matchesIndustry
  })

  const handleViewClient = (clientId: string) => {
    window.location.href = `/admin/clients/${clientId}/dashboard`
  }

  const handleManageClient = (clientId: string) => {
    window.location.href = `/admin/clients/${clientId}/manage`
  }

  const handleSwitchToClient = (clientId: string) => {
    switchTenant(clientId)
    const client = clients.find(c => c.id === clientId)
    if (client) {
      alert(`Switching to ${client.company_name} workspace...`)
      window.location.href = `/client/dashboard`
    }
  }

  const getUniqueIndustries = () => {
    return Array.from(new Set(clients.map(c => c.industry)))
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount)
  }

  const statusColors = {
    active: 'bg-green-100 text-green-800',
    trial: 'bg-blue-100 text-blue-800',
    suspended: 'bg-red-100 text-red-800'
  }

  const planColors = {
    'enterprise': 'bg-purple-100 text-purple-800',
    'professional': 'bg-blue-100 text-blue-800',
    'trial': 'bg-gray-100 text-gray-800'
  }

  if (loading) {
    return (
      <DashboardLayout>
        <div className="p-6">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/4 mb-4"></div>
            <div className="grid grid-cols-6 gap-4 mb-6">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="h-24 bg-gray-200 rounded"></div>
              ))}
            </div>
          </div>
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout>
      <div className="p-6">
        {/* Header */}
        <div className="mb-8">
          <div className="flex justify-between items-center mb-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">ETLA Platform - Host Dashboard</h1>
              <p className="text-gray-600">Global overview and client management</p>
            </div>
            <div className="flex gap-2">
              <Button 
                onClick={() => window.location.href = '/admin/clients/new'}
                className="bg-blue-600 hover:bg-blue-700"
              >
                <Building2 className="h-4 w-4 mr-2" />
                Add Client
              </Button>
              <Button 
                onClick={() => window.location.href = '/admin/analytics'}
                variant="outline"
              >
                <BarChart3 className="h-4 w-4 mr-2" />
                Global Analytics
              </Button>
            </div>
          </div>

          {/* Global Stats Cards */}
          {globalStats && (
            <div className="grid grid-cols-1 md:grid-cols-6 gap-4 mb-6">
              <div className="bg-white p-4 rounded-lg border border-gray-200">
                <div className="flex items-center">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <Building2 className="h-5 w-5 text-blue-600" />
                  </div>
                  <div className="ml-3">
                    <p className="text-sm font-medium text-gray-600">Total Clients</p>
                    <p className="text-2xl font-bold text-gray-900">{globalStats.totalClients}</p>
                  </div>
                </div>
              </div>
              
              <div className="bg-white p-4 rounded-lg border border-gray-200">
                <div className="flex items-center">
                  <div className="p-2 bg-green-100 rounded-lg">
                    <Clock className="h-5 w-5 text-green-600" />
                  </div>
                  <div className="ml-3">
                    <p className="text-sm font-medium text-gray-600">Active Projects</p>
                    <p className="text-2xl font-bold text-gray-900">{globalStats.activeProjects}</p>
                  </div>
                </div>
              </div>
              
              <div className="bg-white p-4 rounded-lg border border-gray-200">
                <div className="flex items-center">
                  <div className="p-2 bg-purple-100 rounded-lg">
                    <DollarSign className="h-5 w-5 text-purple-600" />
                  </div>
                  <div className="ml-3">
                    <p className="text-sm font-medium text-gray-600">Total Revenue</p>
                    <p className="text-2xl font-bold text-gray-900">{formatCurrency(globalStats.totalRevenue)}</p>
                  </div>
                </div>
              </div>
              
              <div className="bg-white p-4 rounded-lg border border-gray-200">
                <div className="flex items-center">
                  <div className="p-2 bg-orange-100 rounded-lg">
                    <Users className="h-5 w-5 text-orange-600" />
                  </div>
                  <div className="ml-3">
                    <p className="text-sm font-medium text-gray-600">Team Utilization</p>
                    <p className="text-2xl font-bold text-gray-900">{globalStats.teamUtilization}%</p>
                  </div>
                </div>
              </div>
              
              <div className="bg-white p-4 rounded-lg border border-gray-200">
                <div className="flex items-center">
                  <div className="p-2 bg-yellow-100 rounded-lg">
                    <TrendingUp className="h-5 w-5 text-yellow-600" />
                  </div>
                  <div className="ml-3">
                    <p className="text-sm font-medium text-gray-600">Avg Satisfaction</p>
                    <p className="text-2xl font-bold text-gray-900">{globalStats.avgSatisfaction.toFixed(1)}</p>
                  </div>
                </div>
              </div>
              
              <div className="bg-white p-4 rounded-lg border border-gray-200">
                <div className="flex items-center">
                  <div className="p-2 bg-indigo-100 rounded-lg">
                    <CheckCircle className="h-5 w-5 text-indigo-600" />
                  </div>
                  <div className="ml-3">
                    <p className="text-sm font-medium text-gray-600">On-Time Delivery</p>
                    <p className="text-2xl font-bold text-gray-900">{globalStats.onTimeDelivery}%</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Filters */}
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <input
                type="text"
                placeholder="Search clients..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="trial">Trial</option>
              <option value="suspended">Suspended</option>
            </select>
            
            <select
              value={industryFilter}
              onChange={(e) => setIndustryFilter(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">All Industries</option>
              {getUniqueIndustries().map(industry => (
                <option key={industry} value={industry}>{industry}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Clients Table */}
        <div className="bg-white rounded-lg border border-gray-200">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">Client Accounts</h2>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Client
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Industry
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Projects
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Total Value
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Performance
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredClients.map((client) => (
                  <tr key={client.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div>
                        <div className="text-sm font-medium text-gray-900">{client.company_name}</div>
                        <div className="text-sm text-gray-500">
                          <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${planColors[client.subscription_plan]}`}>
                            {client.subscription_plan}
                          </span>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {client.industry}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusColors[client.status]}`}>
                        {client.status.charAt(0).toUpperCase() + client.status.slice(1)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      <div>
                        <div className="font-medium">{client.active_projects} active</div>
                        <div className="text-gray-500">{client.total_projects} total</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {formatCurrency(client.total_value)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      <div>
                        <div className="flex items-center">
                          <span className="text-yellow-500">★</span>
                          <span className="ml-1">{client.satisfaction_score.toFixed(1)}</span>
                        </div>
                        <div className="text-gray-500">{client.on_time_rate}% on-time</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex items-center gap-2">
                        <Button
                          onClick={() => handleSwitchToClient(client.id)}
                          size="sm"
                          className="bg-purple-600 hover:bg-purple-700"
                        >
                          Switch To
                        </Button>
                        <Button
                          onClick={() => handleViewClient(client.id)}
                          size="sm"
                          variant="outline"
                        >
                          <Eye className="h-4 w-4 mr-1" />
                          View
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          
          {filteredClients.length === 0 && (
            <div className="px-6 py-12 text-center">
              <p className="text-gray-500">No clients found matching your criteria.</p>
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  )
}

