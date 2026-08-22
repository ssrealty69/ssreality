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

  let headerRowIndex = -1;
  const colMap = {};
  const headerKeys = [];

  for (let r = 0; r < Math.min(10, rawRows.length); r++) {
    const row = rawRows[r] || [];
    const stringRow = row.map(c => String(c).toLowerCase().trim());

    const hasPhone = stringRow.some(c => c.includes('phone') || c.includes('mobile'));
    const hasTime = stringRow.some(c => c.includes('created') || c.includes('time') || c.includes('date'));
    const hasName = stringRow.some(c => c.includes('name'));

    if ((hasPhone && hasTime) || (hasPhone && hasName)) {
      headerRowIndex = r;
      row.forEach((col, idx) => {
        const val = String(col).toLowerCase().trim();
        if (!val) return;
        headerKeys[idx] = String(col).trim();

        if (val === 'id' || val === 'lead_id') colMap.id = idx;
        else if (val.includes('created_time') || val.includes('created time') || val === 'date') colMap.created_time = idx;
        else if (val === 'ad_id') colMap.ad_id = idx;
        else if (val === 'ad_name') colMap.ad_name = idx;
        else if (val === 'adset_id') colMap.adset_id = idx;
        else if (val === 'adset_name') colMap.adset_name = idx;
        else if (val === 'campaign_id') colMap.campaign_id = idx;
        else if (val === 'campaign_name') colMap.campaign_name = idx;
        else if (val === 'form_id') colMap.form_id = idx;
        else if (val === 'form_name') colMap.form_name = idx;
        else if (val === 'platform') colMap.platform = idx;
        else if (val === 'is_organic') colMap.is_organic = idx;
        else if (val.includes('full_name') || val === 'name' || val === 'full name') colMap.full_name = idx;
        else if (val.includes('phone') || val.includes('mobile')) colMap.phone = idx;
        else if (val.includes('email')) colMap.email = idx;
        else if (val.includes('lead_status') || val === 'status') colMap.lead_status = idx;
        else if (val.includes('budget')) colMap.budget = idx;
        else if (val.includes('when_are_you') || val.includes('planning_to_buy') || val.includes('planning')) colMap.planning = idx;
        else if (val.includes('visit') || val.includes('how_soon')) colMap.visitTimeline = idx;
        else if (val.includes('configuration') || val.includes('preferred')) colMap.configuration = idx;
        else if (val.includes('city')) colMap.city = idx;
      });
      break;
    }
  }

  if (headerRowIndex === -1) headerRowIndex = 0;

  const leads = [];
  let latestLeadDate = null;

  for (let r = 0; r < rawRows.length; r++) {
    if (r === headerRowIndex) continue;
    const row = rawRows[r];
    if (!row || row.length === 0) continue;

    const rowStr = row.map(c => String(c).toLowerCase().trim()).join(' ');
    if (rowStr.includes('created_time') && rowStr.includes('phone_number')) continue;

    let leadId = colMap.id !== undefined ? String(row[colMap.id] || '').trim() : '';
    let createdTimeRaw = colMap.created_time !== undefined ? row[colMap.created_time] : null;
    let name = colMap.full_name !== undefined ? String(row[colMap.full_name] || '').trim() : '';
    let phoneRaw = colMap.phone !== undefined ? String(row[colMap.phone] || '').trim() : '';
    let email = colMap.email !== undefined ? String(row[colMap.email] || '').trim() : '';
    let campaignName = colMap.campaign_name !== undefined ? String(row[colMap.campaign_name] || '').trim() : '';
    let campaignId = colMap.campaign_id !== undefined ? String(row[colMap.campaign_id] || '').trim() : '';
    let adName = colMap.ad_name !== undefined ? String(row[colMap.ad_name] || '').trim() : '';
    let adId = colMap.ad_id !== undefined ? String(row[colMap.ad_id] || '').trim() : '';
    let adsetName = colMap.adset_name !== undefined ? String(row[colMap.adset_name] || '').trim() : '';
    let adsetId = colMap.adset_id !== undefined ? String(row[colMap.adset_id] || '').trim() : '';
    let formName = colMap.form_name !== undefined ? String(row[colMap.form_name] || '').trim() : '';
    let formId = colMap.form_id !== undefined ? String(row[colMap.form_id] || '').trim() : '';
    let platform = colMap.platform !== undefined ? String(row[colMap.platform] || '').trim() : 'fb';
    let isOrganic = colMap.is_organic !== undefined ? String(row[colMap.is_organic]).toLowerCase() === 'true' : false;
    let budget = colMap.budget !== undefined ? String(row[colMap.budget] || '').trim() : '';
    let planning = colMap.planning !== undefined ? String(row[colMap.planning] || '').trim() : '';
    let visitTimeline = colMap.visitTimeline !== undefined ? String(row[colMap.visitTimeline] || '').trim() : '';
    let configuration = colMap.configuration !== undefined ? String(row[colMap.configuration] || '').trim() : '';
    let city = colMap.city !== undefined ? String(row[colMap.city] || '').trim() : '';
    let leadStatus = colMap.lead_status !== undefined ? String(row[colMap.lead_status] || '').trim() : 'CREATED';

    let cleanPhone = normalizePhone(phoneRaw);
    if (!cleanPhone || cleanPhone.length < 10) {
      for (const cell of row) {
        const testPhone = normalizePhone(cell);
        if (testPhone.length >= 10 && testPhone.length <= 13) {
          cleanPhone = testPhone.slice(-10);
          phoneRaw = String(cell);
          break;
        }
      }
    }

    if (!name && email) name = email.split('@')[0];

    let parsedDate = parseDateSafe(createdTimeRaw);
    if (!parsedDate) {
      for (const cell of row) {
        if (typeof cell === 'string' && /^\d{4}-\d{2}-\d{2}/.test(cell.trim())) {
          parsedDate = parseDateSafe(cell.trim());
          if (parsedDate) break;
        }
      }
    }

    if (!cleanPhone && !name && !email) continue;

    if (parsedDate) {
      if (!latestLeadDate || parsedDate > latestLeadDate) {
        latestLeadDate = parsedDate;
      }
    }

    const customAnswers = {};
    row.forEach((val, idx) => {
      const headerTitle = headerKeys[idx] || `Column_${idx}`;
      if (val !== undefined && val !== null && String(val).trim() !== '') {
        customAnswers[headerTitle] = String(val).trim();
      }
    });

    leads.push({
      sheetName,
      leadId: leadId.replace(/^l:/, ''),
      name: name || 'Lead',
      phone: cleanPhone || phoneRaw,
      rawPhone: phoneRaw,
      email,
      campaignName,
      campaignId: campaignId.replace(/^c:/, ''),
      adName,
      adId: adId.replace(/^ag:/, ''),
      adsetName,
      adsetId: adsetId.replace(/^as:/, ''),
      formName,
      formId: formId.replace(/^f:/, ''),
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
      createdAt: parsedDate || new Date(),
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

  // Create indexes
  await leadsColl.createIndex({ sheetName: 1, phone: 1 });
  await leadsColl.createIndex({ sheetName: 1, leadId: 1 });
  await leadsColl.createIndex({ createdAt: -1 });
  await configColl.createIndex({ sheetName: 1 }, { unique: true });

  console.log('--- Fetching Live Google Sheet ---');
  const exportUrl = `https://docs.google.com/spreadsheets/d/${DEFAULT_META_SHEET_ID}/export?format=xlsx`;
  const response = await fetch(exportUrl, {
    headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) SSRealty/1.0' },
  });
  const arrayBuffer = await response.arrayBuffer();
  const workbook = XLSX.read(Buffer.from(arrayBuffer), { type: 'buffer' });

  const sheetNames = workbook.SheetNames;
  console.log(`Found ${sheetNames.length} sheet tabs in Google Sheet.`);

  let totalNewInserted = 0;
  let totalUpdated = 0;

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
      totalNewInserted += bulkRes.upsertedCount || 0;
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

    console.log(`- [${isActive ? '🟢 ACTIVE' : '🔴 INACTIVE'}] "${sheetName}": ${dbTotalForSheet} leads in DB | Latest: ${latestDate ? latestDate.toISOString() : 'None'}`);
  }

  const grandTotal = await leadsColl.countDocuments();
  const activeCount = await configColl.countDocuments({ isActive: true });
  const inactiveCount = await configColl.countDocuments({ isActive: false });

  console.log(`\n================ SYNC SUMMARY ================`);
  console.log(`Total Sheets Synced: ${sheetNames.length}`);
  console.log(`Total Leads in Database: ${grandTotal}`);
  console.log(`Active Campaigns: ${activeCount}`);
  console.log(`Inactive Campaigns: ${inactiveCount}`);
  console.log(`New Leads Inserted: ${totalNewInserted}`);
  console.log(`Existing Leads Updated: ${totalUpdated}`);

  await mongoose.disconnect();
  console.log('✅ Disconnected from MongoDB. Sync complete!');
}

run().catch(console.error);
