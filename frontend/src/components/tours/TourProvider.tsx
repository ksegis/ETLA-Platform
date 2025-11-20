'use client'

import React, { useEffect, useState } from 'react'
import { ShepherdTour, ShepherdTourContext } from 'react-shepherd'
import 'shepherd.js/dist/css/shepherd.css'
import type { Step } from 'shepherd.js'

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

interface TourProviderProps {
  tourId: string
  steps: TourStep[]
  children: React.ReactNode
  onComplete?: () => void
  onSkip?: () => void
}

const tourOptions = {
  defaultStepOptions: {
    cancelIcon: {
      enabled: true
    },
    classes: 'shepherd-theme-custom',
    scrollTo: { behavior: 'smooth', block: 'center' }
  },
  useModalOverlay: true
}

export function TourProvider({ 
  tourId, 
  steps, 
  children, 
  onComplete, 
  onSkip 
}: TourProviderProps) {
  const [tourSteps, setTourSteps] = useState<Step.StepOptions[]>([])

  useEffect(() => {
    const convertedSteps: Step.StepOptions[] = steps.map((step, index) => {
      const buttons: any[] = []

      if (step.buttons) {
        step.buttons.forEach(btn => {
          if (btn.action === 'back') {
            buttons.push({
              text: btn.text,
              action: 'back',
              classes: btn.classes || 'shepherd-button-secondary'
            })
          } else if (btn.action === 'next') {
            buttons.push({
              text: btn.text,
              action: 'next',
              classes: btn.classes || 'shepherd-button-primary'
            })
          } else if (btn.action === 'skip') {
            buttons.push({
              text: btn.text,
              action: function() {
                this.complete()
                onSkip?.()
              },
              classes: btn.classes || 'shepherd-button-secondary'
            })
          } else if (btn.action === 'complete') {
            buttons.push({
              text: btn.text,
              action: function() {
                this.complete()
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
            action: 'back',
            classes: 'shepherd-button-secondary'
          })
        }
        
        if (index < steps.length - 1) {
          buttons.push({
            text: 'Next',
            action: 'next',
            classes: 'shepherd-button-primary'
          })
        } else {
          buttons.push({
            text: 'Finish',
            action: function() {
              this.complete()
              onComplete?.()
            },
            classes: 'shepherd-button-primary'
          })
        }
      }

      return {
        id: step.id,
        attachTo: step.target !== 'body' ? { 
          element: step.target, 
          on: step.placement || 'bottom' 
        } : undefined,
        title: step.title,
        text: step.content,
        buttons,
        beforeShowPromise: step.beforeShow ? () => {
          return new Promise((resolve) => {
            step.beforeShow?.()
            setTimeout(resolve, 100)
          })
        } : undefined
      }
    })

    setTourSteps(convertedSteps)
  }, [steps, onComplete, onSkip])

  return (
    <ShepherdTour steps={tourSteps} tourOptions={tourOptions}>
      <ShepherdTourContext.Consumer>
        {(tour) => children}
      </ShepherdTourContext.Consumer>
    </ShepherdTour>
  )
}

export default TourProvider
