import { isSupabaseConfigured } from '@/lib/supabase/env'
import { getAuthenticatedUser } from '@/lib/supabase/server'
import { apiError, backendUnavailable, unauthorized } from '@/lib/api/responses'
import { allowedMoods, cleanText } from '@/lib/api/validation'

export async function GET() {
  if (!isSupabaseConfigured()) return backendUnavailable()
  const { supabase, userId } = await getAuthenticatedUser()
  if (!userId) return unauthorized()
  const today = new Date().toISOString().slice(0, 10)
  const { data, error } = await supabase.from('mood_entries').select('mood,entry_date,created_at').eq('entry_date', today).maybeSingle()
  if (error) return apiError('Your mood check-in could not be loaded.', 500, 'MOOD_FAILED')
  return Response.json({ mood: data })
}

export async function POST(request) {
  if (!isSupabaseConfigured()) return backendUnavailable()
  const { supabase, userId } = await getAuthenticatedUser()
  if (!userId) return unauthorized()
  const body = await request.json().catch(() => ({}))
  const mood = cleanText(body.mood, 20)
  if (!allowedMoods.has(mood)) return apiError('Choose a valid mood.')
  const entryDate = new Date().toISOString().slice(0, 10)
  const { data, error } = await supabase.from('mood_entries').upsert({ client_id: userId, mood, entry_date: entryDate }, { onConflict: 'client_id,entry_date' }).select('mood,entry_date').single()
  if (error) return apiError('Your mood check-in could not be saved.', 500, 'MOOD_FAILED')
  return Response.json({ mood: data })
}
