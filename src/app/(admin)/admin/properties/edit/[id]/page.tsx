'use client';

import { useState, useEffect, use } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Save, Plus, Trash2, Loader2 } from 'lucide-react';
import Link from 'next/link';
import toast from 'react-hot-toast';
import { MediaUpload, PdfUpload, MultiImageUpload } from '@/components/admin/MediaUpload';
import { SeoControlPanel } from '@/components/admin/SeoControlPanel';

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

interface EditPropertyProps {
  params: Promise<{ id: string }>;
}

export default function EditProperty({ params }: EditPropertyProps) {
  const router = useRouter();
  const { id } = use(params);
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  
  const [formData, setFormData] = useState({
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
    },
    features: {
      area: '',
      areaUnit: 'sqft',
      bedrooms: '',
      bathrooms: '',
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
    },
    amenities: [] as string[],
    worldClassAmenities: [] as string[],
    images: [''] as string[], // Only banner image remains here (as images[0])
    interiorImages: [] as string[],
    galleryImages: [] as string[],
    videoUrl: '',
    brochureUrl: '',
    googleMapsUrl: '',
    highlights: [''],
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

  // Fetch initial data
  useEffect(() => {
    async function loadProperty() {
      try {
        const res = await fetch(`/api/admin/properties/${id}`);
        if (!res.ok) {
          toast.error('Property not found');
          router.push('/admin/properties');
          return;
        }
        const json = await res.json();
        if (json.success && json.data) {
          const prop = json.data;
          
          // Pre-populate state while ensuring all structures exist
          setFormData({
            title: prop.title || '',
            description: prop.description || '',
            price: prop.price !== undefined ? prop.price.toString() : '',
            priceType: prop.priceType || 'sale',
            propertyType: prop.propertyType || 'apartment',
            status: prop.status || 'available',
            location: {
              address: prop.location?.address || '',
              city: prop.location?.city || '',
              state: prop.location?.state || '',
            },
            features: {
              area: prop.features?.area !== undefined ? prop.features.area.toString() : '',
              areaUnit: prop.features?.areaUnit || 'sqft',
              bedrooms: prop.features?.bedrooms !== undefined && prop.features?.bedrooms !== null ? prop.features.bedrooms.toString() : '',
              bathrooms: prop.features?.bathrooms !== undefined && prop.features?.bathrooms !== null ? prop.features.bathrooms.toString() : '',
              parking: prop.features?.parking || false,
              furnished: prop.features?.furnished || false,
              floor: prop.features?.floor !== undefined && prop.features?.floor !== null ? prop.features.floor.toString() : '',
              totalFloors: prop.features?.totalFloors !== undefined && prop.features?.totalFloors !== null ? prop.features.totalFloors.toString() : '',
              towers: prop.features?.towers !== undefined && prop.features?.towers !== null ? prop.features.towers.toString() : '',
              totalUnits: prop.features?.totalUnits !== undefined && prop.features?.totalUnits !== null ? prop.features.totalUnits.toString() : '',
              reraApproved: prop.features?.reraApproved || false
            },
            agent: {
              name: prop.agent?.name || '',
              phone: prop.agent?.phone || '',
              email: prop.agent?.email || '',
            },
            amenities: prop.amenities || [],
            worldClassAmenities: prop.worldClassAmenities || [],
            images: prop.images && prop.images.length > 0 ? [prop.images[0]] : [''],
            interiorImages: prop.interiorImages && prop.interiorImages.length > 0
              ? prop.interiorImages
              : (prop.images && prop.images.length > 1 ? [prop.images[1]] : []),
            galleryImages: prop.galleryImages && prop.galleryImages.length > 0
              ? prop.galleryImages
              : (prop.images && prop.images.length > 2 ? prop.images.slice(2) : []),
            videoUrl: prop.videoUrl || '',
            brochureUrl: prop.brochureUrl || '',
            googleMapsUrl: prop.googleMapsUrl || '',
            highlights: prop.highlights && prop.highlights.length > 0 
              ? prop.highlights.map((h: any) => typeof h === 'string' ? h : h.title || '') 
              : [''],
            nearby: prop.nearby && prop.nearby.length > 0 ? prop.nearby : [{ type: 'landmark', name: '', distance: '' }],
            featured: prop.featured || false
          });
          
          if (prop.seo) {
            setSeoData({
              title: prop.seo.title || '',
              description: prop.seo.description || '',
              keywords: prop.seo.keywords || '',
              focusKeyword: prop.seo.focusKeyword || '',
              canonicalUrl: prop.seo.canonicalUrl || '',
            });
          }
        }
      } catch (error) {
        toast.error('Failed to load property');
      } finally {
        setFetching(false);
      }
    }
    loadProperty();
  }, [id, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Clean up empty dynamic fields before sending
      const payload = {
        ...formData,
        images: formData.images.filter(img => img.trim() !== ''),
        interiorImages: formData.interiorImages.filter(img => img.trim() !== ''),
        galleryImages: formData.galleryImages.filter(img => img.trim() !== ''),
        highlights: formData.highlights.filter(h => typeof h === 'string' && h.trim() !== ''),
        nearby: formData.nearby.filter(n => n.name.trim() !== '' && n.distance.trim() !== ''),
        features: {
          ...formData.features,
          bedrooms: formData.features.bedrooms ? parseInt(formData.features.bedrooms as string) : undefined,
          bathrooms: formData.features.bathrooms ? parseInt(formData.features.bathrooms as string) : undefined,
          floor: formData.features.floor ? parseInt(formData.features.floor as string) : undefined,
          totalFloors: formData.features.totalFloors ? parseInt(formData.features.totalFloors as string) : undefined,
          towers: formData.features.towers ? parseInt(formData.features.towers as string) : undefined,
          totalUnits: formData.features.totalUnits ? parseInt(formData.features.totalUnits as string) : undefined,
        },
        seo: seoData
      };

      const res = await fetch(`/api/admin/properties/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (res.ok) {
        toast.success('Property updated successfully!');
        router.push('/admin/properties');
        router.refresh();
      } else {
        const errorData = await res.json();
        toast.error(errorData.error || 'Failed to update property');
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

  if (fetching) {
    return (
      <div className="min-h-[50vh] flex flex-col items-center justify-center gap-4">
        <Loader2 className="animate-spin text-[#C9A227]" size={40} />
        <p className="text-gray-500 font-medium">Fetching property details...</p>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/admin/properties" className="p-2 hover:bg-gray-100 rounded-full transition-colors">
          <ArrowLeft size={24} className="text-gray-600" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-[#1A1800]">Edit Property</h1>
          <p className="text-sm text-gray-500">Update property listing details</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        
        {/* Basic Details */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 sm:p-8 space-y-4">
          <h2 className="text-lg font-bold text-[#1A1800] border-b pb-2">Basic Details</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
              <input type="text" name="title" required value={formData.title} onChange={handleChange} className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-[#C9A227] outline-none" placeholder="e.g. Luxury 4BHK Villa in Noida" />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
              <textarea name="description" required rows={4} value={formData.description} onChange={handleChange} className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-[#C9A227] outline-none" placeholder="Property description..."></textarea>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Price</label>
              <input type="number" name="price" required value={formData.price} onChange={handleChange} className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-[#C9A227] outline-none" />
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
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 sm:p-8 space-y-4">
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
              <label className="block text-sm font-medium text-gray-700 mb-1">Area</label>
              <input type="number" name="features.area" required value={formData.features.area} onChange={handleChange} className="w-full border border-gray-300 rounded-lg p-3 outline-none" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Bedrooms</label>
              <input type="number" name="features.bedrooms" value={formData.features.bedrooms} onChange={handleChange} className="w-full border border-gray-300 rounded-lg p-3 outline-none" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Bathrooms</label>
              <input type="number" name="features.bathrooms" value={formData.features.bathrooms} onChange={handleChange} className="w-full border border-gray-300 rounded-lg p-3 outline-none" />
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
          {formData.nearby.map((place, index) => (
            <div key={index} className="flex gap-4 items-start">
              <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-2">
                <input 
                  type="text" 
                  placeholder="Distance (e.g. 6.8 Km)" 
                  value={place.distance}
                  onChange={(e) => {
                    const newNearby = [...formData.nearby];
                    newNearby[index].distance = e.target.value;
                    setFormData({ ...formData, nearby: newNearby });
                  }}
                  className="w-full border border-gray-300 rounded-lg p-2 outline-none"
                />
                <input 
                  type="text" 
                  placeholder="Place Name (e.g. Gurugram University)" 
                  value={place.name}
                  onChange={(e) => {
                    const newNearby = [...formData.nearby];
                    newNearby[index].name = e.target.value;
                    setFormData({ ...formData, nearby: newNearby });
                  }}
                  className="w-full border border-gray-300 rounded-lg p-2 outline-none"
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
              const imgPath = `/Project Amenities/${amenity}.jpg`;
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
          <button 
            type="button" 
            onClick={() => setFormData({ ...formData, highlights: [...formData.highlights, '' as any] })}
            className="flex items-center gap-2 text-[#C9A227] font-medium hover:text-[#B8860B]"
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
          </div>
        </div>

        {/* SEO Control Panel & Meta Analyzer */}
        <SeoControlPanel 
          data={seoData}
          onChange={setSeoData}
          defaultTitle={formData.title}
          defaultExcerpt={formData.description.substring(0, 160)}
          defaultSlug={''} // Properties don't strictly use slugs yet
        />

        <div className="flex justify-end pt-4 pb-12">
          <button
            type="submit"
            disabled={loading}
            className="flex items-center gap-2 bg-[#C9A227] hover:bg-[#B8860B] text-[#1A1800] font-bold px-8 py-3 rounded-lg transition-colors shadow-sm disabled:opacity-70"
          >
            <Save size={20} />
            {loading ? 'Saving Changes...' : 'Save Changes'}
          </button>
        </div>
      </form>
    </div>
  );
}
