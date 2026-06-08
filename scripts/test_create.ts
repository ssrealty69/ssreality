import mongoose from 'mongoose';
import Property from '../src/models/Property';
import dotenv from 'dotenv';
import path from 'path';

// Load env variables
dotenv.config({ path: path.resolve(__dirname, '../.env.local') });

async function test() {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    console.error("No MONGODB_URI in env");
    process.exit(1);
  }

  console.log("Connecting to MongoDB...");
  await mongoose.connect(uri, {
    dbName: process.env.MONGODB_DB || 'SSRealty'
  });
  console.log("Connected.");

  try {
    const dummyPayload = {
      title: "Test Property",
      description: "Test description",
      price: 5000000,
      priceType: "sale",
      propertyType: "apartment",
      status: "available",
      location: {
        address: "Test Address",
        city: "Gurugram",
        state: "Haryana"
      },
      features: {
        area: 250,
        areaUnit: "sqyd",
        bedrooms: 3,
        bathrooms: 3,
        registryAvailable: true,
        parking: true,
        furnished: true,
        floor: 1,
        totalFloors: 4,
        towers: 1,
        totalUnits: 4,
        reraApproved: true
      },
      agent: {
        name: "Agent Name",
        phone: "9999999999",
        email: "agent@test.com"
      },
      amenities: ["CAR PARKING", "WATER PURIFIER RO"],
      worldClassAmenities: ["Clubhouse", "Gym"],
      priceList: [
        { type: "3BHK", size: "250 Sq. Yd.", price: "₹2.5 Cr", negotiable: true }
      ],
      highlights: ["Point 1", "Point 2"],
      nearby: [
        { type: "landmark", name: "Metro Station", distance: "5 mins" }
      ],
      mobileBannerUrl: "https://example.com/mobile.jpg",
      images: ["https://example.com/desktop.jpg"]
    };

    console.log("Attempting to create property...");
    const res = await Property.create(dummyPayload);
    console.log("Property created successfully:", res._id);
    
    // Clean it up immediately
    await Property.findByIdAndDelete(res._id);
    console.log("Cleaned up test property.");
  } catch (error: any) {
    console.error("Error creating property:", error);
  } finally {
    await mongoose.disconnect();
    console.log("Disconnected.");
  }
}

test();
