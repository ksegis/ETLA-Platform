import { TourStep } from './TourProvider'

export const customerProjectDashboardTour: TourStep[] = [
  {
    id: 'welcome',
    target: 'body',
    title: '👋 Project Dashboard',
    content: 'Everything you need to know about this project in one place. Let\'s take a tour.',
    placement: 'center',
    buttons: [
      { text: 'Skip Tour', action: 'skip', classes: 'shepherd-button-secondary' },
      { text: 'Start Tour', action: 'next', classes: 'shepherd-button-primary' }
    ]
  },
  {
    id: 'health-status',
    target: '.health-indicator',
    title: '🚦 Project Health',
    content: 'The health indicator shows your project status at a glance: Green (on track), Yellow (at risk), or Red (blocked).',
    placement: 'bottom'
  },
  {
    id: 'summary-cards',
    target: '.summary-cards',
    title: '📊 Project Metrics',
    content: 'These cards show key project metrics: progress, budget, timeline, and your next required action.',
    placement: 'bottom'
  },
  {
    id: 'next-action',
    target: '.next-action-card',
    title: '⚡ Your Next Action',
    content: 'This highlighted section shows what action is needed from you to keep the project moving forward.',
    placement: 'bottom'
  },
  {
    id: 'milestones',
    target: '.milestones-section',
    title: '🎯 Milestones',
    content: 'Track upcoming milestones, their due dates, and any actions required from you.',
    placement: 'top'
  },
  {
    id: 'deliverables',
    target: '.deliverables-section',
    title: '📦 Deliverables',
    content: 'View project deliverables, their status, and access files when they\'re ready.',
    placement: 'top'
  },
  {
    id: 'roadblocks',
    target: '.roadblocks-section',
    title: '🚧 Active Roadblocks',
    content: 'See any blockers affecting your project and their resolution plans.',
    placement: 'top'
  },
  {
    id: 'status-updates',
    target: '.status-updates-section',
    title: '📢 Recent Updates',
    content: 'Stay informed with status updates from your project manager about progress, changes, and important news.',
    placement: 'top'
  },
  {
    id: 'complete',
    target: 'body',
    title: '✅ You\'re Ready!',
    content: 'You now know how to track your project. Check back regularly for updates and complete your next actions.',
    placement: 'center',
    buttons: [
      { text: 'Finish Tour', action: 'complete', classes: 'shepherd-button-primary' }
    ]
  }
]
