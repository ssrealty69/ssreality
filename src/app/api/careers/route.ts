import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import JobApplication from '@/models/JobApplication';
import nodemailer from 'nodemailer';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const name = formData.get('name') as string;
    const phone = formData.get('phone') as string;
    const age = formData.get('age') as string;
    const position = formData.get('position') as string;
    const resume = formData.get('resume') as File | null;

    if (!name || !phone || !age || !position) {
      return NextResponse.json({ success: false, error: 'All mandatory fields are required' }, { status: 400 });
    }

    await connectDB();

    // Save to DB (minimal details for now)
    const application = await JobApplication.create({
      name,
      phone,
      age,
      position,
      resumeUrl: resume ? 'Attached to Email' : 'Not Provided'
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

      const mailOptions: any = {
        from: `"SS Realty Careers" <${process.env.EMAIL_USER}>`,
        to: "ssrealtyteams@gmail.com",
        subject: `💼 New Job Application: ${position} from ${name}`,
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
                  <td style="padding: 12px 0; font-weight: bold; color: #c9a227; font-size: 16px;">${position}</td>
                </tr>
                <tr>
                  <td style="padding: 12px 0; color: #6b6450; font-weight: 600;">Full Name:</td>
                  <td style="padding: 12px 0; font-weight: 500;">${name}</td>
                </tr>
                <tr>
                  <td style="padding: 12px 0; color: #6b6450; font-weight: 600;">Phone Number:</td>
                  <td style="padding: 12px 0;"><a href="tel:+91${phone}" style="color: #c9a227; text-decoration: none; font-weight: 600;">+91 ${phone}</a></td>
                </tr>
                <tr>
                  <td style="padding: 12px 0; color: #6b6450; font-weight: 600;">Age:</td>
                  <td style="padding: 12px 0; font-weight: 500;">${age} Years</td>
                </tr>
                <tr>
                  <td style="padding: 12px 0; color: #6b6450; font-weight: 600;">Resume:</td>
                  <td style="padding: 12px 0; font-weight: 500; color: ${resume ? '#22c55e' : '#ef4444'};">
                    ${resume ? '📎 Attached to this email' : '❌ Not Provided'}
                  </td>
                </tr>
              </table>

              <div style="margin-top: 35px; text-align: center; border-top: 1px solid #e8d5a3; padding-top: 25px;">
                <a href="https://wa.me/91${phone}?text=Hi ${name}, we received your application for the ${position} role at SS Realty..." 
                   style="display: inline-block; background: #1A1800; color: #c9a227; border: 1px solid #c9a227; padding: 14px 30px; border-radius: 12px; text-decoration: none; font-weight: bold; font-size: 14px; transition: all 0.3s;">
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

      if (resume) {
        const buffer = Buffer.from(await resume.arrayBuffer());
        mailOptions.attachments = [{
          filename: resume.name,
          content: buffer,
        }];
      }

      await transporter.sendMail(mailOptions);
    }

    return NextResponse.json({ success: true, data: application }, { status: 201 });
  } catch (error: any) {
    console.error('Careers API Error:', error);
    return NextResponse.json({ 
      success: false, 
      error: 'Server Error', 
      details: error.message 
    }, { status: 500 });
  }
}
