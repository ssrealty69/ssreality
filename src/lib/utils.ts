import { type ClassValue, clsx } from 'clsx';

export function cn(...inputs: ClassValue[]): string {
  return inputs.filter(Boolean).join(' ');
}

export function formatPrice(price: number, currency: string = '₹'): string {
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
