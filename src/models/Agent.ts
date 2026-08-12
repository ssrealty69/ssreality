import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IAgent extends Document {
  name: string;
  username: string;
  passwordHash: string;
  salt: string;
  employee_id: string;
  isActive: boolean;
  lastAssignedLeadAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const AgentSchema = new Schema<IAgent>(
  {
    name:         { type: String, required: true, trim: true },
    username:     { type: String, required: true, trim: true, lowercase: true, unique: true },
    passwordHash: { type: String, required: true },
    salt:         { type: String, required: true },
    employee_id:  { type: String, required: true, trim: true, unique: true },
    isActive:     { type: Boolean, default: true },
    lastAssignedLeadAt: { type: Date },
  },
  { timestamps: true }
);

AgentSchema.index({ username: 1 });
AgentSchema.index({ employee_id: 1 });

const Agent: Model<IAgent> =
  mongoose.models.Agent || mongoose.model<IAgent>('Agent', AgentSchema);

export default Agent;
