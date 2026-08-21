import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import PropertyEnquiry from '@/models/PropertyEnquiry';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json({ success: false, error: 'CSV file required hai' }, { status: 400 });
    }

    const text = await file.text();
    const lines = text.split(/\r?\n/).filter(line => line.trim().length > 0);

    if (lines.length < 2) {
      return NextResponse.json({ success: false, error: 'CSV file khali hai ya format galat hai' }, { status: 400 });
    }

    // Parse header
    const headers = parseCSVLine(lines[0]).map(h => h.toLowerCase().trim());
    
    // Find column indexes
    let nameIdx = headers.findIndex(h => h.includes('full_name') || h.includes('full name') || h.includes('name'));
    let phoneIdx = headers.findIndex(h => h.includes('phone') || h.includes('mobile') || h.includes('contact'));
    let emailIdx = headers.findIndex(h => h.includes('email'));
    let campaignIdx = headers.findIndex(h => h.includes('campaign') || h.includes('ad_name') || h.includes('ad name') || h.includes('form_name'));
    let createdIdx = headers.findIndex(h => h.includes('created_time') || h.includes('created') || h.includes('date') || h.includes('time'));

    if (phoneIdx === -1) {
      return NextResponse.json({
        success: false,
        error: 'CSV file me Phone / Mobile column nahi mila. Kripya standard Meta CSV upload karein.'
      }, { status: 400 });
    }

    await connectDB();

    let totalImported = 0;
    let totalDuplicates = 0;

    for (let i = 1; i < lines.length; i++) {
      const row = parseCSVLine(lines[i]);
      if (row.length === 0) continue;

      const rawPhone = row[phoneIdx] || '';
      const cleanPhone = rawPhone.replace(/[^0-9]/g, '');

      if (!cleanPhone || cleanPhone.length < 8) continue;

      const fullName = (nameIdx !== -1 && row[nameIdx]) ? row[nameIdx].trim() : 'Meta Lead';
      const email = (emailIdx !== -1 && row[emailIdx]) ? row[emailIdx].trim() : '';
      const campaignName = (campaignIdx !== -1 && row[campaignIdx]) ? row[campaignIdx].trim() : 'Meta Ad Campaign';
      const createdDateStr = (createdIdx !== -1 && row[createdIdx]) ? row[createdIdx].trim() : null;

      // Extract remaining columns as notes/requirements
      const otherNotes: string[] = [];
      headers.forEach((h, idx) => {
        if (idx !== nameIdx && idx !== phoneIdx && idx !== emailIdx && idx !== campaignIdx && idx !== createdIdx) {
          if (row[idx] && row[idx].trim().length > 0) {
            otherNotes.push(`${h}: ${row[idx].trim()}`);
          }
        }
      });

      // Check duplicate by phone number (last 10 digits)
      const searchNumber = cleanPhone.slice(-10);
      const existing = await PropertyEnquiry.findOne({
        phone: { $regex: searchNumber }
      });

      if (!existing) {
        await PropertyEnquiry.create({
          name: fullName,
          phone: rawPhone,
          email: email,
          requirement: otherNotes.join(' | ') || `Campaign: ${campaignName}`,
          propertyId: 'meta-csv-import',
          propertyTitle: `Meta Lead (${campaignName})`,
          propertyUrl: 'https://facebook.com/ads',
          isBrochureDownload: false,
          source: 'Meta Lead Ads',
          status: 'new',
          createdAt: createdDateStr ? new Date(createdDateStr) : new Date(),
        });
        totalImported++;
      } else {
        totalDuplicates++;
      }
    }

    return NextResponse.json({
      success: true,
      message: `Import successful: ${totalImported} new Meta leads imported, ${totalDuplicates} duplicates skipped.`,
      data: {
        imported: totalImported,
        duplicates: totalDuplicates,
        totalRows: lines.length - 1
      }
    });

  } catch (error: any) {
    console.error('CSV Upload Error:', error);
    return NextResponse.json({
      success: false,
      error: 'CSV processing failed',
      details: error.message
    }, { status: 500 });
  }
}

function parseCSVLine(text: string): string[] {
  const result: string[] = [];
  let cur = '';
  let inQuotes = false;

  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    if (c === '"') {
      inQuotes = !inQuotes;
    } else if (c === ',' && !inQuotes) {
      result.push(cur.trim());
      cur = '';
    } else {
      cur += c;
    }
  }
  result.push(cur.trim());
  return result;
}