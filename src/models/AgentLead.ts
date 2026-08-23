import mongoose, { Schema, Document, Model } from 'mongoose';

export type Disposition =
  | 'new'
  | 'ringing'
  | 'connected'
  | 'not_connected'
  | 'switch_off'
  | 'not_reachable'
  | 'interested'
  | 'not_interested'
  | 'visit_scheduled'
  | 'visit_done'
  | 'follow_up'
  | 'booked';

export interface ICallLog {
  disposition: Disposition;
  notes?: string;
  calledAt: Date;
  duration?: string;
  durationSeconds?: number;
  recordingUrl?: string;
  recordingPath?: string;
}

export interface IVisitDetails {
  day?: string;
  date?: string;
  time?: string;
}

export interface IBookingDetails {
  projectName?: string;
  location?: string;
  unitType?: string;
  amount?: number;
  amountFormatted?: string;
  downpayment?: string;
  bookedAt?: Date;
  receiptNumber?: string;
}

export interface IAgentLead extends Document {
  agentId: string;
  agentName: string;
  name: string;
  phone: string;
  email?: string;
  source?: string;
  originalLeadId?: string;
  originalLeadType?: 'contact' | 'property_enquiry' | 'ai_lead' | 'manual' | 'meta_lead' | 'brochure';
  propertyInterest?: string;
  projectName?: string;
  planning?: string;
  visitTimeline?: string;
  budget?: string;
  configuration?: string;
  sheetName?: string;
  formName?: string;
  campaignName?: string;
  adName?: string;
  platform?: string;
  isRead?: boolean;
  notes?: string;
  disposition: Disposition;
  visitDetails?: IVisitDetails;
  bookingDetails?: IBookingDetails;
  followUpDate?: Date;
  history: ICallLog[];
  sharedProjectIds?: string[];
  createdAt: Date;
  updatedAt: Date;
}

const CallLogSchema = new Schema<ICallLog>(
  {
    disposition: {
      type: String,
      enum: ['new','ringing','connected','not_connected','switch_off','not_reachable','interested','not_interested','visit_scheduled','visit_done','follow_up','booked'],
      required: true,
    },
    notes: { type: String, trim: true },
    calledAt: { type: Date, default: () => new Date() },
    duration: { type: String, trim: true },
    durationSeconds: { type: Number, default: 0 },
    recordingUrl: { type: String, trim: true },
    recordingPath: { type: String, trim: true },
  },
  { _id: false }
);

const VisitDetailsSchema = new Schema<IVisitDetails>(
  {
    day:  { type: String, trim: true },
    date: { type: String, trim: true },
    time: { type: String, trim: true },
  },
  { _id: false }
);

const BookingDetailsSchema = new Schema<IBookingDetails>(
  {
    projectName:    { type: String, trim: true },
    location:       { type: String, trim: true },
    unitType:       { type: String, trim: true },
    amount:         { type: Number },
    amountFormatted:{ type: String, trim: true },
    downpayment:    { type: String, trim: true },
    bookedAt:       { type: Date, default: () => new Date() },
    receiptNumber:  { type: String, trim: true },
  },
  { _id: false }
);

const AgentLeadSchema = new Schema<IAgentLead>(
  {
    agentId:          { type: String, required: true, index: true },
    agentName:        { type: String, required: true, trim: true },
    name:             { type: String, required: true, trim: true },
    phone:            { type: String, required: true, trim: true },
    email:            { type: String, trim: true, lowercase: true },
    source:           { type: String, trim: true },
    originalLeadId:   { type: String, index: true },
    originalLeadType: { type: String, enum: ['contact','property_enquiry','ai_lead','manual','meta_lead','brochure'] },
    propertyInterest: { type: String, trim: true },
    projectName:      { type: String, trim: true },
    planning:         { type: String, trim: true },
    visitTimeline:    { type: String, trim: true },
    budget:           { type: String, trim: true },
    configuration:    { type: String, trim: true },
    sheetName:        { type: String, trim: true },
    formName:         { type: String, trim: true },
    campaignName:     { type: String, trim: true },
    adName:           { type: String, trim: true },
    platform:         { type: String, trim: true, default: 'fb' },
    isRead:           { type: Boolean, default: false },
    isReassignedAtNoon: { type: Boolean, default: false },
    reassignedFrom:   { type: String, trim: true },
    notes:            { type: String, trim: true },
    disposition: {
      type: String,
      enum: ['new','ringing','connected','not_connected','switch_off','not_reachable','interested','not_interested','visit_scheduled','visit_done','follow_up','booked'],
      default: 'new',
      index: true,
    },
    visitDetails:    { type: VisitDetailsSchema },
    bookingDetails:  { type: BookingDetailsSchema },
    followUpDate:    { type: Date },
    history:         { type: [CallLogSchema], default: [] },
    sharedProjectIds:{ type: [String], default: [] },
  },
  { timestamps: true }
);

AgentLeadSchema.index({ agentId: 1, disposition: 1 });
AgentLeadSchema.index({ agentId: 1, isRead: 1 });
AgentLeadSchema.index({ createdAt: -1 });
AgentLeadSchema.index({ phone: 1 });
AgentLeadSchema.index({ agentId: 1, phone: 1 });
AgentLeadSchema.index({ isReassignedAtNoon: 1 });

const AgentLead: Model<IAgentLead> =
  mongoose.models.AgentLead || mongoose.model<IAgentLead>('AgentLead', AgentLeadSchema);

export default AgentLead;