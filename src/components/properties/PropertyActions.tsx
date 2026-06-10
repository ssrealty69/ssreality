'use client';

import { useState } from 'react';
import { Download, MessageCircle, X, CheckCircle2, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';

interface PropertyActionsProps {
  propertyId: string;
  propertyTitle: string;
  brochureUrl?: string;
  waLink: string;
}

export default function PropertyActions({ propertyId, propertyTitle, brochureUrl, waLink }: PropertyActionsProps) {
  const [showModal, setShowModal] = useState(false);
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [requirement, setRequirement] = useState('');
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const inputStyle = {
    color: '#000000',
    backgroundColor: '#ffffff',
  };

  const handlePhoneChange = (val: string) => {
    // Keep numbers only, max 10 digits
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
          propertyId: propertyId,
          propertyTitle: propertyTitle,
          propertyUrl: typeof window !== 'undefined' ? window.location.pathname : `/properties/${propertyId}`,
        }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setSubmitted(true);
        toast.success('Your requirement has been submitted successfully!');
        setTimeout(() => {
          setShowModal(false);
          setSubmitted(false);
          setName('');
          setPhone('');
          setRequirement('');
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
    <>
      <div className="flex flex-col sm:flex-row gap-4 mt-6">
        {/* Brochure Download Button */}
        {brochureUrl ? (
          <a
            href={brochureUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex-[1.2] relative group overflow-hidden bg-gradient-to-r from-[#C9A227] via-[#F0D060] to-[#B8860B] text-[#1A1800] py-4 rounded-2xl flex justify-center items-center gap-3 shadow-[0_10px_20px_-5px_rgba(201,162,39,0.3)] hover:shadow-[0_15px_30px_rgba(201,162,39,0.4)] transition-all duration-300 transform hover:-translate-y-0.5 active:scale-95 text-center cursor-pointer"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent -translate-x-full group-hover:animate-[shimmer_2s_infinite] pointer-events-none" />
            <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center backdrop-blur-sm group-hover:bg-white/40 transition-colors shadow-inner shrink-0">
              <Download size={22} className="stroke-[3]" />
            </div>
            <span className="text-[17px] font-heading font-bold tracking-tight">Download Brochure</span>
          </a>
        ) : (
          <div className="flex-[1.2] relative overflow-hidden bg-gray-100 text-gray-400 py-4 rounded-2xl flex justify-center items-center gap-3 cursor-not-allowed border border-gray-200/50">
            <div className="w-10 h-10 rounded-full bg-gray-200/50 flex items-center justify-center shrink-0">
              <Download size={22} className="stroke-[3] text-gray-300" />
            </div>
            <span className="text-[17px] font-heading font-bold tracking-tight">Brochure N/A</span>
          </div>
        )}

        {/* WhatsApp Button */}
        <a
          href={waLink}
          target="_blank"
          rel="noopener noreferrer"
          className="flex-1 relative overflow-hidden bg-gradient-to-br from-[#1B4332] via-[#2D6A4F] to-[#081C15] text-white py-4 rounded-2xl flex justify-center items-center gap-3 shadow-[0_10px_20px_-5px_rgba(27,67,50,0.4)] hover:shadow-[0_15px_35px_rgba(27,67,50,0.5)] transition-all duration-300 transform hover:-translate-y-0.5 active:scale-95 group cursor-pointer"
        >
          <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center backdrop-blur-sm group-hover:rotate-12 transition-transform shadow-inner">
            <MessageCircle size={22} className="fill-white" />
          </div>
          <span className="text-[17px] font-heading font-bold tracking-tight">WhatsApp Now</span>
        </a>

        {/* Enquire Now Popup Trigger Button */}
        <button
          onClick={() => setShowModal(true)}
          className="flex-1 relative overflow-hidden bg-[#1A1800] text-white py-4 rounded-2xl flex justify-center items-center gap-3 border border-[#C9A227]/30 shadow-2xl hover:shadow-[0_20px_40px_-10px_rgba(0,0,0,0.5)] transition-all duration-300 transform hover:-translate-y-0.5 active:scale-95 group cursor-pointer"
        >
          <div className="absolute top-0 right-0 w-32 h-32 bg-[#C9A227]/10 blur-3xl -mr-16 -mt-16 group-hover:bg-[#C9A227]/20 transition-all duration-500" />
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#E8D5A3] to-[#C9A227] flex items-center justify-center shadow-[0_0_15px_rgba(201,162,39,0.5)] group-hover:scale-110 transition-transform">
            <MessageCircle size={14} className="fill-[#1A1800] text-[#1A1800]" />
          </div>
          <span className="text-[17px] font-heading font-bold tracking-tight bg-gradient-to-r from-white via-[#E8D5A3] to-white bg-[length:200%_auto] hover:animate-[shimmer_2s_infinite] bg-clip-text text-transparent">Enquire Now</span>
        </button>
      </div>

      {/* Dynamic Pop-up Form Modal */}
      <AnimatePresence>
        {showModal && (
          <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
            {/* Dark blur overlay */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => { if (!loading) setShowModal(false); }}
              className="fixed inset-0 bg-[#1A1800]/80 backdrop-blur-sm"
            />

            {/* Modal Container */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="relative w-full max-w-md bg-white rounded-3xl shadow-[0_20px_50px_rgba(0,0,0,0.3)] overflow-hidden border border-[#E8D5A3]/40 z-10"
            >
              {/* Premium Top Header bar */}
              <div className="pt-6 px-6 pb-4 relative bg-[#1A1800] border-b border-[#C9A227]/30 text-center">
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-[#C9A227] to-transparent opacity-65" />
                <button
                  onClick={() => setShowModal(false)}
                  disabled={loading}
                  className="absolute top-4 right-4 text-white/40 hover:text-[#C9A227] transition-colors cursor-pointer"
                >
                  <X size={18} />
                </button>
                <span className="text-[9px] font-black text-[#C9A227] uppercase tracking-[0.25em] block">Exclusive Enquiry</span>
                <h3
                  className="text-md sm:text-lg text-white font-extrabold tracking-tight mt-1 truncate px-4"
                  style={{ color: '#ffffff' }}
                >
                  {propertyTitle}
                </h3>
              </div>

              {/* Form Content body */}
              <div className="p-6">
                {submitted ? (
                  <div className="py-8 text-center animate-in fade-in zoom-in duration-300">
                    <div className="w-12 h-12 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-4 border border-green-200">
                      <CheckCircle2 className="text-green-500 stroke-[2.5]" size={24} />
                    </div>
                    <h4 className="text-sm font-extrabold text-[#1A1800] uppercase tracking-wider">Enquiry Submitted!</h4>
                    <p className="text-xs text-[#6b6450] mt-1.5 font-bold">Our property advisor will get in touch with you shortly.</p>
                  </div>
                ) : (
                  <form onSubmit={handleSubmit} className="space-y-4">
                    {/* Full Name */}
                    <div className="space-y-1">
                      <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest ml-1">Full Name</label>
                      <input
                        type="text"
                        placeholder="Your full name"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-xl focus:border-[#C9A227] text-xs font-bold text-black outline-none transition-all placeholder:text-gray-400"
                        style={inputStyle}
                        required
                        disabled={loading}
                      />
                    </div>

                    {/* Phone Number */}
                    <div className="space-y-1">
                      <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest ml-1">Phone Number</label>
                      <div className="flex rounded-xl overflow-hidden border border-gray-200 focus-within:border-[#C9A227] bg-white transition-all">
                        <span
                          className="px-3 flex items-center justify-center text-xs font-black text-gray-400 border-r border-gray-200 shrink-0 select-none"
                          style={{ backgroundColor: '#f3f4f6' }}
                        >
                          +91
                        </span>
                        <input
                          type="tel"
                          placeholder="XXXXXXXXXX"
                          value={phone}
                          onChange={(e) => handlePhoneChange(e.target.value)}
                          className="w-full px-4 py-2.5 bg-white text-xs font-bold text-black outline-none placeholder:text-gray-400"
                          style={inputStyle}
                          required
                          disabled={loading}
                        />
                      </div>
                    </div>

                    {/* Requirement/Message text area */}
                    <div className="space-y-1">
                      <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest ml-1">Requirement Details</label>
                      <textarea
                        placeholder="Describe your requirement (e.g. Budget, BHK preference, Preferred timing to call)"
                        value={requirement}
                        onChange={(e) => setRequirement(e.target.value)}
                        rows={3}
                        className="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-xl focus:border-[#C9A227] text-xs font-bold text-black outline-none transition-all placeholder:text-gray-400 resize-none"
                        style={inputStyle}
                        disabled={loading}
                      />
                    </div>

                    {/* Submit Button */}
                    <button
                      type="submit"
                      disabled={loading}
                      className="w-full py-3 mt-2 rounded-xl bg-[#1A1800] hover:bg-[#2e2b02] text-[#C9A227] hover:text-white border border-[#C9A227]/40 text-xs font-black uppercase tracking-widest shadow-lg flex items-center justify-center gap-2 cursor-pointer transition-all active:scale-[0.98] disabled:opacity-50"
                    >
                      {loading ? (
                        <>
                          <Loader2 size={14} className="animate-spin text-[#C9A227]" />
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
        )}
      </AnimatePresence>
    </>
  );
}
