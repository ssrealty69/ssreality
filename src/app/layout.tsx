import type { Metadata } from 'next';
import { Inter, Playfair_Display } from 'next/font/google';
import './globals.css';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import FloatingWhatsApp from '@/components/layout/FloatingWhatsApp';
import Preloader from '@/components/layout/Preloader';
import MobileBottomNav from '@/components/layout/MobileBottomNav';
import { Toaster } from 'react-hot-toast';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
  preload: true,
  weight: ['400', '500', '600', '700'],
});

const playfair = Playfair_Display({
  subsets: ['latin'],
  variable: '--font-playfair',
  display: 'swap',
  preload: true,
  weight: ['700', '800'],
});

export const metadata: Metadata = {
  title: {
    default: 'SS Realty | Premium Properties in Delhi NCR',
    template: '%s | SS Realty',
  },
  description:
    'SS Realty — Your trusted real estate partner in Delhi NCR. Find premium apartments, villas, plots and commercial properties for sale and rent.',
  keywords: [
    'SS Realty', 'real estate', 'property in Delhi NCR', 'apartments for sale',
    'villas', 'plots', 'commercial property', 'buy property', 'rent property',
  ],
  authors: [{ name: 'SS Realty Teams', url: 'https://ssrealty.in' }],
  creator: 'SS Realty Teams',
  openGraph: {
    type: 'website',
    locale: 'en_IN',
    url: process.env.NEXT_PUBLIC_APP_URL,
    siteName: 'SS Realty',
    title: 'SS Realty | Premium Properties in Delhi NCR',
    description: 'Find your dream property with SS Realty — trusted real estate partner in Delhi NCR.',
    images: [{ url: '/og-image.jpg', width: 1200, height: 630, alt: 'SS Realty' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'SS Realty | Premium Properties',
    description: 'Find your dream property with SS Realty.',
  },
  robots: { index: true, follow: true },
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'),
  icons: {
    icon: '/SS Realty Official Logo.png',
    shortcut: '/SS Realty Official Logo.png',
    apple: '/SS Realty Official Logo.png',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${inter.variable} ${playfair.variable} scroll-smooth`} suppressHydrationWarning>
      <head>
        <link rel="icon" href="/SS Realty Official Logo.png" />
        <link rel="apple-touch-icon" href="/SS Realty Official Logo.png" />
        <link rel="shortcut icon" href="/SS Realty Official Logo.png" />
        {/* Preconnect to external origins for faster resource loading */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        {/* Preconnect to critical image CDNs (full TCP+TLS handshake early) */}
        <link rel="preconnect" href="https://images.unsplash.com" />
        <link rel="preconnect" href="https://res.cloudinary.com" />
        <link rel="preconnect" href="https://img.youtube.com" />
        {/* DNS-prefetch for less critical origins */}
        <link rel="dns-prefetch" href="https://www.youtube.com" />
        {/* Mobile performance viewport */}
        <meta name="theme-color" content="#1A1800" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
      </head>
      <body className="min-h-screen flex flex-col bg-[#FFFEF5] font-[var(--font-inter)]">
        <Preloader />
        <Navbar />
        <main className="flex-1 pb-16 md:pb-0">{children}</main>
        <Footer />
        <MobileBottomNav />
        <FloatingWhatsApp />
        <Toaster
          position="top-right"
          toastOptions={{
            style: {
              background: '#FFFEF5',
              color: '#1A1800',
              border: '1px solid #E8D5A3',
              fontFamily: 'Inter, sans-serif',
            },
            success: { iconTheme: { primary: '#C9A227', secondary: '#fff' } },
          }}
        />
      </body>
    </html>
  );
}
