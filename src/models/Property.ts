import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IProperty extends Document {
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
    towers?: number;
    totalUnits?: number;
    reraApproved?: boolean;
  };
  images: string[];
  interiorImages?: string[];
  galleryImages?: string[];
  videoUrl?: string;
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
  agent: {
    name: string;
    phone: string;
    email: string;
    image?: string;
  };
  views: number;
  createdAt: Date;
  updatedAt: Date;
}

const PropertySchema = new Schema<IProperty>(
  {
    title: { type: String, required: true, trim: true, index: true },
    description: { type: String, required: true },
    price: { type: Number, required: true, index: true },
    priceType: { type: String, enum: ['sale', 'rent'], required: true },
    propertyType: {
      type: String,
      enum: ['apartment', 'villa', 'plot', 'commercial', 'office', 'house'],
      required: true,
      index: true,
    },
    status: {
      type: String,
      enum: ['available', 'sold', 'rented'],
      default: 'available',
      index: true,
    },
    location: {
      address: { type: String, required: true },
      city: { type: String, required: true, index: true },
      state: { type: String, required: true },
      pincode: { type: String },
      lat: { type: Number },
      lng: { type: Number },
    },
    features: {
      bedrooms: { type: Number },
      bathrooms: { type: Number },
      area: { type: Number, required: true },
      areaUnit: { type: String, enum: ['sqft', 'sqmt', 'acre', 'sqyd'], default: 'sqft' },
      parking: { type: Boolean, default: false },
      furnished: { type: Boolean, default: false },
      floor: { type: Number },
      totalFloors: { type: Number },
      towers: { type: Number },
      totalUnits: { type: Number },
      reraApproved: { type: Boolean, default: false },
    },
    images: [{ type: String }],
    interiorImages: [{ type: String }],
    galleryImages: [{ type: String }],
    videoUrl: { type: String },
    brochureUrl: { type: String },
    featured: { type: Boolean, default: false, index: true },
    amenities: [{ type: String }],
    highlights: [
      {
        title: { type: String },
        description: { type: String },
        image: { type: String },
      },
    ],
    nearby: [
      {
        type: { type: String },
        name: { type: String },
        distance: { type: String },
      },
    ],
    agent: {
      name: { type: String, required: true },
      phone: { type: String, required: true },
      email: { type: String, required: true },
      image: { type: String },
    },
    views: { type: Number, default: 0 },
  },
  { timestamps: true }
);

PropertySchema.index({ 'location.city': 1, propertyType: 1, status: 1 });
PropertySchema.index({ price: 1, priceType: 1 });
PropertySchema.index({ title: 'text', description: 'text', 'location.address': 'text' });

const Property: Model<IProperty> =
  mongoose.models.Property || mongoose.model<IProperty>('Property', PropertySchema);

export default Property;
