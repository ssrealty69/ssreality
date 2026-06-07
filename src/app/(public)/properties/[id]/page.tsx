import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Image from 'next/image';
import { connectDB } from '@/lib/mongodb';
import Property from '@/models/Property';

export const revalidate = 60; // Revalidate page every 60 seconds

import ImageSlider from '@/components/properties/ImageSlider';
import { formatPrice } from '@/lib/utils';
import SimilarPropertyCard from '@/components/properties/SimilarPropertyCard';
import AmenitiesGrid, { ProjectAmenitiesGrid, WorldClassAmenitiesGrid } from '@/components/properties/AmenitiesGridList';
import ProjectVideo from '@/components/properties/ProjectVideo';
import { MapPin, Building, Activity, Layers, BedDouble, Hash, Maximize2, CheckCircle2, Download, MessageCircle, Info, Maximize, Search, Phone, Trees, Zap } from 'lucide-react';
import PropertyActions from '@/components/properties/PropertyActions';
import PropertyEnquiryForm from '@/components/properties/PropertyEnquiryForm';
import ViewPropertyTracker from '@/components/tracking/ViewPropertyTracker';
import DeliveredProperties from '@/components/home/DeliveredProperties';

import { FALLBACK_PROPERTIES } from '@/constants/properties';

import mongoose from 'mongoose';

export async function generateStaticParams() {
  try {
    await connectDB();
    const properties = await Property.find({}).select('_id').lean();
    return properties.map((property: any) => ({
      id: property._id.toString(),
    }));
  } catch (error) {
    return FALLBACK_PROPERTIES.map((property) => ({
      id: property._id,
    }));
  }
}

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params;
  try {
    await connectDB();
    if (mongoose.Types.ObjectId.isValid(id)) {
      const property: any = await Property.findById(id).select('title description seo images').lean();
      if (property) {
        return {
          title: property.seo?.title || `${property.title} | SS Realty`,
          description: property.seo?.description || property.description,
          openGraph: {
            title: property.seo?.title || property.title,
            description: property.seo?.description || property.description,
            images: property.images && property.images.length > 0 ? [property.images[0]] : [],
          }
        };
      }
    }
  } catch (e) {
    console.error("Error generating metadata", e);
  }

  const fallback = FALLBACK_PROPERTIES.find((p) => p._id === id);
  if (fallback) {
    return {
      title: `${fallback.title} | SS Realty`,
      description: fallback.description,
      openGraph: {
        title: fallback.title,
        description: fallback.description,
        images: fallback.images && fallback.images.length > 0 ? [fallback.images[0]] : [],
      }
    };
  }

  return {
    title: 'Property Not Found | SS Realty',
    description: 'The requested property could not be found.',
  };
}

export default async function PropertyLandingPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  let property: any = null;
  let relatedProperties: any[] = [];
  let deliveredProperties: any[] = [];

  try {
    await connectDB();
    if (mongoose.Types.ObjectId.isValid(id)) {
      property = await Property.findById(id).lean();
    }

    if (property) {
      property = JSON.parse(JSON.stringify(property));

      // Only show available properties in similar section
      relatedProperties = await Property.find({
        propertyType: property.propertyType,
        status: 'available',
        _id: { $ne: property._id }
      }).limit(4).lean();

      if (relatedProperties.length < 4) {
        const moreProps = await Property.find({
          priceType: property.priceType,
          status: 'available',
          _id: { $ne: property._id, $nin: relatedProperties.map((p: any) => p._id) }
        }).limit(4 - relatedProperties.length).lean();
        relatedProperties = [...relatedProperties, ...moreProps];
      }

      // Fetch all delivered properties for the landmarks section
      deliveredProperties = await Property.find({
        status: 'delivered'
      }).lean();

      // Fix deep serialization error
      relatedProperties = JSON.parse(JSON.stringify(relatedProperties));
      deliveredProperties = JSON.parse(JSON.stringify(deliveredProperties));
    }
  } catch (error) {
    console.error("MongoDB Connection Error in Frontend:", error);
  }

  // Fallback to local data if DB connection failed or property not found in DB
  if (!property) {
    property = FALLBACK_PROPERTIES.find((p) => p._id === id);
    if (!property) {
      notFound();
    }

    relatedProperties = FALLBACK_PROPERTIES.filter(p => p.propertyType === property.propertyType && p._id !== property._id && (p.status === 'available' || !p.status)).slice(0, 4);
    if (relatedProperties.length < 4) {
      const moreProps = FALLBACK_PROPERTIES.filter(p => p.priceType === property.priceType && p._id !== property._id && (p.status === 'available' || !p.status) && !relatedProperties.find((rp: any) => rp._id === p._id));
      relatedProperties = [...relatedProperties, ...moreProps].slice(0, 4);
    }
    deliveredProperties = [];
  }

  // JSON-LD Structured Data for Property (Google Rich Cards compliant with image and price)
  const propertyJsonLd = [
    {
      '@context': 'https://schema.org',
      '@type': 'Product',
      name: property.title,
      image: property.images && property.images.length > 0 ? property.images : ['https://ssrealty.in/SS%20Realty%20Official%20Logo.png'],
      description: property.description || `Premium ${property.features.bedrooms} BHK ${property.propertyType} for sale/rent at ${property.location.address}, ${property.location.city}.`,
      sku: property._id ? property._id.toString() : id,
      brand: {
        '@type': 'Brand',
        name: 'SS Realty'
      },
      offers: {
        '@type': 'Offer',
        price: property.price || 5000000,
        priceCurrency: 'INR',
        priceValidUntil: '2028-12-31',
        itemCondition: 'https://schema.org/NewCondition',
        availability: 'https://schema.org/InStock',
        url: `https://ssrealty.in/properties/${property._id ? property._id.toString() : id}`
      }
    },
    {
      '@context': 'https://schema.org',
      '@type': property.propertyType === 'flat' || property.propertyType === 'apartment' ? 'Apartment' : 'SingleFamilyResidence',
      name: property.title,
      description: property.description,
      image: property.images && property.images.length > 0 ? property.images : ['https://ssrealty.in/SS%20Realty%20Official%20Logo.png'],
      address: {
        '@type': 'PostalAddress',
        streetAddress: property.location.address,
        addressLocality: property.location.city,
        addressRegion: 'Haryana / NCR',
        addressCountry: 'IN'
      },
      numberOfBedrooms: property.features.bedrooms || 3,
      numberOfBathrooms: property.features.bathrooms || 3,
      floorSize: {
        '@type': 'QuantitativeValue',
        value: property.features.area,
        unitText: property.features.areaUnit === 'sqyd' ? 'Square Yards' : 'Square Feet'
      }
    }
  ];

  const waMessage = encodeURIComponent(`Hi! I'm interested in ${property.title}. Please share details.`);
  const waLink = `https://api.whatsapp.com/send?phone=+919311059100&text=${waMessage}`;

  return (
    <div className="font-sans bg-white pb-20">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(propertyJsonLd) }}
      />
      <ViewPropertyTracker property={property} />

      {/* --- HERO SECTION --- */}
      <div className="relative w-full h-[80vh] min-h-[500px]">
        {/* Background */}
        <Image
          src={property.images && property.images.length > 0 ? property.images[0] : "/hero-nature.png"}
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
              <span className="text-[#1A1800]/60">₹</span> {formatPrice(property.price)} {property.priceType === 'rent' ? '/month' : 'Onwards'}
            </div>
            <h1 className="text-4xl md:text-5xl font-bold mb-2">
              {property.features.bedrooms ? `${property.features.bedrooms} BHK ` : ''}
              <span className="capitalize">{property.propertyType}s</span>
            </h1>
            <p className="text-xl mb-6">
              {property.location.address}, {property.location.city}
            </p>

            <div className="inline-flex items-center gap-2 bg-[#C9A227] text-[#1A1800] px-4 py-2 rounded-md font-bold text-sm mb-4">
              Area {property.features.area} {property.features.areaUnit === 'sqyd' ? 'Sq.Yd' : property.features.areaUnit} <Maximize size={16} />
            </div>

            {property.features.reraApproved && (
              <div className="flex items-center gap-2 text-sm font-semibold text-white">
                Rera Approved <CheckCircle2 size={16} className="text-[#25D366]" fill="white" />
              </div>
            )}
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
            {property.description}
          </p>

          <div className="flex flex-col lg:flex-row gap-8">
            <div className="lg:w-1/3 relative h-[350px] rounded-xl overflow-hidden shadow-lg">
              <ImageSlider
                images={
                  property.interiorImages && property.interiorImages.length > 0
                    ? property.interiorImages
                    : (property.images && property.images.length > 0 ? property.images : ['/hero-nature.png'])
                }
              />
            </div>

            <div className="lg:w-2/3">
              <div className="grid grid-cols-2 md:grid-cols-2 gap-3 mb-8">
                <div className="flex group bg-white border border-[#E8D5A3]/40 rounded-xl overflow-hidden shadow-sm hover:shadow-[var(--shadow-gold-sm)] transition-all duration-300 hover:-translate-y-0.5">
                  <div className="w-10 sm:w-14 flex items-center justify-center bg-gradient-to-br from-[#FFFEF5] to-[#FDFBF0] border-r border-[#E8D5A3]/30 text-[#C9A227] group-hover:scale-110 transition-transform">
                    <MapPin size={18} />
                  </div>
                  <div className="flex-1 px-2.5 sm:px-4 py-3 text-[#1A1800] text-[11px] sm:text-sm font-bold flex items-center leading-tight">
                    {property.location.city}
                  </div>
                </div>

                {property.features.towers ? (
                  <div className="flex group bg-white border border-[#E8D5A3]/40 rounded-xl overflow-hidden shadow-sm hover:shadow-[var(--shadow-gold-sm)] transition-all duration-300 hover:-translate-y-0.5">
                    <div className="w-10 sm:w-14 flex items-center justify-center bg-gradient-to-br from-[#FFFEF5] to-[#FDFBF0] border-r border-[#E8D5A3]/30 text-[#C9A227] group-hover:scale-110 transition-transform">
                      <Building size={18} />
                    </div>
                    <div className="flex-1 px-2.5 sm:px-4 py-3 text-[#1A1800] text-[11px] sm:text-sm font-bold flex items-center leading-tight">
                      {property.features.towers} Towers
                    </div>
                  </div>
                ) : null}

                <div className="flex group bg-white border border-[#E8D5A3]/40 rounded-xl overflow-hidden shadow-sm hover:shadow-[var(--shadow-gold-sm)] transition-all duration-300 hover:-translate-y-0.5">
                  <div className="w-10 sm:w-14 flex items-center justify-center bg-gradient-to-br from-[#FFFEF5] to-[#FDFBF0] border-r border-[#E8D5A3]/30 text-[#C9A227] group-hover:scale-110 transition-transform">
                    <Zap size={18} />
                  </div>
                  <div className="flex-1 px-2.5 sm:px-4 py-3 text-[#1A1800] text-[11px] sm:text-sm font-bold flex items-center leading-tight capitalize">
                    {property.status}
                  </div>
                </div>

                {property.features.totalFloors ? (
                  <div className="flex group bg-white border border-[#E8D5A3]/40 rounded-xl overflow-hidden shadow-sm hover:shadow-[var(--shadow-gold-sm)] transition-all duration-300 hover:-translate-y-0.5">
                    <div className="w-10 sm:w-14 flex items-center justify-center bg-gradient-to-br from-[#FFFEF5] to-[#FDFBF0] border-r border-[#E8D5A3]/30 text-[#C9A227] group-hover:scale-110 transition-transform">
                      <Layers size={18} />
                    </div>
                    <div className="flex-1 px-2.5 sm:px-4 py-3 text-[#1A1800] text-[11px] sm:text-sm font-bold flex items-center leading-tight">
                      G + {property.features.totalFloors} Floors
                    </div>
                  </div>
                ) : null}

                {property.features.bedrooms ? (
                  <div className="flex group bg-white border border-[#E8D5A3]/40 rounded-xl overflow-hidden shadow-sm hover:shadow-[var(--shadow-gold-sm)] transition-all duration-300 hover:-translate-y-0.5">
                    <div className="w-10 sm:w-14 flex items-center justify-center bg-gradient-to-br from-[#FFFEF5] to-[#FDFBF0] border-r border-[#E8D5A3]/30 text-[#C9A227] group-hover:scale-110 transition-transform">
                      <BedDouble size={18} />
                    </div>
                    <div className="flex-1 px-2.5 sm:px-4 py-3 text-[#1A1800] text-[11px] sm:text-sm font-bold flex items-center leading-tight">
                      {property.features.bedrooms} BHK
                    </div>
                  </div>
                ) : null}

                {property.features.totalUnits ? (
                  <div className="flex group bg-white border border-[#E8D5A3]/40 rounded-xl overflow-hidden shadow-sm hover:shadow-[var(--shadow-gold-sm)] transition-all duration-300 hover:-translate-y-0.5">
                    <div className="w-10 sm:w-14 flex items-center justify-center bg-gradient-to-br from-[#FFFEF5] to-[#FDFBF0] border-r border-[#E8D5A3]/30 text-[#C9A227] group-hover:scale-110 transition-transform">
                      <Hash size={18} />
                    </div>
                    <div className="flex-1 px-2.5 sm:px-4 py-3 text-[#1A1800] text-[11px] sm:text-sm font-bold flex items-center leading-tight">
                      {property.features.totalUnits} Units
                    </div>
                  </div>
                ) : null}

                <div className="flex group bg-white border border-[#E8D5A3]/40 rounded-xl overflow-hidden shadow-sm hover:shadow-[var(--shadow-gold-sm)] transition-all duration-300 hover:-translate-y-0.5">
                  <div className="w-10 sm:w-14 flex items-center justify-center bg-gradient-to-br from-[#FFFEF5] to-[#FDFBF0] border-r border-[#E8D5A3]/30 text-[#C9A227] group-hover:scale-110 transition-transform">
                    <Maximize2 size={18} />
                  </div>
                  <div className="flex-1 px-2.5 sm:px-4 py-3 text-[#1A1800] text-[11px] sm:text-sm font-bold flex items-center leading-tight">
                    {property.features.area} {property.features.areaUnit === 'sqyd' ? 'Sq.Yd' : property.features.areaUnit}
                  </div>
                </div>

                {property.features.reraApproved && (
                  <div className="flex group bg-white border border-[#E8D5A3]/40 rounded-xl overflow-hidden shadow-sm hover:shadow-[var(--shadow-gold-sm)] transition-all duration-300 hover:-translate-y-0.5">
                    <div className="w-10 sm:w-14 flex items-center justify-center bg-gradient-to-br from-[#FFFEF5] to-[#FDFBF0] border-r border-[#E8D5A3]/30 text-[#C9A227] group-hover:scale-110 transition-transform">
                      <CheckCircle2 size={18} />
                    </div>
                    <div className="flex-1 px-2.5 sm:px-4 py-3 text-[#1A1800] text-[11px] sm:text-sm font-bold flex items-center leading-tight">
                      Rera Appr. <CheckCircle2 size={14} className="text-[#25D366] ml-1 inline" fill="white" />
                    </div>
                  </div>
                )}
              </div>

              <PropertyActions
                propertyId={property._id.toString()}
                propertyTitle={property.title}
                brochureUrl={property.brochureUrl}
                waLink={waLink}
              />
            </div>
          </div>
        </section>

        {/* --- HIGHLIGHTS SECTION --- */}
        {property.highlights && property.highlights.length > 0 && (
          <section id="highlights" className="py-12 md:py-16 relative bg-[#FFFEF5]">
            {/* Animated Panning Background — rounded card style */}
            <div className="absolute inset-x-4 sm:inset-x-8 inset-y-3 z-0 select-none pointer-events-none rounded-3xl overflow-hidden opacity-[0.30]">
              <style>{`
                @keyframes highlightsPan {
                  0%, 100% { transform: scale(1.05) translate(0px, 0px); }
                  50% { transform: scale(1.1) translate(-5px, -3px); }
                }
                .animate-highlights-pan {
                  animation: highlightsPan 25s ease-in-out infinite;
                }
                .card-premium-highlight {
                  transition: transform 0.3s cubic-bezier(0.2, 0.8, 0.2, 1), box-shadow 0.3s ease, border-color 0.3s ease;
                }
                .card-premium-highlight:hover {
                  transform: translateY(-3px);
                  box-shadow: 0 10px 25px -5px rgba(201, 162, 39, 0.12), 0 8px 10px -6px rgba(0, 0, 0, 0.02);
                }
              `}</style>
              <Image
                src="/World Class%20Amenities/Luxury%203BHK%20%26%204BHK%20Premium%20Floor%20Building%203.png"
                alt="Luxury Building Background"
                fill
                priority
                unoptimized
                className="object-cover animate-highlights-pan"
              />
              {/* Soft luxury gradient overlay */}
              <div className="absolute inset-0 bg-gradient-to-b from-[#FFFEF5]/80 via-transparent to-[#FFFEF5]/80" />
            </div>

            <div className="max-w-4xl mx-auto px-4 sm:px-6 relative z-10">
              <div className="text-center mb-10">
                <h2 className="text-3xl md:text-4xl font-bold font-[var(--font-playfair)] text-[#1A1800] mb-3">
                  Project <span className="text-[#C9A227]">Highlights</span>
                </h2>
                <div className="w-16 h-[1.5px] bg-[#C9A227]/40 mx-auto" />
              </div>

              {/* Centered list of premium thin pointers */}
              <div className="max-w-2xl mx-auto space-y-3">
                {property.highlights.map((highlight: any, i: number) => {
                  const pointText = typeof highlight === 'string' ? highlight : highlight.title;
                  if (!pointText) return null;
                  return (
                    <div 
                      key={i} 
                      className="group flex items-center gap-4 bg-white/90 border border-[#E8D5A3]/25 hover:border-[#C9A227]/50 hover:bg-[#FFFEF5] transition-all duration-300 py-3.5 px-5 rounded-xl shadow-sm hover:shadow-md card-premium-highlight backdrop-blur-sm"
                    >
                      <div className="flex-shrink-0 w-6 h-6 rounded-full bg-[#25D366] flex items-center justify-center text-white shadow-sm group-hover:scale-105 transition-transform duration-300">
                        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={4}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                        </svg>
                      </div>
                      <div className="flex-1">
                        <span className="text-sm md:text-base font-medium text-[#2D2A26] tracking-wide transition-colors duration-300 group-hover:text-[#1A1800]">
                          {pointText}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </section>
        )}

        {/* --- GALLERY SECTION --- */}
        {((property.galleryImages && property.galleryImages.length > 0) || (property.images && property.images.length > 0)) && (
          <section id="gallery" className="py-16">
            <h2 className="text-3xl text-center font-medium text-[#1A1800] mb-10">
              {property.title} - <span className="text-[#C9A227]">Gallery</span>
            </h2>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 auto-rows-[200px]">
              {(property.galleryImages && property.galleryImages.length > 0 ? property.galleryImages : property.images).map((imgUrl: string, idx: number) => (
                <div key={idx} className={`relative rounded-lg overflow-hidden border border-[#C9A227]/20 shadow-sm shadow-[#E8D5A3]/30 ${idx === 1 || idx === 3 ? 'row-span-2' : ''}`}>
                  <Image src={imgUrl} alt={`Gallery ${idx + 1}`} fill className="object-cover hover:scale-110 transition-transform duration-500" />
                </div>
              ))}
            </div>
          </section>
        )}

        {/* --- RELATED PROPERTIES SECTION --- */}
        {relatedProperties.length > 0 && (
          <section id="related-properties" className="py-16 overflow-hidden">
            <h2 className="text-3xl text-center font-medium text-[#1A1800] mb-10">
              Similar <span className="text-[#C9A227]">Properties</span>
            </h2>

            <div className="flex overflow-x-auto snap-x snap-mandatory gap-6 pb-8 px-2" style={{ scrollbarWidth: 'none' }}>
              {relatedProperties.map((relatedProp: any) => (
                <div key={relatedProp._id.toString()} className="min-w-[calc(50%-12px)] md:min-w-[calc(25%-18px)] snap-start flex-shrink-0">
                  <SimilarPropertyCard property={relatedProp} />
                </div>
              ))}
            </div>
          </section>
        )}

      </div>

      {/* --- DELIVERED LANDMARKS SECTION (full-width, outside container) --- */}
      {deliveredProperties.length > 0 && (
        <DeliveredProperties properties={deliveredProperties} />
      )}

      <div className="max-w-7xl mx-auto px-4">
        {property.nearby && property.nearby.length > 0 && (
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
                {property.nearby.map((loc: any, i: number) => (
                  <div key={i} className="flex items-center gap-3 bg-white py-2.5 px-4 rounded-xl border border-gray-100 shadow-sm transition-all hover:border-[#C9A227]/30 hover:shadow-md">
                    <div className="w-10 h-10 shrink-0 rounded-full bg-[#C9A227]/10 flex items-center justify-center text-[#C9A227]">
                      <MapPin size={18} />
                    </div>
                    <span className="text-[#1A1800] text-sm font-semibold">{loc.distance} - {loc.name}</span>
                  </div>
                ))}
              </div>
            </div>
          </section>
        )}

        {property.videoUrl && (
          <section id="video" className="py-16">
            <ProjectVideo title={property.title} videoUrl={property.videoUrl} />
          </section>
        )}

        {/* --- AMENITIES (Project Amenities) --- */}
        {property.amenities && property.amenities.length > 0 && (
          <section id="amenities" className="py-14">
            <div className="text-center mb-10">
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-[#C9A227]/10 rounded-full mb-3">
                <span className="w-2 h-2 rounded-full bg-[#C9A227] animate-pulse" />
                <span className="text-[10px] font-black text-[#C9A227] uppercase tracking-[0.2em]">Premium Living</span>
              </div>
              <h2 className="text-3xl md:text-4xl font-bold text-[#1A1800] mb-3 font-[var(--font-playfair)]">
                Project <span className="text-[#C9A227]">Amenities</span>
              </h2>
              <div className="w-20 h-1 bg-[#C9A227] mx-auto mb-4 rounded-full" />
            </div>
            <ProjectAmenitiesGrid amenities={property.amenities} />
          </section>
        )}

        {/* --- WORLD CLASS AMENITIES --- */}
        {property.worldClassAmenities && property.worldClassAmenities.length > 0 && (
          <section id="world-class-amenities" className="py-14 border-t border-gray-100">
            <div className="text-center mb-10">
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-[#C9A227]/10 rounded-full mb-3">
                <span className="w-2 h-2 rounded-full bg-[#C9A227] animate-pulse" />
                <span className="text-[10px] font-black text-[#C9A227] uppercase tracking-[0.2em]">Luxury Lifestyle</span>
              </div>
              <h2 className="text-3xl md:text-4xl font-bold text-[#1A1800] mb-3 font-[var(--font-playfair)]">
                World Class <span className="text-[#C9A227]">Amenities</span>
              </h2>
              <div className="w-20 h-1 bg-[#C9A227] mx-auto mb-4 rounded-full" />
            </div>
            <WorldClassAmenitiesGrid amenities={property.worldClassAmenities} />
          </section>
        )}

        <div className="bg-[#C9A227] rounded-xl p-6 md:p-8 flex flex-col md:flex-row justify-between items-center gap-6 shadow-lg mb-16">
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

        {/* --- ABOUT & FORM --- */}
        <section id="about" className="py-16 border-t border-gray-100">
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
              <PropertyEnquiryForm
                propertyId={property._id.toString()}
                propertyTitle={property.title}
                waLink={waLink}
              />
            </div>
          </div>
        </section>

      </div>
    </div>
  );
}
