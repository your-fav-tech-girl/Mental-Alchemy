import LegacyPage from '@/components/LegacyPage'

export const dynamic = 'force-static'
export const metadata = { title: 'Dashboard' }

export default function DashboardPage() {
  return <LegacyPage name="dashboard" dashboard />
}
