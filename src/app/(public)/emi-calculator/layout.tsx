import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Home Loan EMI Calculator | Calculate Monthly Loan Payments | SS Realty',
  description:
    'Free online Home Loan EMI Calculator by SS Realty. Calculate monthly EMI, interest breakdown, and loan eligibility for flats in Chattarpur, Gwal Pahari & Delhi NCR.',
  alternates: { canonical: 'https://ssrealty.org/emi-calculator' },
  openGraph: {
    title: 'Home Loan EMI Calculator | SS Realty',
    description: 'Calculate your home loan EMI instantly with interest breakup and amortization schedule. Plan your dream property purchase with SS Realty.',
    url: 'https://ssrealty.org/emi-calculator',
    type: 'website',
    images: [{ url: '/og-image.jpg', width: 1200, height: 630, alt: 'SS Realty Home Loan EMI Calculator' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Home Loan EMI Calculator | SS Realty',
    description: 'Instant home loan EMI calculator for flats and builder floors in Delhi NCR.',
    images: ['/og-image.jpg'],
  },
};

export default function EMICalculatorLayout({ children }: { children: React.ReactNode }) {
  const breadcrumbSchema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://ssrealty.org' },
      { '@type': 'ListItem', position: 2, name: 'EMI Calculator', item: 'https://ssrealty.org/emi-calculator' },
    ],
  };

  const calculatorSchema = {
    '@context': 'https://schema.org',
    '@type': 'WebApplication',
    name: 'SS Realty Home Loan EMI Calculator',
    url: 'https://ssrealty.org/emi-calculator',
    applicationCategory: 'FinanceApplication',
    operatingSystem: 'All',
    browserRequirements: 'Requires JavaScript. Requires HTML5.',
    description: 'Calculate monthly home loan EMIs, interest payable, and total cost of borrowing for residential properties in Delhi NCR.',
    offers: {
      '@type': 'Offer',
      price: '0',
      priceCurrency: 'INR',
    },
    creator: {
      '@type': 'Organization',
      name: 'SS Realty',
      url: 'https://ssrealty.org',
    },
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(calculatorSchema) }}
      />
      {children}
    </>
  );
}
