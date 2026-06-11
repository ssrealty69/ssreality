"use client";

import { useState, useEffect, useCallback, useRef } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { X, CheckCircle2, Loader2 } from 'lucide-react';
import dynamic from 'next/dynamic';
import toast from 'react-hot-toast';

const FarmHouseModal = dynamic(() => import('./FarmHouseModal'), { ssr: false });

const slides = [
  {
    img: '/Farm House/Farm House Image 1.webp',
    mobileImg: '/Farm House/Farm House Villa for sale in Delhi NCR, Farm House Villa for sale in Gwal Pahari, Image Mobile 1.webp',
    badge: 'Exclusive Launch',
    heading: 'Your Private Sanctuary',
    subheading: 'Nestled in the Aravalli Foothills',
    desc: 'Wake up to panoramic Aravalli Hills views from your own luxury farm house. Lush green acres, fresh mountain air, and total privacy — this is the life you deserve. A rare opportunity to own a legacy property just minutes from the city.',
    tag1: 'Aravalli View',
    tag2: 'Private Estate',
    tag3: '2 Acres+',
  },
  {
    img: '/Farm House/Farm House Image 2.webp',
    mobileImg: '/Farm House/Farm House Villa for sale in Delhi NCR, Farm House Villa for sale in Gwal Pahari, Image Mobile 2.webp',
    badge: 'Limited Availability',
    heading: 'Where Nature Meets Luxury',
    subheading: 'Premium Villas with Nature Trails',
    desc: 'Experience the finest blend of architecture and nature. Our villas are crafted with premium finishes and thoughtfully placed to capture sunrise views over the valley, with private gardens, infinity pools, and serene walking trails.',
    tag1: 'Valley Views',
    tag2: 'Infinity Pool',
    tag3: 'Nature Trails',
  },
  {
    img: '/Farm House/Farm House Image 3.webp',
    mobileImg: '/Farm House/Farm House Villa for sale in Delhi NCR, Farm House Villa for sale in Gwal Pahari, Image Mobile 3.webp',
    badge: 'Investment Pick',
    heading: 'A Life Beyond the Ordinary',
    subheading: 'Luxury Farm Houses Near Delhi NCR',
    desc: 'Just 45 minutes from Delhi, escape to your dream farm house surrounded by mango orchards, native trees, and breathtaking Aravalli landscapes. Perfect for weekend retreats, family getaways, or a permanent premium residence.',
    tag1: '45 Min from Delhi',
    tag2: 'Mango Orchard',
    tag3: 'Gated Community',
  },
  {
    img: '/Farm House/Farm House Image 4.webp',
    mobileImg: '/Farm House/Farm House Villa for sale in Delhi NCR, Farm House Villa for sale in Gwal Pahari, Image Mobile 4.webp',
    badge: 'Ready to Move',
    heading: 'Legacy Living, Reimagined',
    subheading: 'Freehold Land with Stunning Hill Vistas',
    desc: 'Own a piece of paradise with clear freehold titles and stunning hill vistas from every room. Our luxury villas feature grand architecture, premium interiors, and world-class amenities — delivering an unmatched lifestyle in harmony with nature.',
    tag1: 'Freehold Title',
    tag2: 'Hill Vista',
    tag3: 'Premium Interiors',
  },
];

export default function FarmHouseSection() {
  const [current, setCurrent] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Form states for the premium enquiry popup
  const [showModal, setShowModal] = useState(false);

  const goTo = useCallback((index: number) => {
    if (isTransitioning) return;
    setIsTransitioning(true);
    setTimeout(() => {
      setCurrent(index);
      setIsTransitioning(false);
    }, 350);
  }, [isTransitioning]);

  const next = useCallback(() => {
    goTo((current + 1) % slides.length);
  }, [current, goTo]);

  // Auto-slide every 5s (paused if hovered or if the enquiry form modal is open)
  useEffect(() => {
    if (isPaused || showModal) return;
    timerRef.current = setTimeout(next, 5000);
    return () => { if (timerRef.current) clearTimeout(timerRef.current); };
  }, [current, isPaused, showModal, next]);

  const slide = slides[current];

  return (
    <section className="relative overflow-hidden bg-[#0B0A06]">
      <style>{`
        @keyframes fh-fade-in {
          from { opacity: 0; transform: translateY(18px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes fh-scale-in {
          from { opacity: 0; transform: scale(1.04); }
          to { opacity: 1; transform: scale(1); }
        }
        @keyframes fh-shimmer {
          0%, 100% { opacity: 0.8; }
          50% { opacity: 1; }
        }
        @keyframes fh-pulse-glow {
          0%, 100% { opacity: 0.85; }
          50% { opacity: 1; }
        }
        @keyframes fh-badge-glow {
          0%, 100% { opacity: 0.8; }
          50% { opacity: 1; }
        }
        .fh-text-enter {
          animation: fh-fade-in 0.65s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
        .fh-img-enter {
          animation: fh-scale-in 0.65s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
        .fh-enquiry-btn {
          background: linear-gradient(135deg, #C9A227 0%, #E8C96A 40%, #C9A227 70%, #A67C1E 100%);
          animation: fh-pulse-glow 3s ease-in-out infinite;
          transition: transform 0.2s ease, letter-spacing 0.2s ease;
          will-change: transform, opacity;
        }
        .fh-enquiry-btn:hover {
          transform: scale(1.04) translateY(-2px);
          letter-spacing: 0.04em;
        }
        .fh-badge {
          animation: fh-badge-glow 2.5s ease-in-out infinite;
          will-change: opacity;
        }
        .fh-dot-active {
          background: linear-gradient(90deg, #C9A227, #E8C96A, #C9A227);
        }
        .fh-overlay-fog {
          background: linear-gradient(to left,
            rgba(11,10,6,0.92) 0%,
            rgba(11,10,6,0.75) 30%,
            rgba(11,10,6,0.30) 58%,
            transparent 75%
          );
        }
        .fh-overlay-fog-mobile {
          background: linear-gradient(to top,
            rgba(11,10,6,0.97) 0%,
            rgba(11,10,6,0.82) 38%,
            rgba(11,10,6,0.25) 68%,
            transparent 85%
          );
        }
      `}</style>

      {/* ───────────── MOBILE SLIDER (portrait images, < sm) ───────────── */}
      <div
        className="relative w-full sm:hidden"
        style={{ height: '680px' }}
        onMouseEnter={() => setIsPaused(true)}
        onMouseLeave={() => setIsPaused(false)}
      >
        {/* Mobile Portrait Background */}
        <div className={`absolute inset-0 ${isTransitioning ? 'opacity-0' : 'opacity-100'} transition-opacity duration-500`}>
          <div className="fh-img-enter absolute inset-0" key={`mob-img-${current}`}>
            <Image
              src={slide.mobileImg}
              alt={slide.heading}
              fill
              className="object-cover object-top"
              sizes="100vw"
              quality={80}
            />
          </div>
        </div>

        {/* Mobile gradient fog — bottom-to-top so text is readable */}
        <div className="fh-overlay-fog-mobile absolute inset-0 z-10" />

        {/* Grain texture */}
        <div className="absolute inset-0 z-10 opacity-[0.04]"
          style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg viewBox=\'0 0 256 256\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cfilter id=\'noise\'%3E%3CfeTurbulence type=\'fractalNoise\' baseFrequency=\'0.9\' numOctaves=\'4\' stitchTiles=\'stitch\'/%3E%3C/filter%3E%3Crect width=\'100%25\' height=\'100%25\' filter=\'url(%23noise)\' opacity=\'1\'/%3E%3C/svg%3E")' }} />

        {/* Mobile Content — bottom aligned, minimal for image visibility */}
        <div className="absolute inset-0 z-20 flex items-end px-5 pb-10">
          <div
            key={`mob-content-${current}`}
            className={`fh-text-enter w-full flex flex-col items-center text-center gap-2 ${isTransitioning ? 'opacity-0' : ''}`}
          >
            {/* Badge */}
            <div className="fh-badge inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full border border-[#C9A227]/60 bg-[#C9A227]/10 backdrop-blur-sm">
              <span className="w-1 h-1 rounded-full bg-[#C9A227] animate-pulse inline-block" />
              <span className="text-[#E8C96A] text-[9px] font-bold tracking-[0.2em] uppercase">{slide.badge}</span>
            </div>
            {/* Heading */}
            <h2 className="text-xl font-bold leading-snug bg-gradient-to-r from-[#FFE59E] via-[#E8C96A] to-[#C9A227] bg-clip-text text-transparent"
              style={{ fontFamily: 'var(--font-playfair, Georgia, serif)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', color: 'transparent', filter: 'drop-shadow(0 2px 8px rgba(0,0,0,0.95))' }}>
              {slide.heading}
            </h2>
            <p className="font-semibold text-xs tracking-wide bg-gradient-to-r from-[#FFE59E] to-[#E8C96A] bg-clip-text text-transparent"
              style={{ WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', color: 'transparent', filter: 'drop-shadow(0 1px 4px rgba(0,0,0,0.9))' }}>
              {slide.subheading}
            </p>
            {/* Decorative line — centered */}
            <div className="w-10 h-[1.5px] rounded-full mx-auto" style={{ background: 'linear-gradient(90deg, transparent, #C9A227, #E8C96A, transparent)' }} />
            {/* Short description — first sentence only */}
            <p className="text-white/70 text-[11px] leading-relaxed max-w-[260px]" style={{ textShadow: '0 1px 8px rgba(0,0,0,0.8)' }}>
              {slide.desc.split('.')[0]}.
            </p>
            {/* CTA — centered */}
            <button
              onClick={() => setShowModal(true)}
              className="fh-enquiry-btn inline-flex items-center gap-2 px-5 py-2.5 rounded-full text-[#0B0A06] font-black text-[11px] uppercase tracking-widest shadow-xl cursor-pointer"
            >
              <svg className="w-3 h-3 shrink-0" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
              Enquiry Now
              <svg className="w-3 h-3 shrink-0" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </button>
          </div>
        </div>

        {/* Mobile Dot Indicators — 44px touch area */}
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-30 flex items-center gap-0">
          {slides.map((_, i) => (
            <button
              key={i}
              onClick={() => goTo(i)}
              aria-label={`Go to slide ${i + 1}`}
              className="flex items-center justify-center w-[44px] h-[44px] rounded-full"
            >
              <span className={`block rounded-full transition-[width] duration-500 ${
                i === current ? 'w-7 h-2 bg-gradient-to-r from-[#C9A227] to-[#E8C96A]' : 'w-2 h-2 bg-white/30 hover:bg-white/60'
              }`} />
            </button>
          ))}
        </div>

        {/* Mobile Prev/Next */}
        <button onClick={() => goTo((current - 1 + slides.length) % slides.length)} aria-label="Previous slide"
          className="absolute left-3 top-1/2 -translate-y-1/2 z-30 w-9 h-9 rounded-full border border-white/20 bg-black/30 backdrop-blur-sm text-white/70 hover:text-[#C9A227] transition-all flex items-center justify-center">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" /></svg>
        </button>
        <button onClick={() => goTo((current + 1) % slides.length)} aria-label="Next slide"
          className="absolute right-3 top-1/2 -translate-y-1/2 z-30 w-9 h-9 rounded-full border border-white/20 bg-black/30 backdrop-blur-sm text-white/70 hover:text-[#C9A227] transition-all flex items-center justify-center">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" /></svg>
        </button>
      </div>

      {/* ───────────── DESKTOP / TABLET SLIDER (landscape images, sm+) ───────────── */}
      <div
        className="relative w-full hidden sm:block sm:h-[480px] md:h-[560px] lg:h-[620px]"
        onMouseEnter={() => setIsPaused(true)}
        onMouseLeave={() => setIsPaused(false)}
      >
        {/* Desktop Background Image */}
        <div className={`absolute inset-0 ${isTransitioning ? 'opacity-0' : 'opacity-100'} transition-opacity duration-500`}>
          <div className="fh-img-enter absolute inset-0" key={`desk-img-${current}`}>
            <Image
              src={slide.img}
              alt={slide.heading}
              fill
              className="object-cover object-center"
              sizes="100vw"
              quality={80}
            />
          </div>
        </div>

        {/* Desktop Fog Overlay */}
        <div className="fh-overlay-fog absolute inset-0 z-10" />

        {/* Grain texture */}
        <div className="absolute inset-0 z-10 opacity-[0.04]"
          style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg viewBox=\'0 0 256 256\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cfilter id=\'noise\'%3E%3CfeTurbulence type=\'fractalNoise\' baseFrequency=\'0.9\' numOctaves=\'4\' stitchTiles=\'stitch\'/%3E%3C/filter%3E%3Crect width=\'100%25\' height=\'100%25\' filter=\'url(%23noise)\' opacity=\'1\'/%3E%3C/svg%3E")' }} />

        {/* Desktop Content Panel — right side */}
        <div className="absolute inset-0 z-20 flex items-center justify-end px-14 lg:px-20">
          <div
            key={`desk-content-${current}`}
            className={`fh-text-enter w-[48%] lg:w-[42%] flex flex-col items-start gap-4 ${isTransitioning ? 'opacity-0' : ''}`}
          >
            {/* Badge */}
            <div className="fh-badge inline-flex items-center gap-2 px-3 py-1 rounded-full border border-[#C9A227]/60 bg-[#C9A227]/10 backdrop-blur-sm">
              <span className="w-1.5 h-1.5 rounded-full bg-[#C9A227] animate-pulse inline-block" />
              <span className="text-[#E8C96A] text-[10px] font-bold tracking-[0.22em] uppercase">{slide.badge}</span>
            </div>
            {/* Heading */}
            <div>
              <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold leading-tight mb-2 bg-gradient-to-r from-[#FFE59E] via-[#E8C96A] to-[#C9A227] bg-clip-text text-transparent"
                style={{ fontFamily: 'var(--font-playfair, Georgia, serif)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', color: 'transparent', filter: 'drop-shadow(0 2px 8px rgba(0,0,0,0.95))' }}>
                {slide.heading}
              </h2>
              <p className="font-semibold text-sm md:text-base tracking-wide bg-gradient-to-r from-[#FFE59E] to-[#E8C96A] bg-clip-text text-transparent"
                style={{ WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', color: 'transparent', filter: 'drop-shadow(0 1px 4px rgba(0,0,0,0.9))' }}>
                {slide.subheading}
              </p>
            </div>
            {/* Decorative line */}
            <div className="w-16 h-[2px] rounded-full" style={{ background: 'linear-gradient(90deg, #C9A227, #E8C96A, transparent)' }} />
            {/* Description */}
            <p className="text-white/75 text-xs md:text-sm leading-relaxed max-w-sm" style={{ textShadow: '0 1px 6px rgba(0,0,0,0.5)' }}>
              {slide.desc}
            </p>
            {/* Tags */}
            <div className="flex flex-wrap gap-2">
              {[slide.tag1, slide.tag2, slide.tag3].map((tag) => (
                <span key={tag} className="px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider text-white/80 border border-white/20 bg-white/5 backdrop-blur-sm">
                  {tag}
                </span>
              ))}
            </div>
            {/* CTA Button */}
            <button
              onClick={() => setShowModal(true)}
              className="fh-enquiry-btn mt-2 inline-flex items-center gap-3 px-7 py-3.5 rounded-full text-[#0B0A06] font-black text-sm md:text-base uppercase tracking-widest shadow-xl cursor-pointer"
            >
              <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
              Enquiry Now
              <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </button>
          </div>
        </div>

        {/* Desktop Dot Indicators — 44px touch area */}
        <div className="absolute bottom-5 left-1/2 -translate-x-1/2 z-30 flex items-center gap-0">
          {slides.map((_, i) => (
            <button
              key={i}
              onClick={() => goTo(i)}
              aria-label={`Go to slide ${i + 1}`}
              className="flex items-center justify-center w-[44px] h-[44px] rounded-full"
            >
              <span className={`block rounded-full transition-[width] duration-500 ${
                i === current ? 'w-8 h-2.5 bg-gradient-to-r from-[#C9A227] to-[#E8C96A]' : 'w-2.5 h-2.5 bg-white/30 hover:bg-white/60'
              }`} />
            </button>
          ))}
        </div>

        {/* Desktop Prev/Next */}
        <button onClick={() => goTo((current - 1 + slides.length) % slides.length)} aria-label="Previous slide"
          className="absolute left-4 top-1/2 -translate-y-1/2 z-30 w-10 h-10 rounded-full border border-white/20 bg-black/30 backdrop-blur-sm text-white/70 hover:text-[#C9A227] hover:border-[#C9A227]/60 hover:bg-black/50 transition-all duration-300 flex items-center justify-center">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" /></svg>
        </button>
        <button onClick={() => goTo((current + 1) % slides.length)} aria-label="Next slide"
          className="absolute right-4 top-1/2 -translate-y-1/2 z-30 w-10 h-10 rounded-full border border-white/20 bg-black/30 backdrop-blur-sm text-white/70 hover:text-[#C9A227] hover:border-[#C9A227]/60 hover:bg-black/50 transition-all duration-300 flex items-center justify-center">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" /></svg>
        </button>
      </div>

      {/* Bottom strip — section label */}
      <div className="relative z-20 flex items-center justify-center gap-6 px-6 py-3 bg-[#0B0A06] border-t border-[#C9A227]/15">
        <div className="h-px flex-1 bg-gradient-to-r from-transparent to-[#C9A227]/30" />
        <div className="flex items-center gap-2 shrink-0">
          <svg className="w-3.5 h-3.5 text-[#C9A227]" fill="currentColor" viewBox="0 0 20 20">
            <path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z" />
          </svg>
          <span className="text-[#C9A227]/80 text-[10px] font-bold tracking-[0.3em] uppercase">Luxury Farm House &amp; Villa Collection</span>
        </div>
        <div className="h-px flex-1 bg-gradient-to-l from-transparent to-[#C9A227]/30" />
      </div>

      {/* Dynamic Pop-up Form Modal */}
      {showModal && <FarmHouseModal onClose={() => setShowModal(false)} />}
    </section>
  );
}
