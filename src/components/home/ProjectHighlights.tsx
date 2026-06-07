"use client";

import Image from 'next/image';

const features = [
  { title: 'Welcome Lounge', img: '/Project%20Amenities/WELCOME%20LOUNGE.jpg' },
  { title: 'Water Purifier RO', img: '/Project%20Amenities/WATER%20PURIFIER%20RO.jpg' },
  { title: 'uPVC Windows', img: '/Project%20Amenities/UPVC%20WINDOWS.jpg' },
  { title: 'Terrace Garden', img: '/Project%20Amenities/TERRACE%20GARDEN.jpg' },
  { title: 'MyGate App-Based (Entry System)', img: '/Project%20Amenities/MYGATE%20APP-BASED%20%28ENTRY%20SYSTEM%29.jpg' },
  { title: 'Modular Wardrobes (All Bedrooms)', img: '/Project%20Amenities/MODULAR%20WARDROBES%20%28ALL%20BEDROOMS%29.jpg' },
  { title: 'Modular Lightning Stairs', img: '/Project%20Amenities/MODULAR%20LIGHTNING%20STAIRS.jpg' },
  { title: 'Modular Kitchen with Chimney, Hob & Microwave', img: '/Project%20Amenities/MODULAR%20KITCHEN%20WITH%20CHIMNEY%2C%20HOB%20%26%20MICROWAVE.jpg' },
  { title: 'Kohler Bath Fittings', img: '/Project%20Amenities/KOHLER%20BATH%20FITTINGS.jpg' },
  { title: "Kid's Play Area on Terrace", img: '/Project%20Amenities/KID’S%20PLAY%20AREA%20ON%20TERRACE.jpg' },
  { title: 'Geysers (In All Washrooms)', img: '/Project%20Amenities/GEYSERS%20%28IN%20ALL%20WASHROOMS%29.jpg' },
  { title: 'Fire Safety System', img: '/Project%20Amenities/FIRE%20SAFETY%20SYSTEM.jpg' },
  { title: 'Fancy Fans in Living Area', img: '/Project%20Amenities/FANCY%20FANS%20IN%20LIVING%20AREA.jpg' },
  { title: 'Digital Door Lock', img: '/Project%20Amenities/DIGITAL%20DOOR%20LOCK.jpg' },
  { title: 'Car Parking', img: '/Project%20Amenities/CAR%20PARKING.jpg' },
  { title: 'Branded Lift', img: '/Project%20Amenities/BRANDED%20LIFT.jpg' },
  { title: '3D Wall Moulding Design', img: '/Project%20Amenities/3D%20WALL%20MOULDING%20DESIGN.jpg' },
  { title: '24x7 CCTV & Security', img: '/Project%20Amenities/24X7%20CCTV%20%26%20SECURITY.jpg' },
];
export default function ProjectHighlights() {
  return (
    <section className="py-24 relative overflow-hidden bg-[#F8FAFC] border-y border-gray-100">
      {/* Luxury Art Deco Geometric Background */}
      <div className="absolute inset-0 z-0 select-none pointer-events-none overflow-hidden">
        {/* CSS Keyframes for floating background elements */}
        <style>{`
          @keyframes float-slow-1 {
            0%, 100% { transform: translate(0px, 0px) scale(1); }
            50% { transform: translate(30px, -45px) scale(1.1); }
          }
          @keyframes float-slow-2 {
            0%, 100% { transform: translate(0px, 0px) scale(1.05); }
            50% { transform: translate(-45px, 30px) scale(0.95); }
          }
          .animate-float-1 {
            animation: float-slow-1 20s ease-in-out infinite;
          }
          .animate-float-2 {
            animation: float-slow-2 25s ease-in-out infinite;
          }
          .card-3d {
            transition: transform 0.4s cubic-bezier(0.16, 1, 0.3, 1), box-shadow 0.4s ease, border-color 0.4s ease;
          }
          .card-3d:hover {
            transform: translateY(-6px) scale(1.02);
            box-shadow: 0 20px 35px rgba(201, 162, 39, 0.12);
          }
        `}</style>

        {/* Ambient Glowing Luxury Orbs */}
        <div className="absolute top-[-10%] left-[-10%] w-[600px] h-[600px] rounded-full bg-gradient-to-tr from-[#C9A227]/7 to-transparent blur-3xl animate-float-1" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[700px] h-[700px] rounded-full bg-gradient-to-tr from-[#C9A227]/5 to-transparent blur-3xl animate-float-2" />

        {/* Art Deco repeating SVG lattice pattern */}
        <svg className="absolute inset-0 w-full h-full opacity-[0.06] text-[#C9A227]" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern id="art-deco-lattice" width="80" height="80" patternUnits="userSpaceOnUse">
              <path d="M 40 0 L 80 40 L 40 80 L 0 40 Z" fill="none" stroke="currentColor" strokeWidth="0.5" />
              <path d="M 40 10 L 70 40 L 40 70 L 10 40 Z" fill="none" stroke="currentColor" strokeWidth="0.25" opacity="0.6" />
              <path d="M 0 40 Q 20 20, 40 40 T 80 40" fill="none" stroke="currentColor" strokeWidth="0.25" opacity="0.4" />
              <path d="M 0 40 Q 20 60, 40 40 T 80 40" fill="none" stroke="currentColor" strokeWidth="0.25" opacity="0.4" />
              <circle cx="40" cy="40" r="1.5" fill="currentColor" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#art-deco-lattice)" />
        </svg>

        {/* Smooth overlay gradient to fade patterns gracefully at section edges */}
        <div className="absolute inset-0 bg-gradient-to-b from-[#F8FAFC] via-transparent to-[#F8FAFC]" />
      </div>
      
      <div className="max-w-[1400px] mx-auto px-6 sm:px-12 lg:px-24 relative z-10 py-6">
        <div className="text-center mb-16 relative">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#C9A227]/10 border border-[#C9A227]/20 text-[#C9A227] text-[10px] font-bold tracking-[0.2em] uppercase mb-4">
            <span className="w-1.5 h-1.5 rounded-full bg-[#C9A227] inline-block animate-pulse" />
            Premium Specifications
          </div>
          <h2 className="text-3xl md:text-5xl font-bold font-[var(--font-playfair)] text-[#1A1800] mb-4">
            Project <span className="text-[#C9A227]">Highlights</span>
          </h2>
          <div className="w-24 h-0.5 bg-gradient-to-r from-transparent via-[#C9A227] to-transparent mx-auto mb-6" />
          <p className="text-[#6b6450] max-w-2xl mx-auto text-sm md:text-base leading-relaxed font-light">
            Discover the exceptional features and premium specifications that define our project. Crafted to deliver an unparalleled living experience for you and your family.
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-6 gap-6 md:gap-8">
          {features.map((feature, index) => (
            <div 
              key={index} 
              className="flex flex-col items-center p-3.5 bg-white/70 backdrop-blur-sm rounded-2xl border border-gray-100 hover:border-[#C9A227]/40 hover:bg-white transition-all duration-300 group card-3d cursor-pointer"
            >
              {/* Image Frame */}
              <div className="relative w-full aspect-[16/11] rounded-xl overflow-hidden mb-4 shadow-sm border border-gray-100/30 group-hover:border-transparent transition-all duration-300 bg-white">
                <Image
                  src={feature.img}
                  alt={feature.title}
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-500"
                  unoptimized
                />
              </div>
              
              {/* Title */}
              <p className="text-[10px] md:text-xs font-black text-center text-[#334155] group-hover:text-[#C9A227] transition-colors duration-300 leading-tight uppercase tracking-wider min-h-[32px] flex items-center justify-center px-1">
                {feature.title}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
