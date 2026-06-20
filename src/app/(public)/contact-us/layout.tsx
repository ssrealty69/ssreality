import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Contact SS Realty | Talk to Our Property Experts',
  description:
    'Get in touch with SS Realty — visit our Jonapur, New Delhi office or call +91 93110 59100. We help you buy, sell & invest in properties across Delhi NCR.',
  alternates: { canonical: 'https://ssrealty.org/contact-us' },
};

export default function ContactLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
