import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'EMI Calculator - Plan Your Property Investment in Gurgaon & Delhi NCR',
  description: 'Calculate your home loan EMI and plan your property investment in Gurgaon & Delhi NCR instantly with our easy-to-use EMI calculator.',
};

export default function EMICalculatorLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
