import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IAgentSession extends Document {
  agentId: string;
  token: string;
  expiresAt: Date;
  createdAt: Date;
}

const AgentSessionSchema = new Schema<IAgentSession>(
  {
    agentId:   { type: String, required: true, index: true },
    token:     { type: String, required: true, unique: true, index: true },
    expiresAt: { type: Date, required: true },
  },
  { timestamps: true }
);

// Auto-delete expired sessions
AgentSessionSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

const AgentSession: Model<IAgentSession> =
  mongoose.models.AgentSession || mongoose.model<IAgentSession>('AgentSession', AgentSessionSchema);

export default AgentSession;
