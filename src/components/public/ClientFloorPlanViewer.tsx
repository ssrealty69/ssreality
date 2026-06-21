'use client';

import { useState, useMemo, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Building, MapPin, Layers, Phone, Mail, Award, MessageSquare, Info, Filter, Compass, Copy, Share2, MessageCircle, Smartphone, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';

interface Flat {
  number: string;
  status: 'available' | 'sold' | 'reserved';
  bedrooms?: number;
  price?: number;
  notes?: string;
  _floorName?: string;
}

interface Floor {
  floorNumber: number;
  floorName: string;
  flats: Flat[];
}

interface Property {
  _id: string;
  title: string;
  propertyType?: string;
  location: {
    address: string;
    city: string;
    state: string;
  };
  features: {
    bedrooms?: number;
    totalFloors?: number;
    reraApproved?: boolean;
  };
  agent: {
    name: string;
    phone: string;
    email: string;
    image?: string;
  };
}

interface SimpleProperty {
  _id: string;
  title: string;
  propertyType?: string;
  location: {
    city: string;
    address: string;
  };
}

interface Plot {
  number: string;
  status: 'available' | 'sold' | 'reserved';
  sizeGaj: number;
  isCorner: boolean;
  facing?: string;
  price?: number;
  notes?: string;
  _blockName?: string;
}

interface Block {
  blockName: string;
  plots: Plot[];
}

interface ClientFloorPlanViewerProps {
  property: Property;
  floorPlan?: {
    totalFloors: number;
    flatsPerFloor: number;
    floors: Floor[];
  } | null;
  plotPlan?: {
    blocks: Block[];
  } | null;
  availableProperties: SimpleProperty[];
  isSharedMode?: boolean;
  onPropertyChange?: (propertyId: string) => void;
}

export default function ClientFloorPlanViewer({ 
  property, 
  floorPlan = null,
  plotPlan = null,
  availableProperties = [],
  isSharedMode = false,
  onPropertyChange
}: ClientFloorPlanViewerProps) {
  const router = useRouter();
  
  const isPlot = property.propertyType?.toLowerCase() === 'plot';

  const [selectedCategory, setSelectedCategory] = useState<'apartment' | 'plot'>(
    property.propertyType?.toLowerCase() === 'plot' ? 'plot' : 'apartment'
  );
  
  const [bhkFilter, setBhkFilter] = useState<number | 'all'>('all');
  const [sizeFilter, setSizeFilter] = useState<number | 'all'>('all');
  const [cornerFilter, setCornerFilter] = useState<boolean>(false);
  const [statusFilter, setStatusFilter] = useState<'all' | 'available'>('all');
  const [selectedFlat, setSelectedFlat] = useState<Flat | null>(null);
  const [selectedPlot, setSelectedPlot] = useState<Plot | null>(null);
  const [showShareMenu, setShowShareMenu] = useState(false);
  const [sharing, setSharing] = useState(false);

  const getShareLink = async (): Promise<string | null> => {
    try {
      setSharing(true);
      const res = await fetch('/api/share-token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ propertyId: property._id }),
      });
      const data = await res.json();
      if (res.ok && data.success && data.token) {
        return `${window.location.origin}/floorview?token=${data.token}`;
      } else {
        toast.error(data.error || 'Failed to generate secure share link');
        return null;
      }
    } catch (err) {
      console.error('Share link generation error:', err);
      toast.error('Failed to generate secure share link');
      return null;
    } finally {
      setSharing(false);
    }
  };

  const handleShareAction = async (type: 'whatsapp' | 'sms' | 'copy') => {
    if (sharing) return;
    const link = await getShareLink();
    if (!link) return;

    if (type === 'whatsapp') {
      const text = `Hi, please check out the floor plan & flat availability tracker for "${property.title}" here: ${link}`;
      window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`, '_blank');
    } else if (type === 'sms') {
      const text = `Hi, please check out the floor plan & flat availability for "${property.title}": ${link}`;
      window.open(`sms:?body=${encodeURIComponent(text)}`, '_blank');
    } else if (type === 'copy') {
      navigator.clipboard.writeText(link);
      toast.success('Secure Client-Sharing link copied!');
    }
    setShowShareMenu(false);
  };

  // Sync selectedCategory when property changes
  useEffect(() => {
    setSelectedCategory(property.propertyType?.toLowerCase() === 'plot' ? 'plot' : 'apartment');
  }, [property]);

  // When selectedCategory changes, automatically select the first property of that category if the current property doesn't belong to it
  useEffect(() => {
    const currentPropType = property.propertyType?.toLowerCase() === 'plot' ? 'plot' : 'apartment';
    if (selectedCategory !== currentPropType && availableProperties.length > 0) {
      const filtered = availableProperties.filter(p => {
        const cat = p.propertyType?.toLowerCase() === 'plot' ? 'plot' : 'apartment';
        return cat === selectedCategory;
      });
      if (filtered.length > 0) {
        if (onPropertyChange) {
          onPropertyChange(filtered[0]._id);
        } else {
          router.push(`/floor-plans/${filtered[0]._id}`);
        }
      }
    }
  }, [selectedCategory, property, availableProperties, onPropertyChange, router]);

  // Stats calculation
  const stats = useMemo(() => {
    let total = 0;
    let sold = 0;
    let reserved = 0;

    if (isPlot && plotPlan) {
      const sizes = new Set<number>();
      plotPlan.blocks.forEach(block => {
        block.plots.forEach(plot => {
          total++;
          if (plot.status === 'sold') sold++;
          else if (plot.status === 'reserved') reserved++;
          if (plot.sizeGaj) sizes.add(plot.sizeGaj);
        });
      });

      const available = total - sold - reserved;
      const soldPercentage = Math.round((sold / total) * 100) || 0;

      return {
        total,
        sold,
        reserved,
        available,
        soldPercentage,
        availableBhks: [],
        availableSizes: Array.from(sizes).sort((a, b) => a - b)
      };
    } else if (floorPlan) {
      const bhks = new Set<number>();
      floorPlan.floors.forEach(floor => {
        floor.flats.forEach(flat => {
          total++;
          if (flat.status === 'sold') sold++;
          else if (flat.status === 'reserved') reserved++;
          if (flat.bedrooms) bhks.add(flat.bedrooms);
        });
      });

      const available = total - sold - reserved;
      const soldPercentage = Math.round((sold / total) * 100) || 0;

      return {
        total,
        sold,
        reserved,
        available,
        soldPercentage,
        availableBhks: Array.from(bhks).sort((a, b) => a - b),
        availableSizes: []
      };
    }

    return {
      total: 0,
      sold: 0,
      reserved: 0,
      available: 0,
      soldPercentage: 0,
      availableBhks: [],
      availableSizes: []
    };
  }, [floorPlan, plotPlan, isPlot]);

  // Construct whatsapp URL
  const getWhatsappUrl = (unitNum?: string, details?: string) => {
    const phone = property.agent.phone.replace(/[^0-9]/g, '');
    let text = `Hi ${property.agent.name}, I am viewing the live availability map for "${property.title}" and would like to get more details.`;
    
    if (unitNum) {
      if (isPlot) {
        text = `Hi ${property.agent.name}, I am highly interested in booking Plot "${unitNum}"${details ? ` (${details})` : ''} at "${property.title}". Please share pricing and payment plans!`;
      } else {
        text = `Hi ${property.agent.name}, I am highly interested in booking Unit "${unitNum}"${details ? ` (${details} BHK)` : ''} at "${property.title}". Please share pricing and payment plans!`;
      }
    }
    
    return `https://wa.me/${phone.startsWith('91') ? phone : '91' + phone}?text=${encodeURIComponent(text)}`;
  };

  // Copy secure client shareable link
  const handleCopyShareLink = () => {
    const link = `${window.location.origin}/floorview?propertyId=${property._id}`;
    navigator.clipboard.writeText(link);
    toast.success('Secure Client-Sharing link copied to clipboard!');
  };

  const formatProjectName = (title: string) => {
    const match = title.match(/(?: in | at )([^,]+)/i);
    if (match && match[1]) {
      return `Project - ${match[1].trim()}`;
    }
    return `Project - ${title.split(',')[0].trim()}`;
  };

  return (
    <div className="min-h-screen bg-[#FAF9F5] text-gray-800 font-sans relative overflow-x-hidden pb-16 selection:bg-[#C9A227] selection:text-black">
      
      {/* Premium Architectural Grid Blueprint Pattern Backdrop Overlay */}
      <div 
        className="absolute inset-0 opacity-[0.25] pointer-events-none z-0" 
        style={{ 
          backgroundImage: 'radial-gradient(#C9A227 0.8px, transparent 0.8px)', 
          backgroundSize: '28px 28px' 
        }} 
      />

      {/* Main Content: Padding-top & margins adjusted to completely avoid cropping by the sticky header */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-28 md:pt-32 relative z-10">
        
        {/* Title Glass Card with subtle golden gradient border */}
        <section 
          className="backdrop-blur-md border border-[#C9A227]/30 rounded-3xl p-6 md:p-8 shadow-sm relative"
          style={{
            background: 'radial-gradient(circle at top right, rgba(201, 162, 39, 0.08) 0%, transparent 65%), rgba(255, 255, 255, 0.8)'
          }}
        >
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 relative z-10">
            <div className="space-y-4 w-full md:max-w-2xl">
              
              {/* Premium dropdown selector section or Building Title based on isSharedMode */}
              {isSharedMode ? (
                <div className="space-y-1">
                  <span className="text-[10px] text-[#C9A227] font-extrabold uppercase tracking-widest block">
                    🏢 Premium Building Details
                  </span>
                  <h2 className="text-2xl md:text-3xl font-extrabold text-[#1A1800] tracking-tight font-[var(--font-playfair)]">
                    {formatProjectName(property.title)}
                  </h2>
                </div>
              ) : (
                availableProperties.length > 0 && (
                  <div className="space-y-1.5 w-full">
                    <span className="text-[10px] text-[#C9A227] font-extrabold uppercase tracking-widest block">
                      🏢 Select Premium Property
                    </span>
                    <div className="flex flex-col md:flex-row md:items-center gap-3.5 w-full">
                      {/* Category Segmented Buttons */}
                      <div className="flex w-full md:w-auto bg-[#FAF9F5] border border-gray-200 p-1 rounded-xl shadow-sm h-[46px] items-center">
                        <button
                          onClick={() => setSelectedCategory('apartment')}
                          className={`flex-1 md:flex-none flex items-center justify-center gap-1.5 py-2 px-3.5 rounded-lg text-xs font-bold transition-all cursor-pointer select-none whitespace-nowrap ${
                            selectedCategory === 'apartment'
                              ? 'bg-[#C9A227] text-[#1A1800] shadow-[0_2px_6px_rgba(201,162,39,0.15)]'
                              : 'text-gray-500 hover:text-gray-700'
                          }`}
                        >
                          🏢 Apartment
                        </button>
                        <button
                          onClick={() => setSelectedCategory('plot')}
                          className={`flex-1 md:flex-none flex items-center justify-center gap-1.5 py-2 px-3.5 rounded-lg text-xs font-bold transition-all cursor-pointer select-none whitespace-nowrap ${
                            selectedCategory === 'plot'
                              ? 'bg-[#C9A227] text-[#1A1800] shadow-[0_2px_6px_rgba(201,162,39,0.15)]'
                              : 'text-gray-500 hover:text-gray-700'
                          }`}
                        >
                          🏞️ Land/Plot
                        </button>
                      </div>

                      {(() => {
                        const filtered = availableProperties.filter(p => {
                          const cat = p.propertyType?.toLowerCase() === 'plot' ? 'plot' : 'apartment';
                          return cat === selectedCategory;
                        });

                        return (
                          <div className="relative w-full md:flex-1 md:max-w-md group">
                            <select
                              value={property._id}
                              onChange={(e) => {
                                if (onPropertyChange) {
                                  onPropertyChange(e.target.value);
                                } else {
                                  router.push(`/floor-plans/${e.target.value}`);
                                }
                              }}
                              className="w-full pl-4 pr-12 py-3 bg-white border border-gray-200 hover:border-[#C9A227] text-gray-900 font-extrabold rounded-xl focus:outline-none focus:ring-2 focus:ring-[#C9A227]/20 focus:border-[#C9A227] transition-all cursor-pointer text-sm shadow-sm appearance-none font-sans"
                            >
                              {filtered.map((p) => (
                                <option key={p._id} value={p._id}>
                                  {formatProjectName(p.title)}
                                </option>
                              ))}
                              {filtered.length === 0 && (
                                <option value="">No {selectedCategory === 'plot' ? 'plots' : 'apartments'} configured</option>
                              )}
                            </select>
                            <div className="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none text-[#C9A227] group-hover:scale-110 transition-transform">
                              <Layers size={16} />
                            </div>
                          </div>
                        );
                      })()}
                      
                      <div className="relative w-full md:w-auto">
                        <button
                          onClick={() => setShowShareMenu(!showShareMenu)}
                          disabled={sharing}
                          className="w-full md:w-auto flex items-center justify-center gap-1.5 bg-gradient-to-r from-[#C9A227] via-[#F0D060] to-[#B8860B] hover:from-[#B8860B] hover:to-[#C9A227] text-[#1A1800] font-extrabold px-5 py-3 rounded-xl text-xs transition-all shadow-md hover:shadow-lg hover:shadow-[#C9A227]/10 cursor-pointer h-[46px] select-none flex-shrink-0 hover:scale-[1.02] active:scale-[0.98] disabled:opacity-75"
                          title="Share secure client-locked floor plan page"
                        >
                          {sharing ? (
                            <Loader2 size={14} className="animate-spin" />
                          ) : (
                            <Share2 size={14} className="stroke-[2.5]" />
                          )}
                          <span>{sharing ? 'Generating...' : 'Share Page'}</span>
                        </button>
                        
                        {showShareMenu && (
                          <>
                            {/* Backdrop overlay to close menu on click outside */}
                            <div 
                              className="fixed inset-0 z-40 cursor-default" 
                              onClick={() => setShowShareMenu(false)}
                            />
                            
                            {/* Premium Share Menu Dropdown */}
                            <div className="absolute right-0 mt-2.5 w-56 bg-white/95 backdrop-blur-md border border-[#C9A227]/30 rounded-2xl shadow-xl py-2 z-50 animate-in fade-in slide-in-from-top-3 duration-200">
                              <div className="px-3.5 py-1.5 border-b border-gray-100 mb-1">
                                <p className="text-[9px] text-[#C9A227] font-black uppercase tracking-widest leading-none">Locked Share Link</p>
                                <p className="text-[10px] text-gray-400 font-medium mt-1 leading-tight">Only this building will be visible to clients</p>
                              </div>
                              
                              {/* WhatsApp Option */}
                              <button
                                onClick={() => handleShareAction('whatsapp')}
                                disabled={sharing}
                                className="w-full px-4 py-2.5 hover:bg-emerald-50 text-left text-xs font-bold text-gray-700 hover:text-emerald-700 flex items-center gap-2.5 transition-colors cursor-pointer disabled:opacity-50"
                              >
                                <MessageCircle size={15} className="text-emerald-500 stroke-[2.5]" />
                                <span>Share on WhatsApp</span>
                              </button>
                              
                              {/* SMS Option */}
                              <button
                                onClick={() => handleShareAction('sms')}
                                disabled={sharing}
                                className="w-full px-4 py-2.5 hover:bg-blue-50 text-left text-xs font-bold text-gray-700 hover:text-blue-700 flex items-center gap-2.5 transition-colors cursor-pointer disabled:opacity-50"
                              >
                                <Smartphone size={15} className="text-blue-500 stroke-[2.5]" />
                                <span>Share via SMS</span>
                              </button>
                              
                              {/* Copy Link Option */}
                              <button
                                onClick={() => handleShareAction('copy')}
                                disabled={sharing}
                                className="w-full px-4 py-2.5 hover:bg-[#C9A227]/5 text-left text-xs font-bold text-gray-700 hover:text-[#C9A227] flex items-center gap-2.5 transition-colors cursor-pointer border-t border-gray-100 mt-1 disabled:opacity-50"
                              >
                                <Copy size={15} className="text-[#C9A227] stroke-[2.5]" />
                                <span>Copy Client Link</span>
                              </button>
                            </div>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                )
              )}

              {/* Exact same address layout in lower font directly below dropdown */}
              <div className="flex items-center gap-2 text-xs md:text-sm text-gray-500 font-semibold font-sans">
                <MapPin size={16} className="text-[#C9A227] flex-shrink-0" />
                <span>{property.location.address}, {property.location.city}, {property.location.state}</span>
              </div>
            </div>

            {/* Glowing Breathing Pulse Live status tracker console */}
            <div className="flex items-center gap-4 bg-white/95 border border-[#C9A227]/30 px-6 py-4 rounded-2xl shadow-[0_8px_30px_rgba(201,162,39,0.08)] flex-shrink-0 w-full md:w-auto relative group overflow-hidden">
              <div className="absolute inset-0 bg-[#C9A227]/5 opacity-30 group-hover:opacity-100 transition-opacity" />
              <span className="relative flex h-3.5 w-3.5 flex-shrink-0">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-red-500 shadow-[0_0_8px_#EF4444]"></span>
              </span>
              <div className="text-left relative z-10">
                <p className="text-[9px] text-[#C9A227] font-extrabold uppercase tracking-widest leading-none">Live Console</p>
                <p className="text-sm font-extrabold text-[#1A1800] mt-1.5 leading-none font-[var(--font-playfair)]">Availability Tracker</p>
                <p className="text-[9px] text-gray-400 font-semibold mt-1">Real-time building heatmap</p>
              </div>
            </div>

          </div>
        </section>

        {/* Stats and Layout Section */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 mt-8 items-start">
          
          {/* Sidebar - metrics & agent card (1/4 width) */}
          <div className="lg:col-span-1 space-y-6">
            
            {/* Sales Dashboard widget */}
            <div className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm space-y-4">
              <h3 className="text-xs font-extrabold text-gray-800 uppercase tracking-widest border-b border-gray-100 pb-2.5 flex items-center gap-2">
                <Layers size={16} className="text-[#C9A227]" />
                {isPlot ? 'Plotting Summary' : 'Building Summary'}
              </h3>
              
              {/* Progress bar */}
              <div className="space-y-2">
                <div className="flex justify-between text-xs font-bold text-gray-600">
                  <span>Sold Out</span>
                  <span className="text-[#C9A227] font-extrabold">{stats.soldPercentage}%</span>
                </div>
                <div className="w-full h-2.5 bg-gray-100 rounded-full overflow-hidden border border-gray-200/50 p-0.5">
                  <div 
                    className="h-full bg-gradient-to-r from-[#C9A227] to-[#F0D060] rounded-full transition-all duration-1000 shadow-[0_0_6px_rgba(201,162,39,0.3)]"
                    style={{ width: `${stats.soldPercentage}%` }}
                  />
                </div>
                <p className="text-[10px] text-gray-400 text-right font-bold">{stats.sold} of {stats.total} {isPlot ? 'plots' : 'units'} sold</p>
              </div>

              {/* Stat figures */}
              <div className="grid grid-cols-2 gap-3 pt-1">
                <div className="bg-[#FAF9F5]/80 p-3 rounded-xl border border-gray-100 text-center">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block mb-1 shadow-[0_0_6px_#10B981]"></span>
                  <p className="text-[9px] text-gray-500 font-extrabold uppercase tracking-wider">Available</p>
                  <p className="text-xl font-extrabold text-emerald-600">{stats.available}</p>
                </div>
                <div className="bg-[#FAF9F5]/80 p-3 rounded-xl border border-gray-100 text-center">
                  <span className="w-2 h-2 rounded-full bg-amber-500 inline-block mb-1 shadow-[0_0_6px_#F59E0B]"></span>
                  <p className="text-[9px] text-gray-500 font-extrabold uppercase tracking-wider">Reserved</p>
                  <p className="text-xl font-extrabold text-amber-600">{stats.reserved}</p>
                </div>
              </div>
            </div>

            {/* HIGHLY UNIQUE: Skyscraper Visual Heatmap Panel or Block Map overview */}
            {isPlot && plotPlan ? (
              <div className="bg-white border border-[#C9A227]/20 rounded-2xl p-5 shadow-sm space-y-4">
                <h3 className="text-xs font-extrabold text-gray-800 uppercase tracking-widest border-b border-gray-100 pb-2.5 flex items-center gap-2">
                  <Compass size={16} className="text-[#C9A227]" />
                  Blocks Map Overview
                </h3>

                <div className="border border-gray-100 rounded-xl p-3 bg-gray-50/50 flex flex-col space-y-2 max-h-[300px] overflow-y-auto scrollbar-thin">
                  {plotPlan.blocks.map((block, idx) => (
                    <div key={idx} className="flex items-center justify-between gap-2 border-b border-gray-100/30 pb-1.5 last:border-0 last:pb-0">
                      <span className="text-[9px] font-black text-gray-700 whitespace-nowrap uppercase tracking-wider">{block.blockName}</span>
                      <div className="flex flex-wrap gap-0.5 justify-end max-w-[120px]">
                        {block.plots.map((plot, pIdx) => (
                          <span
                            key={pIdx}
                            title={`Plot ${plot.number}: ${plot.status}`}
                            className={`w-2 h-2 rounded-full border transition-all ${
                              plot.status === 'sold'
                                ? 'bg-red-500 border-red-600 shadow-[0_0_3px_#EF4444]'
                                : plot.status === 'reserved'
                                  ? 'bg-amber-400 border-amber-500 shadow-[0_0_3px_#F59E0B]'
                                  : 'bg-emerald-500 border-emerald-600 shadow-[0_0_3px_#10B981]'
                            }`}
                          />
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : floorPlan ? (
              <div className="bg-white border border-[#C9A227]/20 rounded-2xl p-5 shadow-sm space-y-4">
                <h3 className="text-xs font-extrabold text-gray-800 uppercase tracking-widest border-b border-gray-100 pb-2.5 flex items-center gap-2">
                  <Compass size={16} className="text-[#C9A227]" />
                  Tower Heatmap
                </h3>

                <div className="border border-gray-100 rounded-xl p-3 bg-gray-50/50 flex flex-col space-y-1.5 max-h-[300px] overflow-y-auto scrollbar-thin">
                  {floorPlan.floors.slice().reverse().map((floor) => {
                    return (
                      <div key={floor.floorNumber} className="flex items-center justify-between gap-2 border-b border-gray-100/30 pb-1 last:border-0">
                        <span className="text-[9px] font-bold text-gray-400 whitespace-nowrap">{floor.floorName.replace(' Floor', '')}</span>
                        <div className="flex gap-1">
                          {floor.flats.map((flat, idx) => (
                            <span
                              key={idx}
                              title={`Flat ${flat.number}: ${flat.status}`}
                              className={`w-2.5 h-2.5 rounded-full border transition-all ${
                                flat.status === 'sold'
                                  ? 'bg-red-500 border-red-600 shadow-[0_0_4px_#EF4444]'
                                  : flat.status === 'reserved'
                                    ? 'bg-amber-400 border-amber-500 shadow-[0_0_4px_#F59E0B]'
                                    : 'bg-emerald-500 border-emerald-600 shadow-[0_0_4px_#10B981]'
                              }`}
                            />
                          ))}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ) : null}

            {/* Smart Agent contact card */}
            <div className="bg-white border border-[#C9A227]/30 rounded-2xl p-5 shadow-sm relative overflow-hidden">
              <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-bl from-[#C9A227]/5 to-transparent rounded-bl-full pointer-events-none" />
              <h3 className="text-xs font-bold text-gray-800 uppercase tracking-widest border-b border-gray-100 pb-2.5 flex items-center gap-1.5">
                <MessageSquare size={14} className="text-[#C9A227]" />
                Enquire Now
              </h3>
              
              <div className="flex items-center gap-3.5 mt-4">
                <div className="w-12 h-12 rounded-xl bg-[#C9A227]/10 border border-[#C9A227]/30 flex items-center justify-center text-[#C9A227] font-bold text-lg select-none">
                  {property.agent.name.charAt(0)}
                </div>
                <div>
                  <h4 className="font-bold text-gray-800 text-sm">{property.agent.name}</h4>
                  <p className="text-[10px] text-[#C9A227] font-bold">Relationship Manager</p>
                </div>
              </div>

              {/* Selected Unit/Plot callout */}
              {isPlot ? (
                selectedPlot ? (
                  <div className="mt-4 bg-[#C9A227]/5 border border-[#C9A227]/20 p-3.5 rounded-xl text-xs space-y-2 animate-in fade-in slide-in-from-bottom-2 duration-200">
                    <p className="text-gray-500 font-medium">Selected Plot:</p>
                    <div className="flex items-center justify-between">
                      <span className="font-extrabold text-gray-800 text-md">{selectedPlot._blockName ? `${selectedPlot._blockName} - ` : ''}Plot {selectedPlot.number}</span>
                      <span className="px-2 py-0.5 bg-emerald-500/10 text-emerald-700 border border-emerald-500/20 text-[10px] font-bold rounded">
                        {selectedPlot.sizeGaj} Gaj {selectedPlot.isCorner && '• Corner'}
                      </span>
                    </div>

                    <a
                      href={getWhatsappUrl(`${selectedPlot._blockName ? selectedPlot._blockName + ' - ' : ''}${selectedPlot.number}`, `${selectedPlot.sizeGaj} Gaj${selectedPlot.isCorner ? ', Corner' : ''}`)}
                      target="_blank"
                      className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-lg transition-colors flex items-center justify-center gap-1.5 shadow-[0_4px_12px_rgba(16,185,129,0.15)] cursor-pointer text-xs"
                    >
                      <MessageSquare size={14} />
                      Book via WhatsApp
                    </a>
                  </div>
                ) : (
                  <div className="mt-4 space-y-2">
                    <a
                      href={getWhatsappUrl()}
                      target="_blank"
                      className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl transition-all flex items-center justify-center gap-1.5 shadow-[0_4px_12px_rgba(16,185,129,0.15)] text-xs cursor-pointer"
                    >
                      <MessageSquare size={14} />
                      WhatsApp Enquire
                    </a>
                    <a
                      href={`tel:${property.agent.phone}`}
                      className="w-full py-2.5 bg-gray-50 hover:bg-gray-100 border border-gray-200 text-gray-700 font-bold rounded-xl transition-colors flex items-center justify-center gap-1.5 text-xs cursor-pointer"
                    >
                      <Phone size={14} className="text-[#C9A227]" />
                      Call Manager
                    </a>
                  </div>
                )
              ) : (
                selectedFlat ? (
                  <div className="mt-4 bg-[#C9A227]/5 border border-[#C9A227]/20 p-3.5 rounded-xl text-xs space-y-2 animate-in fade-in slide-in-from-bottom-2 duration-200">
                    <p className="text-gray-500 font-medium">Selected Unit:</p>
                    <div className="flex items-center justify-between">
                      <span className="font-extrabold text-gray-800 text-md">{selectedFlat._floorName ? `${selectedFlat._floorName} - ` : ''}Unit {selectedFlat.number}</span>
                      <span className="px-2 py-0.5 bg-emerald-500/10 text-emerald-700 border border-emerald-500/20 text-[10px] font-bold rounded">
                        {selectedFlat.bedrooms ? `${selectedFlat.bedrooms} BHK` : 'Available'}
                      </span>
                    </div>

                    <a
                      href={getWhatsappUrl(`${selectedFlat._floorName ? selectedFlat._floorName + ' - ' : ''}${selectedFlat.number}`, selectedFlat.bedrooms ? `${selectedFlat.bedrooms} BHK` : undefined)}
                      target="_blank"
                      className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-lg transition-colors flex items-center justify-center gap-1.5 shadow-[0_4px_12px_rgba(16,185,129,0.15)] cursor-pointer text-xs"
                    >
                      <MessageSquare size={14} />
                      Book via WhatsApp
                    </a>
                  </div>
                ) : (
                  <div className="mt-4 space-y-2">
                    <a
                      href={getWhatsappUrl()}
                      target="_blank"
                      className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl transition-all flex items-center justify-center gap-1.5 shadow-[0_4px_12px_rgba(16,185,129,0.15)] text-xs cursor-pointer"
                    >
                      <MessageSquare size={14} />
                      WhatsApp Enquire
                    </a>
                    <a
                      href={`tel:${property.agent.phone}`}
                      className="w-full py-2.5 bg-gray-50 hover:bg-gray-100 border border-gray-200 text-gray-700 font-bold rounded-xl transition-colors flex items-center justify-center gap-1.5 text-xs cursor-pointer"
                    >
                      <Phone size={14} className="text-[#C9A227]" />
                      Call Manager
                    </a>
                  </div>
                )
              )}
            </div>

            {/* Instruction tooltip */}
            <div className="bg-[#FAF9F5] border border-gray-100 rounded-2xl p-4 text-[11px] text-gray-500 space-y-2">
              <h4 className="font-bold text-gray-700 flex items-center gap-1">
                <Info size={12} className="text-[#C9A227]" />
                User Instructions
              </h4>
              {isPlot ? (
                <>
                  <p>1. Scroll down to view the listed blocks and layout map grids.</p>
                  <p>2. Available plots are marked in **clean green**. Click them to prefill WhatsApp details!</p>
                  <p>3. Corner plots have a gold **CORNER** crown badge at the top-right.</p>
                  <p>4. Sold plots are colored red with a glowing SOLD badge.</p>
                </>
              ) : (
                <>
                  <p>1. Scroll the stacked layout on the right to view active floors.</p>
                  <p>2. Available flats are marked in **clean green**. Click them to auto-fill booking details in the chat window!</p>
                  <p>3. Sold flats are greyed out and crossed out in order to prevent booking.</p>
                </>
              )}
            </div>

          </div>

          {/* Interactive Stack grid (3/4 width) */}
          <div className="lg:col-span-3 space-y-6">
            
            {/* Filters panel */}
            <div className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="flex items-center gap-2 text-sm text-gray-700">
                <Filter size={16} className="text-[#C9A227]" />
                <span className="font-bold">Filter {isPlot ? 'Plots' : 'Availability'}:</span>
              </div>
              
              {isPlot ? (
                /* Plot layout filters */
                <div className="flex flex-wrap items-center gap-2">
                  <button
                    onClick={() => setSizeFilter('all')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all border cursor-pointer ${
                      sizeFilter === 'all'
                        ? 'bg-[#C9A227] border-[#C9A227] text-[#1A1800] shadow-[0_2px_8px_rgba(201,162,39,0.15)] font-bold'
                        : 'bg-gray-50 border-gray-200/60 text-gray-600 hover:bg-gray-100'
                    }`}
                  >
                    All Sizes
                  </button>
                  {stats.availableSizes.map(size => (
                    <button
                      key={size}
                      onClick={() => setSizeFilter(size)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all border cursor-pointer ${
                        sizeFilter === size
                          ? 'bg-[#C9A227] border-[#C9A227] text-[#1A1800] shadow-[0_2px_8px_rgba(201,162,39,0.15)] font-bold'
                          : 'bg-gray-50 border-gray-200 text-gray-600 hover:bg-gray-100'
                      }`}
                    >
                      {size} Gaj
                    </button>
                  ))}
                  
                  <div className="w-px h-6 bg-gray-200 mx-1 hidden md:block" />
                  
                  <button
                    onClick={() => setCornerFilter(prev => !prev)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all border cursor-pointer flex items-center gap-1.5 ${
                      cornerFilter
                        ? 'bg-[#C9A227]/20 border-[#C9A227] text-[#B8860B] font-bold shadow-sm'
                        : 'bg-gray-50 border-gray-200/60 text-gray-600 hover:bg-gray-100'
                    }`}
                  >
                    👑 Corner Plots
                  </button>
                  
                  <button
                    onClick={() => setStatusFilter(prev => prev === 'all' ? 'available' : 'all')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all border cursor-pointer flex items-center gap-1.5 ${
                      statusFilter === 'available'
                        ? 'bg-emerald-600 border-emerald-600 text-white shadow-[0_2px_8px_rgba(16,185,129,0.15)] font-bold'
                        : 'bg-gray-50 border-gray-200/60 text-gray-600 hover:bg-gray-100'
                    }`}
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                    Available Only
                  </button>
                </div>
              ) : (
                /* BHK filter list */
                <div className="flex flex-wrap items-center gap-2">
                  <button
                    onClick={() => setBhkFilter('all')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all border cursor-pointer ${
                      bhkFilter === 'all'
                        ? 'bg-[#C9A227] border-[#C9A227] text-[#1A1800] shadow-[0_2px_8px_rgba(201,162,39,0.15)] font-bold'
                        : 'bg-gray-50 border-gray-200/60 text-gray-600 hover:bg-gray-100'
                    }`}
                  >
                    All BHK
                  </button>
                  {stats.availableBhks.map(bhk => (
                    <button
                      key={bhk}
                      onClick={() => setBhkFilter(bhk)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all border cursor-pointer ${
                        bhkFilter === bhk
                          ? 'bg-[#C9A227] border-[#C9A227] text-[#1A1800] shadow-[0_2px_8px_rgba(201,162,39,0.15)] font-bold'
                          : 'bg-gray-50 border-gray-200 text-gray-600 hover:bg-gray-100'
                      }`}
                    >
                      {bhk} BHK
                    </button>
                  ))}
                  
                  {/* Availability filter */}
                  <div className="w-px h-6 bg-gray-200 mx-1 hidden md:block" />
                  
                  <button
                    onClick={() => setStatusFilter(prev => prev === 'all' ? 'available' : 'all')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all border cursor-pointer flex items-center gap-1.5 ${
                      statusFilter === 'available'
                        ? 'bg-emerald-600 border-emerald-600 text-white shadow-[0_2px_8px_rgba(16,185,129,0.15)] font-bold'
                        : 'bg-gray-50 border-gray-200/60 text-gray-600 hover:bg-gray-100'
                    }`}
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                    Available Only
                  </button>
                </div>
              )}
            </div>

            {/* Vertical floor stack or Block-wise stack visual list */}
            <div className="space-y-6">
              {isPlot && plotPlan ? (
                /* Plot plan render */
                plotPlan.blocks.map((block, idx) => {
                  const filteredPlots = block.plots.filter(plot => {
                    const matchesSize = sizeFilter === 'all' || plot.sizeGaj === sizeFilter;
                    const matchesCorner = !cornerFilter || plot.isCorner;
                    const matchesStatus = statusFilter === 'all' || plot.status === 'available';
                    return matchesSize && matchesCorner && matchesStatus;
                  });

                  if (filteredPlots.length === 0) return null;

                  return (
                    <div 
                      key={idx} 
                      className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm space-y-4 hover:border-[#C9A227]/40 hover:shadow-md transition-all duration-300 relative group"
                    >
                      {/* Block Label */}
                      <div className="flex items-center gap-2 border-b border-gray-100 pb-2">
                        <Layers size={14} className="text-[#C9A227]" />
                        <h4 className="font-extrabold text-sm text-gray-800 tracking-wide uppercase font-[var(--font-playfair)]">
                          {block.blockName}
                        </h4>
                      </div>

                      {/* Plots Grid Layout */}
                      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                        {filteredPlots.map((plot, pIndex) => {
                          const isAvailable = plot.status === 'available';
                          const isReserved = plot.status === 'reserved';
                          const isSold = plot.status === 'sold';
                          
                          let topBarColor = 'bg-emerald-500 shadow-[0_0_6px_#10B981]';
                          let cardStyle = 'bg-white border border-gray-200/80 text-emerald-800 hover:border-emerald-500 hover:bg-emerald-50/10 cursor-pointer shadow-sm';
                          
                          if (isSold) {
                            topBarColor = 'bg-red-600 shadow-[0_0_8px_#DC2626]';
                            cardStyle = 'bg-red-50/90 border border-red-300/80 text-red-800 cursor-not-allowed pointer-events-none shadow-[inset_0_0_4px_rgba(220,38,38,0.05)]';
                          } else if (isReserved) {
                            topBarColor = 'bg-amber-500 shadow-[0_0_6px_#F59E0B]';
                            cardStyle = 'bg-white border border-gray-200/80 text-amber-800 hover:border-amber-500 hover:bg-amber-50/10 cursor-pointer shadow-sm';
                          }

                          const isSelected = selectedPlot?.number === plot.number && selectedPlot?._blockName === block.blockName;
                          if (isSelected) {
                            topBarColor = 'bg-[#C9A227] shadow-[0_0_8px_#C9A227]';
                            cardStyle = 'bg-[#C9A227]/5 border-2 border-[#C9A227] text-[#1A1800] scale-[1.03] cursor-pointer shadow-md';
                          }

                          return (
                            <div
                              key={pIndex}
                              onClick={() => {
                                if (isAvailable || isReserved) {
                                  setSelectedPlot(isSelected ? null : { ...plot, _blockName: block.blockName });
                                }
                              }}
                              className={`rounded-xl overflow-hidden relative flex flex-col justify-center min-h-[95px] pt-3.5 pb-2.5 px-4 transition-all duration-300 hover:-translate-y-1 ${cardStyle}`}
                            >
                              <div className={`absolute top-0 inset-x-0 h-1.5 ${topBarColor}`} />

                              <span className={`font-extrabold text-sm tracking-wider block ${isSold ? 'text-red-700 line-through decoration-red-500 decoration-2' : 'text-gray-900'}`}>Plot {plot.number}</span>
                              
                              <span className={`text-[10px] font-bold mt-1 block ${isSold ? 'text-red-600/70 line-through' : 'text-gray-400'}`}>
                                {plot.sizeGaj} Gaj
                              </span>



                              {plot.isCorner && (
                                <span className="absolute top-2.5 right-2 px-1.5 py-0.5 bg-amber-500 text-white rounded text-[7px] font-black uppercase tracking-wider shadow-[0_1px_3px_rgba(245,158,11,0.2)]">
                                  CORNER
                                </span>
                              )}

                              {isAvailable && (
                                <span className="absolute bottom-2 right-2.5 w-1.5 h-1.5 bg-emerald-500 rounded-full shadow-[0_0_4px_#10B981]"></span>
                              )}
                              {isReserved && (
                                <span className="absolute bottom-2 right-2.5 w-1.5 h-1.5 bg-amber-500 rounded-full shadow-[0_0_4px_#F59E0B]"></span>
                              )}
                              {isSold && (
                                <span className="absolute bottom-2 right-2.5 px-2 py-0.5 bg-red-600 text-white rounded-md text-[8px] font-black uppercase tracking-widest shadow-[0_2px_6px_rgba(220,38,38,0.3)] animate-pulse">
                                  SOLD
                                </span>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  );
                })
              ) : floorPlan ? (
                /* Floor plan render */
                floorPlan.floors.slice().reverse().map((floor) => {
                  const filteredFlats = floor.flats.filter(flat => {
                    const matchesBhk = bhkFilter === 'all' || flat.bedrooms === bhkFilter;
                    const matchesStatus = statusFilter === 'all' || flat.status === 'available';
                    return matchesBhk && matchesStatus;
                  });

                  if (filteredFlats.length === 0) return null;

                  return (
                    <div 
                      key={floor.floorNumber} 
                      className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm space-y-4 hover:border-[#C9A227]/40 hover:shadow-md transition-all duration-300 relative group"
                    >
                      {/* Floor Label */}
                      <div className="flex items-center gap-2 border-b border-gray-100 pb-2">
                        <Layers size={14} className="text-[#C9A227]" />
                        <h4 className="font-extrabold text-sm text-gray-800 tracking-wide uppercase font-[var(--font-playfair)]">
                          {floor.floorName}
                        </h4>
                      </div>

                      {/* Flats Grid Layout */}
                      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                        {filteredFlats.map((flat, fIndex) => {
                          const isAvailable = flat.status === 'available';
                          const isReserved = flat.status === 'reserved';
                          const isSold = flat.status === 'sold';
                          
                          let topBarColor = 'bg-emerald-500 shadow-[0_0_6px_#10B981]';
                          let cardStyle = 'bg-white border border-gray-200/80 text-emerald-800 hover:border-emerald-500 hover:bg-emerald-50/10 cursor-pointer shadow-sm';
                          
                          if (isSold) {
                            topBarColor = 'bg-red-600 shadow-[0_0_8px_#DC2626]';
                            cardStyle = 'bg-red-50/90 border border-red-300/80 text-red-800 cursor-not-allowed pointer-events-none shadow-[inset_0_0_4px_rgba(220,38,38,0.05)]';
                          } else if (isReserved) {
                            topBarColor = 'bg-amber-500 shadow-[0_0_6px_#F59E0B]';
                            cardStyle = 'bg-white border border-gray-200/80 text-amber-800 hover:border-amber-500 hover:bg-amber-50/10 cursor-pointer shadow-sm';
                          }

                          const isSelected = selectedFlat?.number === flat.number && selectedFlat?._floorName === floor.floorName;
                          if (isSelected) {
                            topBarColor = 'bg-[#C9A227] shadow-[0_0_8px_#C9A227]';
                            cardStyle = 'bg-[#C9A227]/5 border-2 border-[#C9A227] text-[#1A1800] scale-[1.03] cursor-pointer shadow-md';
                          }

                          return (
                            <div
                              key={fIndex}
                              onClick={() => {
                                if (isAvailable || isReserved) {
                                  setSelectedFlat(isSelected ? null : { ...flat, _floorName: floor.floorName });
                                }
                              }}
                              className={`rounded-xl overflow-hidden relative flex flex-col justify-center min-h-[95px] pt-3.5 pb-2.5 px-4 transition-all duration-300 hover:-translate-y-1 ${cardStyle}`}
                            >
                              <div className={`absolute top-0 inset-x-0 h-1.5 ${topBarColor}`} />

                              <span className={`font-extrabold text-sm tracking-wider block ${isSold ? 'text-red-700 line-through decoration-red-500 decoration-2' : 'text-gray-900'}`}>{flat.number}</span>
                              
                              {flat.bedrooms ? (
                                <span className={`text-[10px] font-bold mt-1 block ${isSold ? 'text-red-600/70 line-through' : 'text-gray-400'}`}>
                                  {flat.bedrooms} BHK
                                </span>
                              ) : (
                                <span className={`text-[10px] font-medium mt-1 block ${isSold ? 'text-red-600/70 line-through' : 'text-gray-400'}`}>Unit</span>
                              )}



                              {isAvailable && (
                                <span className="absolute bottom-2 right-2.5 w-1.5 h-1.5 bg-emerald-500 rounded-full shadow-[0_0_4px_#10B981]"></span>
                              )}
                              {isReserved && (
                                <span className="absolute bottom-2 right-2.5 w-1.5 h-1.5 bg-amber-500 rounded-full shadow-[0_0_4px_#F59E0B]"></span>
                              )}
                              {isSold && (
                                <span className="absolute bottom-2 right-2.5 px-2 py-0.5 bg-red-600 text-white rounded-md text-[8px] font-black uppercase tracking-widest shadow-[0_2px_6px_rgba(220,38,38,0.3)] animate-pulse">
                                  SOLD
                                </span>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  );
                })
              ) : null}
            </div>

          </div>

        </div>

      </main>
    </div>
  );
}
