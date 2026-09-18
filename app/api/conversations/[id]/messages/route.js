import { isSupabaseConfigured } from '@/lib/supabase/env'
import { getAuthenticatedUser } from '@/lib/supabase/server'
import { apiError, backendUnavailable, unauthorized } from '@/lib/api/responses'
import { cleanText, isUuid } from '@/lib/api/validation'

export async function GET(_request, { params }) {
  if (!isSupabaseConfigured()) return backendUnavailable()
  const { supabase, userId } = await getAuthenticatedUser()
  if (!userId) return unauthorized()
  const { id } = await params
  if (!isUuid(id)) return apiError('Invalid conversation.')
  const { data, error } = await supabase.from('messages').select('id,sender_id,body,read_at,created_at').eq('conversation_id', id).order('created_at')
  if (error) return apiError('Messages could not be loaded.', 500, 'MESSAGES_FAILED')
  return Response.json({ messages: data })
}

export async function POST(request, { params }) {
  if (!isSupabaseConfigured()) return backendUnavailable()
  const { supabase, userId } = await getAuthenticatedUser()
  if (!userId) return unauthorized()
  const { id } = await params
  if (!isUuid(id)) return apiError('Invalid conversation.')
  const payload = await request.json().catch(() => ({}))
  const body = cleanText(payload.body, 4000)
  if (!body) return apiError('Write a message before sending.')
  const { data, error } = await supabase.from('messages').insert({ conversation_id: id, sender_id: userId, body }).select('id,sender_id,body,created_at').single()
  if (error) return apiError('The message could not be sent.', 500, 'MESSAGE_FAILED')
  return Response.json({ message: data }, { status: 201 })
}
