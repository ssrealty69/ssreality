import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import PropertyEnquiry from '@/models/PropertyEnquiry';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const pageAccessToken = body.pageAccessToken || process.env.META_PAGE_ACCESS_TOKEN;
    const formId = body.formId;

    if (!pageAccessToken) {
      return NextResponse.json({
        success: false,
        error: 'Meta Page Access Token zaroori hai'
      }, { status: 400 });
    }

    if (!formId) {
      return NextResponse.json({
        success: false,
        error: 'Meta Form ID zaroori hai'
      }, { status: 400 });
    }

    await connectDB();

    let nextUrl = `https://graph.facebook.com/v19.0/${formId}/leads?access_token=${pageAccessToken}&limit=100`;
    let totalSynced = 0;
    let totalSkipped = 0;

    while (nextUrl) {
      const response = await fetch(nextUrl);
      const data = await response.json();

      if (data.error) {
        return NextResponse.json({
          success: false,
          error: data.error.message
        }, { status: 400 });
      }

      const leads = data.data || [];
      if (leads.length === 0) break;

      for (const item of leads) {
        let fullName = 'Meta Lead';
        let phone = '';
        let email = '';
        let notes: string[] = [];

        for (const field of item.field_data || []) {
          const name = field.name?.toLowerCase();
          const val = field.values?.[0] || '';

          if (name === 'full_name' || name === 'name') {
            fullName = val;
          } else if (name === 'phone_number' || name === 'phone') {
            phone = val;
          } else if (name === 'email') {
            email = val;
          } else {
            notes.push(`${field.name}: ${val}`);
          }
        }

        if (phone) {
          const cleanPhone = phone.replace(/[^0-9]/g, '');
          // Check if already exists in PropertyEnquiry
          const existing = await PropertyEnquiry.findOne({
            phone: { $regex: cleanPhone.slice(-10) }
          });

          if (!existing) {
            await PropertyEnquiry.create({
              name: fullName,
              phone: phone,
              email: email,
              requirement: notes.join(' | ') || `Meta Form ID: ${formId}`,
              propertyId: formId,
              propertyTitle: `Meta Ad Lead (${item.created_time ? new Date(item.created_time).toLocaleDateString() : 'Historical'})`,
              propertyUrl: 'https://facebook.com/ads',
              isBrochureDownload: false,
              source: 'Meta Lead Ads',
              status: 'new',
              createdAt: item.created_time ? new Date(item.created_time) : new Date(),
            });
            totalSynced++;
          } else {
            totalSkipped++;
          }
        }
      }

      nextUrl = data.paging?.next || null;
    }

    return NextResponse.json({
      success: true,
      message: `Meta Leads Sync Complete: ${totalSynced} new leads added, ${totalSkipped} existing skipped.`,
      data: {
        synced: totalSynced,
        skipped: totalSkipped,
      }
    });

  } catch (error: any) {
    console.error('Meta Bulk Sync Error:', error);
    return NextResponse.json({
      success: false,
      error: 'Server error',
      details: error.message
    }, { status: 500 });
  }
}