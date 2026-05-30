'use client';

import { useState } from 'react';
import { Edit, Trash2, Search, Loader2 } from 'lucide-react';
import Link from 'next/link';
import toast from 'react-hot-toast';

interface PropertiesTableProps {
  initialProperties: any[];
}

export default function PropertiesTable({ initialProperties }: PropertiesTableProps) {
  const [properties, setProperties] = useState(initialProperties);
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [deletingId, setDeletingId] = useState<string | null>(null);

  // Filter properties
  const filteredProperties = properties.filter((prop) => {
    const matchesSearch =
      prop.title.toLowerCase().includes(search.toLowerCase()) ||
      (prop.location?.city || '').toLowerCase().includes(search.toLowerCase());
    const matchesType = typeFilter ? prop.propertyType === typeFilter : true;
    const matchesStatus = statusFilter ? prop.status === statusFilter : true;
    return matchesSearch && matchesType && matchesStatus;
  });

  // Handle One-Click Toggle for Delivered
  const handleToggleDelivered = async (id: string, newStatus: string) => {
    try {
      const res = await fetch(`/api/admin/properties/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });

      if (res.ok) {
        setProperties((prev) =>
          prev.map((p) => (p._id.toString() === id ? { ...p, status: newStatus } : p))
        );
        toast.success(`Property updated as ${newStatus === 'delivered' ? 'Delivered' : 'Available'}!`);
      } else {
        const err = await res.json();
        toast.error(err.error || 'Failed to update property status');
      }
    } catch (error) {
      toast.error('An error occurred while updating status');
    }
  };

  // Handle Delete
  const handleDelete = async (id: string, title: string) => {
    if (!confirm(`Are you sure you want to delete "${title}"?`)) return;

    setDeletingId(id);
    try {
      const res = await fetch(`/api/admin/properties/${id}`, {
        method: 'DELETE',
      });

      if (res.ok) {
        setProperties((prev) => prev.filter((p) => p._id.toString() !== id));
        toast.success('Property deleted successfully!');
      } else {
        const err = await res.json();
        toast.error(err.error || 'Failed to delete property');
      }
    } catch (error) {
      toast.error('An error occurred during deletion');
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="space-y-4">
      {/* Filters & Search */}
      <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 flex flex-col md:flex-row gap-4 items-center justify-between">
        <div className="relative w-full md:w-80">
          <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-gray-400" />
          </span>
          <input
            type="text"
            placeholder="Search by title or city..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-gray-50 border border-gray-200 rounded-xl py-2 pl-10 pr-4 text-sm focus:outline-none focus:border-[#C9A227] focus:ring-1 focus:ring-[#C9A227] transition-all"
          />
        </div>

        <div className="flex flex-wrap gap-2 w-full md:w-auto">
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="bg-gray-50 border border-gray-200 rounded-xl py-2 px-3 text-sm focus:outline-none focus:border-[#C9A227] focus:ring-1 focus:ring-[#C9A227] transition-all"
          >
            <option value="">All Types</option>
            <option value="apartment">Apartment</option>
            <option value="villa">Villa</option>
            <option value="plot">Plot</option>
            <option value="commercial">Commercial</option>
            <option value="floor">Floor</option>
          </select>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-gray-50 border border-gray-200 rounded-xl py-2 px-3 text-sm focus:outline-none focus:border-[#C9A227] focus:ring-1 focus:ring-[#C9A227] transition-all"
          >
            <option value="">All Status</option>
            <option value="available">Available</option>
            <option value="sold">Sold</option>
          </select>
        </div>
      </div>

      {/* Table Card */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100">
                <th className="p-4 text-sm font-semibold text-gray-600">Property</th>
                <th className="p-4 text-sm font-semibold text-gray-600">Type</th>
                <th className="p-4 text-sm font-semibold text-gray-600">Price</th>
                <th className="p-4 text-sm font-semibold text-gray-600">Status</th>
                <th className="p-4 text-sm font-semibold text-gray-600 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredProperties.length === 0 ? (
                <tr>
                  <td colSpan={5} className="p-8 text-center text-gray-500">
                    <p className="font-medium text-gray-700">No properties found</p>
                    <p className="text-sm mt-1">Try resetting your search filters or click "Add Property" to list a new one.</p>
                  </td>
                </tr>
              ) : (
                filteredProperties.map((prop: any) => (
                  <tr key={prop._id.toString()} className="hover:bg-gray-50/50 transition-colors">
                    <td className="p-4">
                      <p className="font-bold text-[#1A1800]">{prop.title}</p>
                      <p className="text-sm text-gray-500">{prop.location?.city || 'No city'}</p>
                    </td>
                    <td className="p-4">
                      <span className="capitalize text-xs font-semibold text-gray-700 bg-gray-100 px-2 py-1 rounded-md">
                        {prop.propertyType}
                      </span>
                    </td>
                    <td className="p-4 font-semibold text-[#1A1800]">
                      ₹{prop.price?.toLocaleString('en-IN') || 'N/A'}
                    </td>
                    <td className="p-4">
                      <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                        <span className={`capitalize text-xs font-bold px-2 py-1 rounded-full w-fit ${
                          prop.status === 'available' ? 'bg-green-100 text-green-700' :
                          prop.status === 'sold' ? 'bg-red-100 text-red-700' :
                          prop.status === 'delivered' ? 'bg-blue-100 text-blue-700' :
                          'bg-gray-100 text-gray-700'
                        }`}>
                          {prop.status || 'available'}
                        </span>
                        
                        {prop.status === 'delivered' ? (
                          <button
                            onClick={() => handleToggleDelivered(prop._id.toString(), 'available')}
                            className="text-[10px] bg-green-50 hover:bg-green-100 border border-green-200 text-green-700 font-extrabold px-1.5 py-0.5 rounded transition-all active:scale-[0.97] w-fit"
                            title="Restore as Available"
                          >
                            Set Available
                          </button>
                        ) : (
                          <button
                            onClick={() => handleToggleDelivered(prop._id.toString(), 'delivered')}
                            className="text-[10px] bg-blue-50 hover:bg-blue-100 border border-blue-200 text-blue-700 font-extrabold px-1.5 py-0.5 rounded transition-all active:scale-[0.97] w-fit"
                            title="Mark as Delivered"
                          >
                            Mark Delivered
                          </button>
                        )}
                      </div>
                    </td>
                    <td className="p-4 text-right space-x-1 sm:space-x-2">
                      <Link 
                        href={`/admin/properties/edit/${prop._id}`}
                        className="p-2 inline-block text-gray-400 hover:text-[#C9A227] transition-colors rounded-lg hover:bg-gray-100"
                        title="Edit Property"
                      >
                        <Edit size={18} />
                      </Link>
                      <button
                        onClick={() => handleDelete(prop._id.toString(), prop.title)}
                        disabled={deletingId === prop._id.toString()}
                        className="p-2 text-gray-400 hover:text-red-600 transition-colors rounded-lg hover:bg-red-50 disabled:opacity-50"
                        title="Delete Property"
                      >
                        {deletingId === prop._id.toString() ? (
                          <Loader2 size={18} className="animate-spin text-red-500" />
                        ) : (
                          <Trash2 size={18} />
                        )}
                      </button>
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
