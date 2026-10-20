import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Contact SS Realty | Site Visits & Property Enquiries Delhi NCR',
  description:
    'Get in touch with SS Realty — visit our Jonapur, New Delhi office or call/WhatsApp +91-9311059100. Direct developer dealing for flats in Chattarpur, Gwal Pahari & Gurgaon.',
  alternates: { canonical: 'https://ssrealty.org/contact-us' },
  openGraph: {
    title: 'Contact SS Realty | Site Visits & Property Enquiries Delhi NCR',
    description: 'Schedule a free site visit or consultation for luxury flats and builder floors in Delhi NCR. Call +91-9311059100.',
    url: 'https://ssrealty.org/contact-us',
    type: 'website',
    images: [{ url: '/og-image.jpg', width: 1200, height: 630, alt: 'Contact SS Realty' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Contact SS Realty | Property Consultation & Site Visits',
    description: 'Contact SS Realty directly for verified flats in Chattarpur & Gwal Pahari.',
    images: ['/og-image.jpg'],
  },
};

export default function ContactLayout({ children }: { children: React.ReactNode }) {
  const contactPageSchema = {
    '@context': 'https://schema.org',
    '@type': 'ContactPage',
    name: 'Contact SS Realty',
    description: 'Get in touch with SS Realty for property purchase, free site visits, and consultation.',
    url: 'https://ssrealty.org/contact-us',
    mainEntity: {
      '@type': 'RealEstateAgent',
      name: 'SS Realty',
      telephone: '+91-9311059100',
      email: 'info@ssrealty.org',
      address: {
        '@type': 'PostalAddress',
        streetAddress: 'Plot No-2, Dalmia Farm, Jonapur',
        addressLocality: 'New Delhi',
        addressRegion: 'Delhi',
        postalCode: '110047',
        addressCountry: 'IN',
      },
      geo: {
        '@type': 'GeoCoordinates',
        latitude: 28.4624272,
        longitude: 77.1515298,
      },
      openingHoursSpecification: [
        {
          '@type': 'OpeningHoursSpecification',
          dayOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
          opens: '09:00',
          closes: '19:00',
        },
      ],
    },
  };

  const breadcrumbSchema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://ssrealty.org' },
      { '@type': 'ListItem', position: 2, name: 'Contact Us', item: 'https://ssrealty.org/contact-us' },
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(contactPageSchema) }}
      />
      {children}
    </>
  );
}
