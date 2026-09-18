import { isSupabaseConfigured } from '@/lib/supabase/env'
import { createClient } from '@/lib/supabase/server'
import { apiError, backendUnavailable } from '@/lib/api/responses'
import { cleanText, isEmail } from '@/lib/api/validation'

export async function POST(request) {
  if (!isSupabaseConfigured()) return backendUnavailable()

  const body = await request.json().catch(() => ({}))
  const email = cleanText(body.email, 254).toLowerCase()
  const password = typeof body.password === 'string' ? body.password : ''
  if (!isEmail(email) || !password) return apiError('Enter a valid email and password.')

  const supabase = await createClient()
  const { data, error } = await supabase.auth.signInWithPassword({ email, password })
  if (error) return apiError('The email or password is incorrect.', 401, 'LOGIN_FAILED')

  return Response.json({ user: { id: data.user.id, email: data.user.email } })
}
