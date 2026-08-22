import mongoose from 'mongoose';
import * as XLSX from 'xlsx';

const DEFAULT_META_SHEET_ID = '1tVgMpHWRHIXozGO32Mmvc2r0xdYuiPkJptpaDjm3eA8';
const ACTIVE_THRESHOLD_MS = 2 * 24 * 60 * 60 * 1000;

function normalizePhone(raw) {
  if (!raw) return '';
  let str = String(raw).trim();
  str = str.replace(/^p:\+?/, '');
  str = str.replace(/\D/g, '');
  if (str.length === 12 && str.startsWith('91')) {
    str = str.slice(2);
  }
  return str;
}

function parseDateSafe(val) {
  if (!val) return null;
  if (val instanceof Date && !isNaN(val.getTime())) return val;
  if (typeof val === 'number') {
    const parsed = new Date((val - (25567 + 2)) * 86400 * 1000);
    if (!isNaN(parsed.getTime())) return parsed;
  }
  if (typeof val === 'string') {
    const clean = val.trim();
    const d = new Date(clean);
    if (!isNaN(d.getTime())) return d;
  }
  return null;
}

function parseSheetData(workbook, sheetName) {
  const ws = workbook.Sheets[sheetName];
  if (!ws) return { sheetName, totalRows: 0, latestLeadDate: null, isActive: false, leads: [] };

  const rawRows = XLSX.utils.sheet_to_json(ws, { header: 1, defval: '' });
  if (rawRows.length === 0) return { sheetName, totalRows: 0, latestLeadDate: null, isActive: false, leads: [] };

  const leads = [];
  let latestLeadDate = null;

  for (let r = 0; r < rawRows.length; r++) {
    const row = rawRows[r];
    if (!row || row.length === 0) continue;

    // 1. Locate phone number column
    let phoneIdx = -1;
    let cleanPhone = '';
    let rawPhone = '';

    for (let i = 0; i < row.length; i++) {
      const val = String(row[i] || '').trim();
      if (!val) continue;
      const testPhone = normalizePhone(val);
      if (testPhone.length === 10 && /^[6-9]\d{9}$/.test(testPhone)) {
        phoneIdx = i;
        cleanPhone = testPhone;
        rawPhone = val;
        break;
      }
    }

    if (phoneIdx === -1) continue;

    // 2. Full Name: In Meta exports, full_name is immediately to the left of phone_number (phoneIdx - 1)
    let name = '';
    if (phoneIdx > 0) {
      const candidateName = String(row[phoneIdx - 1] || '').trim();
      if (
        candidateName &&
        candidateName !== ' ' &&
        !candidateName.startsWith('p:') &&
        !candidateName.startsWith('l:') &&
        !candidateName.includes('@') &&
        !/^(within_1_month|1–3_months|after_3_months|today|this_week|next_week|3bhk|2bhk|4bhk|created|true|false|fb|ig)$/i.test(candidateName)
      ) {
        name = candidateName;
      }
    }

    // 3. Email: In Meta exports, email is immediately to the right of phone_number (phoneIdx + 1)
    let email = '';
    if (phoneIdx + 1 < row.length) {
      const candidateEmail = String(row[phoneIdx + 1] || '').trim();
      if (candidateEmail.includes('@') && candidateEmail.includes('.')) {
        email = candidateEmail.toLowerCase();
      }
    }
    if (!email) {
      for (let i = 0; i < row.length; i++) {
        const val = String(row[i] || '').trim();
        if (val.includes('@') && val.includes('.') && !val.includes(' ')) {
          email = val.toLowerCase();
          break;
        }
      }
    }

    // Fallback for Name if blank: derive from email
    if (!name && email) {
      const prefix = email.split('@')[0].replace(/[0-9._-]/g, ' ').trim();
      if (prefix.length >= 2) {
        name = prefix.split(' ').map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
      }
    }
    if (!name) name = 'Meta Lead';

    // 4. Meta IDs, Campaign, Ad, Form & Questionnaire details
    let leadId = '';
    let createdAt = null;
    let adId = '';
    let adName = '';
    let adsetName = '';
    let adsetId = '';
    let campaignId = '';
    let campaignName = '';
    let formId = '';
    let formName = '';
    let platform = 'fb';
    let isOrganic = false;
    let leadStatus = 'CREATED';
    let planning = '';
    let visitTimeline = '';
    let budget = '';
    let configuration = '';
    let city = '';
    const customAnswers = {};

    for (let i = 0; i < row.length; i++) {
      const val = row[i];
      if (val === undefined || val === null) continue;
      const str = String(val).trim();
      if (!str) continue;

      if (str.startsWith('l:') || (i === 0 && /^\d{14,19}$/.test(str))) {
        leadId = str.replace(/^l:/, '');
      } else if (str.startsWith('ag:')) {
        adId = str.replace(/^ag:/, '');
        if (i + 1 < row.length && !String(row[i + 1]).startsWith('as:')) {
          adName = String(row[i + 1]).trim();
        }
      } else if (str.startsWith('as:')) {
        adsetId = str.replace(/^as:/, '');
        if (i + 1 < row.length && !String(row[i + 1]).startsWith('c:')) {
          adsetName = String(row[i + 1]).trim();
        }
      } else if (str.startsWith('c:')) {
        campaignId = str.replace(/^c:/, '');
        if (i + 1 < row.length && !String(row[i + 1]).startsWith('f:')) {
          campaignName = String(row[i + 1]).trim();
        }
      } else if (str.startsWith('f:')) {
        formId = str.replace(/^f:/, '');
        if (i + 1 < row.length && String(row[i + 1]).toLowerCase() !== 'false' && String(row[i + 1]).toLowerCase() !== 'true') {
          formName = String(row[i + 1]).trim();
        }
      } else if (str.toLowerCase() === 'ig' || str.toLowerCase() === 'instagram') {
        platform = 'ig';
      } else if (str.toLowerCase() === 'fb' || str.toLowerCase() === 'facebook') {
        platform = 'fb';
      } else if (str.toLowerCase() === 'created' || str.toLowerCase() === 'follow up') {
        leadStatus = str;
      }

      // Check Date
      if (!createdAt) {
        const d = parseDateSafe(str);
        if (d && d.getFullYear() >= 2024 && d.getFullYear() <= 2027) {
          createdAt = d;
        }
      }

      // Questionnaire Answers
      if (/within_1_month|1–3_months|after_3_months|immediate|planning/i.test(str)) {
        planning = str;
      } else if (/today|tomorrow|this_week|next_week|weekend|soon/i.test(str)) {
        visitTimeline = str;
      } else if (
        !/created|false|true|ad\b|copy/i.test(str) &&
        (/₹|cr\b|lakh|budget|crore/i.test(str) || /^₹?[\d.,\s]+(?:cr|lakh|crore)?$/i.test(str)) &&
        !str.startsWith('ag:') &&
        !str.startsWith('as:') &&
        !str.startsWith('c:')
      ) {
        budget = str;
      } else if (/^(1bhk|2bhk|3bhk|4bhk|3\s*bhk|2\s*bhk|plot|villa|commercial)$/i.test(str)) {
        configuration = str;
      }
    }

    if (!createdAt) createdAt = new Date();

    if (!latestLeadDate || createdAt > latestLeadDate) {
      latestLeadDate = createdAt;
    }

    leads.push({
      sheetName,
      leadId,
      name,
      phone: cleanPhone,
      rawPhone,
      email,
      campaignName,
      campaignId,
      adName,
      adId,
      adsetName,
      adsetId,
      formName,
      formId,
      platform,
      isOrganic,
      budget,
      planning,
      visitTimeline,
      configuration,
      city,
      leadStatus,
      notes: '',
      customAnswers,
      createdAt,
    });
  }

  const now = new Date();
  const isActive = !!latestLeadDate && (now.getTime() - latestLeadDate.getTime()) <= ACTIVE_THRESHOLD_MS;

  return {
    sheetName,
    totalRows: leads.length,
    latestLeadDate,
    isActive,
    leads,
  };
}

async function run() {
  const uri = process.env.MONGODB_URI;
  if (!uri) throw new Error('MONGODB_URI is missing');

  await mongoose.connect(uri, { dbName: process.env.MONGODB_DB || 'SSRealty' });
  console.log('✅ Connected to MongoDB successfully.');

  const db = mongoose.connection.db;
  const leadsColl = db.collection('metasheetleads');
  const configColl = db.collection('metacampaignconfigs');

  console.log('--- Fetching Live Google Sheet ---');
  const exportUrl = `https://docs.google.com/spreadsheets/d/${DEFAULT_META_SHEET_ID}/export?format=xlsx`;
  const response = await fetch(exportUrl, {
    headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) SSRealty/1.0' },
  });
  const arrayBuffer = await response.arrayBuffer();
  const workbook = XLSX.read(Buffer.from(arrayBuffer), { type: 'buffer' });

  const sheetNames = workbook.SheetNames;
  console.log(`Processing ${sheetNames.length} sheet tabs with upgraded parser...`);

  let totalUpdated = 0;
  let totalNew = 0;

  for (let i = 0; i < sheetNames.length; i++) {
    const sheetName = sheetNames[i];
    const parsed = parseSheetData(workbook, sheetName);

    if (parsed.leads.length > 0) {
      const bulkOps = parsed.leads.map((lead) => {
        const filter = lead.leadId
          ? { sheetName: lead.sheetName, leadId: lead.leadId }
          : { sheetName: lead.sheetName, phone: lead.phone };

        return {
          updateOne: {
            filter,
            update: {
              $setOnInsert: {
                sheetName: lead.sheetName,
                leadId: lead.leadId,
                phone: lead.phone,
                rawPhone: lead.rawPhone,
                createdAt: lead.createdAt,
                syncedAt: new Date(),
              },
              $set: {
                name: lead.name,
                email: lead.email,
                campaignName: lead.campaignName,
                campaignId: lead.campaignId,
                adName: lead.adName,
                adId: lead.adId,
                adsetName: lead.adsetName,
                adsetId: lead.adsetId,
                formName: lead.formName,
                formId: lead.formId,
                platform: lead.platform,
                isOrganic: lead.isOrganic,
                budget: lead.budget,
                planning: lead.planning,
                visitTimeline: lead.visitTimeline,
                configuration: lead.configuration,
                city: lead.city,
                leadStatus: lead.leadStatus,
                customAnswers: lead.customAnswers,
              },
            },
            upsert: true,
          },
        };
      });

      const bulkRes = await leadsColl.bulkWrite(bulkOps, { ordered: false });
      totalNew += bulkRes.upsertedCount || 0;
      totalUpdated += bulkRes.modifiedCount || 0;
    }

    const dbTotalForSheet = await leadsColl.countDocuments({ sheetName });
    const latestDoc = await leadsColl.findOne({ sheetName }, { sort: { createdAt: -1 } });
    const latestDate = latestDoc?.createdAt ? new Date(latestDoc.createdAt) : parsed.latestLeadDate;

    const now = new Date();
    const isActive = !!latestDate && (now.getTime() - latestDate.getTime()) <= ACTIVE_THRESHOLD_MS;

    await configColl.updateOne(
      { sheetName },
      {
        $set: {
          sheetName,
          sheetId: DEFAULT_META_SHEET_ID,
          totalLeads: dbTotalForSheet,
          latestLeadDate: latestDate,
          isActive,
          status: isActive ? 'active' : 'inactive',
          lastSyncedAt: new Date(),
          order: i,
        },
      },
      { upsert: true }
    );

    console.log(`- [${isActive ? '🟢 ACTIVE' : '🔴 INACTIVE'}] "${sheetName}": ${dbTotalForSheet} leads updated`);
  }

  // Verify sample lead Yog Raj 9810178984
  const sampleDoc = await leadsColl.findOne({ phone: '9810178984' });
  console.log('\n🌟 Verified MongoDB Lead for 9810178984:');
  console.log({
    name: sampleDoc?.name,
    phone: sampleDoc?.phone,
    sheetName: sampleDoc?.sheetName,
    planning: sampleDoc?.planning,
    visitTimeline: sampleDoc?.visitTimeline,
    campaignName: sampleDoc?.campaignName,
    formName: sampleDoc?.formName
  });

  const totalWithRealNames = await leadsColl.countDocuments({ name: { $ne: 'Meta Lead' } });
  const grandTotal = await leadsColl.countDocuments();
  console.log(`\n🎉 Total Leads in DB: ${grandTotal}`);
  console.log(`🎉 Leads with Accurate Customer Names: ${totalWithRealNames} / ${grandTotal} (${((totalWithRealNames/grandTotal)*100).toFixed(1)}%)`);

  await mongoose.disconnect();
  console.log('✅ Disconnected from MongoDB. Sync complete!');
}

run().catch(console.error);
