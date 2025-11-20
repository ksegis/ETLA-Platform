# Guided Tour & Informational Tooltips Specification

**Date:** November 20, 2025  
**Version:** 1.0

---

## Executive Summary

This document specifies the guided tour system and informational tooltips for both Platform Host and Customer views. The system will provide contextual onboarding, feature discovery, and inline help throughout the application.

---

## 1. Technology Stack

### 1.1 Recommended Library: Shepherd.js

**Why Shepherd.js:**
- Lightweight (10KB gzipped)
- Framework agnostic (works with React)
- Highly customizable
- Keyboard navigation support
- Mobile responsive
- Accessibility compliant (ARIA labels)
- MIT licensed

**Installation:**
```bash
npm install shepherd.js
npm install react-shepherd
```

**Alternative:** Driver.js (if Shepherd.js doesn't meet needs)

### 1.2 Tooltip Library: Tippy.js

**Why Tippy.js:**
- Rich feature set (positioning, animations, themes)
- Accessible (ARIA compliant)
- Small footprint (3KB gzipped)
- Works seamlessly with React

**Installation:**
```bash
npm install @tippyjs/react
```

---

## 2. Guided Tour System Architecture

### 2.1 Tour State Management

**Storage:** LocalStorage + Database

```typescript
// Tour completion tracking
interface TourProgress {
  userId: string
  tourId: string
  completed: boolean
  lastStep: number
  completedAt?: Date
  skipped: boolean
}

// Store in localStorage for immediate access
// Sync to database for cross-device persistence
```

**Tour IDs:**
- `host-project-management-tour` - Platform Host project management features
- `host-bulk-operations-tour` - Platform Host bulk operations
- `customer-portfolio-tour` - Primary Customer portfolio overview
- `customer-project-dashboard-tour` - Customer project dashboard
- `sub-client-projects-tour` - Sub-client project view
- `work-requests-tour` - Work request submission and management

### 2.2 Tour Trigger Logic

**First-time users:** Auto-start tour on first page visit
**Returning users:** Show "Take Tour" button in header
**Manual trigger:** Help menu > "Feature Tours"

```typescript
// Tour trigger logic
useEffect(() => {
  const tourProgress = getTourProgress(user.id, tourId)
  
  if (!tourProgress || (!tourProgress.completed && !tourProgress.skipped)) {
    // First time or incomplete tour
    if (isFirstVisit) {
      // Auto-start after 2 second delay
      setTimeout(() => startTour(), 2000)
    } else {
      // Show tour prompt
      setShowTourPrompt(true)
    }
  }
}, [user, tourId])
```

### 2.3 Tour Component Structure

```typescript
// components/tours/TourProvider.tsx
interface TourStep {
  id: string
  target: string // CSS selector
  title: string
  content: string
  placement: 'top' | 'bottom' | 'left' | 'right'
  beforeShow?: () => void // e.g., scroll to element
  buttons?: TourButton[]
}

interface TourButton {
  text: string
  action: 'next' | 'back' | 'skip' | 'complete'
  classes?: string
}

// Usage
<TourProvider tourId="host-project-management-tour" steps={tourSteps}>
  {children}
</TourProvider>
```

---

## 3. Platform Host Tours

### 3.1 Project Management Tour

**Tour ID:** `host-project-management-tour`  
**Page:** `/project-management`  
**Steps:** 12

```typescript
const hostProjectManagementTour: TourStep[] = [
  {
    id: 'welcome',
    target: 'body',
    title: '👋 Welcome to Project Management',
    content: 'This is your command center for managing all client projects. Let\'s take a quick tour of the key features.',
    placement: 'center',
    buttons: [
      { text: 'Skip Tour', action: 'skip', classes: 'btn-secondary' },
      { text: 'Start Tour', action: 'next', classes: 'btn-primary' }
    ]
  },
  {
    id: 'project-list',
    target: '#project-list',
    title: '📋 Project List',
    content: 'View all projects across all clients. Use filters to find specific projects by status, health, client, or PM.',
    placement: 'right',
    buttons: [
      { text: 'Back', action: 'back' },
      { text: 'Next', action: 'next' }
    ]
  },
  {
    id: 'health-status',
    target: '#health-status-section',
    title: '🟢 Project Health Status',
    content: 'Update project health (Green/Yellow/Red) to keep customers informed. Add explanations and set next customer actions.',
    placement: 'top',
    buttons: [
      { text: 'Back', action: 'back' },
      { text: 'Next', action: 'next' }
    ]
  },
  {
    id: 'quick-update',
    target: '#quick-update-btn',
    title: '⚡ Quick Update',
    content: 'Use Quick Update to rapidly change health status, completion %, and budget/timeline variance in one modal.',
    placement: 'left',
    buttons: [
      { text: 'Back', action: 'back' },
      { text: 'Next', action: 'next' }
    ]
  },
  {
    id: 'milestones',
    target: '#milestones-section',
    title: '🎯 Milestones',
    content: 'Create and track project milestones. Set customer actions, add deliverables, and mark completion. These appear on customer dashboards.',
    placement: 'top',
    buttons: [
      { text: 'Back', action: 'back' },
      { text: 'Next', action: 'next' }
    ]
  },
  {
    id: 'roadblocks',
    target: '#roadblocks-section',
    title: '🚧 Roadblocks & Issues',
    content: 'Document project roadblocks with severity, impact, and resolution plans. Customers are automatically notified of critical issues.',
    placement: 'top',
    buttons: [
      { text: 'Back', action: 'back' },
      { text: 'Next', action: 'next' }
    ]
  },
  {
    id: 'status-updates',
    target: '#status-updates-section',
    title: '📢 Status Updates',
    content: 'Post customer-visible status updates. Choose update type (milestone completed, status change, risk identified, etc.) and visibility.',
    placement: 'top',
    buttons: [
      { text: 'Back', action: 'back' },
      { text: 'Next', action: 'next' }
    ]
  },
  {
    id: 'deliverables',
    target: '#deliverables-section',
    title: '📄 Deliverables',
    content: 'Track project deliverables with due dates and status. Upload files and mark completion. Customers can view and download.',
    placement: 'top',
    buttons: [
      { text: 'Back', action: 'back' },
      { text: 'Next', action: 'next' }
    ]
  },
  {
    id: 'risks',
    target: '#risks-section',
    title: '⚠️ Customer-Visible Risks',
    content: 'Manage project risks and choose which to share with customers. Include mitigation strategies and impact assessments.',
    placement: 'top',
    buttons: [
      { text: 'Back', action: 'back' },
      { text: 'Next', action: 'next' }
    ]
  },
  {
    id: 'customer-visibility',
    target: '#customer-visible-toggle',
    title: '👁️ Customer Visibility',
    content: 'Control what customers see. Toggle "Customer Visible" on updates, milestones, and risks to manage transparency.',
    placement: 'left',
    buttons: [
      { text: 'Back', action: 'back' },
      { text: 'Next', action: 'next' }
    ]
  },
  {
    id: 'bulk-operations',
    target: '#bulk-operations-link',
    title: '⚙️ Bulk Operations',
    content: 'Need to update multiple projects at once? Use Bulk Operations to apply changes across selected projects efficiently.',
    placement: 'bottom',
    buttons: [
      { text: 'Back', action: 'back' },
      { text: 'Next', action: 'next' }
    ]
  },
  {
    id: 'complete',
    target: 'body',
    title: '✅ Tour Complete!',
    content: 'You\'re ready to manage projects like a pro! Remember: keeping project information updated ensures customers stay informed and engaged.',
    placement: 'center',
    buttons: [
      { text: 'Finish Tour', action: 'complete', classes: 'btn-primary' }
    ]
  }
]
```

### 3.2 Bulk Operations Tour

**Tour ID:** `host-bulk-operations-tour`  
**Page:** `/project-management/bulk-updates`  
**Steps:** 6

```typescript
const hostBulkOperationsTour: TourStep[] = [
  {
    id: 'welcome',
    target: 'body',
    title: '⚙️ Bulk Operations',
    content: 'Update multiple projects at once to save time. Perfect for weekly status updates or phase transitions.',
    placement: 'center'
  },
  {
    id: 'project-selection',
    target: '#project-selection-list',
    title: '☑️ Select Projects',
    content: 'Check the projects you want to update. Use filters to quickly find projects by client, status, or PM.',
    placement: 'right'
  },
  {
    id: 'bulk-action',
    target: '#bulk-action-dropdown',
    title: '🎯 Choose Action',
    content: 'Select the action to apply: Update Health Status, Create Status Update, Send Notification, or Update Phase.',
    placement: 'top'
  },
  {
    id: 'apply-changes',
    target: '#apply-bulk-btn',
    title: '✨ Apply Changes',
    content: 'Review your selections and click to apply changes to all selected projects simultaneously.',
    placement: 'left'
  },
  {
    id: 'preview',
    target: '#bulk-preview',
    title: '👀 Preview Changes',
    content: 'Always preview changes before applying. You\'ll see exactly what will be updated on each project.',
    placement: 'top'
  },
  {
    id: 'complete',
    target: 'body',
    title: '✅ Ready to Go!',
    content: 'Bulk operations can save hours of repetitive work. Use them wisely to keep all projects up to date.',
    placement: 'center'
  }
]
```

---

## 4. Customer Tours

### 4.1 Portfolio Overview Tour (Primary Customers)

**Tour ID:** `customer-portfolio-tour`  
**Page:** `/customer/portfolio`  
**Steps:** 10

```typescript
const customerPortfolioTour: TourStep[] = [
  {
    id: 'welcome',
    target: 'body',
    title: '👋 Welcome to Your Portfolio',
    content: 'Get a bird\'s-eye view of all projects across your sub-clients. Track progress, budget, and risks in one place.',
    placement: 'center',
    buttons: [
      { text: 'Skip Tour', action: 'skip', classes: 'btn-secondary' },
      { text: 'Start Tour', action: 'next', classes: 'btn-primary' }
    ]
  },
  {
    id: 'summary-cards',
    target: '#portfolio-summary',
    title: '📊 Portfolio Summary',
    content: 'Quick metrics at a glance: total projects, active projects, at-risk projects, budget spent, and average progress.',
    placement: 'bottom'
  },
  {
    id: 'sub-client-groups',
    target: '#sub-client-groups',
    title: '🏢 Sub-Client Grouping',
    content: 'Projects are organized by sub-client. Expand/collapse each group to see project details.',
    placement: 'right'
  },
  {
    id: 'health-indicators',
    target: '.health-indicator:first',
    title: '🟢 Health Indicators',
    content: 'Color-coded status: 🟢 Green (On Track), 🟡 Yellow (At Risk), 🔴 Red (Blocked/Critical). Click for details.',
    placement: 'left'
  },
  {
    id: 'project-card',
    target: '.project-card:first',
    title: '📋 Project Cards',
    content: 'Each card shows progress, phase, due date, budget, and active roadblocks/risks. Click "View Dashboard" for full details.',
    placement: 'top'
  },
  {
    id: 'filters',
    target: '#portfolio-filters',
    title: '🔍 Filters & Search',
    content: 'Filter by sub-client, health status, phase, budget range, or timeline. Search by project name or PM.',
    placement: 'left'
  },
  {
    id: 'view-options',
    target: '#view-options',
    title: '👁️ View Options',
    content: 'Switch between Card View, Table View, Timeline View (Gantt), or Budget View to see data your way.',
    placement: 'bottom'
  },
  {
    id: 'demand-analysis',
    target: '#demand-analysis',
    title: '📈 Demand Analysis',
    content: 'Understand resource allocation, capacity utilization, and work request pipeline across all sub-clients.',
    placement: 'top'
  },
  {
    id: 'risk-summary',
    target: '#risk-summary',
    title: '⚠️ Risk Summary',
    content: 'See critical and high-priority risks across all projects. Click to view the full risk register.',
    placement: 'top'
  },
  {
    id: 'complete',
    target: 'body',
    title: '✅ Portfolio Mastery!',
    content: 'You now have full visibility into all sub-client projects. Check back regularly to stay on top of progress and risks.',
    placement: 'center'
  }
]
```

### 4.2 Project Dashboard Tour (All Customers)

**Tour ID:** `customer-project-dashboard-tour`  
**Page:** `/customer/projects/[id]`  
**Steps:** 9

```typescript
const customerProjectDashboardTour: TourStep[] = [
  {
    id: 'welcome',
    target: 'body',
    title: '📊 Project Dashboard',
    content: 'Your project command center. Track milestones, view updates, and understand what actions you need to take.',
    placement: 'center'
  },
  {
    id: 'project-health',
    target: '#project-health-card',
    title: '🟢 Project Health',
    content: 'Current project status with explanation. Green = On Track, Yellow = At Risk, Red = Critical. Read the explanation for details.',
    placement: 'bottom'
  },
  {
    id: 'next-action',
    target: '#next-action-card',
    title: '🎯 Your Next Action',
    content: 'What you need to do next. This is updated by your project manager to keep you on track.',
    placement: 'bottom'
  },
  {
    id: 'timeline',
    target: '#timeline-card',
    title: '📅 Timeline & Progress',
    content: 'Project timeline with start/end dates and completion percentage. See if you\'re ahead or behind schedule.',
    placement: 'bottom'
  },
  {
    id: 'budget',
    target: '#budget-card',
    title: '💰 Budget Snapshot',
    content: 'Budget allocated, spent, and remaining. Variance shows if you\'re over or under budget.',
    placement: 'bottom'
  },
  {
    id: 'milestones',
    target: '#milestones-timeline',
    title: '🎯 Milestone Timeline',
    content: 'Visual timeline of project milestones. Completed milestones are checked, current milestone is highlighted.',
    placement: 'top'
  },
  {
    id: 'roadblocks',
    target: '#roadblocks-section',
    title: '🚧 Active Roadblocks',
    content: 'Current issues blocking progress. Each shows severity, impact, and resolution plan. Your PM is working to resolve these.',
    placement: 'top'
  },
  {
    id: 'activity-feed',
    target: '#activity-feed',
    title: '📢 Recent Activity',
    content: 'Latest project updates from your PM. Stay informed about progress, changes, and completed milestones.',
    placement: 'left'
  },
  {
    id: 'complete',
    target: 'body',
    title: '✅ Dashboard Expert!',
    content: 'You\'re all set! Check your dashboard regularly to stay informed and respond to action items promptly.',
    placement: 'center'
  }
]
```

### 4.3 Sub-Client Projects Tour

**Tour ID:** `sub-client-projects-tour`  
**Page:** `/customer/projects`  
**Steps:** 6

```typescript
const subClientProjectsTour: TourStep[] = [
  {
    id: 'welcome',
    target: 'body',
    title: '👋 Your Projects',
    content: 'View all your active projects in one place. Track progress and stay on top of action items.',
    placement: 'center'
  },
  {
    id: 'project-cards',
    target: '#projects-grid',
    title: '📋 Project Cards',
    content: 'Each card shows project health, progress, next milestone, and your action items. Click to view full dashboard.',
    placement: 'top'
  },
  {
    id: 'health-status',
    target: '.health-badge:first',
    title: '🟢 Health Status',
    content: 'Quick visual indicator of project health. Hover for detailed explanation from your PM.',
    placement: 'bottom'
  },
  {
    id: 'action-items',
    target: '.action-items:first',
    title: '✅ Your Action Items',
    content: 'Tasks requiring your attention. Complete these to keep your project on track.',
    placement: 'left'
  },
  {
    id: 'notifications',
    target: '#notifications-bell',
    title: '🔔 Notifications',
    content: 'Get alerted when milestones are reached, roadblocks are added, or your PM posts updates.',
    placement: 'bottom'
  },
  {
    id: 'complete',
    target: 'body',
    title: '✅ All Set!',
    content: 'Check back regularly to stay informed and respond to action items. Your PM is here to help!',
    placement: 'center'
  }
]
```

---

## 5. Informational Tooltips

### 5.1 Tooltip Component

```typescript
// components/ui/InfoTooltip.tsx
import Tippy from '@tippyjs/react'
import 'tippy.js/dist/tippy.css'
import 'tippy.js/themes/light.css'
import { HelpCircle } from 'lucide-react'

interface InfoTooltipProps {
  content: string
  placement?: 'top' | 'bottom' | 'left' | 'right'
  maxWidth?: number
  interactive?: boolean
}

export function InfoTooltip({ 
  content, 
  placement = 'top',
  maxWidth = 300,
  interactive = false 
}: InfoTooltipProps) {
  return (
    <Tippy
      content={content}
      placement={placement}
      theme="light"
      maxWidth={maxWidth}
      interactive={interactive}
      arrow={true}
    >
      <HelpCircle className="w-4 h-4 text-gray-400 hover:text-blue-600 cursor-help inline-block ml-1" />
    </Tippy>
  )
}

// Usage
<label>
  Project Health Status
  <InfoTooltip content="Indicates overall project health. Green = On Track, Yellow = At Risk, Red = Critical." />
</label>
```

### 5.2 Tooltip Content Library

**Platform Host Tooltips:**

```typescript
export const HOST_TOOLTIPS = {
  healthStatus: {
    title: 'Project Health Status',
    content: 'Visual indicator of project health. Green = On Track (no issues), Yellow = At Risk (minor delays or issues), Red = Critical (major blockers). This is visible to customers on their dashboard.'
  },
  completionPercentage: {
    title: 'Completion Percentage',
    content: 'Overall project progress from 0-100%. Based on completed milestones, deliverables, and work items. Updates automatically as tasks are completed.'
  },
  budgetVariance: {
    title: 'Budget Variance',
    content: 'Difference between planned and actual budget. Positive = under budget, Negative = over budget. Calculated as: (Planned - Actual) / Planned × 100'
  },
  timelineVariance: {
    title: 'Timeline Variance',
    content: 'Days ahead or behind schedule. Positive = ahead of schedule, Negative = behind schedule. Based on milestone completion dates vs. planned dates.'
  },
  customerVisible: {
    title: 'Customer Visible',
    content: 'When enabled, this information appears on the customer\'s project dashboard. Use this to control transparency and manage customer expectations.'
  },
  nextCustomerAction: {
    title: 'Next Customer Action',
    content: 'Specific action the customer needs to take to keep the project moving forward. Be clear and include deadlines. This appears prominently on their dashboard.'
  },
  milestoneDefinitionOfDone: {
    title: 'Definition of Done',
    content: 'Clear criteria that must be met to consider this milestone complete. Helps prevent scope creep and ensures alignment with customer expectations.'
  },
  roadblockSeverity: {
    title: 'Roadblock Severity',
    content: 'Impact level: Low (minor inconvenience), Medium (delays possible), High (significant impact), Critical (project blocked). Customers are auto-notified of High and Critical roadblocks.'
  },
  roadblockImpact: {
    title: 'Roadblock Impact',
    content: 'Quantify the impact on timeline (days delayed) and budget (additional cost). Helps customers understand the severity and make informed decisions.'
  },
  statusUpdateType: {
    title: 'Status Update Type',
    content: 'Categorizes the update for easy filtering. Types: Milestone Completed, Status Change, Risk Identified, Roadblock Added/Resolved, Budget Variance, Timeline Change, General Update.'
  },
  deliverableStatus: {
    title: 'Deliverable Status',
    content: 'Current state: Pending (not started), In Progress (being worked on), In Review (awaiting approval), Completed (finished and approved), Blocked (cannot proceed).'
  },
  riskMitigation: {
    title: 'Risk Mitigation Strategy',
    content: 'Actions being taken to prevent or minimize the risk. Include specific steps, responsible parties, and target dates. Visible to customers when risk is marked customer-visible.'
  }
}
```

**Customer Tooltips:**

```typescript
export const CUSTOMER_TOOLTIPS = {
  projectHealth: {
    title: 'Project Health',
    content: '🟢 Green = On Track (no issues)\n🟡 Yellow = At Risk (minor delays or issues)\n🔴 Red = Critical (major blockers)\n\nYour project manager updates this regularly to keep you informed.'
  },
  completionPercentage: {
    title: 'Completion Percentage',
    content: 'Overall project progress from 0-100%. This is calculated based on completed milestones and deliverables.'
  },
  budgetVariance: {
    title: 'Budget Variance',
    content: 'Shows if the project is under or over budget.\n• Positive % = Under budget (good!)\n• Negative % = Over budget (may need discussion)\n\nYour PM monitors this closely.'
  },
  timelineVariance: {
    title: 'Timeline Status',
    content: 'Shows if the project is ahead or behind schedule.\n• Positive days = Ahead of schedule\n• Negative days = Behind schedule\n\nYour PM will notify you of any significant delays.'
  },
  nextAction: {
    title: 'Your Next Action',
    content: 'Specific task you need to complete to keep the project moving forward. Check this regularly and complete actions by the deadline.'
  },
  milestoneTimeline: {
    title: 'Milestone Timeline',
    content: 'Visual representation of project milestones. ✅ = Completed, 🔵 = In Progress, ⚪ = Upcoming. Click any milestone for details.'
  },
  roadblockSeverity: {
    title: 'Roadblock Severity',
    content: 'Impact level of the issue:\n• 🔴 Critical = Project blocked\n• 🟠 High = Significant delays possible\n• 🟡 Medium = Minor impact\n• 🟢 Low = Minimal impact\n\nYour PM is working to resolve all roadblocks.'
  },
  activityFeed: {
    title: 'Recent Activity',
    content: 'Latest updates from your project manager. Check regularly to stay informed about progress, changes, and completed work.'
  },
  portfolioSummary: {
    title: 'Portfolio Summary',
    content: 'Aggregated metrics across all your sub-client projects. Use this to understand overall demand, capacity, and risk exposure.'
  },
  demandAnalysis: {
    title: 'Demand Analysis',
    content: 'Shows resource allocation and capacity utilization across all sub-clients. Helps you understand where resources are being deployed and identify capacity constraints.'
  }
}
```

### 5.3 Contextual Help Icons

**Placement Strategy:**
- Next to form labels (especially complex fields)
- Next to metric cards (explain calculations)
- Next to status indicators (explain color meanings)
- In section headers (explain section purpose)
- Next to action buttons (explain what happens when clicked)

**Visual Design:**
- Use `HelpCircle` icon from lucide-react
- Gray color (#9CA3AF) by default
- Blue color (#2563EB) on hover
- 16px size (w-4 h-4)
- Positioned inline with text (ml-1)

---

## 6. Tour Controls & Settings

### 6.1 Tour Control Panel

**Location:** User Settings > Tours & Help

```
┌─────────────────────────────────────────────────────────────┐
│ Tours & Help                                                 │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│ Available Tours                                               │
│                                                               │
│ ☑ Project Management Tour                    [Restart Tour] │
│   Learn how to update projects and keep customers informed   │
│   Completed: Nov 15, 2025                                    │
│                                                               │
│ ☑ Portfolio Overview Tour                    [Restart Tour] │
│   Explore your portfolio dashboard and demand analysis       │
│   Completed: Nov 16, 2025                                    │
│                                                               │
│ ☐ Project Dashboard Tour                     [Start Tour]   │
│   Understand your project dashboard and action items         │
│   Not started                                                │
│                                                               │
│ Settings                                                      │
│                                                               │
│ [✓] Auto-start tours for new features                        │
│ [✓] Show tour prompts on first page visit                    │
│ [ ] Never show tours (not recommended)                       │
│                                                               │
│ [Reset All Tours]                                             │
│                                                               │
└─────────────────────────────────────────────────────────────┘
```

### 6.2 Tour Prompt Modal

**Shown on first visit to a page with a tour:**

```
┌─────────────────────────────────────────────────────────────┐
│ 🎓 New Feature Tour Available                    [✕ Close] │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│ Would you like a quick tour of the Project Management page? │
│                                                               │
│ This 2-minute tour will show you:                            │
│ • How to update project health status                        │
│ • How to manage milestones and roadblocks                    │
│ • How to post customer-visible updates                       │
│ • How to use bulk operations                                 │
│                                                               │
│ You can restart the tour anytime from Settings > Tours.      │
│                                                               │
│                                                               │
│         [Maybe Later]    [Don't Show Again]    [Start Tour]  │
│                                                               │
└─────────────────────────────────────────────────────────────┘
```

### 6.3 In-Tour Navigation

**Tour Overlay Controls:**
- **Progress Indicator:** "Step 3 of 12"
- **Back Button:** Return to previous step
- **Next Button:** Advance to next step
- **Skip Tour Button:** Exit tour (save progress)
- **Keyboard Navigation:** Arrow keys, Esc to exit

**Tour Overlay Design:**
```
┌─────────────────────────────────────────────────────────────┐
│ 🎯 Milestones                                Step 5 of 12   │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│ Create and track project milestones. Set customer actions,  │
│ add deliverables, and mark completion. These appear on       │
│ customer dashboards.                                          │
│                                                               │
│                                                               │
│                        [Back]  [Skip Tour]  [Next]           │
│                                                               │
└─────────────────────────────────────────────────────────────┘
```

---

## 7. Accessibility & Best Practices

### 7.1 Accessibility Requirements

**ARIA Labels:**
```typescript
<button
  aria-label="Start project management tour"
  onClick={startTour}
>
  Take Tour
</button>

<div
  role="dialog"
  aria-labelledby="tour-title"
  aria-describedby="tour-content"
>
  <h3 id="tour-title">Milestones</h3>
  <p id="tour-content">Create and track project milestones...</p>
</div>
```

**Keyboard Navigation:**
- Tab: Navigate between tour buttons
- Enter/Space: Activate button
- Esc: Exit tour
- Arrow Left: Previous step
- Arrow Right: Next step

**Screen Reader Support:**
- Announce tour start/end
- Announce step number and total steps
- Read tooltip content on focus

### 7.2 Mobile Responsiveness

**Mobile Tour Adaptations:**
- Simplified steps (combine related steps)
- Bottom-sheet style overlays (easier to read)
- Larger touch targets (48px minimum)
- Swipe gestures (swipe left/right for next/back)

**Mobile Tooltip Behavior:**
- Tap to show tooltip
- Tap outside to dismiss
- No hover states (use tap)

### 7.3 Performance Considerations

**Lazy Loading:**
```typescript
// Load tour library only when needed
const { Tour } = await import('react-shepherd')
```

**Bundle Size:**
- Shepherd.js: ~10KB gzipped
- Tippy.js: ~3KB gzipped
- Total overhead: ~13KB (acceptable)

**Caching:**
- Cache tour completion status in localStorage
- Sync to database every 5 minutes
- Prefetch tour content on page load

---

## 8. Analytics & Tracking

### 8.1 Tour Metrics

**Track the following:**
- Tour start rate (% of users who start)
- Tour completion rate (% who finish)
- Tour skip rate (% who skip)
- Average time to complete
- Step drop-off rates (where users quit)
- Tour restart rate

**Implementation:**
```typescript
// Track tour events
const trackTourEvent = (event: string, data: any) => {
  // Send to analytics service
  analytics.track(`Tour: ${event}`, {
    tourId: data.tourId,
    userId: user.id,
    step: data.step,
    timestamp: new Date()
  })
}

// Usage
trackTourEvent('Tour Started', { tourId, step: 0 })
trackTourEvent('Tour Step Completed', { tourId, step: 5 })
trackTourEvent('Tour Completed', { tourId, step: 12 })
trackTourEvent('Tour Skipped', { tourId, step: 5 })
```

### 8.2 Tooltip Metrics

**Track the following:**
- Tooltip hover/click rate
- Most viewed tooltips (identify confusing areas)
- Time spent reading tooltips

---

## 9. Implementation Checklist

### 9.1 Phase 1: Setup (Week 1)
- [ ] Install Shepherd.js and React Shepherd
- [ ] Install Tippy.js
- [ ] Create TourProvider component
- [ ] Create InfoTooltip component
- [ ] Set up tour state management (localStorage + DB)
- [ ] Create tour progress tracking table in database

### 9.2 Phase 2: Platform Host Tours (Week 2-3)
- [ ] Implement Project Management Tour (12 steps)
- [ ] Implement Bulk Operations Tour (6 steps)
- [ ] Add informational tooltips to all Platform Host pages
- [ ] Test keyboard navigation and accessibility
- [ ] Test on mobile devices

### 9.3 Phase 3: Customer Tours (Week 4-5)
- [ ] Implement Portfolio Overview Tour (10 steps)
- [ ] Implement Project Dashboard Tour (9 steps)
- [ ] Implement Sub-Client Projects Tour (6 steps)
- [ ] Add informational tooltips to all Customer pages
- [ ] Test across different customer roles

### 9.4 Phase 4: Controls & Settings (Week 6)
- [ ] Create Tour Control Panel in Settings
- [ ] Implement tour prompt modal
- [ ] Add "Take Tour" button to page headers
- [ ] Implement tour restart functionality
- [ ] Add tour preferences (auto-start, never show, etc.)

### 9.5 Phase 5: Analytics & Refinement (Week 7)
- [ ] Implement tour analytics tracking
- [ ] Implement tooltip analytics tracking
- [ ] Review tour completion rates
- [ ] Refine tour content based on feedback
- [ ] Optimize performance

---

## 10. Content Writing Guidelines

### 10.1 Tour Content Best Practices

**Tone:**
- Friendly and conversational
- Encouraging and positive
- Clear and concise
- Avoid jargon

**Length:**
- Title: 3-5 words
- Content: 1-2 sentences (max 150 characters)
- Use bullet points for lists

**Structure:**
- Start with what (what is this feature?)
- Explain why (why should I use it?)
- End with how (how do I use it?)

**Examples:**

❌ **Bad:**
"This section contains the project health status indicator which can be updated by clicking the button to open the modal where you can select from three options..."

✅ **Good:**
"Update project health (Green/Yellow/Red) to keep customers informed. Click 'Quick Update' to change status and add an explanation."

### 10.2 Tooltip Content Best Practices

**Tone:**
- Informative and helpful
- Professional but approachable
- Concise and scannable

**Length:**
- 1-3 sentences (max 200 characters)
- Use line breaks for readability
- Include examples when helpful

**Structure:**
- Define the term/concept
- Explain how it's calculated (if applicable)
- Provide context or example

**Examples:**

❌ **Bad:**
"The budget variance is a metric that shows the difference between what was planned and what was actually spent."

✅ **Good:**
"Budget Variance: Difference between planned and actual budget. Positive = under budget, Negative = over budget. Calculated as: (Planned - Actual) / Planned × 100"

---

## 11. Maintenance & Updates

### 11.1 When to Update Tours

**Update tours when:**
- New features are added to a page
- UI layout changes significantly
- User feedback indicates confusion
- Tour completion rates drop below 60%

### 11.2 Version Control

**Tour Versioning:**
```typescript
interface Tour {
  id: string
  version: string // e.g., "1.0.0"
  steps: TourStep[]
  lastUpdated: Date
}

// Check if user has seen latest version
const needsUpdate = userTourVersion < currentTourVersion
```

### 11.3 A/B Testing

**Test different tour variations:**
- Short vs. long tours
- Text-only vs. text + images
- Auto-start vs. manual start
- Different step sequences

**Measure:**
- Completion rates
- Time to complete
- Feature adoption rates
- User satisfaction scores

---

## 12. Success Metrics

### 12.1 Tour Success Criteria

**Target Metrics:**
- **Tour Start Rate:** >70% of first-time users
- **Tour Completion Rate:** >60% of users who start
- **Tour Skip Rate:** <30%
- **Average Completion Time:** 2-3 minutes per tour
- **Feature Adoption:** >40% increase after tour

### 12.2 Tooltip Success Criteria

**Target Metrics:**
- **Tooltip Engagement:** >30% of users interact with tooltips
- **Most Viewed Tooltips:** Identify top 10 confusing areas
- **Support Ticket Reduction:** >20% reduction in "how-to" tickets

---

## Conclusion

This guided tour system will significantly improve user onboarding, feature discovery, and overall user experience. By providing contextual help at the point of need, we reduce cognitive load and empower users to become proficient quickly.

**Key Benefits:**
- **Faster Onboarding:** New users become productive in minutes, not hours
- **Reduced Support Burden:** Self-service help reduces support tickets
- **Increased Feature Adoption:** Users discover and use advanced features
- **Better User Experience:** Contextual help reduces frustration and confusion

**Next Steps:**
1. Review and approve specifications
2. Begin implementation in Phase 3.3 (Platform Host UI)
3. Iterate based on user feedback and analytics
4. Expand tours to other areas of the application
