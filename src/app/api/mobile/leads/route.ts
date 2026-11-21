import { NextRequest, NextResponse } from 'next/server';
import mongoose from 'mongoose';
import { connectDB } from '@/lib/mongodb';
import AgentLead from '@/models/AgentLead';
import Agent from '@/models/Agent';
import { cleanProjectTitle } from '@/lib/lead-distributor';
import { verifyAgentToken } from '@/lib/agentAuth';

export const dynamic = 'force-dynamic';

// ✅ SECURITY FIX: CORS restricted to our own domain only (not public *)
const corsHeaders = {
  'Access-Control-Allow-Origin': 'https://www.ssrealty.org',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, PATCH, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Requested-With, Accept, x-agent-id, x-employee-id',
};

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: corsHeaders,
  });
}

function extractUnitType(requirement?: string, title?: string): string {
  const text = `${requirement || ''} ${title || ''}`;
  
  const match = requirement?.match(/Looking for:\s*([^,\n\r]+)/i);
  if (match && match[1]) {
    const val = match[1].trim();
    if (val.toUpperCase() === 'OTHER') return 'Special Inquiry';
    return val;
  }

  if (/5\s*bhk/i.test(text)) return '5 BHK';
  if (/4\s*bhk/i.test(text)) return '4 BHK';
  if (/3\s*bhk/i.test(text)) return '3 BHK';
  if (/2\s*bhk/i.test(text)) return '2 BHK';
  if (/1\s*bhk/i.test(text)) return '1 BHK';
  if (/penthouse/i.test(text)) return 'Penthouse';
  if (/plot|land/i.test(text)) return 'Residential Plot';
  if (/commercial|office|shop/i.test(text)) return 'Commercial';
  if (/villa|duplex/i.test(text)) return 'Luxury Villa';

  return '2/3/4 BHK';
}

function extractLocation(text?: string): string {
  if (!text) return 'Delhi NCR';
  const lower = text.toLowerCase();
  if (lower.includes('chattarpur')) return 'Chattarpur, Delhi';
  if (lower.includes('gwal pahari')) return 'Gwal Pahari, Gurgaon';
  if (lower.includes('mandi road')) return 'Mandi Road, Gurgaon';
  if (lower.includes('gurgaon') || lower.includes('gurugram')) return 'Gurgaon';
  if (lower.includes('delhi')) return 'South Delhi';
  if (lower.includes('noida')) return 'Noida';
  if (lower.includes('faridabad')) return 'Faridabad';
  return 'Delhi NCR';
}

function formatISTDateTime(dateObj: Date): { formattedDate: string; formattedTime: string; leadAge: string } {
  const istOffset = 5.5 * 60 * 60 * 1000;
  const istDate = new Date(dateObj.getTime() + istOffset);

  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const day = istDate.getUTCDate();
  const month = months[istDate.getUTCMonth()];
  const year = istDate.getUTCFullYear();

  let hours = istDate.getUTCHours();
  const minutes = istDate.getUTCMinutes().toString().padStart(2, '0');
  const ampm = hours >= 12 ? 'PM' : 'AM';
  hours = hours % 12;
  hours = hours ? hours : 12;
  const hoursStr = hours.toString().padStart(2, '0');

  const formattedDate = `${day} ${month} ${year}`;
  const formattedTime = `${hoursStr}:${minutes} ${ampm}`;

  const diffMs = Date.now() - dateObj.getTime();
  const diffMinutes = Math.floor(diffMs / (60 * 1000));
  const diffHours = Math.floor(diffMs / (60 * 60 * 1000));
  const diffDays = Math.floor(diffMs / (24 * 60 * 60 * 1000));

  let leadAge = 'Just now';
  if (diffMinutes < 1) {
    leadAge = 'Just now';
  } else if (diffMinutes < 60) {
    leadAge = `${diffMinutes}m ago`;
  } else if (diffHours < 24) {
    leadAge = `${diffHours}h ago`;
  } else if (diffDays === 1) {
    leadAge = 'Yesterday';
  } else if (diffDays < 30) {
    leadAge = `${diffDays}d ago`;
  } else {
    const diffMonths = Math.floor(diffDays / 30);
    leadAge = `${diffMonths}mo ago`;
  }

  return { formattedDate, formattedTime, leadAge };
}

function mapDispositionToStatus(disposition: string): string {
  switch (disposition) {
    case 'new': return 'newLead';
    case 'ringing': return 'attempted';
    case 'connected': return 'contacted';
    case 'not_connected':
    case 'switch_off':
    case 'not_reachable': return 'unreachable';
    case 'interested': return 'qualified';
    case 'not_interested': return 'lost';
    case 'visit_done': return 'visitCompleted';
    case 'follow_up': return 'followUp';
    default: return 'newLead';
  }
}

export async function GET(req: NextRequest) {
  try {
    // ✅ SECURITY: Mandatory authentication — no token = no data
    const auth = await verifyAgentToken(req);
    if (!auth.success) {
      return NextResponse.json(
        { success: false, error: auth.error || 'Unauthorized' },
        { status: 401, headers: corsHeaders }
      );
    }

    await connectDB();
    const { searchParams } = new URL(req.url);
    const filter = searchParams.get('filter');
    const search = searchParams.get('search')?.toLowerCase();

    // ✅ Agent resolved from verified session (auth.agentId is the MongoDB _id)
    const agentId = auth.agentId!;
    const agentDoc = auth.agent as any;

    const isExecutive =
      agentDoc?.role === 'director' ||
      agentDoc?.isExecutive === true ||
      agentDoc?.employee_id === 'SSR000' ||
      /yogesh/i.test(agentDoc?.name || '') ||
      agentDoc?.username === 'info@ssrealty.org';

    // ✅ Director/Executive sees ALL leads; agents see only their own
    let agentLeadsQuery: any = {};
    if (!isExecutive) {
      const employeeId = agentDoc?.employee_id;
      const agentName = agentDoc?.name;

      agentLeadsQuery = {
        $or: [
          { agentId: agentId },
          ...(employeeId ? [{ agentId: employeeId }] : []),
          ...(agentName ? [{ agentName: new RegExp(`^${agentName}$`, 'i') }] : []),
        ],
      };
    }

    const agentLeads = await AgentLead.find(agentLeadsQuery)
      .sort({ createdAt: -1 })
      .lean();

    const unifiedLeads: any[] = [];
    let newLeadsCount = 0;

    for (const al of agentLeads as any[]) {
      const status = mapDispositionToStatus(al.disposition);
      if (status === 'newLead' || al.disposition === 'new') {
        newLeadsCount++;
      }

      const isMeta = (al.source && al.source.toLowerCase().includes('meta')) || al.originalLeadType === 'meta_lead';
      const isBrochure = (al.source && al.source.toLowerCase().includes('brochure')) || al.originalLeadType === 'brochure';
      const isBlog = (al.source && al.source.toLowerCase().includes('blog'));

      const createdDateObj = al.createdAt ? new Date(al.createdAt) : new Date();
      const { formattedDate, formattedTime, leadAge } = formatISTDateTime(createdDateObj);
      const cleanProj = al.projectName || cleanProjectTitle(al.propertyInterest || al.sheetName || al.formName);
      const unitType = extractUnitType(al.configuration || al.propertyInterest);
      const location = extractLocation(al.propertyInterest || cleanProj);

      unifiedLeads.push({
        id: al._id.toString(),
        fullName: al.name && al.name !== 'Lead' ? al.name : `Lead ${al.phone}`,
        phone: al.phone,
        email: al.email || '',
        status: status,
        disposition: al.disposition || 'new',
        priority: 'high',
        assignedAgentName: al.agentName || 'Agent',
        assignedAgentId: al.agentId || '',
        source: al.source || (isMeta ? 'Meta Ads' : 'Website Enquiry'),
        platform: al.platform || (isMeta ? 'fb' : 'web'),
        createdAt: createdDateObj.toISOString(),
        formattedDate,
        formattedTime,
        leadAge,
        lastActivityAt: al.updatedAt ? new Date(al.updatedAt).toISOString() : createdDateObj.toISOString(),
        projectName: cleanProj,
        fullPropertyTitle: cleanProj,
        propertyInterest: al.propertyInterest || cleanProj,
        projectId: '',
        propertyType: unitType,
        unitType: unitType,
        location: location,
        planning: al.planning || '',
        visitTimeline: al.visitTimeline || '',
        budget: al.budget || '',
        configuration: al.configuration || unitType,
        sheetName: al.sheetName || '',
        formName: al.formName || '',
        campaignName: al.campaignName || '',
        isRead: al.isRead || false,
        notes: al.notes || '',
        tags: [
          isMeta ? 'meta-ads' : (isBrochure ? 'brochure' : (isBlog ? 'blog' : 'website')),
          status,
        ],
        followUpDate: al.followUpDate ? new Date(al.followUpDate).toISOString() : null,
        visitDetails: al.visitDetails || null,
        history: (al.history || []).map((h: any) => ({
          id: h._id?.toString() || `${al._id}_${h.calledAt}`,
          disposition: h.disposition,
          notes: h.notes || '',
          duration: h.duration && h.duration !== '0s' ? h.duration : (h.durationSeconds ? `${h.durationSeconds}s` : '0s'),
          durationSeconds: h.durationSeconds || 0,
          agentName: h.agentName || al.agentName || 'Agent',
          recordingUrl: h.recordingUrl || null,
          recordingPath: h.recordingPath || null,
          calledAt: h.calledAt ? new Date(h.calledAt).toISOString() : new Date().toISOString(),
        })),
      });
    }

    // Apply Filter
    let filteredLeads = unifiedLeads;
    if (filter && filter !== 'all') {
      if (filter === 'new' || filter === 'newLead') {
        filteredLeads = filteredLeads.filter((l) => l.status === 'newLead' || l.disposition === 'new');
      } else if (filter === 'meta') {
        filteredLeads = filteredLeads.filter((l) => l.tags.includes('meta-ads'));
      } else if (filter === 'brochure') {
        filteredLeads = filteredLeads.filter((l) => l.tags.includes('brochure'));
      } else if (filter === 'blog') {
        filteredLeads = filteredLeads.filter((l) => l.tags.includes('blog'));
      }
    }

    // Apply Search
    if (search) {
      filteredLeads = filteredLeads.filter((l) =>
        l.fullName.toLowerCase().includes(search) ||
        l.phone.includes(search) ||
        l.email.toLowerCase().includes(search) ||
        l.projectName.toLowerCase().includes(search) ||
        (l.planning && l.planning.toLowerCase().includes(search))
      );
    }

    return NextResponse.json({
      success: true,
      count: filteredLeads.length,
      totalCount: unifiedLeads.length,
      newLeadsCount,
      unreadCount: newLeadsCount,
      metrics: {
        total: unifiedLeads.length,
        newLeads: newLeadsCount,
        contacted: unifiedLeads.filter((l) => l.status === 'contacted').length,
        followUp: unifiedLeads.filter((l) => l.status === 'followUp').length,
      },
      data: filteredLeads,
      leads: filteredLeads,
    }, {
      headers: corsHeaders,
    });
  } catch (error: any) {
    console.error('Mobile Leads Fetch Error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to fetch leads' },
      { status: 500, headers: corsHeaders }
    );
  }
}
