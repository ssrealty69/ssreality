'use client';

import { useState, useEffect, useMemo } from 'react';
import {
  Users, Search, Trash2, MessageSquare, Loader2, Calendar,
  MapPin, Briefcase, FileText, CheckCircle2, FileDown, Home, ExternalLink
} from 'lucide-react';
import toast from 'react-hot-toast';
import * as XLSX from 'xlsx';

interface Lead {
  _id: string;
  name: string;
  email: string;
  phone: string;
  subject: string;
  message: string;
  propertyId?: string;
  propertyTitle?: string;
  createdAt: string;
}

interface AiLead {
  _id: string;
  name: string;
  phone: string;
  email?: string;
  location?: string;
  propertyType?: string;
  budget?: string;
  message?: string;
  source: string;
  status: string;
  createdAt: string;
}

interface PropertyEnquiry {
  _id: string;
  name: string;
  phone: string;
  requirement: string;
  propertyId: string;
  propertyTitle: string;
  propertyUrl: string;
  status: 'new' | 'contacted' | 'closed';
  createdAt: string;
}

export default function AdminLeadsPage() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [propertyEnquiries, setPropertyEnquiries] = useState<PropertyEnquiry[]>([]);
  const [aiLeads, setAiLeads] = useState<AiLead[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<'general' | 'loan' | 'property' | 'brochure'>('general');
  const [deletingId, setDeletingId] = useState<string | null>(null);

  useEffect(() => {
    fetchAll();
  }, []);

  const fetchAll = async () => {
    setLoading(true);
    try {
      const [leadsRes, enquiriesRes, aiLeadsRes] = await Promise.all([
        fetch('/api/admin/leads'),
        fetch('/api/admin/property-enquiries'),
        fetch('/api/admin/ai-leads'),
      ]);

      if (leadsRes.ok) {
        const d = await leadsRes.json();
        if (d.success) setLeads(d.data);
      }

      if (enquiriesRes.ok) {
        const d = await enquiriesRes.json();
        if (d.success) setPropertyEnquiries(d.data);
      }

      if (aiLeadsRes.ok) {
        const d = await aiLeadsRes.json();
        if (d.success) setAiLeads(d.data);
      }
    } catch (err) {
      console.error(err);
      toast.error('Error fetching leads data');
    } finally {
      setLoading(false);
    }
  };

  // Parse EMI Home Loan structured text fields
  const parseLoanMessage = (message: string) => {
    const lines = message.split('\n');
    const extract = (label: string) => {
      const line = lines.find(l => l.includes(label));
      if (!line) return 'N/A';
      return line.split(':')[1]?.trim() || 'N/A';
    };
    return {
      amount: extract('Required Amount'),
      pincode: extract('Area Pincode'),
      employment: extract('Employment'),
      propertyStatus: extract('Property Status'),
      income: extract('Monthly Income'),
      calculatedEmi: extract('Calculated EMI'),
    };
  };

  // Categorize contact leads into general vs loan
  const categorizedLeads = useMemo(() => {
    const general: Lead[] = [];
    const loan: Lead[] = [];
    leads.forEach((lead) => {
      const isLoan =
        lead.subject.toLowerCase().includes('emi') ||
        lead.subject.toLowerCase().includes('home loan') ||
        lead.message.includes('Home Loan Enquiry Details:');
      if (isLoan) loan.push(lead);
      else general.push(lead);
    });
    return { general, loan };
  }, [leads]);

  // Categorize property enquiries into general property vs brochure
  const categorizedEnquiries = useMemo(() => {
    const property: PropertyEnquiry[] = [];
    const brochure: PropertyEnquiry[] = [];
    propertyEnquiries.forEach((enq) => {
      if (enq.requirement && enq.requirement.includes('Brochure Download')) {
        brochure.push(enq);
      } else {
        property.push(enq);
      }
    });
    return { property, brochure };
  }, [propertyEnquiries]);

  const stats = useMemo(() => ({
    total: leads.length + propertyEnquiries.length,
    general: categorizedLeads.general.length,
    loan: categorizedLeads.loan.length,
    property: categorizedEnquiries.property.length,
    brochure: categorizedEnquiries.brochure.length,
  }), [leads, categorizedLeads, categorizedEnquiries]);

  // Delete contact lead
  const handleDeleteLead = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this lead?')) return;
    setDeletingId(id);
    try {
      const res = await fetch(`/api/admin/leads?id=${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) {
        toast.success('Lead deleted successfully');
        setLeads(prev => prev.filter(l => l._id !== id));
      } else {
        toast.error(data.error || 'Failed to delete lead');
      }
    } catch (err) {
      console.error(err);
      toast.error('Server error deleting lead');
    } finally {
      setDeletingId(null);
    }
  };

  // Delete property enquiry
  const handleDeleteEnquiry = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this property enquiry?')) return;
    setDeletingId(id);
    try {
      const res = await fetch(`/api/admin/property-enquiries?id=${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) {
        toast.success('Enquiry deleted successfully');
        setPropertyEnquiries(prev => prev.filter(e => e._id !== id));
      } else {
        toast.error(data.error || 'Failed to delete enquiry');
      }
    } catch (err) {
      console.error(err);
      toast.error('Server error deleting enquiry');
    } finally {
      setDeletingId(null);
    }
  };

  // Filtered leads/enquiries for active tab
  const filteredLeads = useMemo(() => {
    const query = searchQuery.toLowerCase().trim();

    if (activeTab === 'property') {
      if (!query) return categorizedEnquiries.property;
      return categorizedEnquiries.property.filter(e =>
        e.name.toLowerCase().includes(query) ||
        e.phone.includes(query) ||
        e.propertyTitle.toLowerCase().includes(query) ||
        e.requirement?.toLowerCase().includes(query)
      );
    }

    if (activeTab === 'brochure') {
      if (!query) return categorizedEnquiries.brochure;
      return categorizedEnquiries.brochure.filter(e =>
        e.name.toLowerCase().includes(query) ||
        e.phone.includes(query) ||
        e.propertyTitle.toLowerCase().includes(query) ||
        e.requirement?.toLowerCase().includes(query)
      );
    }

    const activeList = activeTab === 'general' ? categorizedLeads.general : categorizedLeads.loan;
    if (!query) return activeList;
    return activeList.filter(lead =>
      lead.name.toLowerCase().includes(query) ||
      lead.phone.includes(query) ||
      lead.email.toLowerCase().includes(query) ||
      lead.subject.toLowerCase().includes(query) ||
      lead.message.toLowerCase().includes(query)
    );
  }, [activeTab, categorizedLeads, searchQuery, propertyEnquiries]);

  // Export to Excel
  const handleDownloadExcel = () => {
    try {
      if (filteredLeads.length === 0) {
        toast.error('No data available to export');
        return;
      }

      let exportData: any[] = [];
      let sheetName = '';
      let fileName = '';

      if (activeTab === 'property') {
        sheetName = 'Property Enquiries';
        fileName = `SS_Realty_Property_Enquiries_${new Date().toISOString().slice(0, 10)}.xlsx`;
        exportData = (filteredLeads as PropertyEnquiry[]).map((e, idx) => ({
          'S.No.': idx + 1,
          'Date': new Date(e.createdAt).toLocaleDateString('en-IN', {
            day: '2-digit', month: '2-digit', year: 'numeric',
          }),
          'Time': new Date(e.createdAt).toLocaleTimeString('en-IN', {
            hour: '2-digit', minute: '2-digit',
          }),
          'Name': e.name,
          'Phone': `+91 ${e.phone}`,
          'Property Name': e.propertyTitle,
          'Property ID': e.propertyId,
          'Property URL': `https://ssrealty.org${e.propertyUrl}`,
          'Requirement / Message': e.requirement || 'Looking for details, price plans and site visit.',
          'Status': e.status,
        }));
      } else if (activeTab === 'brochure') {
        sheetName = 'Brochure Leads';
        fileName = `SS_Realty_Brochure_Leads_${new Date().toISOString().slice(0, 10)}.xlsx`;
        exportData = (filteredLeads as PropertyEnquiry[]).map((e, idx) => {
          let lookingFor = 'N/A';
          if (e.requirement && e.requirement.includes('Looking for:')) {
            lookingFor = e.requirement.split('Looking for:')[1].trim();
          }
          return {
            'S.No.': idx + 1,
            'Date': new Date(e.createdAt).toLocaleDateString('en-IN', {
              day: '2-digit', month: '2-digit', year: 'numeric',
            }),
            'Time': new Date(e.createdAt).toLocaleTimeString('en-IN', {
              hour: '2-digit', minute: '2-digit',
            }),
            'Name': e.name,
            'Phone': `+91 ${e.phone}`,
            'Looking For': lookingFor,
            'Property Name': e.propertyTitle,
            'Property ID': e.propertyId,
            'Status': e.status,
          };
        });
      } else if (activeTab === 'general') {
        sheetName = 'General Queries';
        fileName = `SS_Realty_General_Leads_${new Date().toISOString().slice(0, 10)}.xlsx`;
        exportData = (filteredLeads as Lead[]).map((lead, idx) => ({
          'S.No.': idx + 1,
          'Date': new Date(lead.createdAt).toLocaleDateString('en-IN', {
            day: '2-digit', month: '2-digit', year: 'numeric',
          }),
          'Name': lead.name,
          'Email': lead.email,
          'Phone': lead.phone,
          'Subject': lead.subject,
          'Message': lead.message,
          'Property Name': lead.propertyTitle || 'N/A',
          'Property ID': lead.propertyId || 'N/A',
        }));
        } else {
          sheetName = 'Home Loan Leads';
        fileName = `SS_Realty_Home_Loan_Leads_${new Date().toISOString().slice(0, 10)}.xlsx`;
        exportData = (filteredLeads as Lead[]).map((lead, idx) => {
          const loan = parseLoanMessage(lead.message);
          return {
            'S.No.': idx + 1,
            'Date': new Date(lead.createdAt).toLocaleDateString('en-IN', {
              day: '2-digit', month: '2-digit', year: 'numeric',
            }),
            'Borrower Name': lead.name,
            'Phone': lead.phone,
            'Required Loan Amount': loan.amount,
            'Monthly Income': loan.income,
            'Employment Type': loan.employment,
            'Property Status': loan.propertyStatus,
            'Calculated EMI': loan.calculatedEmi,
            'Area Pincode': loan.pincode,
          };
        });
      }

      const worksheet = XLSX.utils.json_to_sheet(exportData);
      const maxLens = Object.keys(exportData[0]).map((key) => {
        let maxLen = key.length;
        exportData.forEach((row) => {
          const val = row[key] ? String(row[key]) : '';
          if (val.length > maxLen) maxLen = val.length;
        });
        return { wch: Math.min(Math.max(maxLen + 2, 10), 60) };
      });
      worksheet['!cols'] = maxLens;

      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, sheetName);
      XLSX.writeFile(workbook, fileName);
      toast.success(`${sheetName} exported successfully!`);
    } catch (err: any) {
      console.error('Excel Export Error:', err);
      toast.error('Failed to export Excel file');
    }
  };

  if (loading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center space-y-4">
        <Loader2 className="animate-spin text-[#C9A227]" size={36} />
        <p className="text-xs font-extrabold text-gray-400 uppercase tracking-widest animate-pulse">
          Loading leads database...
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-500 font-sans">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#1A1800] font-[var(--font-playfair)] tracking-tight">
            Leads &amp; Enquiries
          </h1>
          <p className="text-xs text-gray-400 font-bold uppercase tracking-wider mt-1.5">
            Manage all customer enquiries and financing requests
          </p>
        </div>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
        <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600 shrink-0">
            <Users size={20} />
          </div>
          <div>
            <p className="text-[10px] font-black text-gray-400 uppercase tracking-wider">Total</p>
            <h3 className="text-2xl font-black text-gray-900 mt-0.5">{stats.total}</h3>
          </div>
        </div>
        <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600 shrink-0">
            <FileText size={20} />
          </div>
          <div>
            <p className="text-[10px] font-black text-gray-400 uppercase tracking-wider">General</p>
            <h3 className="text-2xl font-black text-gray-900 mt-0.5">{stats.general}</h3>
          </div>
        </div>
        <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600 shrink-0">
            <CheckCircle2 size={20} />
          </div>
          <div>
            <p className="text-[10px] font-black text-gray-400 uppercase tracking-wider">Home Loan</p>
            <h3 className="text-2xl font-black text-gray-900 mt-0.5">{stats.loan}</h3>
          </div>
        </div>
        <div className="bg-white rounded-2xl p-5 border border-amber-100 shadow-sm flex items-center gap-3 ring-1 ring-amber-200/60">
          <div className="w-10 h-10 rounded-xl bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-600 shrink-0">
            <Home size={20} />
          </div>
          <div>
            <p className="text-[10px] font-black text-amber-500 uppercase tracking-wider">Property Enquiries</p>
            <h3 className="text-2xl font-black text-gray-900 mt-0.5">{stats.property}</h3>
          </div>
        </div>
        <div className="bg-white rounded-2xl p-5 border border-rose-100 shadow-sm flex items-center gap-3 ring-1 ring-rose-200/60">
          <div className="w-10 h-10 rounded-xl bg-rose-50 border border-rose-200 flex items-center justify-center text-rose-600 shrink-0">
            <FileDown size={20} />
          </div>
          <div>
            <p className="text-[10px] font-black text-rose-500 uppercase tracking-wider">Brochures</p>
            <h3 className="text-2xl font-black text-gray-900 mt-0.5">{stats.brochure}</h3>
          </div>
        </div>
      </div>

      {/* Main Card */}
      <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
        {/* Card Header */}
        <div className="p-6 border-b border-gray-50 flex flex-col md:flex-row md:items-center justify-between gap-4">
          {/* Tabs */}
          <div className="flex bg-gray-50 p-1 border border-gray-100 rounded-xl self-start md:self-auto flex-wrap gap-1">
            <button
              onClick={() => { setActiveTab('general'); setSearchQuery(''); }}
              className={`flex items-center gap-2 py-2 px-3 rounded-lg text-xs font-black uppercase tracking-wider transition-all cursor-pointer ${
                activeTab === 'general'
                  ? 'bg-white text-[#1A1800] shadow-sm'
                  : 'text-gray-400 hover:text-gray-600'
              }`}
            >
              🏢 General ({stats.general})
            </button>
            <button
              onClick={() => { setActiveTab('loan'); setSearchQuery(''); }}
              className={`flex items-center gap-2 py-2 px-3 rounded-lg text-xs font-black uppercase tracking-wider transition-all cursor-pointer ${
                activeTab === 'loan'
                  ? 'bg-white text-[#1A1800] shadow-sm'
                  : 'text-gray-400 hover:text-gray-600'
              }`}
            >
              💰 Loan ({stats.loan})
            </button>
            <button
              onClick={() => { setActiveTab('property'); setSearchQuery(''); }}
              className={`flex items-center gap-2 py-2 px-3 rounded-lg text-xs font-black uppercase tracking-wider transition-all cursor-pointer ${
                activeTab === 'property'
                  ? 'bg-amber-50 text-amber-700 shadow-sm border border-amber-200'
                  : 'text-gray-400 hover:text-amber-600'
              }`}
            >
              🏠 Property Enquiries ({stats.property})
            </button>
            <button
              onClick={() => { setActiveTab('brochure'); setSearchQuery(''); }}
              className={`flex items-center gap-2 py-2 px-3 rounded-lg text-xs font-black uppercase tracking-wider transition-all cursor-pointer ${
                activeTab === 'brochure'
                  ? 'bg-rose-50 text-rose-700 shadow-sm border border-rose-200'
                  : 'text-gray-400 hover:text-rose-600'
              }`}
            >
              📄 Brochures ({stats.brochure})
            </button>
          </div>

          {/* Search + Download */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full md:w-auto">
            <div className="relative w-full sm:max-w-xs">
              <input
                type="text"
                placeholder={
                  activeTab === 'property'
                    ? 'Search by name, phone or property...'
                    : 'Search leads...'
                }
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-gray-50/50 border border-gray-200 focus:border-[#C9A227] rounded-xl focus:bg-white text-xs font-bold text-gray-800 placeholder:text-gray-400/80 outline-none transition-all"
              />
              <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400">
                <Search size={14} />
              </div>
            </div>
            <button
              onClick={handleDownloadExcel}
              className="inline-flex items-center justify-center gap-1.5 px-4 py-2.5 bg-amber-50 hover:bg-amber-100 text-[#B8860B] hover:text-[#C9A227] border border-amber-200/50 rounded-xl text-xs font-black uppercase tracking-wider transition-all cursor-pointer shadow-sm shrink-0"
              title="Download current tab as Excel spreadsheet"
            >
              <FileDown size={14} className="stroke-[2.5]" />
              Export Excel
            </button>
          </div>
        </div>

        {/* Table Area */}
        <div className="overflow-x-auto">
          {(filteredLeads as any[]).length > 0 ? (
            activeTab === 'property' || activeTab === 'brochure' ? (
              /* ─── Property / Brochure Enquiries Table ─── */
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className={`bg-${activeTab === 'brochure' ? 'rose' : 'amber'}-50/60 text-[10px] font-black text-${activeTab === 'brochure' ? 'rose' : 'amber'}-700 uppercase border-b border-${activeTab === 'brochure' ? 'rose' : 'amber'}-100`}>
                    <th className="py-4 px-6">Date &amp; Time</th>
                    <th className="py-4 px-4">Name</th>
                    <th className="py-4 px-4">Phone</th>
                    <th className="py-4 px-4">Property</th>
                    <th className="py-4 px-4">Requirement</th>
                    <th className="py-4 px-6 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {(filteredLeads as PropertyEnquiry[]).map((enq) => {
                    let lookingFor = '';
                    if (activeTab === 'brochure' && enq.requirement && enq.requirement.includes('Looking for:')) {
                      lookingFor = enq.requirement.split('Looking for:')[1].trim();
                    }
                    return (
                    <tr key={enq._id} className={`hover:bg-${activeTab === 'brochure' ? 'rose' : 'amber'}-50/30 transition-colors`}>
                      {/* Date & Time */}
                      <td className="py-4 px-6 font-semibold text-gray-500 whitespace-nowrap">
                        <span className="flex items-center gap-1.5">
                          <Calendar size={13} className="text-[#C9A227] shrink-0" />
                          <span>
                            {new Date(enq.createdAt).toLocaleDateString('en-IN', {
                              day: 'numeric', month: 'short', year: 'numeric',
                            })}
                            <br />
                            <span className="text-[10px] text-gray-400">
                              {new Date(enq.createdAt).toLocaleTimeString('en-IN', {
                                hour: '2-digit', minute: '2-digit',
                              })}
                            </span>
                          </span>
                        </span>
                      </td>

                      {/* Name */}
                      <td className="py-4 px-4 font-bold text-gray-800">
                        {enq.name}
                        {lookingFor && <div className="text-[10px] text-emerald-600 bg-emerald-50 px-2 py-0.5 mt-1 rounded inline-block font-bold border border-emerald-100">Looking for: {lookingFor}</div>}
                      </td>

                      {/* Phone */}
                      <td className="py-4 px-4 whitespace-nowrap">
                        <a
                          href={`tel:+91${enq.phone}`}
                          className="font-semibold text-gray-700 hover:text-[#C9A227] transition-colors"
                        >
                          +91 {enq.phone}
                        </a>
                      </td>

                      {/* Property */}
                      <td className="py-4 px-4 max-w-[200px]">
                        <div className="flex flex-col gap-1">
                          <span className={`text-[8px] font-black text-${activeTab === 'brochure' ? 'rose' : 'amber'}-600 bg-${activeTab === 'brochure' ? 'rose' : 'amber'}-50 border border-${activeTab === 'brochure' ? 'rose' : 'amber'}-200 px-1.5 py-0.5 rounded uppercase tracking-wider w-fit leading-none`}>
                            {activeTab === 'brochure' ? 'Brochure Download' : 'Property Enquiry'}
                          </span>
                          <a
                            href={enq.propertyUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className={`text-[#C9A227] hover:underline font-extrabold text-xs truncate flex items-center gap-1`}
                            title={enq.propertyTitle}
                          >
                            {enq.propertyTitle}
                            <ExternalLink size={10} className="shrink-0" />
                          </a>
                          <span className="text-[9px] font-black text-gray-300 uppercase tracking-widest leading-none">
                            ID: {enq.propertyId.slice(-8)}
                          </span>
                        </div>
                      </td>

                      {/* Requirement */}
                      <td className="py-4 px-4 max-w-xs">
                        <p
                          className="text-gray-500 font-medium leading-relaxed truncate text-xs"
                          title={enq.requirement || '—'}
                        >
                          {enq.requirement || (
                            <span className="text-gray-300 italic">
                              Looking for details, price plans and site visit.
                            </span>
                          )}
                        </p>
                      </td>

                      {/* Actions */}
                      <td className="py-4 px-6 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <a
                            href={`https://wa.me/91${enq.phone}?text=Hi ${encodeURIComponent(enq.name)}, thank you for your enquiry about *${encodeURIComponent(enq.propertyTitle)}* at SS Realty. How can we assist you?`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-2 border border-gray-100 hover:border-emerald-500 hover:bg-emerald-50 text-gray-400 hover:text-emerald-600 rounded-xl transition-all cursor-pointer"
                            title="Reply on WhatsApp"
                          >
                            <MessageSquare size={14} />
                          </a>
                        </div>
                      </td>
                    </tr>
                  )})}
                </tbody>
              </table>
            ) : activeTab === 'general' ? (
              /* ─── General Enquiries Table ─── */
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-gray-50 text-[10px] font-black text-gray-400 uppercase border-b border-gray-100">
                    <th className="py-4 px-6">Submitted Date</th>
                    <th className="py-4 px-4">Name</th>
                    <th className="py-4 px-4">Email</th>
                    <th className="py-4 px-4">Phone</th>
                    <th className="py-4 px-4">Subject</th>
                    <th className="py-4 px-4">Message</th>
                    <th className="py-4 px-4">Property</th>
                    <th className="py-4 px-6 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {(filteredLeads as Lead[]).map((lead) => (
                    <tr key={lead._id} className="hover:bg-[#FFFEF5]/50 transition-colors">
                      <td className="py-4 px-6 font-semibold text-gray-500 whitespace-nowrap">
                        <span className="flex items-center gap-1.5">
                          <Calendar size={13} className="text-[#C9A227] shrink-0" />
                          {new Date(lead.createdAt).toLocaleDateString('en-IN', {
                            day: 'numeric', month: 'short', year: 'numeric',
                          })}
                        </span>
                      </td>
                      <td className="py-4 px-4 font-bold text-gray-800">{lead.name}</td>
                      <td className="py-4 px-4 text-gray-500 font-medium whitespace-nowrap" title={lead.email}>
                        {lead.email && lead.email.length > 5 ? lead.email.substring(0, 5) + '...' : lead.email}
                      </td>
                      <td className="py-4 px-4 text-gray-500 font-semibold whitespace-nowrap">{lead.phone}</td>
                      <td className="py-4 px-4 font-bold text-gray-800 whitespace-nowrap">{lead.subject}</td>
                      <td className="py-4 px-4 max-w-xs">
                        <p className="text-gray-500 font-medium leading-relaxed truncate" title={lead.message}>
                          {lead.message}
                        </p>
                      </td>
                      <td className="py-4 px-4 max-w-[170px]">
                        {lead.propertyId ? (
                          <div className="flex flex-col space-y-1">
                            <span className="text-[8px] font-black text-amber-600 bg-amber-50 border border-amber-100 px-1.5 py-0.5 rounded uppercase block w-fit leading-none tracking-wider">
                              Property Lead
                            </span>
                            <a
                              href={`/properties/${lead.propertyId}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-[#C9A227] hover:underline font-extrabold text-xs truncate block"
                              title={lead.propertyTitle || 'View Property'}
                            >
                              {lead.propertyTitle || `ID: ${lead.propertyId.slice(-6)}`}
                            </a>
                            <span className="text-[8px] font-black text-gray-300 uppercase tracking-widest leading-none">
                              ID: {lead.propertyId.slice(-6)}
                            </span>
                          </div>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 px-1.5 py-0.5 bg-blue-50 text-blue-600 border border-blue-100 text-[8px] font-black rounded uppercase tracking-wider leading-none">
                            General Query
                          </span>
                        )}
                      </td>
                      <td className="py-4 px-6 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <a
                            href={`https://wa.me/91${lead.phone}?text=Hi ${lead.name}, thank you for contacting SS Realty regarding "${lead.subject}". How can we help you today?`}
                            target="_blank"
                            className="p-2 border border-gray-100 hover:border-emerald-500 hover:bg-emerald-50 text-gray-400 hover:text-emerald-600 rounded-xl transition-all cursor-pointer"
                            title="Reply on WhatsApp"
                          >
                            <MessageSquare size={14} />
                          </a>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : activeTab === 'loan' ? (
              /* ─── Home Loan Table ─── */
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-gray-50 text-[10px] font-black text-gray-400 uppercase border-b border-gray-100">
                    <th className="py-4 px-6">Date</th>
                    <th className="py-4 px-4">Name</th>
                    <th className="py-4 px-4">Phone</th>
                    <th className="py-4 px-4">Required Amount</th>
                    <th className="py-4 px-4">Income Details</th>
                    <th className="py-4 px-4">EMI &amp; Status</th>
                    <th className="py-4 px-4">Pincode</th>
                    <th className="py-4 px-6 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {(filteredLeads as Lead[]).map((lead) => {
                    const loan = parseLoanMessage(lead.message);
                    return (
                      <tr key={lead._id} className="hover:bg-[#FFFEF5]/50 transition-colors">
                        <td className="py-4 px-6 font-semibold text-gray-500 whitespace-nowrap">
                          <span className="flex items-center gap-1.5">
                            <Calendar size={13} className="text-[#C9A227] shrink-0" />
                            {new Date(lead.createdAt).toLocaleDateString('en-IN', {
                              day: 'numeric', month: 'short', year: 'numeric',
                            })}
                          </span>
                        </td>
                        <td className="py-4 px-4 font-bold text-gray-800">{lead.name}</td>
                        <td className="py-4 px-4 text-gray-500 font-semibold whitespace-nowrap">{lead.phone}</td>
                        <td className="py-4 px-4 font-extrabold text-gray-900">{loan.amount}</td>
                        <td className="py-4 px-4 space-y-1">
                          <div className="font-bold text-gray-800">Income: {loan.income}/mo</div>
                          <div className="flex items-center gap-1">
                            <Briefcase size={11} className="text-[#C9A227]" />
                            <span className="text-[10px] font-black uppercase text-gray-400">{loan.employment}</span>
                          </div>
                        </td>
                        <td className="py-4 px-4 space-y-1">
                          <div className="font-extrabold text-emerald-600">EMI: {loan.calculatedEmi}/mo</div>
                          <div className="flex items-center gap-1">
                            <CheckCircle2 size={11} className="text-emerald-500" />
                            <span className="text-[10px] font-bold text-gray-400">{loan.propertyStatus}</span>
                          </div>
                        </td>
                        <td className="py-4 px-4">
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-gray-100 text-gray-600 border border-gray-200 text-[10px] font-bold rounded">
                            <MapPin size={10} className="text-[#C9A227]" />
                            {loan.pincode}
                          </span>
                        </td>
                        <td className="py-4 px-6 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <a
                              href={`https://wa.me/91${lead.phone}?text=Hi ${lead.name}, we received your inquiry regarding Home Loan Eligibility check at SS Realty for ₹${loan.amount}. Let's discuss your banking approval!`}
                              target="_blank"
                              className="p-2 border border-gray-100 hover:border-emerald-500 hover:bg-emerald-50 text-gray-400 hover:text-emerald-600 rounded-xl transition-all cursor-pointer"
                              title="Reply on WhatsApp"
                            >
                              <MessageSquare size={14} />
                            </a>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            ) : null
          ) : (
            <div className="py-16 text-center text-gray-400 text-sm font-semibold flex flex-col items-center justify-center space-y-2">
              <Users size={32} className="text-[#C9A227] opacity-40" />
              <span>No matching records found.</span>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
