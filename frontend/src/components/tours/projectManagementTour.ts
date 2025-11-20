import { TourStep } from './TourProvider'

export const projectManagementTour: TourStep[] = [
  {
    id: 'welcome',
    target: 'body',
    title: '👋 Project Management Dashboard',
    content: 'Welcome to the comprehensive project management interface. Here you can manage all aspects of your projects across 4 key areas. Let\'s explore each one.',
    placement: 'center',
    buttons: [
      { text: 'Skip Tour', action: 'skip', classes: 'shepherd-button-secondary' },
      { text: 'Start Tour', action: 'next', classes: 'shepherd-button-primary' }
    ]
  },
  {
    id: 'tabs-overview',
    target: '.project-tabs',
    title: '📑 Four Management Areas',
    content: 'The four tabs organize your project management: Milestones (track progress), Deliverables (manage outputs), Roadblocks (resolve issues), and Status Updates (communicate progress).',
    placement: 'bottom'
  },
  {
    id: 'milestones-tab',
    target: '#tab-milestones',
    title: '🎯 Milestones Tab',
    content: 'Define project milestones with due dates, status, and customer actions. Set clear definitions of done so everyone knows when a milestone is complete.',
    placement: 'bottom'
  },
  {
    id: 'add-milestone',
    target: '#add-milestone-btn',
    title: '➕ Add Milestones',
    content: 'Click here to create new milestones. You can specify what actions customers need to take and set visibility controls.',
    placement: 'left'
  },
  {
    id: 'deliverables-tab',
    target: '#tab-deliverables',
    title: '📦 Deliverables Tab',
    content: 'Manage project deliverables - the tangible outputs you\'ll provide to customers. Track status, due dates, and attach files.',
    placement: 'bottom'
  },
  {
    id: 'add-deliverable',
    target: '#add-deliverable-btn',
    title: '➕ Add Deliverables',
    content: 'Create new deliverables with descriptions, due dates, and file links. Customers can view and download completed deliverables.',
    placement: 'left'
  },
  {
    id: 'roadblocks-tab',
    target: '#tab-roadblocks',
    title: '🚧 Roadblocks Tab',
    content: 'Document and track project blockers. Record severity, impact, and resolution plans to keep stakeholders informed.',
    placement: 'bottom'
  },
  {
    id: 'add-roadblock',
    target: '#add-roadblock-btn',
    title: '➕ Add Roadblocks',
    content: 'Log new roadblocks when issues arise. Transparency about challenges builds trust with customers.',
    placement: 'left'
  },
  {
    id: 'status-updates-tab',
    target: '#tab-status-updates',
    title: '📢 Status Updates Tab',
    content: 'Share regular progress updates with customers. Choose update types (progress, milestone, risk, general) to categorize communications.',
    placement: 'bottom'
  },
  {
    id: 'add-status-update',
    target: '#add-status-update-btn',
    title: '➕ Add Status Updates',
    content: 'Post new updates to keep customers informed. These appear in their project dashboard and notification feed.',
    placement: 'left'
  },
  {
    id: 'customer-visibility',
    target: '.visibility-toggle',
    title: '👁️ Customer Visibility',
    content: 'Control what customers see with visibility toggles. Some items may need to remain internal until ready to share.',
    placement: 'top'
  },
  {
    id: 'complete',
    target: 'body',
    title: '✅ You\'re All Set!',
    content: 'You now know how to manage projects effectively. Use these tools to keep customers informed and projects on track.',
    placement: 'center',
    buttons: [
      { text: 'Finish Tour', action: 'complete', classes: 'shepherd-button-primary' }
    ]
  }
]
