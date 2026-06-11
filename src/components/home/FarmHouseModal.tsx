"use client";

import { useState } from 'react';
import Image from 'next/image';
import { X, CheckCircle2, Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';

interface FarmHouseModalProps {
  onClose: () => void;
}

export default function FarmHouseModal({ onClose }: FarmHouseModalProps) {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [requirement, setRequirement] = useState('');
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handlePhoneChange = (val: string) => {
    const cleaned = val.replace(/\D/g, '').slice(0, 10);
    setPhone(cleaned);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (phone.length !== 10) {
      toast.error('Please enter a valid 10-digit mobile number');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch('/api/property-enquiry', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: name.trim(),
          phone: phone,
          requirement: requirement.trim(),
          propertyId: 'luxury-farm-houses',
          propertyTitle: 'Luxury Farm House & Villa Collection',
          propertyUrl: typeof window !== 'undefined' ? window.location.origin + window.location.pathname + '#farm-house-villa' : '/#farm-house-villa',
        }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setSubmitted(true);
        toast.success('Your requirement has been submitted successfully!');
        setTimeout(() => {
          onClose();
        }, 2500);
      } else {
        toast.error(data.error || 'Failed to submit enquiry');
      }
    } catch (err) {
      console.error(err);
      toast.error('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
      {/* Dark blur overlay */}
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={() => { if (!loading) onClose(); }}
        className="fixed inset-0 bg-[#0B0A06]/80 backdrop-blur-md"
      />
      
      {/* Modal Container */}
      <motion.div 
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        transition={{ type: "spring", duration: 0.5 }}
        className="relative w-full max-w-md bg-[#0B0A06] rounded-3xl shadow-[0_25px_60px_rgba(0,0,0,0.85)] overflow-hidden border border-[#C9A227]/30 z-10"
      >
        {/* Image Header */}
        <div className="relative h-48 w-full overflow-hidden">
          <Image 
            src="/Farm House/Farm House Image 1.webp" 
            alt="Luxury Farm House Collection" 
            fill
            className="object-cover"
            sizes="(max-width: 600px) 100vw, 448px"
            quality={80}
          />
          {/* Dark gradient overlay on image */}
          <div className="absolute inset-0 bg-gradient-to-t from-[#0B0A06] via-[#0B0A06]/40 to-transparent" />
          
          {/* Golden horizontal line under image */}
          <div className="absolute bottom-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-[#C9A227]/50 to-transparent" />

          {/* Title overlaid on image bottom-left */}
          <div className="absolute bottom-4 left-6 right-6">
            <span className="text-[10px] font-black text-[#E8C96A] uppercase tracking-[0.25em] block mb-1">Exclusive Enquiry</span>
            <h3 className="text-xl font-bold text-white leading-tight font-heading bg-gradient-to-r from-[#FFE59E] via-[#E8C96A] to-[#C9A227] bg-clip-text text-transparent"
              style={{ WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', fontFamily: 'var(--font-playfair, Georgia, serif)' }}>
              Luxury Farm Houses &amp; Villas
            </h3>
          </div>
          {/* Close button inside image top-right */}
          <button 
            onClick={() => onClose()}
            disabled={loading}
            className="absolute top-4 right-4 z-30 w-8 h-8 rounded-full bg-black/60 backdrop-blur-md text-white/70 hover:text-[#E8C96A] transition-colors flex items-center justify-center cursor-pointer border border-white/10"
          >
            <X size={16} />
          </button>
        </div>

        {/* Form Content body */}
        <div className="p-6 sm:p-7">
          {submitted ? (
            <div className="py-8 text-center animate-in fade-in zoom-in duration-300">
              <div className="w-14 h-14 bg-[#C9A227]/10 rounded-full flex items-center justify-center mx-auto mb-4 border border-[#C9A227]/40 shadow-[0_0_15px_rgba(201,162,39,0.2)]">
                <CheckCircle2 className="text-[#E8C96A] stroke-[2.5]" size={28} />
              </div>
              <h4 className="text-base font-extrabold text-[#E8C96A] uppercase tracking-wider">Enquiry Submitted!</h4>
              <p className="text-xs text-white/60 mt-2 font-medium">Our property advisor will get in touch with you shortly.</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Full Name */}
              <div className="space-y-1.5">
                <label className="text-[9px] font-black text-[#E8C96A] uppercase tracking-widest ml-1">Full Name</label>
                <input 
                  type="text" 
                  placeholder="Your full name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl focus:border-[#C9A227]/80 text-xs font-semibold text-white outline-none transition-all placeholder:text-white/30 hover:bg-white/[0.08]"
                  required 
                  disabled={loading}
                />
              </div>

              {/* Phone Number */}
              <div className="space-y-1.5">
                <label className="text-[9px] font-black text-[#E8C96A] uppercase tracking-widest ml-1">Phone Number</label>
                <div className="flex rounded-xl overflow-hidden border border-white/10 focus-within:border-[#C9A227]/80 bg-white/5 hover:bg-white/[0.08] transition-all">
                  <span 
                    className="px-3.5 flex items-center justify-center text-xs font-bold text-[#E8C96A] border-r border-white/10 bg-white/[0.03] select-none"
                  >
                    +91
                  </span>
                  <input 
                    type="tel" 
                    placeholder="XXXXXXXXXX"
                    value={phone}
                    onChange={(e) => handlePhoneChange(e.target.value)}
                    className="w-full px-4 py-3 bg-transparent text-xs font-semibold text-white outline-none placeholder:text-white/30"
                    required 
                    disabled={loading}
                  />
                </div>
              </div>

              {/* Requirement text area */}
              <div className="space-y-1.5">
                <label className="text-[9px] font-black text-[#E8C96A] uppercase tracking-widest ml-1">Requirement Details</label>
                <textarea 
                  placeholder="Describe your requirement (e.g. Budget, BHK preference, Preferred timing to call)"
                  value={requirement}
                  onChange={(e) => setRequirement(e.target.value)}
                  rows={3}
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl focus:border-[#C9A227]/80 text-xs font-semibold text-white outline-none transition-all placeholder:text-white/30 hover:bg-white/[0.08] resize-none"
                  disabled={loading}
                />
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full py-3.5 mt-4 rounded-xl bg-gradient-to-r from-[#C9A227] via-[#E8C96A] to-[#C9A227] hover:brightness-110 text-[#0B0A06] text-xs font-extrabold uppercase tracking-widest shadow-[0_4px_20px_rgba(201,162,39,0.35)] flex items-center justify-center gap-2 cursor-pointer transition-all active:scale-[0.98] disabled:opacity-50"
                style={{ backgroundSize: '200% 100%' }}
              >
                {loading ? (
                  <>
                    <Loader2 size={14} className="animate-spin text-[#0B0A06]" />
                    Submitting Enquiry...
                  </>
                ) : (
                  'Request Details'
                )}
              </button>
            </form>
          )}
        </div>
      </motion.div>
    </div>
  );
}
