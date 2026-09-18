import { isSupabaseConfigured } from '@/lib/supabase/env'
import { createAdminClient } from '@/lib/supabase/admin'
import { getAuthenticatedUser } from '@/lib/supabase/server'
import { apiError, backendUnavailable } from '@/lib/api/responses'
import { allowedSessionTypes, cleanText, isEmail, isUuid, validateFutureDate } from '@/lib/api/validation'

export async function GET() {
  if (!isSupabaseConfigured()) return backendUnavailable()
  const { supabase, userId } = await getAuthenticatedUser()
  if (!userId) return apiError('Please log in to view appointments.', 401, 'UNAUTHORIZED')

  const { data, error } = await supabase
    .from('appointments')
    .select('id,appointment_at,session_type,status,notes,therapists(id,name,credentials,photo_url)')
    .order('appointment_at', { ascending: true })

  if (error) return apiError('Appointments could not be loaded.', 500, 'APPOINTMENTS_FAILED')
  return Response.json({ appointments: data })
}

export async function POST(request) {
  if (!isSupabaseConfigured()) return backendUnavailable()
  const body = await request.json().catch(() => ({}))
  const therapistId = cleanText(body.therapistId, 50)
  const appointmentAt = validateFutureDate(body.appointmentAt)
  const sessionType = cleanText(body.sessionType, 40)
  const notes = cleanText(body.notes, 2000)

  if (!isUuid(therapistId)) return apiError('Choose a valid therapist.')
  if (!appointmentAt) return apiError('Choose a valid future appointment time.')
  if (!allowedSessionTypes.has(sessionType)) return apiError('Choose a valid session type.')

  const { supabase, userId } = await getAuthenticatedUser()
  const payload = {
    therapist_id: therapistId,
    appointment_at: appointmentAt,
    session_type: sessionType,
    notes,
  }

  let result
  if (userId) {
    const { data: therapist } = await supabase
      .from('therapists')
      .select('id,session_types,accepting_clients')
      .eq('id', therapistId)
      .eq('is_published', true)
      .eq('accepting_clients', true)
      .maybeSingle()
    if (!therapist || !therapist.session_types.includes(sessionType)) {
      return apiError('That therapist or session type is not available.', 404, 'THERAPIST_NOT_FOUND')
    }
    result = await supabase.from('appointments').insert({ ...payload, client_id: userId }).select('id').single()
  } else {
    if (!process.env.SUPABASE_SERVICE_ROLE_KEY) return backendUnavailable()
    const guestName = cleanText(body.guestName, 120)
    const guestEmail = cleanText(body.guestEmail, 254).toLowerCase()
    const guestPhone = cleanText(body.guestPhone, 40)
    if (guestName.length < 2 || !isEmail(guestEmail)) {
      return apiError('Enter your name and a valid email address.')
    }
    const admin = createAdminClient()
    const { data: therapist } = await admin
      .from('therapists')
      .select('id,session_types')
      .eq('id', therapistId)
      .eq('is_published', true)
      .eq('accepting_clients', true)
      .maybeSingle()
    if (!therapist || !therapist.session_types.includes(sessionType)) {
      return apiError('That therapist or session type is not available.', 404, 'THERAPIST_NOT_FOUND')
    }
    result = await admin.from('appointments').insert({ ...payload, guest_name: guestName, guest_email: guestEmail, guest_phone: guestPhone }).select('id').single()
  }

  if (result.error) {
    if (result.error.code === '23505') return apiError('That appointment time was just taken.', 409, 'TIME_UNAVAILABLE')
    return apiError('The appointment could not be saved.', 500, 'APPOINTMENT_FAILED')
  }

  return Response.json({ appointment: result.data }, { status: 201 })
}
