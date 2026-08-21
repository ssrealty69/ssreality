'use client';

import React, { useState, useEffect } from 'react';
import {
  Package2, Plus, Loader2, Search, CheckCircle2,
  Trash2, RotateCcw, Video, CreditCard, Building2, MessageSquare,
  Eye, X, Save, Sparkles, Landmark, Info, Check, ShieldCheck, FileCheck
} from 'lucide-react';
import toast from 'react-hot-toast';

// ─── Types ───────────────────────────────────────────────────────────────────
interface Property {
  _id: string;
  title: string;
  propertyName?: string;
  slug: string;
  price: number;
  propertyType?: string;
  location: { address: string; city: string };
  images: string[];
  brochureUrl?: string;
  highlights?: string[];
  amenities?: string[];
  priceList?: { type: string; size: string; price: string }[];
  features?: {
    area?: number;
    areaUnit?: string;
    bedrooms?: number;
    bathrooms?: number;
    registryAvailable?: boolean;
    totalFloors?: number;
    totalUnits?: number;
  };
}

interface ShareKit {
  _id: string;
  propertyId: string;
  propertyTitle: string;
  propertySlug: string;
  propertyPrice: number;
  propertyLocation: string;
  propertyImages: string[];
  propertyBrochureUrl?: string;
  propertyHighlights?: string[];
  propertyAmenities?: string[];
  propertyPriceList?: { type: string; size: string; price: string }[];

  customTagline?: string;
  videoLinks: { label: string; url: string }[];
  legalDocs: { label: string; url?: string; status: 'approved' | 'pending' | 'info' }[];
  paymentPlans: { name: string; schedule: string; description?: string }[];

  // Lal Dora Land & NBFC Financing
  landType?: string;
  registryStatus?: string;
  nbfcPartners: { name: string; maxLoanPercent?: string; notes?: string }[];
  financingNotes?: string;

  unitConfigs: {
    type: string;
    carpetArea?: string;
    superArea?: string;
    startingPrice?: string;
    booking?: string;
    floor?: string;
    notes?: string;
  }[];

  whatsappTemplates: { name: string; message: string }[];
  toggles: {
    showPrice: boolean;
    showBrochure: boolean;
    showVideos: boolean;
    showPriceList: boolean;
    showPaymentPlan: boolean;
    showLegalDocs: boolean;
    showUnitConfigs: boolean;
    showAmenities: boolean;
    showFinancing: boolean;
  };
  isActive: boolean;
  updatedAt?: string;
}

const DEFAULT_TOGGLES = {
  showPrice: true,
  showBrochure: true,
  showVideos: true,
  showPriceList: true,
  showPaymentPlan: true,
  showLegalDocs: true,
  showUnitConfigs: true,
  showAmenities: true,
  showFinancing: true,
};

const COMMON_NBFCS = [
  'Piramal Capital & Housing',
  'Tata Capital Housing',
  'Aditya Birla Housing',
  'Shriram Housing Finance',
  'Shubham Housing Finance',
  'Aadhar Housing Finance',
  'Home First Finance (HFFC)',
  'Aavas Financiers',
  'Indiabulls Housing',
  'Poonawalla Housing'
];

// Helper: Format Indian Currency
function formatPrice(amount?: number) {
  if (!amount) return '₹ Price on Request';
  if (amount >= 10000000) return `₹${(amount / 10000000).toFixed(2)} Cr`;
  if (amount >= 100000) return `₹${(amount / 100000).toFixed(1)} Lakhs`;
  return `₹${amount.toLocaleString('en-IN')}`;
}

// Helper: Auto-generate dynamic unit configs from property data
function autoUnitConfigs(property: Property) {
  if (property.priceList && property.priceList.length > 0) {
    return property.priceList.map(pl => {
      // Clean up price string
      let rawPrice = pl.price || '';
      return {
        type: pl.type || 'Standard Unit',
        carpetArea: '',
        superArea: pl.size || '',
        startingPrice: rawPrice,
        booking: '₹51,000 / ₹1 Lakh',
        notes: 'Registry & Loan assistance available',
      };
    });
  }

  // Fallback for single-unit properties
  const areaStr = property.features?.area
    ? `${property.features.area} ${property.features.areaUnit || 'sq.ft'}`
    : '';
  const typeLabel = property.propertyType
    ? property.propertyType.charAt(0).toUpperCase() + property.propertyType.slice(1)
    : 'Residential Unit';
  const bedroomPrefix = property.features?.bedrooms ? `${property.features.bedrooms} BHK ` : '';

  return [{
    type: `${bedroomPrefix}${typeLabel}`.trim(),
    carpetArea: '',
    superArea: areaStr,
    startingPrice: formatPrice(property.price),
    booking: '₹51,000 - ₹1 Lakh',
    notes: 'Immediate Registry / Mutation',
  }];
}

// Helper: Auto-generate catchy tagline from property
function autoTagline(property: Property): string {
  if (property.highlights && property.highlights.length > 0) {
    return property.highlights.slice(0, 2).join(' | ');
  }
  const city = property.location?.city || property.location?.address || 'Prime Location';
  const price = formatPrice(property.price);
  return `Lal Dora Land with Direct Registry | ${city} | Starting ${price}`;
}

// Helper: Auto-generate default WhatsApp Templates
function autoWhatsAppTemplates(property: Property, tagline: string) {
  const title = property.propertyName || property.title;
  const highlights = (property.highlights || []).slice(0, 3).map(h => `• ${h}`).join('\n');

  return [
    {
      name: 'Standard Pitch (Lal Dora + NBFC Loan)',
      message: `Namaste {customer_name},\n\nThank you for connecting with SS Realty regarding *${title}*.\n\n📍 *Location:* ${property.location?.address || ''}, ${property.location?.city || ''}\n🌟 *Highlights:* ${tagline}\n${highlights ? `\n${highlights}\n` : ''}\n💰 *Price:* Starting {price}*\n🏦 *Loan:* Up to 70-80% Loan via Approved NBFCs\n📜 *Title:* Lal Dora Land with Clean Registry\n\n📥 *View Photos, Floor Plans & Pricing Kit:*\n🔗 {kit_link}\n\nTo schedule a site visit or check unit availability:\n📞 *{agent_name}*: {agent_phone}\n*SS Realty*`,
    },
    {
      name: 'Payment Plan & Loan Offer',
      message: `Hello {customer_name},\n\nHere are the financing & pricing details for *${title}*:\n\n🏷️ *Starting Price:* {price}*\n💳 *Booking Amount:* ₹51,000 / ₹1 Lakh\n🏦 *Financing:* NBFC Home Loan available with easy EMI options\n📑 *Documents Needed:* Aadhar, PAN, 6 months Bank Statement\n\n📌 *Complete Project Details & Video Walkthrough:*\n🔗 {kit_link}\n\nCall for site visit: *{agent_name}* ({agent_phone})`,
    },
  ];
}

// ─── Main Component ──────────────────────────────────────────────────────────
export default function ShareKitsPage() {
  const [properties, setProperties] = useState<Property[]>([]);
  const [kits, setKits] = useState<ShareKit[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState('');
  const [search, setSearch] = useState('');
  const [editKit, setEditKit] = useState<ShareKit | null>(null);
  const [saving, setSaving] = useState(false);
  const [syncing, setSyncing] = useState<string | null>(null);

  // Active section tab
  const [activeSection, setActiveSection] = useState<string>('overview');

  useEffect(() => {
    fetchAll();
  }, []);

  const fetchAll = async () => {
    setLoading(true);
    setLoadError('');
    try {
      const [propsRes, kitsRes] = await Promise.all([
        fetch('/api/admin/share-kits/properties', { credentials: 'include' }),
        fetch('/api/admin/share-kits', { credentials: 'include' }),
      ]);

      if (!propsRes.ok) {
        setLoadError(`Failed to fetch properties (${propsRes.status})`);
        setLoading(false);
        return;
      }

      const propsData = await propsRes.json();
      const kitsData = await kitsRes.json();

      if (propsData.success) {
        setProperties(propsData.data || []);
      } else {
        setLoadError(propsData.error || 'Could not load properties');
      }

      if (kitsData.success) {
        setKits(kitsData.data || []);
      }
    } catch (err: any) {
      setLoadError('Network error: ' + err.message);
      toast.error('Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const openNewKit = (property: Property) => {
    const existing = kits.find(k => k.propertyId === property._id);
    if (existing) {
      // If existing kit has empty unitConfigs, auto-fill them
      const updatedKit = { ...existing };
      if (!updatedKit.unitConfigs || updatedKit.unitConfigs.length === 0) {
        updatedKit.unitConfigs = autoUnitConfigs(property);
      }
      if (!updatedKit.customTagline) {
        updatedKit.customTagline = autoTagline(property);
      }
      if (!updatedKit.landType) {
        updatedKit.landType = 'Lal Dora Land';
      }
      if (!updatedKit.registryStatus) {
        updatedKit.registryStatus = property.features?.registryAvailable ? 'Direct Registry Available' : 'Registry / Mutation Available';
      }
      setEditKit(updatedKit);
    } else {
      const tagline = autoTagline(property);
      setEditKit({
        _id: '',
        propertyId: property._id,
        propertyTitle: property.propertyName || property.title,
        propertySlug: property.slug,
        propertyPrice: property.price,
        propertyLocation: `${property.location?.address || ''}, ${property.location?.city || ''}`.trim().replace(/^,\s*/, ''),
        propertyImages: property.images || [],
        propertyBrochureUrl: property.brochureUrl || '',
        propertyHighlights: property.highlights || [],
        propertyAmenities: property.amenities || [],
        propertyPriceList: property.priceList || [],

        // ── Auto-Populated ──────────────────────────────
        customTagline: tagline,
        unitConfigs: autoUnitConfigs(property),
        landType: 'Lal Dora Land (Freehold)',
        registryStatus: property.features?.registryAvailable ? 'Direct Registry & Mutation Available' : 'Registry / Mutation Available',
        nbfcPartners: [
          { name: 'Piramal Capital', maxLoanPercent: '75%', notes: 'Fast approval on Lal Dora' },
          { name: 'Tata Capital', maxLoanPercent: '70%', notes: 'Competitive ROI' }
        ],
        financingNotes: 'NBFC Home loan assistance available up to 70-80% on Lal Dora land with simple documentation.',
        legalDocs: [
          { label: 'Registry / Sale Deed Papers', status: 'approved', url: '' },
          { label: 'Khasra / Khatoni Records', status: 'approved', url: '' },
          { label: 'Electricity & Water NOC', status: 'approved', url: '' },
        ],
        paymentPlans: [
          { name: 'Standard Construction Linked Plan (CLP)', schedule: '10% on Booking, 80% with Construction, 10% on Possession', description: 'Easy milestone-based payments' },
          { name: 'Flexi Down Payment Plan', schedule: '20% on Booking, 80% on Registry / Possession', description: 'Special subvention assistance via NBFC' },
        ],
        whatsappTemplates: autoWhatsAppTemplates(property, tagline),
        videoLinks: [],
        toggles: DEFAULT_TOGGLES,
        isActive: true,
      } as ShareKit);
    }
    setActiveSection('overview');
  };

  const handleSave = async () => {
    if (!editKit) return;
    setSaving(true);
    try {
      const res = await fetch('/api/admin/share-kits', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editKit),
      });
      const data = await res.json();
      if (data.success) {
        toast.success('Share Kit saved successfully!');
        await fetchAll();
        setEditKit(data.data);
      } else {
        toast.error(data.error || 'Failed to save kit');
      }
    } catch {
      toast.error('Server error while saving');
    } finally {
      setSaving(false);
    }
  };

  const handleSync = async (kitId: string) => {
    setSyncing(kitId);
    try {
      const res = await fetch(`/api/admin/share-kits/${kitId}`, { method: 'PATCH' });
      const data = await res.json();
      if (data.success) {
        toast.success('Re-synced latest details from website!');
        await fetchAll();
        if (editKit?._id === kitId) setEditKit(data.data);
      } else {
        toast.error(data.error || 'Sync failed');
      }
    } catch {
      toast.error('Sync failed');
    } finally {
      setSyncing(null);
    }
  };

  const handleDelete = async (id: string, title: string) => {
    if (!confirm(`Delete Share Kit for "${title}"?`)) return;
    try {
      await fetch(`/api/admin/share-kits?id=${id}`, { method: 'DELETE' });
      toast.success('Deleted');
      setKits(prev => prev.filter(k => k._id !== id));
      if (editKit?._id === id) setEditKit(null);
    } catch {
      toast.error('Delete failed');
    }
  };

  const propertiesWithKit = kits.map(k => k.propertyId);
  const filteredProperties = properties.filter(p =>
    (p.propertyName || p.title).toLowerCase().includes(search.toLowerCase()) ||
    p.location?.city?.toLowerCase().includes(search.toLowerCase()) ||
    p.location?.address?.toLowerCase().includes(search.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-64 gap-3">
        <Loader2 className="animate-spin text-[#C9A227]" size={36} />
        <p className="text-xs font-bold text-gray-500">Loading Live Properties & Share Kits...</p>
      </div>
    );
  }

  if (loadError) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center p-6 bg-red-50 rounded-2xl border border-red-200">
          <p className="text-red-600 font-bold text-sm mb-2">⚠️ {loadError}</p>
          <button
            onClick={fetchAll}
            className="px-4 py-2 bg-[#C9A227] text-white rounded-xl text-xs font-bold hover:bg-[#B8860B]"
          >
            Retry Loading
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex gap-6 h-[calc(100vh-80px)] overflow-hidden">

      {/* ── LEFT PANEL: Live Properties List ─────────────────────────── */}
      <div className="w-80 flex-shrink-0 flex flex-col bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
        {/* Header */}
        <div className="p-5 border-b border-gray-50">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-[#C9A227] to-[#B8860B] flex items-center justify-center shadow-sm">
              <Package2 size={16} className="text-white" />
            </div>
            <div>
              <h2 className="font-extrabold text-gray-900 text-sm">Property Kits</h2>
              <p className="text-[10px] text-gray-400 font-semibold">{properties.length} Live Properties Available</p>
            </div>
          </div>
          <div className="relative">
            <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              className="w-full pl-8 pr-3 py-2 bg-gray-50 border border-gray-100 rounded-xl text-xs font-semibold text-gray-700 placeholder:text-gray-400 outline-none focus:border-[#C9A227]"
              placeholder="Search live properties..."
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>
        </div>

        {/* Property List */}
        <div className="flex-1 overflow-y-auto divide-y divide-gray-50">
          {filteredProperties.length === 0 && (
            <div className="p-6 text-center">
              <Building2 size={28} className="mx-auto text-gray-200 mb-2" />
              <p className="text-xs font-bold text-gray-400">
                {properties.length === 0 ? 'No live properties found in database.' : 'No results found.'}
              </p>
              {properties.length === 0 && (
                <button onClick={fetchAll} className="mt-3 text-[10px] font-bold text-[#C9A227] underline">
                  Refresh
                </button>
              )}
            </div>
          )}

          {filteredProperties.map(prop => {
            const hasKit = propertiesWithKit.includes(prop._id);
            const isSelected = editKit?.propertyId === prop._id;
            const displayName = prop.propertyName || prop.title;

            return (
              <button
                key={prop._id}
                onClick={() => openNewKit(prop)}
                className={`w-full text-left p-4 hover:bg-amber-50/40 transition-all ${isSelected ? 'bg-amber-50/80 border-l-4 border-[#C9A227]' : ''}`}
              >
                <div className="flex items-start gap-3">
                  {prop.images?.[0] ? (
                    <div className="w-11 h-11 rounded-xl overflow-hidden flex-shrink-0 bg-gray-100 border border-gray-100">
                      <img src={prop.images[0]} alt="" className="w-full h-full object-cover" />
                    </div>
                  ) : (
                    <div className="w-11 h-11 rounded-xl bg-gray-100 flex items-center justify-center flex-shrink-0">
                      <Building2 size={16} className="text-gray-300" />
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-bold text-gray-800 truncate">{displayName}</p>
                    <p className="text-[10px] text-gray-400 font-semibold truncate mt-0.5">
                      {prop.location?.address || prop.location?.city}
                    </p>
                    <div className="mt-1 flex items-center justify-between">
                      <span className="text-[10px] font-extrabold text-[#C9A227]">
                        {formatPrice(prop.price)}
                      </span>
                      {hasKit ? (
                        <span className="inline-flex items-center gap-1 text-[9px] font-black text-emerald-600 bg-emerald-50 border border-emerald-200 px-1.5 py-0.5 rounded uppercase tracking-wider">
                          <CheckCircle2 size={8} /> Ready
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-[9px] font-black text-amber-600 bg-amber-50 border border-amber-200 px-1.5 py-0.5 rounded uppercase tracking-wider">
                          <Plus size={8} /> Auto-Kit
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* ── RIGHT PANEL: Kit Customizer ─────────────────────────────── */}
      {editKit ? (
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Header */}
          <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-5 mb-4 flex items-center justify-between gap-4 flex-shrink-0">
            <div className="flex items-center gap-4">
              {editKit.propertyImages?.[0] && (
                <div className="w-12 h-12 rounded-2xl overflow-hidden bg-gray-100 flex-shrink-0 border border-gray-100">
                  <img src={editKit.propertyImages[0]} alt="" className="w-full h-full object-cover" />
                </div>
              )}
              <div>
                <h3 className="font-extrabold text-gray-900 text-sm md:text-base">{editKit.propertyTitle}</h3>
                <p className="text-xs text-gray-400 font-semibold flex items-center gap-1">
                  📍 {editKit.propertyLocation} • <span className="text-[#C9A227] font-bold">{formatPrice(editKit.propertyPrice)}</span>
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {editKit._id && (
                <button
                  onClick={() => handleSync(editKit._id)}
                  disabled={syncing === editKit._id}
                  className="flex items-center gap-1.5 px-3 py-2 text-xs font-bold text-blue-600 bg-blue-50 border border-blue-200 rounded-xl hover:bg-blue-100 transition-all"
                  title="Re-sync photos, price, highlights from website"
                >
                  {syncing === editKit._id ? <Loader2 size={13} className="animate-spin" /> : <RotateCcw size={13} />}
                  Sync Website Data
                </button>
              )}
              {editKit._id && (
                <button
                  onClick={() => handleDelete(editKit._id, editKit.propertyTitle)}
                  className="p-2 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all"
                  title="Delete Kit"
                >
                  <Trash2 size={15} />
                </button>
              )}
              <button
                onClick={handleSave}
                disabled={saving}
                className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-[#C9A227] to-[#B8860B] text-[#1A1800] font-bold rounded-xl text-sm shadow-md hover:scale-[1.02] transition-all disabled:opacity-60"
              >
                {saving ? <Loader2 size={15} className="animate-spin" /> : <Save size={15} />}
                Save Share Kit
              </button>
            </div>
          </div>

          {/* Sections Nav + Content */}
          <div className="flex-1 overflow-hidden flex gap-4">
            {/* Section Tabs (vertical) */}
            <div className="w-48 flex-shrink-0 bg-white rounded-3xl border border-gray-100 shadow-sm p-2 flex flex-col gap-1 overflow-y-auto">
              {[
                { id: 'overview', label: 'Overview & Auto-Data', icon: Sparkles },
                { id: 'units', label: 'Unit Configurations', icon: Building2 },
                { id: 'financing', label: 'Lal Dora & NBFC Loan', icon: Landmark },
                { id: 'payment', label: 'Payment Plans', icon: CreditCard },
                { id: 'legal', label: 'Legal & Registry Docs', icon: FileCheck },
                { id: 'videos', label: 'Video Walkthroughs', icon: Video },
                { id: 'whatsapp', label: 'WhatsApp Templates', icon: MessageSquare },
                { id: 'toggles', label: 'Visibility Controls', icon: Eye },
              ].map(s => (
                <button
                  key={s.id}
                  onClick={() => setActiveSection(s.id)}
                  className={`flex items-center gap-2 px-3 py-2.5 rounded-xl text-xs font-bold transition-all text-left ${activeSection === s.id ? 'bg-[#C9A227]/10 text-[#B8860B] border border-[#C9A227]/20 font-black' : 'text-gray-500 hover:bg-gray-50'}`}
                >
                  <s.icon size={14} />
                  {s.label}
                </button>
              ))}
            </div>

            {/* Section Content */}
            <div className="flex-1 bg-white rounded-3xl border border-gray-100 shadow-sm overflow-y-auto p-6">
              {activeSection === 'overview' && <OverviewSection kit={editKit} setKit={setEditKit} />}
              {activeSection === 'units' && <UnitsSection kit={editKit} setKit={setEditKit} />}
              {activeSection === 'financing' && <FinancingSection kit={editKit} setKit={setEditKit} />}
              {activeSection === 'payment' && <PaymentSection kit={editKit} setKit={setEditKit} />}
              {activeSection === 'legal' && <LegalSection kit={editKit} setKit={setEditKit} />}
              {activeSection === 'videos' && <VideosSection kit={editKit} setKit={setEditKit} />}
              {activeSection === 'whatsapp' && <WhatsAppSection kit={editKit} setKit={setEditKit} />}
              {activeSection === 'toggles' && <TogglesSection kit={editKit} setKit={setEditKit} />}
            </div>
          </div>
        </div>
      ) : (
        <div className="flex-1 flex items-center justify-center text-center text-gray-400">
          <div>
            <Package2 size={48} className="mx-auto mb-3 opacity-20 text-[#C9A227]" />
            <p className="font-bold text-sm text-gray-700">Select any live property to configure its Share Kit</p>
            <p className="text-xs mt-1 text-gray-400">Unit configs, Lal Dora title & NBFC loan details auto-fetch automatically</p>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Section: Overview ───────────────────────────────────────────────────────
function OverviewSection({ kit, setKit }: { kit: ShareKit; setKit: any }) {
  return (
    <div className="space-y-6">
      <SectionTitle
        icon={Sparkles}
        title="Overview & Auto-Synced Pitch"
        desc="Key project details auto-fetched from your website property listing"
      />

      <div>
        <label className="field-label">Custom Tagline / Pitch Header (Auto-Generated • Editable)</label>
        <input
          className="field-input text-gray-900 font-bold"
          placeholder="e.g. Lal Dora Land with Direct Registry | Prime Location | Starting ₹25 Lakhs"
          value={kit.customTagline || ''}
          onChange={e => setKit((k: ShareKit) => ({ ...k, customTagline: e.target.value }))}
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <ReadOnlyField label="Property Title" value={kit.propertyTitle} />
        <ReadOnlyField label="Location" value={kit.propertyLocation} />
        <ReadOnlyField label="Starting Price" value={formatPrice(kit.propertyPrice)} />
        <ReadOnlyField label="Brochure PDF URL" value={kit.propertyBrochureUrl || 'No brochure uploaded on website'} />
      </div>

      {/* Auto-fetched Images preview */}
      {kit.propertyImages?.length > 0 && (
        <div>
          <p className="field-label mb-2">Auto-Fetched Photos ({kit.propertyImages.length})</p>
          <div className="flex gap-2 flex-wrap">
            {kit.propertyImages.slice(0, 6).map((img, i) => (
              <div key={i} className="w-16 h-16 rounded-xl overflow-hidden bg-gray-100 border border-gray-200">
                <img src={img} alt="" className="w-full h-full object-cover" />
              </div>
            ))}
            {kit.propertyImages.length > 6 && (
              <div className="w-16 h-16 rounded-xl bg-gray-100 border border-gray-200 flex items-center justify-center text-xs font-bold text-gray-400">
                +{kit.propertyImages.length - 6}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Highlights */}
      {kit.propertyHighlights && kit.propertyHighlights.length > 0 && (
        <div>
          <p className="field-label mb-2">Auto-Fetched Highlights</p>
          <div className="flex flex-wrap gap-2">
            {kit.propertyHighlights.map((h, i) => (
              <span key={i} className="bg-amber-50 text-amber-800 border border-amber-200 text-xs font-bold px-3 py-1 rounded-full">{h}</span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Section: Unit Configurations ────────────────────────────────────────────
function UnitsSection({ kit, setKit }: { kit: ShareKit; setKit: any }) {
  const addUnit = () => setKit((k: ShareKit) => ({
    ...k,
    unitConfigs: [...k.unitConfigs, { type: '', carpetArea: '', superArea: '', startingPrice: '', booking: '₹51,000', notes: '' }]
  }));

  const removeUnit = (i: number) => setKit((k: ShareKit) => ({
    ...k,
    unitConfigs: k.unitConfigs.filter((_, idx) => idx !== i)
  }));

  const updateUnit = (i: number, field: string, val: string) =>
    setKit((k: ShareKit) => ({
      ...k,
      unitConfigs: k.unitConfigs.map((u, idx) => idx === i ? { ...u, [field]: val } : u)
    }));

  return (
    <div className="space-y-4">
      <SectionTitle
        icon={Building2}
        title="Unit Configurations & Price Breakdown"
        desc="Auto-populated from property price list. You can edit sizes, starting price & booking amounts."
      />

      {kit.unitConfigs.map((u, i) => (
        <div key={i} className="bg-gray-50 rounded-2xl p-4 border border-gray-200/70 space-y-3">
          <div className="flex justify-between items-center">
            <div className="flex-1 mr-2">
              <label className="field-label">Unit Type / Configuration</label>
              <input
                className="field-input font-bold text-gray-900"
                placeholder="e.g. 2 BHK Luxury / 3 BHK Simplex"
                value={u.type}
                onChange={e => updateUnit(i, 'type', e.target.value)}
              />
            </div>
            <button
              onClick={() => removeUnit(i)}
              className="p-2 text-red-400 hover:bg-red-50 rounded-xl mt-4"
              title="Remove Unit"
            >
              <X size={14} />
            </button>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
            <div>
              <label className="field-label">Super / Plot Area</label>
              <input
                className="field-input"
                placeholder="e.g. 100 Sq.Yds / 1250 sq.ft"
                value={u.superArea || ''}
                onChange={e => updateUnit(i, 'superArea', e.target.value)}
              />
            </div>
            <div>
              <label className="field-label">Carpet Area (Optional)</label>
              <input
                className="field-input"
                placeholder="e.g. 850 sq.ft"
                value={u.carpetArea || ''}
                onChange={e => updateUnit(i, 'carpetArea', e.target.value)}
              />
            </div>
            <div>
              <label className="field-label">Starting Price</label>
              <input
                className="field-input font-extrabold text-[#C9A227]"
                placeholder="e.g. ₹28 Lakhs*"
                value={u.startingPrice || ''}
                onChange={e => updateUnit(i, 'startingPrice', e.target.value)}
              />
            </div>
            <div>
              <label className="field-label">Booking Amount</label>
              <input
                className="field-input"
                placeholder="e.g. ₹51,000"
                value={u.booking || ''}
                onChange={e => updateUnit(i, 'booking', e.target.value)}
              />
            </div>
          </div>

          <div>
            <label className="field-label">Notes / Features (e.g. Park Facing / Corner)</label>
            <input
              className="field-input"
              placeholder="e.g. Road Facing, Immediate Registry Available"
              value={u.notes || ''}
              onChange={e => updateUnit(i, 'notes', e.target.value)}
            />
          </div>
        </div>
      ))}

      <AddButton onClick={addUnit} label="Add Another Unit Configuration" />
    </div>
  );
}

// ─── Section: Lal Dora Land & NBFC Financing ──────────────────────────────────
function FinancingSection({ kit, setKit }: { kit: ShareKit; setKit: any }) {
  const addNBFC = () => setKit((k: ShareKit) => ({
    ...k,
    nbfcPartners: [...(k.nbfcPartners || []), { name: '', maxLoanPercent: '70-80%', notes: '' }]
  }));

  const removeNBFC = (i: number) => setKit((k: ShareKit) => ({
    ...k,
    nbfcPartners: (k.nbfcPartners || []).filter((_, idx) => idx !== i)
  }));

  const updateNBFC = (i: number, field: string, val: string) =>
    setKit((k: ShareKit) => ({
      ...k,
      nbfcPartners: (k.nbfcPartners || []).map((n, idx) => idx === i ? { ...n, [field]: val } : n)
    }));

  const togglePredefinedNBFC = (name: string) => {
    const exists = (kit.nbfcPartners || []).some(n => n.name === name);
    if (exists) {
      setKit((k: ShareKit) => ({
        ...k,
        nbfcPartners: (k.nbfcPartners || []).filter(n => n.name !== name)
      }));
    } else {
      setKit((k: ShareKit) => ({
        ...k,
        nbfcPartners: [...(k.nbfcPartners || []), { name, maxLoanPercent: '75%', notes: 'NBFC Home Loan' }]
      }));
    }
  };

  return (
    <div className="space-y-6">
      <SectionTitle
        icon={Landmark}
        title="Lal Dora Land & NBFC Loan Financing"
        desc="Manage land title classification, registry status and NBFC loan assistance details."
      />

      {/* Land & Registry Classification */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-amber-50/50 p-4 rounded-2xl border border-amber-200/60">
        <div>
          <label className="field-label text-amber-900">Land Title / Classification</label>
          <select
            className="field-input bg-white font-bold text-gray-800"
            value={kit.landType || 'Lal Dora Land'}
            onChange={e => setKit((k: ShareKit) => ({ ...k, landType: e.target.value }))}
          >
            <option value="Lal Dora Land (Freehold)">Lal Dora Land (Freehold)</option>
            <option value="Lal Dora Extended Abadi">Lal Dora Extended Abadi</option>
            <option value="Freehold Residential Land">Freehold Residential Land</option>
            <option value="Panchayat Approved Land">Panchayat Approved Land</option>
            <option value="Registry / Mutation Land">Registry / Mutation Land</option>
          </select>
        </div>

        <div>
          <label className="field-label text-amber-900">Registry & Title Status</label>
          <select
            className="field-input bg-white font-bold text-gray-800"
            value={kit.registryStatus || 'Direct Registry Available'}
            onChange={e => setKit((k: ShareKit) => ({ ...k, registryStatus: e.target.value }))}
          >
            <option value="Direct Registry & Mutation Available">✅ Direct Registry & Mutation Available</option>
            <option value="Registered GPA with Will">Registered GPA with Will</option>
            <option value="Registry on 100% Payment">Registry on 100% Payment</option>
            <option value="Immediate Possession & Registry">Immediate Possession & Registry</option>
          </select>
        </div>
      </div>

      {/* Quick Select Popular NBFCs */}
      <div>
        <p className="field-label mb-2">Quick Select NBFC Loan Partners</p>
        <div className="flex flex-wrap gap-2">
          {COMMON_NBFCS.map(name => {
            const isSelected = (kit.nbfcPartners || []).some(n => n.name === name);
            return (
              <button
                key={name}
                type="button"
                onClick={() => togglePredefinedNBFC(name)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all border ${isSelected ? 'bg-emerald-50 text-emerald-800 border-emerald-300 shadow-sm' : 'bg-gray-50 text-gray-600 border-gray-200 hover:bg-gray-100'}`}
              >
                {isSelected ? '✓ ' : '+ '} {name}
              </button>
            );
          })}
        </div>
      </div>

      {/* NBFC Partners List */}
      <div className="space-y-3">
        <p className="field-label">Configured NBFC Loan Options ({kit.nbfcPartners?.length || 0})</p>
        {(kit.nbfcPartners || []).map((n, i) => (
          <div key={i} className="flex gap-2 items-center bg-gray-50 p-3 rounded-2xl border border-gray-200">
            <input
              className="field-input flex-1 font-bold"
              placeholder="NBFC Name (e.g. Piramal Housing)"
              value={n.name}
              onChange={e => updateNBFC(i, 'name', e.target.value)}
            />
            <input
              className="field-input w-32 text-center font-bold text-emerald-600"
              placeholder="Max Loan % (e.g. 75%)"
              value={n.maxLoanPercent || ''}
              onChange={e => updateNBFC(i, 'maxLoanPercent', e.target.value)}
            />
            <input
              className="field-input flex-1"
              placeholder="Notes (e.g. Simple documentation)"
              value={n.notes || ''}
              onChange={e => updateNBFC(i, 'notes', e.target.value)}
            />
            <button
              onClick={() => removeNBFC(i)}
              className="p-2 text-red-400 hover:bg-red-50 rounded-xl"
            >
              <X size={14} />
            </button>
          </div>
        ))}
        <AddButton onClick={addNBFC} label="Add Custom NBFC / Financing Partner" />
      </div>

      {/* Financing Pitch Notes */}
      <div>
        <label className="field-label">Loan Assistance Pitch & Guidance for Customer</label>
        <textarea
          className="field-input min-h-[80px] resize-none"
          placeholder="e.g. NBFC Loan available up to 70-80%. Doorstep documentation assistance with low interest rates."
          value={kit.financingNotes || ''}
          onChange={e => setKit((k: ShareKit) => ({ ...k, financingNotes: e.target.value }))}
        />
      </div>
    </div>
  );
}

// ─── Section: Payment Plans ──────────────────────────────────────────────────
function PaymentSection({ kit, setKit }: { kit: ShareKit; setKit: any }) {
  const addPlan = () => setKit((k: ShareKit) => ({
    ...k,
    paymentPlans: [...k.paymentPlans, { name: '', schedule: '', description: '' }]
  }));

  const removePlan = (i: number) => setKit((k: ShareKit) => ({
    ...k,
    paymentPlans: k.paymentPlans.filter((_, idx) => idx !== i)
  }));

  const updatePlan = (i: number, field: string, val: string) =>
    setKit((k: ShareKit) => ({
      ...k,
      paymentPlans: k.paymentPlans.map((p, idx) => idx === i ? { ...p, [field]: val } : p)
    }));

  return (
    <div className="space-y-4">
      <SectionTitle
        icon={CreditCard}
        title="Payment Plans & Schemes"
        desc="Configure payment milestones, booking deposit & installment structures"
      />

      {kit.paymentPlans.map((p, i) => (
        <div key={i} className="bg-gray-50 rounded-2xl p-4 border border-gray-200 space-y-2">
          <div className="flex gap-2">
            <input
              className="field-input flex-1 font-bold"
              placeholder="Plan Name (e.g. 20:80 Subvention / CLP Scheme)"
              value={p.name}
              onChange={e => updatePlan(i, 'name', e.target.value)}
            />
            <button onClick={() => removePlan(i)} className="p-2 text-red-400 hover:bg-red-50 rounded-xl">
              <X size={14} />
            </button>
          </div>
          <textarea
            className="field-input min-h-[70px] resize-none"
            placeholder="Schedule breakdown (e.g. 20% on Booking, 80% on Registry/Possession)"
            value={p.schedule}
            onChange={e => updatePlan(i, 'schedule', e.target.value)}
          />
          <input
            className="field-input"
            placeholder="Additional description (optional)"
            value={p.description || ''}
            onChange={e => updatePlan(i, 'description', e.target.value)}
          />
        </div>
      ))}

      <AddButton onClick={addPlan} label="Add Payment Plan" />
    </div>
  );
}

// ─── Section: Legal & Registry Docs ──────────────────────────────────────────
function LegalSection({ kit, setKit }: { kit: ShareKit; setKit: any }) {
  const addDoc = () => setKit((k: ShareKit) => ({
    ...k,
    legalDocs: [...k.legalDocs, { label: '', url: '', status: 'approved' as const }]
  }));

  const removeDoc = (i: number) => setKit((k: ShareKit) => ({
    ...k,
    legalDocs: k.legalDocs.filter((_, idx) => idx !== i)
  }));

  const updateDoc = (i: number, field: string, val: string) =>
    setKit((k: ShareKit) => ({
      ...k,
      legalDocs: k.legalDocs.map((d, idx) => idx === i ? { ...d, [field]: val } : d)
    }));

  const STATUS_COLORS: Record<string, string> = {
    approved: 'text-emerald-700 bg-emerald-50 border-emerald-300',
    pending: 'text-amber-700 bg-amber-50 border-amber-300',
    info: 'text-blue-700 bg-blue-50 border-blue-300',
  };

  return (
    <div className="space-y-4">
      <SectionTitle
        icon={FileCheck}
        title="Legal & Registry Compliance Documents"
        desc="Lal Dora records, registry proof, mutation, electricity/water NOC"
      />

      {kit.legalDocs.map((d, i) => (
        <div key={i} className="bg-gray-50 rounded-2xl p-4 border border-gray-200 space-y-2">
          <div className="flex gap-2 items-center">
            <input
              className="field-input flex-1 font-bold"
              placeholder="Document Title (e.g. Sale Deed / Mutation Record)"
              value={d.label}
              onChange={e => updateDoc(i, 'label', e.target.value)}
            />
            <select
              value={d.status}
              onChange={e => updateDoc(i, 'status', e.target.value)}
              className={`px-3 py-2 rounded-xl text-xs font-black border outline-none cursor-pointer ${STATUS_COLORS[d.status]}`}
            >
              <option value="approved">✅ Verified / Ready</option>
              <option value="pending">⏳ Under Process</option>
              <option value="info">ℹ️ Available on Request</option>
            </select>
            <button onClick={() => removeDoc(i)} className="p-2 text-red-400 hover:bg-red-50 rounded-xl">
              <X size={14} />
            </button>
          </div>
          <input
            className="field-input"
            placeholder="Document URL / PDF Link (optional - if customer can view online)"
            value={d.url || ''}
            onChange={e => updateDoc(i, 'url', e.target.value)}
          />
        </div>
      ))}

      <AddButton onClick={addDoc} label="Add Legal / Registry Document" />
    </div>
  );
}

// ─── Section: Videos ─────────────────────────────────────────────────────────
function VideosSection({ kit, setKit }: { kit: ShareKit; setKit: any }) {
  const addVideo = () => setKit((k: ShareKit) => ({
    ...k,
    videoLinks: [...k.videoLinks, { label: '', url: '' }]
  }));

  const removeVideo = (i: number) => setKit((k: ShareKit) => ({
    ...k,
    videoLinks: k.videoLinks.filter((_, idx) => idx !== i)
  }));

  const updateVideo = (i: number, field: string, val: string) =>
    setKit((k: ShareKit) => ({
      ...k,
      videoLinks: k.videoLinks.map((v, idx) => idx === i ? { ...v, [field]: val } : v)
    }));

  return (
    <div className="space-y-4">
      <SectionTitle
        icon={Video}
        title="Walkthrough & Site Tour Videos"
        desc="YouTube, Instagram reel or Google Drive video links"
      />

      {kit.videoLinks.map((v, i) => (
        <div key={i} className="flex gap-3 items-start bg-gray-50 rounded-2xl p-4 border border-gray-200">
          <div className="flex-1 space-y-2">
            <input
              className="field-input font-bold"
              placeholder="Video Label (e.g. Sample Flat Walkthrough / Drone Aerial View)"
              value={v.label}
              onChange={e => updateVideo(i, 'label', e.target.value)}
            />
            <input
              className="field-input"
              placeholder="YouTube / Google Drive link (e.g. https://youtu.be/...)"
              value={v.url}
              onChange={e => updateVideo(i, 'url', e.target.value)}
            />
          </div>
          <button onClick={() => removeVideo(i)} className="p-2 text-red-400 hover:bg-red-50 rounded-xl mt-1">
            <X size={14} />
          </button>
        </div>
      ))}

      <AddButton onClick={addVideo} label="Add Video Link" />
    </div>
  );
}

// ─── Section: WhatsApp Templates ─────────────────────────────────────────────
function WhatsAppSection({ kit, setKit }: { kit: ShareKit; setKit: any }) {
  const addTemplate = () => setKit((k: ShareKit) => ({
    ...k,
    whatsappTemplates: [...k.whatsappTemplates, {
      name: 'Custom WhatsApp Pitch',
      message: `Namaste {customer_name},\n\nDetails for *${kit.propertyTitle}*:\n\n💰 Price: {price}*\n🏦 NBFC Loan Assistance Available\n\n🔗 Details: {kit_link}\n\n📞 {agent_name}: {agent_phone}`,
    }],
  }));

  const removeTemplate = (i: number) => setKit((k: ShareKit) => ({
    ...k,
    whatsappTemplates: k.whatsappTemplates.filter((_, idx) => idx !== i)
  }));

  const updateTemplate = (i: number, field: string, val: string) =>
    setKit((k: ShareKit) => ({
      ...k,
      whatsappTemplates: k.whatsappTemplates.map((t, idx) => idx === i ? { ...t, [field]: val } : t)
    }));

  return (
    <div className="space-y-4">
      <SectionTitle
        icon={MessageSquare}
        title="WhatsApp Pitch Templates"
        desc="Pre-written messages with auto-filling variables: {customer_name}, {agent_name}, {agent_phone}, {kit_link}, {price}"
      />

      {kit.whatsappTemplates.map((t, i) => (
        <div key={i} className="bg-gray-50 rounded-2xl p-4 border border-gray-200 space-y-2">
          <div className="flex gap-2">
            <input
              className="field-input flex-1 font-bold text-gray-800"
              placeholder="Template Name"
              value={t.name}
              onChange={e => updateTemplate(i, 'name', e.target.value)}
            />
            <button onClick={() => removeTemplate(i)} className="p-2 text-red-400 hover:bg-red-50 rounded-xl">
              <X size={14} />
            </button>
          </div>
          <textarea
            className="field-input min-h-[160px] resize-none font-mono text-xs text-gray-800 leading-relaxed"
            placeholder="Write your WhatsApp pitch here..."
            value={t.message}
            onChange={e => updateTemplate(i, 'message', e.target.value)}
          />
        </div>
      ))}

      <AddButton onClick={addTemplate} label="Add WhatsApp Template" />
    </div>
  );
}

// ─── Section: Visibility Toggles ─────────────────────────────────────────────
function TogglesSection({ kit, setKit }: { kit: ShareKit; setKit: any }) {
  const toggleItem = (key: keyof ShareKit['toggles']) =>
    setKit((k: ShareKit) => ({ ...k, toggles: { ...k.toggles, [key]: !k.toggles[key] } }));

  const items: { key: keyof ShareKit['toggles']; label: string; desc: string }[] = [
    { key: 'showPrice', label: 'Show Starting Price', desc: 'Include price details in share kit & WhatsApp message' },
    { key: 'showBrochure', label: 'Include Brochure PDF', desc: 'Include official PDF brochure download button' },
    { key: 'showUnitConfigs', label: 'Show Unit Configurations', desc: 'Display sizes, booking deposit & floor breakdown' },
    { key: 'showFinancing', label: 'Show Lal Dora & NBFC Loan Info', desc: 'Display land title and NBFC loan assistance details' },
    { key: 'showPaymentPlan', label: 'Show Payment Plans', desc: 'Include CLP/subvention plan details' },
    { key: 'showVideos', label: 'Include Walkthrough Videos', desc: 'Share video links in the presentation' },
    { key: 'showLegalDocs', label: 'Show Legal / Registry Status', desc: 'Show verified status for registry and papers' },
    { key: 'showAmenities', label: 'Show Project Amenities', desc: 'Display amenities icons and highlights' },
  ];

  return (
    <div className="space-y-3">
      <SectionTitle
        icon={Eye}
        title="Sharing Visibility Controls"
        desc="Turn sections ON or OFF to control what agents can share with customers"
      />

      <div className="space-y-2">
        {items.map(item => (
          <div key={item.key} className="flex items-center justify-between p-4 rounded-2xl border border-gray-200 bg-gray-50 hover:bg-gray-100/60 transition-all">
            <div>
              <p className="text-sm font-bold text-gray-800">{item.label}</p>
              <p className="text-xs text-gray-400 font-semibold">{item.desc}</p>
            </div>
            <button
              onClick={() => toggleItem(item.key)}
              className={`relative w-12 h-6 rounded-full transition-all ${kit.toggles[item.key] ? 'bg-[#C9A227]' : 'bg-gray-300'}`}
            >
              <span className={`absolute top-0.5 w-5 h-5 rounded-full bg-white shadow transition-all ${kit.toggles[item.key] ? 'left-6' : 'left-0.5'}`} />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Helpers ─────────────────────────────────────────────────────────────────
function SectionTitle({ icon: Icon, title, desc }: { icon: any; title: string; desc: string }) {
  return (
    <div className="flex items-start gap-3 pb-4 border-b border-gray-100">
      <div className="w-9 h-9 rounded-xl bg-[#C9A227]/10 flex items-center justify-center flex-shrink-0 text-[#C9A227]">
        <Icon size={16} />
      </div>
      <div>
        <h3 className="font-extrabold text-gray-900 text-sm">{title}</h3>
        <p className="text-xs text-gray-400 font-semibold">{desc}</p>
      </div>
    </div>
  );
}

function ReadOnlyField({ label, value }: { label: string; value?: string | number }) {
  return (
    <div>
      <p className="field-label">{label}</p>
      <p className="text-sm font-bold text-gray-700 bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 truncate">{value || '—'}</p>
    </div>
  );
}

function AddButton({ onClick, label }: { onClick: () => void; label: string }) {
  return (
    <button
      onClick={onClick}
      className="flex items-center gap-2 px-4 py-2.5 border-2 border-dashed border-[#C9A227]/50 text-[#C9A227] rounded-2xl text-xs font-bold hover:border-[#C9A227] hover:bg-[#C9A227]/5 transition-all w-full justify-center"
    >
      <Plus size={14} /> {label}
    </button>
  );
}
