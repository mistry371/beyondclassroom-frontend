import './globals.css'
import { Providers } from './providers'
import ClientWrappers from '@/components/ClientWrappers'
import SecurityWrapper from '@/components/SecurityWrapper'
import { Inter } from 'next/font/google'

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' })

const SITE_URL = 'https://beyondclassroom.co.in'

export const metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: 'Beyond Classroom | Premium Mathematics Education for Class 1–8',
    template: '%s | Beyond Classroom',
  },
  description: 'Premium personalized Mathematics education for Class 1 to Class 8. Structured practice papers, expert educators, and flexible learning resources.',
  keywords: ['mathematics', 'education', 'class 1 to 8', 'CBSE', 'online learning', 'Beyond Classroom', 'edtech', 'online math classes', 'grade 1-8 math'],
  authors: [{ name: 'Beyond Classroom' }],
  creator: 'Beyond Classroom',
  openGraph: {
    title: 'Beyond Classroom | Premium Mathematics Education for Class 1–8',
    description: 'Structured, curriculum-aligned mathematics practice for Class 1–8 students. Expert-crafted content, flexible packages, and personalized learning.',
    url: SITE_URL,
    siteName: 'Beyond Classroom',
    locale: 'en_IN',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Beyond Classroom',
    description: 'Premium personalized Mathematics education for Class 1–8',
  },
  robots: { index: true, follow: true, googleBot: { index: true, follow: true } },
  alternates: { canonical: SITE_URL },
}

export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning className={inter.variable}>
      <head>
        <link rel="icon" href="/logo.jpeg" />
        <link rel="preload" href="/logo.jpeg" as="image" />
        <link rel="dns-prefetch" href="https://beyondclassroom-backend.onrender.com" />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              '@context': 'https://schema.org',
              '@type': 'EducationalOrganization',
              name: 'Beyond Classroom',
              description: 'Premium personalized Mathematics education platform for Class 1–8 students',
              url: SITE_URL,
              sameAs: [SITE_URL],
              offers: { '@type': 'Offer', category: 'Mathematics courses for Class 1–8' },
            }),
          }}
        />
      </head>
      <body suppressHydrationWarning>
        <Providers>
          {children}
          <ClientWrappers />
          <SecurityWrapper />
        </Providers>
      </body>
    </html>
  )
}
