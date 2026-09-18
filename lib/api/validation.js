const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i

export function cleanText(value, maximum = 500) {
  return typeof value === 'string' ? value.trim().slice(0, maximum) : ''
}

export function isEmail(value) {
  return EMAIL_PATTERN.test(cleanText(value, 254))
}

export function isUuid(value) {
  return UUID_PATTERN.test(value ?? '')
}

export function validatePassword(value) {
  return typeof value === 'string' && value.length >= 8 && value.length <= 128
}

export function validateFutureDate(value) {
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return null
  const now = Date.now()
  if (date.getTime() <= now || date.getTime() > now + 366 * 24 * 60 * 60 * 1000) return null
  return date.toISOString()
}

export const allowedSessionTypes = new Set(['Video session', 'Phone session', 'In-person session'])
export const allowedMoods = new Set(['Low', 'Uneasy', 'Okay', 'Good', 'Great'])
export const allowedContactReasons = new Set(['matching', 'billing', 'account', 'clinician', 'press', 'other'])
