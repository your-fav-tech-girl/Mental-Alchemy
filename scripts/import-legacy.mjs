import { readFileSync, writeFileSync } from 'node:fs'
import { resolve } from 'node:path'

const sourceRoot = resolve('../mental-alchemy-extracted/mental alchemy')
const outputRoot = resolve('legacy-html')
const pages = {
  home: 'index.html',
  about: 'about.html',
  therapists: 'therapist.html',
  booking: 'booking.html',
  contact: 'contact.html',
  login: 'login.html',
  signup: 'signup.html',
  dashboard: 'dashboard.html',
}

const linkMap = [
  [/\.\/index\.html/g, '/'],
  [/index\.html/g, '/'],
  [/\.\/about\.html/g, '/about'],
  [/about\.html/g, '/about'],
  [/\.\/therapists?\.html/g, '/therapists'],
  [/therapists?\.html/g, '/therapists'],
  [/\.\/booking\.html/g, '/booking'],
  [/booking\.html/g, '/booking'],
  [/book\.html/g, '/booking'],
  [/\.\/contact\.html/g, '/contact'],
  [/contact\.html/g, '/contact'],
  [/\.\/login\.html/g, '/login'],
  [/login\.html/g, '/login'],
  [/\.\/signup\.html/g, '/signup'],
  [/signup\.html/g, '/signup'],
  [/\.\/dashboard\.html/g, '/dashboard'],
  [/dashboard\.html/g, '/dashboard'],
]

for (const [name, file] of Object.entries(pages)) {
  const source = readFileSync(resolve(sourceRoot, file), 'utf8')
  const body = source.match(/<body[^>]*>([\s\S]*?)<script\s+src=["']script\.js["']><\/script>\s*<\/body>/i)
  if (!body) throw new Error(`Could not extract body from ${file}`)
  let html = body[1]
    .replaceAll('./Assets/images/', '/assets/images/')
    .replaceAll('/Assets/images/', '/assets/images/')
    .replaceAll('Assets/images/', '/assets/images/')
  for (const [pattern, replacement] of linkMap) html = html.replace(pattern, replacement)
  writeFileSync(resolve(outputRoot, `${name}.html`), html.trim() + '\n')
}

console.log(`Imported ${Object.keys(pages).length} Mental Alchemy routes.`)
