import { connectDB } from '@/lib/mongodb';
import Property from '@/models/Property';
import { FALLBACK_PROPERTIES } from '@/constants/properties';
import DeliveredLandmarksClient from '@/components/admin/DeliveredLandmarksClient';

export const dynamic = 'force-dynamic';

export default async function AdminDeliveredLandmarks() {
  let properties: any[] = [];
  let dbError = false;

  try {
    await connectDB();
    const rawProperties = await Property.find({ status: 'delivered' }).sort('-createdAt').lean();
    properties = JSON.parse(JSON.stringify(rawProperties));
  } catch (error) {
    console.error("MongoDB Connection Error on Delivered Landmarks Admin:", error);
    dbError = true;
  }
  
  // Fallback to demo properties when MongoDB connection fails or database is empty
  if (dbError || properties.length === 0) {
    properties = FALLBACK_PROPERTIES.filter(p => p.status === 'delivered').map(p => ({
      ...p,
      _id: p._id.toString(),
      createdAt: p.createdAt || new Date().toISOString(),
      updatedAt: p.updatedAt || new Date().toISOString(),
    }));
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-[#1A1800]">Delivered Landmarks Manager</h1>
        <p className="text-sm text-gray-500 mt-1">Manage completed property showcases, highlight points, and circular medallion image layouts.</p>
      </div>

      {dbError && (
        <div className="bg-red-50 p-4 border border-red-100 rounded-2xl flex items-center gap-2 text-red-700 text-sm">
          <strong>Database Error:</strong> Could not connect to MongoDB. Fallback properties are active for testing.
        </div>
      )}

      <DeliveredLandmarksClient initialProperties={properties} />
    </div>
  );
}
