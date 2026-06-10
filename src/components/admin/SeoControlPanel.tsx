'use client';

import { useState } from 'react';
import { Search, Globe, AlertCircle, CheckCircle, Info, Sparkles } from 'lucide-react';

interface SeoData {
  title: string;
  description: string;
  keywords: string;
  focusKeyword: string;
  canonicalUrl: string;
}

interface SeoControlPanelProps {
  data: SeoData;
  onChange: (data: SeoData) => void;
  defaultTitle?: string;
  defaultExcerpt?: string;
  defaultSlug?: string;
}

export function SeoControlPanel({ data, onChange, defaultTitle = '', defaultExcerpt = '', defaultSlug = '' }: SeoControlPanelProps) {
  const [device, setDevice] = useState<'mobile' | 'desktop'>('mobile');

  const updateField = (field: keyof SeoData, value: string) => {
    onChange({
      ...data,
      [field]: value
    });
  };

  // Fallback values for Google preview
  const displayTitle = data.title || defaultTitle || 'SS Realty | Luxury Properties & Investment in Delhi NCR';
  const displayDescription = data.description || defaultExcerpt || 'Explore the best premium properties, apartments, and investment opportunities in Noida, Gurugram, Delhi NCR with SS Realty experts.';
  const displaySlug = defaultSlug || 'why-invest-in-noida-expressway';

  // Live Score Calculator (Starts at 0, increases dynamically with visual coaching)
  const getSeoScore = () => {
    let score = 0;
    
    // 1. Title optimization (Max 25 pts)
    if (data.title) {
      if (data.title.length >= 40 && data.title.length <= 60) {
        score += 25; // Perfect length
      } else {
        score += 10; // Partial credit for having a title
      }
    }
    
    // 2. Meta Description optimization (Max 25 pts)
    if (data.description) {
      if (data.description.length >= 120 && data.description.length <= 160) {
        score += 25; // Perfect length
      } else {
        score += 10; // Partial credit for having a description
      }
    }
    
    // 3. Focus Keyword (Max 20 pts)
    if (data.focusKeyword) {
      score += 20;
    }
    
    // 4. Keywords/Tags commas listed (Max 15 pts)
    if (data.keywords) {
      score += 15;
    }
    
    // 5. Canonical Url (Max 15 pts)
    if (data.canonicalUrl) {
      score += 15;
    }
    
    return score;
  };

  const score = getSeoScore();

  return (
    <div className="space-y-6 p-6 rounded-2xl border border-gray-200 bg-white shadow-sm transition-all duration-300">
      
      {/* Panel Header */}
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 pb-4 border-b border-gray-100">
        <div>
          <h3 className="text-base font-bold text-gray-800 flex items-center gap-2">
            <Sparkles size={18} className="text-[#C9A227]" />
            Full SEO Control Panel & Meta Analyzer
          </h3>
          <p className="text-xs text-gray-500 mt-0.5">Audit search engine visibility, meta tags, and indexability in real-time.</p>
        </div>
        
        {/* Score Indicator */}
        <div className="flex items-center gap-2 bg-gray-50 border border-gray-200 px-3.5 py-1.5 rounded-xl shadow-inner select-none">
          <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">SEO Score:</span>
          <span className={`text-sm font-black transition-colors duration-300 ${
            score === 0 ? 'text-gray-400' :
            score < 30 ? 'text-red-500' :
            score < 60 ? 'text-orange-500' :
            score < 85 ? 'text-amber-500' : 'text-emerald-500'
          }`}>
            {score}/100
          </span>
          <div className="w-1.5 h-1.5 rounded-full transition-all duration-300" style={{ 
            backgroundColor: 
              score === 0 ? '#9CA3AF' :
              score < 30 ? '#EF4444' :
              score < 60 ? '#F97316' :
              score < 85 ? '#F59E0B' : '#10B981' 
          }} />
        </div>
      </div>

      {/* ── Google Search Preview Simulator ───────────────────────────────── */}
      <div className="bg-gray-50/50 border border-gray-100 rounded-2xl p-5 space-y-4 shadow-inner">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold text-gray-600 flex items-center gap-1.5">
            <Search size={14} className="text-gray-400" />
            Google SERP Mockup Simulator
          </span>
          {/* Mobile/Desktop toggle */}
          <div className="flex bg-white rounded-lg border border-gray-200 p-0.5 text-[10px] font-bold text-gray-600">
            <button 
              type="button" 
              onClick={() => setDevice('mobile')}
              className={`px-2.5 py-1 rounded-md transition-all duration-300 ${device === 'mobile' ? 'bg-[#C9A227]/15 text-[#B8860B] shadow-sm' : 'hover:bg-gray-50'}`}
            >
              Mobile View
            </button>
            <button 
              type="button" 
              onClick={() => setDevice('desktop')}
              className={`px-2.5 py-1 rounded-md transition-all duration-300 ${device === 'desktop' ? 'bg-[#C9A227]/15 text-[#B8860B] shadow-sm' : 'hover:bg-gray-50'}`}
            >
              Desktop View
            </button>
          </div>
        </div>

        {/* Sneak Preview Frame */}
        <div className={`bg-white border border-gray-200 rounded-xl p-4 shadow-sm select-none ${
          device === 'mobile' ? 'max-w-md mx-auto border-dashed' : 'w-full'
        }`}>
          {/* Breadcrumbs */}
          <div className="flex items-center gap-1.5 text-xs text-gray-600 mb-1 font-sans">
            <Globe size={11} className="text-gray-400" />
            <span>https://ssrealty.org</span>
            <span className="text-gray-400">›</span>
            <span>blog</span>
            <span className="text-gray-400">›</span>
            <span className="text-gray-500 font-medium truncate max-w-[150px]">{displaySlug}</span>
          </div>

          {/* Title */}
          <h4 className="text-blue-800 hover:underline font-medium text-sm md:text-base leading-tight font-sans cursor-pointer line-clamp-2">
            {displayTitle}
          </h4>

          {/* Description */}
          <p className="text-[#4d5156] text-xs font-sans leading-relaxed mt-1 line-clamp-3">
            {displayDescription}
          </p>
        </div>
      </div>

      {/* ── SEO Inputs & live coaches ────────────────────────────────────── */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        
        {/* Title */}
        <div className="space-y-1 md:col-span-2">
          <div className="flex justify-between items-center">
            <label className="block text-xs font-bold text-gray-700">Page Title / Tab Title (SEO Custom Title)</label>
            <span className={`text-[10px] font-bold ${
              data.title.length >= 50 && data.title.length <= 60 ? 'text-emerald-500' : 'text-gray-400'
            }`}>
              {data.title.length} / 60 char (Optimal: 50-60)
            </span>
          </div>
          <input 
            type="text"
            value={data.title}
            onChange={(e) => updateField('title', e.target.value)}
            placeholder={defaultTitle || "Add a highly optimized title..."}
            className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-xs outline-none focus:ring-1 focus:ring-[#C9A227] transition-all bg-white"
          />
          {/* Title bar coach */}
          <div className="w-full h-1.5 bg-gray-100 rounded-full overflow-hidden">
            <div 
              className={`h-full transition-all duration-500 ${
                data.title.length === 0 ? 'w-0' :
                data.title.length < 50 ? 'bg-amber-400' :
                data.title.length <= 60 ? 'bg-emerald-500' : 'bg-red-500'
              }`}
              style={{ width: `${Math.min((data.title.length / 70) * 100, 100)}%` }}
            />
          </div>
        </div>

        {/* Meta Description */}
        <div className="space-y-1 md:col-span-2">
          <div className="flex justify-between items-center">
            <label className="block text-xs font-bold text-gray-700">Meta Description</label>
            <span className={`text-[10px] font-bold ${
              data.description.length >= 120 && data.description.length <= 160 ? 'text-emerald-500' : 'text-gray-400'
            }`}>
              {data.description.length} / 160 char (Optimal: 120-160)
            </span>
          </div>
          <textarea
            value={data.description}
            rows={3}
            onChange={(e) => updateField('description', e.target.value)}
            placeholder={defaultExcerpt || "Write a captivating excerpt optimized for searches..."}
            className="w-full border border-gray-300 rounded-lg p-3 text-xs outline-none focus:ring-1 focus:ring-[#C9A227] transition-all bg-white"
          />
          {/* Description bar coach */}
          <div className="w-full h-1.5 bg-gray-100 rounded-full overflow-hidden">
            <div 
              className={`h-full transition-all duration-500 ${
                data.description.length === 0 ? 'w-0' :
                data.description.length < 120 ? 'bg-amber-400' :
                data.description.length <= 160 ? 'bg-emerald-500' : 'bg-red-500'
              }`}
              style={{ width: `${Math.min((data.description.length / 180) * 100, 100)}%` }}
            />
          </div>
        </div>

        {/* Focus Keyword */}
        <div className="space-y-1">
          <label className="block text-xs font-bold text-gray-700 flex items-center gap-1">
            Focus Keyword
            <span title="The primary search phrase you want this blog post to rank for.">
              <Info size={11} className="text-gray-400" />
            </span>
          </label>
          <input 
            type="text"
            value={data.focusKeyword}
            onChange={(e) => updateField('focusKeyword', e.target.value)}
            placeholder="e.g. Luxury properties Noida"
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-xs outline-none focus:ring-1 focus:ring-[#C9A227] transition-all bg-white"
          />
        </div>

        {/* Canonical URL */}
        <div className="space-y-1">
          <label className="block text-xs font-bold text-gray-700 flex items-center gap-1">
            Canonical Link URL
            <span title="Forces Google to credit standard source if duplicated from elsewhere.">
              <Info size={11} className="text-gray-400" />
            </span>
          </label>
          <input 
            type="url"
            value={data.canonicalUrl}
            onChange={(e) => updateField('canonicalUrl', e.target.value)}
            placeholder="https://ssrealty.org/blog/your-slug"
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-xs outline-none focus:ring-1 focus:ring-[#C9A227] transition-all bg-white"
          />
        </div>

        {/* Keywords */}
        <div className="space-y-1 md:col-span-2">
          <label className="block text-xs font-bold text-gray-700">SEO Keywords / Tags (Comma-separated)</label>
          <input 
            type="text"
            value={data.keywords}
            onChange={(e) => updateField('keywords', e.target.value)}
            placeholder="e.g. noida expressway, real estate boom, apartments in delhi"
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-xs outline-none focus:ring-1 focus:ring-[#C9A227] transition-all bg-white"
          />
          <p className="text-[10px] text-gray-400">Separate search keyterms using commas. These are embedded in page headers.</p>
        </div>

      </div>

      {/* SEO Coach Feedback */}
      <div className="border-t border-gray-100 pt-4 space-y-2">
        <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">SEO Checklist Score:</span>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
          
          <div className="flex items-center gap-2">
            {data.title.length >= 40 && data.title.length <= 60 ? (
              <CheckCircle size={14} className="text-emerald-500" />
            ) : (
              <AlertCircle size={14} className="text-amber-500" />
            )}
            <span className="text-gray-600">SEO Title is of ideal length (40 - 60 chars)</span>
          </div>

          <div className="flex items-center gap-2">
            {data.description.length >= 120 && data.description.length <= 160 ? (
              <CheckCircle size={14} className="text-emerald-500" />
            ) : (
              <AlertCircle size={14} className="text-amber-500" />
            )}
            <span className="text-gray-600">Meta Description is perfect (120 - 160 chars)</span>
          </div>

          <div className="flex items-center gap-2">
            {data.focusKeyword ? (
              <CheckCircle size={14} className="text-emerald-500" />
            ) : (
              <AlertCircle size={14} className="text-amber-500" />
            )}
            <span className="text-gray-600">Focus keyword is set for search mapping</span>
          </div>

          <div className="flex items-center gap-2">
            {data.keywords ? (
              <CheckCircle size={14} className="text-emerald-500" />
            ) : (
              <AlertCircle size={14} className="text-amber-500" />
            )}
            <span className="text-gray-600">Tags / Search terms commas listed</span>
          </div>

        </div>
      </div>

    </div>
  );
}
