"use client";

import { useState } from 'react';
import Image from 'next/image';
import { ArrowLeft, ArrowRight } from 'lucide-react';

const sliderImages = [
  "https://images.unsplash.com/photo-1582407947304-fd86f028f716?auto=format&fit=crop&w=800&q=75", // Luxury Pool
  "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?auto=format&fit=crop&w=800&q=75", // Premium Gym
  "https://images.unsplash.com/photo-1560448204-61dc36dc98c8?auto=format&fit=crop&w=800&q=75", // Luxury Lounge
];

const amenities = [
  { title: 'Gym', img: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=200&q=70' },
  { title: 'Cycling Track', img: 'https://images.unsplash.com/photo-1541625602330-2277a4c46182?w=200&q=70' },
  { title: 'Billiards', img: 'https://images.unsplash.com/photo-1509114397022-ed747cca3f65?w=200&q=70' },
  { title: 'Table Tennis', img: 'https://images.unsplash.com/photo-1608245449230-4ac19066d2d0?w=200&q=70' },
  { title: 'Squash Court', img: 'https://images.unsplash.com/photo-1574271143515-5cddf8da19be?w=200&q=70' },
  { title: 'Tennis Court', img: 'https://images.unsplash.com/photo-1595435934249-5df7ed86e1c0?w=200&q=70' },
  { title: 'Open Dining', img: 'https://images.unsplash.com/photo-1533777857889-4be7c70b33f7?w=200&q=70' },
  { title: 'Cafe & Bar', img: 'https://images.unsplash.com/photo-1554118811-1e0d58224f24?w=200&q=70' },
  { title: 'Carrom', img: 'https://images.unsplash.com/photo-1518609878373-06d740f60d8b?w=200&q=70' },
  { title: 'Chess', img: 'https://images.unsplash.com/photo-1529699211952-734e80c4d42b?w=200&q=70' },
  { title: 'Cardroom', img: 'https://images.unsplash.com/photo-1511193311914-0346f16efe90?w=200&q=70' },
  { title: 'Library', img: 'https://images.unsplash.com/photo-1507842217343-583bb7270b66?w=200&q=70' },
  { title: 'Spa & Sauna', img: 'https://images.unsplash.com/photo-1540555700478-4be289fbecef?w=200&q=70' },
  { title: 'Badminton', img: 'https://images.unsplash.com/photo-1626224583764-f87db24ac4ea?w=200&q=70' },
  { title: 'Swimming Pool', img: 'https://images.unsplash.com/photo-1576013551627-0cc20b96c2a7?w=200&q=70' },
  { title: 'Garden', img: 'https://images.unsplash.com/photo-1511884642898-4c92249e20b6?w=200&q=70' },
  { title: '24x7 CCTV', img: 'https://images.unsplash.com/photo-1557597774-9d273605dfa9?w=200&q=70' },
  { title: 'Yoga & Meditation', img: 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=200&q=70' },
];

export default function AmenitiesSection() {
  const [currentIdx, setCurrentIdx] = useState(0);

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
            <Image 
              src={sliderImages[currentIdx]} 
              alt="Premium Clubhouse Amenities" 
              fill
              className="object-cover transition-all duration-700 group-hover:scale-105"
              sizes="(max-width: 1024px) 100vw, 33vw"
              quality={80}
              loading="lazy"
            />
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
          <div className="grid grid-cols-3 md:grid-cols-6 gap-x-4 gap-y-8">
            {amenities.map((item, index) => (
              <div key={index} className="flex flex-col items-center group">
                <div className="relative w-5/6 md:w-3/4 aspect-square rounded-2xl overflow-hidden mb-3 shadow-md border-2 border-transparent group-hover:border-[#C9A227] transition-all duration-300">
                  <Image
                    src={item.img}
                    alt={item.title}
                    fill
                    className="object-cover group-hover:scale-110 transition-transform duration-500"
                    sizes="(max-width: 640px) 80px, (max-width: 1024px) 60px, 80px"
                    loading="lazy"
                    quality={70}
                  />
                </div>
                <h3 className="text-xs md:text-sm font-semibold text-center text-[#1A1800] group-hover:text-[#C9A227] transition-colors leading-tight">
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
