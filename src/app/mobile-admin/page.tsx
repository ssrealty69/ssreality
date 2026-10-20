'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import {
  Users, Phone, Home, RefreshCw, Smartphone, Radio,
  CalendarCheck, CheckCircle2, XCircle, ChevronRight, X,
  MapPin, PhoneCall, Zap, Battery, Clock, Eye, AlertCircle,
  TrendingUp, Search, Calendar, ChevronDown, Check, ArrowUpRight
} from 'lucide-react';
import toast, { Toaster } from 'react-hot-toast';

interface AgentReport {
  agentId: string;
  name: string;
  username: string;
  employee_id?: string;
  phone?: string;
  isActive: boolean;
  isReceivingLeads: boolean;
  isOnline: boolean;
  isPunchedIn: boolean;
  lastActiveAt: string | null;
  lastActiveFormatted: string;
  lastDistanceKm: number | null;
  lastDistanceFormatted: string | null;
  lastLocationAddress: string | null;
  lastLocationStatus: string;
  latitude: number | null;
  longitude: number | null;
  todayActiveSeconds: number;
  todayActiveFormatted: string;
  punchIn: string | null;
  punchOut: string | null;
  sessionCount: number;
  totalLeads: number;
  assigned: number;
  callsToday: number;
  manualDialed: number;
  notInterested: number;
  visitScheduled: number;
  visitDone: number;
  booked: number;
  bookingDone: number;
}

interface OverviewData {
  masterAutoAssign: {
    enabled: boolean;
    enabledAt: string | null;
  };
  totals: {
    totalAgents: number;
    onlineCount: number;
    punchedInCount: number;
    totalActiveSeconds: number;
    totalScreenTimeFormatted: string;
    assigned: number;
    callsToday: number;
    notInterested: number;
    visitScheduled: number;
    visitDone: number;
    booked: number;
  };
  agents: AgentReport[];
}

interface AgentDetailData {
  agent: {
    id: string;
    name: string;
    username: string;
    employee_id: string;
    phone: string;
    isActive: boolean;
    isReceivingLeads: boolean;
  };
  stats: {
    assignedLeads: number;
    totalCalls: number;
    notInterested: number;
    visitScheduled: number;
    visitDone: number;
    booked: number;
    todayActiveSeconds: number;
    todayActiveFormatted: string;
    punchIn: string | null;
    punchOut: string | null;
  };
  location: {
    latitude: number;
    longitude: number;
    status: string;
    distanceMeters: number;
    address: string | null;
    timestamp: string;
  } | null;
  recentCalls: Array<{
    leadId: string;
    customerName: string;
    customerPhone: string;
    propertyInterest: string;
    disposition: string;
    notes: string;
    calledAt: string;
    duration: string;
  }>;
  attendance: Array<{
    date: string;
    punchIn: string | null;
    punchOut: string | null;
    totalMinutes: number;
    activeFormatted: string;
    sessionCount: number;
  }>;
}

const DISPOSITION_BADGES: Record<string, { label: string; bg: string; text: string; border: string }> = {
  new: { label: 'New Lead', bg: 'bg-gray-50', text: 'text-gray-600', border: 'border-gray-200' },
  ringing: { label: 'Ringing', bg: 'bg-blue-50', text: 'text-blue-700', border: 'border-blue-200' },
  connected: { label: 'Connected', bg: 'bg-blue-50', text: 'text-blue-700', border: 'border-blue-200' },
  not_connected: { label: 'Not Connected', bg: 'bg-orange-50', text: 'text-orange-700', border: 'border-orange-200' },
  switch_off: { label: 'Switch Off', bg: 'bg-red-50', text: 'text-red-700', border: 'border-red-200' },
  not_reachable: { label: 'Unreachable', bg: 'bg-red-50', text: 'text-red-700', border: 'border-red-200' },
  interested: { label: 'Interested', bg: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-200' },
  not_interested: { label: 'Not Interested', bg: 'bg-red-50', text: 'text-red-700', border: 'border-red-200' },
  visit_scheduled: { label: 'V. Scheduled', bg: 'bg-indigo-50', text: 'text-indigo-700', border: 'border-indigo-200' },
  visit_done: { label: 'Visit Done', bg: 'bg-purple-50', text: 'text-purple-700', border: 'border-purple-200' },
  booked: { label: 'Booking Done', bg: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-200' },
  follow_up: { label: 'Follow Up', bg: 'bg-amber-50', text: 'text-amber-700', border: 'border-amber-200' },
};

export default function MobileAdminPage() {
  const [data, setData] = useState<OverviewData | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState<'team' | 'radar' | 'calls'>('team');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedAgent, setSelectedAgent] = useState<AgentReport | null>(null);
  const [detailData, setDetailData] = useState<AgentDetailData | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [masterSwitchLoading, setMasterSwitchLoading] = useState(false);

  // Fetch live overview data
  const fetchData = useCallback(async (showToast = false) => {
    try {
      if (showToast) setRefreshing(true);
      const res = await fetch('/api/mobile/admin/overview');
      const json = await res.json();
      if (json.success) {
        setData(json);
        if (showToast) toast.success('Live data updated!');
      } else {
        toast.error(json.error || 'Failed to load live data');
      }
    } catch (err: any) {
      toast.error('Network error loading data');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
    // Auto-refresh every 25 seconds
    const interval = setInterval(() => { if (!document.hidden) fetchData(false); }, 25000);
    return () => clearInterval(interval);
  }, [fetchData]);

  // Master auto-assign switch toggle
  const handleToggleMasterSwitch = async () => {
    if (!data || masterSwitchLoading) return;
    const nextState = !data.masterAutoAssign.enabled;
    setMasterSwitchLoading(true);
    try {
      const res = await fetch('/api/mobile/admin/master-switch', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ enabled: nextState }),
      });
      const json = await res.json();
      if (json.success) {
        setData(prev => prev ? {
          ...prev,
          masterAutoAssign: {
            enabled: nextState,
            enabledAt: new Date().toISOString(),
          }
        } : null);
        toast.success(
          nextState
            ? '⚡ Master Lead Auto-Distribution is now ACTIVATED!'
            : '⏸️ Master Lead Auto-Distribution is now PAUSED!'
        );
      } else {
        toast.error(json.error || 'Failed to toggle switch');
      }
    } catch (err) {
      toast.error('Error toggling master switch');
    } finally {
      setMasterSwitchLoading(false);
    }
  };

  // Agent individual queue toggle
  const handleToggleAgentQueue = async (agentId: string, agentName: string, nextStatus: boolean) => {
    try {
      const res = await fetch(`/api/admin/agents/${agentId}/distribution-status`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isReceivingLeads: nextStatus }),
      });
      const json = await res.json();
      if (json.success) {
        setData(prev => {
          if (!prev) return null;
          return {
            ...prev,
            agents: prev.agents.map(a => a.agentId === agentId ? { ...a, isReceivingLeads: nextStatus } : a)
          };
        });
        toast.success(
          nextStatus
            ? `🟢 ${agentName} is now ACTIVE in lead queue`
            : `🔴 ${agentName} marked ON LEAVE (Queue paused)`
        );
      }
    } catch (err) {
      toast.error('Failed to update agent status');
    }
  };

  // Open agent drilldown
  const openAgentDetail = async (agent: AgentReport) => {
    setSelectedAgent(agent);
    setDetailLoading(true);
    setDetailData(null);
    try {
      const res = await fetch(`/api/mobile/admin/agents/${agent.agentId}`);
      const json = await res.json();
      if (json.success) {
        setDetailData(json);
      } else {
        toast.error(json.error || 'Failed to load agent details');
      }
    } catch (err) {
      toast.error('Error fetching agent drilldown');
    } finally {
      setDetailLoading(false);
    }
  };

  // Filtered agents
  const filteredAgents = useMemo(() => {
    if (!data?.agents) return [];
    if (!searchQuery.trim()) return data.agents;
    const q = searchQuery.toLowerCase().trim();
    return data.agents.filter(a =>
      a.name.toLowerCase().includes(q) ||
      (a.employee_id && a.employee_id.toLowerCase().includes(q)) ||
      a.username.toLowerCase().includes(q)
    );
  }, [data?.agents, searchQuery]);

  return (
    <div className="min-h-screen bg-[#F8F9FA] text-gray-900 pb-24 font-sans antialiased select-none">
      <Toaster position="top-center" />

      {/* ── Top Executive Sticky Header ── */}
      <header className="sticky top-0 z-30 bg-[#1A1800] text-white px-4 pt-4 pb-3 shadow-md border-b border-amber-500/20">
        <div className="flex items-center justify-between gap-2 mb-2.5">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-[#C9A227] to-[#B8860B] flex items-center justify-center text-[#1A1800] font-black text-sm shadow-sm">
              SS
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <h1 className="font-extrabold text-sm tracking-tight text-white">SS REALTY</h1>
                <span className="bg-[#C9A227]/20 text-[#C9A227] text-[9px] font-black uppercase px-1.5 py-0.5 rounded border border-[#C9A227]/40 tracking-wider">
                  DIRECTOR SUITE
                </span>
              </div>
              <p className="text-[10px] text-gray-400 font-medium leading-none mt-0.5">
                Real-Time Telecaller & Field Radar
              </p>
            </div>
          </div>

          <button
            onClick={() => fetchData(true)}
            disabled={refreshing}
            className="w-8 h-8 rounded-xl bg-white/10 hover:bg-white/20 active:scale-95 flex items-center justify-center text-gray-200 transition-all border border-white/10"
            title="Refresh Live Data"
          >
            <RefreshCw size={14} className={refreshing ? 'animate-spin text-[#C9A227]' : ''} />
          </button>
        </div>

        {/* ── Central Master Auto-Assign Switch Banner ── */}
        <div className="bg-white/5 backdrop-blur-md rounded-xl p-2.5 border border-white/10 flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 min-w-0">
            <div className={`w-2.5 h-2.5 rounded-full shrink-0 ${data?.masterAutoAssign.enabled ? 'bg-emerald-400 animate-pulse shadow-[0_0_8px_#34D399]' : 'bg-red-400'}`} />
            <div className="min-w-0">
              <p className="text-[11px] font-extrabold text-white truncate">
                Master Auto-Distribution: <span className={data?.masterAutoAssign.enabled ? 'text-emerald-400' : 'text-red-400'}>{data?.masterAutoAssign.enabled ? 'ON (Active)' : 'OFF (Paused)'}</span>
              </p>
              <p className="text-[9px] text-gray-400 truncate">Website & Meta Ads Live Routing</p>
            </div>
          </div>

          <button
            onClick={handleToggleMasterSwitch}
            disabled={masterSwitchLoading}
            className={`px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-wider transition-all cursor-pointer shrink-0 shadow-sm ${
              data?.masterAutoAssign.enabled
                ? 'bg-emerald-500 hover:bg-emerald-600 text-white shadow-emerald-500/20'
                : 'bg-red-500 hover:bg-red-600 text-white shadow-red-500/20'
            }`}
          >
            {masterSwitchLoading ? '...' : data?.masterAutoAssign.enabled ? 'Turn OFF' : 'Turn ON'}
          </button>
        </div>
      </header>

      {/* ── Executive Metrics Horizontal Scroll Strip ── */}
      {data && (
        <div className="px-3 pt-3 pb-1 overflow-x-auto scrollbar-none">
          <div className="flex items-center gap-2 min-w-max">
            {[
              { label: 'Online on App', value: data.totals.onlineCount, icon: Radio, text: 'text-emerald-700', bg: 'bg-emerald-50', border: 'border-emerald-200' },
              { label: 'Screen Time', value: data.totals.totalScreenTimeFormatted, icon: Smartphone, text: 'text-amber-800', bg: 'bg-amber-50', border: 'border-amber-200' },
              { label: 'Assigned', value: data.totals.assigned, icon: Users, text: 'text-blue-700', bg: 'bg-blue-50', border: 'border-blue-200' },
              { label: 'Not Interested', value: data.totals.notInterested, icon: XCircle, text: 'text-red-700', bg: 'bg-red-50', border: 'border-red-200' },
              { label: 'V. Scheduled', value: data.totals.visitScheduled, icon: CalendarCheck, text: 'text-indigo-700', bg: 'bg-indigo-50', border: 'border-indigo-200' },
              { label: 'Visit Done', value: data.totals.visitDone, icon: Home, text: 'text-purple-700', bg: 'bg-purple-50', border: 'border-purple-200' },
              { label: 'Booking Done', value: data.totals.booked, icon: CheckCircle2, text: 'text-emerald-700', bg: 'bg-emerald-50', border: 'border-emerald-200' },
            ].map(m => (
              <div key={m.label} className={`px-3 py-2 rounded-xl bg-white border ${m.border} shadow-2xs flex items-center gap-2`}>
                <div className={`w-7 h-7 rounded-lg ${m.bg} ${m.text} flex items-center justify-center shrink-0`}>
                  <m.icon size={13} />
                </div>
                <div>
                  <p className="text-[9px] font-black text-gray-400 uppercase tracking-wider leading-none">{m.label}</p>
                  <p className="text-sm font-black text-gray-900 mt-0.5">{m.value}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── Sub-Navigation Segmented Control ── */}
      <div className="px-3 pt-2">
        <div className="bg-gray-200/80 p-1 rounded-xl flex items-center gap-1 shadow-inner">
          {[
            { id: 'team', label: `Team Agents (${data?.agents.length || 0})`, icon: Users },
            { id: 'radar', label: 'Field GPS Radar', icon: MapPin },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex-1 py-1.5 rounded-lg text-xs font-black transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                activeTab === tab.id
                  ? 'bg-white text-[#1A1800] shadow-sm font-extrabold'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <tab.icon size={13} className={activeTab === tab.id ? 'text-[#C9A227]' : 'text-gray-400'} />
              <span>{tab.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* ── Search Bar (For Team Tab) ── */}
      {activeTab === 'team' && (
        <div className="px-3 pt-2">
          <div className="bg-white rounded-xl border border-gray-200 px-3 py-1.5 flex items-center gap-2 shadow-2xs">
            <Search size={14} className="text-gray-400 shrink-0" />
            <input
              type="text"
              placeholder="Search telecaller by name or ID..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full text-xs font-semibold text-gray-800 outline-none bg-transparent placeholder:text-gray-400"
            />
            {searchQuery && (
              <button onClick={() => setSearchQuery('')} className="text-gray-400 hover:text-gray-600 p-0.5">
                <X size={12} />
              </button>
            )}
          </div>
        </div>
      )}

      {/* ── Main Content Area ── */}
      <main className="px-3 pt-3">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 gap-3 text-gray-400">
            <RefreshCw size={28} className="animate-spin text-[#C9A227]" />
            <p className="text-xs font-bold">Syncing live team data...</p>
          </div>
        ) : activeTab === 'team' ? (
          /* ── Team Agents List ── */
          <div className="space-y-3">
            {filteredAgents.length === 0 ? (
              <div className="text-center py-16 text-gray-400 text-xs font-bold">
                No telecaller agents found
              </div>
            ) : (
              filteredAgents.map(agent => (
                <div
                  key={agent.agentId}
                  onClick={() => openAgentDetail(agent)}
                  className="bg-white rounded-2xl border border-gray-200/80 shadow-sm overflow-hidden active:scale-[0.99] transition-transform cursor-pointer"
                >
                  {/* Card Top */}
                  <div className="p-3.5 border-b border-gray-50 flex items-start gap-3">
                    <div className="relative shrink-0 mt-0.5">
                      <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-[#C9A227] to-[#B8860B] flex items-center justify-center text-white font-black text-lg shadow-sm">
                        {agent.name.charAt(0).toUpperCase()}
                      </div>
                      {agent.isOnline && (
                        <span className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full bg-emerald-500 border-2 border-white animate-pulse" />
                      )}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-1">
                        <h2 className="font-extrabold text-sm text-gray-900 truncate">{agent.name}</h2>
                        <div className="flex items-center gap-1 shrink-0">
                          <div className="flex items-center gap-1 font-black text-[11px] text-amber-900 bg-amber-50 px-2 py-0.5 rounded-md border border-amber-200/70">
                            <Smartphone size={11} className="text-[#C9A227]" />
                            <span>{agent.todayActiveFormatted}</span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-1.5 mt-1 flex-wrap">
                        <span className="text-[10px] font-mono font-bold text-gray-600 bg-gray-100 px-1.5 py-0.5 rounded border border-gray-200">
                          {agent.employee_id || 'AGENT'}
                        </span>

                        {agent.isOnline ? (
                          <span className="text-[9px] font-black uppercase text-emerald-800 bg-emerald-100 px-1.5 py-0.5 rounded-full">
                            Online
                          </span>
                        ) : (
                          <span className="text-[9px] font-semibold text-gray-400">
                            {agent.lastActiveFormatted}
                          </span>
                        )}

                        {/* Individual Queue Toggle */}
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleToggleAgentQueue(agent.agentId, agent.name, !agent.isReceivingLeads);
                          }}
                          className={`text-[9px] font-black uppercase px-2 py-0.5 rounded-md border transition-all ${
                            agent.isReceivingLeads
                              ? 'bg-[#EAF7EE] text-[#0E6228] border-[#107C41]/30'
                              : 'bg-red-50 text-red-700 border-red-200'
                          }`}
                        >
                          {agent.isReceivingLeads ? 'Queue: Active' : 'On Leave (Off)'}
                        </button>
                      </div>

                      {/* Distance / Geofence Tag */}
                      {agent.lastDistanceFormatted && (
                        <div className="mt-1 flex items-center gap-1 text-[10px] font-extrabold text-[#8B6914]">
                          <MapPin size={10} />
                          <span className="truncate">{agent.lastDistanceFormatted}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* 5 Clean Metrics Grid */}
                  <div className="grid grid-cols-5 divide-x divide-gray-100 bg-gray-50/40">
                    {[
                      { label: 'Assigned', value: agent.assigned, color: '#3B82F6' },
                      { label: 'Not Int.', value: agent.notInterested, color: '#EF4444' },
                      { label: 'V. Sched.', value: agent.visitScheduled, color: '#6366F1' },
                      { label: 'Visit Done', value: agent.visitDone, color: '#8B5CF6' },
                      { label: 'Booked', value: agent.booked || agent.bookingDone, color: '#10B981' },
                    ].map(st => (
                      <div key={st.label} className="p-2.5 text-center">
                        <p className="text-base font-black leading-none" style={{ color: st.color }}>{st.value}</p>
                        <p className="text-[8px] font-black text-gray-400 uppercase tracking-wider mt-1 leading-none">{st.label}</p>
                      </div>
                    ))}
                  </div>
                </div>
              ))
            )}
          </div>
        ) : (
          /* ── Field GPS Radar List ── */
          <div className="space-y-3">
            <div className="bg-white p-3 rounded-2xl border border-gray-200 shadow-2xs flex items-center justify-between">
              <div>
                <p className="text-xs font-black text-gray-900">Live Field Presence</p>
                <p className="text-[10px] text-gray-400 font-medium">Real-time GPS coordinates of telecallers</p>
              </div>
              <span className="text-[10px] font-black text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full">
                {data?.totals.onlineCount || 0} Active Now
              </span>
            </div>

            {filteredAgents.map(agent => (
              <div key={agent.agentId} className="bg-white rounded-2xl p-3.5 border border-gray-200 shadow-2xs space-y-2">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#C9A227] to-[#B8860B] flex items-center justify-center text-white font-black text-sm shrink-0">
                      {agent.name.charAt(0).toUpperCase()}
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5">
                        <p className="font-extrabold text-xs text-gray-900 truncate">{agent.name}</p>
                        <span className="text-[9px] font-mono font-bold text-gray-500 bg-gray-100 px-1 rounded">
                          {agent.employee_id}
                        </span>
                      </div>
                      <p className="text-[10px] text-gray-400 font-medium truncate">
                        Punch In: <b className="text-gray-700">{agent.punchIn ? new Date(agent.punchIn).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', timeZone: 'Asia/Kolkata' }) : 'Not yet'}</b>
                      </p>
                    </div>
                  </div>

                  <span className={`text-[9px] font-black uppercase px-2 py-0.5 rounded-full shrink-0 border ${
                    agent.isOnline ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-gray-100 text-gray-500 border-gray-200'
                  }`}>
                    {agent.isOnline ? '● Online' : 'Offline'}
                  </span>
                </div>

                {/* Location Details */}
                <div className="bg-gray-50 p-2.5 rounded-xl border border-gray-100 text-xs space-y-1">
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="font-bold text-gray-600 flex items-center gap-1">
                      <MapPin size={11} className="text-[#C9A227]" /> Distance:
                    </span>
                    <span className="font-extrabold text-[#8B6914]">
                      {agent.lastDistanceFormatted || 'Location Pending'}
                    </span>
                  </div>

                  {agent.lastLocationAddress && (
                    <p className="text-[10px] text-gray-500 font-medium truncate">
                      📍 {agent.lastLocationAddress}
                    </p>
                  )}

                  <div className="flex items-center justify-between text-[10px] text-gray-400 pt-0.5">
                    <span>Active Screen Time: <b className="text-gray-700">{agent.todayActiveFormatted}</b></span>
                    <span>Calls: <b className="text-gray-700">{agent.callsToday}</b></span>
                  </div>
                </div>

                <button
                  onClick={() => openAgentDetail(agent)}
                  className="w-full py-1.5 bg-amber-50 hover:bg-amber-100 text-[#8B6914] text-[11px] font-black rounded-lg transition-all flex items-center justify-center gap-1 cursor-pointer"
                >
                  <span>View Full Logs & Calls</span>
                  <ArrowUpRight size={12} />
                </button>
              </div>
            ))}
          </div>
        )}
      </main>

      {/* ── Agent Detail Slide-Up Sheet ── */}
      {selectedAgent && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex flex-col justify-end transition-all">
          <div className="bg-white rounded-t-3xl max-h-[88vh] flex flex-col shadow-2xl overflow-hidden animate-in slide-in-from-bottom duration-200">
            {/* Sheet Header */}
            <div className="p-4 border-b border-gray-100 flex items-center justify-between bg-gray-50/80">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-[#C9A227] to-[#B8860B] flex items-center justify-center text-white font-black text-base shadow-sm">
                  {selectedAgent.name.charAt(0).toUpperCase()}
                </div>
                <div>
                  <h3 className="font-extrabold text-sm text-gray-900">{selectedAgent.name}</h3>
                  <div className="flex items-center gap-1.5 text-[10px] text-gray-500">
                    <span className="font-mono font-bold bg-gray-200 px-1 rounded">{selectedAgent.employee_id}</span>
                    <span>•</span>
                    <span className="font-bold text-amber-900">{selectedAgent.todayActiveFormatted} Screen Time</span>
                  </div>
                </div>
              </div>

              <button
                onClick={() => setSelectedAgent(null)}
                className="w-8 h-8 rounded-full bg-gray-200 hover:bg-gray-300 flex items-center justify-center text-gray-600 transition-colors"
              >
                <X size={16} />
              </button>
            </div>

            {/* Sheet Content */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {detailLoading ? (
                <div className="flex justify-center py-16">
                  <RefreshCw size={24} className="animate-spin text-[#C9A227]" />
                </div>
              ) : detailData ? (
                <>
                  {/* Punch & Working Summary */}
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div className="bg-emerald-50 p-2.5 rounded-xl border border-emerald-100">
                      <p className="text-[9px] font-black uppercase text-emerald-800">Punch In</p>
                      <p className="font-black text-emerald-950 mt-0.5">
                        {detailData.stats.punchIn ? new Date(detailData.stats.punchIn).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', timeZone: 'Asia/Kolkata' }) : '—'}
                      </p>
                    </div>
                    <div className="bg-amber-50 p-2.5 rounded-xl border border-amber-100">
                      <p className="text-[9px] font-black uppercase text-amber-800">Total Calls</p>
                      <p className="font-black text-amber-950 mt-0.5">{detailData.stats.totalCalls} calls made</p>
                    </div>
                  </div>

                  {/* 5 Disposition Metrics */}
                  <div>
                    <p className="text-[10px] font-black uppercase tracking-wider text-gray-400 mb-2">Performance Metrics</p>
                    <div className="grid grid-cols-5 gap-1.5">
                      {[
                        { label: 'Assigned', val: detailData.stats.assignedLeads, color: 'text-blue-600', bg: 'bg-blue-50' },
                        { label: 'Not Int.', val: detailData.stats.notInterested, color: 'text-red-600', bg: 'bg-red-50' },
                        { label: 'V. Sched.', val: detailData.stats.visitScheduled, color: 'text-indigo-600', bg: 'bg-indigo-50' },
                        { label: 'Visit Done', val: detailData.stats.visitDone, color: 'text-purple-600', bg: 'bg-purple-50' },
                        { label: 'Booked', val: detailData.stats.booked, color: 'text-emerald-600', bg: 'bg-emerald-50' },
                      ].map(m => (
                        <div key={m.label} className={`${m.bg} p-2 rounded-xl text-center`}>
                          <p className={`text-sm font-black ${m.color}`}>{m.val}</p>
                          <p className="text-[8px] font-black text-gray-400 uppercase tracking-wider mt-0.5">{m.label}</p>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Recent Customer Calls */}
                  <div>
                    <p className="text-[10px] font-black uppercase tracking-wider text-gray-400 mb-2">Recent Calls Log</p>
                    {detailData.recentCalls.length === 0 ? (
                      <p className="text-xs text-gray-400 font-semibold py-4 text-center">No customer calls recorded today</p>
                    ) : (
                      <div className="space-y-2">
                        {detailData.recentCalls.map((call, idx) => {
                          const badge = DISPOSITION_BADGES[call.disposition] || DISPOSITION_BADGES.new;
                          return (
                            <div key={idx} className="bg-gray-50 p-2.5 rounded-xl border border-gray-100 text-xs space-y-1">
                              <div className="flex items-center justify-between">
                                <span className="font-bold text-gray-900">{call.customerName}</span>
                                <span className={`text-[9px] font-black uppercase px-2 py-0.5 rounded-full border ${badge.bg} ${badge.text} ${badge.border}`}>
                                  {badge.label}
                                </span>
                              </div>
                              <div className="flex items-center justify-between text-[10px] text-gray-500">
                                <span>📞 {call.customerPhone}</span>
                                <span>{new Date(call.calledAt).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', timeZone: 'Asia/Kolkata' })}</span>
                              </div>
                              {call.notes && (
                                <p className="text-[10px] text-gray-600 bg-white p-1.5 rounded border border-gray-100 italic">
                                  "{call.notes}"
                                </p>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                </>
              ) : null}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
