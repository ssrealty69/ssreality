import type { Metadata } from 'next';
import { Shield, Eye, Lock, Bell, FileText, Mail, Phone, MapPin } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Privacy Policy',
  description: 'Privacy policy detailing how SS Realty handles and protects user data for our Gurgaon and Delhi NCR real estate services.',
};

export const dynamic = 'force-static';

const sections = [
  {
    icon: Eye,
    title: 'Information We Collect',
    content: [
      {
        subtitle: 'Personal Information',
        text: 'When you inquire about a property, register on our website, or contact us, we may collect: your full name, phone number, email address, current address, and any property preferences or budget details you voluntarily share.',
      },
      {
        subtitle: 'Property Search Data',
        text: 'We collect information about the properties you view, save, or inquire about — including location preferences, property type, budget range, and preferred possession timelines — to help us serve you better.',
      },
      {
        subtitle: 'Technical & Usage Data',
        text: 'We automatically collect browser type, IP address, device information, pages visited, time spent, and referring URLs. This helps us improve website performance and user experience.',
      },
      {
        subtitle: 'Cookies & Tracking',
        text: 'We use cookies and similar technologies to remember your preferences, analyse site traffic, and personalise your experience. You may disable cookies in your browser settings, though some features may not function properly.',
      },
    ],
  },
  {
    icon: FileText,
    title: 'How We Use Your Information',
    content: [
      {
        subtitle: 'Property Consultation',
        text: 'Your contact and preference data is used by our agents to match you with suitable properties, schedule site visits, and provide personalised real estate guidance.',
      },
      {
        subtitle: 'Communication',
        text: 'We use your contact details to send property alerts, market updates, new project launches, and transactional notifications related to your inquiries. You can opt out of promotional communications at any time.',
      },
      {
        subtitle: 'Legal & Regulatory Compliance',
        text: 'We may retain certain information as required under RERA (Real Estate Regulatory Authority), Income Tax Act, and other applicable Indian laws governing real estate transactions.',
      },
      {
        subtitle: 'Service Improvement',
        text: 'Aggregated, anonymised data is used to analyse trends, improve our digital platform, and enhance the quality of our real estate advisory services.',
      },
    ],
  },
  {
    icon: Lock,
    title: 'Data Security & Protection',
    content: [
      {
        subtitle: 'Security Measures',
        text: 'We implement industry-standard security measures including SSL encryption, secure servers, and restricted access controls to protect your personal information from unauthorised access, disclosure, or loss.',
      },
      {
        subtitle: 'Data Retention',
        text: 'We retain your data only as long as necessary to fulfil the purpose it was collected for, or as required by law. Client transaction records may be retained for up to 7 years as per statutory requirements.',
      },
      {
        subtitle: 'Third-Party Sharing',
        text: 'We do not sell, rent, or trade your personal information. We may share data with trusted partners (e.g., property developers, legal advisors, financial institutions) only when necessary to complete a transaction you have initiated, and only with your knowledge.',
      },
    ],
  },
  {
    icon: Bell,
    title: 'Your Rights & Choices',
    content: [
      {
        subtitle: 'Access & Correction',
        text: 'You have the right to access the personal data we hold about you and to request corrections if it is inaccurate or incomplete. Contact us at info@ssrealty.org to make such a request.',
      },
      {
        subtitle: 'Data Deletion',
        text: 'You may request deletion of your personal data at any time, subject to legal retention requirements. We will process deletion requests within 30 days of receiving a written request.',
      },
      {
        subtitle: 'Opt-Out of Marketing',
        text: 'You can unsubscribe from promotional emails using the unsubscribe link in any email, or by contacting us directly. Note that transactional communications related to active inquiries or transactions cannot be opted out of.',
      },
      {
        subtitle: 'Cookie Preferences',
        text: 'You can manage cookie preferences through your browser settings. Most browsers allow you to refuse cookies or delete existing ones. Please refer to your browser\'s help documentation for guidance.',
      },
    ],
  },
];

export default function PrivacyPage() {
  const lastUpdated = 'May 30, 2025';

  return (
    <div className="min-h-screen bg-[#FFFEF5]">

      {/* Hero */}
      <div className="relative pt-36 pb-20 overflow-hidden">
        <div
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{ backgroundImage: "url('https://images.unsplash.com/photo-1450101499163-c8848c66ca85?auto=format&fit=crop&w=1920&q=80')" }}
        />
        <div className="absolute inset-0 bg-gradient-to-r from-[#1A1800]/92 via-[#1A1800]/85 to-[#1A1800]/75" />
        <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-[#FFFEF5] to-transparent" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="gold-divider mb-5" />
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 rounded-2xl bg-[#C9A227]/15 border border-[#C9A227]/30 flex items-center justify-center">
              <Shield size={22} className="text-[#C9A227]" />
            </div>
            <span className="text-[#C9A227] text-sm font-semibold uppercase tracking-widest">Legal</span>
          </div>
          <h1 className="text-4xl md:text-6xl font-[var(--font-playfair)] text-white mb-4">
            Privacy <span className="text-[#C9A227]">Policy</span>
          </h1>
          <p className="text-[#d4c490] text-lg max-w-2xl">
            At SS Realty, your privacy is fundamental to everything we do. This policy explains how we collect, use, and safeguard your personal information.
          </p>
          <p className="text-[#a09060] text-sm mt-4">Last updated: {lastUpdated}</p>
        </div>
      </div>

      {/* Intro Banner */}
      <section className="section-padding pb-0">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-[#FFFBEB] border border-[#E8D5A3] rounded-2xl p-6 md:p-8">
            <p className="text-[#504e40] leading-relaxed text-base">
              This Privacy Policy applies to SS Realty, operating at Plot No-2, Dalmia Farm, Jonapur, Delhi — 110047. By accessing our website, using our services, or making a property inquiry, you agree to the terms of this policy. If you do not agree, please discontinue using our services.
            </p>
            <p className="text-[#504e40] leading-relaxed text-base mt-4">
              We are committed to handling your data with transparency and in compliance with applicable Indian data protection regulations, including the Information Technology Act, 2000 and its amendments.
            </p>
          </div>
        </div>
      </section>

      {/* Main Sections */}
      <section className="section-padding">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
          {sections.map(({ icon: Icon, title, content }) => (
            <div key={title} className="bg-white rounded-2xl border border-[#E8D5A3] overflow-hidden shadow-sm">
              {/* Section Header */}
              <div className="flex items-center gap-4 px-6 py-5 bg-[#FFFBEB] border-b border-[#E8D5A3]">
                <div className="w-10 h-10 rounded-xl bg-[#C9A227]/10 border border-[#C9A227]/25 flex items-center justify-center shrink-0">
                  <Icon size={18} className="text-[#C9A227]" />
                </div>
                <h2 className="text-xl font-bold font-[var(--font-playfair)] text-[#1A1800]">{title}</h2>
              </div>
              {/* Section Content */}
              <div className="p-6 space-y-6">
                {content.map(({ subtitle, text }) => (
                  <div key={subtitle}>
                    <h3 className="font-semibold text-[#1A1800] text-sm uppercase tracking-wider mb-2 flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#C9A227] shrink-0" />
                      {subtitle}
                    </h3>
                    <p className="text-[#504e40] text-sm leading-relaxed pl-4">{text}</p>
                  </div>
                ))}
              </div>
            </div>
          ))}

          {/* Third-Party Services */}
          <div className="bg-white rounded-2xl border border-[#E8D5A3] overflow-hidden shadow-sm">
            <div className="flex items-center gap-4 px-6 py-5 bg-[#FFFBEB] border-b border-[#E8D5A3]">
              <div className="w-10 h-10 rounded-xl bg-[#C9A227]/10 border border-[#C9A227]/25 flex items-center justify-center shrink-0">
                <Shield size={18} className="text-[#C9A227]" />
              </div>
              <h2 className="text-xl font-bold font-[var(--font-playfair)] text-[#1A1800]">Third-Party Services & Links</h2>
            </div>
            <div className="p-6 space-y-4">
              <p className="text-[#504e40] text-sm leading-relaxed">
                Our website may contain links to third-party websites, property portals (such as 99acres, MagicBricks, Housing.com), or integrated tools (such as Google Maps). We are not responsible for the privacy practices or content of these external sites. We encourage you to read their privacy policies independently.
              </p>
              <p className="text-[#504e40] text-sm leading-relaxed">
                We may use Google Analytics, Meta Pixel, and similar analytics services to understand website usage. These services have their own data collection practices governed by their respective privacy policies.
              </p>
            </div>
          </div>

          {/* RERA Note */}
          <div className="bg-[#1A1800] rounded-2xl p-6 md:p-8">
            <div className="gold-divider mb-5" />
            <h2 className="text-2xl font-[var(--font-playfair)] mb-4" style={{ color: '#ffffff' }}>RERA & Regulatory Compliance</h2>
            <p className="text-white text-sm leading-relaxed mb-4">
              SS Realty operates in compliance with the Real Estate (Regulation and Development) Act, 2016 (RERA). Our registered projects are listed on the relevant state RERA portals. Any information shared for RERA-registered project inquiries may be forwarded to the respective project developers as required.
            </p>
            <p className="text-white text-sm leading-relaxed">
              We may be legally required to disclose your information if mandated by a court order, government authority, or in response to a lawful legal process under Indian law.
            </p>
          </div>

          {/* Updates */}
          <div className="bg-white rounded-2xl border border-[#E8D5A3] p-6">
            <h2 className="text-xl font-bold font-[var(--font-playfair)] text-[#1A1800] mb-3">Policy Updates</h2>
            <p className="text-[#504e40] text-sm leading-relaxed">
              We may update this Privacy Policy periodically to reflect changes in our practices, services, or applicable laws. We will notify you of significant changes by posting a notice on our website or by email. Your continued use of our services after the update constitutes your acceptance of the revised policy.
            </p>
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section className="section-padding pt-0">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-gradient-to-br from-[#FFFBEB] to-[#FFF8E1] border border-[#E8D5A3] rounded-2xl p-6 md:p-8">
            <div className="gold-divider mb-5" />
            <h2 className="text-2xl font-[var(--font-playfair)] text-[#1A1800] mb-2">
              Privacy <span className="gold-text-gradient">Questions?</span>
            </h2>
            <p className="text-[#504e40] text-sm leading-relaxed mb-6">
              If you have any questions, concerns, or requests regarding this Privacy Policy or the personal data we hold about you, please contact our Privacy Officer:
            </p>
            <div className="grid sm:grid-cols-3 gap-4">
              {[
                { icon: Mail, label: 'Email', value: 'info@ssrealty.org', href: 'mailto:info@ssrealty.org' },
                { icon: Phone, label: 'Phone', value: '+91 93110 59100', href: 'tel:+919311059100' },
                { icon: MapPin, label: 'Address', value: 'Jonapur, Delhi — 110047', href: null },
              ].map(({ icon: Icon, label, value, href }) => (
                <div key={label} className="bg-white rounded-xl p-4 border border-[#E8D5A3] flex items-start gap-3">
                  <div className="w-9 h-9 rounded-lg bg-[#C9A227]/10 flex items-center justify-center shrink-0 mt-0.5">
                    <Icon size={16} className="text-[#C9A227]" />
                  </div>
                  <div>
                    <p className="text-[9px] font-black text-[#AA7C11] uppercase tracking-widest mb-0.5">{label}</p>
                    {href ? (
                      <a href={href} className="text-sm text-[#1A1800] font-semibold hover:text-[#C9A227] transition-colors">
                        {value}
                      </a>
                    ) : (
                      <p className="text-sm text-[#504e40]">{value}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

    </div>
  );
}
