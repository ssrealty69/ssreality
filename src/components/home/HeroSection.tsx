import Link from 'next/link';
import { Star, Building2, CheckCircle2 } from 'lucide-react';
import HeroVideo from './HeroVideo';

export default function HeroSection() {
  return (
    <section className="relative h-[100vh] min-h-[600px] w-full overflow-hidden flex flex-col justify-center items-center font-sans">
      
      {/* Background: Poster image shown immediately (no render blocking), video loads lazily */}
      <HeroVideo />

      {/* Reduced overlay opacity to show video better */}
      <div className="absolute inset-0 bg-[#0A0A0A]/40 z-0 pointer-events-none" />
      <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-transparent to-[#0A0A0A]/70 z-0 pointer-events-none" />

      {/* Content Container (Perfectly Centered & Scaled Down) */}
      <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 w-full flex flex-col items-center text-center mt-8">
        
        {/* Top Badge (Matched to website's Gold Theme) */}
        <div className="inline-flex items-center gap-2 px-4 py-1.5 border border-[#C9A227]/30 rounded-full bg-[#C9A227]/10 backdrop-blur-md mb-6 shadow-lg">
          <span className="w-1.5 h-1.5 rounded-full bg-[#C9A227] animate-pulse" />
          <span className="text-[11px] font-bold text-[#F0D060] tracking-widest uppercase">
            Delhi NCR's Trusted Builder Since 2008
          </span>
        </div>

        {/* Main Title (Smooth sizing and Gold Gradient) */}
        <h1 className="text-4xl md:text-5xl lg:text-[64px] font-bold tracking-tight leading-[1.1] mb-5 drop-shadow-lg">
          <span style={{ 
            color: '#FFFFFF',
            WebkitTextStroke: '0.6px rgba(232, 213, 163, 0.8)',
            textShadow: '0 4px 16px rgba(0, 0, 0, 0.8), 0 0 4px rgba(201, 162, 39, 0.3)'
          }}>
            Find Your Perfect Property,
          </span>
          <br />
          <span className="bg-gradient-to-r from-[#C9A227] via-[#F0D060] to-[#C9A227] text-transparent bg-clip-text">
            Anywhere in Delhi NCR.
          </span>
        </h1>

        {/* Subtitle (Smaller and refined) */}
        <p className="text-sm md:text-base text-gray-300 max-w-2xl leading-relaxed mb-8 font-medium">
          100+ self-built premium homes delivered across Chattarpur, Gwal Pahari & Mandi Road. <br className="hidden md:block" /> 
          2BHK, 3BHK, 4BHK Flats, Villas, Plots & more — designed, built & sold by SS Realty.
        </p>

        {/* Action Buttons */}
        <div className="flex justify-center mb-16 w-full">
          <Link 
            href="/properties" 
            className="inline-flex items-center justify-center px-8 py-3.5 bg-[#C2410C] text-white font-bold rounded-xl hover:bg-[#9A3412] hover:scale-[1.03] transition-all duration-300 shadow-[0_4px_14px_0_rgba(194,65,12,0.45)] text-[15px] cursor-pointer"
          >
            Explore Properties Free
          </Link>
        </div>

        {/* Bottom Trust Indicators (Smaller, cleaner, exact layout) */}
        <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-4 pt-8">
          
          <div className="flex items-center gap-2">
            <Star className="w-4 h-4 text-[#F97316]" fill="currentColor" />
            <span className="text-[11px] font-bold text-gray-400 tracking-widest">4.8 RATING</span>
          </div>

          <div className="hidden sm:block w-px h-3 bg-gray-600" />

          <div className="flex items-center gap-2">
            <Building2 className="w-4 h-4 text-[#C9A227]" />
            <span className="text-[11px] font-bold text-gray-400 tracking-widest">100+ HOMES DELIVERED</span>
          </div>

          <div className="hidden sm:block w-px h-3 bg-gray-600" />

          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-[#10B981]" />
            <span className="text-[11px] font-bold text-gray-400 tracking-widest">SELF-BUILT PROJECTS</span>
          </div>

        </div>

      </div>
    </section>
  );
}
