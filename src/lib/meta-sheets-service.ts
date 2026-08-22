import * as XLSX from 'xlsx';
import { connectDB } from '@/lib/mongodb';
import MetaSheetLead, { IMetaSheetLead } from '@/models/MetaSheetLead';
import MetaCampaignConfig, { IMetaCampaignConfig } from '@/models/MetaCampaignConfig';

export const DEFAULT_META_SHEET_ID = '1tVgMpHWRHIXozGO32Mmvc2r0xdYuiPkJptpaDjm3eA8';
export const ACTIVE_THRESHOLD_MS = 2 * 24 * 60 * 60 * 1000; // 48 Hours / 2 Days

export function normalizePhone(raw: any): string {
  if (!raw) return '';
  let str = String(raw).trim();
  str = str.replace(/^p:\+?/, '');
  str = str.replace(/\D/g, '');
  if (str.length === 12 && str.startsWith('91')) {
    str = str.slice(2);
  }
  return str;
}

export function parseDateSafe(val: any): Date | null {
  if (!val) return null;
  if (val instanceof Date && !isNaN(val.getTime())) return val;
  
  // Excel serial date number
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

export interface ParsedLeadRow {
  sheetName: string;
  leadId: string;
  name: string;
  phone: string;
  rawPhone: string;
  email: string;
  campaignName: string;
  campaignId: string;
  adName: string;
  adId: string;
  adsetName: string;
  adsetId: string;
  formName: string;
  formId: string;
  platform: string;
  isOrganic: boolean;
  budget: string;
  planning: string;
  visitTimeline: string;
  configuration: string;
  city: string;
  leadStatus: string;
  notes: string;
  customAnswers: Record<string, any>;
  createdAt: Date;
}

export interface ParsedSheetResult {
  sheetName: string;
  totalRows: number;
  latestLeadDate: Date | null;
  isActive: boolean;
  leads: ParsedLeadRow[];
}

export function parseSheetData(workbook: XLSX.WorkBook, sheetName: string): ParsedSheetResult {
  const ws = workbook.Sheets[sheetName];
  if (!ws) {
    return { sheetName, totalRows: 0, latestLeadDate: null, isActive: false, leads: [] };
  }

  const rawRows: any[][] = XLSX.utils.sheet_to_json(ws, { header: 1, defval: '' });
  if (rawRows.length === 0) {
    return { sheetName, totalRows: 0, latestLeadDate: null, isActive: false, leads: [] };
  }

  // 1. Detect header row
  let headerRowIndex = -1;
  const colMap: Record<string, number> = {};
  const headerKeys: string[] = [];

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

  if (headerRowIndex === -1) {
    headerRowIndex = 0;
  }

  const leads: ParsedLeadRow[] = [];
  let latestLeadDate: Date | null = null;

  for (let r = 0; r < rawRows.length; r++) {
    if (r === headerRowIndex) continue;
    const row = rawRows[r];
    if (!row || row.length === 0) continue;

    // Skip if row is a repeated header
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

    // Extract clean phone
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

    if (!name && email) {
      name = email.split('@')[0];
    }

    // Parse Date
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

    // Capture custom answers
    const customAnswers: Record<string, any> = {};
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

export async function fetchAndSyncGoogleSheets(sheetId = DEFAULT_META_SHEET_ID) {
  await connectDB();

  const exportUrl = `https://docs.google.com/spreadsheets/d/${sheetId}/export?format=xlsx`;
  const response = await fetch(exportUrl, {
    headers: {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) SSRealty/1.0',
    },
    cache: 'no-store',
  });

  if (!response.ok) {
    throw new Error(`Google Sheets export failed with status HTTP ${response.status}: ${response.statusText}`);
  }

  const arrayBuffer = await response.arrayBuffer();
  const workbook = XLSX.read(Buffer.from(arrayBuffer), { type: 'buffer' });

  const sheetNames = workbook.SheetNames;
  const syncResults: any[] = [];
  let totalNewInserted = 0;
  let totalUpdated = 0;
  let grandTotalLeadsInDB = 0;

  for (let i = 0; i < sheetNames.length; i++) {
    const sheetName = sheetNames[i];
    const parsed = parseSheetData(workbook, sheetName);

    if (parsed.leads.length > 0) {
      // Bulk upsert into MongoDB — NEVER DELETE existing records
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

      const bulkRes = await MetaSheetLead.bulkWrite(bulkOps, { ordered: false });
      const inserted = bulkRes.upsertedCount || 0;
      const modified = bulkRes.modifiedCount || 0;

      totalNewInserted += inserted;
      totalUpdated += modified;
    }

    // Count true total in DB for this sheet (including any historically preserved leads)
    const dbTotalForSheet = await MetaSheetLead.countDocuments({ sheetName });
    grandTotalLeadsInDB += dbTotalForSheet;

    // Get true latest lead date from DB
    const latestDoc = await MetaSheetLead.findOne({ sheetName }).sort({ createdAt: -1 }).select('createdAt').lean();
    const latestDate = latestDoc?.createdAt ? new Date(latestDoc.createdAt) : parsed.latestLeadDate;
    
    const now = new Date();
    const isActive = !!latestDate && (now.getTime() - latestDate.getTime()) <= ACTIVE_THRESHOLD_MS;

    // Update Campaign Config
    await MetaCampaignConfig.findOneAndUpdate(
      { sheetName },
      {
        sheetName,
        sheetId,
        totalLeads: dbTotalForSheet,
        latestLeadDate: latestDate,
        isActive,
        status: isActive ? 'active' : 'inactive',
        lastSyncedAt: new Date(),
        order: i,
      },
      { upsert: true, new: true }
    );

    syncResults.push({
      sheetName,
      totalInSheet: parsed.leads.length,
      totalInDB: dbTotalForSheet,
      latestLeadDate: latestDate,
      isActive,
    });
  }

  return {
    success: true,
    totalSheets: sheetNames.length,
    totalNewInserted,
    totalUpdated,
    grandTotalLeadsInDB,
    syncResults,
  };
}

export interface GetMetaLeadsParams {
  sheetName?: string;
  status?: 'active' | 'inactive' | 'all';
  search?: string;
  platform?: string;
  startDate?: string;
  endDate?: string;
  page?: number;
  limit?: number;
}

export async function getMetaLeads(params: GetMetaLeadsParams) {
  await connectDB();

  const page = Math.max(1, Number(params.page) || 1);
  const limit = Math.max(1, Math.min(200, Number(params.limit) || 50));
  const skip = (page - 1) * limit;

  // 1. Fetch Campaign configs with active/inactive status
  const campaigns = await MetaCampaignConfig.find().sort({ order: 1, sheetName: 1 }).lean();

  const activeSheets = campaigns.filter(c => c.isActive).map(c => c.sheetName);
  const inactiveSheets = campaigns.filter(c => !c.isActive).map(c => c.sheetName);

  // 2. Build Query
  const query: Record<string, any> = {};

  if (params.sheetName && params.sheetName !== 'all') {
    query.sheetName = params.sheetName;
  } else if (params.status === 'active') {
    query.sheetName = { $in: activeSheets };
  } else if (params.status === 'inactive') {
    query.sheetName = { $in: inactiveSheets };
  }

  if (params.platform && params.platform !== 'all') {
    query.platform = { $regex: new RegExp(`^${params.platform}$`, 'i') };
  }

  if (params.search && params.search.trim()) {
    const s = params.search.trim();
    query.$or = [
      { name: { $regex: s, $options: 'i' } },
      { phone: { $regex: s, $options: 'i' } },
      { rawPhone: { $regex: s, $options: 'i' } },
      { email: { $regex: s, $options: 'i' } },
      { campaignName: { $regex: s, $options: 'i' } },
      { formName: { $regex: s, $options: 'i' } },
      { adName: { $regex: s, $options: 'i' } },
      { sheetName: { $regex: s, $options: 'i' } },
    ];
  }

  if (params.startDate || params.endDate) {
    query.createdAt = {};
    if (params.startDate) query.createdAt.$gte = new Date(params.startDate);
    if (params.endDate) query.createdAt.$lte = new Date(params.endDate);
  }

  const [leads, totalCount, totalAllLeads] = await Promise.all([
    MetaSheetLead.find(query).sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
    MetaSheetLead.countDocuments(query),
    MetaSheetLead.countDocuments(),
  ]);

  return {
    leads,
    pagination: {
      page,
      limit,
      totalCount,
      totalPages: Math.ceil(totalCount / limit),
    },
    metrics: {
      totalLeads: totalAllLeads,
      activeCampaignsCount: activeSheets.length,
      inactiveCampaignsCount: inactiveSheets.length,
      totalSheetsCount: campaigns.length,
    },
    campaigns,
  };
}

export async function generateMetaExportWorkbook(
  mode: 'all' | 'active' | 'inactive' | 'single',
  selectedSheet?: string
): Promise<Buffer> {
  await connectDB();

  const campaigns = await MetaCampaignConfig.find().sort({ order: 1, sheetName: 1 }).lean();
  let targetSheets: string[] = [];

  if (mode === 'single' && selectedSheet) {
    targetSheets = [selectedSheet];
  } else if (mode === 'active') {
    targetSheets = campaigns.filter(c => c.isActive).map(c => c.sheetName);
  } else if (mode === 'inactive') {
    targetSheets = campaigns.filter(c => !c.isActive).map(c => c.sheetName);
  } else {
    // all
    targetSheets = campaigns.map(c => c.sheetName);
  }

  const workbook = XLSX.utils.book_new();

  // 1. If mode is all, active, or inactive, create a Master Combined Sheet first
  if (targetSheets.length > 0) {
    const combinedLeads = await MetaSheetLead.find({ sheetName: { $in: targetSheets } })
      .sort({ createdAt: -1 })
      .lean();

    const formattedCombined = combinedLeads.map((l, index) => ({
      'S.No': index + 1,
      'Sheet / Campaign': l.sheetName,
      'Created Date': l.createdAt ? new Date(l.createdAt).toLocaleString('en-IN') : '',
      'Name': l.name || '',
      'Phone Number': l.phone || l.rawPhone || '',
      'Email': l.email || '',
      'Campaign Name': l.campaignName || '',
      'Form Name': l.formName || '',
      'Ad Name': l.adName || '',
      'Platform': l.platform?.toUpperCase() || 'FB',
      'Investment Budget': l.budget || '',
      'Planning To Buy': l.planning || '',
      'Site Visit Timeline': l.visitTimeline || '',
      'Configuration': l.configuration || '',
      'City': l.city || '',
      'Status': l.leadStatus || 'CREATED',
      'Meta Lead ID': l.leadId || '',
      'Synced At': l.syncedAt ? new Date(l.syncedAt).toLocaleString('en-IN') : '',
    }));

    const combinedWs = XLSX.utils.json_to_sheet(formattedCombined);
    const tabTitle = mode === 'active' ? 'Active Campaigns Master' : mode === 'inactive' ? 'Inactive Campaigns Master' : 'Master Combined Leads';
    XLSX.utils.book_append_sheet(workbook, combinedWs, tabTitle.slice(0, 31));
  }

  // 2. Append Individual Sheet Tabs for each campaign
  for (const sheetName of targetSheets) {
    const sheetLeads = await MetaSheetLead.find({ sheetName }).sort({ createdAt: -1 }).lean();

    const formattedSheetData = sheetLeads.map((l, index) => ({
      'S.No': index + 1,
      'Date & Time': l.createdAt ? new Date(l.createdAt).toLocaleString('en-IN') : '',
      'Full Name': l.name || '',
      'Phone Number': l.phone || l.rawPhone || '',
      'Email Address': l.email || '',
      'Campaign Name': l.campaignName || '',
      'Form Name': l.formName || '',
      'Ad Name': l.adName || '',
      'Platform': l.platform?.toUpperCase() || 'FB',
      'Budget': l.budget || '',
      'Planning To Buy': l.planning || '',
      'Visit Timeline': l.visitTimeline || '',
      'Configuration': l.configuration || '',
      'City': l.city || '',
      'Lead Status': l.leadStatus || 'CREATED',
      'Lead ID': l.leadId || '',
    }));

    const ws = XLSX.utils.json_to_sheet(formattedSheetData);
    // Excel sheet name max length is 31 chars and cannot contain certain special chars
    const safeSheetName = sheetName.replace(/[\\/?*[\]]/g, '').slice(0, 31) || `Sheet_${workbook.SheetNames.length + 1}`;
    XLSX.utils.book_append_sheet(workbook, ws, safeSheetName);
  }

  const excelBuffer = XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' });
  return Buffer.from(excelBuffer);
}
