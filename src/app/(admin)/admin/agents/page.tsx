'use client';

import React, { useState, useEffect } from 'react';
import { 
  Users, Plus, Trash2, Loader2, User, Lock, Eye, EyeOff, 
  ToggleLeft, ToggleRight, CheckCircle2, XCircle, Mail, Hash, 
  ChevronDown, ChevronUp, BarChart2, Pencil, X, Copy, Check, Key, 
  RefreshCw, ShieldCheck, MapPin
} from 'lucide-react';
import toast from 'react-hot-toast';

interface Agent {
  _id: string;
  name: string;
  username: string;
  employee_id: string;
  plainPassword?: string;
  isActive: boolean;
  allowRemotePunchIn?: boolean;
  createdAt: string;
}

export default function AgentsPage() {
  const [agents, setAgents] = useState<Agent[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [form, setForm] = useState({ name: '', username: '', password: '', employee_id: '' });
  const [strategy, setStrategy] = useState('manual');
  const [strategyLoading, setStrategyLoading] = useState(false);

  const [expandedAgent, setExpandedAgent] = useState<string | null>(null);
  const [agentStats, setAgentStats] = useState<any>(null);
  const [statsLoading, setStatsLoading] = useState(false);

  // Edit modal state
  const [editAgent, setEditAgent] = useState<Agent | null>(null);
  const [editForm, setEditForm] = useState({ 
    name: '', 
    username: '', 
    employee_id: '', 
    currentPassword: '', 
    newPassword: '',
    allowRemotePunchIn: false,
  });
  const [editSubmitting, setEditSubmitting] = useState(false);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showEditPassword, setShowEditPassword] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  useEffect(() => { 
    fetchAgents(); 
    fetchStrategy();
  }, []);

  const fetchAgents = async (isManual = false) => {
    if (isManual) toast.loading('Refreshing agents...', { id: 'refresh-agents' });
    setLoading(true);
    try {
      const res = await fetch('/api/admin/agents');
      const data = await res.json();
      if (data.success) {
        setAgents(data.data);
        if (isManual) toast.success('Agents list updated', { id: 'refresh-agents' });
      } else {
        if (isManual) toast.error('Failed to load agents', { id: 'refresh-agents' });
      }
    } catch { 
      if (isManual) toast.error('Failed to load agents', { id: 'refresh-agents' }); 
    }
    finally { setLoading(false); }
  };

  const fetchStrategy = async () => {
    try {
      const res = await fetch('/api/admin/leads/strategy');
      const data = await res.json();
      if (data.success) setStrategy(data.strategy);
    } catch {}
  };

  const updateStrategy = async (newStrategy: string) => {
    setStrategyLoading(true);
    try {
      const res = await fetch('/api/admin/leads/strategy', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ strategy: newStrategy })
      });
      const data = await res.json();
      if (data.success) {
        setStrategy(newStrategy);
        toast.success('Assignment Strategy Updated');
      } else {
        toast.error('Failed to update strategy');
      }
    } catch {
      toast.error('Server error');
    } finally {
      setStrategyLoading(false);
    }
  };

  const handleExpandRow = async (agentId: string) => {
    if (expandedAgent === agentId) {
      setExpandedAgent(null);
      return;
    }
    setExpandedAgent(agentId);
    setStatsLoading(true);
    setAgentStats(null);
    try {
      const res = await fetch(`/api/admin/agents/stats?agentId=${agentId}`);
      const data = await res.json();
      if (data.success) {
        setAgentStats({ stats: data.stats, recentLeads: data.recentLeads });
      } else {
        toast.error('Failed to load stats');
      }
    } catch {
      toast.error('Network error');
    } finally {
      setStatsLoading(false);
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const res = await fetch('/api/admin/agents', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (data.success) {
        toast.success('Agent created successfully!');
        setForm({ name: '', username: '', password: '', employee_id: '' });
        setShowForm(false);
        fetchAgents();
      } else {
        toast.error(data.error || 'Failed to create agent');
      }
    } catch { toast.error('Server error'); }
    finally { setSubmitting(false); }
  };

  const handleToggle = async (id: string, isActive: boolean) => {
    try {
      await fetch('/api/admin/agents', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, isActive: !isActive }),
      });
      setAgents(prev => prev.map(a => a._id === id ? { ...a, isActive: !isActive } : a));
      toast.success(isActive ? 'Agent deactivated' : 'Agent activated');
    } catch { toast.error('Failed to update'); }
  };

  const handleDelete = async (id: string, name: string) => {
    if (!window.confirm(`Delete agent "${name}"? This cannot be undone.`)) return;
    try {
      const res = await fetch(`/api/admin/agents?id=${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) {
        setAgents(prev => prev.filter(a => a._id !== id));
        toast.success('Agent deleted');
      }
    } catch { toast.error('Failed to delete'); }
  };

  const openEdit = (agent: Agent, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditAgent(agent);
    setEditForm({ 
      name: agent.name, 
      username: agent.username, 
      employee_id: agent.employee_id, 
      currentPassword: agent.plainPassword || '',
      newPassword: '',
      allowRemotePunchIn: !!agent.allowRemotePunchIn,
    });
    setShowCurrentPassword(false);
    setShowEditPassword(false);
  };

  const handleCopy = (text: string, id: string) => {
    if (!text) {
      toast.error('No password available');
      return;
    }
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    toast.success('Password copied to clipboard!');
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleEditSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editAgent) return;
    setEditSubmitting(true);
    try {
      const res = await fetch('/api/admin/agents', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: editAgent._id,
          name: editForm.name,
          username: editForm.username,
          employee_id: editForm.employee_id,
          newPassword: editForm.newPassword,
          allowRemotePunchIn: editForm.allowRemotePunchIn,
        }),
      });
      const data = await res.json();
      if (data.success) {
        const updatedAgent = data.data;
        const finalPassword = updatedAgent?.plainPassword || (editForm.newPassword.trim() ? editForm.newPassword.trim() : editForm.currentPassword);

        toast.success('Agent details & access updated successfully!');
        
        setAgents(prev => prev.map(a => a._id === editAgent._id ? { 
          ...a, 
          name: editForm.name, 
          username: editForm.username, 
          employee_id: editForm.employee_id,
          plainPassword: finalPassword,
          allowRemotePunchIn: editForm.allowRemotePunchIn,
        } : a));

        setEditForm(f => ({
          ...f,
          currentPassword: finalPassword,
          newPassword: '',
        }));

        setEditAgent(null);
      } else {
        toast.error(data.error || 'Failed to update');
      }
    } catch { toast.error('Server error'); }
    finally { setEditSubmitting(false); }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">

      {/* ── Edit Agent Modal ── */}
      {editAgent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setEditAgent(null)} />
          <div className="relative bg-white rounded-3xl shadow-2xl w-full max-w-md p-7 animate-in zoom-in-95 duration-200">
            {/* Modal Header */}
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-[#C9A227] to-[#B8860B] flex items-center justify-center text-white font-black text-lg shadow-sm">
                  {editAgent.name.charAt(0).toUpperCase()}
                </div>
                <div>
                  <h3 className="font-extrabold text-[#1A1800] text-base">Edit Agent</h3>
                  <p className="text-xs text-gray-400 font-semibold">Update details for {editAgent.name}</p>
                </div>
              </div>
              <button onClick={() => setEditAgent(null)} className="p-2 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-xl transition-all cursor-pointer">
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleEditSave} className="space-y-4">
              {/* Name */}
              <div className="relative">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-wider mb-1 block">Full Name *</label>
                <div className="relative">
                  <User size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                  <input
                    className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm font-semibold text-gray-800 placeholder:text-gray-400 focus:border-[#C9A227] focus:ring-1 focus:ring-[#C9A227] outline-none transition-all"
                    value={editForm.name}
                    onChange={e => setEditForm(f => ({ ...f, name: e.target.value }))}
                    required
                    placeholder="Full Name"
                  />
                </div>
              </div>

              {/* Email */}
              <div>
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-wider mb-1 block">Email (Login ID)</label>
                <div className="relative">
                  <Mail size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                  <input
                    type="email"
                    className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm font-semibold text-gray-800 placeholder:text-gray-400 focus:border-[#C9A227] focus:ring-1 focus:ring-[#C9A227] outline-none transition-all"
                    value={editForm.username}
                    onChange={e => setEditForm(f => ({ ...f, username: e.target.value.toLowerCase().trim() }))}
                    required
                    placeholder="Email"
                  />
                </div>
              </div>

              {/* Employee ID */}
              <div>
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-wider mb-1 block">Employee ID</label>
                <div className="relative">
                  <Hash size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                  <input
                    className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm font-semibold text-gray-800 placeholder:text-gray-400 focus:border-[#C9A227] focus:ring-1 focus:ring-[#C9A227] outline-none transition-all"
                    value={editForm.employee_id}
                    onChange={e => setEditForm(f => ({ ...f, employee_id: e.target.value.trim() }))}
                    required
                    placeholder="Employee ID"
                  />
                </div>
              </div>

              {/* ── Password Management Section ── */}
              <div className="bg-amber-50/50 border border-[#C9A227]/30 rounded-2xl p-4 space-y-3 mt-1 shadow-sm">
                <div className="flex items-center justify-between pb-1 border-b border-amber-100">
                  <div className="flex items-center gap-1.5">
                    <Key size={14} className="text-[#C9A227]" />
                    <span className="text-[11px] font-black uppercase text-[#1A1800] tracking-wider">
                      Password Management
                    </span>
                  </div>
                  <span className="text-[9px] bg-amber-100 text-[#B8860B] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">
                    Synced with App
                  </span>
                </div>

                {/* Current Password Display */}
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-[10px] font-black text-gray-500 uppercase tracking-wider block">
                      Current Password
                    </label>
                    {editForm.currentPassword && (
                      <button
                        type="button"
                        onClick={() => handleCopy(editForm.currentPassword, 'modal-current')}
                        className="text-[10px] font-bold text-amber-700 hover:text-amber-900 flex items-center gap-1 transition-colors cursor-pointer"
                      >
                        {copiedId === 'modal-current' ? <Check size={11} className="text-emerald-600" /> : <Copy size={11} />}
                        {copiedId === 'modal-current' ? 'Copied' : 'Copy'}
                      </button>
                    )}
                  </div>
                  <div className="relative">
                    <Lock size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                    <input
                      type={showCurrentPassword ? 'text' : 'password'}
                      readOnly
                      value={editForm.currentPassword || ''}
                      placeholder={editForm.currentPassword ? '' : 'No password saved yet'}
                      className="w-full pl-10 pr-12 py-2.5 bg-white border border-amber-200 rounded-xl text-sm font-bold text-gray-900 focus:outline-none select-all cursor-default"
                    />
                    {editForm.currentPassword && (
                      <button
                        type="button"
                        onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-700 transition-colors p-1 cursor-pointer"
                        title={showCurrentPassword ? 'Hide password' : 'Show password'}
                      >
                        {showCurrentPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                      </button>
                    )}
                  </div>
                </div>

                {/* New Password Input */}
                <div>
                  <label className="text-[10px] font-black text-gray-500 uppercase tracking-wider mb-1 block">
                    New Password <span className="text-gray-400 normal-case font-medium">(Leave blank to keep current)</span>
                  </label>
                  <div className="relative">
                    <Lock size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                    <input
                      type={showEditPassword ? 'text' : 'password'}
                      className="w-full pl-10 pr-12 py-2.5 bg-white border border-gray-200 rounded-xl text-sm font-semibold text-gray-800 placeholder:text-gray-400 focus:border-[#C9A227] focus:ring-1 focus:ring-[#C9A227] outline-none transition-all"
                      value={editForm.newPassword}
                      onChange={e => setEditForm(f => ({ ...f, newPassword: e.target.value }))}
                      placeholder="Enter new password to update"
                    />
                    <button
                      type="button"
                      onClick={() => setShowEditPassword(!showEditPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-700 transition-colors p-1 cursor-pointer"
                      title={showEditPassword ? 'Hide password' : 'Show password'}
                    >
                      {showEditPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                    </button>
                  </div>
                </div>
              </div>

              {/* ── Remote / Emergency Punch-In Access ── */}
              <div className="bg-emerald-50/70 border border-emerald-200/80 rounded-2xl p-4 flex items-center justify-between gap-3 shadow-sm">
                <div>
                  <div className="flex items-center gap-1.5">
                    <MapPin size={15} className="text-emerald-700" />
                    <span className="text-xs font-black text-emerald-900 uppercase tracking-wider">
                      Remote / Emergency Punch-In
                    </span>
                  </div>
                  <p className="text-[11px] text-emerald-700/80 font-medium mt-0.5">
                    Allow {editForm.name || 'this agent'} to punch in & login from any location (bypasses office geofence)
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setEditForm(f => ({ ...f, allowRemotePunchIn: !f.allowRemotePunchIn }))}
                  className={`p-2 rounded-xl border transition-all cursor-pointer ${
                    editForm.allowRemotePunchIn
                      ? 'bg-emerald-500 text-white border-emerald-600 shadow-sm'
                      : 'bg-white text-gray-400 border-gray-200 hover:bg-gray-50'
                  }`}
                  title={editForm.allowRemotePunchIn ? 'Remote access enabled' : 'Strict office only'}
                >
                  {editForm.allowRemotePunchIn ? <ToggleRight size={22} /> : <ToggleLeft size={22} />}
                </button>
              </div>

              {/* Actions */}
              <div className="flex justify-end gap-3 pt-3">
                <button type="button" onClick={() => setEditAgent(null)} className="px-5 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-600 font-bold rounded-xl text-sm transition-all cursor-pointer">
                  Cancel
                </button>
                <button type="submit" disabled={editSubmitting} className="px-6 py-2.5 bg-gradient-to-r from-[#C9A227] via-[#F0D060] to-[#B8860B] text-[#1A1800] font-bold rounded-xl text-sm shadow-md hover:scale-[1.02] transition-all disabled:opacity-60 flex items-center gap-2 cursor-pointer">
                  {editSubmitting ? <Loader2 size={15} className="animate-spin" /> : <Pencil size={15} />}
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#1A1800] font-[var(--font-playfair)] tracking-tight">
            Team Management
          </h1>
          <p className="text-xs text-gray-400 font-bold uppercase tracking-wider mt-1.5">
            Manage calling agents, login credentials and lead assignment strategy
          </p>
        </div>
        
        <div className="flex items-center gap-3">
          <button
            onClick={() => fetchAgents(true)}
            className="p-2.5 bg-white border border-gray-200 text-gray-600 hover:text-[#C9A227] hover:border-[#C9A227] rounded-xl shadow-sm transition-all cursor-pointer flex items-center gap-2 text-xs font-bold"
            title="Refresh agents list"
          >
            <RefreshCw size={15} className={loading ? 'animate-spin text-[#C9A227]' : ''} />
            <span className="hidden sm:inline">Refresh</span>
          </button>

          <div className="flex items-center gap-3 bg-white border border-gray-100 rounded-xl p-2 shadow-sm shrink-0">
            <span className="text-[10px] font-black uppercase text-gray-400 tracking-wider pl-2">Lead Assignment:</span>
            <select
              value={strategy}
              onChange={(e) => updateStrategy(e.target.value)}
              disabled={strategyLoading}
              className="bg-gray-50 border border-gray-200 text-xs font-bold text-[#1A1800] py-2 px-3 rounded-lg focus:border-[#C9A227] focus:ring-1 focus:ring-[#C9A227] outline-none cursor-pointer disabled:opacity-50"
            >
              <option value="manual">Manual / Unassigned</option>
              <option value="round_robin">Round-Robin</option>
              <option value="least_assigned">Least Assigned</option>
            </select>
          </div>
          
          <button
            onClick={() => setShowForm(!showForm)}
            className="inline-flex items-center gap-2 px-5 py-3 bg-gradient-to-r from-[#C9A227] via-[#F0D060] to-[#B8860B] text-[#1A1800] font-bold rounded-xl shadow-md hover:scale-[1.02] transition-all text-sm h-full cursor-pointer"
          >
            <Plus size={16} />
            Add Agent
          </button>
        </div>
      </div>

      {/* Stats Summary Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
        <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-50 border border-amber-100 flex items-center justify-center text-amber-600 shrink-0">
            <Users size={20} />
          </div>
          <div>
            <p className="text-[10px] font-black text-gray-400 uppercase tracking-wider">Total Agents</p>
            <h3 className="text-2xl font-black text-gray-900">{agents.length}</h3>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-emerald-100 shadow-sm flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600 shrink-0">
            <CheckCircle2 size={20} />
          </div>
          <div>
            <p className="text-[10px] font-black text-emerald-600 uppercase tracking-wider">Active Agents</p>
            <h3 className="text-2xl font-black text-emerald-700">{agents.filter(a => a.isActive).length}</h3>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gray-50 border border-gray-200 flex items-center justify-center text-gray-500 shrink-0">
            <ShieldCheck size={20} />
          </div>
          <div>
            <p className="text-[10px] font-black text-gray-400 uppercase tracking-wider">Lead Strategy</p>
            <h3 className="text-base font-black text-gray-800 capitalize mt-1">
              {strategy.replace('_', ' ')}
            </h3>
          </div>
        </div>
      </div>

      {/* Create Agent Form */}
      {showForm && (
        <div className="bg-white rounded-3xl border border-[#C9A227]/30 shadow-lg p-6 ring-1 ring-[#C9A227]/20">
          <h2 className="text-lg font-extrabold text-[#1A1800] mb-5 flex items-center gap-2">
            <Plus size={18} className="text-[#C9A227]" /> New Calling Agent
          </h2>
          <form onSubmit={handleCreate} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="relative">
              <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"><User size={16} /></div>
              <input
                className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm font-semibold text-gray-800 placeholder:text-gray-400 focus:border-[#C9A227] focus:ring-1 focus:ring-[#C9A227] outline-none transition-all"
                placeholder="Full Name *"
                value={form.name}
                onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                required
              />
            </div>
            <div className="relative">
              <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"><Mail size={16} /></div>
              <input
                type="email"
                className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm font-semibold text-gray-800 placeholder:text-gray-400 focus:border-[#C9A227] focus:ring-1 focus:ring-[#C9A227] outline-none transition-all"
                placeholder="Email (Gmail) *"
                value={form.username}
                onChange={e => setForm(f => ({ ...f, username: e.target.value.toLowerCase().trim() }))}
                required
              />
            </div>
            <div className="relative">
              <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"><Lock size={16} /></div>
              <input
                type={showPassword ? 'text' : 'password'}
                className="w-full pl-10 pr-12 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm font-semibold text-gray-800 placeholder:text-gray-400 focus:border-[#C9A227] focus:ring-1 focus:ring-[#C9A227] outline-none transition-all"
                placeholder="Password *"
                value={form.password}
                onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
                required
              />
              <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-700">
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
            
            <div className="relative">
              <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"><Hash size={16} /></div>
              <input
                className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm font-semibold text-gray-800 placeholder:text-gray-400 focus:border-[#C9A227] focus:ring-1 focus:ring-[#C9A227] outline-none transition-all"
                placeholder="Employee ID *"
                value={form.employee_id}
                onChange={e => setForm(f => ({ ...f, employee_id: e.target.value.trim() }))}
                required
              />
            </div>

            <div className="sm:col-span-2 flex justify-end gap-3">
              <button type="button" onClick={() => setShowForm(false)} className="px-5 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-600 font-bold rounded-xl text-sm transition-all cursor-pointer">
                Cancel
              </button>
              <button type="submit" disabled={submitting} className="px-6 py-2.5 bg-gradient-to-r from-[#C9A227] via-[#F0D060] to-[#B8860B] text-[#1A1800] font-bold rounded-xl text-sm shadow-md hover:scale-[1.02] transition-all disabled:opacity-60 flex items-center gap-2 cursor-pointer">
                {submitting ? <Loader2 size={16} className="animate-spin" /> : <Plus size={16} />}
                Create Agent
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Agents Table */}
      <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-gray-50 flex items-center justify-between">
          <h2 className="text-base font-extrabold text-gray-800 flex items-center gap-2">
            <Users size={18} className="text-[#C9A227]" /> Team Members
          </h2>
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-gray-500 bg-gray-100 px-3 py-1 rounded-full">
              {agents.length} Agents
            </span>
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="animate-spin text-[#C9A227]" size={32} />
          </div>
        ) : agents.length === 0 ? (
          <div className="text-center py-16 text-gray-400">
            <Users size={40} className="mx-auto mb-3 opacity-30" />
            <p className="font-bold text-sm">No agents yet. Add your first calling agent.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="bg-gray-50 text-[10px] font-black text-gray-400 uppercase border-b border-gray-100">
                  <th className="py-4 px-6">Agent</th>
                  <th className="py-4 px-4">Email</th>
                  <th className="py-4 px-4">Employee ID</th>
                  <th className="py-4 px-4">Status</th>
                  <th className="py-4 px-4">Created</th>
                  <th className="py-4 px-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {agents.map(agent => (
                  <React.Fragment key={agent._id}>
                    <tr 
                      className={`transition-colors cursor-pointer ${expandedAgent === agent._id ? 'bg-[#FFFEF5]' : 'hover:bg-amber-50/20'}`}
                      onClick={() => handleExpandRow(agent._id)}
                    >
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-full bg-gradient-to-br from-[#C9A227] to-[#B8860B] flex items-center justify-center text-white font-black text-sm shrink-0 shadow-sm">
                            {agent.name.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <div className="flex items-center gap-1.5">
                              <span className="font-bold text-gray-800">{agent.name}</span>
                              {expandedAgent === agent._id ? <ChevronUp size={14} className="text-gray-400" /> : <ChevronDown size={14} className="text-gray-400" />}
                            </div>
                          </div>
                        </div>
                      </td>

                      <td className="py-4 px-4 font-mono text-gray-500 font-semibold">{agent.username}</td>
                      
                      <td className="py-4 px-4">
                        <span className="font-mono text-gray-600 font-bold text-[11px] bg-gray-100 rounded px-2.5 py-1 border border-gray-200">
                          {agent.employee_id}
                        </span>
                      </td>

                      {/* Account Status */}
                      <td className="py-4 px-4">
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${
                          agent.isActive ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-red-50 text-red-600 border border-red-200'
                        }`}>
                          {agent.isActive ? <CheckCircle2 size={10} /> : <XCircle size={10} />}
                          {agent.isActive ? 'Active' : 'Inactive'}
                        </span>
                      </td>

                      <td className="py-4 px-4 text-gray-400 font-semibold">
                        {new Date(agent.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                      </td>

                      <td className="py-4 px-6 text-right">
                        <div className="flex items-center justify-end gap-2">
                          {/* Edit Button */}
                          <button
                            onClick={(e) => openEdit(agent, e)}
                            className="p-2 rounded-xl border border-blue-100 bg-blue-50 text-blue-500 hover:bg-blue-100 hover:border-blue-300 transition-all cursor-pointer"
                            title="Edit Agent & Password"
                          >
                            <Pencil size={15} />
                          </button>
                          <button
                            onClick={(e) => { e.stopPropagation(); handleToggle(agent._id, agent.isActive); }}
                            className={`p-2 rounded-xl border transition-all cursor-pointer ${
                              agent.isActive
                                ? 'border-emerald-200 bg-emerald-50 text-emerald-600 hover:bg-red-50 hover:border-red-200 hover:text-red-500'
                                : 'border-gray-200 bg-gray-50 text-gray-400 hover:bg-emerald-50 hover:border-emerald-200 hover:text-emerald-600'
                            }`}
                            title={agent.isActive ? 'Deactivate' : 'Activate'}
                          >
                            {agent.isActive ? <ToggleRight size={16} /> : <ToggleLeft size={16} />}
                          </button>
                          <button
                            onClick={(e) => { e.stopPropagation(); handleDelete(agent._id, agent.name); }}
                            className="p-2 rounded-xl border border-gray-100 text-gray-400 hover:border-red-200 hover:bg-red-50 hover:text-red-500 transition-all cursor-pointer"
                            title="Delete Agent"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                    
                    {/* Expandable Quick Performance Details */}
                    {expandedAgent === agent._id && (
                      <tr className="bg-[#FFFEF5]">
                        <td colSpan={6} className="p-0 border-b border-gray-100">
                          <div className="p-6">
                            <h4 className="text-xs font-black uppercase text-gray-800 tracking-wider flex items-center gap-2 mb-3">
                              <BarChart2 size={16} className="text-[#C9A227]" /> Quick Calling Performance
                            </h4>
                            
                            {statsLoading ? (
                              <div className="flex justify-center py-6">
                                <Loader2 className="animate-spin text-[#C9A227]" size={24} />
                              </div>
                            ) : agentStats ? (
                              <>
                              <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                                <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm text-center">
                                  <p className="text-[10px] font-black uppercase text-gray-400">Total Leads</p>
                                  <h5 className="text-xl font-black text-gray-900 mt-1">{agentStats.stats.totalAssigned}</h5>
                                </div>
                                <div className="bg-white p-4 rounded-2xl border border-blue-100 shadow-sm text-center">
                                  <p className="text-[10px] font-black uppercase text-blue-500">Calls Today</p>
                                  <h5 className="text-xl font-black text-blue-700 mt-1">{agentStats.stats.callsMadeToday}</h5>
                                </div>
                                <div className="bg-white p-4 rounded-2xl border border-amber-100 shadow-sm text-center">
                                  <p className="text-[10px] font-black uppercase text-amber-500">Follow-Ups</p>
                                  <h5 className="text-xl font-black text-amber-700 mt-1">{agentStats.stats.followUps}</h5>
                                </div>
                                <div className="bg-white p-4 rounded-2xl border border-emerald-100 shadow-sm text-center">
                                  <p className="text-[10px] font-black uppercase text-emerald-500">Interested</p>
                                  <h5 className="text-xl font-black text-emerald-700 mt-1">{agentStats.stats.interested}</h5>
                                </div>
                                <div className="bg-white p-4 rounded-2xl border border-indigo-100 shadow-sm text-center">
                                  <p className="text-[10px] font-black uppercase text-indigo-500">Visits Done</p>
                                  <h5 className="text-xl font-black text-indigo-700 mt-1">{agentStats.stats.visitsDone}</h5>
                                </div>
                              </div>
                              
                              {/* Mini Table for Recent Leads */}
                              {agentStats.recentLeads && agentStats.recentLeads.length > 0 && (
                                <div className="mt-6 border border-gray-100 rounded-xl overflow-hidden bg-white">
                                  <div className="bg-gray-50 px-4 py-2 border-b border-gray-100 flex items-center justify-between">
                                    <h5 className="text-[10px] font-black uppercase text-gray-500 tracking-wider">Recently Assigned Leads (Last 50)</h5>
                                  </div>
                                  <div className="overflow-x-auto max-h-60 overflow-y-auto">
                                    <table className="w-full text-left text-xs">
                                      <thead className="bg-white sticky top-0 border-b border-gray-100 shadow-sm z-10">
                                        <tr className="text-[10px] font-black uppercase text-gray-400">
                                          <th className="px-4 py-3">Lead Name</th>
                                          <th className="px-4 py-3">Phone</th>
                                          <th className="px-4 py-3">Source / Interest</th>
                                          <th className="px-4 py-3">Status</th>
                                        </tr>
                                      </thead>
                                      <tbody className="divide-y divide-gray-50">
                                        {agentStats.recentLeads.map((lead: any) => (
                                          <tr key={lead._id} className="hover:bg-gray-50 transition-colors">
                                            <td className="px-4 py-2 font-bold text-gray-800">{lead.name}</td>
                                            <td className="px-4 py-2 text-gray-600">{lead.phone}</td>
                                            <td className="px-4 py-2 text-gray-500 truncate max-w-[150px]" title={lead.propertyInterest || lead.source}>
                                              {lead.propertyInterest || lead.source}
                                            </td>
                                            <td className="px-4 py-2">
                                              <span className={`px-2 py-0.5 rounded uppercase text-[9px] font-black tracking-wider ${
                                                lead.disposition === 'new' ? 'bg-amber-100 text-amber-700' :
                                                lead.disposition === 'interested' ? 'bg-emerald-100 text-emerald-700' :
                                                'bg-gray-100 text-gray-600'
                                              }`}>
                                                {lead.disposition.replace('_', ' ')}
                                              </span>
                                            </td>
                                          </tr>
                                        ))}
                                      </tbody>
                                    </table>
                                  </div>
                                </div>
                              )}
                              </>
                            ) : (
                              <p className="text-sm text-gray-500 text-center py-4">Stats not available.</p>
                            )}
                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
