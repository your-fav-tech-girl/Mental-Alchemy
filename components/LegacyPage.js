import { readFileSync } from 'node:fs'
import { join } from 'node:path'

export default function LegacyPage({ name, dashboard = false }) {
  const filePath = join(process.cwd(), 'legacy-html', `${name}.html`)
  const html = readFileSync(filePath, 'utf8')

  return (
    <div
      className={dashboard ? 'app-body legacy-document' : 'legacy-document'}
      suppressHydrationWarning
      dangerouslySetInnerHTML={{ __html: html }}
    />
  )
}
