import { TourStep } from './TourProvider'

export const workRequestsTour: TourStep[] = [
  {
    id: 'welcome',
    target: 'body',
    title: '👋 Welcome to Work Requests',
    content: 'Submit and track work requests for your projects. Let\'s take a quick tour of the key features.',
    placement: 'center',
    buttons: [
      { text: 'Skip Tour', action: 'skip', classes: 'shepherd-button-secondary' },
      { text: 'Start Tour', action: 'next', classes: 'shepherd-button-primary' }
    ]
  },
  {
    id: 'create-request',
    target: '#create-request-btn',
    title: '➕ Create New Request',
    content: 'Click here to submit a new work request. Fill in the details, priority, and timeline to help us understand your needs.',
    placement: 'bottom'
  },
  {
    id: 'request-list',
    target: '#work-requests-list',
    title: '📋 Your Requests',
    content: 'View all your work requests here. See the status, priority, and estimated timeline for each request.',
    placement: 'top'
  },
  {
    id: 'status-filter',
    target: '#status-filter',
    title: '🔍 Filter by Status',
    content: 'Filter requests by status: Submitted, Under Review, Approved, In Progress, or Completed.',
    placement: 'bottom'
  },
  {
    id: 'priority-badges',
    target: '.priority-badge:first',
    title: '🎯 Priority Levels',
    content: 'Priority indicates urgency:\n• Critical (Red)\n• High (Orange)\n• Medium (Yellow)\n• Low (Gray)',
    placement: 'left'
  },
  {
    id: 'status-badges',
    target: '.status-badge:first',
    title: '📊 Request Status',
    content: 'Track your request through these stages:\n• Submitted → Under Review → Approved → In Progress → Completed',
    placement: 'left'
  },
  {
    id: 'approval-process',
    target: '#approval-info',
    title: '✅ Approval Process',
    content: 'Work requests are reviewed and approved by the Platform Host team. You\'ll be notified when your request is approved or if more information is needed.',
    placement: 'top'
  },
  {
    id: 'view-details',
    target: '.view-details-btn:first',
    title: '👁️ View Details',
    content: 'Click to see full request details, including timeline, budget estimates, and any updates from the team.',
    placement: 'left'
  },
  {
    id: 'complete',
    target: 'body',
    title: '✅ You\'re All Set!',
    content: 'You\'re ready to submit and track work requests. Remember to provide clear details and business justification for faster approval.',
    placement: 'center',
    buttons: [
      { text: 'Finish Tour', action: 'complete', classes: 'shepherd-button-primary' }
    ]
  }
]

export const hostWorkRequestsTour: TourStep[] = [
  {
    id: 'welcome',
    target: 'body',
    title: '👋 Work Request Management',
    content: 'Review, approve, and manage work requests from all clients. Let\'s explore the approval workflow.',
    placement: 'center',
    buttons: [
      { text: 'Skip Tour', action: 'skip', classes: 'shepherd-button-secondary' },
      { text: 'Start Tour', action: 'next', classes: 'shepherd-button-primary' }
    ]
  },
  {
    id: 'pending-requests',
    target: '#pending-requests-section',
    title: '⏳ Pending Requests',
    content: 'These requests are awaiting your review and approval. Priority and urgency help you decide what to review first.',
    placement: 'right'
  },
  {
    id: 'request-details',
    target: '.request-card:first',
    title: '📄 Request Information',
    content: 'Review business justification, impact assessment, estimated hours, and budget before making a decision.',
    placement: 'top'
  },
  {
    id: 'approval-buttons',
    target: '.approval-buttons:first',
    title: '✅ Approve or Reject',
    content: 'Approve requests that align with capacity and priorities. Reject with a clear reason to help the requester understand.',
    placement: 'left'
  },
  {
    id: 'bulk-actions',
    target: '#bulk-actions',
    title: '⚙️ Bulk Operations',
    content: 'Select multiple requests to approve, reject, or change status in one action. Great for processing similar requests.',
    placement: 'bottom'
  },
  {
    id: 'filters',
    target: '#advanced-filters',
    title: '🔍 Advanced Filters',
    content: 'Filter by client, priority, urgency, date range, or estimated hours to find specific requests quickly.',
    placement: 'left'
  },
  {
    id: 'analytics',
    target: '#request-analytics',
    title: '📊 Request Analytics',
    content: 'View demand trends, average approval time, and capacity utilization to make informed decisions.',
    placement: 'top'
  },
  {
    id: 'complete',
    target: 'body',
    title: '✅ Ready to Manage!',
    content: 'You\'re ready to review and approve work requests. Remember: only Platform Host team members can approve requests.',
    placement: 'center',
    buttons: [
      { text: 'Finish Tour', action: 'complete', classes: 'shepherd-button-primary' }
    ]
  }
]
