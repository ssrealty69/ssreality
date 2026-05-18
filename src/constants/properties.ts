import { Property } from '@/types';

export const FALLBACK_PROPERTIES: Property[] = [
  {
    _id: 'p1',
    title: 'Arch Premium Apartment',
    description: 'Modern 3 BHK apartment with all amenities and great connectivity.',
    price: 12500000,
    priceType: 'sale',
    propertyType: 'apartment',
    status: 'available',
    location: { address: 'Sector 63', city: 'Noida', state: 'Uttar Pradesh', pincode: '201301' },
    features: { bedrooms: 3, bathrooms: 3, area: 1850, areaUnit: 'sqft', parking: true, furnished: false },
    images: [
      'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1460317442991-0ec209397118?auto=format&fit=crop&w=800&q=80'
    ],
    featured: true,
    amenities: ['Gym', 'Swimming Pool', 'Power Backup', '24x7 Security'],
    brochureUrl: '/SS%20Realty%20Arch%20Property%20Brochure.pdf',
    agent: { name: 'SS Realty Team', phone: '+91 9311059100', email: 'info@ssrealty.in' },
    views: 1250, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString()
  },
  {
    _id: 'p2',
    title: 'Nivasa Spaces in Greater Noida',
    description: 'Beautiful 4 BHK villa with private garden and modern interiors.',
    price: 35000000,
    priceType: 'sale',
    propertyType: 'villa',
    status: 'available',
    location: { address: 'Knowledge Park', city: 'Greater Noida', state: 'Uttar Pradesh', pincode: '201310' },
    features: { bedrooms: 4, bathrooms: 4, area: 3200, areaUnit: 'sqft', parking: true, furnished: true },
    images: [
      'https://images.unsplash.com/photo-1613977257363-707ba9348227?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1580587771525-78b9dba3b914?auto=format&fit=crop&w=800&q=80'
    ],
    featured: true,
    amenities: ['Private Garden', 'Clubhouse', 'Gym', 'Parking'],
    brochureUrl: '/Nivasa.pdf',
    agent: { name: 'SS Realty Team', phone: '+91 9311059100', email: 'info@ssrealty.in' },
    views: 890, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString()
  },
  {
    _id: 'p3',
    title: 'Modern Office in Sector 62',
    description: 'Premium office space in a prime commercial hub.',
    price: 8500000,
    priceType: 'sale',
    propertyType: 'commercial',
    status: 'available',
    location: { address: 'Sector 62', city: 'Noida', state: 'Uttar Pradesh', pincode: '201309' },
    features: { area: 1200, areaUnit: 'sqft', parking: true },
    images: [
      'https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1497215842964-222b430dc094?auto=format&fit=crop&w=800&q=80'
    ],
    featured: false,
    amenities: ['Power Backup', 'Security', 'Lift', 'Parking'],
    agent: { name: 'SS Realty Team', phone: '+91 9311059100', email: 'info@ssrealty.in' },
    views: 450, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString()
  },
  {
    _id: 'p4',
    title: 'Apartment near Yamuna Expressway',
    description: 'Affordable 2 BHK apartment in a growing residential area.',
    price: 4500000,
    priceType: 'sale',
    propertyType: 'apartment',
    status: 'available',
    location: { address: 'Yamuna Expressway', city: 'Greater Noida', state: 'Uttar Pradesh', pincode: '201301' },
    features: { bedrooms: 2, bathrooms: 2, area: 1150, areaUnit: 'sqft', parking: true },
    images: [
      'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1484154218962-a197022b5858?auto=format&fit=crop&w=800&q=80'
    ],
    featured: true,
    amenities: ['Play Area', 'Garden', 'Security', 'Water Supply'],
    agent: { name: 'SS Realty Team', phone: '+91 9311059100', email: 'info@ssrealty.in' },
    views: 1560, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString()
  },
  {
    _id: 'p5',
    title: 'Luxury Villa in Delhi NCR',
    description: 'Exquisite 5 BHK villa with premium finishes and high-end security.',
    price: 75000000,
    priceType: 'sale',
    propertyType: 'villa',
    status: 'available',
    location: { address: 'Delhi Ridge', city: 'New Delhi', state: 'Delhi', pincode: '110001' },
    features: { bedrooms: 5, bathrooms: 6, area: 4500, areaUnit: 'sqft', parking: true, furnished: true },
    images: [
      'https://images.unsplash.com/photo-1613490493576-7fde63acd811?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=800&q=80'
    ],
    featured: true,
    amenities: ['Private Pool', 'Gym', 'Home Theater', 'Landscaped Garden'],
    agent: { name: 'SS Realty Team', phone: '+91 9311059100', email: 'info@ssrealty.in' },
    views: 2100, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString()
  },
  {
    _id: 'p6',
    title: 'Residential Plot in Jewar',
    description: 'Investment opportunity near the upcoming Noida International Airport.',
    price: 1800000,
    priceType: 'sale',
    propertyType: 'plot',
    status: 'available',
    location: { address: 'Jewar Toll Plaza', city: 'Jewar', state: 'Uttar Pradesh', pincode: '203135' },
    features: { area: 150, areaUnit: 'sqyd', parking: false },
    images: [
      'https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?auto=format&fit=crop&w=800&q=80'
    ],
    featured: true,
    amenities: ['Gated Community', 'Upcoming Metro', 'Near Airport', '24x7 Security'],
    agent: { name: 'SS Realty Team', phone: '+91 9311059100', email: 'info@ssrealty.in' },
    views: 3400, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString()
  },
  {
    _id: 'p9',
    title: 'Freehold Land in Gurgaon',
    description: 'Prime location plot for residential use. Close to Dwarka Expressway.',
    price: 4500000,
    priceType: 'sale',
    propertyType: 'plot',
    status: 'available',
    location: { address: 'Sector 102', city: 'Gurugram', state: 'Haryana', pincode: '122001' },
    features: { area: 200, areaUnit: 'sqyd', parking: false },
    images: [
      'https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1473081556163-2a17de81fc97?auto=format&fit=crop&w=800&q=80'
    ],
    featured: true,
    amenities: ['Power Connection', 'Water Supply', 'Wide Roads', 'Park'],
    agent: { name: 'SS Realty Team', phone: '+91 9311059100', email: 'info@ssrealty.in' },
    views: 1200, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString()
  },
  {
    _id: 'p10',
    title: 'Commercial Plot in Noida',
    description: 'Perfect for building a small office or showroom. Prime commercial zone.',
    price: 6500000,
    priceType: 'sale',
    propertyType: 'plot',
    status: 'available',
    location: { address: 'Sector 140', city: 'Noida', state: 'Uttar Pradesh', pincode: '201305' },
    features: { area: 120, areaUnit: 'sqyd', parking: true },
    images: [
      'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=800&q=80'
    ],
    featured: true,
    amenities: ['Corner Plot', 'Main Road Facing', 'Basement Allowed', 'Commercial Hub'],
    agent: { name: 'SS Realty Team', phone: '+91 9311059100', email: 'info@ssrealty.in' },
    views: 950, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString()
  },
  {
    _id: 'p7',
    title: 'Modern 2 BHK for Rent in Sector 18',
    description: 'Fully furnished apartment in the heart of Noida, perfect for professionals.',
    price: 35000,
    priceType: 'rent',
    propertyType: 'apartment',
    status: 'available',
    location: { address: 'Sector 18', city: 'Noida', state: 'Uttar Pradesh', pincode: '201301' },
    features: { bedrooms: 2, bathrooms: 2, area: 1200, areaUnit: 'sqft', parking: true, furnished: true },
    images: [
      'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=800&q=80'
    ],
    featured: false,
    amenities: ['Power Backup', 'Security', 'Lift', 'Parking', 'WiFi'],
    agent: { name: 'SS Realty Team', phone: '+91 9311059100', email: 'info@ssrealty.in' },
    views: 1100, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString()
  },
  {
    _id: 'p8',
    title: 'Luxury Office Space in Gurugram',
    description: 'Prime office space available for rent in a modern business park.',
    price: 150000,
    priceType: 'rent',
    propertyType: 'commercial',
    status: 'available',
    location: { address: 'Golf Course Extension', city: 'Gurugram', state: 'Haryana', pincode: '122001' },
    features: { area: 2500, areaUnit: 'sqft', parking: true },
    images: [
      'https://images.unsplash.com/photo-1497215728101-856f4ea42174?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1497366754035-f200968a6e72?auto=format&fit=crop&w=800&q=80'
    ],
    featured: false,
    amenities: ['Central AC', 'Power Backup', '24x7 Security', 'Pantry'],
    agent: { name: 'SS Realty Team', phone: '+91 9311059100', email: 'info@ssrealty.in' },
    views: 670, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString()
  }
];
