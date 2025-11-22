'use client'

import { useState, useEffect } from 'react'

const FAVORITES_KEY = 'helixbridge_nav_favorites'
const MAX_FAVORITES = 10

export function useFavorites() {
  const [favorites, setFavorites] = useState<string[]>([])
  const [loading, setLoading] = useState(true)

  // Load favorites from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(FAVORITES_KEY)
      if (stored) {
        setFavorites(JSON.parse(stored))
      }
    } catch (error) {
      console.error('Failed to load favorites:', error)
    } finally {
      setLoading(false)
    }
  }, [])

  // Save favorites to localStorage whenever they change
  useEffect(() => {
    if (!loading) {
      try {
        localStorage.setItem(FAVORITES_KEY, JSON.stringify(favorites))
      } catch (error) {
        console.error('Failed to save favorites:', error)
      }
    }
  }, [favorites, loading])

  const addFavorite = (href: string) => {
    setFavorites(prev => {
      if (prev.includes(href)) return prev
      if (prev.length >= MAX_FAVORITES) {
        // Remove oldest favorite
        return [...prev.slice(1), href]
      }
      return [...prev, href]
    })
  }

  const removeFavorite = (href: string) => {
    setFavorites(prev => prev.filter(f => f !== href))
  }

  const toggleFavorite = (href: string) => {
    if (favorites.includes(href)) {
      removeFavorite(href)
    } else {
      addFavorite(href)
    }
  }

  const isFavorite = (href: string) => {
    return favorites.includes(href)
  }

  const reorderFavorites = (newOrder: string[]) => {
    setFavorites(newOrder)
  }

  const clearFavorites = () => {
    setFavorites([])
  }

  return {
    favorites,
    loading,
    addFavorite,
    removeFavorite,
    toggleFavorite,
    isFavorite,
    reorderFavorites,
    clearFavorites,
    maxFavorites: MAX_FAVORITES,
  }
}
