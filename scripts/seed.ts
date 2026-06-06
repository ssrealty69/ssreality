/**
 * Database Seed Script
 * Run: npx tsx scripts/seed.ts
 * Seeds sample properties and blog posts into MongoDB
 */
import mongoose from 'mongoose';

const MONGODB_URI = process.env.MONGODB_URI ||
  'mongodb+srv://admin:ssrealty2026@ssrealty.kmrmgno.mongodb.net/SSRealty?authSource=admin&appName=SSRealty';

const PropertySchema = new mongoose.Schema({
  title: String, description: String, price: Number, priceType: String,
  propertyType: String, status: { type: String, default: 'available' },
  location: { address: String, city: String, state: String, pincode: String },
  features: { bedrooms: Number, bathrooms: Number, area: Number, areaUnit: { type: String, default: 'sqft' }, parking: Boolean, furnished: Boolean, floor: Number, totalFloors: Number },
  images: [String], featured: { type: Boolean, default: false },
  amenities: [String],
  agent: { name: String, phone: String, email: String },
  views: { type: Number, default: 0 },
}, { timestamps: true });

const BlogSchema = new mongoose.Schema({
  title: String, slug: String, excerpt: String, content: String,
  coverImage: String, author: { name: String }, category: String,
  tags: [String], published: { type: Boolean, default: true }, views: { type: Number, default: 0 },
}, { timestamps: true });

const Property = mongoose.models.Property || mongoose.model('Property', PropertySchema);
const Blog = mongoose.models.Blog || mongoose.model('Blog', BlogSchema);

const sampleProperties = [
  {
    title: 'Amaryllis – Premium 3BHK Luxury Floors',
    description: 'Prime Location on Gwal Pahari Road. Premium Independent Floors with Modern Architecture & Elegant Design. Excellent Connectivity to Delhi & Gurugram.\n\nExperience luxury like never before with these thoughtfully designed floors. Each unit is crafted to provide maximum space, natural light, and ventilation.',
    price: 12500000, priceType: 'sale', propertyType: 'floor', status: 'available',
    location: { address: "Opp. Lingaya's Vidyapeeth, Mandi – Gwal Pahari Road", city: 'Gurugram', state: 'Haryana', pincode: '122003' },
    features: { bedrooms: 3, bathrooms: 3, area: 130, areaUnit: 'sqyd', parking: true, furnished: false, floor: 1, totalFloors: 4 },
    images: [
      'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=1200&q=80',
      'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=1200&q=80',
      'https://images.unsplash.com/photo-1600607687940-c52af036999c?w=1200&q=80',
      'https://images.unsplash.com/photo-1600566753190-17f0bb2a6c3e?w=1200&q=80'
    ],
    featured: true, amenities: ['Prime Location on Gwal Pahari Road', 'Premium Independent Floors', 'Modern Architecture & Elegant Design', 'High Investment Potential', 'Excellent Connectivity to Delhi & Gurugram', 'Modular Kitchen', 'Premium Fittings', '24/7 Water Supply'],
    agent: { name: 'SS Realty Team', phone: '+91 9311059100', email: 'info@ssrealty.org' },
  },
  {
    title: 'Amaryllis – Premium 4BHK Luxury Floors',
    description: 'Ultra-luxury 4BHK floors on Gwal Pahari Road. Modern design meets elite living with high investment potential.\n\nThese signature 4BHK residencies are perfect for large families seeking a blend of natural beauty and modern urban infrastructure.',
    price: 15000000, priceType: 'sale', propertyType: 'floor', status: 'available',
    location: { address: "Opp. Lingaya's Vidyapeeth, Mandi – Gwal Pahari Road", city: 'Gurugram', state: 'Haryana', pincode: '122003' },
    features: { bedrooms: 4, bathrooms: 4, area: 160, areaUnit: 'sqyd', parking: true, furnished: false, floor: 2, totalFloors: 4 },
    images: [
      'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=1200&q=80',
      'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=1200&q=80',
      'https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?w=1200&q=80',
      'https://images.unsplash.com/photo-1600566753086-00f18fb6f3ea?w=1200&q=80'
    ],
    featured: true, amenities: ['Prime Location on Gwal Pahari Road', 'Premium Independent Floors', 'Modern Architecture & Elegant Design', 'High Investment Potential', 'Excellent Connectivity to Delhi & Gurugram', 'Spacious Balconies', 'Private Parking', 'High-speed Lift'],
    agent: { name: 'SS Realty Team', phone: '+91 9311059100', email: 'info@ssrealty.org' },
  },
  {
    title: '3BHK Luxury Builder Floor - Chhatarpur',
    description: 'Exquisite builder floor located just 15 minutes from Chattarpur Metro Station. Comes with Modular Kitchen and Premium Bath Fittings.',
    price: 8500000, priceType: 'sale', propertyType: 'floor', status: 'available',
    location: { address: 'Chattarpur Enclave', city: 'New Delhi', state: 'Delhi', pincode: '110030' },
    features: { bedrooms: 3, bathrooms: 3, area: 130, areaUnit: 'sqyd', parking: true, furnished: true, floor: 3, totalFloors: 4 },
    images: ['https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=800&q=80'],
    featured: true, amenities: ['Metro Proximity', 'Modular Kitchen', 'Premium Fittings', 'Security'],
    agent: { name: 'SS Realty Team', phone: '+91 9311059100', email: 'info@ssrealty.org' },
  },
  {
    title: '2BHK Luxury Apartments in Delhi NCR',
    description: 'Premium construction with high-quality fittings and excellent connectivity to major landmarks.',
    price: 5200000, priceType: 'sale', propertyType: 'apartment', status: 'available',
    location: { address: 'South Delhi Regions', city: 'New Delhi', state: 'Delhi', pincode: '110030' },
    features: { bedrooms: 2, bathrooms: 2, area: 80, areaUnit: 'sqyd', parking: true, furnished: false, floor: 2, totalFloors: 5 },
    images: ['https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800&q=80'],
    featured: false, amenities: ['Quality Fittings', 'Lift', 'Parking', 'CCTV'],
    agent: { name: 'SS Realty Team', phone: '+91 9311059100', email: 'info@ssrealty.org' },
  },
  {
    title: 'Ojasw Lumina - Luxury Living',
    description: 'A thoughtfully designed project by SS Realty offering comfort, durability, and lasting value for modern living.',
    price: 9500000, priceType: 'sale', propertyType: 'apartment', status: 'available',
    location: { address: 'Gurugram Sector', city: 'Gurugram', state: 'Haryana', pincode: '122001' },
    features: { bedrooms: 3, bathrooms: 3, area: 1550, areaUnit: 'sqft', parking: true, furnished: false },
    images: ['https://images.unsplash.com/photo-1497366216548-37526070297c?w=800&q=80'],
    featured: true, amenities: ['Club House', 'Gym', 'Security', 'Power Backup'],
    agent: { name: 'SS Realty Team', phone: '+91 9311059100', email: 'info@ssrealty.org' },
  },
  {
    title: 'The Arch - Iconic Residencies',
    description: 'Signature residential project in the heart of Delhi NCR, featuring state-of-the-art architecture and premium amenities.',
    price: 11000000, priceType: 'sale', propertyType: 'apartment', status: 'available',
    location: { address: 'South Delhi Premium', city: 'New Delhi', state: 'Delhi', pincode: '110017' },
    features: { bedrooms: 3, bathrooms: 3, area: 1800, areaUnit: 'sqft', parking: true, furnished: true },
    images: ['https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=800&q=80'],
    featured: true, amenities: ['Iconic Design', 'Premium Finish', 'Smart Home', '24/7 Concierge'],
    agent: { name: 'SS Realty Team', phone: '+91 9311059100', email: 'info@ssrealty.org' },
  },
];

const sampleBlogs = [
  {
    title: 'Why Gwal Pahari is Becoming the Next Real Estate Hotspot',
    slug: 'why-gwal-pahari-real-estate-hotspot',
    excerpt: 'Discover why investors and homebuyers are flocking to Gwal Pahari Road for luxury living.',
    content: `Gwal Pahari is rapidly emerging as one of the most premium real estate destinations in the Delhi-NCR region. Situated on the Gurugram-Faridabad Road, it offers the perfect blend of natural beauty and urban connectivity.\n\n**Strategic Location**\nJust minutes away from the major commercial hubs of Gurugram and South Delhi, Gwal Pahari provides easy access to top MNCs, schools, and hospitals.\n\n**Luxury Living at Amaryllis**\nOur flagship project, Amaryllis, offers premium independent floors designed for those who seek elegance and privacy. With modern architecture and world-class amenities, it's setting new benchmarks in the area.`,
    coverImage: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=800&q=80',
    author: { name: 'SS Realty Team' }, category: 'Market Trends',
    tags: ['Gurugram', 'Investment', 'Luxury Living', 'Gwal Pahari'],
    published: true,
  },
];

async function seed() {
  console.log('🌱 Connecting to MongoDB...');
  await mongoose.connect(MONGODB_URI, { dbName: 'SSRealty' });
  console.log('✅ Connected!');

  // Clear existing
  await Property.deleteMany({});
  await Blog.deleteMany({});

  // Insert seed data
  const properties = await Property.insertMany(sampleProperties);
  const blogs = await Blog.insertMany(sampleBlogs);

  console.log(`✅ Seeded ${properties.length} properties`);
  console.log(`✅ Seeded ${blogs.length} blog posts`);
  console.log('🎉 Seed complete!');
  await mongoose.disconnect();
}

seed().catch((e) => { console.error(e); process.exit(1); });
