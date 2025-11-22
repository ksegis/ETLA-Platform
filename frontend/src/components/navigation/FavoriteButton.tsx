'use client'

import React from 'react'
import { Star } from 'lucide-react'
import { useFavorites } from '@/hooks/useFavorites'
import { usePathname } from 'next/navigation'

export default function FavoriteButton() {
  const pathname = usePathname()
  const { isFavorite, toggleFavorite, maxFavorites, favorites } = useFavorites()
  
  const isCurrentFavorite = isFavorite(pathname)
  const canAddMore = favorites.length < maxFavorites

  const handleClick = () => {
    if (!isCurrentFavorite && !canAddMore) {
      alert(`You can only have ${maxFavorites} favorites. Remove one to add this page.`)
      return
    }
    toggleFavorite(pathname)
  }

  return (
    <button
      onClick={handleClick}
      className={`p-2 rounded-md transition-colors ${
        isCurrentFavorite
          ? 'text-yellow-500 bg-yellow-50 hover:bg-yellow-100'
          : 'text-gray-400 hover:text-yellow-500 hover:bg-gray-100'
      }`}
      title={isCurrentFavorite ? 'Remove from favorites' : 'Add to favorites'}
    >
      <Star
        className={`h-5 w-5 ${isCurrentFavorite ? 'fill-yellow-500' : ''}`}
      />
    </button>
  )
}
