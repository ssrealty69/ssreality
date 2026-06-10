'use client';

import { useState } from 'react';
import { Check, Compass, Image as ImageIcon, ListPlus, Save, AlertCircle, Sparkles, ChevronDown, ChevronUp, MapPin, Plus, Trash2, ArrowLeftRight } from 'lucide-react';
import toast from 'react-hot-toast';
import { MediaUpload } from '@/components/admin/MediaUpload';

interface DeliveredLandmarksClientProps {
  initialProperties: any[];
}

export default function DeliveredLandmarksClient({ initialProperties }: DeliveredLandmarksClientProps) {
  const [properties, setProperties] = useState(initialProperties);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  
  // Local state for editing fields before saving
  const [editForm, setEditForm] = useState<any>({});

  const handleExpand = (prop: any) => {
    if (expandedId === prop._id) {
      setExpandedId(null);
    } else {
      setExpandedId(prop._id);
      
      // Ensure 4 pointers exist
      const paddedAmenities = [...(prop.amenities || [])];
      while (paddedAmenities.length < 4) {
        paddedAmenities.push('');
      }

      setEditForm({
        title: prop.title || '',
        propertyType: prop.propertyType || 'apartment',
        address: prop.location?.address || '',
        city: prop.location?.city || '',
        googleMapsUrl: prop.googleMapsUrl || '',
        amenities: paddedAmenities.slice(0, 4),
        images: [...(prop.images || [])]
      });
    }
  };

  const handleAddNew = async () => {
    setUpdatingId('new');
    const dummyData = {
      title: "New Delivered Landmark",
      description: "Manual entry for delivered landmark.",
      price: 0,
      priceType: "sale",
      propertyType: "apartment",
      status: "delivered",
      location: {
        address: "TBD",
        city: "TBD",
        state: "Haryana"
      },
      features: {
        area: 0,
        areaUnit: "sqft"
      },
      agent: {
        name: "Admin",
        phone: "0000000000",
        email: "admin@ssrealty.org"
      },
      images: [],
      amenities: ["", "", "", ""]
    };

    try {
      const res = await fetch('/api/admin/properties', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(dummyData),
      });

      if (res.ok) {
        const { data } = await res.json();
        setProperties(prev => [data, ...prev]);
        toast.success("New Landmark added! Please edit it.");
        handleExpand(data);
      } else {
        toast.error("Failed to add new landmark.");
      }
    } catch (e) {
      toast.error("An error occurred.");
    } finally {
      setUpdatingId(null);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to remove this landmark?')) return;
    setUpdatingId(id);
    try {
      const res = await fetch(`/api/admin/properties/${id}`, {
        method: 'DELETE',
      });
      if (res.ok) {
        setProperties(prev => prev.filter(p => p._id !== id));
        toast.success('Landmark removed.');
      } else {
        toast.error('Failed to remove.');
      }
    } catch(e) {
      toast.error('Error occurred.');
    } finally {
      setUpdatingId(null);
    }
  };

  const handleSave = async (propId: string) => {
    setUpdatingId(propId);
    
    const updateData = {
      title: editForm.title,
      propertyType: editForm.propertyType,
      'location.address': editForm.address,
      'location.city': editForm.city,
      googleMapsUrl: editForm.googleMapsUrl,
      amenities: editForm.amenities.filter((a: string) => a.trim() !== ''),
      images: editForm.images.filter(Boolean)
    };

    try {
      const res = await fetch(`/api/admin/properties/${propId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updateData),
      });

      if (res.ok) {
        const { data } = await res.json();
        setProperties(prev => prev.map(p => p._id === propId ? data : p));
        toast.success('Landmark updated successfully!');
        setExpandedId(null);
      } else {
        toast.error('Failed to update landmark.');
      }
    } catch(e) {
      toast.error('Error occurred.');
    } finally {
      setUpdatingId(null);
    }
  };

  const handleSwapImages = () => {
    if (editForm.images.length >= 2) {
      const newImages = [...editForm.images];
      const temp = newImages[0];
      newImages[0] = newImages[1];
      newImages[1] = temp;
      setEditForm({ ...editForm, images: newImages });
    }
  };

  const handleImageChange = (url: string, index: number) => {
    const newImages = [...(editForm.images || [])];
    newImages[index] = url;
    setEditForm({ ...editForm, images: newImages });
  };

  return (
    <div className="space-y-6 pb-20">
      {/* Overview Card */}
      <div className="bg-[#FAF8F2] border border-[#C9A227]/30 rounded-2xl p-5 flex flex-col md:flex-row items-start justify-between shadow-sm gap-4">
        <div className="flex items-start gap-4">
            <Compass className="text-[#AA7C11] shrink-0 mt-0.5 animate-[spin_40s_linear_infinite]" size={22} />
            <div>
            <h2 className="text-base font-bold text-[#AA7C11] uppercase tracking-wider font-serif">Gold Standard Landmarks</h2>
            <p className="text-gray-600 text-xs mt-1 leading-relaxed max-w-2xl">
                Manage your Delivered Landmarks. You can manually add past properties that are completely sold out, and upload exactly 2 images for them. The first image will be the primary Medallion image on the front-end.
            </p>
            </div>
        </div>
        <button
            onClick={handleAddNew}
            disabled={updatingId === 'new'}
            className="flex items-center gap-2 bg-[#1A1800] hover:bg-[#AA7C11] text-white px-4 py-2.5 rounded-xl font-bold uppercase tracking-wider text-xs transition-colors shadow-lg cursor-pointer shrink-0"
        >
            <Plus size={16} />
            <span>Add New Landmark</span>
        </button>
      </div>

      {/* Properties List */}
      <div className="grid grid-cols-1 gap-6">
        {properties.map((prop) => {
          const isExpanded = expandedId === prop._id;
          const currentMedallionImage = prop.images?.[0];

          return (
            <div 
              key={prop._id}
              className={`bg-white border transition-all duration-300 rounded-2xl overflow-hidden shadow-sm hover:shadow-md border-[#C9A227]/50`}
            >
              {/* Header Info Row */}
              <div className="p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                  {/* Small Circular Image Thumbnail */}
                  <div className="relative w-16 h-16 rounded-full overflow-hidden border border-[#C9A227]/40 shrink-0 bg-[#FAF8F2] flex items-center justify-center">
                    {currentMedallionImage ? (
                      <img 
                        src={currentMedallionImage} 
                        alt={prop.title}
                        className="object-cover w-full h-full"
                      />
                    ) : (
                      <ImageIcon size={24} className="text-gray-300" />
                    )}
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

                <div className="flex items-center gap-2 w-full sm:w-auto justify-between sm:justify-end">
                  <button
                    onClick={() => handleDelete(prop._id)}
                    disabled={updatingId === prop._id}
                    className="p-2 hover:bg-red-50 text-red-500 rounded-lg transition-colors border border-red-100 flex items-center gap-1.5 text-xs font-bold uppercase cursor-pointer"
                    title="Remove Landmark"
                  >
                    <Trash2 size={16} />
                  </button>
                  <button
                    onClick={() => handleExpand(prop)}
                    className="p-2 hover:bg-[#C9A227]/10 text-[#AA7C11] rounded-lg transition-colors border border-[#C9A227]/20 flex items-center gap-1.5 text-xs font-bold uppercase cursor-pointer min-w-[80px] justify-center"
                  >
                    <span>{isExpanded ? 'Close' : 'Edit'}</span>
                    {isExpanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                  </button>
                </div>
              </div>

              {/* Collapsible Edit Section */}
              {isExpanded && (
                <div className="border-t border-[#C9A227]/20 bg-[#FAF8F2]/30 p-5 space-y-8 animate-fade-in-up">
                  
                  {/* Basic Details */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1 block">Title</label>
                        <input type="text" value={editForm.title} onChange={e => setEditForm({...editForm, title: e.target.value})} className="bg-white border border-[#C9A227]/30 text-gray-800 text-sm rounded-xl p-3 focus:border-[#C9A227] outline-none w-full" />
                    </div>
                    <div>
                        <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1 block">Property Type</label>
                        <select value={editForm.propertyType} onChange={e => setEditForm({...editForm, propertyType: e.target.value})} className="bg-white border border-[#C9A227]/30 text-gray-800 text-sm rounded-xl p-3 focus:border-[#C9A227] outline-none w-full">
                            <option value="apartment">Apartment</option>
                            <option value="villa">Villa</option>
                            <option value="plot">Plot</option>
                            <option value="commercial">Commercial</option>
                            <option value="office">Office</option>
                        </select>
                    </div>
                    <div>
                        <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1 block">Address</label>
                        <input type="text" value={editForm.address} onChange={e => setEditForm({...editForm, address: e.target.value})} className="bg-white border border-[#C9A227]/30 text-gray-800 text-sm rounded-xl p-3 focus:border-[#C9A227] outline-none w-full" />
                    </div>
                    <div>
                        <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1 block">City</label>
                        <input type="text" value={editForm.city} onChange={e => setEditForm({...editForm, city: e.target.value})} className="bg-white border border-[#C9A227]/30 text-gray-800 text-sm rounded-xl p-3 focus:border-[#C9A227] outline-none w-full" />
                    </div>
                    <div>
                        <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1 block">Google Maps Link</label>
                        <input type="url" value={editForm.googleMapsUrl} onChange={e => setEditForm({...editForm, googleMapsUrl: e.target.value})} placeholder="https://maps.google.com/..." className="bg-white border border-[#C9A227]/30 text-gray-800 text-sm rounded-xl p-3 focus:border-[#C9A227] outline-none w-full" />
                    </div>
                  </div>

                  {/* 1. Highlights Pointer Section */}
                  <div className="space-y-3 pt-4 border-t border-dashed border-[#C9A227]/20">
                    <div className="flex items-center gap-1.5 text-[#AA7C11] text-xs font-black uppercase tracking-wider">
                      <ListPlus size={16} />
                      <span>Custom Highlight Pointers (Max 4)</span>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {editForm.amenities.map((value: string, idx: number) => (
                        <div key={idx} className="flex flex-col">
                          <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1">
                            Pointer {idx + 1}
                          </label>
                          <input
                            type="text"
                            value={value}
                            onChange={(e) => {
                                const newAm = [...editForm.amenities];
                                newAm[idx] = e.target.value;
                                setEditForm({...editForm, amenities: newAm});
                            }}
                            placeholder={`e.g. Possession & Registry 100% Done`}
                            className="bg-white border border-[#C9A227]/30 text-gray-800 text-xs rounded-xl p-3 focus:border-[#C9A227] focus:ring-2 focus:ring-[#C9A227]/10 outline-none w-full"
                          />
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* 2. Image Manager */}
                  <div className="space-y-4 pt-4 border-t border-dashed border-[#C9A227]/20">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1.5 text-[#AA7C11] text-xs font-black uppercase tracking-wider">
                        <ImageIcon size={16} />
                        <span>2 Images Setup</span>
                        </div>
                        <button 
                          onClick={handleSwapImages}
                          type="button"
                          className="flex items-center gap-1 bg-[#F5F5F5] hover:bg-gray-200 text-gray-700 text-[10px] uppercase font-bold px-3 py-1.5 rounded border border-gray-300 transition-colors cursor-pointer"
                        >
                            <ArrowLeftRight size={14} /> Swap Images
                        </button>
                    </div>
                    <p className="text-gray-500 text-[11px] leading-relaxed -mt-2">
                      Upload exactly 2 images. Image 1 is the front medallion. Image 2 shows on hover. Use the Swap button to reverse them.
                    </p>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2 p-4 border border-[#C9A227]/30 rounded-xl bg-white relative">
                            <div className="absolute top-2 left-2 bg-[#C9A227] text-white text-[9px] font-black uppercase px-2 py-0.5 rounded shadow z-10 pointer-events-none">Image 1 (Front)</div>
                            <MediaUpload 
                                label=""
                                description=""
                                value={editForm.images[0] || ''}
                                onChange={(url) => handleImageChange(url, 0)}
                                folder="ss-realty/landmarks"
                            />
                        </div>
                        <div className="space-y-2 p-4 border border-[#C9A227]/30 rounded-xl bg-white relative">
                            <div className="absolute top-2 left-2 bg-gray-600 text-white text-[9px] font-black uppercase px-2 py-0.5 rounded shadow z-10 pointer-events-none">Image 2 (Hover)</div>
                            <MediaUpload 
                                label=""
                                description=""
                                value={editForm.images[1] || ''}
                                onChange={(url) => handleImageChange(url, 1)}
                                folder="ss-realty/landmarks"
                            />
                        </div>
                    </div>
                  </div>

                  {/* Save Button */}
                  <div className="flex justify-end pt-4 border-t border-[#C9A227]/20">
                      <button
                        onClick={() => handleSave(prop._id)}
                        disabled={updatingId === prop._id}
                        className="flex items-center gap-2 bg-[#C9A227] hover:bg-[#B8860B] text-[#1A1800] font-black text-sm px-6 py-3 rounded-xl transition-all shadow-md active:scale-95 cursor-pointer uppercase tracking-wider"
                      >
                        <Save size={16} />
                        <span>Save Landmark Changes</span>
                      </button>
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
