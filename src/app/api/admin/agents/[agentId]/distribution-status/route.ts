import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import Agent from '@/models/Agent';

export const dynamic = 'force-dynamic';

function checkAdminAuth(req: NextRequest): boolean {
  const token = req.cookies.get('admin_token')?.value;
  const secret = req.headers.get('x-admin-secret');
  return token === 'authenticated' || secret === process.env.ADMIN_SECRET;
}

/**
 * PATCH: Toggle an agent's individual Lead Distribution status (Active vs On Leave / Absent)
 */
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ agentId: string }> }
) {
  if (!checkAdminAuth(req)) {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { agentId } = await params;
    const body = await req.json();
    const isReceivingLeads = Boolean(body.isReceivingLeads);

    await connectDB();

    const updatedAgent = await Agent.findByIdAndUpdate(
      agentId,
      { isReceivingLeads },
      { new: true }
    ).lean();

    if (!updatedAgent) {
      return NextResponse.json({ success: false, error: 'Agent not found' }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      agentId,
      name: updatedAgent.name,
      isReceivingLeads: updatedAgent.isReceivingLeads !== false,
      message: updatedAgent.isReceivingLeads !== false
        ? `${updatedAgent.name} is now ACTIVE in lead queue. Incoming leads will be assigned.`
        : `${updatedAgent.name} is now marked ON LEAVE / ABSENT. Leads will bypass this agent and route to other active agents.`,
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
