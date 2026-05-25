import { Plus, Edit, Trash2 } from 'lucide-react';
import Link from 'next/link';
import { connectDB } from '@/lib/mongodb';
import Property from '@/models/Property';

export const dynamic = 'force-dynamic';

export default async function AdminProperties() {
  let properties: any[] = [];
  let dbError = false;

  try {
    await connectDB();
    properties = await Property.find({}).sort('-createdAt').lean();
  } catch (error) {
    console.error("MongoDB Connection Error:", error);
    dbError = true;
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[#1A1800]">Properties</h1>
          <p className="text-sm text-gray-500 mt-1">Manage your premium property listings</p>
        </div>
        <Link 
          href="/admin/properties/new" 
          className="flex items-center gap-2 bg-[#C9A227] hover:bg-[#B8860B] text-[#1A1800] font-bold px-4 py-2 rounded-lg transition-colors shadow-sm"
        >
          <Plus size={20} />
          <span>Add Property</span>
        </Link>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        {dbError && (
          <div className="bg-red-50 p-4 border-b border-red-100 flex items-center gap-2 text-red-700 text-sm">
            <strong>Database Error:</strong> Could not connect to MongoDB. Please check if your current IP address is whitelisted in your Atlas cluster.
          </div>
        )}
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
              {properties.length === 0 ? (
                <tr>
                  <td colSpan={5} className="p-8 text-center text-gray-500">
                    <p>No properties found.</p>
                    <p className="text-sm mt-2">Click "Add Property" to create one.</p>
                  </td>
                </tr>
              ) : (
                properties.map((prop: any) => (
                  <tr key={prop._id.toString()} className="hover:bg-gray-50/50 transition-colors">
                    <td className="p-4">
                      <p className="font-bold text-[#1A1800]">{prop.title}</p>
                      <p className="text-sm text-gray-500">{prop.location?.city || 'No city'}</p>
                    </td>
                    <td className="p-4">
                      <span className="capitalize text-sm font-medium text-gray-700 bg-gray-100 px-2 py-1 rounded-md">
                        {prop.propertyType}
                      </span>
                    </td>
                    <td className="p-4 font-medium text-[#1A1800]">
                      ₹{prop.price?.toLocaleString() || 'N/A'}
                    </td>
                    <td className="p-4">
                      <span className={`capitalize text-xs font-bold px-2 py-1 rounded-full ${
                        prop.status === 'available' ? 'bg-green-100 text-green-700' :
                        prop.status === 'sold' ? 'bg-red-100 text-red-700' :
                        'bg-gray-100 text-gray-700'
                      }`}>
                        {prop.status || 'available'}
                      </span>
                    </td>
                    <td className="p-4 text-right space-x-2">
                      <button className="p-2 text-gray-400 hover:text-[#C9A227] transition-colors rounded-lg hover:bg-gray-100">
                        <Edit size={18} />
                      </button>
                      <button className="p-2 text-gray-400 hover:text-red-600 transition-colors rounded-lg hover:bg-red-50">
                        <Trash2 size={18} />
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
