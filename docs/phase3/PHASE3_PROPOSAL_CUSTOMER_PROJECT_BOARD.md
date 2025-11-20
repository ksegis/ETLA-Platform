# Phase 3: Customer-Facing Project Board - Comprehensive Proposal

## Executive Summary

This proposal outlines the implementation of a customer-facing project dashboard for the HelixBridge (ETLA Platform), following PMBOK 7th Edition standards and modern project management best practices. The solution will provide Primary Customers with transparent, real-time visibility into their sub-accounts' projects while maintaining strict role-based access controls.

---

## 1. Research Findings

### 1.1 PMBOK 7 Measurement Performance Domain

The PMBOK 7th Edition emphasizes the **Measurement Performance Domain**, which focuses on systematic processes to assess, monitor, and enhance project performance throughout the lifecycle. Key principles include establishing clear, quantifiable metrics that enable data-driven decision-making and appropriate corrective actions.

**Core Performance Metrics:**
- Schedule Performance Index (SPI)
- Cost Performance Index (CPI)
- Key Performance Indicators (KPIs)
- Earned Value Management (EVM)
- Variance Analysis

**Milestone Management Standards:**
- Milestones represent planned completion of significant events, not every task
- Focus attention on items of concern to stakeholders
- Allow project owners to assess performance
- Must have clear definition of done

### 1.2 Status Reporting Best Practices (PMI Research)

Research from PMI's "Anatomy of an Effective Status Report" reveals three critical principles:

**Keep It Simple and Short:**
Status reports must be simple, short, and clearly structured. Complex information should be broken down into comprehensible pieces. If a project manager cannot explain status in a few words, there may be underlying problems. Excessive text bogs down meetings and can camouflage uncertainties.

**Know Your Audience:**
Stakeholders depend on report information, so ask them what they want included. Create brief, color-coded executive summaries for decision-makers while providing links to detailed dashboards for those who need depth. Never name individuals—focus on activities. Verify details with multiple sources and remain objective.

**Consider Delivery Method:**
Online, constantly updated "living documents" work better than static emails. Provide both dashboard and detailed views with visual status indicators at a glance. Integration at the portfolio level reduces manual compilation time and ensures accessibility across time zones and locations.

### 1.3 Customer-Facing Dashboard Best Practices

Modern customer-facing dashboards answer three critical questions:
1. **Is this project on track?**
2. **What's next for me (the client)?**
3. **Are there risks I should know about?**

**Essential Elements Clients Need:**
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

### 1.4 Modern UI Patterns (Asana, Monday.com, Jira)

Analysis of leading project management tools reveals consistent visual patterns:

**Timeline/Gantt View:**
- Horizontal bars representing task/milestone duration
- Color-coding by status, priority, or category
- Dependencies shown with connecting lines
- Today marker for temporal context
- Milestone diamonds or markers
- Swimlanes for grouping (by team, phase, or category)

**Status Indicators:**
- Color-coded badges (green/yellow/red or custom colors)
- Progress bars showing completion percentage
- Status pills with text labels (On Track, At Risk, Blocked, Complete)
- Visual health scores or confidence indicators

**Card-Based Layouts:**
- Compact cards with key information
- Expandable for details
- Avatar indicators for ownership
- Date badges
- Quick action buttons
- Tag/label chips

**Industry Standard Color Meanings:**
- **Green**: On track, healthy, complete, approved
- **Yellow/Amber**: At risk, needs attention, pending
- **Red**: Blocked, overdue, critical, rejected
- **Blue**: In progress, active, informational
- **Gray**: Not started, inactive, archived
- **Purple**: Review, validation, special status

### 1.5 Alert Strategy (Building Trust, Not Anxiety)

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
- Celebrate progress: "Phase 1 complete. Thanks for your feedback."

---

## 2. Current System Analysis

### 2.1 Existing Database Schema

**Current Tables:**
- `work_requests` - Customer work request submissions
- `project_charters` - Project planning and execution
- `project_milestones` - Milestone tracking
- `risks` - Risk register
- `time_entries` - Time tracking
- `tenants` - Multi-tenant hierarchy (Tier 1: Platform Host, Tier 2: Primary Customers, Tier 3: Sub-Clients)
- `tenant_users` - User-tenant relationships with roles

**Current Interfaces (from `/frontend/src/types/index.ts`):**

```typescript
export interface WorkRequest extends BaseEntity {
  title: string;
  description: string;
  priority: PriorityLevel | 'urgent';
  status: RequestStatus;
  customer_id: string;
  requested_by?: string;
  assigned_to?: string;
  due_date?: string;
  estimated_hours?: number;
  estimated_cost?: number;
  approval_status?: 'pending' | 'approved' | 'rejected' | 'submitted' | 'under_review';
  // ... additional fields
}

export interface ProjectCharter extends BaseEntity {
  project_id?: string;
  project_name?: string;
  title: string;
  description: string;
  objectives?: string[];
  deliverables?: string[];
  timeline?: string | { start_date: string; end_date: string; milestones: Array<...> };
  budget: number | { total_budget: number; ... };
  status?: string;
  milestones?: any[];
  completionPercentage?: number;
  // ... additional fields
}

export interface ProjectMilestone extends BaseEntity {
  project_id: string;
  title: string;
  description?: string;
  due_date: string;
  completion_date?: string;
  status: 'pending' | 'in_progress' | 'completed' | 'overdue';
  completion_percentage: number;
  dependencies?: string[];
  deliverables?: string[];
  assigned_to?: string;
}

export interface Risk extends BaseEntity {
  title: string;
  description: string;
  probability: RiskProbability;
  impact: RiskImpact;
  risk_level?: RiskLevel;
  status: 'open' | 'mitigated' | 'closed';
  owner?: string;
  mitigation_plan?: string;
  project_id?: string;
  work_request_id?: string;
}
```

### 2.2 Current Role Structure

**Existing Roles:**
- `host_admin` - Platform Host administrators (ETLA)
- `program_manager` - Platform Host program managers
- `client_admin` - Primary Customer administrators
- `client_user` - Primary Customer users

### 2.3 Current UI Components

**Established Design System:**
- Global compact design (14px base font, reduced padding/spacing)
- Responsive sidebar (narrower on tablets)
- Compact cards, forms, tables, badges
- ~30-40% more content visible on screen
- Collapsible sections for better space management

**Existing Pages:**
- `/app/work-requests/page.tsx` - Work request management
- `/app/project-management/page.tsx` - Project charter management
- `/app/admin/tenant-management/page.tsx` - Tenant hierarchy and user management

---

## 3. Proposed Solution Architecture

### 3.1 Permission Model

**Primary Customer (Tier 2) Permissions:**

| Feature | View | Create | Edit | Approve | Delete |
|---------|------|--------|------|---------|--------|
| **Work Requests (Own)** | ✅ | ✅ | ✅ (own) | ❌ | ❌ |
| **Work Requests (Sub-Accounts)** | ✅ | ❌ | ❌ | ❌ | ❌ |
| **Projects (Own)** | ❌ | ❌ | ❌ | ❌ | ❌ |
| **Projects (Sub-Accounts)** | ✅ | ❌ | ❌ | ❌ | ❌ |
| **Project Board (Sub-Accounts)** | ✅ | ❌ | ❌ | ❌ | ❌ |
| **Milestones (Sub-Accounts)** | ✅ | ❌ | ❌ | ❌ | ❌ |
| **Risks (Sub-Accounts)** | ✅ (high-impact only) | ❌ | ❌ | ❌ | ❌ |

**Platform Host (Tier 1) Permissions:**

| Feature | View | Create | Edit | Approve | Delete |
|---------|------|--------|------|---------|--------|
| **Work Requests (All)** | ✅ | ✅ | ✅ | ✅ | ✅ |
| **Projects (All)** | ✅ | ✅ | ✅ | ✅ | ✅ |
| **Project Board (All)** | ✅ | ✅ | ✅ | ✅ | ✅ |
| **Milestones (All)** | ✅ | ✅ | ✅ | ✅ | ✅ |
| **Risks (All)** | ✅ | ✅ | ✅ | ✅ | ✅ |

**Sub-Client (Tier 3) Permissions:**

| Feature | View | Create | Edit | Approve | Delete |
|---------|------|--------|------|---------|--------|
| **Work Requests (Own)** | ✅ | ✅ | ✅ (own) | ❌ | ❌ |
| **Projects (Own)** | ✅ | ❌ | ❌ | ❌ | ❌ |
| **Project Board (Own)** | ✅ | ❌ | ❌ | ❌ | ❌ |

### 3.2 Database Schema Extensions

**New Tables:**

```sql
-- Project Roadblocks (Issues/Blockers)
CREATE TABLE project_roadblocks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tenant_id UUID NOT NULL REFERENCES tenants(id),
  project_id UUID NOT NULL REFERENCES project_charters(id),
  milestone_id UUID REFERENCES project_milestones(id),
  
  title VARCHAR(255) NOT NULL,
  description TEXT,
  severity VARCHAR(50) NOT NULL CHECK (severity IN ('low', 'medium', 'high', 'critical')),
  status VARCHAR(50) NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'in_progress', 'resolved', 'closed')),
  
  impact_description TEXT,
  timeline_impact_days INTEGER DEFAULT 0,
  budget_impact_amount DECIMAL(12,2) DEFAULT 0,
  
  identified_by UUID REFERENCES auth.users(id),
  identified_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  assigned_to UUID REFERENCES auth.users(id),
  resolution_plan TEXT,
  target_resolution_date DATE,
  actual_resolution_date DATE,
  resolution_notes TEXT,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_by UUID REFERENCES auth.users(id),
  
  CONSTRAINT fk_tenant FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE CASCADE
);

-- Project Status Updates (Activity Feed)
CREATE TABLE project_status_updates (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tenant_id UUID NOT NULL REFERENCES tenants(id),
  project_id UUID NOT NULL REFERENCES project_charters(id),
  
  update_type VARCHAR(50) NOT NULL CHECK (update_type IN ('milestone_completed', 'status_change', 'risk_identified', 'roadblock_added', 'roadblock_resolved', 'budget_variance', 'timeline_change', 'general_update')),
  title VARCHAR(255) NOT NULL,
  description TEXT,
  visibility VARCHAR(50) NOT NULL DEFAULT 'internal' CHECK (visibility IN ('internal', 'customer_visible')),
  
  related_milestone_id UUID REFERENCES project_milestones(id),
  related_risk_id UUID REFERENCES risks(id),
  related_roadblock_id UUID REFERENCES project_roadblocks(id),
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_by UUID REFERENCES auth.users(id),
  
  CONSTRAINT fk_tenant FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE CASCADE
);

-- Project Deliverables
CREATE TABLE project_deliverables (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tenant_id UUID NOT NULL REFERENCES tenants(id),
  project_id UUID NOT NULL REFERENCES project_charters(id),
  milestone_id UUID REFERENCES project_milestones(id),
  
  title VARCHAR(255) NOT NULL,
  description TEXT,
  deliverable_type VARCHAR(100),
  due_date DATE NOT NULL,
  completion_date DATE,
  status VARCHAR(50) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'completed', 'approved', 'rejected')),
  
  file_url TEXT,
  file_name VARCHAR(255),
  file_size_bytes BIGINT,
  
  assigned_to UUID REFERENCES auth.users(id),
  approved_by UUID REFERENCES auth.users(id),
  approved_at TIMESTAMP WITH TIME ZONE,
  approval_notes TEXT,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_by UUID REFERENCES auth.users(id),
  
  CONSTRAINT fk_tenant FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE CASCADE
);

-- Customer Project Notifications (Alert System)
CREATE TABLE customer_project_notifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tenant_id UUID NOT NULL REFERENCES tenants(id),
  project_id UUID NOT NULL REFERENCES project_charters(id),
  user_id UUID NOT NULL REFERENCES auth.users(id),
  
  notification_type VARCHAR(50) NOT NULL CHECK (notification_type IN ('before_due', 'at_risk', 'breached', 'milestone_completed', 'status_change', 'roadblock_added', 'weekly_digest')),
  title VARCHAR(255) NOT NULL,
  message TEXT NOT NULL,
  priority VARCHAR(50) NOT NULL DEFAULT 'normal' CHECK (priority IN ('low', 'normal', 'high', 'critical')),
  
  related_milestone_id UUID REFERENCES project_milestones(id),
  related_roadblock_id UUID REFERENCES project_roadblocks(id),
  
  read BOOLEAN DEFAULT FALSE,
  read_at TIMESTAMP WITH TIME ZONE,
  sent_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  delivery_method VARCHAR(50)[] DEFAULT ARRAY['in_app'], -- ['in_app', 'email', 'sms']
  
  action_url TEXT,
  action_label VARCHAR(100),
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  CONSTRAINT fk_tenant FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE CASCADE
);

-- Indexes for performance
CREATE INDEX idx_roadblocks_project ON project_roadblocks(project_id);
CREATE INDEX idx_roadblocks_status ON project_roadblocks(status);
CREATE INDEX idx_roadblocks_severity ON project_roadblocks(severity);
CREATE INDEX idx_status_updates_project ON project_status_updates(project_id);
CREATE INDEX idx_status_updates_visibility ON project_status_updates(visibility);
CREATE INDEX idx_deliverables_project ON project_deliverables(project_id);
CREATE INDEX idx_deliverables_milestone ON project_deliverables(milestone_id);
CREATE INDEX idx_deliverables_status ON project_deliverables(status);
CREATE INDEX idx_notifications_user ON customer_project_notifications(user_id);
CREATE INDEX idx_notifications_read ON customer_project_notifications(read);
CREATE INDEX idx_notifications_project ON customer_project_notifications(project_id);
```

**Schema Modifications:**

```sql
-- Add customer visibility flag to existing tables
ALTER TABLE project_milestones 
  ADD COLUMN customer_visible BOOLEAN DEFAULT TRUE,
  ADD COLUMN definition_of_done TEXT,
  ADD COLUMN proof_url TEXT;

ALTER TABLE risks
  ADD COLUMN customer_visible BOOLEAN DEFAULT FALSE; -- Only high-impact risks visible to customers

-- Add project health indicator
ALTER TABLE project_charters
  ADD COLUMN health_status VARCHAR(50) DEFAULT 'green' CHECK (health_status IN ('green', 'yellow', 'red')),
  ADD COLUMN health_explanation TEXT,
  ADD COLUMN current_phase VARCHAR(100),
  ADD COLUMN next_action_for_customer TEXT,
  ADD COLUMN budget_variance_percentage DECIMAL(5,2) DEFAULT 0,
  ADD COLUMN timeline_variance_days INTEGER DEFAULT 0;
```

**Database Functions:**

```sql
-- Get projects for customer's sub-accounts
CREATE OR REPLACE FUNCTION get_customer_subaccount_projects(p_customer_tenant_id UUID)
RETURNS TABLE (
  project_id UUID,
  project_name VARCHAR,
  sub_account_name VARCHAR,
  sub_account_id UUID,
  health_status VARCHAR,
  completion_percentage INTEGER,
  current_phase VARCHAR,
  next_milestone_title VARCHAR,
  next_milestone_date DATE,
  budget_total DECIMAL,
  budget_spent DECIMAL,
  budget_variance_percentage DECIMAL,
  timeline_variance_days INTEGER,
  open_roadblocks_count INTEGER,
  high_risks_count INTEGER
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    pc.id AS project_id,
    pc.title AS project_name,
    t.name AS sub_account_name,
    t.id AS sub_account_id,
    pc.health_status,
    COALESCE(pc.completionPercentage, 0)::INTEGER AS completion_percentage,
    pc.current_phase,
    (SELECT pm.title FROM project_milestones pm 
     WHERE pm.project_id = pc.id 
       AND pm.status IN ('pending', 'in_progress')
       AND pm.due_date >= CURRENT_DATE
     ORDER BY pm.due_date ASC LIMIT 1) AS next_milestone_title,
    (SELECT pm.due_date FROM project_milestones pm 
     WHERE pm.project_id = pc.id 
       AND pm.status IN ('pending', 'in_progress')
       AND pm.due_date >= CURRENT_DATE
     ORDER BY pm.due_date ASC LIMIT 1) AS next_milestone_date,
    CASE 
      WHEN jsonb_typeof(pc.budget) = 'object' 
      THEN (pc.budget->>'total_budget')::DECIMAL
      ELSE pc.budget::DECIMAL
    END AS budget_total,
    COALESCE(pc.actualCost, 0) AS budget_spent,
    COALESCE(pc.budget_variance_percentage, 0) AS budget_variance_percentage,
    COALESCE(pc.timeline_variance_days, 0) AS timeline_variance_days,
    (SELECT COUNT(*) FROM project_roadblocks pr 
     WHERE pr.project_id = pc.id 
       AND pr.status IN ('open', 'in_progress'))::INTEGER AS open_roadblocks_count,
    (SELECT COUNT(*) FROM risks r 
     WHERE r.project_id = pc.id 
       AND r.status = 'open'
       AND r.risk_level IN ('high', 'critical')
       AND r.customer_visible = TRUE)::INTEGER AS high_risks_count
  FROM project_charters pc
  INNER JOIN tenants t ON pc.tenant_id = t.id
  WHERE t.parent_tenant_id = p_customer_tenant_id
    AND t.tenant_tier = 3
    AND pc.status NOT IN ('cancelled')
  ORDER BY pc.updated_at DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Get project dashboard details
CREATE OR REPLACE FUNCTION get_project_dashboard_details(p_project_id UUID, p_requesting_tenant_id UUID)
RETURNS JSON AS $$
DECLARE
  v_result JSON;
  v_project_tenant_id UUID;
  v_parent_tenant_id UUID;
  v_has_access BOOLEAN := FALSE;
BEGIN
  -- Get project tenant and check access
  SELECT pc.tenant_id INTO v_project_tenant_id
  FROM project_charters pc
  WHERE pc.id = p_project_id;
  
  -- Check if requesting tenant is parent or the project owner
  SELECT t.parent_tenant_id INTO v_parent_tenant_id
  FROM tenants t
  WHERE t.id = v_project_tenant_id;
  
  IF v_project_tenant_id = p_requesting_tenant_id OR v_parent_tenant_id = p_requesting_tenant_id THEN
    v_has_access := TRUE;
  END IF;
  
  IF NOT v_has_access THEN
    RETURN json_build_object('error', 'Access denied');
  END IF;
  
  -- Build comprehensive project dashboard data
  SELECT json_build_object(
    'project', (
      SELECT row_to_json(pc.*) 
      FROM project_charters pc 
      WHERE pc.id = p_project_id
    ),
    'milestones', (
      SELECT json_agg(row_to_json(pm.*) ORDER BY pm.due_date ASC)
      FROM project_milestones pm
      WHERE pm.project_id = p_project_id
        AND pm.customer_visible = TRUE
    ),
    'roadblocks', (
      SELECT json_agg(row_to_json(pr.*) ORDER BY pr.severity DESC, pr.created_at DESC)
      FROM project_roadblocks pr
      WHERE pr.project_id = p_project_id
        AND pr.status IN ('open', 'in_progress')
    ),
    'risks', (
      SELECT json_agg(row_to_json(r.*) ORDER BY r.risk_level DESC)
      FROM risks r
      WHERE r.project_id = p_project_id
        AND r.customer_visible = TRUE
        AND r.status = 'open'
    ),
    'recent_updates', (
      SELECT json_agg(row_to_json(psu.*) ORDER BY psu.created_at DESC)
      FROM project_status_updates psu
      WHERE psu.project_id = p_project_id
        AND psu.visibility = 'customer_visible'
      LIMIT 10
    ),
    'deliverables', (
      SELECT json_agg(row_to_json(pd.*) ORDER BY pd.due_date ASC)
      FROM project_deliverables pd
      WHERE pd.project_id = p_project_id
    )
  ) INTO v_result;
  
  RETURN v_result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

### 3.3 API Endpoints

**New API Routes:**

```
GET  /api/customer/projects                    - List all sub-account projects
GET  /api/customer/projects/[id]               - Get project dashboard details
GET  /api/customer/projects/[id]/milestones    - Get project milestones
GET  /api/customer/projects/[id]/roadblocks    - Get project roadblocks
GET  /api/customer/projects/[id]/risks         - Get customer-visible risks
GET  /api/customer/projects/[id]/updates       - Get recent activity updates
GET  /api/customer/projects/[id]/deliverables  - Get project deliverables
GET  /api/customer/notifications               - Get user notifications
PATCH /api/customer/notifications/[id]/read    - Mark notification as read

-- Platform Host endpoints (admin)
POST  /api/admin/projects/[id]/roadblocks      - Create roadblock
PATCH /api/admin/projects/[id]/roadblocks/[id] - Update roadblock
POST  /api/admin/projects/[id]/updates         - Create status update
PATCH /api/admin/projects/[id]/health          - Update project health status
POST  /api/admin/projects/[id]/deliverables    - Create deliverable
PATCH /api/admin/projects/[id]/deliverables/[id] - Update deliverable
```

### 3.4 Component Architecture

**New Components:**

```
/components/customer/
├── ProjectDashboard/
│   ├── ProjectDashboard.tsx              - Main dashboard container
│   ├── ProjectHealthCard.tsx             - Health status indicator
│   ├── ProjectProgressCard.tsx           - Progress tracker with percentage
│   ├── NextMilestoneCard.tsx             - Upcoming milestone highlight
│   ├── BudgetSnapshotCard.tsx            - Budget status with variance
│   ├── RecentActivityFeed.tsx            - Activity timeline
│   └── ProjectMetricsGrid.tsx            - KPI summary cards
│
├── ProjectBoard/
│   ├── ProjectBoardList.tsx              - List of all sub-account projects
│   ├── ProjectCard.tsx                   - Compact project card
│   ├── ProjectFilters.tsx                - Filter by status, sub-account
│   └── ProjectSearch.tsx                 - Search functionality
│
├── Milestones/
│   ├── MilestoneTimeline.tsx             - Visual timeline view
│   ├── MilestoneCard.tsx                 - Individual milestone card
│   ├── MilestonePhaseGate.tsx            - Phase gate visualization
│   └── MilestoneProgress.tsx             - Progress indicator
│
├── Roadblocks/
│   ├── RoadblockList.tsx                 - List of active roadblocks
│   ├── RoadblockCard.tsx                 - Roadblock detail card
│   ├── RoadblockImpactBadge.tsx          - Impact severity indicator
│   └── RoadblockTimeline.tsx             - Resolution timeline
│
├── Risks/
│   ├── RiskMatrix.tsx                    - Probability vs Impact grid
│   ├── RiskCard.tsx                      - Risk detail card
│   └── RiskList.tsx                      - Simplified risk list
│
└── Notifications/
    ├── NotificationBell.tsx              - Header notification icon
    ├── NotificationDropdown.tsx          - Dropdown panel
    ├── NotificationList.tsx              - Full notification list page
    └── NotificationCard.tsx              - Individual notification
```

**Enhanced Admin Components:**

```
/components/admin/
├── ProjectManagement/
│   ├── RoadblockManager.tsx              - Create/edit roadblocks
│   ├── StatusUpdateForm.tsx              - Create status updates
│   ├── ProjectHealthEditor.tsx           - Update health status
│   └── DeliverableManager.tsx            - Manage deliverables
```

---

## 4. User Interface Design

### 4.1 Customer Project Board (List View)

**Layout:**
```
┌─────────────────────────────────────────────────────────────┐
│ Customer Project Board                    [Filter] [Search]  │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│ ┌─────────────────────────────────────────────────────────┐ │
│ │ [🟢] Project Alpha - Alphies Marketing                  │ │
│ │ 68% Complete • Design Phase • Next: Concept Review      │ │
│ │ Budget: $45K / $50K • Due: Dec 15, 2025                 │ │
│ │ [View Dashboard →]                                       │ │
│ └─────────────────────────────────────────────────────────┘ │
│                                                               │
│ ┌─────────────────────────────────────────────────────────┐ │
│ │ [🟡] Project Beta - Alphies Operations                  │ │
│ │ 42% Complete • Build Phase • Next: UAT Prep             │ │
│ │ Budget: $28K / $30K • Due: Jan 10, 2026                 │ │
│ │ ⚠️ 1 Roadblock • 2 Risks                                │ │
│ │ [View Dashboard →]                                       │ │
│ └─────────────────────────────────────────────────────────┘ │
│                                                               │
│ ┌─────────────────────────────────────────────────────────┐ │
│ │ [🟢] Project Gamma - Alphies Finance                    │ │
│ │ 85% Complete • Validate Phase • Next: Final Approval    │ │
│ │ Budget: $19K / $20K • Due: Nov 30, 2025                 │ │
│ │ [View Dashboard →]                                       │ │
│ └─────────────────────────────────────────────────────────┘ │
│                                                               │
└─────────────────────────────────────────────────────────────┘
```

**Key Features:**
- Color-coded health indicators (🟢 green, 🟡 yellow, 🔴 red)
- Compact card design showing essential information
- Sub-account name clearly displayed
- Quick status summary (completion %, phase, next milestone)
- Budget snapshot with variance
- Warning indicators for roadblocks and risks
- Direct link to detailed dashboard

### 4.2 Project Dashboard (Detail View)

**Layout:**
```
┌─────────────────────────────────────────────────────────────┐
│ ← Back to Projects    Project Alpha - Alphies Marketing     │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│ ┌──────────────┐ ┌──────────────┐ ┌──────────────┐         │
│ │ 🟢 On Track  │ │ 68% Complete │ │ Next Action  │         │
│ │ Design phase │ │ Design Phase │ │ Concept      │         │
│ │ progressing  │ │              │ │ Review       │         │
│ │ well         │ │   [=====>  ] │ │ Due: Dec 5   │         │
│ └──────────────┘ └──────────────┘ └──────────────┘         │
│                                                               │
│ ┌──────────────┐ ┌──────────────┐ ┌──────────────┐         │
│ │ Budget       │ │ Timeline     │ │ Last Update  │         │
│ │ $45K / $50K  │ │ On schedule  │ │ Wireframes   │         │
│ │ 90% spent    │ │ 0 days delay │ │ approved     │         │
│ │ 🟢 Under     │ │ 🟢 On time   │ │ 2 hours ago  │         │
│ └──────────────┘ └──────────────┘ └──────────────┘         │
│                                                               │
├─────────────────────────────────────────────────────────────┤
│ Milestones                                      [Timeline ▼] │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│ ✅ Discovery Complete        Nov 1  [Completed]             │
│ ✅ Wireframes Approved       Nov 15 [Completed]             │
│ 🔵 Concept Review            Dec 5  [In Progress]           │
│    → Review design concepts and provide feedback            │
│ ⚪ Design Finalization       Dec 15 [Upcoming]              │
│ ⚪ Development Kickoff        Jan 5  [Upcoming]              │
│                                                               │
├─────────────────────────────────────────────────────────────┤
│ Active Roadblocks (1)                                        │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│ 🔴 Critical: Design Resource Unavailable                    │
│    Lead designer on medical leave. Backup designer assigned.│
│    Impact: +3 days to Concept Review milestone              │
│    Resolution: Backup designer onboarded, target Dec 8      │
│                                                               │
├─────────────────────────────────────────────────────────────┤
│ High-Priority Risks (2)                                      │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│ ⚠️ High: Third-party API integration delay risk             │
│    Mitigation: Parallel development of fallback solution    │
│                                                               │
│ ⚠️ Medium: Scope creep in requirements phase                │
│    Mitigation: Weekly scope review meetings scheduled       │
│                                                               │
├─────────────────────────────────────────────────────────────┤
│ Recent Activity                                              │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│ 🎉 Wireframes approved by stakeholders    2 hours ago       │
│ 📝 Design concepts uploaded for review    1 day ago         │
│ ✅ Discovery phase completed              5 days ago        │
│ 🚀 Project kickoff meeting held           12 days ago       │
│                                                               │
└─────────────────────────────────────────────────────────────┘
```

**Key Features:**
- **Top Summary Cards**: Health status, progress, next action, budget, timeline, recent activity
- **Milestone Timeline**: Visual representation with status indicators, clear "what's needed from customer"
- **Roadblock Section**: Only active roadblocks, with severity, impact, and resolution plan
- **Risk Section**: Only high-priority, customer-visible risks with mitigation plans
- **Activity Feed**: Customer-visible updates only, timestamped, with clear action verbs
- **Responsive Design**: Stacks vertically on mobile, grid layout on desktop

### 4.3 Milestone Timeline View

**Visual Design:**
```
Discovery → Design → Build → Validate → Launch
   ✅        🔵      ⚪       ⚪        ⚪
 Nov 1     Dec 5   Jan 5   Feb 1    Mar 1

Current: Design Phase (68% complete)
Next Milestone: Concept Review (Due Dec 5)
Your Action: Review design concepts and provide feedback by Dec 3
```

**Features:**
- Horizontal timeline with phase gates
- Color-coded status (✅ complete, 🔵 in progress, ⚪ upcoming, 🔴 overdue)
- Progress bar for current phase
- Clear customer action items
- Expandable cards for milestone details

### 4.4 Notification System

**Notification Bell (Header):**
```
🔔 (3)  ← Badge showing unread count
```

**Notification Dropdown:**
```
┌─────────────────────────────────────────┐
│ Notifications                    Mark all read │
├─────────────────────────────────────────┤
│ 🔔 Concept Review due in 2 days         │
│    Project Alpha - Alphies Marketing    │
│    2 hours ago                          │
├─────────────────────────────────────────┤
│ ⚠️ Roadblock added to Project Beta      │
│    Vendor response delayed              │
│    1 day ago                            │
├─────────────────────────────────────────┤
│ 🎉 Milestone completed: Wireframes      │
│    Project Alpha - Alphies Marketing    │
│    2 days ago                           │
├─────────────────────────────────────────┤
│ View All Notifications →                │
└─────────────────────────────────────────┘
```

### 4.5 Color Scheme (Following Research)

**Status Colors:**
- **Green (#10B981)**: On track, healthy, complete
- **Yellow (#F59E0B)**: At risk, needs attention
- **Red (#EF4444)**: Blocked, overdue, critical
- **Blue (#3B82F6)**: In progress, active
- **Gray (#6B7280)**: Not started, inactive
- **Purple (#8B5CF6)**: Review, validation

**Severity Colors (Roadblocks/Risks):**
- **Critical**: Red (#EF4444)
- **High**: Orange (#F97316)
- **Medium**: Yellow (#F59E0B)
- **Low**: Gray (#6B7280)

---

## 5. Implementation Phases

### Phase 3.1: Work Request Styling & Permissions (Week 1)

**Tasks:**
1. Apply compact design styling to Work Request view and modals
2. Match Work Request modal styling with colored status cards
3. Implement role-based permissions for work request approval
   - Primary Customers: Can submit/view, CANNOT approve
   - Platform Host: Can approve/reject
4. Add approval workflow UI indicators
5. Test permission enforcement

**Deliverables:**
- Styled Work Request page matching design system
- Permission-based UI (approval buttons hidden for Primary Customers)
- Updated RBAC middleware

### Phase 3.2: Database Schema & API (Week 2)

**Tasks:**
1. Create new database tables (roadblocks, status_updates, deliverables, notifications)
2. Modify existing tables (add customer_visible flags, health_status)
3. Create database functions (get_customer_subaccount_projects, get_project_dashboard_details)
4. Implement API endpoints for customer project access
5. Add RLS policies for tenant-based access control

**Deliverables:**
- Migration scripts
- Database functions
- API route handlers
- RLS policies

### Phase 3.3: Customer Project Board (Week 3)

**Tasks:**
1. Create ProjectBoardList component (list of sub-account projects)
2. Create ProjectCard component (compact project summary)
3. Implement filtering and search
4. Add navigation to project dashboard
5. Integrate with API endpoints

**Deliverables:**
- Customer project board page (`/app/customer/projects/page.tsx`)
- Project list components
- Filter and search functionality

### Phase 3.4: Project Dashboard (Week 4)

**Tasks:**
1. Create ProjectDashboard main container
2. Implement summary cards (health, progress, budget, timeline)
3. Create MilestoneTimeline component
4. Create RoadblockList component
5. Create RiskList component (customer-visible only)
6. Create RecentActivityFeed component
7. Integrate all components with API

**Deliverables:**
- Project dashboard page (`/app/customer/projects/[id]/page.tsx`)
- All dashboard components
- Real-time data integration

### Phase 3.5: Notification System (Week 5)

**Tasks:**
1. Create notification bell component (header)
2. Create notification dropdown
3. Create full notification list page
4. Implement notification generation logic
   - Before-due alerts (48-72 hours)
   - At-risk alerts (when status changes to yellow)
   - Breached alerts (when deadlines missed)
   - Milestone completion celebrations
5. Add email notification integration (optional)

**Deliverables:**
- Notification UI components
- Notification generation system
- Email templates (if applicable)

### Phase 3.6: Admin Tools (Week 6)

**Tasks:**
1. Create RoadblockManager component (Platform Host)
2. Create StatusUpdateForm component
3. Create ProjectHealthEditor component
4. Create DeliverableManager component
5. Add admin controls to project management page
6. Implement bulk operations

**Deliverables:**
- Admin components for project management
- Enhanced project management page
- Bulk operation tools

### Phase 3.7: Testing & Refinement (Week 7)

**Tasks:**
1. Test Primary Customer permissions (cannot approve work requests)
2. Test project visibility (only sub-account projects visible)
3. Test notification system
4. Test responsive design on mobile/tablet
5. Performance testing with large datasets
6. User acceptance testing
7. Bug fixes and refinements

**Deliverables:**
- Test reports
- Bug fixes
- Performance optimizations
- Documentation

---

## 6. Key Performance Indicators (KPIs)

### 6.1 Customer-Facing KPIs

**Displayed on Dashboard:**
- **On-time Milestone Rate**: Percentage of milestones completed on time
- **Timeline Adherence**: Forecasted completion vs. baseline (days variance)
- **Budget Utilization**: Spent vs. authorized with variance percentage
- **Approval Cycle Time**: Average time for customer approvals
- **Issue Turnaround**: Average time to resolve customer-visible blockers

### 6.2 Operational KPIs (Available on Demand)

**For Platform Host:**
- **Risk Exposure**: Count of yellow/red items and days aging
- **Response Time**: Median reply speed to customer messages
- **Scope Change Impact**: Added days and cost from changes
- **Quality Indicators**: Revisions per deliverable

---

## 7. Technical Specifications

### 7.1 Technology Stack

- **Frontend**: Next.js 14 (App Router), TypeScript, React 18
- **Styling**: Tailwind CSS, Compact Design System (14px base font)
- **Database**: Supabase (PostgreSQL)
- **Authentication**: Supabase Auth with RLS
- **Deployment**: Vercel
- **Version Control**: GitHub

### 7.2 Performance Requirements

- **Page Load Time**: < 2 seconds for project board
- **Dashboard Load Time**: < 3 seconds for project dashboard
- **API Response Time**: < 500ms for project list, < 1s for dashboard details
- **Real-time Updates**: WebSocket for notifications (optional Phase 4)
- **Mobile Performance**: Fully responsive, touch-optimized

### 7.3 Security Requirements

- **Row-Level Security (RLS)**: Enforce tenant isolation at database level
- **API Authentication**: JWT-based auth for all API calls
- **Role-Based Access Control (RBAC)**: Enforce permissions at API and UI levels
- **Data Visibility**: Customer-visible flags strictly enforced
- **Audit Trail**: Log all data access and modifications

### 7.4 Accessibility Requirements

- **WCAG 2.1 Level AA Compliance**
- **Keyboard Navigation**: Full keyboard support for all interactions
- **Screen Reader Support**: Proper ARIA labels and semantic HTML
- **Color Contrast**: Minimum 4.5:1 ratio for text
- **Focus Indicators**: Clear focus states for all interactive elements

---

## 8. Risk Assessment

### 8.1 Technical Risks

| Risk | Probability | Impact | Mitigation |
|------|-------------|--------|------------|
| Database performance with complex queries | Medium | High | Implement proper indexing, use database functions, add caching |
| RLS policy complexity causing access issues | Medium | High | Thorough testing, clear documentation, fallback queries |
| Real-time notification delivery delays | Low | Medium | Use reliable email service, implement retry logic |
| Mobile responsiveness challenges | Low | Medium | Mobile-first design, extensive device testing |

### 8.2 Business Risks

| Risk | Probability | Impact | Mitigation |
|------|-------------|--------|------------|
| Customer confusion with new interface | Medium | Medium | User training, tooltips, help documentation |
| Scope creep during development | Medium | High | Strict phase boundaries, change request process |
| Delayed user acceptance testing | Low | High | Schedule UAT early, involve stakeholders throughout |

---

## 9. Success Criteria

### 9.1 Functional Requirements

- ✅ Primary Customers can view all sub-account projects
- ✅ Primary Customers CANNOT see their own projects directly
- ✅ Primary Customers can submit work requests but CANNOT approve them
- ✅ Project dashboard displays health, progress, milestones, roadblocks, risks
- ✅ Milestone timeline shows clear customer actions
- ✅ Notification system sends before-due, at-risk, and breached alerts
- ✅ All data driven by Platform Host administrative settings
- ✅ Compact design system applied consistently

### 9.2 Non-Functional Requirements

- ✅ Page load times meet performance targets
- ✅ Mobile responsive design works on all screen sizes
- ✅ WCAG 2.1 Level AA accessibility compliance
- ✅ RLS policies prevent unauthorized data access
- ✅ Zero TypeScript build errors
- ✅ Comprehensive error handling and logging

### 9.3 User Acceptance Criteria

- ✅ Primary Customers can easily find and navigate to project dashboards
- ✅ Project health status is immediately clear at a glance
- ✅ Customers understand what actions are required from them
- ✅ Notifications are timely and actionable
- ✅ Platform Host can efficiently manage project updates
- ✅ Overall user satisfaction rating > 4/5

---

## 10. Next Steps

### 10.1 Immediate Actions

1. **Review and Approve Proposal**: Stakeholder review of this comprehensive proposal
2. **Finalize Design Mockups**: Create high-fidelity mockups based on wireframes
3. **Set Up Development Environment**: Ensure all tools and access are ready
4. **Create Project Board**: Set up GitHub project board for Phase 3 tracking

### 10.2 Development Kickoff

1. **Phase 3.1 Start**: Begin with Work Request styling and permissions
2. **Daily Standups**: Brief check-ins on progress and blockers
3. **Weekly Demos**: Show progress to stakeholders every Friday
4. **Continuous Testing**: Test each component as it's built

### 10.3 Documentation

1. **Technical Documentation**: API specs, database schema, component docs
2. **User Documentation**: Customer guide, admin guide, FAQs
3. **Training Materials**: Video tutorials, step-by-step guides
4. **Deployment Guide**: Production deployment checklist

---

## 11. Appendices

### Appendix A: Research Sources

1. PMI - Anatomy of an Effective Status Report (2014)
2. PMBOK 7th Edition - Measurement Performance Domain
3. Moxo - Customer-Facing Dashboard Best Practices (2025)
4. Asana, Monday.com, Jira - UI Pattern Analysis

### Appendix B: Database ERD

*(To be created during Phase 3.2)*

### Appendix C: API Documentation

*(To be created during Phase 3.2)*

### Appendix D: Component Hierarchy

*(To be created during Phase 3.3-3.4)*

---

## Conclusion

This comprehensive proposal outlines a customer-facing project dashboard that follows PMBOK 7 standards, incorporates industry best practices from leading PM tools, and maintains the platform's established compact design system. The phased implementation approach ensures manageable development cycles with clear deliverables and success criteria.

The solution provides Primary Customers with transparent, real-time visibility into their sub-accounts' projects while maintaining strict role-based access controls. The Platform Host retains full administrative control over all project data, statuses, and customer-visible information.

**Estimated Timeline**: 7 weeks
**Estimated Effort**: 280-350 hours
**Risk Level**: Medium (manageable with proper planning and testing)

**Ready to proceed with development upon approval.**
