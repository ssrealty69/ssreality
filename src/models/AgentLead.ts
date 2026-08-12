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
  | 'visit_done'
  | 'follow_up';

export interface ICallLog {
  disposition: Disposition;
  notes?: string;
  calledAt: Date;
}

export interface IVisitDetails {
  day?: string;
  date?: string;
  time?: string;
}

export interface IAgentLead extends Document {
  agentId: string;
  agentName: string;
  name: string;
  phone: string;
  email?: string;
  source?: string;
  originalLeadId?: string;
  originalLeadType?: 'contact' | 'property_enquiry' | 'ai_lead' | 'manual';
  propertyInterest?: string;
  disposition: Disposition;
  visitDetails?: IVisitDetails;
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
      enum: ['new','ringing','connected','not_connected','switch_off','not_reachable','interested','not_interested','visit_done','follow_up'],
      required: true,
    },
    notes: { type: String, trim: true },
    calledAt: { type: Date, default: () => new Date() },
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

const AgentLeadSchema = new Schema<IAgentLead>(
  {
    agentId:          { type: String, required: true, index: true },
    agentName:        { type: String, required: true, trim: true },
    name:             { type: String, required: true, trim: true },
    phone:            { type: String, required: true, trim: true },
    email:            { type: String, trim: true, lowercase: true },
    source:           { type: String, trim: true },
    originalLeadId:   { type: String },
    originalLeadType: { type: String, enum: ['contact','property_enquiry','ai_lead','manual'] },
    propertyInterest: { type: String, trim: true },
    disposition: {
      type: String,
      enum: ['new','ringing','connected','not_connected','switch_off','not_reachable','interested','not_interested','visit_done','follow_up'],
      default: 'new',
      index: true,
    },
    visitDetails:    { type: VisitDetailsSchema },
    followUpDate:    { type: Date },
    history:         { type: [CallLogSchema], default: [] },
    sharedProjectIds:{ type: [String], default: [] },
  },
  { timestamps: true }
);

AgentLeadSchema.index({ agentId: 1, disposition: 1 });
AgentLeadSchema.index({ createdAt: -1 });
AgentLeadSchema.index({ phone: 1 });

const AgentLead: Model<IAgentLead> =
  mongoose.models.AgentLead || mongoose.model<IAgentLead>('AgentLead', AgentLeadSchema);

export default AgentLead;
