import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import PropertyEnquiry from '@/models/PropertyEnquiry';
import Contact from '@/models/Contact';
import AgentLead from '@/models/AgentLead';

export const dynamic = 'force-dynamic';

function extractProjectName(title?: string, requirement?: string, fallback = 'SS Realty Project'): string {
  const combined = `${title || ''} ${requirement || ''}`.toLowerCase();
  
  if (combined.includes('velora')) return 'Velora';
  if (combined.includes('orchid')) return 'Orchid';
  if (combined.includes('amaryllis')) return 'Amaryllis';
  if (combined.includes('nivasa')) return 'The Nivasa III';
  if (combined.includes('ss 100') || combined.includes('sector 100')) return 'SS 100';
  if (combined.includes('the leaf') || combined.includes('leaf')) return 'SS The Leaf';
  if (combined.includes('camellias')) return 'SS Camellias';

  if (title) {
    // Try extracting "in ProjectName," e.g. "Apartments in Velora, Chattarpur"
    const match = title.match(/in\s+([^,]+)/i);
    if (match && match[1]) {
      const p = match[1].trim();
      if (p.length > 2 && p.length < 30) return p;
    }
    return title.split(',')[0].trim();
  }

  return fallback;
}

function extractUnitType(requirement?: string, title?: string): string {
  const text = `${requirement || ''} ${title || ''}`;
  
  // 1. Check exact "Looking for: <Type>"
  const match = requirement?.match(/Looking for:\s*([^,\n\r]+)/i);
  if (match && match[1]) {
    const val = match[1].trim();
    if (val.toUpperCase() === 'OTHER') return 'Special Inquiry';
    return val;
  }

  // 2. Regex search for BHK / Plot
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
  hours = hours ? hours : 12; // hour '0' should be '12'
  const hoursStr = hours.toString().padStart(2, '0');

  const formattedDate = `${day} ${month} ${year}`;
  const formattedTime = `${hoursStr}:${minutes} ${ampm}`;

  // Calculate Lead Age (time difference from now)
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
    await connectDB();
    const { searchParams } = new URL(req.url);
    const filter = searchParams.get('filter'); // 'all', 'brochure', 'blog', 'contact', 'meta'
    const search = searchParams.get('search')?.toLowerCase();

    // 1. Fetch Property Enquiries (Brochures + Blog Enquiries + Meta Leads)
    const propertyEnquiries = await PropertyEnquiry.find({})
      .sort({ createdAt: -1 })
      .lean();

    // 2. Fetch General Contact Leads
    const contacts = await Contact.find({})
      .sort({ createdAt: -1 })
      .lean();

    // 3. Fetch Agent Leads (Manual Calls + Call Histories)
    const agentLeads = await AgentLead.find({}).sort({ updatedAt: -1 }).lean();
    const agentLeadMap = new Map<string, any>();
    const processedPhones = new Set<string>();

    agentLeads.forEach((al: any) => {
      if (al.originalLeadId) {
        agentLeadMap.set(al.originalLeadId.toString(), al);
      }
      if (al.phone) {
        const clean = al.phone.replace(/[^0-9]/g, '');
        if (clean) {
          agentLeadMap.set(clean.slice(-10), al);
        }
      }
    });

    const unifiedLeads: any[] = [];

    // Map Property Enquiries
    for (const enq of propertyEnquiries as any[]) {
      const cleanPhone = (enq.phone || '').replace(/[^0-9]/g, '');
      const searchKey = cleanPhone.slice(-10);
      if (searchKey) processedPhones.add(searchKey);

      const existingAgentLead = agentLeadMap.get(enq._id.toString()) || (searchKey ? agentLeadMap.get(searchKey) : null);

      const isBrochure = enq.isBrochureDownload === true || (enq.requirement && enq.requirement.includes('Brochure'));
      const isMeta = enq.source === 'Meta Lead Ads' || enq.source === 'Facebook Ad';
      const leadSource = isMeta ? 'Meta Lead Ads' : (isBrochure ? 'Brochure Download' : (enq.source || 'Website Enquiry'));

      let status = 'newLead';
      let priority = 'high';
      let history: any[] = [];
      let followUpDate: string | null = null;
      let visitDetails: any = null;

      if (existingAgentLead) {
        status = mapDispositionToStatus(existingAgentLead.disposition);
        history = existingAgentLead.history || [];
        followUpDate = existingAgentLead.followUpDate ? new Date(existingAgentLead.followUpDate).toISOString() : null;
        visitDetails = existingAgentLead.visitDetails || null;
      } else if (enq.status === 'contacted') {
        status = 'contacted';
      }

      const createdDateObj = enq.createdAt ? new Date(enq.createdAt) : new Date();
      const { formattedDate, formattedTime, leadAge } = formatISTDateTime(createdDateObj);
      const cleanProj = extractProjectName(enq.propertyTitle, enq.requirement);
      const unitType = extractUnitType(enq.requirement, enq.propertyTitle);
      const location = extractLocation(enq.propertyTitle);

      unifiedLeads.push({
        id: enq._id.toString(),
        fullName: enq.name || 'Website Lead',
        phone: enq.phone,
        email: enq.email || '',
        status: status,
        priority: priority,
        source: leadSource,
        createdAt: createdDateObj.toISOString(),
        formattedDate,
        formattedTime,
        leadAge,
        lastActivityAt: enq.updatedAt ? new Date(enq.updatedAt).toISOString() : createdDateObj.toISOString(),
        projectName: cleanProj,
        fullPropertyTitle: enq.propertyTitle || cleanProj,
        projectId: enq.propertyId || '',
        propertyType: unitType,
        unitType: unitType,
        location: location,
        notes: enq.requirement || '',
        tags: [isMeta ? 'meta-lead' : (isBrochure ? 'brochure' : 'website-enquiry'), 'website'],
        followUpDate,
        visitDetails,
        history: history.map((h: any) => ({
          id: h._id?.toString() || `${enq._id}_${h.calledAt}`,
          disposition: h.disposition,
          notes: h.notes || '',
          duration: h.duration && h.duration !== '0s' ? h.duration : (h.durationSeconds ? `${h.durationSeconds}s` : '0s'),
          durationSeconds: h.durationSeconds || 0,
          agentName: h.agentName || existingAgentLead?.agentName || 'Agent',
          recordingUrl: h.recordingUrl || null,
          recordingPath: h.recordingPath || null,
          calledAt: h.calledAt ? new Date(h.calledAt).toISOString() : new Date().toISOString(),
        })),
      });
    }

    // Map General Contacts
    for (const c of contacts as any[]) {
      const cleanPhone = (c.phone || '').replace(/[^0-9]/g, '');
      const searchKey = cleanPhone.slice(-10);
      if (searchKey) processedPhones.add(searchKey);

      const existingAgentLead = agentLeadMap.get(c._id.toString()) || (searchKey ? agentLeadMap.get(searchKey) : null);

      let status = 'newLead';
      let history: any[] = [];
      let followUpDate: string | null = null;
      let visitDetails: any = null;

      if (existingAgentLead) {
        status = mapDispositionToStatus(existingAgentLead.disposition);
        history = existingAgentLead.history || [];
        followUpDate = existingAgentLead.followUpDate ? new Date(existingAgentLead.followUpDate).toISOString() : null;
        visitDetails = existingAgentLead.visitDetails || null;
      } else if (c.status === 'read' || c.status === 'replied') {
        status = 'contacted';
      }

      const createdDateObj = c.createdAt ? new Date(c.createdAt) : new Date();
      const { formattedDate, formattedTime, leadAge } = formatISTDateTime(createdDateObj);
      const cleanProj = extractProjectName(c.propertyTitle, c.subject || c.message, 'General Inquiry');
      const unitType = extractUnitType(c.subject, c.message);
      const location = extractLocation(c.propertyTitle || c.message);

      unifiedLeads.push({
        id: c._id.toString(),
        fullName: c.name || 'General Inquiry',
        phone: c.phone,
        email: c.email || '',
        status: status,
        priority: 'medium',
        source: 'Contact Form',
        createdAt: createdDateObj.toISOString(),
        formattedDate,
        formattedTime,
        leadAge,
        lastActivityAt: c.updatedAt ? new Date(c.updatedAt).toISOString() : createdDateObj.toISOString(),
        projectName: cleanProj,
        fullPropertyTitle: c.propertyTitle || c.subject || 'General Inquiry',
        projectId: c.propertyId || '',
        propertyType: unitType,
        unitType: unitType,
        location: location,
        notes: c.message || '',
        tags: ['contact-form'],
        followUpDate,
        visitDetails,
        history: history.map((h: any) => ({
          id: h._id?.toString() || `${c._id}_${h.calledAt}`,
          disposition: h.disposition,
          notes: h.notes || '',
          duration: h.duration && h.duration !== '0s' ? h.duration : (h.durationSeconds ? `${h.durationSeconds}s` : '0s'),
          durationSeconds: h.durationSeconds || 0,
          agentName: h.agentName || existingAgentLead?.agentName || 'Agent',
          recordingUrl: h.recordingUrl || null,
          recordingPath: h.recordingPath || null,
          calledAt: h.calledAt ? new Date(h.calledAt).toISOString() : new Date().toISOString(),
        })),
      });
    }

    // Map Standalone Manual AgentLeads (e.g. dialed from Dialpad)
    for (const al of agentLeads as any[]) {
      const cleanPhone = (al.phone || '').replace(/[^0-9]/g, '');
      const searchKey = cleanPhone.slice(-10);

      // If this phone is not already in PropertyEnquiries or Contacts, add it!
      if (searchKey && !processedPhones.has(searchKey)) {
        processedPhones.add(searchKey);

        const status = mapDispositionToStatus(al.disposition);
        const history = al.history || [];

        const createdDateObj = al.createdAt ? new Date(al.createdAt) : new Date();
        const { formattedDate, formattedTime, leadAge } = formatISTDateTime(createdDateObj);
        const cleanProj = extractProjectName(al.propertyInterest, undefined, 'Direct Inquiry');
        const unitType = extractUnitType(al.propertyInterest);

        unifiedLeads.unshift({
          id: al._id.toString(),
          fullName: al.name && al.name !== 'Unknown Contact' ? al.name : `Lead ${al.phone}`,
          phone: al.phone,
          email: al.email || '',
          status: status,
          priority: 'medium',
          source: 'Manual Dial',
          createdAt: createdDateObj.toISOString(),
          formattedDate,
          formattedTime,
          leadAge,
          lastActivityAt: al.updatedAt ? new Date(al.updatedAt).toISOString() : createdDateObj.toISOString(),
          projectName: cleanProj,
          fullPropertyTitle: al.propertyInterest || 'Direct Inquiry',
          projectId: '',
          propertyType: unitType,
          unitType: unitType,
          location: 'Delhi NCR',
          notes: al.notes || '',
          tags: ['manual-dial'],
          followUpDate: al.followUpDate ? new Date(al.followUpDate).toISOString() : null,
          visitDetails: al.visitDetails || null,
          history: history.map((h: any) => ({
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
    }

    // Filter if requested
    let result = unifiedLeads;
    if (filter === 'brochure') {
      result = result.filter(l => l.source === 'Brochure Download');
    } else if (filter === 'blog') {
      result = result.filter(l => l.source === 'Website Enquiry');
    } else if (filter === 'contact') {
      result = result.filter(l => l.source === 'Contact Form');
    } else if (filter === 'meta') {
      result = result.filter(l => l.source === 'Meta Lead Ads');
    }

    if (search) {
      result = result.filter(l =>
        l.fullName.toLowerCase().includes(search) ||
        l.phone.includes(search) ||
        (l.projectName && l.projectName.toLowerCase().includes(search)) ||
        (l.unitType && l.unitType.toLowerCase().includes(search))
      );
    }

    return NextResponse.json({
      success: true,
      count: result.length,
      data: result,
    });
  } catch (error: any) {
    console.error('Mobile Leads GET Error:', error);
    return NextResponse.json({ success: false, error: 'Server error', details: error.message }, { status: 500 });
  }
}