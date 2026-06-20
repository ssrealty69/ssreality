import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Careers at SS Realty | Join Our Elite Team',
  description:
    'Explore job openings at SS Realty — Delhi NCR\'s trusted real estate brand. Apply for field sales roles with high commissions & fast career growth.',
  alternates: { canonical: 'https://ssrealty.org/careers' },
};

export default function CareersLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
