import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import AgentLead from '@/models/AgentLead';
import PropertyEnquiry from '@/models/PropertyEnquiry';
import Contact from '@/models/Contact';
import mongoose from 'mongoose';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      leadId,
      disposition,
      notes,
      duration,
      durationSeconds,
      recordingUrl,
      recordingPath,
      visitDetails,
      followUpDate,
      phoneNumber,
      leadName,
      source,
      propertyInterest,
      agentId = 'mobile_agent',
      agentName = 'Mobile CRM User',
    } = body;

    if (!leadId && !phoneNumber) {
      return NextResponse.json({ success: false, error: 'leadId or phoneNumber required' }, { status: 400 });
    }

    await connectDB();

    // 1. Find or create AgentLead document
    let agentLead = null;
    const orQueries: any[] = [];
    if (leadId) {
      orQueries.push({ originalLeadId: leadId });
      if (mongoose.Types.ObjectId.isValid(leadId)) {
        orQueries.push({ _id: new mongoose.Types.ObjectId(leadId) });
      }
    }
    const cleanDigits = (phoneNumber || '').replace(/[^0-9]/g, '');
    const phone10 = cleanDigits.length >= 10 ? cleanDigits.slice(-10) : cleanDigits;
    if (phone10) {
      orQueries.push({ phone: phone10 });
      orQueries.push({ phone: { $regex: `${phone10}$` } });
    }

    if (orQueries.length > 0) {
      agentLead = await AgentLead.findOne({ $or: orQueries });
    }

    const mappedDisp = normalizeDisposition(disposition);

    if (!agentLead) {
      // Find source doc for name & phone if leadId provided
      let name = (leadName && leadName !== 'Unknown Contact') ? leadName : (phone10 ? `Lead ${phone10}` : 'Website Lead');
      let phone = phone10 || phoneNumber || '';
      let interest = propertyInterest || '';

      if (leadId && mongoose.Types.ObjectId.isValid(leadId)) {
        const pe = await PropertyEnquiry.findById(leadId).lean();
        if (pe) {
          name = (pe as any).name || name;
          phone = (pe as any).phone || phone;
          interest = (pe as any).propertyTitle || interest;
        } else {
          const ct = await Contact.findById(leadId).lean();
          if (ct) {
            name = (ct as any).name || name;
            phone = (ct as any).phone || phone;
          }
        }
      }

      // Create new agent lead
      agentLead = new AgentLead({
        agentId,
        agentName,
        name,
        phone: phone10 || phone,
        source: source || 'mobile',
        originalLeadId: leadId || undefined,
        originalLeadType: (source === 'manual' || leadId?.startsWith('manual-')) ? 'manual' : undefined,
        propertyInterest: interest,
        disposition: mappedDisp,
        history: [],
      });
    } else {
      // If agent lead exists and we got a better name, update it!
      if (leadName && leadName !== 'Unknown Contact' && !leadName.startsWith('Lead +')) {
        agentLead.name = leadName;
      }
      if (agentName && agentName !== 'Mobile CRM User') {
        agentLead.agentName = agentName;
      }
      if (agentId && agentId !== 'mobile_agent' && (!agentLead.agentId || agentLead.agentId === 'mobile_agent')) {
        agentLead.agentId = agentId;
      }
      if (source === 'manual' || leadId?.startsWith('manual-')) {
        agentLead.originalLeadType = 'manual';
      }
    }

    // Add call log entry with recording & duration details
    agentLead.history.push({
      disposition: mappedDisp,
      notes: notes || '',
      calledAt: new Date(),
      duration: duration || (durationSeconds ? `${durationSeconds}s` : '0s'),
      durationSeconds: durationSeconds || 0,
      recordingUrl: recordingUrl || undefined,
      recordingPath: recordingPath || undefined,
    });

    agentLead.disposition = mappedDisp;

    if (visitDetails) {
      agentLead.visitDetails = visitDetails;
    }

    if (followUpDate) {
      agentLead.followUpDate = new Date(followUpDate);
    }

    try {
      await agentLead.save();
    } catch (saveErr: any) {
      if (saveErr.code === 11000) {
        // Fallback: reload the existing lead that took the unique slot and update its disposition/history
        const existingAfterRace = await AgentLead.findOne({ $or: orQueries });
        if (existingAfterRace) {
          existingAfterRace.history.push({
            disposition: mappedDisp,
            notes: notes || '',
            calledAt: new Date(),
            duration: duration || (durationSeconds ? `${durationSeconds}s` : '0s'),
            durationSeconds: durationSeconds || 0,
            recordingUrl: recordingUrl || undefined,
            recordingPath: recordingPath || undefined,
          });
          existingAfterRace.disposition = mappedDisp;
          if (visitDetails) existingAfterRace.visitDetails = visitDetails;
          if (followUpDate) existingAfterRace.followUpDate = new Date(followUpDate);
          await existingAfterRace.save();
          agentLead = existingAfterRace;
        }
      } else {
        throw saveErr;
      }
    }

    // 2. Also update status and name on original PropertyEnquiry or Contact if present
    if (leadId && mongoose.Types.ObjectId.isValid(leadId)) {
      try {
        await PropertyEnquiry.findByIdAndUpdate(leadId, {
          status: mappedDisp === 'interested' ? 'contacted' : 'contacted',
          ...(leadName && leadName !== 'Unknown Contact' ? { name: leadName } : {})
        });
      } catch (_) {}

      try {
        await Contact.findByIdAndUpdate(leadId, {
          status: 'replied',
          ...(leadName && leadName !== 'Unknown Contact' ? { name: leadName } : {})
        });
      } catch (_) {}
    }

    return NextResponse.json({
      success: true,
      message: 'Call disposition saved successfully with recording details',
      data: agentLead,
    });
  } catch (error: any) {
    console.error('Mobile Lead Disposition Error:', error);
    return NextResponse.json({ success: false, error: 'Server error', details: error.message }, { status: 500 });
  }
}

function normalizeDisposition(disp?: string): any {
  if (!disp) return 'new';
  const lower = disp.toLowerCase();
  if (lower.includes('book')) return 'booked';
  if (lower.includes('sched') || lower.includes('plan') || lower.includes('fixed')) return 'visit_scheduled';
  if (lower.includes('visit_done') || (lower.includes('visit') && lower.includes('done')) || lower.includes('completed')) return 'visit_done';
  if (lower.includes('visit')) return 'visit_scheduled';
  if (lower.includes('ring')) return 'ringing';
  if (lower.includes('connect') && !lower.includes('not')) return 'connected';
  if (lower.includes('not_connected') || lower.includes('no answer') || lower.includes('busy')) return 'not_connected';
  if (lower.includes('switch') || lower.includes('off')) return 'switch_off';
  if (lower.includes('reach') || lower.includes('unreach')) return 'not_reachable';
  if (lower.includes('interest') && !lower.includes('not')) return 'interested';
  if (lower.includes('not_interest') || lower.includes('lost') || lower.includes('junk')) return 'not_interested';
  if (lower.includes('follow')) return 'follow_up';
  return 'new';
}