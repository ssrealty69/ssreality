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

const updatedBlogContent = `
<div class="blog-article space-y-8 text-gray-800 leading-relaxed max-w-full overflow-hidden">

  <!-- Executive Summary Box (AIO / GEO Optimized) -->
  <div class="p-5 sm:p-7 rounded-3xl border border-[#C9A227]/40 shadow-sm" style="background: linear-gradient(135deg, #FFFDF0 0%, #FEF3C7 100%);">
    <h3 class="text-lg sm:text-xl font-extrabold text-[#1A1800] mb-3 flex items-center gap-2">
      📌 Key Takeaways: Delhi Circle Rate Hike 2026 at a Glance
    </h3>
    <ul class="space-y-2.5 text-xs sm:text-sm text-gray-800 font-medium list-disc list-inside">
      <li><strong>Revision in Progress:</strong> The Delhi Government's Revenue Department is reviewing circle rates across residential, commercial, and agricultural categories across all 8 zones (Categories A to H) to bridge the widening gap between circle rates and prevailing market prices.</li>
      <li><strong>Direct Cost Impact:</strong> Higher circle rates mean <strong>increased stamp duty, higher registration charges</strong>, and potential income tax adjustments under Section 56(2)(x) and Section 50C.</li>
      <li><strong>South Delhi Micro-Markets:</strong> High-demand residential belts like <a href="https://ssrealty.org/flats-in-chattarpur" class="text-[#B8860B] font-bold underline hover:text-[#9a6f08]">Chattarpur</a>, Jonapur, Mandi, and Sultanpur are witnessing accelerated buyer velocity as end-users lock in current registration valuations before revisions take full effect.</li>
      <li><strong>Strategic Buyer Window:</strong> Finalizing bookings in RERA-compliant or clear-title <a href="https://ssrealty.org/properties" class="text-[#B8860B] font-bold underline hover:text-[#9a6f08]">ready-to-move builder floors</a> right now shields home buyers from an immediate 15% to 35% surge in overall acquisition expenses.</li>
    </ul>
  </div>

  <!-- Section 1 -->
  <section class="space-y-3 sm:space-y-4">
    <h2 class="text-xl sm:text-3xl font-extrabold text-[#1A1800] tracking-tight leading-snug">
      1. What Are Circle Rates and Why is Delhi Revising Them in 2026?
    </h2>
    <p class="text-xs sm:text-sm text-gray-700 leading-relaxed">
      In Indian real estate, a <strong>circle rate</strong> (also known as the ready reckoner rate or guidance value) is the minimum threshold price per square meter set by the state government below which a property transaction cannot be officially registered. It serves as the baseline benchmark for computing <strong>stamp duty, registration fees, and capital gains taxes</strong>.
    </p>
    <p class="text-xs sm:text-sm text-gray-700 leading-relaxed">
      Historically, Delhi categorizes localities into <strong>eight distinct tiers—from Category A (most affluent) down to Category H (least developed)</strong>. The current standard circle rates have remained largely static in several zones since 2014, leading to massive discrepancies where actual on-ground market rates in South Delhi and prime transit corridors are anywhere from <strong>1.5x to 3x higher</strong> than the official circle rates.
    </p>
    <p class="text-xs sm:text-sm text-gray-700 leading-relaxed">
      With major infrastructure expansions—including new metro corridors, the expansion of the Mandi–Gwal Pahari road link, and urban regularization drives—the government is recalibrating these rates to reflect real market dynamics and enhance state exchequer revenue.
    </p>
  </section>

  <!-- Section 2: Category Breakdown Table with Mobile Swipe Slider -->
  <section class="space-y-3 sm:space-y-4">
    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
      <h2 class="text-xl sm:text-3xl font-extrabold text-[#1A1800] tracking-tight leading-snug">
        2. Delhi Circle Rate Categories & Valuation Slabs
      </h2>
      <span class="inline-flex items-center gap-1 text-[11px] font-bold text-[#B8860B] bg-amber-50 border border-amber-200 px-2.5 py-1 rounded-full w-fit">
        👉 Swipe table horizontally on mobile
      </span>
    </div>
    <p class="text-xs sm:text-sm text-gray-600">
      To understand how your neighborhood is impacted, review Delhi's official locality classification framework:
    </p>

    <!-- Scrollable container with fixed min-width to prevent squishing -->
    <div class="overflow-x-auto rounded-2xl border border-gray-200 shadow-sm custom-scrollbar" style="-webkit-overflow-scrolling: touch;">
      <table class="w-full text-left text-xs sm:text-sm text-gray-700 border-collapse" style="min-width: 620px;">
        <thead class="bg-[#1A1800] text-[#C9A227] text-xs uppercase font-extrabold">
          <tr>
            <th class="p-3 sm:p-3.5 whitespace-nowrap" style="width: 15%;">Category</th>
            <th class="p-3 sm:p-3.5" style="width: 40%;">Sample Localities</th>
            <th class="p-3 sm:p-3.5 whitespace-nowrap" style="width: 25%;">Base Land Rate (₹/sq.m)</th>
            <th class="p-3 sm:p-3.5 whitespace-nowrap" style="width: 20%;">2026 Revision</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-gray-100 bg-white">
          <tr class="hover:bg-amber-50/40">
            <td class="p-3 sm:p-3.5 font-bold text-gray-900 whitespace-nowrap">Category A</td>
            <td class="p-3 sm:p-3.5">Golf Links, Vasant Vihar, Jor Bagh, Maharani Bagh</td>
            <td class="p-3 sm:p-3.5 font-bold text-gray-900 whitespace-nowrap">₹7,74,000 / sq.m</td>
            <td class="p-3 sm:p-3.5 text-emerald-700 font-bold whitespace-nowrap">Under Luxury Review</td>
          </tr>
          <tr class="hover:bg-amber-50/40">
            <td class="p-3 sm:p-3.5 font-bold text-gray-900 whitespace-nowrap">Category B</td>
            <td class="p-3 sm:p-3.5">Hauz Khas, Greater Kailash (GK I & II), Defence Colony</td>
            <td class="p-3 sm:p-3.5 font-bold text-gray-900 whitespace-nowrap">₹2,45,520 / sq.m</td>
            <td class="p-3 sm:p-3.5 text-emerald-700 font-bold whitespace-nowrap">+10% to +20% Expected</td>
          </tr>
          <tr class="hover:bg-amber-50/40">
            <td class="p-3 sm:p-3.5 font-bold text-gray-900 whitespace-nowrap">Category C</td>
            <td class="p-3 sm:p-3.5">Alaknanda, Chittaranjan Park (CR Park), Vasant Kunj</td>
            <td class="p-3 sm:p-3.5 font-bold text-gray-900 whitespace-nowrap">₹1,59,840 / sq.m</td>
            <td class="p-3 sm:p-3.5 text-amber-700 font-bold whitespace-nowrap">+15% to +25% Expected</td>
          </tr>
          <tr class="hover:bg-amber-50/40">
            <td class="p-3 sm:p-3.5 font-bold text-gray-900 whitespace-nowrap">Category D</td>
            <td class="p-3 sm:p-3.5">Dwarka, Janakpuri, Mayur Vihar Phase I, Green Park Extn</td>
            <td class="p-3 sm:p-3.5 font-bold text-gray-900 whitespace-nowrap">₹1,27,680 / sq.m</td>
            <td class="p-3 sm:p-3.5 text-amber-700 font-bold whitespace-nowrap">+15% Expected</td>
          </tr>
          <tr class="hover:bg-amber-50/40" style="background-color: #FFFDF0;">
            <td class="p-3 sm:p-3.5 font-black text-[#1A1800] whitespace-nowrap">⭐ Category E</td>
            <td class="p-3 sm:p-3.5 font-bold text-gray-900">Chattarpur, Jonapur, Mandi, Sainik Farm, Mahipalpur</td>
            <td class="p-3 sm:p-3.5 font-black text-[#B8860B] whitespace-nowrap">₹70,080 / sq.m</td>
            <td class="p-3 sm:p-3.5 text-red-600 font-black whitespace-nowrap">High Demand & Revision</td>
          </tr>
          <tr class="hover:bg-amber-50/40">
            <td class="p-3 sm:p-3.5 font-bold text-gray-900 whitespace-nowrap">Category F</td>
            <td class="p-3 sm:p-3.5">Dilshad Garden, Okhla Industrial Area, Mehrauli</td>
            <td class="p-3 sm:p-3.5 font-bold text-gray-900 whitespace-nowrap">₹56,640 / sq.m</td>
            <td class="p-3 sm:p-3.5 text-gray-700 font-semibold whitespace-nowrap">+10% Expected</td>
          </tr>
          <tr class="hover:bg-amber-50/40">
            <td class="p-3 sm:p-3.5 font-bold text-gray-900 whitespace-nowrap">Category G & H</td>
            <td class="p-3 sm:p-3.5">Nangloi, Sultanpur Majra, Mustafabad, Village Abadi</td>
            <td class="p-3 sm:p-3.5 font-bold text-gray-900 whitespace-nowrap">₹23,280 – ₹46,200 / sq.m</td>
            <td class="p-3 sm:p-3.5 text-gray-700 font-semibold whitespace-nowrap">Rationalized Slabs</td>
          </tr>
        </tbody>
      </table>
    </div>
  </section>

  <!-- Section 3: Stamp Duty Calculation & Financial Impact (Clean Light Theme) -->
  <section class="space-y-4">
    <h2 class="text-xl sm:text-3xl font-extrabold text-[#1A1800] tracking-tight leading-snug">
      3. Stamp Duty Rates in Delhi & Live Cost Comparison
    </h2>
    <p class="text-xs sm:text-sm text-gray-700 leading-relaxed">
      When circle rates go up, your registration expenses increase even if the builder or seller does not increase the base property price:
    </p>

    <!-- 3 Cards: Swipe on mobile -->
    <div class="flex sm:grid sm:grid-cols-3 gap-3 overflow-x-auto pb-2 scrollbar-none" style="-webkit-overflow-scrolling: touch;">
      <div class="flex-shrink-0 w-64 sm:w-auto p-4 sm:p-5 bg-white rounded-2xl border border-gray-200 shadow-sm text-center">
        <span class="text-[10px] sm:text-xs uppercase font-extrabold text-gray-500">Male Buyer</span>
        <p class="text-2xl sm:text-3xl font-black text-[#1A1800] mt-1">6%</p>
        <p class="text-[11px] text-gray-600 mt-1">4% Stamp Duty + 2% Municipal Charge</p>
      </div>
      <div class="flex-shrink-0 w-64 sm:w-auto p-4 sm:p-5 bg-white rounded-2xl border border-gray-200 shadow-sm text-center">
        <span class="text-[10px] sm:text-xs uppercase font-extrabold text-emerald-700">Female Buyer</span>
        <p class="text-2xl sm:text-3xl font-black text-emerald-700 mt-1">4%</p>
        <p class="text-[11px] text-gray-600 mt-1">2% Stamp Duty + 2% Municipal Charge</p>
      </div>
      <div class="flex-shrink-0 w-64 sm:w-auto p-4 sm:p-5 bg-white rounded-2xl border border-gray-200 shadow-sm text-center">
        <span class="text-[10px] sm:text-xs uppercase font-extrabold text-[#B8860B]">Joint (Male + Female)</span>
        <p class="text-2xl sm:text-3xl font-black text-[#B8860B] mt-1">5%</p>
        <p class="text-[11px] text-gray-600 mt-1">3% Stamp Duty + 2% Municipal Charge</p>
      </div>
    </div>
    <p class="text-[11px] text-gray-500 italic text-center">
      *Note: A mandatory 1% Registration Fee is added on top of the calculated stamp duty for all property registrations in Delhi.
    </p>

    <!-- Calculation Example Card - Clean Light Cream Luxury Box -->
    <div class="p-5 sm:p-7 rounded-3xl space-y-4 border border-[#E8D5A3]" style="background: linear-gradient(135deg, #FFFFFF 0%, #FFFDF5 100%); box-shadow: 0 4px 24px rgba(201, 162, 39, 0.12);">
      <h4 class="text-base sm:text-lg font-black text-[#1A1800] flex items-center gap-2">
        📊 Real-World Cost Comparison: 3 BHK Luxury Builder Floor in Chattarpur
      </h4>
      <p class="text-xs sm:text-sm text-gray-700">
        Let us consider a modern <a href="https://ssrealty.org/3-bhk-flats-for-sale-chattarpur" class="text-[#B8860B] font-bold underline">3 BHK Flat in Chattarpur</a> with an agreement valuation of <strong class="text-[#1A1800]">₹1.25 Crore</strong>:
      </p>

      <div class="flex flex-col sm:grid sm:grid-cols-2 gap-3.5 text-xs">
        <div class="p-4 rounded-2xl border border-blue-200 bg-blue-50/60 space-y-2">
          <p class="font-extrabold text-sm text-blue-950 flex items-center justify-between">
            <span>Before Revision</span>
            <span class="text-[10px] bg-blue-100 text-blue-800 px-2 py-0.5 rounded-full font-bold">Current</span>
          </p>
          <ul class="space-y-1.5 text-gray-800 font-medium">
            <li>• Assessed Registry Value: <strong class="text-gray-950">₹75,00,000</strong></li>
            <li>• Stamp Duty (6% Male): <strong class="text-gray-950">₹4,50,000</strong></li>
            <li>• Registration Fee (1%): <strong class="text-gray-950">₹75,000</strong></li>
            <li class="font-black text-sm pt-2 text-blue-950 border-t border-blue-200">Total Govt Fees: ₹5,25,000</li>
          </ul>
        </div>

        <div class="p-4 rounded-2xl border border-amber-300 bg-amber-50/70 space-y-2">
          <p class="font-extrabold text-sm text-amber-950 flex items-center justify-between">
            <span>After 25% Circle Rate Hike</span>
            <span class="text-[10px] bg-red-100 text-red-800 px-2 py-0.5 rounded-full font-bold">+25% Hike</span>
          </p>
          <ul class="space-y-1.5 text-gray-800 font-medium">
            <li>• Assessed Registry Value: <strong class="text-gray-950">₹93,75,000</strong></li>
            <li>• Stamp Duty (6% Male): <strong class="text-gray-950">₹5,62,500</strong></li>
            <li>• Registration Fee (1%): <strong class="text-gray-950">₹93,750</strong></li>
            <li class="font-black text-sm pt-2 text-red-950 border-t border-amber-300">Total Govt Fees: ₹6,56,250</li>
          </ul>
        </div>
      </div>

      <div class="p-3.5 rounded-2xl border border-emerald-300 bg-emerald-50/80">
        <p class="text-xs sm:text-sm font-bold text-emerald-900 flex items-center gap-1.5">
          <span>💡 Direct Extra Out-of-Pocket Expense for Buyer:</span>
          <span class="font-black text-emerald-950 bg-emerald-200/80 px-2 py-0.5 rounded-lg">+₹1,31,250</span>
          <span>for the exact same home!</span>
        </p>
      </div>
    </div>
  </section>

  <!-- Section 4: Income Tax Section 56(2)(x) & 50C Implications -->
  <section class="space-y-3 sm:space-y-4">
    <h2 class="text-xl sm:text-3xl font-extrabold text-[#1A1800] tracking-tight leading-snug">
      4. Crucial Tax Alerts: Section 56(2)(x) and Section 50C
    </h2>
    <p class="text-xs sm:text-sm text-gray-700 leading-relaxed">
      Under the Indian Income Tax Act, buying or selling below the prevailing circle rate triggers heavy penalties:
    </p>
    <ul class="space-y-2 list-disc list-inside text-xs sm:text-sm text-gray-700 leading-relaxed">
      <li><strong>For the Buyer (Section 56(2)(x)):</strong> If you purchase a property at a price lower than the circle rate, the difference is treated as <em>"Income from Other Sources"</em> and taxed at your regular income tax slab rate.</li>
      <li><strong>For the Seller (Section 50C):</strong> The seller is deemed to have received the full circle rate value as capital gains consideration, leading to inflated capital gains tax.</li>
    </ul>
  </section>

  <!-- Section 5: Focus on South Delhi & Lal Dora Land -->
  <section class="space-y-3 sm:space-y-4">
    <h2 class="text-xl sm:text-3xl font-extrabold text-[#1A1800] tracking-tight leading-snug">
      5. Why South Delhi (Chattarpur, Jonapur & Gwal Pahari) is the Smartest Investment Zone in 2026
    </h2>
    <p class="text-xs sm:text-sm text-gray-700 leading-relaxed">
      In pockets like <a href="https://ssrealty.org/flats-for-sale-in-south-delhi" class="text-[#B8860B] font-bold underline hover:text-[#9a6f08]">South Delhi</a>, Jonapur, Mandi, and Chattarpur, properties developed on <strong>Lal Dora (Freehold Abadi) land</strong> with direct registry and mutation offer unmatched value:
    </p>
    <div class="flex flex-col sm:grid sm:grid-cols-2 gap-3">
      <div class="p-4 sm:p-5 bg-amber-50/70 rounded-2xl border border-amber-200/80 space-y-1.5">
        <h4 class="font-bold text-[#1A1800] text-sm sm:text-base">🌿 Spacious Luxury & Low Density</h4>
        <p class="text-xs text-gray-600 leading-relaxed">
          Unlike congested high-rises with heavy maintenance overheads, South Delhi builder floors offer 130 to 350 Sq.Yd. carpet spaces with private balconies, stilt parking, private terraces, and panoramic Aravalli views.
        </p>
      </div>
      <div class="p-4 sm:p-5 bg-amber-50/70 rounded-2xl border border-amber-200/80 space-y-1.5">
        <h4 class="font-bold text-[#1A1800] text-sm sm:text-base">🏦 70% to 80% NBFC Loan Availability</h4>
        <p class="text-xs text-gray-600 leading-relaxed">
          Reputable NBFC lenders (including Piramal, Tata Capital, Shriram Housing, and Aditya Birla) actively finance verified Lal Dora properties with clean registry titles and doorstep documentation.
        </p>
      </div>
    </div>
  </section>

  <!-- Section 6: Curated Top Properties with 1:1 Aspect Ratio Homepage Photos & Mobile Swipe Slider -->
  <section class="space-y-5 pt-4">
    <div class="border-t border-b border-gray-200 py-6">
      <h2 class="text-xl sm:text-3xl font-extrabold text-[#1A1800] text-center mb-1 leading-snug">
        🏆 Featured Verified Properties with Direct Registry
      </h2>
      <p class="text-center text-xs text-gray-500 max-w-xl mx-auto mb-4">
        Explore verified, ready-to-move and under-construction luxury residences from SS Realty:
      </p>

      <!-- Mobile Horizontal Slider (1:1 Ratio Clean Cards using Homepage Interior Photos) -->
      <div class="flex gap-4 overflow-x-auto pb-4 pt-2 -mx-2 px-2 scrollbar-none" style="-webkit-overflow-scrolling: touch;">

        <!-- Property 1: Velora -->
        <div class="flex-shrink-0 w-72 sm:w-80 bg-white rounded-3xl border border-gray-200 shadow-sm overflow-hidden flex flex-col hover:shadow-md transition-shadow">
          <!-- 1:1 Homepage Interior Photo -->
          <div class="relative w-full h-56 sm:h-64 bg-gray-100 overflow-hidden">
            <img
              src="https://res.cloudinary.com/ddpahrqfk/image/upload/v1781087797/ss-realty/properties/hlvksrh3mfvnyzz2gdc3.jpg"
              alt="Velora Chattarpur Living Room"
              class="w-full h-full object-cover"
              loading="lazy"
            />
            <span class="absolute top-3 left-3 bg-[#C9A227] text-[#1A1800] text-[10px] font-black px-2.5 py-1 rounded-full shadow">
              LUXURY SUITES
            </span>
          </div>
          <div class="p-4 flex-1 flex flex-col justify-between space-y-3">
            <div>
              <h4 class="font-bold text-gray-900 text-sm">VELORA — Sky Mansion Road, Chattarpur</h4>
              <p class="text-xs text-gray-500 mt-1">3 BHK, 4 BHK & Family Suites (165 - 350 Sq.Yd.)</p>
              <p class="text-[11px] text-gray-600 mt-1">• Kohler fittings, Italian modular kitchen & lift</p>
            </div>
            <div class="flex items-center justify-between pt-2 border-t border-gray-100">
              <span class="text-sm font-black text-[#C9A227]">₹1.50 Cr – ₹2.99 Cr</span>
              <a href="https://ssrealty.org/properties/velora" class="px-3.5 py-1.5 bg-[#1A1800] text-[#C9A227] rounded-xl text-xs font-bold hover:bg-black transition-colors">
                View Project →
              </a>
            </div>
          </div>
        </div>

        <!-- Property 2: Vasundhara -->
        <div class="flex-shrink-0 w-72 sm:w-80 bg-white rounded-3xl border border-gray-200 shadow-sm overflow-hidden flex flex-col hover:shadow-md transition-shadow">
          <!-- 1:1 Homepage Interior Photo -->
          <div class="relative w-full h-56 sm:h-64 bg-gray-100 overflow-hidden">
            <img
              src="https://res.cloudinary.com/ddpahrqfk/image/upload/v1781095452/ss-realty/properties/dltmdd30y9su3qe5kw5e.jpg"
              alt="Vasundhara Chattarpur Duplex Living"
              class="w-full h-full object-cover"
              loading="lazy"
            />
            <span class="absolute top-3 left-3 bg-emerald-600 text-white text-[10px] font-black px-2.5 py-1 rounded-full shadow">
              DUPLEX & SIMPLEX
            </span>
          </div>
          <div class="p-4 flex-1 flex flex-col justify-between space-y-3">
            <div>
              <h4 class="font-bold text-gray-900 text-sm">VASUNDHARA — Chattarpur, New Delhi</h4>
              <p class="text-xs text-gray-500 mt-1">3 BHK Simplex & Duplex Luxury (150 Sq.Yd.)</p>
              <p class="text-[11px] text-gray-600 mt-1">• 100% Registry, Vaastu Compliant & 3 Balconies</p>
            </div>
            <div class="flex items-center justify-between pt-2 border-t border-gray-100">
              <span class="text-sm font-black text-[#C9A227]">₹1.25 Cr – ₹1.39 Cr</span>
              <a href="https://ssrealty.org/properties/vasundhara" class="px-3.5 py-1.5 bg-[#1A1800] text-[#C9A227] rounded-xl text-xs font-bold hover:bg-black transition-colors">
                View Project →
              </a>
            </div>
          </div>
        </div>

        <!-- Property 3: Amaryllis Gwal Pahari -->
        <div class="flex-shrink-0 w-72 sm:w-80 bg-white rounded-3xl border border-gray-200 shadow-sm overflow-hidden flex flex-col hover:shadow-md transition-shadow">
          <!-- 1:1 Homepage Interior Photo -->
          <div class="relative w-full h-56 sm:h-64 bg-gray-100 overflow-hidden">
            <img
              src="https://res.cloudinary.com/ddpahrqfk/image/upload/v1780917875/ss-realty/properties/pp1rcn67dbzcedajds7y.jpg"
              alt="Amaryllis Gwal Pahari Interior"
              class="w-full h-full object-cover"
              loading="lazy"
            />
            <span class="absolute top-3 left-3 bg-blue-600 text-white text-[10px] font-black px-2.5 py-1 rounded-full shadow">
              GURGAON BORDER
            </span>
          </div>
          <div class="p-4 flex-1 flex flex-col justify-between space-y-3">
            <div>
              <h4 class="font-bold text-gray-900 text-sm">AMARYLLIS — Mandi Road, Gwal Pahari</h4>
              <p class="text-xs text-gray-500 mt-1">3 BHK & 4 BHK Scenic Residences (130 - 160 Sq.Yd.)</p>
              <p class="text-[11px] text-gray-600 mt-1">• 5 mins from Cyber City & Golf Course Road Extn</p>
            </div>
            <div class="flex items-center justify-between pt-2 border-t border-gray-100">
              <span class="text-sm font-black text-[#C9A227]">₹1.25 Cr – ₹1.50 Cr</span>
              <a href="https://ssrealty.org/properties/amaryllis" class="px-3.5 py-1.5 bg-[#1A1800] text-[#C9A227] rounded-xl text-xs font-bold hover:bg-black transition-colors">
                View Project →
              </a>
            </div>
          </div>
        </div>

        <!-- Property 4: The Arch -->
        <div class="flex-shrink-0 w-72 sm:w-80 bg-white rounded-3xl border border-gray-200 shadow-sm overflow-hidden flex flex-col hover:shadow-md transition-shadow">
          <!-- 1:1 Homepage Interior Photo -->
          <div class="relative w-full h-56 sm:h-64 bg-gray-100 overflow-hidden">
            <img
              src="https://res.cloudinary.com/ddpahrqfk/image/upload/v1781245884/ss-realty/properties/ccincc648g7oxuis4lt9.webp"
              alt="The Arch Gwal Pahari"
              class="w-full h-full object-cover"
              loading="lazy"
            />
            <span class="absolute top-3 left-3 bg-purple-600 text-white text-[10px] font-black px-2.5 py-1 rounded-full shadow">
              THE ARCH
            </span>
          </div>
          <div class="p-4 flex-1 flex flex-col justify-between space-y-3">
            <div>
              <h4 class="font-bold text-gray-900 text-sm">THE ARCH — Mandi Road, Gurgaon</h4>
              <p class="text-xs text-gray-500 mt-1">3 BHK Luxury Residences (130 Sq.Yd.)</p>
              <p class="text-[11px] text-gray-600 mt-1">• Smart MyGate entry, UPVC windows & terrace garden</p>
            </div>
            <div class="flex items-center justify-between pt-2 border-t border-gray-100">
              <span class="text-sm font-black text-[#C9A227]">₹1.25 Cr</span>
              <a href="https://ssrealty.org/properties/the-arch" class="px-3.5 py-1.5 bg-[#1A1800] text-[#C9A227] rounded-xl text-xs font-bold hover:bg-black transition-colors">
                View Project →
              </a>
            </div>
          </div>
        </div>

      </div>

      <!-- Golden Explore Button - High Contrast Guaranteed Visibility -->
      <div class="text-center mt-4">
        <a
          href="https://ssrealty.org/properties"
          class="inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-2xl text-xs sm:text-sm shadow-md transition-all active:scale-95 w-full sm:w-auto"
          style="background: linear-gradient(135deg, #C9A227 0%, #F0D060 50%, #B8860B 100%); color: #1A1800 !important; font-weight: 900; text-decoration: none; border: 1px solid #B8860B;"
        >
          <span style="color: #1A1800 !important; font-weight: 900;">Explore All 15+ Verified SS Realty Properties →</span>
        </a>
      </div>
    </div>
  </section>

  <!-- Section 7: Action Plan for Buyers -->
  <section class="space-y-3 sm:space-y-4">
    <h2 class="text-xl sm:text-3xl font-extrabold text-[#1A1800] tracking-tight leading-snug">
      7. Smart Buyer Playbook: How to Capitalize on the 2026 Revision
    </h2>
    <ol class="space-y-2.5 list-decimal list-inside text-xs sm:text-sm text-gray-700 font-medium leading-relaxed">
      <li><strong>Lock Deals at Current Circle Rates:</strong> Completing your property registration and sale deed execution before the new gazette notification saves you between ₹1.5 Lakhs and ₹4.5 Lakhs in pure government fees.</li>
      <li><strong>Calculate Your EMI in Advance:</strong> Use our real-time <a href="https://ssrealty.org/emi-calculator" class="text-[#B8860B] font-bold underline">Home Loan EMI Calculator</a> to model loan tenures and monthly cash outflows.</li>
      <li><strong>Opt for Joint Registration:</strong> Registering the deed jointly with a female co-applicant reduces the stamp duty from 6% to 5% (or 4% if solely in the woman’s name), saving thousands instantly.</li>
      <li><strong>Verify Clear Land Titles:</strong> Always conduct a legal search on mutation records, chain deeds, and ensure clean registry status before signing agreement terms.</li>
    </ol>
  </section>

  <!-- Section 8: FAQs (Schema Ready) -->
  <section class="space-y-4 bg-gray-50 p-5 sm:p-8 rounded-3xl border border-gray-200">
    <h2 class="text-xl sm:text-2xl font-extrabold text-[#1A1800] tracking-tight mb-2">
      ❓ Frequently Asked Questions (FAQs) on Delhi Circle Rate 2026
    </h2>

    <div class="space-y-3 divide-y divide-gray-200 text-xs sm:text-sm">
      <div class="pt-3">
        <h4 class="font-extrabold text-gray-900">Q1. What is the expected percentage increase in Delhi circle rates in 2026?</h4>
        <p class="text-gray-600 mt-1 leading-relaxed">
          While finalized government notifications will detail locality-wise slabs, industry analysts project a 15% to 35% revision in Category C, D, and E neighborhoods (like Chattarpur, South Delhi, and Dwarka) to bring circle values closer to real market benchmarks.
        </p>
      </div>

      <div class="pt-3">
        <h4 class="font-extrabold text-gray-900">Q2. How does a circle rate hike affect resale flats and builder floors?</h4>
        <p class="text-gray-600 mt-1 leading-relaxed">
          Higher circle rates increase the minimum valuation on which stamp duty is calculated. For instance, if a flat's circle valuation increases from ₹60 Lakhs to ₹75 Lakhs, stamp duty at 6% goes up from ₹3.60 Lakhs to ₹4.50 Lakhs.
        </p>
      </div>

      <div class="pt-3">
        <h4 class="font-extrabold text-gray-900">Q3. Are Lal Dora properties in Chattarpur & Jonapur legally registrable?</h4>
        <p class="text-gray-600 mt-1 leading-relaxed">
          Yes. Properties with proper Khasra/Khatoni records and municipal demarcation in Lal Dora areas undergo direct registry and mutation at the sub-registrar office, and are eligible for home loan financing via leading NBFCs.
        </p>
      </div>

      <div class="pt-3">
        <h4 class="font-extrabold text-gray-900">Q4. Can property be registered below circle rate in Delhi?</h4>
        <p class="text-gray-600 mt-1 leading-relaxed">
          No. Sub-registrars in Delhi cannot register deeds below the statutory circle rate. Furthermore, selling below circle rate attracts severe income tax penalties for both buyer and seller under Section 56(2)(x) and Section 50C.
        </p>
      </div>

      <div class="pt-3">
        <h4 class="font-extrabold text-gray-900">Q5. How can I get free consultation and site visits with SS Realty?</h4>
        <p class="text-gray-600 mt-1 leading-relaxed">
          You can reach out directly to the <a href="https://ssrealty.org/contact-us" class="text-[#B8860B] font-bold underline">SS Realty Advisory Team</a> at <strong>+91-9311059100</strong> or book a private site visit via our online portal with zero brokerage.
        </p>
      </div>
    </div>
  </section>

  <!-- Related Articles Hub (Light Theme with Gold & Cream Card) -->
  <div class="p-5 sm:p-7 rounded-3xl space-y-3.5 border border-[#E8D5A3]" style="background: linear-gradient(135deg, #FFFDF0 0%, #FEF3C7 100%);">
    <h4 class="text-base sm:text-lg font-black text-[#1A1800] flex items-center gap-2">
      📚 Read Related Articles & Buying Guides:
    </h4>
    <div class="grid grid-cols-1 md:grid-cols-2 gap-2.5 text-xs sm:text-sm">
      <a href="https://ssrealty.org/flats-in-chattarpur" class="p-3 bg-white rounded-xl border border-[#E8D5A3] font-bold text-gray-900 hover:text-[#B8860B] hover:border-[#C9A227] shadow-sm transition-all block">
        👉 Complete Guide to Buying 2 BHK & 3 BHK Flats in Chattarpur
      </a>
      <a href="https://ssrealty.org/flats-for-sale-in-south-delhi" class="p-3 bg-white rounded-xl border border-[#E8D5A3] font-bold text-gray-900 hover:text-[#B8860B] hover:border-[#C9A227] shadow-sm transition-all block">
        👉 Top Emerging Builder Floor Localities in South Delhi
      </a>
      <a href="https://ssrealty.org/2-bhk-flat-in-chattarpur" class="p-3 bg-white rounded-xl border border-[#E8D5A3] font-bold text-gray-900 hover:text-[#B8860B] hover:border-[#C9A227] shadow-sm transition-all block">
        👉 Budget 2 BHK Homes Near Chattarpur Metro Station
      </a>
      <a href="https://ssrealty.org/emi-calculator" class="p-3 bg-white rounded-xl border border-[#E8D5A3] font-bold text-gray-900 hover:text-[#B8860B] hover:border-[#C9A227] shadow-sm transition-all block">
        👉 Calculate Your Home Loan Eligibility & Stamp Duty
      </a>
    </div>
  </div>

</div>
`;

async function updateBlog() {
  try {
    await mongoose.connect(MONGODB_URI);
    await Blog.findOneAndUpdate(
      { slug: 'delhi-circle-rate-hike-2026-buyers-guide' },
      { $set: { content: updatedBlogContent } },
      { new: true }
    );
    console.log('Successfully updated blog with homepage 1:1 interior photos, light theme calculation box & light related articles section!');
    await mongoose.disconnect();
    process.exit(0);
  } catch (err) {
    console.error('Update failed:', err);
    process.exit(1);
  }
}

updateBlog();
