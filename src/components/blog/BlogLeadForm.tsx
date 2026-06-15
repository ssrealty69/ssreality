'use client';

import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { CheckCircle } from 'lucide-react';
import toast from 'react-hot-toast';

interface BlogLeadFormProps {
  propertyId?: string;
  propertyName?: string;
  propertyTitle?: string;
  brochureUrl?: string;
  propertyUrl?: string;
}

export default function BlogLeadForm({
  propertyId,
  propertyName,
  propertyTitle,
  brochureUrl,
  propertyUrl,
}: BlogLeadFormProps) {
  const [phone, setPhone] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (phone.length < 10) {
      toast.error('Please enter a valid 10-digit mobile number');
      return;
    }

    setLoading(true);
    try {
      // Save lead to admin panel (brochure tab)
      if (propertyId) {
        await fetch('/api/property-enquiry', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: 'Blog Lead',
            phone,
            requirement: `Blog Brochure Request for ${propertyName || propertyTitle || 'property'}`,
            propertyId,
            propertyTitle: propertyTitle || propertyName || 'Property',
            propertyUrl: propertyUrl || `/properties/${propertyId}`,
            isBrochureDownload: true,
            source: 'blog',
          }),
        });
      }

      // Trigger brochure download if available
      if (brochureUrl) {
        const safeName = (propertyName || propertyTitle || 'property')
          .toLowerCase().replace(/[^a-z0-9]+/g, '-');
        const downloadUrl = `/api/download-brochure?url=${encodeURIComponent(brochureUrl)}&filename=${safeName}-brochure.pdf`;
        const link = document.createElement('a');
        link.href = downloadUrl;
        link.download = `${safeName}-brochure.pdf`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      }

      setIsSubmitted(true);
      setPhone('');
    } catch (err) {
      console.error(err);
      toast.error('Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div className="bg-white rounded-2xl border border-[#E8D5A3] shadow-[0_8px_30px_rgb(0,0,0,0.04)] relative overflow-hidden group">
        {/* Promotional Top Banner */}
        <div className="bg-[#FFFAF0] border-b border-[#E8D5A3]/50 py-2 px-4 flex items-center gap-3">
          <div className="bg-gradient-to-br from-[#C9A227] to-[#8B6B0E] p-1.5 rounded-lg shadow-sm">
            <div className="text-[8px] font-black text-white leading-none text-center">
              INVESTOR<br />CLUB 2.0
            </div>
          </div>
          <p className="text-[10px] font-bold text-[#1A1800]">
            Book a Free Site Visit & <span className="text-[#C9A227]">Get Assured Gift Vouchers</span>
          </p>
        </div>

        <div className="p-5 md:p-6 relative">
          <div className="absolute -top-10 -right-10 w-24 h-24 bg-[#C9A227]/5 rounded-full blur-2xl group-hover:bg-[#C9A227]/10 transition-colors" />

          <div className="relative z-10">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-6 h-0.5 bg-[#C9A227] rounded-full" />
              <span className="text-[9px] font-bold uppercase tracking-widest text-[#C9A227]">Let's Get Started</span>
            </div>

            <h3 className="text-lg md:text-xl font-bold font-[var(--font-playfair)] text-[#1A1800] mb-1.5 leading-tight">
              Get Expert <span className="text-[#C9A227]">Insights</span> & Brochures
            </h3>
            <p className="text-[#6b6450] text-[11px] mb-4 leading-relaxed">
              {propertyName
                ? `Enter your mobile number to receive the ${propertyName} brochure on WhatsApp.`
                : 'Enter your mobile number to receive reports and brochures on WhatsApp.'}
            </p>

            <form onSubmit={handleSubmit} className="space-y-3">
              <div className="relative">
                <div className="absolute left-3 top-1/2 -translate-y-1/2 text-[#a09060] text-xs font-medium border-r border-[#E8D5A3] pr-2.5">
                  +91
                </div>
                <input
                  type="tel"
                  placeholder="Mobile Number"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value.replace(/\D/g, '').slice(0, 10))}
                  className="w-full pl-14 pr-4 py-2.5 rounded-lg border border-[#E8D5A3] bg-[#FFFEF5]/50 focus:bg-white text-sm text-[#1A1800] font-medium outline-none transition-all focus:ring-2 focus:ring-[#C9A227]/20"
                  required
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full gold-gradient text-[#1A1800] font-bold py-3 rounded-lg shadow-lg shadow-[#C9A227]/20 flex items-center justify-center gap-2 hover:brightness-105 active:scale-[0.98] transition-all disabled:opacity-70 text-sm"
              >
                {loading ? (
                  <span className="w-5 h-5 border-2 border-[#1A1800]/30 border-t-[#1A1800] rounded-full animate-spin" />
                ) : (
                  <>
                    <span className="text-sm">
                      {brochureUrl ? 'Download Brochure' : 'Get Brochures on WhatsApp'}
                    </span>
                    <svg viewBox="0 0 24 24" className="w-5 h-5 fill-[#1A1800]" xmlns="http://www.w3.org/2000/svg">
                      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L0 24l6.335-1.662c1.72.937 3.659 1.432 5.631 1.433h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.415-8.412z" />
                    </svg>
                  </>
                )}
              </button>
            </form>

            {/* Trust Badges */}
            <div className="mt-6 pt-6 border-t border-[#E8D5A3]/40 flex items-center justify-between">
              <div className="flex -space-x-2">
                {[
                  'https://images.unsplash.com/photo-1533108344127-a586d2b02479?auto=format&fit=crop&w=150&q=80',
                  'https://images.unsplash.com/photo-1566492031773-4f4e44671857?auto=format&fit=crop&w=150&q=80',
                  'https://images.unsplash.com/photo-1581403341630-a6e0b9d2d257?auto=format&fit=crop&w=150&q=80',
                  'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=150&q=80'
                ].map((img, i) => (
                  <div key={i} className="w-6 h-6 rounded-full border-2 border-white overflow-hidden ring-1 ring-[#E8D5A3]/30">
                    <img src={img} alt="Indian Investor" className="w-full h-full object-cover" />
                  </div>
                ))}
              </div>
              <div className="text-right">
                <p className="text-[10px] font-bold text-[#1A1800]">1,200+ Investors</p>
                <p className="text-[9px] text-[#a09060]">Trusted by investors since inception</p>
              </div>
            </div>

            <p className="mt-4 text-[9px] text-[#a09060] text-center opacity-70">
              Powered by SS Realty Lead Engine • Secure & Encrypted
            </p>
          </div>
        </div>
      </div>

      {isSubmitted && (
        <SuccessModal
          propertyName={propertyName}
          hasBrochure={!!brochureUrl}
          onClose={() => setIsSubmitted(false)}
        />
      )}
    </>
  );
}

// Portal-based Success Modal
function SuccessModal({ onClose, propertyName, hasBrochure }: { onClose: () => void; propertyName?: string; hasBrochure?: boolean }) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = ''; };
  }, []);

  if (!mounted) return null;

  return createPortal(
    <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, zIndex: 99999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px' }}>
      <div onClick={onClose} style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(10, 9, 0, 0.75)', backdropFilter: 'blur(16px)', WebkitBackdropFilter: 'blur(16px)', cursor: 'pointer' }} />

      <div style={{ position: 'relative', backgroundColor: '#fff', borderRadius: '12px', padding: '32px 28px', maxWidth: '380px', width: '100%', textAlign: 'center', boxShadow: '0 30px 80px rgba(0,0,0,0.4)', border: '1px solid rgba(232, 213, 163, 0.4)', overflow: 'hidden', animation: 'modalPopIn 0.3s ease-out forwards' }}>
        <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '3px', background: 'linear-gradient(90deg, #C9A227, #E8D5A3, #C9A227)' }} />

        <div style={{ marginBottom: '20px' }}>
          <div style={{ width: '56px', height: '56px', background: 'linear-gradient(135deg, #10b981, #047857)', borderRadius: '50%', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 6px 20px rgba(16, 185, 129, 0.3)' }}>
            <CheckCircle color="white" size={28} strokeWidth={2.5} />
          </div>
        </div>

        <h2 style={{ fontSize: '24px', fontWeight: 800, color: '#1A1800', marginBottom: '10px', fontFamily: 'var(--font-playfair), serif', letterSpacing: '-0.3px' }}>
          Thank You!
        </h2>

        <p style={{ color: '#6b6450', fontSize: '13px', lineHeight: 1.6, marginBottom: '24px', maxWidth: '320px', marginLeft: 'auto', marginRight: 'auto' }}>
          {hasBrochure && propertyName
            ? <>Your <span style={{ color: '#C9A227', fontWeight: 700 }}>{propertyName} brochure</span> download has started. Our experts will contact you on WhatsApp shortly.</>
            : <>Your request for <span style={{ color: '#C9A227', fontWeight: 700 }}>Investor Club 2.0</span> access has been received. Our experts will contact you on WhatsApp shortly.</>
          }
        </p>

        <button
          onClick={onClose}
          style={{ width: '100%', backgroundColor: '#1A1800', color: '#fff', fontWeight: 700, fontSize: '14px', padding: '12px', borderRadius: '8px', border: 'none', cursor: 'pointer', letterSpacing: '1px', textTransform: 'uppercase', boxShadow: '0 8px 24px rgba(0,0,0,0.15)', transition: 'all 0.2s' }}
          onMouseOver={(e) => (e.currentTarget.style.backgroundColor = '#000')}
          onMouseOut={(e) => (e.currentTarget.style.backgroundColor = '#1A1800')}
        >
          Done
        </button>

        <div style={{ marginTop: '24px', paddingTop: '16px', borderTop: '1px solid rgba(232, 213, 163, 0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
          <div style={{ width: '5px', height: '5px', borderRadius: '50%', backgroundColor: '#C9A227' }} />
          <span style={{ fontSize: '10px', fontWeight: 800, color: '#C9A227', letterSpacing: '2px', textTransform: 'uppercase' }}>Official SS Realty Verification</span>
          <div style={{ width: '5px', height: '5px', borderRadius: '50%', backgroundColor: '#C9A227' }} />
        </div>
      </div>

      <style>{`
        @keyframes modalPopIn {
          0% { opacity: 0; transform: scale(0.9) translateY(20px); }
          100% { opacity: 1; transform: scale(1) translateY(0); }
        }
      `}</style>
    </div>,
    document.body
  );
}
