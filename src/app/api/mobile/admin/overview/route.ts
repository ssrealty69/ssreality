import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import Agent from '@/models/Agent';
import AgentLead from '@/models/AgentLead';
import AgentAttendance from '@/models/AgentAttendance';
import AgentLocationLog from '@/models/AgentLocationLog';
import { getAutoDistributionConfig } from '@/lib/lead-distributor';
import { localToday, getLocalDateRange } from '@/lib/dateUtils';

export const dynamic = 'force-dynamic';

function formatDuration(seconds?: number): string {
  if (!seconds || seconds <= 0) return '0m';
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  if (h > 0) return `${h}h ${m}m`;
  return `${m}m`;
}

function formatTimeAgo(dateStr?: string | null): string {
  if (!dateStr) return 'Never';
  const diffMs = Date.now() - new Date(dateStr).getTime();
  const diffMins = Math.floor(diffMs / 60000);
  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  const diffHours = Math.floor(diffMins / 60);
  if (diffHours < 24) return `${diffHours}h ago`;
  return new Date(dateStr).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
}

// GET: Aggregated team overview, attendance, performance and live radar for Director/Admin
export async function GET(req: NextRequest) {
  try {
    await connectDB();

    const { searchParams } = new URL(req.url);
    const from = searchParams.get('from');
    const to = searchParams.get('to');
    const { start, end } = getLocalDateRange(from, to);
    const todayStr = localToday();

    // 1. Fetch only telecaller agents (exclude director / executive)
    const agents = await Agent.find({
      role: { $ne: 'director' },
      isExecutive: { $ne: true },
      employee_id: { $ne: 'SSR000' },
      name: { $not: /yogesh/i },
      username: { $ne: 'info@ssrealty.org' },
    })
      .select('name username phone employee_id isActive isReceivingLeads allowRemotePunchIn')
      .lean();

    const nowMs = Date.now();
    const ONLINE_THRESHOLD_MS = 3 * 60 * 1000; // 3 minutes

    // 2. Fetch master auto-assign config
    const { enabled: masterAutoAssignEnabled, enabledAt: masterAutoAssignEnabledAt } = await getAutoDistributionConfig();

    // 3. Process all telecallers in parallel
    const agentReports = await Promise.all(
      agents.map(async (agent: any) => {
        const agentId = agent._id.toString();
        const empId = agent.employee_id || '';
        const agName = agent.name || '';

        const allLeads = await AgentLead.find({
          $or: [
            { agentId },
            { agentId: empId },
            { agentName: new RegExp(`^${agName}$`, 'i') },
            { 'history.agentName': new RegExp(`^${agName}$`, 'i') },
          ],
        }).lean();

        let callsInRange = 0;
        let manualDialed = 0;
        allLeads.forEach((lead: any) => {
          if (lead.history) {
            const rangeHistory = lead.history.filter((h: any) => {
              const d = new Date(h.calledAt);
              return d >= start && d <= end;
            });
            callsInRange += rangeHistory.length;
            if (rangeHistory.length > 0) manualDialed += 1;
          }
        });

        const dispositionMap: Record<string, number> = {};
        allLeads.forEach((lead: any) => {
          dispositionMap[lead.disposition] = (dispositionMap[lead.disposition] || 0) + 1;
        });

        const assignedLeadsCount = allLeads.filter((l: any) => l.originalLeadType !== 'manual').length;
        const bookedCount = dispositionMap['booked'] || 0;
        const notInterestedCount = dispositionMap['not_interested'] || 0;
        const visitScheduledCount = (dispositionMap['visit_scheduled'] || 0) + (dispositionMap['visitScheduled'] || 0);
        const visitDoneCount = dispositionMap['visit_done'] || 0;

        // Today's attendance & screen time
        const agentAttMatch = {
          $or: [
            { agentId },
            { agentId: empId },
            { agentId: agent.username },
            { agentName: new RegExp(`^${agName}$`, 'i') },
          ].filter(Boolean),
        };

        const todayAtt: any = await AgentAttendance.findOne({
          $and: [agentAttMatch, { date: todayStr }],
        })
          .sort({ updatedAt: -1 })
          .lean();

        const isPunchedIn = Boolean(todayAtt?.punchIn && !todayAtt?.punchOut);
        const lastActive = todayAtt?.lastActiveAt ? new Date(todayAtt.lastActiveAt) : null;
        const isOnline = lastActive ? nowMs - lastActive.getTime() < ONLINE_THRESHOLD_MS : false;
        const todayActiveSecs = todayAtt?.activeSeconds || 0;

        // Latest GPS location today
        const lastLocation: any = await AgentLocationLog.findOne({
          $or: [
            { agentId },
            { agentId: empId },
            { agentName: new RegExp(`^${agName}$`, 'i') },
          ],
          date: todayStr,
        })
          .sort({ timestamp: -1 })
          .lean();

        const lastDistanceMeters = lastLocation?.distanceFromOfficeMeters;
        const lastDistanceKm = lastDistanceMeters !== undefined ? Number((lastDistanceMeters / 1000).toFixed(2)) : null;
        const lastDistanceFormatted = lastDistanceMeters !== undefined
          ? (lastDistanceMeters < 200 ? `Inside Office (${lastDistanceMeters}m)` : `${lastDistanceKm} km away`)
          : null;

        return {
          agentId,
          name: agent.name,
          username: agent.username,
          employee_id: agent.employee_id,
          phone: agent.phone || '',
          isActive: agent.isActive,
          isReceivingLeads: agent.isReceivingLeads !== false,
          isOnline,
          isPunchedIn,
          lastActiveAt: lastActive ? lastActive.toISOString() : null,
          lastActiveFormatted: formatTimeAgo(lastActive ? lastActive.toISOString() : null),
          lastDistanceKm,
          lastDistanceFormatted,
          lastLocationAddress: lastLocation?.address || null,
          lastLocationStatus: lastLocation?.status || (isOnline ? 'IN_OFFICE' : 'OFF_DUTY'),
          latitude: lastLocation?.latitude || null,
          longitude: lastLocation?.longitude || null,
          todayActiveSeconds: todayActiveSecs,
          todayActiveFormatted: formatDuration(todayActiveSecs),
          punchIn: todayAtt?.punchIn ? new Date(todayAtt.punchIn).toISOString() : null,
          punchOut: todayAtt?.punchOut ? new Date(todayAtt.punchOut).toISOString() : null,
          sessionCount: todayAtt?.sessionCount || 0,
          totalLeads: assignedLeadsCount,
          assigned: assignedLeadsCount,
          callsToday: callsInRange,
          manualDialed,
          notInterested: notInterestedCount,
          visitScheduled: visitScheduledCount,
          visitDone: visitDoneCount,
          booked: bookedCount,
          bookingDone: bookedCount,
          interested: dispositionMap['interested'] || 0,
          followUp: dispositionMap['follow_up'] || 0,
          connected: dispositionMap['connected'] || 0,
          notConnected: (dispositionMap['not_connected'] || 0) + (dispositionMap['switch_off'] || 0) + (dispositionMap['not_reachable'] || 0),
          newLeads: dispositionMap['new'] || 0,
        };
      })
    );

    // Sort by calls today / active state
    agentReports.sort((a, b) => (b.isOnline ? 1 : 0) - (a.isOnline ? 1 : 0) || b.callsToday - a.callsToday);

    // 4. Calculate Aggregate Totals
    const totals = agentReports.reduce(
      (acc, r) => ({
        totalAgents: acc.totalAgents + 1,
        onlineCount: acc.onlineCount + (r.isOnline ? 1 : 0),
        punchedInCount: acc.punchedInCount + (r.isPunchedIn ? 1 : 0),
        totalActiveSeconds: acc.totalActiveSeconds + r.todayActiveSeconds,
        assigned: acc.assigned + r.assigned,
        callsToday: acc.callsToday + r.callsToday,
        notInterested: acc.notInterested + r.notInterested,
        visitScheduled: acc.visitScheduled + r.visitScheduled,
        visitDone: acc.visitDone + r.visitDone,
        booked: acc.booked + r.booked,
      }),
      {
        totalAgents: 0,
        onlineCount: 0,
        punchedInCount: 0,
        totalActiveSeconds: 0,
        assigned: 0,
        callsToday: 0,
        notInterested: 0,
        visitScheduled: 0,
        visitDone: 0,
        booked: 0,
      }
    );

    const totalScreenTimeFormatted = formatDuration(totals.totalActiveSeconds);

    return NextResponse.json({
      success: true,
      masterAutoAssign: {
        enabled: masterAutoAssignEnabled,
        enabledAt: masterAutoAssignEnabledAt ? masterAutoAssignEnabledAt.toISOString() : null,
      },
      totals: {
        ...totals,
        totalScreenTimeFormatted,
      },
      agents: agentReports,
    });
  } catch (err: any) {
    console.error('Mobile Admin Overview Error:', err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
