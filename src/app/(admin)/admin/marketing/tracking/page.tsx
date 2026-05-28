'use client';

import React, { useState, useEffect } from 'react';
import { 
  Loader2, Save, Activity, Trash2, RefreshCw, Play, Check, AlertCircle, HelpCircle, ArrowRight
} from 'lucide-react';
import toast from 'react-hot-toast';

interface TrackingSettings {
  isEnabled: boolean;
  googleTagManagerId: string;
  metaPixelId: string;
  googleAdsConversionId: string;
  googleAdsRemarketingLabel: string;
  ga4MeasurementId: string;
  enableAdvancedMatching: boolean;
  enableEventLog: boolean;
  lastUpdated?: string;
  updatedBy?: string;
}

interface EventLog {
  _id: string;
  eventName: string;
  parameters: Record<string, any>;
  sessionId: string;
  page: string;
  timestamp: string;
  userAgent: string;
  ipAddress: string;
}

export default function TrackingSettingsPage() {
  const [settings, setSettings] = useState<TrackingSettings>({
    isEnabled: false,
    googleTagManagerId: '',
    metaPixelId: '',
    googleAdsConversionId: '',
    googleAdsRemarketingLabel: '',
    ga4MeasurementId: '',
    enableAdvancedMatching: false,
    enableEventLog: true
  });

  const [logs, setLogs] = useState<EventLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [testing, setTesting] = useState(false);
  const [logsLoading, setLogsLoading] = useState(false);
  const [testResult, setTestResult] = useState<any>(null);

  // Validation state
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Fetch settings & logs on mount
  useEffect(() => {
    fetchSettings();
    fetchLogs();
  }, []);

  const fetchSettings = async () => {
    try {
      const res = await fetch('/api/admin/marketing/tracking');
      if (!res.ok) throw new Error('Failed to load tracking settings');
      const json = await res.json();
      if (json.success && json.data) {
        setSettings({
          isEnabled: json.data.isEnabled ?? false,
          googleTagManagerId: json.data.googleTagManagerId ?? '',
          metaPixelId: json.data.metaPixelId ?? '',
          googleAdsConversionId: json.data.googleAdsConversionId ?? '',
          googleAdsRemarketingLabel: json.data.googleAdsRemarketingLabel ?? '',
          ga4MeasurementId: json.data.ga4MeasurementId ?? '',
          enableAdvancedMatching: json.data.enableAdvancedMatching ?? false,
          enableEventLog: json.data.enableEventLog ?? true,
          lastUpdated: json.data.lastUpdated,
          updatedBy: json.data.updatedBy
        });
      }
    } catch (err: any) {
      console.error(err);
      toast.error('Could not load tracking settings');
    } finally {
      setLoading(false);
    }
  };

  const fetchLogs = async () => {
    setLogsLoading(true);
    try {
      const res = await fetch('/api/admin/marketing/tracking/logs');
      if (!res.ok) throw new Error('Failed to load telemetry logs');
      const json = await res.json();
      if (json.success && json.data) {
        setLogs(json.data);
      }
    } catch (err: any) {
      console.error(err);
    } finally {
      setLogsLoading(false);
    }
  };

  const clearLogs = async () => {
    if (!window.confirm('Are you sure you want to permanently delete all active event logs from the database?')) {
      return;
    }
    try {
      const res = await fetch('/api/admin/marketing/tracking/logs', { method: 'DELETE' });
      if (res.ok) {
        toast.success('Event logs cleared successfully');
        setLogs([]);
      } else {
        toast.error('Failed to clear event logs');
      }
    } catch (err: any) {
      toast.error('Error clearing event logs');
    }
  };

  const validate = () => {
    const nextErrors: Record<string, string> = {};
    
    if (settings.googleTagManagerId && !/^GTM-[A-Z0-9]+$/.test(settings.googleTagManagerId.trim())) {
      nextErrors.googleTagManagerId = 'Must match GTM-XXXXXXX format';
    }
    if (settings.metaPixelId && !/^[0-9]+$/.test(settings.metaPixelId.trim())) {
      nextErrors.metaPixelId = 'Must contain only numbers';
    }
    if (settings.googleAdsConversionId && !/^AW-[0-9]+$/.test(settings.googleAdsConversionId.trim())) {
      nextErrors.googleAdsConversionId = 'Must match AW-XXXXXXXXX format';
    }
    if (settings.ga4MeasurementId && !/^G-[A-Z0-9]+$/.test(settings.ga4MeasurementId.trim())) {
      nextErrors.ga4MeasurementId = 'Must match G-XXXXXXXXXX format';
    }

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) {
      toast.error('Please correct the validation errors first');
      return;
    }

    setSaving(true);
    try {
      const res = await fetch('/api/admin/marketing/tracking', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-admin-user': 'Admin Admin'
        },
        body: JSON.stringify(settings)
      });
      const json = await res.json();
      if (json.success) {
        toast.success('Telemetry configuration saved!');
        if (json.data) {
          setSettings(json.data);
        }
      } else {
        toast.error(json.error || 'Failed to update configurations');
      }
    } catch (err) {
      toast.error('Server communication error');
    } finally {
      setSaving(false);
    }
  };

  const handleTest = async () => {
    setTesting(true);
    setTestResult(null);
    try {
      const res = await fetch('/api/admin/marketing/tracking/test', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(settings)
      });
      const json = await res.json();
      if (json.success) {
        setTestResult({
          success: true,
          data: json.data
        });
        toast.success('Diagnostics completed!');
      } else {
        setTestResult({
          success: false,
          message: json.message || json.error
        });
        toast.error('Diagnostics failed');
      }
    } catch (err) {
      toast.error('Server diagnostic timeout');
    } finally {
      setTesting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center space-y-4">
        <Loader2 className="animate-spin text-[#C9A227]" size={36} />
        <p className="text-xs font-extrabold text-gray-400 uppercase tracking-widest animate-pulse">Loading telemetry systems...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-500 max-w-6xl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#1A1800] font-[var(--font-playfair)] tracking-tight">Marketing & Dynamic Remarketing</h1>
          <p className="text-xs text-gray-400 font-bold uppercase tracking-wider mt-1.5">Configure GTM containers, Meta Ads pixels, and Google Ads tags</p>
        </div>
        {settings.lastUpdated && (
          <div className="bg-[#1A1800] text-[#E8D5A3] px-4 py-2 rounded-xl text-[10px] font-black uppercase border border-[#C9A227]/20 self-start shadow-sm">
            Last Updated: {new Date(settings.lastUpdated).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' })} by {settings.updatedBy}
          </div>
        )}
      </div>

      <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Telemetry Switch Card */}
        <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm flex flex-col space-y-6">
          <div>
            <h2 className="text-sm font-extrabold text-gray-800 flex items-center gap-2">
              <Activity size={18} className="text-[#C9A227]" />
              Telemetry Switches
            </h2>
            <p className="text-[10px] text-gray-400 font-bold uppercase mt-1 tracking-wider">Configure tracking toggles</p>
          </div>

          <hr className="border-gray-100" />

          {/* Toggle 1: Global switch */}
          <div className="flex items-center justify-between p-4 rounded-2xl bg-gray-50 border border-gray-100">
            <div>
              <span className="text-xs font-black text-gray-800 uppercase block">Global Retargeting</span>
              <span className="text-[10px] text-gray-400 font-medium">Activate/deactivate all tags</span>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input 
                type="checkbox" 
                checked={settings.isEnabled}
                onChange={(e) => setSettings({ ...settings, isEnabled: e.target.checked })}
                className="sr-only peer" 
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#C9A227]"></div>
            </label>
          </div>

          {/* Toggle 2: Advanced Matching */}
          <div className="flex items-center justify-between p-4 rounded-2xl bg-gray-50 border border-gray-100">
            <div>
              <span className="text-xs font-black text-gray-800 uppercase block">Meta Advanced Matching</span>
              <span className="text-[10px] text-gray-400 font-medium">Improve Facebook attribution match</span>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input 
                type="checkbox" 
                checked={settings.enableAdvancedMatching}
                onChange={(e) => setSettings({ ...settings, enableAdvancedMatching: e.target.checked })}
                className="sr-only peer" 
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#C9A227]"></div>
            </label>
          </div>

          {/* Toggle 3: DB logging switch */}
          <div className="flex items-center justify-between p-4 rounded-2xl bg-gray-50 border border-gray-100">
            <div>
              <span className="text-xs font-black text-gray-800 uppercase block">MongoDB Debug Logs</span>
              <span className="text-[10px] text-gray-400 font-medium">Store browser actions in DB</span>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input 
                type="checkbox" 
                checked={settings.enableEventLog}
                onChange={(e) => setSettings({ ...settings, enableEventLog: e.target.checked })}
                className="sr-only peer" 
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#C9A227]"></div>
            </label>
          </div>

          <div className="flex-1" />

          {/* Status Display Card */}
          <div className={`p-4 rounded-2xl border text-center ${
            settings.isEnabled
              ? 'bg-emerald-50/50 border-emerald-100 text-emerald-800'
              : 'bg-gray-50 border-gray-100 text-gray-500'
          }`}>
            <span className="text-[10px] font-black uppercase tracking-widest block mb-1">Pixel Status</span>
            <span className="text-xs font-black uppercase">
              {settings.isEnabled ? '🟢 Live & Active' : '🔴 Tracking Disabled'}
            </span>
          </div>

        </div>

        {/* Configurations Fields Card (2/3 width) */}
        <div className="lg:col-span-2 bg-white rounded-3xl p-6 border border-gray-100 shadow-sm flex flex-col space-y-6">
          <div>
            <h2 className="text-sm font-extrabold text-gray-800 flex items-center gap-2">
              <Save size={18} className="text-[#C9A227]" />
              Platform Container & API Profiles
            </h2>
            <p className="text-[10px] text-gray-400 font-bold uppercase mt-1 tracking-wider">Configure unique tag integration keys</p>
          </div>

          <hr className="border-gray-100" />

          <div className="space-y-5">
            {/* GTM container ID */}
            <div>
              <label className="text-xs font-black text-gray-800 uppercase tracking-wider block mb-2">Google Tag Manager ID</label>
              <input 
                type="text" 
                placeholder="GTM-XXXXXXX" 
                value={settings.googleTagManagerId}
                onChange={(e) => setSettings({ ...settings, googleTagManagerId: e.target.value })}
                className={`w-full text-xs font-semibold px-4 py-3 rounded-xl border ${
                  errors.googleTagManagerId ? 'border-red-300 focus:ring-red-200' : 'border-gray-100 focus:ring-[#C9A227]/20'
                } bg-gray-50/50 focus:outline-none focus:ring-4 transition-all`}
              />
              {errors.googleTagManagerId && <span className="text-[10px] font-bold text-red-500 mt-1 block">{errors.googleTagManagerId}</span>}
              <span className="text-[9px] font-medium text-gray-400 mt-1 block">Fires GTM containers, tags, and analytics profiles. Standard: <code>GTM-XXXXXXX</code></span>
            </div>

            {/* Meta Pixel ID */}
            <div>
              <label className="text-xs font-black text-gray-800 uppercase tracking-wider block mb-2">Meta (Facebook) Pixel ID</label>
              <input 
                type="text" 
                placeholder="123456789012345" 
                value={settings.metaPixelId}
                onChange={(e) => setSettings({ ...settings, metaPixelId: e.target.value })}
                className={`w-full text-xs font-semibold px-4 py-3 rounded-xl border ${
                  errors.metaPixelId ? 'border-red-300 focus:ring-red-200' : 'border-gray-100 focus:ring-[#C9A227]/20'
                } bg-gray-50/50 focus:outline-none focus:ring-4 transition-all`}
              />
              {errors.metaPixelId && <span className="text-[10px] font-bold text-red-500 mt-1 block">{errors.metaPixelId}</span>}
              <span className="text-[9px] font-medium text-gray-400 mt-1 block">Drives Facebook Ads retargeting and analytics algorithms. Numbers only.</span>
            </div>

            {/* Google Ads + Remarketing Row */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label className="text-xs font-black text-gray-800 uppercase tracking-wider block mb-2">Google Ads Conversion ID</label>
                <input 
                  type="text" 
                  placeholder="AW-123456789" 
                  value={settings.googleAdsConversionId}
                  onChange={(e) => setSettings({ ...settings, googleAdsConversionId: e.target.value })}
                  className={`w-full text-xs font-semibold px-4 py-3 rounded-xl border ${
                    errors.googleAdsConversionId ? 'border-red-300 focus:ring-red-200' : 'border-gray-100 focus:ring-[#C9A227]/20'
                  } bg-gray-50/50 focus:outline-none focus:ring-4 transition-all`}
                />
                {errors.googleAdsConversionId && <span className="text-[10px] font-bold text-red-500 mt-1 block">{errors.googleAdsConversionId}</span>}
                <span className="text-[9px] font-medium text-gray-400 mt-1 block">Remarketing and AdWords tag. Standard: <code>AW-XXXXXXXXX</code></span>
              </div>

              <div>
                <label className="text-xs font-black text-gray-800 uppercase tracking-wider block mb-2">Remarketing Label (Optional)</label>
                <input 
                  type="text" 
                  placeholder="e.g. xyzABC123" 
                  value={settings.googleAdsRemarketingLabel}
                  onChange={(e) => setSettings({ ...settings, googleAdsRemarketingLabel: e.target.value })}
                  className="w-full text-xs font-semibold px-4 py-3 rounded-xl border border-gray-100 focus:ring-[#C9A227]/20 bg-gray-50/50 focus:outline-none focus:ring-4 transition-all"
                />
                <span className="text-[9px] font-medium text-gray-400 mt-1 block">Specific key for custom retargeting campaigns.</span>
              </div>
            </div>

            {/* GA4 Measurement ID */}
            <div>
              <label className="text-xs font-black text-gray-800 uppercase tracking-wider block mb-2">GA4 Measurement ID</label>
              <input 
                type="text" 
                placeholder="G-XXXXXXXXXX" 
                value={settings.ga4MeasurementId}
                onChange={(e) => setSettings({ ...settings, ga4MeasurementId: e.target.value })}
                className={`w-full text-xs font-semibold px-4 py-3 rounded-xl border ${
                  errors.ga4MeasurementId ? 'border-red-300 focus:ring-red-200' : 'border-gray-100 focus:ring-[#C9A227]/20'
                } bg-gray-50/50 focus:outline-none focus:ring-4 transition-all`}
              />
              {errors.ga4MeasurementId && <span className="text-[10px] font-bold text-red-500 mt-1 block">{errors.ga4MeasurementId}</span>}
              <span className="text-[9px] font-medium text-gray-400 mt-1 block">Fires Google Analytics 4 tracking. Standard: <code>G-XXXXXXXXXX</code></span>
            </div>
          </div>

          <div className="pt-4 flex flex-wrap gap-4 items-center justify-between border-t border-gray-50">
            <button 
              type="button"
              onClick={handleTest}
              disabled={testing}
              className="px-5 py-3 rounded-xl bg-gray-50 text-xs font-extrabold uppercase tracking-wider border border-gray-100 hover:bg-gray-100 text-gray-700 transition-colors flex items-center gap-2"
            >
              {testing ? <Loader2 size={14} className="animate-spin text-gray-500" /> : <Play size={14} className="text-[#C9A227]" />}
              Test All Pixels
            </button>

            <button 
              type="submit"
              disabled={saving}
              className="px-6 py-3 rounded-xl bg-[#1A1800] text-xs font-extrabold uppercase tracking-wider hover:bg-black text-[#E8D5A3] transition-colors flex items-center gap-2"
            >
              {saving ? <Loader2 size={14} className="animate-spin text-[#E8D5A3]" /> : <Save size={14} />}
              Save Telemetry Setup
            </button>
          </div>
        </div>

      </form>

      {/* Diagnostics payload preview (if run) */}
      {testResult && (
        <div className={`p-5 rounded-3xl border animate-in slide-in-from-top-4 duration-300 ${
          testResult.success ? 'bg-emerald-50/50 border-emerald-100' : 'bg-red-50/50 border-red-100'
        }`}>
          <h3 className="text-xs font-black uppercase text-gray-800 flex items-center gap-2 mb-3">
            <HelpCircle size={16} className={testResult.success ? 'text-emerald-600' : 'text-red-600'} />
            System Diagnostics Output
          </h3>
          {testResult.success ? (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-[10px] font-semibold text-gray-600">
              <div className="bg-white p-3 rounded-xl border border-emerald-100/50">
                <span className="text-gray-400 uppercase tracking-widest block mb-1">GTM status</span>
                <span className={`font-black ${testResult.data.gtmActive ? 'text-emerald-700' : 'text-gray-400'}`}>
                  {testResult.data.gtmActive ? '🟢 Live/Active' : '⚪ Configured Blank'}
                </span>
              </div>
              <div className="bg-white p-3 rounded-xl border border-emerald-100/50">
                <span className="text-gray-400 uppercase tracking-widest block mb-1">Meta Pixel status</span>
                <span className={`font-black ${testResult.data.metaActive ? 'text-emerald-700' : 'text-gray-400'}`}>
                  {testResult.data.metaActive ? '🟢 Live/Active' : '⚪ Configured Blank'}
                </span>
              </div>
              <div className="bg-white p-3 rounded-xl border border-emerald-100/50">
                <span className="text-gray-400 uppercase tracking-widest block mb-1">Google Ads status</span>
                <span className={`font-black ${testResult.data.googleAdsActive ? 'text-emerald-700' : 'text-gray-400'}`}>
                  {testResult.data.googleAdsActive ? '🟢 Live/Active' : '⚪ Configured Blank'}
                </span>
              </div>
              <div className="bg-white p-3 rounded-xl border border-emerald-100/50">
                <span className="text-gray-400 uppercase tracking-widest block mb-1">GA4 status</span>
                <span className={`font-black ${testResult.data.ga4Active ? 'text-emerald-700' : 'text-gray-400'}`}>
                  {testResult.data.ga4Active ? '🟢 Live/Active' : '⚪ Configured Blank'}
                </span>
              </div>
            </div>
          ) : (
            <p className="text-xs font-bold text-red-700">{testResult.message}</p>
          )}
        </div>
      )}

      {/* Real-time telemetry log auditor */}
      <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden flex flex-col">
        <div className="px-6 py-5 border-b border-gray-50 flex items-center justify-between">
          <div>
            <h2 className="text-sm font-extrabold text-gray-800 flex items-center gap-2">
              <Activity size={18} className="text-[#C9A227]" />
              Live Telemetry Auditing Logs
            </h2>
            <p className="text-[10px] text-gray-400 font-bold uppercase mt-1 tracking-wider">Active debug and remarketing triggers</p>
          </div>

          <div className="flex items-center gap-3">
            <button 
              onClick={fetchLogs}
              disabled={logsLoading}
              className="p-2 rounded-lg bg-gray-50 border border-gray-100 hover:bg-gray-100 transition-colors flex items-center justify-center text-gray-500"
              title="Refresh Logs"
            >
              <RefreshCw size={14} className={logsLoading ? 'animate-spin' : ''} />
            </button>
            {logs.length > 0 && (
              <button 
                onClick={clearLogs}
                className="px-3 py-1.5 text-[10px] font-black uppercase text-red-600 hover:text-red-700 bg-red-50 hover:bg-red-100 border border-red-100 rounded-xl transition-colors flex items-center gap-1.5"
              >
                <Trash2 size={12} />
                Clear Logs
              </button>
            )}
          </div>
        </div>

        <div className="overflow-x-auto">
          {logsLoading && logs.length === 0 ? (
            <div className="py-12 flex flex-col items-center justify-center text-gray-400 text-xs font-bold uppercase tracking-wider animate-pulse">
              Fetching active audit trails...
            </div>
          ) : logs.length > 0 ? (
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-gray-50/50 text-[10px] font-black text-gray-400 uppercase border-b border-gray-100">
                  <th className="py-3 px-6">Timestamp</th>
                  <th className="py-3 px-4">Event Name</th>
                  <th className="py-3 px-4">Browser/Session</th>
                  <th className="py-3 px-4">IP Address</th>
                  <th className="py-3 px-6">Event Parameters Payload</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50 font-sans">
                {logs.map((log) => {
                  let eventBadgeClass = 'bg-gray-50 text-gray-600 border-gray-100';
                  if (log.eventName === 'ViewProperty') {
                    eventBadgeClass = 'bg-emerald-50 text-emerald-700 border-emerald-100';
                  } else if (log.eventName === 'PageView') {
                    eventBadgeClass = 'bg-blue-50 text-blue-700 border-blue-100';
                  } else if (log.eventName.includes('Form') || log.eventName.includes('Submit') || log.eventName === 'LeadSubmit') {
                    eventBadgeClass = 'bg-amber-50 text-amber-700 border-amber-100';
                  }

                  return (
                    <tr key={log._id} className="hover:bg-[#FFFEF5]/50 transition-colors text-[11px] font-medium text-gray-600">
                      <td className="py-3.5 px-6 whitespace-nowrap text-gray-400 font-bold">
                        {new Date(log.timestamp).toLocaleString('en-IN', { hour12: false, month: 'short', day: '2-digit', hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                      </td>
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-black uppercase border ${eventBadgeClass}`}>
                          {log.eventName}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 max-w-[120px] truncate text-gray-500 font-mono text-[9px]">
                        {log.sessionId || 'anonymous'}
                      </td>
                      <td className="py-3.5 px-4 font-mono font-bold text-gray-400">
                        {log.ipAddress}
                      </td>
                      <td className="py-3.5 px-6 text-gray-500 font-mono text-[9px] max-w-[300px] truncate" title={JSON.stringify(log.parameters, null, 2)}>
                        {JSON.stringify(log.parameters)}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          ) : (
            <div className="py-12 flex flex-col items-center justify-center text-gray-400 text-xs font-bold uppercase tracking-wider">
              No telemetry events recorded yet. Turn on switch & browse the site to populate logs!
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
