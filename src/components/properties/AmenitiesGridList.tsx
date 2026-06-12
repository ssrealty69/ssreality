'use client';

import { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface AmenityImageProps {
  src: string;
  alt: string;
  fallbackText: string;
}

function AmenityImage({ src, alt, fallbackText }: AmenityImageProps) {
  const [error, setError] = useState(false);
  const safeSrc = src.replace(/'/g, '’'); // Replace straight quote with curly apostrophe

  if (error) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-gray-50">
        <span className="text-[#C9A227] text-xl font-bold">{fallbackText}</span>
      </div>
    );
  }

  return (
    <img
      src={safeSrc}
      alt={alt}
      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
      onError={() => setError(true)}
    />
  );
}

interface ColumnGroup {
  type: 'single' | 'double';
  items: string[];
}

const buildColumns = (list: string[]): ColumnGroup[] => {
  const cols: ColumnGroup[] = [];
  let i = 0;
  let patternIdx = 0;
  // Dynamic column layout pattern: single, double, double, single, double
  const pattern: ('single' | 'double')[] = ['single', 'double', 'double', 'single', 'double'];

  while (i < list.length) {
    const colType = pattern[patternIdx % pattern.length];
    if (colType === 'single' || i === list.length - 1) {
      cols.push({ type: 'single', items: [list[i]] });
      i += 1;
    } else {
      cols.push({ type: 'double', items: [list[i], list[i + 1]] });
      i += 2;
    }
    patternIdx++;
  }
  return cols;
};

const getRotation = (idx: number) => {
  const rotations = [
    'rotate-[1deg]',
    'rotate-[-1.5deg]',
    'rotate-[2deg]',
    'rotate-[-1deg]',
    'rotate-[1.5deg]',
    'rotate-[-2deg]'
  ];
  return rotations[idx % rotations.length];
};

const getColOffset = (colIdx: number) => {
  const offsets = [
    'translate-y-2',
    '-translate-y-1.5',
    'translate-y-0',
    'translate-y-3',
    '-translate-y-2',
    'translate-y-1'
  ];
  return offsets[colIdx % offsets.length];
};

export function ProjectAmenitiesGrid({ amenities = [] }: { amenities?: string[] }) {
  if (!amenities || amenities.length === 0) return null;

  const scrollRef = useRef<HTMLDivElement>(null);
  const [scrollProgress, setScrollProgress] = useState(0);
  const columns = buildColumns(amenities);

  const handleScroll = () => {
    if (scrollRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;
      const progress = scrollWidth > clientWidth ? (scrollLeft / (scrollWidth - clientWidth)) * 100 : 0;
      setScrollProgress(progress);
    }
  };

  const scroll = (direction: 'left' | 'right') => {
    if (scrollRef.current) {
      const { scrollLeft, clientWidth } = scrollRef.current;
      const scrollAmount = clientWidth * 0.75;
      scrollRef.current.scrollTo({
        left: direction === 'left' ? scrollLeft - scrollAmount : scrollLeft + scrollAmount,
        behavior: 'smooth',
      });
    }
  };

  return (
    <div className="relative group/grid w-full">
      {/* Left Navigation Arrow */}
      <button
        onClick={() => scroll('left')}
        className="absolute -left-2 md:-left-4 top-1/2 -translate-y-1/2 z-10 w-9 h-9 md:w-11 md:h-11 rounded-full bg-white/90 border border-[#C9A227]/20 shadow-[0_4px_15px_rgba(0,0,0,0.1)] flex items-center justify-center text-[#1A1800] hover:bg-[#C9A227] hover:text-white hover:scale-105 transition-all duration-300 backdrop-blur-xs cursor-pointer group"
      >
        <ChevronLeft className="w-5 h-5 group-hover:-translate-x-0.5 transition-transform" />
      </button>

      {/* Right Navigation Arrow */}
      <button
        onClick={() => scroll('right')}
        className="absolute -right-2 md:-right-4 top-1/2 -translate-y-1/2 z-10 w-9 h-9 md:w-11 md:h-11 rounded-full bg-white/90 border border-[#C9A227]/20 shadow-[0_4px_15px_rgba(0,0,0,0.1)] flex items-center justify-center text-[#1A1800] hover:bg-[#C9A227] hover:text-white hover:scale-105 transition-all duration-300 backdrop-blur-xs cursor-pointer group"
      >
        <ChevronRight className="w-5 h-5 group-hover:translate-x-0.5 transition-transform" />
      </button>

      {/* Scrollable Polaroid Container */}
      <div
        ref={scrollRef}
        onScroll={handleScroll}
        className="flex flex-row gap-5 md:gap-7 overflow-x-auto scroll-smooth snap-x snap-mandatory px-4 md:px-8 py-10 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none] h-[330px] sm:h-[400px] md:h-[430px]"
      >
        {columns.map((col: ColumnGroup, colIdx: number) => (
          <div
            key={colIdx}
            className={`${getColOffset(colIdx)} ${getRotation(colIdx)} flex-shrink-0 snap-start flex flex-col justify-center h-full transition-all duration-300 [perspective:1000px]`}
          >
            {col.type === 'single' ? (
              // Single item column
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 15 }}
                whileInView={{ opacity: 1, scale: 1, y: 0 }}
                viewport={{ once: true, margin: '-20px' }}
                transition={{ duration: 0.5, delay: Math.min(colIdx * 0.04, 0.25) }}
                whileHover={{
                  y: -12,
                  z: 20,
                  rotateX: 8,
                  rotateY: -8,
                  scale: 1.03,
                  boxShadow: "0 30px 60px -15px rgba(201,162,39,0.22)"
                }}
                className="w-[170px] sm:w-[210px] md:w-[240px] h-[90%] bg-white p-2 md:p-3 shadow-[0_8px_25px_rgba(0,0,0,0.08)] flex flex-col border border-gray-150 rounded-xs group [transform-style:preserve-3d] cursor-pointer"
              >
                <div className="relative flex-1 min-h-0 overflow-hidden bg-gray-100 rounded-xs mb-2 md:mb-3 [transform-style:preserve-3d] transition-all duration-500 ease-out group-hover:[transform:translateZ(25px)] group-hover:shadow-[0_12px_24px_rgba(0,0,0,0.22)]">
                  <AmenityImage
                    src={`/Project Amenities/${col.items[0].replace(/'/g, "")}.jpg`}
                    alt={col.items[0]}
                    fallbackText="✦"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/5 via-transparent to-transparent opacity-60" />
                </div>
                <div className="flex-none h-6 md:h-8 flex items-center justify-center text-center px-1 transition-transform duration-500 ease-out group-hover:[transform:translateZ(12px)]">
                  <span className="text-[7px] sm:text-[9px] md:text-[10px] font-black text-[#1A1800] uppercase tracking-wide leading-tight line-clamp-2 block group-hover:text-[#C9A227] transition-colors duration-300">
                    {col.items[0]}
                  </span>
                </div>
              </motion.div>
            ) : (
              // Double item column stack
              <div className="w-[140px] sm:w-[180px] md:w-[200px] h-[90%] flex flex-col justify-between">
                {col.items.map((item, subIdx) => (
                  <div
                    key={subIdx}
                    className={`${getRotation(subIdx + 1)} w-full h-[47%] [perspective:1000px]`}
                  >
                    <motion.div
                      initial={{ opacity: 0, scale: 0.95, y: 15 }}
                      whileInView={{ opacity: 1, scale: 1, y: 0 }}
                      viewport={{ once: true, margin: '-20px' }}
                      transition={{ duration: 0.5, delay: Math.min((colIdx * 2 + subIdx) * 0.04, 0.25) }}
                      whileHover={{
                        y: -8,
                        z: 15,
                        rotateX: 6,
                        rotateY: -6,
                        scale: 1.03,
                        boxShadow: "0 20px 40px -8px rgba(201,162,39,0.18)"
                      }}
                      className="w-full h-full bg-white p-1.5 md:p-2.5 shadow-[0_6px_20px_rgba(0,0,0,0.07)] flex flex-col border border-gray-150 rounded-xs group [transform-style:preserve-3d] cursor-pointer"
                    >
                      <div className="relative flex-grow min-h-0 overflow-hidden bg-gray-100 rounded-xs mb-1.5 md:mb-2 [transform-style:preserve-3d] transition-all duration-500 ease-out group-hover:[transform:translateZ(20px)] group-hover:shadow-[0_8px_20px_rgba(0,0,0,0.2)]">
                        <AmenityImage
                          src={`/Project Amenities/${item.replace(/'/g, "")}.jpg`}
                          alt={item}
                          fallbackText="✦"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/5 via-transparent to-transparent opacity-60" />
                      </div>
                      <div className="flex-none h-4 md:h-6 flex items-center justify-center text-center px-1 transition-transform duration-500 ease-out group-hover:[transform:translateZ(10px)]">
                        <span className="text-[7px] sm:text-[8px] md:text-[9.5px] font-black text-[#1A1800] uppercase tracking-wide leading-tight line-clamp-2 block group-hover:text-[#C9A227] transition-colors duration-300">
                          {item}
                        </span>
                      </div>
                    </motion.div>
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Progress Scrollbar Indicator */}
      <div className="w-36 h-[2px] bg-gray-100 mx-auto rounded-full mt-4 relative overflow-hidden">
        <div
          className="absolute left-0 top-0 bottom-0 bg-[#C9A227] transition-all duration-150 rounded-full"
          style={{ width: `${scrollProgress}%` }}
        />
      </div>
    </div>
  );
}

export function WorldClassAmenitiesGrid({ amenities = [] }: { amenities?: string[] }) {
  if (!amenities || amenities.length === 0) return null;

  const scrollRef = useRef<HTMLDivElement>(null);
  const [scrollProgress, setScrollProgress] = useState(0);
  const columns = buildColumns(amenities);

  const handleScroll = () => {
    if (scrollRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;
      const progress = scrollWidth > clientWidth ? (scrollLeft / (scrollWidth - clientWidth)) * 100 : 0;
      setScrollProgress(progress);
    }
  };

  const scroll = (direction: 'left' | 'right') => {
    if (scrollRef.current) {
      const { scrollLeft, clientWidth } = scrollRef.current;
      const scrollAmount = clientWidth * 0.75;
      scrollRef.current.scrollTo({
        left: direction === 'left' ? scrollLeft - scrollAmount : scrollLeft + scrollAmount,
        behavior: 'smooth',
      });
    }
  };

  return (
    <div className="relative group/grid w-full">
      {/* Left Navigation Arrow */}
      <button
        onClick={() => scroll('left')}
        className="absolute -left-2 md:-left-4 top-1/2 -translate-y-1/2 z-10 w-9 h-9 md:w-11 md:h-11 rounded-full bg-white/90 border border-[#C9A227]/20 shadow-[0_4px_15px_rgba(0,0,0,0.1)] flex items-center justify-center text-[#1A1800] hover:bg-[#C9A227] hover:text-white hover:scale-105 transition-all duration-300 backdrop-blur-xs cursor-pointer group"
      >
        <ChevronLeft className="w-5 h-5 group-hover:-translate-x-0.5 transition-transform" />
      </button>

      {/* Right Navigation Arrow */}
      <button
        onClick={() => scroll('right')}
        className="absolute -right-2 md:-right-4 top-1/2 -translate-y-1/2 z-10 w-9 h-9 md:w-11 md:h-11 rounded-full bg-white/90 border border-[#C9A227]/20 shadow-[0_4px_15px_rgba(0,0,0,0.1)] flex items-center justify-center text-[#1A1800] hover:bg-[#C9A227] hover:text-white hover:scale-105 transition-all duration-300 backdrop-blur-xs cursor-pointer group"
      >
        <ChevronRight className="w-5 h-5 group-hover:translate-x-0.5 transition-transform" />
      </button>

      {/* Scrollable Polaroid Container */}
      <div
        ref={scrollRef}
        onScroll={handleScroll}
        className="flex flex-row gap-5 md:gap-7 overflow-x-auto scroll-smooth snap-x snap-mandatory px-4 md:px-8 py-10 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none] h-[330px] sm:h-[400px] md:h-[430px]"
      >
        {columns.map((col: ColumnGroup, colIdx: number) => (
          <div
            key={colIdx}
            className={`${getColOffset(colIdx)} ${getRotation(colIdx)} flex-shrink-0 snap-start flex flex-col justify-center h-full transition-all duration-300 [perspective:1000px]`}
          >
            {col.type === 'single' ? (
              // Single item column
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 15 }}
                whileInView={{ opacity: 1, scale: 1, y: 0 }}
                viewport={{ once: true, margin: '-20px' }}
                transition={{ duration: 0.5, delay: Math.min(colIdx * 0.04, 0.25) }}
                whileHover={{
                  y: -12,
                  z: 20,
                  rotateX: 8,
                  rotateY: -8,
                  scale: 1.03,
                  boxShadow: "0 30px 60px -15px rgba(201,162,39,0.22)"
                }}
                className="w-[170px] sm:w-[210px] md:w-[240px] h-[90%] bg-white p-2 md:p-3 shadow-[0_8px_25px_rgba(0,0,0,0.08)] flex flex-col border border-gray-150 rounded-xs group [transform-style:preserve-3d] cursor-pointer"
              >
                <div className="relative flex-1 min-h-0 overflow-hidden bg-gray-100 rounded-xs mb-2 md:mb-3 [transform-style:preserve-3d] transition-all duration-500 ease-out group-hover:[transform:translateZ(25px)] group-hover:shadow-[0_12px_24px_rgba(0,0,0,0.22)]">
                  <AmenityImage
                    src={`/World Class Amenities/${col.items[0]}.jpg`}
                    alt={col.items[0]}
                    fallbackText="★"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/5 via-transparent to-transparent opacity-60" />
                </div>
                <div className="flex-none h-6 md:h-8 flex items-center justify-center text-center px-1 transition-transform duration-500 ease-out group-hover:[transform:translateZ(12px)]">
                  <span className="text-[7px] sm:text-[9px] md:text-[10px] font-black text-[#1A1800] uppercase tracking-wide leading-tight line-clamp-2 block group-hover:text-[#C9A227] transition-colors duration-300">
                    {col.items[0]}
                  </span>
                </div>
              </motion.div>
            ) : (
              // Double item column stack
              <div className="w-[140px] sm:w-[180px] md:w-[200px] h-[90%] flex flex-col justify-between">
                {col.items.map((item, subIdx) => (
                  <div
                    key={subIdx}
                    className={`${getRotation(subIdx + 1)} w-full h-[47%] [perspective:1000px]`}
                  >
                    <motion.div
                      initial={{ opacity: 0, scale: 0.95, y: 15 }}
                      whileInView={{ opacity: 1, scale: 1, y: 0 }}
                      viewport={{ once: true, margin: '-20px' }}
                      transition={{ duration: 0.5, delay: Math.min((colIdx * 2 + subIdx) * 0.04, 0.25) }}
                      whileHover={{
                        y: -8,
                        z: 15,
                        rotateX: 6,
                        rotateY: -6,
                        scale: 1.03,
                        boxShadow: "0 20px 40px -8px rgba(201,162,39,0.18)"
                      }}
                      className="w-full h-full bg-white p-1.5 md:p-2.5 shadow-[0_6px_20px_rgba(0,0,0,0.07)] flex flex-col border border-gray-150 rounded-xs group [transform-style:preserve-3d] cursor-pointer"
                    >
                      <div className="relative flex-grow min-h-0 overflow-hidden bg-gray-100 rounded-xs mb-1.5 md:mb-2 [transform-style:preserve-3d] transition-all duration-500 ease-out group-hover:[transform:translateZ(20px)] group-hover:shadow-[0_8px_20px_rgba(0,0,0,0.2)]">
                        <AmenityImage
                          src={`/World Class Amenities/${item}.jpg`}
                          alt={item}
                          fallbackText="★"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/5 via-transparent to-transparent opacity-60" />
                      </div>
                      <div className="flex-none h-4 md:h-6 flex items-center justify-center text-center px-1 transition-transform duration-500 ease-out group-hover:[transform:translateZ(10px)]">
                        <span className="text-[7px] sm:text-[8px] md:text-[9.5px] font-black text-[#1A1800] uppercase tracking-wide leading-tight line-clamp-2 block group-hover:text-[#C9A227] transition-colors duration-300">
                          {item}
                        </span>
                      </div>
                    </motion.div>
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Progress Scrollbar Indicator */}
      <div className="w-36 h-[2px] bg-gray-100 mx-auto rounded-full mt-4 relative overflow-hidden">
        <div
          className="absolute left-0 top-0 bottom-0 bg-[#C9A227] transition-all duration-150 rounded-full"
          style={{ width: `${scrollProgress}%` }}
        />
      </div>
    </div>
  );
}

export default function AmenitiesGrid({ amenities = [] }: { amenities?: string[] }) {
  return <ProjectAmenitiesGrid amenities={amenities} />;
}
