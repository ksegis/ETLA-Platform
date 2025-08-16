'use client'

import { useState, useEffect } from 'react'
import { DashboardLayout } from '@/components/layout/DashboardLayout'
import { createClient } from '@/lib/supabase'
import { 
  Users, 
  Building2, 
  TrendingUp, 
  Clock, 
  Star,
  Search,
  Filter,
  MoreHorizontal,
  Eye,
  Settings,
  ArrowUpRight,
  ArrowDownRight,
  Activity
} from 'lucide-react'

interface Client {
  id: string
  company_name: string
  status: string
  subscription_plan: string
  industry: string
  total_projects: number
  active_projects: number
  completed_projects: number
  total_value: number
  completed_value: number
  satisfaction_score: number
  on_time_rate: number
  last_activity: string
  created_at: string
}

interface GlobalStats {
  total_clients: number
  active_clients: number
  total_active_projects: number
  total_revenue: number
  global_satisfaction_score: number
  global_on_time_rate: number
}

export default function AdminDashboard() {
  const [clients, setClients] = useState<Client[]>([])
  const [globalStats, setGlobalStats] = useState<GlobalStats>({
    total_clients: 0,
    active_clients: 0,
    total_active_projects: 0,
    total_revenue: 0,
    global_satisfaction_score: 0,
    global_on_time_rate: 0
  })
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [selectedClients, setSelectedClients] = useState<string[]>([])

  const supabase = createClient()

  // Type-safe planColors with Record type
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

  useEffect(() => {
    fetchDashboardData()
  }, [])

  const fetchDashboardData = async () => {
    try {
      setLoading(true)

      // Fetch clients with project data
      const { data: clientsData, error: clientsError } = await supabase
        .from('client_dashboard_data')
        .select('*')
        .order('created_at', { ascending: false })

      if (clientsError) {
        console.error('Error fetching clients:', clientsError)
        // Use mock data if database query fails
        setClients(mockClients)
      } else {
        setClients(clientsData || mockClients)
      }

      // Fetch global analytics
      const { data: analyticsData, error: analyticsError } = await supabase
        .from('global_analytics')
        .select('*')
        .order('calculation_date', { ascending: false })
        .limit(1)
        .single()

      if (analyticsError) {
        console.error('Error fetching analytics:', analyticsError)
        // Use calculated stats from clients data
        const calculatedStats = calculateGlobalStats(clientsData || mockClients)
        setGlobalStats(calculatedStats)
      } else {
        setGlobalStats(analyticsData || calculateGlobalStats(clientsData || mockClients))
      }

    } catch (error) {
      console.error('Error in fetchDashboardData:', error)
      // Fallback to mock data
      setClients(mockClients)
      setGlobalStats(calculateGlobalStats(mockClients))
    } finally {
      setLoading(false)
    }
  }

  const calculateGlobalStats = (clientsData: Client[]): GlobalStats => {
    return {
      total_clients: clientsData.length,
      active_clients: clientsData.filter(c => c.status === 'active').length,
      total_active_projects: clientsData.reduce((sum, c) => sum + (c.active_projects || 0), 0),
      total_revenue: clientsData.reduce((sum, c) => sum + (c.completed_value || 0), 0),
      global_satisfaction_score: clientsData.reduce((sum, c) => sum + (c.satisfaction_score || 0), 0) / clientsData.length,
      global_on_time_rate: clientsData.reduce((sum, c) => sum + (c.on_time_rate || 0), 0) / clientsData.length
    }
  }

  const filteredClients = clients.filter(client => {
    const matchesSearch = client.company_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         client.industry?.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = statusFilter === 'all' || client.status === statusFilter
    return matchesSearch && matchesStatus
  })

  const handleClientSelect = (clientId: string) => {
    setSelectedClients(prev => 
      prev.includes(clientId) 
        ? prev.filter(id => id !== clientId)
        : [...prev, clientId]
    )
  }

  const handleBulkAction = (action: string) => {
    console.log(`Performing ${action} on clients:`, selectedClients)
    // Implement bulk actions
    setSelectedClients([])
  }

  const switchToClient = (clientId: string) => {
    // Implement client switching logic
    console.log('Switching to client:', clientId)
    // This would typically set tenant context and redirect
  }

  const viewClientDashboard = (clientId: string) => {
    // Navigate to client-specific dashboard
    window.open(`/client/dashboard?tenant=${clientId}`, '_blank')
  }

  const manageClient = (clientId: string) => {
    // Navigate to client management page
    console.log('Managing client:', clientId)
  }

  // Mock data for fallback
  const mockClients: Client[] = [
    {
      id: '1',
      company_name: 'Acme Corporation',
      status: 'active',
      subscription_plan: 'enterprise',
      industry: 'Technology',
      total_projects: 12,
      active_projects: 3,
      completed_projects: 9,
      total_value: 450000,
      completed_value: 380000,
      satisfaction_score: 4.8,
      on_time_rate: 92,
      last_activity: '2024-01-15T10:30:00Z',
      created_at: '2023-06-15T00:00:00Z'
    },
    {
      id: '2',
      company_name: 'TechStart Inc',
      status: 'active',
      subscription_plan: 'professional',
      industry: 'Software',
      total_projects: 8,
      active_projects: 2,
      completed_projects: 6,
      total_value: 280000,
      completed_value: 210000,
      satisfaction_score: 4.6,
      on_time_rate: 88,
      last_activity: '2024-01-14T15:45:00Z',
      created_at: '2023-08-20T00:00:00Z'
    },
    {
      id: '3',
      company_name: 'Global Enterprises',
      status: 'trial',
      subscription_plan: 'trial',
      industry: 'Manufacturing',
      total_projects: 3,
      active_projects: 1,
      completed_projects: 2,
      total_value: 120000,
      completed_value: 80000,
      satisfaction_score: 4.4,
      on_time_rate: 85,
      last_activity: '2024-01-13T09:20:00Z',
      created_at: '2024-01-01T00:00:00Z'
    }
  ]

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Host Admin Dashboard</h1>
            <p className="text-gray-600">Manage all clients and global operations</p>
          </div>
          <div className="flex space-x-3">
            <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center">
              <Users className="h-4 w-4 mr-2" />
              Add Client
            </button>
          </div>
        </div>

        {/* Global Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Clients</p>
                <p className="text-2xl font-bold text-gray-900">{globalStats.total_clients}</p>
              </div>
              <div className="h-12 w-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <Building2 className="h-6 w-6 text-blue-600" />
              </div>
            </div>
            <div className="mt-4 flex items-center">
              <ArrowUpRight className="h-4 w-4 text-green-500" />
              <span className="text-sm text-green-600 ml-1">+12% from last month</span>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Active Projects</p>
                <p className="text-2xl font-bold text-gray-900">{globalStats.total_active_projects}</p>
              </div>
              <div className="h-12 w-12 bg-green-100 rounded-lg flex items-center justify-center">
                <Activity className="h-6 w-6 text-green-600" />
              </div>
            </div>
            <div className="mt-4 flex items-center">
              <ArrowUpRight className="h-4 w-4 text-green-500" />
              <span className="text-sm text-green-600 ml-1">+8% from last month</span>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Revenue</p>
                <p className="text-2xl font-bold text-gray-900">${(globalStats.total_revenue / 1000).toFixed(0)}K</p>
              </div>
              <div className="h-12 w-12 bg-purple-100 rounded-lg flex items-center justify-center">
                <TrendingUp className="h-6 w-6 text-purple-600" />
              </div>
            </div>
            <div className="mt-4 flex items-center">
              <ArrowUpRight className="h-4 w-4 text-green-500" />
              <span className="text-sm text-green-600 ml-1">+15% from last month</span>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Satisfaction Score</p>
                <p className="text-2xl font-bold text-gray-900">{globalStats.global_satisfaction_score.toFixed(1)}</p>
              </div>
              <div className="h-12 w-12 bg-yellow-100 rounded-lg flex items-center justify-center">
                <Star className="h-6 w-6 text-yellow-600" />
              </div>
            </div>
            <div className="mt-4 flex items-center">
              <ArrowUpRight className="h-4 w-4 text-green-500" />
              <span className="text-sm text-green-600 ml-1">+0.2 from last month</span>
            </div>
          </div>
        </div>

        {/* Filters and Search */}
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
            <div className="flex flex-1 items-center space-x-4">
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <input
                  type="text"
                  placeholder="Search clients..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent w-full"
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
            </div>
            
            {selectedClients.length > 0 && (
              <div className="flex items-center space-x-2">
                <span className="text-sm text-gray-600">{selectedClients.length} selected</span>
                <button
                  onClick={() => handleBulkAction('activate')}
                  className="px-3 py-1 bg-green-100 text-green-800 rounded text-sm hover:bg-green-200"
                >
                  Activate
                </button>
                <button
                  onClick={() => handleBulkAction('suspend')}
                  className="px-3 py-1 bg-red-100 text-red-800 rounded text-sm hover:bg-red-200"
                >
                  Suspend
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Clients Table */}
        <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">Client Management</h2>
          </div>
          
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    <input
                      type="checkbox"
                      checked={selectedClients.length === filteredClients.length}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSelectedClients(filteredClients.map(c => c.id))
                        } else {
                          setSelectedClients([])
                        }
                      }}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Client
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Projects
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Revenue
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Performance
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
                      <input
                        type="checkbox"
                        checked={selectedClients.includes(client.id)}
                        onChange={() => handleClientSelect(client.id)}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="h-10 w-10 bg-gray-200 rounded-full flex items-center justify-center">
                          <Building2 className="h-5 w-5 text-gray-600" />
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">{client.company_name}</div>
                          <div className="text-sm text-gray-500">
                            <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${planColors[client.subscription_plan] || planColors.trial}`}>
                              {client.subscription_plan}
                            </span>
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{client.active_projects} active</div>
                      <div className="text-sm text-gray-500">{client.completed_projects} completed</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">${(client.completed_value / 1000).toFixed(0)}K</div>
                      <div className="text-sm text-gray-500">of ${(client.total_value / 1000).toFixed(0)}K total</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <Star className="h-4 w-4 text-yellow-400 mr-1" />
                        <span className="text-sm text-gray-900">{client.satisfaction_score}</span>
                      </div>
                      <div className="text-sm text-gray-500">{client.on_time_rate}% on-time</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {new Date(client.last_activity).toLocaleDateString()}
                      </div>
                      <div className="text-sm text-gray-500">
                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${statusColors[client.status] || statusColors.active}`}>
                          {client.status}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => switchToClient(client.id)}
                          className="text-blue-600 hover:text-blue-900 px-2 py-1 rounded text-sm"
                        >
                          Switch To
                        </button>
                        <button
                          onClick={() => viewClientDashboard(client.id)}
                          className="text-gray-600 hover:text-gray-900"
                        >
                          <Eye className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => manageClient(client.id)}
                          className="text-gray-600 hover:text-gray-900"
                        >
                          <Settings className="h-4 w-4" />
                        </button>
                        <button className="text-gray-600 hover:text-gray-900">
                          <MoreHorizontal className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}

