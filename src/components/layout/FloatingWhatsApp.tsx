'use client';

import { MessageCircle } from 'lucide-react';

export default function FloatingWhatsApp() {
  const waLink = "https://wa.me/919311059100?text=Hello SS Realty, I am interested in your properties. Please share more details.";

  return (
    <a
      href={waLink}
      target="_blank"
      rel="noopener noreferrer"
      className="fixed bottom-24 md:bottom-8 right-4 md:right-8 z-[9999] flex items-center gap-2 bg-[#25D366] text-white px-5 py-3 rounded-full shadow-2xl hover:scale-110 transition-all duration-300 group font-bold"
    >
      <MessageCircle size={24} className="fill-white" />
      <span className="max-w-0 overflow-hidden group-hover:max-w-xs transition-all duration-500 ease-in-out whitespace-nowrap">
        Chat with Us
      </span>
      
      {/* Pulse Effect */}
      <span className="absolute inset-0 rounded-full bg-[#25D366] opacity-30 animate-ping -z-10" />
    </a>
  );
}
