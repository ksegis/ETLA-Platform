'use client'

import React, { useState, useEffect, useRef, useMemo } from 'react'
import { Search, X, Clock, Star, TrendingUp } from 'lucide-react'
import { useRouter } from 'next/navigation'

interface NavigationItem {
  id: string
  name: string
  href: string
  category: string
  subCategory?: string
  icon?: any
  keywords?: string[]
}

interface NavigationSearchProps {
  items: NavigationItem[]
  isOpen: boolean
  onClose: () => void
  recentItems?: string[]
  favoriteItems?: string[]
  onNavigate?: (href: string) => void
}

export default function NavigationSearch({
  items,
  isOpen,
  onClose,
  recentItems = [],
  favoriteItems = [],
  onNavigate,
}: NavigationSearchProps) {
  const [query, setQuery] = useState('')
  const [selectedIndex, setSelectedIndex] = useState(0)
  const inputRef = useRef<HTMLInputElement>(null)
  const listRef = useRef<HTMLDivElement>(null)
  const router = useRouter()

  // Filter items based on search query
  const filteredItems = useMemo(() => {
    if (!query.trim()) {
      // Show recent and favorites when no query
      const recent = items.filter(item => recentItems.includes(item.id))
      const favorites = items.filter(item => favoriteItems.includes(item.id))
      return { recent, favorites, results: [] }
    }

    const lowerQuery = query.toLowerCase()
    const results = items.filter(item => {
      const nameMatch = item.name.toLowerCase().includes(lowerQuery)
      const categoryMatch = item.category.toLowerCase().includes(lowerQuery)
      const subCategoryMatch = item.subCategory?.toLowerCase().includes(lowerQuery)
      const keywordMatch = item.keywords?.some(k => k.toLowerCase().includes(lowerQuery))
      
      return nameMatch || categoryMatch || subCategoryMatch || keywordMatch
    })

    // Sort by relevance
    results.sort((a, b) => {
      const aNameMatch = a.name.toLowerCase().startsWith(lowerQuery)
      const bNameMatch = b.name.toLowerCase().startsWith(lowerQuery)
      if (aNameMatch && !bNameMatch) return -1
      if (!aNameMatch && bNameMatch) return 1
      return 0
    })

    return { recent: [], favorites: [], results }
  }, [query, items, recentItems, favoriteItems])

  const allDisplayItems = [
    ...filteredItems.favorites,
    ...filteredItems.recent,
    ...filteredItems.results,
  ]

  // Focus input when opened
  useEffect(() => {
    if (isOpen) {
      inputRef.current?.focus()
      setQuery('')
      setSelectedIndex(0)
    }
  }, [isOpen])

  // Handle keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return

      switch (e.key) {
        case 'ArrowDown':
          e.preventDefault()
          setSelectedIndex(prev => Math.min(prev + 1, allDisplayItems.length - 1))
          break
        case 'ArrowUp':
          e.preventDefault()
          setSelectedIndex(prev => Math.max(prev - 1, 0))
          break
        case 'Enter':
          e.preventDefault()
          if (allDisplayItems[selectedIndex]) {
            handleNavigate(allDisplayItems[selectedIndex].href)
          }
          break
        case 'Escape':
          e.preventDefault()
          onClose()
          break
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [isOpen, selectedIndex, allDisplayItems, onClose])

  // Scroll selected item into view
  useEffect(() => {
    if (listRef.current) {
      const selectedElement = listRef.current.children[selectedIndex] as HTMLElement
      if (selectedElement) {
        selectedElement.scrollIntoView({ block: 'nearest', behavior: 'smooth' })
      }
    }
  }, [selectedIndex])

  const handleNavigate = (href: string) => {
    onNavigate?.(href)
    router.push(href)
    onClose()
    
    // Track as recent (would be saved to localStorage in real implementation)
    console.log('Navigated to:', href)
  }

  if (!isOpen) return null

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 z-50 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Search Modal */}
      <div className="fixed top-[10%] left-1/2 -translate-x-1/2 w-full max-w-2xl z-50 px-4">
        <div className="bg-white rounded-lg shadow-2xl border border-gray-200 overflow-hidden">
          {/* Search Input */}
          <div className="flex items-center gap-3 px-4 py-3 border-b border-gray-200">
            <Search className="h-5 w-5 text-gray-400 flex-shrink-0" />
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search navigation... (Type to search)"
              className="flex-1 outline-none text-gray-900 placeholder-gray-400"
            />
            <button
              onClick={onClose}
              className="p-1 hover:bg-gray-100 rounded transition-colors"
            >
              <X className="h-5 w-5 text-gray-400" />
            </button>
          </div>

          {/* Results */}
          <div
            ref={listRef}
            className="max-h-[60vh] overflow-y-auto"
          >
            {/* Favorites Section */}
            {!query && filteredItems.favorites.length > 0 && (
              <div className="py-2">
                <div className="px-4 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wide flex items-center gap-2">
                  <Star className="h-3 w-3" />
                  Favorites
                </div>
                {filteredItems.favorites.map((item, index) => (
                  <SearchResultItem
                    key={item.id}
                    item={item}
                    isSelected={index === selectedIndex}
                    onClick={() => handleNavigate(item.href)}
                    icon={<Star className="h-4 w-4 text-yellow-500" />}
                  />
                ))}
              </div>
            )}

            {/* Recent Section */}
            {!query && filteredItems.recent.length > 0 && (
              <div className="py-2">
                <div className="px-4 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wide flex items-center gap-2">
                  <Clock className="h-3 w-3" />
                  Recent
                </div>
                {filteredItems.recent.map((item, index) => {
                  const adjustedIndex = index + filteredItems.favorites.length
                  return (
                    <SearchResultItem
                      key={item.id}
                      item={item}
                      isSelected={adjustedIndex === selectedIndex}
                      onClick={() => handleNavigate(item.href)}
                      icon={<Clock className="h-4 w-4 text-gray-400" />}
                    />
                  )
                })}
              </div>
            )}

            {/* Search Results */}
            {query && filteredItems.results.length > 0 && (
              <div className="py-2">
                <div className="px-4 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wide flex items-center gap-2">
                  <TrendingUp className="h-3 w-3" />
                  Results ({filteredItems.results.length})
                </div>
                {filteredItems.results.map((item, index) => (
                  <SearchResultItem
                    key={item.id}
                    item={item}
                    isSelected={index === selectedIndex}
                    onClick={() => handleNavigate(item.href)}
                    query={query}
                  />
                ))}
              </div>
            )}

            {/* No Results */}
            {query && filteredItems.results.length === 0 && (
              <div className="py-12 text-center">
                <Search className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-500 font-medium">No results found</p>
                <p className="text-sm text-gray-400 mt-1">
                  Try searching with different keywords
                </p>
              </div>
            )}

            {/* Empty State */}
            {!query && filteredItems.favorites.length === 0 && filteredItems.recent.length === 0 && (
              <div className="py-12 text-center">
                <Search className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-500 font-medium">Start typing to search</p>
                <p className="text-sm text-gray-400 mt-1">
                  Search across all navigation items
                </p>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="px-4 py-2 border-t border-gray-200 bg-gray-50 flex items-center justify-between text-xs text-gray-500">
            <div className="flex items-center gap-4">
              <span className="flex items-center gap-1">
                <kbd className="px-1.5 py-0.5 bg-white border border-gray-300 rounded text-xs">↑</kbd>
                <kbd className="px-1.5 py-0.5 bg-white border border-gray-300 rounded text-xs">↓</kbd>
                to navigate
              </span>
              <span className="flex items-center gap-1">
                <kbd className="px-1.5 py-0.5 bg-white border border-gray-300 rounded text-xs">Enter</kbd>
                to select
              </span>
              <span className="flex items-center gap-1">
                <kbd className="px-1.5 py-0.5 bg-white border border-gray-300 rounded text-xs">Esc</kbd>
                to close
              </span>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}

// Search Result Item Component
interface SearchResultItemProps {
  item: NavigationItem
  isSelected: boolean
  onClick: () => void
  icon?: React.ReactNode
  query?: string
}

function SearchResultItem({ item, isSelected, onClick, icon, query }: SearchResultItemProps) {
  const highlightText = (text: string, query?: string) => {
    if (!query) return text

    const parts = text.split(new RegExp(`(${query})`, 'gi'))
    return parts.map((part, i) =>
      part.toLowerCase() === query.toLowerCase() ? (
        <mark key={i} className="bg-yellow-200 text-gray-900">
          {part}
        </mark>
      ) : (
        part
      )
    )
  }

  return (
    <button
      onClick={onClick}
      className={`w-full px-4 py-3 flex items-center gap-3 transition-colors ${
        isSelected ? 'bg-blue-50 border-l-2 border-blue-600' : 'hover:bg-gray-50'
      }`}
    >
      {icon && <div className="flex-shrink-0">{icon}</div>}
      <div className="flex-1 text-left">
        <div className="font-medium text-gray-900">
          {highlightText(item.name, query)}
        </div>
        <div className="text-xs text-gray-500 mt-0.5">
          {item.category}
          {item.subCategory && ` › ${item.subCategory}`}
        </div>
      </div>
      {isSelected && (
        <kbd className="px-2 py-1 bg-white border border-gray-300 rounded text-xs text-gray-600">
          Enter
        </kbd>
      )}
    </button>
  )
}
