-- ============================================================================
-- CREATE RISKS TABLE (if not exists)
-- This table is required for Phase 3 migration
-- ============================================================================

CREATE TABLE IF NOT EXISTS risks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  
  -- Risk identification
  title VARCHAR(255) NOT NULL,
  risk_title VARCHAR(255),
  risk_code VARCHAR(50),
  description TEXT NOT NULL,
  risk_description TEXT,
  category VARCHAR(100),
  risk_category VARCHAR(100),
  
  -- Risk assessment
  probability VARCHAR(20) NOT NULL CHECK (probability IN ('low', 'medium', 'high', 'very_low', 'very_high')),
  probability_rating INTEGER CHECK (probability_rating BETWEEN 1 AND 5),
  impact VARCHAR(20) NOT NULL CHECK (impact IN ('low', 'medium', 'high', 'very_low', 'very_high')),
  impact_rating INTEGER CHECK (impact_rating BETWEEN 1 AND 5),
  risk_level VARCHAR(20) CHECK (risk_level IN ('low', 'medium', 'high', 'critical')),
  risk_score INTEGER,
  
  -- Risk management
  status VARCHAR(20) NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'mitigated', 'closed')),
  owner VARCHAR(255),
  risk_owner VARCHAR(255),
  mitigation_plan TEXT,
  contingency_plan TEXT,
  
  -- Dates
  identified_date DATE,
  target_resolution_date DATE,
  
  -- Metadata
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_risks_tenant ON risks(tenant_id);
CREATE INDEX IF NOT EXISTS idx_risks_status ON risks(status);
CREATE INDEX IF NOT EXISTS idx_risks_risk_level ON risks(risk_level);
CREATE INDEX IF NOT EXISTS idx_risks_category ON risks(category);

-- RLS Policies
ALTER TABLE risks ENABLE ROW LEVEL SECURITY;

CREATE POLICY IF NOT EXISTS "risks_select_policy" ON risks
  FOR SELECT
  USING (
    -- Platform Host can see all
    auth.jwt() ->> 'role' IN ('host_admin', 'program_manager')
    OR
    -- Users can see risks for their tenant
    tenant_id = (auth.jwt() ->> 'tenant_id')::uuid
  );

CREATE POLICY IF NOT EXISTS "risks_insert_policy" ON risks
  FOR INSERT
  WITH CHECK (
    auth.jwt() ->> 'role' IN ('host_admin', 'program_manager', 'client_admin')
  );

CREATE POLICY IF NOT EXISTS "risks_update_policy" ON risks
  FOR UPDATE
  USING (
    auth.jwt() ->> 'role' IN ('host_admin', 'program_manager', 'client_admin')
  );

CREATE POLICY IF NOT EXISTS "risks_delete_policy" ON risks
  FOR DELETE
  USING (
    auth.jwt() ->> 'role' IN ('host_admin', 'program_manager')
  );
-- Phase 3.2: Customer Project Board Database Schema
-- Created: 2025-11-20
-- Description: Tables and functions for customer-facing project dashboards,
--              portfolio rollup, and Platform Host project management

-- ============================================================================
-- 1. PROJECT ROADBLOCKS TABLE
-- ============================================================================

CREATE TABLE IF NOT EXISTS project_roadblocks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES project_charters(id) ON DELETE CASCADE,
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  
  -- Roadblock details
  title VARCHAR(255) NOT NULL,
  description TEXT,
  severity VARCHAR(20) NOT NULL CHECK (severity IN ('low', 'medium', 'high', 'critical')),
  status VARCHAR(20) NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'in_progress', 'resolved', 'closed')),
  
  -- Impact tracking
  timeline_impact_days INTEGER DEFAULT 0,
  budget_impact DECIMAL(12, 2) DEFAULT 0,
  impact_description TEXT,
  
  -- Resolution
  resolution_plan TEXT,
  assigned_to UUID REFERENCES auth.users(id),
  target_resolution_date TIMESTAMP WITH TIME ZONE,
  actual_resolution_date TIMESTAMP WITH TIME ZONE,
  resolution_notes TEXT,
  
  -- Related entities
  related_milestone_id UUID,
  related_risk_id UUID,
  
  -- Customer visibility
  customer_visible BOOLEAN DEFAULT TRUE,
  notify_customer BOOLEAN DEFAULT TRUE,
  
  -- Metadata
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  resolved_at TIMESTAMP WITH TIME ZONE,
  resolved_by UUID REFERENCES auth.users(id)
);

-- Indexes
CREATE INDEX idx_roadblocks_project ON project_roadblocks(project_id);
CREATE INDEX idx_roadblocks_tenant ON project_roadblocks(tenant_id);
CREATE INDEX idx_roadblocks_status ON project_roadblocks(status);
CREATE INDEX idx_roadblocks_severity ON project_roadblocks(severity);
CREATE INDEX idx_roadblocks_customer_visible ON project_roadblocks(customer_visible);

-- RLS Policies
ALTER TABLE project_roadblocks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "roadblocks_select_policy" ON project_roadblocks
  FOR SELECT
  USING (
    -- Platform Host can see all
    auth.jwt() ->> 'role' IN ('host_admin', 'program_manager')
    OR
    -- Customers can see customer-visible roadblocks for their projects
    (
      customer_visible = TRUE
      AND project_id IN (
        SELECT id FROM project_charters
        WHERE tenant_id = (auth.jwt() ->> 'tenant_id')::uuid
        OR tenant_id IN (
          SELECT id FROM tenants
          WHERE parent_tenant_id = (auth.jwt() ->> 'tenant_id')::uuid
        )
      )
    )
  );

CREATE POLICY "roadblocks_insert_policy" ON project_roadblocks
  FOR INSERT
  WITH CHECK (
    auth.jwt() ->> 'role' IN ('host_admin', 'program_manager')
  );

CREATE POLICY "roadblocks_update_policy" ON project_roadblocks
  FOR UPDATE
  USING (
    auth.jwt() ->> 'role' IN ('host_admin', 'program_manager')
  );

-- ============================================================================
-- 2. PROJECT STATUS UPDATES TABLE
-- ============================================================================

CREATE TABLE IF NOT EXISTS project_status_updates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES project_charters(id) ON DELETE CASCADE,
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  
  -- Update details
  update_type VARCHAR(50) NOT NULL CHECK (update_type IN (
    'milestone_completed',
    'status_change',
    'risk_identified',
    'roadblock_added',
    'roadblock_resolved',
    'budget_variance',
    'timeline_change',
    'general_update'
  )),
  title VARCHAR(255) NOT NULL,
  description TEXT NOT NULL,
  
  -- Related entities
  related_milestone_id UUID,
  related_risk_id UUID,
  related_roadblock_id UUID,
  
  -- Visibility
  customer_visible BOOLEAN DEFAULT TRUE,
  
  -- Attachments
  attachments JSONB DEFAULT '[]'::jsonb,
  
  -- Metadata
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_status_updates_project ON project_status_updates(project_id);
CREATE INDEX idx_status_updates_tenant ON project_status_updates(tenant_id);
CREATE INDEX idx_status_updates_type ON project_status_updates(update_type);
CREATE INDEX idx_status_updates_customer_visible ON project_status_updates(customer_visible);
CREATE INDEX idx_status_updates_created_at ON project_status_updates(created_at DESC);

-- RLS Policies
ALTER TABLE project_status_updates ENABLE ROW LEVEL SECURITY;

CREATE POLICY "status_updates_select_policy" ON project_status_updates
  FOR SELECT
  USING (
    -- Platform Host can see all
    auth.jwt() ->> 'role' IN ('host_admin', 'program_manager')
    OR
    -- Customers can see customer-visible updates for their projects
    (
      customer_visible = TRUE
      AND project_id IN (
        SELECT id FROM project_charters
        WHERE tenant_id = (auth.jwt() ->> 'tenant_id')::uuid
        OR tenant_id IN (
          SELECT id FROM tenants
          WHERE parent_tenant_id = (auth.jwt() ->> 'tenant_id')::uuid
        )
      )
    )
  );

CREATE POLICY "status_updates_insert_policy" ON project_status_updates
  FOR INSERT
  WITH CHECK (
    auth.jwt() ->> 'role' IN ('host_admin', 'program_manager')
  );

-- ============================================================================
-- 3. PROJECT DELIVERABLES TABLE
-- ============================================================================

CREATE TABLE IF NOT EXISTS project_deliverables (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES project_charters(id) ON DELETE CASCADE,
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  milestone_id UUID,
  
  -- Deliverable details
  title VARCHAR(255) NOT NULL,
  description TEXT,
  deliverable_type VARCHAR(50) CHECK (deliverable_type IN (
    'document',
    'design',
    'code',
    'report',
    'presentation',
    'other'
  )),
  
  -- Status and dates
  status VARCHAR(20) NOT NULL DEFAULT 'pending' CHECK (status IN (
    'pending',
    'in_progress',
    'in_review',
    'completed',
    'blocked'
  )),
  due_date TIMESTAMP WITH TIME ZONE,
  completion_date TIMESTAMP WITH TIME ZONE,
  
  -- File information
  file_url TEXT,
  file_name VARCHAR(255),
  file_size INTEGER,
  file_type VARCHAR(100),
  
  -- Customer visibility
  customer_visible BOOLEAN DEFAULT TRUE,
  
  -- Metadata
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_deliverables_project ON project_deliverables(project_id);
CREATE INDEX idx_deliverables_tenant ON project_deliverables(tenant_id);
CREATE INDEX idx_deliverables_milestone ON project_deliverables(milestone_id);
CREATE INDEX idx_deliverables_status ON project_deliverables(status);
CREATE INDEX idx_deliverables_customer_visible ON project_deliverables(customer_visible);

-- RLS Policies
ALTER TABLE project_deliverables ENABLE ROW LEVEL SECURITY;

CREATE POLICY "deliverables_select_policy" ON project_deliverables
  FOR SELECT
  USING (
    -- Platform Host can see all
    auth.jwt() ->> 'role' IN ('host_admin', 'program_manager')
    OR
    -- Customers can see customer-visible deliverables for their projects
    (
      customer_visible = TRUE
      AND project_id IN (
        SELECT id FROM project_charters
        WHERE tenant_id = (auth.jwt() ->> 'tenant_id')::uuid
        OR tenant_id IN (
          SELECT id FROM tenants
          WHERE parent_tenant_id = (auth.jwt() ->> 'tenant_id')::uuid
        )
      )
    )
  );

CREATE POLICY "deliverables_insert_policy" ON project_deliverables
  FOR INSERT
  WITH CHECK (
    auth.jwt() ->> 'role' IN ('host_admin', 'program_manager')
  );

CREATE POLICY "deliverables_update_policy" ON project_deliverables
  FOR UPDATE
  USING (
    auth.jwt() ->> 'role' IN ('host_admin', 'program_manager')
  );

-- ============================================================================
-- 4. CUSTOMER PROJECT NOTIFICATIONS TABLE
-- ============================================================================

CREATE TABLE IF NOT EXISTS customer_project_notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  project_id UUID REFERENCES project_charters(id) ON DELETE CASCADE,
  
  -- Notification details
  notification_type VARCHAR(50) NOT NULL CHECK (notification_type IN (
    'milestone_completed',
    'milestone_due_soon',
    'status_update',
    'roadblock_added',
    'roadblock_resolved',
    'action_required',
    'project_health_change',
    'deliverable_ready',
    'budget_alert',
    'timeline_alert'
  )),
  title VARCHAR(255) NOT NULL,
  message TEXT NOT NULL,
  
  -- Related entities
  related_entity_type VARCHAR(50),
  related_entity_id UUID,
  
  -- Action URL
  action_url TEXT,
  
  -- Status
  is_read BOOLEAN DEFAULT FALSE,
  read_at TIMESTAMP WITH TIME ZONE,
  
  -- Priority
  priority VARCHAR(20) DEFAULT 'normal' CHECK (priority IN ('low', 'normal', 'high', 'urgent')),
  
  -- Metadata
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_notifications_tenant ON customer_project_notifications(tenant_id);
CREATE INDEX idx_notifications_user ON customer_project_notifications(user_id);
CREATE INDEX idx_notifications_project ON customer_project_notifications(project_id);
CREATE INDEX idx_notifications_is_read ON customer_project_notifications(is_read);
CREATE INDEX idx_notifications_created_at ON customer_project_notifications(created_at DESC);

-- RLS Policies
ALTER TABLE customer_project_notifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "notifications_select_policy" ON customer_project_notifications
  FOR SELECT
  USING (
    user_id = (auth.jwt() ->> 'user_id')::uuid
    OR tenant_id = (auth.jwt() ->> 'tenant_id')::uuid
  );

CREATE POLICY "notifications_update_policy" ON customer_project_notifications
  FOR UPDATE
  USING (
    user_id = (auth.jwt() ->> 'user_id')::uuid
  );

-- ============================================================================
-- 5. TOUR PROGRESS TABLE
-- ============================================================================

CREATE TABLE IF NOT EXISTS tour_progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  tour_id VARCHAR(100) NOT NULL,
  
  -- Progress tracking
  completed BOOLEAN DEFAULT FALSE,
  skipped BOOLEAN DEFAULT FALSE,
  last_step INTEGER DEFAULT 0,
  
  -- Timestamps
  started_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  completed_at TIMESTAMP WITH TIME ZONE,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Unique constraint
  UNIQUE(user_id, tour_id)
);

-- Indexes
CREATE INDEX idx_tour_progress_user ON tour_progress(user_id);
CREATE INDEX idx_tour_progress_tour ON tour_progress(tour_id);

-- RLS Policies
ALTER TABLE tour_progress ENABLE ROW LEVEL SECURITY;

CREATE POLICY "tour_progress_all_policy" ON tour_progress
  FOR ALL
  USING (user_id = (auth.jwt() ->> 'user_id')::uuid);

-- ============================================================================
-- 6. SCHEMA MODIFICATIONS TO EXISTING TABLES
-- ============================================================================

-- Add customer-visible flags and health status to project_charters
ALTER TABLE project_charters
  ADD COLUMN IF NOT EXISTS customer_visible BOOLEAN DEFAULT TRUE,
  ADD COLUMN IF NOT EXISTS health_status VARCHAR(20) DEFAULT 'green' CHECK (health_status IN ('green', 'yellow', 'red')),
  ADD COLUMN IF NOT EXISTS health_status_explanation TEXT,
  ADD COLUMN IF NOT EXISTS current_phase VARCHAR(50),
  ADD COLUMN IF NOT EXISTS next_customer_action TEXT,
  ADD COLUMN IF NOT EXISTS budget_variance_percentage DECIMAL(5, 2) DEFAULT 0,
  ADD COLUMN IF NOT EXISTS timeline_variance_days INTEGER DEFAULT 0;

-- Add customer-visible flag to project_milestones
ALTER TABLE project_milestones
  ADD COLUMN IF NOT EXISTS customer_visible BOOLEAN DEFAULT TRUE,
  ADD COLUMN IF NOT EXISTS customer_action_required TEXT,
  ADD COLUMN IF NOT EXISTS definition_of_done TEXT;

-- Add customer-visible flag to risks
ALTER TABLE risks
  ADD COLUMN IF NOT EXISTS customer_visible BOOLEAN DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS mitigation_strategy TEXT;

-- ============================================================================
-- 7. DATABASE FUNCTIONS
-- ============================================================================

-- Function: Get Portfolio Summary for Primary Customer
CREATE OR REPLACE FUNCTION get_customer_portfolio_summary(p_customer_tenant_id UUID)
RETURNS JSON AS $$
DECLARE
  v_result JSON;
BEGIN
  SELECT json_build_object(
    'summary', json_build_object(
      'total_projects', (
        SELECT COUNT(*) FROM project_charters pc
        INNER JOIN tenants t ON pc.tenant_id = t.id
        WHERE t.parent_tenant_id = p_customer_tenant_id
      ),
      'active_projects', (
        SELECT COUNT(*) FROM project_charters pc
        INNER JOIN tenants t ON pc.tenant_id = t.id
        WHERE t.parent_tenant_id = p_customer_tenant_id
          AND pc.status IN ('in_progress', 'scheduled')
      ),
      'at_risk_projects', (
        SELECT COUNT(*) FROM project_charters pc
        INNER JOIN tenants t ON pc.tenant_id = t.id
        WHERE t.parent_tenant_id = p_customer_tenant_id
          AND pc.health_status = 'yellow'
      ),
      'blocked_projects', (
        SELECT COUNT(*) FROM project_charters pc
        INNER JOIN tenants t ON pc.tenant_id = t.id
        WHERE t.parent_tenant_id = p_customer_tenant_id
          AND pc.health_status = 'red'
      ),
      'total_budget', (
        SELECT COALESCE(SUM(
          CASE 
            WHEN jsonb_typeof(pc.budget) = 'object' 
            THEN (pc.budget->>'total_budget')::DECIMAL
            ELSE COALESCE(pc.budget::TEXT::DECIMAL, 0)
          END
        ), 0)
        FROM project_charters pc
        INNER JOIN tenants t ON pc.tenant_id = t.id
        WHERE t.parent_tenant_id = p_customer_tenant_id
      ),
      'budget_spent', (
        SELECT COALESCE(SUM(COALESCE(pc.actualCost, 0)), 0)
        FROM project_charters pc
        INNER JOIN tenants t ON pc.tenant_id = t.id
        WHERE t.parent_tenant_id = p_customer_tenant_id
      ),
      'avg_progress', (
        SELECT COALESCE(AVG(COALESCE(pc.completionPercentage, 0)), 0)::INTEGER
        FROM project_charters pc
        INNER JOIN tenants t ON pc.tenant_id = t.id
        WHERE t.parent_tenant_id = p_customer_tenant_id
      )
    ),
    'sub_clients', (
      SELECT COALESCE(json_agg(sub_client_data), '[]'::json)
      FROM (
        SELECT json_build_object(
          'tenant_id', t.id,
          'tenant_name', t.name,
          'project_count', (
            SELECT COUNT(*) FROM project_charters pc2
            WHERE pc2.tenant_id = t.id
          ),
          'on_track_count', (
            SELECT COUNT(*) FROM project_charters pc2
            WHERE pc2.tenant_id = t.id
              AND pc2.health_status = 'green'
          ),
          'at_risk_count', (
            SELECT COUNT(*) FROM project_charters pc2
            WHERE pc2.tenant_id = t.id
              AND pc2.health_status = 'yellow'
          ),
          'blocked_count', (
            SELECT COUNT(*) FROM project_charters pc2
            WHERE pc2.tenant_id = t.id
              AND pc2.health_status = 'red'
          ),
          'projects', (
            SELECT COALESCE(json_agg(project_data), '[]'::json)
            FROM (
              SELECT json_build_object(
                'id', pc3.id,
                'title', pc3.title,
                'health_status', pc3.health_status,
                'completion_percentage', COALESCE(pc3.completionPercentage, 0),
                'current_phase', pc3.current_phase,
                'next_milestone', (
                  SELECT json_build_object(
                    'title', pm.title,
                    'due_date', pm.due_date
                  )
                  FROM project_milestones pm
                  WHERE pm.project_id = pc3.id
                    AND pm.status IN ('pending', 'in_progress')
                    AND pm.due_date >= CURRENT_DATE
                  ORDER BY pm.due_date ASC
                  LIMIT 1
                ),
                'budget_total', CASE 
                  WHEN jsonb_typeof(pc3.budget) = 'object' 
                  THEN (pc3.budget->>'total_budget')::DECIMAL
                  ELSE COALESCE(pc3.budget::TEXT::DECIMAL, 0)
                END,
                'budget_spent', COALESCE(pc3.actualCost, 0),
                'roadblock_count', (
                  SELECT COUNT(*) FROM project_roadblocks pr
                  WHERE pr.project_id = pc3.id
                    AND pr.status IN ('open', 'in_progress')
                ),
                'risk_count', (
                  SELECT COUNT(*) FROM risks r
                  WHERE r.project_id = pc3.id
                    AND r.status = 'open'
                    AND r.customer_visible = TRUE
                )
              )
              FROM project_charters pc3
              WHERE pc3.tenant_id = t.id
              ORDER BY pc3.updated_at DESC
            ) AS project_data
          )
        ) AS sub_client_data
        FROM tenants t
        WHERE t.parent_tenant_id = p_customer_tenant_id
          AND t.tenant_tier = 3
        ORDER BY t.name
      ) AS sub_client_data
    )
  ) INTO v_result;
  
  RETURN v_result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function: Get Demand Analysis for Primary Customer
CREATE OR REPLACE FUNCTION get_customer_demand_analysis(p_customer_tenant_id UUID)
RETURNS JSON AS $$
DECLARE
  v_result JSON;
BEGIN
  SELECT json_build_object(
    'current_demand', (
      SELECT COALESCE(json_agg(demand_data), '[]'::json)
      FROM (
        SELECT json_build_object(
          'sub_client_name', t.name,
          'project_count', (
            SELECT COUNT(*) FROM project_charters pc
            WHERE pc.tenant_id = t.id
              AND pc.status IN ('in_progress', 'scheduled')
          ),
          'total_budget', (
            SELECT COALESCE(SUM(
              CASE 
                WHEN jsonb_typeof(pc.budget) = 'object' 
                THEN (pc.budget->>'total_budget')::DECIMAL
                ELSE COALESCE(pc.budget::TEXT::DECIMAL, 0)
              END
            ), 0)
            FROM project_charters pc
            WHERE pc.tenant_id = t.id
              AND pc.status IN ('in_progress', 'scheduled')
          ),
          'estimated_hours_per_month', (
            SELECT COALESCE(SUM(COALESCE(pc.estimatedHours, 0)), 0) / 3
            FROM project_charters pc
            WHERE pc.tenant_id = t.id
              AND pc.status IN ('in_progress', 'scheduled')
          )
        )
        FROM tenants t
        WHERE t.parent_tenant_id = p_customer_tenant_id
          AND t.tenant_tier = 3
      ) AS demand_data
    ),
    'work_request_pipeline', json_build_object(
      'submitted_count', (
        SELECT COUNT(*) FROM work_requests wr
        INNER JOIN tenants t ON wr.tenant_id = t.id
        WHERE t.parent_tenant_id = p_customer_tenant_id
          AND wr.status = 'submitted'
      ),
      'submitted_hours', (
        SELECT COALESCE(SUM(COALESCE(wr.estimated_hours, 0)), 0)
        FROM work_requests wr
        INNER JOIN tenants t ON wr.tenant_id = t.id
        WHERE t.parent_tenant_id = p_customer_tenant_id
          AND wr.status = 'submitted'
      ),
      'under_review_count', (
        SELECT COUNT(*) FROM work_requests wr
        INNER JOIN tenants t ON wr.tenant_id = t.id
        WHERE t.parent_tenant_id = p_customer_tenant_id
          AND wr.status = 'under_review'
      ),
      'under_review_hours', (
        SELECT COALESCE(SUM(COALESCE(wr.estimated_hours, 0)), 0)
        FROM work_requests wr
        INNER JOIN tenants t ON wr.tenant_id = t.id
        WHERE t.parent_tenant_id = p_customer_tenant_id
          AND wr.status = 'under_review'
      ),
      'approved_count', (
        SELECT COUNT(*) FROM work_requests wr
        INNER JOIN tenants t ON wr.tenant_id = t.id
        WHERE t.parent_tenant_id = p_customer_tenant_id
          AND wr.status = 'approved'
      ),
      'approved_hours', (
        SELECT COALESCE(SUM(COALESCE(wr.estimated_hours, 0)), 0)
        FROM work_requests wr
        INNER JOIN tenants t ON wr.tenant_id = t.id
        WHERE t.parent_tenant_id = p_customer_tenant_id
          AND wr.status = 'approved'
      )
    ),
    'budget_tracking', json_build_object(
      'total_budget', (
        SELECT COALESCE(SUM(
          CASE 
            WHEN jsonb_typeof(pc.budget) = 'object' 
            THEN (pc.budget->>'total_budget')::DECIMAL
            ELSE COALESCE(pc.budget::TEXT::DECIMAL, 0)
          END
        ), 0)
        FROM project_charters pc
        INNER JOIN tenants t ON pc.tenant_id = t.id
        WHERE t.parent_tenant_id = p_customer_tenant_id
      ),
      'spent_to_date', (
        SELECT COALESCE(SUM(COALESCE(pc.actualCost, 0)), 0)
        FROM project_charters pc
        INNER JOIN tenants t ON pc.tenant_id = t.id
        WHERE t.parent_tenant_id = p_customer_tenant_id
      ),
      'remaining', (
        SELECT COALESCE(SUM(
          CASE 
            WHEN jsonb_typeof(pc.budget) = 'object' 
            THEN (pc.budget->>'total_budget')::DECIMAL
            ELSE COALESCE(pc.budget::TEXT::DECIMAL, 0)
          END
        ), 0) - COALESCE(SUM(COALESCE(pc.actualCost, 0)), 0)
        FROM project_charters pc
        INNER JOIN tenants t ON pc.tenant_id = t.id
        WHERE t.parent_tenant_id = p_customer_tenant_id
      )
    )
  ) INTO v_result;
  
  RETURN v_result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================================
-- 8. TRIGGERS
-- ============================================================================

-- Update updated_at timestamp on project_roadblocks
CREATE OR REPLACE FUNCTION update_roadblocks_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER roadblocks_updated_at
  BEFORE UPDATE ON project_roadblocks
  FOR EACH ROW
  EXECUTE FUNCTION update_roadblocks_timestamp();

-- Update updated_at timestamp on project_status_updates
CREATE OR REPLACE FUNCTION update_status_updates_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER status_updates_updated_at
  BEFORE UPDATE ON project_status_updates
  FOR EACH ROW
  EXECUTE FUNCTION update_status_updates_timestamp();

-- Update updated_at timestamp on project_deliverables
CREATE OR REPLACE FUNCTION update_deliverables_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER deliverables_updated_at
  BEFORE UPDATE ON project_deliverables
  FOR EACH ROW
  EXECUTE FUNCTION update_deliverables_timestamp();

-- ============================================================================
-- END OF MIGRATION
-- ============================================================================

-- Grant permissions
GRANT SELECT, INSERT, UPDATE ON project_roadblocks TO authenticated;
GRANT SELECT, INSERT ON project_status_updates TO authenticated;
GRANT SELECT, INSERT, UPDATE ON project_deliverables TO authenticated;
GRANT SELECT, UPDATE ON customer_project_notifications TO authenticated;
GRANT ALL ON tour_progress TO authenticated;
