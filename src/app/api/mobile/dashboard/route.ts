import { NextRequest, NextResponse } from 'next/server';
import mongoose from 'mongoose';
import { connectDB } from '@/lib/mongodb';
import Agent from '@/models/Agent';
import AgentLead from '@/models/AgentLead';
import AgentSession from '@/models/AgentSession';

export const dynamic = 'force-dynamic';

function getISTDateRange(period: string): { start: Date; end: Date } {
  const now = new Date();
  const istOffset = 5.5 * 60 * 60 * 1000;
  const istNow = new Date(now.getTime() + istOffset);
  const y = istNow.getUTCFullYear();
  const m = istNow.getUTCMonth();
  const d = istNow.getUTCDate();

  if (period === 'week') {
    // Start of week (Monday 00:00:00 IST)
    const day = istNow.getUTCDay(); // 0=Sun, 1=Mon, ..., 6=Sat
    const diff = day === 0 ? 6 : day - 1;
    const mondayDate = new Date(Date.UTC(y, m, d - diff, 0, 0, 0, 0));
    const start = new Date(mondayDate.getTime() - istOffset);
    const end = new Date(Date.UTC(y, m, d, 23, 59, 59, 999) - istOffset);
    return { start, end };
  } else if (period === 'month') {
    // Start of month (1st 00:00:00 IST)
    const startOfMonth = new Date(Date.UTC(y, m, 1, 0, 0, 0, 0));
    const start = new Date(startOfMonth.getTime() - istOffset);
    const end = new Date(Date.UTC(y, m, d, 23, 59, 59, 999) - istOffset);
    return { start, end };
  } else {
    // Today (00:00:00 IST to 23:59:59 IST)
    const startOfToday = new Date(Date.UTC(y, m, d, 0, 0, 0, 0));
    const start = new Date(startOfToday.getTime() - istOffset);
    const end = new Date(Date.UTC(y, m, d, 23, 59, 59, 999) - istOffset);
    return { start, end };
  }
}

const CONNECTED_DISPOSITIONS = [
  'connected',
  'interested',
  'visit_done',
  'follow_up',
  'callback',
  'closed',
  'negotiation',
  'visit_scheduled',
];

export async function GET(req: NextRequest) {
  try {
    await connectDB();
    const { searchParams } = new URL(req.url);
    const period = searchParams.get('period') || 'today';

    // 1. Resolve agent
    let agentId = searchParams.get('agentId');
    const authHeader = req.headers.get('authorization');
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.substring(7);
      const session = await AgentSession.findOne({ token }).lean();
      if (session && session.agentId) {
        agentId = session.agentId;
      }
    }

    if (!agentId) {
      return NextResponse.json(
        { success: false, error: 'agentId query param ya Bearer token required hai' },
        { status: 400 }
      );
    }

    const orClauses: any[] = [
      { employee_id: agentId.toUpperCase() },
      { username: agentId.toLowerCase() },
    ];
    if (mongoose.Types.ObjectId.isValid(agentId)) {
      orClauses.unshift({ _id: new mongoose.Types.ObjectId(agentId) });
    }

    const agent = await Agent.findOne({ $or: orClauses }).lean();

    const resolvedAgentId = agent ? String(agent._id) : agentId;
    const employeeId = agent ? (agent as any).employee_id : 'SSR001';
    const agentName = agent ? (agent as any).name : 'Agent';

    const { start, end } = getISTDateRange(period);

    // 2. Fetch leads belonging strictly to this agent
    const leadOrClauses: any[] = [
      { agentId: resolvedAgentId },
      { agentId: employeeId },
      { agentName: new RegExp(`^${agentName}$`, 'i') },
      { 'history.agentName': new RegExp(`^${agentName}$`, 'i') },
    ];

    const leads = await AgentLead.find({
      $or: leadOrClauses,
    }).lean();

    // 3. Compute Real-time Call Metrics strictly from calls made in date range
    let totalCalls = 0;
    let connectedCalls = 0;
    let missedCalls = 0;
    let manualCalls = 0;
    const uniquePhonesSet = new Set<string>();

    let interestedLeadsCount = 0;
    let scheduledVisitsCount = 0;
    let completedVisitsCount = 0;
    let pendingFollowups = 0;
    let completedFollowups = 0;

    let totalBookingAmountInRupees = 0;
    const bookingList: Array<{
      projectName: string;
      location: string;
      unitType: string;
      amount: string;
      downpayment: string;
      clientName: string;
      phone: string;
      date: string;
    }> = [];

    for (const lead of leads) {
      const isManualLead = lead.originalLeadType === 'manual' || lead.source === 'manual' || lead.name?.startsWith('Lead ') || !lead.originalLeadId;

      if (lead.disposition === 'interested') interestedLeadsCount++;
      if (lead.disposition === 'follow_up') pendingFollowups++;
      if (lead.disposition === 'visit_done') completedVisitsCount++;

      // Check visit scheduled
      if (lead.visitDetails && lead.visitDetails.date) {
        scheduledVisitsCount++;
      }

      // Check real bookings
      if (lead.bookingDetails && lead.bookingDetails.amount) {
        totalBookingAmountInRupees += lead.bookingDetails.amount;
        bookingList.push({
          projectName: lead.bookingDetails.projectName || lead.propertyInterest || 'SS Realty Project',
          location: lead.bookingDetails.location || 'Chattarpur, Delhi NCR',
          unitType: lead.bookingDetails.unitType || '3BHK Luxury Floor',
          amount: lead.bookingDetails.amountFormatted || `₹ ${(lead.bookingDetails.amount / 10000000).toFixed(2)} Cr`,
          downpayment: lead.bookingDetails.downpayment || '₹ 10 Lacs',
          clientName: lead.name,
          phone: lead.phone,
          date: lead.bookingDetails.bookedAt ? new Date(lead.bookingDetails.bookedAt).toLocaleDateString('en-IN') : 'Recent',
        });
      }

      // Process history call logs strictly in range
      if (Array.isArray(lead.history) && lead.history.length > 0) {
        for (const log of lead.history) {
          const calledAt = new Date(log.calledAt || (log as any).timestamp);
          if (calledAt >= start && calledAt <= end) {
            totalCalls++;
            if (lead.phone) uniquePhonesSet.add(lead.phone.replace(/[^0-9]/g, '').slice(-10));

            if (isManualLead) manualCalls++;

            const isConnected =
              CONNECTED_DISPOSITIONS.includes(log.disposition?.toLowerCase()) ||
              (log.durationSeconds && log.durationSeconds > 0) ||
              (log.duration && log.duration !== '0s');

            if (isConnected) {
              connectedCalls++;
            } else {
              missedCalls++;
            }

            if (log.disposition === 'follow_up') {
              completedFollowups++;
            }
          }
        }
      }
    }

    const uniqueCalls = uniquePhonesSet.size;
    const totalVisits = scheduledVisitsCount + completedVisitsCount;
    const conversions = bookingList.length;
    const totalBookingAmountCr = Number((totalBookingAmountInRupees / 10000000).toFixed(1));

    // 4. Generate 7-Day Call Volume Chart (Mon-Sun)
    const daysOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const nowIst = new Date(new Date().getTime() + 5.5 * 60 * 60 * 1000);
    const callsChart: Array<{ date: string; total: number; connected: number }> = [];

    for (let i = 6; i >= 0; i--) {
      const d = new Date(nowIst);
      d.setUTCDate(d.getUTCDate() - i);
      const dayName = daysOfWeek[d.getUTCDay()];

      const dayStart = new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate()) - 5.5 * 3600 * 1000);
      const dayEnd = new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate(), 23, 59, 59, 999) - 5.5 * 3600 * 1000);

      let dayTotal = 0;
      let dayConnected = 0;

      for (const lead of leads) {
        if (Array.isArray(lead.history)) {
          for (const log of lead.history) {
            const calledAt = new Date(log.calledAt || lead.updatedAt);
            if (calledAt >= dayStart && calledAt <= dayEnd) {
              dayTotal++;
              if (
                CONNECTED_DISPOSITIONS.includes(log.disposition?.toLowerCase()) ||
                (log.durationSeconds && log.durationSeconds > 0)
              ) {
                dayConnected++;
              }
            }
          }
        }
      }

      callsChart.push({
        date: dayName,
        total: dayTotal,
        connected: dayConnected,
      });
    }

    // 5. Generate Real Leaderboard across all Active Agents
    const allAgents = await Agent.find({ isActive: true }).lean();
    const leaderboardEntries = await Promise.all(
      allAgents.map(async (ag: any) => {
        const agLeads = await AgentLead.find({
          $or: [{ agentId: String(ag._id) }, { agentId: ag.employee_id }, { agentName: ag.name }],
        }).lean();

        let agCalls = 0;
        let agBookings = 0;
        let agAmount = 0;

        for (const l of agLeads) {
          if (Array.isArray(l.history)) {
            agCalls += l.history.length;
          }
          if (l.bookingDetails?.amount) {
            agBookings++;
            agAmount += l.bookingDetails.amount;
          }
        }

        return {
          agentId: ag._id.toString(),
          name: ag.name,
          agentName: ag.name,
          employeeId: ag.employee_id,
          calls: agCalls,
          connected: agCalls,
          bookings: agBookings,
          totalBookingAmount: Number((agAmount / 10000000).toFixed(1)),
        };
      })
    );

    // Sort by bookings then calls
    leaderboardEntries.sort((a, b) => b.bookings - a.bookings || b.calls - a.calls);
    const rankedLeaderboard = leaderboardEntries.map((entry, idx) => ({
      rank: idx + 1,
      ...entry,
    }));

    return NextResponse.json({
      success: true,
      data: {
        agent: {
          id: resolvedAgentId,
          name: agentName,
          employeeId: employeeId,
        },
        period,
        stats: {
          totalCalls,
          uniqueCalls,
          manualCalls,
          connectedCalls,
          missedCalls,
          interestedLeads: interestedLeadsCount,
          pendingFollowups,
          completedFollowups,
          scheduledVisits: scheduledVisitsCount,
          completedVisits: completedVisitsCount,
          totalVisits,
          conversions,
          totalBookingAmount: totalBookingAmountCr,
          callsChart,
        },
        bookings: bookingList,
        leaderboard: rankedLeaderboard,
      },
    });

  } catch (error: any) {
    console.error('Mobile Dashboard Stats Error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Internal Server Error' },
      { status: 500 }
    );
  }
}
