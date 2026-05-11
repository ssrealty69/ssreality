import { notFound } from 'next/navigation';
import Image from 'next/image';
import { FALLBACK_PROPERTIES } from '@/constants/properties';
import ImageSlider from '@/components/properties/ImageSlider';
import { formatPrice } from '@/lib/utils';
import SimilarPropertyCard from '@/components/properties/SimilarPropertyCard';
import AmenitiesGrid from '@/components/properties/AmenitiesGrid';
import ProjectVideo from '@/components/properties/ProjectVideo';
import { MapPin, Building, Activity, Layers, BedDouble, Hash, Maximize2, CheckCircle2, Download, MessageCircle, Info, Maximize, Search, Phone, Trees, Zap } from 'lucide-react';

export async function generateStaticParams() {
  return FALLBACK_PROPERTIES.map((property) => ({
    id: property._id,
  }));
}

export default async function PropertyLandingPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const property = FALLBACK_PROPERTIES.find(p => p._id === id);

  if (!property) {
    notFound();
  }

  let relatedProperties = FALLBACK_PROPERTIES.filter(p => p.propertyType === property.propertyType && p._id !== property._id);
  if (relatedProperties.length < 3) {
    const moreProps = FALLBACK_PROPERTIES.filter(p => p.priceType === property.priceType && p._id !== property._id && !relatedProperties.find(rp => rp._id === p._id));
    relatedProperties = [...relatedProperties, ...moreProps];
  }

  const BRAND_RED = "#C9A227";
  const BRAND_CREAM = "#1A1800";

  const waMessage = encodeURIComponent(`Hi! I'm interested in ${property.title}. Please share details.`);
  const waLink = `https://api.whatsapp.com/send?phone=+919311059100&text=${waMessage}`;

  return (
    <div className="font-sans bg-white pb-20">

      {/* --- HERO SECTION --- */}
      <div className="relative w-full h-[80vh] min-h-[500px]">
        {/* Background */}
        <Image
          src="/hero-nature.png"
          alt={property.title}
          fill
          className="object-cover"
          priority
        />
        {/* Pink/Red Gradient Overlay similar to screenshot 1 */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#1A1800]/40 via-[#1A1800]/15 to-transparent" />

        {/* Hero Content Box */}
        <div className="absolute inset-0 max-w-7xl mx-auto px-4 flex flex-col justify-end pb-20">
          <div className="border border-white/40 bg-white/10 backdrop-blur-sm rounded-xl p-6 md:p-8 max-w-xl text-white">
            <div className="inline-block bg-white text-[#1A1800] font-bold px-3 py-1 rounded-full text-sm mb-4">
              <span className="text-[#1A1800]/60">₹</span> {formatPrice(property.price)} Onwards
            </div>
            <h1 className="text-4xl md:text-5xl font-bold mb-2">
              {property.features.bedrooms} BHK Apartments
            </h1>
            <p className="text-xl mb-6">
              {property.location.address}, {property.location.city}
            </p>

            <div className="inline-flex items-center gap-2 bg-[#C9A227] text-[#1A1800] px-4 py-2 rounded-md font-bold text-sm mb-4">
              Land Area {property.features.area} {property.features.areaUnit === 'sqyd' ? 'Sq.Yd' : property.features.areaUnit} <Maximize size={16} />
            </div>

            <div className="flex items-center gap-2 text-sm font-semibold text-white">
              Rera Approved <CheckCircle2 size={16} className="text-[#25D366]" fill="white" />
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4">

        {/* --- OVERVIEW SECTION --- */}
        <section id="overview" className="py-16">
          <h2 className="text-3xl text-center font-medium text-[#1A1800] mb-6">
            {property.title} - <span className="text-[#C9A227]">Overview</span>
          </h2>
          <p className="text-center text-[#1A1800]/70 max-w-4xl mx-auto mb-10 text-lg">
            {property.description} It offers a secure and welcoming environment where residents can enjoy premium amenities, build confidence, and develop important life skills.
          </p>

          <div className="flex flex-col lg:flex-row gap-8">
            <div className="lg:w-1/3 relative h-[350px] rounded-xl overflow-hidden shadow-lg">
              <ImageSlider images={property.images} />
            </div>

            <div className="lg:w-2/3">
              <div className="grid grid-cols-2 md:grid-cols-2 gap-3 mb-8">
                {[
                  { icon: <MapPin size={18} />, label: `${property.location.address}, ${property.location.city}` },
                  { icon: <Building size={18} />, label: "06 Towers" },
                  { icon: <Zap size={18} />, label: property.status === 'available' ? 'Under Const.' : 'Ready' },
                  { icon: <Layers size={18} />, label: "G + 23 Floors" },
                  { icon: <BedDouble size={18} />, label: `${property.features.bedrooms} BHK` },
                  { icon: <Hash size={18} />, label: "542 Units" },
                  { icon: <Maximize2 size={18} />, label: `${property.features.area} ${property.features.areaUnit === 'sqyd' ? 'Sq.Yd' : property.features.areaUnit}` },
                  { icon: <CheckCircle2 size={18} />, label: "Rera Appr.", extraIcon: <CheckCircle2 size={14} className="text-[#25D366] ml-1 inline" fill="white" /> },
                ].map((item, idx) => (
                  <div key={idx} className="flex group bg-white border border-[#E8D5A3]/40 rounded-xl overflow-hidden shadow-sm hover:shadow-[var(--shadow-gold-sm)] transition-all duration-300 hover:-translate-y-0.5">
                    <div className="w-10 sm:w-14 flex items-center justify-center bg-gradient-to-br from-[#FFFEF5] to-[#FDFBF0] border-r border-[#E8D5A3]/30 text-[#C9A227] group-hover:scale-110 transition-transform">
                      {item.icon}
                    </div>
                    <div className="flex-1 px-2.5 sm:px-4 py-3 text-[#1A1800] text-[11px] sm:text-sm font-bold flex items-center leading-tight">
                      {item.label} {item.extraIcon}
                    </div>
                  </div>
                ))}
              </div>

              <div className="flex flex-col sm:flex-row gap-4">
                <button className="flex-[1.2] relative group overflow-hidden bg-gradient-to-r from-[#C9A227] via-[#F0D060] to-[#B8860B] text-[#1A1800] py-4 rounded-2xl flex justify-center items-center gap-3 shadow-[var(--shadow-gold-sm)] hover:shadow-[var(--shadow-gold-lg)] transition-all duration-300 transform hover:-translate-y-1 active:scale-95">
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent -translate-x-full group-hover:animate-[shimmer_2s_infinite] pointer-events-none" />
                  <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center backdrop-blur-sm group-hover:bg-white/40 transition-colors shadow-inner">
                    <Download size={22} className="stroke-[3]" />
                  </div>
                  <span className="text-[17px] font-heading font-bold tracking-tight">Download Brochure</span>
                </button>

                <a href={waLink} target="_blank" rel="noopener noreferrer"
                  className="flex-1 relative overflow-hidden bg-gradient-to-br from-[#1B4332] via-[#2D6A4F] to-[#081C15] text-white py-4 rounded-2xl flex justify-center items-center gap-3 shadow-[0_10px_20px_-5px_rgba(27,67,50,0.4)] hover:shadow-[0_15px_35px_rgba(27,67,50,0.5)] transition-all duration-300 transform hover:-translate-y-1 active:scale-95 group">
                  <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center backdrop-blur-sm group-hover:rotate-12 transition-transform shadow-inner">
                    <MessageCircle size={22} className="fill-white" />
                  </div>
                  <span className="text-[17px] font-heading font-bold tracking-tight">WhatsApp Now</span>
                </a>

                <button className="flex-1 relative overflow-hidden bg-[#1A1800] text-white py-4 rounded-2xl flex justify-center items-center gap-3 border border-[#C9A227]/30 shadow-2xl hover:shadow-[0_20px_40px_-10px_rgba(0,0,0,0.5)] transition-all duration-300 transform hover:-translate-y-1 active:scale-95 group">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-[#C9A227]/10 blur-3xl -mr-16 -mt-16 group-hover:bg-[#C9A227]/20 transition-all duration-500" />
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#E8D5A3] to-[#C9A227] flex items-center justify-center shadow-[0_0_15px_rgba(201,162,39,0.5)] group-hover:scale-110 transition-transform">
                    <MessageCircle size={14} className="fill-[#1A1800] text-[#1A1800]" />
                  </div>
                  <span className="text-[17px] font-heading font-bold tracking-tight bg-gradient-to-r from-white via-[#E8D5A3] to-white bg-[length:200%_auto] hover:animate-[shimmer_2s_infinite] bg-clip-text text-transparent">Enquire Now</span>
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* --- HIGHLIGHTS SECTION --- */}
        <section id="highlights" className="py-16">
          <h2 className="text-3xl text-center font-medium text-[#1A1800] mb-10">
            {property.title} - <span className="text-[#C9A227]">Highlights</span>
          </h2>

          <div className="flex flex-col md:flex-row rounded-xl overflow-hidden shadow-lg border border-[#FFFEF5]">
            {/* Left Box (Cream) */}
            <div className="md:w-1/2 bg-[#1A1800] p-8 md:p-12 space-y-6 text-[#E8D5A3]">
              {[
                `${property.features.bedrooms} BHK premium apartments in ${property.location.address}, ${property.location.city}.`,
                `Spread over approx. ${property.features.area} ${property.features.areaUnit === 'sqyd' ? 'Sq.Yd' : property.features.areaUnit} with wide open green spaces.`,
                `Location is perfectly situated with excellent connectivity and scenic views.`
              ].map((text, i) => (
                <div key={i} className="flex gap-4">
                  <div className="mt-1 flex-shrink-0">
                    <div className="w-5 h-5 rounded-full bg-[#C9A227]/20 flex items-center justify-center">
                      <div className="w-2.5 h-2.5 rounded-full bg-[#C9A227]"></div>
                    </div>
                  </div>
                  <p className="text-white/90 leading-relaxed font-medium">{text}</p>
                </div>
              ))}
            </div>

            {/* Right Box (Golden) */}
            <div className="md:w-1/2 bg-gradient-to-br from-[#E8D5A3] via-[#C9A227] to-[#A88721] p-8 md:p-12 space-y-6 text-[#1A1800] shadow-[inset_0_0_20px_rgba(255,255,255,0.3)]">
              {[
                `Specially designed for premium lifestyle: includes a "Learning Hub", play zones and integrated recreation.`,
                `Gated community with modern lifestyle features, strong developer track record.`,
                `Large clubhouse and premium amenities: swimming pool, gym, sports courts, landscaped gardens.`
              ].map((text, i) => (
                <div key={i} className="flex gap-4">
                  <div className="mt-1 flex-shrink-0">
                    <div className="w-5 h-5 rounded-full bg-white/30 flex items-center justify-center">
                      <div className="w-2.5 h-2.5 rounded-full bg-white"></div>
                    </div>
                  </div>
                  <p>{text}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* --- GALLERY SECTION --- */}
        <section id="gallery" className="py-16">
          <h2 className="text-3xl text-center font-medium text-[#1A1800] mb-10">
            {property.title} - <span className="text-[#C9A227]">Gallery</span>
          </h2>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 auto-rows-[200px]">
            {/* Using dummy images to simulate the masonry effect seen in screenshot 4 */}
            <div className="relative rounded-lg overflow-hidden border border-[#C9A227]/20 shadow-sm shadow-[#E8D5A3]/30">
              <Image src="https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=600&q=80" alt="Gallery 1" fill className="object-cover" />
            </div>
            <div className="relative rounded-lg overflow-hidden border border-[#C9A227]/20 shadow-sm shadow-[#E8D5A3]/30 row-span-2">
              <Image src="https://images.unsplash.com/photo-1613490493576-7fde63acd811?w=600&q=80" alt="Gallery 2" fill className="object-cover" />
            </div>
            <div className="relative rounded-lg overflow-hidden border border-[#C9A227]/20 shadow-sm shadow-[#E8D5A3]/30">
              <Image src="https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=600&q=80" alt="Gallery 3" fill className="object-cover" />
            </div>
            <div className="relative rounded-lg overflow-hidden border border-[#C9A227]/20 shadow-sm shadow-[#E8D5A3]/30 row-span-2">
              <Image src="https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=600&q=80" alt="Gallery 4" fill className="object-cover" />
            </div>
            <div className="relative rounded-lg overflow-hidden border border-[#C9A227]/20 shadow-sm shadow-[#E8D5A3]/30">
              <Image src="https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=600&q=80" alt="Gallery 5" fill className="object-cover" />
            </div>
            <div className="relative rounded-lg overflow-hidden border border-[#C9A227]/20 shadow-sm shadow-[#E8D5A3]/30">
              <Image src="https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=600&q=80" alt="Gallery 6" fill className="object-cover" />
            </div>
          </div>
        </section>

        {/* --- RELATED PROPERTIES SECTION --- */}
        <section id="related-properties" className="py-16 overflow-hidden">
          <h2 className="text-3xl text-center font-medium text-[#1A1800] mb-10">
            Similar <span className="text-[#C9A227]">Properties</span>
          </h2>

          <div className="flex overflow-x-auto snap-x snap-mandatory gap-6 pb-8 px-2" style={{ scrollbarWidth: 'none' }}>
            {relatedProperties.map((relatedProp) => (
              <div key={relatedProp._id} className="min-w-[calc(50%-12px)] md:min-w-[calc(25%-18px)] snap-start flex-shrink-0">
                <SimilarPropertyCard property={relatedProp} />
              </div>
            ))}
          </div>
        </section>

        {/* --- LOCATION ADVANTAGE --- */}
        <section id="location" className="py-16">
          <h2 className="text-3xl text-center font-medium text-[#1A1800] mb-10">
            {property.title} - <span className="text-[#C9A227]">Location Advantage</span>
          </h2>
          <div className="flex flex-col lg:flex-row gap-8">
            <div className="lg:w-1/2 relative h-[450px] rounded-[32px] overflow-hidden shadow-2xl border-4 border-white group">
              <Image
                src="/ss_realty_project_location_map.png"
                alt="Project Location Map"
                fill
                className="object-cover group-hover:scale-105 transition-transform duration-1000"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent pointer-events-none" />
            </div>
            <div className="lg:w-1/2 flex flex-col gap-2 h-full">
              {[
                "6.8 Km - Gurugram University",
                "8.1 Km - Park Hospital",
                "14.7 Km - Ambience Mall",
                "19.6 Km - Basai Dhankot",
                "15.3 Km - Lady Florence Convent School",
                "20.2 Km - Indira Gandhi International Airport"
              ].map((loc, i) => (
                <div key={i} className="flex items-center gap-3 bg-white py-2.5 px-4 rounded-xl border border-gray-100 shadow-sm transition-all hover:border-[#C9A227]/30 hover:shadow-md">
                  <div className="w-10 h-10 shrink-0 rounded-full bg-[#C9A227]/10 flex items-center justify-center text-[#C9A227]">
                    <MapPin size={18} />
                  </div>
                  <span className="text-[#1A1800] text-sm font-semibold">{loc}</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section id="video" className="py-16">
          <ProjectVideo title={property.title} />
        </section>

        {/* --- AMENITIES --- */}
        <section id="amenities" className="py-16">
          <h2 className="text-3xl text-center font-medium text-[#1A1800] mb-10">
            {property.title} - <span className="text-[#C9A227]">Amenities</span>
          </h2>
          <AmenitiesGrid />

          <div className="bg-[#C9A227] rounded-xl p-6 md:p-8 flex flex-col md:flex-row justify-between items-center gap-6 shadow-lg">
            <h3 className="text-2xl text-white font-medium text-center md:text-left">Ready to Book or Need More Details?</h3>
            <div className="flex flex-col sm:flex-row gap-4 w-full md:w-auto">
              <a href={waLink} target="_blank" rel="noopener noreferrer" className="bg-[#25D366] text-white px-6 py-3 rounded-md font-bold flex justify-center items-center gap-2 hover:bg-[#20bd5a] transition-colors shadow-md">
                <MessageCircle size={18} /> WhatsApp Now
              </a>
              <a href="tel:+919311059100" className="bg-[#1A1800] text-[#C9A227] px-6 py-3 rounded-md font-bold flex justify-center items-center gap-2 hover:bg-gray-100 transition-colors shadow-md">
                <Phone size={18} /> 93110 59100
              </a>
            </div>
          </div>
        </section>

        {/* --- ABOUT & FORM --- */}
        <section id="about" className="py-16">
          <div className="flex flex-col lg:flex-row gap-12">
            <div className="lg:w-1/2">
              <div className="flex items-center gap-4 mb-8">
                <div className="relative w-16 h-16 rounded-full border border-[#C9A227]/20 overflow-hidden bg-white shadow-md flex items-center justify-center p-2">
                  <Image
                    src="/SS Realty Official Logo.png"
                    alt="SS Realty Official Logo"
                    width={60}
                    height={60}
                    className="object-contain"
                  />
                </div>
                <div>
                  <h3 className="text-xl font-heading font-bold leading-none text-[#1A1800] tracking-tight uppercase">SS Realty</h3>
                  <p className="text-[10px] font-heading text-[#1A1800]/60 uppercase tracking-[0.3em]">Real Estate Simplified</p>
                </div>
              </div>

              <h2 className="text-3xl font-medium text-[#1A1800] mb-6">
                About - <span className="text-[#C9A227]">SS Realty</span>
              </h2>

              <div className="text-[#1A1800]/70 space-y-4">
                <p>SS Realty is a premier real estate consultancy and development firm committed to delivering excellence in every project. With a deep understanding of the market and a client-centric approach, we bridge the gap between aspirational living and reality. Our expertise spans across residential, commercial, and investment properties, ensuring that every transaction is transparent and value-driven.</p>
                <p>Guided by integrity and innovation, SS Realty has built a strong reputation for curated property selections and seamless documentation processes. We don't just sell spaces; we build trust and lasting relationships with our clients.</p>
              </div>
            </div>

            <div className="lg:w-1/2">
              <div className="bg-[#FFFEF5] rounded-3xl p-6 md:p-8 relative overflow-hidden group shadow-[0_10px_40px_-15px_rgba(201,162,39,0.2)] border-2 border-[#C9A227]/20">
                <div className="absolute top-0 right-0 w-32 h-32 bg-[#C9A227]/5 rounded-full -mr-16 -mt-16 blur-3xl group-hover:bg-[#C9A227]/10 transition-all duration-500"></div>

                <div className="flex justify-between items-start mb-6">
                  <div>
                    <h3 className="text-2xl font-bold text-[#1A1800] mb-1">Enquire Now</h3>
                    <p className="text-[#1A1800]/60 text-sm">Get expert guidance for your home.</p>
                  </div>
                  <div className="w-10 h-10 rounded-full bg-[#C9A227]/10 border border-[#C9A227]/40 flex items-center justify-center">
                    <div className="w-2 h-2 rounded-full bg-[#C9A227] animate-pulse"></div>
                  </div>
                </div>

                <form className="space-y-3">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="relative group">
                      <input type="text" placeholder="Name" className="w-full bg-white border border-[#C9A227]/40 rounded-xl px-4 py-2.5 text-[#1A1800] text-sm focus:outline-none focus:border-[#C9A227] focus:ring-1 focus:ring-[#C9A227]/20 transition-all placeholder:text-[#1A1800]/30" required />
                    </div>
                    <div className="relative group">
                      <input type="email" placeholder="Email" className="w-full bg-white border border-[#C9A227]/40 rounded-xl px-4 py-2.5 text-[#1A1800] text-sm focus:outline-none focus:border-[#C9A227] focus:ring-1 focus:ring-[#C9A227]/20 transition-all placeholder:text-[#1A1800]/30" required />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="flex bg-white border border-[#C9A227]/40 rounded-xl overflow-hidden focus-within:border-[#C9A227] focus-within:ring-1 focus-within:ring-[#C9A227]/20 transition-all">
                      <div className="px-3 py-2.5 text-[#1A1800]/60 text-sm border-r border-[#C9A227]/10 flex items-center bg-[#C9A227]/5">
                        +91
                      </div>
                      <input type="tel" placeholder="Mobile Number" className="w-full px-4 py-2.5 bg-transparent text-[#1A1800] text-sm focus:outline-none placeholder:text-[#1A1800]/30" required />
                    </div>
                    <input type="text" placeholder="Your Message" className="w-full bg-white border border-[#C9A227]/40 rounded-xl px-4 py-2.5 text-[#1A1800] text-sm focus:outline-none focus:border-[#C9A227] focus:ring-1 focus:ring-[#C9A227]/20 transition-all placeholder:text-[#1A1800]/30" />
                  </div>

                  <button type="button" className="w-full bg-gradient-to-r from-[#C9A227] to-[#A88721] text-white py-3.5 rounded-xl font-bold mt-2 hover:shadow-[0_10px_20px_-5px_rgba(201,162,39,0.4)] hover:-translate-y-0.5 active:translate-y-0 transition-all shadow-lg">
                    Secure Your Unit
                  </button>

                  <div className="relative py-2 flex items-center">
                    <div className="flex-grow border-t border-[#C9A227]/10"></div>
                    <span className="flex-shrink mx-4 text-[10px] uppercase tracking-widest text-[#1A1800]/40 font-medium">or connect via</span>
                    <div className="flex-grow border-t border-[#C9A227]/10"></div>
                  </div>

                  <a href={waLink} target="_blank" rel="noopener noreferrer" className="w-full bg-white border border-[#25D366] text-[#25D366] py-2.5 rounded-xl font-semibold flex justify-center items-center gap-2 hover:bg-[#25D366] hover:text-white transition-all text-sm shadow-sm group">
                    <MessageCircle size={16} className="group-hover:animate-bounce" /> WhatsApp Support
                  </a>
                </form>
              </div>
            </div>
          </div>
        </section>

      </div>
    </div>
  );
}
