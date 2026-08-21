import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IAgentActivityLog extends Document {
  agentId: string;
  agentName: string;
  date: string; // YYYY-MM-DD
  activeSeconds: number;
  screenName?: string;
  deviceInfo?: string;
  timestamp: Date;
  createdAt: Date;
}

const AgentActivityLogSchema = new Schema<IAgentActivityLog>(
  {
    agentId:       { type: String, required: true, index: true },
    agentName:     { type: String, required: true },
    date:          { type: String, required: true, index: true }, // YYYY-MM-DD
    activeSeconds: { type: Number, required: true, default: 0 },
    screenName:    { type: String, default: '' },
    deviceInfo:    { type: String, default: '' },
    timestamp:     { type: Date, default: Date.now },
  },
  { timestamps: true }
);

AgentActivityLogSchema.index({ agentId: 1, date: 1 });
AgentActivityLogSchema.index({ timestamp: -1 });

if (mongoose.models.AgentActivityLog) {
  delete (mongoose.models as any).AgentActivityLog;
}

const AgentActivityLog: Model<IAgentActivityLog> =
  mongoose.models.AgentActivityLog ||
  mongoose.model<IAgentActivityLog>('AgentActivityLog', AgentActivityLogSchema);

export default AgentActivityLog;
