"use client";

import { useState, useEffect, useCallback, useRef } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { X, CheckCircle2, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';

const slides = [
  {
    img: '/Farm House/Farm House Image 1.png',
    mobileImg: '/Farm House/Farm House Villa for sale in Delhi NCR, Farm House Villa for sale in Gwal Pahari, Image Mobile 1.png',
    badge: 'Exclusive Launch',
    heading: 'Your Private Sanctuary',
    subheading: 'Nestled in the Aravalli Foothills',
    desc: 'Wake up to panoramic Aravalli Hills views from your own luxury farm house. Lush green acres, fresh mountain air, and total privacy — this is the life you deserve. A rare opportunity to own a legacy property just minutes from the city.',
    tag1: 'Aravalli View',
    tag2: 'Private Estate',
    tag3: '2 Acres+',
  },
  {
    img: '/Farm House/Farm House Image 2.png',
    mobileImg: '/Farm House/Farm House Villa for sale in Delhi NCR, Farm House Villa for sale in Gwal Pahari, Image Mobile 2.png',
    badge: 'Limited Availability',
    heading: 'Where Nature Meets Luxury',
    subheading: 'Premium Villas with Nature Trails',
    desc: 'Experience the finest blend of architecture and nature. Our villas are crafted with premium finishes and thoughtfully placed to capture sunrise views over the valley, with private gardens, infinity pools, and serene walking trails.',
    tag1: 'Valley Views',
    tag2: 'Infinity Pool',
    tag3: 'Nature Trails',
  },
  {
    img: '/Farm House/Farm House Image 3.png',
    mobileImg: '/Farm House/Farm House Villa for sale in Delhi NCR, Farm House Villa for sale in Gwal Pahari, Image Mobile 3.png',
    badge: 'Investment Pick',
    heading: 'A Life Beyond the Ordinary',
    subheading: 'Luxury Farm Houses Near Delhi NCR',
    desc: 'Just 45 minutes from Delhi, escape to your dream farm house surrounded by mango orchards, native trees, and breathtaking Aravalli landscapes. Perfect for weekend retreats, family getaways, or a permanent premium residence.',
    tag1: '45 Min from Delhi',
    tag2: 'Mango Orchard',
    tag3: 'Gated Community',
  },
  {
    img: '/Farm House/Farm House Image 4.png',
    mobileImg: '/Farm House/Farm House Villa for sale in Delhi NCR, Farm House Villa for sale in Gwal Pahari, Image Mobile 4.png',
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
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [requirement, setRequirement] = useState('');
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handlePhoneChange = (val: string) => {
    // Keep numbers only, max 10 digits
    const cleaned = val.replace(/\D/g, '').slice(0, 10);
    setPhone(cleaned);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (phone.length !== 10) {
      toast.error('Please enter a valid 10-digit mobile number');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch('/api/property-enquiry', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: name.trim(),
          phone: phone,
          requirement: requirement.trim(),
          propertyId: 'luxury-farm-houses',
          propertyTitle: 'Luxury Farm House & Villa Collection',
          propertyUrl: typeof window !== 'undefined' ? window.location.origin + window.location.pathname + '#farm-house-villa' : '/#farm-house-villa',
        }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setSubmitted(true);
        toast.success('Your requirement has been submitted successfully!');
        setTimeout(() => {
          setShowModal(false);
          setSubmitted(false);
          setName('');
          setPhone('');
          setRequirement('');
        }, 2500);
      } else {
        toast.error(data.error || 'Failed to submit enquiry');
      }
    } catch (err) {
      console.error(err);
      toast.error('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

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
          0%, 100% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
        }
        @keyframes fh-pulse-glow {
          0%, 100% { box-shadow: 0 0 20px rgba(201,162,39,0.3), 0 0 40px rgba(201,162,39,0.1); }
          50% { box-shadow: 0 0 35px rgba(201,162,39,0.5), 0 0 70px rgba(201,162,39,0.2); }
        }
        @keyframes fh-badge-glow {
          0%, 100% { box-shadow: 0 0 8px rgba(201,162,39,0.4); }
          50% { box-shadow: 0 0 20px rgba(201,162,39,0.7); }
        }
        .fh-text-enter {
          animation: fh-fade-in 0.65s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
        .fh-img-enter {
          animation: fh-scale-in 0.65s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
        .fh-enquiry-btn {
          background: linear-gradient(135deg, #C9A227 0%, #E8C96A 40%, #C9A227 70%, #A67C1E 100%);
          background-size: 200% 200%;
          animation: fh-shimmer 3s ease infinite, fh-pulse-glow 3s ease-in-out infinite;
          transition: transform 0.2s ease, letter-spacing 0.2s ease;
        }
        .fh-enquiry-btn:hover {
          transform: scale(1.04) translateY(-2px);
          letter-spacing: 0.04em;
        }
        .fh-badge {
          animation: fh-badge-glow 2.5s ease-in-out infinite;
        }
        .fh-dot-active {
          background: linear-gradient(90deg, #C9A227, #E8C96A, #C9A227);
          background-size: 200% 100%;
          animation: fh-shimmer 2s linear infinite;
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
        style={{ height: '580px' }}
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
              priority
              unoptimized
            />
          </div>
        </div>

        {/* Mobile gradient fog — bottom-to-top so text is readable */}
        <div className="fh-overlay-fog-mobile absolute inset-0 z-10" />

        {/* Grain texture */}
        <div className="absolute inset-0 z-10 opacity-[0.04]"
          style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg viewBox=\'0 0 256 256\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cfilter id=\'noise\'%3E%3CfeTurbulence type=\'fractalNoise\' baseFrequency=\'0.9\' numOctaves=\'4\' stitchTiles=\'stitch\'/%3E%3C/filter%3E%3Crect width=\'100%25\' height=\'100%25\' filter=\'url(%23noise)\' opacity=\'1\'/%3E%3C/svg%3E")' }} />

        {/* Mobile Content — bottom aligned */}
        <div className="absolute inset-0 z-20 flex items-end px-5 pb-12">
          <div
            key={`mob-content-${current}`}
            className={`fh-text-enter w-full flex flex-col items-start gap-3 ${isTransitioning ? 'opacity-0' : ''}`}
          >
            {/* Badge */}
            <div className="fh-badge inline-flex items-center gap-2 px-3 py-1 rounded-full border border-[#C9A227]/60 bg-[#C9A227]/10 backdrop-blur-sm">
              <span className="w-1.5 h-1.5 rounded-full bg-[#C9A227] animate-pulse inline-block" />
              <span className="text-[#E8C96A] text-[10px] font-bold tracking-[0.22em] uppercase">{slide.badge}</span>
            </div>
            {/* Heading */}
            <h2 className="text-2xl font-bold leading-tight bg-gradient-to-r from-[#FFE59E] via-[#E8C96A] to-[#C9A227] bg-clip-text text-transparent"
              style={{ fontFamily: 'var(--font-playfair, Georgia, serif)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', color: 'transparent', filter: 'drop-shadow(0 2px 8px rgba(0,0,0,0.95))' }}>
              {slide.heading}
            </h2>
            <p className="font-semibold text-sm tracking-wide bg-gradient-to-r from-[#FFE59E] to-[#E8C96A] bg-clip-text text-transparent"
              style={{ WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', color: 'transparent', filter: 'drop-shadow(0 1px 4px rgba(0,0,0,0.9))' }}>
              {slide.subheading}
            </p>
            {/* Decorative line */}
            <div className="w-14 h-[2px] rounded-full" style={{ background: 'linear-gradient(90deg, #C9A227, #E8C96A, transparent)' }} />
            {/* Description */}
            <p className="text-white/75 text-xs leading-relaxed" style={{ textShadow: '0 1px 6px rgba(0,0,0,0.5)' }}>
              {slide.desc}
            </p>
            {/* Tags */}
            <div className="flex flex-wrap gap-2">
              {[slide.tag1, slide.tag2, slide.tag3].map((tag) => (
                <span key={tag} className="px-2.5 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider text-white/80 border border-white/20 bg-white/5 backdrop-blur-sm">
                  {tag}
                </span>
              ))}
            </div>
            {/* CTA */}
            <button
              onClick={() => setShowModal(true)}
              className="fh-enquiry-btn mt-1 inline-flex items-center gap-2 px-5 py-3 rounded-full text-[#0B0A06] font-black text-xs uppercase tracking-widest shadow-xl cursor-pointer"
            >
              <svg className="w-3.5 h-3.5 shrink-0" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
              Enquiry Now
              <svg className="w-3.5 h-3.5 shrink-0" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </button>
          </div>
        </div>

        {/* Mobile Dot Indicators */}
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-30 flex items-center gap-3">
          {slides.map((_, i) => (
            <button
              key={i}
              onClick={() => goTo(i)}
              aria-label={`Go to slide ${i + 1}`}
              className={`rounded-full transition-all duration-500 ${
                i === current ? 'fh-dot-active w-7 h-2' : 'w-2 h-2 bg-white/30 hover:bg-white/60'
              }`}
            />
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
              priority
              unoptimized
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

        {/* Desktop Dot Indicators */}
        <div className="absolute bottom-5 left-1/2 -translate-x-1/2 z-30 flex items-center gap-3">
          {slides.map((_, i) => (
            <button
              key={i}
              onClick={() => goTo(i)}
              aria-label={`Go to slide ${i + 1}`}
              className={`rounded-full transition-all duration-500 ${
                i === current ? 'fh-dot-active w-8 h-2.5' : 'w-2.5 h-2.5 bg-white/30 hover:bg-white/60'
              }`}
            />
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
      <AnimatePresence>
        {showModal && (
          <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
            {/* Dark blur overlay */}
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => { if (!loading) setShowModal(false); }}
              className="fixed inset-0 bg-[#0B0A06]/80 backdrop-blur-md"
            />
            
            {/* Modal Container */}
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ type: "spring", duration: 0.5 }}
              className="relative w-full max-w-md bg-[#0B0A06] rounded-3xl shadow-[0_25px_60px_rgba(0,0,0,0.85)] overflow-hidden border border-[#C9A227]/30 z-10"
            >
              {/* Image Header: Always the first image of the farm house */}
              <div className="relative h-48 w-full overflow-hidden">
                <Image 
                  src="/Farm House/Farm House Image 1.png" 
                  alt="Luxury Farm House Collection" 
                  fill
                  className="object-cover"
                  priority
                  unoptimized
                />
                {/* Dark gradient overlay on image */}
                <div className="absolute inset-0 bg-gradient-to-t from-[#0B0A06] via-[#0B0A06]/40 to-transparent" />
                
                {/* Golden horizontal line under image */}
                <div className="absolute bottom-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-[#C9A227]/50 to-transparent" />

                {/* Title overlaid on image bottom-left */}
                <div className="absolute bottom-4 left-6 right-6">
                  <span className="text-[10px] font-black text-[#E8C96A] uppercase tracking-[0.25em] block mb-1">Exclusive Enquiry</span>
                  <h3 className="text-xl font-bold text-white leading-tight font-heading bg-gradient-to-r from-[#FFE59E] via-[#E8C96A] to-[#C9A227] bg-clip-text text-transparent"
                    style={{ WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', fontFamily: 'var(--font-playfair, Georgia, serif)' }}>
                    Luxury Farm Houses &amp; Villas
                  </h3>
                </div>
                {/* Close button inside image top-right */}
                <button 
                  onClick={() => setShowModal(false)}
                  disabled={loading}
                  className="absolute top-4 right-4 z-30 w-8 h-8 rounded-full bg-black/60 backdrop-blur-md text-white/70 hover:text-[#E8C96A] transition-colors flex items-center justify-center cursor-pointer border border-white/10"
                >
                  <X size={16} />
                </button>
              </div>

              {/* Form Content body */}
              <div className="p-6 sm:p-7">
                {submitted ? (
                  <div className="py-8 text-center animate-in fade-in zoom-in duration-300">
                    <div className="w-14 h-14 bg-[#C9A227]/10 rounded-full flex items-center justify-center mx-auto mb-4 border border-[#C9A227]/40 shadow-[0_0_15px_rgba(201,162,39,0.2)]">
                      <CheckCircle2 className="text-[#E8C96A] stroke-[2.5]" size={28} />
                    </div>
                    <h4 className="text-base font-extrabold text-[#E8C96A] uppercase tracking-wider">Enquiry Submitted!</h4>
                    <p className="text-xs text-white/60 mt-2 font-medium">Our property advisor will get in touch with you shortly.</p>
                  </div>
                ) : (
                  <form onSubmit={handleSubmit} className="space-y-4">
                    {/* Full Name */}
                    <div className="space-y-1.5">
                      <label className="text-[9px] font-black text-[#E8C96A] uppercase tracking-widest ml-1">Full Name</label>
                      <input 
                        type="text" 
                        placeholder="Your full name"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl focus:border-[#C9A227]/80 text-xs font-semibold text-white outline-none transition-all placeholder:text-white/30 hover:bg-white/[0.08]"
                        required 
                        disabled={loading}
                      />
                    </div>

                    {/* Phone Number */}
                    <div className="space-y-1.5">
                      <label className="text-[9px] font-black text-[#E8C96A] uppercase tracking-widest ml-1">Phone Number</label>
                      <div className="flex rounded-xl overflow-hidden border border-white/10 focus-within:border-[#C9A227]/80 bg-white/5 hover:bg-white/[0.08] transition-all">
                        <span 
                          className="px-3.5 flex items-center justify-center text-xs font-bold text-[#E8C96A] border-r border-white/10 bg-white/[0.03] select-none"
                        >
                          +91
                        </span>
                        <input 
                          type="tel" 
                          placeholder="XXXXXXXXXX"
                          value={phone}
                          onChange={(e) => handlePhoneChange(e.target.value)}
                          className="w-full px-4 py-3 bg-transparent text-xs font-semibold text-white outline-none placeholder:text-white/30"
                          required 
                          disabled={loading}
                        />
                      </div>
                    </div>

                    {/* Requirement/Message text area */}
                    <div className="space-y-1.5">
                      <label className="text-[9px] font-black text-[#E8C96A] uppercase tracking-widest ml-1">Requirement Details</label>
                      <textarea 
                        placeholder="Describe your requirement (e.g. Budget, BHK preference, Preferred timing to call)"
                        value={requirement}
                        onChange={(e) => setRequirement(e.target.value)}
                        rows={3}
                        className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl focus:border-[#C9A227]/80 text-xs font-semibold text-white outline-none transition-all placeholder:text-white/30 hover:bg-white/[0.08] resize-none"
                        disabled={loading}
                      />
                    </div>

                    {/* Submit Button */}
                    <button
                      type="submit"
                      disabled={loading}
                      className="w-full py-3.5 mt-4 rounded-xl bg-gradient-to-r from-[#C9A227] via-[#E8C96A] to-[#C9A227] hover:brightness-110 text-[#0B0A06] text-xs font-extrabold uppercase tracking-widest shadow-[0_4px_20px_rgba(201,162,39,0.35)] flex items-center justify-center gap-2 cursor-pointer transition-all active:scale-[0.98] disabled:opacity-50"
                      style={{ backgroundSize: '200% 100%' }}
                    >
                      {loading ? (
                        <>
                          <Loader2 size={14} className="animate-spin text-[#0B0A06]" />
                          Submitting Enquiry...
                        </>
                      ) : (
                        'Request Details'
                      )}
                    </button>
                  </form>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </section>
  );
}
