import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IAgentAttendance extends Document {
  agentId: string;
  agentName: string;
  date: string; // YYYY-MM-DD
  punchIn?: Date;
  punchOut?: Date;
  totalMinutes?: number;
  activeSeconds: number; // Total screen time seconds actively used on mobile app today
  lastActiveAt?: Date;   // Timestamp of latest activity heartbeat
  sessionCount?: number; // Total app sessions opened today
  deviceInfo?: string;
  deviceId?: string;
  deviceModel?: string;
  deviceFound?: boolean;
  isMockLocation?: boolean;
  punchInLat?: number;
  punchInLng?: number;
  punchInAddress?: string;
  punchInDistanceMeters?: number;
  punchInStatus?: 'IN_OFFICE' | 'REMOTE' | 'FIELD';
  punchOutLat?: number;
  punchOutLng?: number;
  punchOutAddress?: string;
  punchOutDistanceMeters?: number;
}

const AgentAttendanceSchema = new Schema<IAgentAttendance>(
  {
    agentId:       { type: String, required: true, index: true },
    agentName:     { type: String, required: true },
    date:          { type: String, required: true }, // YYYY-MM-DD
    punchIn:       { type: Date },
    punchOut:      { type: Date },
    totalMinutes:  { type: Number },
    activeSeconds: { type: Number, default: 0 },
    lastActiveAt:  { type: Date, default: Date.now },
    sessionCount:  { type: Number, default: 1 },
    deviceInfo:    { type: String, default: '' },
    deviceId:      { type: String },
    deviceModel:   { type: String },
    deviceFound:   { type: Boolean, default: true },
    isMockLocation:{ type: Boolean, default: false },
    punchInLat:    { type: Number },
    punchInLng:    { type: Number },
    punchInAddress:{ type: String },
    punchInDistanceMeters: { type: Number },
    punchInStatus: { type: String, enum: ['IN_OFFICE', 'REMOTE', 'FIELD'], default: 'IN_OFFICE' },
    punchOutLat:   { type: Number },
    punchOutLng:   { type: Number },
    punchOutAddress: { type: String },
    punchOutDistanceMeters: { type: Number },
  },
  { timestamps: true }
);

// One record per agent per day
AgentAttendanceSchema.index({ agentId: 1, date: 1 }, { unique: false });

if (mongoose.models.AgentAttendance) {
  delete (mongoose.models as any).AgentAttendance;
}

const AgentAttendance: Model<IAgentAttendance> =
  mongoose.models.AgentAttendance ||
  mongoose.model<IAgentAttendance>('AgentAttendance', AgentAttendanceSchema);

export default AgentAttendance;
