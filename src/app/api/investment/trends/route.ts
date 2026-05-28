import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import LocationTrend from '@/models/LocationTrend';

export const dynamic = 'force-dynamic';

const SEED_TRENDS = [
  {
    name: '👑 Golf Course Extension, Gurgaon',
    currentPrice: 15500,
    cagr: 12.4,
    connectivity: 9.4,
    infrastructure: 9.0,
    livability: 8.8,
    commercialProximity: 9.5,
    growthDrivers: [
      'Upcoming Metro Corridor Extension',
      'Direct connectivity to Cyber City & Golf Course Road',
      'Surge in ultra-luxury high-rise residential supply'
    ],
    verdict: 'Premium, established investment hub. Perfect for investors seeking high rental yields, elite NRI occupancy, and stable double-digit capital appreciation on high-end luxury flats.',
    trendHistory: [
      { year: 2022, price: 11800 },
      { year: 2023, price: 13200 },
      { year: 2024, price: 14500 },
      { year: 2025, price: 15500 },
      { year: 2026, price: 17200 },
      { year: 2027, price: 19100 },
      { year: 2028, price: 21200 },
      { year: 2029, price: 23500 },
      { year: 2030, price: 26000 }
    ]
  },
  {
    name: '🚀 Dwarka Expressway, Gurgaon',
    currentPrice: 12800,
    cagr: 14.8,
    connectivity: 9.2,
    infrastructure: 8.5,
    livability: 8.0,
    commercialProximity: 8.8,
    growthDrivers: [
      'Full operational opening of the 8-lane Dwarka Expressway',
      'Proximity to IGI Airport Terminal 3 (15 min drive)',
      'Adjacency to upcoming Gurgaon Global City & Heliport project'
    ],
    verdict: 'Highest-growth corridor in NCR. Exceptional capital appreciation hotspot driven by massive infrastructure developments and seamless Delhi-Gurgaon airport connectivity.',
    trendHistory: [
      { year: 2022, price: 9200 },
      { year: 2023, price: 11000 },
      { year: 2024, price: 12100 },
      { year: 2025, price: 12800 },
      { year: 2026, price: 14700 },
      { year: 2027, price: 16900 },
      { year: 2028, price: 19400 },
      { year: 2029, price: 22300 },
      { year: 2030, price: 25600 }
    ]
  },
  {
    name: '🌳 Noida Sector 150 (Eco-Hub)',
    currentPrice: 7800,
    cagr: 11.2,
    connectivity: 8.5,
    infrastructure: 8.8,
    livability: 9.0,
    commercialProximity: 7.2,
    growthDrivers: [
      'Low-density sector with 80% designated green cover',
      'Direct connectivity to Jewar Airport via Noida-Gr. Noida Expressway',
      'Massive 9-hole golf course and active sports arenas'
    ],
    verdict: 'Perfect for end-users seeking quiet, luxurious green living. Highly resilient capital retention with healthy long-term growth as Jewar Airport approaches final operational launch.',
    trendHistory: [
      { year: 2022, price: 6100 },
      { year: 2023, price: 6800 },
      { year: 2024, price: 7400 },
      { year: 2025, price: 7800 },
      { year: 2026, price: 8600 },
      { year: 2027, price: 9500 },
      { year: 2028, price: 10500 },
      { year: 2029, price: 11600 },
      { year: 2030, price: 12800 }
    ]
  },
  {
    name: '🏢 Greater Noida West (Noida Extension)',
    currentPrice: 6200,
    cagr: 9.8,
    connectivity: 8.0,
    infrastructure: 8.2,
    livability: 8.5,
    commercialProximity: 7.5,
    growthDrivers: [
      'High-volume, mid-income affordable luxury housing magnet',
      'Sanctioned extension of the Aqua Line Metro corridor',
      'Robust local commercial retail market and high-quality schools'
    ],
    verdict: 'Excellent entry point for first-time buyers and rental-yield investors. Offers high occupancy security and steady, low-risk appreciation supported by vast local commercial centers.',
    trendHistory: [
      { year: 2022, price: 4900 },
      { year: 2023, price: 5400 },
      { year: 2024, price: 5900 },
      { year: 2025, price: 6200 },
      { year: 2026, price: 6800 },
      { year: 2027, price: 7450 },
      { year: 2028, price: 8150 },
      { year: 2029, price: 8900 },
      { year: 2030, price: 9750 }
    ]
  },
  {
    name: '✈️ Yamuna Expressway (Jewar Hub)',
    currentPrice: 4800,
    cagr: 15.5,
    connectivity: 7.8,
    infrastructure: 8.0,
    livability: 7.0,
    commercialProximity: 6.5,
    growthDrivers: [
      'Immediate adjacency to Jewar Noida International Airport',
      'Upcoming Film City & Electronic Manufacturing cluster',
      'F1 Circuit and Multi-Modal Logistics Hub connections'
    ],
    verdict: 'Highest speculative growth potential in NCR. Best suited for high-risk, long-term investors aiming for plots and premium commercial land bank assets near the upcoming aviation hub.',
    trendHistory: [
      { year: 2022, price: 3300 },
      { year: 2023, price: 3900 },
      { year: 2024, price: 4400 },
      { year: 2025, price: 4800 },
      { year: 2026, price: 5600 },
      { year: 2027, price: 6500 },
      { year: 2028, price: 7600 },
      { year: 2029, price: 8850 },
      { year: 2030, price: 10300 }
    ]
  },
  {
    name: '⛰️ Gwal Pahari (Green Hills Corridor)',
    currentPrice: 11200,
    cagr: 13.6,
    connectivity: 8.8,
    infrastructure: 8.4,
    livability: 9.2,
    commercialProximity: 9.0,
    growthDrivers: [
      'Pristine green environment surrounded by Aravalli forests',
      'Strategic location directly linking Gurgaon Sector 56 and South Delhi',
      'High density of premium luxury villas and low-density boutique flats'
    ],
    verdict: 'Ultra-exclusive residential address. Highly popular with corporate leaders, industrialists, and luxury seekers looking for privacy, green environment, and high-capital values.',
    trendHistory: [
      { year: 2022, price: 8100 },
      { year: 2023, price: 9200 },
      { year: 2024, price: 10200 },
      { year: 2025, price: 11200 },
      { year: 2026, price: 12700 },
      { year: 2027, price: 14400 },
      { year: 2028, price: 16300 },
      { year: 2029, price: 18450 },
      { year: 2030, price: 20900 }
    ]
  },
  {
    name: '🛣️ Sohna Road, Gurgaon',
    currentPrice: 8500,
    cagr: 10.4,
    connectivity: 8.6,
    infrastructure: 8.2,
    livability: 8.4,
    commercialProximity: 8.0,
    growthDrivers: [
      'Seamless link to Delhi-Mumbai Industrial Expressway',
      'Established commercial and office spaces (Sohna IT cluster)',
      'Affordable luxury residential complexes in the foothills of Aravallis'
    ],
    verdict: 'Highly stable mid-to-high income corridor. Ideal for investors seeking instant occupancies, ready infrastructure, and consistent rental income from operational IT parks.',
    trendHistory: [
      { year: 2022, price: 6700 },
      { year: 2023, price: 7400 },
      { year: 2024, price: 8000 },
      { year: 2025, price: 8500 },
      { year: 2026, price: 9350 },
      { year: 2027, price: 10300 },
      { year: 2028, price: 11300 },
      { year: 2029, price: 12400 },
      { year: 2030, price: 13600 }
    ]
  }
];

export async function GET(req: NextRequest) {
  try {
    await connectDB();
    
    let trends = await LocationTrend.find({}).lean();
    
    // Auto seed if empty
    if (!trends || trends.length === 0) {
      console.log('Seeding initial location trends...');
      await LocationTrend.insertMany(SEED_TRENDS);
      trends = await LocationTrend.find({}).lean();
    }

    const safeTrends = JSON.parse(JSON.stringify(trends));

    return NextResponse.json({
      success: true,
      data: safeTrends
    });
  } catch (error: any) {
    console.error('Fetch Location Trends API Error:', error);
    return NextResponse.json({ success: false, error: 'Server Error', details: error.message }, { status: 500 });
  }
}
