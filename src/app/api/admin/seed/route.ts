import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import Property from '@/models/Property';
import Blog from '@/models/Blog';
import { FALLBACK_PROPERTIES } from '@/constants/properties';
import { FALLBACK_BLOGS } from '@/lib/blogs';
import { invalidateCache } from '@/lib/redis';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    await connectDB();

    // 1. Clear existing dummy data (optional, but good for a clean seed)
    await Property.deleteMany({});
    await Blog.deleteMany({});

    // 2. Insert Properties
    // We modify FALLBACK_PROPERTIES slightly to fit the new schema fields
    const propertiesToInsert = FALLBACK_PROPERTIES.map(p => {
      const propData: any = { ...p };
      delete propData._id; // Let MongoDB auto-generate _ids
      
      // Add dummy deep data
      propData.features.towers = Math.floor(Math.random() * 10) + 1;
      propData.features.totalUnits = Math.floor(Math.random() * 500) + 50;
      propData.features.reraApproved = Math.random() > 0.5;
      propData.videoUrl = "https://www.youtube.com/watch?v=M-j_LvEK2ZA";
      
      propData.highlights = [
        { title: "Premium Location", description: "Located in the heart of the city with excellent connectivity." },
        { title: "World Class Amenities", description: "Enjoy a lifestyle of luxury with our state-of-the-art facilities." }
      ];
      
      propData.nearby = [
        { type: "landmark", name: "City Center Mall", distance: "2.5 Km" },
        { type: "landmark", name: "International Airport", distance: "15 Km" },
        { type: "landmark", name: "Metro Station", distance: "1.2 Km" }
      ];

      return propData;
    });

    await Property.insertMany(propertiesToInsert);

    // 3. Insert Blogs from FALLBACK_BLOGS
    const blogsToInsert = FALLBACK_BLOGS.map(b => {
      const blogData = { ...b };
      delete blogData._id; // Let MongoDB auto-generate _ids
      return blogData;
    });

    await Blog.insertMany(blogsToInsert);

    // 4. Invalidate Cache
    try {
      await invalidateCache('blogs:v2:*');
      await invalidateCache('blog:*');
      await invalidateCache('properties:*');
      await invalidateCache('property:*');
    } catch (cacheError) {
      console.warn("Failed to invalidate cache during seed:", cacheError);
    }

    return NextResponse.json({ success: true, message: 'Database successfully seeded with dummy data!' });
  } catch (error: any) {
    console.error("Seed Error:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

