import { readFileSync } from 'node:fs'
import { strict as assert } from 'node:assert'
import {
  allowedContactReasons,
  allowedMoods,
  allowedSessionTypes,
  cleanText,
  isEmail,
  isUuid,
  validateFutureDate,
  validatePassword,
} from '../lib/api/validation.js'

assert.equal(isEmail('client@example.com'), true)
assert.equal(isEmail('not-an-email'), false)
assert.equal(isUuid('10000000-0000-4000-8000-000000000001'), true)
assert.equal(isUuid('1'), false)
assert.equal(validatePassword('Example123!'), true)
assert.equal(validatePassword('short'), false)
assert.equal(cleanText('  private note  ', 20), 'private note')
assert.ok(validateFutureDate(new Date(Date.now() + 86_400_000).toISOString()))
assert.equal(validateFutureDate(new Date(Date.now() - 86_400_000).toISOString()), null)
assert.equal(allowedSessionTypes.has('Video session'), true)
assert.equal(allowedMoods.has('Great'), true)
assert.equal(allowedContactReasons.has('billing'), true)

const migration = readFileSync(
  new URL('../supabase/migrations/202609180001_initial_backend.sql', import.meta.url),
  'utf8',
)

for (const table of [
  'profiles',
  'therapists',
  'appointments',
  'mood_entries',
  'contact_messages',
  'conversations',
  'messages',
]) {
  assert.match(migration, new RegExp(`alter table public\\.${table} enable row level security;`))
  assert.match(migration, new RegExp(`revoke all on table public\\.${table} from anon, authenticated;`))
}

assert.match(migration, /revoke all on function public\.is_conversation_participant\(uuid\) from public;/)
assert.match(migration, /create unique index appointments_active_slot_key/)

const envExample = readFileSync(new URL('../.env.example', import.meta.url), 'utf8')
assert.match(envExample, /SUPABASE_SERVICE_ROLE_KEY=/)
assert.doesNotMatch(envExample, /NEXT_PUBLIC_SUPABASE_SERVICE_ROLE_KEY/)

console.log('Mental Alchemy backend checks passed.')
