import LegacyPage from '@/components/LegacyPage'

export const dynamic = 'force-static'
export const metadata = { title: 'About' }

export default function AboutPage() {
  return <LegacyPage name="about" />
}
