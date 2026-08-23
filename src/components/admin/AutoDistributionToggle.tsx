'use client';

import { useState, useEffect } from 'react';
import { Zap, Pause, Play, RefreshCw, Trash2, CheckCircle2, AlertCircle } from 'lucide-react';
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
  const [distributeNow, setDistributeNow] = useState(false);

  const fetchStatus = async () => {
    try {
      const res = await fetch('/api/admin/leads/auto-distribution');
      const data = await res.json();
      if (data.success) {
        setEnabled(data.enabled);
        if (onStatusChange) onStatusChange(data.enabled);
      }
    } catch {
      // Silent error fallback
    }
  };

  useEffect(() => {
    fetchStatus();
  }, []);

  const handleToggleClick = () => {
    if (loading || enabled === null) return;
    const nextState = !enabled;
    setPendingAction(nextState ? 'enable' : 'disable');
    setDistributeNow(nextState);
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
          triggerPendingDistribution: distributeNow,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setEnabled(data.enabled);
        toast.success(
          data.enabled
            ? '🟢 Auto Lead Distribution is now ACTIVE!'
            : '⏸️ Auto Lead Distribution has been PAUSED!'
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
        <span>Loading status...</span>
      </div>
    );
  }

  if (compact) {
    return (
      <>
        <button
          onClick={handleToggleClick}
          disabled={loading}
          className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold border transition-all shadow-sm shrink-0 cursor-pointer ${
            enabled
              ? 'bg-[#EAF7EE] text-[#0E6228] border-[#107C41]/30 hover:border-[#107C41] hover:bg-[#D4F2DE]'
              : 'bg-amber-50/80 text-[#8B6914] border-amber-300/60 hover:bg-amber-100 hover:border-amber-400'
          } ${className}`}
          title={
            enabled
              ? 'Automatic Lead Distribution is ACTIVE. Click to Pause.'
              : 'Automatic Lead Distribution is PAUSED. Click to Turn ON.'
          }
        >
          <span className="relative flex h-2 w-2">
            {enabled && (
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#107C41] opacity-75"></span>
            )}
            <span className={`relative inline-flex rounded-full h-2 w-2 ${enabled ? 'bg-[#107C41]' : 'bg-amber-500'}`}></span>
          </span>
          <span>{enabled ? 'Auto-Assign: ON' : 'Auto-Assign: OFF'}</span>
        </button>

        {/* Confirmation Modal */}
        {showConfirmModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in">
            <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-stone-200 space-y-4">
              <div className="flex items-center gap-3">
                <div className={`w-11 h-11 rounded-2xl flex items-center justify-center shadow-md ${
                  pendingAction === 'enable' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-800'
                }`}>
                  {pendingAction === 'enable' ? <Play size={20} /> : <Pause size={20} />}
                </div>
                <div>
                  <h3 className="text-base font-extrabold text-[#1A1800]">
                    {pendingAction === 'enable' ? 'Enable Auto Lead Distribution?' : 'Pause Auto Lead Distribution?'}
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
                      Turning this <strong>ON</strong> will automatically distribute incoming leads to active team agents based on priority slabs and weights.
                    </p>
                    <label className="flex items-center gap-2 mt-2 pt-2 border-t border-gray-200 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={distributeNow}
                        onChange={(e) => setDistributeNow(e.target.checked)}
                        className="rounded text-[#C9A227] focus:ring-[#C9A227] h-4 w-4"
                      />
                      <span className="text-[11px] font-bold text-[#1A1800]">
                        Distribute pending unassigned leads immediately
                      </span>
                    </label>
                  </div>
                ) : (
                  <p>
                    Turning this <strong>OFF</strong> will stop auto-assigning leads to agents. New leads will still be securely stored in the database for later manual or automatic assignment.
                  </p>
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
                  {pendingAction === 'enable' ? 'Yes, Turn ON' : 'Yes, Pause Distribution'}
                </button>
              </div>
            </div>
          </div>
        )}
      </>
    );
  }

  // Full Banner Switch Component
  return (
    <>
      <div className={`bg-white rounded-2xl p-4 border border-[#C9A227]/30 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${className}`}>
        <div className="flex items-center gap-3">
          <div className={`w-11 h-11 rounded-2xl flex items-center justify-center shadow-md shrink-0 ${
            enabled
              ? 'bg-gradient-to-tr from-[#0E6228] to-[#107C41] text-white'
              : 'bg-gradient-to-tr from-amber-600 to-amber-700 text-white'
          }`}>
            <Zap size={22} className={enabled ? 'animate-pulse' : ''} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h4 className="text-sm font-extrabold text-[#1A1800]">
                Automatic Lead Routing Engine
              </h4>
              <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-full ${
                enabled
                  ? 'bg-[#D4F2DE] text-[#0E6228] border border-[#107C41]/30'
                  : 'bg-amber-100 text-amber-900 border border-amber-300'
              }`}>
                {enabled ? '● Active' : '⏸ Paused'}
              </span>
            </div>
            <p className="text-xs text-[#7A7560] mt-0.5">
              {enabled
                ? 'Website inquiries and Meta Ads leads are automatically routed to sales agents in real-time.'
                : 'Auto-distribution is paused. Leads are being saved securely in the database without assigning.'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5 shrink-0">
          <button
            onClick={handleToggleClick}
            disabled={loading}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all shadow-md cursor-pointer ${
              enabled
                ? 'bg-amber-100 hover:bg-amber-200 text-amber-900 border border-amber-300'
                : 'bg-gradient-to-r from-[#D4AF37] via-[#C9A227] to-[#B38715] text-[#1A1800] hover:brightness-105 active:scale-[0.98]'
            }`}
          >
            {enabled ? <Pause size={15} /> : <Play size={15} />}
            <span>{enabled ? 'Pause Auto-Distribution' : 'Turn ON Auto-Distribution'}</span>
          </button>
        </div>
      </div>

      {/* Confirmation Modal */}
      {showConfirmModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-stone-200 space-y-4">
            <div className="flex items-center gap-3">
              <div className={`w-11 h-11 rounded-2xl flex items-center justify-center shadow-md ${
                pendingAction === 'enable' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-800'
              }`}>
                {pendingAction === 'enable' ? <Play size={20} /> : <Pause size={20} />}
              </div>
              <div>
                <h3 className="text-base font-extrabold text-[#1A1800]">
                  {pendingAction === 'enable' ? 'Enable Auto Lead Distribution?' : 'Pause Auto Lead Distribution?'}
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
                    Turning this <strong>ON</strong> will automatically distribute incoming leads to active team agents based on priority slabs and weights.
                  </p>
                  <label className="flex items-center gap-2 mt-2 pt-2 border-t border-gray-200 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={distributeNow}
                      onChange={(e) => setDistributeNow(e.target.checked)}
                      className="rounded text-[#C9A227] focus:ring-[#C9A227] h-4 w-4"
                    />
                    <span className="text-[11px] font-bold text-[#1A1800]">
                      Distribute pending unassigned leads immediately
                    </span>
                  </label>
                </div>
              ) : (
                <p>
                  Turning this <strong>OFF</strong> will stop auto-assigning leads to agents. New leads will still be securely stored in the database for later manual or automatic assignment.
                </p>
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
                {pendingAction === 'enable' ? 'Yes, Turn ON' : 'Yes, Pause Distribution'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
