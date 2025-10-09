# Legacy Timecard References Analysis

## Files with 'timecards' references:
- `/app/reporting/page.tsx` - Already using v_timecard_daily_effective_v2
- `/app/reporting/timecards/page.tsx` - Already using v_timecard_daily_effective_v2
- `/components/admin/TimecardRecalculationTool.tsx` - Already using v_timecard_daily_effective_v2
- `/components/dashboard/ComprehensiveDashboard.tsx` - Uses variable named 'timecards' (not table reference)
- `/components/reporting/SimpleTimecardGrid.tsx` - Uses variable named 'timecards' (not table reference)
- `/lib/supabase.ts` - Contains case statements for 'timecards' and 'timecards_comprehensive_report'
- `/services/timecardService.ts` - Already using v_timecard_daily_effective_v2

## Files with 'timecard_daily' references:
- `/services/timecardService.ts` - Uses both v_timecard_daily_effective_v2 and timecard_daily (for corrections)

## Files with 'v_timecard_daily_effective' (without _v2):
- None found - all references are already using v_timecard_daily_effective_v2

## Status:
✅ Most files are already using the correct v_timecard_daily_effective_v2 view
✅ The timecard_daily table is correctly used only for writing corrections
⚠️ Need to verify that all data retrieval is using the v2 view consistently
