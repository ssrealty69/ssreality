'use client';

import { useState, useEffect } from 'react';
import { Home, Users, Briefcase, FileText, Loader2, ArrowRight, Phone, MessageSquare, ExternalLink } from 'lucide-react';
import Link from 'next/link';
import toast from 'react-hot-toast';

interface Counts {
  properties: number;
  blogs: number;
  leads: number;
  jobs: number;
}

interface PreviewLead {
  _id: string;
  name: string;
  phone: string;
  subject: string;
  createdAt: string;
}

interface PreviewJob {
  _id: string;
  name: string;
  position: string;
  phone: string;
  createdAt: string;
}

export default function AdminDashboard() {
  const [counts, setCounts] = useState<Counts | null>(null);
  const [previews, setPreviews] = useState<{ leads: PreviewLead[]; jobs: PreviewJob[] } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/admin/stats')
      .then((res) => {
        if (res.ok) return res.json();
        throw new Error('Failed to fetch dashboard stats');
      })
      .then((data) => {
        if (data.success) {
          setCounts(data.counts);
          setPreviews(data.previews);
        }
      })
      .catch((err) => {
        console.error(err);
        toast.error('Failed to load dashboard metrics');
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  if (loading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center space-y-4">
        <Loader2 className="animate-spin text-[#C9A227]" size={36} />
        <p className="text-xs font-extrabold text-gray-400 uppercase tracking-widest animate-pulse">Loading live analytics...</p>
      </div>
    );
  }

  const stats = [
    { name: 'Total Properties', value: counts?.properties || 0, icon: Home, color: 'text-blue-600', bg: 'bg-blue-50 border-blue-100', href: '/admin/properties' },
    { name: 'Total Blogs', value: counts?.blogs || 0, icon: FileText, color: 'text-purple-600', bg: 'bg-purple-50 border-purple-100', href: '/admin/blogs' },
    { name: 'Total Leads', value: counts?.leads || 0, icon: Users, color: 'text-emerald-600', bg: 'bg-emerald-50 border-emerald-100', href: '/admin/leads' },
    { name: 'Job Applications', value: counts?.jobs || 0, icon: Briefcase, color: 'text-amber-600', bg: 'bg-amber-50 border-amber-100', href: '/admin/jobs' },
  ];

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-[#1A1800] font-[var(--font-playfair)] tracking-tight">Dashboard Overview</h1>
        <p className="text-xs text-gray-400 font-bold uppercase tracking-wider mt-1.5">Real-time business telemetry and incoming forms</p>
      </div>
      
      {/* 4 Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <Link 
              key={stat.name} 
              href={stat.href}
              className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:border-[#C9A227]/40 hover:shadow-md transition-all duration-300 group flex items-center justify-between"
            >
              <div>
                <p className="text-xs font-black text-gray-400 uppercase tracking-widest mb-2">{stat.name}</p>
                <p className="text-3xl font-black text-gray-900 leading-none">{stat.value}</p>
              </div>
              <div className={`p-3.5 rounded-xl border ${stat.bg} group-hover:scale-110 transition-transform duration-300 flex items-center justify-center`}>
                <Icon size={22} className={stat.color} />
              </div>
            </Link>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Recent Leads Preview widget (2/3 width) */}
        <div className="lg:col-span-2 bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden flex flex-col">
          <div className="px-6 py-5 border-b border-gray-50 flex items-center justify-between">
            <div>
              <h2 className="text-md font-extrabold text-gray-800 flex items-center gap-2">
                <Users size={18} className="text-[#C9A227]" />
                Recent Enquiries & Leads
              </h2>
              <p className="text-[10px] text-gray-400 font-bold uppercase mt-1 tracking-wider">Latest contact and loan submissions</p>
            </div>
            <Link 
              href="/admin/leads" 
              className="text-xs font-extrabold text-[#C9A227] hover:text-[#1A1800] flex items-center gap-1 transition-colors"
            >
              View All
              <ArrowRight size={14} />
            </Link>
          </div>

          <div className="flex-1 overflow-x-auto">
            {previews?.leads && previews.leads.length > 0 ? (
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-gray-50/50 text-[10px] font-black text-gray-400 uppercase border-b border-gray-100">
                    <th className="py-3.5 px-6">Name</th>
                    <th className="py-3.5 px-4">Phone</th>
                    <th className="py-3.5 px-4">Subject</th>
                    <th className="py-3.5 px-6 text-right">Connect</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50 font-sans">
                  {previews.leads.map((lead) => (
                    <tr key={lead._id} className="hover:bg-[#FFFEF5]/50 transition-colors">
                      <td className="py-3.5 px-6 font-bold text-gray-800">{lead.name}</td>
                      <td className="py-3.5 px-4 text-gray-500 font-semibold">{lead.phone}</td>
                      <td className="py-3.5 px-4">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-black uppercase ${
                          lead.subject.includes('EMI') 
                            ? 'bg-amber-50 text-amber-700 border border-amber-100' 
                            : 'bg-blue-50 text-blue-700 border border-blue-100'
                        }`}>
                          {lead.subject.includes('EMI') ? 'Loan Lead' : 'General'}
                        </span>
                      </td>
                      <td className="py-3.5 px-6 text-right">
                        <a 
                          href={`https://wa.me/91${lead.phone}`}
                          target="_blank"
                          className="inline-flex items-center gap-1 text-[11px] font-black text-emerald-600 hover:text-emerald-700 border border-emerald-100 bg-emerald-50/50 hover:bg-emerald-50 px-2.5 py-1 rounded-lg transition-colors cursor-pointer"
                        >
                          <MessageSquare size={12} />
                          WhatsApp
                        </a>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <div className="py-12 text-center text-gray-400 text-xs font-semibold">
                No leads received yet.
              </div>
            )}
          </div>
        </div>

        {/* Recent Job Applications widget (1/3 width) */}
        <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden flex flex-col">
          <div className="px-6 py-5 border-b border-gray-50 flex items-center justify-between">
            <div>
              <h2 className="text-md font-extrabold text-gray-800 flex items-center gap-2">
                <Briefcase size={18} className="text-[#C9A227]" />
                Recent Applicants
              </h2>
              <p className="text-[10px] text-gray-400 font-bold uppercase mt-1 tracking-wider">Latest recruitment submissions</p>
            </div>
            <Link 
              href="/admin/jobs" 
              className="text-xs font-extrabold text-[#C9A227] hover:text-[#1A1800] flex items-center gap-1 transition-colors"
            >
              View All
              <ArrowRight size={14} />
            </Link>
          </div>

          <div className="flex-1 p-5 divide-y divide-gray-50 overflow-y-auto">
            {previews?.jobs && previews.jobs.length > 0 ? (
              previews.jobs.map((job) => (
                <div key={job._id} className="py-3.5 first:pt-0 last:pb-0 flex items-center justify-between gap-3">
                  <div className="space-y-1">
                    <h4 className="font-bold text-xs text-gray-800 leading-tight">{job.name}</h4>
                    <p className="text-[10px] text-[#C9A227] font-black uppercase tracking-wider">{job.position}</p>
                  </div>
                  <a 
                    href={`https://wa.me/91${job.phone}`}
                    target="_blank"
                    className="p-2 border border-gray-100 hover:border-emerald-500 hover:bg-emerald-50 rounded-xl text-gray-400 hover:text-emerald-600 transition-all cursor-pointer flex-shrink-0"
                    title="Connect with Candidate"
                  >
                    <Phone size={14} />
                  </a>
                </div>
              ))
            ) : (
              <div className="py-12 text-center text-gray-400 text-xs font-semibold">
                No job applications received yet.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
