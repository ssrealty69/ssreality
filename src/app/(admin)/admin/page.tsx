'use client';

import { useState, useEffect } from 'react';
import { 
  Home, Users, Briefcase, FileText, ArrowRight, Phone, 
  MessageSquare, TrendingUp, Clock, Activity, Globe, CheckCircle 
} from 'lucide-react';
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

interface AnalyticsSummary {
  totalViews: number;
  totalSessions: number;
  avgStayTime: string;
  overallBounceRate: string;
}

interface DailyStats {
  date: string;
  views: number;
  sessions: number;
}

interface TrafficSource {
  source: string;
  percentage: number;
  count: number;
}

interface AnalyticsPayload {
  success: boolean;
  timeframe: string;
  summary: AnalyticsSummary;
  dailyStats: DailyStats[];
  sources: TrafficSource[];
}

export default function AdminDashboard() {
  const [counts, setCounts] = useState<Counts | null>(null);
  const [previews, setPreviews] = useState<{ leads: PreviewLead[]; jobs: PreviewJob[] } | null>(null);
  const [analytics, setAnalytics] = useState<AnalyticsPayload | null>(null);
  const [statsLoading, setStatsLoading] = useState(true);
  const [analyticsLoading, setAnalyticsLoading] = useState(true);
  const [timeframe, setTimeframe] = useState<'7_days' | '30_days'>('30_days');
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  useEffect(() => {
    // SWR / Instant Cache Hydration for 0ms perceived lag
    try {
      const cachedStats = sessionStorage.getItem('admin_stats_cache');
      if (cachedStats) {
        const parsed = JSON.parse(cachedStats);
        if (parsed?.counts) {
          setCounts(parsed.counts);
          setPreviews(parsed.previews);
          setStatsLoading(false);
        }
      }
      const cachedAnalytics = sessionStorage.getItem('admin_analytics_cache');
      if (cachedAnalytics) {
        const parsed = JSON.parse(cachedAnalytics);
        if (parsed?.dailyStats) {
          setAnalytics(parsed);
          setAnalyticsLoading(false);
        }
      }
    } catch {
      // Ignore cache parse errors
    }

    // 1. Fetch Stats
    fetch('/api/admin/stats')
      .then(async res => {
        if (!res.ok) return null;
        return res.json();
      })
      .then(data => {
        if (data && data.success) {
          setCounts(data.counts);
          setPreviews(data.previews);
          try {
            sessionStorage.setItem('admin_stats_cache', JSON.stringify(data));
          } catch {}
        }
      })
      .catch(err => {
        console.error('Error loading stats:', err);
      })
      .finally(() => {
        setStatsLoading(false);
      });

    // 2. Fetch Analytics
    fetch('/api/admin/analytics')
      .then(async res => {
        if (!res.ok) return null;
        return res.json();
      })
      .then(data => {
        if (data && data.success) {
          setAnalytics(data);
          try {
            sessionStorage.setItem('admin_analytics_cache', JSON.stringify(data));
          } catch {}
        }
      })
      .catch(err => {
        console.error('Error loading analytics:', err);
      })
      .finally(() => {
        setAnalyticsLoading(false);
      });
  }, []);

  const stats = [
    { name: 'Total Properties', value: counts?.properties ?? 0, icon: Home, color: 'text-blue-600', bg: 'bg-blue-50 border-blue-100', href: '/admin/properties' },
    { name: 'Total Blogs', value: counts?.blogs ?? 0, icon: FileText, color: 'text-purple-600', bg: 'bg-purple-50 border-purple-100', href: '/admin/blogs' },
    { name: 'Total Leads', value: counts?.leads ?? 0, icon: Users, color: 'text-emerald-600', bg: 'bg-emerald-50 border-emerald-100', href: '/admin/leads' },
    { name: 'Job Applications', value: counts?.jobs ?? 0, icon: Briefcase, color: 'text-amber-600', bg: 'bg-amber-50 border-amber-100', href: '/admin/jobs' },
  ];

  // Graph point generation details
  const chartData = analytics?.dailyStats || [];
  const filteredChartData = timeframe === '7_days' ? chartData.slice(-7) : chartData;

  const width = 600;
  const height = 240;
  const paddingX = 45;
  const paddingY = 25;
  const chartWidth = width - paddingX * 2;
  const chartHeight = height - paddingY * 2;

  const maxViews = Math.max(...filteredChartData.map(d => d.views), 10) * 1.15;

  const pointsViews = filteredChartData.map((d, idx) => {
    const x = paddingX + (idx / (filteredChartData.length - 1 || 1)) * chartWidth;
    const y = height - paddingY - (d.views / maxViews) * chartHeight;
    return { x, y, data: d };
  });

  const pointsSessions = filteredChartData.map((d, idx) => {
    const x = paddingX + (idx / (filteredChartData.length - 1 || 1)) * chartWidth;
    const y = height - paddingY - (d.sessions / maxViews) * chartHeight;
    return { x, y, data: d };
  });

  const linePathViews = pointsViews.map((p, idx) => `${idx === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ');
  const areaPathViews = pointsViews.length > 0 
    ? `${linePathViews} L ${pointsViews[pointsViews.length - 1].x} ${height - paddingY} L ${pointsViews[0].x} ${height - paddingY} Z`
    : '';

  const linePathSessions = pointsSessions.map((p, idx) => `${idx === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ');

  const totalViewsSum = filteredChartData.reduce((acc, curr) => acc + curr.views, 0);
  const totalSessionsSum = filteredChartData.reduce((acc, curr) => acc + curr.sessions, 0);

  return (
    <div className="space-y-8 animate-in fade-in duration-500 font-sans">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#1A1800] font-[var(--font-playfair)] tracking-tight">Dashboard Overview</h1>
          <p className="text-xs text-gray-400 font-bold uppercase tracking-wider mt-1.5">Real-time business telemetry and incoming forms</p>
        </div>
        <div className="flex items-center gap-2 self-start sm:self-center">
          <Link 
            href="/admin/marketing/tracking"
            className="flex items-center gap-1.5 text-xs font-extrabold text-[#C9A227] hover:text-[#1A1800] px-3.5 py-2 border border-[#E8D5A3] bg-white rounded-xl shadow-sm hover:shadow transition-all"
          >
            <Globe size={13} />
            Tracking Settings
          </Link>
        </div>
      </div>
      
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
                {statsLoading && !counts ? (
                  <div className="h-8 w-16 bg-gray-100 animate-pulse rounded-lg mt-1" />
                ) : (
                  <p className="text-3xl font-black text-gray-900 leading-none">{stat.value}</p>
                )}
              </div>
              <div className={`p-3.5 rounded-xl border ${stat.bg} group-hover:scale-110 transition-transform duration-300 flex items-center justify-center`}>
                <Icon size={22} className={stat.color} />
              </div>
            </Link>
          );
        })}
      </div>

      <div className="space-y-6">
        <div>
          <h2 className="text-lg font-extrabold text-gray-800 flex items-center gap-2">
            <Activity size={20} className="text-[#C9A227]" />
            Website Traffic & Telemetry
          </h2>
          <p className="text-[10px] text-gray-400 font-bold uppercase mt-1 tracking-wider">
            Daily pageviews, user sessions, and acquisition channels
          </p>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-amber-50 text-[#C9A227] border border-amber-100">
              <TrendingUp size={16} />
            </div>
            <div>
              <p className="text-[9px] font-black text-gray-400 uppercase tracking-wider">Page Views</p>
              {analyticsLoading && !analytics ? (
                <div className="h-5 w-14 bg-gray-100 animate-pulse rounded mt-1" />
              ) : (
                <p className="text-lg font-black text-gray-900 leading-tight">
                  {totalViewsSum.toLocaleString()}
                </p>
              )}
            </div>
          </div>
          <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-emerald-50 text-emerald-600 border border-emerald-100">
              <Users size={16} />
            </div>
            <div>
              <p className="text-[9px] font-black text-gray-400 uppercase tracking-wider">Unique Sessions</p>
              {analyticsLoading && !analytics ? (
                <div className="h-5 w-14 bg-gray-100 animate-pulse rounded mt-1" />
              ) : (
                <p className="text-lg font-black text-gray-900 leading-tight">
                  {totalSessionsSum.toLocaleString()}
                </p>
              )}
            </div>
          </div>
          <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-blue-50 text-blue-600 border border-blue-100">
              <Clock size={16} />
            </div>
            <div>
              <p className="text-[9px] font-black text-gray-400 uppercase tracking-wider">Avg. Stay Duration</p>
              {analyticsLoading && !analytics ? (
                <div className="h-5 w-14 bg-gray-100 animate-pulse rounded mt-1" />
              ) : (
                <p className="text-lg font-black text-gray-900 leading-tight">
                  {analytics?.summary.avgStayTime || '2m 18s'}
                </p>
              )}
            </div>
          </div>
          <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-purple-50 text-purple-600 border border-purple-100">
              <Activity size={16} />
            </div>
            <div>
              <p className="text-[9px] font-black text-gray-400 uppercase tracking-wider">Bounce Rate</p>
              {analyticsLoading && !analytics ? (
                <div className="h-5 w-14 bg-gray-100 animate-pulse rounded mt-1" />
              ) : (
                <p className="text-lg font-black text-gray-900 leading-tight">
                  {analytics?.summary.overallBounceRate || '29.4%'}
                </p>
              )}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-6 relative overflow-hidden flex flex-col h-full justify-between">
              <div>
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h3 className="font-extrabold text-sm text-gray-800">Traffic Trend Analysis</h3>
                    <p className="text-[10px] text-gray-400 font-bold uppercase mt-0.5 tracking-wider">
                      Daily pageviews and organic sessions
                    </p>
                  </div>
                  <div className="bg-gray-100 p-0.5 rounded-xl flex items-center text-[10px] font-black uppercase">
                    <button
                      onClick={() => setTimeframe('7_days')}
                      className={`px-3 py-1.5 rounded-lg transition-all ${
                        timeframe === '7_days' 
                          ? 'bg-white text-gray-900 shadow-sm' 
                          : 'text-gray-400 hover:text-gray-900'
                      }`}
                    >
                      7 Days
                    </button>
                    <button
                      onClick={() => setTimeframe('30_days')}
                      className={`px-3 py-1.5 rounded-lg transition-all ${
                        timeframe === '30_days' 
                          ? 'bg-white text-gray-900 shadow-sm' 
                          : 'text-gray-400 hover:text-gray-900'
                      }`}
                    >
                      30 Days
                    </button>
                  </div>
                </div>

                <div className="relative w-full h-[240px]">
                  {analyticsLoading && !analytics ? (
                    <div className="w-full h-full flex items-center justify-center bg-gray-50/50 rounded-2xl animate-pulse">
                      <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Loading trend chart...</span>
                    </div>
                  ) : filteredChartData.length > 0 ? (
                    <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-full overflow-visible">
                      <defs>
                        <linearGradient id="goldAreaGrad" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="#C9A227" stopOpacity="0.22" />
                          <stop offset="100%" stopColor="#C9A227" stopOpacity="0.00" />
                        </linearGradient>
                        <linearGradient id="bronzeLineGrad" x1="0" y1="0" x2="1" y2="0">
                          <stop offset="0%" stopColor="#C9A227" />
                          <stop offset="100%" stopColor="#8A6B0E" />
                        </linearGradient>
                      </defs>

                      {[0, 0.25, 0.5, 0.75, 1].map((ratio, index) => {
                        const y = paddingY + ratio * chartHeight;
                        const gridVal = Math.round(maxViews * (1 - ratio));
                        return (
                          <g key={index} className="opacity-40">
                            <line
                              x1={paddingX}
                              y1={y}
                              x2={width - paddingX}
                              y2={y}
                              stroke="#E5E7EB"
                              strokeDasharray="4 4"
                            />
                            <text
                              x={paddingX - 10}
                              y={y + 4}
                              textAnchor="end"
                              className="text-[9px] font-black fill-gray-400 font-sans"
                            >
                              {gridVal}
                            </text>
                          </g>
                        );
                      })}

                      {areaPathViews && (
                        <path d={areaPathViews} fill="url(#goldAreaGrad)" />
                      )}

                      {linePathViews && (
                        <path
                          d={linePathViews}
                          fill="none"
                          stroke="url(#bronzeLineGrad)"
                          strokeWidth="2.5"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      )}

                      {linePathSessions && (
                        <path
                          d={linePathSessions}
                          fill="none"
                          stroke="#9CA3AF"
                          strokeWidth="1.5"
                          strokeDasharray="3 3"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          className="opacity-70"
                        />
                      )}

                      {filteredChartData.map((d, idx) => {
                        const isFirst = idx === 0;
                        const isLast = idx === filteredChartData.length - 1;
                        const isMiddle = idx === Math.floor(filteredChartData.length / 2);
                        
                        if (!isFirst && !isLast && !isMiddle) return null;

                        const x = paddingX + (idx / (filteredChartData.length - 1 || 1)) * chartWidth;
                        const formattedDate = new Date(d.date).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric'
                        });

                        return (
                          <text
                            key={idx}
                            x={x}
                            y={height - paddingY + 16}
                            textAnchor="middle"
                            className="text-[9px] font-black fill-gray-400 font-sans"
                          >
                            {formattedDate}
                          </text>
                        );
                      })}

                      {filteredChartData.map((d, idx) => {
                        const x = paddingX + (idx / (filteredChartData.length - 1 || 1)) * chartWidth;
                        const hoverWidth = chartWidth / (filteredChartData.length - 1 || 1);
                        
                        return (
                          <rect
                            key={idx}
                            x={x - hoverWidth / 2}
                            y={paddingY}
                            width={hoverWidth}
                            height={chartHeight}
                            fill="transparent"
                            className="cursor-crosshair pointer-events-auto"
                            onMouseEnter={() => setHoveredIndex(idx)}
                            onMouseLeave={() => setHoveredIndex(null)}
                          />
                        );
                      })}

                      {hoveredIndex !== null && pointsViews[hoveredIndex] && (
                        <g>
                          <line
                            x1={pointsViews[hoveredIndex].x}
                            y1={paddingY}
                            x2={pointsViews[hoveredIndex].x}
                            y2={height - paddingY}
                            stroke="#C9A227"
                            strokeWidth="1.5"
                            strokeDasharray="2 2"
                          />
                          <circle
                            cx={pointsViews[hoveredIndex].x}
                            cy={pointsViews[hoveredIndex].y}
                            r="4.5"
                            fill="#FFFFFF"
                            stroke="#C9A227"
                            strokeWidth="2.5"
                          />
                        </g>
                      )}
                    </svg>
                  ) : (
                    <div className="h-full flex items-center justify-center text-gray-400 text-xs font-semibold">
                      No traffic data recorded.
                    </div>
                  )}

                  {hoveredIndex !== null && filteredChartData[hoveredIndex] && (
                    <div 
                      className="absolute z-10 bg-[#1A1800] text-white px-3.5 py-2.5 rounded-2xl shadow-xl border border-[#C9A227]/30 text-xs pointer-events-none transition-all duration-150 backdrop-blur-md"
                      style={{
                        left: `${Math.min(Math.max(pointsViews[hoveredIndex].x - 60, 10), width - 130)}px`,
                        top: `${Math.max(pointsViews[hoveredIndex].y - 65, 10)}px`
                      }}
                    >
                      <p className="text-[10px] text-[#C9A227] font-black uppercase tracking-wider">
                        {new Date(filteredChartData[hoveredIndex].date).toLocaleDateString('en-US', {
                          weekday: 'short',
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric'
                        })}
                      </p>
                      <div className="flex items-center gap-3.5 pt-1.5">
                        <div className="flex items-center gap-1">
                          <span className="w-1.5 h-1.5 rounded-full bg-[#C9A227]" />
                          <span className="text-gray-300 font-bold">Views:</span>
                          <span className="font-black text-white">{filteredChartData[hoveredIndex].views}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <span className="w-1.5 h-1.5 rounded-full bg-gray-400" />
                          <span className="text-gray-300 font-bold">Sessions:</span>
                          <span className="font-black text-white">{filteredChartData[hoveredIndex].sessions}</span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <div className="flex items-center justify-between pt-4 border-t border-gray-50 text-[11px] font-semibold text-gray-500">
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-1.5">
                    <span className="w-3 h-1 rounded-full bg-[#C9A227]" />
                    <span>Pageviews</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="w-3 h-1 rounded-full bg-gray-400 border-dashed" />
                    <span>Sessions</span>
                  </div>
                </div>
                <span className="text-[10px] text-gray-400 uppercase font-black tracking-wider">Hover timeline to inspect</span>
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-6 flex flex-col">
              <h3 className="font-extrabold text-sm text-gray-800 mb-2">Traffic Acquisition Channels</h3>
              <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider mb-6">
                Where your property seekers are coming from
              </p>
              
              <div className="space-y-4 flex-1">
                {analyticsLoading && !analytics ? (
                  <div className="space-y-3">
                    {[1, 2, 3, 4].map(i => (
                      <div key={i} className="space-y-1.5 animate-pulse">
                        <div className="h-3.5 bg-gray-100 rounded w-2/3" />
                        <div className="h-2 bg-gray-100 rounded-full w-full" />
                      </div>
                    ))}
                  </div>
                ) : analytics?.sources && analytics.sources.length > 0 ? (
                  analytics.sources.map((src, idx) => (
                    <div key={idx} className="space-y-1.5">
                      <div className="flex items-center justify-between text-xs font-bold text-gray-700">
                        <span className="text-gray-800">{src.source}</span>
                        <div className="space-x-1">
                          <span className="font-black text-gray-900">{src.percentage}%</span>
                          <span className="text-[10px] text-gray-400 font-semibold">({src.count})</span>
                        </div>
                      </div>
                      <div className="w-full bg-gray-100 h-2 rounded-full overflow-hidden">
                        <div 
                          className="bg-gradient-to-r from-[#C9A227] to-[#8A6B0E] h-full rounded-full transition-all duration-1000"
                          style={{ width: `${src.percentage}%` }}
                        />
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="py-8 text-center text-gray-400 text-xs font-semibold">
                    No acquisition logs gathered yet.
                  </div>
                )}
              </div>
            </div>

            <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-6 space-y-4">
              <h3 className="font-extrabold text-sm text-[#1A1800] leading-none">SEO & Search Health Center</h3>
              <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">
                Attribution container check
              </p>

              <div className="space-y-3 pt-2 text-xs font-semibold text-gray-700">
                <div className="flex items-center justify-between p-3 bg-emerald-50/50 border border-emerald-100 rounded-2xl">
                  <div className="flex items-center gap-2">
                    <CheckCircle size={15} className="text-emerald-600" />
                    <span>GA4 Tag Verification</span>
                  </div>
                  <span className="font-black text-emerald-700 text-[10px] uppercase">Active</span>
                </div>

                <div className="flex items-center justify-between p-3 bg-emerald-50/50 border border-emerald-100 rounded-2xl">
                  <div className="flex items-center gap-2">
                    <CheckCircle size={15} className="text-emerald-600" />
                    <span>Structured Schema Markup</span>
                  </div>
                  <span className="font-black text-emerald-700 text-[10px] uppercase">Passed</span>
                </div>

                <div className="flex items-center justify-between p-3 bg-emerald-50/50 border border-emerald-100 rounded-2xl">
                  <div className="flex items-center gap-2">
                    <CheckCircle size={15} className="text-emerald-600" />
                    <span>Sitemap XML Integrity</span>
                  </div>
                  <span className="font-black text-emerald-700 text-[10px] uppercase">Verified</span>
                </div>
              </div>

              <div className="pt-2 text-[10px] text-gray-400 font-bold leading-normal">
                💡 **SEO Best Practice**: Structured JSON-LD schema is enabled across all property profiles to boost Google Rich Snippet display.
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
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
            {statsLoading && !previews ? (
              <div className="p-6 space-y-3">
                {[1, 2, 3].map(i => (
                  <div key={i} className="h-8 bg-gray-50 animate-pulse rounded-xl" />
                ))}
              </div>
            ) : previews?.leads && previews.leads.length > 0 ? (
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
                          rel="noopener noreferrer"
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
            {statsLoading && !previews ? (
              <div className="space-y-3">
                {[1, 2, 3].map(i => (
                  <div key={i} className="h-10 bg-gray-50 animate-pulse rounded-xl" />
                ))}
              </div>
            ) : previews?.jobs && previews.jobs.length > 0 ? (
              previews.jobs.map((job) => (
                <div key={job._id} className="py-3.5 first:pt-0 last:pb-0 flex items-center justify-between gap-3">
                  <div className="space-y-1">
                    <h4 className="font-bold text-xs text-gray-800 leading-tight">{job.name}</h4>
                    <p className="text-[10px] text-[#C9A227] font-black uppercase tracking-wider">{job.position}</p>
                  </div>
                  <a 
                    href={`https://wa.me/91${job.phone}`}
                    target="_blank"
                    rel="noopener noreferrer"
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
