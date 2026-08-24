import mongoose, { Schema, Document } from 'mongoose';

export interface IJobApplication extends Document {
  name: string;
  phone: string;
  age: string;
  position: string;
  resumeUrl?: string;
  status: 'new' | 'viewed' | 'contacted' | 'rejected';
  isRead: boolean;
  createdAt: Date;
}

const JobApplicationSchema: Schema = new Schema({
  name: { type: String, required: true, trim: true },
  phone: { type: String, required: true, trim: true },
  age: { type: String, required: true, trim: true },
  position: { type: String, required: true },
  resumeUrl: { type: String },
  status: { type: String, enum: ['new', 'viewed', 'contacted', 'rejected'], default: 'new' },
  isRead: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now }
});

export default mongoose.models.JobApplication || mongoose.model<IJobApplication>('JobApplication', JobApplicationSchema);

