import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IContact extends Document {
  name: string;
  email: string;
  phone: string;
  subject: string;
  message: string;
  propertyId?: string;
  assignedAgentId?: mongoose.Types.ObjectId | string;
  status: 'new' | 'read' | 'replied';
  createdAt: Date;
}

const ContactSchema = new Schema<IContact>(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, trim: true, lowercase: true },
    phone: { type: String, required: true },
    subject: { type: String, required: true },
    message: { type: String, required: true },
    propertyId: { type: String },
    assignedAgentId: { type: Schema.Types.ObjectId, ref: 'Agent' },
    status: { type: String, enum: ['new', 'read', 'replied'], default: 'new' },
  },
  { timestamps: true }
);

const Contact: Model<IContact> =
  mongoose.models.Contact || mongoose.model<IContact>('Contact', ContactSchema);

export default Contact;
