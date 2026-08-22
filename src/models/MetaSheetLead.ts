import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IMetaSheetLead extends Document {
  sheetName: string;
  leadId: string;
  name: string;
  phone: string;
  rawPhone?: string;
  email?: string;
  campaignName?: string;
  campaignId?: string;
  adName?: string;
  adId?: string;
  adsetName?: string;
  adsetId?: string;
  formName?: string;
  formId?: string;
  platform?: string;
  isOrganic?: boolean;
  budget?: string;
  planning?: string;
  visitTimeline?: string;
  configuration?: string;
  city?: string;
  leadStatus?: string;
  notes?: string;
  customAnswers?: Record<string, any>;
  createdAt: Date;
  syncedAt: Date;
  updatedAt: Date;
}

const MetaSheetLeadSchema = new Schema<IMetaSheetLead>(
  {
    sheetName: { type: String, required: true, index: true },
    leadId: { type: String, default: '', index: true },
    name: { type: String, default: 'Meta Lead' },
    phone: { type: String, required: true, index: true },
    rawPhone: { type: String, default: '' },
    email: { type: String, default: '', index: true },
    campaignName: { type: String, default: '' },
    campaignId: { type: String, default: '' },
    adName: { type: String, default: '' },
    adId: { type: String, default: '' },
    adsetName: { type: String, default: '' },
    adsetId: { type: String, default: '' },
    formName: { type: String, default: '' },
    formId: { type: String, default: '' },
    platform: { type: String, default: 'fb' },
    isOrganic: { type: Boolean, default: false },
    budget: { type: String, default: '' },
    planning: { type: String, default: '' },
    visitTimeline: { type: String, default: '' },
    configuration: { type: String, default: '' },
    city: { type: String, default: '' },
    leadStatus: { type: String, default: 'CREATED' },
    notes: { type: String, default: '' },
    customAnswers: { type: Schema.Types.Mixed, default: {} },
    createdAt: { type: Date, default: Date.now, index: true },
    syncedAt: { type: Date, default: Date.now },
  },
  {
    timestamps: true,
  }
);

// Compound index for deduplication per sheet + phone / leadId
MetaSheetLeadSchema.index({ sheetName: 1, phone: 1 });
MetaSheetLeadSchema.index({ sheetName: 1, leadId: 1 });
MetaSheetLeadSchema.index({ createdAt: -1 });

const MetaSheetLead: Model<IMetaSheetLead> =
  mongoose.models.MetaSheetLead ||
  mongoose.model<IMetaSheetLead>('MetaSheetLead', MetaSheetLeadSchema);

export default MetaSheetLead;
