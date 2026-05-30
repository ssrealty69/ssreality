import type { Metadata } from 'next';
import { FileText, AlertTriangle, HandshakeIcon, Gavel, CreditCard, Users, Mail, Phone, MapPin } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Terms of Service | SS Realty',
  description: 'Read the Terms of Service for SS Realty. Understand your rights and responsibilities when using our real estate services and website.',
};

export const dynamic = 'force-static';

const sections = [
  {
    icon: HandshakeIcon,
    title: 'Acceptance of Terms',
    content: [
      {
        subtitle: 'Agreement to Terms',
        text: 'By accessing or using the SS Realty website, mobile application, or any of our real estate services — including property listings, consultations, site visits, or documentation assistance — you agree to be bound by these Terms of Service. If you do not agree, please do not use our services.',
      },
      {
        subtitle: 'Eligibility',
        text: 'You must be at least 18 years of age to use our services. By agreeing to these terms, you represent that you are of legal age and have the legal capacity to enter into binding agreements under Indian law.',
      },
      {
        subtitle: 'Amendments',
        text: 'SS Realty reserves the right to modify these Terms at any time. Changes will be effective upon posting to the website. Your continued use of our services constitutes your acceptance of the modified Terms.',
      },
    ],
  },
  {
    icon: FileText,
    title: 'Services Provided',
    content: [
      {
        subtitle: 'Real Estate Advisory',
        text: 'SS Realty provides real estate brokerage, advisory, and consultation services for residential and commercial properties in Delhi NCR. Our services include property search, site visits, legal documentation guidance, and negotiation assistance.',
      },
      {
        subtitle: 'Property Listings',
        text: 'Property listings on our platform are published in good faith based on information provided by property owners and developers. While we strive for accuracy, SS Realty does not guarantee the completeness, accuracy, or availability of any listed property. Prices, specifications, and availability are subject to change without notice.',
      },
      {
        subtitle: 'Investment Guidance',
        text: 'Any investment predictions, ROI calculators, or market analyses provided on our platform are for informational purposes only and do not constitute financial or investment advice. Real estate investments carry inherent risks. Please consult a qualified financial advisor before making investment decisions.',
      },
      {
        subtitle: 'RERA Compliance',
        text: 'SS Realty is committed to operating in compliance with the Real Estate (Regulation and Development) Act, 2016 (RERA). We recommend clients verify RERA registration of any project before making a purchase decision on the respective state RERA portal.',
      },
    ],
  },
  {
    icon: Users,
    title: 'User Responsibilities',
    content: [
      {
        subtitle: 'Accurate Information',
        text: 'You agree to provide accurate, complete, and truthful information when making inquiries, registering an account, or engaging with our services. Providing false information may result in termination of services.',
      },
      {
        subtitle: 'Prohibited Conduct',
        text: 'You must not: misrepresent your identity or financial capacity; use our platform for fraudulent purposes; post false reviews or misleading information; attempt to bypass our systems; or engage in any activity that violates applicable Indian laws, including the IPC and IT Act.',
      },
      {
        subtitle: 'Account Security',
        text: 'If you create an account on our platform, you are responsible for maintaining the confidentiality of your login credentials. You must promptly notify us of any unauthorised use of your account.',
      },
    ],
  },
  {
    icon: CreditCard,
    title: 'Fees, Commissions & Payments',
    content: [
      {
        subtitle: 'Brokerage Fees',
        text: 'SS Realty charges a brokerage commission as agreed upon and disclosed before finalisation of any transaction. Commission structures vary based on property type, transaction value, and the nature of services rendered. All applicable taxes (including GST) will be added to the commission amount.',
      },
      {
        subtitle: 'Token Amounts & Bookings',
        text: 'Any token or booking amounts collected by SS Realty on behalf of a property developer or seller are held in trust and forwarded as per the agreed transaction structure. Refund terms for such amounts are governed by the specific agreement between the buyer and seller/developer.',
      },
      {
        subtitle: 'Payment Terms',
        text: 'All payments to SS Realty must be made through approved channels (bank transfer, cheque, or authorised digital payments). SS Realty will not be responsible for payments made to any individual agent without an official receipt.',
      },
    ],
  },
  {
    icon: AlertTriangle,
    title: 'Disclaimers & Limitation of Liability',
    content: [
      {
        subtitle: 'No Warranty',
        text: 'SS Realty provides its website and services on an "as is" and "as available" basis without warranties of any kind, either express or implied, including but not limited to accuracy of property information, uninterrupted service availability, or fitness for a particular purpose.',
      },
      {
        subtitle: 'Limitation of Liability',
        text: 'To the fullest extent permitted by law, SS Realty, its directors, employees, and affiliates shall not be liable for any indirect, incidental, special, or consequential damages arising from your use of our services — including loss of property value, missed investment opportunities, or transaction disputes between buyers and sellers.',
      },
      {
        subtitle: 'Third-Party Developers',
        text: 'SS Realty acts as a facilitator between buyers and property developers/sellers. We are not a party to the final sale agreement between a buyer and developer. Any disputes regarding construction quality, delivery timelines, or project approvals must be resolved directly with the developer.',
      },
    ],
  },
  {
    icon: Gavel,
    title: 'Governing Law & Dispute Resolution',
    content: [
      {
        subtitle: 'Applicable Law',
        text: 'These Terms of Service are governed by and construed in accordance with the laws of India. Any disputes arising from or related to these Terms shall be subject to the exclusive jurisdiction of the courts in New Delhi, India.',
      },
      {
        subtitle: 'Dispute Resolution',
        text: 'In the event of a dispute, SS Realty encourages resolution through mutual discussion and negotiation in the first instance. If unresolved, disputes shall be submitted to arbitration under the Arbitration and Conciliation Act, 1996, with the seat of arbitration in New Delhi.',
      },
      {
        subtitle: 'Consumer Rights',
        text: 'Nothing in these Terms limits your rights under the Consumer Protection Act, 2019, or any other applicable consumer protection legislation in India. If you believe your consumer rights have been violated, you may approach the appropriate Consumer Disputes Redressal Forum.',
      },
    ],
  },
];

export default function TermsPage() {
  const lastUpdated = 'May 30, 2025';

  return (
    <div className="min-h-screen bg-[#FFFEF5]">

      {/* Hero */}
      <div className="relative pt-36 pb-20 overflow-hidden">
        <div
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{ backgroundImage: "url('https://images.unsplash.com/photo-1589829545856-d10d557cf95f?auto=format&fit=crop&w=1920&q=80')" }}
        />
        <div className="absolute inset-0 bg-gradient-to-r from-[#1A1800]/92 via-[#1A1800]/85 to-[#1A1800]/75" />
        <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-[#FFFEF5] to-transparent" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="gold-divider mb-5" />
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 rounded-2xl bg-[#C9A227]/15 border border-[#C9A227]/30 flex items-center justify-center">
              <FileText size={22} className="text-[#C9A227]" />
            </div>
            <span className="text-[#C9A227] text-sm font-semibold uppercase tracking-widest">Legal</span>
          </div>
          <h1 className="text-4xl md:text-6xl font-[var(--font-playfair)] text-white mb-4">
            Terms of <span className="text-[#C9A227]">Service</span>
          </h1>
          <p className="text-[#d4c490] text-lg max-w-2xl">
            These terms govern your use of SS Realty&apos;s services and website. Please read them carefully before engaging with us.
          </p>
          <p className="text-[#a09060] text-sm mt-4">Last updated: {lastUpdated}</p>
        </div>
      </div>

      {/* Quick Nav */}
      <section className="section-padding pb-0">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Intro */}
          <div className="bg-[#FFFBEB] border border-[#E8D5A3] rounded-2xl p-6 md:p-8 mb-6">
            <p className="text-[#504e40] leading-relaxed text-base">
              These Terms of Service (&quot;Terms&quot;) constitute a legally binding agreement between you (&quot;User&quot;, &quot;Client&quot;) and SS Realty (&quot;Company&quot;, &quot;we&quot;, &quot;us&quot;), a real estate advisory and brokerage firm operating from Plot No-2, Dalmia Farm, Jonapur, Delhi — 110047.
            </p>
            <p className="text-[#504e40] leading-relaxed text-base mt-4">
              These Terms apply to all interactions with SS Realty, including use of our website, mobile app, social media channels, and physical consultation services. Please read them in conjunction with our Privacy Policy.
            </p>
          </div>

          {/* Key Highlights */}
          <div className="grid sm:grid-cols-3 gap-4 mb-10">
            {[
              { title: 'RERA Compliant', desc: 'Operating under RERA 2016 for full regulatory compliance.' },
              { title: 'Transparent Fees', desc: 'All brokerage fees disclosed before any commitment.' },
              { title: 'Delhi NCR Courts', desc: 'Disputes governed by courts in New Delhi, India.' },
            ].map(({ title, desc }) => (
              <div key={title} className="bg-white border border-[#E8D5A3] rounded-xl p-4 text-center">
                <div className="w-1.5 h-1.5 rounded-full bg-[#C9A227] mx-auto mb-3" />
                <p className="font-bold text-[#1A1800] text-sm mb-1">{title}</p>
                <p className="text-[10px] text-[#6b6450] leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Main Sections */}
      <section className="section-padding pt-0">
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

          {/* Intellectual Property */}
          <div className="bg-white rounded-2xl border border-[#E8D5A3] overflow-hidden shadow-sm">
            <div className="flex items-center gap-4 px-6 py-5 bg-[#FFFBEB] border-b border-[#E8D5A3]">
              <div className="w-10 h-10 rounded-xl bg-[#C9A227]/10 border border-[#C9A227]/25 flex items-center justify-center shrink-0">
                <FileText size={18} className="text-[#C9A227]" />
              </div>
              <h2 className="text-xl font-bold font-[var(--font-playfair)] text-[#1A1800]">Intellectual Property</h2>
            </div>
            <div className="p-6 space-y-4">
              <p className="text-[#504e40] text-sm leading-relaxed">
                All content on the SS Realty website — including text, images, property photographs, logos, branding, UI designs, and software — is the exclusive intellectual property of SS Realty or its licensors and is protected under the Copyright Act, 1957 and applicable Indian intellectual property laws.
              </p>
              <p className="text-[#504e40] text-sm leading-relaxed">
                You may not reproduce, distribute, modify, or use any content from this website for commercial purposes without prior written permission from SS Realty. Unauthorised use will be treated as copyright infringement and may result in legal action.
              </p>
            </div>
          </div>

          {/* Termination */}
          <div className="bg-[#1A1800] rounded-2xl p-6 md:p-8">
            <div className="gold-divider mb-5" />
            <h2 className="text-2xl font-[var(--font-playfair)] mb-4" style={{ background: 'linear-gradient(90deg, #FFD700, #F5C518, #FFD700)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>Termination of Services</h2>
            <p className="text-white text-sm leading-relaxed mb-4">
              SS Realty reserves the right to suspend or terminate your access to our website and services at any time, without prior notice, if you violate these Terms of Service, provide false information, engage in fraudulent activity, or for any other reason at our sole discretion.
            </p>
            <p className="text-white text-sm leading-relaxed">
              Upon termination, all provisions of these Terms that by their nature should survive (including disclaimers, limitations of liability, and governing law clauses) shall remain in full force and effect.
            </p>
          </div>

          {/* Entire Agreement */}
          <div className="bg-white rounded-2xl border border-[#E8D5A3] p-6">
            <h2 className="text-xl font-bold font-[var(--font-playfair)] text-[#1A1800] mb-3">Entire Agreement</h2>
            <p className="text-[#504e40] text-sm leading-relaxed">
              These Terms of Service, together with our Privacy Policy and any other legal notices published on our website, constitute the entire agreement between you and SS Realty regarding the use of our services. If any provision of these Terms is found to be invalid or unenforceable, the remaining provisions shall continue to be valid and enforceable.
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
              Questions About <span className="gold-text-gradient">These Terms?</span>
            </h2>
            <p className="text-[#504e40] text-sm leading-relaxed mb-6">
              If you have any questions, concerns, or require clarification regarding these Terms of Service, please do not hesitate to reach out to us:
            </p>
            <div className="grid sm:grid-cols-3 gap-4">
              {[
                { icon: Mail, label: 'Email', value: 'info@ssrealty.in', href: 'mailto:info@ssrealty.in' },
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
