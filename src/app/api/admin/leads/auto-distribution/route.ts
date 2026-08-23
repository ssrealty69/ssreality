import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import Setting from '@/models/Setting';
import Agent from '@/models/Agent';
import AgentLead from '@/models/AgentLead';
import MetaSheetLead from '@/models/MetaSheetLead';
import PropertyEnquiry from '@/models/PropertyEnquiry';
import Contact from '@/models/Contact';
import { 
  getAutoDistributionConfig, 
  setAutoDistributionEnabled, 
  bulkDistributeUnassignedLeads 
} from '@/lib/lead-distributor';

export const dynamic = 'force-dynamic';

function checkAdminAuth(req: NextRequest): boolean {
  const token = req.cookies.get('admin_token')?.value;
  const secret = req.headers.get('x-admin-secret');
  return token === 'authenticated' || secret === process.env.ADMIN_SECRET;
}

/**
 * GET: Fetch Auto-Distribution Status & Lead Pool Stats
 */
export async function GET(req: NextRequest) {
  if (!checkAdminAuth(req)) {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
  }

  try {
    await connectDB();
    const { enabled, enabledAt } = await getAutoDistributionConfig();
    const totalAssignedLeads = await AgentLead.countDocuments();
    const totalMetaLeads = await MetaSheetLead.countDocuments();
    const totalWebsiteEnquiries = await PropertyEnquiry.countDocuments();
    const totalContactLeads = await Contact.countDocuments();
    const activeAgentsCount = await Agent.countDocuments({ isActive: true, isReceivingLeads: { $ne: false } });

    return NextResponse.json({
      success: true,
      enabled,
      enabledAt: enabledAt ? enabledAt.toISOString() : null,
      stats: {
        totalAssignedLeads,
        totalMetaLeads,
        totalWebsiteLeads: totalWebsiteEnquiries + totalContactLeads,
        activeAgentsCount,
      },
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

/**
 * POST: Toggle Auto-Distribution ON / OFF and optionally trigger pending lead distribution
 */
export async function POST(req: NextRequest) {
  if (!checkAdminAuth(req)) {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await req.json();
    const enabled = Boolean(body.enabled);
    const triggerPending = Boolean(body.triggerPendingDistribution);

    await connectDB();
    await setAutoDistributionEnabled(enabled);

    let distributionResult = null;
    if (enabled && triggerPending) {
      distributionResult = await bulkDistributeUnassignedLeads();
    }

    const totalAssignedLeads = await AgentLead.countDocuments();

    return NextResponse.json({
      success: true,
      enabled,
      message: enabled
        ? 'Automatic Lead Distribution is now ACTIVE. Website & Meta leads will be automatically routed to agents.'
        : 'Automatic Lead Distribution is now PAUSED. Incoming leads will be saved safely without assigning to agents.',
      distributionResult,
      totalAssignedLeads,
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

/**
 * DELETE: Clear / Reset all assigned leads from all agents' IDs
 */
export async function DELETE(req: NextRequest) {
  if (!checkAdminAuth(req)) {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
  }

  try {
    await connectDB();
    const deleteRes = await AgentLead.deleteMany({});
    await Agent.updateMany({}, { $unset: { lastAssignedLeadAt: '' } });

    return NextResponse.json({
      success: true,
      deletedCount: deleteRes.deletedCount,
      message: `Successfully removed all ${deleteRes.deletedCount} assigned leads from all agent IDs. Everyone is now at 0 leads.`,
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
