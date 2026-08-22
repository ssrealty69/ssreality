'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { 
  Megaphone, RefreshCw, Download, Search, Filter, Phone, MessageSquare, 
  ExternalLink, Calendar, CheckCircle, AlertCircle, Clock, Database, 
  Layers, ChevronDown, ChevronRight, X, ArrowUpRight, Copy, Check, Sparkles, FileSpreadsheet,
  Zap, Radio, CheckCheck, Lock, ShieldCheck, ShieldAlert
} from 'lucide-react';
import toast from 'react-hot-toast';

interface CampaignMeta {
  _id: string;
  sheetName: string;
  totalLeads: number;
  latestLeadDate?: string | null;
  isActive: boolean;
  lastSyncedAt: string;
  status: 'active' | 'inactive';
}

interface MetaLead {
  _id: string;
  sheetName: string;
  leadId: string;
  name: string;
  phone: string;
  rawPhone?: string;
  email?: string;
  campaignName?: string;
  campaignId?: string;
  adName?: string;
  adId?: string;
  adsetName?: string;
  adsetId?: string;
  formName?: string;
  formId?: string;
  platform?: string;
  budget?: string;
  planning?: string;
  visitTimeline?: string;
  configuration?: string;
  city?: string;
  leadStatus?: string;
  customAnswers?: Record<string, any>;
  createdAt: string;
  syncedAt: string;
}

interface Metrics {
  totalLeads: number;
  activeCampaignsCount: number;
  inactiveCampaignsCount: number;
  totalSheetsCount: number;
}

export default function MetaAdsAdminPage() {
  const [leads, setLeads] = useState<MetaLead[]>([]);
  const [campaigns, setCampaigns] = useState<CampaignMeta[]>([]);
  const [metrics, setMetrics] = useState<Metrics>({
    totalLeads: 0,
    activeCampaignsCount: 0,
    inactiveCampaignsCount: 0,
    totalSheetsCount: 0,
  });

  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [showExportMenu, setShowExportMenu] = useState(false);

  // Filters
  const [selectedSheet, setSelectedSheet] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [platformFilter, setPlatformFilter] = useState('all');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  // Modal Detail & Auto-Sync & Role Detection
  const [activeModalLead, setActiveModalLead] = useState<MetaLead | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [autoSync, setAutoSync] = useState(true);
  const [showWebhookGuide, setShowWebhookGuide] = useState(false);
  const [lastAutoSyncTime, setLastAutoSyncTime] = useState<Date>(new Date());
  const [userRole, setUserRole] = useState<string>('admin');

  useEffect(() => {
    const getCookie = (name: string) => {
      const value = `; ${document.cookie}`;
      const parts = value.split(`; ${name}=`);
      if (parts.length === 2) return parts.pop()?.split(';').shift() || '';
      return '';
    };
    const role = getCookie('admin_role') || 'admin';
    setUserRole(role);
  }, []);

  const isSuperAdmin = userRole === 'super_admin';

  const fetchLeads = useCallback(async (isSilent = false) => {
    try {
      if (!isSilent) setLoading(true);
      const params = new URLSearchParams();
      if (selectedSheet !== 'all') params.append('sheetName', selectedSheet);
      if (statusFilter !== 'all') params.append('status', statusFilter);
      if (searchQuery.trim()) params.append('search', searchQuery.trim());
      if (platformFilter !== 'all') params.append('platform', platformFilter);
      params.append('page', String(page));
      params.append('limit', '50');

      const res = await fetch(`/api/admin/meta-ads/leads?${params.toString()}`);
      const data = await res.json();

      if (data.success) {
        setLeads(data.leads || []);
        setCampaigns(data.campaigns || []);
        if (data.metrics) setMetrics(data.metrics);
        if (data.pagination) {
          setTotalPages(data.pagination.totalPages || 1);
          setTotalCount(data.pagination.totalCount || 0);
        }
        setLastAutoSyncTime(new Date());
      } else if (!isSilent) {
        toast.error(data.error || 'Failed to load leads');
      }
    } catch (err: any) {
      console.error('Fetch error:', err);
      if (!isSilent) toast.error('Network error loading Meta leads');
    } finally {
      if (!isSilent) setLoading(false);
    }
  }, [selectedSheet, statusFilter, searchQuery, platformFilter, page]);

  useEffect(() => {
    fetchLeads();
  }, [fetchLeads]);

  // Automated 30-Second Real-Time Poller
  useEffect(() => {
    if (!autoSync) return;
    const interval = setInterval(() => {
      fetchLeads(true); // Silent background auto-sync
    }, 25000); // Poll every 25 seconds
    return () => clearInterval(interval);
  }, [autoSync, fetchLeads]);

  // Handle Live Sync
  const handleSyncNow = async () => {
    try {
      setSyncing(true);
      toast.loading('Syncing all sheets from live Google Sheet...', { id: 'meta-sync' });

      const res = await fetch('/api/admin/meta-ads/sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });
      const data = await res.json();

      if (data.success) {
        toast.success(
          `Sync successful! ${data.data.totalSheets} sheets scanned, ${data.data.totalNewInserted} new leads saved permanently.`,
          { id: 'meta-sync', duration: 5000 }
        );
        fetchLeads();
      } else {
        toast.error(data.details || data.error || 'Sync failed', { id: 'meta-sync' });
      }
    } catch (err: any) {
      toast.error('Sync network error: ' + err.message, { id: 'meta-sync' });
    } finally {
      setSyncing(false);
    }
  };

  // Handle Export
  const handleExport = async (mode: 'all' | 'active' | 'inactive' | 'single') => {
    try {
      setExporting(true);
      setShowExportMenu(false);
      const params = new URLSearchParams({ mode });
      if (mode === 'single' && selectedSheet !== 'all') {
        params.append('sheet', selectedSheet);
      }

      toast.loading(`Preparing ${mode} Excel export...`, { id: 'meta-export' });
      const downloadUrl = `/api/admin/meta-ads/export?${params.toString()}`;
      
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.setAttribute('download', '');
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      toast.success('Excel download started!', { id: 'meta-export' });
    } catch (err: any) {
      toast.error('Export failed: ' + err.message, { id: 'meta-export' });
    } finally {
      setExporting(false);
    }
  };

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    toast.success('Copied to clipboard!');
    setTimeout(() => setCopiedId(null), 2000);
  };

  const formatDate = (dateStr?: string | null) => {
    if (!dateStr) return 'N/A';
    try {
      const d = new Date(dateStr);
      return d.toLocaleString('en-IN', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        hour12: true,
      });
    } catch {
      return dateStr;
    }
  };

  const getTimeAgo = (dateStr?: string | null) => {
    if (!dateStr) return 'No leads yet';
    try {
      const d = new Date(dateStr);
      const diffMs = Date.now() - d.getTime();
      const diffHours = Math.floor(diffMs / (1000 * 3600));
      if (diffHours < 1) return 'Just now (<1 hr)';
      if (diffHours < 24) return `${diffHours} hrs ago`;
      const diffDays = Math.floor(diffHours / 24);
      return `${diffDays} days ago`;
    } catch {
      return '';
    }
  };

  return (
    <div className="min-h-screen bg-[#FDFBF7] text-[#1A1800] p-4 lg:p-8">
      {/* 1. Header Section */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 pb-6 border-b border-[#C9A227]/20">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-[#1A1800] to-[#3A3300] text-[#D4AF37] flex items-center justify-center shadow-md">
              <Megaphone size={22} className="text-[#D4AF37]" />
            </div>
            <div>
              <h1 className="text-2xl lg:text-3xl font-extrabold tracking-tight text-[#1A1800]">
                Meta Ads Lead Hub
              </h1>
              <p className="text-xs lg:text-sm text-[#7A7560] font-medium">
                Live Capturing, Multi-Sheet Sync & Permanent Database Persistence
              </p>
            </div>
          </div>
        </div>

        {/* Action Controls in a single sleek row */}
        <div className="flex flex-wrap lg:flex-nowrap items-center gap-2 shrink-0">
          {/* Live Auto-Sync Status & Toggle */}
          <button
            onClick={() => {
              setAutoSync(!autoSync);
              toast.success(autoSync ? 'Auto-Sync paused' : 'Auto-Sync activated (Every 25s)');
            }}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold border transition-all shadow-sm shrink-0 ${
              autoSync
                ? 'bg-[#EAF7EE] text-[#0E6228] border-[#107C41]/30 hover:border-[#107C41]'
                : 'bg-white text-[#7A7560] border-gray-200 hover:border-gray-300'
            }`}
            title="Auto-Sync checks Google Sheets every 25s automatically in background"
          >
            <span className="relative flex h-2 w-2">
              {autoSync && (
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#107C41] opacity-75"></span>
              )}
              <span className={`relative inline-flex rounded-full h-2 w-2 ${autoSync ? 'bg-[#107C41]' : 'bg-gray-400'}`}></span>
            </span>
            <span>{autoSync ? 'Live (25s)' : 'Paused'}</span>
          </button>

          {/* Instant Webhook Button */}
          <button
            onClick={() => setShowWebhookGuide(true)}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold bg-white border border-[#C9A227]/30 text-[#1A1800] hover:bg-[#F9F6EE] transition-all shadow-sm shrink-0"
            title="Setup 0-second instant Google Sheets trigger"
          >
            <Zap size={13} className="text-[#C9A227]" />
            <span>Trigger</span>
          </button>

          {/* External Google Sheet link */}
          <a
            href="https://docs.google.com/spreadsheets/d/1tVgMpHWRHIXozGO32Mmvc2r0xdYuiPkJptpaDjm3eA8/edit?gid=2100604883#gid=2100604883"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold bg-white border border-[#C9A227]/30 text-[#1A1800] hover:bg-[#F9F6EE] transition-all shadow-sm shrink-0"
          >
            <FileSpreadsheet size={14} className="text-[#107C41]" />
            <span>Sheet</span>
            <ExternalLink size={11} className="text-[#7A7560]" />
          </a>

          {/* Export Dropdown (Super Admin only) */}
          {isSuperAdmin && (
            <div className="relative shrink-0">
              <button
                onClick={() => setShowExportMenu(!showExportMenu)}
                disabled={exporting}
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold bg-white border border-[#C9A227]/40 text-[#1A1800] hover:border-[#C9A227] hover:bg-[#F9F6EE] transition-all shadow-sm"
              >
                <Download size={14} className="text-[#B38715]" />
                <span>Export</span>
                <ChevronDown size={12} className="text-[#7A7560]" />
              </button>

              {showExportMenu && (
                <div 
                  className="absolute right-0 mt-2 w-64 bg-white rounded-2xl shadow-xl border border-[#C9A227]/20 p-2 z-50 animate-in fade-in slide-in-from-top-2"
                  onMouseLeave={() => setShowExportMenu(false)}
                >
                  <div className="px-3 py-1.5 text-[11px] font-bold text-[#7A7560] uppercase tracking-wider">
                    Excel Export Modes
                  </div>
                  <button
                    onClick={() => handleExport('all')}
                    className="w-full text-left px-3 py-2 text-xs font-semibold rounded-xl hover:bg-[#FDFBF7] text-[#1A1800] flex items-center justify-between transition-colors"
                  >
                    <span className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-blue-500"></span>
                      Master All Leads Dump
                    </span>
                    <span className="text-[10px] text-[#7A7560] bg-[#F4EFE6] px-1.5 py-0.5 rounded">All Tabs</span>
                  </button>
                  <button
                    onClick={() => handleExport('active')}
                    className="w-full text-left px-3 py-2 text-xs font-semibold rounded-xl hover:bg-[#EAF7EE] text-[#0E6228] flex items-center justify-between transition-colors"
                  >
                    <span className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-[#107C41]"></span>
                      Active Campaigns Only
                    </span>
                    <span className="text-[10px] text-[#0E6228] bg-[#D4F2DE] px-1.5 py-0.5 rounded">Last 2 Days</span>
                  </button>
                  <button
                    onClick={() => handleExport('inactive')}
                    className="w-full text-left px-3 py-2 text-xs font-semibold rounded-xl hover:bg-[#FDF0F0] text-[#9E1C1C] flex items-center justify-between transition-colors"
                  >
                    <span className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-red-500"></span>
                      Inactive Campaigns Only
                    </span>
                    <span className="text-[10px] text-[#9E1C1C] bg-[#FDE2E2] px-1.5 py-0.5 rounded">&gt; 2 Days Old</span>
                  </button>
                  {selectedSheet !== 'all' && (
                    <button
                      onClick={() => handleExport('single')}
                      className="w-full text-left px-3 py-2 text-xs font-semibold rounded-xl hover:bg-[#FFF9E6] text-[#B38715] flex items-center justify-between transition-colors border-t border-[#C9A227]/15 mt-1"
                    >
                      <span className="truncate pr-2">Export &quot;{selectedSheet}&quot;</span>
                      <span className="text-[10px] bg-[#FFF0C2] text-[#8C6B10] px-1.5 py-0.5 rounded shrink-0">Current Tab</span>
                    </button>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Manual Sync Now Button */}
          <button
            onClick={handleSyncNow}
            disabled={syncing}
            className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition-all shadow-md shrink-0 ${
              syncing
                ? 'bg-[#E5D7B5] text-[#7A7560] cursor-not-allowed'
                : 'bg-gradient-to-r from-[#D4AF37] via-[#C9A227] to-[#B38715] text-[#1A1800] hover:brightness-105 active:scale-[0.98]'
            }`}
          >
            <RefreshCw size={14} className={syncing ? 'animate-spin' : ''} />
            <span>{syncing ? 'Syncing...' : 'Sync Now'}</span>
          </button>
        </div>
      </div>

      {/* 2. Key Metrics Summary Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5 lg:gap-5 my-6">
        {/* Total Leads Card */}
        <div className="bg-white rounded-2xl p-4 lg:p-5 border border-[#C9A227]/20 shadow-sm relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-[#7A7560]">
              Total Meta Leads
            </span>
            <div className="w-8 h-8 rounded-lg bg-[#F9F6EE] border border-[#C9A227]/20 flex items-center justify-center text-[#B38715]">
              <Database size={16} />
            </div>
          </div>
          <div className="text-2xl lg:text-3xl font-extrabold text-[#1A1800] mt-2">
            {metrics.totalLeads.toLocaleString('en-IN')}
          </div>
          <div className="flex items-center gap-1.5 mt-2 text-[11px] font-semibold text-[#107C41]">
            <CheckCircle size={13} />
            <span>100% Permanently Saved in DB</span>
          </div>
        </div>

        {/* Active Campaigns Card (🟢) */}
        <div className="bg-white rounded-2xl p-4 lg:p-5 border border-[#107C41]/25 shadow-sm relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-[#0E6228]">
              Active Campaigns
            </span>
            <div className="w-8 h-8 rounded-lg bg-[#EAF7EE] flex items-center justify-center text-[#107C41]">
              <span className="relative flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#107C41] opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-[#107C41]"></span>
              </span>
            </div>
          </div>
          <div className="text-2xl lg:text-3xl font-extrabold text-[#0E6228] mt-2 flex items-baseline gap-2">
            <span>{metrics.activeCampaignsCount}</span>
            <span className="text-xs font-semibold text-[#107C41]">Forms active</span>
          </div>
          <div className="flex items-center gap-1.5 mt-2 text-[11px] font-semibold text-[#107C41]">
            <span>🟢 Leads in last 2 days (48 hrs)</span>
          </div>
        </div>

        {/* Inactive Campaigns Card (🔴) */}
        <div className="bg-white rounded-2xl p-4 lg:p-5 border border-red-200 shadow-sm relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-[#9E1C1C]">
              Inactive Campaigns
            </span>
            <div className="w-8 h-8 rounded-lg bg-[#FDF0F0] flex items-center justify-center text-[#DC2626]">
              <span className="w-3 h-3 rounded-full bg-[#DC2626]"></span>
            </div>
          </div>
          <div className="text-2xl lg:text-3xl font-extrabold text-[#9E1C1C] mt-2 flex items-baseline gap-2">
            <span>{metrics.inactiveCampaignsCount}</span>
            <span className="text-xs font-semibold text-[#DC2626]">Old / Paused</span>
          </div>
          <div className="flex items-center gap-1.5 mt-2 text-[11px] font-semibold text-[#9E1C1C]">
            <span>🔴 No leads in last 2 days</span>
          </div>
        </div>

        {/* Total Sheet Tabs Card */}
        <div className="bg-white rounded-2xl p-4 lg:p-5 border border-[#C9A227]/20 shadow-sm relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-[#7A7560]">
              Connected Sheets
            </span>
            <div className="w-8 h-8 rounded-lg bg-[#F9F6EE] border border-[#C9A227]/20 flex items-center justify-center text-[#B38715]">
              <Layers size={16} />
            </div>
          </div>
          <div className="text-2xl lg:text-3xl font-extrabold text-[#1A1800] mt-2 flex items-baseline gap-2">
            <span>{metrics.totalSheetsCount}</span>
            <span className="text-xs font-semibold text-[#7A7560]">Tabs discovered</span>
          </div>
          <div className="flex items-center gap-1.5 mt-2 text-[11px] font-semibold text-[#B38715]">
            <Sparkles size={13} />
            <span>Auto-detects new sheets</span>
          </div>
        </div>
      </div>

      {/* 3. Campaign Tabs Bar with 🟢/🔴 Status Indicators */}
      <div className="bg-white rounded-2xl p-3 lg:p-4 border border-[#C9A227]/20 shadow-sm mb-6">
        <div className="flex items-center justify-between gap-2 pb-3 mb-3 border-b border-[#C9A227]/15">
          <div className="flex items-center gap-2">
            <Layers size={16} className="text-[#B38715]" />
            <span className="text-xs font-bold uppercase tracking-wider text-[#1A1800]">
              Filter By Campaign Sheet Tab
            </span>
          </div>

          {/* Quick Active/Inactive Toggle */}
          <div className="flex items-center bg-[#F4EFE6] p-0.5 rounded-xl text-xs font-bold">
            <button
              onClick={() => { setStatusFilter('all'); setSelectedSheet('all'); setPage(1); }}
              className={`px-3 py-1 rounded-lg transition-all ${
                statusFilter === 'all' && selectedSheet === 'all'
                  ? 'bg-white text-[#1A1800] shadow-sm'
                  : 'text-[#7A7560] hover:text-[#1A1800]'
              }`}
            >
              All Tabs ({metrics.totalSheetsCount})
            </button>
            <button
              onClick={() => { setStatusFilter('active'); setSelectedSheet('all'); setPage(1); }}
              className={`px-3 py-1 rounded-lg transition-all flex items-center gap-1.5 ${
                statusFilter === 'active'
                  ? 'bg-[#EAF7EE] text-[#0E6228] shadow-sm'
                  : 'text-[#7A7560] hover:text-[#0E6228]'
              }`}
            >
              <span className="w-2 h-2 rounded-full bg-[#107C41]"></span>
              Active Only ({metrics.activeCampaignsCount})
            </button>
            <button
              onClick={() => { setStatusFilter('inactive'); setSelectedSheet('all'); setPage(1); }}
              className={`px-3 py-1 rounded-lg transition-all flex items-center gap-1.5 ${
                statusFilter === 'inactive'
                  ? 'bg-[#FDF0F0] text-[#9E1C1C] shadow-sm'
                  : 'text-[#7A7560] hover:text-[#9E1C1C]'
              }`}
            >
              <span className="w-2 h-2 rounded-full bg-[#DC2626]"></span>
              Inactive ({metrics.inactiveCampaignsCount})
            </button>
          </div>
        </div>

        {/* Scrollable Sheet Chips */}
        <div className="flex flex-wrap gap-2 max-h-36 overflow-y-auto pr-1">
          <button
            onClick={() => { setSelectedSheet('all'); setPage(1); }}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
              selectedSheet === 'all'
                ? 'bg-[#1A1800] text-white shadow'
                : 'bg-[#F9F6EE] text-[#7A7560] hover:bg-[#F0EAD6] border border-[#C9A227]/20'
            }`}
          >
            <span>All Sheets Combined</span>
            <span className="text-[10px] bg-white/20 px-1.5 py-0.5 rounded-full">
              {metrics.totalLeads}
            </span>
          </button>

          {campaigns
            .filter((c) => {
              if (statusFilter === 'active') return c.isActive;
              if (statusFilter === 'inactive') return !c.isActive;
              return true;
            })
            .map((c) => {
              const isSelected = selectedSheet === c.sheetName;
              return (
                <button
                  key={c._id || c.sheetName}
                  onClick={() => { setSelectedSheet(c.sheetName); setPage(1); }}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all flex items-center gap-2 border ${
                    isSelected
                      ? c.isActive
                        ? 'bg-[#EAF7EE] text-[#0E6228] border-[#107C41] shadow-sm font-bold'
                        : 'bg-[#1A1800] text-white border-[#1A1800] shadow-sm font-bold'
                      : c.isActive
                      ? 'bg-white text-[#1A1800] border-[#107C41]/30 hover:border-[#107C41]'
                      : 'bg-white text-[#7A7560] border-gray-200 hover:border-gray-300'
                  }`}
                >
                  {/* Status Indicator */}
                  {c.isActive ? (
                    <span className="relative flex h-2.5 w-2.5">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#107C41] opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-[#107C41]"></span>
                    </span>
                  ) : (
                    <span className="w-2.5 h-2.5 rounded-full bg-red-400"></span>
                  )}

                  <span className="truncate max-w-[170px]">{c.sheetName}</span>
                  <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${
                    isSelected
                      ? 'bg-black/10'
                      : c.isActive ? 'bg-[#D4F2DE] text-[#0E6228]' : 'bg-gray-100 text-[#7A7560]'
                  }`}>
                    {c.totalLeads}
                  </span>
                </button>
              );
            })}
        </div>
      </div>

      {/* 4. Leads Section: Super Admin (Full Customer Rows) vs Normal Admin (Campaign Overview & Vault Info) */}
      {isSuperAdmin ? (
        <>
          {/* Search and Filter Controls */}
          <div className="bg-white rounded-2xl p-4 border border-[#C9A227]/20 shadow-sm mb-6">
            <div className="flex flex-col md:flex-row items-center gap-3">
              {/* Search Input */}
              <div className="relative flex-1 w-full">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#7A7560]" size={16} />
                <input
                  type="text"
                  placeholder="Search by Name, Phone, Email, Campaign, Form..."
                  value={searchQuery}
                  onChange={(e) => { setSearchQuery(e.target.value); setPage(1); }}
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-[#C9A227]/30 text-xs bg-[#FDFBF7] focus:outline-none focus:border-[#B38715] transition-all"
                />
                {searchQuery && (
                  <button
                    onClick={() => { setSearchQuery(''); setPage(1); }}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    <X size={14} />
                  </button>
                )}
              </div>

              {/* Platform Filter */}
              <div className="flex items-center gap-2 w-full md:w-auto">
                <select
                  value={platformFilter}
                  onChange={(e) => { setPlatformFilter(e.target.value); setPage(1); }}
                  className="px-3.5 py-2.5 rounded-xl border border-[#C9A227]/30 text-xs font-semibold bg-[#FDFBF7] text-[#1A1800] focus:outline-none focus:border-[#B38715]"
                >
                  <option value="all">All Platforms (FB / IG)</option>
                  <option value="fb">Facebook Ads</option>
                  <option value="ig">Instagram Ads</option>
                </select>

                <button
                  onClick={() => {
                    setSearchQuery('');
                    setSelectedSheet('all');
                    setStatusFilter('all');
                    setPlatformFilter('all');
                    setPage(1);
                  }}
                  className="px-3 py-2.5 rounded-xl text-xs font-semibold text-[#7A7560] hover:text-[#1A1800] hover:bg-[#F4EFE6] transition-colors whitespace-nowrap"
                >
                  Reset Filters
                </button>
              </div>
            </div>

            {/* Results Info Bar */}
            <div className="flex items-center justify-between text-xs text-[#7A7560] font-medium pt-3 mt-3 border-t border-gray-100">
              <span>
                Showing <strong className="text-[#1A1800]">{leads.length}</strong> of{' '}
                <strong className="text-[#1A1800]">{totalCount.toLocaleString('en-IN')}</strong> matching leads
                {selectedSheet !== 'all' && (
                  <span> in <em>&quot;{selectedSheet}&quot;</em></span>
                )}
              </span>
              <span>Page {page} of {totalPages || 1}</span>
            </div>
          </div>

          {/* Master Data Table */}
          <div className="bg-white rounded-2xl border border-[#C9A227]/20 shadow-sm overflow-hidden mb-6">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-[#1A1800] text-white text-[11px] font-bold uppercase tracking-wider">
                    <th className="py-3 px-4 w-12 text-center">#</th>
                    <th className="py-3 px-4">Date & Time</th>
                    <th className="py-3 px-4">Sheet / Campaign</th>
                    <th className="py-3 px-4">Lead Name</th>
                    <th className="py-3 px-4">Contact</th>
                    <th className="py-3 px-4">Requirement / Form</th>
                    <th className="py-3 px-4 text-center">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 text-xs">
                  {loading ? (
                    <tr>
                      <td colSpan={7} className="py-16 text-center text-[#7A7560]">
                        <div className="flex flex-col items-center justify-center gap-2">
                          <RefreshCw size={24} className="animate-spin text-[#B38715]" />
                          <span className="font-semibold">Loading Meta Leads...</span>
                        </div>
                      </td>
                    </tr>
                  ) : leads.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="py-16 text-center text-[#7A7560]">
                        <div className="flex flex-col items-center justify-center gap-2">
                          <AlertCircle size={28} className="text-[#B38715]" />
                          <span className="font-bold text-sm text-[#1A1800]">No Leads Found</span>
                          <p className="text-xs max-w-sm">
                            No leads match your active filters. Try clicking &quot;Sync Now&quot; to fetch latest leads from Google Sheets.
                          </p>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    leads.map((lead, idx) => {
                      const sNo = (page - 1) * 50 + idx + 1;
                      const isIg = lead.platform?.toLowerCase() === 'ig';

                      return (
                        <tr 
                          key={lead._id || idx}
                          className="hover:bg-[#FDFBF7] transition-colors group cursor-pointer"
                          onClick={() => setActiveModalLead(lead)}
                        >
                          {/* S.No */}
                          <td className="py-3.5 px-4 text-center font-bold text-[#7A7560]">
                            {sNo}
                          </td>

                          {/* Date & Time */}
                          <td className="py-3.5 px-4 whitespace-nowrap">
                            <div className="font-semibold text-[#1A1800]">
                              {formatDate(lead.createdAt)}
                            </div>
                            <div className="text-[10px] text-[#7A7560]">
                              {getTimeAgo(lead.createdAt)}
                            </div>
                          </td>

                          {/* Sheet Name & Campaign */}
                          <td className="py-3.5 px-4">
                            <div className="font-bold text-[#1A1800] truncate max-w-[200px]" title={lead.sheetName}>
                              {lead.sheetName}
                            </div>
                            <div className="flex items-center gap-1.5 mt-0.5">
                              <span className={`text-[10px] font-bold px-1.5 py-0.2 rounded ${
                                isIg 
                                  ? 'bg-pink-100 text-pink-700' 
                                  : 'bg-blue-100 text-blue-700'
                              }`}>
                                {lead.platform?.toUpperCase() || 'FB'}
                              </span>
                              {lead.formName && (
                                <span className="text-[10px] text-[#7A7560] truncate max-w-[130px]" title={lead.formName}>
                                  {lead.formName}
                                </span>
                              )}
                            </div>
                          </td>

                          {/* Name */}
                          <td className="py-3.5 px-4">
                            <div className="font-bold text-[#1A1800]">
                              {lead.name || 'Lead'}
                            </div>
                            {lead.email && (
                              <div className="text-[11px] text-[#7A7560] truncate max-w-[160px]" title={lead.email}>
                                {lead.email}
                              </div>
                            )}
                          </td>

                          {/* Contact with Call & WhatsApp buttons */}
                          <td className="py-3.5 px-4 whitespace-nowrap" onClick={(e) => e.stopPropagation()}>
                            <div className="flex items-center gap-2">
                              <span className="font-bold text-[#1A1800] tracking-wide">
                                {lead.phone || lead.rawPhone}
                              </span>
                              <button
                                onClick={() => copyToClipboard(lead.phone || lead.rawPhone || '', lead._id)}
                                className="p-1 hover:bg-gray-100 rounded text-gray-400 hover:text-[#1A1800] transition-colors"
                                title="Copy Phone"
                              >
                                {copiedId === lead._id ? <Check size={13} className="text-green-600" /> : <Copy size={13} />}
                              </button>
                            </div>
                            <div className="flex items-center gap-2 mt-1.5">
                              {lead.phone && (
                                <>
                                  <a
                                    href={`tel:${lead.phone}`}
                                    className="flex items-center gap-1 px-2 py-0.5 bg-[#FFF0C2] text-[#8C6B10] rounded text-[10px] font-bold hover:bg-[#FFE28A] transition-colors"
                                  >
                                    <Phone size={10} />
                                    Call
                                  </a>
                                  <a
                                    href={`https://wa.me/91${lead.phone.slice(-10)}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex items-center gap-1 px-2 py-0.5 bg-[#D4F2DE] text-[#0E6228] rounded text-[10px] font-bold hover:bg-[#B7E8C6] transition-colors"
                                  >
                                    <MessageSquare size={10} />
                                    WhatsApp
                                  </a>
                                </>
                              )}
                            </div>
                          </td>

                          {/* Requirement / Budget / Timeline */}
                          <td className="py-3.5 px-4 max-w-xs">
                            <div className="space-y-0.5">
                              {lead.budget && (
                                <div className="text-[11px] font-semibold text-[#1A1800]">
                                  💰 {lead.budget}
                                </div>
                              )}
                              {lead.planning && (
                                <div className="text-[10px] text-[#7A7560]">
                                  🗓️ Buy: <strong>{lead.planning.replace(/_/g, ' ')}</strong>
                                </div>
                              )}
                              {lead.visitTimeline && (
                                <div className="text-[10px] text-[#7A7560]">
                                  📍 Visit: <strong>{lead.visitTimeline.replace(/_/g, ' ')}</strong>
                                </div>
                              )}
                              {lead.configuration && (
                                <div className="text-[10px] text-[#7A7560]">
                                  🏠 {lead.configuration}
                                </div>
                              )}
                              {!lead.budget && !lead.planning && !lead.visitTimeline && (
                                <span className="text-[11px] text-gray-400 italic">No custom fields</span>
                              )}
                            </div>
                          </td>

                          {/* Actions */}
                          <td className="py-3.5 px-4 text-center whitespace-nowrap">
                            <button
                              onClick={() => setActiveModalLead(lead)}
                              className="px-2.5 py-1 text-[11px] font-bold rounded-lg bg-[#F4EFE6] text-[#1A1800] hover:bg-[#E5D7B5] transition-colors"
                            >
                              View Details
                            </button>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination Bar */}
            <div className="flex items-center justify-between px-4 py-3 bg-[#FDFBF7] border-t border-gray-100 text-xs font-semibold">
              <div className="text-[#7A7560]">
                Showing page {page} of {totalPages || 1}
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page <= 1 || loading}
                  className="px-3 py-1.5 rounded-lg border border-[#C9A227]/30 bg-white text-[#1A1800] disabled:opacity-40 disabled:cursor-not-allowed hover:bg-[#F9F6EE] transition-colors"
                >
                  Previous
                </button>
                <span className="px-2 font-bold text-[#1A1800]">{page}</span>
                <button
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={page >= totalPages || loading}
                  className="px-3 py-1.5 rounded-lg border border-[#C9A227]/30 bg-white text-[#1A1800] disabled:opacity-40 disabled:cursor-not-allowed hover:bg-[#F9F6EE] transition-colors"
                >
                  Next
                </button>
              </div>
            </div>
          </div>
        </>
      ) : (
        /* Normal Admin Overview Section */
        <div className="space-y-6 mb-6">
          {/* Campaign Intelligence Matrix */}
          <div className="bg-white rounded-3xl p-5 lg:p-6 border border-[#C9A227]/20 shadow-sm">
            <div className="flex items-center justify-between pb-4 border-b border-[#C9A227]/15">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-[#F9F6EE] border border-[#C9A227]/30 flex items-center justify-center text-[#B38715]">
                  <Layers size={18} />
                </div>
                <div>
                  <h3 className="text-sm font-extrabold text-[#1A1800]">Campaign Health & Activity Status</h3>
                  <p className="text-[11px] text-[#7A7560]">Live overview across all connected Meta campaign sheets</p>
                </div>
              </div>
              <span className="text-xs font-bold px-3 py-1 rounded-full bg-[#EAF7EE] text-[#0E6228] border border-[#107C41]/20 flex items-center gap-1.5">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#107C41] opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-[#107C41]"></span>
                </span>
                <span>{metrics.activeCampaignsCount} Active Campaigns</span>
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5 mt-5">
              {campaigns
                .filter((c) => {
                  if (selectedSheet !== 'all' && c.sheetName !== selectedSheet) return false;
                  if (statusFilter === 'active') return c.isActive;
                  if (statusFilter === 'inactive') return !c.isActive;
                  return true;
                })
                .map((camp) => (
                  <div 
                    key={camp.sheetName} 
                    className={`p-4 rounded-2xl border transition-all ${
                      camp.isActive 
                        ? 'bg-gradient-to-br from-white to-[#F6FCF8] border-[#107C41]/30 hover:border-[#107C41] shadow-sm'
                        : 'bg-[#FDFBF7] border-gray-200 opacity-80'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-2">
                        {camp.isActive ? (
                          <span className="relative flex h-2.5 w-2.5 shrink-0">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#107C41] opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-[#107C41]"></span>
                          </span>
                        ) : (
                          <span className="w-2.5 h-2.5 rounded-full bg-red-400 shrink-0"></span>
                        )}
                        <span className="text-xs font-bold text-[#1A1800] truncate max-w-[180px]" title={camp.sheetName}>
                          {camp.sheetName}
                        </span>
                      </div>
                      <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full ${
                        camp.isActive ? 'bg-[#D4F2DE] text-[#0E6228]' : 'bg-gray-100 text-[#7A7560]'
                      }`}>
                        {camp.totalLeads.toLocaleString('en-IN')} leads
                      </span>
                    </div>

                    <div className="mt-3 flex items-center justify-between text-[11px] text-[#7A7560] pt-2 border-t border-gray-100">
                      <span>Status: <strong className={camp.isActive ? 'text-[#0E6228]' : 'text-[#9E1C1C]'}>{camp.isActive ? '🟢 Active' : '🔴 Inactive'}</strong></span>
                      <span>{getTimeAgo(camp.latestLeadDate)}</span>
                    </div>
                  </div>
                ))}
            </div>
          </div>

          {/* Super Admin Vault Privacy Notice */}
          <div className="bg-gradient-to-br from-[#FFFBF0] via-[#FFF9E6] to-[#FDFBF7] rounded-3xl p-6 border border-[#C9A227]/30 shadow-md relative overflow-hidden">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-[#1A1800] to-[#3A3300] text-[#D4AF37] flex items-center justify-center shadow-lg shrink-0">
                  <ShieldCheck size={24} className="text-[#D4AF37]" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h4 className="text-sm font-extrabold text-[#1A1800]">Super Admin Lead Data Vault & Routing Engine</h4>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#1A1800] text-[#D4AF37]">
                      Protected
                    </span>
                  </div>
                  <p className="text-xs text-[#7A7560] mt-1 max-w-2xl leading-relaxed">
                    Customer full names, personal phone numbers, and raw questionnaire records are securely processed and automatically distributed to assigned team sales agents in real-time. Full database access & master Excel downloads are reserved for Super Admin credentials.
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <a
                  href="https://docs.google.com/spreadsheets/d/1tVgMpHWRHIXozGO32Mmvc2r0xdYuiPkJptpaDjm3eA8/edit?gid=2100604883#gid=2100604883"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-bold bg-white border border-[#C9A227]/40 text-[#1A1800] hover:bg-[#F9F6EE] transition-all shadow-sm"
                >
                  <FileSpreadsheet size={15} className="text-[#107C41]" />
                  <span>Google Sheet</span>
                  <ExternalLink size={12} className="text-[#7A7560]" />
                </a>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 5. Lead Detail Modal (Super Admin only) */}
      {isSuperAdmin && activeModalLead && (
        <div 
          className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-sm animate-in fade-in"
          onClick={() => setActiveModalLead(null)}
        >
          <div 
            className="bg-white rounded-3xl max-w-xl w-full p-6 shadow-2xl border border-[#C9A227]/30 max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="flex items-start justify-between border-b border-[#C9A227]/15 pb-4 mb-4">
              <div>
                <div className="flex items-center gap-2">
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                    activeModalLead.platform?.toLowerCase() === 'ig'
                      ? 'bg-pink-100 text-pink-700'
                      : 'bg-blue-100 text-blue-700'
                  }`}>
                    {activeModalLead.platform?.toUpperCase() || 'FB'}
                  </span>
                  <span className="text-xs font-bold text-[#B38715] bg-[#FFF0C2] px-2 py-0.5 rounded">
                    {activeModalLead.sheetName}
                  </span>
                </div>
                <h3 className="text-xl font-extrabold text-[#1A1800] mt-1.5">
                  {activeModalLead.name || 'Lead Details'}
                </h3>
                <p className="text-xs text-[#7A7560]">
                  Submitted on {formatDate(activeModalLead.createdAt)}
                </p>
              </div>
              <button
                onClick={() => setActiveModalLead(null)}
                className="p-1.5 rounded-full hover:bg-gray-100 text-[#7A7560] hover:text-[#1A1800] transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            {/* Quick Action Contact Bar */}
            <div className="bg-[#FDFBF7] p-4 rounded-2xl border border-[#C9A227]/20 mb-4 flex items-center justify-between gap-3">
              <div>
                <div className="text-[11px] font-bold text-[#7A7560] uppercase">Phone Number</div>
                <div className="text-base font-extrabold text-[#1A1800] tracking-wide">
                  {activeModalLead.phone || activeModalLead.rawPhone}
                </div>
              </div>
              <div className="flex items-center gap-2">
                <a
                  href={`tel:${activeModalLead.phone}`}
                  className="flex items-center gap-1.5 px-3 py-2 bg-[#FFF0C2] text-[#8C6B10] rounded-xl text-xs font-bold hover:bg-[#FFE28A] transition-colors"
                >
                  <Phone size={13} />
                  Call
                </a>
                <a
                  href={`https://wa.me/91${activeModalLead.phone?.slice(-10)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1.5 px-3 py-2 bg-[#D4F2DE] text-[#0E6228] rounded-xl text-xs font-bold hover:bg-[#B7E8C6] transition-colors"
                >
                  <MessageSquare size={13} />
                  WhatsApp
                </a>
              </div>
            </div>

            {/* Campaign & Meta Parameters */}
            <div className="grid grid-cols-2 gap-3 mb-4">
              <div className="bg-[#F9F6EE] p-3 rounded-xl">
                <div className="text-[10px] font-bold text-[#7A7560] uppercase">Campaign Name</div>
                <div className="text-xs font-bold text-[#1A1800] mt-0.5 truncate" title={activeModalLead.campaignName}>
                  {activeModalLead.campaignName || 'N/A'}
                </div>
              </div>
              <div className="bg-[#F9F6EE] p-3 rounded-xl">
                <div className="text-[10px] font-bold text-[#7A7560] uppercase">Form Name</div>
                <div className="text-xs font-bold text-[#1A1800] mt-0.5 truncate" title={activeModalLead.formName}>
                  {activeModalLead.formName || 'N/A'}
                </div>
              </div>
              <div className="bg-[#F9F6EE] p-3 rounded-xl">
                <div className="text-[10px] font-bold text-[#7A7560] uppercase">Ad Name</div>
                <div className="text-xs font-bold text-[#1A1800] mt-0.5 truncate" title={activeModalLead.adName}>
                  {activeModalLead.adName || 'N/A'}
                </div>
              </div>
              <div className="bg-[#F9F6EE] p-3 rounded-xl">
                <div className="text-[10px] font-bold text-[#7A7560] uppercase">Adset Name</div>
                <div className="text-xs font-bold text-[#1A1800] mt-0.5 truncate" title={activeModalLead.adsetName}>
                  {activeModalLead.adsetName || 'N/A'}
                </div>
              </div>
            </div>

            {/* Custom Answers / Questionnaire */}
            <div className="mb-4">
              <div className="text-xs font-bold text-[#1A1800] uppercase tracking-wider mb-2 flex items-center gap-1.5">
                <span>Form Questionnaire & Answers</span>
              </div>
              <div className="bg-[#FDFBF7] rounded-2xl border border-[#C9A227]/20 p-3.5 space-y-2.5">
                {activeModalLead.budget && (
                  <div className="flex items-start justify-between gap-2 border-b border-gray-100 pb-1.5">
                    <span className="text-xs text-[#7A7560]">Investment Budget:</span>
                    <span className="text-xs font-bold text-[#1A1800] text-right">{activeModalLead.budget}</span>
                  </div>
                )}
                {activeModalLead.planning && (
                  <div className="flex items-start justify-between gap-2 border-b border-gray-100 pb-1.5">
                    <span className="text-xs text-[#7A7560]">Planning To Buy:</span>
                    <span className="text-xs font-bold text-[#1A1800] text-right">{activeModalLead.planning.replace(/_/g, ' ')}</span>
                  </div>
                )}
                {activeModalLead.visitTimeline && (
                  <div className="flex items-start justify-between gap-2 border-b border-gray-100 pb-1.5">
                    <span className="text-xs text-[#7A7560]">Site Visit Timeline:</span>
                    <span className="text-xs font-bold text-[#1A1800] text-right">{activeModalLead.visitTimeline.replace(/_/g, ' ')}</span>
                  </div>
                )}
                {activeModalLead.configuration && (
                  <div className="flex items-start justify-between gap-2 border-b border-gray-100 pb-1.5">
                    <span className="text-xs text-[#7A7560]">Preferred Configuration:</span>
                    <span className="text-xs font-bold text-[#1A1800] text-right">{activeModalLead.configuration}</span>
                  </div>
                )}
                {activeModalLead.city && (
                  <div className="flex items-start justify-between gap-2 border-b border-gray-100 pb-1.5">
                    <span className="text-xs text-[#7A7560]">City:</span>
                    <span className="text-xs font-bold text-[#1A1800] text-right">{activeModalLead.city}</span>
                  </div>
                )}
                {activeModalLead.leadId && (
                  <div className="flex items-start justify-between gap-2">
                    <span className="text-xs text-[#7A7560]">Meta Lead ID:</span>
                    <span className="text-xs font-mono text-[#7A7560] text-right">{activeModalLead.leadId}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Modal Footer */}
            <div className="flex items-center justify-end gap-2 pt-3 border-t border-[#C9A227]/15">
              <button
                onClick={() => setActiveModalLead(null)}
                className="px-4 py-2 rounded-xl bg-[#1A1800] text-white text-xs font-bold hover:bg-[#333] transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 6. Instant Webhook Setup Guide Modal */}
      {showWebhookGuide && (
        <div 
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={() => setShowWebhookGuide(false)}
        >
          <div 
            className="bg-white rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-y-auto border border-[#C9A227]/30 shadow-2xl p-6 relative animate-in fade-in zoom-in-95"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="flex items-start justify-between pb-4 border-b border-[#C9A227]/15">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-[#FFF0C2] text-[#8C6B10] flex items-center justify-center shadow-inner">
                  <Zap size={20} className="text-[#B38715]" />
                </div>
                <div>
                  <h3 className="text-lg font-black text-[#1A1800]">
                    Instant Real-Time Google Sheets Webhook
                  </h3>
                  <p className="text-xs text-[#7A7560]">
                    0-Second Auto-Push Trigger for New Meta Leads
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowWebhookGuide(false)}
                className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 text-[#7A7560] flex items-center justify-center transition-colors"
              >
                <X size={16} />
              </button>
            </div>

            {/* Modal Content */}
            <div className="my-5 space-y-4 text-xs text-[#1A1800]">
              <div className="p-3.5 rounded-2xl bg-[#EAF7EE] border border-[#107C41]/20 flex items-start gap-2.5">
                <CheckCircle size={18} className="text-[#107C41] shrink-0 mt-0.5" />
                <div>
                  <p className="font-bold text-[#0E6228]">Auto-Sync is already running automatically!</p>
                  <p className="text-[#0E6228]/80 text-[11px] mt-0.5">
                    Har 25 seconds me background system Google Sheets se fresh leads auto-fetch karta hai. Agar aap chahte hain ki Google Sheet me row aate hi instant 0-second me update ho jaye, to niche diya Apps Script use karein.
                  </p>
                </div>
              </div>

              <div>
                <p className="font-bold mb-1.5 text-xs text-[#1A1800]">
                  📌 Step 1: Google Sheet me Apps Script Open karein
                </p>
                <p className="text-[#7A7560] text-[11px]">
                  Apni Google Sheet me upar <strong>Extensions &gt; Apps Script</strong> par click karein.
                </p>
              </div>

              <div>
                <p className="font-bold mb-1.5 text-xs text-[#1A1800]">
                  📌 Step 2: Niche diye code ko paste karein
                </p>
                <div className="relative">
                  <pre className="bg-[#1A1800] text-[#E5D7B5] p-4 rounded-2xl text-[11px] font-mono overflow-x-auto leading-relaxed">
{`function onEdit(e) {
  triggerSync();
}

function triggerSync() {
  var url = "https://ssrealty.org/api/webhooks/meta-sheet-sync";
  try {
    UrlFetchApp.fetch(url, {
      method: "POST",
      muteHttpExceptions: true
    });
  } catch (err) {
    Logger.log(err);
  }
}`}
                  </pre>
                  <button
                    onClick={() => {
                      copyToClipboard(`function onEdit(e) {\n  triggerSync();\n}\n\nfunction triggerSync() {\n  var url = "https://ssrealty.org/api/webhooks/meta-sheet-sync";\n  try {\n    UrlFetchApp.fetch(url, {\n      method: "POST",\n      muteHttpExceptions: true\n    });\n  } catch (err) {\n    Logger.log(err);\n  }\n}`, 'script-code');
                    }}
                    className="absolute top-2.5 right-2.5 px-2.5 py-1 bg-white/10 hover:bg-white/20 text-white rounded-lg text-[10px] font-bold flex items-center gap-1 transition-colors"
                  >
                    {copiedId === 'script-code' ? <Check size={12} className="text-green-400" /> : <Copy size={12} />}
                    <span>{copiedId === 'script-code' ? 'Copied' : 'Copy Script'}</span>
                  </button>
                </div>
              </div>

              <div>
                <p className="font-bold mb-1.5 text-xs text-[#1A1800]">
                  📌 Step 3: Trigger set karein (Optional for Automatic Form Submissions)
                </p>
                <p className="text-[#7A7560] text-[11px]">
                  Apps Script me left menu me <strong>Triggers (Clock icon)</strong> &gt; <strong>Add Trigger</strong> par click karein &gt; Choose <em>&quot;triggerSync&quot;</em> &gt; Event type: <strong>&quot;On change&quot;</strong> ya Time-driven (Every 1 minute).
                </p>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="flex items-center justify-end gap-2 pt-3 border-t border-[#C9A227]/15">
              <button
                onClick={() => setShowWebhookGuide(false)}
                className="px-5 py-2.5 rounded-xl bg-[#1A1800] text-white text-xs font-bold hover:bg-[#333] transition-colors shadow"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
