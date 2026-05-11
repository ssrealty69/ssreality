'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Search, MapPin, Home, ChevronDown } from 'lucide-react';
import { CITIES, PROPERTY_TYPES } from '@/lib/utils';

export default function SearchBar() {
  const router = useRouter();
  const [query, setQuery] = useState('');
  const [city, setCity] = useState('');
  const [type, setType] = useState('');
  const [priceType, setPriceType] = useState('');

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (query) params.set('query', query);
    if (city) params.set('city', city);
    if (type) params.set('propertyType', type);
    if (priceType) params.set('priceType', priceType);
    router.push(`/properties?${params.toString()}`);
  };

  const selectClass = "w-full bg-white border border-[#E8D5A3] rounded-xl px-4 py-3 text-sm text-[#3a3828] appearance-none cursor-pointer focus:border-[#C9A227] focus:shadow-[0_0_0_3px_rgba(201,162,39,0.15)] outline-none transition-all";

  return (
    <form onSubmit={handleSearch} className="glass-card rounded-2xl p-4 lg:p-6 w-full">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">

        {/* Search Input */}
        <div className="lg:col-span-2 relative">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#C9A227]" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by city, area, project…"
            className="w-full pl-10 pr-4 py-3 rounded-xl border border-[#E8D5A3] bg-white text-sm text-[#3a3828] placeholder:text-[#a09060] outline-none focus:border-[#C9A227] focus:shadow-[0_0_0_3px_rgba(201,162,39,0.15)] transition-all"
          />
        </div>

        {/* City */}
        <div className="relative">
          <MapPin size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#C9A227] pointer-events-none" />
          <select value={city} onChange={(e) => setCity(e.target.value)} className={`${selectClass} pl-9`}>
            <option value="">All Cities</option>
            {CITIES.map((c) => <option key={c} value={c}>{c}</option>)}
          </select>
          <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-[#a09060] pointer-events-none" />
        </div>

        {/* Property Type */}
        <div className="relative">
          <Home size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#C9A227] pointer-events-none" />
          <select value={type} onChange={(e) => setType(e.target.value)} className={`${selectClass} pl-9`}>
            <option value="">All Types</option>
            {PROPERTY_TYPES.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
          </select>
          <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-[#a09060] pointer-events-none" />
        </div>

        {/* Buy / Rent */}
        <div className="relative">
          <select value={priceType} onChange={(e) => setPriceType(e.target.value)} className={selectClass}>
            <option value="">Buy / Rent</option>
            <option value="sale">Buy</option>
            <option value="rent">Rent</option>
          </select>
          <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-[#a09060] pointer-events-none" />
        </div>
      </div>

      <div className="mt-4 flex justify-end">
        <button type="submit" className="btn-primary px-8 py-3 text-sm">
          <Search size={16} />
          Search Properties
        </button>
      </div>
    </form>
  );
}
