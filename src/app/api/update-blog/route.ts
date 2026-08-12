import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import Blog from '@/models/Blog';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    await connectDB();
    
    const newContent = `
      <div class="prose prose-lg max-w-none">
        <p>The real estate market in Gurugram (Gurgaon) has evolved into one of the most premium and highly sought-after destinations in India. With towering skyscrapers, world-class amenities, and strategic connectivity, it continues to attract HNIs and visionary investors in 2026.</p>
        <p>In this article, we explore the <strong>Top 10 Property Projects in Gurgaon</strong> that have set new benchmarks for luxury living.</p>
        
        <h2 class="mt-12 mb-6">1. DLF The Camellias (Golf Course Road)</h2>
        <p>A name synonymous with ultra-luxury, DLF The Camellias continues to dominate the premium segment in Gurgaon. With unparalleled views of the DLF Golf Course, a sprawling world-class clubhouse, and massive floor plans, it remains a favorite among high-net-worth individuals.</p>

        <h2 class="mt-12 mb-6">2. M3M Golfestate (Sector 65)</h2>
        <p>This project brings a 9-hole executive golf course to your doorstep. Known for its expansive green spaces, resort-like lifestyle, and architectural brilliance, M3M Golfestate is a top choice for luxury apartment seekers on the Golf Course Extension Road.</p>

        <h2 class="mt-12 mb-6">3. Emaar Marbella (Sector 66)</h2>
        <p>For those interested in sprawling villas rather than high-rise apartments, Emaar Marbella offers exquisite Spanish-themed luxury villas. It is a low-density community that guarantees privacy, high-end security, and a peaceful environment.</p>

        <h2 class="mt-12 mb-6">4. Tulip Monsella (Sector 53)</h2>
        <p>Located on the prestigious Golf Course Road, Tulip Monsella is redefining the skyline of Gurgaon with its ultra-luxury high-rise towers. It offers top-of-the-line amenities, sky hubs, and unmatched proximity to major commercial centers.</p>

        <h2 class="mt-12 mb-6">5. Godrej Meridien (Sector 106)</h2>
        <p>Situated near the Dwarka Expressway, Godrej Meridien focuses heavily on wellness and luxury. It features one of the largest clubhouses in the region, complete with a spa, sports facilities, and concierge services.</p>

        <h2 class="mt-12 mb-6">6. Central Park Resorts (Sector 48)</h2>
        <p>Central Park Resorts brings the concept of resort living to everyday life. With an underground parking system that leaves the ground level completely vehicle-free, it offers lush greenery, a massive 20-acre central park, and 5-star hospitality services.</p>

        <h2 class="mt-12 mb-6">7. Tata Primanti (Sector 72)</h2>
        <p>Located on the Southern Peripheral Road (SPR), Tata Primanti is a blend of modern architecture and nature. It offers a mix of villas, duplexes, and luxury apartments surrounded by interconnected orchards and gardens.</p>

        <h2 class="mt-12 mb-6">8. Sobha City (Sector 108)</h2>
        <p>An urban park residence near the Delhi border, Sobha City spans 39 acres and offers vast open spaces, two clubhouses, and a 90m diameter cricket ground. It is known for its impeccable construction quality.</p>

        <h2 class="mt-12 mb-6">9. Conscient Heritage One (Sector 62)</h2>
        <p>Located on Golf Course Extension Road, Heritage One is designed for those who appreciate exclusivity. It features low-density living, a smart club, and beautifully landscaped open areas.</p>

        <h2 class="mt-12 mb-6">10. IREO Victory Valley (Sector 67)</h2>
        <p>One of the tallest residential complexes in Gurgaon, IREO Victory Valley offers a stunning "Valley of the Clouds" viewing deck. The project is famous for its vertical gardens, themed landscaping, and futuristic living.</p>

        <hr class="my-12 border-t-2 border-gray-200" />
        
        <h2 class="mt-8 mb-6 text-3xl font-extrabold text-[#C9A227]">Looking for Boutique Luxury at Accessible Prices?</h2>
        <p>While the mega-townships of Gurgaon offer a towering lifestyle, many modern families prefer the privacy, massive space, and personalized touch of <strong>premium builder floors and independent residences</strong>.</p>
        
        <p>If you are looking for high-quality boutique properties that offer exceptional value without compromising on luxury, explore <strong>SS Realty's Premium Projects</strong> located strategically in Chattarpur and Gwal Pahari (Gurugram border):</p>
        
        <ul class="space-y-4 my-6">
          <li>✨ <a href="/properties/orchid" class="text-[#C9A227] font-bold underline">Orchid (Ready to Move)</a> — A serene 3BHK development offering immediate possession at highly competitive pricing (₹85 Lakhs).</li>
          <li>✨ <a href="/properties/nivasa-iii" class="text-[#C9A227] font-bold underline">Nivasa III (Ready to Move)</a> — High-end independent 3BHK builder floors ready for you to move in today.</li>
          <li>✨ <a href="/properties/amaryllis" class="text-[#C9A227] font-bold underline">Amaryllis</a> & <a href="/properties/the-arch" class="text-[#C9A227] font-bold underline">The Arch</a> — Upcoming architectural marvels in Gwal Pahari offering exquisite 3BHK and 4BHK layouts.</li>
          <li>✨ <a href="/properties/velora" class="text-[#C9A227] font-bold underline">Velora (Chattarpur)</a> — Designed for large families, offering massive 4BHK + Study + Family Suite options for unparalleled space.</li>
          <li>✨ <a href="/properties/vasundhara" class="text-[#C9A227] font-bold underline">Vasundhara (Chattarpur)</a> — Exclusive 3BHK Simplex and Duplex options currently under construction.</li>
        </ul>
        
        <p class="font-bold mt-8">As an independent developer (not a broker), SS Realty builds with transparency and 100% on-time delivery. <a href="/contact-us" class="text-[#1A1800] underline">Contact us today</a> to schedule a site visit to our latest projects!</p>
      </div>
    `;

    // First update the slug from top-10-property-projects-gurgaon-chattarpur-2026 to top-10-property-projects-gurgaon-2026
    const updated = await Blog.findOneAndUpdate(
      { slug: 'top-10-property-projects-gurgaon-chattarpur-2026' },
      { 
        title: 'Top 10 Property Projects in Gurgaon (2026 Edition)',
        slug: 'top-10-property-projects-gurgaon-2026',
        content: newContent,
        excerpt: 'Looking for the best real estate investments in Gurgaon? Discover the top 10 mega-projects offering ultimate luxury, high returns, and prime connectivity in 2026.'
      },
      { new: true }
    );
    
    // Also check if they had manually clicked the blog and the slug was auto-generated differently
    let fallbackUpdated = updated;
    if (!updated) {
       fallbackUpdated = await Blog.findOneAndUpdate(
        { title: { $regex: /Top 10 Property Projects/i } },
        { 
          title: 'Top 10 Property Projects in Gurgaon (2026 Edition)',
          slug: 'top-10-property-projects-gurgaon-2026',
          content: newContent,
          excerpt: 'Looking for the best real estate investments in Gurgaon? Discover the top 10 mega-projects offering ultimate luxury, high returns, and prime connectivity in 2026.'
        },
        { new: true }
      );
    }

    return NextResponse.json({ success: true, message: 'Blog updated in DB', blog: fallbackUpdated });
  } catch (err: any) {
    return NextResponse.json({ error: err.message });
  }
}
