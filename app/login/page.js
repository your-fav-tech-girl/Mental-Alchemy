import LegacyPage from '@/components/LegacyPage'

export const dynamic = 'force-static'
export const metadata = { title: 'Log in' }

export default function LoginPage() {
  return <LegacyPage name="login" />
}
