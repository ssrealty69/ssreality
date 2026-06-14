"use client";

import { useState } from 'react';
import Image from 'next/image';
import { X, CheckCircle2, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import type { Property } from '@/types';

interface BrochureModalProps {
  property: Property;
  images: string[];
  waLink: string;
  onClose: () => void;
}

export default function BrochureModal({ property, images, waLink, onClose }: BrochureModalProps) {
  const [brochureName, setBrochureName] = useState('');
  const [brochurePhone, setBrochurePhone] = useState('');
  const [brochureLookingFor, setBrochureLookingFor] = useState('3BHK');
  const [brochureLoading, setBrochureLoading] = useState(false);
  const [brochureSubmitted, setBrochureSubmitted] = useState(false);

  const handleBrochurePhoneChange = (val: string) => {
    const cleaned = val.replace(/\D/g, '').slice(0, 10);
    setBrochurePhone(cleaned);
  };

  const handleBrochureSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (brochurePhone.length !== 10) {
      toast.error('Please enter a valid 10-digit mobile number');
      return;
    }

    setBrochureLoading(true);
    try {
      const res = await fetch('/api/property-enquiry', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: brochureName.trim(),
          phone: brochurePhone,
          requirement: `Brochure Download Request. Looking for: ${brochureLookingFor}`,
          propertyId: property._id,
          propertyTitle: property.title,
          propertyUrl: typeof window !== 'undefined' ? window.location.origin + `/properties/${property._id}` : `/properties/${property._id}`,
        }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setBrochureSubmitted(true);
        toast.success('Your details have been submitted. Downloading brochure...');
        
        // Trigger download of brochure
        if (property.brochureUrl) {
          try {
            // Attempt to fetch the file directly to force a true local download
            const response = await fetch(property.brochureUrl);
            
            // Check if it's an HTML page (like a Google Drive view link)
            const contentType = response.headers.get('content-type');
            if (contentType && contentType.includes('text/html')) {
              // It's a webpage, just open it
              window.open(property.brochureUrl, '_blank', 'noopener,noreferrer');
            } else {
              const blob = await response.blob();
              const blobUrl = window.URL.createObjectURL(blob);
              
              let filename = 'brochure.pdf';
              const urlParts = property.brochureUrl.split('/');
              const lastPart = urlParts[urlParts.length - 1];
              if (lastPart && lastPart.includes('.')) {
                filename = decodeURIComponent(lastPart.split('?')[0]);
              }
              if (!filename.toLowerCase().endsWith('.pdf')) {
                filename += '.pdf';
              }

              const link = document.createElement('a');
              link.href = blobUrl;
              link.setAttribute('download', filename);
              document.body.appendChild(link);
              link.click();
              document.body.removeChild(link);
              
              setTimeout(() => window.URL.revokeObjectURL(blobUrl), 1000);
            }
          } catch (error) {
            // Fallback for CORS issues (e.g., external Google Drive link)
            console.warn('Direct download blocked by CORS, opening in new tab instead.');
            window.open(property.brochureUrl, '_blank', 'noopener,noreferrer');
          }
        } else {
          // Fallback to whatsapp if no brochure URL is uploaded
          window.open(waLink, '_blank', 'noopener,noreferrer');
        }

        setTimeout(() => {
          onClose();
        }, 2500);
      } else {
        toast.error(data.error || 'Failed to submit request');
      }
    } catch (err) {
      console.error(err);
      toast.error('Network error. Please try again.');
    } finally {
      setBrochureLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
      {/* Dark blur overlay */}
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={() => { if (!brochureLoading) onClose(); }}
        className="fixed inset-0 bg-[#0B0A06]/80 backdrop-blur-md"
      />
      
      {/* Modal Container */}
      <motion.div 
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        transition={{ type: "spring", duration: 0.5 }}
        className="relative w-full max-w-md bg-[#0B0A06] rounded-3xl shadow-[0_25px_60px_rgba(0,0,0,0.85)] overflow-hidden border border-[#C9A227]/30 z-10 text-left"
      >
        {/* Image Header: Always the first image of the property/building */}
        <div className="relative h-48 w-full overflow-hidden bg-gray-900">
          <Image 
            src={images[0]} 
            alt={property.title} 
            fill
            className="object-cover"
            priority
          />
          {/* Dark gradient overlay on image */}
          <div className="absolute inset-0 bg-gradient-to-t from-[#0B0A06] via-[#0B0A06]/40 to-transparent" />
          
          {/* Golden horizontal line under image */}
          <div className="absolute bottom-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-[#C9A227]/50 to-transparent" />

          {/* Title overlaid on image bottom-left */}
          <div className="absolute bottom-4 left-6 right-6">
            <span className="text-[10px] font-black text-[#E8C96A] uppercase tracking-[0.25em] block mb-1">Download Brochure</span>
            <h3 className="text-xl font-bold text-white leading-tight font-heading bg-gradient-to-r from-[#FFE59E] via-[#E8C96A] to-[#C9A227] bg-clip-text text-transparent"
              style={{ WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', fontFamily: 'var(--font-playfair, Georgia, serif)' }}>
              {property.title}
            </h3>
          </div>
          {/* Close button inside image top-right */}
          <button 
            onClick={() => onClose()}
            disabled={brochureLoading}
            className="absolute top-4 right-4 z-30 w-8 h-8 rounded-full bg-black/60 backdrop-blur-md text-white/70 hover:text-[#E8C96A] transition-colors flex items-center justify-center cursor-pointer border border-white/10"
          >
            <X size={16} />
          </button>
        </div>

        {/* Form Content body */}
        <div className="p-6 sm:p-7">
          {brochureSubmitted ? (
            <div className="py-8 text-center animate-in fade-in zoom-in duration-300">
              <div className="w-14 h-14 bg-[#C9A227]/10 rounded-full flex items-center justify-center mx-auto mb-4 border border-[#C9A227]/40 shadow-[0_0_15px_rgba(201,162,39,0.2)]">
                <CheckCircle2 className="text-[#E8C96A] stroke-[2.5]" size={28} />
              </div>
              <h4 className="text-base font-extrabold text-[#E8C96A] uppercase tracking-wider">Request Submitted!</h4>
              <p className="text-xs text-white/60 mt-2 font-medium">Your brochure download will start automatically.</p>
            </div>
          ) : (
            <form onSubmit={handleBrochureSubmit} className="space-y-4">
              {/* Full Name */}
              <div className="space-y-1.5">
                <label className="text-[9px] font-black text-[#E8C96A] uppercase tracking-widest ml-1">Full Name</label>
                <input 
                  type="text" 
                  placeholder="Your full name"
                  value={brochureName}
                  onChange={(e) => setBrochureName(e.target.value)}
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl focus:border-[#C9A227]/80 text-xs font-semibold text-white outline-none transition-all placeholder:text-white/30 hover:bg-white/[0.08]"
                  required 
                  disabled={brochureLoading}
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
                    value={brochurePhone}
                    onChange={(e) => handleBrochurePhoneChange(e.target.value)}
                    className="w-full px-4 py-3 bg-transparent text-xs font-semibold text-white outline-none placeholder:text-white/30"
                    required 
                    disabled={brochureLoading}
                  />
                </div>
              </div>

              {/* Looking For Radio Buttons */}
              <div className="space-y-2">
                <label className="text-[9px] font-black text-[#E8C96A] uppercase tracking-widest ml-1">Looking For</label>
                <div className="flex gap-3">
                  {['3BHK', '4BHK', 'Other'].map(option => (
                    <label key={option} className="flex-1 cursor-pointer">
                      <input 
                        type="radio" 
                        name="lookingFor" 
                        value={option}
                        checked={brochureLookingFor === option}
                        onChange={(e) => setBrochureLookingFor(e.target.value)}
                        className="peer hidden"
                      />
                      <div className="text-center py-2.5 px-3 rounded-xl border border-white/10 bg-white/5 text-xs font-semibold text-white/50 peer-checked:bg-[#C9A227]/20 peer-checked:border-[#C9A227]/50 peer-checked:text-[#E8C96A] hover:bg-white/[0.08] transition-all select-none">
                        {option}
                      </div>
                    </label>
                  ))}
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={brochureLoading}
                className="w-full py-3.5 mt-4 rounded-xl bg-gradient-to-r from-[#C9A227] via-[#E8C96A] to-[#C9A227] hover:brightness-110 text-[#0B0A06] text-xs font-extrabold uppercase tracking-widest shadow-[0_4px_20px_rgba(201,162,39,0.35)] flex items-center justify-center gap-2 cursor-pointer transition-all active:scale-[0.98] disabled:opacity-50"
                style={{ backgroundSize: '200% 100%' }}
              >
                {brochureLoading ? (
                  <>
                    <Loader2 size={14} className="animate-spin text-[#0B0A06]" />
                    Downloading...
                  </>
                ) : (
                  'Download Brochure'
                )}
              </button>
            </form>
          )}
        </div>
      </motion.div>
    </div>
  );
}
