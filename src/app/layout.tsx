import type { Metadata } from 'next';
import { Inter, Playfair_Display } from 'next/font/google';
import './globals.css';
import { Toaster } from 'react-hot-toast';
import Script from 'next/script';
import { getTrackingSettings } from '@/lib/tracking-service';
import TrackingProvider from '@/components/tracking/TrackingProvider';

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

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const trackingData = await getTrackingSettings();
  const settings = trackingData ? JSON.parse(JSON.stringify(trackingData)) : null;

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
      <body className="min-h-screen flex flex-col font-sans text-[#3a3828] bg-[#FFFEF5]" suppressHydrationWarning={true} data-version="2">
        {/* Optimized Next.js Script Loader */}
        {settings?.isEnabled && (
          <>
            {/* Google Tag Manager (GTM) */}
            {settings.googleTagManagerId && (
              <Script
                id="gtm-script"
                strategy="afterInteractive"
                dangerouslySetInnerHTML={{
                  __html: `
                    (function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
                    new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
                    j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
                    'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
                    })(window,document,'script','dataLayer','${settings.googleTagManagerId}');
                  `,
                }}
              />
            )}

            {/* Meta (Facebook) Pixel */}
            {settings.metaPixelId && (
              <Script
                id="fb-pixel"
                strategy="afterInteractive"
                dangerouslySetInnerHTML={{
                  __html: `
                    !function(f,b,e,v,n,t,s)
                    {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
                    n.callMethod.apply(n,arguments):n.queue.push(arguments)};
                    if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
                    n.queue=[];t=b.createElement(e);t.async=!0;
                    t.src=v;s=b.getElementsByTagName(e)[0];
                    s.parentNode.insertBefore(t,s)}(window, document,'script',
                    'https://connect.facebook.net/en_US/fbevents.js');
                    fbq('init', '${settings.metaPixelId}'${settings.enableAdvancedMatching ? ', { em: "anonymous@example.com" }' : ''});
                    fbq('track', 'PageView');
                  `,
                }}
              />
            )}

            {/* Google Analytics 4 (GA4) & Google Ads */}
            {(settings.googleAdsConversionId || settings.ga4MeasurementId) && (
              <>
                <Script
                  id="gtag-load"
                  strategy="afterInteractive"
                  src={`https://www.googletagmanager.com/gtag/js?id=${settings.googleAdsConversionId || settings.ga4MeasurementId}`}
                />
                <Script
                  id="gtag-init"
                  strategy="afterInteractive"
                  dangerouslySetInnerHTML={{
                    __html: `
                      window.dataLayer = window.dataLayer || [];
                      function gtag(){window.dataLayer.push(arguments);}
                      gtag('js', new Date());
                      ${settings.googleAdsConversionId ? `
                        gtag('config', '${settings.googleAdsConversionId}', {
                          'send_page_view': true
                          ${settings.googleAdsRemarketingLabel ? `, 'remarketing_custom_params': { 'label': '${settings.googleAdsRemarketingLabel}' }` : ''}
                        });
                      ` : ''}
                      ${settings.ga4MeasurementId ? `
                        gtag('config', '${settings.ga4MeasurementId}');
                      ` : ''}
                    `,
                  }}
                />
              </>
            )}
          </>
        )}
        {settings?.isEnabled && settings.googleTagManagerId && (
          <noscript>
            <iframe
              src={`https://www.googletagmanager.com/ns.html?id=${settings.googleTagManagerId}`}
              height="0"
              width="0"
              style={{ display: 'none', visibility: 'hidden' }}
            />
          </noscript>
        )}
        {settings?.isEnabled && settings.metaPixelId && (
          <noscript>
            <img
              height="1"
              width="1"
              style={{ display: 'none' }}
              src={`https://www.facebook.com/tr?id=${settings.metaPixelId}&ev=PageView&noscript=1`}
              alt=""
            />
          </noscript>
        )}
        <TrackingProvider settings={settings}>
          {children}
        </TrackingProvider>
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

