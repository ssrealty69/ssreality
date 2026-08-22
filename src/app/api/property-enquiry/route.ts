import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import PropertyEnquiry from '@/models/PropertyEnquiry';
import nodemailer from 'nodemailer';
import { formLimiter, getClientIp } from '@/lib/rateLimit';
import { distributeLead } from '@/lib/lead-distributor';

export const dynamic = 'force-dynamic';

const isDev = process.env.NODE_ENV !== 'production';

export async function POST(req: NextRequest) {
  // ── Rate limiting: 5 submissions per 10 minutes per IP ───────────────────
  const ip = getClientIp(req);
  const { success: allowed, retryAfter } = formLimiter.check(`enquiry:${ip}`);
  if (!allowed) {
    return NextResponse.json(
      { success: false, error: `Too many requests. Please wait ${retryAfter} seconds before trying again.` },
      { status: 429, headers: { 'Retry-After': String(retryAfter) } }
    );
  }

  try {
    await connectDB();
    const body = await req.json();
    const { name, phone, requirement, propertyId, propertyTitle, propertyUrl, isBrochureDownload, source } = body;

    // ── Field validation ──────────────────────────────────────────────────
    if (!phone || !propertyId || !propertyTitle) {
      return NextResponse.json(
        { success: false, error: 'Phone and property details are required.' },
        { status: 400 }
      );
    }

    // ── Input sanitization + length limits ────────────────────────────────
    const sanitizedName    = name ? String(name).trim().slice(0, 100) : 'Blog Lead';
    const sanitizedPhone   = String(phone).trim().replace(/\D/g, '').slice(0, 15);
    const sanitizedReq     = requirement ? String(requirement).trim().slice(0, 1000) : '';
    const sanitizedPropId  = String(propertyId).trim().slice(0, 100);
    const sanitizedTitle   = String(propertyTitle).trim().slice(0, 200);
    const sanitizedUrl     = propertyUrl ? String(propertyUrl).trim().slice(0, 300) : `/properties/${sanitizedPropId}`;

    if (sanitizedPhone.length !== 10 || !/^\d{10}$/.test(sanitizedPhone)) {
      return NextResponse.json(
        { success: false, error: 'Please provide a valid 10-digit phone number.' },
        { status: 400 }
      );
    }

    // ── Deduplication: prevent duplicate entry from same phone+property within 5 min ──
    const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);
    const existingEnquiry = await PropertyEnquiry.findOne({
      phone: sanitizedPhone,
      propertyId: sanitizedPropId,
      createdAt: { $gte: fiveMinutesAgo },
    });

    if (existingEnquiry) {
      // Return success silently — the enquiry was already saved previously
      return NextResponse.json({ success: true, data: { _id: existingEnquiry._id } }, { status: 200 });
    }

    // Save to DB
    const enquiry = await PropertyEnquiry.create({
      name: sanitizedName,
      phone: sanitizedPhone,
      requirement: sanitizedReq,
      propertyId: sanitizedPropId,
      propertyTitle: sanitizedTitle,
      propertyUrl: sanitizedUrl,
      isBrochureDownload: !!isBrochureDownload,
      source: source || '',
    });

    // Auto-distribute to team agents in real-time
    try {
      const isBrochure = !!isBrochureDownload || (sanitizedReq && sanitizedReq.includes('Brochure'));
      const leadSource = isBrochure ? 'Brochure Download' : (source || (sanitizedReq.toLowerCase().includes('blog') ? 'Blog Enquiry' : 'Website Enquiry'));

      await distributeLead({
        name: sanitizedName,
        phone: sanitizedPhone,
        source: leadSource,
        originalLeadId: enquiry._id.toString(),
        originalLeadType: isBrochure ? 'brochure' : 'property_enquiry',
        rawProjectName: sanitizedTitle,
        propertyInterest: sanitizedTitle,
        notes: sanitizedReq,
        createdAt: new Date(),
      });
    } catch (distErr) {
      console.error('Lead Auto-Distribute Error:', distErr);
    }

    // Send email notification if configured
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
          from: `"SS Realty Website" <${process.env.EMAIL_USER}>`,
          to: 'ssrealtyteams@gmail.com',
          subject: `🏠 New Property Enquiry: ${sanitizedTitle} from ${sanitizedName}`,
          html: `
            <div style="font-family:'Segoe UI',Tahoma,Geneva,Verdana,sans-serif;max-width:600px;margin:0 auto;border:1px solid #e8d5a3;border-radius:12px;overflow:hidden;background:#fffef5;">
              <div style="background:linear-gradient(135deg,#1A1800 0%,#3a3828 100%);padding:28px 30px;text-align:center;border-bottom:3px solid #c9a227;">
                <h1 style="color:#c9a227;margin:0;font-size:22px;text-transform:uppercase;letter-spacing:2px;">SS Realty</h1>
                <p style="color:#d4c490;margin:6px 0 0;font-size:13px;">🏠 New Property Enquiry Received</p>
              </div>

              <div style="padding:28px 30px;color:#1a1800;">
                <div style="background:#fff8e1;border:1px solid #c9a227;border-radius:8px;padding:14px 18px;margin-bottom:20px;">
                  <p style="margin:0;font-size:11px;font-weight:800;text-transform:uppercase;color:#6b6450;letter-spacing:1px;">Property</p>
                  <a href="${process.env.NEXT_PUBLIC_SITE_URL || 'https://ssrealty.org'}/properties/${sanitizedPropId}" style="color:#c9a227;font-size:16px;font-weight:800;text-decoration:none;">${sanitizedTitle}</a>
                  <p style="margin:4px 0 0;font-size:11px;color:#a08050;">ID: ${sanitizedPropId}</p>
                </div>

                <table style="width:100%;border-collapse:collapse;">
                  <tr>
                    <td style="padding:10px 0;color:#6b6450;font-weight:700;font-size:13px;width:130px;">Name:</td>
                    <td style="padding:10px 0;font-weight:600;font-size:13px;">${sanitizedName}</td>
                  </tr>
                  <tr>
                    <td style="padding:10px 0;color:#6b6450;font-weight:700;font-size:13px;">Phone:</td>
                    <td style="padding:10px 0;font-size:13px;"><a href="tel:+91${sanitizedPhone}" style="color:#c9a227;text-decoration:none;font-weight:700;">+91 ${sanitizedPhone}</a></td>
                  </tr>
                  ${sanitizedReq ? `
                  <tr>
                    <td style="padding:10px 0;color:#6b6450;font-weight:700;font-size:13px;vertical-align:top;">Requirement:</td>
                    <td style="padding:10px 0;font-size:13px;color:#3a3828;line-height:1.6;">${sanitizedReq}</td>
                  </tr>` : ''}
                </table>

                <div style="margin-top:24px;text-align:center;">
                  <a href="https://wa.me/91${sanitizedPhone}?text=Hi ${encodeURIComponent(sanitizedName)}, thank you for your enquiry about ${encodeURIComponent(sanitizedTitle)} at SS Realty. How can we assist you?" style="display:inline-block;background:#25D366;color:white;padding:12px 28px;border-radius:50px;text-decoration:none;font-weight:700;font-size:13px;margin-right:10px;">💬 Reply on WhatsApp</a>
                  <a href="tel:+91${sanitizedPhone}" style="display:inline-block;background:#1A1800;color:#c9a227;padding:12px 28px;border-radius:50px;text-decoration:none;font-weight:700;font-size:13px;">📞 Call Now</a>
                </div>
              </div>

              <div style="background:#f8f5e6;padding:16px 30px;text-align:center;color:#b0a080;font-size:11px;border-top:1px solid #e8d5a3;">
                <p style="margin:0;">Auto-generated from SS Realty Property Enquiry Form</p>
                <p style="margin:4px 0 0;">© 2025 SS Realty Teams. All rights reserved.</p>
              </div>
            </div>
          `,
        });
      } catch (mailError) {
        console.error('Property Enquiry Email Error:', mailError);
        // Do not block response — enquiry already saved to DB
      }
    }

    return NextResponse.json({ success: true, data: { _id: enquiry._id } }, { status: 201 });
  } catch (error: unknown) {
    console.error('Property Enquiry API Error:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Server Error',
        ...(isDev && { details: error instanceof Error ? error.message : 'Unknown error' }),
      },
      { status: 500 }
    );
  }
}
