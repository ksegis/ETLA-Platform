// Tooltip content library for the application

export const WORK_REQUEST_TOOLTIPS = {
  priority: {
    title: 'Priority Level',
    content: 'Indicates the importance of this request:\n• Critical: Urgent business need\n• High: Important but not urgent\n• Medium: Standard request\n• Low: Nice to have'
  },
  urgency: {
    title: 'Urgency',
    content: 'How quickly this needs to be completed:\n• Urgent: Immediate action required\n• High: Complete within 1-2 weeks\n• Medium: Complete within 1 month\n• Low: Flexible timeline'
  },
  estimatedHours: {
    title: 'Estimated Hours',
    content: 'Approximate time required to complete this work request. This helps with resource planning and scheduling.'
  },
  estimatedBudget: {
    title: 'Estimated Budget',
    content: 'Approximate cost to complete this request. Actual costs may vary based on scope changes and complexity.'
  },
  requiredCompletionDate: {
    title: 'Required Completion Date',
    content: 'Hard deadline for when this work must be completed. Used for critical business needs with fixed dates.'
  },
  requestedCompletionDate: {
    title: 'Requested Completion Date',
    content: 'Preferred completion date. This is a target, not a hard deadline. Actual completion may vary based on capacity.'
  },
  businessJustification: {
    title: 'Business Justification',
    content: 'Explain why this work is needed and what business value it provides. Helps prioritize requests and secure approval.'
  },
  impactAssessment: {
    title: 'Impact Assessment',
    content: 'Describe the impact if this work is NOT completed. Helps decision-makers understand the urgency and importance.'
  },
  successCriteria: {
    title: 'Success Criteria',
    content: 'Define what "done" looks like. Clear criteria help ensure alignment and prevent scope creep.'
  },
  approvalStatus: {
    title: 'Approval Status',
    content: 'Current approval state:\n• Submitted: Awaiting review\n• Under Review: Being evaluated\n• Approved: Ready to schedule\n• Rejected: Not approved (see reason)'
  }
}

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

// Unified tooltip content export
export const TOOLTIP_CONTENT = {
  host: {
    quickUpdate: 'Quickly update key project metrics that customers see on their dashboard. Changes are immediately visible to the customer.',
    healthStatus: HOST_TOOLTIPS.healthStatus.content,
    completionPercentage: HOST_TOOLTIPS.completionPercentage.content,
    budgetVariance: HOST_TOOLTIPS.budgetVariance.content,
    timelineVariance: HOST_TOOLTIPS.timelineVariance.content,
    nextCustomerAction: HOST_TOOLTIPS.nextCustomerAction.content,
    roadblocks: 'Track and manage project blockers. High and Critical roadblocks automatically notify customers. Use resolution plans to communicate how issues will be addressed.',
    milestones: 'Manage project milestones with customer actions and definitions of done. Mark milestones as customer-visible to show them on the customer dashboard.',
    statusUpdates: 'Post customer-visible updates about project progress. These appear in the customer\'s activity feed and can trigger notifications.',
    deliverables: 'Track project deliverables and their completion status. Link deliverables to milestones for better visibility.'
  },
  customer: CUSTOMER_TOOLTIPS,
  workRequest: WORK_REQUEST_TOOLTIPS
}
