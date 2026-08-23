'use client';

import { useState, useEffect } from 'react';
import { Zap, Pause, Play, RefreshCw, Layers, ShieldCheck, CheckCircle2 } from 'lucide-react';
import toast from 'react-hot-toast';

interface AutoDistributionToggleProps {
  compact?: boolean;
  className?: string;
  onStatusChange?: (enabled: boolean) => void;
}

export default function AutoDistributionToggle({
  compact = false,
  className = '',
  onStatusChange,
}: AutoDistributionToggleProps) {
  const [enabled, setEnabled] = useState<boolean | null>(null);
  const [loading, setLoading] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [pendingAction, setPendingAction] = useState<'enable' | 'disable' | null>(null);

  const fetchStatus = async () => {
    try {
      const res = await fetch('/api/admin/leads/auto-distribution');
      const data = await res.json();
      if (data.success) {
        setEnabled(data.enabled);
        if (onStatusChange) onStatusChange(data.enabled);
      }
    } catch {
      // Silent fallback
    }
  };

  useEffect(() => {
    fetchStatus();
  }, []);

  const handleToggleClick = () => {
    if (loading || enabled === null) return;
    const nextState = !enabled;
    setPendingAction(nextState ? 'enable' : 'disable');
    setShowConfirmModal(true);
  };

  const confirmToggle = async () => {
    if (pendingAction === null) return;
    setLoading(true);
    setShowConfirmModal(false);

    try {
      const res = await fetch('/api/admin/leads/auto-distribution', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          enabled: pendingAction === 'enable',
        }),
      });
      const data = await res.json();
      if (data.success) {
        setEnabled(data.enabled);
        toast.success(
          data.enabled
            ? '🟢 Central Auto Lead Routing is now ACTIVE for Meta & Website leads!'
            : '⏸️ Central Auto Lead Routing is now PAUSED!'
        );
        if (onStatusChange) onStatusChange(data.enabled);
      } else {
        toast.error(data.error || 'Failed to update auto-distribution setting');
      }
    } catch {
      toast.error('Network error updating setting');
    } finally {
      setLoading(false);
    }
  };

  if (enabled === null) {
    return (
      <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-gray-200 bg-white text-xs text-gray-400 ${className}`}>
        <RefreshCw size={13} className="animate-spin text-[#C9A227]" />
        <span>Loading...</span>
      </div>
    );
  }

  return (
    <>
      {/* Sleek Central Switch Banner */}
      <div className={`bg-white rounded-2xl p-4 border border-[#C9A227]/30 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${className}`}>
        <div className="flex items-center gap-3.5">
          <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shadow-md shrink-0 ${
            enabled
              ? 'bg-gradient-to-tr from-[#0E6228] to-[#107C41] text-white'
              : 'bg-gradient-to-tr from-amber-600 to-amber-700 text-white'
          }`}>
            <Zap size={22} className={enabled ? 'animate-pulse' : ''} />
          </div>
          <div>
            <div className="flex items-center gap-2.5 flex-wrap">
              <h4 className="text-sm font-extrabold text-[#1A1800]">
                Central Lead Distribution Router
              </h4>
              <span className={`text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full flex items-center gap-1 shadow-xs ${
                enabled
                  ? 'bg-[#D4F2DE] text-[#0E6228] border border-[#107C41]/30'
                  : 'bg-amber-100 text-amber-900 border border-amber-300'
              }`}>
                <span className={`w-1.5 h-1.5 rounded-full ${enabled ? 'bg-[#0E6228] animate-ping' : 'bg-amber-700'}`}></span>
                {enabled ? 'Auto-Assign: Active' : 'Auto-Assign: Paused'}
              </span>
              <span className="text-[10px] font-bold text-[#8B6914] bg-amber-50 px-2 py-0.5 rounded-lg border border-amber-200">
                Meta Ads + Website Enquiries
              </span>
            </div>
            <p className="text-xs text-[#7A7560] mt-0.5">
              {enabled
                ? 'Incoming Website & Meta Ads leads are automatically routed to active sales agents.'
                : 'Distribution is stopped. Leads arriving during pause remain safely in DB and won\'t be back-assigned.'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5 shrink-0">
          <button
            onClick={handleToggleClick}
            disabled={loading}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-black transition-all shadow-md cursor-pointer ${
              enabled
                ? 'bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-300 hover:scale-[1.02]'
                : 'bg-gradient-to-r from-[#D4AF37] via-[#C9A227] to-[#B38715] text-[#1A1800] hover:brightness-105 hover:scale-[1.02] active:scale-[0.98]'
            }`}
          >
            {loading ? <RefreshCw size={15} className="animate-spin text-[#C9A227]" /> : enabled ? <Pause size={15} /> : <Play size={15} />}
            <span>{enabled ? 'Pause Auto Lead Routing' : 'Turn ON Auto Lead Routing'}</span>
          </button>
        </div>
      </div>

      {/* Confirmation Modal */}
      {showConfirmModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-stone-200 space-y-4">
            <div className="flex items-center gap-3">
              <div className={`w-11 h-11 rounded-2xl flex items-center justify-center shadow-md shrink-0 ${
                pendingAction === 'enable' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-800'
              }`}>
                {pendingAction === 'enable' ? <Play size={20} /> : <Pause size={20} />}
              </div>
              <div>
                <h3 className="text-base font-extrabold text-[#1A1800]">
                  {pendingAction === 'enable' ? 'Turn ON Auto Lead Routing?' : 'Pause Auto Lead Routing?'}
                </h3>
                <p className="text-xs text-gray-500">
                  Controls live automatic routing for Website &amp; Meta Ads leads.
                </p>
              </div>
            </div>

            <div className="p-3.5 rounded-2xl bg-gray-50 border border-gray-100 text-xs text-gray-600 leading-relaxed">
              {pendingAction === 'enable' ? (
                <div className="space-y-2">
                  <p>
                    Turning this <strong>ON</strong> will start automatically routing all fresh incoming leads (Website &amp; Meta Ads) to active agents based on their priority weights.
                  </p>
                  <p className="text-amber-800 font-semibold bg-amber-50 p-2 rounded-lg border border-amber-200 text-[11px]">
                    ℹ️ Note: Leads that arrived while paused will stay safely in your database and will NOT be back-assigned. Only fresh leads from this moment onwards will be distributed.
                  </p>
                </div>
              ) : (
                <div className="space-y-2">
                  <p>
                    Turning this <strong>OFF</strong> will stop assigning leads to agents.
                  </p>
                  <p className="text-gray-500 text-[11px]">
                    All incoming leads from Meta and Website will continue to be safely stored in the database without going into agent queues.
                  </p>
                </div>
              )}
            </div>

            <div className="flex items-center gap-2.5 pt-2">
              <button
                onClick={() => setShowConfirmModal(false)}
                className="flex-1 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold rounded-xl text-xs transition-all cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={confirmToggle}
                className={`flex-1 py-2.5 font-bold rounded-xl text-xs shadow-md transition-all cursor-pointer ${
                  pendingAction === 'enable'
                    ? 'bg-gradient-to-r from-emerald-600 to-emerald-700 text-white hover:brightness-105'
                    : 'bg-gradient-to-r from-amber-600 to-amber-700 text-white hover:brightness-105'
                }`}
              >
                {pendingAction === 'enable' ? 'Yes, Turn ON' : 'Yes, Pause Routing'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
