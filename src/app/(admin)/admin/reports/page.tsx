'use client';

import { useState, useEffect } from 'react';
import { Users, Phone, Star, Home, RefreshCw, TrendingUp, Loader2, CheckCircle2, XCircle } from 'lucide-react';
import toast from 'react-hot-toast';

interface AgentReport {
  agentId: string;
  name: string;
  username: string;
  phone?: string;
  isActive: boolean;
  totalLeads: number;
  callsToday: number;
  interested: number;
  visitDone: number;
  followUp: number;
  notInterested: number;
  connected: number;
  notConnected: number;
  newLeads: number;
}

export default function AgentReportsPage() {
  const [reports, setReports] = useState<AgentReport[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchReports = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/agents/reports');
      const data = await res.json();
      if (data.success) setReports(data.data);
      else toast.error(data.error);
    } catch { toast.error('Failed to load reports'); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchReports(); }, []);

  const today = new Date().toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });

  const totals = reports.reduce((acc, r) => ({
    calls: acc.calls + r.callsToday,
    interested: acc.interested + r.interested,
    visits: acc.visits + r.visitDone,
    leads: acc.leads + r.totalLeads,
  }), { calls: 0, interested: 0, visits: 0, leads: 0 });

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#1A1800] font-[var(--font-playfair)] tracking-tight">
            Team Performance
          </h1>
          <p className="text-xs text-gray-400 font-bold uppercase tracking-wider mt-1.5">{today}</p>
        </div>
        <button
          onClick={fetchReports}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-white border border-gray-200 text-gray-600 font-bold rounded-xl text-sm hover:bg-gray-50 transition-all"
        >
          <RefreshCw size={14} /> Refresh
        </button>
      </div>

      {/* Team Summary */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: 'Total Leads', value: totals.leads, icon: Users, color: 'blue' },
          { label: "Today's Calls", value: totals.calls, icon: Phone, color: 'amber' },
          { label: 'Interested', value: totals.interested, icon: Star, color: 'emerald' },
          { label: 'Visit Done', value: totals.visits, icon: Home, color: 'purple' },
        ].map(stat => (
          <div key={stat.label} className={`bg-white rounded-2xl p-5 border border-${stat.color}-100 shadow-sm flex items-center gap-3`}>
            <div className={`w-10 h-10 rounded-xl bg-${stat.color}-50 border border-${stat.color}-100 flex items-center justify-center text-${stat.color}-600 shrink-0`}>
              <stat.icon size={20} />
            </div>
            <div>
              <p className="text-[10px] font-black text-gray-400 uppercase tracking-wider">{stat.label}</p>
              <h3 className="text-2xl font-black text-gray-900">{stat.value}</h3>
            </div>
          </div>
        ))}
      </div>

      {/* Agent Cards */}
      {loading ? (
        <div className="flex justify-center py-20">
          <Loader2 className="animate-spin text-[#C9A227]" size={36} />
        </div>
      ) : reports.length === 0 ? (
        <div className="text-center py-20 text-gray-400">
          <TrendingUp size={40} className="mx-auto mb-3 opacity-30" />
          <p className="font-bold">Koi data nahi mila. Pehle agents aur leads add karo.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          {reports.map((r, i) => (
            <div key={r.agentId} className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden hover:shadow-md transition-shadow">
              {/* Agent Header */}
              <div className="p-5 border-b border-gray-50 flex items-center gap-4">
                <div className="relative shrink-0">
                  <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#C9A227] to-[#B8860B] flex items-center justify-center text-white font-black text-xl shadow-md">
                    {r.name.charAt(0).toUpperCase()}
                  </div>
                  {/* Rank badge */}
                  {i < 3 && (
                    <span className="absolute -top-1 -right-1 w-5 h-5 bg-amber-400 text-[#1A1800] text-[10px] font-black rounded-full flex items-center justify-center shadow">
                      {i + 1}
                    </span>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <h3 className="font-extrabold text-[#1A1800] text-base truncate">{r.name}</h3>
                    <span className={`shrink-0 inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider ${
                      r.isActive ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-red-50 text-red-600 border border-red-200'
                    }`}>
                      {r.isActive ? <CheckCircle2 size={8} /> : <XCircle size={8} />}
                      {r.isActive ? 'Active' : 'Off'}
                    </span>
                  </div>
                  <p className="text-xs text-gray-400 font-semibold">@{r.username} {r.phone ? `· ${r.phone}` : ''}</p>
                </div>
                {/* Today's calls highlight */}
                <div className="text-right shrink-0">
                  <p className="text-[10px] font-black text-gray-400 uppercase tracking-wider">Calls Today</p>
                  <p className="text-3xl font-black text-[#C9A227]">{r.callsToday}</p>
                </div>
              </div>

              {/* Stats Grid */}
              <div className="grid grid-cols-4 divide-x divide-gray-50">
                {[
                  { label: 'Assigned', value: r.totalLeads, color: '#3B82F6' },
                  { label: 'Interested', value: r.interested, color: '#10B981' },
                  { label: 'Visit Done', value: r.visitDone, color: '#8B5CF6' },
                  { label: 'Follow-up', value: r.followUp, color: '#F59E0B' },
                ].map(stat => (
                  <div key={stat.label} className="p-4 text-center">
                    <p className="text-xl font-black" style={{ color: stat.color }}>{stat.value}</p>
                    <p className="text-[9px] font-black text-gray-400 uppercase tracking-wider mt-0.5">{stat.label}</p>
                  </div>
                ))}
              </div>

              {/* Disposition Progress Bar */}
              <div className="px-5 pb-4">
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-wider mb-2">Call Outcome Distribution</p>
                <div className="flex rounded-full overflow-hidden h-2.5 gap-0.5 bg-gray-100">
                  {r.totalLeads > 0 && [
                    { value: r.interested, color: '#10B981' },
                    { value: r.visitDone, color: '#8B5CF6' },
                    { value: r.connected, color: '#3B82F6' },
                    { value: r.followUp, color: '#F59E0B' },
                    { value: r.notConnected, color: '#EF4444' },
                    { value: r.newLeads, color: '#D1D5DB' },
                  ].filter(x => x.value > 0).map((seg, idx) => (
                    <div
                      key={idx}
                      className="h-full rounded-full"
                      style={{ flex: seg.value, backgroundColor: seg.color, minWidth: 4 }}
                    />
                  ))}
                </div>
                <div className="flex flex-wrap gap-3 mt-2">
                  {[
                    { label: 'Interested', color: '#10B981', value: r.interested },
                    { label: 'Visit', color: '#8B5CF6', value: r.visitDone },
                    { label: 'Connected', color: '#3B82F6', value: r.connected },
                    { label: 'Follow-up', color: '#F59E0B', value: r.followUp },
                    { label: 'Unreachable', color: '#EF4444', value: r.notConnected },
                  ].map(item => (
                    <span key={item.label} className="inline-flex items-center gap-1 text-[10px] font-bold text-gray-500">
                      <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: item.color }} />
                      {item.label}: {item.value}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
