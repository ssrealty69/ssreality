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
      className="py-24 relative overflow-hidden bg-[#F3EDE4] border-y border-orange-100"
      style={{
        ['--mouse-x' as any]: `${coords.x}px`,
        ['--mouse-y' as any]: `${coords.y}px`,
      }}
    >
      {/* Luxury Moving Pattern and Depth Glows */}
      <div className="absolute inset-0 z-0 select-none pointer-events-none overflow-hidden">
        {/* CSS Keyframes for slow background panning */}
        <style>{`
          @keyframes bg-pan-slow {
            0% { background-position: 0px 0px; }
            100% { background-position: 100px 100px; }
          }
          @keyframes bg-pan-opposite {
            0% { background-position: 0px 0px; }
            100% { background-position: -60px -60px; }
          }
          @keyframes float-slow {
            0%, 100% { transform: translate(0px, 0px) scale(1); }
            50% { transform: translate(30px, -30px) scale(1.08); }
          }
          @keyframes fadeInStagger {
            from { opacity: 0; transform: translateY(12px); }
            to { opacity: 1; transform: translateY(0); }
          }
          .animate-bg-pan {
            animation: bg-pan-slow 35s linear infinite;
          }
          .animate-bg-pan-opp {
            animation: bg-pan-opposite 25s linear infinite;
          }
          .animate-float {
            animation: float-slow 20s ease-in-out infinite;
          }
          .card-stagger {
            opacity: 0;
            animation: fadeInStagger 0.5s cubic-bezier(0.16, 1, 0.3, 1) forwards;
          }
          .card-3d {
            transition: transform 0.4s cubic-bezier(0.16, 1, 0.3, 1), background-color 0.3s ease, border-color 0.3s ease, box-shadow 0.3s ease;
          }
          .card-3d:hover {
            transform: translateY(-6px) scale(1.02);
            box-shadow: 0 15px 30px rgba(184, 134, 11, 0.08);
          }
        `}</style>

        {/* Dynamic Glowing luxury gold gradients */}
        <div className="absolute top-[10%] left-[-10%] w-[500px] h-[500px] rounded-full bg-[#C9A227]/10 blur-3xl animate-float" />
        <div className="absolute bottom-[10%] right-[-10%] w-[600px] h-[600px] rounded-full bg-[#C9A227]/8  blur-3xl animate-float" style={{ animationDelay: '-10s' }} />

        {/* Slowly Scrolling Grid Pattern */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(201,162,39,0.02)_1px,transparent_1px),linear-gradient(to_bottom,rgba(201,162,39,0.02)_1px,transparent_1px)] bg-[size:100px_100px] animate-bg-pan opacity-90" />
        
        {/* Slowly Scrolling Dots Pattern (in opposite direction to create depth) */}
        <div className="absolute inset-0 bg-[radial-gradient(rgba(201,162,39,0.06)_1.5px,transparent_1.5px)] bg-[size:25px_25px] animate-bg-pan-opp" />

        {/* Center lighting soft overlay */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.4),transparent_80%)]" />

        {/* Mouse interactive spotlight gold glow */}
        {isHovering && (
          <div 
            className="absolute w-[500px] h-[500px] rounded-full bg-[radial-gradient(circle,rgba(201,162,39,0.05)_0%,transparent_70%)] pointer-events-none transition-opacity duration-300"
            style={{
              left: `${coords.x - 250}px`,
              top: `${coords.y - 250}px`,
            }}
          />
        )}
      </div>

      <div className="max-w-[1400px] mx-auto px-6 sm:px-12 lg:px-24 relative z-10">
        
        {/* Header Block */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#C9A227]/12 border border-[#C9A227]/25 text-[#A67C1E] text-[10px] font-bold tracking-[0.25em] uppercase mb-4 shadow-sm shadow-[#C9A227]/5">
            <span className="w-1.5 h-1.5 rounded-full bg-[#C9A227] inline-block animate-pulse" />
            Premium Specifications
          </div>
          <h2 className="text-3xl md:text-5xl font-bold font-[var(--font-playfair)] text-[#1A1800] mb-4">
            Project <span className="text-[#C9A227]">Highlights</span>
          </h2>
          <div className="w-24 h-[1px] bg-gradient-to-r from-transparent via-[#C9A227]/60 to-transparent mx-auto mb-6" />
          <p className="text-[#6b6450] max-w-2xl mx-auto text-sm md:text-base leading-relaxed font-light">
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
                  ? 'bg-[#C9A227] text-white border-[#C9A227] shadow-lg shadow-[#C9A227]/15 scale-105'
                  : 'bg-white/80 text-[#6b6450] border-orange-100 hover:border-[#C9A227]/40 hover:text-[#C9A227] hover:bg-white'
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
              className="flex flex-col items-center p-3.5 bg-white/70 backdrop-blur-sm rounded-2xl border border-orange-100/50 hover:border-[#C9A227]/40 hover:bg-white transition-all duration-300 group card-3d card-stagger cursor-pointer"
            >
              {/* Image Frame */}
              <div className="relative w-full aspect-[16/11] rounded-xl overflow-hidden mb-4 shadow-sm border border-gray-100/40 group-hover:border-transparent transition-all duration-300 bg-white">
                <Image
                  src={feature.img}
                  alt={feature.title}
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-500"
                  unoptimized
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
