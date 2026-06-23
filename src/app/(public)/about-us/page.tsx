import Image from 'next/image';
import type { Metadata } from 'next';
import { Target, Eye, Heart, Users, Award, CheckCircle2, Phone, Mail, MapPin, Navigation } from 'lucide-react';
import JourneyTimeline from '@/components/public/JourneyTimeline';

export const metadata: Metadata = {
  title: 'About SS Realty | Trusted Delhi NCR Property Experts',
  description:
    'Founded in 2008, SS Realty has helped 2,000+ families buy flats, villas & plots across Jonapur, Chattarpur & Delhi NCR. Meet our team and our story.',
  alternates: { canonical: 'https://ssrealty.org/about-us' },
};

// SSG — fully static
export const dynamic = 'force-static';

const team = [
  { name: 'Yogesh Tanwar', role: 'Founder & CEO', initials: 'SS', color: '#C9A227', exp: '17+ years experience' },
  { name: 'Ayaan', role: 'Head of Sales', initials: 'SP', color: '#B8860B', exp: 'Residential expert' },
  { name: 'Nikhil', role: 'Head of Department', initials: 'RM', color: '#9a6f08', exp: 'Commercial specialist' },
  { name: 'Priya Desai', role: 'Legal Advisor', initials: 'PD', color: '#C9A227', exp: 'Property law expert' },
];

const values = [
  { icon: Eye, title: 'Transparency', desc: 'We believe in honest, clear communication — no hidden charges, no misleading listings.' },
  { icon: Heart, title: 'Client First', desc: 'Your needs come first. We listen, understand, and find the perfect property for you.' },
  { icon: Award, title: 'Excellence', desc: 'Premium service quality at every step — from search to documentation to handover.' },
  { icon: CheckCircle2, title: 'Integrity', desc: 'All our listings are verified, all our advice is unbiased, and our deals are transparent.' },
];

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-[#FFFEF5]">
      {/* Hero */}
      <div className="relative pt-36 pb-20 overflow-hidden">
        <div className="absolute inset-0 bg-cover bg-center bg-no-repeat" style={{ backgroundImage: "url('https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1920&q=80')" }} />
        <div className="absolute inset-0 bg-gradient-to-r from-[#1A1800]/90 via-[#1A1800]/85 to-[#1A1800]/75" />
        <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-[#FFFEF5] to-transparent" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 flex flex-col items-center text-center">
          <div className="gold-divider mb-5" />
          <h1 className="text-4xl md:text-6xl font-[var(--font-playfair)] mb-4 text-white">
            <span className="text-white">About</span> <span className="text-[#C9A227]">SS Realty</span>
          </h1>
          <p className="text-[#d4c490] text-lg max-w-2xl">
            25+ years of trust, transparency, and transforming property dreams into reality across Delhi NCR.
          </p>
        </div>
      </div>

      {/* Mission/Vision */}
      <section className="section-padding">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 gap-10 items-stretch">
            <div>
              <div className="gold-divider mb-5" />
              <h2 className="text-4xl font-[var(--font-playfair)] text-[#1A1800] mb-5">Our Story</h2>
              <p className="text-[#504e40] leading-relaxed mb-4">
                Founded in 2008, SS Realty started with a simple mission — make real estate in Delhi NCR simple, transparent, and accessible to everyone. What began with plotting and land layout developments in Delhi has grown into one of Delhi NCR&apos;s most trusted real estate brands.
              </p>
              <p className="text-[#504e40] leading-relaxed mb-6">
                We&apos;ve helped over 2,000 families find their dream homes, guided investors to high-ROI properties, and assisted clients in building wealth through real estate — all with integrity and excellence.
              </p>
              <div className="grid grid-cols-2 gap-4">
                {[{
                  icon: Target,
                  title: 'Our Mission',
                  desc: 'To deliver world-class real estate solutions that exceed customer expectations through innovation, quality construction, and ethical business practices.'
                }, {
                  icon: Eye,
                  title: 'Our Vision',
                  desc: 'To create sustainable, value-driven developments that enhance lives and set new benchmarks in the real estate industry.'
                }].map(({ icon: Icon, title, desc }) => (
                  <div key={title} className="bg-[#FFFBEB] rounded-xl p-4 border border-[#E8D5A3]">
                    <Icon size={20} className="text-[#C9A227] mb-2" />
                    <h4 className="font-semibold text-[#1A1800] text-sm mb-1">{title}</h4>
                    <p className="text-xs text-[#6b6450]">{desc}</p>
                  </div>
                ))}
              </div>
            </div>
            <div className="relative w-full aspect-[4/3] md:aspect-auto md:h-full md:min-h-[420px]">
              <div className="w-full h-full rounded-3xl overflow-hidden shadow-[var(--shadow-hover)]">
                <Image
                  src="/SS Realty office, SS Realty 3BHK Flat in Gurgaon, 3BHK Flat in Sultanpur, SS Realty.webp"
                  alt="SS Realty office in Chhatarpur, New Delhi"
                  fill
                  className="object-cover object-center scale-105 transition-transform duration-500 rounded-3xl"
                  sizes="(max-width: 768px) 100vw, 50vw"
                  quality={75}
                />
              </div>
              <div className="absolute -top-4 -left-4 md:-top-10 md:-left-10 z-10">
                {/* Minimal gradient golden ring wrapper (w-24 on mobile, w-36 on desktop) */}
                <div className="w-24 h-24 md:w-36 md:h-36 rounded-full bg-gradient-to-br from-[#FFE5A3] via-[#C9A227] to-[#8F6F1B] p-[1.5px] shadow-xl transition-all duration-300 hover:scale-105">
                  {/* Inner white transparent badge */}
                  <div className="w-full h-full rounded-full bg-white/90 backdrop-blur-md flex flex-col justify-center items-center text-center p-1.5 md:p-3">
                    <p className="text-[8px] md:text-[11px] uppercase tracking-wider text-[#6b6450] font-semibold mb-0.5">Established</p>
                    <p className="text-lg md:text-3xl font-bold font-[var(--font-playfair)] text-[#1A1800] leading-none mb-0.5 md:mb-1">2008</p>
                    <p className="text-[8px] md:text-[11px] font-bold text-[#C9A227] leading-tight px-1">Chhatarpur, New Delhi</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="section-padding bg-[#FFFBEB]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <div className="gold-divider mx-auto mb-5" />
            <h2 className="text-4xl font-[var(--font-playfair)] text-[#1A1800]">Our <span className="gold-text-gradient">Core Values</span></h2>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {values.map(({ icon: Icon, title, desc }) => (
              <div key={title} className="bg-white rounded-2xl p-6 border border-[#E8D5A3] text-center hover:shadow-[var(--shadow-gold)] transition-shadow">
                <div className="w-14 h-14 mx-auto mb-4 rounded-2xl bg-[#C9A227]/10 flex items-center justify-center">
                  <Icon size={24} className="text-[#C9A227]" />
                </div>
                <h3 className="font-bold text-[#1A1800] mb-2">{title}</h3>
                <p className="text-sm text-[#6b6450] leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Network & Expertise (SEO Optimized) */}
      <section className="section-padding bg-[#FFFEF5]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <div className="gold-divider mx-auto mb-5" />
            <h2 className="text-4xl font-[var(--font-playfair)] text-[#1A1800]">Our <span className="gold-text-gradient">Network & Expertise</span></h2>
          </div>
          <div className="bg-white rounded-3xl p-8 md:p-12 border border-[#E8D5A3] shadow-sm hover:shadow-[var(--shadow-gold)] transition-shadow">
            <div className="grid md:grid-cols-2 gap-10">
              <div>
                <h3 className="text-2xl font-bold font-[var(--font-playfair)] text-[#1A1800] mb-4">Premium Properties Across Delhi NCR</h3>
                <p className="text-[#504e40] leading-relaxed mb-6">
                  At SS Realty, we specialize in offering an exclusive portfolio of properties tailored to your lifestyle and business needs. Whether you are looking for <strong>Luxury Homes</strong>, <strong>Luxury Flats</strong>, <strong>Apartments</strong>, or <strong>Commercial and residential properties</strong>, we have you covered. We also deal extensively in <strong>Lands</strong>, <strong>Farm houses</strong>, and <strong>Villas</strong> to ensure you find the perfect match for your investment or living requirements.
                </p>
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-8 h-8 rounded-full bg-[#C9A227]/10 flex items-center justify-center shrink-0">
                    <MapPin size={16} className="text-[#C9A227]" />
                  </div>
                  <p className="text-sm font-semibold text-[#1A1800]">Prime Locations We Serve:</p>
                </div>
                <p className="text-[#6b6450] text-sm leading-relaxed pl-11">
                  Chattarpur, Mandi, Chandan Hola, and South Delhi to Gwal Pahari, Gurugram, Noida, and all over Delhi NCR.
                </p>
              </div>
              <div className="bg-[#FFFBEB] rounded-2xl p-6 border border-[#E8D5A3] flex flex-col justify-center">
                <h3 className="text-xl font-bold text-[#1A1800] mb-4 flex items-center gap-2">
                  <MapPin size={20} className="text-[#C9A227]"/> Visit Our Office
                </h3>
                <address className="not-italic text-[#504e40] leading-relaxed mb-6">
                  <strong>SS Realty</strong><br />
                  Plot No-2, Dalmia Farm,<br />
                  Jonapur, New Delhi 110047
                </address>
                <p className="text-sm text-[#6b6450] mb-4">
                  Drop by our office to discuss your real estate requirements with our expert consultants. We are always ready to assist you in finding the best properties in South Delhi and beyond.
                </p>
                <a href="https://share.google/DuHqosVcJ03udejB8" target="_blank" rel="noopener noreferrer" className="inline-flex items-center justify-center gap-2 bg-[#1A1800] text-white px-5 py-2.5 rounded-lg font-medium hover:bg-[#3a3828] transition-colors self-start text-sm">
                  Get Directions <Navigation size={14} />
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Timeline */}
      <JourneyTimeline />

      {/* Team */}
      <section className="section-padding">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <div className="gold-divider mx-auto mb-5" />
            <h2 className="text-4xl font-[var(--font-playfair)] text-[#1A1800]">Meet the <span className="gold-text-gradient">Team</span></h2>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {team.map((m) => (
              <div key={m.name} className="bg-white rounded-2xl p-6 border border-[#E8D5A3] text-center hover:shadow-[var(--shadow-gold)] transition-shadow">
                <div className="w-20 h-20 mx-auto mb-4 rounded-full flex items-center justify-center text-2xl font-bold text-white font-[var(--font-playfair)]"
                  style={{ background: m.color }}>
                  {m.initials}
                </div>
                <h3 className="font-bold text-[#1A1800] text-base">{m.name}</h3>
                <p className="text-xs text-[#C9A227] font-semibold mt-1">{m.role}</p>
                <p className="text-xs text-[#6b6450] mt-1">{m.exp}</p>
                <div className="flex justify-center gap-3 mt-4">
                  <a href="tel:+919311059100" className="w-8 h-8 rounded-lg bg-[#C9A227]/10 flex items-center justify-center text-[#C9A227] hover:bg-[#C9A227] hover:text-white transition-all"><Phone size={13} /></a>
                  <a href="mailto:info@ssrealty.org" className="w-8 h-8 rounded-lg bg-[#C9A227]/10 flex items-center justify-center text-[#C9A227] hover:bg-[#C9A227] hover:text-white transition-all"><Mail size={13} /></a>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
