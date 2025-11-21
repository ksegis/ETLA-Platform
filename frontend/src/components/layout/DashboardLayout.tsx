'use client'

import React, { useState, useEffect, useMemo } from 'react'
import Link from 'next/link'
import { useRouter, usePathname } from 'next/navigation'
import { supabase } from '@/lib/supabase'
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
  User
} from 'lucide-react'
import { usePermissions } from '@/hooks/usePermissions'
import { FEATURES, PERMISSIONS } from '@/rbac/constants'
import NotificationBell from '@/components/notifications/NotificationBell'

interface NavigationItem {
  name: string
  href: string
  icon: any
  badge?: string
  isNew?: boolean
  requiredPermission?: string // kept, but we gate by feature below
}

interface NavigationGroup {
  id: string
  title: string
  icon: any
  color: string
  bgColor: string
  hoverColor: string
  textColor: string
  defaultExpanded?: boolean
  items: NavigationItem[]
  requiredPermission?: string
}

interface DashboardLayoutProps {
  children: React.ReactNode
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false)
  const [user, setUser] = useState<any>(null)
  const [expandedGroups, setExpandedGroups] = useState<string[]>([
    'operations',
    'talent-management',
    'etl-cockpit',
  ])

  const router = useRouter()
  const pathname = usePathname()

  // usePermissions helpers – we’ll gate by feature access, not by “permission-only” strings
  const {
    canAccessFeature,
    loading: permissionsloading,
  } = usePermissions()

  // -----------------------------
  // Navigation config (unchanged)
  // -----------------------------
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
        { name: 'Work Requests', href: '/work-requests', icon: FileText, requiredPermission: PERMISSIONS.WORK_REQUEST_READ },
        { name: 'Project Management', href: '/project-management', icon: Calendar, requiredPermission: PERMISSIONS.PROJECT_READ },
        { name: 'My Projects', href: '/customer/projects', icon: Briefcase, isNew: true },
        { name: 'Portfolio Overview', href: '/customer/portfolio', icon: PieChart, isNew: true },
        { name: 'Notifications', href: '/customer/notifications', icon: Bell, isNew: true },
        { name: 'Reporting', href: '/reporting', icon: TrendingUp, requiredPermission: PERMISSIONS.REPORTING_VIEW },
        { name: 'HR Analytics Dashboard', href: '/hr-analytics', icon: PieChart, isNew: true, requiredPermission: PERMISSIONS.REPORTING_VIEW },
      ],
    },
    {
      id: 'talent-management',
      title: 'Talent Management',
      icon: Users2,
      color: 'text-emerald-600',
      bgColor: 'bg-emerald-600',
      hoverColor: 'hover:bg-emerald-50',
      textColor: 'text-emerald-900',
      requiredPermission: PERMISSIONS.USER_READ,
      items: [
        { name: 'Talent Dashboard', href: '/talent', icon: BarChart3, requiredPermission: PERMISSIONS.USER_READ },
        { name: 'Job Management', href: '/talent/jobs', icon: Briefcase, requiredPermission: PERMISSIONS.JOB_MANAGE },
        { name: 'Candidates', href: '/talent/candidates', icon: Users, requiredPermission: PERMISSIONS.CANDIDATE_READ },
        { name: 'Pipeline', href: '/talent/pipeline', icon: TrendingUp, requiredPermission: PERMISSIONS.CANDIDATE_READ },
        { name: 'Interviews', href: '/talent/interviews', icon: Calendar, requiredPermission: PERMISSIONS.INTERVIEW_MANAGE },
        { name: 'Offers', href: '/talent/offers', icon: FileText, requiredPermission: PERMISSIONS.OFFER_MANAGE },
      ],
    },
    {
      id: 'etl-cockpit',
      title: 'ETL Cockpit',
      icon: Database,
      color: 'text-green-600',
      bgColor: 'bg-green-600',
      hoverColor: 'hover:bg-green-50',
      textColor: 'text-green-900',
      requiredPermission: PERMISSIONS.DATA_PROCESS,
      items: [
        { name: 'ETL Dashboard', href: '/dashboard', icon: BarChart3, requiredPermission: PERMISSIONS.DATA_PROCESS },
        { name: 'Job Management', href: '/jobs', icon: Briefcase, requiredPermission: PERMISSIONS.JOB_MANAGE },
        { name: 'Employee Data Processing', href: '/employees', icon: Users, requiredPermission: PERMISSIONS.EMPLOYEE_PROCESS },
        { name: 'Data Analytics', href: '/analytics', icon: Database, requiredPermission: PERMISSIONS.DATA_ANALYZE },
        { name: 'Audit Trail', href: '/audit', icon: Eye, requiredPermission: PERMISSIONS.AUDIT_VIEW },
      ],
    },
    {
      id: 'data-management',
      title: 'Data Management',
      icon: Database,
      color: 'text-indigo-600',
      bgColor: 'bg-indigo-600',
      hoverColor: 'hover:bg-indigo-50',
      textColor: 'text-indigo-900',
      requiredPermission: PERMISSIONS.DATA_MANAGE,
      items: [
        { name: 'File Upload', href: '/upload', icon: Upload, requiredPermission: PERMISSIONS.FILE_UPLOAD },
        { name: 'Data Validation', href: '/validation', icon: CheckCircle, requiredPermission: PERMISSIONS.DATA_VALIDATE },
        { name: 'System Health', href: '/system-health', icon: Activity, requiredPermission: PERMISSIONS.SYSTEM_HEALTH_VIEW },
      ],
    },
    {
      id: 'configuration',
      title: 'Configuration',
      icon: Settings,
      color: 'text-purple-600',
      bgColor: 'bg-purple-600',
      hoverColor: 'hover:bg-purple-50',
      textColor: 'text-purple-900',
      requiredPermission: PERMISSIONS.SYSTEM_SETTINGS_MANAGE,
      items: [
        { name: 'System Settings', href: '/settings', icon: Settings, requiredPermission: PERMISSIONS.SYSTEM_SETTINGS_MANAGE },
        { name: 'API Configuration', href: '/api-config', icon: Settings, requiredPermission: PERMISSIONS.API_CONFIG_MANAGE },
        { name: 'Integration Settings', href: '/integrations', icon: Settings, requiredPermission: PERMISSIONS.INTEGRATION_MANAGE },
      ],
    },
    {
      id: 'administration',
      title: 'Administration',
      icon: Shield,
      color: 'text-orange-600',
      bgColor: 'bg-orange-600',
      hoverColor: 'hover:bg-orange-50',
      textColor: 'text-orange-900',
      requiredPermission: PERMISSIONS.ADMIN_ACCESS,
      items: [
        { name: 'Access Control', href: '/admin/access-control', icon: Shield, requiredPermission: PERMISSIONS.USER_READ },
        { name: 'Role Management', href: '/role-management', icon: Shield, requiredPermission: PERMISSIONS.ADMIN_ACCESS },
        { name: 'Tenant Management', href: '/admin/tenant-management', icon: Building, requiredPermission: PERMISSIONS.TENANT_READ },
        { name: 'Tenant Features', href: '/tenant-features', icon: Settings, requiredPermission: PERMISSIONS.ADMIN_ACCESS },
        { name: 'Employee Directory', href: '/employee-directory', icon: Users, requiredPermission: PERMISSIONS.EMPLOYEE_READ },
        { name: 'Benefits Management', href: '/benefits', icon: Building, requiredPermission: PERMISSIONS.BENEFITS_MANAGE },
        { name: 'Payroll Management', href: '/payroll', icon: DollarSign, requiredPermission: PERMISSIONS.PAYROLL_MANAGE },
      ],
    },
  ]

  // -----------------------------
  // Supabase user (best-effort)
  // -----------------------------
  useEffect(() => {
    const getCurrentUser = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser()
        setUser(user)
      } catch {
        setUser({ email: 'demo@company.com' })
      }
    }
    getCurrentUser()

    const setupAuthListener = async () => {
      try {
        const { data: { subscription } } = supabase.auth.onAuthStateChange((_evt: any, session: any) => {
          setUser(session?.user || null)
        })
        return () => subscription.unsubscribe()
      } catch {
        return () => {}
      }
    }
    setupAuthListener()

    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Element
      if (!target.closest('.profile-dropdown')) setProfileDropdownOpen(false)
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleSignOut = async () => {
    try {
      await supabase.auth.signOut()
      router.push('/login')
    } catch {
      router.push('/login')
    }
  }

  const toggleGroup = (groupId: string) => {
    setExpandedGroups(prev =>
      prev.includes(groupId) ? prev.filter(id => id !== groupId) : [...prev, groupId]
    )
  }

  const isActiveItem = (href: string) => pathname === href

  const getActiveGroup = () => {
    for (const group of navigationGroups) {
      if (group.items.some((item) => item.href === pathname)) return group.id
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

  // -----------------------------
  // Feature mapper for routes
  // -----------------------------
  function featureForHref(href: string) {
    // Work Requests
    if (href.startsWith('/work-requests')) return FEATURES.WORK_REQUESTS
    
    // Project Management
    if (href.startsWith('/project-management')) return FEATURES.PROJECT_MANAGEMENT
    
    // Customer Portal
    if (href.startsWith('/customer/projects')) return FEATURES.CUSTOMER_PROJECTS
    if (href.startsWith('/customer/portfolio')) return FEATURES.CUSTOMER_PORTFOLIO
    if (href.startsWith('/customer/notifications')) return FEATURES.CUSTOMER_NOTIFICATIONS
    
    // Reporting & Analytics
    if (href.startsWith('/reporting')) return FEATURES.REPORTING
    if (href.startsWith('/hr-analytics')) return FEATURES.HR_ANALYTICS
    if (href.startsWith('/analytics')) return FEATURES.ANALYTICS
    
    // Talent Management
    if (href === '/talent') return FEATURES.TALENT_DASHBOARD
    if (href.startsWith('/talent/jobs')) return FEATURES.TALENT_JOBS
    if (href.startsWith('/talent/candidates')) return FEATURES.TALENT_CANDIDATES
    if (href.startsWith('/talent/pipeline')) return FEATURES.TALENT_PIPELINE
    if (href.startsWith('/talent/interviews')) return FEATURES.TALENT_INTERVIEWS
    if (href.startsWith('/talent/offers')) return FEATURES.TALENT_OFFERS
    
    // ETL Cockpit
    if (href === '/dashboard') return FEATURES.ETL_DASHBOARD
    if (href.startsWith('/jobs')) return FEATURES.ETL_JOBS
    if (href.startsWith('/audit')) return FEATURES.AUDIT_LOG
    
    // Employee Management
    if (href.startsWith('/employees')) return FEATURES.EMPLOYEE_RECORDS
    if (href.startsWith('/employee-directory')) return FEATURES.EMPLOYEE_RECORDS
    
    // Data Management
    if (href.startsWith('/upload')) return FEATURES.FILE_UPLOAD
    if (href.startsWith('/validation')) return FEATURES.DATA_VALIDATION
    
    // Configuration
    if (href.startsWith('/system-health')) return FEATURES.SYSTEM_HEALTH
    if (href.startsWith('/settings')) return FEATURES.SYSTEM_SETTINGS
    if (href.startsWith('/api-config')) return FEATURES.API_CONFIG
    if (href.startsWith('/integrations')) return FEATURES.INTEGRATIONS
    
    // Administration
    if (href.startsWith('/admin/access-control')) return FEATURES.ACCESS_CONTROL
    if (href.startsWith('/role-management')) return FEATURES.ACCESS_CONTROL
    if (href.startsWith('/admin/tenant-management')) return FEATURES.TENANT_MANAGEMENT
    if (href.startsWith('/benefits')) return FEATURES.BENEFITS
    if (href.startsWith('/payroll')) return FEATURES.PAYROLL
    
    // Default fallback
    return FEATURES.WORK_REQUESTS
  }

  // Show ALL groups/items, but mark unauthorized ones for grayed-out display
  const filteredNavigationGroups = useMemo(() => {
    if (permissionsloading) return []

    // Return all groups with all items - we'll handle authorization in rendering
    return navigationGroups.map((group) => ({
      ...group,
      items: group.items.map((item) => {
        const feature = featureForHref(item.href)
        const isAuthorized = canAccessFeature(feature)
        console.log(`🔍 Navigation check: ${item.name} (${item.href}) → feature: "${feature}" → authorized: ${isAuthorized}`)
        return {
          ...item,
          isAuthorized
        }
      })
    }))
  }, [permissionsloading, canAccessFeature]) // nav config is static

  if (permissionsloading) {
    return (
      <div className="flex items-center justify-center h-screen w-screen bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">loading permissions...</p>
        </div>
      </div>
    )
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
        className={`fixed inset-y-0 left-0 z-50 w-64 md:w-56 lg:w-60 bg-white shadow-lg transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-0 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="flex items-center justify-between h-14 md:h-16 px-3 md:px-6 border-b border-gray-200 flex-shrink-0">
            <div className="flex items-center">
              <Building2 className="h-6 w-6 md:h-8 md:w-8 text-blue-600" />
              <span className="ml-2 text-lg md:text-xl font-bold text-gray-900">HelixBridge</span>
            </div>
            <button
              onClick={() => setSidebarOpen(false)}
              className="lg:hidden p-1 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100"
            >
              <X className="h-6 w-6" />
            </button>
          </div>

          {/* Search */}
          <div className="p-2 md:p-4 border-b border-gray-200 flex-shrink-0">
            <div className="relative">
              <Search className="absolute left-2 md:left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search navigation..."
                className="w-full pl-8 md:pl-10 pr-3 md:pr-4 py-1.5 md:py-2 border border-gray-300 rounded-md text-xs md:text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-2 md:px-4 py-2 md:py-4 space-y-2 md:space-y-3 overflow-y-auto">
            {filteredNavigationGroups.map((group) => {
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
                      {isExpanded ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                    </div>
                  </button>

                  {/* Group Items */}
                  <div
                    className={`transition-all duration-300 ease-in-out overflow-hidden ${
                      isExpanded ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
                    }`}
                  >
                    <div className="ml-4 pl-4 border-l-2 border-gray-100 space-y-1 pt-2">
                      {group.items.map((item: any) => {
                        const ItemIcon = item.icon
                        const isActive = isActiveItem(item.href)
                        const isAuthorized = item.isAuthorized !== false
                        
                        // Debug logging for payroll
                        if (item.name === 'Payroll Management') {
                          console.log('🔧 Rendering Payroll Management:', {
                            itemName: item.name,
                            itemIsAuthorized: item.isAuthorized,
                            computedIsAuthorized: isAuthorized,
                            href: item.href
                          })
                        }

                        const content = (
                          <>
                            <ItemIcon className="h-4 w-4 mr-3" />
                            <span className="flex-1">{item.name}</span>
                            {!isAuthorized && (
                              <span className="ml-2 text-xs" title="Access restricted">🔒</span>
                            )}
                            {item.isNew && isAuthorized && (
                              <span className="ml-2 px-2 py-1 text-xs font-medium bg-green-100 text-green-800 rounded-full">
                                New
                              </span>
                            )}
                            {item.badge && isAuthorized && (
                              <span className="ml-2 px-2 py-1 text-xs font-medium bg-gray-100 text-gray-800 rounded-full">
                                {item.badge}
                              </span>
                            )}
                          </>
                        )

                        if (!isAuthorized) {
                          return (
                            <div
                              key={item.name}
                              className="flex items-center px-3 py-2 text-sm rounded-md text-gray-300 bg-gray-50 cursor-not-allowed opacity-60"
                              title={`Access restricted. Contact your administrator for ${item.name} access.`}
                            >
                              {content}
                            </div>
                          )
                        }

                        return (
                          <Link
                            key={item.name}
                            href={item.href}
                            className={`flex items-center px-3 py-2 text-sm rounded-md transition-all duration-200 ${
                              isActive
                                ? `${group.bgColor} text-white shadow-md`
                                : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900 hover:shadow-sm'
                            }`}
                          >
                            {content}
                          </Link>
                        )
                      })}
                    </div>
                  </div>
                </div>
              )
            })}
          </nav>

          {/* User Profile */}
          <div className="border-t border-gray-200 p-2 md:p-4 flex-shrink-0">
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
          <div className="flex items-center justify-between h-12 md:h-14 px-4 md:px-6">
            <button
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden p-1 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100"
            >
              <Menu className="h-6 w-6" />
            </button>

            <div className="flex items-center space-x-4">
              <NotificationBell />
              <div className="h-6 w-px bg-gray-300" />

              {/* User Profile Dropdown */}
              <div className="relative">
                <button
                  onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
                  className="flex items-center space-x-3 p-2 rounded-lg hover:bg-gray-100 transition-colors border border-gray-200 hover:border-gray-300"
                >
                  <div className="h-8 w-8 rounded-full bg-blue-600 flex items-center justify-center">
                    <User className="h-4 w-4 text-white" />
                  </div>
                  <div className="flex flex-col items-start">
                    <span className="text-xs text-gray-500 uppercase tracking-wide">Profile</span>
                    <span className="text-sm font-medium text-gray-900 truncate max-w-32">
                      {user?.email || 'demo@company.com'}
                    </span>
                  </div>
                  <ChevronDown className="h-4 w-4 text-gray-400 ml-2" />
                </button>

                {profileDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-56 bg-white rounded-md shadow-lg ring-1 ring-black ring-opacity-5 z-50 profile-dropdown">
                    <div className="py-1">
                      <div className="px-4 py-3 border-b border-gray-100">
                        <p className="text-sm font-medium text-gray-900 truncate">
                          {user?.email || 'demo@company.com'}
                        </p>
                        <p className="text-xs text-gray-500">
                          {user?.user_metadata?.full_name || 'User Account'}
                        </p>
                      </div>

                      <Link
                        href="/profile"
                        className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
                        onClick={() => setProfileDropdownOpen(false)}
                      >
                        <Settings className="h-4 w-4 mr-3 text-gray-400" />
                        Settings
                      </Link>
                      <button
                        onClick={handleSignOut}
                        className="w-full flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
                      >
                        <LogOut className="h-4 w-4 mr-3 text-gray-400" />
                        Sign out
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        <main className="flex-1 overflow-y-auto">{children}</main>
      </div>
    </div>
  )
}
