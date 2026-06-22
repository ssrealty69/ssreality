'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Calculator, Search, Info, Phone } from 'lucide-react';

export default function MobileBottomNav() {
  const pathname = usePathname();

  const navItems = [
    { name: 'HOME', href: '/', icon: Home, isCenter: false },
    { name: 'EMI', href: '/emi-calculator', icon: Calculator, isCenter: false },
    { name: 'SEARCH', href: '/properties?focus=true', icon: Search, isCenter: true },
    { name: 'ABOUT', href: '/about-us', icon: Info, isCenter: false },
    { name: 'CONTACT', href: '/contact-us', icon: Phone, isCenter: false },
  ];

  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 z-[60] bg-[#1A1800] border-t border-[#2A2810] rounded-t-3xl shadow-[0_-10px_40px_rgba(0,0,0,0.3)] pb-safe">
      <div className="flex justify-between items-center h-16 px-1 relative">
        {navItems.map((item, index) => {
          const isActive = pathname === item.href || (item.href !== '/' && pathname?.startsWith(item.href) && !item.isCenter);
          const Icon = item.icon;
          
          if (item.isCenter) {
            return (
              <div key={item.name} className="flex-1 flex justify-center -mt-10 relative z-20">
                <Link
                  href={item.href}
                  prefetch={true}
                  aria-label="Search properties"
                  className="bg-gradient-to-tr from-[#C9A227] to-[#FBBF24] p-4 rounded-full shadow-[0_8px_20px_rgba(201,162,39,0.4)] border-4 border-[#FFFEF5] text-[#1A1800] hover:scale-105 active:scale-95 transition-all"
                >
                  <Icon size={24} strokeWidth={2.5} />
                </Link>
              </div>
            );
          }
          
          return (
            <Link
              key={item.name}
              href={item.href}
              prefetch={true}
              className={`flex-1 flex flex-col items-center justify-center h-full space-y-1 transition-all active:scale-95 active:opacity-70 ${
                isActive ? 'text-[#C9A227]' : 'text-[#a09060] hover:text-white'
              }`}
            >
              <Icon size={20} strokeWidth={isActive ? 2.5 : 2} />
              <span className={`text-[9px] font-bold tracking-wider ${isActive ? 'text-[#C9A227]' : 'text-[#a09060]'}`}>
                {item.name}
              </span>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
