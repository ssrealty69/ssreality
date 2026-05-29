'use client';

import { useState, useEffect } from 'react';
import { Loader2, TrendingUp, Compass, Award, ShieldAlert, CheckCircle2, RefreshCw, BarChart2, ShieldCheck, Database, Link2, ExternalLink, Search, MapPin, X } from 'lucide-react';
import toast from 'react-hot-toast';

interface TrendHistoryItem {
  year: number;
  price: number;
}

interface LocationTrendItem {
  _id: string;
  name: string;
  currentPrice: number;
  cagr: number;
  connectivity: number;
  infrastructure: number;
  livability: number;
  commercialProximity: number;
  growthDrivers: string[];
  verdict: string;
  trendHistory: TrendHistoryItem[];
  dataSource: string;
  reraRegistration: string;
  indexBenchmark: string;
  dataConfidence: number;
}

const NEIGHBORHOOD_RETURNS = [
  {
    city: 'Gurugram',
    area: 'Golf Course Extension Road',
    returnRate: 48.4,
    currentPrice: '₹15,500/sq.ft',
    sparklinePoints: [10500, 12200, 13800, 15500],
  },
  {
    city: 'Gurugram',
    area: 'IMT Sohna Corridor',
    returnRate: 52.8,
    currentPrice: '₹8,200/sq.ft',
    sparklinePoints: [5300, 6400, 7200, 8200],
  },
  {
    city: 'Gurugram',
    area: 'Dwarka Expressway',
    returnRate: 45.2,
    currentPrice: '₹12,800/sq.ft',
    sparklinePoints: [8800, 10200, 11500, 12800],
  },
  {
    city: 'Noida',
    area: 'Sector 150 (Eco-Hub)',
    returnRate: 36.5,
    currentPrice: '₹7,800/sq.ft',
    sparklinePoints: [5700, 6400, 7100, 7800],
  },
  {
    city: 'Noida',
    area: 'Sector 62 (Commercial Corridor)',
    returnRate: 28.2,
    currentPrice: '₹9,200/sq.ft',
    sparklinePoints: [7200, 7900, 8500, 9200],
  },
  {
    city: 'Greater Noida',
    area: 'Noida Extension (Greater Noida West)',
    returnRate: 31.4,
    currentPrice: '₹6,200/sq.ft',
    sparklinePoints: [4700, 5200, 5700, 6200],
  },
  {
    city: 'Greater Noida',
    area: 'Yamuna Expressway (Jewar Hub)',
    returnRate: 58.6,
    currentPrice: '₹4,800/sq.ft',
    sparklinePoints: [3000, 3600, 4200, 4800],
  },
  {
    city: 'Delhi',
    area: 'Dwarka Sector 19',
    returnRate: 24.6,
    currentPrice: '₹11,500/sq.ft',
    sparklinePoints: [9200, 9900, 10600, 11500],
  },
  {
    city: 'Delhi',
    area: 'Vasant Kunj Residential',
    returnRate: 19.8,
    currentPrice: '₹18,500/sq.ft',
    sparklinePoints: [15400, 16300, 17400, 18500],
  }
];

const renderSparkline = (points: number[], areaName: string) => {
  const min = Math.min(...points);
  const max = Math.max(...points);
  const range = max - min || 1;
  const width = 120;
  const height = 40;
  const padding = 3;
  const pts = points.map((p, idx) => {
    const x = padding + (idx / (points.length - 1)) * (width - padding * 2);
    const y = height - padding - ((p - min) / range) * (height - padding * 2);
    return { x, y };
  });
  const d = pts.map((p, idx) => `${idx === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ');
  const areaD = `${d} L ${pts[pts.length - 1].x} ${height} L ${pts[0].x} ${height} Z`;
  const gradId = `sparkGrad-${areaName.replace(/\s+/g, '-').toLowerCase()}`;
  
  return (
    <svg width={width} height={height} className="overflow-visible select-none pointer-events-none">
      <defs>
        <linearGradient id={gradId} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#10B981" stopOpacity="0.25" />
          <stop offset="100%" stopColor="#10B981" stopOpacity="0.0" />
        </linearGradient>
      </defs>
      <path d={areaD} fill={`url(#${gradId})`} />
      <path d={d} fill="none" stroke="#10B981" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx={pts[pts.length - 1].x} cy={pts[pts.length - 1].y} r="3.5" fill="#10B981" stroke="#FFF" strokeWidth="1.5" />
    </svg>
  );
};

export default function InvestmentPredictor() {
  const [trends, setTrends] = useState<LocationTrendItem[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Return tracker states
  const [selectedCityTab, setSelectedCityTab] = useState<'All' | 'Gurugram' | 'Noida' | 'Greater Noida' | 'Delhi'>('All');
  const [areaSearchQuery, setAreaSearchQuery] = useState('');

  // Comparative state
  const [locAId, setLocAId] = useState<string>('');
  const [locBId, setLocBId] = useState<string>('');
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);
  const [timeframe, setTimeframe] = useState<5 | 10>(5);

  // Search autocomplete states
  const [searchQueryA, setSearchQueryA] = useState('');
  const [searchQueryB, setSearchQueryB] = useState('');
  const [showSuggestionsA, setShowSuggestionsA] = useState(false);
  const [showSuggestionsB, setShowSuggestionsB] = useState(false);
  const [isSearchingA, setIsSearchingA] = useState(false);
  const [isSearchingB, setIsSearchingB] = useState(false);

  useEffect(() => {
    fetch('/api/investment/trends')
      .then((res) => {
        if (!res.ok) throw new Error('Failed to load investment trends');
        return res.json();
      })
      .then((json) => {
        if (json.success && json.data) {
          setTrends(json.data);
          if (json.data.length >= 2) {
            setLocAId(json.data[0]._id);
            setLocBId(json.data[1]._id);
            // Pre-populate search query strings cleanly without any emojis
            setSearchQueryA(json.data[0].name.replace(/[\uD800-\uDBFF][\uDC00-\uDFFF]/g, '').trim());
            setSearchQueryB(json.data[1].name.replace(/[\uD800-\uDBFF][\uDC00-\uDFFF]/g, '').trim());
          }
        }
      })
      .catch((err) => {
        console.error(err);
        toast.error('Failed to initialize investment engine');
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  const handleSelectSuggestion = (locationName: string, isAnchor: boolean) => {
    const cleanName = locationName.replace(/[\uD800-\uDBFF][\uDC00-\uDFFF]/g, '').trim();
    if (isAnchor) {
      setSearchQueryA(cleanName);
      setShowSuggestionsA(false);
    } else {
      setSearchQueryB(cleanName);
      setShowSuggestionsB(false);
    }
  };

  const handleCompareTelemetry = async () => {
    if (!searchQueryA.trim() || !searchQueryB.trim()) {
      toast.error('Please enter both location names to compare.');
      return;
    }
    if (searchQueryA.trim().toLowerCase() === searchQueryB.trim().toLowerCase()) {
      toast.error('Location A and Location B cannot be the same.');
      return;
    }

    setIsSearchingA(true);
    setIsSearchingB(true);

    try {
      // 1. Fetch Location A
      const resA = await fetch(`/api/investment/trends?query=${encodeURIComponent(searchQueryA.trim())}`);
      const jsonA = await resA.json();

      // 2. Fetch Location B
      const resB = await fetch(`/api/investment/trends?query=${encodeURIComponent(searchQueryB.trim())}`);
      const jsonB = await resB.json();

      if (jsonA.success && jsonA.data && jsonB.success && jsonB.data) {
        const itemA = jsonA.data;
        const itemB = jsonB.data;

        // Strip emojis to make future text inputs perfectly clean
        const cleanA = itemA.name.replace(/[\uD800-\uDBFF][\uDC00-\uDFFF]/g, '').trim();
        const cleanB = itemB.name.replace(/[\uD800-\uDBFF][\uDC00-\uDFFF]/g, '').trim();

        // Add both retrieved locations to state if they are missing
        setTrends(prev => {
          let updated = [...prev];
          if (!updated.find(t => t._id === itemA._id)) updated.push(itemA);
          else updated = updated.map(t => t._id === itemA._id ? itemA : t);

          if (!updated.find(t => t._id === itemB._id)) updated.push(itemB);
          else updated = updated.map(t => t._id === itemB._id ? itemB : t);

          return updated;
        });

        setLocAId(itemA._id);
        setLocBId(itemB._id);
        setSearchQueryA(cleanA);
        setSearchQueryB(cleanB);

        toast.success('Investment comparison synchronised successfully!');
      } else {
        toast.error('Failed to retrieve telemetry data. Please check place spelling.');
      }
    } catch (err) {
      console.error(err);
      toast.error('Investment search offline. Please try again.');
    } finally {
      setIsSearchingA(false);
      setIsSearchingB(false);
    }
  };

  if (loading) {
    return (
      <section className="py-20 bg-[#FFFEF5] border-b border-[#E8D5A3]/30 flex flex-col items-center justify-center space-y-4">
        <Loader2 className="animate-spin text-[#C9A227]" size={36} />
        <p className="text-xs font-extrabold text-gray-400 uppercase tracking-widest animate-pulse">Initializing Investment Predictor...</p>
      </section>
    );
  }

  const locA = trends.find((t) => t._id === locAId) || trends[0];
  const locB = trends.find((t) => t._id === locBId) || trends[1];

  if (!locA || !locB) return null;

  // Year range: 5-year => currentYear to currentYear+5, 10-year => currentYear to currentYear+10
  // Automatically advances each calendar year — no manual updates needed
  const currentYear = new Date().getFullYear();
  const startYear = currentYear;  // Always starts from current year (e.g. 2026)
  const yearsCount = timeframe === 5 ? 6 : 11; // 6 points = 5-year span; 11 points = 10-year span
  const years = Array.from({ length: yearsCount }, (_, i) => startYear + i);
  
  const historyA = years.map(yr => {
    const pt = locA.trendHistory.find(h => h.year === yr);
    if (pt) return { year: yr, price: pt.price };
    
    // Project dynamically — base year is always currentYear (auto-updates each year)
    const diff = yr - currentYear;
    const price = Math.round(locA.currentPrice * Math.pow(1 + (locA.cagr / 100), diff));
    return { year: yr, price };
  });

  const historyB = years.map(yr => {
    const pt = locB.trendHistory.find(h => h.year === yr);
    if (pt) return { year: yr, price: pt.price };
    
    // Project dynamically — base year is always currentYear (auto-updates each year)
    const diff = yr - currentYear;
    const price = Math.round(locB.currentPrice * Math.pow(1 + (locB.cagr / 100), diff));
    return { year: yr, price };
  });

  // Calculate SVG dimensions
  const width = 500;
  const height = 200;
  const paddingX = 45;
  const paddingY = 20;
  const chartWidth = width - paddingX * 2;
  const chartHeight = height - paddingY * 2;

  // Find max price to scale Y axis
  const maxPrice = Math.max(...historyA.map(h => h.price), ...historyB.map(h => h.price), 1000) * 1.1;

  const pointsA = historyA.map((h, idx) => {
    const x = paddingX + (idx / (years.length - 1)) * chartWidth;
    const y = height - paddingY - (h.price / maxPrice) * chartHeight;
    return { x, y, data: h };
  });

  const pointsB = historyB.map((h, idx) => {
    const x = paddingX + (idx / (years.length - 1)) * chartWidth;
    const y = height - paddingY - (h.price / maxPrice) * chartHeight;
    return { x, y, data: h };
  });

  const linePathA = pointsA.map((p, idx) => `${idx === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ');
  const areaPathA = pointsA.length > 0 
    ? `${linePathA} L ${pointsA[pointsA.length - 1].x} ${height - paddingY} L ${pointsA[0].x} ${height - paddingY} Z`
    : '';

  const linePathB = pointsB.map((p, idx) => `${idx === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ');
  const areaPathB = pointsB.length > 0 
    ? `${linePathB} L ${pointsB[pointsB.length - 1].x} ${height - paddingY} L ${pointsB[0].x} ${height - paddingY} Z`
    : '';

  // Determine winners
  const isWinnerA = locA.cagr >= locB.cagr;
  
  return (
    <section id="investment-comparison" className="py-20 bg-[#FFFEF5] border-b border-[#E8D5A3]/30 font-sans relative overflow-hidden">
      {/* Background radial overlays */}
      <div className="absolute inset-0 opacity-[0.02] pointer-events-none" style={{ backgroundImage: 'radial-gradient(#C9A227 1px, transparent 1px)', backgroundSize: '32px 32px' }} />
      <div className="absolute top-0 right-0 w-[40%] h-[80%] bg-gradient-to-l from-[#C9A227]/5 to-transparent pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Title Block */}
        <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
          <span className="px-3.5 py-1.5 bg-[#C9A227]/10 border border-[#E8D5A3]/40 text-[#B8860B] rounded-full text-[10px] font-black uppercase tracking-widest shadow-sm">
            Interactive AI Telemetry
          </span>
          <h2 className="text-3xl md:text-5xl font-black font-[var(--font-playfair)] text-[#1A1800] tracking-tight leading-[1.15]">
            Delhi NCR <span className="text-[#C9A227]">Investment Predictor</span> & Comparison
          </h2>
          <p className="text-[#6b6450] text-sm md:text-base leading-relaxed">
            Choose any two emerging residential, commercial, or airport corridor micro-markets in Delhi NCR to dynamically compare 5-year price trajectories, infrastructure ratings, and growth drivers.
          </p>
        </div>

        {/* Dropdowns Selector Card */}
        <div className="bg-white border border-[#E8D5A3]/30 rounded-3xl p-6 md:p-8 shadow-md mb-10 space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 relative">
            
            {/* Selector Location A */}
            <div className="space-y-2 relative">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-[#C9A227]" />
                Compare Location A (Anchor)
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={searchQueryA}
                  onChange={(e) => {
                    setSearchQueryA(e.target.value);
                    setShowSuggestionsA(true);
                  }}
                  onFocus={() => {
                    setShowSuggestionsA(true);
                    setShowSuggestionsB(false);
                  }}
                  className="w-full bg-[#FFFEF5] border border-[#E8D5A3]/40 rounded-xl pl-4 pr-16 py-3.5 text-[15px] font-bold text-[#1A1800] focus:outline-none focus:border-[#C9A227] focus:ring-1 focus:ring-[#C9A227] shadow-sm transition-all"
                  placeholder="Type sector/area name (e.g. Sector 150 Noida)..."
                />
                
                {/* Mobile Clear Button (Instantly clears inputs with 1 tap) */}
                {searchQueryA && (
                  <button
                    type="button"
                    onClick={() => {
                      setSearchQueryA('');
                      setShowSuggestionsA(true);
                    }}
                    className="absolute right-10 top-3.5 text-gray-400 hover:text-gray-600 transition-colors p-0.5 rounded-full hover:bg-gray-100"
                    title="Clear input"
                  >
                    <X size={15} />
                  </button>
                )}

                <div className="absolute right-3.5 top-3.5 flex items-center justify-center">
                  {isSearchingA ? (
                    <Loader2 className="animate-spin text-[#C9A227]" size={16} />
                  ) : (
                    <Compass className="text-[#C9A227]" size={16} />
                  )}
                </div>
              </div>

              {/* Suggestions Overlay A */}
              {showSuggestionsA && (
                <>
                  <div className="fixed inset-0 z-40" onClick={() => setShowSuggestionsA(false)} />
                  <ul className="absolute left-0 right-0 top-full mt-2 bg-white border border-[#E8D5A3]/40 rounded-2xl shadow-xl z-50 max-h-60 overflow-y-auto divide-y divide-[#E8D5A3]/10 divide-dashed">
                    {/* Preset matches */}
                    {trends
                      .filter(t => t.name.toLowerCase().includes(searchQueryA.toLowerCase()))
                      .slice(0, 5)
                      .map(t => {
                        const cleanName = t.name.replace(/[\uD800-\uDBFF][\uDC00-\uDFFF]/g, '').trim();
                        return (
                          <li
                            key={t._id}
                            onClick={() => handleSelectSuggestion(t.name, true)}
                            className="px-4 py-3 text-xs font-bold text-gray-700 hover:bg-[#C9A227]/5 hover:text-[#B8860B] transition-colors cursor-pointer flex items-center justify-between"
                          >
                            <span>{cleanName}</span>
                            <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest bg-gray-100 px-1.5 py-0.5 rounded">Preset</span>
                          </li>
                        );
                      })}
                    {/* Custom Option */}
                    {searchQueryA.trim().length >= 3 && !trends.some(t => t.name.toLowerCase() === searchQueryA.trim().toLowerCase()) && (
                      <li
                        onClick={() => handleSelectSuggestion(searchQueryA.trim(), true)}
                        className="px-4 py-3.5 text-xs font-black text-[#B8860B] hover:bg-[#C9A227]/10 transition-colors cursor-pointer flex items-center gap-2 bg-[#C9A227]/5"
                      >
                        <RefreshCw size={14} className="animate-spin" />
                        <span>Compare Custom: &quot;{searchQueryA.trim()}&quot;</span>
                      </li>
                    )}
                    {trends.filter(t => t.name.toLowerCase().includes(searchQueryA.toLowerCase())).length === 0 && searchQueryA.trim().length < 3 && (
                      <li className="px-4 py-3 text-xs text-gray-400 font-bold text-center">
                        Type at least 3 letters to generate custom sector...
                      </li>
                    )}
                  </ul>
                </>
              )}
            </div>

            {/* Selector Location B */}
            <div className="space-y-2 relative">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-gray-400" />
                Compare Location B (Benchmark)
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={searchQueryB}
                  onChange={(e) => {
                    setSearchQueryB(e.target.value);
                    setShowSuggestionsB(true);
                  }}
                  onFocus={() => {
                    setShowSuggestionsB(true);
                    setShowSuggestionsA(false);
                  }}
                  className="w-full bg-[#FFFEF5] border border-[#E8D5A3]/40 rounded-xl pl-4 pr-16 py-3.5 text-[15px] font-bold text-[#1A1800] focus:outline-none focus:border-[#C9A227] focus:ring-1 focus:ring-[#C9A227] shadow-sm transition-all"
                  placeholder="Type sector/area name (e.g. Sector 21 Gurugram)..."
                />

                {/* Mobile Clear Button (Instantly clears inputs with 1 tap) */}
                {searchQueryB && (
                  <button
                    type="button"
                    onClick={() => {
                      setSearchQueryB('');
                      setShowSuggestionsB(true);
                    }}
                    className="absolute right-10 top-3.5 text-gray-400 hover:text-gray-600 transition-colors p-0.5 rounded-full hover:bg-gray-100"
                    title="Clear input"
                  >
                    <X size={15} />
                  </button>
                )}

                <div className="absolute right-3.5 top-3.5 flex items-center justify-center">
                  {isSearchingB ? (
                    <Loader2 className="animate-spin text-[#C9A227]" size={16} />
                  ) : (
                    <Compass className="text-[#C9A227]" size={16} />
                  )}
                </div>
              </div>

              {/* Suggestions Overlay B */}
              {showSuggestionsB && (
                <>
                  <div className="fixed inset-0 z-40" onClick={() => setShowSuggestionsB(false)} />
                  <ul className="absolute left-0 right-0 top-full mt-2 bg-white border border-[#E8D5A3]/40 rounded-2xl shadow-xl z-50 max-h-60 overflow-y-auto divide-y divide-[#E8D5A3]/10 divide-dashed">
                    {/* Preset matches */}
                    {trends
                      .filter(t => t.name.toLowerCase().includes(searchQueryB.toLowerCase()))
                      .slice(0, 5)
                      .map(t => {
                        const cleanName = t.name.replace(/[\uD800-\uDBFF][\uDC00-\uDFFF]/g, '').trim();
                        return (
                          <li
                            key={t._id}
                            onClick={() => handleSelectSuggestion(t.name, false)}
                            className="px-4 py-3 text-xs font-bold text-gray-700 hover:bg-[#C9A227]/5 hover:text-[#B8860B] transition-colors cursor-pointer flex items-center justify-between"
                          >
                            <span>{cleanName}</span>
                            <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest bg-gray-100 px-1.5 py-0.5 rounded">Preset</span>
                          </li>
                        );
                      })}
                    {/* Custom Option */}
                    {searchQueryB.trim().length >= 3 && !trends.some(t => t.name.toLowerCase() === searchQueryB.trim().toLowerCase()) && (
                      <li
                        onClick={() => handleSelectSuggestion(searchQueryB.trim(), false)}
                        className="px-4 py-3.5 text-xs font-black text-[#B8860B] hover:bg-[#C9A227]/10 transition-colors cursor-pointer flex items-center gap-2 bg-[#C9A227]/5"
                      >
                        <RefreshCw size={14} className="animate-spin" />
                        <span>Compare Custom: &quot;{searchQueryB.trim()}&quot;</span>
                      </li>
                    )}
                    {trends.filter(t => t.name.toLowerCase().includes(searchQueryB.toLowerCase())).length === 0 && searchQueryB.trim().length < 3 && (
                      <li className="px-4 py-3 text-xs text-gray-400 font-bold text-center">
                        Type at least 3 letters to generate custom sector...
                      </li>
                    )}
                  </ul>
                </>
              )}
            </div>

          </div>

          {/* Premium Wide "Compare Locations" Trigger Button */}
          <div className="pt-2">
            <button
              onClick={handleCompareTelemetry}
              disabled={isSearchingA || isSearchingB}
              className="w-full py-4 px-6 bg-gradient-to-r from-[#C9A227] via-[#DFBF58] to-[#C9A227] text-white rounded-2xl text-[11px] font-black uppercase tracking-widest shadow-md hover:shadow-lg active:scale-[0.99] hover:brightness-[1.05] transition-all duration-300 flex items-center justify-center gap-2 relative overflow-hidden select-none"
            >
              {(isSearchingA || isSearchingB) ? (
                <>
                  <Loader2 className="animate-spin text-white" size={16} />
                  <span>Syncing Micro-Market Telemetry...</span>
                </>
              ) : (
                <>
                  <BarChart2 size={16} />
                  <span>Compare Analytics & Projections</span>
                </>
              )}
            </button>
          </div>

        </div>

        {/* Main Telemetry Panel */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Left Column (5/12 width): Trajectory Graph */}
          <div className="lg:col-span-6 bg-white border border-[#E8D5A3]/25 rounded-3xl p-6 shadow-sm space-y-6 relative overflow-hidden">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <h3 className="font-extrabold text-sm text-[#1A1800] flex items-center gap-2">
                  <BarChart2 size={16} className="text-[#C9A227]" />
                  {timeframe}-Year Price Trajectory (INR / sq.ft.)
                </h3>
                <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider mt-0.5">
                  Comparative appreciation projection ({startYear} – {startYear + timeframe})
                </p>
              </div>
              
              {/* Premium Segmented Toggle Tabs */}
              <div className="flex bg-[#FFFEF5] p-1 border border-[#E8D5A3]/30 rounded-xl max-w-fit shrink-0 select-none">
                <button
                  onClick={() => setTimeframe(5)}
                  className={`px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-wider transition-all duration-300 ${
                    timeframe === 5
                      ? 'bg-[#C9A227] text-white shadow-sm'
                      : 'text-gray-400 hover:text-[#B8860B]'
                  }`}
                >
                  5 Years
                </button>
                <button
                  onClick={() => setTimeframe(10)}
                  className={`px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-wider transition-all duration-300 ${
                    timeframe === 10
                      ? 'bg-[#C9A227] text-white shadow-sm'
                      : 'text-gray-400 hover:text-[#B8860B]'
                  }`}
                >
                  10 Years
                </button>
              </div>
            </div>

            {/* Custom SVG Line Chart */}
            <div className="relative w-full h-[220px]">
              <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-full overflow-visible">
                <defs>
                  <linearGradient id="areaGradA" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#C9A227" stopOpacity="0.18" />
                    <stop offset="100%" stopColor="#C9A227" stopOpacity="0.00" />
                  </linearGradient>
                  <linearGradient id="areaGradB" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#9CA3AF" stopOpacity="0.12" />
                    <stop offset="100%" stopColor="#9CA3AF" stopOpacity="0.00" />
                  </linearGradient>
                </defs>

                {/* Horizontal Grid lines */}
                {[0, 0.25, 0.5, 0.75, 1].map((ratio, index) => {
                  const y = paddingY + ratio * chartHeight;
                  const gridVal = Math.round(maxPrice * (1 - ratio));
                  return (
                    <g key={index} className="opacity-40">
                      <line
                        x1={paddingX}
                        y1={y}
                        x2={width - paddingX}
                        y2={y}
                        stroke="#E5E7EB"
                        strokeDasharray="4 4"
                      />
                      <text
                        x={paddingX - 10}
                        y={y + 3.5}
                        textAnchor="end"
                        className="text-[9px] font-black fill-gray-400 font-sans"
                      >
                        ₹{gridVal.toLocaleString()}
                      </text>
                    </g>
                  );
                })}

                {/* Areas */}
                {areaPathA && <path d={areaPathA} fill="url(#areaGradA)" />}
                {areaPathB && <path d={areaPathB} fill="url(#areaGradB)" />}

                {/* Location A Line (Gold) */}
                {linePathA && (
                  <path
                    d={linePathA}
                    fill="none"
                    stroke="#C9A227"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                )}

                {/* Location B Line (Grey) */}
                {linePathB && (
                  <path
                    d={linePathB}
                    fill="none"
                    stroke="#9CA3AF"
                    strokeWidth="2"
                    strokeDasharray="3 3"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="opacity-80"
                  />
                )}

                {/* X Axis Date labels */}
                {years.map((yr, idx) => {
                  const isFirst = idx === 0;
                  const isLast = idx === years.length - 1;
                  const isMiddle = idx === Math.floor(years.length / 2);
                  
                  if (!isFirst && !isLast && !isMiddle) return null;

                  const x = paddingX + (idx / (years.length - 1)) * chartWidth;
                  return (
                    <text
                      key={idx}
                      x={x}
                      y={height - paddingY + 16}
                      textAnchor="middle"
                      className="text-[9px] font-black fill-gray-400 font-sans"
                    >
                      {yr}
                    </text>
                  );
                })}

                {/* Transparent Hover grids */}
                {years.map((yr, idx) => {
                  const x = paddingX + (idx / (years.length - 1)) * chartWidth;
                  const hoverWidth = chartWidth / (years.length - 1);
                  return (
                    <rect
                      key={idx}
                      x={x - hoverWidth / 2}
                      y={paddingY}
                      width={hoverWidth}
                      height={chartHeight}
                      fill="transparent"
                      className="cursor-crosshair pointer-events-auto"
                      onMouseEnter={() => setHoveredIdx(idx)}
                      onMouseLeave={() => setHoveredIdx(null)}
                    />
                  );
                })}

                {/* Hover dots & Pointer lines */}
                {hoveredIdx !== null && pointsA[hoveredIdx] && (
                  <g>
                    <line
                      x1={pointsA[hoveredIdx].x}
                      y1={paddingY}
                      x2={pointsA[hoveredIdx].x}
                      y2={height - paddingY}
                      stroke="#C9A227"
                      strokeWidth="1"
                      strokeDasharray="2 2"
                    />
                    <circle
                      cx={pointsA[hoveredIdx].x}
                      cy={pointsA[hoveredIdx].y}
                      r="4"
                      fill="#C9A227"
                      stroke="#FFF"
                      strokeWidth="2"
                    />
                    <circle
                      cx={pointsB[hoveredIdx].x}
                      cy={pointsB[hoveredIdx].y}
                      r="4"
                      fill="#9CA3AF"
                      stroke="#FFF"
                      strokeWidth="2"
                    />
                  </g>
                )}
              </svg>

              {/* Floating custom tooltip */}
              {hoveredIdx !== null && historyA[hoveredIdx] && (
                <div 
                  className="absolute bg-white/95 backdrop-blur-md border border-[#E8D5A3]/40 rounded-xl p-3 shadow-lg text-[9px] space-y-1.5 z-10 pointer-events-none transition-all duration-150 animate-in zoom-in-95"
                  style={{
                    left: `${Math.min(
                      Math.max(
                        (hoveredIdx / (years.length - 1)) * 90 + 5,
                        10
                      ),
                      80
                    )}%`,
                    top: '10%'
                  }}
                >
                  <p className="font-black text-gray-400 uppercase tracking-widest leading-none">
                    Year {years[hoveredIdx]} Value
                  </p>
                  <div className="flex flex-col gap-1 pt-1">
                    <div className="flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#C9A227]" />
                      <span className="text-gray-500 font-bold">A:</span>
                      <span className="font-black text-gray-900">₹{historyA[hoveredIdx].price.toLocaleString()}/sq.ft.</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-gray-400" />
                      <span className="text-gray-500 font-bold">B:</span>
                      <span className="font-black text-gray-900">₹{historyB[hoveredIdx].price.toLocaleString()}/sq.ft.</span>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Growth Legend badges */}
            <div className="flex justify-between items-center bg-[#FFFEF5] p-3 rounded-2xl border border-[#E8D5A3]/30 text-[10px] font-black uppercase text-gray-600">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-[#C9A227]" />
                <span>{locA.name.split(',')[0]}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-gray-400" />
                <span>{locB.name.split(',')[0]}</span>
              </div>
            </div>

          </div>

          {/* Right Column (7/12 width): Metric Bars & Growth Drivers */}
          <div className="lg:col-span-6 space-y-6">
            
            {/* Metric Bars Container */}
            <div className="bg-white border border-[#E8D5A3]/25 rounded-3xl p-6 shadow-sm space-y-5">
              <h3 className="font-extrabold text-sm text-[#1A1800] flex items-center gap-2">
                <Compass size={16} className="text-[#C9A227]" />
                Micro-Market Growth Indicators
              </h3>
              
              <div className="space-y-4">
                
                {/* 1. Price Index Comparison */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-[11px] font-bold text-gray-700">
                    <span>Average Current Price (per sq.ft.)</span>
                    <div className="space-x-2">
                      <span className="text-[#B8860B] font-black">₹{locA.currentPrice.toLocaleString()}</span>
                      <span className="text-gray-400">vs</span>
                      <span className="text-gray-600 font-black">₹{locB.currentPrice.toLocaleString()}</span>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4 h-2">
                    <div className="w-full bg-gray-100 rounded-full h-full overflow-hidden">
                      <div className="bg-[#C9A227] h-full rounded-full" style={{ width: `${Math.min((locA.currentPrice / 18000) * 100, 100)}%` }} />
                    </div>
                    <div className="w-full bg-gray-100 rounded-full h-full overflow-hidden">
                      <div className="bg-gray-400 h-full rounded-full" style={{ width: `${Math.min((locB.currentPrice / 18000) * 100, 100)}%` }} />
                    </div>
                  </div>
                </div>

                {/* 2. Projected 5-Year CAGR */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-[11px] font-bold text-gray-700">
                    <span>Projected 5-Year CAGR (%)</span>
                    <div className="space-x-2">
                      <span className="text-[#B8860B] font-black">+{locA.cagr}%</span>
                      <span className="text-gray-400">vs</span>
                      <span className="text-gray-600 font-black">+{locB.cagr}%</span>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4 h-2">
                    <div className="w-full bg-gray-100 rounded-full h-full overflow-hidden">
                      <div className="bg-[#C9A227] h-full rounded-full" style={{ width: `${(locA.cagr / 20) * 100}%` }} />
                    </div>
                    <div className="w-full bg-gray-100 rounded-full h-full overflow-hidden">
                      <div className="bg-gray-400 h-full rounded-full" style={{ width: `${(locB.cagr / 20) * 100}%` }} />
                    </div>
                  </div>
                </div>

                {/* 3. Connectivity Index */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-[11px] font-bold text-gray-700">
                    <span>Connectivity & Metro Index</span>
                    <div className="space-x-2">
                      <span className="text-[#B8860B] font-black">{locA.connectivity}/10</span>
                      <span className="text-gray-400">vs</span>
                      <span className="text-gray-600 font-black">{locB.connectivity}/10</span>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4 h-2">
                    <div className="w-full bg-gray-100 rounded-full h-full overflow-hidden">
                      <div className="bg-[#C9A227] h-full rounded-full" style={{ width: `${locA.connectivity * 10}%` }} />
                    </div>
                    <div className="w-full bg-gray-100 rounded-full h-full overflow-hidden">
                      <div className="bg-gray-400 h-full rounded-full" style={{ width: `${locB.connectivity * 10}%` }} />
                    </div>
                  </div>
                </div>

                {/* 4. Infrastructure & Sewerage */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-[11px] font-bold text-gray-700">
                    <span>Physical Infrastructure Score</span>
                    <div className="space-x-2">
                      <span className="text-[#B8860B] font-black">{locA.infrastructure}/10</span>
                      <span className="text-gray-400">vs</span>
                      <span className="text-gray-600 font-black">{locB.infrastructure}/10</span>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4 h-2">
                    <div className="w-full bg-gray-100 rounded-full h-full overflow-hidden">
                      <div className="bg-[#C9A227] h-full rounded-full" style={{ width: `${locA.infrastructure * 10}%` }} />
                    </div>
                    <div className="w-full bg-gray-100 rounded-full h-full overflow-hidden">
                      <div className="bg-gray-400 h-full rounded-full" style={{ width: `${locB.infrastructure * 10}%` }} />
                    </div>
                  </div>
                </div>

                {/* 5. Livability & Green Score */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-[11px] font-bold text-gray-700">
                    <span>Livability & Green Index</span>
                    <div className="space-x-2">
                      <span className="text-[#B8860B] font-black">{locA.livability}/10</span>
                      <span className="text-gray-400">vs</span>
                      <span className="text-gray-600 font-black">{locB.livability}/10</span>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4 h-2">
                    <div className="w-full bg-gray-100 rounded-full h-full overflow-hidden">
                      <div className="bg-[#C9A227] h-full rounded-full" style={{ width: `${locA.livability * 10}%` }} />
                    </div>
                    <div className="w-full bg-gray-100 rounded-full h-full overflow-hidden">
                      <div className="bg-gray-400 h-full rounded-full" style={{ width: `${locB.livability * 10}%` }} />
                    </div>
                  </div>
                </div>

              </div>
            </div>

            {/* Growth Drivers bullets split */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-white border border-[#E8D5A3]/25 rounded-3xl p-5 shadow-sm">
              <div className="space-y-3">
                <h4 className="text-[11px] font-black text-[#C9A227] uppercase tracking-wider leading-none">
                  {locA.name.split(',')[0]} Key Drivers
                </h4>
                <ul className="space-y-2 text-[10px] text-gray-600 font-semibold leading-relaxed">
                  {locA.growthDrivers.map((drv, i) => (
                    <li key={i} className="flex items-start gap-1.5">
                      <CheckCircle2 size={12} className="text-emerald-500 shrink-0 mt-0.5" />
                      <span>{drv}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="space-y-3">
                <h4 className="text-[11px] font-black text-gray-400 uppercase tracking-wider leading-none">
                  {locB.name.split(',')[0]} Key Drivers
                </h4>
                <ul className="space-y-2 text-[10px] text-gray-600 font-semibold leading-relaxed">
                  {locB.growthDrivers.map((drv, i) => (
                    <li key={i} className="flex items-start gap-1.5">
                      <CheckCircle2 size={12} className="text-[#a09060] shrink-0 mt-0.5" />
                      <span>{drv}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

          </div>
        </div>

        {/* RERA & Government Data Integration Panel */}
        <div className="mt-10 bg-white border border-[#E8D5A3]/45 rounded-3xl p-6 md:p-8 shadow-md relative overflow-hidden animate-in fade-in slide-in-from-bottom duration-500">
          <div className="absolute top-0 right-0 w-[20%] h-[100%] bg-gradient-to-l from-[#C9A227]/5 to-transparent pointer-events-none" />
          
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 pb-6 border-b border-[#E8D5A3]/20">
            <div className="space-y-1">
              <h3 className="font-extrabold text-sm text-[#1A1800] flex items-center gap-2">
                <TrendingUp size={18} className="text-[#C9A227]" />
                Delhi NCR Micro-Market 3-Year Return Trends
              </h3>
              <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">
                Sector & Town level capital appreciation tracking (2023 - 2026)
              </p>
            </div>

            {/* Filter & Search Bar Grid */}
            <div className="flex flex-col sm:flex-row items-center gap-4 w-full lg:w-auto">
              {/* Custom Search Input */}
              <div className="relative w-full sm:w-[220px]">
                <input
                  type="text"
                  placeholder="Search sector, town or city..."
                  value={areaSearchQuery}
                  onChange={(e) => setAreaSearchQuery(e.target.value)}
                  className="w-full bg-[#FFFEF5] border border-[#E8D5A3]/40 rounded-xl pl-8 pr-4 py-2 text-xs font-semibold text-[#1A1800] focus:outline-none focus:border-[#C9A227] focus:ring-1 focus:ring-[#C9A227] shadow-sm transition-all"
                />
                <Search className="absolute left-2.5 top-2.5 text-gray-400" size={13} />
              </div>

              {/* Segmented City/Town Filter Tabs */}
              <div className="flex bg-[#FFFDF0] p-1 border border-[#E8D5A3]/35 rounded-xl shrink-0 select-none w-full sm:w-auto overflow-x-auto no-scrollbar gap-1">
                {(['All', 'Gurugram', 'Noida', 'Greater Noida', 'Delhi'] as const).map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setSelectedCityTab(tab)}
                    className={`px-3 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-wider transition-all duration-300 whitespace-nowrap cursor-pointer ${
                      selectedCityTab === tab
                        ? 'bg-gradient-to-r from-[#C9A227] to-[#B8860B] text-white shadow-sm'
                        : 'text-[#6b6450] hover:text-[#B8860B] hover:bg-[#E8D5A3]/10'
                    }`}
                  >
                    {tab === 'All' ? 'All NCR' : tab}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Area Wise Return Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-6">
            {NEIGHBORHOOD_RETURNS
              .filter((item) => {
                const matchesTab = selectedCityTab === 'All' || item.city === selectedCityTab;
                const matchesSearch = item.area.toLowerCase().includes(areaSearchQuery.toLowerCase()) || 
                                     item.city.toLowerCase().includes(areaSearchQuery.toLowerCase());
                return matchesTab && matchesSearch;
              })
              .slice(0, 4) // Show top 4 matching micro-markets cleanly
              .map((item, idx) => (
                <div 
                  key={idx}
                  className="bg-[#FFFEF5] border border-[#E8D5A3]/25 hover:border-[#C9A227]/40 rounded-2xl p-4 flex items-center justify-between gap-4 shadow-sm hover:shadow-md transition-all duration-300"
                >
                  <div className="space-y-1.5 min-w-0">
                    <div className="flex items-center gap-1.5">
                      <MapPin size={11} className="text-[#C9A227] shrink-0" />
                      <span className="text-[9px] font-black text-[#B8860B] uppercase tracking-widest bg-[#C9A227]/10 px-1.5 py-0.5 rounded">
                        {item.city}
                      </span>
                    </div>
                    <h4 className="text-xs font-black text-gray-900 truncate tracking-tight pr-1" title={item.area}>
                      {item.area}
                    </h4>
                    <span className="text-[10px] text-gray-400 font-extrabold uppercase block">
                      Avg. Price: <span className="text-gray-700 font-black">{item.currentPrice}</span>
                    </span>
                  </div>

                  {/* Sparkline & Return Badge on the right */}
                  <div className="flex items-center gap-4 shrink-0">
                    {/* Sparkline Graph */}
                    <div className="hidden sm:block">
                      {renderSparkline(item.sparklinePoints, item.area)}
                    </div>
                    {/* Return Badge */}
                    <div className="text-right">
                      <span className="inline-flex items-center px-2 py-1 bg-emerald-50 border border-emerald-200 rounded-lg text-emerald-700 text-[10px] font-black leading-none whitespace-nowrap">
                        +{item.returnRate}% Return
                      </span>
                      <span className="block text-[8px] text-gray-400 font-bold uppercase mt-1">Last 3 Years</span>
                    </div>
                  </div>
                </div>
              ))}
            {NEIGHBORHOOD_RETURNS.filter((item) => {
              const matchesTab = selectedCityTab === 'All' || item.city === selectedCityTab;
              const matchesSearch = item.area.toLowerCase().includes(areaSearchQuery.toLowerCase()) || 
                                   item.city.toLowerCase().includes(areaSearchQuery.toLowerCase());
              return matchesTab && matchesSearch;
            }).length === 0 && (
              <div className="col-span-2 py-8 text-center text-xs font-bold text-gray-400 uppercase tracking-wider">
                No matching sectors found in {selectedCityTab === 'All' ? 'Delhi NCR' : selectedCityTab}. Try another search term!
              </div>
            )}
          </div>
        </div>

        {/* Dynamic Investment Verdict (Full Width Card below) */}
        <div className="mt-8 bg-gradient-to-r from-[#1A1800] via-[#2D2A00] to-[#1A1800] text-white rounded-3xl p-6 md:p-8 relative overflow-hidden border border-[#E8D5A3]/20 shadow-xl flex flex-col md:flex-row items-center gap-6 justify-between animate-in fade-in slide-in-from-bottom duration-500">
          <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: 'radial-gradient(#C9A227 1px, transparent 1px)', backgroundSize: '24px 24px' }} />
          <div className="space-y-3 relative z-10 max-w-4xl">
            
            {/* dynamic Winner badge */}
            <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-[#C9A227]/20 border border-[#E8D5A3]/30 rounded-full text-[9px] font-black uppercase text-[#C9A227] tracking-wider leading-none">
              <Award size={12} />
              AI Capital Advisory Verdict
            </div>
            
            <h3 className="font-extrabold text-lg text-white font-[var(--font-playfair)] tracking-wide" style={{ color: '#FFFFFF' }}>
              Comparative Analysis Verdict: {isWinnerA ? locA.name.split(',')[0] : locB.name.split(',')[0]} stands out as appreciation leader!
            </h3>
            
            <p className="text-white/70 text-xs leading-relaxed font-medium" style={{ color: 'rgba(255, 255, 255, 0.75)' }}>
              Our dynamic algorithm projects {isWinnerA ? `+${locA.cagr}%` : `+${locB.cagr}%`} CAGR for the appreciation leader. {locA.verdict} Meanwhile, {locB.verdict.toLowerCase()}
            </p>
          </div>

          <div className="relative z-10 shrink-0 text-center bg-white/5 border border-white/10 rounded-2xl p-4 min-w-[150px] font-sans">
            <span className="text-[9px] font-black text-[#C9A227] uppercase tracking-wider block mb-1">Appreciation Gap</span>
            <span className="text-2xl font-black text-white leading-none block">
              {Math.abs(locA.cagr - locB.cagr).toFixed(1)}%
            </span>
            <span className="text-[8px] text-white/50 font-bold block mt-1">CAGR Advantage</span>
          </div>
        </div>

      </div>
    </section>
  );
}
