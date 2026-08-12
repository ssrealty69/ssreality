import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import AgentLead from '@/models/AgentLead';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  const token = req.cookies.get('admin_token')?.value;
  const role = req.cookies.get('admin_role')?.value;
  const agentId = req.cookies.get('admin_user_id')?.value;

  if (token !== 'authenticated' || role !== 'agent' || !agentId) {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await req.json();
    const { leadId, disposition, notes, visitDetails, followUpDate, sharedProjectIds } = body;

    if (!leadId || !disposition) {
      return NextResponse.json({ success: false, error: 'leadId and disposition are required' }, { status: 400 });
    }

    await connectDB();
    const lead = await AgentLead.findOne({ _id: leadId, agentId: agentId });

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
      lead.visitDetails = visitDetails;
    }

    // Follow-up date
    if (followUpDate) {
      lead.followUpDate = new Date(followUpDate);
    }

    // Shared project IDs
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
