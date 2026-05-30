import { TrendingUp, Users, Home, Award, Clock, Handshake } from 'lucide-react';

const stats = [
  { icon: Home, value: '500+', label: 'Properties Listed', color: '#C9A227' },
  { icon: Users, value: '2000+', label: 'Happy Clients', color: '#B8860B' },
  { icon: TrendingUp, value: '₹500Cr+', label: 'Property Sold', color: '#C9A227' },
  { icon: Award, value: '15+', label: 'Years Experience', color: '#B8860B' },
  { icon: Clock, value: '48hrs', label: 'Avg Closing Time', color: '#C9A227' },
  { icon: Handshake, value: '98%', label: 'Client Satisfaction', color: '#B8860B' },
];

export default function StatsSection() {
  return (
    <section className="section-padding bg-[#1A1800] relative overflow-hidden">
      {/* Gold glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[200px] bg-[#C9A227]/10 blur-[80px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
        <div className="text-center mb-14">
          <div className="gold-divider mx-auto mb-5" />
          <h2 className="text-4xl font-[var(--font-playfair)]">
            <span className="text-white">Our</span> <span className="text-[#C9A227]">Numbers</span> <span className="text-white">Speak</span>
          </h2>
          <p className="text-[#a09060] mt-3 max-w-xl mx-auto text-sm">
            Trusted by thousands of families and investors across Delhi NCR for over 15 years.
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
          {stats.map(({ icon: Icon, value, label, color }) => (
            <div key={label} className="text-center group">
              <div
                className="w-14 h-14 mx-auto mb-4 rounded-2xl flex items-center justify-center transition-transform group-hover:scale-110"
                style={{ background: `${color}18`, border: `1px solid ${color}30` }}
              >
                <Icon size={24} style={{ color }} />
              </div>
              <div className="text-3xl font-bold font-[var(--font-playfair)]" style={{ color }}>
                {value}
              </div>
              <div className="text-xs text-[#a09060] mt-1 font-medium">{label}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
