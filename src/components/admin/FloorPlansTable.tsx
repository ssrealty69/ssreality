'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Search, Plus, Trash2, ExternalLink, Edit, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';

interface PropertyFloorPlanData {
  _id: string;
  title: string;
  location: {
    address: string;
    city: string;
  };
  propertyType: string;
  hasFloorPlan: boolean;
  floorPlanInfo: {
    totalFloors: number;
    totalUnits: number;
    soldUnits: number;
    reservedUnits: number;
    availableUnits: number;
    isPlotLayout?: boolean;
  } | null;
}

export default function FloorPlansTable({ 
  initialProperties 
}: { 
  initialProperties: PropertyFloorPlanData[] 
}) {
  const [properties, setProperties] = useState<PropertyFloorPlanData[]>(initialProperties);
  const [searchQuery, setSearchQuery] = useState('');
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const filteredProperties = properties.filter(prop => 
    prop.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    prop.location.city.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleDeletePlan = async (propertyId: string) => {
    if (!confirm('Are you sure you want to clear/delete the floor plan configuration for this property?')) {
      return;
    }

    const prop = properties.find(p => p._id === propertyId);
    const isPlot = prop?.propertyType?.toLowerCase() === 'plot';
    const endpoint = isPlot ? `/api/admin/plot-plans/${propertyId}` : `/api/admin/floor-plans/${propertyId}`;

    setDeletingId(propertyId);
    try {
      const res = await fetch(endpoint, {
        method: 'DELETE',
      });

      if (res.ok) {
        toast.success('Floor plan cleared successfully');
        setProperties(prev => prev.map(p => {
          if (p._id === propertyId) {
            return { ...p, hasFloorPlan: false, floorPlanInfo: null };
          }
          return p;
        }));
      } else {
        toast.error('Failed to clear floor plan');
      }
    } catch (err) {
      toast.error('An error occurred');
      console.error(err);
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="space-y-4">
      {/* Search Bar */}
      <div className="relative max-w-md">
        <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
          <Search className="h-5 w-5 text-gray-400" />
        </div>
        <input
          type="text"
          placeholder="Search by property title or city..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl focus:outline-none focus:border-[#C9A227] focus:ring-1 focus:ring-[#C9A227] transition-all text-sm text-gray-800"
        />
      </div>

      {/* Main Container */}
      <div className="bg-white border border-gray-100 rounded-2xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-left">
            <thead>
              <tr className="bg-[#1A1800]/5 border-b border-gray-100">
                <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-gray-600">Property Details</th>
                <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-gray-600">Location</th>
                <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-gray-600">Type</th>
                <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-gray-600">Configuration Status</th>
                <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-gray-600 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredProperties.length === 0 ? (
                <tr>
                  <td colSpan={5} className="text-center py-10 text-gray-500">
                    No properties found matching your search.
                  </td>
                </tr>
              ) : (
                filteredProperties.map((prop) => (
                  <tr key={prop._id} className="hover:bg-gray-50/50 transition-colors">
                    {/* Name */}
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="font-semibold text-gray-800 text-sm">{prop.title}</div>
                    </td>

                    {/* City */}
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                      {prop.location.city}
                    </td>

                    {/* Type */}
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800 capitalize">
                        {prop.propertyType}
                      </span>
                    </td>

                    {/* Status badges */}
                    <td className="px-6 py-4 whitespace-nowrap">
                      {prop.hasFloorPlan && prop.floorPlanInfo ? (
                        <div className="space-y-1">
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-100">
                            <CheckCircle2 size={12} />
                            {prop.floorPlanInfo.isPlotLayout ? (
                              `Configured (${prop.floorPlanInfo.totalFloors} Blocks)`
                            ) : (
                              `Configured (${prop.floorPlanInfo.totalFloors} Floors)`
                            )}
                          </span>
                          <div className="text-[10px] text-gray-500 flex gap-2">
                            <span>Total: <strong>{prop.floorPlanInfo.totalUnits}</strong></span>
                            <span className="text-emerald-600">Available: <strong>{prop.floorPlanInfo.availableUnits}</strong></span>
                            <span className="text-red-500">Sold: <strong>{prop.floorPlanInfo.soldUnits}</strong></span>
                          </div>
                        </div>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-amber-50 text-amber-700 border border-amber-100">
                          <AlertCircle size={12} />
                          Not Configured
                        </span>
                      )}
                    </td>

                    {/* Actions */}
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex items-center justify-end gap-2">
                        {prop.hasFloorPlan ? (
                          <>
                            <Link
                              href={`/floor-plans/${prop._id}`}
                              target="_blank"
                              className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                              title="View Client Shared Link"
                            >
                              <ExternalLink size={18} />
                            </Link>
                            <Link
                              href={prop.propertyType === 'plot'
                                ? `/admin/floor-plans/configure-plot/${prop._id}`
                                : `/admin/floor-plans/configure/${prop._id}`
                              }
                              className="p-2 text-amber-600 hover:bg-amber-50 rounded-lg transition-colors"
                              title="Edit Layout"
                            >
                              <Edit size={18} />
                            </Link>
                            <button
                              onClick={() => handleDeletePlan(prop._id)}
                              disabled={deletingId === prop._id}
                              className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50"
                              title="Clear Configuration"
                            >
                              {deletingId === prop._id ? (
                                <Loader2 size={18} className="animate-spin" />
                              ) : (
                                <Trash2 size={18} />
                              )}
                            </button>
                          </>
                        ) : (
                          <Link
                            href={prop.propertyType === 'plot'
                              ? `/admin/floor-plans/configure-plot/${prop._id}`
                              : `/admin/floor-plans/configure/${prop._id}`
                            }
                            className="flex items-center gap-1.5 bg-[#C9A227] hover:bg-[#B8860B] text-[#1A1800] font-bold px-3 py-1.5 rounded-lg text-xs transition-colors"
                          >
                            <Plus size={14} />
                            <span>Configure</span>
                          </Link>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
