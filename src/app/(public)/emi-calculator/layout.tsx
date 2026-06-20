import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Home Loan EMI Calculator | SS Realty',
  description:
    'Calculate your monthly home loan EMI instantly. Enter loan amount, interest rate & tenure to plan your property purchase in Jonapur or Delhi NCR.',
  alternates: { canonical: 'https://ssrealty.org/emi-calculator' },
};

export default function EMICalculatorLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
