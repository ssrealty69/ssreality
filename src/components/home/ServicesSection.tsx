import { Building2, Key, FileText, TrendingUp, Handshake, Search } from 'lucide-react';

const services = [
  {
    icon: Search,
    title: 'Property Search',
    description: 'Advanced search tools to find exactly what you\'re looking for — filtered by location, budget, and type.',
    highlight: false,
  },
  {
    icon: Key,
    title: 'Buy & Sell',
    description: 'Expert guidance for buying and selling residential & commercial properties at the best market price.',
    highlight: true,
  },
  {
    icon: Building2,
    title: 'Rental Services',
    description: 'Find verified rental properties or list your property for rent with our professional management services.',
    highlight: false,
  },
  {
    icon: FileText,
    title: 'Legal & Documentation',
    description: 'Complete assistance with property registration, stamp duty, RERA documentation, and legal due diligence.',
    highlight: false,
  },
  {
    icon: TrendingUp,
    title: 'Investment Advisory',
    description: 'Data-driven insights to help you make smart real estate investments with maximum ROI.',
    highlight: true,
  },
  {
    icon: Handshake,
    title: 'NRI Services',
    description: 'Specialized services for NRIs looking to buy, sell, or manage property in India with full legal support.',
    highlight: false,
  },
];

export default function ServicesSection() {
  return (
    <section className="section-padding bg-[#FFFEF5]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-14">
          <div className="gold-divider mx-auto mb-5" />
          <h2 className="text-4xl md:text-5xl font-[var(--font-playfair)] text-[#1A1800]">
            Our <span className="gold-text-gradient">Services</span>
          </h2>
          <p className="text-[#6b6450] mt-4 max-w-2xl mx-auto">
            From property search to closing deals — SS Realty offers comprehensive real estate services tailored to your needs.
          </p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {services.map(({ icon: Icon, title, description, highlight }) => (
            <div
              key={title}
              className={`group rounded-2xl p-7 transition-all duration-300 cursor-default ${
                highlight
                  ? 'gold-gradient shadow-[var(--shadow-gold)]'
                  : 'bg-white border border-[#E8D5A3]/60 hover:border-[#C9A227]/40 hover:shadow-[var(--shadow-gold)]'
              }`}
            >
              <div className={`w-13 h-13 rounded-xl flex items-center justify-center mb-5 transition-transform group-hover:scale-110 ${
                highlight ? 'bg-white/30' : 'bg-[#C9A227]/10 group-hover:bg-[#C9A227]/20'
              }`}
                style={{ width: '3.25rem', height: '3.25rem' }}
              >
                <Icon size={24} className={highlight ? 'text-[#1A1800]' : 'text-[#C9A227]'} />
              </div>
              <h3 className={`font-semibold text-lg mb-2 ${highlight ? 'text-[#1A1800]' : 'text-[#1A1800]'}`}>
                {title}
              </h3>
              <p className={`text-sm leading-relaxed ${highlight ? 'text-[#5c4004]' : 'text-[#6b6450]'}`}>
                {description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
