'use client';

import { Share2, Link as LinkIcon, CheckCircle2 } from 'lucide-react';
import { useState, useEffect, useRef } from 'react';
import PropertyCard from '@/components/properties/PropertyCard';
import type { Property } from '@/types';

export default function BrochuresPage() {
  const [copied, setCopied] = useState(false);
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedPdf, setSelectedPdf] = useState('/SS%20Realty%20Arch%20Property%20Brochure.pdf');
  const pdfContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fetchProperties = async () => {
      try {
        const res = await fetch('/api/properties?limit=4');
        if (res.ok) {
          const data = await res.json();
          // Only show properties that have a brochureUrl
          const propsWithBrochures = (data.data || []).filter((p: Property) => p.brochureUrl);
          setProperties(propsWithBrochures);
          
          // Set the first available brochure as the default active one
          if (propsWithBrochures.length > 0 && selectedPdf === '/SS%20Realty%20Arch%20Property%20Brochure.pdf') {
             setSelectedPdf(propsWithBrochures[0].brochureUrl);
          }
        }
      } catch (error) {
        console.error('Failed to fetch properties:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchProperties();
  }, []);

  const handleViewBrochure = (property: Property) => {
    // If the property has a specific brochure URL in the future, use it here.
    // For now, we fallback to the default arch brochure since it's the only one uploaded.
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const brochureUrl = (property as any).brochureUrl || '/SS%20Realty%20Arch%20Property%20Brochure.pdf';
    setSelectedPdf(brochureUrl);
    
    // Scroll smoothly to the PDF viewer
    if (pdfContainerRef.current) {
      const y = pdfContainerRef.current.getBoundingClientRect().top + window.scrollY - 100;
      window.scrollTo({ top: y, behavior: 'smooth' });
    }
  };

  const handleShare = async () => {
    const url = window.location.href;
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'SS Realty - Premium Brochure',
          text: 'Check out the premium property collection from SS Realty.',
          url: url,
        });
      } catch (err) {
        console.error('Share failed:', err);
      }
    } else {
      // Fallback: copy to clipboard
      navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="min-h-screen bg-[#FFFEF5] pt-24 pb-24">
      {/* Header */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-4 pb-2 relative">
        <h1 className="text-2xl md:text-4xl font-[var(--font-playfair)] text-[#1A1800] text-center mb-2">
          Our <span className="text-[#C9A227]">Brochure</span>
        </h1>
        <p className="text-[#6b6450] text-sm md:text-base text-center">
          Explore our premium property collection
        </p>
      </div>

      {/* Custom PDF Viewer with Fake Toolbar */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8" ref={pdfContainerRef}>
        <div className="w-full rounded-2xl overflow-hidden shadow-[0_10px_40px_rgba(0,0,0,0.08)] border-2 border-[#C9A227]/30 bg-[#1A1800] flex flex-col h-[calc(100svh-140px)] min-h-[600px] md:h-[calc(100vh-220px)]">
          
          {/* Custom Toolbar (Matches Website Theme) */}
          <div className="h-14 w-full bg-[#1A1800] flex items-center justify-end pr-3 pl-4 gap-1 sm:gap-2 shrink-0 border-b border-[#C9A227]/20">
            {/* Share Button (Replacing Drive Icon) */}
            <button
              onClick={handleShare}
              className="p-2 text-[#C9A227] hover:bg-[#C9A227]/10 rounded-full transition-colors flex items-center justify-center relative group"
              title="Share Brochure"
            >
              {copied ? <CheckCircle2 size={20} className="text-green-400" /> : <Share2 size={20} />}
              {/* Tooltip */}
              <span className="absolute -bottom-8 bg-[#1A1800] text-[#C9A227] border border-[#C9A227]/30 text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 whitespace-nowrap pointer-events-none transition-opacity z-20">
                {copied ? 'Copied!' : 'Share'}
              </span>
            </button>

            {/* Download Button */}
            <a
              href={selectedPdf}
              download={selectedPdf.split('/').pop() || 'Brochure.pdf'}
              className="p-2 text-[#C9A227] hover:bg-[#C9A227]/10 rounded-full transition-colors flex items-center justify-center relative group"
              title="Download"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                <polyline points="7 10 12 15 17 10"></polyline>
                <line x1="12" y1="15" x2="12" y2="3"></line>
              </svg>
              <span className="absolute -bottom-8 bg-[#1A1800] text-[#C9A227] border border-[#C9A227]/30 text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 whitespace-nowrap pointer-events-none transition-opacity z-20">
                Download
              </span>
            </a>

            {/* Print Button */}
            <button
              onClick={() => {
                const printWindow = window.open(selectedPdf);
                printWindow?.print();
              }}
              className="p-2 text-[#C9A227] hover:bg-[#C9A227]/10 rounded-full transition-colors flex items-center justify-center relative group"
              title="Print"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="6 9 6 2 18 2 18 9"></polyline>
                <path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"></path>
                <rect x="6" y="14" width="12" height="8"></rect>
              </svg>
              <span className="absolute -bottom-8 bg-[#1A1800] text-[#C9A227] border border-[#C9A227]/30 text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 whitespace-nowrap pointer-events-none transition-opacity z-20">
                Print
              </span>
            </button>
          </div>

          {/* Iframe/Object for actual PDF content (toolbar hidden) */}
          <div className="flex-1 w-full bg-[#FFFEF5] overflow-y-auto overflow-x-hidden relative touch-pan-y [-webkit-overflow-scrolling:touch]">
            <object
              key={selectedPdf}
              data={`${selectedPdf}#toolbar=0&navpanes=0&scrollbar=1&view=FitH`}
              type="application/pdf"
              className="w-full h-full min-h-[75vh] md:min-h-full block border-none"
            >
              <iframe
                src={`${selectedPdf}#toolbar=0&navpanes=0&scrollbar=1&view=FitH`}
                className="w-full h-full min-h-[75vh] md:min-h-full block border-none"
                title="SS Realty Brochure"
              />
            </object>
          </div>
        </div>
      </div>

      {/* Other Brochures Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 mt-12 border-t border-[#E8D5A3]/50">
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-[#C9A227]/10 rounded-full mb-3">
            <span className="w-2 h-2 rounded-full bg-[#C9A227] animate-pulse" />
            <span className="text-[10px] font-black text-[#C9A227] uppercase tracking-[0.2em]">Explore More</span>
          </div>
          <h2 className="text-3xl md:text-4xl font-bold text-[#1A1800] mb-3 font-[var(--font-playfair)]">
            Other <span className="text-[#C9A227]">Brochures</span>
          </h2>
          <div className="w-20 h-1 bg-[#C9A227] mx-auto mb-4 rounded-full" />
          <p className="text-[#64748B] max-w-2xl mx-auto text-base">
            Discover more premium properties and download their detailed brochures.
          </p>
        </div>

        {loading ? (
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-4 border-[#C9A227] border-t-transparent" />
          </div>
        ) : properties.length > 0 ? (
          <div className="flex overflow-x-auto snap-x snap-mandatory gap-4 pb-6 -mx-4 px-4 sm:mx-0 sm:px-0 sm:grid sm:grid-cols-2 lg:grid-cols-4 sm:gap-6 sm:pb-0 sm:overflow-visible custom-scrollbar">
            {properties.map((p, idx) => (
              <div key={p._id} className="w-[calc(50vw-1.5rem)] min-w-[170px] max-w-[280px] shrink-0 snap-start sm:w-auto sm:min-w-0 sm:max-w-none">
                <PropertyCard 
                  property={p} 
                  priority={false} 
                  actionText="View Brochure"
                  onActionClick={handleViewBrochure}
                />
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12 text-[#64748B]">
            No other brochures found at the moment.
          </div>
        )}
      </div>
    </div>
  );
}
