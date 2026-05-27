'use client';

import { useState, useMemo, useRef, useEffect } from 'react';
import {
  Search, X, Check, ChevronDown, ArrowUpDown,
  IndianRupee, LayoutGrid, MapPin, SlidersHorizontal, Tag
} from 'lucide-react';
import { useSearchParams } from 'next/navigation';
import PropertyCard from '@/components/properties/PropertyCard';
import { CITIES, PROPERTY_TYPES } from '@/lib/utils';
import type { Property } from '@/types';
import { FALLBACK_PROPERTIES } from '@/constants/properties';
import { useTracking } from '@/components/tracking/TrackingProvider';

/* ─── Filter Data ─── */
const SORT_OPTIONS = [
  { label: 'Newest First',       value: 'newest' },
  { label: 'Oldest First',       value: 'oldest' },
  { label: 'Price: Low to High', value: 'price_asc' },
  { label: 'Price: High to Low', value: 'price_desc' },
];
const PRICE_OPTIONS = [
  { label: 'All Prices',       value: 'All Prices' },
  { label: 'Under ₹50 Lakh',   value: 'Under 50L' },
  { label: '₹50L – ₹1 Crore', value: '50L - 1Cr' },
  { label: 'Above ₹1 Crore',   value: 'Above 1Cr' },
];
const PRICE_TYPE_OPTIONS = [
  { label: 'Sale & Rent', value: 'All' },
  { label: 'For Sale',    value: 'sale' },
  { label: 'For Rent',    value: 'rent' },
];
const TYPE_OPTIONS = [
  { label: 'All Types', value: 'All Types' },
  ...PROPERTY_TYPES.map(t => ({ label: t.label, value: t.value })),
];
const LOCATION_OPTIONS = [
  { label: 'All Cities', value: 'All Cities' },
  ...CITIES.map(c => ({ label: c, value: c })),
];

/* ─── Desktop Dropdown Filter ─── */
function FilterDropdown({
  icon: Icon, title, options, value, onChange,
}: {
  icon: React.ElementType;
  title: string;
  options: { label: string; value: string }[];
  value: string;
  onChange: (v: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const isDefault = value === options[0]?.value;
  const selectedLabel = options.find(o => o.value === value)?.label ?? value;

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen(p => !p)}
        className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl border text-sm font-semibold transition-all ${
          open || !isDefault
            ? 'border-[#C9A227] bg-[#FFFBEF] text-[#1A1800]'
            : 'border-gray-200 bg-white text-gray-500 hover:border-gray-300'
        }`}
      >
        <Icon size={16} className={isDefault ? 'text-gray-400' : 'text-[#C9A227]'} />
        <span className="flex-1 text-left truncate">{isDefault ? title : selectedLabel}</span>
        <ChevronDown size={16} className={`shrink-0 transition-transform duration-200 ${open ? 'rotate-180 text-[#C9A227]' : 'text-gray-400'}`} />
      </button>

      {open && (
        <div className="absolute left-0 right-0 top-[calc(100%+6px)] z-50 bg-white border border-gray-100 rounded-2xl shadow-xl overflow-hidden">
          {options.map(opt => {
            const selected = opt.value === value;
            return (
              <button
                key={opt.value}
                onClick={() => { onChange(opt.value); setOpen(false); }}
                className={`w-full flex items-center justify-between px-4 py-3 text-sm font-semibold transition-colors ${
                  selected ? 'bg-[#C9A227] text-[#1A1800]' : 'text-gray-700 hover:bg-gray-50'
                }`}
              >
                <span>{opt.label}</span>
                {selected && <Check size={14} strokeWidth={3} />}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

/* ─── Main Component ─── */
export default function PropertiesClientPage({ initialProperties = [] }: { initialProperties?: Property[] }) {
  const { fireEvent } = useTracking();
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy,      setSortBy]      = useState('newest');
  const [priceRange,  setPriceRange]  = useState('All Prices');
  const [typeFilter,  setTypeFilter]  = useState('All Types');
  const [cityFilter,  setCityFilter]  = useState('All Cities');
  const [priceType,   setPriceType]   = useState('All');
  const [mobileOpen,  setMobileOpen]  = useState(false);
  
  const searchParams = useSearchParams();

  // Sync Search Params with State
  useEffect(() => {
    const pt = searchParams.get('priceType');
    const type = searchParams.get('propertyType');
    const city = searchParams.get('city');
    const q = searchParams.get('q');
    const sb = searchParams.get('sortBy');

    setPriceType(pt || 'All');
    setTypeFilter(type || 'All Types');
    setCityFilter(city || 'All Cities');
    setSearchQuery(q || '');
    if (sb) setSortBy(sb);
  }, [searchParams]);

  // Mobile filter panel state
  const [mobileSection, setMobileSection] = useState<'sort'|'price'|'type'|'location'|'price_t'>('sort');

  const [properties, setProperties] = useState<Property[]>(initialProperties.length > 0 ? initialProperties : FALLBACK_PROPERTIES);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let active = true;
    
    async function fetchFilteredProperties() {
      setLoading(true);
      try {
        const params = new URLSearchParams();
        
        if (cityFilter && cityFilter !== 'All Cities') {
          params.set('city', cityFilter);
        }
        if (typeFilter && typeFilter !== 'All Types') {
          params.set('propertyType', typeFilter);
        }
        if (priceType && priceType !== 'All') {
          params.set('priceType', priceType);
        }
        if (searchQuery) {
          params.set('query', searchQuery);
        }
        if (priceRange === 'Under 50L') {
          params.set('maxPrice', '5000000');
        } else if (priceRange === '50L - 1Cr') {
          params.set('minPrice', '5000000');
          params.set('maxPrice', '10000000');
        } else if (priceRange === 'Above 1Cr') {
          params.set('minPrice', '10000000');
        }
        
        let sortVal = '-createdAt';
        if (sortBy === 'oldest') sortVal = 'createdAt';
        else if (sortBy === 'price_asc') sortVal = 'price';
        else if (sortBy === 'price_desc') sortVal = '-price';
        params.set('sort', sortVal);
        params.set('limit', '50');

        const res = await fetch(`/api/properties?${params.toString()}`);
        if (!res.ok) throw new Error("API error");
        
        const json = await res.json();
        if (active) {
          setProperties(json.data || []);
          
          // Telemetry tracking
          if (searchQuery || cityFilter !== 'All Cities' || typeFilter !== 'All Types' || priceRange !== 'All Prices' || priceType !== 'All') {
            fireEvent('Search', {
              search_string: searchQuery || 'all',
              city_filter: cityFilter,
              type_filter: typeFilter,
              price_type: priceType,
              price_range: priceRange,
              results_count: json.data?.length || 0
            });
          }
        }
      } catch (err) {
        console.error("Client fetch error:", err);
      } finally {
        if (active) setLoading(false);
      }
    }

    const timer = setTimeout(() => {
      fetchFilteredProperties();
    }, searchQuery ? 300 : 0);

    return () => {
      active = false;
      clearTimeout(timer);
    };
  }, [searchQuery, sortBy, priceRange, typeFilter, cityFilter, priceType]);

  const filtered = properties;

  const resetAll = () => {
    setSearchQuery('');
    setSortBy('newest');
    setPriceRange('All Prices');
    setTypeFilter('All Types');
    setCityFilter('All Cities');
    setPriceType('All');
  };

  const activeCount = [
    sortBy     !== 'newest',
    priceRange !== 'All Prices',
    typeFilter !== 'All Types',
    cityFilter !== 'All Cities',
    priceType  !== 'All',
    searchQuery !== '',
  ].filter(Boolean).length;

  /* ─── Desktop sidebar ─── */
  const DesktopSidebar = () => (
    <div className="flex flex-col h-full bg-white">
      <div className="flex items-center justify-between px-5 py-5 border-b border-gray-100 shrink-0">
        <div className="flex items-center gap-2">
          <SlidersHorizontal size={16} className="text-[#C9A227]" />
          <span className="text-[#1A1800] font-black text-sm uppercase tracking-[0.25em]">Filters</span>
          {activeCount > 0 && (
            <span className="px-2 py-0.5 bg-[#C9A227] text-[#1A1800] rounded-full text-[10px] font-black">{activeCount}</span>
          )}
        </div>
        {activeCount > 0 && (
          <button onClick={resetAll} className="text-[10px] font-black text-red-400 uppercase tracking-widest hover:text-red-600 transition-colors">Reset</button>
        )}
      </div>
      <div className="flex-1 overflow-y-auto px-4 py-5 space-y-3">
        <FilterDropdown icon={ArrowUpDown} title="Sort By"     options={SORT_OPTIONS}     value={sortBy}     onChange={setSortBy} />
        <FilterDropdown icon={Tag}         title="For Sale/Rent" options={PRICE_TYPE_OPTIONS} value={priceType} onChange={setPriceType} />
        <FilterDropdown icon={IndianRupee} title="Price Range" options={PRICE_OPTIONS}    value={priceRange} onChange={setPriceRange} />
        <FilterDropdown icon={LayoutGrid}  title="Category"    options={TYPE_OPTIONS}     value={typeFilter} onChange={setTypeFilter} />
        <FilterDropdown icon={MapPin}      title="Location"    options={LOCATION_OPTIONS} value={cityFilter} onChange={setCityFilter} />
      </div>
    </div>
  );

  /* ─── Mobile Filter Sections map ─── */
  const mobileSections = [
    { key: 'sort',     icon: ArrowUpDown, label: 'Sort',        options: SORT_OPTIONS,     value: sortBy,     setter: setSortBy },
    { key: 'price_t',  icon: Tag,         label: 'Listing',     options: PRICE_TYPE_OPTIONS, value: priceType, setter: setPriceType },
    { key: 'price',    icon: IndianRupee, label: 'Price',       options: PRICE_OPTIONS,    value: priceRange, setter: setPriceRange },
    { key: 'type',     icon: LayoutGrid,  label: 'Type',        options: TYPE_OPTIONS,     value: typeFilter, setter: setTypeFilter },
    { key: 'location', icon: MapPin,      label: 'City',        options: LOCATION_OPTIONS, value: cityFilter, setter: setCityFilter },
  ] as const;

  return (
    <div className="min-h-screen bg-[#F8F7F2]">
      {/* ── HERO SECTION ── */}
      <div className="relative pt-36 pb-20 overflow-hidden">
        <div className="absolute inset-0 bg-cover bg-center bg-no-repeat" style={{ backgroundImage: "url('https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&w=1600&q=80')" }} />
        <div className="absolute inset-0 bg-gradient-to-r from-[#1A1800]/40 via-[#1A1800]/15 to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-[#F8F7F2] to-transparent" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="gold-divider mb-5" />
          <h1 className="text-4xl md:text-6xl font-[var(--font-playfair)] text-white mb-4">
            Explore <span className="text-[#C9A227]">Properties</span>
          </h1>
          <p className="text-[#d4c490] text-lg max-w-2xl">
            Find your dream home or investment from our curated collection of premium properties across Delhi NCR.
          </p>
        </div>
      </div>

      {/* ── MAIN LAYOUT ── */}
      <div className="flex">
        {/* Add override for desktop */}
        <style>{`@media (min-width: 1024px) { .search-sticky { top: 72px !important; } }`}</style>

        {/* ── DESKTOP SIDEBAR ── */}
        <aside
          className="hidden lg:block w-72 shrink-0 border-r border-gray-100"
          style={{ position: 'sticky', top: '72px', height: 'calc(100vh - 72px)', overflowY: 'auto' }}
        >
          <DesktopSidebar />
        </aside>

        {/* ── MAIN CONTENT ── */}
        <div className="flex-1 bg-[#F8F7F2] flex flex-col">

          {/* Sticky search — correct top offset per device */}
          <div className="sticky z-10 bg-[#F8F7F2]/95 backdrop-blur-sm border-b border-gray-200 px-4 py-3 shrink-0 search-sticky"
            style={{ top: '116px' }}
          >
            <style>{`@media (min-width: 1024px) { .search-sticky { top: 72px !important; } }`}</style>
            <div className="flex gap-2 items-center">
              <div className="relative flex-1">
                <Search size={17} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search properties…"
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-9 py-2.5 rounded-xl bg-white border border-gray-200 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-[#C9A227]"
                />
                {searchQuery && (
                  <button onClick={() => setSearchQuery('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
                    <X size={14} />
                  </button>
                )}
              </div>
              {/* Mobile filter button */}
              <button
                onClick={() => setMobileOpen(true)}
                className="relative lg:hidden flex items-center gap-1.5 bg-[#1A1800] text-white px-4 py-2.5 rounded-xl font-bold text-sm shrink-0"
              >
                <SlidersHorizontal size={15} className="text-[#C9A227]" />
                <span>Filter</span>
                {activeCount > 0 && (
                  <span className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-[#C9A227] text-[#1A1800] text-[9px] font-black rounded-full flex items-center justify-center">
                    {activeCount}
                  </span>
                )}
              </button>
            </div>
          </div>

          {/* Grid Container */}
          <div className="px-4 lg:px-6 pt-6 pb-3 shrink-0 flex items-center justify-between">
            <p className="text-sm font-semibold text-gray-500">
              {filtered.length > 0
                ? <><span className="text-[#C9A227] font-black">{filtered.length}</span> properties found</>
                : 'No properties match the selected filters.'}
            </p>
          </div>

          {/* Grid */}
          <div className="flex-1 px-4 lg:px-6 pb-24 lg:pb-12">
            {loading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
                {[1, 2, 3, 4, 5, 6].map((n) => (
                  <div key={n} className="bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-sm animate-pulse">
                    <div className="bg-gray-200 aspect-[16/10] w-full" />
                    <div className="p-5 space-y-4">
                      <div className="h-6 bg-gray-200 rounded w-3/4" />
                      <div className="h-4 bg-gray-200 rounded w-1/2" />
                      <div className="flex justify-between items-center pt-2">
                        <div className="h-5 bg-gray-200 rounded w-1/3" />
                        <div className="h-4 bg-gray-200 rounded w-1/4" />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : filtered.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
                {filtered.map((property, i) => (
                  <PropertyCard key={property._id} property={property} priority={i < 3} />
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-20 text-center">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                  <Search size={28} className="text-gray-300" />
                </div>
                <h3 className="text-lg font-black text-[#1A1800] mb-1">No properties found</h3>
                <p className="text-gray-400 text-sm mb-5">Try adjusting your filters.</p>
                <button onClick={resetAll} className="px-6 py-2.5 bg-[#C9A227] text-[#1A1800] font-black rounded-xl text-xs uppercase tracking-widest">
                  Clear Filters
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ── MOBILE BOTTOM-SHEET FILTER ── */}
      {mobileOpen && (
        <div className="fixed inset-0 z-[500] lg:hidden flex flex-col justify-end">
          {/* Backdrop */}
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setMobileOpen(false)} />

          {/* Sheet */}
          <div className="relative z-10 bg-white rounded-t-[28px] shadow-2xl flex flex-col max-h-[85vh]">
            {/* Handle */}
            <div className="flex justify-center pt-3 pb-1">
              <div className="w-10 h-1 bg-gray-200 rounded-full" />
            </div>

            {/* Header */}
            <div className="flex items-center justify-between px-5 py-3 border-b border-gray-100">
              <span className="font-black text-[#1A1800] text-base">Filters {activeCount > 0 && <span className="ml-1 text-xs text-[#C9A227]">({activeCount} active)</span>}</span>
              <div className="flex items-center gap-3">
                {activeCount > 0 && (
                  <button onClick={resetAll} className="text-xs font-black text-red-400 uppercase tracking-widest">Reset</button>
                )}
                <button onClick={() => setMobileOpen(false)} className="p-1 text-gray-400">
                  <X size={20} />
                </button>
              </div>
            </div>

            {/* Tab row */}
            <div className="flex border-b border-gray-100 shrink-0">
              {mobileSections.map(sec => {
                const isActive = mobileSection === sec.key;
                const hasValue = sec.value !== sec.options[0].value;
                return (
                  <button
                    key={sec.key}
                    onClick={() => setMobileSection(sec.key)}
                    className={`flex-1 flex flex-col items-center gap-1 py-3 text-[10px] font-black uppercase tracking-wider transition-all border-b-2 ${
                      isActive ? 'border-[#C9A227] text-[#C9A227]' : 'border-transparent text-gray-400'
                    }`}
                  >
                    <sec.icon size={16} />
                    <span>{sec.label}</span>
                    {hasValue && <div className="w-1.5 h-1.5 rounded-full bg-[#C9A227]" />}
                  </button>
                );
              })}
            </div>

            {/* Options list */}
            <div className="flex-1 overflow-y-auto px-4 py-3">
              {mobileSections.map(sec => sec.key === mobileSection && (
                <div key={sec.key} className="space-y-1">
                  {sec.options.map(opt => {
                    const selected = opt.value === sec.value;
                    return (
                      <button
                        key={opt.value}
                        onClick={() => sec.setter(opt.value as any)}
                        className={`w-full flex items-center justify-between px-4 py-3.5 rounded-2xl text-sm font-semibold transition-all ${
                          selected
                            ? 'bg-[#C9A227] text-[#1A1800]'
                            : 'bg-gray-50 text-gray-700 hover:bg-gray-100'
                        }`}
                      >
                        <span>{opt.label}</span>
                        {selected && <Check size={16} strokeWidth={3} />}
                      </button>
                    );
                  })}
                </div>
              ))}
            </div>

            {/* Apply */}
            <div className="shrink-0 px-5 py-4 border-t border-gray-100">
              <button
                onClick={() => setMobileOpen(false)}
                className="w-full py-4 bg-[#1A1800] text-white font-black rounded-2xl text-sm uppercase tracking-widest"
              >
                Show {filtered.length} {filtered.length === 1 ? 'Property' : 'Properties'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
