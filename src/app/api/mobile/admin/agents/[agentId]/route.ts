import { NextRequest, NextResponse } from 'next/server';
import mongoose from 'mongoose';
import { connectDB } from '@/lib/mongodb';
import Agent from '@/models/Agent';
import AgentLead from '@/models/AgentLead';
import AgentAttendance from '@/models/AgentAttendance';
import AgentLocationLog from '@/models/AgentLocationLog';
import { localToday, getLocalDateRange } from '@/lib/dateUtils';

export const dynamic = 'force-dynamic';

function formatDuration(seconds?: number): string {
  if (!seconds || seconds <= 0) return '0m';
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  if (h > 0) return `${h}h ${m}m`;
  return `${m}m`;
}

// GET: Complete drilldown for a single agent (calls, leads, attendance, location)
export async function GET(
  req: NextRequest,
  props: { params: Promise<{ agentId: string }> }
) {
  try {
    await connectDB();
    const resolvedParams = await Promise.resolve(props.params);
    const rawAgentId = String(resolvedParams?.agentId || '');

    if (!rawAgentId) {
      return NextResponse.json({ success: false, error: 'agentId required' }, { status: 400 });
    }

    const { searchParams } = new URL(req.url);
    const from = searchParams.get('from');
    const to = searchParams.get('to');
    const { start, end } = getLocalDateRange(from, to);
    const todayStr = localToday();

    // 1. Resolve agent
    let agent: any = null;
    if (mongoose.Types.ObjectId.isValid(rawAgentId)) {
      agent = await Agent.findById(rawAgentId).lean();
    }
    if (!agent) {
      agent = await Agent.findOne({
        $or: [
          { employee_id: rawAgentId },
          { employee_id: rawAgentId.toUpperCase() },
          { username: rawAgentId.toLowerCase() },
          { name: new RegExp(`^${rawAgentId}$`, 'i') },
        ],
      }).lean();
    }

    if (!agent) {
      return NextResponse.json({ success: false, error: 'Agent not found' }, { status: 404 });
    }

    const agentId = agent._id.toString();
    const empId = agent.employee_id || '';
    const agName = agent.name || '';

    // 2. Fetch all leads & calls for this agent
    const leads = await AgentLead.find({
      $or: [
        { agentId },
        { agentId: empId },
        { agentName: new RegExp(`^${agName}$`, 'i') },
        { 'history.agentName': new RegExp(`^${agName}$`, 'i') },
      ],
    })
      .sort({ updatedAt: -1 })
      .lean();

    // Extract call history across all leads
    const allCalls: any[] = [];
    let callsInRange = 0;
    const dispositionMap: Record<string, number> = {};

    leads.forEach((lead: any) => {
      dispositionMap[lead.disposition] = (dispositionMap[lead.disposition] || 0) + 1;
      if (lead.history && Array.isArray(lead.history)) {
        lead.history.forEach((h: any) => {
          const callDate = new Date(h.calledAt);
          if (callDate >= start && callDate <= end) {
            callsInRange += 1;
          }
          allCalls.push({
            leadId: lead._id.toString(),
            customerName: lead.name || 'Unknown',
            customerPhone: lead.phone,
            propertyInterest: lead.propertyInterest || lead.projectName || '',
            disposition: h.disposition,
            notes: h.notes || '',
            calledAt: h.calledAt,
            duration: h.duration || '',
            durationSeconds: h.durationSeconds || 0,
            recordingUrl: h.recordingUrl || null,
          });
        });
      }
    });

    // Sort calls newest first
    allCalls.sort((a, b) => new Date(b.calledAt).getTime() - new Date(a.calledAt).getTime());

    // 3. Attendance records
    const attendanceRecords = await AgentAttendance.find({
      $or: [
        { agentId },
        { agentId: empId },
        { agentId: agent.username },
        { agentName: new RegExp(`^${agName}$`, 'i') },
      ],
    })
      .sort({ date: -1 })
      .limit(31)
      .lean();

    const todayAtt = attendanceRecords.find((a: any) => a.date === todayStr);

    // 4. Latest Location Log
    const latestLocation = await AgentLocationLog.findOne({
      $or: [
        { agentId },
        { agentId: empId },
        { agentName: new RegExp(`^${agName}$`, 'i') },
      ],
      date: todayStr,
    })
      .sort({ timestamp: -1 })
      .lean();

    return NextResponse.json({
      success: true,
      agent: {
        id: agentId,
        name: agent.name,
        username: agent.username,
        employee_id: agent.employee_id,
        phone: agent.phone || '',
        isActive: agent.isActive,
        isReceivingLeads: agent.isReceivingLeads !== false,
      },
      stats: {
        assignedLeads: leads.filter((l: any) => l.originalLeadType !== 'manual').length,
        totalCalls: callsInRange,
        notInterested: dispositionMap['not_interested'] || 0,
        visitScheduled: (dispositionMap['visit_scheduled'] || 0) + (dispositionMap['visitScheduled'] || 0),
        visitDone: dispositionMap['visit_done'] || 0,
        booked: dispositionMap['booked'] || 0,
        todayActiveSeconds: todayAtt?.activeSeconds || 0,
        todayActiveFormatted: formatDuration(todayAtt?.activeSeconds || 0),
        punchIn: todayAtt?.punchIn ? new Date(todayAtt.punchIn).toISOString() : null,
        punchOut: todayAtt?.punchOut ? new Date(todayAtt.punchOut).toISOString() : null,
      },
      location: latestLocation ? {
        latitude: latestLocation.latitude,
        longitude: latestLocation.longitude,
        status: latestLocation.status,
        distanceMeters: latestLocation.distanceFromOfficeMeters,
        address: latestLocation.address || null,
        timestamp: latestLocation.timestamp,
      } : null,
      recentCalls: allCalls.slice(0, 100),
      leads: leads.slice(0, 50),
      attendance: attendanceRecords.map((att: any) => ({
        date: att.date,
        punchIn: att.punchIn ? new Date(att.punchIn).toISOString() : null,
        punchOut: att.punchOut ? new Date(att.punchOut).toISOString() : null,
        totalMinutes: att.totalMinutes || 0,
        activeSeconds: att.activeSeconds || 0,
        activeFormatted: formatDuration(att.activeSeconds || 0),
        sessionCount: att.sessionCount || 0,
      })),
    });
  } catch (err: any) {
    console.error('Mobile Admin Agent Detail Error:', err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
