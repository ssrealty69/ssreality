'use client';

import { useState } from 'react';
import { MessageCircle, CheckCircle2, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { useTracking } from '@/components/tracking/TrackingProvider';

interface PropertyEnquiryFormProps {
  propertyId: string;
  propertyTitle: string;
  waLink: string;
}

export default function PropertyEnquiryForm({ propertyId, propertyTitle, waLink }: PropertyEnquiryFormProps) {
  const { fireEvent } = useTracking();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

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
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: name,
          email: email.trim() || 'enquiry-bottom@ssrealty.in', // Fallback email to pass backend validation
          phone: phone,
          subject: `Property Bottom Enquiry: ${propertyTitle}`,
          propertyId: propertyId,
          message: `
            Bottom Form Enquiry for Property: ${propertyTitle}
            - Name: ${name}
            - Phone: ${phone}
            - User Email: ${email.trim() || 'Not Provided'}
            - Message: ${message || 'Looking for details, price plans and site visit.'}
          `.trim()
        }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setSubmitted(true);
        
        // Dynamic remarketing Lead event
        fireEvent('Lead', {
          content_category: 'Property Lead',
          content_name: propertyTitle,
          content_ids: [propertyId],
          value: 0,
          currency: 'INR',
          name: name,
          phone: phone,
          email: email
        });

        toast.success('Your enquiry has been submitted successfully!');
        setName('');
        setEmail('');
        setPhone('');
        setMessage('');
        setTimeout(() => {
          setSubmitted(false);
        }, 5000);
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

  // We explicitly override colors inline to guarantee 100% visibility in forced dark mode / extension high contrasts
  const inputStyle = {
    color: '#000000',
    backgroundColor: '#ffffff',
  };

  return (
    <div className="bg-[#FFFEF5] rounded-3xl p-6 md:p-8 relative overflow-hidden group shadow-[0_10px_40px_-15px_rgba(201,162,39,0.2)] border-2 border-[#C9A227]/20">
      <div className="absolute top-0 right-0 w-32 h-32 bg-[#C9A227]/5 rounded-full -mr-16 -mt-16 blur-3xl group-hover:bg-[#C9A227]/10 transition-all duration-500"></div>

      <div className="flex justify-between items-start mb-6">
        <div>
          <h3 className="text-2xl font-bold text-[#1A1800] mb-1 font-heading">Enquire Now</h3>
          <p className="text-[#1A1800]/60 text-sm font-medium">Get expert guidance for your home.</p>
        </div>
        <div className="w-10 h-10 rounded-full bg-[#C9A227]/10 border border-[#C9A227]/40 flex items-center justify-center">
          <div className="w-2 h-2 rounded-full bg-[#C9A227] animate-pulse"></div>
        </div>
      </div>

      {submitted ? (
        <div className="py-8 text-center animate-in fade-in zoom-in duration-300">
          <div className="w-12 h-12 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-4 border border-green-200">
            <CheckCircle2 className="text-green-500 stroke-[2.5]" size={24} />
          </div>
          <h4 className="text-md font-extrabold text-[#1A1800] uppercase tracking-wider">Enquiry Submitted!</h4>
          <p className="text-xs text-[#6b6450] mt-1.5 font-bold">Our property advisor will get in touch with you shortly.</p>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-3">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {/* Full Name */}
            <div className="relative group">
              <input 
                type="text" 
                placeholder="Name" 
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full border border-[#C9A227]/40 rounded-xl px-4 py-2.5 text-sm font-bold placeholder:text-gray-400 focus:outline-none focus:border-[#C9A227] focus:ring-1 focus:ring-[#C9A227]/20 transition-all" 
                style={inputStyle}
                required 
                disabled={loading}
              />
            </div>
            {/* Email Address */}
            <div className="relative group">
              <input 
                type="email" 
                placeholder="Email (Optional)" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full border border-[#C9A227]/40 rounded-xl px-4 py-2.5 text-sm font-bold placeholder:text-gray-400 focus:outline-none focus:border-[#C9A227] focus:ring-1 focus:ring-[#C9A227]/20 transition-all" 
                style={inputStyle}
                disabled={loading}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {/* Mobile Phone Number */}
            <div className="flex border border-[#C9A227]/40 rounded-xl overflow-hidden focus-within:border-[#C9A227] focus-within:ring-1 focus-within:ring-[#C9A227]/20 bg-white transition-all">
              <div 
                className="px-3 py-2.5 text-[#1A1800]/60 text-sm border-r border-[#C9A227]/10 flex items-center font-bold select-none"
                style={{ backgroundColor: '#f3f4f6' }}
              >
                +91
              </div>
              <input 
                type="tel" 
                placeholder="Mobile Number" 
                value={phone}
                onChange={(e) => handlePhoneChange(e.target.value)}
                className="w-full px-4 py-2.5 text-sm font-bold placeholder:text-gray-400 focus:outline-none bg-white" 
                style={inputStyle}
                required 
                disabled={loading}
              />
            </div>
            {/* Custom Message / Requirement */}
            <div className="relative group">
              <input 
                type="text" 
                placeholder="Your Message / Requirement" 
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                className="w-full border border-[#C9A227]/40 rounded-xl px-4 py-2.5 text-sm font-bold placeholder:text-gray-400 focus:outline-none focus:border-[#C9A227] focus:ring-1 focus:ring-[#C9A227]/20 transition-all" 
                style={inputStyle}
                disabled={loading}
              />
            </div>
          </div>

          <button 
            type="submit" 
            disabled={loading}
            className="w-full bg-gradient-to-r from-[#C9A227] to-[#A88721] text-white py-3.5 rounded-xl font-bold mt-2 hover:shadow-[0_10px_20px_-5px_rgba(201,162,39,0.4)] hover:-translate-y-0.5 active:translate-y-0 transition-all shadow-lg flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
          >
            {loading ? (
              <>
                <Loader2 size={16} className="animate-spin text-white" />
                Submitting Enquiry...
              </>
            ) : (
              'Secure Your Unit'
            )}
          </button>

          <div className="relative py-2 flex items-center">
            <div className="flex-grow border-t border-[#C9A227]/10"></div>
            <span className="flex-shrink mx-4 text-[10px] uppercase tracking-widest text-[#1A1800]/40 font-black">or connect via</span>
            <div className="flex-grow border-t border-[#C9A227]/10"></div>
          </div>

          <a 
            href={waLink} 
            target="_blank" 
            rel="noopener noreferrer" 
            className="w-full bg-white border border-[#25D366] text-[#25D366] py-2.5 rounded-xl font-black flex justify-center items-center gap-2 hover:bg-[#25D366] hover:text-white transition-all text-sm shadow-sm group"
          >
            <MessageCircle size={16} className="group-hover:animate-bounce" /> WhatsApp Support
          </a>
        </form>
      )}
    </div>
  );
}
