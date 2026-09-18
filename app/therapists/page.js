import LegacyPage from '@/components/LegacyPage'

export const dynamic = 'force-static'
export const metadata = { title: 'Find a Therapist' }

export default function TherapistsPage() {
  return <LegacyPage name="therapists" />
}
