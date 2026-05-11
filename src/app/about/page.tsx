import type { Metadata } from 'next';
import { Target, Eye, Heart, Users, Award, CheckCircle2, Phone, Mail } from 'lucide-react';

export const metadata: Metadata = {
  title: 'About Us | SS Realty',
  description: 'Learn about SS Realty — Delhi NCR\'s trusted real estate partner with 15+ years of experience helping families find their dream homes.',
};

// SSG — fully static
export const dynamic = 'force-static';

const team = [
  { name: 'Suresh Sharma', role: 'Founder & CEO', initials: 'SS', color: '#C9A227', exp: '20+ years experience' },
  { name: 'Sneha Patil', role: 'Head of Sales', initials: 'SP', color: '#B8860B', exp: 'Residential expert' },
  { name: 'Rahul Mehta', role: 'Commercial Lead', initials: 'RM', color: '#9a6f08', exp: 'Commercial specialist' },
  { name: 'Priya Desai', role: 'Legal Advisor', initials: 'PD', color: '#C9A227', exp: 'Property law expert' },
];

const values = [
  { icon: Eye, title: 'Transparency', desc: 'We believe in honest, clear communication — no hidden charges, no misleading listings.' },
  { icon: Heart, title: 'Client First', desc: 'Your needs come first. We listen, understand, and find the perfect property for you.' },
  { icon: Award, title: 'Excellence', desc: 'Premium service quality at every step — from search to documentation to handover.' },
  { icon: CheckCircle2, title: 'Integrity', desc: 'All our listings are verified, all our advice is unbiased, and our deals are transparent.' },
];

const milestones = [
  { year: '2008', event: 'SS Realty founded in Gurugram with a vision for transparent real estate.' },
  { year: '2012', event: 'Expanded to 5 cities across Delhi NCR with 100+ listings.' },
  { year: '2016', event: 'Achieved ₹100 Cr in property transactions. Opened Noida regional office.' },
  { year: '2020', event: 'Launched digital platform serving NRI clients across the globe.' },
  { year: '2024', event: '500+ properties, 2000+ happy clients, 10 cities across Delhi NCR.' },
];

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-[#FFFEF5]">
      {/* Hero */}
      <div className="relative pt-36 pb-20 overflow-hidden">
        <div className="absolute inset-0 bg-cover bg-center bg-no-repeat" style={{ backgroundImage: "url('https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1920&q=80')" }} />
        <div className="absolute inset-0 bg-gradient-to-r from-[#1A1800]/90 via-[#1A1800]/85 to-[#1A1800]/75" />
        <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-[#FFFEF5] to-transparent" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="gold-divider mb-5" />
          <h1 className="text-4xl md:text-6xl font-[var(--font-playfair)] text-white mb-4">
            About <span className="text-[#C9A227]">SS Realty</span>
          </h1>
          <p className="text-[#d4c490] text-lg max-w-2xl">
            15+ years of trust, transparency, and transforming property dreams into reality across Delhi NCR.
          </p>
        </div>
      </div>

      {/* Mission/Vision */}
      <section className="section-padding">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 gap-10 items-center">
            <div>
              <div className="gold-divider mb-5" />
              <h2 className="text-4xl font-[var(--font-playfair)] text-[#1A1800] mb-5">Our Story</h2>
              <p className="text-[#504e40] leading-relaxed mb-4">
                Founded in 2008, SS Realty started with a simple mission — make real estate in Delhi NCR simple, transparent, and accessible to everyone. What began as a small office in Gurugram has grown into one of Delhi NCR&apos;s most trusted real estate brands.
              </p>
              <p className="text-[#504e40] leading-relaxed mb-6">
                We&apos;ve helped over 2,000 families find their dream homes, guided investors to high-ROI properties, and assisted NRIs in managing their Indian real estate portfolios — all with integrity and excellence.
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
            <div className="relative rounded-3xl overflow-hidden shadow-[var(--shadow-hover)] h-96">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="https://images.unsplash.com/photo-1497366216548-37526070297c?w=700&q=80" alt="SS Realty office" className="w-full h-full object-cover" />
              <div className="absolute bottom-5 left-5">
                <div className="glass-card rounded-xl p-4">
                  <p className="text-xs text-[#6b6450]">Established</p>
                  <p className="text-2xl font-bold font-[var(--font-playfair)] text-[#1A1800]">2008</p>
                  <p className="text-xs text-[#C9A227] font-semibold">Chhatarpur, New Delhi</p>
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

      {/* Timeline */}
      <section className="section-padding bg-[#1A1800]">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <div className="gold-divider mx-auto mb-5" />
            <h2 className="text-4xl font-[var(--font-playfair)] text-white">Our <span className="text-[#C9A227]">Journey</span></h2>
          </div>
          <div className="relative">
            <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-[#C9A227]/30" />
            <div className="space-y-8">
              {milestones.map(({ year, event }) => (
                <div key={year} className="relative pl-16">
                  <div className="absolute left-3.5 top-1 w-5 h-5 rounded-full bg-[#C9A227] border-4 border-[#1A1800] shadow-[0_0_0_2px_#C9A227]" />
                  <span className="badge-gold text-[10px] mb-2 inline-block">{year}</span>
                  <p className="text-[#a09060] text-sm leading-relaxed">{event}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

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
                  <a href="mailto:info@ssrealty.in" className="w-8 h-8 rounded-lg bg-[#C9A227]/10 flex items-center justify-center text-[#C9A227] hover:bg-[#C9A227] hover:text-white transition-all"><Mail size={13} /></a>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
