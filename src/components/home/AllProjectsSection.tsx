"use client";

import { useMemo, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import {
  MapPin, ExternalLink,
  ChevronRight
} from 'lucide-react';
import type { Property } from '@/types';

// ─── Static canonical project data ───────────────────────────────────────────
// This is the single source of truth for the homepage project listing.
// When a project is added to DB (by slug), its image is auto-fetched from DB.
// Only the IMAGE and PROPERTY PAGE LINK come from DB; all other data is here.
const PROJECTS = [
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
      { type: '3BHK', size: '130 Sq.Yd.', price: '₹75 Lakhs', negotiable: true },
    ],
    badge: 'Ready Now',
  },
  {
    key: 'nivasa-iii',
    slug: 'nivasa-iii',
    name: 'Nivasa III',
    shortName: 'Nivasa III',
    location: 'Gwal Pahari, Gurgaon',
    status: 'ready' as const,
    readyLabel: 'Ready to Move',
    possession: 'Immediate Possession',
    priceList: [
      { type: '3BHK', size: '—', price: '₹75 Lakhs', negotiable: true },
    ],
    badge: 'Ready Now',
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
    highlight: '4BHK + Study + Family Suite',
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
  },
];

// ─── Merge DB property data with static config ────────────────────────────────
function mergeProjectData(project: typeof PROJECTS[0], dbProperties: Property[]) {
  // Try to find by slug first, then by partial title match
  const dbProp =
    dbProperties.find((p) => p.slug === project.slug) ||
    dbProperties.find((p) => p.title?.toLowerCase().includes(project.key.replace(/-/g, ' ')));
  return {
    ...project,
    image: dbProp?.images?.[0] || null,
    propertyId: dbProp?._id || null,
    href: `/properties/${project.slug}`,
    // Used for auto-sorting: newest DB entry appears first in the table
    dbCreatedAt: dbProp?.createdAt || null,
  };
}

// ─── Table Row ────────────────────────────────────────────────────────────────
function TableRow({
  project,
  index,
}: {
  project: ReturnType<typeof mergeProjectData>;
  index: number;
}) {
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
          sizes="44px"
          quality={55}
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
            {pl.size !== '—' ? ` · ${pl.size}` : ''}
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
  // Merge static config with DB data, then sort newest DB entry first
  // so any newly listed property automatically appears at the top of the table
  const mergedProjects = useMemo(() => {
    const merged = PROJECTS.map((p) => mergeProjectData(p, allProperties));
    return merged.sort((a, b) => {
      if (!a.dbCreatedAt && !b.dbCreatedAt) return 0;
      if (!a.dbCreatedAt) return 1;   // no DB record → push to bottom
      if (!b.dbCreatedAt) return -1;  // no DB record → push to bottom
      return new Date(b.dbCreatedAt).getTime() - new Date(a.dbCreatedAt).getTime();
    });
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
            6 premium residential projects in Chattarpur, Gwal Pahari &amp; Delhi NCR — all prices negotiable
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
            {mergedProjects.map((p, i) => (
              <TableRow key={p.key} project={p} index={i} />
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
