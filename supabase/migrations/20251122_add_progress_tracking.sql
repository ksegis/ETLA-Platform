-- Migration: Add Progress Tracking and Performance Metrics
-- Description: Add fields to track job progress, performance metrics, and real-time status

-- Add progress tracking fields to integration_sync_history
ALTER TABLE integration_sync_history
ADD COLUMN IF NOT EXISTS total_records INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS processed_records INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS failed_records INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS progress_percentage DECIMAL(5,2) DEFAULT 0.00,
ADD COLUMN IF NOT EXISTS estimated_completion_at TIMESTAMP,
ADD COLUMN IF NOT EXISTS throughput_records_per_second DECIMAL(10,2),
ADD COLUMN IF NOT EXISTS average_latency_ms INTEGER,
ADD COLUMN IF NOT EXISTS last_progress_update_at TIMESTAMP;

-- Add performance metrics to integration_sync_configs
ALTER TABLE integration_sync_configs
ADD COLUMN IF NOT EXISTS average_throughput DECIMAL(10,2),
ADD COLUMN IF NOT EXISTS peak_throughput DECIMAL(10,2),
ADD COLUMN IF NOT EXISTS average_latency_ms INTEGER,
ADD COLUMN IF NOT EXISTS success_rate_percentage DECIMAL(5,2);

-- Create function to update progress
CREATE OR REPLACE FUNCTION update_sync_progress(
  p_sync_id UUID,
  p_processed_records INTEGER,
  p_total_records INTEGER DEFAULT NULL
)
RETURNS void AS $$
DECLARE
  v_total INTEGER;
  v_progress DECIMAL(5,2);
  v_start_time TIMESTAMP;
  v_elapsed_seconds INTEGER;
  v_throughput DECIMAL(10,2);
  v_estimated_completion TIMESTAMP;
BEGIN
  -- Get current total or use provided
  SELECT COALESCE(p_total_records, total_records) INTO v_total
  FROM integration_sync_history
  WHERE id = p_sync_id;

  -- Calculate progress percentage
  IF v_total > 0 THEN
    v_progress := (p_processed_records::DECIMAL / v_total::DECIMAL) * 100;
  ELSE
    v_progress := 0;
  END IF;

  -- Get start time and calculate elapsed time
  SELECT sync_started_at INTO v_start_time
  FROM integration_sync_history
  WHERE id = p_sync_id;

  v_elapsed_seconds := EXTRACT(EPOCH FROM (NOW() - v_start_time))::INTEGER;

  -- Calculate throughput (records per second)
  IF v_elapsed_seconds > 0 THEN
    v_throughput := p_processed_records::DECIMAL / v_elapsed_seconds::DECIMAL;
  ELSE
    v_throughput := 0;
  END IF;

  -- Estimate completion time
  IF v_throughput > 0 AND v_total > p_processed_records THEN
    v_estimated_completion := NOW() + ((v_total - p_processed_records) / v_throughput || ' seconds')::INTERVAL;
  ELSE
    v_estimated_completion := NULL;
  END IF;

  -- Update the sync history record
  UPDATE integration_sync_history
  SET
    processed_records = p_processed_records,
    total_records = COALESCE(p_total_records, total_records),
    progress_percentage = v_progress,
    throughput_records_per_second = v_throughput,
    estimated_completion_at = v_estimated_completion,
    last_progress_update_at = NOW()
  WHERE id = p_sync_id;
END;
$$ LANGUAGE plpgsql;

-- Create function to calculate performance metrics
CREATE OR REPLACE FUNCTION calculate_performance_metrics(
  p_sync_config_id UUID
)
RETURNS void AS $$
DECLARE
  v_avg_throughput DECIMAL(10,2);
  v_peak_throughput DECIMAL(10,2);
  v_avg_latency INTEGER;
  v_success_rate DECIMAL(5,2);
  v_total_syncs INTEGER;
  v_successful_syncs INTEGER;
BEGIN
  -- Calculate average throughput
  SELECT AVG(throughput_records_per_second)
  INTO v_avg_throughput
  FROM integration_sync_history
  WHERE integration_sync_config_id = p_sync_config_id
  AND status = 'completed'
  AND throughput_records_per_second IS NOT NULL;

  -- Calculate peak throughput
  SELECT MAX(throughput_records_per_second)
  INTO v_peak_throughput
  FROM integration_sync_history
  WHERE integration_sync_config_id = p_sync_config_id
  AND status = 'completed'
  AND throughput_records_per_second IS NOT NULL;

  -- Calculate average latency
  SELECT AVG(average_latency_ms)
  INTO v_avg_latency
  FROM integration_sync_history
  WHERE integration_sync_config_id = p_sync_config_id
  AND status = 'completed'
  AND average_latency_ms IS NOT NULL;

  -- Calculate success rate
  SELECT 
    COUNT(*),
    COUNT(*) FILTER (WHERE status = 'completed')
  INTO v_total_syncs, v_successful_syncs
  FROM integration_sync_history
  WHERE integration_sync_config_id = p_sync_config_id;

  IF v_total_syncs > 0 THEN
    v_success_rate := (v_successful_syncs::DECIMAL / v_total_syncs::DECIMAL) * 100;
  ELSE
    v_success_rate := 0;
  END IF;

  -- Update the sync config with calculated metrics
  UPDATE integration_sync_configs
  SET
    average_throughput = v_avg_throughput,
    peak_throughput = v_peak_throughput,
    average_latency_ms = v_avg_latency,
    success_rate_percentage = v_success_rate
  WHERE id = p_sync_config_id;
END;
$$ LANGUAGE plpgsql;

-- Create view for real-time progress monitoring
CREATE OR REPLACE VIEW sync_progress_monitor AS
SELECT 
  sh.id,
  sh.integration_config_id,
  sc.endpoint_display_name,
  sh.status,
  sh.total_records,
  sh.processed_records,
  sh.failed_records,
  sh.progress_percentage,
  sh.sync_started_at,
  sh.estimated_completion_at,
  sh.throughput_records_per_second,
  sh.average_latency_ms,
  sh.last_progress_update_at,
  EXTRACT(EPOCH FROM (NOW() - sh.sync_started_at))::INTEGER AS elapsed_seconds,
  CASE 
    WHEN sh.estimated_completion_at IS NOT NULL THEN
      EXTRACT(EPOCH FROM (sh.estimated_completion_at - NOW()))::INTEGER
    ELSE NULL
  END AS remaining_seconds
FROM integration_sync_history sh
JOIN integration_sync_configs sc ON sh.integration_config_id = sc.integration_config_id
WHERE sh.status = 'running'
ORDER BY sh.sync_started_at DESC;

-- Grant permissions
GRANT SELECT ON sync_progress_monitor TO authenticated;
GRANT EXECUTE ON FUNCTION update_sync_progress TO authenticated;
GRANT EXECUTE ON FUNCTION calculate_performance_metrics TO authenticated;

-- Add comments
COMMENT ON COLUMN integration_sync_history.total_records IS 'Total number of records to process in this sync';
COMMENT ON COLUMN integration_sync_history.processed_records IS 'Number of records successfully processed';
COMMENT ON COLUMN integration_sync_history.failed_records IS 'Number of records that failed processing';
COMMENT ON COLUMN integration_sync_history.progress_percentage IS 'Percentage of completion (0-100)';
COMMENT ON COLUMN integration_sync_history.throughput_records_per_second IS 'Processing speed in records per second';
COMMENT ON COLUMN integration_sync_history.average_latency_ms IS 'Average API response time in milliseconds';
COMMENT ON FUNCTION update_sync_progress IS 'Update progress tracking for a running sync job';
COMMENT ON FUNCTION calculate_performance_metrics IS 'Calculate and update performance metrics for a sync config';
COMMENT ON VIEW sync_progress_monitor IS 'Real-time view of running sync jobs with progress and performance data';
