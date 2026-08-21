import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IAgentLocationLog extends Document {
  agentId: string;
  agentName: string;
  latitude: number;
  longitude: number;
  accuracy?: number;
  speed?: number;
  batteryLevel?: number;
  status: 'IN_OFFICE' | 'ON_FIELD_VISIT' | 'OFF_DUTY';
  distanceFromOfficeMeters: number;
  address?: string;
  timestamp: Date;
  date: string; // YYYY-MM-DD
}

const AgentLocationLogSchema = new Schema<IAgentLocationLog>(
  {
    agentId: { type: String, required: true, index: true },
    agentName: { type: String, required: true },
    latitude: { type: Number, required: true },
    longitude: { type: Number, required: true },
    accuracy: { type: Number },
    speed: { type: Number },
    batteryLevel: { type: Number },
    status: {
      type: String,
      enum: ['IN_OFFICE', 'ON_FIELD_VISIT', 'OFF_DUTY'],
      default: 'IN_OFFICE',
    },
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
