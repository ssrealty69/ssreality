import { Star, Quote } from 'lucide-react';

const testimonials = [
  {
    name: 'Rajesh Sharma',
    role: 'Software Engineer, Gurugram',
    content: 'SS Realty helped me find my dream apartment in Baner within 2 weeks! Their team was professional, transparent, and guided me through every step of the process.',
    rating: 5,
    image: 'RS',
    property: 'Purchased 3BHK in Baner',
  },
  {
    name: 'Priya Mehta',
    role: 'Business Owner, Delhi',
    content: 'Excellent service! I was looking for a commercial space in Gurugram and SS Realty found me the perfect office in Hinjewadi. The legal documentation was smooth and hassle-free.',
    rating: 5,
    image: 'PM',
    property: 'Commercial Office in Hinjewadi',
  },
  {
    name: 'Amit & Sunita Patel',
    role: 'NRI Clients, USA',
    content: 'As NRIs, we were worried about the property buying process in India. SS Realty made it seamless — from virtual tours to final registration. Absolutely trustworthy!',
    rating: 5,
    image: 'AP',
    property: 'Villa in Lonavala',
  },
  {
    name: 'Sneha Kulkarni',
    role: 'Doctor, Nashik',
    content: 'I invested in a plot through SS Realty and the returns have been amazing. Their investment advisory team is knowledgeable and the advice was spot-on.',
    rating: 5,
    image: 'SK',
    property: 'Residential Plot in Nashik',
  },
];

function Avatar({ initials, color }: { initials: string; color: string }) {
  return (
    <div className={`w-12 h-12 rounded-full flex items-center justify-center text-white font-bold text-sm shrink-0`}
      style={{ background: color }}
    >
      {initials}
    </div>
  );
}

const colors = ['#C9A227', '#B8860B', '#9a6f08', '#C9A227'];

export default function TestimonialsSection() {
  return (
    <section className="section-padding bg-[#FFFBEB]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-14">
          <div className="gold-divider mx-auto mb-5" />
          <h2 className="text-4xl md:text-5xl font-[var(--font-playfair)] text-[#1A1800]">
            What Our <span className="gold-text-gradient">Clients Say</span>
          </h2>
          <p className="text-[#6b6450] mt-4 max-w-xl mx-auto">
            Real stories from real clients who trusted SS Realty with their property journey.
          </p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {testimonials.map((t, i) => (
            <div key={t.name} className="bg-white rounded-2xl p-6 border border-[#E8D5A3]/60 shadow-[0_2px_16px_rgba(26,24,0,0.05)] hover:shadow-[var(--shadow-gold)] transition-shadow">
              {/* Quote icon */}
              <Quote size={28} className="text-[#C9A227]/30 mb-4" />

              {/* Stars */}
              <div className="flex gap-1 mb-4">
                {Array.from({ length: t.rating }).map((_, j) => (
                  <Star key={j} size={14} fill="#C9A227" className="text-[#C9A227]" />
                ))}
              </div>

              <p className="text-sm text-[#504e40] leading-relaxed mb-5 italic">&quot;{t.content}&quot;</p>

              {/* Property tag */}
              <div className="badge-gold mb-5 text-[10px]">{t.property}</div>

              {/* Author */}
              <div className="flex items-center gap-3">
                <Avatar initials={t.image} color={colors[i % colors.length]} />
                <div>
                  <p className="font-semibold text-[#1A1800] text-sm">{t.name}</p>
                  <p className="text-xs text-[#6b6450]">{t.role}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
