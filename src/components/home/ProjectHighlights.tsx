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
    <section className="py-24 relative overflow-hidden bg-[#F8FAFC]">
      {/* Dotted Blueprint Grid Pattern */}
      <div className="absolute inset-0 z-0 select-none pointer-events-none overflow-hidden bg-[radial-gradient(rgba(201,162,39,0.1)_1.5px,transparent_1.5px)] [background-size:24px_24px] opacity-70">
        <style>{`
          .card-3d {
            transition: transform 0.4s cubic-bezier(0.2, 0.8, 0.2, 1), box-shadow 0.4s ease;
          }
          .card-3d:hover {
            transform: translateY(-8px) scale(1.03);
            box-shadow: 0 20px 45px rgba(201, 162, 39, 0.25);
          }
        `}</style>
        {/* Soft luxury gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-b from-[#F8FAFC] via-transparent to-[#F8FAFC]" />
      </div>
      
      <div className="max-w-[1400px] mx-auto px-6 sm:px-12 lg:px-24 relative z-10">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-5xl font-bold font-[var(--font-playfair)] text-[#1A1800] mb-4">
            Project <span className="text-[#C9A227]">Highlights</span>
          </h2>
          <p className="text-[#6b6450] max-w-2xl mx-auto">
            Discover the exceptional features and premium specifications that define our project. Crafted to deliver an unparalleled living experience for you and your family.
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-6 gap-x-8 md:gap-x-12 gap-y-10 md:gap-y-12">
          {features.map((feature, index) => (
            <div key={index} className="flex flex-col items-center group">
              <div className="relative w-full aspect-square rounded-3xl overflow-hidden mb-5 shadow-md border-2 border-transparent group-hover:border-[#C9A227] transition-all duration-300 card-3d">
                <Image
                  src={feature.img}
                  alt={feature.title}
                  fill
                  className="object-cover group-hover:scale-110 transition-transform duration-500"
                  unoptimized
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
