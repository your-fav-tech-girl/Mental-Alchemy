import { createAdminClient } from '@/lib/supabase/admin'
import { isSupabaseConfigured } from '@/lib/supabase/env'
import { apiError, backendUnavailable } from '@/lib/api/responses'
import { allowedContactReasons, cleanText, isEmail } from '@/lib/api/validation'

export async function POST(request) {
  if (!isSupabaseConfigured() || !process.env.SUPABASE_SERVICE_ROLE_KEY) return backendUnavailable()
  const body = await request.json().catch(() => ({}))
  if (body.website) return Response.json({ success: true })

  const name = cleanText(body.name, 120)
  const email = cleanText(body.email, 254).toLowerCase()
  const reason = cleanText(body.reason, 30)
  const message = cleanText(body.message, 4000)
  if (name.length < 2 || !isEmail(email) || !allowedContactReasons.has(reason) || message.length < 10) {
    return apiError('Complete all contact fields with valid information.')
  }

  const admin = createAdminClient()
  const { error } = await admin.from('contact_messages').insert({ name, email, reason, message })
  if (error) return apiError('Your message could not be sent.', 500, 'CONTACT_FAILED')
  return Response.json({ success: true }, { status: 201 })
}
