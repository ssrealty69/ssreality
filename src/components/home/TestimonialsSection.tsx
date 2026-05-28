'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { Star, Quote } from 'lucide-react';

const testimonials = [
  {
    name: 'Vikram Singh',
    role: 'Govt. Employee, Noida',
    content: 'SS Realty ne mujhe Noida Sector 62 mein ek bahut achha 2BHK flat dilaya. Price bilkul budget mein tha aur registration process bhi smooth rahi. Team ne har step par guide kiya.',
    rating: 5,
    initials: 'VS',
    property: 'Purchased 2BHK Flat — Noida Sector 62',
  },
  {
    name: 'Priya Agarwal',
    role: 'Teacher, Ghaziabad',
    content: 'Maine SS Realty se Vasundhara, Ghaziabad mein 3BHK flat liya. Inki team ne society ke baare mein puri details di aur loan process mein bhi help ki. Bahut trustworthy hain.',
    rating: 5,
    initials: 'PA',
    property: 'Purchased 3BHK Flat — Vasundhara, Ghaziabad',
  },
  {
    name: 'Ramesh Yadav',
    role: 'Farmer, Greater Noida',
    content: 'Greater Noida West mein ek residential plot lena tha. SS Realty ne registry se lekar patwari tak sab kuch handle kiya. Koi bhi tension nahi hua. Bohot acchi service hai.',
    rating: 5,
    initials: 'RY',
    property: 'Purchased Residential Land — Greater Noida West',
  },
  {
    name: 'Suresh Gupta',
    role: 'Shop Owner, Delhi',
    content: 'Rohini mein commercial shop ke liye SS Realty se contact kiya. Unhone location, footfall aur ROI sab samjhaya. Meri dukan 3 mahine mein hi profitable ho gayi. Shukriya team!',
    rating: 5,
    initials: 'SG',
    property: 'Purchased Commercial Shop — Rohini, Delhi',
  },
  {
    name: 'Anita Sharma',
    role: 'Housewife, Gurugram',
    content: 'Gurugram ke Sohna Road par villa leni thi family ke liye. SS Realty ne 3-4 options dikhaye aur har ek ki pros-cons batayi. Hum bahut khush hain apni villa se. Highly recommend!',
    rating: 5,
    initials: 'AS',
    property: 'Purchased Villa — Sohna Road, Gurugram',
  },
  {
    name: 'Deepak Tyagi',
    role: 'Business Owner, Faridabad',
    content: 'Faridabad ke paas Aravalli mein ek farmhouse lena tha weekend retreat ke liye. SS Realty ne legal verification se lekar registry tak sab kuch theek se kiya. Ekdum mast experience raha.',
    rating: 5,
    initials: 'DT',
    property: 'Purchased Farmhouse — Aravalli, Faridabad',
  },
];

function Avatar({ initials, color }: { initials: string; color: string }) {
  return (
    <div
      className="w-12 h-12 rounded-full flex items-center justify-center text-white font-bold text-sm shrink-0"
      style={{ background: color }}
    >
      {initials}
    </div>
  );
}

const colors = ['#C9A227', '#B8860B', '#9a6f08', '#C9A227', '#B8860B', '#9a6f08'];

function TestimonialCard({ t, i }: { t: typeof testimonials[0]; i: number }) {
  return (
    <div className="bg-white rounded-2xl p-6 border border-[#E8D5A3]/60 shadow-[0_2px_16px_rgba(26,24,0,0.05)] hover:shadow-[var(--shadow-gold)] transition-shadow h-full flex flex-col">
      {/* Quote icon */}
      <Quote size={28} className="text-[#C9A227]/30 mb-4" />

      {/* Stars */}
      <div className="flex gap-1 mb-4">
        {Array.from({ length: t.rating }).map((_, j) => (
          <Star key={j} size={14} fill="#C9A227" className="text-[#C9A227]" />
        ))}
      </div>

      <p className="text-sm text-[#504e40] leading-relaxed mb-5 italic flex-1">&quot;{t.content}&quot;</p>

      {/* Property tag */}
      <div className="badge-gold mb-5 text-[10px]">{t.property}</div>

      {/* Author */}
      <div className="flex items-center gap-3">
        <Avatar initials={t.initials} color={colors[i % colors.length]} />
        <div>
          <p className="font-semibold text-[#1A1800] text-sm">{t.name}</p>
          <p className="text-xs text-[#6b6450]">{t.role}</p>
        </div>
      </div>
    </div>
  );
}

/** Mobile-only swipeable carousel with auto-play */
function MobileCarousel() {
  const [active, setActive] = useState(0);
  const total = testimonials.length;

  const touchStartX = useRef<number | null>(null);
  const touchDelta = useRef(0);
  const autoRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const isPaused = useRef(false);

  const goNext = useCallback(() => {
    setActive((prev) => (prev + 1) % total);
  }, [total]);

  const goPrev = useCallback(() => {
    setActive((prev) => (prev - 1 + total) % total);
  }, [total]);

  const startAuto = useCallback(() => {
    if (autoRef.current) clearInterval(autoRef.current);
    autoRef.current = setInterval(() => {
      if (!isPaused.current) goNext();
    }, 3500);
  }, [goNext]);

  useEffect(() => {
    startAuto();
    return () => {
      if (autoRef.current) clearInterval(autoRef.current);
    };
  }, [startAuto]);

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
    touchDelta.current = 0;
    isPaused.current = true;
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (touchStartX.current === null) return;
    touchDelta.current = e.touches[0].clientX - touchStartX.current;
  };

  const handleTouchEnd = () => {
    const threshold = 40;
    if (touchDelta.current < -threshold) goNext();
    else if (touchDelta.current > threshold) goPrev();
    touchStartX.current = null;
    touchDelta.current = 0;
    isPaused.current = false;
    startAuto();
  };

  return (
    <div className="relative overflow-hidden">
      <div
        className="flex transition-transform duration-500 ease-in-out"
        style={{ transform: `translateX(-${active * 100}%)` }}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        {testimonials.map((t, i) => (
          <div key={t.name} className="min-w-full px-1" style={{ userSelect: 'none' }}>
            <TestimonialCard t={t} i={i} />
          </div>
        ))}
      </div>

      {/* Dot indicators */}
      <div className="flex justify-center gap-2 mt-5">
        {testimonials.map((_, i) => (
          <button
            key={i}
            aria-label={`Go to testimonial ${i + 1}`}
            onClick={() => {
              setActive(i);
              isPaused.current = false;
              startAuto();
            }}
            className={`rounded-full transition-all duration-300 ${
              i === active ? 'w-6 h-2 bg-[#C9A227]' : 'w-2 h-2 bg-[#C9A227]/30'
            }`}
          />
        ))}
      </div>
    </div>
  );
}

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

        {/* Mobile: swipeable carousel (hidden on sm+) */}
        <div className="sm:hidden">
          <MobileCarousel />
        </div>

        {/* Tablet / Desktop: grid (hidden on mobile) */}
        <div className="hidden sm:grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {testimonials.map((t, i) => (
            <TestimonialCard key={t.name} t={t} i={i} />
          ))}
        </div>
      </div>
    </section>
  );
}
