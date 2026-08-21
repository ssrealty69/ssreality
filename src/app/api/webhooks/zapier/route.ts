import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import PropertyEnquiry from '@/models/PropertyEnquiry';
import Contact from '@/models/Contact';
import nodemailer from 'nodemailer';

export const dynamic = 'force-dynamic';

// GET: Quick health check for testing webhook URL in browser/Zapier
export async function GET() {
  return NextResponse.json({
    status: 'ok',
    message: 'Zapier Webhook endpoint is active and ready to receive leads.',
  });
}

// POST: Receive leads from Zapier (Facebook Lead Ads -> Webhooks by Zapier)
export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    console.log('⚡ Incoming Zapier Webhook Lead:', JSON.stringify(body, null, 2));

    // Optional API key validation if configured
    const apiKey = req.headers.get('x-api-key') || req.nextUrl.searchParams.get('api_key');
    const expectedKey = process.env.ZAPIER_WEBHOOK_SECRET || process.env.ADMIN_SECRET;
    if (expectedKey && apiKey && apiKey !== expectedKey) {
      return NextResponse.json({ success: false, error: 'Unauthorized: Invalid API key' }, { status: 401 });
    }

    // Extract fields (supporting various field name formats from Zapier)
    const name = body.full_name || body.name || body.first_name || body.fullName || 'Meta Lead';
    const rawPhone = body.phone_number || body.phone || body.mobile || body.phoneNumber || '';
    const email = body.email || body.email_address || '';
    const campaignName = body.campaign_name || body.form_name || body.ad_name || 'Facebook/Instagram Ads';
    const requirement = body.requirement || body.message || body.notes || `Campaign: ${campaignName}`;
    const propertyTitle = body.property_title || body.propertyTitle || `Meta Ad Lead (${campaignName})`;
    const propertyId = body.property_id || body.propertyId || 'meta-ad';
    const propertyUrl = body.property_url || body.propertyUrl || 'https://facebook.com/ads';
    const source = body.source || 'Meta Lead Ads (Zapier)';

    // Sanitize & format phone (extract last 10 digits for Indian standard)
    const digitsOnly = String(rawPhone).replace(/\D/g, '');
    let sanitizedPhone = digitsOnly;
    if (digitsOnly.length > 10) {
      sanitizedPhone = digitsOnly.slice(-10);
    }

    if (!sanitizedPhone || sanitizedPhone.length < 10) {
      return NextResponse.json(
        { success: false, error: 'Valid phone number is required.' },
        { status: 400 }
      );
    }

    await connectDB();

    // 1. Save in PropertyEnquiry
    const enquiry = await PropertyEnquiry.create({
      name: String(name).trim(),
      phone: sanitizedPhone,
      requirement: String(requirement).trim(),
      propertyId: String(propertyId),
      propertyTitle: String(propertyTitle),
      propertyUrl: String(propertyUrl),
      isBrochureDownload: false,
      source: source,
      status: 'new',
    });

    // 2. Also save in Contact for comprehensive CRM syncing
    try {
      await Contact.create({
        name: String(name).trim(),
        email: email || `${sanitizedPhone}@lead.placeholder`,
        phone: sanitizedPhone,
        subject: `Meta Lead: ${campaignName}`,
        message: String(requirement).trim(),
        propertyId: String(propertyId),
        status: 'new',
      });
    } catch (contactErr) {
      console.warn('Contact creation warning (non-fatal):', contactErr);
    }

    // 3. Send Email Notification if configured
    if (process.env.EMAIL_PASS && process.env.EMAIL_USER) {
      try {
        const transporter = nodemailer.createTransport({
          service: 'gmail',
          auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS,
          },
        });

        await transporter.sendMail({
          from: `"SS Realty Leads" <${process.env.EMAIL_USER}>`,
          to: 'ssrealtyteams@gmail.com',
          subject: `🔥 New Meta Ad Lead (Zapier): ${name} - ${sanitizedPhone}`,
          html: `
            <div style="font-family:'Segoe UI',Arial,sans-serif;max-width:600px;margin:0 auto;border:1px solid #e8d5a3;border-radius:10px;overflow:hidden;">
              <div style="background:#1A1800;padding:20px;text-align:center;border-bottom:3px solid #c9a227;">
                <h2 style="color:#c9a227;margin:0;">SS Realty - Meta Ad Lead</h2>
                <p style="color:#d4c490;margin:5px 0 0;font-size:13px;">Received instantly via Zapier</p>
              </div>
              <div style="padding:20px;background:#fffef5;">
                <table style="width:100%;border-collapse:collapse;">
                  <tr><td style="padding:8px 0;font-weight:bold;color:#6b6450;">Name:</td><td>${name}</td></tr>
                  <tr><td style="padding:8px 0;font-weight:bold;color:#6b6450;">Phone:</td><td><a href="tel:+91${sanitizedPhone}" style="color:#c9a227;font-weight:bold;">+91 ${sanitizedPhone}</a></td></tr>
                  <tr><td style="padding:8px 0;font-weight:bold;color:#6b6450;">Email:</td><td>${email || 'N/A'}</td></tr>
                  <tr><td style="padding:8px 0;font-weight:bold;color:#6b6450;">Campaign / Form:</td><td>${campaignName}</td></tr>
                  <tr><td style="padding:8px 0;font-weight:bold;color:#6b6450;">Details:</td><td>${requirement}</td></tr>
                </table>
              </div>
            </div>
          `,
        });
      } catch (mailErr) {
        console.error('Zapier Lead Email Error:', mailErr);
      }
    }

    return NextResponse.json({
      success: true,
      message: 'Lead received and saved successfully',
      leadId: enquiry._id,
    }, { status: 200 });

  } catch (error: any) {
    console.error('Zapier Webhook Error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
