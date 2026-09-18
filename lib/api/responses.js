import { NextResponse } from 'next/server'

export function apiError(message, status = 400, code = 'BAD_REQUEST') {
  return NextResponse.json({ error: message, code }, { status })
}

export function backendUnavailable() {
  return apiError(
    'The backend has not been configured yet.',
    503,
    'BACKEND_NOT_CONFIGURED',
  )
}

export function unauthorized() {
  return apiError('Please log in to continue.', 401, 'UNAUTHORIZED')
}
