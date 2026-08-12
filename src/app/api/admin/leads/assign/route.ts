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

      // Prevent duplicate assignment
      const existing = await AgentLead.findOne({ agentId, originalLeadId: id });
      if (existing) {
        skipped.push(id);
        continue;
      }

      let sourceDoc: any = null;
      if (type === 'contact') {
        sourceDoc = await Contact.findByIdAndUpdate(id, { assignedAgentId: agent._id.toString() }, { new: false }).lean();
      } else if (type === 'property_enquiry') {
        sourceDoc = await PropertyEnquiry.findById(id).lean();
      } else if (type === 'ai_lead') {
        sourceDoc = await AiLead.findById(id).lean();
      }

      if (!sourceDoc) {
        skipped.push(id);
        continue;
      }

      const newLead = await AgentLead.create({
        agentId: agent._id.toString(),
        agentName: agent.name,
        name: sourceDoc.name,
        phone: sourceDoc.phone,
        email: sourceDoc.email || '',
        source: type,
        originalLeadId: id,
        originalLeadType: type,
        propertyInterest: (sourceDoc as any).propertyTitle || (sourceDoc as any).propertyType || '',
        disposition: 'new',
        history: [],
      });

      createdLeads.push(newLead._id);
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
