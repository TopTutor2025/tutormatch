import type { Metadata } from 'next'
import './globals.css'
import CookieBanner from '@/components/CookieBanner'

const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://proflive.it'

export const metadata: Metadata = {
  metadataBase: new URL(APP_URL),
  title: {
    default: 'Proflive – Trova il tuo tutor',
    template: '%s | Proflive',
  },
  description: 'Il marketplace che connette studenti e tutor per lezioni online e in presenza. Trova il tutor perfetto per medie, superiori e università. Prenota in pochi clic.',
  keywords: [
    'tutor', 'ripetizioni', 'lezioni online', 'lezioni in presenza',
    'tutor online', 'ripetizioni online', 'trovare tutor', 'prenotare tutor',
    'lezioni private', 'studente', 'università', 'superiori', 'medie',
    'matematica', 'fisica', 'italiano', 'inglese', 'videochiamata',
  ],
  authors: [{ name: 'Proflive' }],
  creator: 'Proflive',
  publisher: 'Proflive',
  openGraph: {
    type: 'website',
    locale: 'it_IT',
    url: APP_URL,
    siteName: 'Proflive',
    title: 'Proflive – Trova il tuo tutor',
    description: 'Il marketplace che connette studenti e tutor per lezioni online e in presenza. Prenota in pochi clic il tutor perfetto per te.',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'Proflive – Trova il tuo tutor',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Proflive – Trova il tuo tutor',
    description: 'Il marketplace che connette studenti e tutor per lezioni online e in presenza.',
    images: ['/og-image.png'],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  alternates: {
    canonical: APP_URL,
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="it" className="h-full">
      <body className="min-h-full flex flex-col antialiased bg-white text-gray-900">
        {children}
        <CookieBanner />
      </body>
    </html>
  )
}
