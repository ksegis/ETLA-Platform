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

DROP POLICY IF EXISTS "risks_select_policy" ON risks;
CREATE POLICY "risks_select_policy" ON risks
  FOR SELECT
  USING (
    -- Platform Host can see all
    auth.jwt() ->> 'role' IN ('host_admin', 'program_manager')
    OR
    -- Users can see risks for their tenant
    tenant_id = (auth.jwt() ->> 'tenant_id')::uuid
  );

DROP POLICY IF EXISTS "risks_insert_policy" ON risks;
CREATE POLICY "risks_insert_policy" ON risks
  FOR INSERT
  WITH CHECK (
    auth.jwt() ->> 'role' IN ('host_admin', 'program_manager', 'client_admin')
  );

DROP POLICY IF EXISTS "risks_update_policy" ON risks;
CREATE POLICY "risks_update_policy" ON risks
  FOR UPDATE
  USING (
    auth.jwt() ->> 'role' IN ('host_admin', 'program_manager', 'client_admin')
  );

DROP POLICY IF EXISTS "risks_delete_policy" ON risks;
CREATE POLICY "risks_delete_policy" ON risks
  FOR DELETE
  USING (
    auth.jwt() ->> 'role' IN ('host_admin', 'program_manager')
  );
