import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import AgentLead from '@/models/AgentLead';
import Agent from '@/models/Agent';
import { getLocalDateRange } from '@/lib/dateUtils';

export const dynamic = 'force-dynamic';

function checkAdminAuth(req: NextRequest): boolean {
  const token = req.cookies.get('admin_token')?.value;
  const secret = req.headers.get('x-admin-secret');
  return token === 'authenticated' || secret === process.env.ADMIN_SECRET;
}

function formatDate(d: Date): string {
  if (!d || isNaN(d.getTime())) return '—';
  return d.toLocaleDateString('en-IN', { day: '2-digit', month: '2-digit', year: 'numeric', timeZone: 'Asia/Kolkata' });
}

function formatTime(d: Date): string {
  if (!d || isNaN(d.getTime())) return '—';
  return d.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true, timeZone: 'Asia/Kolkata' });
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
    visit_scheduled: 'Visit Scheduled',
    visitscheduled: 'Visit Scheduled',
    visit_done: 'Visit Done',
    follow_up: 'Follow Up',
    booked: 'Booked',
  };
  return map[disp.toLowerCase()] || disp.toUpperCase();
}

export async function GET(
  req: NextRequest,
  props: { params: Promise<{ agentId: string }> | { agentId: string } }
) {
  if (!checkAdminAuth(req)) {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
  }

  try {
    await connectDB();
    const resolvedParams = await Promise.resolve(props.params);
    const agentId = String(resolvedParams?.agentId || '');
    const { searchParams } = new URL(req.url);
    const disposition = searchParams.get('disposition') || 'all';
    const from = searchParams.get('from');
    const to = searchParams.get('to');

    if (!agentId) {
      return NextResponse.json({ success: false, error: 'Agent ID is required' }, { status: 400 });
    }

    let agent: any = null;
    if (agentId.match(/^[0-9a-fA-F]{24}$/)) {
      agent = await Agent.findById(agentId).lean();
    }
    if (!agent) {
      agent = await Agent.findOne({
        $or: [
          { employee_id: agentId },
          { employee_id: agentId.toUpperCase() },
          { username: agentId.toLowerCase() }
        ]
      }).lean();
    }

    if (!agent) {
      return NextResponse.json({ success: false, error: 'Agent not found' }, { status: 404 });
    }

    let startDate: Date | null = null;
    let endDate: Date | null = null;
    if (from && to) {
      const range = getLocalDateRange(from, to);
      startDate = range.start;
      endDate = range.end;
    }

    const agentObjId = (agent as any)._id.toString();
    const empId = (agent as any).employee_id || '';
    const agName = (agent as any).name || '';

    const agentMatchFilter = {
      $or: [
        { agentId: agentObjId },
        { agentId: empId },
        { agentName: new RegExp(`^${agName}$`, 'i') },
        { 'history.agentName': new RegExp(`^${agName}$`, 'i') },
      ],
    };

    const query: Record<string, any> = { ...agentMatchFilter };
    if (disposition === 'visit_scheduled') {
      query.$or = [
        { disposition: 'visit_scheduled' },
        { disposition: 'visitScheduled' },
        { 'visitDetails.date': { $exists: true, $ne: '' } },
        { disposition: 'follow_up', 'visitDetails.date': { $exists: true, $ne: '' } }
      ];
      query.disposition = { $nin: ['booked', 'not_interested', 'visit_done'] };
    } else if (disposition === 'visit_done') {
      query.disposition = 'visit_done';
    } else if (disposition !== 'all') {
      query.disposition = disposition;
    }

    const leads = (await AgentLead.find(query).sort({ updatedAt: -1 }).lean()) as any[];

    // Build Excel-ready rows with FULL details on EVERY row
    const rows: any[] = [];
    let sNo = 1;

    leads.forEach((lead: any) => {
      const historyInRange =
        startDate && endDate
          ? (lead.history || []).filter((h: any) => {
              const d = new Date(h.calledAt);
              return d >= startDate! && d <= endDate!;
            })
          : lead.history || [];

      let visitOrFollowup = '—';
      if (lead.visitDetails?.date) {
        visitOrFollowup = `Visit: ${lead.visitDetails.date} ${lead.visitDetails.time || ''}`.trim();
      } else if (lead.followUpDate) {
        visitOrFollowup = `Follow-up: ${formatDate(new Date(lead.followUpDate))}`;
      }

      if (historyInRange.length === 0) {
        rows.push({
          'S.No': sNo++,
          'Customer Name': lead.name || 'Unknown Contact',
          'Phone Number': lead.phone || '',
          'Email': lead.email || '—',
          'Property / Project': lead.propertyInterest || 'SS Realty Project',
          'Current Status': formatDisposition(lead.disposition),
          'Call Date': lead.history?.length
            ? formatDate(new Date(lead.history[lead.history.length - 1].calledAt))
            : formatDate(new Date(lead.createdAt)),
          'Call Time': lead.history?.length
            ? formatTime(new Date(lead.history[lead.history.length - 1].calledAt))
            : '—',
          'Call Outcome': formatDisposition(lead.disposition),
          'Duration': '0s',
          'Notes / Remarks': '(No calls in selected range)',
          'Visit / Follow-up': visitOrFollowup,
          'Total Calls Made': lead.history?.length || 0,
        });
      } else {
        historyInRange.forEach((h: any) => {
          const callDateObj = new Date(h.calledAt);
          const dur = h.duration || (h.durationSeconds ? `${h.durationSeconds}s` : '0s');

          rows.push({
            'S.No': sNo++,
            'Customer Name': lead.name || 'Unknown Contact',
            'Phone Number': lead.phone || '',
            'Email': lead.email || '—',
            'Property / Project': lead.propertyInterest || 'SS Realty Project',
            'Current Status': formatDisposition(lead.disposition),
            'Call Date': formatDate(callDateObj),
            'Call Time': formatTime(callDateObj),
            'Call Outcome': formatDisposition(h.disposition || lead.disposition),
            'Duration': dur,
            'Notes / Remarks': h.notes || '—',
            'Visit / Follow-up': visitOrFollowup,
            'Total Calls Made': lead.history?.length || 1,
          });
        });
      }
    });

    return NextResponse.json({ success: true, rows, agentName: agent.name });
  } catch (err: any) {
    console.error('Agent Excel Error:', err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
