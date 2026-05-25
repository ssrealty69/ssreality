'use client';

import { motion } from 'framer-motion';
import { Trees, Palette, BookOpen, Trophy, Target, Dumbbell, Droplets, Shield, Wifi, Coffee, Sparkles, CheckCircle } from 'lucide-react';

const getIconForAmenity = (name: string) => {
  const lowerName = name.toLowerCase();
  if (lowerName.includes('gym') || lowerName.includes('fitness')) return Dumbbell;
  if (lowerName.includes('pool') || lowerName.includes('swim')) return Droplets;
  if (lowerName.includes('security') || lowerName.includes('cctv')) return Shield;
  if (lowerName.includes('wifi') || lowerName.includes('internet')) return Wifi;
  if (lowerName.includes('cafe') || lowerName.includes('coffee')) return Coffee;
  if (lowerName.includes('art') || lowerName.includes('craft')) return Palette;
  if (lowerName.includes('tree') || lowerName.includes('garden') || lowerName.includes('park')) return Trees;
  if (lowerName.includes('book') || lowerName.includes('read') || lowerName.includes('library')) return BookOpen;
  if (lowerName.includes('sport') || lowerName.includes('football') || lowerName.includes('cricket')) return Trophy;
  if (lowerName.includes('play') || lowerName.includes('game') || lowerName.includes('pickleball')) return Target;
  if (lowerName.includes('spa') || lowerName.includes('sauna') || lowerName.includes('wellness')) return Sparkles;
  return CheckCircle;
};

export default function AmenitiesGrid({ amenities = [] }: { amenities?: string[] }) {
  if (!amenities || amenities.length === 0) return null;

  return (
    <div className="max-w-6xl mx-auto px-2 sm:px-6 md:px-10 lg:px-20 mb-16">
      <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-6">
        {amenities.map((amenityStr, idx) => {
          const Icon = getIconForAmenity(amenityStr);
          return (
            <div key={idx} className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden flex flex-col h-36 sm:h-48 group hover:shadow-2xl hover:-translate-y-1 transition-all duration-300">
              <div className="flex-1 flex justify-center items-center p-4 sm:p-6 bg-white">
                <motion.div 
                  initial={{ scale: 0.8, opacity: 0 }}
                  whileInView={{ scale: 1, opacity: 1 }}
                  whileHover={{ scale: 1.2, rotate: 5 }}
                  transition={{ type: "spring", stiffness: 300, damping: 15 }}
                  className="p-3 sm:p-4 rounded-full bg-[#C9A227]/5 border border-[#C9A227]/10"
                >
                  <Icon className="w-8 h-8 sm:w-12 sm:h-12 text-[#C9A227]" />
                </motion.div>
              </div>
              <div className="bg-[#C9A227] text-white py-2 sm:py-3 px-3 sm:px-5 flex justify-between items-center shrink-0">
                <span className="font-bold text-[9px] sm:text-[12px] uppercase tracking-wide leading-tight line-clamp-2">{amenityStr}</span>
                <div className="w-3.5 h-3.5 sm:w-5 sm:h-5 rounded-full bg-white/20 flex items-center justify-center border border-white/40 shrink-0 ml-1">
                  <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-white"></div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
