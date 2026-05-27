import mongoose, { Schema, Document, Model } from 'mongoose';

// ─────────────────────────────────────────────
// EventLog — Debug/analytics server-side event log
// ─────────────────────────────────────────────
export interface IEventLog extends Document {
  eventName: string;       // e.g. "ViewProperty", "LeadFormSubmit"
  parameters: Record<string, any>; // All event-specific data
  sessionId: string;       // Browser session identifier
  userAgent: string;       // Browser/device info
  ipAddress: string;       // Visitor IP (anonymised)
  page: string;            // Page URL where event fired
  timestamp: Date;
}

const EventLogSchema = new Schema<IEventLog>(
  {
    eventName:  { type: String, required: true, index: true },
    parameters: { type: Schema.Types.Mixed, default: {} },
    sessionId:  { type: String, default: '' },
    userAgent:  { type: String, default: '' },
    ipAddress:  { type: String, default: '' },
    page:       { type: String, default: '' },
    timestamp:  { type: Date, default: Date.now },
  },
  { timestamps: false }
);

// Auto-expire logs after 90 days to keep DB clean
EventLogSchema.index({ timestamp: 1 }, { expireAfterSeconds: 90 * 24 * 60 * 60 });

const EventLog: Model<IEventLog> =
  mongoose.models.EventLog ||
  mongoose.model<IEventLog>('EventLog', EventLogSchema);

export default EventLog;
