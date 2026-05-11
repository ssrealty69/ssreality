import mongoose, { Schema, Document } from 'mongoose';

export interface IJobApplication extends Document {
  name: string;
  phone: string;
  age: string;
  position: string;
  resumeUrl?: string;
  createdAt: Date;
}

const JobApplicationSchema: Schema = new Schema({
  name: { type: String, required: true, trim: true },
  phone: { type: String, required: true, trim: true },
  age: { type: String, required: true, trim: true },
  position: { type: String, required: true },
  resumeUrl: { type: String },
  createdAt: { type: Date, default: Date.now }
});

export default mongoose.models.JobApplication || mongoose.model<IJobApplication>('JobApplication', JobApplicationSchema);
