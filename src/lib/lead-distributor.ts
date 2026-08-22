import mongoose from 'mongoose';
import { connectDB } from '@/lib/mongodb';
import Agent, { IAgent } from '@/models/Agent';
import AgentLead, { IAgentLead } from '@/models/AgentLead';
import MetaSheetLead from '@/models/MetaSheetLead';
import PropertyEnquiry from '@/models/PropertyEnquiry';
import Contact from '@/models/Contact';

/**
 * PRIORITY SLABS & AGENT CONFIGURATION
 * Sequence / Rank as explicitly requested by user:
 * 1. Nikhil
 * 2. Ayaan
 * 3. Nihal
 * 4. Gulshan
 * 5. Nikita
 * 6. Bhavishya
 * 7. Manjeet
 * 8. Geetanjali
 */
export interface AgentPriorityConfig {
  rank: number;
  namePattern: RegExp;
  employeeId?: string;
  weight: number;
  isTop3: boolean;
}

export const AGENT_PRIORITY_SLABS: AgentPriorityConfig[] = [
  { rank: 1, namePattern: /nikhil/i, employeeId: 'SSR001', weight: 1.30, isTop3: true },
  { rank: 2, namePattern: /ayaan/i,  employeeId: 'SSR002', weight: 1.30, isTop3: true },
  { rank: 3, namePattern: /nihal/i,  employeeId: 'SSR005', weight: 1.20, isTop3: true },
  { rank: 4, namePattern: /gulshan/i,employeeId: 'SSR004', weight: 1.05, isTop3: false },
  { rank: 5, namePattern: /nikita/i, employeeId: 'SSR013', weight: 1.00, isTop3: false },
  { rank: 6, namePattern: /bhavishya/i, employeeId: 'SSR006', weight: 0.95, isTop3: false },
  { rank: 7, namePattern: /manjeet/i,employeeId: 'SSR008', weight: 0.90, isTop3: false },
  { rank: 8, namePattern: /geetanjali/i, employeeId: 'SSR012', weight: 0.85, isTop3: false },
];

/**
 * Checks if the given date / time is in the 6:00 PM to 9:00 PM window in Indian Standard Time (IST).
 */
export function isEveningTop3Window(date: Date = new Date()): boolean {
  const istOffset = 5.5 * 60 * 60 * 1000;
  const istDate = new Date(date.getTime() + istOffset);
  const istHour = istDate.getUTCHours();
  // 18:00 (6 PM) to 20:59 (8:59 PM) IST
  return istHour >= 18 && istHour < 21;
}

/**
 * Intelligent Project Name Normalizer
 * Automatically maps raw sheet titles, form names, and enquiry subjects to official luxury project names.
 */
export function cleanProjectTitle(rawText?: string, fallback = 'SS Realty'): string {
  if (!rawText) return fallback;
  const text = rawText.toLowerCase().trim();

  if (text.includes('arch')) return 'The Arch';
  if (text.includes('nivasa')) return 'The Nivasa II';
  if (text.includes('vasundhara')) return 'Vasundhara Grand';
  if (text.includes('amarylis') || text.includes('amaryllis')) return 'The Amaryllis';
  if (text.includes('velora')) return 'Velora';
  if (text.includes('chattarpur') || text.includes('chhattarpur')) return 'Chattarpur Luxury Floors';
  if (text.includes('orchid')) return 'The Orchid';
  if (text.includes('leaf')) return 'SS The Leaf';
  if (text.includes('camellias')) return 'SS Camellias';
  if (text.includes('100') || text.includes('sector 100')) return 'SS 100';

  // Strip generic prefixes/suffixes like "July New Leads", "Ad Lead", "(v2)", "Form"
  const cleaned = rawText
    .replace(/(july|august|june|may|april|new|leads?|ad|copy|form|\(v\d+\)|\(\d+\))/gi, '')
    .trim();

  return cleaned.length > 2 ? cleaned : fallback;
}

/**
 * Resolves priority ranking and weight for an agent document.
 */
export function getAgentWeightAndRank(agent: any): { rank: number; weight: number; isTop3: boolean } {
  const name = String(agent.name || '');
  const empId = String(agent.employee_id || '');
  const username = String(agent.username || '');

  for (const slab of AGENT_PRIORITY_SLABS) {
    if (slab.employeeId && empId.toUpperCase() === slab.employeeId.toUpperCase()) {
      return { rank: slab.rank, weight: slab.weight, isTop3: slab.isTop3 };
    }
    if (slab.namePattern.test(name) || slab.namePattern.test(username)) {
      return { rank: slab.rank, weight: slab.weight, isTop3: slab.isTop3 };
    }
  }

  // Dynamic new agent fallback
  return { rank: 99, weight: 0.80, isTop3: false };
}

export interface LeadDistributionPayload {
  name: string;
  phone: string;
  email?: string;
  source: string; // 'Meta Ads' | 'Website Enquiry' | 'Blog Enquiry' | 'Brochure Download' | 'Contact Form'
  originalLeadId?: string;
  originalLeadType?: 'meta_lead' | 'contact' | 'property_enquiry' | 'ai_lead' | 'manual' | 'brochure';
  rawProjectName?: string;
  propertyInterest?: string;
  planning?: string;
  visitTimeline?: string;
  budget?: string;
  configuration?: string;
  sheetName?: string;
  formName?: string;
  campaignName?: string;
  adName?: string;
  platform?: string;
  notes?: string;
  createdAt?: Date;
}

/**
 * Core Lead Distribution Function (200 IQ Weighted Algorithm + 6-9 PM IST Top 3 Window)
 */
export async function distributeLead(payload: LeadDistributionPayload): Promise<{
  assigned: boolean;
  agentId?: string;
  agentName?: string;
  leadDocId?: string;
  reason?: string;
}> {
  await connectDB();

  const cleanPhone = (payload.phone || '').replace(/\D/g, '');
  if (cleanPhone.length < 10) {
    return { assigned: false, reason: 'Invalid phone number' };
  }

  const phone10 = cleanPhone.slice(-10);

  // 1. Anti-Duplicate Check: If this phone is already assigned to an agent, do not re-assign
  const existing = await AgentLead.findOne({
    phone: { $regex: `${phone10}$` },
  }).lean();

  if (existing) {
    return {
      assigned: false,
      agentId: (existing as any).agentId,
      agentName: (existing as any).agentName,
      leadDocId: (existing as any)._id?.toString(),
      reason: 'Lead already assigned to agent',
    };
  }

  // 2. Fetch all active agents
  const allActiveAgents = await Agent.find({ isActive: true }).lean();
  if (allActiveAgents.length === 0) {
    return { assigned: false, reason: 'No active agents available' };
  }

  const leadTime = payload.createdAt || new Date();
  const isTop3Time = isEveningTop3Window(leadTime);

  // 3. Filter Eligible Agents based on 6 PM - 9 PM IST Window
  let eligibleAgents = allActiveAgents.map((agent) => {
    const { rank, weight, isTop3 } = getAgentWeightAndRank(agent);
    return { ...agent, rank, weight, isTop3 };
  });

  if (isTop3Time) {
    const top3Only = eligibleAgents.filter((a) => a.isTop3);
    if (top3Only.length > 0) {
      eligibleAgents = top3Only;
    }
  }

  // 4. Calculate Distribution Scores (Weighted Proportional Round-Robin)
  // Score = (Total Assigned Leads for Agent) / (Agent Weight)
  const agentScores = await Promise.all(
    eligibleAgents.map(async (agent) => {
      const agentIdStr = String(agent._id);
      const assignedCount = await AgentLead.countDocuments({
        $or: [
          { agentId: agentIdStr },
          { agentId: agent.employee_id },
          { agentName: agent.name },
        ],
      });

      const lastAssignedTime = agent.lastAssignedLeadAt
        ? new Date(agent.lastAssignedLeadAt).getTime()
        : 0;

      // Score formula: lower score means agent is next in line
      const score = assignedCount / agent.weight;

      return {
        agent,
        assignedCount,
        score,
        lastAssignedTime,
      };
    })
  );

  // Sort by score ascending (lowest score gets the lead); tie-breaker: oldest lastAssignedTime
  agentScores.sort((a, b) => {
    if (Math.abs(a.score - b.score) > 0.05) {
      return a.score - b.score;
    }
    return a.lastAssignedTime - b.lastAssignedTime;
  });

  const selected = agentScores[0].agent;
  const selectedAgentId = String(selected._id);
  const selectedAgentName = selected.name;

  // 5. Clean Project Name
  const normalizedProjectName = cleanProjectTitle(
    payload.rawProjectName || payload.sheetName || payload.formName || payload.propertyInterest
  );

  // 6. Create AgentLead Record
  const newAgentLead = await AgentLead.create({
    agentId: selectedAgentId,
    agentName: selectedAgentName,
    name: payload.name && payload.name !== 'Lead' ? payload.name : `Lead ${phone10}`,
    phone: phone10,
    email: payload.email || '',
    source: payload.source || 'Meta Ads',
    originalLeadId: payload.originalLeadId || '',
    originalLeadType: payload.originalLeadType || 'meta_lead',
    projectName: normalizedProjectName,
    propertyInterest: payload.propertyInterest || normalizedProjectName,
    planning: payload.planning || '',
    visitTimeline: payload.visitTimeline || '',
    budget: payload.budget || '',
    configuration: payload.configuration || '',
    sheetName: payload.sheetName || '',
    formName: payload.formName || '',
    campaignName: payload.campaignName || '',
    adName: payload.adName || '',
    platform: payload.platform || 'fb',
    isRead: false,
    notes: payload.notes || '',
    disposition: 'new',
    history: [],
    createdAt: leadTime,
  });

  // 7. Update Agent's Last Assigned Timestamp
  await Agent.findByIdAndUpdate(selected._id, {
    lastAssignedLeadAt: new Date(),
  });

  return {
    assigned: true,
    agentId: selectedAgentId,
    agentName: selectedAgentName,
    leadDocId: newAgentLead._id.toString(),
  };
}

/**
 * Bulk Distributor for existing unassigned leads in database (Meta Ads, Property Enquiries, Contacts)
 */
export async function bulkDistributeUnassignedLeads(): Promise<{
  totalProcessed: number;
  totalAssigned: number;
  totalSkipped: number;
  distributionSummary: Record<string, number>;
}> {
  await connectDB();

  const distributionSummary: Record<string, number> = {};
  let totalProcessed = 0;
  let totalAssigned = 0;
  let totalSkipped = 0;

  // 1. Process Meta Sheet Leads (sorted chronologically)
  const metaLeads = await MetaSheetLead.find().sort({ createdAt: 1 }).lean();

  for (const m of metaLeads as any[]) {
    totalProcessed++;
    const res = await distributeLead({
      name: m.name,
      phone: m.phone,
      email: m.email,
      source: 'Meta Ads',
      originalLeadId: m._id.toString(),
      originalLeadType: 'meta_lead',
      rawProjectName: m.sheetName,
      propertyInterest: m.campaignName || m.formName || m.sheetName,
      planning: m.planning,
      visitTimeline: m.visitTimeline,
      budget: m.budget,
      configuration: m.configuration,
      sheetName: m.sheetName,
      formName: m.formName,
      campaignName: m.campaignName,
      adName: m.adName,
      platform: m.platform,
      createdAt: m.createdAt ? new Date(m.createdAt) : new Date(),
    });

    if (res.assigned && res.agentName) {
      totalAssigned++;
      distributionSummary[res.agentName] = (distributionSummary[res.agentName] || 0) + 1;
    } else {
      totalSkipped++;
    }
  }

  // 2. Process Property Enquiries & Brochure Downloads
  const enquiries = await PropertyEnquiry.find().sort({ createdAt: 1 }).lean();
  for (const pe of enquiries as any[]) {
    totalProcessed++;
    const isBrochure = pe.isBrochureDownload === true || (pe.requirement && pe.requirement.includes('Brochure'));
    const source = isBrochure ? 'Brochure Download' : (pe.source || 'Website Enquiry');

    const res = await distributeLead({
      name: pe.name,
      phone: pe.phone,
      email: pe.email,
      source,
      originalLeadId: pe._id.toString(),
      originalLeadType: isBrochure ? 'brochure' : 'property_enquiry',
      rawProjectName: pe.propertyTitle,
      propertyInterest: pe.propertyTitle,
      notes: pe.requirement,
      createdAt: pe.createdAt ? new Date(pe.createdAt) : new Date(),
    });

    if (res.assigned && res.agentName) {
      totalAssigned++;
      distributionSummary[res.agentName] = (distributionSummary[res.agentName] || 0) + 1;
    } else {
      totalSkipped++;
    }
  }

  // 3. Process General Contacts
  const contacts = await Contact.find().sort({ createdAt: 1 }).lean();
  for (const ct of contacts as any[]) {
    totalProcessed++;
    const res = await distributeLead({
      name: ct.name,
      phone: ct.phone,
      email: ct.email,
      source: 'Contact Form',
      originalLeadId: ct._id.toString(),
      originalLeadType: 'contact',
      rawProjectName: ct.propertyTitle || ct.subject,
      propertyInterest: ct.subject,
      notes: ct.message,
      createdAt: ct.createdAt ? new Date(ct.createdAt) : new Date(),
    });

    if (res.assigned && res.agentName) {
      totalAssigned++;
      distributionSummary[res.agentName] = (distributionSummary[res.agentName] || 0) + 1;
    } else {
      totalSkipped++;
    }
  }

  return {
    totalProcessed,
    totalAssigned,
    totalSkipped,
    distributionSummary,
  };
}

/**
 * 12:00 PM No-Show Re-Distribution Engine
 * 
 * Rule:
 * If the current time is past 12:00 PM IST (Noon):
 * Check all leads that arrived between previous night 9:00 PM (21:00 IST) and today 11:59:59 AM IST.
 * If an assigned agent has NOT logged in / punched in today (absent / no activity today in AgentAttendance),
 * AND the lead is still untouched (disposition === 'new' and history.length === 0):
 * ➡️ RE-ASSIGN the lead to agents who ARE LOGGED IN / ACTIVE today using the priority slabs!
 */
export async function redistributeUnattendedMorningLeads(now: Date = new Date()): Promise<{
  executed: boolean;
  reason?: string;
  totalReassigned: number;
  reassignedLeads: any[];
}> {
  await connectDB();

  // 1. Calculate IST Time
  const istOffset = 5.5 * 60 * 60 * 1000;
  const istNow = new Date(now.getTime() + istOffset);
  const istHour = istNow.getUTCHours();
  const istMinute = istNow.getUTCMinutes();

  // Trigger only at or after 12:00 PM IST (Hour >= 12)
  if (istHour < 12) {
    return {
      executed: false,
      reason: `Current IST time is ${istHour}:${istMinute.toString().padStart(2, '0')}. Redistribution activates at/after 12:00 PM IST.`,
      totalReassigned: 0,
      reassignedLeads: [],
    };
  }

  // 2. Define Date Range in UTC for previous night 9:00 PM IST to today 11:59:59 AM IST
  const todayISTDateStr = istNow.toISOString().split('T')[0]; // "YYYY-MM-DD"
  const todayMidnightIST = new Date(`${todayISTDateStr}T00:00:00.000+05:30`);
  const windowStart = new Date(todayMidnightIST.getTime() - 3 * 60 * 60 * 1000); // Yesterday 21:00 IST
  const windowEnd = new Date(todayMidnightIST.getTime() + (11 * 60 + 59) * 60 * 1000 + 59 * 1000); // Today 11:59:59 IST

  // 3. Find all active logged-in agents today
  const AgentAttendance = (await import('@/models/AgentAttendance')).default;
  const AgentSession = (await import('@/models/AgentSession')).default;

  const todayAttendances = await AgentAttendance.find({
    date: todayISTDateStr,
    $or: [
      { punchIn: { $exists: true, $ne: null } },
      { activeSeconds: { $gt: 0 } },
      { lastActiveAt: { $gte: todayMidnightIST } }
    ]
  }).lean();

  const activeAgentIds = new Set<string>();
  todayAttendances.forEach(att => {
    if (att.agentId) activeAgentIds.add(String(att.agentId));
  });

  const activeSessionsToday = await AgentSession.find({
    updatedAt: { $gte: todayMidnightIST }
  }).lean();
  activeSessionsToday.forEach(sess => {
    if (sess.agentId) activeAgentIds.add(String(sess.agentId));
  });

  const allAgents = await Agent.find({ isActive: true }).lean();
  if (allAgents.length === 0) {
    return { executed: false, reason: 'No active agents registered', totalReassigned: 0, reassignedLeads: [] };
  }

  // Eligible pool = agents who ARE logged in today (or all agents if no one logged in yet)
  let eligibleAgents = allAgents.filter(a => activeAgentIds.has(String(a._id)) || activeAgentIds.has(String(a.employee_id)));
  if (eligibleAgents.length === 0) {
    eligibleAgents = allAgents;
  }

  // 4. Find all candidate uncalled leads in the window
  const candidateLeads = await AgentLead.find({
    createdAt: { $gte: windowStart, $lte: windowEnd },
    disposition: 'new',
    history: { $size: 0 },
    isReassignedAtNoon: { $ne: true },
  });

  const reassignedList: any[] = [];

  for (const lead of candidateLeads) {
    const isCurrentAgentLogged = activeAgentIds.has(String(lead.agentId)) || 
      allAgents.some(a => (String(a._id) === String(lead.agentId) || a.name === lead.agentName) && activeAgentIds.has(String(a._id)));

    // If the assigned agent IS logged in today, keep the lead with them!
    if (isCurrentAgentLogged && activeAgentIds.size > 0) {
      continue;
    }

    // Lead belongs to an absent agent ➡️ Re-distribute to an active logged-in agent!
    const recipientPool = eligibleAgents.filter(a => String(a._id) !== String(lead.agentId) && a.name !== lead.agentName);
    const pool = recipientPool.length > 0 ? recipientPool : eligibleAgents;

    const agentScores = await Promise.all(
      pool.map(async (agentDoc) => {
        const { rank, weight } = getAgentWeightAndRank(agentDoc);
        const assignedCount = await AgentLead.countDocuments({
          $or: [{ agentId: String(agentDoc._id) }, { agentName: agentDoc.name }],
          createdAt: { $gte: todayMidnightIST },
        });

        const lastAssigned = agentDoc.lastAssignedLeadAt ? new Date(agentDoc.lastAssignedLeadAt).getTime() : 0;
        return {
          agent: agentDoc,
          rank,
          weight,
          assignedCount,
          score: assignedCount / weight,
          lastAssigned,
        };
      })
    );

    agentScores.sort((a, b) => {
      if (Math.abs(a.score - b.score) > 0.05) return a.score - b.score;
      return a.lastAssigned - b.lastAssigned;
    });

    const chosen = agentScores[0].agent;
    const oldAgentName = lead.agentName;

    // Update lead
    lead.agentId = String(chosen._id);
    lead.agentName = chosen.name;
    (lead as any).isReassignedAtNoon = true;
    (lead as any).reassignedFrom = oldAgentName;
    lead.notes = lead.notes 
      ? `${lead.notes} | [12 PM Reassignment]: Transferred from ${oldAgentName} (Absent/No Login) to ${chosen.name}`
      : `[12 PM Reassignment]: Transferred from ${oldAgentName} (Absent/No Login) to ${chosen.name}`;
    lead.updatedAt = new Date();

    await lead.save();
    await Agent.findByIdAndUpdate(chosen._id, { lastAssignedLeadAt: new Date() });

    reassignedList.push({
      leadId: lead._id,
      phone: lead.phone,
      from: oldAgentName,
      to: chosen.name,
      createdAt: lead.createdAt,
    });
  }

  return {
    executed: true,
    totalReassigned: reassignedList.length,
    reassignedLeads: reassignedList,
  };
}

