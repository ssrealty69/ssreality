'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, Home, Users, Briefcase, FileText, Settings, X, Layers, Target, Compass, HelpCircle, Phone, BarChart2, Package2, Navigation, Megaphone } from 'lucide-react';
import Image from 'next/image';

const navItems = [
  { href: '/admin', label: 'Dashboard', icon: LayoutDashboard, restricted: true },
  { href: '/admin/properties', label: 'Properties', icon: Home, restricted: true },
  { href: '/admin/floor-plans', label: 'Floor Plans', icon: Layers, restricted: true },
  { href: '/admin/delivered-landmarks', label: 'Delivered Landmarks', icon: Compass, restricted: true },
  { href: '/admin/leads', label: 'Leads', icon: Users, hasBadge: true },
  { href: '/admin/agents', label: 'Team Management', icon: Users },
  { href: '/admin/tracking', label: 'Field GPS Radar', icon: Navigation },
  { href: '/admin/reports', label: 'Team Reports', icon: BarChart2 },
  { href: '/admin/share-kits', label: 'Share Kits', icon: Package2 },
  { href: '/admin/jobs', label: 'Job Applications', icon: Briefcase },
  { href: '/admin/blogs', label: 'Blogs', icon: FileText, restricted: true },
  { href: '/admin/marketing/tracking', label: 'Marketing & Tracking', icon: Target, restricted: true },
  { href: '/admin/meta-ads', label: 'Meta Ads', icon: Megaphone, restricted: true },
];

export default function AdminSidebar({ 
  isOpen, 
  setIsOpen
}: { 
  isOpen: boolean; 
  setIsOpen: (val: boolean) => void;
}) {
  const pathname = usePathname();
  const [unreadLeads, setUnreadLeads] = useState(0);
  const [role, setRole] = useState('admin');

  useEffect(() => {
    let isMounted = true;

    // Fetch unread leads count initially and poll every 30 seconds
    const fetchUnreadCount = async () => {
      if (typeof window !== 'undefined' && (!navigator.onLine || document.hidden)) {
        return;
      }
      try {
        const res = await fetch('/api/admin/leads/unread-count');
        if (!res.ok) return;
        const data = await res.json();
        if (isMounted && data.success) {
          setUnreadLeads(data.unreadCount || 0);
        }
      } catch (err) {
        // Silently ignore transient network drops during background polling
      }
    };

    fetchUnreadCount();
    const interval = setInterval(fetchUnreadCount, 30000);
    
    // Read role from cookie
    const getCookie = (name: string) => {
      const value = `; ${document.cookie}`;
      const parts = value.split(`; ${name}=`);
      if (parts.length === 2) return parts.pop()?.split(';').shift() || '';
      return '';
    };
    setRole(getCookie('admin_role') || 'admin');
    
    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, []);

  const isSuperAdmin = role === 'super_admin';
  const visibleNavItems = navItems.filter(item => {
    if (role === 'agent') {
      return item.href === '/admin/leads';
    }
    return !item.restricted || isSuperAdmin;
  });

  return (
    <>
      {/* Mobile Overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}
      {/* Sidebar */}
      <aside
        className={`
          fixed inset-y-0 left-0 z-50 w-64 bg-[#1A1800] border-r border-[#C9A227]/20 transform transition-transform duration-300
          lg:static lg:translate-x-0 lg:flex-shrink-0 lg:h-screen lg:overflow-y-auto
          ${isOpen ? 'translate-x-0' : '-translate-x-full'}
        `}
      >
        <div className="flex items-center justify-between h-16 px-4 border-b border-[#C9A227]/20">
          <Link href="/admin" className="relative w-32 h-8" onClick={() => setIsOpen(false)}>
            <Image 
              src="/SS Realty.png" 
              alt="Admin Logo" 
              fill
              sizes="128px"
              className="object-contain filter brightness-0 invert"
            />
          </Link>
          <button 
            onClick={() => setIsOpen(false)}
            className="lg:hidden text-white/70 hover:text-white"
          >
            <X size={20} />
          </button>
        </div>

        <nav className="p-4 space-y-2">
          {visibleNavItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;
            const showBadge = item.hasBadge && unreadLeads > 0;

            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setIsOpen(false)}
                className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-colors relative ${
                  isActive 
                    ? 'bg-[#C9A227]/10 text-[#C9A227]' 
                    : 'text-white/70 hover:text-white hover:bg-white/5'
                }`}
              >
                <div className="relative">
                  <Icon size={20} />
                  {showBadge && (
                    <span className="absolute -top-1 -right-1 flex h-3 w-3">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
                    </span>
                  )}
                </div>
                <span className="font-medium flex-1">{item.label}</span>
                {showBadge && (
                  <span className="bg-red-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">
                    {unreadLeads}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>
      </aside>
    </>
  );
}
