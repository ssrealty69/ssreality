'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, Users, LogOut } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function AgentSidebar() {
  const pathname = usePathname();
  const router = useRouter();

  const handleLogout = () => {
    localStorage.removeItem('agent_token');
    localStorage.removeItem('agent_data');
    router.push('/agent/login');
  };

  const navItems = [
    { name: 'Dashboard', href: '/agent/dashboard', icon: LayoutDashboard },
    { name: 'My Leads', href: '/agent/leads', icon: Users },
  ];

  return (
    <aside className="w-64 bg-[#1A1800] text-white flex flex-col h-screen sticky top-0 border-r border-[#C9A227]/20 shadow-2xl z-40">
      {/* Logo Area */}
      <div className="h-20 flex items-center px-8 border-b border-white/5">
        <h1 className="text-2xl font-black text-[#C9A227] tracking-widest uppercase font-[var(--font-playfair)]">
          SS Realty
        </h1>
      </div>

      {/* Navigation */}
      <nav className="flex-1 py-8 px-4 space-y-2 overflow-y-auto">
        <p className="px-4 text-[10px] font-black uppercase text-gray-500 tracking-[0.2em] mb-4">
          Agent Portal
        </p>

        {navItems.map((item) => {
          const isActive = pathname.startsWith(item.href);
          return (
            <Link
              key={item.name}
              href={item.href}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group ${
                isActive
                  ? 'bg-gradient-to-r from-[#C9A227]/20 to-transparent text-[#C9A227] font-bold border-l-2 border-[#C9A227]'
                  : 'text-gray-400 hover:bg-white/5 hover:text-white font-semibold border-l-2 border-transparent'
              }`}
            >
              <item.icon
                size={18}
                className={`transition-colors ${
                  isActive ? 'text-[#C9A227]' : 'text-gray-500 group-hover:text-gray-300'
                }`}
              />
              <span className="text-sm tracking-wide">{item.name}</span>
            </Link>
          );
        })}
      </nav>

      {/* Bottom Area (Logout) */}
      <div className="p-4 border-t border-white/5 bg-black/20">
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-rose-400 hover:bg-rose-500/10 transition-all group font-semibold"
        >
          <LogOut size={18} className="group-hover:-translate-x-1 transition-transform" />
          <span className="text-sm">Logout</span>
        </button>
      </div>
    </aside>
  );
}
