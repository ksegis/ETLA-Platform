import { useEffect, useRef } from 'react'

/**
 * Custom hook to persist form data to localStorage and restore it on mount
 * Automatically saves form data when it changes and clears it when explicitly told
 * 
 * @param formKey - Unique key to identify this form in localStorage
 * @param formData - The current form data state
 * @param isOpen - Whether the form/modal is currently open
 * @param recordId - Optional ID of the record being edited (to create unique keys per record)
 * @returns Object with clearPersistedData function
 */
export function useFormPersist<T>(
  formKey: string,
  formData: T,
  isOpen: boolean,
  recordId?: string
) {
  const isInitialMount = useRef(true)
  const storageKey = recordId ? `${formKey}_${recordId}` : `${formKey}_new`

  // Restore persisted data on mount
  useEffect(() => {
    if (isOpen && isInitialMount.current) {
      try {
        const persistedData = localStorage.getItem(storageKey)
        if (persistedData) {
          const parsed = JSON.parse(persistedData)
          // Return the parsed data so the component can use it
          // This is handled by the component itself in the useEffect
        }
      } catch (error) {
        console.error('Error restoring form data:', error)
      }
      isInitialMount.current = false
    }
  }, [isOpen, storageKey])

  // Auto-save form data whenever it changes
  useEffect(() => {
    if (isOpen && !isInitialMount.current) {
      try {
        const debounceTimer = setTimeout(() => {
          localStorage.setItem(storageKey, JSON.stringify(formData))
        }, 500) // Debounce for 500ms to avoid excessive writes

        return () => clearTimeout(debounceTimer)
      } catch (error) {
        console.error('Error saving form data:', error)
      }
    }
  }, [formData, isOpen, storageKey])

  // Function to clear persisted data (call after successful save)
  const clearPersistedData = () => {
    try {
      localStorage.removeItem(storageKey)
    } catch (error) {
      console.error('Error clearing persisted form data:', error)
    }
  }

  // Function to get persisted data
  const getPersistedData = (): T | null => {
    try {
      const persistedData = localStorage.getItem(storageKey)
      if (persistedData) {
        return JSON.parse(persistedData)
      }
    } catch (error) {
      console.error('Error getting persisted form data:', error)
    }
    return null
  }

  return {
    clearPersistedData,
    getPersistedData
  }
}
