'use client'

import { useState, useEffect } from 'react'
import { 
  Building2, 
  Users, 
  FileText, 
  Upload, 
  BarChart3, 
  Settings, 
  LogOut,
  Menu,
  X,
  Bell,
  Search,
  Shield,
  CheckCircle,
  Database,
  TrendingUp,
  Cog,
  Eye,
  Briefcase,
  Calendar
} from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { supabase } from '@/lib/supabase'

interface DashboardLayoutProps {
  children: React.ReactNode
}

const navigation = [
  { name: 'Dashboard', href: '/dashboard', icon: BarChart3 },
  { name: 'Work Requests', href: '/work-requests', icon: Briefcase },
  { name: 'Project Management', href: '/project-management', icon: Calendar },
  { name: 'Employees', href: '/employees', icon: Users },
  { name: 'Payroll', href: '/payroll', icon: FileText },
  { name: 'Benefits', href: '/benefits', icon: Building2 },
  { name: 'File Upload', href: '/upload', icon: Upload },
  { name: 'Job Management', href: '/jobs-enhanced', icon: Cog },
  { name: 'Data Validation', href: '/validation', icon: CheckCircle },
  { name: 'Audit Trail', href: '/audit', icon: Eye },
  { name: 'Access Control', href: '/access-control', icon: Shield },
  { name: 'Reporting', href: '/reporting', icon: TrendingUp },
  { name: 'Settings', href: '/settings', icon: Settings },
]

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [user, setUser] = useState<any>(null)
  const [expandedGroups, setExpandedGroups] = useState<string[]>(['operations', 'talent-management', 'etl-cockpit'])
  const router = useRouter()
  const pathname = usePathname()

  // REDESIGNED NAVIGATION GROUPS - USER-FRIENDLY WORKFLOW ORIENTED
  const navigationGroups: NavigationGroup[] = [
    {
      id: 'operations',
      title: 'Operations',
      icon: Briefcase,
      color: 'text-blue-600',
      bgColor: 'bg-blue-600',
      hoverColor: 'hover:bg-blue-50',
      textColor: 'text-blue-900',
      items: [
        { name: 'Work Requests', href: '/work-requests', icon: FileText },
        { name: 'Project Management', href: '/project-management', icon: Calendar },
        { name: 'Reporting', href: '/reporting', icon: TrendingUp },
        { name: 'HR Analytics Dashboard', href: '/hr-analytics', icon: PieChart, isNew: true }
      ]
    },
    {
      id: 'talent-management',
      title: 'Talent Management',
      icon: Users2,
      color: 'text-emerald-600',
      bgColor: 'bg-emerald-600',
      hoverColor: 'hover:bg-emerald-50',
      textColor: 'text-emerald-900',
      items: [
        { name: 'Talent Dashboard', href: '/talent', icon: BarChart3 },
        { name: 'Job Management', href: '/talent/jobs', icon: Briefcase },
        { name: 'Candidates', href: '/talent/candidates', icon: Users },
        { name: 'Pipeline', href: '/talent/pipeline', icon: TrendingUp },
        { name: 'Interviews', href: '/talent/interviews', icon: Calendar },
        { name: 'Offers', href: '/talent/offers', icon: FileText }
      ]
    },
    {
      id: 'etl-cockpit',
      title: 'ETL Cockpit',
      icon: Database,
      color: 'text-green-600',
      bgColor: 'bg-green-600',
      hoverColor: 'hover:bg-green-50',
      textColor: 'text-green-900',
      items: [
        { name: 'ETL Dashboard', href: '/dashboard', icon: BarChart3 },
        { name: 'Job Management', href: '/jobs', icon: Briefcase },
        { name: 'Employee Data Processing', href: '/employees', icon: Users },
        { name: 'Data Analytics', href: '/analytics', icon: Database },
        { name: 'Audit Trail', href: '/audit', icon: Eye }
      ]
    },
    {
      id: 'data-management',
      title: 'Data Management',
      icon: Database,
      color: 'text-indigo-600',
      bgColor: 'bg-indigo-600',
      hoverColor: 'hover:bg-indigo-50',
      textColor: 'text-indigo-900',
      items: [
        { name: 'File Upload', href: '/upload', icon: Upload },
        { name: 'Data Validation', href: '/validation', icon: CheckCircle },
        { name: 'System Health', href: '/system-health', icon: Activity }
      ]
    },
    {
      id: 'configuration',
      title: 'Configuration',
      icon: Settings,
      color: 'text-purple-600',
      bgColor: 'bg-purple-600',
      hoverColor: 'hover:bg-purple-50',
      textColor: 'text-purple-900',
      items: [
        { name: 'System Settings', href: '/settings', icon: Settings },
        { name: 'API Configuration', href: '/api-config', icon: Zap },
        { name: 'Integration Settings', href: '/integrations', icon: Target }
      ]
    },
    {
      id: 'administration',
      title: 'Administration',
      icon: Shield,
      color: 'text-orange-600',
      bgColor: 'bg-orange-600',
      hoverColor: 'hover:bg-orange-50',
      textColor: 'text-orange-900',
      items: [
        { name: 'Access Control', href: '/admin/access-control', icon: Shield },
        { name: 'Tenant Management', href: '/admin/tenant-management', icon: Building },
        { name: 'Timecard Utilities', href: '/admin/timecard-utilities', icon: Clock },
        { name: 'Employee Directory', href: '/employee-directory', icon: Users },
        { name: 'Benefits Management', href: '/benefits', icon: Building },
        { name: 'Payroll Management', href: '/payroll', icon: DollarSign }
      ]
    }
  ]

  useEffect(() => {
    // Get current user
    const getCurrentUser = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      setUser(user)
    }
    
    getCurrentUser()

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      setUser(session?.user || null)
    })

    return () => subscription.unsubscribe()
  }, [])

  const handleSignOut = async () => {
    try {
      console.log('Signing out...')
      
      // Sign out from Supabase
      const { error } = await supabase.auth.signOut()
      
      if (error) {
        console.error('Sign out error:', error)
        alert('Error signing out: ' + error.message)
        return
      }

      console.log('Sign out successful')
      
      // Clear any local storage or session data if needed
      localStorage.removeItem('supabase.auth.token')
      
      // Redirect to login page
      window.location.href = '/login'
      
    } catch (error) {
      console.error('Sign out exception:', error)
      alert('Error signing out. Please try again.')
    }
  }

  return (
    <div className="h-screen flex bg-gray-50">
      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <div className="fixed inset-0 bg-gray-600 bg-opacity-75" onClick={() => setSidebarOpen(false)} />
        </div>
      )}

      {/* Sidebar */}
      <div
        className={`fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-lg transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-0 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="flex items-center justify-between h-16 px-6 border-b border-gray-200 flex-shrink-0">
            <div className="flex items-center">
              <Building2 className="h-8 w-8 text-blue-600" />
              <span className="ml-2 text-xl font-bold text-gray-900">HelixBridge</span>
            </div>
            <button
              onClick={() => setSidebarOpen(false)}
              className="lg:hidden p-1 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100"
            >
              <X className="h-6 w-6" />
            </button>
          </div>
          <nav className="flex-1 px-4 py-4 space-y-1">
            {navigation.map((item) => (
              <a
                key={item.name}
                href={item.href}
                className="group flex items-center px-2 py-2 text-sm font-medium text-gray-700 rounded-md hover:bg-gray-100 hover:text-gray-900"
              >
                <item.icon className="mr-3 h-5 w-5 text-gray-400 group-hover:text-gray-500" />
                {item.name}
              </a>
            ))}
          </nav>
          
          {/* Mobile user info and logout */}
          <div className="flex-shrink-0 border-t border-gray-200 p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="h-8 w-8 rounded-full bg-blue-600 flex items-center justify-center">
                    <span className="text-sm font-medium text-white">
                      {user?.email?.charAt(0).toUpperCase() || 'D'}
                    </span>
                  </div>
                </div>
                <div className="ml-3">
                  <p className="text-sm font-medium text-gray-700 truncate">
                    {user?.email || 'demo@company.com'}
                  </p>
                  <button
                    onClick={handleSignOut}
                    className="text-xs text-gray-500 hover:text-gray-700 flex items-center"
                  >
                    <LogOut className="h-3 w-3 mr-1" />
                    Sign out
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Desktop sidebar */}
      <div className="hidden lg:fixed lg:inset-y-0 lg:flex lg:w-64 lg:flex-col">
        <div className="flex flex-col flex-grow bg-white border-r border-gray-200 shadow-sm">
          <div className="flex h-16 items-center px-4 border-b border-gray-200">
            <Building2 className="h-8 w-8 text-blue-600" />
            <span className="ml-2 text-xl font-semibold text-gray-900">ETLA</span>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-4 py-4 space-y-3 overflow-y-auto">
            {filteredNavigationGroups.map((group) => {
              const isExpanded = expandedGroups.includes(group.id)
              const GroupIcon = group.icon

          {/* Desktop user info and logout */}
          <div className="flex-shrink-0 border-t border-gray-200 p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="h-8 w-8 rounded-full bg-blue-600 flex items-center justify-center">
                    <span className="text-sm font-medium text-white">
                      {user?.email?.charAt(0).toUpperCase() || 'D'}
                    </span>
                  </div>
                </div>
                <div className="ml-3">
                  <p className="text-sm font-medium text-gray-700 truncate">
                    {user?.email || 'demo@company.com'}
                  </p>
                  <button
                    onClick={handleSignOut}
                    className="text-xs text-gray-500 hover:text-gray-700 flex items-center mt-1"
                  >
                    <LogOut className="h-3 w-3 mr-1" />
                    Sign out
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main content area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top bar */}
        <div className="bg-white shadow-sm border-b border-gray-200 flex-shrink-0">
          <div className="flex items-center justify-between h-16 px-6">
            <button
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden p-1 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100"
            >
              <Menu className="h-6 w-6" />
            </button>

            <div className="flex items-center space-x-4">
              <button className="p-1 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100">
                <Bell className="h-6 w-6" />
              </button>
              
              {/* Top right user menu */}
              <div className="ml-3 relative">
                <button
                  onClick={handleSignOut}
                  className="flex items-center text-sm text-gray-500 hover:text-gray-700 px-3 py-2 rounded-md hover:bg-gray-100"
                >
                  <LogOut className="h-4 w-4 mr-2" />
                  Sign Out
                </button>
              </div>
            </div>
          </div>
        </div>

        <main className="flex-1 overflow-y-auto">{children}</main>
      </div>
    </div>
  )
}
