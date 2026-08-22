import * as XLSX from 'xlsx';
import { connectDB } from '@/lib/mongodb';
import MetaSheetLead, { IMetaSheetLead } from '@/models/MetaSheetLead';
import MetaCampaignConfig, { IMetaCampaignConfig } from '@/models/MetaCampaignConfig';
import { distributeLead } from '@/lib/lead-distributor';

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

  const leads: ParsedLeadRow[] = [];
  let latestLeadDate: Date | null = null;

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

    // Skip if no phone found (e.g. header rows, empty rows)
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
        name = prefix.split(' ').map((w: string) => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
      }
    }
    if (!name) name = 'Meta Lead';

    // 4. Meta IDs, Campaign, Ad, Form & Questionnaire details
    let leadId = '';
    let createdAt: Date | null = null;
    let adId = '';
    let adName = '';
    let adsetId = '';
    let adsetName = '';
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
    const customAnswers: Record<string, any> = {};

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
        const filter = { sheetName: lead.sheetName, phone: lead.phone };

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

      // Auto-distribute fresh leads from today onwards (22 Aug 2026+) to team agents in real-time
      const DISTRIBUTION_START_DATE = new Date('2026-08-21T18:30:00.000Z');
      for (const lead of parsed.leads) {
        if (lead.createdAt && lead.createdAt < DISTRIBUTION_START_DATE) {
          continue; // Skip old historical leads
        }
        try {
          await distributeLead({
            name: lead.name,
            phone: lead.phone,
            email: lead.email,
            source: 'Meta Ads',
            originalLeadId: lead.leadId,
            originalLeadType: 'meta_lead',
            rawProjectName: lead.sheetName,
            propertyInterest: lead.campaignName || lead.formName || lead.sheetName,
            planning: lead.planning,
            visitTimeline: lead.visitTimeline,
            budget: lead.budget,
            configuration: lead.configuration,
            sheetName: lead.sheetName,
            formName: lead.formName,
            campaignName: lead.campaignName,
            adName: lead.adName,
            platform: lead.platform,
            createdAt: lead.createdAt,
          });
        } catch (_) {}
      }
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
