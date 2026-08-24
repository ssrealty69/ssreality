import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IAgentLocationLog extends Document {
  agentId: string;
  agentName: string;
  employeeId?: string;
  latitude: number;
  longitude: number;
  accuracy?: number;
  speed?: number;
  heading?: number;
  altitude?: number;
  isMoving?: boolean;
  isMock?: boolean;
  batteryLevel?: number;
  status?: 'IN_OFFICE' | 'ON_FIELD_VISIT' | 'OFF_DUTY';
  locationStatus?: string;
  notes?: string;
  distanceFromOfficeMeters?: number;
  address?: string;
  timestamp: Date;
  date: string; // YYYY-MM-DD
}

const AgentLocationLogSchema = new Schema<IAgentLocationLog>(
  {
    agentId: { type: String, required: true, index: true },
    agentName: { type: String, required: true },
    employeeId: { type: String },
    latitude: { type: Number, required: true },
    longitude: { type: Number, required: true },
    accuracy: { type: Number },
    speed: { type: Number },
    heading: { type: Number },
    altitude: { type: Number },
    isMoving: { type: Boolean },
    isMock: { type: Boolean },
    batteryLevel: { type: Number },
    status: {
      type: String,
      enum: ['IN_OFFICE', 'ON_FIELD_VISIT', 'OFF_DUTY'],
      default: 'IN_OFFICE',
    },
    locationStatus: { type: String },
    notes: { type: String },
    distanceFromOfficeMeters: { type: Number, default: 0 },
    address: { type: String },
    timestamp: { type: Date, required: true, default: Date.now },
    date: { type: String, required: true, index: true },
  },
  { timestamps: true }
);

AgentLocationLogSchema.index({ agentId: 1, date: 1, timestamp: 1 });

const AgentLocationLog: Model<IAgentLocationLog> =
  mongoose.models.AgentLocationLog ||
  mongoose.model<IAgentLocationLog>('AgentLocationLog', AgentLocationLogSchema);

export default AgentLocationLog;
