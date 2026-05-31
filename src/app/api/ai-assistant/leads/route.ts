import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import AiLead from '@/models/AiLead';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { name, phone, email, location, propertyType, budget, message, source, sessionId } = body;

    if (!name?.trim() || !phone?.trim()) {
      return NextResponse.json(
        { success: false, error: 'Name and phone are required' },
        { status: 400 }
      );
    }

    // Basic phone validation
    const cleanPhone = phone.replace(/\D/g, '');
    if (cleanPhone.length < 10) {
      return NextResponse.json(
        { success: false, error: 'Please enter a valid 10-digit mobile number' },
        { status: 400 }
      );
    }

    await connectDB();

    const lead = await AiLead.create({
      name: name.trim(),
      phone: phone.trim(),
      email: email?.trim() || undefined,
      location: location?.trim() || undefined,
      propertyType: propertyType?.trim() || undefined,
      budget: budget?.trim() || undefined,
      message: message?.trim() || undefined,
      source: source || 'chat',
      sessionId: sessionId || undefined,
      status: 'new',
    });

    return NextResponse.json({ success: true, leadId: lead._id.toString() }, { status: 201 });
  } catch (error) {
    console.error('Lead creation error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to save your details. Please try again.' },
      { status: 500 }
    );
  }
}

export async function GET(req: NextRequest) {
  try {
    const secret = req.headers.get('x-admin-secret');
    if (secret !== process.env.ADMIN_SECRET) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();
    const leads = await AiLead.find({}).sort({ createdAt: -1 }).limit(100).lean();
    return NextResponse.json({ success: true, data: leads });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ success: false, error: 'Server Error' }, { status: 500 });
  }
}
