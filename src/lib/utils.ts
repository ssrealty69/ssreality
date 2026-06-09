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

export function formatDate(dateStr: string): string {
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
  
  // Remove currency symbols, commas, spaces, and trailing periods
  let cleanText = text.replace(/[₹\s,]/g, '').toLowerCase();
  
  // Check for Crore (cr, crore)
  if (cleanText.includes('cr')) {
    const numPart = parseFloat(cleanText.split('cr')[0]);
    return isNaN(numPart) ? 0 : Math.round(numPart * 10000000);
  }
  
  // Check for Lakh (l, lakh)
  if (cleanText.includes('l')) {
    const numPart = parseFloat(cleanText.split('l')[0]);
    return isNaN(numPart) ? 0 : Math.round(numPart * 100000);
  }
  
  // Check for Thousand (k, thousand)
  if (cleanText.includes('k')) {
    const numPart = parseFloat(cleanText.split('k')[0]);
    return isNaN(numPart) ? 0 : Math.round(numPart * 1000);
  }
  
  // Default to standard float parsing
  const parsed = parseFloat(cleanText);
  return isNaN(parsed) ? 0 : parsed;
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
