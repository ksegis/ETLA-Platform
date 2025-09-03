'use client'

import { useState, useEffect } from 'react'
import { useRouter, usePathname } from 'next/navigation'
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
  Calendar,
  ChevronDown,
  ChevronRight,
  DollarSign,
  Building,
  Activity,
  PieChart,
  Users2,
  Clock,
  Target,
  Zap
} from 'lucide-react'

interface NavigationItem {
  name: string;
  href: string;
  icon: any;
  badge?: string;
  isNew?: boolean;
}

interface NavigationGroup {
  id: string;
  title: string;
  icon: any;
  color: string;
  bgColor: string;
  hoverColor: string;
  textColor: string;
  defaultExpanded?: boolean;
  items: NavigationItem[];
}

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [user, setUser] = useState<any>(null)
  const [expandedGroups, setExpandedGroups] = useState<string[]>(['migration-workbench', 'operations'])
  const router = useRouter()
  const pathname = usePathname()

  // REORGANIZED NAVIGATION GROUPS - NEW "OPERATIONS" CATEGORY
  const navigationGroups: NavigationGroup[] = [
    {
      id: 'migration-workbench',
      title: 'Migration Workbench',
      icon: Database,
      color: 'text-blue-600',
      bgColor: 'bg-blue-600',
      hoverColor: 'hover:bg-blue-50',
      textColor: 'text-blue-900',
      defaultExpanded: true,
      items: [
        { name: 'ETL Dashboard', href: '/dashboard', icon: BarChart3 },
        { name: 'File Upload', href: '/upload', icon: Upload },
        { name: 'Data Validation', href: '/validation', icon: CheckCircle }
      ]
    },
    {
      id: 'operations',
      title: 'Operations',
      icon: Zap,
      color: 'text-indigo-600',
      bgColor: 'bg-indigo-600',
      hoverColor: 'hover:bg-indigo-50',
      textColor: 'text-indigo-900',
      defaultExpanded: true,
      items: [
        { name: 'Work Requests', href: '/work-requests', icon: Briefcase },
        { name: 'Project Management', href: '/project-management', icon: Calendar },
        { name: 'Job Management', href: '/jobs-enhanced', icon: Cog },
        { name: 'Employee Data Processing', href: '/employees', icon: Users }
      ]
    },
    {
      id: 'historical-data',
      title: 'Historical Data',
      icon: BarChart3,
      color: 'text-green-600',
      bgColor: 'bg-green-600',
      hoverColor: 'hover:bg-green-50',
      textColor: 'text-green-900',
      items: [
        { name: 'HR Analytics Dashboard', href: '/historical-dashboard', icon: PieChart, isNew: true },
        { name: 'Reporting', href: '/reporting', icon: TrendingUp },
        { name: 'Audit Trail', href: '/audit', icon: Eye },
        { name: 'Data Analytics', href: '/analytics', icon: Database }
      ]
    },
    {
      id: 'administration',
      title: 'Administration',
      icon: Settings,
      color: 'text-orange-600',
      bgColor: 'bg-orange-600',
      hoverColor: 'hover:bg-orange-50',
      textColor: 'text-orange-900',
      items: [
        { name: 'Access Control', href: '/access-control', icon: Shield },
        { name: 'Settings', href: '/settings', icon: Settings },
        { name: 'Benefits', href: '/benefits', icon: Building },
        { name: 'Payroll', href: '/payroll', icon: DollarSign }
      ]
    },
    {
      id: 'utilities',
      title: 'Utilities',
      icon: Cog,
      color: 'text-purple-600',
      bgColor: 'bg-purple-600',
      hoverColor: 'hover:bg-purple-50',
      textColor: 'text-purple-900',
      items: [
        { name: 'Employee Directory', href: '/employee-directory', icon: Users },
        { name: 'System Health', href: '/system-health', icon: Activity }
      ]
    }
  ]

  useEffect(() => {
    // Get current user - using safe Supabase import
    const getCurrentUser = async () => {
      try {
        // Dynamic import to handle missing Supabase gracefully
        const { createClient } = await import('@/lib/supabase')
        const supabase = createClient()
        const { data: { user } } = await supabase.auth.getUser()
        setUser(user)
      } catch (error) {
        console.log('Supabase not available, using demo user')
        setUser({ email: 'demo@company.com' })
      }
    }

    getCurrentUser()

    // Listen for auth changes - with error handling
    const setupAuthListener = async () => {
      try {
        const { createClient } = await import('@/lib/supabase')
        const supabase = createClient()
        const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
          setUser(session?.user || null)
        })

        return () => subscription.unsubscribe()
      } catch (error) {
        console.log('Supabase auth listener not available')
        return () => {}
      }
    }

    setupAuthListener()
  }, [])

  const handleSignOut = async () => {
    try {
      const { createClient } = await import('@/lib/supabase')
      const supabase = createClient()
      await supabase.auth.signOut()
      router.push('/login')
    } catch (error) {
      console.log('Supabase sign out not available, redirecting to login')
      router.push('/login')
    }
  }

  const toggleGroup = (groupId: string) => {
    setExpandedGroups(prev => 
      prev.includes(groupId) 
        ? prev.filter(id => id !== groupId)
        : [...prev, groupId]
    )
  }

  const isActiveItem = (href: string) => {
    return pathname === href
  }

  const getActiveGroup = () => {
    for (const group of navigationGroups) {
      if (group.items.some(item => item.href === pathname)) {
        return group.id
      }
    }
    return null
  }

  // Auto-expand group containing current page
  useEffect(() => {
    const activeGroup = getActiveGroup()
    if (activeGroup && !expandedGroups.includes(activeGroup)) {
      setExpandedGroups(prev => [...prev, activeGroup])
    }
  }, [pathname])

  return (
    <div className="h-screen flex bg-gray-50">
      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <div className="fixed inset-0 bg-gray-600 bg-opacity-75" onClick={() => setSidebarOpen(false)} />
        </div>
      )}

      {/* Sidebar */}
      <div className={`fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-lg transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-0 ${
        sidebarOpen ? 'translate-x-0' : '-translate-x-full'
      }`}>
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="flex items-center justify-between h-16 px-6 border-b border-gray-200 flex-shrink-0">
            <div className="flex items-center">
              <Building2 className="h-8 w-8 text-blue-600" />
              <span className="ml-2 text-xl font-bold text-gray-900">ETLA</span>
            </div>
            <button
              onClick={() => setSidebarOpen(false)}
              className="lg:hidden p-1 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100"
            >
              <X className="h-6 w-6" />
            </button>
          </div>

          {/* Search */}
          <div className="p-4 border-b border-gray-200 flex-shrink-0">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search navigation..."
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-4 py-4 space-y-3 overflow-y-auto">
            {navigationGroups.map((group) => {
              const isExpanded = expandedGroups.includes(group.id)
              const GroupIcon = group.icon
              
              return (
                <div key={group.id} className="space-y-1">
                  {/* Group Header */}
                  <button
                    onClick={() => toggleGroup(group.id)}
                    className={`w-full flex items-center justify-between px-3 py-3 text-sm font-bold rounded-lg transition-all duration-200 ${group.color} ${group.hoverColor} border border-gray-100 shadow-sm`}
                  >
                    <div className="flex items-center">
                      <GroupIcon className="h-5 w-5 mr-3" />
                      <span className="font-semibold">{group.title}</span>
                    </div>
                    <div className="transition-transform duration-200">
                      {isExpanded ? (
                        <ChevronDown className="h-4 w-4" />
                      ) : (
                        <ChevronRight className="h-4 w-4" />
                      )}
                    </div>
                  </button>

                  {/* Group Items with Animation */}
                  <div className={`transition-all duration-300 ease-in-out overflow-hidden ${
                    isExpanded ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
                  }`}>
                    <div className="ml-4 pl-4 border-l-2 border-gray-100 space-y-1 pt-2">
                      {group.items.map((item) => {
                        const ItemIcon = item.icon
                        const isActive = isActiveItem(item.href)
                        
                        return (
                          <a
                            key={item.name}
                            href={item.href}
                            className={`flex items-center px-3 py-2 text-sm rounded-md transition-all duration-200 ${
                              isActive
                                ? `${group.bgColor} text-white shadow-md`
                                : `text-gray-700 hover:bg-gray-50 hover:text-gray-900 hover:shadow-sm`
                            }`}
                          >
                            <ItemIcon className="h-4 w-4 mr-3" />
                            <span className="flex-1">{item.name}</span>
                            {item.isNew && (
                              <span className="ml-2 px-2 py-1 text-xs font-medium bg-green-100 text-green-800 rounded-full">
                                New
                              </span>
                            )}
                            {item.badge && (
                              <span className="ml-2 px-2 py-1 text-xs font-medium bg-gray-100 text-gray-800 rounded-full">
                                {item.badge}
                              </span>
                            )}
                          </a>
                        )
                      })}
                    </div>
                  </div>
                </div>
              )
            })}
          </nav>

          {/* User Profile */}
          <div className="border-t border-gray-200 p-4 flex-shrink-0">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="h-8 w-8 rounded-full bg-blue-600 flex items-center justify-center">
                  <span className="text-sm font-medium text-white">
                    {user?.email?.charAt(0).toUpperCase() || 'U'}
                  </span>
                </div>
              </div>
              <div className="ml-3 flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate">
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
              <div className="h-6 w-px bg-gray-300" />
              <div className="flex items-center space-x-2">
                <div className="h-8 w-8 rounded-full bg-blue-600 flex items-center justify-center">
                  <span className="text-sm font-medium text-white">
                    {user?.email?.charAt(0).toUpperCase() || 'U'}
                  </span>
                </div>
                <span className="text-sm font-medium text-gray-900">
                  {user?.email || 'demo@company.com'}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Page content - No padding/margin to eliminate white space */}
        <main className="flex-1 overflow-auto">
          {children}
        </main>
      </div>
    </div>
  )
}

