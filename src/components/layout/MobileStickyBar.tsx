'use client';

import { Phone, MessageSquare } from 'lucide-react';
import { usePathname } from 'next/navigation';

export default function MobileStickyBar() {
  const pathname = usePathname();

  // Hide on admin routes or floorview full screen routes
  if (pathname?.startsWith('/admin') || pathname?.includes('/floorview')) {
    return null;
  }

  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-[#1A1800]/95 backdrop-blur-md border-t border-[#C9A227]/30 shadow-2xl p-2.5 flex items-center justify-between gap-2">
      <a
        href="tel:+919311059100"
        className="flex-1 py-3 px-4 rounded-xl bg-gradient-to-r from-[#C9A227] to-[#B8860B] text-[#1A1800] font-black text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg shadow-[#C9A227]/20 active:scale-95 transition-transform"
      >
        <Phone size={16} className="fill-[#1A1800]" />
        <span>Call Now</span>
      </a>

      <a
        href="https://wa.me/919311059100?text=Hi%20SS%20Realty,%20I%20am%20interested%20in%20your%20properties."
        target="_blank"
        rel="noopener noreferrer"
        className="flex-1 py-3 px-4 rounded-xl bg-[#25D366] text-white font-black text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg shadow-[#25D366]/20 active:scale-95 transition-transform"
      >
        <MessageSquare size={16} className="fill-white" />
        <span>WhatsApp</span>
      </a>
    </div>
  );
}
