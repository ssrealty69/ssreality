import mongoose from 'mongoose';

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb+srv://admin:2eQLgGd1nMSssR8P@ssrealty.kmrmgno.mongodb.net/SSRealty?authSource=admin&appName=SSRealty';

const BlogSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true, index: true },
    excerpt: { type: String, required: true },
    content: { type: String, required: true },
    coverImage: { type: String, required: true },
    author: {
      name: { type: String, required: true },
      image: { type: String },
    },
    category: { type: String, required: true, index: true },
    tags: [{ type: String }],
    status: { type: String, enum: ['draft', 'published', 'scheduled'], default: 'published', index: true },
    publishDate: { type: Date },
    published: { type: Boolean, default: true, index: true },
    views: { type: Number, default: 0 },
    seo: {
      title: { type: String },
      description: { type: String },
      keywords: { type: String },
      focusKeyword: { type: String },
      canonicalUrl: { type: String },
    },
    linkedPropertyId:   { type: String, default: '' },
    linkedPropertyName: { type: String, default: '' },
  },
  { timestamps: true }
);

const Blog = mongoose.models.Blog || mongoose.model('Blog', BlogSchema);

const blogData = {
  title: '3 BHK Flats in Mandi New Delhi with 90% Loan — The Nivasa II Complete Buyer Guide, Price, Floor Plan & Video Tour',
  slug: '3-bhk-flats-in-mandi-new-delhi-with-90-loan-nivasa',
  excerpt: 'Looking for a luxury 3 BHK flat in Mandi, South Delhi with up to 90% bank loan? Explore The Nivasa II by SS Realty featuring premium modular kitchen, lift, stilt parking, video walkthrough, real interior photos, price breakdown, and seamless Delhi-Gurgaon connectivity.',
  category: 'Buying Guide & Project Review',
  tags: [
    '3 BHK Flats In Mandi New Delhi',
    'The Nivasa II',
    '3 BHK Flat with 90% Loan',
    'Flats in Mandi South Delhi',
    'Mandi Road Builder Floor',
    '3 BHK Ready to Move Flats Delhi',
    'Flats in Chattarpur Mandi',
    'SS Realty The Nivasa',
    'Delhi Gurgaon Connectivity'
  ],
  author: {
    name: 'SS Realty Editorial & Advisory Team',
    image: 'https://ssrealty.org/SS%20Realty%20Official%20Logo.png'
  },
  coverImage: '/blog/3-bhk-flats-in-mandi-new-delhi-living-room.jpg',
  published: true,
  status: 'published',
  publishDate: new Date(),
  views: 260,
  linkedPropertyId: '6a210f719c435ca44605f9ad',
  linkedPropertyName: 'Nivasa II 3BHK Premium Builder Floor',
  seo: {
    title: '3 BHK Flats in Mandi New Delhi with 90% Loan | The Nivasa II - SS Realty',
    description: 'Discover luxury 3 BHK flats in Mandi, South Delhi with 90% bank loan facility at The Nivasa II. Watch complete video walkthrough, view real inside photos, floor plan, and EMI breakdown.',
    focusKeyword: '3 BHK Flats In Mandi New Delhi With 90% Loan',
    keywords: '3 BHK Flats In Mandi New Delhi With 90% Loan, 3 BHK Flats in Mandi New Delhi, The Nivasa II Mandi, Flat in Mandi South Delhi, 3 BHK Builder Floor Mandi Delhi, Flats in Mandi with 90% Bank Loan, Ready to Move 3 BHK Mandi Village, Flats near Chattarpur Mandi Road, Luxury Flats in South Delhi Mandi, SS Realty The Nivasa',
    canonicalUrl: 'https://ssrealty.org/blog/3-bhk-flats-in-mandi-new-delhi-with-90-loan-nivasa'
  },
  content: `
<div class="blog-article space-y-10 text-gray-800 leading-relaxed font-normal">

  <!-- ==================== 1. AIO / GEO EXECUTIVE SUMMARY SNIPPET ==================== -->
  <div class="p-6 md:p-8 bg-gradient-to-br from-amber-50/90 via-white to-amber-100/60 rounded-3xl border-2 border-[#C9A227]/40 shadow-md">
    <div class="flex items-center gap-3 mb-4">
      <span class="p-2.5 bg-[#C9A227] text-[#1A1800] rounded-xl font-black text-xs uppercase tracking-wider">Quick Insight</span>
      <h3 class="text-xl md:text-2xl font-black text-[#1A1800] tracking-tight">
        3 BHK Flats in Mandi, New Delhi (The Nivasa II) at a Glance
      </h3>
    </div>
    <div class="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-700 font-medium">
      <div class="bg-white/90 p-4 rounded-2xl border border-amber-200 shadow-xs">
        <p class="font-bold text-[#1A1800] mb-1">Location & Strategic Advantage:</p>
        <p>Mandi Village, Mandi Road, South Delhi (5 mins from Gurgaon-Faridabad Rd, 12 mins to Chattarpur Metro, 18 mins to Cyber City & Golf Course Rd).</p>
      </div>
      <div class="bg-white/90 p-4 rounded-2xl border border-amber-200 shadow-xs">
        <p class="font-bold text-[#1A1800] mb-1">Loan & Financial Flexibility:</p>
        <p>Up to <strong>90% Bank & NBFC Loan approval</strong> available. Pay only 10% down payment and own a luxury 3 BHK builder floor in South Delhi.</p>
      </div>
      <div class="bg-white/90 p-4 rounded-2xl border border-amber-200 shadow-xs">
        <p class="font-bold text-[#1A1800] mb-1">Layout & Configuration:</p>
        <p>3 Spacious Bedrooms, 2/3 Modern Bathrooms, Large Living Lounge, Italian Modular Kitchen, Balconies with Aravalli green views (~1350–1450 sq.ft).</p>
      </div>
      <div class="bg-white/90 p-4 rounded-2xl border border-amber-200 shadow-xs">
        <p class="font-bold text-[#1A1800] mb-1">Building Amenities:</p>
        <p>Stilt Car Parking, High-Speed Automatic Lift, Gated Society, 24/7 Water Supply (Submersible + Overhead Tanks), BSES Electricity, CCTV Security.</p>
      </div>
    </div>
  </div>

  <!-- ==================== 2. INTRODUCTION ==================== -->
  <section class="space-y-4">
    <h2 class="text-2xl md:text-3xl font-extrabold text-[#1A1800] tracking-tight">
      1. Why 3 BHK Flats in Mandi, New Delhi Are the Top Choice for Smart Homebuyers in 2026
    </h2>
    <p>
      Finding an affordable, spacious, and luxury home in South Delhi has become increasingly challenging with skyrocketing real estate prices in areas like Greater Kailash, Saket, and Vasant Kunj. However, <strong>Mandi (located on Mandi Road, South Delhi)</strong> has emerged as the premier residential hotspot for families, working professionals, and real estate investors looking for <strong>high capital appreciation, serene greenery, and unbeatable connectivity to both Delhi and Gurugram</strong>.
    </p>
    <p>
      Situated right along the scenic South Delhi farm belts and adjacent to the Aravalli biodiversity corridor, Mandi offers the tranquility of pollution-free living without sacrificing cosmopolitan convenience. With the expansion of Mandi Road and direct connectivity to the Gurgaon-Faridabad Expressway, residents can reach <strong>DLF Cyber Hub in 20 minutes and Chattarpur Metro in just 12 minutes</strong>.
    </p>
    <p>
      Among the flagship developments in this belt, <a href="https://ssrealty.org/properties/nivasa-ii" class="text-[#B8860B] font-extrabold underline hover:text-[#9a6f08]">The Nivasa II by SS Realty</a> stands out as an architectural masterpiece, offering <strong>ultra-luxury 3 BHK builder floors backed by up to 90% hassle-free bank loan facilities</strong>.
    </p>
  </section>

  <!-- ==================== 3. CLEAN COMPACT VIDEO WALKTHROUGH SECTION ==================== -->
  <section class="space-y-3 my-6">
    <div class="p-4 md:p-5 bg-white rounded-2xl border border-stone-200 shadow-sm">
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-3">
        <div>
          <span class="px-2.5 py-0.5 bg-amber-100 text-[#8B6914] text-[11px] font-black uppercase rounded-md tracking-wide">Video Tour</span>
          <h3 class="text-base md:text-lg font-bold text-stone-900 mt-1">
            3 BHK Luxury Flat in Mandi (The Nivasa II) — Video Walkthrough
          </h3>
        </div>
        <a 
          href="tel:+919311059100" 
          class="inline-flex items-center justify-center gap-1.5 px-4 py-2 bg-[#8B6914] hover:bg-[#72540F] text-white font-bold text-xs rounded-xl shadow-xs transition-all shrink-0 cursor-pointer"
        >
          <span>Schedule Site Visit: +91 93110 59100</span>
        </a>
      </div>

      <!-- Compact 16:9 Video Frame -->
      <div class="relative w-full overflow-hidden rounded-xl border border-stone-200 shadow-sm" style="padding-top: 56.25%;">
        <iframe 
          class="absolute top-0 left-0 w-full h-full"
          src="https://www.youtube.com/embed/jQme6-XPOUs?si=oeupdtbDJRON4AGj" 
          title="3 BHK Flats in Mandi New Delhi - The Nivasa II Walkthrough" 
          frameborder="0" 
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" 
          allowfullscreen>
        </iframe>
      </div>
      <p class="text-xs text-stone-500 mt-2 font-medium">
        Actual sample flat walkthrough of 3 BHK Luxury Builder Floor at The Nivasa II, Mandi Village, South Delhi.
      </p>
    </div>
  </section>

  <!-- ==================== 4. REAL INTERIOR PHOTOS & ARCHITECTURAL HIGHLIGHTS ==================== -->
  <section class="space-y-6">
    <h2 class="text-2xl md:text-3xl font-extrabold text-[#1A1800] tracking-tight">
      2. Step Inside The Nivasa II: Premium Interiors & Detailed Photo Tour
    </h2>
    <p>
      Every corner of <strong>The Nivasa II</strong> has been crafted with meticulous attention to detail, maximizing natural cross-ventilation, expansive floor space, and contemporary aesthetics. Let us take a detailed tour through the actual living spaces:
    </p>

    <!-- Photo 1: Living & Dining -->
    <div class="bg-white rounded-2xl border border-stone-200 overflow-hidden shadow-sm my-5">
      <img 
        src="/blog/3-bhk-flats-in-mandi-new-delhi-living-room.jpg" 
        alt="Spacious 3 BHK Living Room and Open Modular Kitchen in The Nivasa II Mandi New Delhi" 
        class="w-full h-auto object-cover max-h-[500px]"
        loading="lazy"
      />
      <div class="p-4 bg-stone-50/70 border-t border-stone-100">
        <h4 class="font-bold text-stone-900 text-sm mb-1">Grand Living & Dining Lounge with Designer False Ceiling</h4>
        <p class="text-xs text-stone-600">
          The living room features high-grade Italian-pattern vitrified tiles, warm cove lighting, custom wall paneling, and an open layout connecting seamlessly with the modular kitchen area, creating a regal ambiance for hosting guests.
        </p>
      </div>
    </div>

    <!-- Photo 2: Living Lounge Wainscoting Wall Art -->
    <div class="bg-white rounded-2xl border border-stone-200 overflow-hidden shadow-sm my-5">
      <img 
        src="/blog/3-bhk-flats-in-mandi-new-delhi-modular-kitchen.jpg" 
        alt="Living room with royal wainscoting wall paneling in 3 BHK flat Mandi South Delhi" 
        class="w-full h-auto object-cover max-h-[500px]"
        loading="lazy"
      />
      <div class="p-4 bg-stone-50/70 border-t border-stone-100">
        <h4 class="font-bold text-stone-900 text-sm mb-1">European Style Wall Moldings & Ambient Illumination</h4>
        <p class="text-xs text-stone-600">
          Sophisticated wainscoting moldings on the accent wall paired with recessed LED spotlights bring a Parisian luxury vibe to everyday living in South Delhi.
        </p>
      </div>
    </div>

    <!-- Photo 3 & 4: Master Bedroom & Balcony View Grid -->
    <div class="grid grid-cols-1 md:grid-cols-2 gap-4 my-5">
      <div class="bg-white rounded-2xl border border-stone-200 overflow-hidden shadow-sm">
        <img 
          src="/blog/3-bhk-flats-in-mandi-new-delhi-master-bedroom.jpg" 
          alt="Master bedroom with upholstered headboard in 3 BHK flat Mandi New Delhi" 
          class="w-full h-auto object-cover max-h-[380px]"
          loading="lazy"
        />
        <div class="p-4 bg-stone-50/70 border-t border-stone-100">
          <h4 class="font-bold text-stone-900 text-sm mb-1">Master Bedroom with Acoustic Window</h4>
          <p class="text-xs text-stone-600">
            King-size bedroom equipped with premium floor-to-ceiling wooden wardrobes, cushioned headboards, and large soundproof windows overlooking green foliage.
          </p>
        </div>
      </div>

      <div class="bg-white rounded-2xl border border-stone-200 overflow-hidden shadow-sm">
        <img 
          src="/blog/3-bhk-flats-in-mandi-new-delhi-bedroom-balcony.jpg" 
          alt="Bedroom with sliding balcony glass doors in The Nivasa II Mandi Delhi" 
          class="w-full h-auto object-cover max-h-[380px]"
          loading="lazy"
        />
        <div class="p-4 bg-stone-50/70 border-t border-stone-100">
          <h4 class="font-bold text-stone-900 text-sm mb-1">Attached Balcony with Private Tree-Lined Views</h4>
          <p class="text-xs text-stone-600">
            Full-height UPVC sliding glass doors open directly to a spacious private balcony where you can enjoy your morning tea amidst chirping birds and fresh breeze.
          </p>
        </div>
      </div>
    </div>

    <!-- Photo 5: Deluxe Bedroom Angle -->
    <div class="bg-white rounded-2xl border border-stone-200 overflow-hidden shadow-sm my-5">
      <img 
        src="/blog/3-bhk-flats-in-mandi-new-delhi-nivasa-interior.jpg" 
        alt="Spacious 3 BHK Bedroom Interior at The Nivasa II Mandi South Delhi" 
        class="w-full h-auto object-cover max-h-[480px]"
        loading="lazy"
      />
      <div class="p-4 bg-stone-50/70 border-t border-stone-100">
        <h4 class="font-bold text-stone-900 text-sm mb-1">En-Suite Dressing & Designer Bathrooms</h4>
        <p class="text-xs text-stone-600">
          Modern bathroom fittings with branded Jaguar/Cera sanitaryware, anti-skid floor tiles, vanity mirrors, and separate wet/dry zones.
        </p>
      </div>
    </div>
  </section>

  <!-- ==================== 5. TECHNICAL SPECIFICATIONS & AMENITIES TABLE ==================== -->
  <section class="space-y-4">
    <h2 class="text-2xl md:text-3xl font-extrabold text-[#1A1800] tracking-tight">
      3. Complete Project Specifications: The Nivasa II
    </h2>
    <p>
      Below is the comprehensive technical breakdown of building infrastructure, structural design, and unit specifications at The Nivasa II:
    </p>

    <div class="overflow-x-auto rounded-2xl border border-stone-200 shadow-sm my-4">
      <table class="w-full text-left text-sm text-stone-700 border-collapse bg-white">
        <thead class="bg-[#8B6914] text-white uppercase text-xs font-bold tracking-wider">
          <tr>
            <th class="py-3 px-4 border-b border-stone-200">Feature / Specification</th>
            <th class="py-3 px-4 border-b border-stone-200">Details & Quality Standards</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-stone-100">
          <tr class="hover:bg-amber-50/40 transition-colors">
            <td class="py-3 px-4 font-bold text-stone-900">Typology & Layout</td>
            <td class="py-3 px-4">3 Bedrooms + 2/3 Bathrooms + Spacious Living & Dining + Kitchen + 2 Balconies</td>
          </tr>
          <tr class="hover:bg-amber-50/40 transition-colors">
            <td class="py-3 px-4 font-bold text-stone-900">Super Built-up Area</td>
            <td class="py-3 px-4">Approx. 1,350 sq.ft to 1,450 sq.ft</td>
          </tr>
          <tr class="hover:bg-amber-50/40 transition-colors">
            <td class="py-3 px-4 font-bold text-stone-900">Structure & Elevation</td>
            <td class="py-3 px-4">Earthquake-resistant RCC framed structure (Stilt + 4 Floors)</td>
          </tr>
          <tr class="hover:bg-amber-50/40 transition-colors">
            <td class="py-3 px-4 font-bold text-stone-900">Elevator / Lift</td>
            <td class="py-3 px-4">Fully Automatic 6-Passenger High-Speed Lift with ARD safety device</td>
          </tr>
          <tr class="hover:bg-amber-50/40 transition-colors">
            <td class="py-3 px-4 font-bold text-stone-900">Car Parking</td>
            <td class="py-3 px-4">Dedicated Stilt Parking Bay for 1 Car + Two-Wheeler per unit</td>
          </tr>
          <tr class="hover:bg-amber-50/40 transition-colors">
            <td class="py-3 px-4 font-bold text-stone-900">Kitchen Amenities</td>
            <td class="py-3 px-4">Modular cabinets with hydraulic hinges, Granite/Quartz top, Chimney provision, Double bowl sink</td>
          </tr>
          <tr class="hover:bg-amber-50/40 transition-colors">
            <td class="py-3 px-4 font-bold text-stone-900">Flooring & Finishes</td>
            <td class="py-3 px-4">Double-charged Glazed Vitrified Italian Marble-Finish Tiles in all rooms</td>
          </tr>
          <tr class="hover:bg-amber-50/40 transition-colors">
            <td class="py-3 px-4 font-bold text-stone-900">Water & Utilities</td>
            <td class="py-3 px-4">24-Hour Sweet Water Supply, Dedicated Overhead Water Tanks, Submersible Pump</td>
          </tr>
          <tr class="hover:bg-amber-50/40 transition-colors">
            <td class="py-3 px-4 font-bold text-stone-900">Electricity & Metering</td>
            <td class="py-3 px-4">Individual BSES Rajdhani Electricity Meter + Inverter wiring installed</td>
          </tr>
          <tr class="hover:bg-amber-50/40 transition-colors">
            <td class="py-3 px-4 font-bold text-stone-900">Security System</td>
            <td class="py-3 px-4">Gated compound, 24/7 CCTV surveillance on all common corridors & parking</td>
          </tr>
        </tbody>
      </table>
    </div>
  </section>

  <!-- ==================== 6. 90% BANK LOAN & FINANCIAL ELIGIBILITY GUIDE ==================== -->
  <section class="space-y-4">
    <h2 class="text-2xl md:text-3xl font-extrabold text-[#1A1800] tracking-tight">
      4. How the 90% Bank Loan Facility Works (Own a Flat with Just 10% Down Payment)
    </h2>
    <p>
      One of the biggest advantages of buying at <strong>The Nivasa II</strong> is our tied-up <strong>end-to-end banking assistance</strong> with leading Nationalized Banks and Top NBFCs (including HDFC, ICICI, LIC Housing Finance, Tata Capital, PNB Housing, and leading private lenders).
    </p>

    <!-- EMI Calculation Table -->
    <div class="p-6 bg-gradient-to-r from-stone-50 via-white to-amber-50/40 rounded-2xl border border-stone-200 shadow-sm my-4">
      <h3 class="text-base md:text-lg font-bold text-stone-900 mb-2">
        Estimated Loan & EMI Calculation (Illustrative)
      </h3>
      <p class="text-xs text-stone-600 mb-4">
        *Exact loan amount and interest rates depend on applicant profile, CIBIL score (750+ recommended), and income documents. Use our <a href="https://ssrealty.org/emi-calculator" class="font-bold underline text-[#8B6914]">Online EMI Calculator</a> for instant custom calculations.
      </p>

      <div class="overflow-x-auto rounded-xl border border-stone-200">
        <table class="w-full text-left text-xs md:text-sm text-stone-700 bg-white">
          <thead class="bg-[#8B6914] text-white uppercase text-[11px] font-bold">
            <tr>
              <th class="py-3 px-3">Property Value (Approx)</th>
              <th class="py-3 px-3">Your Down Payment (10%)</th>
              <th class="py-3 px-3">Bank Loan (90%)</th>
              <th class="py-3 px-3">Approx Monthly EMI (20 Yrs @ 8.5%)</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-stone-100">
            <tr>
              <td class="py-2.5 px-3 font-bold text-stone-900">₹ 65 Lakhs</td>
              <td class="py-2.5 px-3 text-emerald-800 font-bold">₹ 6.5 Lakhs</td>
              <td class="py-2.5 px-3 text-blue-800 font-bold">₹ 58.5 Lakhs</td>
              <td class="py-2.5 px-3 font-extrabold text-stone-900">₹ 50,750 / mo</td>
            </tr>
            <tr>
              <td class="py-2.5 px-3 font-bold text-stone-900">₹ 75 Lakhs</td>
              <td class="py-2.5 px-3 text-emerald-800 font-bold">₹ 7.5 Lakhs</td>
              <td class="py-2.5 px-3 text-blue-800 font-bold">₹ 67.5 Lakhs</td>
              <td class="py-2.5 px-3 font-extrabold text-stone-900">₹ 58,560 / mo</td>
            </tr>
            <tr>
              <td class="py-2.5 px-3 font-bold text-stone-900">₹ 85 Lakhs</td>
              <td class="py-2.5 px-3 text-emerald-800 font-bold">₹ 8.5 Lakhs</td>
              <td class="py-2.5 px-3 text-blue-800 font-bold">₹ 76.5 Lakhs</td>
              <td class="py-2.5 px-3 font-extrabold text-stone-900">₹ 66,370 / mo</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Required Documents Checklist -->
    <div class="grid grid-cols-1 md:grid-cols-2 gap-4 my-4">
      <div class="p-5 bg-white rounded-2xl border border-stone-200 shadow-xs">
        <h4 class="font-bold text-stone-900 text-sm mb-2">Documentation Checklist for Salaried Buyers:</h4>
        <ul class="text-xs text-stone-600 space-y-1.5 list-disc list-inside">
          <li>Last 3 months salary slips</li>
          <li>Last 6 months bank statement (Salary account)</li>
          <li>Form 16 & ITR for last 2 years</li>
          <li>Aadhaar Card, PAN Card & 2 Passport Photos</li>
        </ul>
      </div>

      <div class="p-5 bg-white rounded-2xl border border-stone-200 shadow-xs">
        <h4 class="font-bold text-stone-900 text-sm mb-2">Documentation Checklist for Self-Employed Buyers:</h4>
        <ul class="text-xs text-stone-600 space-y-1.5 list-disc list-inside">
          <li>Last 3 years ITR with computation of income & balance sheet</li>
          <li>Last 12 months current & savings bank statement</li>
          <li>Business Registration proof (GST / MSME / Shop Act)</li>
          <li>KYC documents (PAN, Aadhaar, Office Address proof)</li>
        </ul>
      </div>
    </div>
  </section>

  <!-- ==================== 7. LOCATION & CONNECTIVITY ADVANTAGE ==================== -->
  <section class="space-y-4">
    <h2 class="text-2xl md:text-3xl font-extrabold text-[#1A1800] tracking-tight">
      5. Location Map & Landmark Distances (South Delhi Meets Millennium City)
    </h2>
    <p>
      The key unique selling proposition (USP) of Mandi Road is that it acts as the <strong>golden bridge between South Delhi's heritage charm and Gurugram's corporate hub</strong>.
    </p>

    <div class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 my-4">
      <div class="p-3.5 bg-amber-50/70 rounded-xl border border-amber-200 text-center">
        <p class="text-xs text-stone-500 font-bold uppercase">Chattarpur Metro</p>
        <p class="text-base font-black text-stone-900 mt-0.5">12 Mins</p>
        <p class="text-[10px] text-stone-500">Yellow Line Metro</p>
      </div>
      <div class="p-3.5 bg-blue-50/70 rounded-xl border border-blue-200 text-center">
        <p class="text-xs text-stone-500 font-bold uppercase">Gwal Pahari</p>
        <p class="text-base font-black text-stone-900 mt-0.5">5 Mins</p>
        <p class="text-[10px] text-stone-500">Gurgaon Border</p>
      </div>
      <div class="p-3.5 bg-emerald-50/70 rounded-xl border border-emerald-200 text-center">
        <p class="text-xs text-stone-500 font-bold uppercase">Cyber Hub / DLF</p>
        <p class="text-base font-black text-stone-900 mt-0.5">20 Mins</p>
        <p class="text-[10px] text-stone-500">Rapid Travel</p>
      </div>
      <div class="p-3.5 bg-stone-100 rounded-xl border border-stone-200 text-center">
        <p class="text-xs text-stone-500 font-bold uppercase">IGI Airport (T3)</p>
        <p class="text-base font-black text-stone-900 mt-0.5">30 Mins</p>
        <p class="text-[10px] text-stone-500">Via Mahipalpur/Aero</p>
      </div>
    </div>

    <ul class="space-y-2 text-sm text-stone-700 list-disc list-inside bg-white p-5 rounded-2xl border border-stone-200">
      <li><strong>Reputed Schools Nearby:</strong> Pathways School Gurgaon, The Heritage School, St. Mary's School, GD Goenka World School (within 10-15 mins).</li>
      <li><strong>Hospitals & Healthcare:</strong> Fortis Hospital Vasant Kunj, Max Super Speciality Hospital Saket, and Medanta Mediclinic (15-25 mins).</li>
      <li><strong>Retail & Shopping:</strong> DLF Promenade Vasant Kunj, Select CITYWALK Saket, Ambience Mall Vasant Kunj, and local daily markets in Mandi Village.</li>
      <li><strong>Greenery & AQI:</strong> Surrounded by sprawling luxury farmhouses (Dalmia Farms, Radhey Mohan Drive) and the Asola Bhatti Wildlife Sanctuary, giving Mandi significantly lower pollution levels compared to Central Delhi.</li>
    </ul>
  </section>

  <!-- ==================== 8. COMPARISON TABLE: MANDI VS CHATTARPUR VS GURGAON ==================== -->
  <section class="space-y-4">
    <h2 class="text-2xl md:text-3xl font-extrabold text-[#1A1800] tracking-tight">
      6. Comparative Analysis: Mandi Road vs Chattarpur Main vs Gurgaon Core
    </h2>
    <p>
      To help you make an informed decision, let us compare buying a 3 BHK flat in Mandi Road against other nearby micro-markets:
    </p>

    <div class="overflow-x-auto rounded-2xl border border-stone-200 shadow-sm my-4">
      <table class="w-full text-left text-xs md:text-sm text-stone-700 bg-white">
        <thead class="bg-[#8B6914] text-white uppercase text-[11px] font-bold">
          <tr>
            <th class="py-3 px-3">Parameter</th>
            <th class="py-3 px-3 bg-[#72540F] text-white font-black">The Nivasa II (Mandi)</th>
            <th class="py-3 px-3">Chattarpur Main</th>
            <th class="py-3 px-3">Gurgaon Core (Golf Course)</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-stone-100">
          <tr>
            <td class="py-2.5 px-3 font-bold">3 BHK Price Bracket</td>
            <td class="py-2.5 px-3 font-extrabold text-emerald-800 bg-amber-50/50">₹ 65 L – ₹ 85 Lakhs</td>
            <td class="py-2.5 px-3">₹ 75 L – ₹ 1.2 Crore</td>
            <td class="py-2.5 px-3">₹ 2.5 Crore – ₹ 5 Crore+</td>
          </tr>
          <tr>
            <td class="py-2.5 px-3 font-bold">Loan Availability</td>
            <td class="py-2.5 px-3 font-extrabold text-emerald-800 bg-amber-50/50">Up to 90% Approved</td>
            <td class="py-2.5 px-3">70% – 80%</td>
            <td class="py-2.5 px-3">75% – 80%</td>
          </tr>
          <tr>
            <td class="py-2.5 px-3 font-bold">Surrounding Environment</td>
            <td class="py-2.5 px-3 font-medium bg-amber-50/50">Lush Green Farms & Serene AQI</td>
            <td class="py-2.5 px-3">Densely populated urban</td>
            <td class="py-2.5 px-3">High-density concrete towers</td>
          </tr>
          <tr>
            <td class="py-2.5 px-3 font-bold">Delhi/Gurgaon Dual Access</td>
            <td class="py-2.5 px-3 font-extrabold text-emerald-800 bg-amber-50/50">5 mins to both borders</td>
            <td class="py-2.5 px-3">Heavy traffic via MG Road</td>
            <td class="py-2.5 px-3">Gurgaon only (Toll jams to Delhi)</td>
          </tr>
        </tbody>
      </table>
    </div>
  </section>

  <!-- ==================== 9. FREQUENTLY ASKED QUESTIONS (FAQ SCHEMA / AEO OPTIMIZED) ==================== -->
  <section class="space-y-4 my-8">
    <h2 class="text-2xl md:text-3xl font-extrabold text-[#1A1800] tracking-tight">
      7. Frequently Asked Questions (FAQs) — 3 BHK Flats in Mandi, New Delhi
    </h2>

    <div class="space-y-3">
      <div class="p-5 bg-white rounded-2xl border border-stone-200 shadow-xs">
        <h4 class="font-bold text-stone-900 text-base mb-1">
          Q1: Is bank loan available up to 90% on 3 BHK flats in The Nivasa II Mandi?
        </h4>
        <p class="text-sm text-stone-600">
          <strong>Yes.</strong> SS Realty has direct tie-ups with leading nationalized and private banking institutions (HDFC, ICICI, LIC Housing, PNB HFL, etc.) which provide up to 90% loan for eligible salaried and self-employed buyers with transparent processing.
        </p>
      </div>

      <div class="p-5 bg-white rounded-2xl border border-stone-200 shadow-xs">
        <h4 class="font-bold text-stone-900 text-base mb-1">
          Q2: What is the starting price of 3 BHK flats in Mandi, South Delhi?
        </h4>
        <p class="text-sm text-stone-600">
          The starting price for a spacious 3 BHK luxury builder floor in Mandi is approximately <strong>₹ 65 Lakhs to ₹ 85 Lakhs</strong>, depending on the floor level, frontal road width, and custom woodwork packages.
        </p>
      </div>

      <div class="p-5 bg-white rounded-2xl border border-stone-200 shadow-xs">
        <h4 class="font-bold text-stone-900 text-base mb-1">
          Q3: What are the registry and legal papers available for The Nivasa II?
        </h4>
        <p class="text-sm text-stone-600">
          The property has a 100% crystal-clear title chain with complete chain of GPA/Registry, electricity load sanction from BSES Rajdhani, and loan approval verified by senior legal advocates.
        </p>
      </div>

      <div class="p-5 bg-white rounded-2xl border border-stone-200 shadow-xs">
        <h4 class="font-bold text-stone-900 text-base mb-1">
          Q4: How far is the nearest Metro station from Mandi Road?
        </h4>
        <p class="text-sm text-stone-600">
          <strong>Chattarpur Metro Station (Yellow Line)</strong> is just 12 minutes drive away. Qutub Minar Metro and Arjan Garh Metro are also within 15 minutes reach with frequent auto, bus, and cab availability.
        </p>
      </div>

      <div class="p-5 bg-white rounded-2xl border border-stone-200 shadow-xs">
        <h4 class="font-bold text-stone-900 text-base mb-1">
          Q5: Is covered car parking and lift provided in the building?
        </h4>
        <p class="text-sm text-stone-600">
          Yes, The Nivasa II features dedicated stilt car parking on the ground level and a high-speed automatic 6-passenger elevator serving all residential floors.
        </p>
      </div>

      <div class="p-5 bg-white rounded-2xl border border-stone-200 shadow-xs">
        <h4 class="font-bold text-stone-900 text-base mb-1">
          Q6: How can I schedule a physical site visit of The Nivasa II?
        </h4>
        <p class="text-sm text-stone-600">
          You can easily schedule a complimentary pick-and-drop site visit by calling SS Realty at <strong><a href="tel:+919311059100" class="text-[#8B6914] font-bold underline">+91 93110 59100</a></strong> or booking through our website portal.
        </p>
      </div>
    </div>
  </section>

  <!-- ==================== 10. INTERNAL LINKS & RELATED READS ==================== -->
  <section class="space-y-4 my-8 p-6 bg-stone-50 rounded-2xl border border-stone-200">
    <h3 class="text-lg font-bold text-stone-900">
      Explore Related Properties & In-Depth Buying Guides
    </h3>
    <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 text-xs font-bold text-stone-800">
      <a href="https://ssrealty.org/properties/nivasa-ii" class="p-3 bg-white rounded-xl border border-stone-200 hover:border-[#8B6914] hover:shadow-xs transition-all flex items-center gap-2">
        <span>The Nivasa II Property Page</span>
      </a>
      <a href="https://ssrealty.org/properties/velora" class="p-3 bg-white rounded-xl border border-stone-200 hover:border-[#8B6914] hover:shadow-xs transition-all flex items-center gap-2">
        <span>Velora Chattarpur Apartments</span>
      </a>
      <a href="https://ssrealty.org/properties/orchid" class="p-3 bg-white rounded-xl border border-stone-200 hover:border-[#8B6914] hover:shadow-xs transition-all flex items-center gap-2">
        <span>Orchid Mandi Road Gwal Pahari</span>
      </a>
      <a href="https://ssrealty.org/blog/delhi-circle-rate-hike-2026-buyers-guide" class="p-3 bg-white rounded-xl border border-stone-200 hover:border-[#8B6914] hover:shadow-xs transition-all flex items-center gap-2">
        <span>Delhi Circle Rate Hike 2026</span>
      </a>
      <a href="https://ssrealty.org/blog/chattarpur-vs-gwalpahari-which-location-better-flat" class="p-3 bg-white rounded-xl border border-stone-200 hover:border-[#8B6914] hover:shadow-xs transition-all flex items-center gap-2">
        <span>Chattarpur vs Gwal Pahari Comparison</span>
      </a>
      <a href="https://ssrealty.org/emi-calculator" class="p-3 bg-white rounded-xl border border-stone-200 hover:border-[#8B6914] hover:shadow-xs transition-all flex items-center gap-2">
        <span>Interactive EMI Calculator</span>
      </a>
    </div>
  </section>

  <!-- ==================== 11. CLEAN PREMIUM LIGHT CTA BOX ==================== -->
  <div class="p-6 md:p-8 bg-gradient-to-br from-amber-50 via-white to-amber-100/50 text-stone-900 rounded-3xl border-2 border-[#C9A227]/50 shadow-md text-center space-y-4">
    <span class="px-3.5 py-1 bg-[#8B6914] text-white font-extrabold text-xs uppercase rounded-full tracking-wider">
      Limited Inventory
    </span>
    <h3 class="text-2xl md:text-3xl font-extrabold text-stone-900">
      Ready to Own Your Dream 3 BHK in Mandi, South Delhi?
    </h3>
    <p class="text-sm text-stone-600 max-w-xl mx-auto">
      Only a few units remaining at <strong>The Nivasa II</strong> with 90% loan facility. Schedule your priority site visit today and get exclusive spot-booking festival discounts directly from SS Realty.
    </p>
    <div class="flex flex-wrap items-center justify-center gap-3.5 pt-2">
      <a 
        href="tel:+919311059100" 
        class="px-6 py-3 bg-[#8B6914] hover:bg-[#72540F] text-white font-bold text-sm uppercase rounded-xl transition-all shadow-sm cursor-pointer"
        style="color: #FFFFFF;"
      >
        Call: +91 93110 59100
      </a>
      <a 
        href="https://wa.me/919311059100?text=Hi%20SS%20Realty,%20I%20am%20interested%20in%20The%20Nivasa%20II%203%20BHK%20Flats%20in%20Mandi%20New%20Delhi%20with%2090%25%20Loan." 
        target="_blank" 
        class="px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm uppercase rounded-xl transition-all shadow-sm cursor-pointer"
        style="color: #FFFFFF;"
      >
        WhatsApp Inquiry
      </a>
    </div>
  </div>

</div>
`
};

async function main() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB successfully.');

    // Upsert blog by slug
    const updated = await Blog.findOneAndUpdate(
      { slug: blogData.slug },
      { $set: blogData },
      { returnDocument: 'after', upsert: true }
    );

    console.log('✅ Blog successfully updated with clean light theme and official contact numbers!');
    console.log('Title:', updated.title);
    console.log('Slug:', updated.slug);
    console.log('Live URL:', `https://ssrealty.org/blog/${updated.slug}`);

    await mongoose.disconnect();
    console.log('Disconnected from MongoDB.');
    process.exit(0);
  } catch (error) {
    console.error('Error inserting blog:', error);
    process.exit(1);
  }
}

main();
