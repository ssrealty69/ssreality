'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';
import {
  Users, Phone, Star, Home, RefreshCw, TrendingUp, Loader2,
  CheckCircle2, XCircle, ChevronRight, X, Download, Calendar,
  BarChart2, ClipboardList, PhoneCall, UserCheck, Clock,
  FileSpreadsheet, ChevronDown, History, CalendarCheck,
  Smartphone, Radio, Activity, Zap, MapPin
} from 'lucide-react';
import toast from 'react-hot-toast';
import * as XLSX from 'xlsx';
import AutoDistributionToggle from '@/components/admin/AutoDistributionToggle';

// ─── Types ─────────────────────────────────────────────────────────────────

interface AgentReport {
  agentId: string;
  name: string;
  username: string;
  employee_id?: string;
  isActive: boolean;
  isReceivingLeads?: boolean;
  isOnline?: boolean;
  lastActiveAt?: string | null;
  lastDistanceKm?: number | null;
  lastDistanceFormatted?: string | null;
  todayActiveSeconds?: number;
  todayActiveFormatted?: string;
  totalActiveSecondsInRange?: number;
  activeFormattedInRange?: string;
  punchIn?: string | null;
  punchOut?: string | null;
  sessionCount?: number;
  totalLeads: number;
  assigned?: number;
  callsToday: number;
  manualDialed: number;
  notInterested: number;
  visitScheduled: number;
  visitDone: number;
  booked?: number;
  bookingDone?: number;
  interested: number;
  followUp: number;
  connected: number;
  notConnected: number;
  newLeads: number;
}

interface AgentDetailStats {
  totalLeads: number;
  assigned?: number;
  callsInRange: number;
  manualDialed: number;
  notInterested: number;
  visitScheduled: number;
  visitDone: number;
  booked?: number;
  bookingDone?: number;
  interested: number;
  followUp: number;
  connected: number;
  notConnected: number;
  newLeads: number;
}

interface CallHistoryEntry {
  disposition: string;
  notes?: string;
  calledAt: string;
}

interface AgentLeadRow {
  _id: string;
  name: string;
  phone: string;
  email?: string;
  propertyInterest?: string;
  disposition: string;
  history: CallHistoryEntry[];
  followUpDate?: string;
  updatedAt: string;
  createdAt: string;
}

interface AttendanceRow {
  date: string;
  punchIn?: string;
  punchOut?: string;
  totalMinutes?: number;
  activeSeconds?: number;
  activeFormatted?: string;
  lastActiveAt?: string;
  sessionCount?: number;
  status: 'present' | 'absent' | 'off';
}

// ─── Date helpers (LOCAL timezone, not UTC) ──────────────────────────────────

function localDateStr(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}
function today() { return localDateStr(new Date()); }
function yesterday() { const d = new Date(); d.setDate(d.getDate() - 1); return localDateStr(d); }
function thisWeekStart() { const d = new Date(); d.setDate(d.getDate() - d.getDay()); return localDateStr(d); }
function thisMonthStart() { const d = new Date(); d.setDate(1); return localDateStr(d); }

type DatePreset = 'today' | 'yesterday' | 'this_week' | 'this_month' | 'custom';

function getPresetRange(preset: DatePreset): { from: string; to: string } {
  const t = today();
  switch (preset) {
    case 'today':      return { from: t, to: t };
    case 'yesterday':  return { from: yesterday(), to: yesterday() };
    case 'this_week':  return { from: thisWeekStart(), to: t };
    case 'this_month': return { from: thisMonthStart(), to: t };
    default:           return { from: t, to: t };
  }
}

// Parse YYYY-MM-DD as LOCAL date (not UTC) to avoid 1-day shift
function parseLocalDate(iso: string): Date {
  const [y, m, d] = iso.split('-').map(Number);
  return new Date(y, m - 1, d);
}
function fmtDate(iso: string) {
  const d = iso.includes('T') ? new Date(iso) : parseLocalDate(iso);
  return d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
}
function fmtDateTime(iso: string) {
  const d = new Date(iso);
  return `${d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', timeZone: 'Asia/Kolkata' })} ${d.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', timeZone: 'Asia/Kolkata' })}`;
}
function fmtMinutes(m?: number) {
  if (!m) return '—';
  const h = Math.floor(m / 60);
  const min = m % 60;
  return h > 0 ? `${h}h ${min}m` : `${min}m`;
}
function formatTimeAgo(dateStr?: string | null): string {
  if (!dateStr) return 'Never';
  const diffMs = Date.now() - new Date(dateStr).getTime();
  const diffMins = Math.floor(diffMs / 60000);
  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  const diffHours = Math.floor(diffMins / 60);
  if (diffHours < 24) return `${diffHours}h ago`;
  return new Date(dateStr).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
}

const DISPOSITION_LABELS: Record<string, string> = {
  new: 'New', ringing: 'Ringing', connected: 'Connected',
  not_connected: 'Not Connected', switch_off: 'Switch Off',
  not_reachable: 'Not Reachable', interested: 'Interested',
  not_interested: 'Not Interested', visit_scheduled: 'V. Scheduled',
  visit_done: 'Visit Done', booked: 'Booking Done', follow_up: 'Follow Up',
};
const DISPOSITION_COLORS: Record<string, string> = {
  new: '#94A3B8', ringing: '#60A5FA', connected: '#3B82F6',
  not_connected: '#EF4444', switch_off: '#F97316', not_reachable: '#EF4444',
  interested: '#10B981', not_interested: '#DC2626', visit_scheduled: '#6366F1',
  visit_done: '#8B5CF6', booked: '#10B981', follow_up: '#F59E0B',
};

// ─── Main Component ──────────────────────────────────────────────────────────

export default function AgentReportsPage() {
  const [reports, setReports] = useState<AgentReport[]>([]);
  const [loading, setLoading] = useState(true);

  // Date filter
  const [preset, setPreset] = useState<DatePreset>('today');
  const [fromDate, setFromDate] = useState(today());
  const [toDate, setToDate] = useState(today());
  const [showCustom, setShowCustom] = useState(false);

  // Agent detail drawer
  const [selectedAgent, setSelectedAgent] = useState<AgentReport | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [detailStats, setDetailStats] = useState<AgentDetailStats | null>(null);
  const [detailLeads, setDetailLeads] = useState<AgentLeadRow[]>([]);
  const [detailTab, setDetailTab] = useState<'leads' | 'attendance'>('leads');
  const [dispositionFilter, setDispositionFilter] = useState('all');
  const [expandedLeadId, setExpandedLeadId] = useState<string | null>(null);

  // Drawer Date Filter State (Defaults to 'this_month' so full month stats & downloads are available)
  const [drawerPreset, setDrawerPreset] = useState<DatePreset>('this_month');
  const [drawerFromDate, setDrawerFromDate] = useState(thisMonthStart());
  const [drawerToDate, setDrawerToDate] = useState(today());
  const [drawerShowCustom, setDrawerShowCustom] = useState(false);

  // Attendance
  const [attendance, setAttendance] = useState<AttendanceRow[]>([]);
  const [attendanceLoading, setAttendanceLoading] = useState(false);

  // Master download
  const [masterLoading, setMasterLoading] = useState(false);

  // ── Fetch summary reports ──────────────────────────────────────────────────

  const fetchReports = useCallback(async (from: string, to: string, isManual = false) => {
    if (typeof window !== 'undefined' && (!navigator.onLine || document.hidden) && !isManual) {
      return;
    }
    if (isManual) toast.loading('Refreshing reports & screen time...', { id: 'reports-refresh' });
    if (!reports.length) setLoading(true);
    try {
      const res = await fetch(`/api/admin/agents/reports?from=${from}&to=${to}`);
      if (!res.ok) {
        if (isManual) toast.error('Failed to load reports', { id: 'reports-refresh' });
        return;
      }
      const data = await res.json();
      if (data.success) {
        setReports(data.data);
        if (isManual) toast.success('Reports updated', { id: 'reports-refresh' });
      } else {
        if (isManual) toast.error(data.error, { id: 'reports-refresh' });
      }
    } catch { 
      if (isManual) toast.error('Failed to load reports', { id: 'reports-refresh' }); 
    }
    finally { setLoading(false); }
  }, [reports.length]);

  useEffect(() => { 
    fetchReports(fromDate, toDate); 

    // Auto-refresh presence every 30s
    const interval = setInterval(() => {
      fetchReports(fromDate, toDate);
    }, 30000);
    return () => clearInterval(interval);
  }, [fetchReports, fromDate, toDate]);

  // ── Preset change on main page ─────────────────────────────────────────────

  const handlePreset = (p: DatePreset) => {
    setPreset(p);
    if (p === 'custom') {
      setShowCustom(true);
      return;
    }
    setShowCustom(false);
    const range = getPresetRange(p);
    setFromDate(range.from);
    setToDate(range.to);
    fetchReports(range.from, range.to, true);
  };

  const handleCustomApply = () => {
    if (new Date(fromDate) > new Date(toDate)) {
      toast.error('From date cannot be after To date');
      return;
    }
    fetchReports(fromDate, toDate, true);
  };

  // ── Totals across all agents ───────────────────────────────────────────────

  const totals = useMemo(() => reports.reduce((acc, r) => ({
    leads: acc.leads + (r.assigned !== undefined ? r.assigned : r.totalLeads),
    dialed: acc.dialed + r.manualDialed,
    calls: acc.calls + r.callsToday,
    notInterested: acc.notInterested + (r.notInterested || 0),
    visitScheduled: acc.visitScheduled + (r.visitScheduled || 0),
    visitDone: acc.visitDone + (r.visitDone || 0),
    booked: acc.booked + (r.booked || r.bookingDone || 0),
    activeSeconds: acc.activeSeconds + (r.todayActiveSeconds || 0),
    onlineCount: acc.onlineCount + (r.isOnline ? 1 : 0),
  }), { 
    leads: 0, 
    dialed: 0, 
    calls: 0, 
    notInterested: 0,
    visitScheduled: 0, 
    visitDone: 0,
    booked: 0,
    activeSeconds: 0,
    onlineCount: 0
  }), [reports]);

  // Total screen time formatted
  const totalScreenTimeFormatted = useMemo(() => {
    const s = totals.activeSeconds;
    const h = Math.floor(s / 3600);
    const m = Math.floor((s % 3600) / 60);
    if (h > 0) return `${h}h ${m}m`;
    return `${m}m`;
  }, [totals.activeSeconds]);

  // ── Open agent detail drawer ───────────────────────────────────────────────

  const openAgentDetail = async (r: AgentReport, customFrom?: string, customTo?: string) => {
    const from = customFrom || drawerFromDate;
    const to = customTo || drawerToDate;
    setSelectedAgent(r);
    setDetailTab('leads');
    setDispositionFilter('all');
    setExpandedLeadId(null);
    setDetailLoading(true);
    setDetailStats(null);
    setDetailLeads([]);
    
    // Pre-fetch attendance in background so it displays instantly when switching tabs
    fetchAttendance(r.agentId, from, to);

    try {
      const res = await fetch(`/api/admin/agents/${r.agentId}/detail?from=${from}&to=${to}`);
      const data = await res.json();
      if (data.success) {
        if (data.agent?.employee_id) {
          setSelectedAgent(prev => prev ? { ...prev, employee_id: data.agent.employee_id } : prev);
        }
        setDetailStats(data.stats);
        setDetailLeads(data.leads);
      } else toast.error(data.error);
    } catch { toast.error('Failed to load agent detail'); }
    finally { setDetailLoading(false); }
  };

  const handleDrawerPreset = (p: DatePreset) => {
    setDrawerPreset(p);
    if (p === 'custom') {
      setDrawerShowCustom(true);
      return;
    }
    setDrawerShowCustom(false);
    const range = getPresetRange(p);
    setDrawerFromDate(range.from);
    setDrawerToDate(range.to);
    if (selectedAgent) {
      openAgentDetail(selectedAgent, range.from, range.to);
      fetchAttendance(selectedAgent.agentId, range.from, range.to);
    }
  };

  const handleDrawerCustomApply = () => {
    if (new Date(drawerFromDate) > new Date(drawerToDate)) {
      toast.error('From date cannot be after To date');
      return;
    }
    if (selectedAgent) {
      openAgentDetail(selectedAgent, drawerFromDate, drawerToDate);
      fetchAttendance(selectedAgent.agentId, drawerFromDate, drawerToDate);
    }
  };

  const closeDrawer = () => {
    setSelectedAgent(null);
    setDetailStats(null);
    setDetailLeads([]);
    setAttendance([]);
  };

  // ── Attendance ─────────────────────────────────────────────────────────────

  const fetchAttendance = async (agentId: string, customFrom?: string, customTo?: string) => {
    const from = customFrom || drawerFromDate;
    const to = customTo || drawerToDate;
    setAttendanceLoading(true);
    try {
      const res = await fetch(`/api/admin/agents/${agentId}/attendance?from=${from}&to=${to}`);
      const data = await res.json();
      if (data.success) setAttendance(data.attendance || []);
      else toast.error(data.error);
    } catch { toast.error('Failed to load attendance'); }
    finally { setAttendanceLoading(false); }
  };

  const handleTabChange = (tab: 'leads' | 'attendance') => {
    setDetailTab(tab);
    if (tab === 'attendance' && selectedAgent) {
      fetchAttendance(selectedAgent.agentId, drawerFromDate, drawerToDate);
    }
  };

  // ── Toggle Individual Agent Lead Queue (Active vs On Leave / Absent) ───────
  const handleToggleAgentQueue = async (agentId: string, agentName: string, nextStatus: boolean) => {
    // Optimistic UI update
    setReports(prev => prev.map(a => a.agentId === agentId ? { ...a, isReceivingLeads: nextStatus } : a));
    if (selectedAgent && selectedAgent.agentId === agentId) {
      setSelectedAgent(prev => prev ? { ...prev, isReceivingLeads: nextStatus } : prev);
    }

    try {
      const res = await fetch(`/api/admin/agents/${agentId}/distribution-status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isReceivingLeads: nextStatus }),
      });
      const data = await res.json();
      if (data.success) {
        toast.success(data.message);
      } else {
        toast.error(data.error || 'Failed to update agent status');
        // Revert
        setReports(prev => prev.map(a => a.agentId === agentId ? { ...a, isReceivingLeads: !nextStatus } : a));
      }
    } catch {
      toast.error('Network error updating agent queue status');
      setReports(prev => prev.map(a => a.agentId === agentId ? { ...a, isReceivingLeads: !nextStatus } : a));
    }
  };

  // ── Filtered leads in detail drawer ────────────────────────────────────────

  const filteredDetailLeads = useMemo(() => {
    if (dispositionFilter === 'all') return detailLeads;
    return detailLeads.filter(l => l.disposition === dispositionFilter);
  }, [detailLeads, dispositionFilter]);

  // ── Excel: agent full history ──────────────────────────────────────────────

  const downloadAgentExcel = async (agentId: string, agentName: string, disposition = 'all') => {
    try {
      toast.loading('Preparing Excel...', { id: 'excel' });
      const from = drawerFromDate || fromDate;
      const to = drawerToDate || toDate;
      const url = `/api/admin/agents/${agentId}/excel?disposition=${disposition}&from=${from}&to=${to}`;
      const res = await fetch(url);
      const data = await res.json();
      if (!data.success) { toast.error(data.error, { id: 'excel' }); return; }

      const ws = XLSX.utils.json_to_sheet(data.rows);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, 'Call History');

      // Column widths
      const maxLens = Object.keys(data.rows[0] || {}).map(k => ({ wch: Math.max(k.length, 18) }));
      ws['!cols'] = maxLens;

      const fileName = `${agentName.replace(/\s/g, '_')}_${disposition === 'all' ? 'Full_History' : disposition}_${from}_to_${to}.xlsx`;
      XLSX.writeFile(wb, fileName);
      toast.success('Downloaded!', { id: 'excel' });
    } catch { toast.error('Download failed', { id: 'excel' }); }
  };

  // ── Excel: attendance ──────────────────────────────────────────────────────

  const downloadAttendanceExcel = async (agentId: string, agentName: string) => {
    try {
      toast.loading('Preparing Attendance...', { id: 'att' });
      const from = drawerFromDate || fromDate;
      const to = drawerToDate || toDate;
      const res = await fetch(`/api/admin/agents/${agentId}/attendance?from=${from}&to=${to}`);
      const data = await res.json();
      if (!data.success) { toast.error(data.error, { id: 'att' }); return; }

      const rows = data.attendance.map((r: AttendanceRow) => ({
        'Date': r.date,
        'Status': r.status === 'present' ? 'Present' : r.status === 'off' ? 'Day Off' : 'Absent',
        'App Screen Time': r.activeFormatted || '0m',
        'Punch In': r.punchIn ? fmtDateTime(r.punchIn) : '—',
        'Punch Out': r.punchOut ? fmtDateTime(r.punchOut) : '—',
        'Working Hours': fmtMinutes(r.totalMinutes),
        'App Sessions': r.sessionCount || 1,
      }));

      const ws = XLSX.utils.json_to_sheet(rows);
      ws['!cols'] = [{ wch: 14 }, { wch: 12 }, { wch: 16 }, { wch: 20 }, { wch: 20 }, { wch: 16 }, { wch: 14 }];
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, 'Attendance & Screen Time');
      XLSX.writeFile(wb, `${agentName.replace(/\s/g, '_')}_Attendance_${fromDate}_to_${toDate}.xlsx`);
      toast.success('Attendance downloaded!', { id: 'att' });
    } catch { toast.error('Download failed', { id: 'att' }); }
  };

  // ── Master report ──────────────────────────────────────────────────────────

  const downloadMasterReport = async (type: 'summary' | 'calls') => {
    try {
      toast.loading('Preparing Master Report...', { id: 'master' });
      setMasterLoading(true);
      const res = await fetch(`/api/admin/reports/master-excel?from=${fromDate}&to=${toDate}&type=${type}`);
      const data = await res.json();
      if (!data.success) { toast.error(data.error, { id: 'master' }); return; }

      if (!data.rows?.length) { toast.error('No data found for the selected range', { id: 'master' }); return; }

      const ws = XLSX.utils.json_to_sheet(data.rows);
      const maxLens = Object.keys(data.rows[0]).map(k => ({ wch: Math.max(k.length, 16) }));
      ws['!cols'] = maxLens;
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, type === 'summary' ? 'Team Summary' : 'All Calls');
      XLSX.writeFile(wb, `SS_Realty_${type === 'summary' ? 'Team_Summary' : 'All_Calls'}_${fromDate}_to_${toDate}.xlsx`);
      toast.success('Master Report downloaded!', { id: 'master' });
    } catch { toast.error('Download failed', { id: 'master' }); }
    finally { setMasterLoading(false); }
  };

  // ── Master: disposition-filtered (all agents) ─────────────────────────────

  const downloadMasterDisposition = async (disposition: string) => {
    try {
      toast.loading(`Preparing ${disposition} Report...`, { id: 'master' });
      setMasterLoading(true);
      const res = await fetch(`/api/admin/reports/master-excel?from=${fromDate}&to=${toDate}&type=disposition&disposition=${disposition}`);
      const data = await res.json();
      if (!data.success) { toast.error(data.error || 'Failed to generate report', { id: 'master' }); return; }

      if (!data.rows || !data.rows.length) { toast.error('No records found for this category', { id: 'master' }); return; }

      const ws = XLSX.utils.json_to_sheet(data.rows);
      const maxLens = Object.keys(data.rows[0]).map(k => ({ wch: Math.max(k.length, 16) }));
      ws['!cols'] = maxLens;
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, disposition.replace('_', ' ').toUpperCase());
      XLSX.writeFile(wb, `SS_Realty_All_${disposition}_${fromDate}_to_${toDate}.xlsx`);
      toast.success('Downloaded!', { id: 'master' });
    } catch { toast.error('Download failed', { id: 'master' }); }
    finally { setMasterLoading(false); }
  };

  // ── Master: attendance (all agents) ───────────────────────────────────────

  const downloadAllAttendance = async () => {
    try {
      toast.loading('Preparing All Attendance...', { id: 'master' });
      setMasterLoading(true);
      const res = await fetch(`/api/admin/reports/master-excel?from=${fromDate}&to=${toDate}&type=attendance`);
      const data = await res.json();
      if (!data.success) { toast.error(data.error || 'Failed to load attendance', { id: 'master' }); return; }

      if (!data.rows || !data.rows.length) { toast.error('No attendance records found', { id: 'master' }); return; }

      const ws = XLSX.utils.json_to_sheet(data.rows);
      ws['!cols'] = Object.keys(data.rows[0]).map(k => ({ wch: Math.max(k.length, 16) }));
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, 'Attendance & Screen Time');
      XLSX.writeFile(wb, `SS_Realty_All_Attendance_${fromDate}_to_${toDate}.xlsx`);
      toast.success('Attendance downloaded!', { id: 'master' });
    } catch { toast.error('Download failed', { id: 'master' }); }
    finally { setMasterLoading(false); }
  };

  // ── Render ─────────────────────────────────────────────────────────────────

  const PRESETS: { id: DatePreset; label: string }[] = [
    { id: 'today', label: 'Today' },
    { id: 'yesterday', label: 'Yesterday' },
    { id: 'this_week', label: 'This Week' },
    { id: 'this_month', label: 'This Month' },
    { id: 'custom', label: 'Custom' },
  ];

  return (
    <div className="space-y-6 animate-in fade-in duration-500 pb-16">

      {/* ── Agent Detail Drawer ── */}
      {selectedAgent && (
        <div className="fixed inset-0 z-50 flex">
          {/* Backdrop */}
          <div className="flex-1 bg-black/40 backdrop-blur-sm" onClick={closeDrawer} />
          {/* Drawer */}
          <div className="w-full max-w-3xl bg-white shadow-2xl flex flex-col overflow-hidden animate-in slide-in-from-right duration-300">
            {/* Drawer Header */}
            <div className="bg-gradient-to-r from-[#1A1800] via-[#2A2400] to-[#3D3500] px-6 py-5 flex items-center gap-4 shrink-0 shadow-md">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#C9A227] to-[#B8860B] flex items-center justify-center text-white font-black text-xl shadow-lg shrink-0">
                {selectedAgent.name.charAt(0).toUpperCase()}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2.5 flex-wrap">
                  <h2 className="font-black text-white text-xl tracking-tight drop-shadow-sm" style={{ color: '#FFFFFF' }}>
                    {selectedAgent.name}
                  </h2>
                  {selectedAgent.isOnline ? (
                    <span className="px-2.5 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider bg-emerald-500 text-white flex items-center gap-1 shadow-sm">
                      <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse"></span> Active Now
                    </span>
                  ) : selectedAgent.lastActiveAt ? (
                    <span className="text-[10px] text-gray-300 font-semibold bg-white/10 px-2 py-0.5 rounded-full">
                      Last seen: {formatTimeAgo(selectedAgent.lastActiveAt)}
                    </span>
                  ) : null}
                </div>
                {/* Employee ID Display */}
                <div className="flex items-center gap-1.5 mt-1">
                  <span className="text-[10px] font-black uppercase text-[#F0D060] tracking-wider">Employee ID:</span>
                  <span className="font-mono text-xs font-bold text-white bg-white/15 px-2.5 py-0.5 rounded-lg border border-white/20 tracking-wider">
                    {selectedAgent.employee_id || 'SSR001'}
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {/* Agent Queue Distribution Switch in Drawer */}
                <button
                  onClick={() => handleToggleAgentQueue(selectedAgent.agentId, selectedAgent.name, !selectedAgent.isReceivingLeads)}
                  className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all border shadow-sm cursor-pointer ${
                    selectedAgent.isReceivingLeads !== false
                      ? 'bg-emerald-500/20 text-emerald-300 border-emerald-400/40 hover:bg-emerald-500/30'
                      : 'bg-red-500/20 text-red-300 border-red-400/40 hover:bg-red-500/30'
                  }`}
                  title={
                    selectedAgent.isReceivingLeads !== false
                      ? 'Queue Active: Click to pause lead distribution for this agent'
                      : 'On Leave: Click to activate lead queue for this agent'
                  }
                >
                  <span className="relative flex h-2 w-2">
                    {selectedAgent.isReceivingLeads !== false && (
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                    )}
                    <span className={`relative inline-flex rounded-full h-2 w-2 ${selectedAgent.isReceivingLeads !== false ? 'bg-emerald-400' : 'bg-red-400'}`}></span>
                  </span>
                  <span>{selectedAgent.isReceivingLeads !== false ? 'Queue: ON' : 'Queue: OFF (Leave)'}</span>
                </button>

                <span className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase ${selectedAgent.isActive ? 'bg-emerald-400/20 text-emerald-300 border border-emerald-400/30' : 'bg-red-400/20 text-red-300 border border-red-400/30'}`}>
                  {selectedAgent.isActive ? '● Active' : '● Inactive'}
                </span>
                <button onClick={closeDrawer} className="text-white/70 hover:text-white p-2 rounded-xl hover:bg-white/10 transition-all cursor-pointer">
                  <X size={18} />
                </button>
              </div>
            </div>

            {/* Live Screen Time & Presence Summary Bar in Drawer */}
            <div className="bg-amber-50/70 border-b border-amber-200/80 px-6 py-3 flex flex-wrap items-center justify-between gap-3 shrink-0">
              <div className="flex items-center gap-2">
                <Smartphone size={16} className="text-[#C9A227]" />
                <span className="text-xs font-black text-gray-800 uppercase tracking-wider">
                  App Screen Time:
                </span>
                <span className="text-xs font-extrabold text-[#1A1800] bg-white px-2.5 py-0.5 rounded-md border border-amber-300 shadow-sm font-mono">
                  {selectedAgent.todayActiveFormatted || selectedAgent.activeFormattedInRange || '0m'}
                </span>
              </div>
              <div className="flex items-center gap-4 text-xs font-semibold text-gray-600 flex-wrap">
                {selectedAgent.lastDistanceFormatted && (
                  <span className="flex items-center gap-1 text-[#8B6914] bg-white border border-amber-300 px-2 py-0.5 rounded-md font-extrabold text-[11px] shadow-2xs">
                    <MapPin size={12} className="text-[#8B6914]" />
                    {selectedAgent.lastDistanceFormatted}
                  </span>
                )}
                <span>Punch In: <b className="text-gray-900">{selectedAgent.punchIn ? new Date(selectedAgent.punchIn).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', timeZone: 'Asia/Kolkata' }) : '—'}</b></span>
                <span>Last Active: <b className="text-gray-900">{selectedAgent.lastActiveAt ? new Date(selectedAgent.lastActiveAt).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', timeZone: 'Asia/Kolkata' }) : '—'}</b></span>
              </div>
            </div>

            {/* Stats Row */}
            {detailStats && (
              <div className="grid grid-cols-5 border-b border-gray-100 shrink-0">
                {[
                  { label: 'Assigned', value: detailStats.assigned !== undefined ? detailStats.assigned : detailStats.totalLeads, color: '#3B82F6' },
                  { label: 'Not Interested', value: detailStats.notInterested || 0, color: '#EF4444' },
                  { label: 'V. Scheduled', value: detailStats.visitScheduled || 0, color: '#6366F1' },
                  { label: 'Visit Done', value: detailStats.visitDone || 0, color: '#8B5CF6' },
                  { label: 'Booking Done', value: detailStats.booked || detailStats.bookingDone || 0, color: '#10B981' },
                ].map(s => (
                  <div key={s.label} className="p-4 text-center border-r border-gray-50 last:border-r-0">
                    <p className="text-xl font-black" style={{ color: s.color }}>{s.value}</p>
                    <p className="text-[9px] font-black text-gray-400 uppercase tracking-wider mt-0.5 leading-tight">{s.label}</p>
                  </div>
                ))}
              </div>
            )}

            {/* Date Range Selector Bar inside Employee Detail Drawer */}
            <div className="bg-gradient-to-r from-amber-50/90 via-amber-50/40 to-white px-6 py-3 border-b border-amber-200/80 flex flex-wrap items-center justify-between gap-3 shrink-0">
              <div className="flex items-center gap-2">
                <Calendar size={14} className="text-[#C9A227]" />
                <span className="text-xs font-black text-gray-800 uppercase tracking-wider">
                  Report Period:
                </span>
                <span className="text-[11px] font-extrabold text-[#8B6914] bg-white px-2.5 py-0.5 rounded-lg border border-amber-300 shadow-2xs font-mono">
                  {fmtDate(drawerFromDate)} — {fmtDate(drawerToDate)}
                </span>
              </div>

              <div className="flex flex-wrap items-center gap-1.5">
                {[
                  { id: 'this_month', label: 'This Month' },
                  { id: 'today', label: 'Today' },
                  { id: 'yesterday', label: 'Yesterday' },
                  { id: 'this_week', label: 'This Week' },
                  { id: 'custom', label: 'Custom Date' },
                ].map(p => (
                  <button
                    key={p.id}
                    onClick={() => handleDrawerPreset(p.id as DatePreset)}
                    className={`px-3 py-1 rounded-lg text-[11px] font-black transition-all cursor-pointer ${
                      drawerPreset === p.id
                        ? 'bg-[#C9A227] text-[#1A1800] shadow-sm font-extrabold'
                        : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'
                    }`}
                  >
                    {p.label}
                  </button>
                ))}

                {drawerShowCustom && (
                  <div className="flex items-center gap-1.5 bg-white border border-amber-300 rounded-lg px-2.5 py-1 shadow-xs ml-1">
                    <input
                      type="date"
                      value={drawerFromDate}
                      onChange={e => setDrawerFromDate(e.target.value)}
                      className="text-xs font-bold text-gray-800 outline-none bg-transparent"
                    />
                    <span className="text-gray-400 text-xs">→</span>
                    <input
                      type="date"
                      value={drawerToDate}
                      onChange={e => setDrawerToDate(e.target.value)}
                      className="text-xs font-bold text-gray-800 outline-none bg-transparent"
                    />
                    <button
                      onClick={handleDrawerCustomApply}
                      className="px-2.5 py-0.5 bg-[#C9A227] text-[#1A1800] text-[10px] font-black rounded hover:bg-[#B8860B] transition-all cursor-pointer"
                    >
                      Apply
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Download Buttons */}
            <div className="px-6 py-2.5 bg-gray-50/80 border-b border-gray-100 flex items-center gap-1.5 flex-nowrap overflow-x-auto shrink-0 scrollbar-none">
              <button
                onClick={() => downloadAgentExcel(selectedAgent.agentId, selectedAgent.name, 'all')}
                className="inline-flex items-center gap-1 px-2.5 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 rounded-lg text-[11px] font-black transition-all cursor-pointer shrink-0"
              >
                <FileSpreadsheet size={12} /> Full History
              </button>
              {['not_interested', 'visit_scheduled', 'visit_done', 'booked'].map(d => (
                <button
                  key={d}
                  onClick={() => downloadAgentExcel(selectedAgent.agentId, selectedAgent.name, d)}
                  className="inline-flex items-center gap-1 px-2.5 py-1.5 bg-white hover:bg-gray-100 text-gray-600 border border-gray-200 rounded-lg text-[11px] font-black transition-all cursor-pointer shrink-0"
                >
                  <Download size={11} /> {DISPOSITION_LABELS[d] || d}
                </button>
              ))}
              <button
                onClick={() => downloadAttendanceExcel(selectedAgent.agentId, selectedAgent.name)}
                className="inline-flex items-center gap-1 px-2.5 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 rounded-lg text-[11px] font-black transition-all cursor-pointer shrink-0"
              >
                <CalendarCheck size={12} /> Attendance
              </button>
            </div>

            {/* Tabs */}
            <div className="px-6 pt-4 flex gap-2 border-b border-gray-100 shrink-0">
              <button
                onClick={() => handleTabChange('leads')}
                className={`pb-3 px-1 text-xs font-black uppercase tracking-wider border-b-2 transition-all cursor-pointer ${detailTab === 'leads' ? 'border-[#C9A227] text-[#C9A227]' : 'border-transparent text-gray-400 hover:text-gray-600'}`}
              >
                <span className="flex items-center gap-1.5"><FileSpreadsheet size={13} /> Leads</span>
              </button>
              <button
                onClick={() => handleTabChange('attendance')}
                className={`pb-3 px-1 text-xs font-black uppercase tracking-wider border-b-2 transition-all cursor-pointer ${detailTab === 'attendance' ? 'border-[#C9A227] text-[#C9A227]' : 'border-transparent text-gray-400 hover:text-gray-600'}`}
              >
                <span className="flex items-center gap-1.5"><Calendar size={13} /> Attendance & Screen Time</span>
              </button>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto">
              {detailLoading ? (
                <div className="flex justify-center py-20">
                  <Loader2 className="animate-spin text-[#C9A227]" size={32} />
                </div>
              ) : detailTab === 'leads' ? (
                <div>
                  {/* Disposition filter */}
                  <div className="px-6 py-3 flex items-center gap-2 flex-wrap border-b border-gray-50">
                    <span className="text-[10px] font-black text-gray-400 uppercase">Filter:</span>
                    {['all', 'interested', 'visit_scheduled', 'visit_done', 'not_interested', 'connected', 'not_connected', 'new'].map(d => (
                      <button
                        key={d}
                        onClick={() => setDispositionFilter(d)}
                        className={`px-2.5 py-1 rounded-full text-[10px] font-black transition-all cursor-pointer ${dispositionFilter === d ? 'bg-[#C9A227] text-[#1A1800]' : 'bg-gray-100 text-gray-500 hover:bg-gray-200'}`}
                      >
                        {d === 'all' ? 'All' : DISPOSITION_LABELS[d]}
                      </button>
                    ))}
                  </div>
                  {/* Leads Table */}
                  <div className="divide-y divide-gray-50">
                    {filteredDetailLeads.length === 0 ? (
                      <div className="py-16 text-center text-gray-400 text-sm font-semibold">No leads found matching this filter</div>
                    ) : filteredDetailLeads.map(lead => (
                      <div key={lead._id} className="hover:bg-gray-50/60 transition-colors">
                        <div
                          className="px-6 py-4 flex items-center gap-4 cursor-pointer"
                          onClick={() => setExpandedLeadId(expandedLeadId === lead._id ? null : lead._id)}
                        >
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="font-bold text-sm text-gray-900">{lead.name}</span>
                              <span
                                className="px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider"
                                style={{ backgroundColor: `${DISPOSITION_COLORS[lead.disposition]}20`, color: DISPOSITION_COLORS[lead.disposition], border: `1px solid ${DISPOSITION_COLORS[lead.disposition]}40` }}
                              >
                                {DISPOSITION_LABELS[lead.disposition] || lead.disposition}
                              </span>
                            </div>
                            <div className="flex gap-3 mt-1 flex-wrap">
                              <span className="text-xs text-gray-400 font-semibold">{lead.phone}</span>
                              {lead.propertyInterest && <span className="text-xs text-[#C9A227] font-semibold truncate max-w-[160px]">{lead.propertyInterest}</span>}
                            </div>
                          </div>
                          <div className="text-right shrink-0">
                            <p className="text-[10px] text-gray-400 font-bold">{lead.history.length} calls</p>
                            <p className="text-[10px] text-gray-400 font-semibold mt-0.5">Updated: {fmtDate(lead.updatedAt)}</p>
                          </div>
                          <ChevronDown size={14} className={`text-gray-300 transition-transform ${expandedLeadId === lead._id ? 'rotate-180 text-[#C9A227]' : ''}`} />
                        </div>
                        {/* Expanded call history */}
                        {expandedLeadId === lead._id && (
                          <div className="bg-gray-50 px-6 py-3 border-t border-gray-100">
                            <p className="text-[10px] font-black text-gray-400 uppercase tracking-wider mb-2">Call History ({lead.history.length})</p>
                            {lead.history.length === 0 ? (
                              <p className="text-xs text-gray-400">No calls recorded yet</p>
                            ) : (
                              <div className="space-y-2">
                                {lead.history.map((h, idx) => (
                                  <div key={idx} className="bg-white rounded-xl p-2.5 border border-gray-100 text-xs flex items-start justify-between gap-2 shadow-sm">
                                    <div>
                                      <span
                                        className="inline-block px-2 py-0.5 rounded text-[9px] font-black uppercase mb-1"
                                        style={{ backgroundColor: `${DISPOSITION_COLORS[h.disposition]}15`, color: DISPOSITION_COLORS[h.disposition] }}
                                      >
                                        {DISPOSITION_LABELS[h.disposition] || h.disposition}
                                      </span>
                                      {h.notes && <p className="text-gray-600 font-medium text-xs mt-0.5">{h.notes}</p>}
                                    </div>
                                    <span className="text-[10px] text-gray-400 font-mono shrink-0">{fmtDateTime(h.calledAt)}</span>
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                /* Attendance & Screen Time Tab */
                <div className="p-6">
                  {attendanceLoading ? (
                    <div className="flex justify-center py-16">
                      <Loader2 className="animate-spin text-[#C9A227]" size={28} />
                    </div>
                  ) : attendance.length === 0 ? (
                    <div className="py-16 text-center text-gray-400 text-sm font-semibold">No attendance records found</div>
                  ) : (
                    <div className="space-y-4">
                      {/* Summary Cards */}
                      <div className="grid grid-cols-2 gap-3">
                        {[
                          { label: 'Present Days', count: attendance.filter(a => a.status === 'present').length, color: '#10B981' },
                          { label: 'Absent Days', count: attendance.filter(a => a.status === 'absent' || a.status === 'off').length, color: '#EF4444' },
                        ].map(s => (
                          <div key={s.label} className="rounded-xl p-3 text-center" style={{ backgroundColor: `${s.color}15`, border: `1px solid ${s.color}30` }}>
                            <p className="text-xl font-black" style={{ color: s.color }}>{s.count}</p>
                            <p className="text-[10px] font-black text-gray-500 uppercase">{s.label}</p>
                          </div>
                        ))}
                      </div>
                      {/* Table */}
                      <table className="w-full text-xs border-collapse">
                        <thead>
                          <tr className="bg-gray-50 text-[10px] font-black text-gray-500 uppercase">
                            <th className="py-3 px-3 text-left">Date</th>
                            <th className="py-3 px-3 text-left">Status</th>
                            <th className="py-3 px-3 text-left">App Screen Time</th>
                            <th className="py-3 px-3 text-left">Punch In</th>
                            <th className="py-3 px-3 text-left">Punch Out</th>
                            <th className="py-3 px-3 text-left">Working Hours</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                          {attendance.map(row => (
                            <tr key={row.date} className="hover:bg-gray-50/50">
                              <td className="py-3 px-3 font-semibold text-gray-700">{fmtDate(row.date)}</td>
                              <td className="py-3 px-3">
                                <span className={`px-2 py-0.5 rounded-full text-[9px] font-black uppercase ${
                                  row.status === 'present' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' :
                                  'bg-red-50 text-red-600 border border-red-200'
                                }`}>
                                  {row.status === 'present' ? '✓ Present' : '✗ Absent'}
                                </span>
                              </td>
                              <td className="py-3 px-3">
                                <span className="inline-flex items-center gap-1 font-mono font-bold text-amber-900 bg-amber-50 px-2 py-0.5 rounded border border-amber-200 text-xs">
                                  <Smartphone size={11} className="text-[#C9A227]" />
                                  {row.activeFormatted || '0m'}
                                </span>
                              </td>
                              <td className="py-3 px-3 text-gray-500">{row.punchIn ? fmtDateTime(row.punchIn) : '—'}</td>
                              <td className="py-3 px-3 text-gray-500">{row.punchOut ? fmtDateTime(row.punchOut) : '—'}</td>
                              <td className="py-3 px-3 font-semibold text-gray-600">{fmtMinutes(row.totalMinutes)}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ── Page Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#1A1800] font-[var(--font-playfair)] tracking-tight">
            Team Reports & Screen Time Tracking
          </h1>
          <p className="text-xs text-gray-400 font-bold uppercase tracking-wider mt-1.5">
            {preset === 'custom'
              ? `${fmtDate(fromDate)} — ${fmtDate(toDate)}`
              : PRESETS.find(p => p.id === preset)?.label}
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {/* Date presets */}
          <div className="flex bg-white border border-gray-200 rounded-xl p-1 gap-0.5 shadow-sm">
            {PRESETS.map(p => (
              <button
                key={p.id}
                onClick={() => handlePreset(p.id)}
                className={`px-3 py-1.5 rounded-lg text-[11px] font-black transition-all cursor-pointer ${preset === p.id ? 'bg-[#C9A227] text-[#1A1800] shadow-sm' : 'text-gray-500 hover:text-gray-800 hover:bg-gray-50'}`}
              >
                {p.label}
              </button>
            ))}
          </div>
          {/* Custom date picker */}
          {showCustom && (
            <div className="flex items-center gap-2 bg-white border border-gray-200 rounded-xl px-3 py-2 shadow-sm">
              <input type="date" value={fromDate} onChange={e => setFromDate(e.target.value)} className="text-xs font-bold text-gray-700 outline-none bg-transparent" />
              <span className="text-gray-300">→</span>
              <input type="date" value={toDate} onChange={e => setToDate(e.target.value)} className="text-xs font-bold text-gray-700 outline-none bg-transparent" />
              <button onClick={handleCustomApply} className="px-3 py-1 bg-[#C9A227] text-[#1A1800] text-[11px] font-black rounded-lg hover:bg-[#B8860B] transition-all cursor-pointer">Apply</button>
            </div>
          )}
          {/* Refresh */}
          <button
            onClick={() => fetchReports(fromDate, toDate, true)}
            className="inline-flex items-center gap-2 px-3 py-2 bg-white border border-gray-200 text-gray-600 font-bold rounded-xl text-xs hover:bg-gray-50 transition-all cursor-pointer shadow-sm"
          >
            <RefreshCw size={13} className={loading ? 'animate-spin text-[#C9A227]' : ''} /> Refresh
          </button>
        </div>
      </div>

      {/* ── Central Master Lead Distribution Router (Website & Meta Ads) ── */}
      <AutoDistributionToggle className="my-1" />

      {/* ── Master Download Buttons ── */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
        <p className="text-[10px] font-black text-gray-400 uppercase tracking-wider mb-3">📥 Download All Agents Report</p>
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => downloadMasterReport('summary')}
            disabled={masterLoading}
            className="inline-flex items-center gap-1.5 px-3 py-2 bg-gradient-to-r from-[#C9A227] to-[#B8860B] text-[#1A1800] font-black rounded-xl text-[11px] hover:scale-[1.02] transition-all shadow-sm disabled:opacity-60 cursor-pointer"
          >
            <FileSpreadsheet size={13} /> Team Summary
          </button>
          <button
            onClick={() => downloadMasterReport('calls')}
            disabled={masterLoading}
            className="inline-flex items-center gap-1.5 px-3 py-2 bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 font-black rounded-xl text-[11px] transition-all disabled:opacity-60 cursor-pointer"
          >
            <PhoneCall size={12} /> Full History
          </button>
          {[
            { label: 'Not Interested', disp: 'not_interested', color: 'red' },
            { label: 'V. Scheduled', disp: 'visit_scheduled', color: 'indigo' },
            { label: 'Visit Done', disp: 'visit_done', color: 'purple' },
            { label: 'Booking Done', disp: 'booked', color: 'emerald' },
          ].map(item => (
            <button
              key={item.disp}
              onClick={() => downloadMasterDisposition(item.disp)}
              disabled={masterLoading}
              className={`inline-flex items-center gap-1.5 px-3 py-2 bg-${item.color}-50 hover:bg-${item.color}-100 text-${item.color}-700 border border-${item.color}-200 font-black rounded-xl text-[11px] transition-all disabled:opacity-60 cursor-pointer`}
            >
              <Download size={11} /> {item.label}
            </button>
          ))}
          <button
            onClick={() => downloadAllAttendance()}
            disabled={masterLoading}
            className="inline-flex items-center gap-1.5 px-3 py-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 font-black rounded-xl text-[11px] transition-all disabled:opacity-60 cursor-pointer"
          >
            <CalendarCheck size={12} /> Attendance & Screen Time (All)
          </button>
        </div>
      </div>

      {/* ── Team Summary Stats Cards (Including App Live Status & Screen Time) ── */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3">
        {[
          { label: 'Online on App', value: totals.onlineCount, icon: Radio, color: 'emerald', bg: 'bg-emerald-50', border: 'border-emerald-200', text: 'text-emerald-700' },
          { label: 'Screen Time', value: totalScreenTimeFormatted, icon: Smartphone, color: 'amber', bg: 'bg-amber-50', border: 'border-amber-200', text: 'text-amber-800' },
          { label: 'Assigned', value: totals.leads, icon: Users, color: 'blue', bg: 'bg-blue-50', border: 'border-blue-100', text: 'text-blue-600' },
          { label: 'Not Interested', value: totals.notInterested, icon: XCircle, color: 'red', bg: 'bg-red-50', border: 'border-red-100', text: 'text-red-600' },
          { label: 'V. Scheduled', value: totals.visitScheduled, icon: CalendarCheck, color: 'violet', bg: 'bg-violet-50', border: 'border-violet-100', text: 'text-violet-600' },
          { label: 'Visit Done', value: totals.visitDone, icon: Home, color: 'purple', bg: 'bg-purple-50', border: 'border-purple-100', text: 'text-purple-600' },
          { label: 'Booking Done', value: totals.booked, icon: CheckCircle2, color: 'emerald', bg: 'bg-emerald-50', border: 'border-emerald-100', text: 'text-emerald-600' },
        ].map(stat => (
          <div key={stat.label} className={`bg-white rounded-2xl p-3.5 border ${stat.border} shadow-sm flex flex-col justify-between`}>
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-[9px] font-black text-gray-400 uppercase tracking-wider leading-tight">{stat.label}</span>
              <div className={`w-6 h-6 rounded-lg ${stat.bg} flex items-center justify-center ${stat.text} shrink-0`}>
                <stat.icon size={13} />
              </div>
            </div>
            <h3 className="text-lg font-black text-gray-900">{stat.value}</h3>
          </div>
        ))}
      </div>

      {/* ── Agent Cards with Screen Time & Live Presence ── */}
      {loading ? (
        <div className="flex justify-center py-20">
          <Loader2 className="animate-spin text-[#C9A227]" size={36} />
        </div>
      ) : reports.length === 0 ? (
        <div className="text-center py-20 text-gray-400">
          <TrendingUp size={40} className="mx-auto mb-3 opacity-30" />
          <p className="font-bold">No performance data found. Please ensure agents and leads exist.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {reports.map((r, i) => (
            <div
              key={r.agentId}
              className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden hover:shadow-lg hover:border-[#C9A227]/30 transition-all cursor-pointer group"
              onClick={() => openAgentDetail(r)}
            >
              {/* Agent Header */}
              <div className="p-5 border-b border-gray-50 flex items-center gap-4">
                <div className="relative shrink-0">
                  <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#C9A227] to-[#B8860B] flex items-center justify-center text-white font-black text-xl shadow-md group-hover:scale-105 transition-transform">
                    {r.name.charAt(0).toUpperCase()}
                  </div>
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="font-extrabold text-[#1A1800] text-base truncate">{r.name}</h3>
                    
                    {/* Live Online Badge */}
                    {r.isOnline ? (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider bg-emerald-100 text-emerald-800 border border-emerald-200">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span> Online
                      </span>
                    ) : r.lastActiveAt ? (
                      <span className="text-[10px] text-gray-400 font-semibold">
                        {formatTimeAgo(r.lastActiveAt)}
                      </span>
                    ) : (
                      <span className="text-[9px] text-gray-400 uppercase font-bold">Offline</span>
                    )}
                  </div>
                  <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                    <div className="flex items-center gap-1">
                      <span className="text-[10px] font-black text-gray-400 uppercase">ID:</span>
                      <span className="font-mono text-[11px] font-bold text-gray-700 bg-gray-100 px-2 py-0.5 rounded border border-gray-200">
                        {r.employee_id || 'SSR-AGENT'}
                      </span>
                    </div>

                    {/* Individual Lead Distribution Switch for this Agent */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleToggleAgentQueue(r.agentId, r.name, !r.isReceivingLeads);
                      }}
                      className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-lg text-[10px] font-black uppercase tracking-wider transition-all border shadow-2xs cursor-pointer ${
                        r.isReceivingLeads !== false
                          ? 'bg-[#EAF7EE] text-[#0E6228] border-[#107C41]/30 hover:bg-[#D4F2DE]'
                          : 'bg-red-50 text-red-700 border-red-200 hover:bg-red-100'
                      }`}
                      title={
                        r.isReceivingLeads !== false
                          ? `${r.name} is ACTIVE in lead queue. Click to mark On Leave / Absent.`
                          : `${r.name} is ON LEAVE / ABSENT. Click to Activate Lead Queue.`
                      }
                    >
                      <span className="relative flex h-2 w-2">
                        {r.isReceivingLeads !== false && (
                          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#107C41] opacity-75"></span>
                        )}
                        <span className={`relative inline-flex rounded-full h-2 w-2 ${r.isReceivingLeads !== false ? 'bg-[#107C41]' : 'bg-red-500'}`}></span>
                      </span>
                      <span>{r.isReceivingLeads !== false ? 'Queue: Active' : 'On Leave (Off)'}</span>
                    </button>

                    {r.lastDistanceFormatted && (
                      <span className="text-[10px] font-extrabold text-[#8B6914] bg-amber-50 border border-amber-200/80 px-2 py-0.5 rounded flex items-center gap-1">
                        <MapPin size={10} className="text-[#8B6914]" />
                        {r.lastDistanceFormatted}
                      </span>
                    )}
                  </div>
                </div>

                {/* Right Side: Calls & Screen Time Badges */}
                <div className="flex items-center gap-3 shrink-0">
                  <div className="text-right">
                    <div className="flex items-center justify-end gap-1 font-black text-xs text-amber-900 bg-amber-50 px-2 py-0.5 rounded-md border border-amber-200/80 mb-0.5">
                      <Smartphone size={12} className="text-[#C9A227]" />
                      <span>{r.todayActiveFormatted || r.activeFormattedInRange || '0m'}</span>
                    </div>
                    <p className="text-[10px] font-bold text-gray-400">{r.callsToday} calls</p>
                  </div>
                  <ChevronRight size={16} className="text-gray-300 group-hover:text-[#C9A227] transition-colors" />
                </div>
              </div>

              {/* Stats Grid */}
              <div className="grid grid-cols-5 divide-x divide-gray-50 bg-gray-50/30">
                {[
                  { label: 'Assigned', value: r.assigned !== undefined ? r.assigned : r.totalLeads, color: '#3B82F6' },
                  { label: 'Not Interested', value: r.notInterested || 0, color: '#EF4444' },
                  { label: 'V. Scheduled', value: r.visitScheduled || 0, color: '#6366F1' },
                  { label: 'Visit Done', value: r.visitDone || 0, color: '#8B5CF6' },
                  { label: 'Booking Done', value: r.booked || r.bookingDone || 0, color: '#10B981' },
                ].map(stat => (
                  <div key={stat.label} className="p-3.5 text-center">
                    <p className="text-lg font-black" style={{ color: stat.color }}>{stat.value}</p>
                    <p className="text-[8.5px] font-black text-gray-400 uppercase tracking-wider mt-0.5 leading-tight">{stat.label}</p>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
