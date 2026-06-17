import type { Metadata } from 'next';
import { Inter, Playfair_Display, Poppins } from 'next/font/google';
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
  weight: ['400', '600'],       // Only preload critical weights
});

const playfair = Playfair_Display({
  subsets: ['latin'],
  variable: '--font-playfair',
  display: 'swap',
  // preload: false — Playfair is only used in h1/h2/h3 headings (below-fold for most pages).
  // Preloading it competes with Inter (body text) and the LCP hero image in the critical path.
  // Browser will load it via font-display:swap with no layout shift since fallback dimensions match.
  preload: false,
  weight: ['700'],              // Only the weight used for headings
});

const poppins = Poppins({
  subsets: ['latin'],
  variable: '--font-poppins',
  display: 'optional',          // optional: uses fallback if font not cached, eliminates layout shift
  preload: false,               // Don't preload decorative font — load lazily
  weight: ['400', '500', '600', '700'],
});

export const metadata: Metadata = {
  title: {
    default: 'Find Premium Properties in Gurgaon & Delhi NCR - Luxury Apartments & Villas | SS Realty',
    template: '%s | SS Realty',
  },
  description:
    'Discover premium residential and commercial properties in Delhi NCR. Explore luxury apartments, villas, and plots. Expert real estate consulting for best investments.',
  keywords: [
    'SS Realty', 'real estate', 'property in Delhi NCR', 'apartments for sale',
    'villas', 'plots', 'commercial property', 'buy property', 'rent property', 'luxury homes',
  ],
  authors: [{ name: 'SS Realty Teams', url: 'https://ssrealty.org' }],
  creator: 'SS Realty Teams',
  openGraph: {
    type: 'website',
    locale: 'en_IN',
    url: process.env.NEXT_PUBLIC_APP_URL,
    siteName: 'SS Realty',
    title: 'Find Premium Properties in Delhi NCR - Luxury Apartments & Villas | SS Realty',
    description: 'Discover premium residential and commercial properties in Delhi NCR. Explore luxury apartments, villas, and plots.',
    images: [{ url: '/og-image.jpg', width: 1200, height: 630, alt: 'SS Realty' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Premium Properties in Delhi NCR | SS Realty',
    description: 'Find your dream property with SS Realty.',
  },
  robots: { index: true, follow: true },
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'),
  verification: {
    google: 'KE62V7D-CjTuCnUR5guuPdwlLC47wzhG5b6SZWOGBys',
  },
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const trackingData = await getTrackingSettings();
  const settings = trackingData ? JSON.parse(JSON.stringify(trackingData)) : null;

  return (
    <html lang="en" className={`${inter.variable} ${playfair.variable} ${poppins.variable} scroll-smooth`} suppressHydrationWarning>
      <head>
        {/* Google Tag Manager — loaded after page becomes interactive to avoid render blocking */}
        {settings?.isEnabled && settings.googleTagManagerId && (
          <Script
            id="gtm-load"
            strategy="afterInteractive"
            dangerouslySetInnerHTML={{ __html: `(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
})(window,document,'script','dataLayer','${settings.googleTagManagerId}');` }}
          />
        )}
        {/* End Google Tag Manager */}
        {/* Preconnect to speed up 3rd-party connections before browser discovers them */}
        <link rel="preconnect" href="https://www.googletagmanager.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link rel="preconnect" href="https://res.cloudinary.com" />
        {/* DNS-prefetch for external resources to reduce DNS resolution overhead without blocking TCP/TLS handshakes */}
        <link rel="dns-prefetch" href="https://images.unsplash.com" />
        <link rel="dns-prefetch" href="https://res.cloudinary.com" />
        <link rel="dns-prefetch" href="https://img.youtube.com" />
        <link rel="dns-prefetch" href="https://www.youtube.com" />
        {/* Mobile performance viewport */}
        <meta name="theme-color" content="#1A1800" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              '@context': 'https://schema.org',
              '@graph': [
                {
                  '@type': 'RealEstateAgent',
                  '@id': 'https://ssrealty.org/#organization',
                  name: 'SS Realty',
                  url: process.env.NEXT_PUBLIC_SITE_URL || process.env.NEXT_PUBLIC_APP_URL || 'https://ssrealty.org',
                  logo: `${process.env.NEXT_PUBLIC_SITE_URL || process.env.NEXT_PUBLIC_APP_URL || 'https://ssrealty.org'}/SS%20Realty%20Official%20Logo.png`,
                  image: `${process.env.NEXT_PUBLIC_SITE_URL || process.env.NEXT_PUBLIC_APP_URL || 'https://ssrealty.org'}/SS%20Realty%20Official%20Logo.png`,
                  description: 'Premium real estate agency in Delhi NCR offering luxury apartments, villas, and commercial spaces. Expert consulting for best property investments.',
                  telephone: '+91-9311059100',
                  address: {
                    '@type': 'PostalAddress',
                    streetAddress: 'Plot No-2, Dalmia Farm, Jonapur',
                    addressLocality: 'New Delhi',
                    addressRegion: 'Delhi',
                    postalCode: '110047',
                    addressCountry: 'IN'
                  },
                  areaServed: [
                    'Jonapur',
                    'Chattarpur',
                    'Sultanpur',
                    'Gurugram',
                    'Delhi NCR'
                  ],
                  hasMap: 'https://share.google/0VFigfocQUhuCZvKc',
                  sameAs: [
                    'https://share.google/0VFigfocQUhuCZvKc'
                  ]
                },
                {
                  '@type': 'WebSite',
                  '@id': 'https://ssrealty.org/#website',
                  url: 'https://ssrealty.org',
                  name: 'SS Realty',
                  publisher: {
                    '@id': 'https://ssrealty.org/#organization'
                  },
                  potentialAction: {
                    '@type': 'SearchAction',
                    target: 'https://ssrealty.org/properties?q={search_term_string}',
                    'query-input': 'required name=search_term_string'
                  }
                },
                {
                  '@type': 'ItemList',
                  name: 'Site Navigation',
                  itemListElement: [
                    {
                      '@type': 'SiteNavigationElement',
                      position: 1,
                      name: 'Apartment',
                      description: 'Find premium luxury apartments for sale and rent in Delhi NCR with world-class amenities.',
                      url: 'https://ssrealty.org/properties?type=Apartment'
                    },
                    {
                      '@type': 'SiteNavigationElement',
                      position: 2,
                      name: 'Villa/Farm House',
                      description: 'Explore exclusive villas and farm houses for a luxurious lifestyle in top locations.',
                      url: 'https://ssrealty.org/properties?type=Villa'
                    },
                    {
                      '@type': 'SiteNavigationElement',
                      position: 3,
                      name: 'Residential Plots',
                      description: 'Invest in approved residential plots in fast-growing sectors of Delhi NCR.',
                      url: 'https://ssrealty.org/properties?type=Plot'
                    },
                    {
                      '@type': 'SiteNavigationElement',
                      position: 4,
                      name: 'Commercial Spaces and Plots',
                      description: 'Buy or lease prime commercial spaces, retail shops, and plots for high ROI.',
                      url: 'https://ssrealty.org/properties?type=Commercial'
                    },
                    {
                      '@type': 'SiteNavigationElement',
                      position: 5,
                      name: 'Home Loan Calculator',
                      description: 'Calculate your EMI and plan your home loan effortlessly with our free finance tool.',
                      url: 'https://ssrealty.org/emi-calculator'
                    },
                    {
                      '@type': 'SiteNavigationElement',
                      position: 6,
                      name: 'Contact Us',
                      description: 'Get in touch with our expert real estate consultants to find your dream property today.',
                      url: 'https://ssrealty.org/contact-us'
                    }
                  ]
                }
              ]
            }),
          }}
        />

      </head>
      <body className="min-h-screen flex flex-col font-sans text-[#3a3828] bg-[#FFFEF5]" suppressHydrationWarning={true} data-version="2">
        {/* Optimized Next.js Script Loader */}
        {settings?.isEnabled && (
          <>


            {/* Meta (Facebook) Pixel */}
            {settings.metaPixelId && (
              <Script
                id="fb-pixel"
                strategy="lazyOnload"
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
                  strategy="lazyOnload"
                  src={`https://www.googletagmanager.com/gtag/js?id=${settings.googleAdsConversionId || settings.ga4MeasurementId}`}
                />
                <Script
                  id="gtag-init"
                  strategy="lazyOnload"
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
          {/* Second JSON-LD Block Removed as we consolidated everything above */}
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

