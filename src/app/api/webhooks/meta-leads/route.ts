import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import PropertyEnquiry from '@/models/PropertyEnquiry';
import AgentLead from '@/models/AgentLead';

export const dynamic = 'force-dynamic';

// 1. Meta Webhook Verification (GET)
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const mode = searchParams.get('hub.mode');
  const token = searchParams.get('hub.verify_token');
  const challenge = searchParams.get('hub.challenge');

  const VERIFY_TOKEN = process.env.META_VERIFY_TOKEN || 'ssrealty_meta_webhook_2026';

  if (mode === 'subscribe' && token === VERIFY_TOKEN) {
    console.log('✅ Meta Webhook Verified Successfully!');
    return new NextResponse(challenge, { status: 200 });
  }

  return NextResponse.json({ error: 'Forbidden. Verification token mismatch.' }, { status: 403 });
}

// 2. Meta Lead Notification Receiver (POST)
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    console.log('📩 Incoming Meta Lead Webhook Event:', JSON.stringify(body, null, 2));

    if (body.object !== 'page') {
      return NextResponse.json({ status: 'ignored' }, { status: 200 });
    }

    const PAGE_ACCESS_TOKEN = process.env.META_PAGE_ACCESS_TOKEN;

    await connectDB();

    for (const entry of body.entry || []) {
      for (const change of entry.changes || []) {
        if (change.field === 'leadgen') {
          const leadgenId = change.value?.leadgen_id;
          const formId = change.value?.form_id;
          const pageId = change.value?.page_id;
          const adId = change.value?.ad_id;

          console.log(`Processing Meta Leadgen ID: ${leadgenId}`);

          if (leadgenId && PAGE_ACCESS_TOKEN) {
            // Fetch lead details from Meta Graph API
            try {
              const graphRes = await fetch(
                `https://graph.facebook.com/v19.0/${leadgenId}?access_token=${PAGE_ACCESS_TOKEN}`
              );
              const leadData = await graphRes.json();

              if (leadData && leadData.field_data) {
                let fullName = 'Meta Lead';
                let phone = '';
                let email = '';
                let notes: string[] = [];

                for (const field of leadData.field_data) {
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
                  const requirement = notes.join(' | ') || `Meta Form ID: ${formId || ''}`;
                  
                  // Insert into PropertyEnquiry as Meta Lead
                  const newLead = await PropertyEnquiry.create({
                    name: fullName,
                    phone: phone,
                    email: email,
                    requirement: requirement,
                    propertyId: formId || 'meta-ad',
                    propertyTitle: `Meta Ad Lead (${leadData.campaign_name || 'Facebook/Instagram'})`,
                    propertyUrl: 'https://facebook.com/ads',
                    isBrochureDownload: false,
                    source: 'Meta Lead Ads',
                    status: 'new',
                  });

                  console.log(`✅ Saved Meta Lead: ${fullName} (${phone}) - ID: ${newLead._id}`);
                }
              }
            } catch (graphErr: any) {
              console.error('Error fetching lead from Meta Graph API:', graphErr);
            }
          }
        }
      }
    }

    return NextResponse.json({ success: true, message: 'Event processed' }, { status: 200 });
  } catch (error: any) {
    console.error('Meta Webhook Error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}