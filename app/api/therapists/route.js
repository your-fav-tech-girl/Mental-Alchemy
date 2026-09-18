import { isSupabaseConfigured } from '@/lib/supabase/env'
import { createClient } from '@/lib/supabase/server'
import { apiError, backendUnavailable } from '@/lib/api/responses'

export async function GET() {
  if (!isSupabaseConfigured()) return backendUnavailable()
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('therapists')
    .select('id,name,credentials,bio,specialties,session_types,photo_url,hourly_rate_cents,accepting_clients')
    .eq('is_published', true)
    .order('name')

  if (error) return apiError('Therapists could not be loaded.', 500, 'THERAPISTS_FAILED')
  return Response.json({ therapists: data })
}
