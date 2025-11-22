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
  Download,
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
  User,
  Wand2,
  Clock,
  Layers,
  Zap
} from 'lucide-react'
import { usePermissions } from '@/hooks/usePermissions'
import { FEATURES, PERMISSIONS } from '@/rbac/constants'
import NotificationBell from '@/components/notifications/NotificationBell'
import NavigationSearch from '@/components/navigation/NavigationSearch'
import FavoritesPanel from '@/components/navigation/FavoritesPanel'
import FavoriteButton from '@/components/navigation/FavoriteButton'
import Breadcrumbs from '@/components/navigation/Breadcrumbs'
import { useNavigationSearch } from '@/hooks/useNavigationSearch'
import { useFavorites } from '@/hooks/useFavorites'

interface NavigationItem {
  name: string
  href: string
  icon: any
  badge?: string
  isNew?: boolean
}

interface NavigationSubGroup {
  title: string
  items: NavigationItem[]
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
  subGroups?: NavigationSubGroup[]
  items?: NavigationItem[]
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
    'etl-platform',
  ])
  const [expandedSubGroups, setExpandedSubGroups] = useState<string[]>([])

  const router = useRouter()
  const pathname = usePathname()

  const {
    canAccessFeature,
    loading: permissionsLoading,
  } = usePermissions()

  const { isOpen: searchOpen, open: openSearch, close: closeSearch } = useNavigationSearch()
  const { favorites, toggleFavorite, isFavorite, reorderFavorites } = useFavorites()

  // ============================================================================
  // REDESIGNED NAVIGATION STRUCTURE
  // ============================================================================
  const navigationGroups: NavigationGroup[] = [
    // -------------------------------------------------------------------------
    // 1. OPERATIONS & PROJECTS
    // -------------------------------------------------------------------------
    {
      id: 'operations',
      title: 'Operations & Projects',
      icon: Briefcase,
      color: 'text-blue-600',
      bgColor: 'bg-blue-600',
      hoverColor: 'hover:bg-blue-50',
      textColor: 'text-blue-900',
      defaultExpanded: true,
      subGroups: [
        {
          title: 'Work Management',
          items: [
            { name: 'Work Requests', href: '/work-requests', icon: FileText },
            { name: 'Project Management', href: '/project-management', icon: Calendar },
            { name: 'My Projects', href: '/customer/projects', icon: Briefcase, isNew: true },
            { name: 'Portfolio Overview', href: '/customer/portfolio', icon: PieChart, isNew: true },
          ],
        },
        {
          title: 'Reporting & Analytics',
          items: [
            { name: 'Reporting', href: '/reporting', icon: TrendingUp },
            { name: 'HR Analytics Dashboard', href: '/hr-analytics', icon: PieChart, isNew: true },
          ],
        },
      ],
    },

    // -------------------------------------------------------------------------
    // 2. TALENT & RECRUITMENT
    // -------------------------------------------------------------------------
    {
      id: 'talent',
      title: 'Talent & Recruitment',
      icon: Users2,
      color: 'text-emerald-600',
      bgColor: 'bg-emerald-600',
      hoverColor: 'hover:bg-emerald-50',
      textColor: 'text-emerald-900',
      items: [
        { name: 'Talent Dashboard', href: '/talent', icon: BarChart3 },
        { name: 'Job Postings', href: '/talent/jobs', icon: Briefcase },
        { name: 'Candidates', href: '/talent/candidates', icon: Users },
        { name: 'Pipeline', href: '/talent/pipeline', icon: TrendingUp },
        { name: 'Interviews', href: '/talent/interviews', icon: Calendar },
        { name: 'Offers', href: '/talent/offers', icon: FileText },
      ],
    },

    // -------------------------------------------------------------------------
    // 3. ETL & DATA PLATFORM
    // -------------------------------------------------------------------------
    {
      id: 'etl-platform',
      title: 'ETL & Data Platform',
      icon: Database,
      color: 'text-green-600',
      bgColor: 'bg-green-600',
      hoverColor: 'hover:bg-green-50',
      textColor: 'text-green-900',
      defaultExpanded: true,
      subGroups: [
        {
          title: 'Monitoring & Insights',
          items: [
            { name: 'ETL Dashboard', href: '/dashboard', icon: BarChart3 },
            { name: 'Progress Monitor', href: '/progress', icon: Activity, isNew: true },
            { name: 'Audit Trail', href: '/audit', icon: Eye },
            { name: 'System Health', href: '/system-health', icon: Activity },
          ],
        },
        {
          title: 'Data Processing',
          items: [
            { name: 'Talent Data Import', href: '/talent-import', icon: Download, isNew: true },
            { name: 'Employee Data Processing', href: '/employees', icon: Users },
            { name: 'Job Management', href: '/jobs', icon: Briefcase },
            { name: 'File Upload', href: '/upload', icon: Upload },
          ],
        },
        {
          title: 'Configuration & Tools',
          items: [
            { name: 'Scheduling', href: '/scheduling', icon: Clock, isNew: true },
            { name: 'Transformations', href: '/transformations', icon: Wand2, isNew: true },
            { name: 'Data Validation', href: '/validation', icon: CheckCircle, isNew: true },
            { name: 'Data Analytics', href: '/analytics', icon: Database },
          ],
        },
      ],
    },

    // -------------------------------------------------------------------------
    // 4. SYSTEM CONFIGURATION
    // -------------------------------------------------------------------------
    {
      id: 'configuration',
      title: 'System Configuration',
      icon: Settings,
      color: 'text-purple-600',
      bgColor: 'bg-purple-600',
      hoverColor: 'hover:bg-purple-50',
      textColor: 'text-purple-900',
      items: [
        { name: 'System Settings', href: '/configuration/system-settings', icon: Settings },
        { name: 'API Configuration', href: '/configuration/api-configuration', icon: Zap },
        { name: 'Integration Settings', href: '/configuration/integration-settings', icon: Layers },
      ],
    },

    // -------------------------------------------------------------------------
    // 5. ADMINISTRATION
    // -------------------------------------------------------------------------
    {
      id: 'administration',
      title: 'Administration',
      icon: Shield,
      color: 'text-orange-600',
      bgColor: 'bg-orange-600',
      hoverColor: 'hover:bg-orange-50',
      textColor: 'text-orange-900',
      subGroups: [
        {
          title: 'Access & Security',
          items: [
            { name: 'Access Control', href: '/admin/access-control', icon: Shield },
            { name: 'Role Management', href: '/role-management', icon: Shield, isNew: true },
            { name: 'Tenant Management', href: '/admin/tenant-management', icon: Building },
            { name: 'Tenant Features', href: '/tenant-features', icon: Settings, isNew: true },
          ],
        },
        {
          title: 'HR & Payroll',
          items: [
            { name: 'Employee Directory', href: '/employee-directory', icon: Users },
            { name: 'Benefits Management', href: '/benefits', icon: Building },
            { name: 'Payroll Management', href: '/payroll', icon: DollarSign },
          ],
        },
      ],
    },
  ]

  // ============================================================================
  // USER & AUTH
  // ============================================================================
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

  // ============================================================================
  // NAVIGATION HELPERS
  // ============================================================================
  const toggleGroup = (groupId: string) => {
    setExpandedGroups(prev =>
      prev.includes(groupId) ? prev.filter(id => id !== groupId) : [...prev, groupId]
    )
  }

  const toggleSubGroup = (subGroupKey: string) => {
    setExpandedSubGroups(prev =>
      prev.includes(subGroupKey) ? prev.filter(key => key !== subGroupKey) : [...prev, subGroupKey]
    )
  }

  const isActiveItem = (href: string) => pathname === href

  const getActiveGroup = () => {
    for (const group of navigationGroups) {
      if (group.items?.some((item) => item.href === pathname)) return group.id
      if (group.subGroups?.some(sg => sg.items.some(item => item.href === pathname))) return group.id
    }
    return null
  }

  // Auto-expand group containing current page
  useEffect(() => {
    const activeGroup = getActiveGroup()
    if (activeGroup && !expandedGroups.includes(activeGroup)) {
      setExpandedGroups(prev => [...prev, activeGroup])
    }

    // Auto-expand sub-group containing current page
    navigationGroups.forEach(group => {
      group.subGroups?.forEach((subGroup, idx) => {
        if (subGroup.items.some(item => item.href === pathname)) {
          const subGroupKey = `${group.id}-subgroup-${idx}`
          if (!expandedSubGroups.includes(subGroupKey)) {
            setExpandedSubGroups(prev => [...prev, subGroupKey])
          }
        }
      })
    })
  }, [pathname])

  // ============================================================================
  // FEATURE MAPPER
  // ============================================================================
  function featureForHref(href: string): string {
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
    
    // ETL Platform
    if (href === '/dashboard') return FEATURES.ETL_DASHBOARD
    if (href.startsWith('/progress')) return FEATURES.ETL_PROGRESS_MONITOR
    if (href.startsWith('/talent-import')) return FEATURES.TALENT_DATA_IMPORT
    if (href.startsWith('/jobs')) return FEATURES.ETL_JOBS
    if (href.startsWith('/audit')) return FEATURES.AUDIT_LOG
    if (href.startsWith('/scheduling')) return FEATURES.ETL_SCHEDULING
    if (href.startsWith('/transformations')) return FEATURES.DATA_TRANSFORMATIONS
    if (href.startsWith('/validation')) return FEATURES.DATA_VALIDATION
    
    // Employee Management
    if (href.startsWith('/employees')) return FEATURES.EMPLOYEE_RECORDS
    if (href.startsWith('/employee-directory')) return FEATURES.EMPLOYEE_RECORDS
    
    // Data Management
    if (href.startsWith('/upload')) return FEATURES.FILE_UPLOAD
    
    // Configuration
    if (href.startsWith('/configuration/system-settings')) return FEATURES.SYSTEM_SETTINGS
    if (href.startsWith('/configuration/api-configuration')) return FEATURES.API_CONFIG
    if (href.startsWith('/configuration/integration-settings')) return FEATURES.INTEGRATIONS
    if (href.startsWith('/system-health')) return FEATURES.SYSTEM_HEALTH
    
    // Administration
    if (href.startsWith('/admin/access-control')) return FEATURES.ACCESS_CONTROL
    if (href.startsWith('/role-management')) return FEATURES.ROLE_MANAGEMENT
    if (href.startsWith('/admin/tenant-management')) return FEATURES.TENANT_MANAGEMENT
    if (href.startsWith('/tenant-features')) return FEATURES.TENANT_FEATURES
    if (href.startsWith('/benefits')) return FEATURES.BENEFITS
    if (href.startsWith('/payroll')) return FEATURES.PAYROLL
    
    // Default fallback
    return FEATURES.WORK_REQUESTS
  }

  // ============================================================================
  // FILTER NAVIGATION WITH RBAC
  // ============================================================================
  const filteredNavigationGroups = useMemo(() => {
    if (permissionsLoading) return []

    return navigationGroups.map((group) => {
      // Handle flat items
      const filteredItems = group.items?.map((item) => {
        const feature = featureForHref(item.href)
        const isAuthorized = canAccessFeature(feature)
        return { ...item, isAuthorized }
      })

      // Handle sub-groups
      const filteredSubGroups = group.subGroups?.map((subGroup) => ({
        ...subGroup,
        items: subGroup.items.map((item) => {
          const feature = featureForHref(item.href)
          const isAuthorized = canAccessFeature(feature)
          return { ...item, isAuthorized }
        })
      }))

      return {
        ...group,
        items: filteredItems,
        subGroups: filteredSubGroups,
      }
    })
  }, [permissionsLoading, canAccessFeature])

  // ============================================================================
  // PREPARE SEARCH ITEMS
  // ============================================================================
  const searchItems = useMemo(() => {
    const items: any[] = []
    
    filteredNavigationGroups.forEach(group => {
      // Add flat items
      group.items?.forEach(item => {
        if (item.isAuthorized !== false) {
          items.push({
            id: item.href,
            name: item.name,
            href: item.href,
            category: group.title,
            icon: item.icon,
            keywords: [group.title.toLowerCase(), item.name.toLowerCase()]
          })
        }
      })
      
      // Add sub-group items
      group.subGroups?.forEach(subGroup => {
        subGroup.items.forEach(item => {
          if (item.isAuthorized !== false) {
            items.push({
              id: item.href,
              name: item.name,
              href: item.href,
              category: group.title,
              subCategory: subGroup.title,
              icon: item.icon,
              keywords: [
                group.title.toLowerCase(),
                subGroup.title.toLowerCase(),
                item.name.toLowerCase()
              ]
            })
          }
        })
      })
    })
    
    return items
  }, [filteredNavigationGroups])

  // ============================================================================
  // PREPARE FAVORITES ITEMS
  // ============================================================================
  const favoriteItems = useMemo(() => {
    return searchItems.filter(item => favorites.includes(item.href))
  }, [searchItems, favorites])

  if (permissionsLoading) {
    return (
      <div className="flex items-center justify-center h-screen w-screen bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading permissions...</p>
        </div>
      </div>
    )
  }

  // ============================================================================
  // RENDER NAVIGATION ITEM
  // ============================================================================
  const renderNavigationItem = (item: any, group: NavigationGroup) => {
    const ItemIcon = item.icon
    const isActive = isActiveItem(item.href)
    const isAuthorized = item.isAuthorized !== false

    const content = (
      <>
        <ItemIcon className="h-4 w-4 mr-3 flex-shrink-0" />
        <span className="flex-1 truncate">{item.name}</span>
        {!isAuthorized && (
          <span className="ml-2 text-xs" title="Access restricted">🔒</span>
        )}
        {item.isNew && isAuthorized && (
          <span className="ml-2 px-2 py-0.5 text-xs font-medium bg-green-100 text-green-800 rounded-full">
            New
          </span>
        )}
        {item.badge && isAuthorized && (
          <span className="ml-2 px-2 py-0.5 text-xs font-medium bg-gray-100 text-gray-800 rounded-full">
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
        className={`fixed inset-y-0 left-0 z-50 w-64 md:w-56 lg:w-64 bg-white shadow-lg transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-0 ${
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
            <button
              onClick={openSearch}
              className="w-full flex items-center gap-2 px-3 py-2 border border-gray-300 rounded-md text-sm text-gray-500 hover:bg-gray-50 hover:border-gray-400 transition-colors"
            >
              <Search className="h-4 w-4 text-gray-400" />
              <span className="flex-1 text-left">Search navigation...</span>
              <kbd className="hidden md:inline-block px-2 py-0.5 text-xs bg-gray-100 border border-gray-300 rounded">
                ⌘K
              </kbd>
            </button>
          </div>

          {/* Favorites */}
          {favoriteItems.length > 0 && (
            <div className="border-b border-gray-200">
              <FavoritesPanel
                favorites={favoriteItems}
                onRemove={toggleFavorite}
                onReorder={reorderFavorites}
              />
            </div>
          )}

          {/* Navigation */}
          <nav className="flex-1 px-2 md:px-4 py-2 md:py-4 space-y-2 overflow-y-auto">
            {filteredNavigationGroups.map((group) => {
              const isExpanded = expandedGroups.includes(group.id)
              const GroupIcon = group.icon

              return (
                <div key={group.id} className="space-y-1">
                  {/* Group Header */}
                  <button
                    onClick={() => toggleGroup(group.id)}
                    className={`w-full flex items-center justify-between px-3 py-2.5 text-sm font-bold rounded-lg transition-all duration-200 ${group.color} ${group.hoverColor} border border-gray-100 shadow-sm`}
                  >
                    <div className="flex items-center">
                      <GroupIcon className="h-5 w-5 mr-3" />
                      <span className="font-semibold text-sm">{group.title}</span>
                    </div>
                    <div className="transition-transform duration-200">
                      {isExpanded ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                    </div>
                  </button>

                  {/* Group Content */}
                  <div
                    className={`transition-all duration-300 ease-in-out overflow-hidden ${
                      isExpanded ? 'max-h-[2000px] opacity-100' : 'max-h-0 opacity-0'
                    }`}
                  >
                    <div className="ml-2 pl-3 border-l-2 border-gray-100 space-y-1 pt-2">
                      {/* Flat Items */}
                      {group.items?.map((item) => renderNavigationItem(item, group))}

                      {/* Sub-Groups */}
                      {group.subGroups?.map((subGroup, idx) => {
                        const subGroupKey = `${group.id}-subgroup-${idx}`
                        const isSubGroupExpanded = expandedSubGroups.includes(subGroupKey)

                        return (
                          <div key={subGroupKey} className="space-y-1 mt-2">
                            {/* Sub-Group Header */}
                            <button
                              onClick={() => toggleSubGroup(subGroupKey)}
                              className="w-full flex items-center justify-between px-2 py-1.5 text-xs font-semibold text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-md transition-all"
                            >
                              <span>{subGroup.title}</span>
                              <div className="transition-transform duration-200">
                                {isSubGroupExpanded ? (
                                  <ChevronDown className="h-3 w-3" />
                                ) : (
                                  <ChevronRight className="h-3 w-3" />
                                )}
                              </div>
                            </button>

                            {/* Sub-Group Items */}
                            <div
                              className={`transition-all duration-300 ease-in-out overflow-hidden ${
                                isSubGroupExpanded ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
                              }`}
                            >
                              <div className="ml-2 pl-2 border-l border-gray-200 space-y-1">
                                {subGroup.items.map((item) => renderNavigationItem(item, group))}
                              </div>
                            </div>
                          </div>
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

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top Bar */}
        <header className="bg-white shadow-sm z-10 flex-shrink-0">
          <div className="flex items-center justify-between h-14 md:h-16 px-4 md:px-6">
            <button
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100"
            >
              <Menu className="h-6 w-6" />
            </button>

            <div className="flex-1 lg:flex-none" />

            <div className="flex items-center space-x-4">
              <FavoriteButton />
              <NotificationBell />
              
              <div className="relative profile-dropdown">
                <button
                  onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
                  className="flex items-center space-x-2 p-2 rounded-md hover:bg-gray-100"
                >
                  <div className="h-8 w-8 rounded-full bg-blue-600 flex items-center justify-center">
                    <span className="text-sm font-medium text-white">
                      {user?.email?.charAt(0).toUpperCase() || 'U'}
                    </span>
                  </div>
                </button>

                {profileDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-50">
                    <div className="px-4 py-2 border-b border-gray-200">
                      <p className="text-sm font-medium text-gray-900 truncate">
                        {user?.email || 'demo@company.com'}
                      </p>
                    </div>
                    <button
                      onClick={handleSignOut}
                      className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center"
                    >
                      <LogOut className="h-4 w-4 mr-2" />
                      Sign out
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto bg-gray-50">
          {/* Breadcrumbs */}
          <div className="bg-white border-b border-gray-200 px-4 md:px-6 py-3">
            <Breadcrumbs navigationItems={searchItems} />
          </div>
          
          {/* Page Content */}
          <div>
            {children}
          </div>
        </main>
      </div>

      {/* Global Navigation Search */}
      <NavigationSearch
        items={searchItems}
        isOpen={searchOpen}
        onClose={closeSearch}
        favoriteItems={favorites}
      />
    </div>
  )
}
