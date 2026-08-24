'use client';

import { useState, useEffect, useMemo } from 'react';
import { Briefcase, Search, Trash2, MessageSquare, Loader2, Calendar, FileDown, User, Phone, CheckCircle2 } from 'lucide-react';
import toast from 'react-hot-toast';

interface JobApplication {
  _id: string;
  name: string;
  phone: string;
  age: string;
  position: string;
  resumeUrl?: string;
  status?: string;
  isRead?: boolean;
  createdAt: string;
}

export default function AdminJobsPage() {
  const [applications, setApplications] = useState<JobApplication[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [deletingId, setDeletingId] = useState<string | null>(null);

  // Fetch candidates on mount
  useEffect(() => {
    fetchApplications();
  }, []);

  const fetchApplications = () => {
    setLoading(true);
    fetch('/api/admin/jobs')
      .then((res) => {
        if (res.ok) return res.json();
        throw new Error('Failed to load applications');
      })
      .then((data) => {
        if (data.success && data.data) {
          setApplications(data.data);
          // Mark applications as read so unread counter badge clears
          fetch('/api/admin/jobs/mark-read', { method: 'POST' }).catch(() => {});
        }
      })
      .catch((err) => {
        console.error(err);
        toast.error('Error fetching job applications from database');
      })
      .finally(() => {
        setLoading(false);
      });
  };

  // Handle application deletion
  const handleDeleteApplication = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this job application?')) return;
    setDeletingId(id);

    try {
      const res = await fetch(`/api/admin/jobs?id=${id}`, {
        method: 'DELETE',
      });
      const data = await res.json();

      if (data.success) {
        toast.success('Application deleted successfully');
        setApplications((prev) => prev.filter((app) => app._id !== id));
      } else {
        toast.error(data.error || 'Failed to delete application');
      }
    } catch (err) {
      console.error(err);
      toast.error('Server error deleting job application');
    } finally {
      setDeletingId(null);
    }
  };

  // Filter list by search query (Name or Position)
  const filteredApplications = useMemo(() => {
    if (!searchQuery.trim()) return applications;
    const query = searchQuery.toLowerCase().trim();
    return applications.filter((app) => {
      return (
        app.name.toLowerCase().includes(query) ||
        app.position.toLowerCase().includes(query) ||
        app.phone.includes(query)
      );
    });
  }, [applications, searchQuery]);

  if (loading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center space-y-4">
        <Loader2 className="animate-spin text-[#C9A227]" size={36} />
        <p className="text-xs font-extrabold text-gray-400 uppercase tracking-widest animate-pulse">Loading talent database...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-500 font-sans">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#1A1800] font-[var(--font-playfair)] tracking-tight">Job Applications</h1>
          <p className="text-xs text-gray-400 font-bold uppercase tracking-wider mt-1.5">Manage candidates and talent acquisition ops</p>
        </div>
      </div>

      {/* Stats Counter Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6 max-w-2xl">
        <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm flex items-center gap-4">
          <div className="w-10 h-10 rounded-xl bg-amber-50 border border-amber-100 flex items-center justify-center text-amber-600">
            <Briefcase size={20} />
          </div>
          <div>
            <p className="text-[10px] font-black text-gray-400 uppercase tracking-wider">Total Applicants</p>
            <h3 className="text-2xl font-black text-gray-900 mt-0.5">{applications.length}</h3>
          </div>
        </div>
        <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm flex items-center gap-4">
          <div className="w-10 h-10 rounded-xl bg-green-50 border border-green-100 flex items-center justify-center text-green-600">
            <CheckCircle2 size={20} />
          </div>
          <div>
            <p className="text-[10px] font-black text-gray-400 uppercase tracking-wider">Verified Uploads</p>
            <h3 className="text-2xl font-black text-gray-900 mt-0.5">
              {applications.filter(app => app.resumeUrl?.startsWith('http')).length}
            </h3>
          </div>
        </div>
      </div>

      {/* Main Applicants Table Card */}
      <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
        {/* Card Header & Controls */}
        <div className="p-6 border-b border-gray-50 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <h2 className="text-sm font-extrabold text-gray-800 uppercase tracking-wider">Candidate Registry</h2>
          
          {/* Search Inputs */}
          <div className="relative w-full sm:max-w-xs group">
            <input
              type="text"
              placeholder="Search by candidate or role..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-gray-50/50 border border-gray-200 focus:border-[#C9A227] rounded-xl focus:bg-white text-xs font-bold text-gray-800 placeholder:text-gray-400/80 outline-none transition-all"
            />
            <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400">
              <Search size={14} />
            </div>
          </div>
        </div>

        {/* Dynamic Table Area */}
        <div className="overflow-x-auto">
          {filteredApplications.length > 0 ? (
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-gray-50 text-[10px] font-black text-gray-400 uppercase border-b border-gray-100">
                  <th className="py-4 px-6">Applied Date</th>
                  <th className="py-4 px-4">Candidate Name</th>
                  <th className="py-4 px-4">Contact Number</th>
                  <th className="py-4 px-4">Position Applied</th>
                  <th className="py-4 px-4">Age Profile</th>
                  <th className="py-4 px-4">Resume File</th>
                  <th className="py-4 px-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50 font-sans">
                {filteredApplications.map((app) => (
                  <tr key={app._id} className="hover:bg-[#FFFEF5]/50 transition-colors">
                    <td className="py-4 px-6 font-semibold text-gray-500 whitespace-nowrap">
                      <span className="flex items-center gap-1.5">
                        <Calendar size={13} className="text-[#C9A227] shrink-0" />
                        {new Date(app.createdAt).toLocaleDateString('en-IN', {
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric'
                        })}
                      </span>
                    </td>
                    <td className="py-4 px-4 font-extrabold text-gray-800 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <span>{app.name}</span>
                        {(app.isRead === false || app.status === 'new') && (
                          <span className="bg-red-500 text-white text-[9px] font-black uppercase px-1.5 py-0.5 rounded-full shadow-sm">
                            New
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="py-4 px-4 text-gray-600 font-bold whitespace-nowrap">
                      <span className="flex items-center gap-1.5">
                        <Phone size={12} className="text-[#C9A227] shrink-0" />
                        {app.phone}
                      </span>
                    </td>
                    <td className="py-4 px-4 font-black text-[#1A1800] uppercase tracking-wider">{app.position}</td>
                    <td className="py-4 px-4 font-bold text-gray-700">{app.age} Years</td>
                    <td className="py-4 px-4">
                      {app.resumeUrl?.startsWith('http') ? (
                        <a
                          href={`/api/admin/download?url=${encodeURIComponent(app.resumeUrl)}&name=${encodeURIComponent(app.name)}`}
                          download={`Resume-${app.name.replace(/\s+/g, '_')}`}
                          className="inline-flex items-center gap-1 px-2.5 py-1 bg-amber-50 hover:bg-amber-100 text-[#B8860B] hover:text-[#C9A227] border border-amber-200/50 rounded-lg text-[10px] font-black uppercase tracking-wider transition-all cursor-pointer shadow-sm"
                          title="Download Resume Document"
                        >
                          <FileDown size={12} className="stroke-[2.5]" />
                          Download PDF
                        </a>
                      ) : (
                        <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded border ${
                          app.resumeUrl?.includes('Email')
                            ? 'bg-blue-50 text-blue-600 border-blue-100'
                            : 'bg-red-50 text-red-500 border-red-100'
                        }`}>
                          {app.resumeUrl || 'Not Provided'}
                        </span>
                      )}
                    </td>
                    <td className="py-4 px-6 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <a
                          href={`https://wa.me/91${app.phone}?text=Hi ${app.name}, we received your application for the ${app.position} role at SS Realty and would like to schedule an interview. Please let us know your availability.`}
                          target="_blank"
                          className="p-2 border border-gray-100 hover:border-emerald-500 hover:bg-emerald-50 text-gray-400 hover:text-emerald-600 rounded-xl transition-all cursor-pointer"
                          title="Contact Candidate on WhatsApp"
                        >
                          <MessageSquare size={14} />
                        </a>
                        <button
                          onClick={() => handleDeleteApplication(app._id)}
                          disabled={deletingId === app._id}
                          className="p-2 border border-gray-100 hover:border-red-500 hover:bg-red-50 text-gray-400 hover:text-red-600 rounded-xl transition-all cursor-pointer"
                          title="Clear Application"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div className="py-16 text-center text-gray-400 text-sm font-semibold flex flex-col items-center justify-center space-y-2">
              <Briefcase size={32} className="text-[#C9A227] opacity-40" />
              <span>No candidates matching search criteria.</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
