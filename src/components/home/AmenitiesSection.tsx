"use client";

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { ArrowLeft, ArrowRight } from 'lucide-react';

const sliderImages = [
  "/World Class%20Amenities/Luxury%203BHK%20%26%204BHK%20Premium%20Floor%20Building%201.png",
  "/World Class%20Amenities/Luxury%203BHK%20%26%204BHK%20Premium%20Floor%20Building%202.png",
  "/World Class%20Amenities/Luxury%203BHK%20%26%204BHK%20Premium%20Floor%20Building%203.png",
  "/World Class%20Amenities/Luxury%203BHK%20%26%204BHK%20Premium%20Floor%20Building%204.png",
];

const amenities = [
  { title: 'Gym', img: '/World Class%20Amenities/Gym.jpg' },
  { title: 'Clubhouse', img: '/World Class%20Amenities/Clubhouse.jpg' },
  { title: 'Infinity Pool', img: '/World Class%20Amenities/Infinity%20Pool.jpg' },
  { title: 'Spa', img: '/World Class%20Amenities/Spa.jpg' },
  { title: 'Yoga Deck', img: '/World Class%20Amenities/Yoga%20Deck.jpg' },
  { title: 'Garden', img: '/World Class%20Amenities/Garden.jpg' },
  { title: 'Sky Garden', img: '/World Class%20Amenities/Sky%20Garden.jpg' },
  { title: 'Kids Zone', img: '/World Class%20Amenities/Kids%20Zone.jpg' },
  { title: 'Pet Park', img: '/World Class%20Amenities/Pet%20Park.jpg' },
  { title: 'Badminton', img: '/World Class%20Amenities/Badminton.jpg' },
  { title: 'Tennis Court', img: '/World Class%20Amenities/Tennis%20Court.jpg' },
  { title: 'Table Tennis', img: '/World Class%20Amenities/Table%20Tennis.jpg' },
  { title: 'Banquet', img: '/World Class%20Amenities/Banquet.jpg' },
  { title: 'Theatre', img: '/World Class%20Amenities/Theatre.jpg' },
  { title: 'Library', img: '/World Class%20Amenities/Library.jpg' },
  { title: 'Lobby', img: '/World Class%20Amenities/Lobby.jpg' },
  { title: 'Reception', img: '/World Class%20Amenities/Reception.jpg' },
  { title: 'Lift Lobby', img: '/World Class%20Amenities/Lift%20Lobby.jpg' },
  { title: 'Terrace', img: '/World Class%20Amenities/Terrace.jpg' },
  { title: 'EV Charging', img: '/World Class%20Amenities/EV%20Charging.jpg' },
  { title: 'Security Room', img: '/World Class%20Amenities/Security%20Room.jpg' },
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
    <section id="amenities-section" className="py-20 bg-white relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
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
          <div className="relative w-full aspect-[4/5] rounded-3xl overflow-hidden shadow-2xl group border-4 border-white">
            {sliderImages.map((img, idx) => (
              <Image 
                key={idx}
                src={img} 
                alt={`Premium Clubhouse Amenities ${idx + 1}`} 
                fill
                className={`object-cover transition-all duration-700 group-hover:scale-105 absolute inset-0 ${
                  idx === currentIdx ? 'opacity-100 z-10' : 'opacity-0 z-0 pointer-events-none'
                }`}
                unoptimized
                priority={idx === 0}
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
                <div className="relative w-[90%] md:w-full aspect-square rounded-2xl md:rounded-3xl overflow-hidden mb-3 shadow-md border-2 border-transparent group-hover:border-[#C9A227] transition-all duration-300">
                  <Image
                    src={item.img}
                    alt={item.title}
                    fill
                    className="object-cover group-hover:scale-110 transition-transform duration-500"
                    unoptimized
                  />
                </div>
                <h3 className="text-[12px] md:text-xs font-black text-center text-[#334155] group-hover:text-[#C9A227] transition-colors leading-tight uppercase tracking-tight max-w-[110px]">
                  {item.title}
                </h3>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
