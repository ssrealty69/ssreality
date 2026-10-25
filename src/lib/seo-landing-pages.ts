export interface SeoLandingPageConfig {
  slug: string;
  metaTitle: string;
  metaDescription: string;
  h1: string;
  subheading: string;
  canonicalUrl: string;
  keywords?: string[];
  filters: {
    location?: string;
    bedrooms?: number;
    propertyType?: string;
    priceType?: string;
    searchQuery?: string;
  };
  introParagraphs: string[];
  features: string[];
  faqs: { question: string; answer: string }[];
  localities?: {
    name: string;
    superArea: string;
    distanceToMetro: string;
    priceRange: string;
    highlights: string;
  }[];
  relatedSearches?: {
    label: string;
    slug: string;
  }[];
}

export const SEO_LANDING_PAGES: Record<string, SeoLandingPageConfig> = {
  'flats-in-chattarpur': {
    slug: 'flats-in-chattarpur',
    metaTitle: 'Flats in Chattarpur South Delhi | 2, 3 & 4 BHK Builder Floors | SS Realty',
    metaDescription: 'Looking for luxury 2, 3 & 4 BHK flats in Chattarpur, South Delhi? SS Realty offers budget-friendly builder floors with up to 80% loan assistance from leading NBFCs, registry & prime connectivity near Chattarpur Metro.',
    h1: 'Flats in Chattarpur, South Delhi',
    subheading: 'Premium 2 BHK, 3 BHK & 4 BHK Builder Floors with Registry & Up to 80% Loan Facility',
    canonicalUrl: 'https://ssrealty.org/flats-in-chattarpur',
    filters: { location: 'Chattarpur' },
    introParagraphs: [
      'Chattarpur is one of the most sought-after residential hubs in South Delhi, offering a perfect blend of lush greenery, tranquil surroundings, and excellent urban connectivity. SS Realty presents an exclusive collection of luxury 2 BHK, 3 BHK, and 4 BHK builder floors designed to elevate your everyday living.',
      'Our properties in Chattarpur come with complete registry status, up to 80% loan approval assistance through leading NBFCs, modular kitchens, stilt parking, branded elevators, and zero brokerage fee directly from self-built developers.'
    ],
    features: [
      'Near Chattarpur & Chhatarpur Mandir Metro Station (Yellow Line)',
      '100% Registry & Up to 80% Loan Approval from Leading NBFCs',
      'Stilt Car Parking, Gated Security & EV Charging Points',
      'Modular Kitchens with Italian Marble Flooring & Smart Fittings'
    ],
    faqs: [
      {
        question: 'Are loan facilities available for flats in Chattarpur?',
        answer: 'Yes! SS Realty provides up to 80% loan assistance from leading NBFCs for all our Chattarpur builder floors.'
      },
      {
        question: 'What is the starting price for 2 BHK and 3 BHK flats in Chattarpur?',
        answer: '2 BHK flats in Chattarpur start from ₹35 Lakhs, while spacious 3 BHK luxury builder floors start from ₹55 Lakhs onwards depending on location and amenities.'
      }
    ]
  },

  '2-bhk-flat-in-chattarpur': {
    slug: '2-bhk-flat-in-chattarpur',
    metaTitle: '2 BHK Flat in Chattarpur Delhi | Modern Builder Floors | SS Realty',
    metaDescription: 'Buy premium 2 BHK flats in Chattarpur, South Delhi starting at budget prices. Modern amenities, modular kitchen, stilt parking & up to 80% NBFC loan available. Direct builder dealing.',
    h1: '2 BHK Flats in Chattarpur, South Delhi',
    subheading: 'Affordable & Luxury 2 Bedroom Builder Floors Near Metro Station',
    canonicalUrl: 'https://ssrealty.org/2-bhk-flat-in-chattarpur',
    filters: { location: 'Chattarpur', bedrooms: 2 },
    introParagraphs: [
      'Searching for a modern, well-ventilated 2 BHK flat in Chattarpur? SS Realty brings you thoughtfully engineered 2 BHK builder floors featuring spacious bedrooms, modular kitchen, attached washrooms, and private balconies.',
      'Located in prime pockets of Chattarpur, these homes offer seamless connectivity to Qutub Minar, Saket, Vasant Kunj, and Gurgaon via MG Road.'
    ],
    features: [
      'Spacious Floor Plans (70 Sq. Yds. to 90 Sq. Yds.)',
      'Zero Brokerage — Buy Directly from Self-Build Developer',
      'Stilt Parking & High-Speed Elevator Access',
      '24/7 Water Supply & Dedicated Power Backup'
    ],
    faqs: [
      {
        question: 'How far are these 2 BHK flats from Chattarpur Metro Station?',
        answer: 'Most of our 2 BHK properties are situated within 5 to 10 minutes distance from Chattarpur and Ghitorni Metro Stations.'
      }
    ]
  },

  '3-bhk-flats-for-sale-chattarpur': {
    slug: '3-bhk-flats-for-sale-chattarpur',
    metaTitle: '3 BHK Flats for Sale in Chattarpur South Delhi | SS Realty',
    metaDescription: 'Explore ready to move 3 BHK flats for sale in Chattarpur, South Delhi. Luxury builder floors with car parking, balcony, registry & up to 80% NBFC loan. Book site visit today!',
    h1: '3 BHK Flats for Sale in Chattarpur',
    subheading: 'Spacious Family Homes with Semi-Furnished & Fully-Furnished Options',
    canonicalUrl: 'https://ssrealty.org/3-bhk-flats-for-sale-chattarpur',
    filters: { location: 'Chattarpur', bedrooms: 3 },
    introParagraphs: [
      'Upgrade your family lifestyle with our luxurious 3 BHK builder floors in Chattarpur. Featuring expansive living halls, master bedrooms with attached washrooms, modular kitchens, and premium fittings.',
      'Designed with maximum ventilation and sunlight, our 3 BHK apartments provide long-term peace of mind with legal clarity and clear title deeds.'
    ],
    features: [
      'Super Area ranging from 110 Sq. Yds. to 150 Sq. Yds.',
      'Covered Car Parking & High-End Security Entry',
      'Proximity to Top Schools, Hospitals & Shopping Malls',
      '100% Registry & Up to 80% NBFC Loan Available'
    ],
    faqs: [
      {
        question: 'Can I get a fully furnished 3 BHK flat in Chattarpur?',
        answer: 'Yes, we offer both semi-furnished and fully-furnished 3 BHK options equipped with wardrobes, false ceiling lights, modular kitchen cabinets, and chimney.'
      }
    ]
  },

  '3-bhk-flat-in-chattarpur': {
    slug: '3-bhk-flat-in-chattarpur',
    metaTitle: '3 BHK Flat in Chattarpur Delhi | Luxury Builder Floors in Chhatarpur | SS Realty',
    metaDescription: 'Searching for 3 BHK flat in Chattarpur (Chhatarpur / Chatarpur / chttarpur)? Explore luxury 3 BHK builder floors near Chattarpur Metro with stilt parking, lift, registry & up to 80% loan. Zero brokerage.',
    h1: '3 BHK Flat in Chattarpur (Chhatarpur), South Delhi',
    subheading: 'Luxury 3 Bedroom Builder Floors with Stilt Car Parking, High-Speed Lift & 100% Freehold Registry Near Metro',
    canonicalUrl: 'https://ssrealty.org/3-bhk-flat-in-chattarpur',
    keywords: [
      '3 BHK Flat in chttarpur',
      '3 BHK Flat in Chatarpur',
      '3 BHK flat in Chhatarpur',
      'builder floor in chhatarpur',
      '3 BHK Flat in Chattarpur',
      '3 BHK flat in Chattarpur Enclave',
      'builder floor in Chattarpur with lift and parking',
      'registry flat in chhatarpur',
      '3 BHK ready to move flat in chattarpur',
      'flats near chattarpur metro station'
    ],
    filters: { location: 'Chattarpur', bedrooms: 3 },
    introParagraphs: [
      'Looking for a spacious and modern 3 BHK flat in Chattarpur (also commonly searched as Chhatarpur, Chatarpur, or chttarpur)? SS Realty brings you an exclusive portfolio of architecturally designed 3 BHK luxury builder floors in prime enclaves of Chattarpur, South Delhi. Designed for discerning families who refuse to compromise on space, natural light, and lifestyle, our 3 BHK residences offer generous floor layouts ranging from 110 Sq. Yds. to 160 Sq. Yds. with premium interior finishes.',
      'Unlike congested high-rise societies, an independent builder floor in Chhatarpur offers unmatched privacy, dedicated stilt car parking, high-speed elevator access, and low-density living in South Delhi\'s green farmhouse belt. Whether you are searching for a ready-to-move 3 BHK flat in Chattarpur Enclave Phase 1 or 2, JVTS Garden, 100 Feet Road, or Mandi Road, our properties are situated on wide 30ft to 50ft roads with 24/7 water supply, BSES electricity connections, and IGL piped gas connectivity.',
      'Every 3 BHK flat in Chattarpur developed by SS Realty is 100% clear-title freehold registry property. We formalize every sale deed through the Sub-Registrar VA (Mehrauli/Hauz Khas) office, guaranteeing complete legal security. With pre-approved home loan facilities up to 80% to 90% from leading banks and NBFCs, acquiring your dream home in South Delhi has never been more straightforward or secure.',
      'Enjoy unbeatable South Delhi connectivity: live just 5 to 10 minutes away from Chattarpur Metro Station (Yellow Line and upcoming Silver Line), 15 minutes from DLF Cyber City and Golf Course Road Gurgaon, and 20 minutes from IGI Airport and Aerocity. With top schools, Max Hospital Saket, Fortis Vasant Kunj, and DLF Promenade nearby, Chattarpur is the premier residential destination for modern urban professionals and families.'
    ],
    features: [
      'Walking / 5-min distance to Chattarpur & Chhatarpur Mandir Metro (Yellow Line)',
      '100% Freehold Registry with Sub-Registrar VA Mehrauli / Hauz Khas',
      'Up to 80%–90% Bank & NBFC Home Loan Assistance (Tata Capital, ICICI HFC, Piramal)',
      'Dedicated Stilt Covered Car Parking & Automatic Schindler / Otis Elevator',
      'Italian Marble / Vitrified Tile Flooring with Premium False Ceiling & Ambient LED',
      'Modular Kitchen with Chimney, Hob & Branded CP Fittings (Jaguar / Cera)',
      'Spacious 3 Bedrooms with Attached Bathrooms & Private Running Balconies',
      'Zero Brokerage Fee — Direct Developer Dealing with 15+ Years Track Record'
    ],
    localities: [
      {
        name: 'Chattarpur Enclave Phase 1',
        superArea: '120 – 145 Sq. Yds.',
        distanceToMetro: '3 to 5 Mins (Chattarpur Metro)',
        priceRange: '₹75 Lakhs – ₹95 Lakhs',
        highlights: 'Wide avenues, gated security, modular kitchen, immediate registry'
      },
      {
        name: 'Chattarpur Enclave Phase 2',
        superArea: '125 – 150 Sq. Yds.',
        distanceToMetro: '5 to 7 Mins (Yellow Line)',
        priceRange: '₹70 Lakhs – ₹90 Lakhs',
        highlights: '30ft wide approach roads, stilt parking, up to 90% loan approved'
      },
      {
        name: 'JVTS Garden, Chattarpur',
        superArea: '110 – 135 Sq. Yds.',
        distanceToMetro: '6 to 8 Mins',
        priceRange: '₹65 Lakhs – ₹85 Lakhs',
        highlights: 'Peaceful residential pocket, elevator access, 3 washrooms & 2 balconies'
      },
      {
        name: '100 Feet Road Chattarpur',
        superArea: '135 – 160 Sq. Yds.',
        distanceToMetro: '4 Mins',
        priceRange: '₹85 Lakhs – ₹1.25 Crore',
        highlights: 'Ultra-luxury builder floors, high rental yield, prime commercial transit'
      },
      {
        name: 'Chhatarpur Mandi Road',
        superArea: '130 – 155 Sq. Yds.',
        distanceToMetro: '8 to 10 Mins (Direct Gurgaon Access)',
        priceRange: '₹75 Lakhs – ₹95 Lakhs',
        highlights: 'Farmhouse green belt air quality, rapid commute to Cyber City & Saket'
      }
    ],
    faqs: [
      {
        question: 'What is the price of a 3 BHK flat in Chattarpur (Chhatarpur)?',
        answer: 'The price of a 3 BHK flat in Chattarpur generally starts from ₹65 Lakhs for semi-furnished units and goes up to ₹1.25 Crore for ultra-luxury builder floors with private terrace rights or prime 100 Feet Road locations, depending on carpet area, road width, and custom furnishings.'
      },
      {
        question: 'Are 3 BHK builder floors in Chhatarpur legally registered with government sale deeds?',
        answer: 'Yes! All SS Realty 3 BHK builder floors in Chattarpur are built on verified freehold abadi land and are executed via 100% registered sale deeds (conveyance deeds) at the Sub-Registrar VA (Mehrauli/Hauz Khas) office with full legal transparency.'
      },
      {
        question: 'Can I get a bank loan on a 3 BHK flat in Chattarpur, and what percentage is funded?',
        answer: 'Yes, up to 80% to 90% home loan assistance is available through leading NBFCs and housing finance companies including Tata Capital, ICICI Home Finance, Piramal, and PNB Housing. Our dedicated in-house banking team manages the complete documentation and approval process.'
      },
      {
        question: 'How far are these 3 BHK flats from the Chattarpur Metro Station?',
        answer: 'Most of our 3 BHK properties in Chattarpur Enclave, JVTS Garden, and 100 Feet Road are located within a 3 to 8 minute drive or walking distance from the Chattarpur Metro Station (Yellow Line), providing quick signal-free access to Gurgaon and Central Delhi.'
      },
      {
        question: 'What amenities and parking facilities are provided with the flats?',
        answer: 'Every 3 BHK builder floor comes equipped with dedicated stilt covered car parking, branded high-speed automatic elevator (Schindler/Otis), modular kitchen with chimney and hob, Italian marble/vitrified tiles, false ceiling with ambient LED lighting, digital door lock, and 24/7 water supply.'
      },
      {
        question: 'Why should I choose an independent builder floor in Chhatarpur over high-rise apartments?',
        answer: 'An independent builder floor in Chhatarpur provides single-floor private living without paying hefty monthly maintenance charges or facing high-rise overcrowding. You get freehold ownership, larger living spaces, private balconies, and superior long-term land value appreciation.'
      }
    ],
    relatedSearches: [
      { label: '2 BHK Flat in Chattarpur', slug: '/2-bhk-flat-in-chattarpur' },
      { label: '3 BHK Flats in South Delhi', slug: '/3-bhk-flats-in-south-delhi' },
      { label: 'Flats for Sale in South Delhi', slug: '/flats-for-sale-in-south-delhi' },
      { label: 'Flats in Mandi Gurgaon Border', slug: '/flats-in-mandi' },
      { label: 'Flats in Gadaipur South Delhi', slug: '/flats-in-gadaipur' },
      { label: 'Ready to Move Flats in Gurgaon', slug: '/ready-to-move-flats-in-gurgaon' }
    ]
  },

  // Exact-match variations for search intent & spelling aliases
  '3-bhk-flat-in-chttarpur': {
    slug: '3-bhk-flat-in-chttarpur',
    metaTitle: '3 BHK Flat in Chattarpur (Chhatarpur) | Builder Floors | SS Realty',
    metaDescription: 'Find luxury 3 BHK flats in Chattarpur / Chhatarpur Delhi. Registry ready builder floors with lift, car parking & up to 80% loan. Call SS Realty.',
    h1: '3 BHK Flat in Chattarpur (Chhatarpur), South Delhi',
    subheading: 'Luxury 3 Bedroom Builder Floors with Stilt Car Parking, High-Speed Lift & 100% Freehold Registry Near Metro',
    canonicalUrl: 'https://ssrealty.org/3-bhk-flat-in-chattarpur',
    keywords: [
      '3 BHK Flat in chttarpur',
      '3 BHK Flat in Chatarpur',
      '3 BHK flat in Chhatarpur',
      'builder floor in chhatarpur'
    ],
    filters: { location: 'Chattarpur', bedrooms: 3 },
    introParagraphs: [
      'Searching for a 3 BHK flat in Chattarpur (Chhatarpur / Chatarpur / chttarpur)? SS Realty brings you premium 3 BHK builder floors in South Delhi featuring Italian marble, modular kitchen, stilt parking, and Schindler elevators.',
      'Enjoy complete legal peace of mind with 100% freehold registry, up to 90% NBFC loan assistance, and prime connectivity just 5 minutes from Chattarpur Metro Station.'
    ],
    features: [
      'Near Chattarpur Metro Station (Yellow Line)',
      '100% Freehold Registry & Up to 80%–90% Loan Available',
      'Stilt Car Parking, Gated Security & Schindler Elevator',
      'Modular Kitchen with Italian Marble & Branded CP Fittings'
    ],
    faqs: [
      {
        question: 'What is the starting price for a 3 BHK flat in Chattarpur?',
        answer: '3 BHK flats in Chattarpur start from ₹65 Lakhs onwards with up to 90% loan assistance.'
      }
    ]
  },

  '3-bhk-flat-in-chhatarpur': {
    slug: '3-bhk-flat-in-chhatarpur',
    metaTitle: '3 BHK Flat in Chhatarpur Delhi | Luxury Builder Floors | SS Realty',
    metaDescription: 'Explore 3 BHK flats in Chhatarpur South Delhi. Gated builder floors with stilt parking, elevator, registry & up to 80% NBFC loan. Direct builder price.',
    h1: '3 BHK Flat in Chhatarpur, South Delhi',
    subheading: 'Premium 3 Bedroom Residences Near Chhatarpur Mandir & Metro Station',
    canonicalUrl: 'https://ssrealty.org/3-bhk-flat-in-chattarpur',
    keywords: [
      '3 BHK flat in Chhatarpur',
      'builder floor in chhatarpur',
      '3 BHK Flat in Chattarpur'
    ],
    filters: { location: 'Chattarpur', bedrooms: 3 },
    introParagraphs: [
      'Experience spacious and elegant living with SS Realty\'s 3 BHK builder floors in Chhatarpur. Designed with expansive rooms, premium modular kitchens, and private balconies in prime South Delhi.'
    ],
    features: [
      '5 Minutes to Chhatarpur Metro Station',
      '100% Registry & 80%–90% Loan Facility',
      'Reserved Stilt Parking & Branded Lift'
    ],
    faqs: [
      {
        question: 'Are Chhatarpur builder floors eligible for bank loans?',
        answer: 'Yes, leading NBFCs provide up to 90% loan approvals for our Chhatarpur properties.'
      }
    ]
  },

  'builder-floor-in-chhatarpur': {
    slug: 'builder-floor-in-chhatarpur',
    metaTitle: 'Builder Floor in Chhatarpur South Delhi | 2, 3 & 4 BHK | SS Realty',
    metaDescription: 'Find luxury builder floors in Chhatarpur South Delhi. Clear title registry, stilt parking, lift & up to 80% loan assistance. Buy direct from builder SS Realty.',
    h1: 'Builder Floor in Chhatarpur, South Delhi',
    subheading: 'Independent Luxury Living with Covered Parking, Elevator & 100% Registry',
    canonicalUrl: 'https://ssrealty.org/3-bhk-flat-in-chattarpur',
    keywords: [
      'builder floor in chhatarpur',
      '3 BHK Flat in chttarpur',
      '3 BHK flat in Chhatarpur'
    ],
    filters: { location: 'Chattarpur', bedrooms: 3 },
    introParagraphs: [
      'SS Realty offers premium independent builder floors in Chhatarpur. Experience the freedom of single-floor ownership, zero high-rise congestion, and low maintenance with guaranteed registry.'
    ],
    features: [
      'Independent Single-Floor Living with Full Privacy',
      'Dedicated Stilt Parking & Schindler Elevator Access',
      'Clear Title Deed Registered at Sub-Registrar VA'
    ],
    faqs: [
      {
        question: 'Why choose an independent builder floor in Chhatarpur?',
        answer: 'Builder floors provide superior square footage, private balconies, no society restrictions, and higher land appreciation compared to multi-storey apartments.'
      }
    ]
  },

  'flats-for-sale-in-south-delhi': {
    slug: 'flats-for-sale-in-south-delhi',
    metaTitle: 'Flats for Sale in South Delhi | 2, 3, 4 BHK Luxury Builder Floors | SS Realty',
    metaDescription: 'Find luxury flats for sale in South Delhi — Chattarpur, Mandi, Gadaipur, Ghitorni & Jonapur. Premium amenities, up to 80% NBFC loan & registry. Contact SS Realty.',
    h1: 'Flats for Sale in South Delhi',
    subheading: 'Discover Premium Residential Homes Across Premier South Delhi Locations',
    canonicalUrl: 'https://ssrealty.org/flats-for-sale-in-south-delhi',
    filters: { location: 'South Delhi' },
    introParagraphs: [
      'South Delhi is renowned for its high quality of life, green environment, and top-tier infrastructure. SS Realty specializes in constructing and delivering high-end builder floors across Chattarpur, Mandi, Jonapur, Chandan Hola, and Gadaipur.',
      'Whether you are looking for an investment property or a dream home for your family, our residential offerings deliver unmatched build quality and architectural refinement.'
    ],
    features: [
      'Prime Locations in South Delhi Belt',
      'Registry & Up to 80% Loan Facility from Leading NBFCs',
      'Stilt Car Parking, Lifts & Modern Amenities',
      'Zero Middleman Commission / Direct Developer Prices'
    ],
    faqs: [
      {
        question: 'Why choose SS Realty for buying a flat in South Delhi?',
        answer: 'SS Realty is a self-build developer with over 15 years of construction expertise in South Delhi NCR. We offer direct developer dealing with zero brokerage and 100% legal transparency.'
      }
    ]
  },

  '2bhk-flats-for-sale-south-delhi': {
    slug: '2bhk-flats-for-sale-south-delhi',
    metaTitle: '2 BHK Flats for Sale in South Delhi | Budget Friendly Homes | SS Realty',
    metaDescription: 'Buy 2 BHK flats for sale in South Delhi starting ₹35 Lakhs. Up to 80% NBFC loan approved, registry available, modular kitchen & lift parking. Direct developer dealing.',
    h1: '2 BHK Flats for Sale in South Delhi',
    subheading: 'Affordable Luxury Homes in Chattarpur, Mandi & Jonapur',
    canonicalUrl: 'https://ssrealty.org/2bhk-flats-for-sale-south-delhi',
    filters: { location: 'South Delhi', bedrooms: 2 },
    introParagraphs: [
      'Looking for a budget 2 BHK flat in South Delhi without compromising on quality? SS Realty offers stylish 2-bedroom builder floors featuring elegant interiors, modular fittings, and convenient road connectivity.',
      'Perfect for nuclear families, young working professionals, and smart property investors.'
    ],
    features: [
      'Prices Starting from ₹35 Lakhs Onwards',
      'Up to 80% Loan Support from Leading NBFCs',
      'Gated Complex with Security CCTV & Lift Access'
    ],
    faqs: [
      {
        question: 'What documents are required for booking a 2 BHK flat in South Delhi?',
        answer: 'You need basic KYC documents (Aadhaar, PAN, Income Proof) for home loan processing through NBFCs. Title deeds and registry approvals are handled smoothly by our expert legal team.'
      }
    ]
  },

  '3-bhk-flats-in-south-delhi': {
    slug: '3-bhk-flats-in-south-delhi',
    metaTitle: '3 BHK Flats in South Delhi | Luxury Builder Floors | SS Realty',
    metaDescription: 'Spacious 3 BHK luxury flats in South Delhi for sale. Stilt parking, elevator, modular kitchen & prime connectivity to Gurgaon & Saket. Call SS Realty.',
    h1: '3 BHK Luxury Flats in South Delhi',
    subheading: 'High-End 3 Bedroom Residences Built for Modern Living',
    canonicalUrl: 'https://ssrealty.org/3-bhk-flats-in-south-delhi',
    filters: { location: 'South Delhi', bedrooms: 3 },
    introParagraphs: [
      'Experience spacious living in South Delhi with SS Realty\'s signature 3 BHK builder floors. Our projects combine contemporary design, branded sanitaryware, digital locks, and open green surroundings.'
    ],
    features: [
      'Spacious 3 Bedrooms with Balconies & Attached Baths',
      'High-Speed Elevator & Reserved Covered Car Parking',
      '15 Mins Drive to Cyber City Gurgaon & Aerocity'
    ],
    faqs: [
      {
        question: 'Are 3 BHK flats in South Delhi available on registry?',
        answer: 'Yes, all SS Realty properties in South Delhi are registry properties with up to 80% loan facilities through leading NBFCs.'
      }
    ]
  },

  'flats-in-mandi': {
    slug: 'flats-in-mandi',
    metaTitle: 'Flats in Mandi Gurgaon / South Delhi | 2 & 3 BHK Builder Floors | SS Realty',
    metaDescription: 'Explore modern 2 BHK & 3 BHK flats in Mandi near Gurgaon & Chattarpur border. Affordable prices, peaceful green area, up to 80% NBFC loan & registry. Contact SS Realty.',
    h1: 'Flats in Mandi, South Delhi (Near Gurgaon Border)',
    subheading: 'Serene Residential Living Right at the Intersection of Delhi & Gurgaon',
    canonicalUrl: 'https://ssrealty.org/flats-in-mandi',
    filters: { location: 'Mandi' },
    introParagraphs: [
      'Mandi (South Delhi / Gurgaon Border) has emerged as an unbeatable real estate destination due to its proximity to Gurgaon Cyber City, Golf Course Road, and Chattarpur Metro.',
      'SS Realty offers premium 2 BHK, 3 BHK, and 4 BHK builder floors in Mandi with wide roads, peaceful surroundings, and rapid capital appreciation.'
    ],
    features: [
      'Strategically Situated between Chattarpur & Golf Course Extension Gurgaon',
      'Lush Green Farmhouse Belt Air Quality',
      'Up to 80% NBFC Loan & Clear Title Registry'
    ],
    faqs: [
      {
        question: 'Why should I invest in Mandi flats near Gurgaon?',
        answer: 'Mandi offers lower property prices than core Gurgaon while providing quick 10-15 minute commuting distance to Cyber City and Golf Course Road.'
      }
    ]
  },

  '2-bhk-flats-in-mandi': {
    slug: '2-bhk-flats-in-mandi',
    metaTitle: '2 BHK Flats in Mandi South Delhi / Gurgaon Border | SS Realty',
    metaDescription: 'Budget 2 BHK flats in Mandi Gurgaon border for sale. Registry property, up to 80% NBFC loan facility, stilt parking & modular kitchen. Direct builder price.',
    h1: '2 BHK Flats in Mandi, South Delhi',
    subheading: 'Smart 2 Bedroom Homes Near Golf Course Road & MG Road',
    canonicalUrl: 'https://ssrealty.org/2-bhk-flats-in-mandi',
    filters: { location: 'Mandi', bedrooms: 2 },
    introParagraphs: [
      'Get your own 2 BHK flat in Mandi at half the price of Gurgaon properties. Enjoy high-speed access to Gurgaon IT hubs and Delhi Metro networks.'
    ],
    features: [
      'Direct Commute to Golf Course Road & MG Road Gurgaon',
      'Affordable Entry Price with High Rental Yield',
      'Stilt Car Parking & Lift Facility'
    ],
    faqs: [
      {
        question: 'Is loan available on Mandi 2 BHK flats?',
        answer: 'Yes, home loans up to 80% from leading NBFCs are available for qualified buyers.'
      }
    ]
  },

  'flats-in-gadaipur': {
    slug: 'flats-in-gadaipur',
    metaTitle: 'Flats in Gadaipur South Delhi | Luxury Builder Floors | SS Realty',
    metaDescription: 'Exclusive 2, 3 & 4 BHK builder floors in Gadaipur near Chattarpur. Farmhouse green belt, peaceful surroundings, registry & up to 80% NBFC loan. Book site visit with SS Realty.',
    h1: 'Flats in Gadaipur, South Delhi',
    subheading: 'Luxury Builder Floors Surrounded by Pristine Farmhouses & Greenery',
    canonicalUrl: 'https://ssrealty.org/flats-in-gadaipur',
    filters: { location: 'Gadaipur' },
    introParagraphs: [
      'Gadaipur is famed for its sprawling luxury farmhouses and tranquil residential environment. SS Realty brings premium builder floors in Gadaipur for those who seek luxury, privacy, and fresh air in South Delhi.'
    ],
    features: [
      'Farmhouse Surroundings & Pollution-Free Area',
      'Exclusive Low-Density Construction',
      'Direct Access to Sultanpur & Chattarpur Metro'
    ],
    faqs: [
      {
        question: 'Are flats in Gadaipur good for peaceful family living?',
        answer: 'Gadaipur is one of the quietest and greenest residential belts in South Delhi, ideal for peaceful living with close proximity to Saket and Gurgaon.'
      }
    ]
  },

  'flats-near-gwal-pahari-gurgaon': {
    slug: 'flats-near-gwal-pahari-gurgaon',
    metaTitle: 'Flats in Gwal Pahari Gurgaon / Delhi Border | 2, 3, 4 BHK | SS Realty',
    metaDescription: 'Find luxury flats for sale in Gwal Pahari, Gurgaon-Delhi border. Close to Golf Course Road, Cyber City & TERI. Up to 80% NBFC loan approved homes by SS Realty.',
    h1: 'Flats in Gwal Pahari, Gurgaon / Delhi Border',
    subheading: 'Premium Luxury Living Along Gurgaon-Faridabad Expressway',
    canonicalUrl: 'https://ssrealty.org/flats-near-gwal-pahari-gurgaon',
    filters: { location: 'Gwal Pahari' },
    introParagraphs: [
      'Gwal Pahari is a prime strategic hot-spot connecting Gurgaon, Delhi, and Faridabad. Surrounded by Aravalli hills and luxury developments, SS Realty offers state-of-the-art builder floors and apartments in Gwal Pahari.'
    ],
    features: [
      'Minutes Away from Golf Course Road Gurgaon',
      'Aravalli Mountain View & Scenic Environment',
      'High Capital Growth & Strategic Connectivity'
    ],
    faqs: [
      {
        question: 'How far is Gwal Pahari from Golf Course Road Gurgaon?',
        answer: 'Gwal Pahari is just a 5 to 7 minute smooth drive from Golf Course Road and Sector 55-56 Rapid Metro Station.'
      }
    ]
  },

  'ready-to-move-flats-in-gurgaon': {
    slug: 'ready-to-move-flats-in-gurgaon',
    metaTitle: 'Ready to Move Flats in Gurgaon & Border Areas | SS Realty',
    metaDescription: 'Looking for ready to move 2, 3 & 4 BHK builder floors in Gurgaon, Gwal Pahari & Mandi? Immediate possession, up to 80% NBFC loan & registry. Contact SS Realty.',
    h1: 'Ready to Move Flats in Gurgaon & Delhi Border',
    subheading: 'Immediate Possession Builder Floors with Instant Possession & Registry',
    canonicalUrl: 'https://ssrealty.org/ready-to-move-flats-in-gurgaon',
    filters: { location: 'Gurgaon' },
    introParagraphs: [
      'Move into your dream home without waiting! SS Realty offers ready-to-move builder floors in Gurgaon, Mandi, and Gwal Pahari with complete occupancy readiness, power backup, and modern amenities.'
    ],
    features: [
      'Zero Construction Risk — Immediate Possession',
      '100% Verified Legal Documentation',
      'Up to 80% NBFC Loan Support & Quick Registration'
    ],
    faqs: [
      {
        question: 'Can I get immediate possession after home loan approval?',
        answer: 'Yes, all our ready-to-move properties allow immediate handover upon agreement execution and loan disbursement.'
      }
    ]
  }
};

export const SEO_SLUG_ALIASES: Record<string, string> = {
  '3-bhk-flat-in-chatarpur': '3-bhk-flat-in-chattarpur',
  '3-bhk-flats-in-chatarpur': '3-bhk-flat-in-chattarpur',
  '3-bhk-flats-in-chttarpur': '3-bhk-flat-in-chattarpur',
  '3-bhk-flats-in-chhatarpur': '3-bhk-flat-in-chattarpur',
  '3-bhk-flats-in-chattarpur': '3-bhk-flat-in-chattarpur',
  'builder-floor-in-chattarpur': '3-bhk-flat-in-chattarpur',
};

export function getSeoLandingPage(slug: string): SeoLandingPageConfig | null {
  if (SEO_LANDING_PAGES[slug]) {
    return SEO_LANDING_PAGES[slug];
  }

  const normalized = (slug || '').toLowerCase();
  const targetKey = SEO_SLUG_ALIASES[normalized];
  if (targetKey && SEO_LANDING_PAGES[targetKey]) {
    return {
      ...SEO_LANDING_PAGES[targetKey],
      slug: normalized,
    };
  }

  return null;
}

export function getAllSeoSlugs(): string[] {
  const set = new Set([...Object.keys(SEO_LANDING_PAGES), ...Object.keys(SEO_SLUG_ALIASES)]);
  return Array.from(set);
}
