import { isSupabaseConfigured } from '@/lib/supabase/env'
import { createClient } from '@/lib/supabase/server'
import { apiError, backendUnavailable } from '@/lib/api/responses'
import { cleanText, isEmail, validatePassword } from '@/lib/api/validation'

export async function POST(request) {
  if (!isSupabaseConfigured()) return backendUnavailable()

  const body = await request.json().catch(() => ({}))
  const fullName = cleanText(body.fullName, 120)
  const email = cleanText(body.email, 254).toLowerCase()
  const password = body.password

  if (fullName.length < 2) return apiError('Enter your full name.')
  if (!isEmail(email)) return apiError('Enter a valid email address.')
  if (!validatePassword(password)) return apiError('Use a password between 8 and 128 characters.')

  const supabase = await createClient()
  const origin = new URL(request.url).origin
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: { full_name: fullName },
      emailRedirectTo: `${origin}/auth/confirm`,
    },
  })

  if (error) return apiError(error.message, 400, 'SIGNUP_FAILED')

  return Response.json({
    user: data.user ? { id: data.user.id, email: data.user.email } : null,
    needsEmailConfirmation: !data.session,
  })
}
