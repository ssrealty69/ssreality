import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import Contact from '@/models/Contact';
import nodemailer from 'nodemailer';
import { formLimiter, getClientIp } from '@/lib/rateLimit';

export const dynamic = 'force-dynamic';

const isDev = process.env.NODE_ENV !== 'production';

export async function POST(req: NextRequest) {
  // ── Rate limiting: 5 submissions per 10 minutes per IP ───────────────────
  const ip = getClientIp(req);
  const { success: allowed, retryAfter } = formLimiter.check(`contact:${ip}`);
  if (!allowed) {
    return NextResponse.json(
      { success: false, error: `Too many requests. Please wait ${retryAfter} seconds before trying again.` },
      { status: 429, headers: { 'Retry-After': String(retryAfter) } }
    );
  }

  try {
    await connectDB();
    const body = await req.json();
    const { name, email, phone, subject, message, propertyId } = body;

    // ── Field validation ──────────────────────────────────────────────────
    if (!name || !email || !phone || !subject || !message) {
      return NextResponse.json({ success: false, error: 'All fields required' }, { status: 400 });
    }

    // ── Input length limits + sanitization ───────────────────────────────
    const sanitizedName    = String(name).trim().slice(0, 100);
    const sanitizedEmail   = String(email).trim().toLowerCase().slice(0, 200);
    const sanitizedPhone   = String(phone).trim().replace(/\D/g, '').slice(0, 15);
    const sanitizedSubject = String(subject).trim().slice(0, 200);
    const sanitizedMessage = String(message).trim().slice(0, 2000);
    const sanitizedPropId  = propertyId ? String(propertyId).trim().slice(0, 100) : undefined;

    // Email format validation
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(sanitizedEmail)) {
      return NextResponse.json({ success: false, error: 'Invalid email address' }, { status: 400 });
    }

    // Phone validation (at least 10 digits)
    if (sanitizedPhone.length < 10) {
      return NextResponse.json({ success: false, error: 'Invalid phone number' }, { status: 400 });
    }

    // Save to DB with sanitized values
    const contact = await Contact.create({
      name: sanitizedName,
      email: sanitizedEmail,
      phone: sanitizedPhone,
      subject: sanitizedSubject,
      message: sanitizedMessage,
      propertyId: sanitizedPropId,
    });

    // Send email if configured
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
          subject: `✨ New Enquiry: ${sanitizedSubject} from ${sanitizedName}`,
          html: `
            <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e8d5a3; border-radius: 12px; overflow: hidden; background-color: #fffef5;">
              <div style="background: linear-gradient(135deg, #1A1800 0%, #3a3828 100%); padding: 30px; text-align: center; border-bottom: 3px solid #c9a227;">
                <h1 style="color: #c9a227; margin: 0; font-size: 24px; text-transform: uppercase; letter-spacing: 2px;">SS Realty</h1>
                <p style="color: #d4c490; margin: 5px 0 0; font-size: 14px;">New Lead Notification</p>
              </div>
              
              <div style="padding: 30px; color: #1a1800;">
                <h2 style="font-size: 18px; border-bottom: 1px solid #e8d5a3; pb: 10px; margin-top: 0;">Enquiry Details</h2>
                
                <table style="width: 100%; border-collapse: collapse;">
                  <tr>
                    <td style="padding: 10px 0; color: #6b6450; font-weight: 600; width: 120px;">Name:</td>
                    <td style="padding: 10px 0; font-weight: 500;">${sanitizedName}</td>
                  </tr>
                  <tr>
                    <td style="padding: 10px 0; color: #6b6450; font-weight: 600;">Email:</td>
                    <td style="padding: 10px 0;"><a href="mailto:${sanitizedEmail}" style="color: #c9a227; text-decoration: none;">${sanitizedEmail}</a></td>
                  </tr>
                  <tr>
                    <td style="padding: 10px 0; color: #6b6450; font-weight: 600;">Phone:</td>
                    <td style="padding: 10px 0;"><a href="tel:+91${sanitizedPhone}" style="color: #c9a227; text-decoration: none;">+91 ${sanitizedPhone}</a></td>
                  </tr>
                  <tr>
                    <td style="padding: 10px 0; color: #6b6450; font-weight: 600;">Subject:</td>
                    <td style="padding: 10px 0; font-weight: 500;">${sanitizedSubject}</td>
                  </tr>
                  ${sanitizedPropId ? `
                  <tr>
                    <td style="padding: 10px 0; color: #6b6450; font-weight: 600;">Property ID:</td>
                    <td style="padding: 10px 0; font-weight: bold; color: #c9a227;">${sanitizedPropId}</td>
                  </tr>` : ''}
                </table>

                <div style="margin-top: 25px; padding: 20px; background-color: #fff; border-radius: 8px; border: 1px solid #e8d5a3;">
                  <p style="margin: 0 0 10px; color: #6b6450; font-weight: 600; font-size: 14px; text-transform: uppercase;">Message:</p>
                  <p style="margin: 0; line-height: 1.6; color: #3a3828;">${sanitizedMessage}</p>
                </div>

                <div style="margin-top: 30px; text-align: center;">
                  <a href="https://wa.me/91${sanitizedPhone}" style="display: inline-block; background-color: #25D366; color: white; padding: 12px 25px; border-radius: 50px; text-decoration: none; font-weight: bold; font-size: 14px;">Reply on WhatsApp</a>
                </div>
              </div>

              <div style="background-color: #f8f5e6; padding: 20px; text-align: center; color: #b0a080; font-size: 12px; border-top: 1px solid #e8d5a3;">
                <p style="margin: 0;">This email was automatically generated from the SS Realty contact form.</p>
                <p style="margin: 5px 0 0;">© 2025 SS Realty Teams. All rights reserved.</p>
              </div>
            </div>
          `,
        });
      } catch (mailError) {
        console.error('Email Send Error:', mailError);
        // Do not return 500 — contact is already saved to DB
      }
    }

    // Return only the ID, not the full document
    return NextResponse.json({ success: true, data: { _id: contact._id } }, { status: 201 });
  } catch (error: unknown) {
    console.error('Contact API Error:', error);
    return NextResponse.json({
      success: false,
      error: 'Server Error',
      ...(isDev && { details: error instanceof Error ? error.message : 'Unknown error' }),
    }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  try {
    const secret = req.headers.get('x-admin-secret');
    if (secret !== process.env.ADMIN_SECRET) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }
    await connectDB();
    const contacts = await Contact.find().sort('-createdAt').lean();
    return NextResponse.json({ success: true, data: contacts });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ success: false, error: 'Server Error' }, { status: 500 });
  }
}
