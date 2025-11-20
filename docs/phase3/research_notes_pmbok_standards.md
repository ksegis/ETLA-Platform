# PMBOK Standards and Status Reporting Research Notes

## Source: PMI - Anatomy of Effective Status Report

### Key Principles for Status Reports

**Main Purpose:**
- Escalate risks and issues to stakeholders
- Provide visibility for project team accomplishments
- Enable transparency and alignment
- Communicate what the project needs from stakeholders and when

### Best Practices from Industry Practitioners

**1. Keep It Simple and Short (Daniel G. Glasow, CSC)**
- Status reports must be simple, short, and clearly structured
- Break down complex information into comprehensible pieces
- If a PM can't explain status in a few words, there may be underlying problems
- Avoid too much text - it bogs down meetings and camouflages uncertainties
- Focus on what will help the project succeed, not every single activity

**2. Know Your Audience (Mattias Hallberg, Rakuten)**
- Ask stakeholders what they want included
- Create brief, color-coded executive summary for decision-makers
- Provide links to detailed dashboards for those who need details
- Never name names - focus on activities
- Verify details with multiple sources
- Remain objective

**3. Consider Delivery Method (Kathi Soniat, Randstad)**
- Online, constantly updated "living documents" work better than static emails
- Provide both dashboard view and detailed view
- Visual status indicators at a glance
- Integration at portfolio level reduces manual compilation time
- Accessible across time zones and locations

### Status Report Structure

**Essential Components:**
1. Overall project health indicator (visual/color-coded)
2. Progress against timeline
3. Budget status
4. Key milestones and due dates
5. Dependencies and what's needed from stakeholders
6. Risks and issues requiring escalation
7. Recent accomplishments

**What to Avoid:**
- Excessive detail that obscures key messages
- Naming individuals (focus on activities)
- Unverified information
- Subjective conclusions about areas outside your oversight

## PMBOK 7 Measurement Performance Domain

### Core Focus
The Measurement Performance Domain emphasizes systematic processes to assess, monitor, and enhance project performance throughout the lifecycle.

### Key Elements

**Performance Metrics:**
- Schedule Performance Index (SPI)
- Cost Performance Index (CPI)
- Key Performance Indicators (KPIs)
- Earned Value Management (EVM)
- Variance Analysis

**Purpose:**
- Establish clear, quantifiable metrics
- Assess how effectively project achieves objectives
- Enable data-driven decision making
- Take appropriate corrective actions

### Modern Project Monitoring Standards

**Milestone Management:**
- Milestones represent planned completion of significant events
- Not every task completion, but key deliverables
- Focus attention on things of concern to stakeholders
- Allow project owner to assess performance
- Should have clear definition of done

**Performance Assessment:**
- Regular measurement against baseline
- Trend analysis
- Forecasting
- Corrective action planning

## Customer-Facing Project Dashboard Best Practices

### Source: Industry Research on Client-Facing Dashboards

### Core Purpose
Customer-facing dashboards answer three critical questions:
1. Is this project on track?
2. What's next for me (the client)?
3. Are there risks I should know about?

### Essential Dashboard Elements

**What Clients Need to See:**
- **Project Health Indicator**: Clear visual status (green/yellow/red) with brief explanation
- **Progress Tracker**: Percentage complete and current phase
- **Next Milestone**: Name, date, owner, and client requirements
- **Budget Snapshot**: Approved vs. spent with variance indicator
- **Recent Activity**: Timestamped updates with clear action verbs

**What to Hide by Default:**
- Internal task lists
- Resource allocation details
- Internal team discussions
- Ticket backlog management
- Technical implementation details

### Milestone Design Principles

**Clear Anatomy for Each Milestone:**
- Status: Completed, In Progress, Upcoming, or Blocked
- Definition of Done: Clear acceptance criteria in plain language
- Dependencies: What moves if this milestone slips
- Proof/Evidence: Links to deliverables or previews
- Owner and due date
- "What we need from you" line for client actions

**Milestone Structure Options:**
1. **Phase-Gate Model**: Discovery → Design → Build → Validate → Launch
2. **Deliverable-Based**: Strategy Deck → Wireframes → Concept Selection → Final Creative → Handover

### Alert Strategy (Building Trust, Not Anxiety)

**Three Alert Types:**

1. **Before Due (Proactive)** - 48-72 hours before milestone
   - Purpose: Prompt reviews and approvals without pressure
   - Example: "Heads-up: Concept Review due Fri 4 pm. Click to review."

2. **At Risk (Preventive)** - When confidence drops or dependencies slip
   - Purpose: Share options and request decisions for recovery
   - Example: "Vendor response delayed; QA likely +2 days. Choose: A) swap vendor, B) compress UAT."

3. **Breached (Critical)** - Immediate notification when deadline/budget missed
   - Purpose: Provide recovery plan and request approval
   - Example: "Milestone missed. Reallocating 12 hours to unblock. New target: Wed 3 pm. Approve plan?"

**Alert Cadence:**
- Weekly digest (Monday) for routine updates
- Event-based alerts for exceptions
- In-app + email for proactive and at-risk items
- SMS/push reserved for critical breaches
- Celebrate progress: "Phase 1 complete. Thanks for your feedback."

### Role-Based Dashboard Views

**Client View:**
- Project health
- Progress tracker
- Next milestone
- "My Actions" (approvals, uploads)
- Simple change log
- Before-due and at-risk alerts

**Project Manager View:**
- Portfolio health
- Forecasted completion dates
- Risks and blockers
- Aging approvals
- Budget burn by phase
- Resource conflicts
- Response times and SLA timers

**Executive View:**
- Revenue at risk
- Gross margin by project
- Capacity utilization
- NPS/CSAT trends
- Red/yellow projects threatening goals
- Path to green status

### Key Performance Indicators

**Client-Facing KPIs:**
- On-time milestone rate (delivery reliability)
- Timeline adherence (forecast vs. baseline)
- Approval cycle time (decision bottlenecks)
- Issue turnaround time (blocker resolution)
- Budget utilization (spent vs. authorized with variance)

**Operational KPIs (Available on Demand):**
- Risk exposure (yellow/red items aging)
- Response time (median reply speed)
- Scope change impact (added days/cost)
- Quality indicators (revisions per deliverable)

### Design Principles

**Transparency Over Noise:**
- One source of truth
- Update once, reflect everywhere
- Show status at a glance
- Deep-link alerts to specific actions
- Keep primary view lightweight

**Trust-Building Features:**
- Predictable update cadence
- Clear ownership for each item
- Audit trail for all changes
- Version control for deliverables
- Branded, professional interface

**Mobile-First Considerations:**
- Responsive design
- Touch-friendly interactions
- Offline access to key data
- Push notifications for critical items


## Modern Project Management UI Patterns

### Analysis of Leading PM Tools (Asana, Monday.com, Jira)

**Common Visual Patterns:**

1. **Timeline/Gantt View**
   - Horizontal bars representing task/milestone duration
   - Color-coding by status, priority, or category
   - Dependencies shown with connecting lines
   - Today marker for temporal context
   - Milestone diamonds or markers
   - Swimlanes for grouping (by team, phase, or category)

2. **Status Indicators**
   - Color-coded badges (green/yellow/red or custom colors)
   - Progress bars showing completion percentage
   - Status pills with text labels (On Track, At Risk, Blocked, Complete)
   - Visual health scores or confidence indicators

3. **Card-Based Layouts**
   - Compact cards with key information
   - Expandable for details
   - Avatar indicators for ownership
   - Date badges
   - Quick action buttons
   - Tag/label chips

4. **Dashboard Widgets**
   - Summary metrics at top (KPIs, health score)
   - Timeline view in center
   - Activity feed on side
   - Quick filters and search
   - Collapsible sections

### Roadblock and Issue Visualization

**Best Practices for Roadblock Tracking:**

1. **Visual Indicators**
   - Red flag icons or warning symbols
   - Dedicated "Blocked" status with distinct color
   - Impact severity indicators (Critical, High, Medium, Low)
   - Age/duration of blockage

2. **Information Display**
   - Clear description of the blocker
   - Who/what is blocking progress
   - Impact on timeline/budget
   - Proposed resolution or action needed
   - Owner responsible for resolution
   - Target resolution date

3. **Integration with Timeline**
   - Roadblocks shown inline with affected milestones
   - Visual connection between blocker and impacted items
   - Cascading delay visualization

### Risk Register Visualization

**Key Elements for Customer-Facing Risk Display:**

1. **Risk Matrix**
   - Probability vs. Impact grid
   - Color-coded quadrants (low/medium/high)
   - Risks plotted as dots or cards
   - Hover/click for details

2. **Risk Cards**
   - Risk description
   - Probability rating
   - Impact rating
   - Mitigation strategy
   - Owner
   - Status (Identified, Mitigating, Resolved, Realized)

3. **Simplified for Clients**
   - Focus on high-impact risks only
   - Plain language descriptions
   - Clear mitigation actions
   - Avoid technical jargon
   - Show confidence in management

### Color Psychology for Status

**Industry Standard Color Meanings:**
- **Green**: On track, healthy, complete, approved
- **Yellow/Amber**: At risk, needs attention, pending
- **Red**: Blocked, overdue, critical, rejected
- **Blue**: In progress, active, informational
- **Gray**: Not started, inactive, archived
- **Purple**: Review, validation, special status

### Responsive Design Patterns

**Mobile Optimization:**
- Stacked cards instead of tables
- Collapsible sections
- Touch-friendly buttons (min 44px)
- Swipe gestures for actions
- Bottom navigation for key actions
- Simplified views with "View More" expansion
