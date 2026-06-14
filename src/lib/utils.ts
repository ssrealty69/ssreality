import { type ClassValue, clsx } from 'clsx';

export function cn(...inputs: ClassValue[]): string {
  return inputs.filter(Boolean).join(' ');
}

export function formatPrice(price: number, currency: string = '₹'): string {
  if (price === 0) return 'Price on Request';
  if (price >= 10000000) {
    return `${currency}${(price / 10000000).toFixed(2)} Cr`;
  } else if (price >= 100000) {
    return `${currency}${(price / 100000).toFixed(2)} L`;
  } else if (price >= 1000) {
    return `${currency}${(price / 1000).toFixed(0)}K`;
  }
  return `${currency}${price.toLocaleString('en-IN')}`;
}

export function formatDate(dateStr: string | Date | number): string {
  if (!dateStr) return '';
  return new Date(dateStr).toLocaleDateString('en-IN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

export function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/\s+/g, '-')
    .trim();
}

/** Returns /properties/slug or falls back to /properties/id */
export function getPropertyUrl(property: { _id: string; slug?: string }): string {
  return `/properties/${property.slug || property._id}`;
}

export function truncate(text: string, length: number): string {
  if (text.length <= length) return text;
  return text.slice(0, length) + '...';
}

export function getPropertyTypeIcon(type: string): string {
  const icons: Record<string, string> = {
    apartment: '🏢',
    villa: '🏡',
    plot: '🌳',
    commercial: '🏬',
    office: '🏛️',
    house: '🏠',
  };
  return icons[type] || '🏠';
}

export const CITIES = [
  'Delhi', 'Gurgaon', 'Gurugram', 'Noida', 'Greater Noida',
  'Jewar', 'Sohna', 'Palwal', 'Lado Sarai', 'Jaunapur', 'Saket', 'Mehrauli', 'Sultanpur',
];

export const PROPERTY_TYPES = [
  { value: 'apartment', label: 'Apartment' },
  { value: 'villa', label: 'Villa' },
  { value: 'house', label: 'House' },
  { value: 'plot', label: 'Plot / Land' },
  { value: 'commercial', label: 'Commercial' },
  { value: 'office', label: 'Office Space' },
];

export const AMENITIES = [
  'Swimming Pool', 'Gym', 'Club House', 'Garden', 'Security',
  'Power Backup', 'Lift', 'Parking', 'Intercom', 'CCTV',
  'Play Area', 'Jogging Track', 'Temple', 'Indoor Games',
];

export function parsePriceText(text: string): number {
  if (!text) return 0;
  
  // Remove currency symbols, commas, spaces
  let cleanText = text.replace(/[₹,]/g, '').trim().toLowerCase();
  
  // Check if it's explicitly "price on request" or similar non-numeric phrases
  if (cleanText.includes('request') || cleanText.includes('call') || cleanText.includes('contact') || cleanText.includes('ask')) {
    return 0;
  }
  
  // Find the first decimal number in the clean text
  const numMatch = cleanText.match(/\d+(\.\d+)?/);
  if (!numMatch) return 0;
  
  const numPart = parseFloat(numMatch[0]);
  if (isNaN(numPart)) return 0;
  
  // Determine multiplier
  if (cleanText.includes('cr') || cleanText.includes('crore')) {
    return Math.round(numPart * 10000000);
  }
  if (cleanText.includes('l') || cleanText.includes('lakh') || cleanText.includes('lac')) {
    return Math.round(numPart * 100000);
  }
  if (cleanText.includes('k') || cleanText.includes('thousand')) {
    return Math.round(numPart * 1000);
  }
  
  // If no units, check if the number is already a large integer (e.g., 12500000 vs 1.25)
  // If it's a small decimal/integer (< 1000) and they typed e.g. "1.25", they probably meant 1.25 Crore
  if (numPart < 1000) {
    if (numPart >= 5 && numPart < 100) {
      // e.g. 75 -> 75 Lakhs
      return Math.round(numPart * 100000);
    }
    // e.g. 1.25 or 3.5 -> Crores
    return Math.round(numPart * 10000000);
  }
  
  return Math.round(numPart);
}

export function formatPriceForEdit(price: number): string {
  if (price === undefined || price === null) return '';
  if (price === 0) return 'Price on Request';
  if (price >= 10000000) {
    const val = price / 10000000;
    return `${val.toFixed(val % 1 === 0 ? 0 : 2)} Cr`;
  } else if (price >= 100000) {
    const val = price / 100000;
    return `${val.toFixed(val % 1 === 0 ? 0 : 2)} L`;
  }
  return price.toString();
}
