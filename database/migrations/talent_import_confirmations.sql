-- Migration: Add tenant confirmation tracking for talent imports (v2 - Fixed)
-- Purpose: Track user acknowledgments at each stage to ensure proper tenant assignment
-- Created: 2024-11-21
-- Updated: 2024-11-21 - Fixed to match existing schema (tenant_users, role_definitions)

-- =====================================================
-- Table: talent_import_sessions
-- Tracks each import session with all confirmations
-- =====================================================
CREATE TABLE IF NOT EXISTS talent_import_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Session metadata
  session_key VARCHAR(100) UNIQUE NOT NULL, -- Browser session identifier
  import_type VARCHAR(50) NOT NULL, -- 'candidates', 'jobs', 'applications'
  
  -- User and tenant info
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  user_email VARCHAR(255) NOT NULL,
  user_role VARCHAR(50) NOT NULL,
  target_tenant_id UUID REFERENCES tenants(id) ON DELETE SET NULL,
  target_tenant_name VARCHAR(255),
  
  -- Import details
  total_records INTEGER,
  total_documents INTEGER,
  data_file_name VARCHAR(255),
  data_file_size BIGINT,
  
  -- Confirmation tracking (each stage must be acknowledged)
  confirmed_at_upload TIMESTAMPTZ, -- Stage 1: Upload page
  confirmed_at_review TIMESTAMPTZ, -- Stage 2: Review page
  confirmed_at_final TIMESTAMPTZ,  -- Stage 3: Final modal before execution
  
  -- Confirmation details (what they acknowledged)
  upload_confirmation_text TEXT,
  review_confirmation_text TEXT,
  final_confirmation_text TEXT,
  
  -- IP and browser info for audit
  ip_address INET,
  user_agent TEXT,
  
  -- Import execution
  import_started_at TIMESTAMPTZ,
  import_completed_at TIMESTAMPTZ,
  import_status VARCHAR(50), -- 'pending', 'processing', 'completed', 'failed', 'cancelled'
  
  -- Results
  successful_records INTEGER DEFAULT 0,
  failed_records INTEGER DEFAULT 0,
  error_summary JSONB,
  
  -- Audit timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for quick lookups
CREATE INDEX idx_import_sessions_user ON talent_import_sessions(user_id);
CREATE INDEX idx_import_sessions_tenant ON talent_import_sessions(target_tenant_id);
CREATE INDEX idx_import_sessions_session_key ON talent_import_sessions(session_key);
CREATE INDEX idx_import_sessions_created ON talent_import_sessions(created_at DESC);

-- =====================================================
-- Table: talent_import_confirmation_log
-- Detailed log of each confirmation action
-- =====================================================
CREATE TABLE IF NOT EXISTS talent_import_confirmation_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Link to session
  session_id UUID REFERENCES talent_import_sessions(id) ON DELETE CASCADE,
  
  -- Confirmation details
  confirmation_stage VARCHAR(50) NOT NULL, -- 'upload', 'review', 'final'
  confirmation_type VARCHAR(50) NOT NULL, -- 'tenant_selection', 'tenant_verification', 'final_approval'
  
  -- What was shown and acknowledged
  prompt_text TEXT NOT NULL, -- The exact text shown to user
  user_response VARCHAR(50) NOT NULL, -- 'acknowledged', 'confirmed', 'accepted'
  
  -- Tenant context at time of confirmation
  selected_tenant_id UUID REFERENCES tenants(id) ON DELETE SET NULL,
  selected_tenant_name VARCHAR(255),
  
  -- Additional context
  metadata JSONB, -- Any extra data (e.g., number of records, warnings shown)
  
  -- Audit
  confirmed_at TIMESTAMPTZ DEFAULT NOW(),
  ip_address INET,
  user_agent TEXT
);

-- Index for audit queries
CREATE INDEX idx_confirmation_log_session ON talent_import_confirmation_log(session_id);
CREATE INDEX idx_confirmation_log_stage ON talent_import_confirmation_log(confirmation_stage);
CREATE INDEX idx_confirmation_log_confirmed ON talent_import_confirmation_log(confirmed_at DESC);

-- =====================================================
-- Function: Update session timestamp
-- =====================================================
CREATE OR REPLACE FUNCTION update_import_session_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to auto-update updated_at
DROP TRIGGER IF EXISTS trigger_update_import_session_timestamp ON talent_import_sessions;
CREATE TRIGGER trigger_update_import_session_timestamp
  BEFORE UPDATE ON talent_import_sessions
  FOR EACH ROW
  EXECUTE FUNCTION update_import_session_timestamp();

-- =====================================================
-- Row Level Security (RLS)
-- =====================================================

-- Enable RLS
ALTER TABLE talent_import_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE talent_import_confirmation_log ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS import_sessions_user_policy ON talent_import_sessions;
DROP POLICY IF EXISTS confirmation_log_user_policy ON talent_import_confirmation_log;

-- Policy: Users can see their own sessions, host_admin can see all
CREATE POLICY import_sessions_user_policy ON talent_import_sessions
  FOR ALL
  USING (
    user_id = auth.uid() OR
    EXISTS (
      SELECT 1 FROM tenant_users
      WHERE tenant_users.user_id = auth.uid()
      AND tenant_users.role_name = 'host_admin'
    )
  );

-- Policy: Users can see their own confirmation logs, host_admin can see all
CREATE POLICY confirmation_log_user_policy ON talent_import_confirmation_log
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM talent_import_sessions
      WHERE talent_import_sessions.id = talent_import_confirmation_log.session_id
      AND (
        talent_import_sessions.user_id = auth.uid() OR
        EXISTS (
          SELECT 1 FROM tenant_users
          WHERE tenant_users.user_id = auth.uid()
          AND tenant_users.role_name = 'host_admin'
        )
      )
    )
  );

-- =====================================================
-- Helper function: Verify all confirmations completed
-- =====================================================
CREATE OR REPLACE FUNCTION verify_import_confirmations(p_session_id UUID)
RETURNS TABLE (
  all_confirmed BOOLEAN,
  missing_confirmations TEXT[]
) AS $$
DECLARE
  v_session talent_import_sessions%ROWTYPE;
  v_missing TEXT[] := ARRAY[]::TEXT[];
BEGIN
  -- Get session
  SELECT * INTO v_session FROM talent_import_sessions WHERE id = p_session_id;
  
  IF NOT FOUND THEN
    RETURN QUERY SELECT FALSE, ARRAY['Session not found']::TEXT[];
    RETURN;
  END IF;
  
  -- Check each confirmation stage
  IF v_session.confirmed_at_upload IS NULL THEN
    v_missing := array_append(v_missing, 'Upload confirmation missing');
  END IF;
  
  IF v_session.confirmed_at_review IS NULL THEN
    v_missing := array_append(v_missing, 'Review confirmation missing');
  END IF;
  
  IF v_session.confirmed_at_final IS NULL THEN
    v_missing := array_append(v_missing, 'Final confirmation missing');
  END IF;
  
  IF v_session.target_tenant_id IS NULL THEN
    v_missing := array_append(v_missing, 'Target tenant not selected');
  END IF;
  
  -- Return results
  RETURN QUERY SELECT (array_length(v_missing, 1) IS NULL), v_missing;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- Comments for documentation
-- =====================================================
COMMENT ON TABLE talent_import_sessions IS 'Tracks talent import sessions with multi-stage tenant confirmations for audit trail';
COMMENT ON TABLE talent_import_confirmation_log IS 'Detailed log of each user confirmation during import process';
COMMENT ON COLUMN talent_import_sessions.session_key IS 'Unique browser session identifier for tracking';
COMMENT ON COLUMN talent_import_sessions.confirmed_at_upload IS 'Timestamp when user confirmed tenant at upload stage';
COMMENT ON COLUMN talent_import_sessions.confirmed_at_review IS 'Timestamp when user confirmed tenant at review stage';
COMMENT ON COLUMN talent_import_sessions.confirmed_at_final IS 'Timestamp when user gave final approval before import execution';
COMMENT ON FUNCTION verify_import_confirmations IS 'Verifies all required confirmations are present before allowing import execution';

-- =====================================================
-- Grant permissions
-- =====================================================
GRANT SELECT, INSERT, UPDATE ON talent_import_sessions TO authenticated;
GRANT SELECT, INSERT ON talent_import_confirmation_log TO authenticated;
GRANT EXECUTE ON FUNCTION verify_import_confirmations TO authenticated;

-- =====================================================
-- Verification queries (run these to test)
-- =====================================================

-- Verify tables created
-- SELECT table_name FROM information_schema.tables WHERE table_name LIKE 'talent_import%';

-- Verify RLS enabled
-- SELECT tablename, rowsecurity FROM pg_tables WHERE tablename LIKE 'talent_import%';

-- Verify policies created
-- SELECT tablename, policyname FROM pg_policies WHERE tablename LIKE 'talent_import%';

-- Test verification function
-- SELECT * FROM verify_import_confirmations('00000000-0000-0000-0000-000000000000');
