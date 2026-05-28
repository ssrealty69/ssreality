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

function generateDynamicLocation(name: string) {
  const normalized = name.trim();
  
  // Deterministic seed based on name hash to ensure same inputs give identical outputs
  let hash = 0;
  for (let i = 0; i < normalized.length; i++) {
    hash = normalized.charCodeAt(i) + ((hash << 5) - hash);
  }
  const absHash = Math.abs(hash);

  // Parse City
  let city = 'Delhi NCR';
  const lowerName = normalized.toLowerCase();
  if (lowerName.includes('gurugram') || lowerName.includes('gurgaon')) {
    city = 'Gurugram';
  } else if (lowerName.includes('noida extension') || lowerName.includes('greater noida')) {
    city = 'Greater Noida';
  } else if (lowerName.includes('noida')) {
    city = 'Noida';
  } else if (lowerName.includes('delhi')) {
    city = 'Delhi';
  } else if (lowerName.includes('faridabad')) {
    city = 'Faridabad';
  } else if (lowerName.includes('ghaziabad')) {
    city = 'Ghaziabad';
  }

  // Parse Sector or Area Number
  let sectorNumber = 0;
  const sectorMatch = normalized.match(/(?:sector|sec)\s*(\d+)/i);
  if (sectorMatch) {
    sectorNumber = parseInt(sectorMatch[1], 10);
  } else {
    sectorNumber = (absHash % 150) + 1;
  }

  // Determine if developing (newer) vs mature
  let isDeveloping = false;
  if (city === 'Gurugram' && sectorNumber > 60) {
    isDeveloping = true;
  } else if (city === 'Noida' && sectorNumber > 100) {
    isDeveloping = true;
  } else if (city === 'Greater Noida' || city === 'Faridabad' || city === 'Ghaziabad') {
    isDeveloping = true;
  } else if (lowerName.includes('expressway') || lowerName.includes('extension') || lowerName.includes('highway') || lowerName.includes('corridor')) {
    isDeveloping = true;
  }

  // Deterministic Price Calculation
  let basePrice = 6500;
  if (city === 'Gurugram') {
    basePrice = isDeveloping ? 9000 : 13500;
  } else if (city === 'Noida') {
    basePrice = isDeveloping ? 7200 : 9800;
  } else if (city === 'Greater Noida') {
    basePrice = 5800;
  } else if (city === 'Delhi') {
    basePrice = 16000;
  } else if (city === 'Faridabad' || city === 'Ghaziabad') {
    basePrice = 4800;
  }

  const priceVariation = (absHash % 25) * 100; // variations up to ₹2,500
  const currentPrice = basePrice + priceVariation;

  // CAGR calculation (developing has higher cagr)
  let cagr = isDeveloping ? 12.0 : 8.5;
  const cagrVariation = ((absHash % 45) / 10); // variation up to 4.5%
  cagr = parseFloat((cagr + cagrVariation).toFixed(1));

  // Index scores
  const scoreBase = isDeveloping ? 6.5 : 8.5;
  const connectivity = parseFloat((scoreBase + (absHash % 15) / 10).toFixed(1));
  const infrastructure = parseFloat((scoreBase + (absHash % 18) / 10).toFixed(1));
  const livability = parseFloat((scoreBase + (absHash % 12) / 10).toFixed(1));
  const commercialProximity = parseFloat((scoreBase + (absHash % 20) / 10).toFixed(1));

  // Growth drivers
  let growthDrivers: string[] = [];
  if (city === 'Gurugram') {
    if (isDeveloping) {
      growthDrivers = [
        'Proximity to emerging Dwarka Expressway & Global City corridor',
        'Proposed Metro linkage under NCR master transit layout',
        'Rapid premium high-rise developer land banking'
      ];
    } else {
      growthDrivers = [
        'Direct NH-48 and Rapid Metro network integration',
        'Mature high-end retail hubs and premium multi-specialty healthcare',
        'Established corporate occupancy with strong corporate lease yields'
      ];
    }
  } else if (city === 'Noida') {
    if (isDeveloping) {
      growthDrivers = [
        'Seamless access to upcoming Jewar International Airport link',
        'Aqua Line metro expansion plans under implementation',
        'Designated low-density housing corridors and eco-parks'
      ];
    } else {
      growthDrivers = [
        'Immediate DND Flyway and South Delhi grid connectivity',
        'Mature institutional commercial hubs and tech company offices',
        'Seamless access to established local sector markets'
      ];
    }
  } else if (city === 'Greater Noida' || lowerName.includes('expressway')) {
    growthDrivers = [
      'Immediate access to Jewar International Airport corridor',
      'Massive industrial development hubs and electronics city clusters',
      'Affordable entry parameters with spacious integrated townships'
    ];
  } else {
    growthDrivers = [
      'Steady urbanization under Delhi NCR Master Plan guidelines',
      'Proposed secondary transit corridors and local highway upgrading',
      'High demand for mid-income family residential accommodation'
    ];
  }

  // Verdict
  let verdict = '';
  if (isDeveloping) {
    verdict = `Developing growth corridor with exceptional double-digit capital appreciation potential of +${cagr}% CAGR. Backed by fast-evolving civic transit, airport connectivity links, and high developer interest, making it perfect for high-yield mid-to-long term investors.`;
  } else {
    verdict = `Premium, fully mature residential zone characterized by high current occupancy, stable rental returns, and robust infrastructure. Ideal for risk-averse investors seeking wealth preservation, excellent livability, and reliable price appreciation.`;
  }

  // Generate 2022 to 2030 price history trend deterministically
  const trendHistory = [];
  const startYear = 2022;
  const baseYear = 2025; // 2025 is current price
  
  for (let year = 2022; year <= 2030; year++) {
    const diff = year - baseYear;
    let price = currentPrice;
    if (diff > 0) {
      price = Math.round(currentPrice * Math.pow(1 + (cagr / 100), diff));
    } else if (diff < 0) {
      price = Math.round(currentPrice / Math.pow(1 + (cagr / 100), Math.abs(diff)));
    }
    trendHistory.push({ year, price });
  }

  return {
    name: name,
    currentPrice,
    cagr,
    connectivity,
    infrastructure,
    livability,
    commercialProximity,
    growthDrivers,
    verdict,
    trendHistory,
    lastUpdated: new Date()
  };
}

export async function GET(req: NextRequest) {
  try {
    await connectDB();
    
    // Auto seed if empty
    let count = await LocationTrend.countDocuments();
    if (count === 0) {
      console.log('Seeding initial location trends...');
      await LocationTrend.insertMany(SEED_TRENDS);
    }

    const searchParams = req.nextUrl.searchParams;
    const query = searchParams.get('query');

    if (query && query.trim().length >= 3) {
      const normalizedQuery = query.trim();
      
      // Look up location by name (case-insensitive exact or starts-with check)
      let matched = await LocationTrend.findOne({
        name: { $regex: new RegExp(`^${normalizedQuery.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&')}$`, 'i') }
      }).lean();

      if (!matched) {
        // Try searching for sub-string matches
        matched = await LocationTrend.findOne({
          name: { $regex: new RegExp(normalizedQuery.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&'), 'i') }
        }).lean();
      }

      if (matched) {
        return NextResponse.json({
          success: true,
          data: JSON.parse(JSON.stringify(matched))
        });
      }

      // If still not found, algorithmically generate, save to DB, and return it!
      const generated = generateDynamicLocation(normalizedQuery);
      const created = await LocationTrend.create(generated);
      
      return NextResponse.json({
        success: true,
        data: JSON.parse(JSON.stringify(created.toObject()))
      });
    }

    const trends = await LocationTrend.find({}).lean();
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
