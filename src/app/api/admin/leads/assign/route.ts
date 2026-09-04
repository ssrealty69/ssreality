import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import Agent from '@/models/Agent';
import AgentLead from '@/models/AgentLead';
import Contact from '@/models/Contact';
import PropertyEnquiry from '@/models/PropertyEnquiry';
import AiLead from '@/models/AiLead';

function checkAdminAuth(req: NextRequest): boolean {
  const token = req.cookies.get('admin_token')?.value;
  const secret = req.headers.get('x-admin-secret');
  return token === 'authenticated' || secret === process.env.ADMIN_SECRET;
}

export const dynamic = 'force-dynamic';

// POST: Assign leads to an agent
// Body: { agentId: string, leads: [{ id: string, type: 'contact' | 'property_enquiry' | 'ai_lead' }] }
export async function POST(req: NextRequest) {
  if (!checkAdminAuth(req)) {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { agentId, leads } = await req.json();

    if (!agentId || !leads?.length) {
      return NextResponse.json({ success: false, error: 'agentId aur leads required hain' }, { status: 400 });
    }

    await connectDB();
    const agent = await Agent.findById(agentId);
    if (!agent || !agent.isActive) {
      return NextResponse.json({ success: false, error: 'Agent not found or inactive' }, { status: 404 });
    }

    const createdLeads = [];
    const skipped = [];

    for (const lead of leads) {
      const { id, type } = lead;

      // 1. Fetch source document WITHOUT mutating
      let sourceDoc: any = null;
      if (type === 'contact') {
        sourceDoc = await Contact.findById(id).lean();
      } else if (type === 'property_enquiry') {
        sourceDoc = await PropertyEnquiry.findById(id).lean();
      } else if (type === 'ai_lead') {
        sourceDoc = await AiLead.findById(id).lean();
      }

      if (!sourceDoc) {
        skipped.push({ id, reason: 'Lead record not found' });
        continue;
      }

      // 2. Check if source lead already has an assigned agent
      if (sourceDoc.assignedAgentId) {
        skipped.push({ id, reason: `Already assigned to agent ID ${sourceDoc.assignedAgentId}` });
        continue;
      }

      // 3. Normalize 10-digit phone number
      const rawPhone = sourceDoc.phone || '';
      const cleanDigits = rawPhone.replace(/\D/g, '');
      const phone10 = cleanDigits.length >= 10 ? cleanDigits.slice(-10) : cleanDigits;

      // 4. Deep Anti-Duplicate Check across ALL agents:
      // If this lead ID or this phone number is already assigned to ANY agent, do not duplicate!
      const duplicateConditions: any[] = [
        { originalLeadId: id },
      ];
      if (phone10.length >= 10) {
        duplicateConditions.push({ phone: phone10 });
        duplicateConditions.push({ phone: { $regex: `${phone10}$` } });
      }

      const existing = await AgentLead.findOne({ $or: duplicateConditions }).lean();
      if (existing) {
        skipped.push({ id, reason: `Lead or phone is already assigned to agent ${existing.agentName}` });
        continue;
      }

      // 5. Create new AgentLead with clean 10-digit phone
      try {
        const newLead = await AgentLead.create({
          agentId: agent._id.toString(),
          agentName: agent.name,
          name: sourceDoc.name,
          phone: phone10 || rawPhone,
          email: sourceDoc.email || '',
          source: type,
          originalLeadId: id,
          originalLeadType: type,
          propertyInterest: (sourceDoc as any).propertyTitle || (sourceDoc as any).propertyType || '',
          disposition: 'new',
          history: [],
        });

        // 6. Mark source document as assigned only after successful AgentLead creation
        if (type === 'contact') {
          await Contact.findByIdAndUpdate(id, { assignedAgentId: agent._id.toString() });
        } else if (type === 'property_enquiry') {
          await PropertyEnquiry.findByIdAndUpdate(id, { assignedAgentId: agent._id.toString() });
        }

        createdLeads.push(newLead._id);
      } catch (insertErr: any) {
        if (insertErr.code === 11000) {
          skipped.push({ id, reason: 'Duplicate prevented: Lead already assigned to an agent' });
          continue;
        }
        throw insertErr;
      }
    }

    return NextResponse.json({
      success: true,
      message: `${createdLeads.length} lead(s) assigned to ${agent.name}`,
      assigned: createdLeads.length,
      skipped: skipped.length,
    });
  } catch (err: any) {
    console.error('Lead Assign Error:', err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
