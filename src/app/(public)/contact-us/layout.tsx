import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Contact SS Realty - Real Estate Agents in Gurgaon & Delhi NCR',
  description: 'Get in touch with SS Realty for premium property consultation, buying, selling, or renting luxury real estate in Gurgaon and Delhi NCR.',
};

export default function ContactLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
