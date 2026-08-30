'use client';

import React, { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import {
  MapPin,
  Battery,
  Clock,
  Car,
  Building2,
  RefreshCw,
  Eye,
  CheckCircle2,
  AlertCircle,
  AlertTriangle,
  TrendingUp,
  Compass,
  ShieldCheck,
  ToggleLeft,
  ToggleRight,
  Loader2,
  Radio,
  Sliders,
  Navigation,
  Route,
  Edit3,
  Crosshair,
  X,
} from 'lucide-react';
import toast from 'react-hot-toast';

// Load RouteMapModal only on client-side (Leaflet uses window/document)
const RouteMapModal = dynamic(() => import('./RouteMapModal'), { ssr: false });

interface AgentLiveInfo {
  agentId: string;
  agentName: string;
  employee_id?: string;
  latitude: number;
  longitude: number;
  status: 'IN_OFFICE' | 'ON_FIELD_VISIT' | 'OFF_DUTY';
  speed?: number;
  batteryLevel?: number;
  distanceFromOfficeMeters: number;
  distanceKm?: number;
  distanceFormatted?: string;
  address?: string;
  lastPing: string;
  pingCount: number;
  hasPing?: boolean;
  isPunchedIn?: boolean;
  punchStatusText?: string;
  screenTimeFormatted?: string;
}

interface RoutePoint {
  latitude: number;
  longitude: number;
  speed?: number;
  battery?: number;
  status: string;
  timestamp: string;
  distanceFromOfficeMeters: number;
}

interface GeofenceSettings {
  geofenceEnabled: boolean;
  officeAddress: string;
  officeLat: number;
  officeLng: number;
  geofenceRadiusMeters: number;
  emergencyModeReason?: string;
}

function getTodayISTDateString(): string {
  try {
    return new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Kolkata' }).format(new Date());
  } catch {
    const now = new Date();
    const istOffset = 5.5 * 60 * 60 * 1000;
    return new Date(now.getTime() + istOffset).toISOString().split('T')[0];
  }
}

export default function AdminTrackingPage() {
  const [agents, setAgents] = useState<AgentLiveInfo[]>([]);
  const [loading, setLoading] = useState(true);
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [selectedAgent, setSelectedAgent] = useState<AgentLiveInfo | null>(null);
  const [selectedDate, setSelectedDate] = useState<string>(getTodayISTDateString);
  const [routeHistory, setRouteHistory] = useState<RoutePoint[]>([]);
  const [routeDistanceKm, setRouteDistanceKm] = useState<number>(0);
  const [loadingRoute, setLoadingRoute] = useState(false);

  // Geofence & Emergency Remote Mode State
  const [geofenceSettings, setGeofenceSettings] = useState<GeofenceSettings | null>(null);
  const [togglingGeofence, setTogglingGeofence] = useState(false);

  // Office Location Coordinates Customization
  const [isSuperAdmin, setIsSuperAdmin] = useState(false);
  const [showEditOfficeModal, setShowEditOfficeModal] = useState(false);
  const [editOfficeLat, setEditOfficeLat] = useState('28.4624272');
  const [editOfficeLng, setEditOfficeLng] = useState('77.1515298');
  const [editOfficeRadius, setEditOfficeRadius] = useState('200');
  const [editOfficeAddress, setEditOfficeAddress] = useState('Dalmia farm, Plot no-2, Jona Pur, Jaunapur, New Delhi, Delhi 110047');
  const [savingOffice, setSavingOffice] = useState(false);
  const [fetchingGPS, setFetchingGPS] = useState(false);

  useEffect(() => {
    const getCookie = (name: string) => {
      if (typeof document === 'undefined') return '';
      const value = `; ${document.cookie}`;
      const parts = value.split(`; ${name}=`);
      if (parts.length === 2) return parts.pop()?.split(';').shift() || '';
      return '';
    };
    const currentRole = getCookie('admin_role');
    setIsSuperAdmin(currentRole === 'super_admin');
  }, []);

  useEffect(() => {
    if (geofenceSettings) {
      if (geofenceSettings.officeLat) setEditOfficeLat(String(geofenceSettings.officeLat));
      if (geofenceSettings.officeLng) setEditOfficeLng(String(geofenceSettings.officeLng));
      if (geofenceSettings.geofenceRadiusMeters) setEditOfficeRadius(String(geofenceSettings.geofenceRadiusMeters));
      if (geofenceSettings.officeAddress) setEditOfficeAddress(geofenceSettings.officeAddress);
    }
  }, [geofenceSettings]);

  const handleSaveOfficeLocation = async () => {
    const latNum = parseFloat(editOfficeLat);
    const lngNum = parseFloat(editOfficeLng);
    const radNum = parseInt(editOfficeRadius, 10);

    if (isNaN(latNum) || isNaN(lngNum)) {
      toast.error('Please enter valid Latitude and Longitude');
      return;
    }

    setSavingOffice(true);
    try {
      const res = await fetch('/api/admin/tracking/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          officeLat: latNum,
          officeLng: lngNum,
          officeAddress: editOfficeAddress,
          geofenceRadiusMeters: !isNaN(radNum) && radNum > 0 ? radNum : 200,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setGeofenceSettings(data.settings);
        toast.success('Office location & GPS coordinates updated successfully!');
        setShowEditOfficeModal(false);
        fetchLiveTracking();
      } else {
        toast.error(data.error || 'Failed to update office location');
      }
    } catch {
      toast.error('Network error');
    } finally {
      setSavingOffice(false);
    }
  };

  const handleGetCurrentLocation = () => {
    if (typeof window === 'undefined' || !navigator.geolocation) {
      toast.error('Geolocation is not supported by your browser');
      return;
    }
    setFetchingGPS(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setEditOfficeLat(pos.coords.latitude.toFixed(6));
        setEditOfficeLng(pos.coords.longitude.toFixed(6));
        setFetchingGPS(false);
        toast.success(`Current GPS detected: ${pos.coords.latitude.toFixed(6)}, ${pos.coords.longitude.toFixed(6)}`);
      },
      (err) => {
        setFetchingGPS(false);
        toast.error('GPS permission denied or unavailable');
      },
      { enableHighAccuracy: true }
    );
  };

  const fetchLiveTracking = async () => {
    if (typeof window !== 'undefined' && (!navigator.onLine || document.hidden)) {
      return;
    }
    try {
      const res = await fetch('/api/admin/tracking/live');
      if (!res.ok) return;
      const data = await res.json();
      if (data.success && data.agents) {
        setAgents(data.agents);
      }
    } catch (e) {
      // Silently handle transient network drop during background interval
    } finally {
      setLoading(false);
    }
  };

  const fetchGeofenceSettings = async () => {
    if (typeof window !== 'undefined' && (!navigator.onLine || document.hidden)) {
      return;
    }
    try {
      const res = await fetch('/api/admin/tracking/settings');
      if (!res.ok) return;
      const data = await res.json();
      if (data.success) {
        setGeofenceSettings(data.settings);
      }
    } catch (e) {
      // Silently handle transient network drop
    }
  };

  const handleToggleGeofence = async (newVal: boolean) => {
    setTogglingGeofence(true);
    try {
      const res = await fetch('/api/admin/tracking/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ geofenceEnabled: newVal }),
      });
      const data = await res.json();
      if (data.success) {
        setGeofenceSettings(data.settings);
        toast.success(data.message, { duration: 4000 });
        fetchLiveTracking();
      } else {
        toast.error(data.error || 'Failed to update geofence setting');
      }
    } catch {
      toast.error('Network error');
    } finally {
      setTogglingGeofence(false);
    }
  };

  useEffect(() => {
    fetchLiveTracking();
    fetchGeofenceSettings();
    if (!autoRefresh) return;
    const interval = setInterval(fetchLiveTracking, 15000);
    return () => clearInterval(interval);
  }, [autoRefresh]);

  const viewRouteHistory = async (agent: AgentLiveInfo, targetDate?: string) => {
    const dateToFetch = targetDate || selectedDate;
    setSelectedAgent(agent);
    setLoadingRoute(true);
    try {
      const res = await fetch(
        `/api/admin/tracking/history?agentId=${agent.agentId}&date=${dateToFetch}`
      );
      const data = await res.json();
      if (data.success) {
        setRouteHistory(data.path || []);
        setRouteDistanceKm(data.totalDistanceKm || 0);
      }
    } catch (e) {
      console.error('Failed to fetch route history:', e);
    } finally {
      setLoadingRoute(false);
    }
  };

  const inOfficeCount = agents.filter((a) => a.status === 'IN_OFFICE').length;
  const onFieldCount = agents.filter((a) => a.status === 'ON_FIELD_VISIT').length;
  const offDutyCount = agents.filter((a) => a.status === 'OFF_DUTY').length;

  return (
    <div className="p-4 md:p-6 max-w-7xl mx-auto space-y-5">
      {/* 🌟 Header */}
      <div className="bg-white rounded-2xl border border-stone-200/90 shadow-sm p-4 md:px-5 md:py-3.5 flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-[#8B6914]/10 border border-[#8B6914]/20 rounded-xl text-[#8B6914] shrink-0">
            <Compass className="w-5 h-5 text-[#8B6914]" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-lg md:text-xl font-black tracking-tight text-stone-900" style={{ color: '#1C1917' }}>
                Agent GPS Field Radar
              </h1>
              <span className="text-[10px] font-extrabold uppercase tracking-wider bg-[#8B6914]/10 text-[#8B6914] px-2 py-0.5 rounded-full border border-[#8B6914]/20">
                Live
              </span>
            </div>
            <div className="flex flex-wrap items-center gap-x-3 gap-y-0.5 text-xs text-stone-500 font-medium mt-0.5">
              <span className="flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5 text-[#8B6914]" />
                Jonapur Head Office ({geofenceSettings?.geofenceRadiusMeters || 200}m Geofence)
              </span>
              <span className="text-stone-300 hidden sm:inline">•</span>
              <span className="flex items-center gap-1">
                <Clock className="w-3.5 h-3.5 text-[#8B6914]" />
                Shift: 10:00 AM – 07:00 PM
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 self-start md:self-center shrink-0">
          <button
            onClick={() => setAutoRefresh(!autoRefresh)}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-2 transition-all cursor-pointer ${
              autoRefresh
                ? 'bg-emerald-50 text-emerald-800 border border-emerald-200 hover:bg-emerald-100'
                : 'bg-stone-100 text-stone-600 border border-stone-200 hover:bg-stone-200'
            }`}
          >
            <span className="relative flex h-2 w-2">
              {autoRefresh && (
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
              )}
              <span className={`relative inline-flex rounded-full h-2 w-2 ${autoRefresh ? 'bg-emerald-500' : 'bg-stone-400'}`} />
            </span>
            <span>{autoRefresh ? 'Live (15s)' : 'Paused'}</span>
          </button>

          <button
            onClick={() => { fetchLiveTracking(); fetchGeofenceSettings(); }}
            className="px-3.5 py-1.5 bg-[#8B6914] hover:bg-[#72540F] text-white rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 shadow-sm active:scale-95 cursor-pointer"
            style={{ color: '#FFFFFF' }}
          >
            <RefreshCw className="w-3.5 h-3.5 text-white" />
            Refresh
          </button>
        </div>
      </div>

      {/* 🛡️ Master Geofence & Emergency Remote Login Access Control Card */}
      <div className={`p-5 rounded-3xl border transition-all duration-300 shadow-sm ${
        geofenceSettings?.geofenceEnabled
          ? 'bg-gradient-to-r from-emerald-50/90 via-white to-emerald-50/50 border-emerald-300/80'
          : 'bg-gradient-to-r from-amber-50/95 via-white to-amber-50/70 border-amber-300 shadow-md'
      }`}>
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="flex items-start gap-3.5">
            <div className={`p-3 rounded-2xl shrink-0 shadow-sm ${
              geofenceSettings?.geofenceEnabled
                ? 'bg-emerald-600 text-white'
                : 'bg-amber-500 text-white animate-pulse'
            }`}>
              {geofenceSettings?.geofenceEnabled ? (
                <ShieldCheck className="w-6 h-6" />
              ) : (
                <AlertTriangle className="w-6 h-6" />
              )}
            </div>

            <div>
              <div className="flex items-center gap-2.5 flex-wrap">
                <h2 className="text-base md:text-lg font-black text-gray-900">
                  {geofenceSettings?.geofenceEnabled
                    ? 'Office Location Enforcement: STRICT GEOFENCE ACTIVE'
                    : 'Office Location Enforcement: REMOTE / EMERGENCY MODE ACTIVE'}
                </h2>
                <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider ${
                  geofenceSettings?.geofenceEnabled
                    ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                    : 'bg-amber-100 text-amber-900 border border-amber-300 animate-pulse'
                }`}>
                  {geofenceSettings?.geofenceEnabled ? '🔒 Strict Office Only' : '🌐 Remote Login Allowed'}
                </span>
              </div>

              <p className="text-xs font-semibold text-gray-600 mt-1 max-w-2xl leading-relaxed">
                {geofenceSettings?.geofenceEnabled ? (
                  <>
                    Agents must be physically present at <b>Jonapur Head Office ({geofenceSettings?.geofenceRadiusMeters || 200}m radius)</b> to punch in and start their shift.
                  </>
                ) : (
                  <>
                    <b className="text-amber-800">Punch-in location restriction is TURNED OFF.</b> Agents can punch in & login from <b>ANY location</b> (Home, Field, Client Project, or Emergency).
                  </>
                )}
              </p>

              {/* Always Active GPS Tracking Indicator */}
              <div className="flex items-center gap-1.5 mt-2 text-[11px] font-bold text-stone-700 bg-stone-100/90 border border-stone-200/80 px-2.5 py-1 rounded-xl w-fit">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                <span>📡 Live Field GPS Telemetry (10 AM – 7 PM): <b>ALWAYS ACTIVE</b> (Continuous radar & route tracking continues even in remote mode)</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3 shrink-0 self-start lg:self-center">
          {isSuperAdmin && (
              <button
                onClick={() => handleToggleGeofence(!geofenceSettings?.geofenceEnabled)}
                disabled={togglingGeofence}
                className={`px-5 py-3 rounded-2xl font-black text-xs transition-all flex items-center gap-2.5 shadow-md cursor-pointer disabled:opacity-50 hover:scale-[1.02] active:scale-95 ${
                  geofenceSettings?.geofenceEnabled
                    ? 'bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white border border-amber-500'
                    : 'bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-700 hover:to-emerald-800 text-white border border-emerald-600'
                }`}
              >
                {togglingGeofence ? (
                  <Loader2 className="w-4 h-4 animate-spin text-white" />
                ) : geofenceSettings?.geofenceEnabled ? (
                  <>
                    <ToggleLeft className="w-5 h-5 text-white" />
                    <span>Turn OFF Restriction (Allow Remote Login)</span>
                  </>
                ) : (
                  <>
                    <ToggleRight className="w-5 h-5 text-white" />
                    <span>Turn ON Restriction (Strict Office Only)</span>
                  </>
                )}
              </button>
            )}


          </div>
        </div>
      </div>

      {/* 📊 Metrics Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
        {/* Office Geofence */}
        <div className="bg-white p-4 rounded-2xl border border-stone-200 shadow-sm flex items-center justify-between">
          <div>
            <div className="flex items-center gap-1.5">
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-stone-400">
                Base Geofence
              </span>
              {isSuperAdmin && (
                <button
                  onClick={() => setShowEditOfficeModal(true)}
                  className="text-[10px] font-black text-blue-600 hover:text-blue-800 underline cursor-pointer flex items-center gap-0.5"
                  title="Edit coordinates"
                >
                  <Edit3 size={10} /> Edit Coords
                </button>
              )}
            </div>
            <h3 className="text-sm font-black text-stone-900 mt-1 truncate max-w-[180px]" style={{ color: '#1C1917' }}>
              {geofenceSettings?.officeAddress?.split(',')[0] || 'Dalmia farm, Plot no-2'}
            </h3>
            <p className="text-[11px] text-stone-500 mt-0.5 font-medium">
              {geofenceSettings?.officeLat?.toFixed(4) || '28.4624'}, {geofenceSettings?.officeLng?.toFixed(4) || '77.1515'} • {geofenceSettings?.geofenceRadiusMeters || 200}m
            </p>
          </div>
          {isSuperAdmin ? (
            <button
              onClick={() => setShowEditOfficeModal(true)}
              className="p-2.5 rounded-xl bg-amber-50 text-[#8B6914] border border-amber-200/60 hover:bg-amber-100 transition-all cursor-pointer"
              title="Edit Office Location & Coordinates"
            >
              <Building2 className="w-4 h-4" />
            </button>
          ) : (
            <div className="p-2.5 rounded-xl bg-amber-50 text-[#8B6914] border border-amber-200/60">
              <Building2 className="w-4 h-4" />
            </div>
          )}
        </div>

        {/* In Office */}
        <div className="bg-emerald-50/70 p-4 rounded-2xl border border-emerald-200 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-[10px] font-extrabold uppercase tracking-wider text-emerald-800">
              In Office (Present)
            </span>
            <h3 className="text-2xl font-black text-emerald-950 mt-1" style={{ color: '#064E3B' }}>{inOfficeCount}</h3>
            <p className="text-[11px] text-emerald-700 mt-0.5 font-semibold">At Jonapur Farm</p>
          </div>
          <div className="p-2.5 rounded-xl bg-emerald-100 text-emerald-800 border border-emerald-200">
            <CheckCircle2 className="w-4 h-4" />
          </div>
        </div>

        {/* On Field */}
        <div className="bg-blue-50/70 p-4 rounded-2xl border border-blue-200 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-[10px] font-extrabold uppercase tracking-wider text-blue-800">
              On Field Visit
            </span>
            <h3 className="text-2xl font-black text-blue-950 mt-1" style={{ color: '#1E3A8A' }}>{onFieldCount}</h3>
            <p className="text-[11px] text-blue-700 mt-0.5 font-semibold">Live GPS (10 AM - 7 PM)</p>
          </div>
          <div className="p-2.5 rounded-xl bg-blue-100 text-blue-800 border border-blue-200">
            <Car className="w-4 h-4" />
          </div>
        </div>

        {/* Off Duty */}
        <div className="bg-stone-50 p-4 rounded-2xl border border-stone-200 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-[10px] font-extrabold uppercase tracking-wider text-stone-500">
              Off Duty
            </span>
            <h3 className="text-2xl font-black text-stone-800 mt-1" style={{ color: '#292524' }}>{offDutyCount}</h3>
            <p className="text-[11px] text-stone-500 mt-0.5 font-medium">Outside Shift Hours</p>
          </div>
          <div className="p-2.5 rounded-xl bg-stone-200/70 text-stone-700 border border-stone-300">
            <Clock className="w-4 h-4" />
          </div>
        </div>
      </div>

      {/* 🗺️ Live Agents List Section */}
      <div className="bg-white rounded-2xl border border-stone-200 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-stone-100 flex items-center justify-between bg-stone-50/60">
          <div className="flex items-center gap-2.5">
            <div className="w-2.5 h-2.5 rounded-full bg-[#8B6914] animate-pulse" />
            <h2 className="text-base font-black text-stone-900 tracking-tight" style={{ color: '#1C1917' }}>
              Live Field Intel Feed
            </h2>
            <span className="text-xs bg-[#8B6914]/10 text-[#8B6914] px-2.5 py-0.5 rounded-full font-extrabold border border-[#8B6914]/20">
              {agents.length} Team Members
            </span>
          </div>
        </div>

        {loading ? (
          <div className="p-12 text-center text-stone-400 font-medium">
            <RefreshCw className="w-5 h-5 animate-spin mx-auto mb-2 text-[#8B6914]" />
            Streaming live telemetry from agents...
          </div>
        ) : agents.length === 0 ? (
          <div className="p-12 text-center text-stone-400 flex flex-col items-center">
            <div className="w-12 h-12 rounded-2xl bg-stone-100 flex items-center justify-center mb-2.5">
              <Compass className="w-6 h-6 text-stone-400" />
            </div>
            <p className="font-extrabold text-stone-800 text-sm">No telemetry pings logged yet today.</p>
            <p className="text-xs text-stone-400 max-w-md mt-0.5 font-medium">
              Background tracking triggers automatically when agents sign in to the mobile CRM during shift hours (10 AM - 7 PM).
            </p>
          </div>
        ) : (
          <div className="divide-y divide-stone-100">
            {agents.map((agent) => {
              const isInOffice = agent.status === 'IN_OFFICE';
              const isOnField = agent.status === 'ON_FIELD_VISIT';
              return (
                <div
                  key={agent.agentId}
                  className="p-4 md:p-5 flex flex-col md:flex-row md:items-center justify-between gap-3.5 hover:bg-stone-50/80 transition-all duration-200"
                >
                  <div className="flex items-center gap-3.5">
                    <div
                      className={`w-11 h-11 rounded-xl flex items-center justify-center font-black text-base shadow-sm ${
                        isInOffice
                          ? 'bg-emerald-100 text-emerald-900 border border-emerald-300'
                          : isOnField
                          ? 'bg-blue-100 text-blue-900 border border-blue-300'
                          : 'bg-stone-100 text-stone-600 border border-stone-300'
                      }`}
                    >
                      {agent.agentName ? agent.agentName.charAt(0).toUpperCase() : 'A'}
                    </div>

                    <div className="space-y-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h4 className="font-extrabold text-stone-900 text-sm" style={{ color: '#1C1917' }}>
                          {agent.agentName || 'Agent'}
                        </h4>
                        <span
                          className={`text-[10px] font-black px-2.5 py-0.5 rounded-full uppercase tracking-wider ${
                            isInOffice
                              ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                              : isOnField
                              ? 'bg-blue-100 text-blue-800 border border-blue-300'
                              : 'bg-stone-100 text-stone-600 border border-stone-300'
                          }`}
                        >
                          {isInOffice
                            ? '🏢 In Office'
                            : isOnField
                            ? '🚗 On Field Visit'
                            : '🌙 Off Duty'}
                        </span>

                        {/* 📍 Prominent KM Distance Badge */}
                        <span
                          className={`text-[11px] font-black px-2.5 py-0.5 rounded-lg flex items-center gap-1.5 border shadow-2xs ${
                            isInOffice
                              ? 'bg-emerald-50 text-emerald-900 border-emerald-200'
                              : (agent.distanceFromOfficeMeters || 0) >= 5000
                              ? 'bg-rose-100 text-rose-950 border-rose-300 font-extrabold'
                              : 'bg-amber-100/90 text-amber-950 border-amber-300'
                          }`}
                        >
                          <Navigation size={12} className={isInOffice ? 'text-emerald-700' : (agent.distanceFromOfficeMeters || 0) >= 5000 ? 'text-rose-700' : 'text-amber-800'} />
                          <span>
                            {isInOffice
                              ? `In Office (${agent.distanceFromOfficeMeters && agent.distanceFromOfficeMeters >= 1000 ? `${(agent.distanceFromOfficeMeters / 1000).toFixed(2)} km` : `${agent.distanceFromOfficeMeters || 0}m`})`
                              : `${((agent.distanceFromOfficeMeters || 0) / 1000).toFixed(2)} km away from Office`}
                          </span>
                        </span>

                        {/* 🏷️ Punch Attendance Status Badge */}
                        {agent.punchStatusText && (
                          <span
                            className={`text-[10px] font-extrabold px-2 py-0.5 rounded-md border ${
                              agent.isPunchedIn
                                ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                                : agent.punchStatusText.includes('Punched Out')
                                ? 'bg-stone-100 text-stone-700 border-stone-200'
                                : 'bg-rose-50 text-rose-800 border-rose-200'
                            }`}
                          >
                            {agent.punchStatusText}
                          </span>
                        )}
                      </div>

                      <div className="flex flex-wrap items-center gap-x-3.5 gap-y-0.5 text-xs text-stone-600 font-semibold">
                        <span className={`flex items-center gap-1 font-bold ${
                          isInOffice ? 'text-stone-800' : (agent.distanceFromOfficeMeters || 0) >= 5000 ? 'text-rose-700 font-black' : 'text-amber-900'
                        }`}>
                          <MapPin className={`w-3.5 h-3.5 ${isInOffice ? 'text-[#8B6914]' : 'text-rose-600'}`} />
                          {(agent.distanceFromOfficeMeters || 0) < 200
                            ? 'Inside Jonapur Head Office (Dalmia Farm)'
                            : `🚨 ${((agent.distanceFromOfficeMeters || 0) / 1000).toFixed(2)} KM away from Jonapur Head Office`}
                        </span>

                        {agent.screenTimeFormatted && (
                          <span className="flex items-center gap-1 text-stone-500 font-semibold">
                            <Clock className="w-3.5 h-3.5 text-stone-400" />
                            App: {agent.screenTimeFormatted}
                          </span>
                        )}

                        {agent.speed !== undefined && agent.speed !== null && agent.speed > 0 && (
                          <span className="flex items-center gap-1 text-stone-800 font-bold">
                            <Car className="w-3.5 h-3.5 text-blue-600" />
                            {Math.round(agent.speed)} km/h
                          </span>
                        )}

                        {agent.batteryLevel !== undefined && agent.batteryLevel !== null && (
                          <span className="flex items-center gap-1">
                            <Battery className="w-3.5 h-3.5 text-stone-400" />
                            {agent.batteryLevel}%
                          </span>
                        )}
                      </div>

                      {agent.address && (
                        <p className="text-[11px] text-stone-500 font-medium truncate max-w-lg mt-0.5">
                          📍 {agent.address}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-3 self-end md:self-center">
                    <div className="text-right">
                      <p className="text-[10px] text-stone-400 font-semibold uppercase">Last Signal</p>
                      <p className="text-xs font-bold text-stone-700 font-mono">
                        {agent.lastPing
                          ? new Date(agent.lastPing).toLocaleTimeString('en-IN', {
                              hour: '2-digit',
                              minute: '2-digit',
                              second: '2-digit',
                            })
                          : '—'}
                      </p>
                    </div>

                    <button
                      onClick={() => viewRouteHistory(agent)}
                      className="px-3.5 py-2 bg-stone-100 hover:bg-[#8B6914] text-stone-700 hover:text-white rounded-xl text-xs font-black transition-all flex items-center gap-1.5 cursor-pointer shadow-sm"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      View Route
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* 📍 Agent Route History Modal — Interactive Map */}
      {selectedAgent && (
        <RouteMapModal
          agentName={selectedAgent.agentName}
          date={selectedDate}
          routeHistory={routeHistory}
          routeDistanceKm={routeDistanceKm}
          loadingRoute={loadingRoute}
          officeLat={geofenceSettings?.officeLat}
          officeLng={geofenceSettings?.officeLng}
          officeAddress={geofenceSettings?.officeAddress}
          onClose={() => setSelectedAgent(null)}
          onDateChange={(d) => {
            setSelectedDate(d);
            if (selectedAgent) {
              viewRouteHistory(selectedAgent, d);
            }
          }}
        />
      )}

      {/* 🏢 Edit Office Location & Coordinates Modal */}
      {isSuperAdmin && showEditOfficeModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-stone-200 space-y-4">
            <div className="flex items-center justify-between border-b border-stone-100 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-[#8B6914]/10 text-[#8B6914] flex items-center justify-center font-bold">
                  <Building2 className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-black text-stone-900">Set Exact Office Location</h3>
                  <p className="text-xs text-stone-500">Configure base coordinates for geofence & route playback</p>
                </div>
              </div>
              <button onClick={() => setShowEditOfficeModal(false)} className="p-1.5 text-stone-400 hover:text-stone-800 rounded-xl">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3.5">
              <div>
                <label className="block text-[11px] font-black uppercase text-stone-600 mb-1">
                  Office Address / Landmark
                </label>
                <input
                  type="text"
                  value={editOfficeAddress}
                  onChange={(e) => setEditOfficeAddress(e.target.value)}
                  placeholder="e.g. Plot No-2, Dalmia Farm, Jonapur, New Delhi 110047"
                  className="w-full px-3.5 py-2 bg-stone-50 border border-stone-200 rounded-xl text-xs font-semibold text-stone-800 outline-none focus:border-[#8B6914]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-black uppercase text-stone-600 mb-1">
                    Latitude
                  </label>
                  <input
                    type="text"
                    value={editOfficeLat}
                    onChange={(e) => setEditOfficeLat(e.target.value)}
                    placeholder="e.g. 28.4595"
                    className="w-full px-3.5 py-2 bg-stone-50 border border-stone-200 rounded-xl text-xs font-mono font-bold text-stone-800 outline-none focus:border-[#8B6914]"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-black uppercase text-stone-600 mb-1">
                    Longitude
                  </label>
                  <input
                    type="text"
                    value={editOfficeLng}
                    onChange={(e) => setEditOfficeLng(e.target.value)}
                    placeholder="e.g. 77.1553"
                    className="w-full px-3.5 py-2 bg-stone-50 border border-stone-200 rounded-xl text-xs font-mono font-bold text-stone-800 outline-none focus:border-[#8B6914]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-black uppercase text-stone-600 mb-1">
                  Geofence Radius (Meters)
                </label>
                <input
                  type="number"
                  value={editOfficeRadius}
                  onChange={(e) => setEditOfficeRadius(e.target.value)}
                  placeholder="200"
                  className="w-full px-3.5 py-2 bg-stone-50 border border-stone-200 rounded-xl text-xs font-bold text-stone-800 outline-none focus:border-[#8B6914]"
                />
              </div>

              {/* Get Current Location Quick Button */}
              <button
                type="button"
                onClick={handleGetCurrentLocation}
                disabled={fetchingGPS}
                className="w-full py-2.5 px-3 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 text-emerald-800 rounded-xl text-xs font-black transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                {fetchingGPS ? (
                  <Loader2 className="w-4 h-4 animate-spin text-emerald-700" />
                ) : (
                  <Crosshair className="w-4 h-4 text-emerald-700" />
                )}
                <span>🎯 Use My Current Device GPS Location as Office</span>
              </button>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-stone-100">
              <button
                onClick={() => setShowEditOfficeModal(false)}
                className="px-4 py-2 bg-stone-100 hover:bg-stone-200 text-stone-700 rounded-xl text-xs font-bold transition-all cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveOfficeLocation}
                disabled={savingOffice}
                className="px-5 py-2 bg-[#8B6914] hover:bg-[#72540F] text-white rounded-xl text-xs font-black transition-all shadow-sm cursor-pointer disabled:opacity-50 flex items-center gap-1.5"
                style={{ color: '#FFFFFF' }}
              >
                {savingOffice && <Loader2 className="w-3.5 h-3.5 animate-spin text-white" />}
                <span>Save Office Location</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
