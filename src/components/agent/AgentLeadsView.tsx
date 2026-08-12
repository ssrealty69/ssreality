'use client';

import { useEffect, useState } from 'react';
import { Loader2, Phone, Calendar, RefreshCcw, Check, MessageSquare, Plus } from 'lucide-react';
import toast from 'react-hot-toast';

export default function AgentLeadsView() {
  const [leads, setLeads] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [selectedLead, setSelectedLead] = useState<any | null>(null);

  // Modal form states
  const [disposition, setDisposition] = useState('new');
  const [notes, setNotes] = useState('');
  const [visitDate, setVisitDate] = useState('');
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    fetchLeads();
  }, [filter]);

  const fetchLeads = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/agent-leads?filter=${filter}`);
      const data = await res.json();
      if (data.success) {
        setLeads(data.data);
      }
    } catch {
      toast.error('Failed to fetch leads');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateDisposition = async (e: React.FormEvent) => {
    e.preventDefault();
    setUpdating(true);
    try {
      const payload: any = { leadId: selectedLead._id, disposition, notes };
      
      if (disposition === 'interested' && visitDate) {
        payload.visitDetails = { date: visitDate };
      }

      const res = await fetch('/api/admin/agent-leads/disposition', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const data = await res.json();

      if (data.success) {
        toast.success('Lead updated successfully!');
        setSelectedLead(null);
        fetchLeads(); 
      } else {
        toast.error(data.error || 'Failed to update lead');
      }
    } catch {
      toast.error('Error updating lead');
    } finally {
      setUpdating(false);
    }
  };

  const openModal = (lead: any) => {
    setSelectedLead(lead);
    setDisposition(lead.disposition || 'new');
    setNotes('');
    setVisitDate(lead.visitDetails?.date ? new Date(lead.visitDetails.date).toISOString().slice(0, 10) : '');
  };

  return (
    <div className="space-y-6">
      {/* Update Modal */}
      {selectedLead && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-3xl shadow-2xl p-6 w-full max-w-md">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Update Call Status</h2>
            <p className="text-xs text-gray-500 mb-6 font-semibold">Updating lead: {selectedLead.name}</p>
            
            <form onSubmit={handleUpdateDisposition} className="space-y-4">
              <div>
                <label className="text-xs font-black uppercase text-gray-400 tracking-wider">Disposition (Status)</label>
                <select
                  value={disposition}
                  onChange={(e) => setDisposition(e.target.value)}
                  className="w-full mt-1 border border-gray-200 rounded-xl p-3 text-sm font-semibold bg-gray-50 outline-none focus:border-[#C9A227] focus:ring-1 focus:ring-[#C9A227]"
                >
                  <option value="new">New</option>
                  <option value="follow_up">Follow Up</option>
                  <option value="interested">Interested (Visit Planned)</option>
                  <option value="visit_done">Visit Done</option>
                  <option value="not_interested">Not Interested</option>
                  <option value="not_reachable">Not Reachable</option>
                  <option value="invalid">Invalid Number</option>
                </select>
              </div>

              {disposition === 'interested' && (
                <div>
                  <label className="text-xs font-black uppercase text-gray-400 tracking-wider">Visit Date</label>
                  <input
                    type="date"
                    value={visitDate}
                    onChange={(e) => setVisitDate(e.target.value)}
                    required
                    className="w-full mt-1 border border-gray-200 rounded-xl p-3 text-sm font-semibold bg-gray-50 outline-none focus:border-[#C9A227]"
                  />
                </div>
              )}

              <div>
                <label className="text-xs font-black uppercase text-gray-400 tracking-wider">Call Notes</label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Enter remarks..."
                  className="w-full mt-1 border border-gray-200 rounded-xl p-3 text-sm font-semibold bg-gray-50 outline-none focus:border-[#C9A227] min-h-[100px]"
                ></textarea>
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setSelectedLead(null)}
                  className="flex-1 py-3 text-sm font-bold text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-xl transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={updating}
                  className="flex-1 py-3 text-sm font-bold text-[#1A1800] bg-gradient-to-r from-[#C9A227] to-[#B8860B] rounded-xl flex items-center justify-center gap-2 shadow-md hover:scale-[1.02] transition-all disabled:opacity-60"
                >
                  {updating ? <Loader2 size={16} className="animate-spin" /> : <Check size={16} />}
                  Save Status
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-[#1A1800] font-[var(--font-playfair)] tracking-tight">My Leads</h1>
          <p className="text-xs text-gray-500 font-medium">Manage and call your assigned leads.</p>
        </div>
        
        <div className="flex items-center gap-2 bg-white border border-gray-100 rounded-xl p-1.5 shadow-sm">
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="bg-gray-50 border border-transparent hover:border-gray-200 text-xs font-bold text-gray-700 py-2 px-4 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#C9A227]/20 transition-all cursor-pointer"
          >
            <option value="all">All Leads</option>
            <option value="new">New Leads</option>
            <option value="follow_up">Follow Up</option>
            <option value="interested">Interested</option>
          </select>
          <button onClick={fetchLeads} className="p-2 bg-gray-50 hover:bg-[#C9A227]/10 text-gray-500 hover:text-[#C9A227] rounded-lg transition-colors">
            <RefreshCcw size={16} />
          </button>
        </div>
      </div>

      {/* List */}
      <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden animate-in fade-in duration-500">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm border-collapse">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100">
                <th className="py-4 px-6 font-black text-[10px] text-gray-400 uppercase tracking-wider">Date Assigned</th>
                <th className="py-4 px-6 font-black text-[10px] text-gray-400 uppercase tracking-wider">Lead Info</th>
                <th className="py-4 px-6 font-black text-[10px] text-gray-400 uppercase tracking-wider">Property/Source</th>
                <th className="py-4 px-6 font-black text-[10px] text-gray-400 uppercase tracking-wider">Status</th>
                <th className="py-4 px-6 font-black text-[10px] text-gray-400 uppercase tracking-wider text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {loading ? (
                <tr>
                  <td colSpan={5} className="py-12 text-center">
                    <Loader2 className="animate-spin text-[#C9A227] mx-auto" size={32} />
                  </td>
                </tr>
              ) : leads.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-12 text-center text-sm font-semibold text-gray-400">
                    No leads found matching your filter.
                  </td>
                </tr>
              ) : (
                leads.map((lead) => (
                  <tr key={lead._id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="py-4 px-6 font-semibold text-gray-500 whitespace-nowrap">
                      <span className="flex items-center gap-1.5">
                        <Calendar size={13} className="text-[#C9A227]" />
                        {new Date(lead.createdAt).toLocaleDateString('en-IN', {
                          day: 'numeric', month: 'short', year: 'numeric'
                        })}
                      </span>
                    </td>
                    <td className="py-4 px-6">
                      <div className="font-bold text-gray-900">{lead.name}</div>
                      <a href={`tel:+91${lead.phone}`} className="text-xs font-semibold text-gray-500 hover:text-[#C9A227] flex items-center gap-1 mt-1">
                        <Phone size={10} /> +91 {lead.phone}
                      </a>
                    </td>
                    <td className="py-4 px-6">
                      {lead.propertyTitle ? (
                        <div>
                          <p className="font-bold text-xs text-[#C9A227]">{lead.propertyTitle}</p>
                          <span className="text-[9px] font-black uppercase text-gray-400 bg-gray-100 px-1.5 py-0.5 rounded mt-1 inline-block">Property Enquiry</span>
                        </div>
                      ) : (
                        <span className="text-[9px] font-black uppercase text-blue-600 bg-blue-50 border border-blue-100 px-1.5 py-0.5 rounded">General Source</span>
                      )}
                    </td>
                    <td className="py-4 px-6">
                      <span className={`inline-block px-2 py-1 text-[10px] font-black uppercase tracking-wider rounded-md border ${
                        lead.disposition === 'new' ? 'bg-amber-50 text-amber-600 border-amber-200' :
                        lead.disposition === 'interested' ? 'bg-emerald-50 text-emerald-600 border-emerald-200' :
                        lead.disposition === 'visit_done' ? 'bg-indigo-50 text-indigo-600 border-indigo-200' :
                        'bg-gray-50 text-gray-600 border-gray-200'
                      }`}>
                        {lead.disposition.replace('_', ' ')}
                      </span>
                      {lead.visitDetails?.date && (
                        <div className="text-[9px] font-bold text-gray-400 mt-1">Visit: {new Date(lead.visitDetails.date).toLocaleDateString()}</div>
                      )}
                    </td>
                    <td className="py-4 px-6 text-right space-x-2">
                      <a
                        href={`https://wa.me/91${lead.phone}?text=Hi ${lead.name}, I'm calling from SS Realty...`}
                        target="_blank"
                        className="inline-flex items-center justify-center w-8 h-8 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-600 transition-colors"
                        title="WhatsApp"
                      >
                        <MessageSquare size={14} />
                      </a>
                      <button
                        onClick={() => openModal(lead)}
                        className="inline-flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#1A1800] text-white hover:bg-[#C9A227] text-xs font-bold transition-all"
                      >
                        <Plus size={14} /> Update
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
