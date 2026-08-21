import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import Agent from '@/models/Agent';
import AgentLead from '@/models/AgentLead';
import AgentAttendance from '@/models/AgentAttendance';
import { getLocalDateRange } from '@/lib/dateUtils';

export const dynamic = 'force-dynamic';

function checkAdminAuth(req: NextRequest): boolean {
  const token = req.cookies.get('admin_token')?.value;
  const secret = req.headers.get('x-admin-secret');
  return token === 'authenticated' || secret === process.env.ADMIN_SECRET;
}

function formatDate(d: Date): string {
  if (!d || isNaN(d.getTime())) return '—';
  return d.toLocaleDateString('en-IN', { day: '2-digit', month: '2-digit', year: 'numeric' });
}

function formatTime(d: Date): string {
  if (!d || isNaN(d.getTime())) return '—';
  return d.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true });
}

function formatDateTime(d: Date): string {
  if (!d || isNaN(d.getTime())) return '—';
  return `${formatDate(d)} ${formatTime(d)}`;
}

function formatDisposition(disp?: string): string {
  if (!disp) return 'New';
  const map: Record<string, string> = {
    new: 'New (Uncalled)',
    ringing: 'Ringing',
    connected: 'Connected',
    not_connected: 'Not Connected / Busy',
    switch_off: 'Switch Off',
    not_reachable: 'Not Reachable',
    interested: 'Interested',
    not_interested: 'Not Interested',
    visit_done: 'Visit Done',
    follow_up: 'Follow Up / Visit Scheduled',
  };
  return map[disp.toLowerCase()] || disp.toUpperCase();
}

function formatMinutes(mins?: number): string {
  if (!mins || mins <= 0) return '0m';
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  return h > 0 ? `${h}h ${m}m` : `${m}m`;
}

export async function GET(req: NextRequest) {
  if (!checkAdminAuth(req)) {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
  }

  try {
    await connectDB();
    const { searchParams } = new URL(req.url);
    const from = searchParams.get('from');
    const to = searchParams.get('to');
    const type = searchParams.get('type') || 'summary'; // 'summary' | 'calls' | 'disposition' | 'attendance'
    const disposition = searchParams.get('disposition'); // for type === 'disposition'

    let startDate: Date | null = null;
    let endDate: Date | null = null;
    if (from && to) {
      const range = getLocalDateRange(from, to);
      startDate = range.start;
      endDate = range.end;
    }

    // Pre-fetch all agents for name/id lookup mapping
    const agents = (await Agent.find({}).lean()) as any[];
    const agentMap = new Map<string, any>();
    agents.forEach((ag) => {
      agentMap.set(ag._id.toString(), ag);
      if (ag.employee_id) agentMap.set(ag.employee_id, ag);
      if (ag.username) agentMap.set(ag.username, ag);
    });

    // ──────────────────────────────────────────────────────────────────────────
    // 1. TEAM SUMMARY REPORT
    // ──────────────────────────────────────────────────────────────────────────
    if (type === 'summary') {
      const rows: any[] = [];
      for (const agent of agents) {
        const agentId = agent._id.toString();
        const allLeads = (await AgentLead.find({
          $or: [
            { agentId },
            { agentId: agent.employee_id },
            { agentName: new RegExp(`^${agent.name}$`, 'i') },
            { 'history.agentName': new RegExp(`^${agent.name}$`, 'i') },
          ],
        }).lean()) as any[];

        let callsInRange = 0;
        let manualDialed = 0;
        const dispositionMap: Record<string, number> = {};

        allLeads.forEach((lead: any) => {
          dispositionMap[lead.disposition] = (dispositionMap[lead.disposition] || 0) + 1;
          if (lead.history && lead.history.length > 0) {
            const rangeHistory =
              startDate && endDate
                ? lead.history.filter((h: any) => {
                    const d = new Date(h.calledAt);
                    return d >= startDate! && d <= endDate!;
                  })
                : lead.history;

            callsInRange += rangeHistory.length;
            if (rangeHistory.length > 0) manualDialed += 1;
          }
        });

        rows.push({
          'Agent Name': agent.name,
          'Employee ID': agent.employee_id || agent.username || '—',
          'Status': agent.isActive ? 'Active' : 'Inactive',
          'Total Leads Assigned': allLeads.length,
          'Manual Numbers Dialed': manualDialed,
          'Total Calls Made': callsInRange,
          'Interested': dispositionMap['interested'] || 0,
          'Visit Done': dispositionMap['visit_done'] || 0,
          'Follow-up / Scheduled': dispositionMap['follow_up'] || 0,
          'Not Interested': dispositionMap['not_interested'] || 0,
          'Connected': dispositionMap['connected'] || 0,
          'Not Connected / Busy':
            (dispositionMap['not_connected'] || 0) +
            (dispositionMap['switch_off'] || 0) +
            (dispositionMap['not_reachable'] || 0),
          'New (Uncalled)': dispositionMap['new'] || 0,
        });
      }

      return NextResponse.json({ success: true, rows });
    }

    // ──────────────────────────────────────────────────────────────────────────
    // 2. FULL HISTORY (MASTER DUMP OF ALL CALLS & DISPOSITIONS)
    // ──────────────────────────────────────────────────────────────────────────
    if (type === 'calls' || type === 'all') {
      // Query all agent leads
      const allLeads = (await AgentLead.find({}).sort({ updatedAt: -1 }).lean()) as any[];
      const rows: any[] = [];
      let sNo = 1;

      for (const lead of allLeads) {
        const leadAgent = agentMap.get(lead.agentId) || null;
        const agentDisplayName = lead.agentName || leadAgent?.name || 'Agent';

        // Filter history by date range if provided
        const historyInRange =
          startDate && endDate
            ? (lead.history || []).filter((h: any) => {
                const d = new Date(h.calledAt);
                return d >= startDate! && d <= endDate!;
              })
            : lead.history || [];

        if (historyInRange.length === 0) {
          // If no calls in range, but date range wasn't strict or lead was updated in range, output the lead record
          if (!startDate && !endDate) {
            rows.push({
              'S.No': sNo++,
              'Customer Name': lead.name || 'Unknown Lead',
              'Phone Number': lead.phone || '',
              'Employee / Agent': agentDisplayName,
              'Call Date': formatDate(new Date(lead.createdAt || lead.updatedAt)),
              'Call Time': formatTime(new Date(lead.createdAt || lead.updatedAt)),
              'Disposition / Status': formatDisposition(lead.disposition),
              'Duration': '0s',
              'Notes / Remarks': 'New / Not Called Yet',
              'Property Interest': lead.propertyInterest || 'SS Realty Project',
              'Lead Source': lead.source || lead.originalLeadType || 'Manual Dial',
              'Visit / Follow-up Details': lead.followUpDate
                ? `Follow-up: ${formatDate(new Date(lead.followUpDate))}`
                : lead.visitDetails?.date
                ? `Visit: ${lead.visitDetails.date} (${lead.visitDetails.time || ''})`
                : '—',
              'Recording URL': '—',
              'Total Calls Made': 0,
            });
          }
        } else {
          // Every single call log has FULL customer name, phone, agent, duration, disposition, notes!
          historyInRange.forEach((h: any) => {
            const callDateObj = new Date(h.calledAt);
            const dur = h.duration || (h.durationSeconds ? `${h.durationSeconds}s` : '0s');

            let visitOrFollowup = '—';
            if (lead.visitDetails?.date) {
              visitOrFollowup = `Visit: ${lead.visitDetails.date} ${lead.visitDetails.time || ''}`.trim();
            } else if (lead.followUpDate) {
              visitOrFollowup = `Follow-up: ${formatDate(new Date(lead.followUpDate))}`;
            }

            rows.push({
              'S.No': sNo++,
              'Customer Name': lead.name || 'Unknown Contact',
              'Phone Number': lead.phone || '',
              'Employee / Agent': h.agentName || agentDisplayName,
              'Call Date': formatDate(callDateObj),
              'Call Time': formatTime(callDateObj),
              'Disposition / Status': formatDisposition(h.disposition || lead.disposition),
              'Duration': dur,
              'Notes / Remarks': h.notes || '—',
              'Property Interest': lead.propertyInterest || 'SS Realty Project',
              'Lead Source': lead.source || lead.originalLeadType || 'Manual Dial',
              'Visit / Follow-up Details': visitOrFollowup,
              'Recording URL': h.recordingUrl || '—',
              'Total Calls Made': lead.history?.length || 1,
            });
          });
        }
      }

      return NextResponse.json({ success: true, rows });
    }

    // ──────────────────────────────────────────────────────────────────────────
    // 3. SPECIFIC DISPOSITION DOWNLOAD (e.g. Interested, Visit Done, Follow Up, Not Interested)
    // ──────────────────────────────────────────────────────────────────────────
    if (type === 'disposition' && disposition) {
      const query: Record<string, any> = { disposition };
      const matchingLeads = (await AgentLead.find(query).sort({ updatedAt: -1 }).lean()) as any[];
      const rows: any[] = [];
      let sNo = 1;

      for (const lead of matchingLeads) {
        const leadAgent = agentMap.get(lead.agentId) || null;
        const agentDisplayName = lead.agentName || leadAgent?.name || 'Agent';

        // Check if there are calls in range
        const historyInRange =
          startDate && endDate
            ? (lead.history || []).filter((h: any) => {
                const d = new Date(h.calledAt);
                return d >= startDate! && d <= endDate!;
              })
            : lead.history || [];

        // Pick latest call or details
        const latestCall = lead.history?.length ? lead.history[lead.history.length - 1] : null;
        const lastCallDate = latestCall ? new Date(latestCall.calledAt) : new Date(lead.updatedAt || lead.createdAt);
        const lastCallDuration = latestCall?.duration || (latestCall?.durationSeconds ? `${latestCall.durationSeconds}s` : '0s');

        let visitOrFollowup = '—';
        if (lead.visitDetails?.date) {
          visitOrFollowup = `Visit: ${lead.visitDetails.date} ${lead.visitDetails.time || ''}`.trim();
        } else if (lead.followUpDate) {
          visitOrFollowup = `Follow-up: ${formatDate(new Date(lead.followUpDate))}`;
        }

        // Collect all call notes
        const allNotes = (lead.history || [])
          .map((h: any) => h.notes)
          .filter(Boolean)
          .join(' | ') || (latestCall?.notes || '—');

        rows.push({
          'S.No': sNo++,
          'Customer Name': lead.name || 'Unknown Contact',
          'Phone Number': lead.phone || '',
          'Employee / Agent': agentDisplayName,
          'Current Disposition': formatDisposition(lead.disposition),
          'Visit / Follow-up Date': visitOrFollowup,
          'Property / Project': lead.propertyInterest || 'SS Realty Project',
          'Total Calls': lead.history?.length || 0,
          'Last Call Date': formatDate(lastCallDate),
          'Last Call Time': formatTime(lastCallDate),
          'Last Duration': lastCallDuration,
          'Notes / Remarks': allNotes,
          'Lead Source': lead.source || lead.originalLeadType || 'Manual Dial',
          'Recording URL': latestCall?.recordingUrl || '—',
        });
      }

      return NextResponse.json({ success: true, rows });
    }

    // ──────────────────────────────────────────────────────────────────────────
    // 4. ATTENDANCE & SCREEN TIME REPORT (ALL AGENTS)
    // ──────────────────────────────────────────────────────────────────────────
    if (type === 'attendance') {
      const query: Record<string, any> = {};
      if (from && to) {
        query.date = { $gte: from, $lte: to };
      }
      const attendanceLogs = (await AgentAttendance.find(query).sort({ date: -1 }).lean()) as any[];
      const rows: any[] = [];
      let sNo = 1;

      for (const log of attendanceLogs) {
        const ag = agentMap.get(log.agentId) || null;
        rows.push({
          'S.No': sNo++,
          'Agent Name': log.agentName || ag?.name || 'Agent',
          'Employee ID': ag?.employee_id || ag?.username || '—',
          'Date': log.date,
          'Status': log.status === 'present' ? 'Present' : log.status === 'off' ? 'Day Off' : 'Absent',
          'App Screen Time': log.activeFormatted || formatMinutes(Math.round((log.activeSeconds || 0) / 60)),
          'Punch In Time': log.punchIn ? formatDateTime(new Date(log.punchIn)) : '—',
          'Punch Out Time': log.punchOut ? formatDateTime(new Date(log.punchOut)) : '—',
          'Working Duration': formatMinutes(log.totalMinutes || 0),
          'App Sessions Count': log.sessionCount || 1,
        });
      }

      return NextResponse.json({ success: true, rows });
    }

    return NextResponse.json({ success: false, error: 'Invalid report type requested' }, { status: 400 });
  } catch (err: any) {
    console.error('Master Excel Generation Error:', err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
