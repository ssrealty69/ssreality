'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { Star, Quote, ChevronLeft, ChevronRight, Play, Pause } from 'lucide-react';

const testimonials = [
  {
    name: 'Priya Agarwal',
    role: 'Teacher, Ghaziabad',
    content: 'Maine SS Realty se Vasundhara, Ghaziabad mein 3BHK flat liya. Inki team ne society ke baare mein puri details di aur loan process mein bhi help ki. Bahut trustworthy hain.',
    rating: 5,
    initials: 'PA',
    property: 'Purchased 3BHK Flat — Vasundhara, Ghaziabad',
    videoUrl: '/Priya Feedback.mp4',
  },
  {
    name: 'Vikram Singh',
    role: 'Govt. Employee, Noida',
    content: 'SS Realty ne mujhe Noida Sector 62 mein ek bahut achha 2BHK flat dilaya. Price bilkul budget mein tha aur registration process bhi smooth rahi. Team ne har step par guide kiya.',
    rating: 5,
    initials: 'VS',
    property: 'Purchased 2BHK Flat — Noida Sector 62',
    videoUrl: 'https://assets.mixkit.co/videos/preview/mixkit-luxury-home-interior-41582-large.mp4',
  },
  {
    name: 'Ramesh Yadav',
    role: 'Farmer, Greater Noida',
    content: 'Greater Noida West mein ek residential plot lena tha. SS Realty ne registry se lekar patwari tak sab kuch handle kiya. Koi bhi tension nahi hua. Bohot acchi service hai.',
    rating: 5,
    initials: 'RY',
    property: 'Purchased Residential Land — Greater Noida West',
    videoUrl: 'https://assets.mixkit.co/videos/preview/mixkit-keys-in-a-house-lock-40432-large.mp4',
  },
  {
    name: 'Suresh Gupta',
    role: 'Shop Owner, Delhi',
    content: 'Rohini mein commercial shop ke liye SS Realty se contact kiya. Unhone location, footfall aur ROI sab samjhaya. Meri dukan 3 mahine mein hi profitable ho gayi. Shukriya team!',
    rating: 5,
    initials: 'SG',
    property: 'Purchased Commercial Shop — Rohini, Delhi',
    videoUrl: 'https://assets.mixkit.co/videos/preview/mixkit-hand-turning-a-house-key-in-a-door-lock-40428-large.mp4',
  },
  {
    name: 'Anita Sharma',
    role: 'Housewife, Gurugram',
    content: 'Gurugram ke Sohna Road par villa leni thi family ke liye. SS Realty ne 3-4 options dikhaye aur har ek ki pros-cons batayi. Hum bahut khush hain apni villa se. Highly recommend!',
    rating: 5,
    initials: 'AS',
    property: 'Purchased Villa — Sohna Road, Gurugram',
    videoUrl: 'https://assets.mixkit.co/videos/preview/mixkit-interior-of-a-modern-and-luxury-living-room-41585-large.mp4',
  },
  {
    name: 'Deepak Tyagi',
    role: 'Business Owner, Faridabad',
    content: 'Faridabad ke paas Aravalli mein ek farmhouse lena tha weekend retreat ke liye. SS Realty ne legal verification se lekar registry tak sab kuch theek se kiya. Ekdum mast experience raha.',
    rating: 5,
    initials: 'DT',
    property: 'Purchased Farmhouse — Aravalli, Faridabad',
    videoUrl: 'https://assets.mixkit.co/videos/preview/mixkit-family-playing-with-their-dog-in-the-garden-41588-large.mp4',
  },
];

function Avatar({ initials, color }: { initials: string; color: string }) {
  return (
    <div
      className="w-12 h-12 rounded-full flex items-center justify-center text-white font-bold text-sm shrink-0 border border-white/20 shadow-md"
      style={{ background: color }}
    >
      {initials}
    </div>
  );
}

const colors = ['#C9A227', '#B8860B', '#9a6f08', '#C9A227', '#B8860B', '#9a6f08'];

function TestimonialCard({
  t,
  i,
  isPlaying,
  onPlayToggle,
}: {
  t: typeof testimonials[0];
  i: number;
  isPlaying: boolean;
  onPlayToggle: () => void;
}) {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.muted = false;
        videoRef.current.play().catch((err) => {
          console.log("Audio play blocked or user interaction required:", err);
        });
      } else {
        videoRef.current.pause();
      }
    }
  }, [isPlaying]);

  return (
    <div className="flex flex-col gap-4 w-full max-w-[310px] mx-auto select-none">
      {/* Tall Portrait Video Card */}
      <div className="relative overflow-hidden rounded-2xl w-full aspect-[9/16] h-[530px] flex items-center justify-center p-[1.5px] shadow-[0_4px_25px_rgba(26,24,0,0.06)] hover:shadow-[var(--shadow-gold)] transition-all duration-300 group">
        {/* Spinning golden gradient border beam */}
        <div className="absolute inset-[-50%] bg-[conic-gradient(from_0deg,transparent_20%,#C9A227_40%,#FFF9E3_50%,#B8860B_60%,transparent_80%)] animate-[spin_5s_linear_infinite] opacity-80 group-hover:opacity-100 transition-opacity pointer-events-none" />

        {/* Clean vertical video (NO autoplay, muted on start, playsInline) */}
        <video
          ref={videoRef}
          src={t.videoUrl}
          loop
          muted
          playsInline
          className="absolute inset-[1.5px] w-[calc(100%-3px)] h-[calc(100%-3px)] object-cover rounded-[14.5px] z-0 select-none"
        />

        {/* Subtle vignette shadow overlay on top and bottom of the video */}
        <div className="absolute inset-[1.5px] w-[calc(100%-3px)] h-[calc(100%-3px)] bg-gradient-to-b from-black/45 via-transparent to-black/55 rounded-[14.5px] z-10 pointer-events-none" />

        {/* Pulsating Translucent LIVE Video badge */}
        <div className="absolute top-5 right-5 bg-black/40 backdrop-blur-md rounded-full px-2.5 py-1 border border-white/10 z-20 flex items-center justify-center pointer-events-none">
          <span className={`w-1.5 h-1.5 rounded-full ${isPlaying ? 'bg-red-500 animate-ping' : 'bg-[#C9A227] animate-pulse'} mr-1.5`} />
          <span className="text-[8px] text-white font-bold uppercase tracking-widest">{isPlaying ? 'PLAYING' : 'VIDEO'}</span>
        </div>

        {/* Play / Pause Toggle Button */}
        <button
          onClick={onPlayToggle}
          className="absolute bottom-6 bg-black/60 hover:bg-[#C9A227] text-white font-bold text-xs tracking-wider uppercase py-2.5 px-5 rounded-full border border-white/10 z-20 flex items-center gap-2 backdrop-blur-md transition-all duration-300 hover:scale-105 active:scale-95 shadow-lg"
        >
          {isPlaying ? (
            <>
              <Pause size={14} className="fill-white text-white" />
              <span>Pause</span>
            </>
          ) : (
            <>
              <Play size={14} className="fill-white text-white" />
              <span>Play Video</span>
            </>
          )}
        </button>
      </div>

      {/* Author & Property details below the video card */}
      <div className="text-center px-2 mt-1">
        <h4 className="font-bold text-[#1A1800] text-sm tracking-tight">{t.name}</h4>
        <p className="text-xs text-[#6b6450] mt-0.5">{t.role}</p>
        <p className="inline-block text-[10px] text-[#9a6f08] font-bold tracking-wider mt-2 bg-[#C9A227]/10 border border-[#C9A227]/25 px-2.5 py-0.5 rounded-full truncate max-w-full">
          {t.property}
        </p>
      </div>
    </div>
  );
}
/** Responsive sliding carousel */
function TestimonialsCarousel() {
  const [active, setActive] = useState(0);
  const [cardsPerView, setCardsPerView] = useState(1);
  const [playingIndex, setPlayingIndex] = useState<number | null>(null);
  const touchStartX = useRef<number | null>(null);
  const touchDelta = useRef<number>(0);
  const total = testimonials.length;
  const carouselRef = useRef<HTMLDivElement>(null);

  // Intersection Observer to automatically pause videos when scrolling away
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) {
          setPlayingIndex(null);
        }
      },
      { threshold: 0.15 } // Trigger when less than 15% of the carousel is visible in viewport
    );

    if (carouselRef.current) {
      observer.observe(carouselRef.current);
    }

    return () => {
      if (carouselRef.current) {
        observer.unobserve(carouselRef.current);
      }
    };
  }, []);

  // Detect cards per view based on window size
  useEffect(() => {
    const updateCardsPerView = () => {
      if (window.innerWidth >= 1280) {
        setCardsPerView(4);
      } else if (window.innerWidth >= 1024) {
        setCardsPerView(3);
      } else if (window.innerWidth >= 768) {
        setCardsPerView(2);
      } else {
        setCardsPerView(1);
      }
    };

    updateCardsPerView();
    window.addEventListener('resize', updateCardsPerView);
    return () => window.removeEventListener('resize', updateCardsPerView);
  }, []);

  // Clamp active index when cardsPerView changes
  useEffect(() => {
    setActive((prev) => Math.min(prev, Math.max(0, total - cardsPerView)));
  }, [cardsPerView, total]);

  const goNext = useCallback(() => {
    setActive((prev) => {
      const maxIdx = total - cardsPerView;
      if (prev >= maxIdx) {
        return 0;
      }
      return prev + 1;
    });
  }, [total, cardsPerView]);

  const goPrev = useCallback(() => {
    setActive((prev) => {
      const maxIdx = total - cardsPerView;
      if (prev <= 0) {
        return maxIdx;
      }
      return prev - 1;
    });
  }, [total, cardsPerView]);

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
    touchDelta.current = 0;
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
  };

  const numDots = total - cardsPerView + 1;

  return (
    <div ref={carouselRef} className="relative px-2 sm:px-10">
      {/* Carousel Container wrapper with overflow hidden */}
      <div className="overflow-hidden py-4 -mx-3">
        <div
          className="flex transition-transform duration-500 ease-in-out"
          style={{ 
            transform: `translateX(-${active * (100 / cardsPerView)}%)`,
          }}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
        >
          {testimonials.map((t, i) => (
            <div 
              key={t.name} 
              className="px-3 shrink-0 transition-all duration-300" 
              style={{ 
                width: `${100 / cardsPerView}%`,
                userSelect: 'none' 
              }}
            >
              <TestimonialCard 
                t={t} 
                i={i} 
                isPlaying={playingIndex === i}
                onPlayToggle={() => {
                  setPlayingIndex((prev) => (prev === i ? null : i));
                }}
              />
            </div>
          ))}
        </div>
      </div>

      {/* Navigation Arrows for tablet & desktop */}
      {numDots > 1 && (
        <>
          <button
            onClick={goPrev}
            className="absolute left-[-10px] top-[40%] -translate-y-[50%] hidden sm:flex items-center justify-center w-12 h-12 rounded-full bg-white border border-[#E8D5A3]/60 shadow-[0_2px_12px_rgba(26,24,0,0.08)] text-[#C9A227] hover:bg-[#C9A227] hover:text-white transition-all duration-300 z-10 hover:scale-105"
            aria-label="Previous testimonial"
          >
            <ChevronLeft size={24} />
          </button>
          <button
            onClick={goNext}
            className="absolute right-[-10px] top-[40%] -translate-y-[50%] hidden sm:flex items-center justify-center w-12 h-12 rounded-full bg-white border border-[#E8D5A3]/60 shadow-[0_2px_12px_rgba(26,24,0,0.08)] text-[#C9A227] hover:bg-[#C9A227] hover:text-white transition-all duration-300 z-10 hover:scale-105"
            aria-label="Next testimonial"
          >
            <ChevronRight size={24} />
          </button>
        </>
      )}

      {/* Dot indicators */}
      {numDots > 1 && (
        <div className="flex justify-center gap-2 mt-5">
          {Array.from({ length: numDots }).map((_, i) => (
            <button
              key={i}
              aria-label={`Go to testimonial group ${i + 1}`}
              onClick={() => {
                setActive(i);
              }}
              className={`rounded-full transition-all duration-300 ${
                i === active ? 'w-6 h-2 bg-[#C9A227]' : 'w-2 h-2 bg-[#C9A227]/30'
              }`}
            />
          ))}
        </div>
      )}
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

        <div className="w-full">
          <TestimonialsCarousel />
        </div>
      </div>
    </section>
  );
}
