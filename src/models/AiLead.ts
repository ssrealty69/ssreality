import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IAiLead extends Document {
  name: string;
  phone: string;
  email?: string;
  location?: string;
  propertyType?: string;
  budget?: string;
  message?: string;
  source: 'chat' | 'scroll_modal' | 'lead_form';
  status: 'new' | 'contacted' | 'closed';
  sessionId?: string;
  createdAt: Date;
  updatedAt: Date;
}

const AiLeadSchema = new Schema<IAiLead>(
  {
    name:         { type: String, required: true, trim: true },
    phone:        { type: String, required: true, trim: true },
    email:        { type: String, trim: true, lowercase: true },
    location:     { type: String, trim: true },
    propertyType: { type: String, trim: true },
    budget:       { type: String, trim: true },
    message:      { type: String, trim: true },
    source: {
      type: String,
      enum: ['chat', 'scroll_modal', 'lead_form'],
      default: 'chat',
    },
    status: {
      type: String,
      enum: ['new', 'contacted', 'closed'],
      default: 'new',
    },
    sessionId: { type: String },
  },
  { timestamps: true }
);

AiLeadSchema.index({ createdAt: -1 });
AiLeadSchema.index({ status: 1 });

const AiLead: Model<IAiLead> =
  mongoose.models.AiLead || mongoose.model<IAiLead>('AiLead', AiLeadSchema);

export default AiLead;
