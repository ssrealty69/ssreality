'use client';

import { useState, useEffect } from 'react';
import { Lock, Eye, EyeOff, Check, Edit2, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';

export default function PasscodeManager() {
  const [passcode, setPasscode] = useState('******');
  const [isEditing, setIsEditing] = useState(false);
  const [tempPasscode, setTempPasscode] = useState('');
  const [showPasscode, setShowPasscode] = useState(false);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  // Load the current passcode on mount
  useEffect(() => {
    fetchPasscode();
  }, []);

  const fetchPasscode = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/settings');
      const result = await res.json();
      if (result.success) {
        setPasscode(result.passcode);
        setTempPasscode(result.passcode);
      } else {
        toast.error('Failed to load passcode');
      }
    } catch (err) {
      console.error('Error fetching passcode:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    // Validate passcode is exactly 6 digits
    if (!/^\d{6}$/.test(tempPasscode)) {
      toast.error('Passcode must be exactly 6 numeric digits');
      return;
    }

    setSaving(true);
    try {
      const res = await fetch('/api/admin/settings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ passcode: tempPasscode }),
      });

      const result = await res.json();
      if (result.success) {
        setPasscode(result.passcode);
        setIsEditing(false);
        toast.success('Passcode updated successfully!');
      } else {
        toast.error(result.error || 'Failed to update passcode');
      }
    } catch (err) {
      console.error('Error saving passcode:', err);
      toast.error('Server error updating passcode');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center gap-2 bg-[#C9A227]/5 border border-[#C9A227]/25 px-4 py-2.5 rounded-xl text-xs text-gray-500">
        <Loader2 size={14} className="animate-spin text-[#C9A227]" />
        <span>Loading portal settings...</span>
      </div>
    );
  }

  return (
    <div className="bg-[#FAF9F5] border border-[#C9A227]/30 p-3.5 rounded-2xl flex items-center justify-between gap-4 max-w-sm w-full md:w-auto shadow-[0_4px_20px_rgba(201,162,39,0.04)] relative overflow-hidden group">
      <div className="absolute inset-0 bg-[#C9A227]/5 opacity-20 group-hover:opacity-100 transition-opacity pointer-events-none" />
      
      <div className="flex items-center gap-3 relative z-10">
        <div className="w-9 h-9 rounded-xl bg-[#C9A227]/10 border border-[#C9A227]/20 flex items-center justify-center text-[#C9A227] flex-shrink-0">
          <Lock size={16} />
        </div>
        <div className="text-left">
          <p className="text-[10px] text-[#C9A227] font-extrabold uppercase tracking-widest leading-none">floorview passcode</p>
          
          {isEditing ? (
            <div className="flex items-center gap-1.5 mt-1">
              <input
                type="text"
                maxLength={6}
                value={tempPasscode}
                onChange={(e) => {
                  const val = e.target.value;
                  if (val === '' || (/^\d+$/.test(val) && val.length <= 6)) {
                    setTempPasscode(val);
                  }
                }}
                className="w-20 px-2 py-0.5 text-sm font-extrabold bg-white border border-[#C9A227] text-gray-900 rounded-md focus:outline-none focus:ring-1 focus:ring-[#C9A227]/30 text-center tracking-widest"
                placeholder="123456"
              />
            </div>
          ) : (
            <p className="text-sm font-extrabold text-gray-800 mt-1 font-mono tracking-wider">
              {showPasscode ? passcode : '••••••'}
            </p>
          )}
        </div>
      </div>

      <div className="flex items-center gap-2 relative z-10">
        {!isEditing && (
          <button
            onClick={() => setShowPasscode(!showPasscode)}
            className="p-1.5 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer"
            title={showPasscode ? 'Hide passcode' : 'Show passcode'}
          >
            {showPasscode ? <EyeOff size={14} /> : <Eye size={14} />}
          </button>
        )}
        
        {isEditing ? (
          <div className="flex items-center gap-1">
            <button
              onClick={handleSave}
              disabled={saving || tempPasscode.length !== 6}
              className="p-1.5 bg-[#C9A227] text-[#1A1800] hover:bg-[#B8860B] rounded-lg transition-colors cursor-pointer disabled:opacity-50 flex items-center justify-center"
              title="Save passcode"
            >
              {saving ? <Loader2 size={14} className="animate-spin" /> : <Check size={14} className="stroke-[2.5]" />}
            </button>
            <button
              onClick={() => {
                setIsEditing(false);
                setTempPasscode(passcode);
              }}
              disabled={saving}
              className="px-2 py-1 text-[10px] text-gray-500 hover:bg-gray-200 border border-gray-200 rounded-lg transition-colors cursor-pointer font-bold"
              title="Cancel"
            >
              Cancel
            </button>
          </div>
        ) : (
          <button
            onClick={() => {
              setTempPasscode(passcode);
              setIsEditing(true);
            }}
            className="flex items-center gap-1 bg-[#C9A227]/10 border border-[#C9A227]/30 hover:border-[#C9A227] text-gray-700 hover:text-gray-900 font-bold px-3 py-1.5 rounded-xl text-xs transition-all shadow-sm cursor-pointer select-none"
            title="Change passcode"
          >
            <Edit2 size={12} className="text-[#C9A227]" />
            <span>Update</span>
          </button>
        )}
      </div>
    </div>
  );
}
