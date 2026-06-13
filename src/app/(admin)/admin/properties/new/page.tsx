'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Save, Plus, Trash2, Edit, Check } from 'lucide-react';
import Link from 'next/link';
import toast from 'react-hot-toast';
import { MediaUpload, PdfUpload, MultiImageUpload } from '@/components/admin/MediaUpload';
import { SeoControlPanel } from '@/components/admin/SeoControlPanel';
import { RichTextEditor } from '@/components/admin/RichTextEditor';
import { parsePriceText } from '@/lib/utils';

// Auto-selected by default — from /public/Project Amenities folder
const PROJECT_AMENITIES = [
  '24X7 CCTV & SECURITY',
  '3D WALL MOULDING DESIGN',
  'BRANDED LIFT',
  'CAR PARKING',
  'DIGITAL DOOR LOCK',
  'FANCY FANS IN LIVING AREA',
  'FIRE SAFETY SYSTEM',
  'GEYSERS (IN ALL WASHROOMS)',
  'HAVELLS WIRE FITTING',
  'JAGUAR BAITH FITTINGS',
  "KID'S PLAY AREA ON TERRACE",
  'KOHLER BATH FITTINGS',
  'MODULAR KITCHEN WITH CHIMNEY, HOB & MICROWAVE',
  'MODULAR LIGHTNING STAIRS',
  'MODULAR WARDROBES (ALL BEDROOMS)',
  'MYGATE APP-BASED (ENTRY SYSTEM)',
  'TERRACE GARDEN',
  'UPVC WINDOWS',
  'WANITY UNIT & MIRRORS',
  'WATER PURIFIER RO',
  'WELCOME LOUNGE',
];

// Not pre-selected — from /public/World Class Amenities folder (excluding building images)
const WORLD_CLASS_AMENITIES = [
  'Badminton',
  'Banquet',
  'Clubhouse',
  'EV Charging',
  'Garden',
  'Gym',
  'Infinity Pool',
  'Kids Zone',
  'Library',
  'Lift Lobby',
  'Lobby',
  'Pet Park',
  'Reception',
  'Security Room',
  'Sky Garden',
  'Spa',
  'Table Tennis',
  'Tennis Court',
  'Terrace',
  'Theatre',
  'Yoga Deck',
];

export default function AddProperty() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    propertyName: '',
    title: '',
    description: '',
    price: '',
    priceType: 'sale',
    propertyType: 'apartment',
    status: 'available',
    location: {
      address: '',
      city: '',
      state: '',
      pincode: '',
      lat: '',
      lng: '',
    },
    features: {
      area: '',
      areaUnit: 'sqft',
      bedrooms: '',
      bathrooms: '',
      registryAvailable: true,
      parking: false,
      furnished: false,
      floor: '',
      totalFloors: '',
      towers: '',
      totalUnits: '',
      reraApproved: false
    },
    agent: {
      name: '',
      phone: '',
      email: '',
      image: '',
    },
    amenities: [...PROJECT_AMENITIES] as string[], // Auto-selected by default
    worldClassAmenities: [] as string[],
    priceList: [{ type: '', size: '', price: '', negotiable: false, isEditing: true }] as { type: string; size: string; price: string; negotiable?: boolean; isEditing?: boolean }[],
    images: [''] as string[], // Only banner image remains here (as images[0])
    mobileBannerUrl: '',
    interiorImages: [] as string[],
    galleryImages: [] as string[],
    videoUrl: '',
    brochureUrl: '',
    googleMapsUrl: '',
    highlights: [''],
    highlightsImageUrl: '',
    locationMapUrl: '',
    nearby: [{ type: 'landmark', name: '', distance: '' }],
    featured: false
  });

  // SEO Control Panel State
  const [seoData, setSeoData] = useState({
    title: '',
    description: '',
    keywords: '',
    focusKeyword: '',
    canonicalUrl: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Clean up empty dynamic fields before sending
      const payload = {
        ...formData,
        price: formData.price ? parsePriceText(formData.price as string) : 0,
        images: formData.images.filter(img => img.trim() !== ''),
        interiorImages: formData.interiorImages.filter(img => img.trim() !== ''),
        galleryImages: formData.galleryImages.filter(img => img.trim() !== ''),
        highlights: formData.highlights.filter(h => typeof h === 'string' && h.trim() !== ''),
        nearby: formData.nearby
          .filter(n => n.name.trim() !== '')
          .map(n => {
            const rawVal = n.name.trim();
            let distance = '';
            let name = rawVal;
            
            if (rawVal.includes(' - ')) {
              const parts = rawVal.split(' - ');
              distance = parts[0].trim();
              name = parts.slice(1).join(' - ').trim();
            } else if (rawVal.includes('-')) {
              const parts = rawVal.split('-');
              distance = parts[0].trim();
              name = parts.slice(1).join('-').trim();
            }

            return {
              type: n.type || 'landmark',
              name,
              distance
            };
          }),
        priceList: formData.priceList
          .filter(p => p.type.trim() !== '' && p.price.trim() !== '')
          .map(({ isEditing, ...rest }: any) => rest),
        features: {
          ...formData.features,
          area: formData.features.area ? parseFloat(formData.features.area as string) : undefined,
          bedrooms: formData.features.bedrooms ? parseInt(formData.features.bedrooms as string) : undefined,
          bathrooms: formData.features.bathrooms ? parseInt(formData.features.bathrooms as string) : undefined,
          floor: formData.features.floor ? parseInt(formData.features.floor as string) : undefined,
          totalFloors: formData.features.totalFloors ? parseInt(formData.features.totalFloors as string) : undefined,
          towers: formData.features.towers ? parseInt(formData.features.towers as string) : undefined,
          totalUnits: formData.features.totalUnits ? parseInt(formData.features.totalUnits as string) : undefined,
        },
        location: {
          ...formData.location,
          lat: formData.location.lat ? parseFloat(formData.location.lat as string) : undefined,
          lng: formData.location.lng ? parseFloat(formData.location.lng as string) : undefined,
        },
        seo: seoData
      };

      const res = await fetch('/api/admin/properties', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (res.ok) {
        toast.success('Property created successfully in Database!');
        setTimeout(() => {
          router.push('/admin/properties');
        }, 1000);
      } else {
        const errorData = await res.json();
        toast.error(errorData.error || 'Failed to create property');
      }
    } catch (error) {
      toast.error('An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    
    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      if (name.includes('.')) {
        const [parent, child] = name.split('.');
        setFormData((prev: any) => ({ ...prev, [parent]: { ...prev[parent], [child]: checked } }));
      } else {
        setFormData(prev => ({ ...prev, [name]: checked }));
      }
      return;
    }

    if (name.includes('.')) {
      const [parent, child] = name.split('.');
      setFormData((prev: any) => ({ ...prev, [parent]: { ...prev[parent], [child]: value } }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleAmenityToggle = (amenity: string) => {
    setFormData(prev => {
      if (prev.amenities.includes(amenity)) {
        return { ...prev, amenities: prev.amenities.filter(a => a !== amenity) };
      } else {
        return { ...prev, amenities: [...prev.amenities, amenity] };
      }
    });
  };

  const handleWorldClassAmenityToggle = (amenity: string) => {
    setFormData(prev => {
      if (prev.worldClassAmenities.includes(amenity)) {
        return { ...prev, worldClassAmenities: prev.worldClassAmenities.filter(a => a !== amenity) };
      } else {
        return { ...prev, worldClassAmenities: [...prev.worldClassAmenities, amenity] };
      }
    });
  };

  const selectAllWorldClass = () => {
    setFormData(prev => ({ ...prev, worldClassAmenities: [...WORLD_CLASS_AMENITIES] }));
  };

  const clearAllWorldClass = () => {
    setFormData(prev => ({ ...prev, worldClassAmenities: [] }));
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/admin/properties" className="p-2 hover:bg-gray-100 rounded-full transition-colors">
          <ArrowLeft size={24} className="text-gray-600" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-[#1A1800]">Add New Property</h1>
          <p className="text-sm text-gray-500">In-Depth Database Entry</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        
        {/* Basic Details */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 sm:p-8 space-y-4">
          <h2 className="text-lg font-bold text-[#1A1800] border-b pb-2">Basic Details</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Property / Apartment Name</label>
              <input type="text" name="propertyName" value={formData.propertyName} onChange={handleChange} className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-[#C9A227] outline-none" placeholder="e.g. DLF Camellias, Supernova Spira" />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
              <input type="text" name="title" required value={formData.title} onChange={handleChange} className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-[#C9A227] outline-none" placeholder="e.g. Luxury 4BHK Villa in Noida" />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Description</label>
              <RichTextEditor
                value={formData.description}
                onChange={(val) => setFormData(prev => ({ ...prev, description: val }))}
                placeholder="Property description..."
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Price</label>
              <input type="text" name="price" required value={formData.price} onChange={handleChange} placeholder="e.g. 1.25 Cr or 75 L" className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-[#C9A227] outline-none" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Price Type</label>
              <select name="priceType" value={formData.priceType} onChange={handleChange} className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-[#C9A227] outline-none">
                <option value="sale">For Sale</option>
                <option value="rent">For Rent</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Property Type</label>
              <select name="propertyType" value={formData.propertyType} onChange={handleChange} className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-[#C9A227] outline-none">
                <option value="apartment">Apartment</option>
                <option value="villa">Villa</option>
                <option value="plot">Plot</option>
                <option value="commercial">Commercial</option>
                <option value="floor">Floor</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Listing Status</label>
              <select name="status" value={formData.status} onChange={handleChange} className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-[#C9A227] outline-none">
                <option value="available">Available</option>
                <option value="sold">Sold</option>
                <option value="rented">Rented</option>
                <option value="delivered">Delivered</option>
              </select>
            </div>
            <div className="flex items-center gap-2 mt-6">
              <input type="checkbox" id="featured" name="featured" checked={formData.featured} onChange={handleChange} className="w-5 h-5 text-[#C9A227] rounded" />
              <label htmlFor="featured" className="text-sm font-medium text-gray-700">Mark as Featured Property</label>
            </div>
          </div>
        </div>

        {/* Location & Features */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 sm:p-8 space-y-6">
          <h2 className="text-lg font-bold text-[#1A1800] border-b pb-2">Location & Features</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="md:col-span-3">
              <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
              <input type="text" name="location.address" required value={formData.location.address} onChange={handleChange} className="w-full border border-gray-300 rounded-lg p-3 outline-none" />
            </div>
            <div className="md:col-span-3">
              <label className="block text-sm font-medium text-gray-700 mb-1">Google Maps / Location URL (For Delivered Properties)</label>
              <input type="url" name="googleMapsUrl" value={formData.googleMapsUrl} onChange={handleChange} className="w-full border border-gray-300 rounded-lg p-3 outline-none focus:ring-2 focus:ring-[#C9A227]" placeholder="e.g. https://maps.app.goo.gl/..." />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">City</label>
              <input type="text" name="location.city" required value={formData.location.city} onChange={handleChange} className="w-full border border-gray-300 rounded-lg p-3 outline-none" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">State</label>
              <input type="text" name="location.state" required value={formData.location.state} onChange={handleChange} className="w-full border border-gray-300 rounded-lg p-3 outline-none" />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Towers</label>
              <input type="number" name="features.towers" value={formData.features.towers} onChange={handleChange} className="w-full border border-gray-300 rounded-lg p-3 outline-none" placeholder="e.g. 6" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Total Units</label>
              <input type="number" name="features.totalUnits" value={formData.features.totalUnits} onChange={handleChange} className="w-full border border-gray-300 rounded-lg p-3 outline-none" placeholder="e.g. 542" />
            </div>
            <div className="flex items-center gap-2 mt-6">
              <input type="checkbox" id="registryAvailable" name="features.registryAvailable" checked={formData.features.registryAvailable} onChange={handleChange} className="w-5 h-5 text-[#C9A227] rounded" />
              <label htmlFor="registryAvailable" className="text-sm font-medium text-gray-700 font-bold">Registry Available</label>
            </div>
            <div className="flex items-center gap-2 mt-6">
              <input type="checkbox" id="parking" name="features.parking" checked={formData.features.parking} onChange={handleChange} className="w-5 h-5 text-[#C9A227] rounded" />
              <label htmlFor="parking" className="text-sm font-medium text-gray-700">Parking Available</label>
            </div>
            <div className="flex items-center gap-2 mt-6">
              <input type="checkbox" id="furnished" name="features.furnished" checked={formData.features.furnished} onChange={handleChange} className="w-5 h-5 text-[#C9A227] rounded" />
              <label htmlFor="furnished" className="text-sm font-medium text-gray-700">Fully Furnished</label>
            </div>
            <div className="flex items-center gap-2 mt-6">
              <input type="checkbox" id="reraApproved" name="features.reraApproved" checked={formData.features.reraApproved} onChange={handleChange} className="w-5 h-5 text-[#C9A227] rounded" />
              <label htmlFor="reraApproved" className="text-sm font-medium text-gray-700 font-bold">RERA Approved</label>
            </div>
          </div>

          <hr className="border-gray-200 my-6" />

          {/* Apartment Configurations (BHKs & Pricing) */}
          <div className="space-y-6">
            <div className="flex items-center justify-between border-b pb-2">
              <div>
                <h3 className="text-md font-bold text-[#1A1800]">Apartment Configurations & Pricing</h3>
                <p className="text-xs text-gray-500 mt-0.5">Add configurations like 3BHK, 4BHK Duplex, etc., with their individual size and prices.</p>
              </div>
              <button 
                type="button" 
                onClick={() => setFormData({ ...formData, priceList: [...formData.priceList, { type: '', size: '', price: '', negotiable: false, isEditing: true }] })}
                className="flex items-center gap-1 text-xs bg-[#C9A227] hover:bg-[#B8860B] text-[#1A1800] font-bold px-3 py-1.5 rounded-lg transition-colors"
              >
                <Plus size={14} /> Add Configuration
              </button>
            </div>

            <div className="space-y-4">
               {formData.priceList.map((config, index) => (
                 config.isEditing !== false ? (
                   <div key={index} className="grid grid-cols-1 md:grid-cols-12 gap-4 items-end relative py-1">
                     <div className="md:col-span-3">
                       <label className="block text-xs font-semibold text-slate-600 mb-1">Unit Type / Name</label>
                       <input 
                         type="text" 
                         placeholder="e.g. 3BHK, 4BHK Duplex" 
                         value={config.type}
                         onChange={(e) => {
                           const newList = [...formData.priceList];
                           newList[index] = { ...newList[index], type: e.target.value };
                           setFormData({ ...formData, priceList: newList });
                         }}
                         required
                         className="w-full border border-gray-300 rounded-full px-4 py-2 bg-white text-sm outline-none focus:ring-2 focus:ring-[#C9A227]"
                       />
                     </div>
                     <div className="md:col-span-3">
                       <label className="block text-xs font-semibold text-slate-600 mb-1">Area / Size</label>
                       <input 
                         type="text" 
                         placeholder="e.g. 250 Sq. Yd. or 1800 Sq. F" 
                         value={config.size}
                         onChange={(e) => {
                           const newList = [...formData.priceList];
                           newList[index] = { ...newList[index], size: e.target.value };
                           setFormData({ ...formData, priceList: newList });
                         }}
                         required
                         className="w-full border border-gray-300 rounded-full px-4 py-2 bg-white text-sm outline-none focus:ring-2 focus:ring-[#C9A227]"
                       />
                     </div>
                     <div className="md:col-span-3">
                       <label className="block text-xs font-semibold text-slate-600 mb-1">Price</label>
                       <input 
                         type="text" 
                         placeholder="e.g. 18.00 L, 1.5 Cr" 
                         value={config.price}
                         onChange={(e) => {
                           const newList = [...formData.priceList];
                           newList[index] = { ...newList[index], price: e.target.value };
                           setFormData({ ...formData, priceList: newList });
                         }}
                         required
                         className="w-full border border-gray-300 rounded-full px-4 py-2 bg-white text-sm outline-none focus:ring-2 focus:ring-[#C9A227]"
                       />
                     </div>
                     <div className="md:col-span-3 flex items-center justify-between gap-2 py-2 shrink-0">
                       <label className="flex items-center gap-2 cursor-pointer select-none">
                         <input 
                           type="checkbox" 
                           checked={config.negotiable || false}
                           onChange={(e) => {
                             const newList = [...formData.priceList];
                             newList[index] = { ...newList[index], negotiable: e.target.checked };
                             setFormData({ ...formData, priceList: newList });
                           }}
                           className="w-4 h-4 text-[#C9A227] rounded accent-[#C9A227]"
                         />
                         <span className="text-xs font-bold text-slate-700">Price Negotiable</span>
                       </label>
                       
                       <div className="flex items-center gap-1.5">
                         <button 
                           type="button" 
                           onClick={() => {
                             if (!config.type.trim() || !config.price.trim()) {
                               toast.error('Unit Type and Price are required before saving.');
                               return;
                             }
                             const newList = [...formData.priceList];
                             newList[index] = { ...newList[index], isEditing: false };
                             setFormData({ ...formData, priceList: newList });
                           }}
                           className="flex items-center gap-1 text-xs bg-green-50 hover:bg-green-100 text-green-700 font-bold px-3 py-1.5 rounded-full border border-green-200 transition-colors shrink-0"
                           title="Save Configuration"
                         >
                           <Check size={14} />
                           <span>Save</span>
                         </button>
                         
                         <button 
                           type="button" 
                           onClick={() => {
                             const newList = formData.priceList.filter((_, i) => i !== index);
                             setFormData({ ...formData, priceList: newList });
                           }}
                           className="p-2 text-red-500 hover:bg-red-50 rounded-full shrink-0 transition-colors"
                           title="Remove Configuration"
                         >
                           <Trash2 size={18} />
                         </button>
                       </div>
                     </div>
                   </div>
                 ) : (
                   <div key={index} className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center relative py-2 border-b border-gray-100 last:border-0">
                     <div className="md:col-span-3">
                       <span className="block text-[10px] uppercase tracking-wider font-semibold text-gray-400 mb-0.5">Unit Type / Name</span>
                       <span className="text-sm font-bold text-slate-800 bg-slate-50 px-3.5 py-2 rounded-full border border-slate-100 block truncate">
                         {config.type || '—'}
                       </span>
                     </div>
                     <div className="md:col-span-3">
                       <span className="block text-[10px] uppercase tracking-wider font-semibold text-gray-400 mb-0.5">Area / Size</span>
                       <span className="text-sm font-semibold text-slate-700 bg-slate-50 px-3.5 py-2 rounded-full border border-slate-100 block truncate">
                         {config.size || '—'}
                       </span>
                     </div>
                     <div className="md:col-span-3">
                       <span className="block text-[10px] uppercase tracking-wider font-semibold text-gray-400 mb-0.5">Price</span>
                       <span className="text-sm font-semibold text-slate-700 bg-slate-50 px-3.5 py-2 rounded-full border border-slate-100 block truncate">
                         {config.price || '—'}
                       </span>
                     </div>
                     <div className="md:col-span-3 flex items-center justify-between gap-3 shrink-0">
                       <div>
                         <span className="block text-[10px] uppercase tracking-wider font-semibold text-gray-400 mb-0.5">Status</span>
                         {config.negotiable ? (
                           <span className="inline-block text-[10px] font-black text-green-700 bg-green-50 px-2.5 py-1 rounded-full border border-green-200 uppercase tracking-wider">
                             Negotiable
                           </span>
                         ) : (
                           <span className="inline-block text-[10px] font-black text-slate-500 bg-slate-50 px-2.5 py-1 rounded-full border border-slate-200 uppercase tracking-wider">
                             Fixed Price
                           </span>
                         )}
                       </div>
                       <div className="flex items-center gap-2 pt-4">
                         <button 
                           type="button" 
                           onClick={() => {
                             const newList = [...formData.priceList];
                             newList[index] = { ...newList[index], isEditing: true };
                             setFormData({ ...formData, priceList: newList });
                           }}
                           className="p-2 text-[#C9A227] hover:bg-amber-50 rounded-full transition-colors shrink-0"
                           title="Edit Configuration"
                         >
                           <Edit size={16} />
                         </button>
                         <button 
                           type="button" 
                           onClick={() => {
                             const newList = formData.priceList.filter((_, i) => i !== index);
                             setFormData({ ...formData, priceList: newList });
                           }}
                           className="p-2 text-red-500 hover:bg-red-50 rounded-full transition-colors shrink-0"
                           title="Remove Configuration"
                         >
                           <Trash2 size={16} />
                         </button>
                       </div>
                     </div>
                   </div>
                 )
               ))}

              {formData.priceList.length === 0 && (
                <div className="text-center py-6 text-sm text-gray-500 bg-gray-50 rounded-xl border border-dashed border-gray-200">
                  No configurations added yet. Click "Add Configuration" to add pricing for different sizes.
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Media & Documents (Uploads & Links) */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 sm:p-8 space-y-6">
          <h2 className="text-lg font-bold text-[#1A1800] border-b pb-2">Media & Documents</h2>
          
          <div className="grid grid-cols-1 gap-6">
            {/* YouTube Video Link */}
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1">YouTube Video URL</label>
              <p className="text-xs text-gray-500 mb-1.5">Optional walk-through video link for property tours</p>
              <input 
                type="url" 
                name="videoUrl" 
                value={formData.videoUrl} 
                onChange={handleChange} 
                className="w-full border border-gray-300 rounded-lg p-3 outline-none focus:ring-2 focus:ring-[#C9A227]" 
                placeholder="e.g. https://www.youtube.com/watch?v=..." 
              />
            </div>

            {/* Main Banner Image Uploader */}
            <MediaUpload
              label="Main Banner Image (Hero Background)"
              description="This is the main banner image displayed at the very top background of the public details page."
              value={formData.images[0] || ''}
              onChange={(url) => {
                setFormData(prev => {
                  const newImages = [...prev.images];
                  newImages[0] = url;
                  return { ...prev, images: newImages };
                });
              }}
            />

            {/* Mobile Banner Image Uploader */}
            <MediaUpload
              label="Mobile Banner Image (Hero Background)"
              description="Optional: This image will be used specifically on mobile devices for the top hero background."
              value={formData.mobileBannerUrl}
              onChange={(url) => {
                setFormData(prev => ({ ...prev, mobileBannerUrl: url }));
              }}
            />

            {/* Apartment Interior / Overview Slideshow Uploader */}
            <MultiImageUpload
              label="Apartment Interior / Overview Images (Up to 8 photos)"
              description="Upload multiple interior, floor plan, or structural images displayed in the overview slider section."
              images={formData.interiorImages}
              onChange={(urls) => {
                setFormData(prev => ({ ...prev, interiorImages: urls.slice(0, 8) }));
              }}
            />

            {/* PDF Brochure Uploader */}
            <PdfUpload
              label="Download Brochure PDF Document"
              description="Upload the project brochure PDF. Public visitors can download it instantly."
              value={formData.brochureUrl || ''}
              onChange={(url) => {
                setFormData(prev => ({ ...prev, brochureUrl: url }));
              }}
            />

            {/* Multi-Image Gallery Uploader */}
            <MultiImageUpload
              label="Property Photo Gallery / Facilities (Up to 8 photos)"
              description="Upload multiple photos showcasing facilities (park, temple, gym) or neighborhood context (school, market)."
              images={formData.galleryImages}
              onChange={(urls) => {
                setFormData(prev => ({ ...prev, galleryImages: urls.slice(0, 8) }));
              }}
            />
          </div>
        </div>

        {/* Location Advantage (Nearby) */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 sm:p-8 space-y-4">
          <h2 className="text-lg font-bold text-[#1A1800] border-b pb-2">Location Advantages (Nearby)</h2>
          
          <MediaUpload
            label="Location Advantage Section Map Image"
            description="Upload a custom location plan or layout map image to display on the left side of the Location Advantage section."
            value={formData.locationMapUrl || ''}
            onChange={(url) => setFormData(prev => ({ ...prev, locationMapUrl: url }))}
          />
          {formData.nearby.map((place, index) => (
            <div key={index} className="flex gap-4 items-start">
              <div className="flex-1">
                <input 
                  type="text" 
                  placeholder="Distance & Place Name (e.g., 6.8 Km - Gurugram University)" 
                  value={place.name}
                  onChange={(e) => {
                    const newNearby = [...formData.nearby];
                    newNearby[index].name = e.target.value;
                    newNearby[index].distance = '';
                    setFormData({ ...formData, nearby: newNearby });
                  }}
                  className="w-full border border-gray-300 rounded-lg p-2 outline-none focus:ring-2 focus:ring-[#C9A227]"
                />
              </div>
              <button 
                type="button" 
                onClick={() => {
                  const newNearby = formData.nearby.filter((_, i) => i !== index);
                  setFormData({ ...formData, nearby: newNearby });
                }}
                className="p-2 text-red-500 hover:bg-red-50 rounded-lg"
              >
                <Trash2 size={20} />
              </button>
            </div>
          ))}
          <button 
            type="button" 
            onClick={() => setFormData({ ...formData, nearby: [...formData.nearby, { type: 'landmark', name: '', distance: '' }] })}
            className="flex items-center gap-2 text-[#C9A227] font-medium hover:text-[#B8860B]"
          >
            <Plus size={18} /> Add Nearby Place
          </button>
        </div>

        {/* PROJECT AMENITIES — Auto-selected, from /public/Project Amenities */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 sm:p-8 space-y-4">
          <div className="flex items-center justify-between border-b pb-2">
            <h2 className="text-lg font-bold text-[#1A1800]">Amenities</h2>
            <span className="text-xs text-gray-400 bg-gray-100 rounded-full px-3 py-1">Auto-selected · Uncheck to remove</span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
            {PROJECT_AMENITIES.map(amenity => {
              const imgPath = `/Project Amenities/${amenity.replace(/'/g, "")}.jpg`;
              const isChecked = formData.amenities.includes(amenity);
              return (
                <label
                  key={amenity}
                  htmlFor={`proj-amenity-${amenity}`}
                  className={`flex items-center gap-3 p-3 rounded-xl border-2 cursor-pointer transition-all ${
                    isChecked ? 'border-[#C9A227] bg-[#FFFBEF]' : 'border-gray-100 bg-gray-50 opacity-60'
                  }`}
                >
                  <input
                    type="checkbox"
                    id={`proj-amenity-${amenity}`}
                    checked={isChecked}
                    onChange={() => handleAmenityToggle(amenity)}
                    className="w-4 h-4 text-[#C9A227] rounded accent-[#C9A227] shrink-0"
                  />
                  <img
                    src={imgPath}
                    alt={amenity}
                    className="w-10 h-10 rounded-lg object-cover shrink-0 border border-gray-200"
                    onError={e => (e.currentTarget.style.display = 'none')}
                  />
                  <span className="text-xs font-semibold text-gray-700 leading-tight uppercase tracking-wide">{amenity}</span>
                </label>
              );
            })}
          </div>
        </div>

        {/* WORLD CLASS AMENITIES — Not pre-selected, from /public/World Class Amenities */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 sm:p-8 space-y-4">
          <div className="flex items-center justify-between border-b pb-2">
            <h2 className="text-lg font-bold text-[#1A1800]">World Class Amenities</h2>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={selectAllWorldClass}
                className="text-xs font-bold px-3 py-1.5 bg-[#C9A227] text-[#1A1800] rounded-lg hover:bg-[#B8860B] transition-colors"
              >
                Select All
              </button>
              <button
                type="button"
                onClick={clearAllWorldClass}
                className="text-xs font-bold px-3 py-1.5 bg-gray-100 text-gray-600 rounded-lg hover:bg-gray-200 transition-colors"
              >
                Clear All
              </button>
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
            {WORLD_CLASS_AMENITIES.map(amenity => {
              const imgPath = `/World Class Amenities/${amenity}.jpg`;
              const isChecked = formData.worldClassAmenities.includes(amenity);
              return (
                <label
                  key={amenity}
                  htmlFor={`wca-${amenity}`}
                  className={`flex items-center gap-3 p-3 rounded-xl border-2 cursor-pointer transition-all ${
                    isChecked ? 'border-[#C9A227] bg-[#FFFBEF]' : 'border-gray-100 bg-gray-50'
                  }`}
                >
                  <input
                    type="checkbox"
                    id={`wca-${amenity}`}
                    checked={isChecked}
                    onChange={() => handleWorldClassAmenityToggle(amenity)}
                    className="w-4 h-4 text-[#C9A227] rounded accent-[#C9A227] shrink-0"
                  />
                  <img
                    src={imgPath}
                    alt={amenity}
                    className="w-10 h-10 rounded-lg object-cover shrink-0 border border-gray-200"
                    onError={e => (e.currentTarget.style.display = 'none')}
                  />
                  <span className="text-xs font-semibold text-gray-700 leading-tight">{amenity}</span>
                </label>
              );
            })}
          </div>
        </div>

        {/* Project Highlights */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 sm:p-8 space-y-4">
          <h2 className="text-lg font-bold text-[#1A1800] border-b pb-2">Project Highlights</h2>
          
          <MediaUpload
            label="Highlights Section Background Image"
            description="Upload an image to display as the background for the highlights section on the property page. Displays in a luxury glass overlay."
            value={formData.highlightsImageUrl}
            onChange={(url) => setFormData(prev => ({ ...prev, highlightsImageUrl: url }))}
          />

          <div className="space-y-3 pt-2">
            <label className="block text-sm font-medium text-gray-700">Highlight Points</label>
            {formData.highlights.map((highlight, index) => (
            <div key={index} className="flex gap-4 items-center">
              <div className="flex-1">
                <input 
                  type="text" 
                  placeholder="Highlight Point (e.g. World Class Amenities)" 
                  value={highlight as unknown as string}
                  onChange={(e) => {
                    const newHighlights = [...formData.highlights];
                    newHighlights[index] = e.target.value as any;
                    setFormData({ ...formData, highlights: newHighlights });
                  }}
                  className="w-full border border-gray-300 rounded-lg p-2 outline-none"
                />
              </div>
              <button 
                type="button" 
                onClick={() => {
                  const newHighlights = formData.highlights.filter((_, i) => i !== index);
                  setFormData({ ...formData, highlights: newHighlights });
                }}
                className="p-2 text-red-500 hover:bg-red-50 rounded-lg"
              >
                <Trash2 size={20} />
              </button>
            </div>
          ))}
          </div>
          <button 
            type="button" 
            onClick={() => setFormData({ ...formData, highlights: [...formData.highlights, '' as any] })}
            className="flex items-center gap-2 text-[#C9A227] font-medium hover:text-[#B8860B] mt-2"
          >
            <Plus size={18} /> Add Highlight
          </button>
        </div>



        {/* Agent Info */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 sm:p-8 space-y-4">
          <h2 className="text-lg font-bold text-[#1A1800] border-b pb-2">Agent Information</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Agent Name</label>
              <input type="text" name="agent.name" required value={formData.agent.name} onChange={handleChange} className="w-full border border-gray-300 rounded-lg p-3 outline-none" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
              <input type="text" name="agent.phone" required value={formData.agent.phone} onChange={handleChange} className="w-full border border-gray-300 rounded-lg p-3 outline-none" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
              <input type="email" name="agent.email" required value={formData.agent.email} onChange={handleChange} className="w-full border border-gray-300 rounded-lg p-3 outline-none" />
            </div>
            <div className="md:col-span-3 pt-2">
              <MediaUpload
                label="Agent Photo"
                description="Upload agent's profile image."
                value={formData.agent.image || ''}
                onChange={(url) => setFormData(prev => ({ ...prev, agent: { ...prev.agent, image: url } }))}
              />
            </div>
          </div>
        </div>

        {/* SEO Control Panel & Meta Analyzer */}
        <SeoControlPanel 
          data={seoData}
          onChange={setSeoData}
          defaultTitle={formData.title}
          defaultExcerpt={formData.description.substring(0, 160)}
          defaultSlug={''} // Properties don't strictly use slugs yet, but can be passed empty
        />

        <div className="flex justify-end pt-4 pb-12">
          <button
            type="submit"
            disabled={loading}
            className="flex items-center gap-2 bg-[#C9A227] hover:bg-[#B8860B] text-[#1A1800] font-bold px-8 py-3 rounded-lg transition-colors shadow-sm disabled:opacity-70"
          >
            <Save size={20} />
            {loading ? 'Saving...' : 'Save Property to Database'}
          </button>
        </div>
      </form>
    </div>
  );
}
