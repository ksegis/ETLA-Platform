'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import DashboardLayout from '@/components/layout/DashboardLayout'
import { supabase } from '@/lib/supabase'
import { 
  Building2, 
  Users, 
  TrendingUp, 
  DollarSign, 
  Search, 
  Filter, 
  MoreHorizontal,
  Eye,
  Settings,
  UserCheck,
  Plus,
  ArrowUpRight,
  ArrowDownRight
} from 'lucide-react'

interface GlobalStats {
  total_clients: number
  active_projects: number
  total_revenue: number
  avg_satisfaction: number
}

interface Client {
  id: string
  name: string
  status: string
  subscription_plan: string
  active_projects: number
  satisfaction_score: number
  monthly_revenue: number
  last_activity: string
  industry?: string
}

export default function AdminDashboard() {
  const router = useRouter()
  const [stats, setStats] = useState<GlobalStats>({
    total_clients: 0,
    active_projects: 0,
    total_revenue: 0,
    avg_satisfaction: 0
  })
  const [clients, setClients] = useState<Client[]>([])
  const [filteredClients, setFilteredClients] = useState<Client[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [planFilter, setPlanFilter] = useState('all')

  useEffect(() => {
    fetchAdminData()
  }, [])

  useEffect(() => {
    filterClients()
  }, [clients, searchTerm, statusFilter, planFilter])

  const fetchAdminData = async () => {
    try {
      setLoading(true)

      // Fetch global analytics
      const { data: analyticsData, error: analyticsError } = await supabase
        .from('global_analytics')
        .select('*')
        .single()

      if (!analyticsError && analyticsData) {
        setStats({
          total_clients: analyticsData.total_clients || 0,
          active_projects: analyticsData.active_projects || 0,
          total_revenue: analyticsData.total_revenue || 0,
          avg_satisfaction: analyticsData.avg_satisfaction || 0
        })
      } else {
        setStats(mockGlobalStats)
      }

      // Fetch clients with project counts
      const { data: clientsData, error: clientsError } = await supabase
        .from('tenants')
        .select(`
          id,
          name,
          status,
          subscription_tier,
          updated_at,
          projects (
            id,
            status
          ),
          client_kpis (
            satisfaction_score,
            monthly_revenue
          )
        `)
        .order('name', { ascending: true })

      if (!clientsError && clientsData) {
        const transformedClients = clientsData.map(client => ({
          id: client.id,
          name: client.name,
          status: client.status,
          subscription_plan: client.subscription_tier || 'trial',
          active_projects: Array.isArray(client.projects) 
            ? client.projects.filter((p: any) => p.status === 'in_progress').length 
            : 0,
          satisfaction_score: Array.isArray(client.client_kpis) && client.client_kpis.length > 0
            ? client.client_kpis[0].satisfaction_score || 0
            : Math.floor(Math.random() * 2) + 4, // Mock: 4-5 stars
          monthly_revenue: Array.isArray(client.client_kpis) && client.client_kpis.length > 0
            ? client.client_kpis[0].monthly_revenue || 0
            : Math.floor(Math.random() * 50000) + 10000, // Mock: $10k-60k
          last_activity: client.updated_at,
          industry: 'Technology' // Mock data
        }))
        setClients(transformedClients)
      } else {
        setClients(mockClients)
      }

    } catch (error) {
      console.error('Error fetching admin data:', error)
      setStats(mockGlobalStats)
      setClients(mockClients)
    } finally {
      setLoading(false)
    }
  }

  const filterClients = () => {
    let filtered = clients

    if (searchTerm) {
      filtered = filtered.filter(client =>
        client.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (client.industry && client.industry.toLowerCase().includes(searchTerm.toLowerCase()))
      )
    }

    if (statusFilter !== 'all') {
      filtered = filtered.filter(client => client.status === statusFilter)
    }

    if (planFilter !== 'all') {
      filtered = filtered.filter(client => client.subscription_plan === planFilter)
    }

    setFilteredClients(filtered)
  }

  const switchToClient = (clientId: string) => {
    // In a real app, this would set the tenant context and redirect
    router.push(`/client/dashboard?tenant=${clientId}`)
  }

  const viewClient = (clientId: string) => {
    router.push(`/admin/clients/${clientId}`)
  }

  const manageClient = (clientId: string) => {
    router.push(`/admin/clients/${clientId}/settings`)
  }

  // Mock data
  const mockGlobalStats: GlobalStats = {
    total_clients: 24,
    active_projects: 47,
    total_revenue: 1250000,
    avg_satisfaction: 4.7
  }

  const mockClients: Client[] = [
    {
      id: '1',
      name: 'Acme Corporation',
      status: 'active',
      subscription_plan: 'enterprise',
      active_projects: 3,
      satisfaction_score: 4.8,
      monthly_revenue: 45000,
      last_activity: '2024-01-15T10:30:00Z',
      industry: 'Manufacturing'
    },
    {
      id: '2',
      name: 'TechStart Inc',
      status: 'active',
      subscription_plan: 'professional',
      active_projects: 2,
      satisfaction_score: 4.6,
      monthly_revenue: 25000,
      last_activity: '2024-01-14T15:45:00Z',
      industry: 'Technology'
    },
    {
      id: '3',
      name: 'Global Enterprises',
      status: 'trial',
      subscription_plan: 'trial',
      active_projects: 1,
      satisfaction_score: 4.2,
      monthly_revenue: 0,
      last_activity: '2024-01-13T09:15:00Z',
      industry: 'Consulting'
    }
  ]

  const planColors: Record<string, string> = {
    enterprise: 'bg-purple-100 text-purple-800',
    professional: 'bg-blue-100 text-blue-800',
    trial: 'bg-gray-100 text-gray-800',
    basic: 'bg-green-100 text-green-800',
    premium: 'bg-orange-100 text-orange-800'
  }

  const statusColors: Record<string, string> = {
    active: 'bg-green-100 text-green-800',
    trial: 'bg-yellow-100 text-yellow-800',
    suspended: 'bg-red-100 text-red-800',
    cancelled: 'bg-gray-100 text-gray-800'
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    })
  }

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <span key={i} className={`text-sm ${i < Math.floor(rating) ? 'text-yellow-400' : 'text-gray-300'}`}>
        ★
      </span>
    ))
  }

  return (
    <DashboardLayout>
      <div className="p-6 lg:p-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Host Administration</h1>
              <p className="mt-2 text-gray-600">
                Manage all clients and global operations
              </p>
            </div>
            <button
              onClick={() => router.push('/admin/clients/new')}
              className="inline-flex items-center px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Client
            </button>
          </div>
        </div>

        {/* Global Stats */}
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4 mb-8">
          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Clients</p>
                <p className="text-2xl font-bold text-gray-900">{stats.total_clients}</p>
                <div className="flex items-center mt-1">
                  <ArrowUpRight className="h-3 w-3 text-green-500 mr-1" />
                  <span className="text-xs text-green-600">+12% from last month</span>
                </div>
              </div>
              <Building2 className="h-8 w-8 text-blue-600" />
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Active Projects</p>
                <p className="text-2xl font-bold text-gray-900">{stats.active_projects}</p>
                <div className="flex items-center mt-1">
                  <ArrowUpRight className="h-3 w-3 text-green-500 mr-1" />
                  <span className="text-xs text-green-600">+8% from last month</span>
                </div>
              </div>
              <Users className="h-8 w-8 text-green-600" />
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Monthly Revenue</p>
                <p className="text-2xl font-bold text-gray-900">{formatCurrency(stats.total_revenue)}</p>
                <div className="flex items-center mt-1">
                  <ArrowUpRight className="h-3 w-3 text-green-500 mr-1" />
                  <span className="text-xs text-green-600">+15% from last month</span>
                </div>
              </div>
              <DollarSign className="h-8 w-8 text-purple-600" />
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Avg Satisfaction</p>
                <p className="text-2xl font-bold text-gray-900">{stats.avg_satisfaction.toFixed(1)}</p>
                <div className="flex items-center mt-1">
                  {renderStars(stats.avg_satisfaction)}
                </div>
              </div>
              <TrendingUp className="h-8 w-8 text-green-600" />
            </div>
          </div>
        </div>

        {/* Client Management */}
        <div className="bg-white rounded-lg shadow-sm border">
          <div className="px-6 py-4 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-semibold text-gray-900">Client Management</h2>
                <p className="text-sm text-gray-600">Manage and monitor all client accounts</p>
              </div>
            </div>
          </div>

          {/* Filters */}
          <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search clients, industries..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>
              <div className="flex gap-2">
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="all">All Status</option>
                  <option value="active">Active</option>
                  <option value="trial">Trial</option>
                  <option value="suspended">Suspended</option>
                </select>
                <select
                  value={planFilter}
                  onChange={(e) => setPlanFilter(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="all">All Plans</option>
                  <option value="enterprise">Enterprise</option>
                  <option value="professional">Professional</option>
                  <option value="trial">Trial</option>
                </select>
              </div>
            </div>
          </div>

          {/* Client List */}
          <div className="overflow-x-auto">
            {loading ? (
              <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              </div>
            ) : (
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Client
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Plan
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Projects
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Satisfaction
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Revenue
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Last Activity
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredClients.map((client) => (
                    <tr key={client.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className="text-sm font-medium text-gray-900">{client.name}</div>
                          <div className="text-sm text-gray-500">{client.industry}</div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusColors[client.status] || statusColors.active}`}>
                          {client.status.charAt(0).toUpperCase() + client.status.slice(1)}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${planColors[client.subscription_plan] || planColors.trial}`}>
                          {client.subscription_plan.charAt(0).toUpperCase() + client.subscription_plan.slice(1)}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {client.active_projects}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          {renderStars(client.satisfaction_score)}
                          <span className="ml-1 text-sm text-gray-600">
                            {client.satisfaction_score.toFixed(1)}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {formatCurrency(client.monthly_revenue)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {formatDate(client.last_activity)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => switchToClient(client.id)}
                            className="text-blue-600 hover:text-blue-900 px-2 py-1 rounded text-xs bg-blue-50 hover:bg-blue-100 transition-colors"
                          >
                            Switch To
                          </button>
                          <button
                            onClick={() => viewClient(client.id)}
                            className="text-gray-600 hover:text-gray-900 p-1 rounded hover:bg-gray-100 transition-colors"
                          >
                            <Eye className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => manageClient(client.id)}
                            className="text-gray-600 hover:text-gray-900 p-1 rounded hover:bg-gray-100 transition-colors"
                          >
                            <Settings className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}

