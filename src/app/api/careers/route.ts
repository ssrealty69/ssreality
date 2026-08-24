import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import JobApplication from '@/models/JobApplication';
import { cloudinary } from '@/lib/cloudinary';
import nodemailer from 'nodemailer';
import { formLimiter, getClientIp } from '@/lib/rateLimit';

export const dynamic = 'force-dynamic';

const isDev = process.env.NODE_ENV !== 'production';

// Resume file constraints
const MAX_RESUME_SIZE = 5 * 1024 * 1024; // 5MB max for resumes
const ALLOWED_RESUME_TYPES = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];

export async function POST(req: NextRequest) {
  // ── Rate limiting: 5 submissions per 10 minutes per IP ───────────────────
  const ip = getClientIp(req);
  const { success: allowed, retryAfter } = formLimiter.check(`careers:${ip}`);
  if (!allowed) {
    return NextResponse.json(
      { success: false, error: `Too many requests. Please wait ${retryAfter} seconds before trying again.` },
      { status: 429, headers: { 'Retry-After': String(retryAfter) } }
    );
  }

  try {
    const formData = await req.formData();
    const name     = formData.get('name') as string;
    const phone    = formData.get('phone') as string;
    const age      = formData.get('age') as string;
    const position = formData.get('position') as string;
    const resume   = formData.get('resume') as File | null;

    // ── Field validation ──────────────────────────────────────────────────
    if (!name || !phone || !age || !position) {
      return NextResponse.json({ success: false, error: 'All mandatory fields are required' }, { status: 400 });
    }

    // ── Input sanitization + length limits ────────────────────────────────
    const sanitizedName     = String(name).trim().slice(0, 100);
    const sanitizedPhone    = String(phone).trim().replace(/\D/g, '').slice(0, 15);
    const sanitizedAge      = String(age).trim().slice(0, 3);
    const sanitizedPosition = String(position).trim().slice(0, 100);

    // Validate phone
    if (sanitizedPhone.length < 10) {
      return NextResponse.json({ success: false, error: 'Invalid phone number' }, { status: 400 });
    }

    // Validate age is a reasonable number
    const ageNum = parseInt(sanitizedAge, 10);
    if (isNaN(ageNum) || ageNum < 16 || ageNum > 80) {
      return NextResponse.json({ success: false, error: 'Please provide a valid age' }, { status: 400 });
    }

    // ── Resume file type + size validation ────────────────────────────────
    if (resume && resume.size > 0) {
      if (resume.size > MAX_RESUME_SIZE) {
        return NextResponse.json({ success: false, error: 'Resume file too large. Maximum 5MB allowed.' }, { status: 400 });
      }
      if (!ALLOWED_RESUME_TYPES.includes(resume.type)) {
        return NextResponse.json({ success: false, error: 'Only PDF and Word documents are accepted for resumes.' }, { status: 400 });
      }
    }

    await connectDB();

    let resumeUrl = 'Not Provided';
    if (resume && resume.size > 0) {
      try {
        const bytes = await resume.arrayBuffer();
        const buffer = Buffer.from(bytes);
        const base64 = `data:${resume.type};base64,${buffer.toString('base64')}`;
        const uploadRes = await cloudinary.uploader.upload(base64, {
          folder: 'ss-realty/resumes',
          resource_type: 'auto',
          unique_filename: true,
        });
        resumeUrl = uploadRes.secure_url;
      } catch (uploadError) {
        console.error('Cloudinary resume upload error:', uploadError);
        resumeUrl = 'Attached to Email';
      }
    }

    // Save to DB
    const application = await JobApplication.create({
      name: sanitizedName,
      phone: sanitizedPhone,
      age: sanitizedAge,
      position: sanitizedPosition,
      resumeUrl,
      status: 'new',
      isRead: false,
    });

    // Send Email
    if (process.env.EMAIL_PASS && process.env.EMAIL_USER) {
      const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
          user: process.env.EMAIL_USER,
          pass: process.env.EMAIL_PASS,
        },
      });

      const mailOptions: Record<string, unknown> = {
        from: `"SS Realty Careers" <${process.env.EMAIL_USER}>`,
        to: 'ssrealtyteams@gmail.com',
        subject: `💼 New Job Application: ${sanitizedPosition} from ${sanitizedName}`,
        html: `
          <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; border: 2px solid #c9a227; border-radius: 16px; overflow: hidden; background-color: #fffef5;">
            <div style="background: #1A1800; padding: 30px; text-align: center; border-bottom: 4px solid #c9a227;">
              <h1 style="color: #c9a227; margin: 0; font-size: 26px; text-transform: uppercase; letter-spacing: 3px;">Job Application</h1>
              <p style="color: #d4c490; margin: 5px 0 0; font-size: 14px;">SS Realty Talent Acquisition</p>
            </div>
            
            <div style="padding: 30px; color: #1a1800;">
              <h2 style="font-size: 20px; color: #1a1800; border-bottom: 1px solid #e8d5a3; padding-bottom: 10px; margin-top: 0;">Candidate Profile</h2>
              
              <table style="width: 100%; border-collapse: collapse; margin-top: 20px;">
                <tr>
                  <td style="padding: 12px 0; color: #6b6450; font-weight: 600; width: 140px;">Position:</td>
                  <td style="padding: 12px 0; font-weight: bold; color: #c9a227; font-size: 16px;">${sanitizedPosition}</td>
                </tr>
                <tr>
                  <td style="padding: 12px 0; color: #6b6450; font-weight: 600;">Full Name:</td>
                  <td style="padding: 12px 0; font-weight: 500;">${sanitizedName}</td>
                </tr>
                <tr>
                  <td style="padding: 12px 0; color: #6b6450; font-weight: 600;">Phone Number:</td>
                  <td style="padding: 12px 0;"><a href="tel:+91${sanitizedPhone}" style="color: #c9a227; text-decoration: none; font-weight: 600;">+91 ${sanitizedPhone}</a></td>
                </tr>
                <tr>
                  <td style="padding: 12px 0; color: #6b6450; font-weight: 600;">Age:</td>
                  <td style="padding: 12px 0; font-weight: 500;">${sanitizedAge} Years</td>
                </tr>
                <tr>
                  <td style="padding: 12px 0; color: #6b6450; font-weight: 600;">Resume:</td>
                  <td style="padding: 12px 0; font-weight: 500; color: ${resume ? '#22c55e' : '#ef4444'};">
                    ${resumeUrl.startsWith('http') ? `<a href="${resumeUrl}" style="color: #c9a227; text-decoration: underline; font-weight: bold;" target="_blank">📎 View Resume File</a>` : (resume ? '📎 Attached to this email' : '❌ Not Provided')}
                  </td>
                </tr>
              </table>

              <div style="margin-top: 35px; text-align: center; border-top: 1px solid #e8d5a3; padding-top: 25px;">
                <a href="https://wa.me/91${sanitizedPhone}?text=Hi ${sanitizedName}, we received your application for the ${sanitizedPosition} role at SS Realty..." 
                   style="display: inline-block; background: #1A1800; color: #c9a227; border: 1px solid #c9a227; padding: 14px 30px; border-radius: 12px; text-decoration: none; font-weight: bold; font-size: 14px;">
                  Connect via WhatsApp
                </a>
              </div>
            </div>

            <div style="background-color: #f8f5e6; padding: 20px; text-align: center; color: #b0a080; font-size: 12px;">
              <p style="margin: 0;">© 2025 SS Realty Teams. Professional Recruitment System.</p>
            </div>
          </div>
        `,
      };

      if (resume && resume.size > 0) {
        const buffer = Buffer.from(await resume.arrayBuffer());
        mailOptions.attachments = [{
          filename: resume.name.slice(0, 100), // Limit filename length
          content: buffer,
        }];
      }

      await transporter.sendMail(mailOptions as Parameters<typeof transporter.sendMail>[0]);
    }

    return NextResponse.json({ success: true, data: { _id: application._id } }, { status: 201 });
  } catch (error: unknown) {
    console.error('Careers API Error:', error);
    return NextResponse.json({
      success: false,
      error: 'Server Error',
      ...(isDev && { details: error instanceof Error ? error.message : 'Unknown error' }),
    }, { status: 500 });
  }
}
