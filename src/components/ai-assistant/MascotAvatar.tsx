'use client';

import Image from 'next/image';
import { motion } from 'framer-motion';

interface MascotAvatarProps {
  onClick?: () => void;
  onMouseEnter?: () => void;
  isAnimating?: boolean;
  className?: string;
  variant?: 'sitting' | 'leaning';
}

export default function MascotAvatar({
  onClick,
  onMouseEnter,
  isAnimating = false,
  className = '',
  variant = 'sitting',
}: MascotAvatarProps) {

  if (variant === 'leaning') {
    return (
      <motion.div
        className={`relative select-none pointer-events-none w-[64px] h-[54px] sm:w-[80px] sm:h-[68px] ${className}`}
        animate={{ y: [0, -3, 0] }}
        transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
      >
        <Image
          src="/mascot-leaning.webp"
          alt="SS Realty AI Mascot"
          fill
          sizes="(max-width: 640px) 64px, 80px"
          className="object-contain w-full h-full drop-shadow-xl"
          priority
        />
      </motion.div>
    );
  }

  // Sitting waving variant (using first pose mascot-main.png)
  return (
    <motion.div
      className={`relative cursor-pointer select-none w-[60px] h-[90px] sm:w-[72px] sm:h-[108px] md:w-[84px] md:h-[126px] pointer-events-auto ${className}`}
      onClick={onClick}
      onMouseEnter={onMouseEnter}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.96 }}
      title="Chat with Aria — SS Realty AI Expert"
    >
      {/* Floating + wave animation wrapper */}
      <motion.div
        animate={
          isAnimating
            ? { y: [0, -6, 0], rotate: [0, 2, -2, 0] }
            : { y: [0, -5, 0] }
        }
        transition={
          isAnimating
            ? { duration: 0.8, repeat: 2, ease: 'easeInOut' }
            : { duration: 3.5, repeat: Infinity, ease: 'easeInOut' }
        }
        className="w-full h-full flex items-center justify-center"
      >
        <Image
          src="/mascot-main.webp"
          alt="SS Realty AI Mascot — Aria"
          width={84}
          height={126}
          priority
          className="object-contain w-full h-full"
          sizes="(max-width: 640px) 60px, (max-width: 768px) 72px, 84px"
          style={{
            filter: 'drop-shadow(0 6px 12px rgba(232,175,48,0.3)) drop-shadow(0 2px 4px rgba(0,0,0,0.15))',
          }}
        />
      </motion.div>

      {/* Gold glow ring under mascot */}
      <motion.div
        className="absolute -bottom-1 left-1/2 -translate-x-1/2 rounded-full w-[75%] h-[5px]"
        style={{
          background: 'radial-gradient(ellipse, rgba(232,175,48,0.6) 0%, transparent 70%)',
          filter: 'blur(2px)',
        }}
        animate={{ scaleX: [1, 1.15, 1], opacity: [0.6, 0.9, 0.6] }}
        transition={{ duration: 3.5, repeat: Infinity, ease: 'easeInOut' }}
      />
    </motion.div>
  );
}
