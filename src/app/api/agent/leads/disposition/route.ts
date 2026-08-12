import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import AgentLead from '@/models/AgentLead';
import { verifyAgentToken } from '@/lib/agentAuth';

export const dynamic = 'force-dynamic';

// POST: Update lead disposition + optionally schedule visit
export async function POST(req: NextRequest) {
  const auth = await verifyAgentToken(req);
  if (!auth.success) {
    return NextResponse.json({ success: false, error: auth.error }, { status: 401 });
  }

  try {
    const body = await req.json();
    const { leadId, disposition, notes, visitDetails, followUpDate, sharedProjectIds } = body;

    if (!leadId || !disposition) {
      return NextResponse.json({ success: false, error: 'leadId aur disposition required hain' }, { status: 400 });
    }

    await connectDB();
    const lead = await AgentLead.findOne({ _id: leadId, agentId: auth.agentId });

    if (!lead) {
      return NextResponse.json({ success: false, error: 'Lead not found' }, { status: 404 });
    }

    // Add to call history
    lead.history.push({
      disposition,
      notes: notes || '',
      calledAt: new Date(),
    });

    // Update current disposition
    lead.disposition = disposition;

    // If interested — save visit details
    if (disposition === 'interested' && visitDetails) {
      lead.visitDetails = visitDetails; // { day, date, time }
    }

    // Follow-up date
    if (followUpDate) {
      lead.followUpDate = new Date(followUpDate);
    }

    // Shared project IDs (for tracking)
    if (sharedProjectIds && Array.isArray(sharedProjectIds)) {
      lead.sharedProjectIds = [...new Set([...(lead.sharedProjectIds || []), ...sharedProjectIds])];
    }

    await lead.save();

    return NextResponse.json({ success: true, data: lead });
  } catch (err: any) {
    console.error('Disposition Update Error:', err);
    return NextResponse.json({ success: false, error: 'Server error' }, { status: 500 });
  }
}
