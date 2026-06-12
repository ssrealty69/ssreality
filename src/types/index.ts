export interface Property {
  _id: string;
  title: string;
  description: string;
  price: number;
  priceType: 'sale' | 'rent';
  propertyType: 'apartment' | 'villa' | 'plot' | 'commercial' | 'office' | 'house';
  status: 'available' | 'sold' | 'rented' | 'delivered';
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
    area?: number;
    areaUnit?: 'sqft' | 'sqmt' | 'acre' | 'sqyd';
    parking?: boolean;
    furnished?: boolean;
    registryAvailable?: boolean;
    floor?: number;
    totalFloors?: number;
  };
  images: string[];
  mobileBannerUrl?: string;
  interiorImages?: string[];
  galleryImages?: string[];
  brochureUrl?: string;
  googleMapsUrl?: string;
  featured: boolean;
  amenities: string[];
  worldClassAmenities?: string[];
  highlights?: string[];
  highlightsImageUrl?: string;
  locationMapUrl?: string;
  nearby?: {
    type: string;
    name: string;
    distance?: string;
  }[];
  projectDetails?: {
    projectName?: string;
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
    negotiable?: boolean;
  }[];
  agent: {
    name: string;
    phone: string;
    email: string;
    image?: string;
  };
  views: number;
  seo?: {
    title?: string;
    description?: string;
    keywords?: string;
    focusKeyword?: string;
    canonicalUrl?: string;
  };
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
  status?: 'draft' | 'published' | 'scheduled';
  publishDate?: Date;
  published: boolean;
  views: number;
  seo?: {
    title?: string;
    description?: string;
    keywords?: string;
    focusKeyword?: string;
    canonicalUrl?: string;
  };
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
