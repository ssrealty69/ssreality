export interface Property {
  _id: string;
  title: string;
  description: string;
  price: number;
  priceType: 'sale' | 'rent';
  propertyType: 'apartment' | 'villa' | 'plot' | 'commercial' | 'office' | 'house';
  status: 'available' | 'sold' | 'rented';
  location: {
    address: string;
    city: string;
    state: string;
    pincode: string;
    lat?: number;
    lng?: number;
  };
  features: {
    bedrooms?: number;
    bathrooms?: number;
    area: number;
    areaUnit: 'sqft' | 'sqmt' | 'acre' | 'sqyd';
    parking?: boolean;
    furnished?: boolean;
    floor?: number;
    totalFloors?: number;
  };
  images: string[];
  brochureUrl?: string;
  featured: boolean;
  amenities: string[];
  highlights?: {
    title: string;
    description: string;
    image?: string;
  }[];
  nearby?: {
    type: string;
    name: string;
    distance?: string;
  }[];
  projectDetails?: {
    totalArea?: string;
    towers?: string;
    floors?: string;
    units?: string;
    reraNo?: string;
  };
  priceList?: {
    type: string;
    size: string;
    price: string;
  }[];
  agent: {
    name: string;
    phone: string;
    email: string;
    image?: string;
  };
  views: number;
  createdAt: string;
  updatedAt: string;
}

export interface Blog {
  _id: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  coverImage: string;
  author: {
    name: string;
    image?: string;
  };
  category: string;
  tags: string[];
  published: boolean;
  views: number;
  createdAt: string;
  updatedAt: string;
}

export interface ContactForm {
  name: string;
  email: string;
  phone: string;
  subject: string;
  message: string;
  propertyId?: string;
}

export interface SearchFilters {
  query?: string;
  city?: string;
  propertyType?: string;
  priceType?: string;
  minPrice?: number;
  maxPrice?: number;
  bedrooms?: number;
  status?: string;
  page?: number;
  limit?: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}
