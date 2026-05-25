'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Save, Plus, Trash2 } from 'lucide-react';
import Link from 'next/link';
import toast from 'react-hot-toast';

const PREDEFINED_AMENITIES = [
  'Gym', 'Cycling Track', 'Billiards', 'Table Tennis', 'Squash Court', 
  'Tennis Court', 'Open Dining', 'Cafe & Bar', 'Carrom', 'Chess', 
  'Cardroom', 'Library', 'Spa & Sauna', 'Badminton', 'Swimming Pool', 
  'Garden', '24x7 CCTV', 'Yoga & Meditation', 'Power Backup', 'Security', 'Lift', 'Clubhouse'
];

export default function AddProperty() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
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
    images: [''] as string[],
    videoUrl: '',
    highlights: [{ title: '', description: '' }],
    nearby: [{ type: 'landmark', name: '', distance: '' }],
    featured: false
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Clean up empty dynamic fields before sending
      const payload = {
        ...formData,
        images: formData.images.filter(img => img.trim() !== ''),
        highlights: formData.highlights.filter(h => h.title.trim() !== '' && h.description.trim() !== ''),
        nearby: formData.nearby.filter(n => n.name.trim() !== '' && n.distance.trim() !== ''),
        features: {
          ...formData.features,
          bedrooms: formData.features.bedrooms ? parseInt(formData.features.bedrooms as string) : undefined,
          bathrooms: formData.features.bathrooms ? parseInt(formData.features.bathrooms as string) : undefined,
          floor: formData.features.floor ? parseInt(formData.features.floor as string) : undefined,
          totalFloors: formData.features.totalFloors ? parseInt(formData.features.totalFloors as string) : undefined,
          towers: formData.features.towers ? parseInt(formData.features.towers as string) : undefined,
          totalUnits: formData.features.totalUnits ? parseInt(formData.features.totalUnits as string) : undefined,
        }
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

        {/* Media (Video URL) */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 sm:p-8 space-y-4">
          <h2 className="text-lg font-bold text-[#1A1800] border-b pb-2">Media URLs</h2>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">YouTube Video URL</label>
            <input type="url" name="videoUrl" value={formData.videoUrl} onChange={handleChange} className="w-full border border-gray-300 rounded-lg p-3 outline-none focus:ring-2 focus:ring-[#C9A227]" placeholder="e.g. https://www.youtube.com/watch?v=..." />
          </div>
        </div>

        {/* Location Advantage (Nearby) */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 sm:p-8 space-y-4">
          <h2 className="text-lg font-bold text-[#1A1800] border-b pb-2">Location Advantages (Nearby)</h2>
          {formData.nearby.map((place, index) => (
            <div key={index} className="flex gap-4 items-start">
              <div className="flex-1 grid grid-cols-2 gap-2">
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

        {/* Amenities Checklist */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 sm:p-8 space-y-4">
          <h2 className="text-lg font-bold text-[#1A1800] border-b pb-2">World Class Amenities</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            {PREDEFINED_AMENITIES.map(amenity => (
              <div key={amenity} className="flex items-center gap-2">
                <input 
                  type="checkbox" 
                  id={`amenity-${amenity}`}
                  checked={formData.amenities.includes(amenity)}
                  onChange={() => handleAmenityToggle(amenity)}
                  className="w-4 h-4 text-[#C9A227] rounded focus:ring-[#C9A227]"
                />
                <label htmlFor={`amenity-${amenity}`} className="text-sm text-gray-700 cursor-pointer">{amenity}</label>
              </div>
            ))}
          </div>
        </div>

        {/* Project Highlights */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 sm:p-8 space-y-4">
          <h2 className="text-lg font-bold text-[#1A1800] border-b pb-2">Project Highlights</h2>
          {formData.highlights.map((highlight, index) => (
            <div key={index} className="flex gap-4 items-start">
              <div className="flex-1 space-y-2">
                <input 
                  type="text" 
                  placeholder="Highlight Title (e.g. Finger Print Scanner)" 
                  value={highlight.title}
                  onChange={(e) => {
                    const newHighlights = [...formData.highlights];
                    newHighlights[index].title = e.target.value;
                    setFormData({ ...formData, highlights: newHighlights });
                  }}
                  className="w-full border border-gray-300 rounded-lg p-2 outline-none"
                />
                <textarea 
                  placeholder="Short Description" 
                  value={highlight.description}
                  onChange={(e) => {
                    const newHighlights = [...formData.highlights];
                    newHighlights[index].description = e.target.value;
                    setFormData({ ...formData, highlights: newHighlights });
                  }}
                  className="w-full border border-gray-300 rounded-lg p-2 outline-none"
                  rows={2}
                />
              </div>
              <button 
                type="button" 
                onClick={() => {
                  const newHighlights = formData.highlights.filter((_, i) => i !== index);
                  setFormData({ ...formData, highlights: newHighlights });
                }}
                className="p-2 text-red-500 hover:bg-red-50 rounded-lg mt-1"
              >
                <Trash2 size={20} />
              </button>
            </div>
          ))}
          <button 
            type="button" 
            onClick={() => setFormData({ ...formData, highlights: [...formData.highlights, { title: '', description: '' }] })}
            className="flex items-center gap-2 text-[#C9A227] font-medium hover:text-[#B8860B]"
          >
            <Plus size={18} /> Add Highlight
          </button>
        </div>

        {/* Image URLs */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 sm:p-8 space-y-4">
          <h2 className="text-lg font-bold text-[#1A1800] border-b pb-2">Property Images (URLs)</h2>
          {formData.images.map((url, index) => (
            <div key={index} className="flex gap-2">
              <input 
                type="text" 
                placeholder="https://example.com/image.jpg" 
                value={url}
                onChange={(e) => {
                  const newImages = [...formData.images];
                  newImages[index] = e.target.value;
                  setFormData({ ...formData, images: newImages });
                }}
                className="flex-1 border border-gray-300 rounded-lg p-3 outline-none"
              />
              <button 
                type="button" 
                onClick={() => {
                  const newImages = formData.images.filter((_, i) => i !== index);
                  setFormData({ ...formData, images: newImages });
                }}
                className="p-3 text-red-500 hover:bg-red-50 rounded-lg"
              >
                <Trash2 size={20} />
              </button>
            </div>
          ))}
          <button 
            type="button" 
            onClick={() => setFormData({ ...formData, images: [...formData.images, ''] })}
            className="flex items-center gap-2 text-[#C9A227] font-medium hover:text-[#B8860B]"
          >
            <Plus size={18} /> Add Image URL
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
