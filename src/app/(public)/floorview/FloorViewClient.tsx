'use client';

import { useState, useRef, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { Lock, ArrowRight, Building, Layers, ShieldCheck, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';
import ClientFloorPlanViewer from '@/components/public/ClientFloorPlanViewer';

interface SimpleProperty {
  _id: string;
  title: string;
  propertyType?: string;
  location: {
    city: string;
    address: string;
  };
}

interface FloorViewClientProps {
  availableProperties: SimpleProperty[];
  dbError: boolean;
}

// Separate search params component to satisfy Next.js Suspense boundary rules
function FloorViewContent({ 
  availableProperties,
  dbError
}: FloorViewClientProps) {
  const searchParams = useSearchParams();
  const propertyIdParam = searchParams.get('propertyId');
  const tokenParam = searchParams.get('token');

  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isExpired, setIsExpired] = useState(false);
  const [passcode, setPasscode] = useState<string[]>(['', '', '', '', '', '']);
  const [shake, setShake] = useState(false);
  const [loading, setLoading] = useState(false);
  
  // Selected category (Apartment vs Plot) and property state in central console
  const [selectedCategory, setSelectedCategory] = useState<'apartment' | 'plot'>('apartment');
  const [activePropertyId, setActivePropertyId] = useState<string>('');
  const [activeData, setActiveData] = useState<{ property: any; floorPlan: any; plotPlan?: any } | null>(null);
  const [fetchingDetails, setFetchingDetails] = useState(false);

  // Check auth state in session storage
  useEffect(() => {
    const auth = sessionStorage.getItem('floorview_auth');
    if (auth === 'true') {
      setIsAuthenticated(true);
    }
  }, []);

  // Auto-focus the hidden OTP input when auth screen is shown
  useEffect(() => {
    if (!isAuthenticated) {
      // Small delay to allow DOM to mount
      const t = setTimeout(() => hiddenInputRef.current?.focus(), 100);
      return () => clearTimeout(t);
    }
  }, [isAuthenticated]);

  // Fetch active property data if propertyIdParam or tokenParam exists
  useEffect(() => {
    if (tokenParam) {
      setFetchingDetails(true);
      fetch(`/api/share-token/${tokenParam}`)
        .then(async (res) => {
          const data = await res.json();
          if (res.ok && data.success && data.data) {
            setActiveData(data.data);
          } else {
            setIsExpired(true);
            if (data.error) {
              toast.error(data.error);
            }
          }
        })
        .catch(err => {
          console.error(err);
          setIsExpired(true);
          toast.error('Failed to load shared floor plan');
        })
        .finally(() => {
          setFetchingDetails(false);
        });
      return;
    }

    if (!isAuthenticated && !propertyIdParam) return;
    
    const targetId = propertyIdParam || activePropertyId;
    if (!targetId) {
      setActiveData(null);
      return;
    }

    setFetchingDetails(true);
    fetch(`/api/floor-plans/${targetId}`)
      .then(res => {
        if (res.ok) return res.json();
        throw new Error('Failed to load');
      })
      .then(res => {
        if (res.success && res.data) {
          setActiveData(res.data);
        } else {
          toast.error('Floor plan not configured for this building');
        }
      })
      .catch(err => {
        console.error(err);
        toast.error('Failed to load floor plan data');
      })
      .finally(() => {
        setFetchingDetails(false);
      });
  }, [isAuthenticated, propertyIdParam, tokenParam, activePropertyId]);

  // Set default active property in central console initially when no property is selected
  useEffect(() => {
    if (isAuthenticated && !propertyIdParam && !tokenParam && !activePropertyId && availableProperties.length > 0) {
      const filtered = availableProperties.filter(p => {
        const cat = p.propertyType?.toLowerCase() === 'plot' ? 'plot' : 'apartment';
        return cat === selectedCategory;
      });
      
      if (filtered.length > 0) {
        setActivePropertyId(filtered[0]._id);
      }
    }
  }, [isAuthenticated, propertyIdParam, tokenParam, availableProperties, selectedCategory, activePropertyId]);

  // Single hidden input handlers for mobile-friendly OTP
  const hiddenInputRef = useRef<HTMLInputElement>(null);

  const handleHiddenInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value.replace(/[^0-9]/g, '').slice(0, 6);
    const digits = raw.split('');
    const newPasscode = ['', '', '', '', '', ''];
    digits.forEach((d, i) => { newPasscode[i] = d; });
    setPasscode(newPasscode);
    // Keep caret at end
    e.target.value = raw;
  };

  const handleHiddenKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace') {
      const filled = passcode.filter(d => d !== '').length;
      if (filled === 0) return;
      const newPasscode = [...passcode];
      newPasscode[filled - 1] = '';
      setPasscode(newPasscode);
      e.preventDefault();
    }
  };

  const focusHiddenInput = () => {
    hiddenInputRef.current?.focus();
  };

  // Submit passcode check
  const handleSubmitPasscode = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setLoading(true);
    
    const code = passcode.join('');
    try {
      const response = await fetch('/api/floor-plans/verify', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ passcode: code }),
      });
      
      const result = await response.json();
      
      if (result.success && result.verified) {
        sessionStorage.setItem('floorview_auth', 'true');
        setIsAuthenticated(true);
        toast.success('Access Granted Successfully');
      } else {
        setShake(true);
        toast.error(result.error || 'Incorrect passcode. Access Denied.');
        setPasscode(['', '', '', '', '', '']);
        hiddenInputRef.current?.focus();
        setTimeout(() => setShake(false), 500); // clear shake state
      }
    } catch (err) {
      console.error('Error verifying passcode:', err);
      toast.error('Server error verifying passcode. Please try again.');
      setShake(true);
      setTimeout(() => setShake(false), 500);
    } finally {
      setLoading(false);
    }
  };

  // Auto-submit when all 6 digits are entered
  useEffect(() => {
    if (passcode.every(digit => digit !== '')) {
      handleSubmitPasscode();
    }
  }, [passcode]);

  // Expired Screen Gate
  if (isExpired) {
    return (
      <div className="min-h-screen bg-[#FDFCF9] text-gray-800 flex flex-col items-center justify-center p-4 relative overflow-hidden font-sans">
        <div 
          className="absolute inset-0 opacity-[0.25] pointer-events-none z-0" 
          style={{ 
            backgroundImage: 'radial-gradient(#C9A227 0.8px, transparent 0.8px)', 
            backgroundSize: '28px 28px' 
          }} 
        />
        <div className="w-full max-w-md bg-white border border-[#C9A227]/30 rounded-3xl p-8 shadow-xl relative z-10 text-center transition-all">
          <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-red-500 to-[#C9A227] shadow-[0_2px_8px_rgba(201,162,39,0.3)]" />
          
          <div className="flex justify-center mb-6 mt-2">
            <div className="w-16 h-16 rounded-full bg-amber-500/10 border border-[#C9A227]/30 flex items-center justify-center text-[#C9A227] shadow-sm">
              <svg className="w-8 h-8 text-[#C9A227] animate-pulse" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>

          <h1 className="text-2xl font-extrabold text-gray-900 tracking-tight font-[var(--font-playfair)]">
            This link has expired
          </h1>
          <p className="text-[10px] text-[#C9A227] uppercase tracking-widest font-extrabold mt-1">
            SS Realty Secure Share
          </p>

          <p className="text-gray-500 text-xs mt-4 mb-8 leading-relaxed max-w-xs mx-auto">
            This floor plan preview was valid for 72 hours to ensure availability accuracy. Please contact your SS Realty relationship manager for a fresh preview link.
          </p>

          <a
            href="/contact"
            className="w-full relative group overflow-hidden bg-gradient-to-r from-[#C9A227] via-[#F0D060] to-[#B8860B] text-[#1A1800] font-extrabold py-3.5 rounded-xl shadow-md transition-all hover:scale-[1.01] active:scale-[0.99] flex items-center justify-center gap-2 text-sm cursor-pointer"
          >
            Contact SS Realty
            <ArrowRight size={16} className="group-hover:translate-x-0.5 transition-transform" />
          </a>
        </div>
      </div>
    );
  }

  // Auth Screen Gate - only prompt for passcode if we are NOT in shared mode (i.e. no propertyId/token query param)
  if (!isAuthenticated && !propertyIdParam && !tokenParam) {
    return (
      <div className="min-h-screen bg-[#FDFCF9] text-gray-800 flex flex-col items-center justify-center p-4 relative overflow-hidden font-sans">
        
        {/* Custom CSS for Card Shaking Animation */}
        <style>{`
          @keyframes shake {
            0%, 100% { transform: translateX(0); }
            10%, 30%, 50%, 70%, 90% { transform: translateX(-8px); }
            20%, 40%, 60%, 80% { transform: translateX(8px); }
          }
          .animate-shake {
            animation: shake 0.4s ease-in-out;
          }
        `}</style>
        
        <div 
          className="absolute inset-0 opacity-[0.25] pointer-events-none z-0" 
          style={{ 
            backgroundImage: 'radial-gradient(#C9A227 0.8px, transparent 0.8px)', 
            backgroundSize: '28px 28px' 
          }} 
        />
        
        <div className={`w-full max-w-md bg-white border border-[#C9A227]/30 rounded-3xl p-8 shadow-xl relative z-10 text-center transition-all ${shake ? 'animate-shake border-red-400 shadow-red-100' : ''}`}>
          <div className="absolute top-0 left-0 w-full h-1.5 bg-[#C9A227] shadow-[0_2px_8px_rgba(201,162,39,0.3)]" />
          
          {/* Logo / Header */}
          <div className="flex justify-center mb-6 mt-2">
            <div className="w-14 h-14 rounded-2xl bg-[#C9A227]/10 border border-[#C9A227]/30 flex items-center justify-center text-[#C9A227] shadow-sm">
              <Lock size={26} className="animate-pulse" />
            </div>
          </div>

          <h1 className="text-2xl font-extrabold text-gray-900 tracking-tight font-[var(--font-playfair)]">
            SS REALTY
          </h1>
          <p className="text-[10px] text-[#C9A227] uppercase tracking-widest font-extrabold mt-1">
            Secure Floor Plan Portal
          </p>

          <p className="text-gray-500 text-xs mt-4 mb-8 leading-relaxed max-w-xs mx-auto">
            Please enter your 6-digit relationship manager passcode to unlock availability details.
          </p>

          {/* 6 Digit OTP — single hidden input keeps keyboard open on mobile */}
          <form onSubmit={handleSubmitPasscode} className="space-y-8">
            {/* Hidden real input — always focused, never visible */}
            <input
              ref={hiddenInputRef}
              type="tel"
              inputMode="numeric"
              pattern="[0-9]*"
              autoComplete="one-time-code"
              maxLength={6}
              value={passcode.join('')}
              onChange={handleHiddenInputChange}
              onKeyDown={handleHiddenKeyDown}
              disabled={loading}
              aria-label="Enter 6-digit passcode"
              style={{
                position: 'absolute',
                opacity: 0,
                width: 1,
                height: 1,
                pointerEvents: 'none',
                caretColor: 'transparent',
              }}
            />

            {/* Visual digit boxes — clicking any box focuses the hidden input */}
            <div className="flex justify-center gap-2" onClick={focusHiddenInput}>
              {passcode.map((digit, idx) => {
                const isCurrent = passcode.filter(d => d !== '').length === idx;
                return (
                  <div
                    key={idx}
                    className={`w-12 h-14 flex items-center justify-center text-xl font-bold rounded-xl border transition-all cursor-text select-none shadow-sm
                      ${digit
                        ? 'bg-white border-[#C9A227] text-gray-900 shadow-[0_0_0_2px_rgba(201,162,39,0.15)]'
                        : isCurrent
                        ? 'bg-white border-[#C9A227] shadow-[0_0_0_3px_rgba(201,162,39,0.2)]'
                        : 'bg-gray-50 border-gray-200 text-gray-300'
                      }
                      ${loading ? 'opacity-50' : ''}
                    `}
                  >
                    {digit || (isCurrent ? (
                      <span className="w-0.5 h-5 bg-[#C9A227] rounded-full animate-pulse" />
                    ) : (
                      <span className="text-gray-300 text-lg">-</span>
                    ))}
                  </div>
                );
              })}
            </div>

            <button
              type="submit"
              disabled={loading || passcode.some(d => d === '')}
              className="w-full relative group overflow-hidden bg-gradient-to-r from-[#C9A227] via-[#F0D060] to-[#B8860B] text-[#1A1800] font-extrabold py-3.5 rounded-xl shadow-md transition-all hover:scale-[1.01] active:scale-[0.99] disabled:opacity-50 disabled:hover:scale-100 flex items-center justify-center gap-2 text-sm cursor-pointer"
            >
              {loading ? (
                <Loader2 className="animate-spin" size={18} />
              ) : (
                <>
                  Verify Access
                  <ArrowRight size={16} className="group-hover:translate-x-0.5 transition-transform" />
                </>
              )}
            </button>
          </form>
        </div>
      </div>
    );
  }

  // Loader state while retrieving floor plan details
  if (fetchingDetails) {
    return (
      <div className="min-h-screen bg-[#FAF9F5] text-gray-800 flex flex-col items-center justify-center p-4 font-sans">
        <div className="flex flex-col items-center space-y-4">
          <Loader2 className="animate-spin text-[#C9A227]" size={40} />
          <p className="text-xs font-extrabold text-gray-400 uppercase tracking-widest animate-pulse">Loading live heatmap...</p>
        </div>
      </div>
    );
  }

  // Shared Link Locked View Mode
  if (propertyIdParam || tokenParam) {
    if (!activeData) return null;
    return (
      <ClientFloorPlanViewer 
        property={activeData.property} 
        floorPlan={activeData.floorPlan} 
        plotPlan={activeData.plotPlan}
        availableProperties={[]} 
        isSharedMode={true} 
      />
    );
  }

  // Central Management Console Mode
  return (
    <div className="min-h-screen bg-[#FAF9F5] pb-12">
      {activeData ? (
        <ClientFloorPlanViewer 
          property={activeData.property} 
          floorPlan={activeData.floorPlan} 
          plotPlan={activeData.plotPlan}
          availableProperties={availableProperties} 
          isSharedMode={false} 
          onPropertyChange={(id) => setActivePropertyId(id)}
        />
      ) : (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-32 text-center flex flex-col items-center justify-center min-h-[60vh] space-y-6 animate-in fade-in duration-300">
          <div className="w-16 h-16 rounded-full bg-[#C9A227]/10 border border-[#C9A227]/30 text-[#C9A227] flex items-center justify-center">
            <Building size={32} />
          </div>
          <div className="space-y-2">
            <h2 className="text-xl font-bold text-gray-800 font-[var(--font-playfair)]">No Property Selected</h2>
            <p className="text-gray-400 text-sm max-w-sm">Please choose a category and select a configured listed property to view its real-time availability blueprint.</p>
          </div>
          
          {availableProperties.length > 0 ? (
            <div className="w-full max-w-md space-y-5">
              {/* Category Segmented Buttons */}
              <div className="flex bg-white border border-gray-200 p-1.5 rounded-2xl max-w-xs mx-auto shadow-sm">
                <button
                  onClick={() => setSelectedCategory('apartment')}
                  className={`flex-1 flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    selectedCategory === 'apartment'
                      ? 'bg-[#C9A227] text-[#1A1800] shadow-[0_2px_8px_rgba(201,162,39,0.15)]'
                      : 'text-gray-500 hover:text-gray-700'
                  }`}
                >
                  🏢 Apartments
                </button>
                <button
                  onClick={() => setSelectedCategory('plot')}
                  className={`flex-1 flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    selectedCategory === 'plot'
                      ? 'bg-[#C9A227] text-[#1A1800] shadow-[0_2px_8px_rgba(201,162,39,0.15)]'
                      : 'text-gray-500 hover:text-gray-700'
                  }`}
                >
                  🏞️ Lands/Plots
                </button>
              </div>

              {(() => {
                const filtered = availableProperties.filter(p => {
                  const cat = p.propertyType?.toLowerCase() === 'plot' ? 'plot' : 'apartment';
                  return cat === selectedCategory;
                });

                if (filtered.length > 0) {
                  return (
                    <div className="relative w-full max-w-xs mx-auto">
                      <select
                        value={activePropertyId}
                        onChange={(e) => setActivePropertyId(e.target.value)}
                        className="w-full pl-4 pr-10 py-3 bg-white border border-[#C9A227]/30 text-gray-800 font-bold rounded-xl focus:outline-none focus:ring-2 focus:ring-[#C9A227]/20 focus:border-[#C9A227] transition-all cursor-pointer text-sm shadow-sm font-sans"
                      >
                        <option value="">🏢 Select a {selectedCategory === 'plot' ? 'plot layout' : 'building apartment'}...</option>
                        {filtered.map((p) => (
                          <option key={p._id} value={p._id}>
                            {p.title} ({p.location.city})
                          </option>
                        ))}
                      </select>
                    </div>
                  );
                }

                return (
                  <p className="text-xs text-amber-600 font-semibold bg-amber-50 px-4 py-2.5 border border-amber-100 rounded-full max-w-xs mx-auto">
                    No {selectedCategory === 'plot' ? 'plot plans' : 'apartments'} configured yet.
                  </p>
                );
              })()}
            </div>
          ) : (
            <p className="text-xs text-amber-600 font-semibold bg-amber-50 px-4 py-2 border border-amber-100 rounded-full">
              No properties are currently configured with a floor or plot plan.
            </p>
          )}
        </div>
      )}
    </div>
  );
}

// Wrapper with Suspense boundary to satisfy Next.js useSearchParams requirements
export default function FloorViewClient({ 
  availableProperties, 
  dbError 
}: FloorViewClientProps) {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-[#FAF9F5] text-gray-800 flex flex-col items-center justify-center p-4">
        <Loader2 className="animate-spin text-[#C9A227]" size={36} />
      </div>
    }>
      <FloorViewContent 
        availableProperties={availableProperties} 
        dbError={dbError} 
      />
    </Suspense>
  );
}
