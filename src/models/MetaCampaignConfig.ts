import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IMetaCampaignConfig extends Document {
  sheetName: string;
  sheetId?: string;
  gid?: string;
  totalLeads: number;
  latestLeadDate?: Date | null;
  isActive: boolean;
  lastSyncedAt: Date;
  status: 'active' | 'inactive';
  order: number;
  createdAt: Date;
  updatedAt: Date;
}

const MetaCampaignConfigSchema = new Schema<IMetaCampaignConfig>(
  {
    sheetName: { type: String, required: true, unique: true, index: true },
    sheetId: { type: String, default: '1tVgMpHWRHIXozGO32Mmvc2r0xdYuiPkJptpaDjm3eA8' },
    gid: { type: String, default: '' },
    totalLeads: { type: Number, default: 0 },
    latestLeadDate: { type: Date, default: null },
    isActive: { type: Boolean, default: false },
    lastSyncedAt: { type: Date, default: Date.now },
    status: { type: String, enum: ['active', 'inactive'], default: 'inactive' },
    order: { type: Number, default: 0 },
  },
  {
    timestamps: true,
  }
);

const MetaCampaignConfig: Model<IMetaCampaignConfig> =
  mongoose.models.MetaCampaignConfig ||
  mongoose.model<IMetaCampaignConfig>('MetaCampaignConfig', MetaCampaignConfigSchema);

export default MetaCampaignConfig;
