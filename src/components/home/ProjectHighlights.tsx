"use client";

import { useState, useRef, useEffect } from 'react';
import Image from 'next/image';

const categories = [
  { id: 'all', label: 'All Specs' },
  { id: 'interiors', label: 'Luxury Interiors' },
  { id: 'kitchen-bath', label: 'Kitchen & Bath' },
  { id: 'tech', label: 'Smart Tech & Safety' },
  { id: 'leisure', label: 'Leisure & Structure' },
];

const features = [
  { title: 'Welcome Lounge', img: '/Project%20Amenities/WELCOME%20LOUNGE.jpg', category: 'interiors' },
  { title: 'Water Purifier RO', img: '/Project%20Amenities/WATER%20PURIFIER%20RO.jpg', category: 'kitchen-bath' },
  { title: 'uPVC Windows', img: '/Project%20Amenities/UPVC%20WINDOWS.jpg', category: 'leisure' },
  { title: 'Terrace Garden', img: '/Project%20Amenities/TERRACE%20GARDEN.jpg', category: 'leisure' },
  { title: 'MyGate App-Based (Entry System)', img: '/Project%20Amenities/MYGATE%20APP-BASED%20%28ENTRY%20SYSTEM%29.jpg', category: 'tech' },
  { title: 'Modular Wardrobes (All Bedrooms)', img: '/Project%20Amenities/MODULAR%20WARDROBES%20%28ALL%20BEDROOMS%29.jpg', category: 'interiors' },
  { title: 'Modular Lightning Stairs', img: '/Project%20Amenities/MODULAR%20LIGHTNING%20STAIRS.jpg', category: 'leisure' },
  { title: 'Modular Kitchen with Chimney, Hob & Microwave', img: '/Project%20Amenities/MODULAR%20KITCHEN%20WITH%20CHIMNEY%2C%20HOB%20%26%20MICROWAVE.jpg', category: 'kitchen-bath' },
  { title: 'Kohler Bath Fittings', img: '/Project%20Amenities/KOHLER%20BATH%20FITTINGS.jpg', category: 'kitchen-bath' },
  { title: "Kid's Play Area on Terrace", img: '/Project%20Amenities/KID’S%20PLAY%20AREA%20ON%20TERRACE.jpg', category: 'leisure' },
  { title: 'Geysers (In All Washrooms)', img: '/Project%20Amenities/GEYSERS%20%28IN%20ALL%20WASHROOMS%29.jpg', category: 'kitchen-bath' },
  { title: 'Fire Safety System', img: '/Project%20Amenities/FIRE%20SAFETY%20SYSTEM.jpg', category: 'tech' },
  { title: 'Fancy Fans in Living Area', img: '/Project%20Amenities/FANCY%20FANS%20IN%20LIVING%20AREA.jpg', category: 'interiors' },
  { title: 'Digital Door Lock', img: '/Project%20Amenities/DIGITAL%20DOOR%20LOCK.jpg', category: 'tech' },
  { title: 'Car Parking', img: '/Project%20Amenities/CAR%20PARKING.jpg', category: 'leisure' },
  { title: 'Branded Lift', img: '/Project%20Amenities/BRANDED%20LIFT.jpg', category: 'leisure' },
  { title: '3D Wall Moulding Design', img: '/Project%20Amenities/3D%20WALL%20MOULDING%20DESIGN.jpg', category: 'interiors' },
  { title: '24x7 CCTV & Security', img: '/Project%20Amenities/24X7%20CCTV%20%26%20SECURITY.jpg', category: 'tech' },
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
      className="py-24 relative overflow-hidden bg-[#0A0B0E] border-y border-white/[0.05]"
      style={{
        // Set dynamic mouse coordinate variables for the spotlight border beam effect
        ['--mouse-x' as any]: `${coords.x}px`,
        ['--mouse-y' as any]: `${coords.y}px`,
      }}
    >
      {/* Dynamic Dark Mode Grid and Glow Orbs */}
      <div className="absolute inset-0 z-0 select-none pointer-events-none overflow-hidden">
        {/* CSS Keyframes for modern micro-animations */}
        <style>{`
          @keyframes float-slow-1 {
            0%, 100% { transform: translate(0px, 0px) scale(1); }
            50% { transform: translate(40px, -60px) scale(1.1); }
          }
          @keyframes float-slow-2 {
            0%, 100% { transform: translate(0px, 0px) scale(1.05); }
            50% { transform: translate(-60px, 40px) scale(0.95); }
          }
          @keyframes fadeInStagger {
            from { opacity: 0; transform: translateY(16px); }
            to { opacity: 1; transform: translateY(0); }
          }
          .animate-float-1 {
            animation: float-slow-1 22s ease-in-out infinite;
          }
          .animate-float-2 {
            animation: float-slow-2 28s ease-in-out infinite;
          }
          .card-stagger {
            opacity: 0;
            animation: fadeInStagger 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards;
          }
          .card-3d {
            transition: transform 0.4s cubic-bezier(0.16, 1, 0.3, 1), background-color 0.3s ease, border-color 0.3s ease;
          }
          .card-3d:hover {
            transform: translateY(-8px) scale(1.02);
          }
        `}</style>

        {/* Ambient Moving Gold Orbs */}
        <div className="absolute top-[-10%] left-[-10%] w-[600px] h-[600px] rounded-full bg-gradient-to-tr from-[#C9A227]/12 to-transparent blur-3xl animate-float-1" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[700px] h-[700px] rounded-full bg-gradient-to-tr from-[#C9A227]/8 to-transparent blur-3xl animate-float-2" />

        {/* Technical/Fine luxury mesh background */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.012)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.012)_1px,transparent_1px)] bg-[size:60px_60px] opacity-80" />
        
        {/* Dynamic center radial glow */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(201,162,39,0.08),transparent_70%)]" />

        {/* Mouse interactive spotlight glow behind the cards */}
        {isHovering && (
          <div 
            className="absolute w-[600px] h-[600px] rounded-full bg-[radial-gradient(circle,rgba(201,162,39,0.08)_0%,transparent_70%)] pointer-events-none transition-opacity duration-500"
            style={{
              left: `${coords.x - 300}px`,
              top: `${coords.y - 300}px`,
            }}
          />
        )}
      </div>

      <div className="max-w-[1400px] mx-auto px-6 sm:px-12 lg:px-24 relative z-10">
        
        {/* Header Block */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#C9A227]/15 border border-[#C9A227]/25 text-[#C9A227] text-[10px] font-bold tracking-[0.25em] uppercase mb-4 shadow-sm shadow-[#C9A227]/5">
            <span className="w-1.5 h-1.5 rounded-full bg-[#C9A227] inline-block animate-pulse" />
            Premium Specifications
          </div>
          <h2 className="text-3xl md:text-5xl font-bold font-[var(--font-playfair)] text-white mb-4">
            Project <span className="text-[#C9A227]">Highlights</span>
          </h2>
          <div className="w-24 h-[1px] bg-gradient-to-r from-transparent via-[#C9A227]/60 to-transparent mx-auto mb-6" />
          <p className="text-slate-400 max-w-2xl mx-auto text-sm md:text-base leading-relaxed font-light">
            Discover the exceptional features and premium specifications that define our project. Crafted to deliver an unparalleled living experience for you and your family.
          </p>
        </div>

        {/* Category Tabs Switcher */}
        <div className="flex flex-wrap justify-center gap-3 mb-16">
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setActiveTab(cat.id)}
              className={`px-5 py-2.5 rounded-full text-[10px] md:text-xs font-bold uppercase tracking-wider transition-all duration-300 border ${
                activeTab === cat.id
                  ? 'bg-[#C9A227] text-white border-[#C9A227] shadow-lg shadow-[#C9A227]/20 scale-105'
                  : 'bg-white/[0.02] text-slate-400 border-white/[0.08] hover:border-[#C9A227]/40 hover:text-white hover:bg-white/[0.05]'
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
              style={{ animationDelay: `${(index % 6) * 60}ms` }}
              className="flex flex-col items-center p-4 bg-white/[0.02] backdrop-blur-md rounded-2xl border border-white/[0.06] hover:border-[#C9A227]/30 hover:bg-white/[0.04] transition-all duration-300 group card-3d card-stagger cursor-pointer"
            >
              {/* Image Frame */}
              <div className="relative w-full aspect-[16/11] rounded-xl overflow-hidden mb-4 shadow-md border border-white/[0.05] group-hover:border-transparent transition-all duration-300 bg-[#121316]">
                <Image
                  src={feature.img}
                  alt={feature.title}
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-500"
                  unoptimized
                />
              </div>
              
              {/* Title */}
              <p className="text-[10px] md:text-xs font-bold text-center text-slate-300 group-hover:text-[#C9A227] transition-colors duration-300 leading-tight uppercase tracking-wider min-h-[32px] flex items-center justify-center px-1">
                {feature.title}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
