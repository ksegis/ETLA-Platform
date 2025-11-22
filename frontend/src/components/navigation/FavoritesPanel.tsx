'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { Star, X, GripVertical, Sparkles } from 'lucide-react'
import { usePathname } from 'next/navigation'

interface FavoriteItem {
  id: string
  name: string
  href: string
  category: string
  subCategory?: string
  icon?: any
}

interface FavoritesPanelProps {
  favorites: FavoriteItem[]
  onRemove: (href: string) => void
  onReorder: (newOrder: string[]) => void
}

export default function FavoritesPanel({
  favorites,
  onRemove,
  onReorder,
}: FavoritesPanelProps) {
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null)
  const pathname = usePathname()

  if (favorites.length === 0) {
    return (
      <div className="px-4 py-6 text-center">
        <Sparkles className="h-8 w-8 text-gray-300 mx-auto mb-2" />
        <p className="text-sm text-gray-500 font-medium">No favorites yet</p>
        <p className="text-xs text-gray-400 mt-1">
          Click the star icon on any page to add it here
        </p>
      </div>
    )
  }

  const handleDragStart = (index: number) => {
    setDraggedIndex(index)
  }

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault()
    
    if (draggedIndex === null || draggedIndex === index) return

    const newFavorites = [...favorites]
    const draggedItem = newFavorites[draggedIndex]
    
    // Remove from old position
    newFavorites.splice(draggedIndex, 1)
    
    // Insert at new position
    newFavorites.splice(index, 0, draggedItem)
    
    // Update order
    onReorder(newFavorites.map(f => f.href))
    setDraggedIndex(index)
  }

  const handleDragEnd = () => {
    setDraggedIndex(null)
  }

  return (
    <div className="space-y-1">
      <div className="px-4 py-2 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />
          <span className="text-xs font-semibold text-gray-600 uppercase tracking-wide">
            Favorites
          </span>
        </div>
        <span className="text-xs text-gray-400">
          {favorites.length}/{10}
        </span>
      </div>

      <div className="space-y-1">
        {favorites.map((item, index) => {
          const isActive = pathname === item.href
          const ItemIcon = item.icon

          return (
            <div
              key={item.href}
              draggable
              onDragStart={() => handleDragStart(index)}
              onDragOver={(e) => handleDragOver(e, index)}
              onDragEnd={handleDragEnd}
              className={`group relative ${
                draggedIndex === index ? 'opacity-50' : ''
              }`}
            >
              <Link
                href={item.href}
                className={`flex items-center gap-2 px-3 py-2 rounded-md transition-all duration-200 ${
                  isActive
                    ? 'bg-blue-600 text-white shadow-md'
                    : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'
                }`}
              >
                {/* Drag Handle */}
                <GripVertical
                  className={`h-4 w-4 flex-shrink-0 cursor-grab active:cursor-grabbing ${
                    isActive ? 'text-white/70' : 'text-gray-400'
                  }`}
                />

                {/* Icon */}
                {ItemIcon && (
                  <ItemIcon className="h-4 w-4 flex-shrink-0" />
                )}

                {/* Name */}
                <span className="flex-1 text-sm truncate">{item.name}</span>

                {/* Remove Button */}
                <button
                  onClick={(e) => {
                    e.preventDefault()
                    e.stopPropagation()
                    onRemove(item.href)
                  }}
                  className={`opacity-0 group-hover:opacity-100 p-1 rounded hover:bg-gray-200 transition-opacity ${
                    isActive ? 'hover:bg-white/20' : ''
                  }`}
                  title="Remove from favorites"
                >
                  <X className="h-3 w-3" />
                </button>
              </Link>

              {/* Category Badge (on hover) */}
              <div className="absolute left-full ml-2 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity z-10">
                <div className="bg-gray-900 text-white text-xs px-2 py-1 rounded whitespace-nowrap">
                  {item.category}
                  {item.subCategory && ` › ${item.subCategory}`}
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {/* Hint */}
      <div className="px-4 py-2 text-xs text-gray-400">
        <p>💡 Drag to reorder</p>
      </div>
    </div>
  )
}
