import LegacyPage from '@/components/LegacyPage'
import { redirect } from 'next/navigation'
import { isSupabaseConfigured } from '@/lib/supabase/env'
import { getAuthenticatedUser } from '@/lib/supabase/server'

export const dynamic = 'force-dynamic'
export const metadata = { title: 'Dashboard' }

export default async function DashboardPage() {
  if (isSupabaseConfigured()) {
    const { userId } = await getAuthenticatedUser()
    if (!userId) redirect('/login?error=authentication-required')
  }

  return <LegacyPage name="dashboard" dashboard />
}
