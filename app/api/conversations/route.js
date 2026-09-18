import { isSupabaseConfigured } from '@/lib/supabase/env'
import { getAuthenticatedUser } from '@/lib/supabase/server'
import { apiError, backendUnavailable, unauthorized } from '@/lib/api/responses'
import { cleanText, isUuid } from '@/lib/api/validation'

export async function GET() {
  if (!isSupabaseConfigured()) return backendUnavailable()
  const { supabase, userId } = await getAuthenticatedUser()
  if (!userId) return unauthorized()
  const { data, error } = await supabase.from('conversations').select('id,client_id,therapist_id,updated_at,therapists(name,credentials,photo_url)').order('updated_at', { ascending: false })
  if (error) return apiError('Conversations could not be loaded.', 500, 'CONVERSATIONS_FAILED')
  return Response.json({ conversations: data })
}

export async function POST(request) {
  if (!isSupabaseConfigured()) return backendUnavailable()
  const { supabase, userId } = await getAuthenticatedUser()
  if (!userId) return unauthorized()
  const body = await request.json().catch(() => ({}))
  const therapistId = cleanText(body.therapistId, 50)
  if (!isUuid(therapistId)) return apiError('Choose a valid therapist.')
  const existing = await supabase
    .from('conversations')
    .select('id')
    .eq('client_id', userId)
    .eq('therapist_id', therapistId)
    .maybeSingle()
  if (existing.error) return apiError('The conversation could not be loaded.', 500, 'CONVERSATION_FAILED')
  if (existing.data) return Response.json({ conversation: existing.data })

  const { data, error } = await supabase
    .from('conversations')
    .insert({ client_id: userId, therapist_id: therapistId })
    .select('id')
    .single()
  if (error) return apiError('The conversation could not be created.', 500, 'CONVERSATION_FAILED')
  return Response.json({ conversation: data }, { status: 201 })
}
