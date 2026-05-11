"use client";

import Image from 'next/image';

const features = [
  { title: 'Application Based Home Automation System', img: 'https://images.unsplash.com/photo-1558002038-1055907df827?auto=format&fit=crop&w=400&q=75' },
  { title: 'Finger Print Scanner Enabled Main Door Lock', img: 'https://images.unsplash.com/photo-1585412727339-54e4bae3bbf9?auto=format&fit=crop&w=400&q=75' },
  { title: 'Geysers & Exhaust Fans In Kitchen & Washrooms', img: 'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?auto=format&fit=crop&w=400&q=75' },
  { title: 'Water Purifier/RO', img: 'https://images.unsplash.com/photo-1518331647614-7a1f04cd34cf?auto=format&fit=crop&w=400&q=75' },
  { title: 'Fully Loaded Washrooms With Vanity Mirrors', img: 'https://images.unsplash.com/photo-1552321554-5fefe8c9ef14?auto=format&fit=crop&w=400&q=75' },
  { title: 'Space Efficient 2 & 3 BHK Homes', img: 'https://images.unsplash.com/photo-1493663284031-b7e3aefcae8e?auto=format&fit=crop&w=400&q=75' },
  { title: '5 Tier Security System', img: 'https://images.unsplash.com/photo-1557597774-9d273605dfa9?auto=format&fit=crop&w=400&q=75' },
  { title: '9 Acres Of Wellness', img: 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=400&q=75' },
];

export default function ProjectHighlights() {
  return (
    <section className="py-20 bg-[#F8FAFC] relative overflow-hidden">
      {/* Marble/Texture Background Overlay */}
      <div className="absolute inset-0 opacity-[0.03] pointer-events-none" 
        style={{ backgroundImage: 'url("https://www.transparenttextures.com/patterns/marble-similar.png")' }} 
      />
      
      <div className="max-w-[1400px] mx-auto px-6 sm:px-12 lg:px-24 relative z-10">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-[#1A1800] mb-4">
            Project Highlights
          </h2>
          <div className="w-16 h-1 bg-[#C9A227] mx-auto opacity-30" />
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-x-12 gap-y-12">
          {features.map((feature, index) => (
            <div key={index} className="flex flex-col items-center group">
              <div className="relative w-[90%] aspect-[16/11] rounded-2xl overflow-hidden mb-5 shadow-md border border-gray-50 group-hover:border-[#C9A227] transition-all duration-300 bg-white">
                <Image
                  src={feature.img}
                  alt={feature.title}
                  fill
                  className="object-cover group-hover:scale-110 transition-transform duration-500"
                  loading="lazy"
                  sizes="(max-width: 640px) 45vw, (max-width: 1024px) 22vw, 200px"
                  quality={75}
                />
              </div>
              <p className="text-[12px] md:text-xs font-black text-center text-[#334155] leading-tight max-w-[160px] group-hover:text-[#C9A227] transition-colors uppercase tracking-tight">
                {feature.title}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
