import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IPropertyEnquiry extends Document {
  name: string;
  phone: string;
  email?: string;
  requirement?: string;
  propertyId: string;
  propertyTitle: string;
  propertyUrl: string;
  isBrochureDownload?: boolean;
  source?: string;
  assignedAgentId?: mongoose.Types.ObjectId;
  status: 'new' | 'contacted' | 'closed';
  createdAt: Date;
  updatedAt: Date;
}

const PropertyEnquirySchema = new Schema<IPropertyEnquiry>(
  {
    name:           { type: String, required: true, trim: true },
    phone:          { type: String, required: true, trim: true },
    email:          { type: String, trim: true, lowercase: true },
    requirement:    { type: String, trim: true, default: '' },
    propertyId:     { type: String, required: true },
    propertyTitle:  { type: String, required: true, trim: true },
    propertyUrl:    { type: String, required: true, trim: true },
    isBrochureDownload: { type: Boolean, default: false },
    source:         { type: String, default: '' },
    assignedAgentId: { type: Schema.Types.ObjectId, ref: 'Agent' },
    status: {
      type: String,
      enum: ['new', 'contacted', 'closed'],
      default: 'new',
    },
  },
  { timestamps: true }
);

const PropertyEnquiry: Model<IPropertyEnquiry> =
  mongoose.models.PropertyEnquiry || mongoose.model<IPropertyEnquiry>('PropertyEnquiry', PropertyEnquirySchema);

export default PropertyEnquiry;
