import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IAdmin extends Document {
  name: string;
  email: string;
  passwordHash: string;
  salt: string;
  role: 'super_admin' | 'admin';
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const AdminSchema = new Schema<IAdmin>(
  {
    name:         { type: String, required: true, trim: true },
    email:        { type: String, required: true, trim: true, lowercase: true, unique: true },
    passwordHash: { type: String, required: true },
    salt:         { type: String, required: true },
    role:         { type: String, enum: ['super_admin', 'admin'], default: 'admin' },
    isActive:     { type: Boolean, default: true },
  },
  { timestamps: true }
);

AdminSchema.index({ email: 1 });

const Admin: Model<IAdmin> =
  mongoose.models.Admin || mongoose.model<IAdmin>('Admin', AdminSchema);

export default Admin;
