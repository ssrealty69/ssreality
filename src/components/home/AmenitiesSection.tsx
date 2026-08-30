"use client";

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { ArrowLeft, ArrowRight } from 'lucide-react';

const sliderImages = [
  "/World Class Amenities/Luxury 3BHK & 4BHK Premium Floor Building 1.webp",
  "/World Class Amenities/Luxury 3BHK & 4BHK Premium Floor Building 2.webp",
  "/World Class Amenities/Luxury 3BHK & 4BHK Premium Floor Building 3.webp",
  "/World Class Amenities/Luxury 3BHK & 4BHK Premium Floor Building 4.webp",
];

const amenities = [
  { title: 'Gym', img: '/World Class Amenities/Gym.webp' },
  { title: 'Clubhouse', img: '/World Class Amenities/Clubhouse.jpg' },
  { title: 'Infinity Pool', img: '/World Class Amenities/Infinity Pool.jpg' },
  { title: 'Spa', img: '/World Class Amenities/Spa.jpg' },
  { title: 'Yoga Deck', img: '/World Class Amenities/Yoga Deck.webp' },
  { title: 'Garden', img: '/World Class Amenities/Garden.webp' },
  { title: 'Sky Garden', img: '/World Class Amenities/Sky Garden.webp' },
  { title: 'Kids Zone', img: '/World Class Amenities/Kids Zone.webp' },
  { title: 'Pet Park', img: '/World Class Amenities/Pet Park.webp' },
  { title: 'Badminton', img: '/World Class Amenities/Badminton.jpg' },
  { title: 'Tennis Court', img: '/World Class Amenities/Tennis Court.webp' },
  { title: 'Table Tennis', img: '/World Class Amenities/Table Tennis.jpg' },
  { title: 'Banquet', img: '/World Class Amenities/Banquet.webp' },
  { title: 'Theatre', img: '/World Class Amenities/Theatre.jpg' },
  { title: 'Library', img: '/World Class Amenities/Library.webp' },
  { title: 'Lobby', img: '/World Class Amenities/Lobby.jpg' },
  { title: 'Reception', img: '/World Class Amenities/Reception.jpg' },
  { title: 'Lift Lobby', img: '/World Class Amenities/Lift Lobby.jpg' },
  { title: 'Terrace', img: '/World Class Amenities/Terrace.jpg' },
  { title: 'EV Charging', img: '/World Class Amenities/EV Charging.webp' },
  { title: 'Security Room', img: '/World Class Amenities/Security Room.webp' },
];

export default function AmenitiesSection() {
  const [currentIdx, setCurrentIdx] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentIdx((prev) => (prev + 1) % sliderImages.length);
    }, 4000); // Auto slide every 4 seconds
    return () => clearInterval(timer);
  }, []);

  const nextSlide = () => {
    setCurrentIdx((prev) => (prev + 1) % sliderImages.length);
  };

  const prevSlide = () => {
    setCurrentIdx((prev) => (prev - 1 + sliderImages.length) % sliderImages.length);
  };

  return (
    <section id="amenities-section" className="py-24 relative overflow-hidden bg-[#FFFEF5]">
      {/* 3D Moving Building Background */}
      <div className="absolute inset-0 z-0 select-none pointer-events-none overflow-hidden opacity-[0.22]">
        <style>{`
          @keyframes slowPanZoom {
            0%, 100% { transform: scale(1.05) translate(0px, 0px); }
            50% { transform: scale(1.15) translate(-10px, -5px); }
          }
          @keyframes float {
            0%, 100% { transform: translateY(0); }
            50% { transform: translateY(-6px); }
          }
          .animate-pan-zoom {
            animation: slowPanZoom 20s ease-in-out infinite;
          }
          .animate-float {
            animation: float 4s ease-in-out infinite;
          }
          .card-3d {
            transition: transform 0.4s cubic-bezier(0.2, 0.8, 0.2, 1), box-shadow 0.4s ease;
          }
          .card-3d:hover {
            transform: translateY(-8px) scale(1.03);
            box-shadow: 0 20px 45px rgba(201, 162, 39, 0.25);
          }
        `}</style>
        <Image
          src="/World Class Amenities/Luxury 3BHK & 4BHK Premium Floor Building 3.webp"
          alt="Luxury Building Background Overlay"
          fill
          className="object-cover animate-pan-zoom"
          sizes="100vw"
          quality={85}
        />
        {/* Soft luxury gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-b from-[#FFFEF5]/90 via-transparent to-[#FFFEF5]/90" />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-5xl font-bold font-[var(--font-playfair)] text-[#1A1800] mb-4">
            World Class <span className="text-[#C9A227]">Amenities</span>
          </h2>
          <p className="text-[#6b6450] max-w-2xl mx-auto">
            Indulge in a plethora of world-class amenities curated just for you. From fitness to relaxation, everything you need is right here.
          </p>
        </div>

        <div className="grid lg:grid-cols-[1fr_2fr] gap-12 items-center">
          {/* Left Side: Large Image with Slider controls */}
          <div className="relative w-full aspect-[4/5] rounded-3xl overflow-hidden shadow-2xl group border-4 border-white card-3d">
            {/* Floating Gold Gradient Tag (Top-Left) */}
            <div className="absolute top-6 left-6 z-20 bg-gradient-to-r from-[#A87F18] via-[#FBBF24] to-[#C9A227] text-[#1A1800] px-5 py-2.5 rounded-xl shadow-[0_8px_24px_rgba(201,162,39,0.4)] border border-white/40 flex items-center gap-2.5 font-black uppercase text-[10px] tracking-widest select-none animate-float">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#1A1800] opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-[#1A1800]"></span>
              </span>
              Upcoming Project
            </div>
            {sliderImages.map((img, idx) => (
              <Image 
                key={idx}
                src={img} 
                alt={`Premium Clubhouse Amenities ${idx + 1}`} 
                fill
                className={`object-cover transition-all duration-700 group-hover:scale-105 absolute inset-0 ${
                  idx === currentIdx ? 'opacity-100 z-10' : 'opacity-0 z-0 pointer-events-none'
                }`}
                sizes="(max-width: 1024px) 50vw, 33vw"
                quality={90}
              />
            ))}
            {/* Slider arrows overlay */}
            <div className="absolute inset-0 flex items-center justify-between px-2 md:px-6 opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity duration-300">
              <button 
                onClick={prevSlide}
                className="w-10 h-10 md:w-12 md:h-12 bg-gradient-to-r from-[#C9A227] via-[#F0D060] to-[#B8860B] text-[#1A1800] hover:scale-110 active:scale-95 rounded-full flex items-center justify-center shadow-xl transition-all cursor-pointer z-10 relative overflow-hidden" 
                aria-label="Previous image"
              >
                <div className="absolute inset-0 bg-white/20 animate-[shimmer_2s_infinite]" />
                <ArrowLeft size={20} className="md:w-6 md:h-6 relative z-10" />
              </button>
              <button 
                onClick={nextSlide}
                className="w-10 h-10 md:w-12 md:h-12 bg-gradient-to-r from-[#C9A227] via-[#F0D060] to-[#B8860B] text-[#1A1800] hover:scale-110 active:scale-95 rounded-full flex items-center justify-center shadow-xl transition-all cursor-pointer z-10 relative overflow-hidden" 
                aria-label="Next image"
              >
                <div className="absolute inset-0 bg-white/20 animate-[shimmer_2s_infinite]" />
                <ArrowRight size={20} className="md:w-6 md:h-6 relative z-10" />
              </button>
            </div>
          </div>

          {/* Right Side: Amenities Grid */}
          <div className="grid grid-cols-3 md:grid-cols-7 gap-x-4 md:gap-x-6 gap-y-8 md:gap-y-12">
            {amenities.map((item, index) => (
              <div key={index} className="flex flex-col items-center group">
                <div className="relative w-[90%] md:w-full aspect-square rounded-2xl md:rounded-3xl overflow-hidden mb-3 shadow-md border-2 border-transparent group-hover:border-[#C9A227] transition-all duration-300 card-3d">
                  <Image
                    src={item.img}
                    alt={item.title}
                    fill
                    className="object-cover group-hover:scale-110 transition-transform duration-500"
                    sizes="(max-width: 768px) 33vw, 14vw"
                    quality={85}
                  />
                </div>
                <p className="text-[12px] md:text-xs font-black text-center text-[#334155] group-hover:text-[#C9A227] transition-colors leading-tight uppercase tracking-tight max-w-[110px]">
                  {item.title}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
