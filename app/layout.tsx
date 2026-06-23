import type { Metadata } from 'next'
import { Playfair_Display, Inter } from 'next/font/google'
import '@/styles/globals.css'
import CustomCursor from '@/components/CustomCursor'
import GrainOverlay from '@/components/GrainOverlay'
import LenisProvider from '@/components/LenisProvider'
import PageTransition from '@/components/PageTransition'
import Navbar from '@/components/Navbar'

const playfair = Playfair_Display({
  subsets: ['latin'],
  weight: ['400', '700'],
  style: ['normal', 'italic'],
  variable: '--font-playfair',
  display: 'swap',
})

const inter = Inter({
  subsets: ['latin'],
  weight: ['400', '500'],
  variable: '--font-inter',
  display: 'swap',
})

export const metadata: Metadata = {
  title: 'Vatsal Sharma — Engineer & Builder',
  description:
    'I build for the version after the demo. Software engineer, systems thinker, available from August 2026.',
  metadataBase: new URL('https://vatsal-portfolio.vercel.app'),
  openGraph: {
    title: 'Vatsal Sharma — Engineer & Builder',
    description:
      'I build for the version after the demo. Software engineer, systems thinker, available from August 2026.',
    url: 'https://vatsal-portfolio.vercel.app',
    type: 'website',
    images: [
      {
        url: '/og',
        width: 1200,
        height: 630,
        alt: 'Vatsal Sharma — Engineer & Builder',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Vatsal Sharma — Engineer & Builder',
    description:
      'I build for the version after the demo. Software engineer, systems thinker, available from August 2026.',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html
      lang="en"
      className={`${playfair.variable} ${inter.variable}`}
    >
      <body>
        {/* Fix 2: Lenis + GSAP in dedicated client provider — no hydration issues */}
        <LenisProvider />
        <CustomCursor />
        <Navbar />
        <PageTransition>{children}</PageTransition>
        <GrainOverlay />
      </body>
    </html>
  )
}
