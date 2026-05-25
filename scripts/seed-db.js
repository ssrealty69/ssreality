const mongoose = require('mongoose');
const fs = require('fs');

const envContent = fs.readFileSync('.env.local', 'utf8');
const match = envContent.match(/^MONGODB_URI=(.*)$/m);
if (!match) {
  console.error("MONGODB_URI not found in .env.local");
  process.exit(1);
}
const uri = match[1].trim().replace(/^"|"$/g, '').replace(/^'|'$/g, '');

const PropertySchema = new mongoose.Schema({
  title: String, description: String, price: Number, priceType: String,
  propertyType: String, status: String,
  location: { address: String, city: String, state: String, pincode: String },
  features: { bedrooms: Number, bathrooms: Number, area: Number, areaUnit: String, parking: Boolean, furnished: Boolean, floor: Number, totalFloors: Number, towers: Number, totalUnits: Number, reraApproved: Boolean },
  images: [String], videoUrl: String, brochureUrl: String, featured: Boolean, amenities: [String],
  agent: { name: String, phone: String, email: String },
  highlights: [{ title: String, description: String }],
  nearby: [{ type: { type: String }, name: String, distance: String }]
}, { timestamps: true });

const Property = mongoose.models.Property || mongoose.model('Property', PropertySchema);

const FALLBACK_PROPERTIES = [
  {
    title: 'Arch Premium Apartment', description: 'Modern 3 BHK apartment with all amenities and great connectivity.',
    price: 12500000, priceType: 'sale', propertyType: 'apartment', status: 'available',
    location: { address: 'Sector 63', city: 'Noida', state: 'Uttar Pradesh', pincode: '201301' },
    features: { bedrooms: 3, bathrooms: 3, area: 1850, areaUnit: 'sqft', parking: true, furnished: false },
    images: ['https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=800&q=80', 'https://images.unsplash.com/photo-1460317442991-0ec209397118?auto=format&fit=crop&w=800&q=80'],
    featured: true, amenities: ['Gym', 'Swimming Pool', 'Power Backup', '24x7 Security'],
  },
  {
    title: 'Nivasa Spaces in Greater Noida', description: 'Beautiful 4 BHK villa with private garden and modern interiors.',
    price: 35000000, priceType: 'sale', propertyType: 'villa', status: 'available',
    location: { address: 'Knowledge Park', city: 'Greater Noida', state: 'Uttar Pradesh', pincode: '201310' },
    features: { bedrooms: 4, bathrooms: 4, area: 3200, areaUnit: 'sqft', parking: true, furnished: true },
    images: ['https://images.unsplash.com/photo-1613977257363-707ba9348227?auto=format&fit=crop&w=800&q=80'],
    featured: true, amenities: ['Private Garden', 'Clubhouse', 'Gym', 'Parking'],
  },
  {
    title: 'Modern Office in Sector 62', description: 'Premium office space in a prime commercial hub.',
    price: 8500000, priceType: 'sale', propertyType: 'commercial', status: 'available',
    location: { address: 'Sector 62', city: 'Noida', state: 'Uttar Pradesh', pincode: '201309' },
    features: { area: 1200, areaUnit: 'sqft', parking: true },
    images: ['https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=800&q=80'],
    featured: false, amenities: ['Power Backup', 'Security', 'Lift', 'Parking'],
  },
  {
    title: 'Apartment near Yamuna Expressway', description: 'Affordable 2 BHK apartment in a growing residential area.',
    price: 4500000, priceType: 'sale', propertyType: 'apartment', status: 'available',
    location: { address: 'Yamuna Expressway', city: 'Greater Noida', state: 'Uttar Pradesh', pincode: '201301' },
    features: { bedrooms: 2, bathrooms: 2, area: 1150, areaUnit: 'sqft', parking: true },
    images: ['https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=800&q=80'],
    featured: true, amenities: ['Play Area', 'Garden', 'Security', 'Water Supply'],
  },
  {
    title: 'Residential Plot in Jewar', description: 'Investment opportunity near the upcoming Noida International Airport.',
    price: 1800000, priceType: 'sale', propertyType: 'plot', status: 'available',
    location: { address: 'Jewar Toll Plaza', city: 'Jewar', state: 'Uttar Pradesh', pincode: '203135' },
    features: { area: 150, areaUnit: 'sqyd', parking: false },
    images: ['https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&w=800&q=80'],
    featured: true, amenities: ['Gated Community', 'Upcoming Metro', 'Near Airport', '24x7 Security'],
  }
];

async function seed() {
  try {
    await mongoose.connect(uri);
    console.log("Connected successfully. Seeding...");

    await Property.deleteMany({});
    
    const propertiesToInsert = FALLBACK_PROPERTIES.map(p => {
      const propData = { ...p };
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
        { type: "landmark", name: "International Airport", distance: "15 Km" }
      ];
      return propData;
    });

    await Property.insertMany(propertiesToInsert);
    console.log("Seeding complete! Properties inserted.");
    process.exit(0);
  } catch (err) {
    console.error("Seeding failed:", err);
    process.exit(1);
  }
}

seed();
