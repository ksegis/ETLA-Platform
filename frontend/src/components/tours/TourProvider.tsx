'use client'

import React, { useEffect, useState, createContext, useContext } from 'react'
import Shepherd from 'shepherd.js'
import 'shepherd.js/dist/css/shepherd.css'

export interface TourStep {
  id: string
  target: string
  title: string
  content: string
  placement?: 'top' | 'bottom' | 'left' | 'right' | 'center'
  beforeShow?: () => void
  buttons?: TourButton[]
}

export interface TourButton {
  text: string
  action: 'next' | 'back' | 'skip' | 'complete'
  classes?: string
}

interface TourContextType {
  tour: Shepherd.Tour | null
  startTour: () => void
  isActive: boolean
}

const TourContext = createContext<TourContextType>({
  tour: null,
  startTour: () => {},
  isActive: false
})

export const useTour = () => useContext(TourContext)

interface TourProviderProps {
  tourId: string
  steps: TourStep[]
  children: React.ReactNode
  onComplete?: () => void
  onSkip?: () => void
}

export function TourProvider({ 
  tourId, 
  steps, 
  children, 
  onComplete, 
  onSkip 
}: TourProviderProps) {
  const [tour, setTour] = useState<Shepherd.Tour | null>(null)
  const [isActive, setIsActive] = useState(false)

  useEffect(() => {
    // Create tour instance
    const newTour = new Shepherd.Tour({
      defaultStepOptions: {
        cancelIcon: {
          enabled: true
        },
        classes: 'shepherd-theme-custom',
        scrollTo: { behavior: 'smooth', block: 'center' }
      },
      useModalOverlay: true
    })

    // Convert steps to Shepherd format
    steps.forEach((step, index) => {
      const buttons: any[] = []

      if (step.buttons) {
        step.buttons.forEach(btn => {
          if (btn.action === 'back') {
            buttons.push({
              text: btn.text,
              action: () => newTour.back(),
              classes: btn.classes || 'shepherd-button-secondary'
            })
          } else if (btn.action === 'next') {
            buttons.push({
              text: btn.text,
              action: () => newTour.next(),
              classes: btn.classes || 'shepherd-button-primary'
            })
          } else if (btn.action === 'skip') {
            buttons.push({
              text: btn.text,
              action: () => {
                newTour.complete()
                onSkip?.()
              },
              classes: btn.classes || 'shepherd-button-secondary'
            })
          } else if (btn.action === 'complete') {
            buttons.push({
              text: btn.text,
              action: () => {
                newTour.complete()
                onComplete?.()
              },
              classes: btn.classes || 'shepherd-button-primary'
            })
          }
        })
      } else {
        // Default buttons
        if (index > 0) {
          buttons.push({
            text: 'Back',
            action: () => newTour.back(),
            classes: 'shepherd-button-secondary'
          })
        }
        
        if (index < steps.length - 1) {
          buttons.push({
            text: 'Next',
            action: () => newTour.next(),
            classes: 'shepherd-button-primary'
          })
        } else {
          buttons.push({
            text: 'Finish',
            action: () => {
              newTour.complete()
              onComplete?.()
            },
            classes: 'shepherd-button-primary'
          })
        }
      }

      const stepOptions: any = {
        id: step.id,
        title: step.title,
        text: step.content,
        buttons
      }

      // Only add attachTo if not targeting body
      if (step.target !== 'body') {
        stepOptions.attachTo = {
          element: step.target,
          on: step.placement || 'bottom'
        }
      }

      // Add beforeShow hook if provided
      if (step.beforeShow) {
        stepOptions.beforeShowPromise = () => {
          return new Promise((resolve) => {
            step.beforeShow?.()
            setTimeout(resolve, 100)
          })
        }
      }

      newTour.addStep(stepOptions)
    })

    // Add event listeners
    newTour.on('start', () => setIsActive(true))
    newTour.on('complete', () => setIsActive(false))
    newTour.on('cancel', () => setIsActive(false))

    setTour(newTour)

    // Cleanup
    return () => {
      if (newTour) {
        newTour.complete()
      }
    }
  }, [steps, onComplete, onSkip])

  const startTour = () => {
    if (tour) {
      tour.start()
    }
  }

  return (
    <TourContext.Provider value={{ tour, startTour, isActive }}>
      {children}
    </TourContext.Provider>
  )
}

export default TourProvider
