import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import PropertyEnquiry from '@/models/PropertyEnquiry';
import nodemailer from 'nodemailer';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    await connectDB();
    const body = await req.json();
    const { name, phone, requirement, propertyId, propertyTitle, propertyUrl } = body;

    // Validate required fields
    if (!name || !phone || !propertyId || !propertyTitle) {
      return NextResponse.json(
        { success: false, error: 'Name, phone, and property details are required.' },
        { status: 400 }
      );
    }

    if (phone.length !== 10 || !/^\d{10}$/.test(phone)) {
      return NextResponse.json(
        { success: false, error: 'Please provide a valid 10-digit phone number.' },
        { status: 400 }
      );
    }

    // Save to DB
    const enquiry = await PropertyEnquiry.create({
      name: name.trim(),
      phone: phone.trim(),
      requirement: requirement?.trim() || '',
      propertyId,
      propertyTitle: propertyTitle.trim(),
      propertyUrl: propertyUrl || `/properties/${propertyId}`,
    });

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
          subject: `🏠 New Property Enquiry: ${propertyTitle} from ${name}`,
          html: `
            <div style="font-family:'Segoe UI',Tahoma,Geneva,Verdana,sans-serif;max-width:600px;margin:0 auto;border:1px solid #e8d5a3;border-radius:12px;overflow:hidden;background:#fffef5;">
              <div style="background:linear-gradient(135deg,#1A1800 0%,#3a3828 100%);padding:28px 30px;text-align:center;border-bottom:3px solid #c9a227;">
                <h1 style="color:#c9a227;margin:0;font-size:22px;text-transform:uppercase;letter-spacing:2px;">SS Realty</h1>
                <p style="color:#d4c490;margin:6px 0 0;font-size:13px;">🏠 New Property Enquiry Received</p>
              </div>

              <div style="padding:28px 30px;color:#1a1800;">
                <div style="background:#fff8e1;border:1px solid #c9a227;border-radius:8px;padding:14px 18px;margin-bottom:20px;">
                  <p style="margin:0;font-size:11px;font-weight:800;text-transform:uppercase;color:#6b6450;letter-spacing:1px;">Property</p>
                  <a href="${process.env.NEXT_PUBLIC_SITE_URL || 'https://ssrealtyteams.com'}/properties/${propertyId}" style="color:#c9a227;font-size:16px;font-weight:800;text-decoration:none;">${propertyTitle}</a>
                  <p style="margin:4px 0 0;font-size:11px;color:#a08050;">ID: ${propertyId}</p>
                </div>

                <table style="width:100%;border-collapse:collapse;">
                  <tr>
                    <td style="padding:10px 0;color:#6b6450;font-weight:700;font-size:13px;width:130px;">Name:</td>
                    <td style="padding:10px 0;font-weight:600;font-size:13px;">${name}</td>
                  </tr>
                  <tr>
                    <td style="padding:10px 0;color:#6b6450;font-weight:700;font-size:13px;">Phone:</td>
                    <td style="padding:10px 0;font-size:13px;"><a href="tel:+91${phone}" style="color:#c9a227;text-decoration:none;font-weight:700;">+91 ${phone}</a></td>
                  </tr>
                  ${requirement ? `
                  <tr>
                    <td style="padding:10px 0;color:#6b6450;font-weight:700;font-size:13px;vertical-align:top;">Requirement:</td>
                    <td style="padding:10px 0;font-size:13px;color:#3a3828;line-height:1.6;">${requirement}</td>
                  </tr>` : ''}
                </table>

                <div style="margin-top:24px;text-align:center;">
                  <a href="https://wa.me/91${phone}?text=Hi ${encodeURIComponent(name)}, thank you for your enquiry about ${encodeURIComponent(propertyTitle)} at SS Realty. How can we assist you?" style="display:inline-block;background:#25D366;color:white;padding:12px 28px;border-radius:50px;text-decoration:none;font-weight:700;font-size:13px;margin-right:10px;">💬 Reply on WhatsApp</a>
                  <a href="tel:+91${phone}" style="display:inline-block;background:#1A1800;color:#c9a227;padding:12px 28px;border-radius:50px;text-decoration:none;font-weight:700;font-size:13px;">📞 Call Now</a>
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

    return NextResponse.json({ success: true, data: enquiry }, { status: 201 });
  } catch (error: any) {
    console.error('Property Enquiry API Error:', error);
    return NextResponse.json(
      { success: false, error: 'Server Error', details: error.message },
      { status: 500 }
    );
  }
}
