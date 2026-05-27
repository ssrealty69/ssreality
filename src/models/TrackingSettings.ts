import mongoose, { Schema, Document, Model } from 'mongoose';

// ─────────────────────────────────────────────
// TrackingSettings — Single-row settings document
// ─────────────────────────────────────────────
export interface ITrackingSettings extends Document {
  isEnabled: boolean;
  // Google Tag Manager
  googleTagManagerId: string;       // e.g. GTM-XXXXXXX
  // Meta (Facebook) Pixel
  metaPixelId: string;              // e.g. 1234567890
  // Google Ads
  googleAdsConversionId: string;    // e.g. AW-XXXXXXXXXX
  googleAdsRemarketingLabel: string;// e.g. AbCdEfGhIjKlM
  // GA4
  ga4MeasurementId: string;         // e.g. G-XXXXXXXXXX
  // Meta Advanced Matching
  enableAdvancedMatching: boolean;
  // Server-side event logging
  enableEventLog: boolean;
  // Audit fields
  lastUpdated: Date;
  updatedBy: string;
}

const TrackingSettingsSchema = new Schema<ITrackingSettings>(
  {
    isEnabled:                { type: Boolean, default: false },
    googleTagManagerId:       { type: String, default: '' },
    metaPixelId:              { type: String, default: '' },
    googleAdsConversionId:    { type: String, default: '' },
    googleAdsRemarketingLabel:{ type: String, default: '' },
    ga4MeasurementId:         { type: String, default: '' },
    enableAdvancedMatching:   { type: Boolean, default: false },
    enableEventLog:           { type: Boolean, default: true },
    lastUpdated:              { type: Date, default: Date.now },
    updatedBy:                { type: String, default: 'admin' },
  },
  { timestamps: true }
);

const TrackingSettings: Model<ITrackingSettings> =
  mongoose.models.TrackingSettings ||
  mongoose.model<ITrackingSettings>('TrackingSettings', TrackingSettingsSchema);

export default TrackingSettings;
