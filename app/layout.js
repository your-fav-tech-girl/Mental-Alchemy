/* eslint-disable @next/next/no-page-custom-font */
import Script from 'next/script'
import './globals.css'
import './booking.css'

export const metadata = {
  title: {
    default: 'Mental Alchemy — Find a licensed therapist who fits',
    template: '%s — Mental Alchemy',
  },
  description: 'Find a licensed therapist matched to your needs, preferences, and schedule.',
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght@0,9..144,400;0,9..144,500;0,9..144,600;1,9..144,400;1,9..144,500&family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet" />
      </head>
      <body>
        {children}
        <Script src="/legacy.js" strategy="afterInteractive" />
      </body>
    </html>
  )
}
