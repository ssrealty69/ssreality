'use client';

import { useState, useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import dynamic from 'next/dynamic';
import MascotAvatar from './MascotAvatar';
import SpeechBubble from './SpeechBubble';

// Lazy-load heavy components (client-only, safe since this component itself is 'use client')
const ChatWindow = dynamic(() => import('./ChatWindow'), { ssr: false });

const BUBBLE_AUTO_HIDE_MS = 7000; // auto-dismiss greeting bubble

export default function VirtualSalesAssistant() {
  const [chatOpen, setChatOpen] = useState(false);
  const [bubbleVisible, setBubbleVisible] = useState(false);
  const [isWaving, setIsWaving] = useState(false);
  const [mounted, setMounted] = useState(false);

  // Only run after hydration
  useEffect(() => {
    setMounted(true);
    
    // Prefetch ChatWindow during browser idle time
    const prefetch = () => {
      import('./ChatWindow').catch(() => {});
    };

    if (typeof window !== 'undefined') {
      if ('requestIdleCallback' in window) {
        window.requestIdleCallback(prefetch);
      } else {
        setTimeout(prefetch, 4000);
      }
    }
  }, []);

  // Show greeting bubble + trigger wave after 1.2s on every mount
  useEffect(() => {
    if (!mounted) return;
    const t1 = setTimeout(() => {
      setBubbleVisible(true);
      setIsWaving(true);
      setTimeout(() => setIsWaving(false), 1500);
    }, 1200);
    // Auto-hide bubble
    const t2 = setTimeout(() => setBubbleVisible(false), 1200 + BUBBLE_AUTO_HIDE_MS);
    return () => { clearTimeout(t1); clearTimeout(t2); };
  }, [mounted]);



  const handleMascotClick = () => {
    setBubbleVisible(false);
    setChatOpen((prev) => !prev);
  };

  if (!mounted) return null;

  return (
    <>


      {/* ── Chat Window ── */}
      <ChatWindow
        isOpen={chatOpen}
        onClose={() => setChatOpen(false)}
      />

      {/* ── Mascot + Bubble — bottom-left corner ── */}
      <div
        className="fixed z-[160] select-none pointer-events-none bottom-[80px] md:bottom-4 left-3 md:left-4"
        aria-label="SS Realty AI Property Assistant"
      >
        {/* Speech bubble */}
        <SpeechBubble
          visible={bubbleVisible && !chatOpen}
          onDismiss={() => setBubbleVisible(false)}
          onClick={handleMascotClick}
        />

        {/* Floating mascot */}
        <motion.div
          animate={{ y: [0, -7, 0] }}
          transition={{ duration: 3.5, repeat: Infinity, ease: 'easeInOut' }}
        >
          <MascotAvatar
            onClick={handleMascotClick}
            onMouseEnter={() => {
              setBubbleVisible(false);
              setChatOpen(true);
            }}
            isAnimating={isWaving}
          />
        </motion.div>

        {/* Green dot when chat is open */}
        <AnimatePresence>
          {chatOpen && (
            <motion.div
              className="absolute -top-1 -right-1 w-4 h-4 rounded-full border-2 border-white"
              style={{ background: '#22C55E' }}
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0 }}
            />
          )}
        </AnimatePresence>

        {/* Gold notification dot when chat is closed */}
        <AnimatePresence>
          {!chatOpen && !bubbleVisible && (
            <motion.div
              className="absolute -top-1 -right-1 w-5 h-5 rounded-full border-2 border-white"
              style={{ background: '#C9A227' }}
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
              initial={{ scale: 0 }}
              exit={{ scale: 0 }}
            >
              <span className="absolute inset-0 flex items-center justify-center text-[7px] text-[#1A1800] font-bold">1</span>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </>
  );
}
