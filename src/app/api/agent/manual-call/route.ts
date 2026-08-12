import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import AgentLead from '@/models/AgentLead';
import { verifyAgentToken } from '@/lib/agentAuth';

export const dynamic = 'force-dynamic';

// POST: Log a manually dialled call
export async function POST(req: NextRequest) {
  const auth = await verifyAgentToken(req);
  if (!auth.success) {
    return NextResponse.json({ success: false, error: auth.error }, { status: 401 });
  }

  try {
    const body = await req.json();
    const { phone, name, disposition, notes, visitDetails, followUpDate, sharedProjectIds } = body;

    if (!phone) {
      return NextResponse.json({ success: false, error: 'Phone number required' }, { status: 400 });
    }

    await connectDB();

    // Check if lead already exists for this agent & phone
    let lead = await AgentLead.findOne({ agentId: auth.agentId, phone: phone.trim() });

    if (!lead) {
      lead = new AgentLead({
        agentId: auth.agentId,
        agentName: auth.agent!.name,
        name: name || 'Unknown',
        phone: phone.trim(),
        originalLeadType: 'manual',
        disposition: disposition || 'new',
      });
    }

    // Log the call
    if (disposition) {
      lead.history.push({ disposition, notes: notes || '', calledAt: new Date() });
      lead.disposition = disposition;
    }

    if (disposition === 'interested' && visitDetails) {
      lead.visitDetails = visitDetails;
    }
    if (followUpDate) lead.followUpDate = new Date(followUpDate);
    if (sharedProjectIds?.length) {
      lead.sharedProjectIds = [...new Set([...(lead.sharedProjectIds || []), ...sharedProjectIds])];
    }

    await lead.save();

    return NextResponse.json({ success: true, data: lead });
  } catch (err: any) {
    console.error('Manual Call Log Error:', err);
    return NextResponse.json({ success: false, error: 'Server error' }, { status: 500 });
  }
}
