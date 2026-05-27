import { Plus } from 'lucide-react';
import Link from 'next/link';
import { connectDB } from '@/lib/mongodb';
import Property from '@/models/Property';
import PropertiesTable from '@/components/admin/PropertiesTable';
import { FALLBACK_PROPERTIES } from '@/constants/properties';

export const dynamic = 'force-dynamic';

export default async function AdminProperties() {
  let properties: any[] = [];
  let dbError = false;

  try {
    await connectDB();
    // Serialize MongoDB documents so they can be passed safely as plain objects to client components
    const rawProperties = await Property.find({}).sort('-createdAt').lean();
    properties = JSON.parse(JSON.stringify(rawProperties));
  } catch (error) {
    console.error("MongoDB Connection Error:", error);
    dbError = true;
  }

  // Fallback to demo properties when MongoDB connection fails so local testing works seamlessly
  if (dbError || properties.length === 0) {
    properties = FALLBACK_PROPERTIES.map(p => ({
      ...p,
      _id: p._id.toString(),
      createdAt: p.createdAt || new Date().toISOString(),
      updatedAt: p.updatedAt || new Date().toISOString(),
    }));
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

      {dbError && (
        <div className="bg-red-50 p-4 border border-red-100 rounded-2xl flex items-center gap-2 text-red-700 text-sm">
          <strong>Database Error:</strong> Could not connect to MongoDB. Please check if your current IP address is whitelisted in your Atlas cluster.
        </div>
      )}

      <PropertiesTable initialProperties={properties} />
    </div>
  );
}
