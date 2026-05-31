'use client';

import { motion, AnimatePresence } from 'framer-motion';

interface SpeechBubbleProps {
  visible: boolean;
  onDismiss: () => void;
  onClick?: () => void;
  text?: string;
}

export default function SpeechBubble({ visible, onClick }: SpeechBubbleProps) {
  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          className="absolute pointer-events-auto"
          onClick={onClick}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => e.key === 'Enter' && onClick?.()}
          style={{
            bottom: '28px',
            left: 'calc(100% + 14px)',
            zIndex: 50,
            width: 'min(170px, calc(100vw - 120px))',
            cursor: 'pointer',
          }}
          initial={{ opacity: 0, x: -10, scale: 0.85 }}
          animate={{ opacity: 1,  x: 0,   scale: 1 }}
          exit={{   opacity: 0,  x: -6,  scale: 0.9 }}
          transition={{ type: 'spring', stiffness: 350, damping: 28 }}
        >
          {/*
            ── CSS-only left-pointing tail ──────────────────────────────────
            Two layered pseudo-border-trick squares rotated 45°:
              outer square  → border colour (#E8AF30)
              inner square  → fill colour  (#FFFEF5)
            Both are absolutely positioned so they "merge" with the left edge
            of the bubble with zero gap.
          */}

          {/* Outer diamond (border colour) */}
          <span
            aria-hidden
            style={{
              position: 'absolute',
              left: '-9px',
              top: '22px',
              width: '14px',
              height: '14px',
              background: '#E8AF30',
              transform: 'rotate(45deg)',
              borderRadius: '2px',
              zIndex: 49,
            }}
          />
          {/* Inner diamond (fill colour) — slightly smaller & shifted right */}
          <span
            aria-hidden
            style={{
              position: 'absolute',
              left: '-6px',
              top: '24px',
              width: '12px',
              height: '12px',
              background: '#FFFEF5',
              transform: 'rotate(45deg)',
              borderRadius: '2px',
              zIndex: 51,
            }}
          />

          {/* ── Bubble card ── */}
          <div
            style={{
              position: 'relative',
              zIndex: 52,
              borderRadius: '12px',
              padding: '10px 14px 10px 14px',
              background: 'linear-gradient(135deg, #FFFEF5 0%, #FFF9E6 100%)',
              border: '1.5px solid #E8AF30',
              boxShadow:
                '0 8px 24px rgba(232,175,48,0.18), 0 2px 8px rgba(0,0,0,0.06)',
              fontFamily: 'Inter, sans-serif',
            }}
          >
            {/* Text */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '2px', userSelect: 'none' }}>
              {/* Hi line */}
              <span style={{
                fontWeight: 800,
                fontSize: 'clamp(13px, 2vw, 16px)',
                color: '#1A1800',
                lineHeight: 1,
                marginBottom: '2px',
                display: 'flex',
                alignItems: 'center',
                gap: '3px',
              }}>
                Hi! 👋
              </span>

              {/* Welcome to */}
              <span style={{
                fontSize: 'clamp(9px, 1.4vw, 11px)',
                color: '#6B7280',
                fontWeight: 600,
                lineHeight: 1,
              }}>
                Welcome to
              </span>

              {/* SS Realty */}
              <span style={{
                fontWeight: 800,
                fontSize: 'clamp(13px, 2vw, 15px)',
                color: '#E8AF30',
                lineHeight: 1.2,
              }}>
                SS Realty
              </span>
            </div>

            {/* Tap to chat */}
            <div style={{
              marginTop: '8px',
              fontSize: 'clamp(7.5px, 1.2vw, 9px)',
              fontWeight: 800,
              color: '#3E240D',
              opacity: 0.75,
              display: 'flex',
              alignItems: 'center',
              gap: '3px',
              animation: 'pulse 2s infinite',
            }}>
              ✨ Tap to Chat
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
