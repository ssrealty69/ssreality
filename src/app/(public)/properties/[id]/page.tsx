import React from 'react';
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
    const isObjectId = mongoose.Types.ObjectId.isValid(id);
    let property: any = null;
    
    if (!isObjectId) {
      property = await Property.findOne({ slug: id }).select('title description seo images').lean();
    }
    
    if (!property && isObjectId) {
      property = await Property.findById(id).select('title description seo images').lean();
    }
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

// Generates descriptive alt text: e.g. "Amaryllis 3BHK & 4BHK Flat in Gwal Pahari Mandi Building Image 1"
function generateImageAlt(property: any, idx: number, suffix?: string): string {
  const name = property.propertyName || property.title || 'Property';
  const location = property.location?.address || property.location?.city || '';

  // Build BHK / config part from priceList
  let configPart = '';
  if (property.priceList && property.priceList.length > 0) {
    const types = property.priceList
      .map((item: any) => item.type?.trim())
      .filter(Boolean);
    const formattedTypes = Array.from(new Set(types.map((t: string) => {
      let f = t.replace(/(\d+)\s*(BHK)/i, '$1 BHK');
      f = f.replace(/bhk/i, 'BHK');
      return f;
    }))) as string[];
    if (formattedTypes.length === 1) configPart = formattedTypes[0];
    else if (formattedTypes.length === 2) configPart = `${formattedTypes[0]} & ${formattedTypes[1]}`;
    else configPart = `${formattedTypes.slice(0, -1).join(', ')} & ${formattedTypes[formattedTypes.length - 1]}`;
  } else if (property.features?.bedrooms) {
    configPart = `${property.features.bedrooms} BHK`;
  }

  // Add "Flat" after BHK if not already present
  if (configPart && !configPart.toLowerCase().includes('flat')) {
    configPart = `${configPart} Flat`;
  }

  const locationPart = location ? ` in ${location}` : '';
  const imgLabel = suffix || `Image ${idx + 1}`;

  if (configPart) {
    return `${name} ${configPart}${locationPart} ${imgLabel}`;
  }
  return `${name}${locationPart} ${imgLabel}`;
}

function formatPropertyHeading(priceList: any[], propertyType: string): string {
  const pluralType = propertyType.endsWith('y')
    ? propertyType.slice(0, -1) + 'ies'
    : propertyType + 's';
  const capitalizedPluralType = pluralType.charAt(0).toUpperCase() + pluralType.slice(1);

  if (!priceList || priceList.length === 0) {
    return capitalizedPluralType;
  }

  const types = priceList
    .map(item => item.type?.trim())
    .filter(Boolean);

  if (types.length === 0) {
    return capitalizedPluralType;
  }

  // Format type spacing and capitalization (e.g. "3bhk" -> "3 BHK", "Duplex 3bhk" -> "Duplex 3 BHK")
  const formattedTypes = types.map(t => {
    let formatted = t.replace(/(\d+)\s*(BHK)/i, '$1 BHK');
    formatted = formatted.replace(/bhk/i, 'BHK');
    return formatted;
  });

  const uniqueTypes = Array.from(new Set(formattedTypes));

  let configPart = '';
  if (uniqueTypes.length === 1) {
    configPart = uniqueTypes[0];
  } else if (uniqueTypes.length === 2) {
    configPart = `${uniqueTypes[0]} & ${uniqueTypes[1]}`;
  } else {
    configPart = `${uniqueTypes.slice(0, -1).join(', ')} & ${uniqueTypes[uniqueTypes.length - 1]}`;
  }

  const hasPropertyType = configPart.toLowerCase().includes(propertyType.toLowerCase());

  if (hasPropertyType) {
    return configPart;
  }

  return `${configPart} ${capitalizedPluralType}`;
}

export default async function PropertyLandingPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  let property: any = null;
  let relatedProperties: any[] = [];
  let deliveredProperties: any[] = [];

  try {
    await connectDB();
    const isObjectId = mongoose.Types.ObjectId.isValid(id);
    
    if (!isObjectId) {
      property = await Property.findOne({ slug: id }).lean();
    }
    
    if (!property && isObjectId) {
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

  // Return 404 if property not found in DB
  if (!property) {
    notFound();
  }

  // JSON-LD Structured Data for Property (Google Rich Cards compliant with image and price)
  const propertyJsonLd = [
    {
      '@context': 'https://schema.org',
      '@type': 'Product',
      name: property.title,
      image: property.images && property.images.length > 0 ? property.images : ['https://ssrealty.org/SS%20Realty%20Official%20Logo.png'],
      description: property.description || `Premium ${property.features.bedrooms ? `${property.features.bedrooms} BHK ` : ''}${property.propertyType} for sale/rent at ${property.location.address}, ${property.location.city}.`,
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
        url: `https://ssrealty.org/properties/${property.slug || (property._id ? property._id.toString() : id)}`
      }
    },
    {
      '@context': 'https://schema.org',
      '@type': property.propertyType === 'flat' || property.propertyType === 'apartment' ? 'Apartment' : 'SingleFamilyResidence',
      name: property.title,
      description: property.description,
      image: property.images && property.images.length > 0 ? property.images : ['https://ssrealty.org/SS%20Realty%20Official%20Logo.png'],
      address: {
        '@type': 'PostalAddress',
        streetAddress: property.location.address,
        addressLocality: property.location.city,
        addressRegion: 'Haryana / NCR',
        addressCountry: 'IN'
      },
      ...(property.features.bedrooms ? { numberOfBedrooms: property.features.bedrooms } : {}),
      numberOfBathrooms: property.features.bathrooms || 3,
      ...(property.features.area ? {
        floorSize: {
          '@type': 'QuantitativeValue',
          value: property.features.area,
          unitText: (property.features.areaUnit || 'sqft') === 'sqyd' ? 'Square Yards' : 'Square Feet'
        }
      } : {})
    }
  ];

  const waMessage = encodeURIComponent(`Hi! I'm interested in ${property.title}. Please share details.`);
  const waLink = `https://api.whatsapp.com/send?phone=+919311059100&text=${waMessage}`;

  // Get all gallery images to display, excluding the main hero banner image (which is property.images[0])
  const heroImage = property.images && property.images.length > 0 ? property.images[0] : null;
  const galleryImagesSource = property.galleryImages && property.galleryImages.length > 0
    ? property.galleryImages
    : (property.interiorImages && property.interiorImages.length > 0
      ? property.interiorImages
      : property.images || []);
  const galleryImages = galleryImagesSource.filter((imgUrl: string) => imgUrl !== heroImage);

  return (
    <div className="font-sans bg-white overflow-x-hidden">
      <style dangerouslySetInnerHTML={{
        __html: `
        @keyframes custom-smooth-blink {
          0%, 100% { opacity: 0.8; border-color: rgba(201, 162, 39, 0.45); box-shadow: 0 0 8px rgba(201, 162, 39, 0.2); }
          50% { opacity: 1; border-color: rgba(201, 162, 39, 0.95); box-shadow: 0 0 16px rgba(201, 162, 39, 0.55); }
        }
        .animate-smooth-blink {
          animation: custom-smooth-blink 3s ease-in-out infinite;
        }
      `}} />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(propertyJsonLd) }}
      />
      <ViewPropertyTracker property={property} />

      {/* --- HERO SECTION --- */}
      <div className="relative w-full h-[80vh] min-h-[500px]">
        {/* Desktop & Tablet Background */}
        <div className={property.mobileBannerUrl ? "hidden md:block absolute inset-0" : "absolute inset-0"}>
          <Image
            src={property.images && property.images.length > 0 ? property.images[0] : "/hero-nature.webp"}
            alt={generateImageAlt(property, 0, 'Building Main Image')}
            fill
            className="object-cover"
            priority
            sizes="100vw"
            quality={80}
          />
        </div>
        {/* Mobile Background */}
        {property.mobileBannerUrl && (
          <div className="block md:hidden absolute inset-0">
            <Image
              src={property.mobileBannerUrl}
              alt={generateImageAlt(property, 0, 'Building Mobile Banner')}
              fill
              className="object-cover"
              priority
            />
          </div>
        )}
        {/* Pink/Red Gradient Overlay similar to screenshot 1 */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent md:from-[#1A1800]/50 md:via-[#1A1800]/20 md:to-transparent" />

        {/* Hero Content Box - Centered vertically but padded top to clear header */}
        <div className="absolute inset-0 max-w-7xl mx-auto px-4 flex flex-col justify-end pb-16 items-center text-center md:justify-center md:pb-0 md:items-start md:text-left pt-24 md:pt-16">
          <div className="max-w-xl text-white flex flex-col items-center md:items-start">
            {/* Price Badge - Gold outlined glowing style like Farmhouse Exclusive Launch badge */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-[#C9A227]/60 bg-[#C9A227]/10 md:bg-gradient-to-r md:from-black/60 md:via-[#2b2200]/60 md:to-[#1A1800]/60 backdrop-blur-sm mb-5 shadow-[0_0_8px_rgba(201,162,39,0.4)] animate-smooth-blink">
              <span className="w-2 h-2 rounded-full bg-gradient-to-br from-[#FFE59E] via-[#E8C96A] to-[#C9A227] shadow-[0_0_10px_#E8C96A] inline-block shrink-0 animate-pulse" />
              <span className="text-[#E8C96A] text-[10px] md:text-xs font-bold tracking-[0.22em] uppercase">
                ₹ {formatPrice(property.price)} {property.priceType === 'rent' ? '/month' : 'Onwards'}
              </span>
            </div>

            {/* Title - Serif Playfair font with gold gradient */}
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight mb-2 bg-gradient-to-r from-[#FFE59E] via-[#E8C96A] to-[#C9A227] bg-clip-text text-transparent"
              style={{
                fontFamily: 'var(--font-playfair, Georgia, serif)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                color: 'transparent',
                filter: 'drop-shadow(0 2px 8px rgba(0,0,0,0.95))'
              }}>
              <span className="capitalize">{formatPropertyHeading(property.priceList, property.propertyType)}</span>
            </h1>

            {/* Subtitle - Gold gradient matching Farmhouse design */}
            <p className="font-semibold text-lg md:text-xl tracking-wide bg-gradient-to-r from-[#FFE59E] to-[#E8C96A] bg-clip-text text-transparent mb-6"
              style={{
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                color: 'transparent',
                filter: 'drop-shadow(0 1px 4px rgba(0,0,0,0.9))'
              }}>
              {property.location.address}, {property.location.city}
            </p>

            {/* Tags - Farmhouse pill style */}
            <div className="flex flex-wrap gap-2.5 justify-center md:justify-start">

              {property.features.reraApproved && (
                <span className="px-3.5 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-wider text-white/90 border border-white/20 bg-white/5 backdrop-blur-sm flex items-center gap-1.5">
                  Rera Approved <CheckCircle2 size={12} className="text-[#25D366]" fill="white" />
                </span>
              )}
              {property.features.registryAvailable !== false && (
                <span className="px-3.5 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-wider text-white/90 border border-white/20 bg-white/5 backdrop-blur-sm flex items-center gap-1.5">
                  Registry Available <CheckCircle2 size={12} className="text-[#25D366]" fill="white" />
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4">

        {/* --- OVERVIEW SECTION --- */}
        <section id="overview" className="py-16 relative">
          {/* Subtle gold blur highlight in the background */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[300px] bg-[#C9A227]/4 rounded-full blur-[90px] pointer-events-none -z-10" />

          <div className="w-full bg-gradient-to-br from-white to-[#FDFBF7] border border-[#E8D5A3]/30 rounded-[32px] p-6 sm:p-10 md:p-12 shadow-[0_15px_45px_-10px_rgba(201,162,39,0.08)] relative overflow-hidden mb-16">
            {/* Elegant luxury gold label */}
            <div className="text-center mb-6">
              <span className="text-[10px] font-black text-[#C9A227] uppercase tracking-[0.3em] mb-2 block">
                The Residence
              </span>
              <h2 className="text-3xl sm:text-4xl font-bold font-[var(--font-playfair)] text-[#1A1800] leading-tight">
                {property.title} — <span className="bg-gradient-to-r from-[#C9A227] to-[#B8860B] bg-clip-text text-transparent">Overview</span>
              </h2>
              <div className="w-16 h-0.5 bg-[#C9A227]/40 mx-auto mt-4 rounded-full" />
            </div>

            <div
              className="text-center text-[#1A1800]/85 text-base sm:text-lg [&_h2]:text-2xl [&_h2]:font-bold [&_h2]:text-[#1A1800] [&_h2]:mt-6 [&_h2]:mb-3 [&_strong]:text-[#C9A227] [&_strong]:font-black [&_p]:mb-5 last:[&_p]:mb-0 font-medium leading-relaxed max-w-none"
              dangerouslySetInnerHTML={{ __html: property.description }}
            />
          </div>

          <div className="flex flex-col lg:flex-row gap-8">
            {/* Left side: Premium Image Slider */}
            <div className="lg:w-1/3 relative h-[350px] rounded-xl overflow-hidden shadow-lg shrink-0">
              <ImageSlider
                images={
                  property.interiorImages && property.interiorImages.length > 0
                    ? property.interiorImages
                    : (property.images && property.images.length > 0 ? property.images : ['/hero-nature.webp'])
                }
                altPrefix={generateImageAlt(property, 0).replace(' Building Main Image', '')}
              />
            </div>

            {/* Right side: Specs & Pricing info */}
            <div className="lg:w-2/3 flex flex-col justify-between">
              <div>
                <div className="grid grid-cols-2 md:grid-cols-2 gap-3 mb-8">
                  <div className="flex group bg-white border border-[#E8D5A3]/40 rounded-xl overflow-hidden shadow-sm hover:shadow-[var(--shadow-gold-sm)] transition-all duration-300 hover:-translate-y-0.5">
                    <div className="w-10 sm:w-14 flex items-center justify-center bg-gradient-to-br from-[#FFFEF5] to-[#FDFBF0] border-r border-[#E8D5A3]/30 text-[#C9A227] group-hover:scale-110 transition-transform shrink-0">
                      <MapPin size={18} />
                    </div>
                    <div className="flex-1 px-2.5 sm:px-4 py-3 text-[#1A1800] text-[11px] sm:text-sm font-bold flex items-center leading-tight">
                      {property.location.city}
                    </div>
                  </div>

                  {property.features.towers ? (
                    <div className="flex group bg-white border border-[#E8D5A3]/40 rounded-xl overflow-hidden shadow-sm hover:shadow-[var(--shadow-gold-sm)] transition-all duration-300 hover:-translate-y-0.5">
                      <div className="w-10 sm:w-14 flex items-center justify-center bg-gradient-to-br from-[#FFFEF5] to-[#FDFBF0] border-r border-[#E8D5A3]/30 text-[#C9A227] group-hover:scale-110 transition-transform shrink-0">
                        <Building size={18} />
                      </div>
                      <div className="flex-1 px-2.5 sm:px-4 py-3 text-[#1A1800] text-[11px] sm:text-sm font-bold flex items-center leading-tight">
                        {property.features.towers} Towers
                      </div>
                    </div>
                  ) : null}

                  <div className="flex group bg-white border border-[#E8D5A3]/40 rounded-xl overflow-hidden shadow-sm hover:shadow-[var(--shadow-gold-sm)] transition-all duration-300 hover:-translate-y-0.5">
                    <div className="w-10 sm:w-14 flex items-center justify-center bg-gradient-to-br from-[#FFFEF5] to-[#FDFBF0] border-r border-[#E8D5A3]/30 text-[#C9A227] group-hover:scale-110 transition-transform shrink-0">
                      <Zap size={18} />
                    </div>
                    <div className="flex-1 px-2.5 sm:px-4 py-3 text-[#1A1800] text-[11px] sm:text-sm font-bold flex items-center leading-tight capitalize">
                      {property.status}
                    </div>
                  </div>

                  {property.features.totalFloors ? (
                    <div className="flex group bg-white border border-[#E8D5A3]/40 rounded-xl overflow-hidden shadow-sm hover:shadow-[var(--shadow-gold-sm)] transition-all duration-300 hover:-translate-y-0.5">
                      <div className="w-10 sm:w-14 flex items-center justify-center bg-gradient-to-br from-[#FFFEF5] to-[#FDFBF0] border-r border-[#E8D5A3]/30 text-[#C9A227] group-hover:scale-110 transition-transform shrink-0">
                        <Layers size={18} />
                      </div>
                      <div className="flex-1 px-2.5 sm:px-4 py-3 text-[#1A1800] text-[11px] sm:text-sm font-bold flex items-center leading-tight">
                        G + {property.features.totalFloors} Floors
                      </div>
                    </div>
                  ) : null}

                  {property.features.totalUnits ? (
                    <div className="flex group bg-white border border-[#E8D5A3]/40 rounded-xl overflow-hidden shadow-sm hover:shadow-[var(--shadow-gold-sm)] transition-all duration-300 hover:-translate-y-0.5">
                      <div className="w-10 sm:w-14 flex items-center justify-center bg-gradient-to-br from-[#FFFEF5] to-[#FDFBF0] border-r border-[#E8D5A3]/30 text-[#C9A227] group-hover:scale-110 transition-transform shrink-0">
                        <Hash size={18} />
                      </div>
                      <div className="flex-1 px-2.5 sm:px-4 py-3 text-[#1A1800] text-[11px] sm:text-sm font-bold flex items-center leading-tight">
                        {property.features.totalUnits} Units
                      </div>
                    </div>
                  ) : null}
                </div>

                {property.priceList && property.priceList.length > 0 && (
                  <div className="mb-8">
                    <h4 className="text-[10px] sm:text-[11px] uppercase tracking-[0.2em] font-black text-[#C9A227] mb-3 pl-1">
                      Available Configurations & Pricing
                    </h4>
                    <div className="space-y-3">
                      {property.priceList.map((item: any, idx: number) => {
                        const displaySize = /^[0-9\s.,]+$/.test(item.size)
                          ? `${item.size} ${property.features.areaUnit === 'sqyd' ? 'Sq.Yd' : property.features.areaUnit}`
                          : item.size;

                        return (
                          <div key={idx} className="grid grid-cols-3 gap-2 sm:gap-3">
                            {/* Unit Type / Name */}
                            <div className="flex group bg-[#FFFEFC] border border-[#E8D5A3]/50 rounded-xl overflow-hidden shadow-sm hover:shadow-[0_8px_20px_-3px_rgba(201,162,39,0.15)] transition-all duration-300 hover:-translate-y-0.5">
                              <div className="w-8 sm:w-14 flex items-center justify-center bg-gradient-to-br from-[#C9A227] to-[#B8860B] border-r border-[#C9A227]/20 text-white group-hover:scale-110 transition-transform shrink-0">
                                <BedDouble size={16} className="sm:w-[18px] sm:h-[18px] text-white" />
                              </div>
                              <div className="flex-1 px-2 sm:px-4 py-3 text-[#1A1800] text-[10px] sm:text-sm font-bold flex items-center leading-tight truncate">
                                {item.type}
                              </div>
                            </div>

                            {/* Area / Size */}
                            <div className="flex group bg-[#FFFEFC] border border-[#E8D5A3]/50 rounded-xl overflow-hidden shadow-sm hover:shadow-[0_8px_20px_-3px_rgba(201,162,39,0.15)] transition-all duration-300 hover:-translate-y-0.5">
                              <div className="w-8 sm:w-14 flex items-center justify-center bg-gradient-to-br from-[#C9A227] to-[#B8860B] border-r border-[#C9A227]/20 text-white group-hover:scale-110 transition-transform shrink-0">
                                <Maximize2 size={16} className="sm:w-[18px] sm:h-[18px] text-white" />
                              </div>
                              <div className="flex-1 px-2 sm:px-4 py-3 text-[#1A1800] text-[10px] sm:text-sm font-bold flex items-center leading-tight truncate">
                                {displaySize}
                              </div>
                            </div>

                            {/* Price */}
                            <div className="flex group bg-[#FFFEFC] border border-[#E8D5A3]/50 rounded-xl overflow-hidden shadow-sm hover:shadow-[0_8px_20px_-3px_rgba(201,162,39,0.15)] transition-all duration-300 hover:-translate-y-0.5">
                              <div className="w-8 sm:w-14 flex items-center justify-center bg-gradient-to-br from-[#C9A227] to-[#B8860B] border-r border-[#C9A227]/20 text-white group-hover:scale-110 transition-transform shrink-0">
                                <span className="text-xs sm:text-base font-extrabold text-white">₹</span>
                              </div>
                              <div className="flex-1 px-2 sm:px-4 py-2.5 text-[#1A1800] flex flex-col justify-center gap-0.5 min-w-0">
                                <span className="text-[10px] sm:text-sm font-bold leading-tight">{item.price}</span>
                                {item.negotiable && (
                                  <span className="text-[8px] sm:text-[10px] font-black text-green-700 bg-green-50 border border-green-200 px-1.5 py-0.5 rounded-full uppercase tracking-wide leading-none w-fit">
                                    Negotiable
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>

              <PropertyActions
                propertyId={property._id.toString()}
                propertyTitle={property.title}
                brochureUrl={property.brochureUrl}
                waLink={waLink}
                property={property}
              />
            </div>
          </div>
        </section>

        {/* --- HIGHLIGHTS SECTION --- */}
        {property.highlights && property.highlights.length > 0 && (
          <section id="highlights" className="py-16 md:py-24 relative bg-[#FFFEF5] overflow-hidden border-t border-b border-amber-100/30">
            {/* Ambient gold glow in background */}
            <div className="absolute -top-40 -left-40 w-96 h-96 rounded-full bg-[#C9A227]/5 blur-3xl pointer-events-none select-none" />
            <div className="absolute -bottom-40 -right-40 w-96 h-96 rounded-full bg-[#C9A227]/5 blur-3xl pointer-events-none select-none" />

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
              <div className="text-center mb-12 md:mb-16">
                <div className="inline-flex items-center gap-2 px-3 py-1 bg-[#C9A227]/10 rounded-full mb-3">
                  <span className="w-2 h-2 rounded-full bg-[#C9A227] animate-pulse" />
                  <span className="text-[10px] font-black text-[#C9A227] uppercase tracking-[0.2em]">Key Features</span>
                </div>
                <h2 className="text-3xl md:text-5xl font-bold font-[var(--font-playfair)] text-[#1A1800] mb-3">
                  Project <span className="text-[#C9A227]">Highlights</span>
                </h2>
                <div className="w-20 h-1 bg-[#C9A227] mx-auto rounded-full" />
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 md:gap-12 items-center">
                {/* Left side: Premium Rounded Image */}
                <div className="lg:col-span-5 relative w-full aspect-[4/3] sm:aspect-[16/11] lg:aspect-square rounded-[32px] overflow-hidden shadow-2xl border-4 border-white group/highlight">
                  <Image
                    src={property.highlightsImageUrl || "/World Class%20Amenities/Luxury%203BHK%20%26%204BHK%20Premium%20Floor%20Building%203.png"}
                    alt="Project Highlights Background"
                    fill
                    priority
                    unoptimized
                    className="object-cover group-hover/highlight:scale-105 transition-transform duration-1000"
                  />
                  {/* Subtle inner shadow overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent pointer-events-none" />
                </div>

                {/* Right side: Bullet Points */}
                <div className="lg:col-span-7 space-y-3.5">
                  <style>{`
                    .card-premium-highlight {
                      transition: transform 0.3s cubic-bezier(0.2, 0.8, 0.2, 1), box-shadow 0.3s ease, border-color 0.3s ease;
                    }
                    .card-premium-highlight:hover {
                      transform: translateY(-2px);
                      box-shadow: 0 10px 25px -5px rgba(201, 162, 39, 0.08), 0 8px 10px -6px rgba(0, 0, 0, 0.01);
                    }
                  `}</style>
                  {property.highlights.map((highlight: any, i: number) => {
                    const pointText = typeof highlight === 'string' ? highlight : highlight.title;
                    if (!pointText) return null;
                    return (
                      <div
                        key={i}
                        className="group flex items-center gap-4 bg-white border border-[#E8D5A3]/25 hover:border-[#C9A227]/50 hover:bg-[#FFFDF6] transition-all duration-300 py-4 px-5 rounded-2xl shadow-sm card-premium-highlight"
                      >
                        <div className="flex-shrink-0 w-6 h-6 rounded-full bg-[#25D366] flex items-center justify-center text-white shadow-sm group-hover:scale-105 transition-transform duration-300">
                          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={4}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                          </svg>
                        </div>
                        <div className="flex-1">
                          <span className="text-sm md:text-base font-semibold text-[#2D2A26] tracking-wide transition-colors duration-300 group-hover:text-[#1A1800]">
                            {pointText}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </section>
        )}

        {/* --- GALLERY SECTION --- */}
        {galleryImages.length > 0 && (
          <section id="gallery" className="py-16">
            <h2 className="text-3xl text-center font-medium text-[#1A1800] mb-10">
              {property.title} - <span className="text-[#C9A227]">Gallery</span>
            </h2>

            {galleryImages.length >= 6 ? (
              <div className="grid grid-cols-2 md:grid-cols-12 gap-2 md:gap-3 auto-rows-[150px] md:auto-rows-[190px] lg:auto-rows-[220px]">
                {galleryImages.map((imgUrl: string, idx: number) => {
                  let spanClass = '';
                  if (idx === 0) spanClass = 'col-span-2 md:col-span-6 row-span-2';
                  else if (idx === 1 || idx === 2) spanClass = 'col-span-1 md:col-span-3';
                  else if (idx === 3 || idx === 4) spanClass = 'col-span-1 md:col-span-2';
                  else if (idx === 5) spanClass = galleryImages.length === 6 ? 'col-span-2 md:col-span-2' : 'col-span-1 md:col-span-2';
                  else spanClass = 'col-span-1 md:col-span-3';

                  return (
                    <div 
                      key={idx} 
                      className={`relative rounded-xl md:rounded-2xl overflow-hidden shadow-md border border-[#E8D5A3]/40 group ${spanClass}`}
                    >
                      <Image
                        src={imgUrl}
                        alt={generateImageAlt(property, idx, `Building Image ${idx + 1}`)}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform duration-700"
                        loading={idx === 0 ? 'eager' : 'lazy'}
                        quality={idx === 0 ? 85 : 75}
                        sizes={idx === 0 ? '(max-width: 768px) 100vw, 50vw' : '(max-width: 768px) 50vw, 25vw'}
                      />
                    </div>
                  );
                })}
              </div>
            ) : galleryImages.length >= 4 ? (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2 md:gap-3 auto-rows-[150px] md:auto-rows-[190px] lg:auto-rows-[220px]">
                {galleryImages.map((imgUrl: string, idx: number) => (
                  <div 
                    key={idx} 
                    className={`relative rounded-xl md:rounded-2xl overflow-hidden shadow-md border border-[#E8D5A3]/40 group ${
                      idx === 0 ? 'col-span-2 row-span-2' : 
                      (galleryImages.length === 5 && idx === 4) ? 'col-span-1' : 'col-span-1'
                    }`}
                  >
                    <Image
                      src={imgUrl}
                      alt={generateImageAlt(property, idx, `Building Image ${idx + 1}`)}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-700"
                      loading={idx === 0 ? 'eager' : 'lazy'}
                      quality={idx === 0 ? 85 : 75}
                      sizes={idx === 0 ? '(max-width: 768px) 100vw, 50vw' : '(max-width: 768px) 50vw, 25vw'}
                    />
                  </div>
                ))}
              </div>
            ) : (
              <div className={`grid gap-2 md:gap-3 h-[250px] md:h-[350px] lg:h-[400px] ${
                galleryImages.length === 1 ? 'grid-cols-1' :
                galleryImages.length === 2 ? 'grid-cols-2' :
                'grid-cols-2 md:grid-cols-3'
              }`}>
                {galleryImages.map((imgUrl: string, idx: number) => (
                  <div key={idx} className="relative rounded-xl md:rounded-2xl overflow-hidden shadow-md border border-[#E8D5A3]/40 group">
                    <Image
                      src={imgUrl}
                      alt={generateImageAlt(property, idx, `Building Image ${idx + 1}`)}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-700"
                      loading={idx === 0 ? 'eager' : 'lazy'}
                      quality={idx === 0 ? 85 : 75}
                      sizes={idx === 0 ? '(max-width: 768px) 100vw, 50vw' : '(max-width: 768px) 50vw, 33vw'}
                    />
                  </div>
                ))}
              </div>
            )}
          </section>
        )}

      </div>

      <div className="max-w-7xl mx-auto px-4">
        {property.nearby && property.nearby.length > 0 && (
          <section id="location" className="py-16">
            <h2 className="text-3xl text-center font-medium text-[#1A1800] mb-10">
              {property.title} - <span className="text-[#C9A227]">Location Advantage</span>
            </h2>
            <div className="flex flex-col lg:flex-row gap-8">
              <div className="lg:w-1/2 relative aspect-square max-h-[500px] lg:max-h-[600px] mx-auto w-full rounded-[32px] overflow-hidden shadow-2xl border-4 border-white group bg-[#FAF8F5]">
                <Image
                  src={property.locationMapUrl || "/ss_realty_project_location_map.png"}
                  alt="Project Location Map"
                  fill
                  className="object-contain group-hover:scale-105 transition-transform duration-1000 p-2"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/5 to-transparent pointer-events-none" />
              </div>
              <div className="lg:w-1/2 flex flex-col gap-2 h-full">
                {property.nearby.map((loc: any, i: number) => (
                  <div key={i} className="flex items-center gap-3 bg-white py-2.5 px-4 rounded-xl border border-gray-100 shadow-sm transition-all hover:border-[#C9A227]/30 hover:shadow-md">
                    <div className="w-10 h-10 shrink-0 rounded-full bg-[#C9A227]/10 flex items-center justify-center text-[#C9A227]">
                      <MapPin size={18} />
                    </div>
                    <span className="text-[#1A1800] text-sm font-semibold">{loc.distance ? `${loc.distance} - ` : ''}{loc.name}</span>
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

        {/* --- RELATED PROPERTIES SECTION --- */}
        {relatedProperties.length > 0 && (
          <section id="related-properties" className="py-16 overflow-hidden">
            <h2 className="text-3xl text-center font-medium text-[#1A1800] mb-10">
              Similar <span className="text-[#A07A10]">Properties</span>
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pb-8 px-2">
              {relatedProperties.slice(0, 4).map((relatedProp: any) => (
                <div key={relatedProp._id.toString()} className="w-full">
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



        {/* --- ABOUT & FORM --- */}
        <section id="about" className="pt-16 pb-8 border-t border-gray-100">
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
