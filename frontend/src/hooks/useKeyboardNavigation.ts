'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'

interface NavigationItem {
  href: string
  name: string
  isAuthorized?: boolean
}

interface UseKeyboardNavigationProps {
  items: NavigationItem[]
  currentPath: string
  enabled?: boolean
}

export function useKeyboardNavigation({
  items,
  currentPath,
  enabled = true,
}: UseKeyboardNavigationProps) {
  const router = useRouter()
  const [showHint, setShowHint] = useState(false)

  useEffect(() => {
    if (!enabled) return

    const handleKeyDown = (e: KeyboardEvent) => {
      // Only handle if no input is focused
      if (
        document.activeElement?.tagName === 'INPUT' ||
        document.activeElement?.tagName === 'TEXTAREA' ||
        document.activeElement?.getAttribute('contenteditable') === 'true'
      ) {
        return
      }

      // Filter authorized items
      const authorizedItems = items.filter(item => item.isAuthorized !== false)
      const currentIndex = authorizedItems.findIndex(item => item.href === currentPath)

      switch (e.key) {
        case 'j':
        case 'ArrowDown':
          // Navigate to next item
          e.preventDefault()
          if (currentIndex < authorizedItems.length - 1) {
            router.push(authorizedItems[currentIndex + 1].href)
            setShowHint(true)
            setTimeout(() => setShowHint(false), 2000)
          }
          break

        case 'k':
        case 'ArrowUp':
          // Navigate to previous item
          e.preventDefault()
          if (currentIndex > 0) {
            router.push(authorizedItems[currentIndex - 1].href)
            setShowHint(true)
            setTimeout(() => setShowHint(false), 2000)
          }
          break

        case 'g':
          // Go to first item (gg pattern)
          if (e.shiftKey) {
            e.preventDefault()
            if (authorizedItems.length > 0) {
              router.push(authorizedItems[authorizedItems.length - 1].href)
              setShowHint(true)
              setTimeout(() => setShowHint(false), 2000)
            }
          } else {
            e.preventDefault()
            if (authorizedItems.length > 0) {
              router.push(authorizedItems[0].href)
              setShowHint(true)
              setTimeout(() => setShowHint(false), 2000)
            }
          }
          break

        case 'h':
          // Go to home/dashboard
          e.preventDefault()
          router.push('/dashboard')
          setShowHint(true)
          setTimeout(() => setShowHint(false), 2000)
          break

        case '?':
          // Show keyboard shortcuts help
          e.preventDefault()
          setShowHint(prev => !prev)
          break
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [items, currentPath, enabled, router])

  return { showHint, setShowHint }
}
