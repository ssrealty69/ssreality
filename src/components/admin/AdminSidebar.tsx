'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, Home, Users, Briefcase, FileText, Settings, X, Layers, Target, Compass, HelpCircle } from 'lucide-react';
import Image from 'next/image';

const navItems = [
  { href: '/admin', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/admin/properties', label: 'Properties', icon: Home },
  { href: '/admin/floor-plans', label: 'Floor Plans', icon: Layers },
  { href: '/admin/delivered-landmarks', label: 'Delivered Landmarks', icon: Compass },
  { href: '/admin/leads', label: 'Leads', icon: Users },
  { href: '/admin/jobs', label: 'Job Applications', icon: Briefcase },
  { href: '/admin/blogs', label: 'Blogs', icon: FileText },
  { href: '/admin/marketing/tracking', label: 'Marketing & Tracking', icon: Target },
];

export default function AdminSidebar({ 
  isOpen, 
  setIsOpen
}: { 
  isOpen: boolean; 
  setIsOpen: (val: boolean) => void;
}) {
  const pathname = usePathname();

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
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;

            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setIsOpen(false)}
                className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${
                  isActive 
                    ? 'bg-[#C9A227]/10 text-[#C9A227]' 
                    : 'text-white/70 hover:text-white hover:bg-white/5'
                }`}
              >
                <Icon size={20} />
                <span className="font-medium">{item.label}</span>
              </Link>
            );
          })}
        </nav>
      </aside>
    </>
  );
}
