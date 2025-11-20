import type Shepherd from 'shepherd.js'

export const customerProjectDashboardTour: Shepherd.Step.StepOptions[] = [
  {
    id: 'welcome',
    title: 'Welcome to Your Project Dashboard',
    text: 'This dashboard gives you a complete view of your project status, milestones, deliverables, and more. Let\'s take a quick tour!',
    buttons: [
      {
        text: 'Skip',
        action() {
          return this.cancel()
        },
        secondary: true
      },
      {
        text: 'Next',
        action() {
          return this.next()
        }
      }
    ]
  },
  {
    id: 'health-status',
    title: 'Project Health',
    text: 'The health indicator shows your project status at a glance: Green (on track), Yellow (at risk), or Red (blocked).',
    attachTo: {
      element: '.health-indicator',
      on: 'bottom'
    },
    buttons: [
      {
        text: 'Back',
        action() {
          return this.back()
        },
        secondary: true
      },
      {
        text: 'Next',
        action() {
          return this.next()
        }
      }
    ]
  },
  {
    id: 'summary-cards',
    title: 'Project Metrics',
    text: 'These cards show key project metrics: progress, budget, timeline, and your next required action.',
    attachTo: {
      element: '.summary-cards',
      on: 'bottom'
    },
    buttons: [
      {
        text: 'Back',
        action() {
          return this.back()
        },
        secondary: true
      },
      {
        text: 'Next',
        action() {
          return this.next()
        }
      }
    ]
  },
  {
    id: 'next-action',
    title: 'Your Next Action',
    text: 'This highlighted section shows what action is needed from you to keep the project moving forward.',
    attachTo: {
      element: '.next-action-card',
      on: 'bottom'
    },
    buttons: [
      {
        text: 'Back',
        action() {
          return this.back()
        },
        secondary: true
      },
      {
        text: 'Next',
        action() {
          return this.next()
        }
      }
    ]
  },
  {
    id: 'milestones',
    title: 'Project Milestones',
    text: 'Track upcoming milestones, their due dates, and any actions required from you.',
    attachTo: {
      element: '.milestones-section',
      on: 'top'
    },
    buttons: [
      {
        text: 'Back',
        action() {
          return this.back()
        },
        secondary: true
      },
      {
        text: 'Next',
        action() {
          return this.next()
        }
      }
    ]
  },
  {
    id: 'deliverables',
    title: 'Deliverables',
    text: 'View project deliverables, their status, and access files when they\'re ready.',
    attachTo: {
      element: '.deliverables-section',
      on: 'top'
    },
    buttons: [
      {
        text: 'Back',
        action() {
          return this.back()
        },
        secondary: true
      },
      {
        text: 'Next',
        action() {
          return this.next()
        }
      }
    ]
  },
  {
    id: 'roadblocks',
    title: 'Active Roadblocks',
    text: 'See any blockers affecting your project and their resolution plans.',
    attachTo: {
      element: '.roadblocks-section',
      on: 'top'
    },
    buttons: [
      {
        text: 'Back',
        action() {
          return this.back()
        },
        secondary: true
      },
      {
        text: 'Next',
        action() {
          return this.next()
        }
      }
    ]
  },
  {
    id: 'status-updates',
    title: 'Recent Updates',
    text: 'Stay informed with status updates from your project manager about progress, changes, and important news.',
    attachTo: {
      element: '.status-updates-section',
      on: 'top'
    },
    buttons: [
      {
        text: 'Back',
        action() {
          return this.back()
        },
        secondary: true
      },
      {
        text: 'Finish',
        action() {
          return this.complete()
        }
      }
    ]
  }
]
