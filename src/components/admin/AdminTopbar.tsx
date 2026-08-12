'use client';

import { Menu, LogOut } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';

export default function AdminTopbar({ 
  setSidebarOpen 
}: { 
  setSidebarOpen: (val: boolean) => void 
}) {
  const router = useRouter();
  const [role, setRole] = useState('admin');

  useEffect(() => {
    const getCookie = (name: string) => {
      const value = `; ${document.cookie}`;
      const parts = value.split(`; ${name}=`);
      if (parts.length === 2) return parts.pop()?.split(';').shift() || '';
      return '';
    };
    setRole(getCookie('admin_role') || 'admin');
  }, []);

  const handleLogout = async () => {
    try {
      await fetch('/api/admin/logout', { method: 'POST' });
      toast.success('Logged out successfully');
      router.push('/admin/login');
      router.refresh();
    } catch (error) {
      toast.error('Failed to logout');
    }
  };

  return (
    <header className="h-16 bg-white border-b border-[#E8D5A3] flex items-center justify-between px-4 sticky top-0 z-30">
      <div className="flex items-center gap-4">
        <button
          onClick={() => setSidebarOpen(true)}
          className="lg:hidden p-2 -ml-2 text-[#6b6450] hover:text-[#C9A227] hover:bg-[#C9A227]/10 rounded-lg transition-colors"
        >
          <Menu size={24} />
        </button>
        <h2 className="text-[#1A1800] font-bold hidden sm:block">SS Realty Management</h2>
      </div>

      <div className="flex items-center gap-4">
        <button
          onClick={async () => {
            try {
              const res = await fetch('/api/admin/cache', { method: 'POST' });
              if (res.ok) {
                toast.success('Cache cleared successfully!');
              } else {
                toast.error('Failed to clear cache');
              }
            } catch (error) {
              toast.error('Failed to clear cache');
            }
          }}
          className="flex items-center gap-2 text-sm font-bold text-[#1A1800] bg-[#C9A227]/10 hover:bg-[#C9A227]/20 border border-[#C9A227]/30 px-4 py-2 rounded-lg transition-colors"
        >
          <span className="w-2 h-2 rounded-full bg-[#C9A227] animate-pulse" />
          <span className="hidden sm:inline">Clear Cache</span>
        </button>

        <div className="hidden sm:flex flex-col items-end mr-4 border-r border-[#E8D5A3] pr-4">
          <span className="text-sm font-bold text-[#1A1800]">Admin</span>
          <span className="text-xs text-[#6b6450] capitalize">{role.replace('_', ' ')}</span>
        </div>
        
        <button
          onClick={handleLogout}
          className="flex items-center gap-2 text-sm font-medium text-red-600 hover:text-red-700 hover:bg-red-50 px-3 py-2 rounded-lg transition-colors"
        >
          <LogOut size={18} />
          <span className="hidden sm:inline">Logout</span>
        </button>
      </div>
    </header>
  );
}
