import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IAgent extends Document {
  name: string;
  username: string;
  passwordHash: string;
  salt: string;
  plainPassword?: string;
  employee_id: string;
  role?: 'agent' | 'director' | 'admin';
  isExecutive?: boolean;
  isActive: boolean;
  isReceivingLeads?: boolean; // When false (on leave/absent), agent is skipped from lead distribution
  allowRemotePunchIn?: boolean; // When true, agent can punch-in/login from any location even if global geofence is ON
  lastAssignedLeadAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const AgentSchema = new Schema<IAgent>(
  {
    name:          { type: String, required: true, trim: true },
    username:      { type: String, required: true, trim: true, lowercase: true, unique: true },
    passwordHash:  { type: String, required: true },
    salt:          { type: String, required: true },
    plainPassword: { type: String, default: '' },
    employee_id:   { type: String, required: true, trim: true, unique: true },
    role:          { type: String, enum: ['agent', 'director', 'admin'], default: 'agent' },
    isExecutive:   { type: Boolean, default: false },
    isActive:      { type: Boolean, default: true },
    isReceivingLeads: { type: Boolean, default: true },
    allowRemotePunchIn: { type: Boolean, default: false },
    lastAssignedLeadAt: { type: Date },
  },
  { timestamps: true }
);

AgentSchema.index({ username: 1 });
AgentSchema.index({ employee_id: 1 });

if (mongoose.models.Agent) {
  delete (mongoose.models as any).Agent;
}

const Agent: Model<IAgent> =
  mongoose.models.Agent || mongoose.model<IAgent>('Agent', AgentSchema);

export default Agent;
