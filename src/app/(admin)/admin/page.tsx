import { Home, Users, Briefcase, FileText } from 'lucide-react';
import Link from 'next/link';

export default function AdminDashboard() {
  const stats = [
    { name: 'Total Properties', value: '0', icon: Home, color: 'text-blue-600', bg: 'bg-blue-100', href: '/admin/properties' },
    { name: 'Total Blogs', value: '0', icon: FileText, color: 'text-purple-600', bg: 'bg-purple-100', href: '/admin/blogs' },
    { name: 'Total Leads', value: '0', icon: Users, color: 'text-emerald-600', bg: 'bg-emerald-100', href: '/admin/leads' },
    { name: 'Job Applications', value: '0', icon: Briefcase, color: 'text-amber-600', bg: 'bg-amber-100', href: '/admin/jobs' },
  ];

  return (
    <div>
      <h1 className="text-2xl font-bold text-[#1A1800] mb-6">Dashboard Overview</h1>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <Link 
              key={stat.name} 
              href={stat.href}
              className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow group flex items-center justify-between"
            >
              <div>
                <p className="text-sm font-medium text-gray-500 mb-1">{stat.name}</p>
                <p className="text-3xl font-bold text-gray-900">{stat.value}</p>
              </div>
              <div className={`p-4 rounded-xl ${stat.bg} group-hover:scale-110 transition-transform`}>
                <Icon size={24} className={stat.color} />
              </div>
            </Link>
          );
        })}
      </div>

      <div className="mt-8 bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
        <h2 className="text-lg font-bold text-[#1A1800] mb-4">Welcome to SS Realty Admin</h2>
        <p className="text-gray-600">
          From this panel, you can manage your website's premium property listings, blog articles, incoming leads, and job applications.
          Use the sidebar on the left to navigate between different sections.
        </p>
      </div>
    </div>
  );
}
