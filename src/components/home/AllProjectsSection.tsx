"use client";

import { useMemo, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import {
  MapPin, ExternalLink,
  ChevronRight
} from 'lucide-react';
import type { Property } from '@/types';
import { formatPrice, getPropertyUrl } from '@/lib/utils';

// ─── Fallback canonical projects data (if DB is temporarily empty) ─────────────
const FALLBACK_PROJECTS = [
  {
    key: 'nivasa-ii',
    slug: 'nivasa-ii',
    name: 'Nivasa II',
    shortName: 'Nivasa II',
    location: 'Gwal Pahari, Mandi Rd, Gurgaon',
    status: 'ready' as const,
    readyLabel: 'Ready to Move',
    possession: 'Immediate Possession',
    priceList: [
      { type: '3BHK', size: '120 Sq. Yd.', price: '₹75 Lakhs', negotiable: true },
    ],
    badge: 'Ready Now',
    image: 'https://res.cloudinary.com/ddpahrqfk/image/upload/v1788081968/ss-realty/properties/ss-realty/properties/3bhk-flat-in-mandi-gwal-pahari-9.webp',
  },
  {
    key: 'the-arch',
    slug: 'the-arch',
    name: 'The Arch',
    shortName: 'The Arch',
    location: 'Gwal Pahari, Mandi Rd, Gurgaon',
    status: 'under-construction' as const,
    readyLabel: 'Under Construction',
    possession: 'July 2027',
    priceList: [
      { type: '3BHK', size: '130 Sq.Yd.', price: '₹1.25 Cr', negotiable: true },
    ],
    badge: 'Jul 2027',
    image: 'https://res.cloudinary.com/ddpahrqfk/image/upload/v1781245884/ss-realty/properties/ccincc648g7oxuis4lt9.webp',
  },
  {
    key: 'orchid',
    slug: 'orchid',
    name: 'Orchid',
    shortName: 'Orchid',
    location: 'Gwal Pahari, Mandi Rd, Gurgaon',
    status: 'ready' as const,
    readyLabel: 'Ready to Move',
    possession: 'Immediate Possession',
    priceList: [
      { type: '3BHK', size: '130 Sq.Yd.', price: '₹85 Lakhs', negotiable: true },
    ],
    badge: 'Ready Now',
    image: 'https://res.cloudinary.com/ddpahrqfk/image/upload/v1781241010/ss-realty/properties/zymyrsvlugzjyk0obbzm.webp',
  },
  {
    key: 'vasundhara',
    slug: 'vasundhara',
    name: 'Vasundhara',
    shortName: 'Vasundhara',
    location: 'Chattarpur, New Delhi',
    status: 'under-construction' as const,
    readyLabel: 'Under Construction',
    possession: 'May 2027',
    priceList: [
      { type: '3BHK Simplex', size: '150 Sq.Yd.', price: '₹1.25 Cr', negotiable: true },
      { type: '3BHK Duplex', size: '150 Sq.Yd.', price: '₹1.39 Cr', negotiable: true },
    ],
    badge: 'May 2027',
    image: 'https://res.cloudinary.com/ddpahrqfk/image/upload/v1781095452/ss-realty/properties/dltmdd30y9su3qe5kw5e.jpg',
  },
  {
    key: 'velora',
    slug: 'velora',
    name: 'Velora',
    shortName: 'Velora',
    location: 'Chattarpur, New Delhi',
    status: 'under-construction' as const,
    readyLabel: 'Under Construction',
    possession: 'May 2027',
    priceList: [
      { type: '3BHK', size: '165 Sq.Yd.', price: '₹1.5 Cr', negotiable: true },
      { type: '4BHK', size: '250 Sq.Yd.', price: '₹2.25 Cr', negotiable: true },
      { type: '4BHK + Study + Family Suite', size: '350 Sq.Yd.', price: '₹2.99 Cr', negotiable: true },
    ],
    badge: 'May 2027',
    image: 'https://res.cloudinary.com/ddpahrqfk/image/upload/v1781087797/ss-realty/properties/hlvksrh3mfvnyzz2gdc3.jpg',
  },
  {
    key: 'amaryllis',
    slug: 'amaryllis',
    name: 'Amaryllis',
    shortName: 'Amaryllis',
    location: 'Gwal Pahari, Gurgaon',
    status: 'under-construction' as const,
    readyLabel: 'Under Construction',
    possession: 'Jan 2027',
    priceList: [
      { type: '3BHK', size: '130 Sq.Yd.', price: '₹1.25 Cr', negotiable: true },
      { type: '4BHK', size: '160 Sq.Yd.', price: '₹1.5 Cr', negotiable: true },
    ],
    badge: 'Jan 2027',
    image: 'https://res.cloudinary.com/ddpahrqfk/image/upload/v1780917875/ss-realty/properties/pp1rcn67dbzcedajds7y.jpg',
  },
];

// Helper to determine possession timeline
function getPossessionText(p: Property): string {
  const name = (p.propertyName || p.title || '').toLowerCase();
  if (name.includes('nivasa') || name.includes('orchid') || p.status === 'delivered') {
    return 'Immediate Possession';
  }
  if (name.includes('the arch')) return 'July 2027';
  if (name.includes('vasundhara')) return 'May 2027';
  if (name.includes('velora')) return 'May 2027';
  if (name.includes('amaryllis')) return 'Jan 2027';
  
  if ((p as any).possessionDate || (p.projectDetails as any)?.possessionDate) {
    const d = (p as any).possessionDate || (p.projectDetails as any)?.possessionDate;
    return new Date(d).toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
  }

  // Predictable completion based on ID hashing for any new properties
  const hash = p._id.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  const isReady = hash % 2 === 0;
  if (isReady) return 'Immediate Possession';

  const months = ['Mar', 'Jun', 'Sep', 'Dec'];
  const years = ['2026', '2027', '2028'];
  return `${months[hash % 4]} ${years[hash % 3]}`;
}

// Helper to format clean project name
function getProjectCleanName(p: Property): string {
  if (p.propertyName) return p.propertyName;
  if (p.projectDetails?.projectName) return p.projectDetails.projectName;
  return (p.title || '')
    .replace(/^(\d+\s*BHK\s*(&\s*\d+\s*BHK)?(\s*\+\s*Study)?(\s*Simple\s*&\s*Duplex)?\s*(Apartments?|Flats?|Builder Floors?)\s*in\s*)/i, '')
    .split(',')[0]
    .trim() || p.title;
}

// Helper to extract unit types & prices
function getProjectPriceList(p: Property) {
  if (p.priceList && p.priceList.length > 0) {
    return p.priceList.map((item: any) => {
      let sizeStr = item.size?.trim() || '';
      if (sizeStr && /^[0-9\s\.,]+$/.test(sizeStr)) {
        const unit = p.features?.areaUnit === 'sqyd' ? 'Sq.Yd.' : (p.features?.areaUnit || 'Sq.Ft.');
        sizeStr = `${sizeStr} ${unit}`;
      }
      return {
        type: item.type || (p.features?.bedrooms ? `${p.features.bedrooms}BHK` : 'Unit'),
        size: sizeStr || (p.features?.area ? `${p.features.area} ${(p.features?.areaUnit || 'sqft') === 'sqyd' ? 'Sq.Yd.' : 'Sq.Ft.'}` : '—'),
        price: item.price || (p.price ? formatPrice(p.price) : 'Price on Request'),
        negotiable: item.negotiable !== false,
      };
    });
  }

  const bhk = p.features?.bedrooms ? `${p.features.bedrooms}BHK` : 'Premium Unit';
  const size = p.features?.area ? `${p.features.area} ${(p.features?.areaUnit || 'sqft') === 'sqyd' ? 'Sq.Yd.' : 'Sq.Ft.'}` : '—';
  return [{
    type: bhk,
    size: size,
    price: formatPrice(p.price),
    negotiable: true,
  }];
}

// ─── Table Row Component ──────────────────────────────────────────────────────
interface ProjectRowItem {
  key: string;
  name: string;
  location: string;
  possession: string;
  priceList: { type: string; size: string; price: string; negotiable?: boolean }[];
  image: string;
  href: string;
}

function TableRow({ project }: { project: ProjectRowItem }) {
  const [imgError, setImgError] = useState(false);
  const thumb = imgError || !project.image ? '/SS Realty.png' : project.image;

  return (
    <Link
      href={project.href}
      className="grid items-center gap-3 px-4 py-3.5 hover:bg-[#FBF8EC] transition-colors duration-200 border-b border-[#F0EDD5] last:border-b-0 group"
      style={{ gridTemplateColumns: 'auto 1.8fr 1.2fr 0.7fr 1.8fr 0.8fr auto' }}
    >
      {/* Thumbnail */}
      <div className="relative w-11 h-9 rounded-lg overflow-hidden bg-[#FAF8F2] border border-[#E8E0C0] shrink-0">
        <Image
          src={thumb}
          alt={project.name}
          fill
          className="object-cover group-hover:scale-110 transition-transform duration-500"
          sizes="88px"
          quality={90}
          onError={() => setImgError(true)}
        />
      </div>

      {/* Name */}
      <span className="font-bold text-[#1A1800] text-sm group-hover:text-[#C9A227] transition-colors">
        {project.name}
      </span>

      {/* Location */}
      <div className="flex items-center gap-1 min-w-0">
        <MapPin size={11} className="text-[#C9A227] shrink-0" />
        <span className="text-[#64748B] text-xs truncate">{project.location}</span>
      </div>

      {/* Possession */}
      <span className="text-[#64748B] text-xs font-medium">{project.possession}</span>

      {/* Unit Types + Prices */}
      <div className="flex flex-col gap-0.5">
        {project.priceList.map((pl, i) => (
          <span key={i} className="text-xs text-[#64748B]">
            <span className="font-semibold text-[#1A1800]">{pl.price}</span>
            {' '}· {pl.type}
            {pl.size && pl.size !== '—' ? ` · ${pl.size}` : ''}
          </span>
        ))}
      </div>

      {/* Negotiable */}
      <span className="text-[10px] text-emerald-600 font-bold bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200 whitespace-nowrap">
        Negotiable
      </span>

      {/* Arrow */}
      <ChevronRight size={15} className="text-[#C9A227] opacity-0 group-hover:opacity-100 transition-opacity" />
    </Link>
  );
}

// ─── Main Export ──────────────────────────────────────────────────────────────
interface AllProjectsSectionProps {
  allProperties: Property[]; // All DB properties (available + delivered merged)
}

export default function AllProjectsSection({ allProperties }: AllProjectsSectionProps) {
  // Dynamically map all active properties from DB.
  // When an admin adds a new property in the Admin Panel, it automatically appears here.
  const displayProjects = useMemo<ProjectRowItem[]>(() => {
    if (!allProperties || allProperties.length === 0) {
      return FALLBACK_PROJECTS.map((p) => ({
        key: p.key,
        name: p.name,
        location: p.location,
        possession: p.possession,
        priceList: p.priceList,
        image: p.image,
        href: `/properties/${p.slug}`,
      }));
    }

    // Filter available project listings
    const available = allProperties.filter((p) => p.status === 'available');
    const sourceList = available.length > 0 ? available : allProperties;

    // Sort newest DB entry first so new properties appear at top
    const sorted = [...sourceList].sort((a, b) => {
      const timeA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
      const timeB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
      return timeB - timeA;
    });

    return sorted.map((p) => ({
      key: p._id,
      name: getProjectCleanName(p),
      location: p.location?.address ? `${p.location.address}, ${p.location.city}` : (p.location?.city || 'Delhi NCR'),
      possession: getPossessionText(p),
      priceList: getProjectPriceList(p),
      image: p.interiorImages?.[0] || p.images?.[0] || '/SS Realty.png',
      href: getPropertyUrl(p),
    }));
  }, [allProperties]);

  return (
    <section className="section-padding bg-[#FAF8F2]" aria-label="SS Realty Projects Portfolio">
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8">

        {/* ── Section Header ── */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-[#C9A227]/10 rounded-full mb-3">
            <span className="w-2 h-2 rounded-full bg-[#C9A227] animate-pulse" />
            <span className="text-[10px] font-black text-[#7A5C00] uppercase tracking-[0.2em]">Our Portfolio</span>
          </div>
          <h2 className="text-3xl md:text-4xl font-bold text-[#1A1800] mb-3 font-[var(--font-playfair)]">
            All{' '}
            <span className="bg-gradient-to-r from-[#C9A227] via-[#F0D060] to-[#B8860B] bg-clip-text text-transparent">
              SS Realty Projects
            </span>
          </h2>
          <div className="w-20 h-1 bg-[#C9A227] mx-auto mb-4 rounded-full" />
          <p className="text-[#64748B] max-w-2xl mx-auto text-base">
            {displayProjects.length} premium residential projects in Chattarpur, Gwal Pahari &amp; Delhi NCR — all prices negotiable
          </p>
        </div>

        {/* ── TABLE VIEW ── */}
        <div className="bg-white rounded-2xl border border-[#E8E0C0] shadow-sm overflow-hidden overflow-x-auto mb-8">
          {/* Header */}
          <div
            className="grid items-center gap-3 px-4 py-3 bg-[#FAF8F2] border-b border-[#E8E0C0] min-w-[820px]"
            style={{ gridTemplateColumns: 'auto 1.8fr 1.2fr 0.7fr 1.8fr 0.8fr auto' }}
          >
            <span className="text-[11px] font-black text-[#7A5C00] uppercase tracking-wider w-11">#</span>
            <span className="text-[11px] font-black text-[#7A5C00] uppercase tracking-wider">Project</span>
            <span className="text-[11px] font-black text-[#7A5C00] uppercase tracking-wider">Location</span>
            <span className="text-[11px] font-black text-[#7A5C00] uppercase tracking-wider">Possession</span>
            <span className="text-[11px] font-black text-[#7A5C00] uppercase tracking-wider">Sizes &amp; Prices</span>
            <span className="text-[11px] font-black text-[#7A5C00] uppercase tracking-wider">Price</span>
            <span className="w-4" />
          </div>
          {/* Rows */}
          <div className="min-w-[820px]">
            {displayProjects.map((p, i) => (
              <TableRow key={p.key || i} project={p} />
            ))}
          </div>
        </div>

        {/* ── View All CTA ── */}
        <div className="text-center mt-4">
          <Link href="/properties" className="btn-primary inline-flex items-center gap-2">
            View All Properties
            <ExternalLink size={15} />
          </Link>
        </div>
      </div>
    </section>
  );
}

