import { isSupabaseConfigured } from '@/lib/supabase/env'
import { createClient } from '@/lib/supabase/server'
import { backendUnavailable } from '@/lib/api/responses'

export async function POST() {
  if (!isSupabaseConfigured()) return backendUnavailable()
  const supabase = await createClient()
  await supabase.auth.signOut()
  return Response.json({ success: true })
}
