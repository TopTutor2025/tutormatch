import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'TutorMatch – Trova il tuo tutor',
  description: 'Il marketplace che connette studenti e tutor per lezioni online e in presenza.',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="it" className="h-full">
      <body className="min-h-full flex flex-col antialiased bg-white text-gray-900">
        {children}
      </body>
    </html>
  )
}
