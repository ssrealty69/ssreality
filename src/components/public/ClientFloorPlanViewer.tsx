'use client';

import { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { Share2, Printer } from 'lucide-react';
import toast from 'react-hot-toast';

// ─── Interfaces ──────────────────────────────────────────────────────────────────

interface Flat {
  number: string;
  status: 'available' | 'sold' | 'reserved';
  bedrooms?: number;
  typeLabel?: string;
  price?: number;
  notes?: string;
  rowSpan?: number;
  isDuplex?: boolean;
  _floorName?: string;
}

interface Floor {
  floorNumber: number;
  floorName: string;
  flats: Flat[];
}

interface Property {
  _id: string;
  title: string;
  propertyName?: string;
  propertyType?: string;
  price?: number;
  priceList?: Array<{
    type: string;
    size?: string;
    price: string | number;
    negotiable?: boolean;
    _id?: string;
  }>;
  location: {
    address: string;
    city: string;
    state?: string;
  };
  features?: {
    bedrooms?: number;
    totalFloors?: number;
    totalUnits?: number;
    reraApproved?: boolean;
  };
  agent?: {
    name?: string;
    phone?: string;
    email?: string;
    image?: string;
  };
}

interface SimpleProperty {
  _id: string;
  title: string;
  propertyName?: string;
  propertyType?: string;
  location: {
    city: string;
    address: string;
  };
}

interface Plot {
  number: string;
  status: 'available' | 'sold' | 'reserved';
  sizeGaj: number;
  isCorner: boolean;
  facing?: string;
  price?: number;
  notes?: string;
}

interface Block {
  blockName: string;
  plots: Plot[];
}

interface ClientFloorPlanViewerProps {
  property: Property;
  floorPlan?: {
    totalFloors: number;
    flatsPerFloor: number;
    floors: Floor[];
  } | null;
  plotPlan?: {
    blocks: Block[];
  } | null;
  availableProperties?: SimpleProperty[];
  isSharedMode?: boolean;
  onPropertyChange?: (propertyId: string) => void;
}

// ─── Helper Functions ────────────────────────────────────────────────────────────

function formatIndianPrice(price: any): string {
  if (!price && price !== 0) return 'Contact for Price';
  
  if (typeof price === 'string') {
    const trimmed = price.trim();
    if (trimmed.toLowerCase().includes('cr')) {
      const formatted = trimmed.replace(/\s*cr/i, 'Cr');
      return formatted.startsWith('Rs.') ? formatted : `Rs. ${formatted}`;
    }
    if (trimmed.toLowerCase().includes('lac') || trimmed.toLowerCase().includes('lakh') || trimmed.toLowerCase().includes('l')) {
      const formatted = trimmed.replace(/\s*(lac|lakh|l)/i, 'Lac');
      return formatted.startsWith('Rs.') ? formatted : `Rs. ${formatted}`;
    }
    const num = parseFloat(trimmed);
    if (!isNaN(num)) price = num;
    else return trimmed.startsWith('Rs.') ? trimmed : `Rs. ${trimmed}`;
  }

  if (typeof price === 'number') {
    // If raw Rupees e.g. 12500000 (1.25 Cr)
    if (price >= 10000000) {
      const cr = price / 10000000;
      return `Rs. ${cr % 1 === 0 ? cr.toFixed(0) : cr.toFixed(2)}Cr`;
    }
    // If raw Rupees e.g. 8500000 (85 Lakhs)
    if (price >= 100000) {
      const l = price / 100000;
      return `Rs. ${l % 1 === 0 ? l.toFixed(0) : l.toFixed(2)}Lac`;
    }
    // If in Lakhs (Admin input is in Lakhs):
    // >= 100 Lakhs is in Crores (e.g. 125 -> 1.25Cr, 139 -> 1.39Cr, 225 -> 2.25Cr)
    if (price >= 100) {
      const cr = price / 100;
      return `Rs. ${cr % 1 === 0 ? cr.toFixed(0) : cr.toFixed(2)}Cr`;
    }
    // Between 10 and 99.99 Lakhs (e.g. 55 Lakhs, 85 Lakhs)
    if (price >= 10) {
      return `Rs. ${price % 1 === 0 ? price.toFixed(0) : price.toFixed(2)}Lac`;
    }
    // If decimal Crores entered (e.g. 1.25 or 1.39)
    if (price > 0 && price < 10) {
      return `Rs. ${price}Cr`;
    }
    return `Rs. ${price}`;
  }

  return String(price);
}

function formatInventoryTitle(property: Property): string {
  if (property.propertyName) {
    const loc = property.location?.city || property.location?.address?.split(',')[0] || '';
    return `${property.propertyName.toUpperCase()}${loc ? `, ${loc.toUpperCase()}` : ''} — Project Inventory`;
  }
  const match = property.title.match(/(?:in|at)\s+([^,]+)(?:,\s*([^,]+))?/i);
  if (match && match[1]) {
    const proj = match[1].trim().toUpperCase();
    const loc = (match[2] || property.location?.city || property.location?.address?.split(',')[0] || '').trim().toUpperCase();
    return `${proj}${loc ? `, ${loc}` : ''} — Project Inventory`;
  }
  return `${property.title.toUpperCase()} — Project Inventory`;
}

function formatFloorName(name: string): string {
  if (!name) return 'UG Floor';
  const trimmed = name.trim();
  const lower = trimmed.toLowerCase();
  if (lower === 'ground floor' || lower === 'ground' || lower === 'g floor' || lower === 'ug' || lower === 'upper ground' || lower === 'upper ground floor') {
    return 'UG Floor';
  }
  return trimmed;
}

function formatCleanProjectName(name: string): string {
  const trimmed = name.trim();
  if (trimmed === trimmed.toUpperCase()) {
    return trimmed
      .toLowerCase()
      .split(' ')
      .map(w => w.charAt(0).toUpperCase() + w.slice(1))
      .join(' ');
  }
  return trimmed;
}

function getProjectShortName(p: { title: string; propertyName?: string }): string {
  if (p.propertyName && p.propertyName.trim()) {
    return formatCleanProjectName(p.propertyName);
  }
  const match = p.title.match(/(?:in|at)\s+([^,]+)/i);
  if (match && match[1]) {
    return formatCleanProjectName(match[1]);
  }
  return p.title;
}

// ─── Component ───────────────────────────────────────────────────────────────────

export default function ClientFloorPlanViewer({
  property,
  floorPlan = null,
  plotPlan = null,
  availableProperties = [],
  isSharedMode = false,
  onPropertyChange
}: ClientFloorPlanViewerProps) {
  const router = useRouter();
  const isPlot = property.propertyType?.toLowerCase() === 'plot' || (!!plotPlan && !floorPlan);


  // 1. Calculate Columns & Groups (Apartment)
  const apartmentLayout = useMemo(() => {
    if (!floorPlan || !floorPlan.floors || floorPlan.floors.length === 0) {
      return null;
    }

    const floors = floorPlan.floors;

    // Distinct unit names across all floors, preserving natural order
    const unitMap = new Map<string, { bhk: number; typeLabel?: string }>();
    floors.forEach(f => {
      f.flats.forEach(fl => {
        if (!unitMap.has(fl.number)) {
          unitMap.set(fl.number, {
            bhk: fl.bedrooms || property.features?.bedrooms || 3,
            typeLabel: fl.typeLabel
          });
        } else if (fl.typeLabel && !unitMap.get(fl.number)?.typeLabel) {
          const current = unitMap.get(fl.number)!;
          unitMap.set(fl.number, { ...current, typeLabel: fl.typeLabel });
        }
      });
    });

    const unitNames = Array.from(unitMap.keys());

    // Helper to format unit range label e.g. (Units 1–2) or (Units 4–8) or (Unit 3)
    const formatRangeLabel = (units: string[]) => {
      const isStandardNaming = units.every(u => /^Unit\s*\d+$/i.test(u.trim()));
      if (!isStandardNaming) return '';
      if (units.length === 1) {
        return `(${units[0]})`;
      }
      const firstDigits = units[0].match(/\d+/)?.[0];
      const lastDigits = units[units.length - 1].match(/\d+/)?.[0];
      if (firstDigits && lastDigits) {
        return `(Units ${firstDigits}–${lastDigits})`;
      }
      return `(${units[0]}–${units[units.length - 1]})`;
    };

    // Group adjacent units with the same BHK or typeLabel
    interface UnitGroup {
      bhk: number;
      typeLabel?: string;
      units: string[];
      label: string;
      headerBg: string;
      headerText: string;
      subHeaderBg: string;
      subHeaderText: string;
    }

    const groups: UnitGroup[] = [];
    const colorThemes = [
      {
        headerBg: '#F5E6B8', // Warm Gold/Sand (Screenshot 2: 3 BHK)
        headerText: '#3B2F04',
        subHeaderBg: '#FFF2CC',
        subHeaderText: '#6B4F00',
      },
      {
        headerBg: '#D8E8F8', // Soft Ice Blue (Screenshot 2: 2 BHK / 4 BHK)
        headerText: '#1F3864',
        subHeaderBg: '#EAF2FA',
        subHeaderText: '#1F3864',
      },
      {
        headerBg: '#D5E8D4', // Soft Sage Green
        headerText: '#274E13',
        subHeaderBg: '#EAF3E8',
        subHeaderText: '#274E13',
      },
      {
        headerBg: '#FCE4D6', // Soft Peach
        headerText: '#6E2C00',
        subHeaderBg: '#FDF2E9',
        subHeaderText: '#6E2C00',
      },
    ];

    let currentGroup: { bhk: number; typeLabel?: string; units: string[] } | null = null;

    unitNames.forEach(uName => {
      const uInfo = unitMap.get(uName) || { bhk: 3 };
      const groupKey = uInfo.typeLabel || `${uInfo.bhk} BHK`;
      const currentKey = currentGroup ? (currentGroup.typeLabel || `${currentGroup.bhk} BHK`) : null;

      if (!currentGroup || currentKey !== groupKey) {
        if (currentGroup) {
          const theme = colorThemes[groups.length % colorThemes.length];
          const displayTitle = currentGroup.typeLabel || `${currentGroup.bhk} BHK`;
          const rangeStr = formatRangeLabel(currentGroup.units);
          groups.push({
            bhk: currentGroup.bhk,
            typeLabel: currentGroup.typeLabel,
            units: currentGroup.units,
            label: rangeStr ? `${displayTitle} ${rangeStr}` : displayTitle,
            ...theme,
          });
        }
        currentGroup = { bhk: uInfo.bhk, typeLabel: uInfo.typeLabel, units: [uName] };
      } else {
        currentGroup.units.push(uName);
      }
    });

    if (currentGroup) {
      const g = currentGroup as { bhk: number; typeLabel?: string; units: string[] };
      const theme = colorThemes[groups.length % colorThemes.length];
      const displayTitle = g.typeLabel || `${g.bhk} BHK`;
      const rangeStr = formatRangeLabel(g.units);
      groups.push({
        bhk: g.bhk,
        typeLabel: g.typeLabel,
        units: g.units,
        label: rangeStr ? `${displayTitle} ${rangeStr}` : displayTitle,
        ...theme,
      });
    }

    // Stats: ONLY count units that actually exist on floors!
    let totalUnits = 0;
    let soldUnits = 0;
    let reservedUnits = 0;

    floors.forEach(f => {
      f.flats.forEach(fl => {
        totalUnits++;
        if (fl.status === 'sold') soldUnits++;
        else if (fl.status === 'reserved') reservedUnits++;
      });
    });

    const availableUnits = totalUnits - soldUnits - reservedUnits;

    // Subheader String: e.g. "5 Floors | 2 × 3BHK + 1 × 4BHK per Floor | 15 Total Units"
    // Calculate total count of each unit type across all floors to compute breakdown
    const bhkTotalCounts: Record<string, number> = {};
    floors.forEach(f => {
      f.flats.forEach(fl => {
        const uInfo = unitMap.get(fl.number);
        const label = fl.typeLabel || uInfo?.typeLabel || (fl.bedrooms ? `${fl.bedrooms}BHK` : 'Unit');
        bhkTotalCounts[label] = (bhkTotalCounts[label] || 0) + 1;
      });
    });

    const totalFloorsCount = floors.length;
    const allEven = totalFloorsCount > 0 && Object.values(bhkTotalCounts).every(total => total % totalFloorsCount === 0);

    let bhkString = '';
    if (allEven && totalFloorsCount > 0) {
      const perFloorParts = Object.entries(bhkTotalCounts)
        .map(([label, totalForBhk]) => `${totalForBhk / totalFloorsCount} × ${label}`);
      bhkString = `${perFloorParts.join(' + ')} per Floor`;
    } else {
      const totalTypeParts = Object.entries(bhkTotalCounts)
        .map(([label, totalForBhk]) => `${totalForBhk} × ${label}`);
      bhkString = totalTypeParts.join(', ');
    }

    const subheaderText = bhkString
      ? `${totalFloorsCount} Floors | ${bhkString} | ${totalUnits} Total Units`
      : `${totalFloorsCount} Floors | ${totalUnits} Total Units`;

    // Calculate Prices for Each Unit Column
    const unitPrices = unitNames.map(uName => {
      const uInfo = unitMap.get(uName);
      const bhk = uInfo?.bhk;
      const typeLabel = uInfo?.typeLabel;

      // 1. Normalized match with property priceList by typeLabel
      if (property.priceList && property.priceList.length > 0 && typeLabel) {
        const cleanType = typeLabel.toLowerCase().replace(/[^a-z0-9]/g, '');
        const match = property.priceList.find(pl => {
          const cleanPl = pl.type.toLowerCase().replace(/[^a-z0-9]/g, '');
          return cleanPl === cleanType || cleanType.includes(cleanPl) || cleanPl.includes(cleanType);
        });
        if (match && match.price) return formatIndianPrice(match.price);
      }

      // 2. Flat level explicit price
      for (const f of floors) {
        const fl = f.flats.find(item => item.number === uName);
        if (fl && fl.price) return formatIndianPrice(fl.price);
      }

      // 3. Match with property priceList by BHK number
      if (property.priceList && property.priceList.length > 0 && bhk) {
        const match = property.priceList.find(pl => {
          const t = pl.type.toLowerCase();
          return t.includes(`${bhk}bhk`) || t.includes(`${bhk} bhk`);
        });
        if (match && match.price) return formatIndianPrice(match.price);
      }

      // 4. Property main price
      if (property.price) return formatIndianPrice(property.price);
      return 'Contact for Price';
    });

    return {
      floors,
      unitNames,
      unitMap,
      groups,
      totalUnits,
      soldUnits,
      reservedUnits,
      availableUnits,
      subheaderText,
      unitPrices,
    };
  }, [floorPlan, property]);

  // 2. Plot Layout calculation (if property is Plot)
  const plotLayout = useMemo(() => {
    if (!plotPlan || !plotPlan.blocks || plotPlan.blocks.length === 0) {
      return null;
    }

    let totalPlots = 0;
    let soldPlots = 0;
    let reservedPlots = 0;

    plotPlan.blocks.forEach(b => {
      b.plots.forEach(p => {
        totalPlots++;
        if (p.status === 'sold') soldPlots++;
        else if (p.status === 'reserved') reservedPlots++;
      });
    });

    const availablePlots = totalPlots - soldPlots - reservedPlots;
    const subheaderText = `${plotPlan.blocks.length} Blocks | ${totalPlots} Total Plots`;

    return {
      blocks: plotPlan.blocks,
      totalPlots,
      soldPlots,
      reservedPlots,
      availablePlots,
      subheaderText,
    };
  }, [plotPlan]);

  // Copy link handler
  const handleCopyLink = () => {
    const url = window.location.href;
    navigator.clipboard.writeText(url);
    toast.success('Inventory link copied to clipboard!');
  };

  const handlePrint = () => {
    window.print();
  };

  const projectTitle = formatInventoryTitle(property);

  return (
    <div className="min-h-screen bg-[#F4F6F9] text-gray-900 font-sans print:bg-white print:min-h-0 print:p-0 selection:bg-[#1F3864] selection:text-white pb-12 print:pb-0">
      
      {/* ── Print Styles for guaranteed single-page fit ─────────────────────────────── */}
      <style dangerouslySetInnerHTML={{ __html: `
        @media print {
          @page {
            size: A4 portrait;
            margin: 6mm 6mm 4mm 6mm;
          }
          html, body {
            background: #ffffff !important;
            margin: 0 !important;
            padding: 0 !important;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }
          table, tr, td, th {
            page-break-inside: avoid !important;
            break-inside: avoid !important;
          }
        }
        .minimal-scrollbar::-webkit-scrollbar {
          height: 2.5px !important;
          width: 2.5px !important;
        }
        .minimal-scrollbar::-webkit-scrollbar-track {
          background: rgba(0, 0, 0, 0.04) !important;
          border-radius: 99px !important;
        }
        .minimal-scrollbar::-webkit-scrollbar-thumb {
          background: #C9A227 !important;
          border-radius: 99px !important;
        }
        .minimal-scrollbar {
          scrollbar-width: thin !important;
          scrollbar-color: #C9A227 transparent !important;
        }
        @media (max-width: 640px) {
          .minimal-scrollbar::-webkit-scrollbar {
            height: 2px !important;
          }
        }
      ` }} />

      {/* ── Top Utility Action Bar (Hidden in Print) ──────────────────────────────── */}
      <div className="bg-[#102544] text-white border-b border-[#2A4365] px-4 py-2.5 print:hidden shadow-sm">
        <div className="max-w-6xl mx-auto flex flex-wrap items-center justify-between gap-3">
          
          {/* Brand Logo & Project Switcher */}
          <div className="flex items-center gap-4">
            <div className="flex items-center cursor-pointer" onClick={() => router.push('/')}>
              <img
                src="/SS-Realty-Logo.png"
                alt="SS Realty"
                className="h-7 sm:h-8 w-auto object-contain"
              />
            </div>

            {/* Quick Switch Dropdown if multiple projects exist */}
            {!isSharedMode && availableProperties.length > 1 && (
              <div className="relative">
                <select
                  value={property._id}
                  onChange={(e) => {
                    if (onPropertyChange) {
                      onPropertyChange(e.target.value);
                    } else {
                      router.push(`/floor-plans/${e.target.value}`);
                    }
                  }}
                  className="bg-[#1A365D] hover:bg-[#23487A] text-white text-xs font-semibold px-3 py-1.5 rounded-md border border-[#4A6572] focus:outline-none focus:ring-1 focus:ring-[#F5E6B8] cursor-pointer transition-colors pr-6"
                >
                  {availableProperties.map(p => (
                    <option key={p._id} value={p._id} className="bg-[#1A365D] text-white">
                      {getProjectShortName(p)}
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2">
            <button
              onClick={handleCopyLink}
              className="flex items-center gap-1.5 bg-[#23487A] hover:bg-[#2C5B99] text-xs font-semibold px-3 py-1.5 rounded-md transition-colors text-white cursor-pointer"
              title="Copy public inventory link"
            >
              <Share2 size={14} />
              <span className="hidden sm:inline">Share Link</span>
            </button>

            <button
              onClick={handlePrint}
              className="flex items-center gap-1.5 bg-[#23487A] hover:bg-[#2C5B99] text-xs font-semibold px-3 py-1.5 rounded-md transition-colors text-white cursor-pointer"
              title="Print / Save PDF"
            >
              <Printer size={14} />
              <span className="hidden sm:inline">Print / PDF</span>
            </button>
          </div>
        </div>
      </div>

      {/* ── Main Sheet Container (Matches Screenshot 2 & 3) ───────────────────────── */}
      <main className="max-w-6xl mx-auto p-3 sm:p-6 md:p-8 space-y-6 print:max-w-none print:p-0 print:m-0 print:space-y-2">
        
        {/* ── 1. Top Header Banner ────────────────────────────────────────────────── */}
        <div className="rounded-t-none md:rounded-t-lg overflow-hidden border border-[#8FAADC] shadow-sm">
          
          {/* Main Title Bar (Navy Blue with guaranteed brilliant white text) */}
          <div 
            style={{ backgroundColor: '#1F3864' }} 
            className="px-5 py-3.5 sm:py-4 print:py-1.5 print:px-3 text-center sm:text-left"
          >
            <h1 
              style={{ color: '#ffffff' }}
              className="text-lg sm:text-xl md:text-2xl print:text-base font-extrabold tracking-wide uppercase font-sans !text-white text-center sm:text-left"
            >
              {projectTitle}
            </h1>
          </div>

          {/* Subheader Bar (Peach/Gold) */}
          <div className="bg-[#FCE4D6] border-t border-b border-[#D8C2B4] px-5 py-2.5 print:py-1 print:px-3 text-xs sm:text-sm print:text-[11px] font-semibold text-[#1A1800] text-center sm:text-left">
            {isPlot 
              ? (plotLayout?.subheaderText || 'Land / Plot Inventory Sheet')
              : (apartmentLayout?.subheaderText || 'Project Inventory Details')
            }
          </div>
        </div>

        {/* ── 2. Apartment One-View Grid ──────────────────────────────────────────── */}
        {!isPlot && apartmentLayout && (
          <div className="space-y-6 print:space-y-2">
            
            {/* Table Container */}
            <div className="overflow-x-auto minimal-scrollbar border border-[#8FAADC] bg-white shadow-sm">
              <table className="w-full border-collapse text-left min-w-[640px]">
                <thead>
                  {/* Row 1: Floor (rowspan 2) + Grouped BHK / Type Headers */}
                  <tr>
                    <th 
                      rowSpan={2}
                      className="bg-[#1F3864] text-white font-bold text-xs sm:text-sm px-4 py-3 print:py-1 print:px-2 print:text-[11px] border border-[#8FAADC] w-36 align-middle uppercase tracking-wider"
                    >
                      Floor
                    </th>

                    {apartmentLayout.groups.map((group, idx) => (
                      <th
                        key={idx}
                        colSpan={group.units.length}
                        style={{ backgroundColor: group.headerBg, color: group.headerText }}
                        className="font-bold text-xs sm:text-sm px-3 py-2.5 print:py-1 print:px-2 print:text-[11px] border border-[#8FAADC] text-center"
                      >
                        {group.label}
                      </th>
                    ))}
                  </tr>

                  {/* Row 2: Sub-headers for each Unit */}
                  <tr>
                    {apartmentLayout.groups.map((group) =>
                      group.units.map((uName) => (
                        <th
                          key={uName}
                          style={{ backgroundColor: group.subHeaderBg, color: group.subHeaderText }}
                          className="font-bold text-xs sm:text-sm px-3 py-2 print:py-1 print:px-2 print:text-[11px] border border-[#8FAADC] text-center"
                        >
                          {uName}
                        </th>
                      ))
                    )}
                  </tr>
                </thead>

                <tbody>
                  {/* Compute which cells are spanned from a floor above */}
                  {(() => {
                    const coveredCells = new Set<string>();
                    apartmentLayout.floors.forEach((floor, fIdx) => {
                      floor.flats.forEach(flat => {
                        const rowSpan = flat.rowSpan || (flat.isDuplex ? 2 : 1);
                        if (rowSpan > 1) {
                          for (let s = 1; s < rowSpan; s++) {
                            coveredCells.add(`${fIdx + s}_${flat.number}`);
                          }
                        }
                      });
                    });

                    return apartmentLayout.floors.map((floor, floorIdx) => (
                      <tr key={floor.floorNumber} className="hover:bg-slate-50/70 transition-colors">
                        {/* Floor Name Column (Formats Ground Floor -> UG Floor) */}
                        <td className="bg-[#1F3864] text-white font-bold text-xs sm:text-sm px-4 py-3 print:py-1 print:px-2 print:text-[11px] border border-[#8FAADC] whitespace-nowrap">
                          {formatFloorName(floor.floorName)}
                        </td>

                        {/* Unit Cells */}
                        {apartmentLayout.unitNames.map((uName) => {
                          // If cell is spanned from an above floor, skip rendering this <td>!
                          if (coveredCells.has(`${floorIdx}_${uName}`)) {
                            return null;
                          }

                          const flat = floor.flats.find(f => f.number === uName);
                          
                          // If flat does NOT exist on this floor, show neutral dash (-)
                          if (!flat) {
                            return (
                              <td
                                key={uName}
                                className="border border-[#8FAADC] px-3 py-3 print:py-1 print:px-2 print:text-[11px] text-center text-gray-400 font-bold bg-[#F8F9FA] select-none"
                                title={`Not Applicable on ${formatFloorName(floor.floorName)}`}
                              >
                                -
                              </td>
                            );
                          }

                          const status = flat.status;
                          const rowSpan = flat.rowSpan || (flat.isDuplex ? 2 : 1);

                          return (
                            <td
                              key={uName}
                              rowSpan={rowSpan > 1 ? rowSpan : undefined}
                              className={`border border-[#8FAADC] px-3 py-3 print:py-1 print:px-2 print:text-[11px] text-center font-medium select-none align-middle ${
                                status === 'sold'
                                  ? 'bg-[#FCE4D6] text-[#C00000] font-extrabold'
                                  : status === 'reserved'
                                  ? 'bg-[#FFF2CC] text-[#B45309] font-bold'
                                  : 'bg-[#E2EFDA] text-[#385723] font-semibold'
                              }`}
                            >
                              {status === 'sold' ? (
                                <span className="tracking-wider">Sold</span>
                              ) : status === 'reserved' ? (
                                <span>Reserved</span>
                              ) : (
                                <span>Available</span>
                              )}
                            </td>
                          );
                        })}
                      </tr>
                    ));
                  })()}

                  {/* Bottom Summary Row */}
                  <tr className="border-t-2 border-[#1F3864]">
                    <td className="bg-[#1F3864] text-white font-bold text-xs sm:text-sm px-4 py-3 print:py-1 print:px-2 print:text-[11px] border border-[#8FAADC]">
                      Summary
                    </td>

                    {/* Dynamically distribute summary cells across unit columns */}
                    {(() => {
                      const totalCols = apartmentLayout.unitNames.length;
                      const span1 = Math.max(1, Math.floor(totalCols / 3));
                      const span2 = Math.max(1, Math.floor(totalCols / 3));
                      const span3 = totalCols - span1 - span2;

                      return (
                        <>
                          <td 
                            colSpan={span1}
                            className="bg-[#D9E1F2] text-[#1F3864] font-bold text-xs sm:text-sm px-3 py-3 print:py-1 print:px-2 print:text-[11px] border border-[#8FAADC] text-center"
                          >
                            Total: {apartmentLayout.totalUnits}
                          </td>
                          <td 
                            colSpan={span2}
                            className="bg-[#FCE4D6] text-[#C00000] font-extrabold text-xs sm:text-sm px-3 py-3 print:py-1 print:px-2 print:text-[11px] border border-[#8FAADC] text-center"
                          >
                            Sold: {apartmentLayout.soldUnits}
                          </td>
                          <td 
                            colSpan={span3}
                            className="bg-[#E2EFDA] text-[#385723] font-bold text-xs sm:text-sm px-3 py-3 print:py-1 print:px-2 print:text-[11px] border border-[#8FAADC] text-center"
                          >
                            Available: {apartmentLayout.availableUnits}
                          </td>
                        </>
                      );
                    })()}
                  </tr>
                </tbody>
              </table>
            </div>

            {/* ── 3. Unit Prices Table (Matches Screenshot 2) ────────────────────── */}
            <div className="border border-[#8FAADC] bg-white shadow-sm overflow-hidden print:break-inside-avoid print:page-break-inside-avoid">
              <div className="bg-[#1F3864] text-white font-bold text-xs sm:text-sm print:text-[11px] uppercase tracking-wider px-4 py-2.5 print:py-1 print:px-2.5">
                UNIT PRICES
              </div>

              <div className="overflow-x-auto minimal-scrollbar">
                <table className="w-full border-collapse text-left min-w-[640px]">
                  <tbody>
                    {/* Header Row: Base Price + Unit Names */}
                    <tr>
                      <td className="bg-[#1F3864] text-white font-bold text-xs sm:text-sm px-4 py-2.5 print:py-1 print:px-2 print:text-[11px] border border-[#8FAADC] w-36 whitespace-nowrap">
                        Base Price
                      </td>
                      {apartmentLayout.groups.map(group =>
                        group.units.map(uName => (
                          <td
                            key={uName}
                            style={{ backgroundColor: group.headerBg, color: group.headerText }}
                            className="font-bold text-xs sm:text-sm px-3 py-2.5 print:py-1 print:px-2 print:text-[11px] border border-[#8FAADC] text-center"
                          >
                            {uName}
                          </td>
                        ))
                      )}
                    </tr>

                    {/* Data Row: Price Values */}
                    <tr>
                      <td className="bg-[#D9E1F2] text-[#1F3864] font-bold text-xs sm:text-sm px-4 py-2.5 print:py-1 print:px-2 print:text-[11px] border border-[#8FAADC] whitespace-nowrap">
                        Price
                      </td>
                      {apartmentLayout.unitPrices.map((price, idx) => (
                        <td
                          key={idx}
                          className="bg-white text-[#1F3864] font-bold text-xs sm:text-sm px-3 py-2.5 print:py-1 print:px-2 print:text-[11px] border border-[#8FAADC] text-center whitespace-nowrap"
                        >
                          {price}
                        </td>
                      ))}
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            {/* ── 4. Terms & Conditions Table (Matches Screenshot 3) ─────────────── */}
            <div className="border border-[#8FAADC] bg-white shadow-sm overflow-hidden print:break-inside-avoid print:page-break-inside-avoid">
              <div className="bg-[#1F3864] text-white font-bold text-xs sm:text-sm print:text-[11px] uppercase tracking-wider px-4 py-2.5 print:py-1 print:px-2.5">
                TERMS & CONDITIONS
              </div>

              <div className="divide-y divide-[#8FAADC]">
                <div className="bg-[#FCE4D6] px-4 py-2.5 print:py-0.5 print:px-2.5 text-xs sm:text-sm print:text-[10px] font-bold text-[#1A1800]">
                  Payment Plan : 30 : 70
                </div>
                <div className="bg-white px-4 py-2 print:py-0.5 print:px-2.5 text-xs sm:text-sm print:text-[10px] text-gray-700">
                  Prices indicated above are subject to revision at the discretion of the Company.
                </div>
                <div className="bg-white px-4 py-2 print:py-0.5 print:px-2.5 text-xs sm:text-sm print:text-[10px] text-gray-700">
                  GST and other taxes / levies as applicable.
                </div>
                <div className="bg-white px-4 py-2 print:py-0.5 print:px-2.5 text-xs sm:text-sm print:text-[10px] text-gray-700">
                  All bookings will be subject to Terms and Conditions as per &quot;Agreement for Sale&quot;.
                </div>
              </div>
            </div>

          </div>
        )}

        {/* ── 2B. Plot Layout One-View Table (If Plot Property) ────────────────── */}
        {isPlot && plotLayout && (
          <div className="space-y-6">
            <div className="overflow-x-auto minimal-scrollbar border border-[#8FAADC] bg-white shadow-sm">
              <table className="w-full border-collapse text-left min-w-[640px]">
                <thead>
                  <tr>
                    <th className="bg-[#1F3864] text-white font-bold text-xs sm:text-sm px-4 py-3 border border-[#8FAADC] w-36 uppercase tracking-wider">
                      Block
                    </th>
                    <th className="bg-[#D8E8F8] text-[#1F3864] font-bold text-xs sm:text-sm px-4 py-3 border border-[#8FAADC] text-center" colSpan={100}>
                      Configured Plot Units
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {plotLayout.blocks.map((block) => (
                    <tr key={block.blockName} className="border-b border-[#8FAADC]">
                      <td className="bg-[#1F3864] text-white font-bold text-xs sm:text-sm px-4 py-3 border border-[#8FAADC] whitespace-nowrap">
                        {block.blockName}
                      </td>
                      <td className="p-3 border border-[#8FAADC]" colSpan={100}>
                        <div className="flex flex-wrap gap-2">
                          {block.plots.map((plot) => (
                            <div
                              key={plot.number}
                              className={`px-3 py-2 rounded border text-xs font-bold select-none ${
                                plot.status === 'sold'
                                  ? 'bg-[#FCE4D6] text-[#C00000] border-[#F8B4A5]'
                                  : plot.status === 'reserved'
                                  ? 'bg-[#FFF2CC] text-[#B45309] border-[#FCE2A0]'
                                  : 'bg-[#E2EFDA] text-[#385723] border-[#C3E6CB]'
                              }`}
                            >
                              Plot {plot.number} ({plot.sizeGaj} Gaj) — {plot.status.toUpperCase()}
                            </div>
                          ))}
                        </div>
                      </td>
                    </tr>
                  ))}
                  <tr className="border-t-2 border-[#1F3864]">
                    <td className="bg-[#1F3864] text-white font-bold text-xs sm:text-sm px-4 py-3 border border-[#8FAADC]">
                      Summary
                    </td>
                    <td className="p-0 border border-[#8FAADC]">
                      <div className="grid grid-cols-3 text-center text-xs sm:text-sm font-bold">
                        <div className="bg-[#D9E1F2] text-[#1F3864] py-3 border-r border-[#8FAADC]">
                          Total: {plotLayout.totalPlots}
                        </div>
                        <div className="bg-[#FCE4D6] text-[#C00000] py-3 border-r border-[#8FAADC]">
                          Sold: {plotLayout.soldPlots}
                        </div>
                        <div className="bg-[#E2EFDA] text-[#385723] py-3">
                          Available: {plotLayout.availablePlots}
                        </div>
                      </div>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* Terms for Plot */}
            <div className="border border-[#8FAADC] bg-white shadow-sm overflow-hidden">
              <div className="bg-[#1F3864] text-white font-bold text-xs sm:text-sm uppercase tracking-wider px-4 py-2.5">
                TERMS & CONDITIONS
              </div>
              <div className="divide-y divide-[#8FAADC]">
                <div className="bg-[#FCE4D6] px-4 py-2.5 text-xs sm:text-sm font-bold text-[#1A1800]">
                  Payment Plan : Registry on Full Payment / 30:70
                </div>
                <div className="bg-white px-4 py-2 text-xs sm:text-sm text-gray-700">
                  Prices indicated above are subject to revision at the discretion of the Company.
                </div>
                <div className="bg-white px-4 py-2 text-xs sm:text-sm text-gray-700">
                  All bookings will be subject to Terms and Conditions as per &quot;Agreement for Sale&quot;.
                </div>
              </div>
            </div>
          </div>
        )}

      </main>



    </div>
  );
}
