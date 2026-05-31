'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, MapPin, Home, Phone, User, Send, Bot, CheckCircle, Loader2, ChevronDown } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import Image from 'next/image';

interface ScrollTriggerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenChat: () => void;
}

const schema = z.object({
  name:         z.string().min(2, 'Enter your name'),
  phone:        z.string().regex(/^[6-9]\d{9}$/, 'Valid 10-digit number required'),
  location:     z.string().optional(),
  propertyType: z.string().optional(),
});
type FormData = z.infer<typeof schema>;

const propertyTypes = ['Apartment', 'Flat', 'Villa / Farm House', 'Plot / Land', 'Commercial'];

// Paper airplane animation from left then settle
const airplaneVariants = {
  initial: { x: -250, y: 40, rotate: -20, opacity: 0, scale: 0.5 },
  fly: {
    x: 0, y: 0,
    rotate: [-20, 10, -5, 3, 0],
    opacity: [0, 1, 1, 1, 1],
    scale: [0.5, 0.9, 1.05, 1, 1],
    transition: { duration: 0.75, ease: [0.25, 0.46, 0.45, 0.94] as any },
  },
};

const SS_LOGO = (
  <svg viewBox="0 0 120 100" width="56" height="46" fill="none">
    {/* Two pillars */}
    <rect x="10" y="30" width="18" height="55" rx="2" fill="#E8AF30"/>
    <rect x="35" y="18" width="18" height="67" rx="2" fill="#E8AF30"/>
    <rect x="60" y="8"  width="18" height="77" rx="2" fill="#E8AF30"/>
    <rect x="85" y="18" width="18" height="67" rx="2" fill="#E8AF30"/>
    {/* Arch top */}
    <path d="M19 30 Q69 -10 101 30" stroke="#E8AF30" strokeWidth="6" fill="none" strokeLinecap="round"/>
    {/* Base line */}
    <line x1="5" y1="88" x2="115" y2="88" stroke="#E8AF30" strokeWidth="5" strokeLinecap="round"/>
  </svg>
);

export default function ScrollTriggerModal({ isOpen, onClose, onOpenChat }: ScrollTriggerModalProps) {
  const [phase, setPhase] = useState<'airplane' | 'form'>('form');
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const { register, handleSubmit, formState: { errors }, setValue, watch } = useForm<FormData>({
    resolver: zodResolver(schema),
  });
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const currentPropertyType = watch('propertyType') || '';

  const handleAnimationComplete = () => {
    setTimeout(() => setPhase('form'), 150);
  };

  const onSubmit = async (data: FormData) => {
    setSubmitting(true);
    try {
      await fetch('/api/ai-assistant/leads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...data, source: 'scroll_modal' }),
      });
      setSubmitted(true);
    } catch { /* ignore */ }
    finally { setSubmitting(false); }
  };

  const handleClose = () => {
    setPhase('form');
    setSubmitted(false);
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            className="fixed inset-0 z-[200]"
            style={{ background: 'rgba(10,8,0,0.72)', backdropFilter: 'blur(8px)' }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={handleClose}
          />

          {/* Modal wrapper */}
          <motion.div
            className="fixed inset-0 z-[201] flex items-center justify-center p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            {/* Outer container with mascot sitting ON TOP */}
            <div className="relative flex flex-col items-center">

              {/* ── MASCOT sitting cross-legged on top of the card ── */}
              <motion.div
                className="relative z-10 pointer-events-none w-[110px] h-[165px] -mb-9 sm:w-[130px] sm:h-[195px] sm:-mb-12"
                animate={{ y: [0, -5, 0] }}
                transition={{ duration: 3.5, repeat: Infinity, ease: 'easeInOut' }}
              >
                <Image
                  src="/mascot-popup.png"
                  alt="SS Realty Mascot"
                  width={280}
                  height={420}
                  priority
                  className="object-contain w-full h-full"
                  style={{
                    filter: 'drop-shadow(0 6px 16px rgba(232,175,48,0.35))',
                  }}
                />
              </motion.div>

              {/* ── CARD ── */}
              <motion.div
                className="relative w-full max-w-[310px] sm:max-w-[340px] rounded-3xl overflow-hidden"
                style={{
                  background: '#FFFEF5',
                  border: '2px solid #E8AF30',
                  boxShadow: '0 24px 60px rgba(232,175,48,0.2), 0 8px 24px rgba(0,0,0,0.12)',
                }}
                initial={{ scale: 0.85, y: 40, opacity: 0 }}
                animate={{ scale: 1,    y: 0,  opacity: 1 }}
                exit={{    scale: 0.9,  y: 20, opacity: 0 }}
                transition={{ type: 'spring', stiffness: 280, damping: 26 }}
                onClick={(e) => e.stopPropagation()}
              >
                {/* Gold glow ring at bottom of card (like mockup) */}
                <div
                  className="absolute -bottom-3 left-1/2 -translate-x-1/2 w-[65%] h-[18px] blur-md pointer-events-none"
                  style={{
                    background: 'radial-gradient(ellipse, rgba(232,175,48,0.65) 0%, transparent 70%)',
                  }}
                />

                {/* Close X */}
                <button
                  onClick={handleClose}
                  className="absolute top-4 right-4 z-10 w-8 h-8 rounded-full flex items-center justify-center transition-colors hover:bg-red-50"
                  style={{ background: 'rgba(232,175,48,0.12)' }}
                  aria-label="Close"
                >
                  <X size={15} color="#8a6a00" />
                </button>

                {/* Card content */}
                <div className="px-7 pt-6 pb-7">
                  {submitted ? (
                    <motion.div
                      className="flex flex-col items-center gap-3 py-6 text-center"
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                    >
                      <div className="w-16 h-16 rounded-full flex items-center justify-center"
                        style={{ background: 'linear-gradient(135deg, #E8AF30, #B58110)' }}>
                        <CheckCircle size={32} color="#FFFEF5" />
                      </div>
                      <h4 className="text-xl font-bold text-[#1A1800]">Thank You!</h4>
                      <p className="text-sm text-gray-600 leading-relaxed">
                        Our property expert will contact you within 30 minutes with exclusive deals.
                      </p>
                      <button
                        onClick={handleClose}
                        className="mt-3 text-sm font-semibold underline underline-offset-2 text-[#E8AF30]"
                      >
                        Continue Browsing
                      </button>
                    </motion.div>
                  ) : (
                    <div className="space-y-5">
                      {/* Header */}
                      <div className="text-center flex flex-col items-center gap-2">
                        {SS_LOGO}
                        <h2 className="text-[19px] font-extrabold text-[#1A1800] leading-tight"
                          style={{ fontFamily: 'Playfair Display, serif' }}>
                          Get Exclusive<br />Property Deals
                        </h2>
                        <p className="text-[11px] text-gray-500 font-medium">
                          Let us help you find your Dream Property
                        </p>
                      </div>

                      {/* Paper airplane → then form */}
                      {phase === 'airplane' && (
                        <motion.div
                          className="flex items-center justify-center py-4"
                          variants={airplaneVariants}
                          initial="initial"
                          animate="fly"
                          onAnimationComplete={handleAnimationComplete}
                        >
                          <svg width="52" height="52" viewBox="0 0 72 72" fill="none">
                            <path d="M8 36 L64 8 L48 64 L36 42 Z" fill="#E8AF30" />
                            <path d="M36 42 L44 30" stroke="#FFFEF5" strokeWidth="2.2" strokeLinecap="round" />
                            {[0,45,90,135,180,225,270,315].map((a,i) => (
                              <line key={i}
                                x1="36" y1="36"
                                x2={36 + 18 * Math.cos(a * Math.PI / 180)}
                                y2={36 + 18 * Math.sin(a * Math.PI / 180)}
                                stroke="#F0D060" strokeWidth="1.5" strokeLinecap="round"
                              />
                            ))}
                          </svg>
                        </motion.div>
                      )}

                      {phase === 'form' && (
                        <motion.form
                          onSubmit={handleSubmit(onSubmit)}
                          className="space-y-3"
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.3 }}
                        >
                           {/* Name */}
                          <div className="relative">
                            <input
                              {...register('name')}
                              placeholder="Your Name"
                              className="ai-input !pl-[36px]"
                            />
                            <User size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                            {errors.name && <p className="ai-error">{errors.name.message}</p>}
                          </div>

                          {/* Phone */}
                          <div className="relative">
                            <input
                              {...register('phone', {
                                onChange: (e) => {
                                  e.target.value = e.target.value.replace(/[^0-9]/g, '');
                                }
                              })}
                              placeholder="Mobile Number"
                              className="ai-input !pl-[36px]"
                              type="tel"
                              inputMode="numeric"
                              maxLength={10}
                            />
                            <Phone size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                            {errors.phone && <p className="ai-error">{errors.phone.message}</p>}
                          </div>

                          {/* Location & Property Type — side by side */}
                          <div className="grid grid-cols-2 gap-2">
                            <div className="relative">
                              <input
                                {...register('location')}
                                placeholder="Preferred Location"
                                className="ai-input !pl-[32px] pr-2"
                                style={{ fontSize: '11px' }}
                              />
                              <MapPin size={12} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                            </div>
                            <div className="relative">
                              {/* Hidden input to hold select value */}
                              <input type="hidden" {...register('propertyType')} />
                              
                              {/* Trigger Button */}
                              <button
                                type="button"
                                onClick={() => setDropdownOpen((prev) => !prev)}
                                className="ai-input !pl-[32px] pr-7 w-full text-left flex items-center justify-between transition-all select-none"
                                style={{ fontSize: '11px', color: currentPropertyType ? '#1A1800' : '#9CA3AF' }}
                              >
                                <span className="truncate">{currentPropertyType || 'Property Type'}</span>
                                <ChevronDown 
                                  size={12} 
                                  className={`text-gray-400 transition-transform duration-200 flex-shrink-0 ${dropdownOpen ? 'rotate-180 text-[#E8AF30]' : ''}`} 
                                />
                              </button>
                              <Home size={12} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />

                              {/* Dropdown Options Overlay */}
                              <AnimatePresence>
                                {dropdownOpen && (
                                  <>
                                    {/* Click outside interceptor overlay */}
                                    <div 
                                      className="fixed inset-0 z-40 cursor-default bg-transparent"
                                      onClick={() => setDropdownOpen(false)}
                                    />
                                    
                                    {/* Options container list */}
                                    <motion.div
                                      className="absolute top-[calc(100%+4px)] left-0 w-full z-50 rounded-xl overflow-hidden shadow-lg border border-[#E8AF30]/40"
                                      style={{
                                        background: '#FFFEF5',
                                        boxShadow: '0 8px 24px rgba(232,175,48,0.15), 0 4px 10px rgba(0,0,0,0.06)',
                                      }}
                                      initial={{ opacity: 0, y: 5, scale: 0.96 }}
                                      animate={{ opacity: 1, y: 0, scale: 1 }}
                                      exit={{ opacity: 0, y: 3, scale: 0.98 }}
                                      transition={{ duration: 0.15, ease: 'easeOut' }}
                                    >
                                      {propertyTypes.map((t) => (
                                        <div
                                          key={t}
                                          onClick={() => {
                                            setValue('propertyType', t, { shouldValidate: true });
                                            setDropdownOpen(false);
                                          }}
                                          className={`px-3 py-2 text-left cursor-pointer transition-colors text-[11px] font-semibold flex items-center justify-between border-b border-gray-100/50 last:border-b-0 ${
                                            currentPropertyType === t
                                              ? 'bg-[#FFF9E6] text-[#B58110]'
                                              : 'hover:bg-[#FFFDF0] hover:text-[#B58110] text-gray-700'
                                          }`}
                                        >
                                          <span>{t}</span>
                                          {currentPropertyType === t && (
                                            <span className="w-1.5 h-1.5 rounded-full bg-[#E8AF30]" />
                                          )}
                                        </div>
                                      ))}
                                    </motion.div>
                                  </>
                                )}
                              </AnimatePresence>
                            </div>
                          </div>

                          {/* CTA Buttons */}
                          <motion.button
                            type="submit"
                            disabled={submitting}
                            className="w-full py-3 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-all"
                            style={{
                              background: 'linear-gradient(135deg, #E8AF30 0%, #B58110 100%)',
                              color: '#1A1800',
                              boxShadow: '0 4px 16px rgba(232,175,48,0.4)',
                            }}
                            whileTap={{ scale: 0.98 }}
                          >
                            {submitting
                              ? <Loader2 size={15} className="animate-spin" />
                              : <><Send size={14} /> Get Best Deals</>
                            }
                          </motion.button>

                          <div className="flex items-center gap-2 py-0.5">
                            <span className="flex-1 h-px bg-gray-200" />
                            <span className="text-[10px] text-gray-400 font-semibold uppercase tracking-wide">or</span>
                            <span className="flex-1 h-px bg-gray-200" />
                          </div>

                          <motion.button
                            type="button"
                            onClick={() => { handleClose(); onOpenChat(); }}
                            className="w-full py-2.5 rounded-xl font-bold text-xs flex items-center justify-center gap-2 border-2 transition-all"
                            style={{ borderColor: '#E8AF30', color: '#B58110', background: 'transparent' }}
                            whileHover={{ background: 'rgba(232,175,48,0.07)' }}
                            whileTap={{ scale: 0.98 }}
                          >
                            <Bot size={13} /> Talk to AI Assistant
                          </motion.button>
                        </motion.form>
                      )}
                    </div>
                  )}
                </div>
              </motion.div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
