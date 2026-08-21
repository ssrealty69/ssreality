import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IShareKit extends Document {
  propertyId: string;
  // Auto-synced from Property (cached)
  propertyTitle: string;
  propertySlug: string;
  propertyPrice: number;
  propertyLocation: string;
  propertyImages: string[];
  propertyBrochureUrl?: string;
  propertyHighlights?: string[];
  propertyAmenities?: string[];
  propertyPriceList?: { type: string; size: string; price: string }[];

  // Custom tagline / pitch header (Auto-generated & Editable)
  customTagline?: string;

  // Video Links
  videoLinks: { label: string; url: string }[];

  // Legal & Compliance Documents (Lal Dora / Registry / NOC)
  legalDocs: { label: string; url?: string; status: 'approved' | 'pending' | 'info' }[];

  // Payment Plans
  paymentPlans: { name: string; schedule: string; description?: string }[];

  // Land & Financing Details (NBFC Loan & Lal Dora)
  landType?: string; // e.g. "Lal Dora Land", "Freehold", "Authority Approved"
  registryStatus?: string; // e.g. "Direct Registry Available", "GPA", "Mutation Done"
  nbfcPartners: { name: string; maxLoanPercent?: string; notes?: string }[];
  financingNotes?: string;

  // Detailed unit configurations (Auto-fetched & Editable)
  unitConfigs: {
    type: string;          // e.g. "3 BHK Luxury"
    carpetArea?: string;   // e.g. "1450 sq.ft"
    superArea?: string;    // e.g. "1850 sq.ft"
    startingPrice?: string;
    booking?: string;
    floor?: string;
    notes?: string;
  }[];

  // WhatsApp message templates
  whatsappTemplates: { name: string; message: string }[];

  // Toggle: what to include when sharing
  toggles: {
    showPrice: boolean;
    showBrochure: boolean;
    showVideos: boolean;
    showPriceList: boolean;
    showPaymentPlan: boolean;
    showLegalDocs: boolean;
    showUnitConfigs: boolean;
    showAmenities: boolean;
    showFinancing: boolean;
  };

  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const ShareKitSchema = new Schema<IShareKit>(
  {
    propertyId: { type: String, required: true, unique: true, index: true },
    propertyTitle: { type: String, default: '' },
    propertySlug: { type: String, default: '' },
    propertyPrice: { type: Number, default: 0 },
    propertyLocation: { type: String, default: '' },
    propertyImages: [String],
    propertyBrochureUrl: { type: String, default: '' },
    propertyHighlights: [String],
    propertyAmenities: [String],
    propertyPriceList: [
      {
        type: { type: String },
        size: { type: String },
        price: { type: String },
      },
    ],

    customTagline: { type: String, default: '' },

    videoLinks: [{ label: { type: String }, url: { type: String } }],

    legalDocs: [
      {
        label: { type: String },
        url: { type: String, default: '' },
        status: { type: String, enum: ['approved', 'pending', 'info'], default: 'info' },
      },
    ],

    paymentPlans: [
      {
        name: { type: String },
        schedule: { type: String },
        description: { type: String, default: '' },
      },
    ],

    landType: { type: String, default: 'Lal Dora Land' },
    registryStatus: { type: String, default: 'Registry & Mutation Available' },
    nbfcPartners: [
      {
        name: { type: String },
        maxLoanPercent: { type: String, default: '70-80%' },
        notes: { type: String, default: '' },
      },
    ],
    financingNotes: { type: String, default: 'Easy NBFC loan assistance available with doorstep documentation.' },

    unitConfigs: [
      {
        type: { type: String },
        carpetArea: { type: String },
        superArea: { type: String },
        startingPrice: { type: String },
        booking: { type: String },
        floor: { type: String },
        notes: { type: String },
      },
    ],

    whatsappTemplates: [
      {
        name: { type: String },
        message: { type: String },
      },
    ],

    toggles: {
      showPrice: { type: Boolean, default: true },
      showBrochure: { type: Boolean, default: true },
      showVideos: { type: Boolean, default: true },
      showPriceList: { type: Boolean, default: true },
      showPaymentPlan: { type: Boolean, default: true },
      showLegalDocs: { type: Boolean, default: true },
      showUnitConfigs: { type: Boolean, default: true },
      showAmenities: { type: Boolean, default: true },
      showFinancing: { type: Boolean, default: true },
    },

    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

if (process.env.NODE_ENV === 'development' && mongoose.models.ShareKit) {
  delete mongoose.models.ShareKit;
}

const ShareKit: Model<IShareKit> =
  mongoose.models.ShareKit || mongoose.model<IShareKit>('ShareKit', ShareKitSchema);

export default ShareKit;
