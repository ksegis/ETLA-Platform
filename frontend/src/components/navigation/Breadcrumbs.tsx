'use client'

import React, { useMemo } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { ChevronRight, Home } from 'lucide-react'

interface BreadcrumbItem {
  label: string
  href: string
}

interface BreadcrumbsProps {
  navigationItems?: Array<{
    name: string
    href: string
    category: string
    subCategory?: string
  }>
}

export default function Breadcrumbs({ navigationItems = [] }: BreadcrumbsProps) {
  const pathname = usePathname()

  const breadcrumbs = useMemo(() => {
    // Find the current page in navigation items
    const currentItem = navigationItems.find(item => item.href === pathname)

    if (!currentItem) {
      // Fallback: Generate breadcrumbs from URL path
      const segments = pathname.split('/').filter(Boolean)
      
      const items: BreadcrumbItem[] = [
        { label: 'Home', href: '/dashboard' }
      ]

      let currentPath = ''
      segments.forEach((segment, index) => {
        currentPath += `/${segment}`
        const label = segment
          .split('-')
          .map(word => word.charAt(0).toUpperCase() + word.slice(1))
          .join(' ')
        
        items.push({
          label,
          href: currentPath
        })
      })

      return items
    }

    // Build breadcrumbs from navigation structure
    const items: BreadcrumbItem[] = [
      { label: 'Home', href: '/dashboard' }
    ]

    // Add category
    items.push({
      label: currentItem.category,
      href: '#' // Categories don't have direct links
    })

    // Add sub-category if exists
    if (currentItem.subCategory) {
      items.push({
        label: currentItem.subCategory,
        href: '#'
      })
    }

    // Add current page
    items.push({
      label: currentItem.name,
      href: currentItem.href
    })

    return items
  }, [pathname, navigationItems])

  // Don't show breadcrumbs on dashboard/home
  if (pathname === '/' || pathname === '/dashboard') {
    return null
  }

  return (
    <nav className="flex items-center space-x-1 text-sm text-gray-600 overflow-x-auto">
      {breadcrumbs.map((item, index) => {
        const isLast = index === breadcrumbs.length - 1
        const isClickable = item.href !== '#' && !isLast

        return (
          <div key={item.href + index} className="flex items-center">
            {index > 0 && (
              <ChevronRight className="h-4 w-4 mx-1 text-gray-400 flex-shrink-0" />
            )}
            
            {index === 0 && (
              <Home className="h-4 w-4 mr-1 text-gray-400" />
            )}

            {isClickable ? (
              <Link
                href={item.href}
                className="hover:text-gray-900 hover:underline transition-colors whitespace-nowrap"
              >
                {item.label}
              </Link>
            ) : (
              <span
                className={`whitespace-nowrap ${
                  isLast ? 'text-gray-900 font-medium' : 'text-gray-500'
                }`}
              >
                {item.label}
              </span>
            )}
          </div>
        )
      })}
    </nav>
  )
}
