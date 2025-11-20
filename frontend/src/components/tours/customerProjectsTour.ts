import { TourStep } from './TourProvider'

export const customerProjectsTour: TourStep[] = [
  {
    id: 'welcome',
    target: 'body',
    title: '👋 Welcome to My Projects',
    content: 'View and track all your projects in one place. Let\'s explore the key features.',
    placement: 'center',
    buttons: [
      { text: 'Skip Tour', action: 'skip', classes: 'shepherd-button-secondary' },
      { text: 'Start Tour', action: 'next', classes: 'shepherd-button-primary' }
    ]
  },
  {
    id: 'summary-cards',
    target: '#project-summary-cards',
    title: '📊 Project Summary',
    content: 'Quick overview of your active, at-risk, and completed projects at a glance.',
    placement: 'bottom'
  },
  {
    id: 'search',
    target: '#project-search',
    title: '🔍 Search Projects',
    content: 'Quickly find projects by name or code. The list filters as you type.',
    placement: 'bottom'
  },
  {
    id: 'project-card',
    target: '#project-card-0',
    title: '📋 Project Card',
    content: 'Each card shows project health, progress, budget, and timeline at a glance.',
    placement: 'right'
  },
  {
    id: 'health-indicator',
    target: '#health-indicator-0',
    title: '🚦 Health Status',
    content: 'Green = On Track, Yellow = At Risk, Red = Blocked. This helps you prioritize attention.',
    placement: 'right'
  },
  {
    id: 'next-action',
    target: '#next-action-0',
    title: '✅ Your Next Action',
    content: 'See what action is required from you to keep the project moving forward.',
    placement: 'left'
  },
  {
    id: 'complete',
    target: 'body',
    title: '✅ You\'re All Set!',
    content: 'Click any project card to see detailed information, milestones, and deliverables.',
    placement: 'center',
    buttons: [
      { text: 'Finish Tour', action: 'complete', classes: 'shepherd-button-primary' }
    ]
  }
]

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
    id: 'summary-metrics',
    target: '#dashboard-summary',
    title: '📊 Project Metrics',
    content: 'Track progress, budget, timeline, and active roadblocks at a glance.',
    placement: 'bottom'
  },
  {
    id: 'next-action-callout',
    target: '#next-action-callout',
    title: '⚡ Your Next Action',
    content: 'This is the most important thing you need to do right now to keep the project on track.',
    placement: 'bottom'
  },
  {
    id: 'milestones',
    target: '#milestones-section',
    title: '🎯 Milestones',
    content: 'See upcoming milestones, what actions you need to take, and definitions of done.',
    placement: 'top'
  },
  {
    id: 'deliverables',
    target: '#deliverables-section',
    title: '📦 Deliverables',
    content: 'Track deliverables with due dates, status, and file links. Click links to view documents.',
    placement: 'top'
  },
  {
    id: 'roadblocks',
    target: '#roadblocks-section',
    title: '🚧 Active Roadblocks',
    content: 'See any blockers affecting the project and our resolution plans to address them.',
    placement: 'top'
  },
  {
    id: 'updates',
    target: '#updates-section',
    title: '📢 Recent Updates',
    content: 'Stay informed with status updates from your project manager about progress and changes.',
    placement: 'top'
  },
  {
    id: 'notifications',
    target: '#notification-bell',
    title: '🔔 Notifications',
    content: 'You\'ll receive notifications when milestones complete, roadblocks arise, or updates are posted.',
    placement: 'bottom'
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
