// Force dynamic rendering to avoid SSR issues with Supabase
export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

import ReportingCockpitClient from '@/components/reporting/ReportingCockpitClient'

export default function ReportingPage() {
  return <ReportingCockpitClient />
}
