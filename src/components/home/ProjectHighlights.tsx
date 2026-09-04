"use client";

import { useState, useRef } from 'react';
import Image from 'next/image';

const categories = [
  { id: 'all', label: 'All Specs' },
  { id: 'interiors', label: 'Luxury Interiors' },
  { id: 'kitchen-bath', label: 'Kitchen & Bath' },
  { id: 'tech', label: 'Smart Tech & Safety' },
  { id: 'leisure', label: 'Leisure & Structure' },
];

const features = [
  { title: 'Welcome Lounge', img: '/Project Amenities/WELCOME LOUNGE.jpg', category: 'interiors' },
  { title: 'Water Purifier RO', img: '/Project Amenities/WATER PURIFIER RO.jpg', category: 'kitchen-bath' },
  { title: 'uPVC Windows', img: '/Project Amenities/UPVC WINDOWS.jpg', category: 'leisure' },
  { title: 'Terrace Garden', img: '/Project Amenities/TERRACE GARDEN.webp', category: 'leisure' },
  { title: 'MyGate App-Based (Entry System)', img: '/Project Amenities/MYGATE APP-BASED (ENTRY SYSTEM).jpg', category: 'tech' },
  { title: 'Modular Wardrobes (All Bedrooms)', img: '/Project Amenities/MODULAR WARDROBES (ALL BEDROOMS).jpg', category: 'interiors' },
  { title: 'Modular Lightning Stairs', img: '/Project Amenities/MODULAR LIGHTNING STAIRS.jpg', category: 'leisure' },
  { title: 'Modular Kitchen with Chimney, Hob & Microwave', img: '/Project Amenities/MODULAR KITCHEN WITH CHIMNEY, HOB & MICROWAVE.jpg', category: 'kitchen-bath' },
  { title: 'Kohler Bath Fittings', img: '/Project Amenities/KOHLER BATH FITTINGS.jpg', category: 'kitchen-bath' },
  { title: "Kid's Play Area on Terrace", img: "/Project Amenities/kids-play-area.jpg", category: 'leisure' },
  { title: 'Geysers (In All Washrooms)', img: '/Project Amenities/GEYSERS (IN ALL WASHROOMS).jpg', category: 'kitchen-bath' },
  { title: 'Fire Safety System', img: '/Project Amenities/FIRE SAFETY SYSTEM.jpg', category: 'tech' },
  { title: 'Fancy Fans in Living Area', img: '/Project Amenities/FANCY FANS IN LIVING AREA.jpg', category: 'interiors' },
  { title: 'Digital Door Lock', img: '/Project Amenities/DIGITAL DOOR LOCK.jpg', category: 'tech' },
  { title: 'Car Parking', img: '/Project Amenities/CAR PARKING.jpg', category: 'leisure' },
  { title: 'Branded Lift', img: '/Project Amenities/BRANDED LIFT.jpg', category: 'leisure' },
  { title: '3D Wall Moulding Design', img: '/Project Amenities/3D WALL MOULDING DESIGN.jpg', category: 'interiors' },
  { title: '24x7 CCTV & Security', img: '/Project Amenities/24X7 CCTV & SECURITY.jpg', category: 'tech' },
];

export default function ProjectHighlights() {
  const [activeTab, setActiveTab] = useState('all');
  const [coords, setCoords] = useState({ x: 0, y: 0 });
  const [isHovering, setIsHovering] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    setCoords({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    });
  };

  const filteredFeatures = activeTab === 'all'
    ? features
    : features.filter(f => f.category === activeTab);

  return (
    <section
      ref={containerRef}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setIsHovering(true)}
      onMouseLeave={() => setIsHovering(false)}
      className="pt-16 pb-20 relative overflow-hidden bg-[#F3EDE4] border-y border-orange-100"
      style={{
        ['--mouse-x' as any]: `${coords.x}px`,
        ['--mouse-y' as any]: `${coords.y}px`,
      }}
    >
      {/* Premium Animated Background */}
      <div className="absolute inset-0 z-0 select-none pointer-events-none overflow-hidden">
        <style>{`
          @keyframes fadeInStagger {
            from { opacity: 0; transform: translateY(12px); }
            to { opacity: 1; transform: translateY(0); }
          }
          @keyframes shimmer-diagonal {
            0% { transform: translateX(-100%) translateY(-100%) rotate(45deg); }
            100% { transform: translateX(200%) translateY(200%) rotate(45deg); }
          }
          @keyframes spin-mandala {
            from { transform: rotate(0deg); }
            to { transform: rotate(360deg); }
          }
          @keyframes spin-mandala-rev {
            from { transform: rotate(0deg); }
            to { transform: rotate(-360deg); }
          }
          @keyframes aurora-blob-1 {
            0%, 100% { transform: translate(0px, 0px) scale(1); opacity: 0.18; }
            33% { transform: translate(60px, -40px) scale(1.15); opacity: 0.25; }
            66% { transform: translate(-40px, 50px) scale(0.92); opacity: 0.15; }
          }
          @keyframes aurora-blob-2 {
            0%, 100% { transform: translate(0px, 0px) scale(1); opacity: 0.14; }
            40% { transform: translate(-70px, 30px) scale(1.2); opacity: 0.22; }
            70% { transform: translate(50px, -60px) scale(0.88); opacity: 0.12; }
          }
          @keyframes drift-arc-1 {
            0%, 100% { transform: translateY(0px) translateX(0px) rotate(0deg); }
            50% { transform: translateY(-25px) translateX(18px) rotate(12deg); }
          }
          @keyframes drift-arc-2 {
            0%, 100% { transform: translateY(0px) translateX(0px) rotate(0deg); }
            50% { transform: translateY(20px) translateX(-15px) rotate(-10deg); }
          }
          @keyframes drift-arc-3 {
            0%, 100% { transform: translateY(0px) rotate(0deg); }
            50% { transform: translateY(-18px) rotate(8deg); }
          }
          @keyframes hex-drift {
            0%, 100% { transform: translateY(0px) translateX(0px) scale(1); opacity: 0.06; }
            50% { transform: translateY(-20px) translateX(12px) scale(1.05); opacity: 0.10; }
          }
          @keyframes shimmer-line-scroll {
            0% { background-position: 0% 0%; }
            100% { background-position: 200% 200%; }
          }
          .card-stagger {
            opacity: 0;
            animation: fadeInStagger 0.5s cubic-bezier(0.16, 1, 0.3, 1) forwards;
          }
          .card-3d {
            transform: perspective(1000px) translateZ(0);
            transition: transform 0.5s cubic-bezier(0.16, 1, 0.3, 1), background-color 0.4s ease, border-color 0.4s ease, box-shadow 0.5s ease;
            box-shadow: 0 4px 10px rgba(0, 0, 0, 0.03), 0 1px 3px rgba(0, 0, 0, 0.02);
          }
          .card-3d:hover {
            transform: perspective(1000px) translate3d(0, -12px, 25px) rotateX(4deg);
            box-shadow: 0 28px 50px -10px rgba(166, 124, 30, 0.15), 0 16px 24px -8px rgba(0, 0, 0, 0.06);
            background-color: #FFFFFF;
          }
          .ph-shimmer-stripe {
            position: absolute;
            width: 3px;
            height: 200%;
            top: -50%;
            background: linear-gradient(to bottom, transparent, rgba(201,162,39,0.18), transparent);
            border-radius: 99px;
            animation: shimmer-diagonal 9s ease-in-out infinite;
          }
          .ph-hex-lattice {
            background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='56' height='100'%3E%3Cpath d='M28 66L0 50V16L28 0l28 16v34L28 66zm0 34L0 84V66l28 16 28-16v18L28 100z' fill='none' stroke='rgba(201,162,39,0.07)' stroke-width='1'/%3E%3C/svg%3E");
            background-size: 56px 100px;
            animation: shimmer-line-scroll 50s linear infinite;
          }
          .ph-blob-1 { animation: aurora-blob-1 18s ease-in-out infinite; }
          .ph-blob-2 { animation: aurora-blob-2 24s ease-in-out infinite; }
          .ph-blob-3 { animation: aurora-blob-1 30s ease-in-out infinite reverse; }
          .ph-mandala { animation: spin-mandala 90s linear infinite; }
          .ph-mandala-rev { animation: spin-mandala-rev 60s linear infinite; }
          .ph-arc-1 { animation: drift-arc-1 14s ease-in-out infinite; }
          .ph-arc-2 { animation: drift-arc-2 18s ease-in-out infinite; }
          .ph-arc-3 { animation: drift-arc-3 22s ease-in-out infinite; }
          .ph-hex { animation: hex-drift 16s ease-in-out infinite; }
        `}</style>

        {/* Base warm cream gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-[#F8F0E0] via-[#F3EDE4] to-[#EDE3D4]" />

        {/* Hexagonal lattice overlay */}
        <div className="absolute inset-0 ph-hex-lattice opacity-80" />

        {/* Aurora blobs — warm gold & amber hues */}
        <div className="ph-blob-1 absolute -top-32 -left-24 w-[700px] h-[500px] rounded-[60%_40%_50%_70%/60%_70%_40%_50%] bg-gradient-to-br from-[#C9A227]/20 via-[#E8C96A]/12 to-transparent blur-3xl" />
        <div className="ph-blob-2 absolute -bottom-40 -right-24 w-[650px] h-[550px] rounded-[50%_70%_60%_40%/40%_50%_70%_60%] bg-gradient-to-tl from-[#C9A227]/16 via-[#D4A843]/10 to-transparent blur-3xl" />
        <div className="ph-blob-3 absolute top-[40%] left-[35%] w-[500px] h-[400px] rounded-[70%_30%_40%_60%/50%_60%_40%_60%] bg-gradient-to-br from-[#F5E3A3]/18 to-transparent blur-3xl" />

        {/* Diagonal shimmer stripes */}
        <div className="ph-shimmer-stripe" style={{ left: '15%', animationDelay: '0s', animationDuration: '10s' }} />
        <div className="ph-shimmer-stripe" style={{ left: '35%', animationDelay: '3.5s', animationDuration: '13s' }} />
        <div className="ph-shimmer-stripe" style={{ left: '58%', animationDelay: '1.8s', animationDuration: '11s' }} />
        <div className="ph-shimmer-stripe" style={{ left: '78%', animationDelay: '5s', animationDuration: '14s' }} />

        {/* Rotating Mandala Ring — center anchor */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] ph-mandala opacity-[0.035]">
          <svg viewBox="0 0 700 700" xmlns="http://www.w3.org/2000/svg">
            <circle cx="350" cy="350" r="320" fill="none" stroke="#C9A227" strokeWidth="1" strokeDasharray="12 18" />
            <circle cx="350" cy="350" r="280" fill="none" stroke="#C9A227" strokeWidth="0.7" strokeDasharray="6 22" />
            <circle cx="350" cy="350" r="240" fill="none" stroke="#C9A227" strokeWidth="1" strokeDasharray="20 10" />
            {[0, 30, 60, 90, 120, 150, 180, 210, 240, 270, 300, 330].map((deg, i) => (
              <line key={i} x1="350" y1="30" x2="350" y2="80" stroke="#C9A227" strokeWidth="1.5" transform={`rotate(${deg} 350 350)`} />
            ))}
            {[0, 45, 90, 135, 180, 225, 270, 315].map((deg, i) => (
              <path key={i} d="M350 100 L360 130 L350 160 L340 130 Z" fill="rgba(201,162,39,0.5)" transform={`rotate(${deg} 350 350)`} />
            ))}
          </svg>
        </div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] ph-mandala-rev opacity-[0.04]">
          <svg viewBox="0 0 500 500" xmlns="http://www.w3.org/2000/svg">
            <circle cx="250" cy="250" r="230" fill="none" stroke="#C9A227" strokeWidth="0.8" strokeDasharray="4 16" />
            <circle cx="250" cy="250" r="190" fill="none" stroke="#C9A227" strokeWidth="1.2" strokeDasharray="14 8" />
            {[0, 60, 120, 180, 240, 300].map((deg, i) => (
              <circle key={i} cx="250" cy="60" r="7" fill="none" stroke="#C9A227" strokeWidth="1.5" transform={`rotate(${deg} 250 250)`} />
            ))}
          </svg>
        </div>

        {/* Drifting SVG arc ornaments */}
        <div className="ph-arc-1 absolute top-[8%] right-[5%] opacity-[0.09]">
          <svg width="140" height="140" viewBox="0 0 140 140" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M10 130 Q70 10 130 130" stroke="#C9A227" strokeWidth="1.5" fill="none" />
            <path d="M20 130 Q70 30 120 130" stroke="#C9A227" strokeWidth="0.8" fill="none" strokeDasharray="4 6" />
            <circle cx="70" cy="70" r="4" fill="#C9A227" />
          </svg>
        </div>
        <div className="ph-arc-2 absolute bottom-[10%] left-[4%] opacity-[0.08]">
          <svg width="120" height="120" viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg">
            <circle cx="60" cy="60" r="55" stroke="#C9A227" strokeWidth="1" fill="none" strokeDasharray="8 14" />
            <circle cx="60" cy="60" r="38" stroke="#C9A227" strokeWidth="0.7" fill="none" />
            <path d="M60 5 L65 30 L60 55 L55 30 Z" fill="rgba(201,162,39,0.5)" />
          </svg>
        </div>
        <div className="ph-arc-3 absolute top-[45%] right-[2%] opacity-[0.07]">
          <svg width="90" height="160" viewBox="0 0 90 160" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M5 5 C80 40 80 120 5 155" stroke="#C9A227" strokeWidth="1.2" fill="none" />
            <path d="M20 15 C80 50 80 110 20 145" stroke="#C9A227" strokeWidth="0.6" fill="none" strokeDasharray="3 8" />
          </svg>
        </div>

        {/* Fine dot grid overlay */}
        <div className="absolute inset-0 opacity-40"
          style={{ backgroundImage: 'radial-gradient(rgba(201,162,39,0.12) 1px, transparent 1px)', backgroundSize: '28px 28px' }} />

        {/* Soft central radial vignette (brightens center) */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_70%_60%_at_50%_50%,rgba(255,252,240,0.55),transparent)]" />

        {/* Mouse interactive spotlight gold glow */}
        {isHovering && (
          <div
            className="absolute w-[600px] h-[600px] rounded-full pointer-events-none transition-opacity duration-500"
            style={{
              left: `${coords.x - 300}px`,
              top: `${coords.y - 300}px`,
              background: 'radial-gradient(circle, rgba(201,162,39,0.07) 0%, rgba(201,162,39,0.03) 40%, transparent 70%)',
            }}
          />
        )}
      </div>

      <div className="max-w-[1400px] mx-auto px-6 sm:px-12 lg:px-24 relative z-10">

        {/* Header Block */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#C9A227]/12 border border-[#C9A227]/25 text-[#A67C1E] text-[10px] font-bold tracking-[0.25em] uppercase mb-4 shadow-sm shadow-[#C9A227]/5">
            <span className="w-1.5 h-1.5 rounded-full bg-[#C9A227] inline-block animate-pulse" />
            Premium Specifications
          </div>
          <h2 className="text-3xl md:text-5xl font-bold font-[var(--font-playfair)] text-[#1A1800] mb-4">
            Project <span className="text-[#A07A10]">Highlights</span>
          </h2>
          <p className="text-[#5a4a30] max-w-2xl mx-auto mb-6 text-sm md:text-base leading-relaxed">
            Discover the exceptional features and premium specifications that define our project. Crafted to deliver an unparalleled living experience for you and your family.
          </p>
          <div className="w-24 h-[1px] bg-gradient-to-r from-transparent via-[#C9A227]/60 to-transparent mx-auto" />
        </div>

        {/* Category Tabs Switcher */}
        <div className="flex flex-wrap justify-center gap-3 mb-10">
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setActiveTab(cat.id)}
              className={`px-5 py-2.5 rounded-full text-[10px] md:text-xs font-bold uppercase tracking-wider transition-all duration-300 border ${activeTab === cat.id
                  ? 'bg-[#C9A227] text-[#1A1800] border-[#C9A227] shadow-lg shadow-[#C9A227]/15 scale-105'
                  : 'bg-white/80 text-[#5a4a30] border-orange-100 hover:border-[#C9A227]/40 hover:text-[#7A5C00] hover:bg-white'
                }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* Specifications Cards Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 xl:grid-cols-6 gap-6 md:gap-8 justify-center">
          {filteredFeatures.map((feature, index) => (
            <div
              key={`${activeTab}-${index}`}
              style={{ animationDelay: `${(index % 6) * 50}ms` }}
              className="flex flex-col items-center p-4 bg-[#FAF8F5] rounded-2xl border-t border-l border-white border-b-2 border-r-2 border-[#DCD3C5] hover:border-[#C9A227] transition-all duration-300 group card-3d card-stagger cursor-pointer"
            >
              {/* Image Frame (Sunken/bevel styled inner box) */}
              <div className="relative w-full aspect-[16/11] rounded-xl overflow-hidden mb-4 border border-[#DCD3C5]/70 shadow-[inset_0_2px_4px_rgba(0,0,0,0.04)] bg-white">
                <Image
                  src={feature.img}
                  alt={feature.title}
                  fill
                  className="object-cover group-hover:scale-[1.04] transition-transform duration-500"
                  sizes="(max-width: 768px) 50vw, (max-width: 1280px) 25vw, 16vw"
                  quality={80}
                />
              </div>

              {/* Title */}
              <p className="text-[10px] md:text-xs font-bold text-center text-[#334155] group-hover:text-[#C9A227] transition-colors duration-300 leading-tight uppercase tracking-wider min-h-[32px] flex items-center justify-center px-1">
                {feature.title}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
