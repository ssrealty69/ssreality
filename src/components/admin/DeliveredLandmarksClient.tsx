'use client';

import { useState } from 'react';
import { Check, Compass, Image as ImageIcon, ListPlus, Save, AlertCircle, Sparkles, ChevronDown, ChevronUp, MapPin } from 'lucide-react';
import toast from 'react-hot-toast';

interface DeliveredLandmarksClientProps {
  initialProperties: any[];
}

export default function DeliveredLandmarksClient({ initialProperties }: DeliveredLandmarksClientProps) {
  const [properties, setProperties] = useState(initialProperties);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [localHighlights, setLocalHighlights] = useState<{ [key: string]: string[] }>({});

  // Initialize highlight points for a property
  const getHighlights = (prop: any) => {
    if (localHighlights[prop._id]) {
      return localHighlights[prop._id];
    }
    const current = prop.amenities || [];
    // Ensure we always have exactly 4 strings
    const padded = [...current];
    while (padded.length < 4) {
      padded.push('');
    }
    return padded.slice(0, 4);
  };

  const handleHighlightChange = (propId: string, index: number, value: string) => {
    const current = [...getHighlights(properties.find(p => p._id === propId))];
    current[index] = value;
    setLocalHighlights(prev => ({
      ...prev,
      [propId]: current
    }));
  };

  // Toggle Delivered status
  const handleToggleDelivered = async (prop: any) => {
    const isCurrentlyDelivered = prop.status === 'delivered';
    const newStatus = isCurrentlyDelivered ? 'available' : 'delivered';
    setUpdatingId(prop._id);

    try {
      const res = await fetch(`/api/admin/properties/${prop._id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });

      if (res.ok) {
        setProperties(prev => 
          prev.map(p => p._id === prop._id ? { ...p, status: newStatus } : p)
        );
        toast.success(
          newStatus === 'delivered' 
            ? `${prop.title} added to Delivered Landmarks!` 
            : `${prop.title} returned to regular listings.`
        );
      } else {
        toast.error('Failed to update property status.');
      }
    } catch (error) {
      console.error(error);
      toast.error('An error occurred while updating status.');
    } finally {
      setUpdatingId(null);
    }
  };

  // Update image order (make selected image index 0)
  const handleSelectMedallionImage = async (prop: any, imgUrl: string) => {
    const currentImages = prop.images || [];
    if (currentImages[0] === imgUrl) return; // already primary

    setUpdatingId(prop._id);
    const newImages = [imgUrl, ...currentImages.filter((img: string) => img !== imgUrl)];

    try {
      const res = await fetch(`/api/admin/properties/${prop._id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ images: newImages }),
      });

      if (res.ok) {
        setProperties(prev => 
          prev.map(p => p._id === prop._id ? { ...p, images: newImages } : p)
        );
        toast.success('Medallion image updated successfully!');
      } else {
        toast.error('Failed to update medallion image.');
      }
    } catch (error) {
      console.error(error);
      toast.error('An error occurred while updating image.');
    } finally {
      setUpdatingId(null);
    }
  };

  // Save highlight pointers
  const handleSaveHighlights = async (propId: string) => {
    const prop = properties.find(p => p._id === propId);
    if (!prop) return;

    setUpdatingId(propId);
    const highlights = getHighlights(prop).filter((h: string) => h.trim() !== '');

    try {
      const res = await fetch(`/api/admin/properties/${propId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amenities: highlights }),
      });

      if (res.ok) {
        setProperties(prev => 
          prev.map(p => p._id === propId ? { ...p, amenities: highlights } : p)
        );
        toast.success('Highlights points saved successfully!');
        setExpandedId(null); // Automatically collapse the configuration drawer
      } else {
        toast.error('Failed to save highlights points.');
      }
    } catch (error) {
      console.error(error);
      toast.error('An error occurred while saving highlights.');
    } finally {
      setUpdatingId(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Overview Card */}
      <div className="bg-[#FAF8F2] border border-[#C9A227]/30 rounded-2xl p-5 flex items-start gap-4 shadow-sm">
        <Compass className="text-[#AA7C11] shrink-0 mt-0.5 animate-[spin_40s_linear_infinite]" size={22} />
        <div>
          <h2 className="text-base font-bold text-[#AA7C11] uppercase tracking-wider font-serif">Gold Standard Landmarks</h2>
          <p className="text-gray-600 text-xs mt-1 leading-relaxed">
            Mark properties as <strong>Delivered</strong> to show them on the Home Page Delivered Landmarks section. You can customize the 4 key highlight pointers and choose which photo should represent the property in the round medallion.
          </p>
        </div>
      </div>

      {/* Properties List */}
      <div className="grid grid-cols-1 gap-6">
        {properties.map((prop) => {
          const isDelivered = prop.status === 'delivered';
          const isExpanded = expandedId === prop._id;
          const highlights = getHighlights(prop);
          const currentMedallionImage = prop.images?.[0] || 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=300&q=80';

          return (
            <div 
              key={prop._id}
              className={`bg-white border transition-all duration-300 rounded-2xl overflow-hidden shadow-sm hover:shadow-md ${
                isDelivered ? 'border-[#C9A227]/50' : 'border-gray-200'
              }`}
            >
              {/* Header Info Row */}
              <div className="p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                  {/* Small Circular Image Thumbnail */}
                  <div className="relative w-16 h-16 rounded-full overflow-hidden border border-[#C9A227]/40 shrink-0 bg-[#FAF8F2]">
                    <img 
                      src={currentMedallionImage} 
                      alt={prop.title}
                      className="object-cover w-full h-full"
                    />
                  </div>

                  <div>
                    <h3 className="text-base font-bold text-gray-900 font-serif leading-tight">{prop.title}</h3>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-[10px] bg-gray-100 text-gray-600 font-bold px-2 py-0.5 rounded uppercase tracking-wider">
                        {prop.propertyType}
                      </span>
                      <span className="text-gray-500 text-xs flex items-center gap-0.5">
                        <MapPin size={11} className="text-[#C9A227]" />
                        {prop.location?.address}, {prop.location?.city}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-4 w-full sm:w-auto justify-between sm:justify-end">
                  {/* Status Toggle Badge */}
                  <div className="flex items-center gap-2">
                    <span className={`text-xs font-black uppercase tracking-wider ${isDelivered ? 'text-emerald-600' : 'text-gray-400'}`}>
                      {isDelivered ? 'Delivered' : 'Not Delivered'}
                    </span>
                    <button
                      onClick={() => handleToggleDelivered(prop)}
                      disabled={updatingId === prop._id}
                      className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                        isDelivered ? 'bg-emerald-500' : 'bg-gray-200'
                      }`}
                    >
                      <span
                        className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                          isDelivered ? 'translate-x-5' : 'translate-x-0'
                        }`}
                      />
                    </button>
                  </div>

                  {/* Expand Configuration Button */}
                  {isDelivered && (
                    <button
                      onClick={() => setExpandedId(isExpanded ? null : prop._id)}
                      className="p-2 hover:bg-[#C9A227]/10 text-[#AA7C11] rounded-lg transition-colors border border-[#C9A227]/20 flex items-center gap-1.5 text-xs font-bold uppercase cursor-pointer"
                    >
                      <span>Configure</span>
                      {isExpanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                    </button>
                  )}
                </div>
              </div>

              {/* Collapsible Edit Section */}
              {isDelivered && isExpanded && (
                <div className="border-t border-[#C9A227]/20 bg-[#FAF8F2]/30 p-5 space-y-6 animate-fade-in-up">
                  
                  {/* 1. Highlights Pointer Section */}
                  <div className="space-y-3">
                    <div className="flex items-center gap-1.5 text-[#AA7C11] text-xs font-black uppercase tracking-wider">
                      <ListPlus size={16} />
                      <span>1. Custom Highlight Pointers (Max 4)</span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {highlights.map((value, idx) => (
                        <div key={idx} className="flex flex-col">
                          <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1">
                            Pointer {idx + 1}
                          </label>
                          <input
                            type="text"
                            value={value}
                            onChange={(e) => handleHighlightChange(prop._id, idx, e.target.value)}
                            placeholder={`e.g. Possession & Registry 100% Done`}
                            className="bg-white border border-[#C9A227]/30 text-gray-800 text-xs rounded-xl p-3 focus:border-[#C9A227] focus:ring-2 focus:ring-[#C9A227]/10 outline-none w-full"
                          />
                        </div>
                      ))}
                    </div>

                    <div className="flex justify-end pt-2">
                      <button
                        onClick={() => handleSaveHighlights(prop._id)}
                        disabled={updatingId === prop._id}
                        className="flex items-center gap-1.5 bg-[#C9A227] hover:bg-[#B8860B] text-[#1A1800] font-black text-xs px-4 py-2.5 rounded-xl transition-all shadow-sm active:scale-95 cursor-pointer uppercase tracking-wider"
                      >
                        <Save size={14} />
                        <span>Save Pointers</span>
                      </button>
                    </div>
                  </div>

                  {/* 2. Medallion Image Picker */}
                  <div className="space-y-3 pt-3 border-t border-dashed border-[#C9A227]/20">
                    <div className="flex items-center gap-1.5 text-[#AA7C11] text-xs font-black uppercase tracking-wider">
                      <ImageIcon size={16} />
                      <span>2. Choose Circular Medallion Image</span>
                    </div>
                    <p className="text-gray-500 text-[11px] leading-relaxed">
                      Select which property picture should represent this landmark inside the round circle medallion on the Homepage.
                    </p>

                    {(!prop.images || prop.images.length === 0) ? (
                      <div className="text-center p-4 bg-gray-50 border border-dashed border-gray-300 rounded-xl text-gray-500 text-xs flex items-center justify-center gap-2">
                        <AlertCircle size={16} />
                        <span>No images uploaded for this property yet. Upload images via Properties Edit page.</span>
                      </div>
                    ) : (
                      <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-4">
                        {prop.images.map((imgUrl: string, idx: number) => {
                          const isPrimary = prop.images[0] === imgUrl;

                          return (
                            <button
                              key={idx}
                              onClick={() => handleSelectMedallionImage(prop, imgUrl)}
                              disabled={updatingId === prop._id}
                              className={`group relative aspect-square rounded-xl overflow-hidden border-2 transition-all cursor-pointer ${
                                isPrimary 
                                  ? 'border-[#C9A227] shadow-[0_0_10px_rgba(201,162,39,0.3)]' 
                                  : 'border-transparent hover:border-gray-300'
                              }`}
                            >
                              <img 
                                src={imgUrl} 
                                alt={`Property view ${idx + 1}`} 
                                className="object-cover w-full h-full"
                              />

                              {isPrimary ? (
                                <div className="absolute inset-0 bg-[#C9A227]/10 flex items-center justify-center">
                                  <div className="bg-[#C9A227] text-[#1A1800] text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded shadow">
                                    Active
                                  </div>
                                </div>
                              ) : (
                                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity duration-300">
                                  <div className="bg-white/90 text-gray-800 text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded shadow">
                                    Set Active
                                  </div>
                                </div>
                              )}
                            </button>
                          );
                        })}
                      </div>
                    )}
                  </div>

                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
