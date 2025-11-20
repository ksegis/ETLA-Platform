# Phase 3.2 Database Migration Instructions

## Overview
This migration adds 5 new tables and 2 database functions to support the Customer Project Board feature.

## Prerequisites
- Access to Supabase SQL Editor
- Database backup recommended before running migration

## Migration Steps

### Option 1: Run Complete Migration (Recommended)
1. Open Supabase Dashboard → SQL Editor
2. Copy the entire contents of `phase3_customer_project_board.sql`
3. Paste into SQL Editor
4. Click "Run" to execute

### Option 2: Run Step-by-Step
If you prefer to run the migration in smaller chunks, execute in this order:

1. **Create Tables** (Run each CREATE TABLE statement)
   - project_roadblocks
   - project_status_updates
   - project_deliverables
   - customer_project_notifications
   - tour_progress

2. **Add Columns to Existing Tables**
   - ALTER TABLE project_charters (adds customer_visible, health_status, etc.)
   - ALTER TABLE project_milestones (adds customer_visible, customer_action_required, etc.)
   - ALTER TABLE risks (adds customer_visible, mitigation_strategy)

3. **Create Database Functions**
   - get_customer_portfolio_summary()
   - get_customer_demand_analysis()

4. **Create Triggers**
   - update_roadblocks_timestamp()
   - update_status_updates_timestamp()
   - update_deliverables_timestamp()

5. **Grant Permissions**
   - GRANT statements at the end of the file

## What Gets Created

### New Tables
1. **project_roadblocks** - Track project blockers and issues
2. **project_status_updates** - Activity feed for customer-visible updates
3. **project_deliverables** - Track deliverable files and completion status
4. **customer_project_notifications** - Notification system for customers
5. **tour_progress** - Track guided tour completion per user

### New Columns on Existing Tables
- **project_charters**: customer_visible, health_status, health_status_explanation, current_phase, next_customer_action, budget_variance_percentage, timeline_variance_days
- **project_milestones**: customer_visible, customer_action_required, definition_of_done
- **risks**: customer_visible, mitigation_strategy

### New Database Functions
- **get_customer_portfolio_summary(p_customer_tenant_id)** - Returns aggregated portfolio data for Primary Customers
- **get_customer_demand_analysis(p_customer_tenant_id)** - Returns resource and budget tracking across sub-clients

## Verification

After running the migration, verify with these queries:

```sql
-- Check new tables exist
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
  AND table_name IN (
    'project_roadblocks',
    'project_status_updates',
    'project_deliverables',
    'customer_project_notifications',
    'tour_progress'
  );

-- Check new columns on project_charters
SELECT column_name 
FROM information_schema.columns 
WHERE table_name = 'project_charters' 
  AND column_name IN (
    'customer_visible',
    'health_status',
    'next_customer_action'
  );

-- Check functions exist
SELECT routine_name 
FROM information_schema.routines 
WHERE routine_schema = 'public' 
  AND routine_name IN (
    'get_customer_portfolio_summary',
    'get_customer_demand_analysis'
  );
```

## Rollback

If you need to rollback this migration, run `phase3_rollback.sql` (see separate file).

## Support

If you encounter any errors during migration:
1. Check the error message in Supabase SQL Editor
2. Verify all prerequisite tables exist (project_charters, project_milestones, risks, tenants, users, work_requests)
3. Ensure you have sufficient permissions to create tables and functions
4. Contact support if issues persist

## Next Steps

After successful migration:
1. Verify all tables and functions are created
2. Test portfolio rollup function with a Primary Customer tenant ID
3. Proceed with Phase 3.3 UI development
