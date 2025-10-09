import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export const runtime = 'nodejs'     // ensure Node runtime for server secrets_
export const dynamic = 'force-dynamic'

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!
const SERVICE_ROLE = process.env.SUPABASE_SERVICE_ROLE_TOKEN!  // your var name
const ADMIN_TOKEN  = process.env.ADMIN_TOKEN

export async function POST(req: Request) {
  if (!ADMIN_TOKEN) {
    return NextResponse.json({ error: 'ADMIN_TOKEN not set' }, { status: 500 })
  }
  if (req.headers.get('x-admin-token') !== ADMIN_TOKEN) {
    return NextResponse.json({ error: 'forbidden' }, { status: 403 })
  }

  const supabase = createClient(SUPABASE_URL, SERVICE_ROLE)

  const buckets = ['etl-raw', 'etl-processed', 'etl-quarantine', 'etl-reports']
  const out: Array<{ id: string; status: string; message?: string }> = []

  for (const id of buckets) {
    const { error } = await supabase.storage.createBucket(id, { public: false })
    if (!error) {
      out.push({ id, status: 'created' })
      continue
    }
    if (/exists/i.test(error.message)) {
      out.push({ id, status: 'exists' })
    } else {
      out.push({ id, status: 'error', message: error.message })
    }
  }

  return NextResponse.json(out)
}
