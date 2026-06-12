'use client';
// Force HMR reload
import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { Menu, X, Phone, Mail, ChevronDown, CornerDownRight, ArrowRight } from 'lucide-react';

const navLinks = [
  { href: '/', label: 'Home' },
  { href: '/properties', label: 'Properties', sub: [
    { href: '/properties?priceType=sale', label: 'Buy' },
    { href: '/properties?priceType=rent', label: 'Rent' },
    { href: '/properties?propertyType=apartment', label: 'Apartments' },
    { href: '/properties?propertyType=villa', label: 'Villas' },
    { href: '/properties?propertyType=plot', label: 'Plots' },
    { href: '/properties?propertyType=commercial', label: 'Commercial' },
  ]},
  { href: '/about', label: 'About' },
  { href: '/blog', label: 'Blog' },
  { href: '/careers', label: 'Careers' },
];

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [dropdown, setDropdown] = useState<string | null>(null);
  const pathname = usePathname();

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => { setOpen(false); setDropdown(null); }, [pathname]);

  const isHomePage = pathname === '/';
  const isSolid = scrolled || !isHomePage;

  return (
    <header className="fixed top-0 left-0 right-0 z-50">
      {/* Top Contact Bar - Hidden on Desktop */}
      <div className={`w-full lg:hidden transition-colors duration-300 ${isSolid ? 'bg-[#1A1800] text-white' : 'bg-black/60 backdrop-blur-sm text-white border-b border-white/10'}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2 flex items-center justify-center gap-6 sm:gap-10 text-[11px] sm:text-xs font-semibold tracking-wide">
          <a href="tel:+919311059100" className="flex items-center gap-1.5 hover:text-[#FBBF24] transition-colors">
            <Phone size={13} className="text-[#FBBF24]" />
            +91 93110 59100
          </a>
          <a href="mailto:ssrealtyteams@gmail.com" className="flex items-center gap-1.5 hover:text-[#FBBF24] transition-colors">
            <Mail size={13} className="text-[#FBBF24]" />
            ssrealtyteams@gmail.com
          </a>
        </div>
      </div>

      {/* Main Navbar with Premium Curves (Mobile) / Clean Top (Desktop) */}
      <div className={`transition-all duration-300 ${ 
        isSolid
          ? 'bg-white shadow-[0_10px_30px_rgba(0,0,0,0.1)] border-b border-[#E8D5A3]'
          : 'bg-white/10 backdrop-blur-md border-b border-white/10'
      }`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">

          {/* Logo */}
          <Link href="/" className="flex items-center group" onClick={() => setOpen(false)}>
            <div className="relative w-48 h-16 transition-transform duration-300 group-hover:scale-105">
              <Image 
                src="/SS Realty.png" 
                alt="SS Realty Logo" 
                fill
                sizes="(max-width: 768px) 192px, 192px"
                className="object-contain"
                priority
              />
            </div>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden lg:flex items-center gap-1">
            {navLinks.map((link) => (
              <div key={link.href} className="relative group"
                onMouseEnter={() => link.sub ? setDropdown(link.href) : null}
                onMouseLeave={() => setDropdown(null)}
              >
                <Link
                  href={link.href}
                  className={`flex items-center gap-1 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                    pathname === link.href || pathname.startsWith(link.href + '/')
                      ? 'text-[#C9A227] bg-[#C9A227]/10'
                      : !isSolid 
                        ? 'text-white/80 hover:text-white hover:bg-white/10' 
                        : 'text-[#3a3828] hover:text-[#C9A227] hover:bg-[#C9A227]/8'
                  }`}
                >
                  {link.label}
                  {link.sub && <ChevronDown size={14} className={`transition-transform duration-200 ${dropdown === link.href ? 'rotate-180' : ''}`} />}
                </Link>

                {/* Dropdown */}
                {link.sub && dropdown === link.href && (
                  <div className="absolute top-full left-0 mt-1 w-52 bg-white rounded-xl shadow-[0_8px_32px_rgba(26,24,0,0.12)] border border-[#E8D5A3] overflow-hidden py-2 animate-scale-in">
                    {link.sub.map((sub) => (
                      <Link
                        key={sub.href}
                        href={sub.href}
                        className="block px-4 py-2.5 text-sm text-[#3a3828] hover:text-[#C9A227] hover:bg-[#FFFEF5] transition-colors"
                      >
                        {sub.label}
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </nav>

          {/* CTA */}
          <div className="hidden lg:flex items-center gap-3">
            <a href="tel:+919311059100" className={`flex items-center gap-2 text-sm transition-colors ${!isSolid ? 'text-white/80 hover:text-white' : 'text-[#6b6450] hover:text-[#C9A227]'}`}>
              <Phone size={15} className="text-[#C9A227]" />
              +91 93110 59100
            </a>
            <Link href="/contact-us" className="relative group overflow-hidden bg-gradient-to-r from-[#C9A227] via-[#F0D060] to-[#B8860B] text-[#1A1800] font-extrabold text-[12px] uppercase tracking-tighter py-2.5 px-6 rounded-xl shadow-[0_4px_20px_rgba(201,162,39,0.3)] transition-all duration-500 hover:scale-105 active:scale-95 border border-[#1A1800]/10">
              {/* SHINE EFFECT */}
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent -translate-x-full group-hover:animate-[shimmer_1.5s_infinite] pointer-events-none" />
              <span className="relative z-10 flex items-center gap-2">
                Get Free Consult
                <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
              </span>
            </Link>
          </div>

          <button
            onClick={() => setOpen(!open)}
            className={`relative z-[60] lg:hidden p-2 rounded-lg transition-colors ${
              open 
                ? 'text-[#F0D060]' 
                : !isSolid 
                  ? 'text-white hover:bg-white/10' 
                  : 'text-[#3a3828] hover:bg-[#C9A227]/10'
            }`}
            aria-label="Toggle menu"
          >
            {open ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </div>

      {/* Mobile Menu Overlay */}
      {open && (
        <div 
          className="lg:hidden fixed inset-x-0 bottom-0 top-full bg-black/40 backdrop-blur-md z-[40]"
          onClick={() => setOpen(false)}
        />
      )}

      {/* Mobile Menu Content */}
      <div className={`lg:hidden absolute top-full left-0 right-0 z-[50] transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] transform ${open ? 'translate-x-0 opacity-100 pointer-events-auto' : 'translate-x-full opacity-0 pointer-events-none'}`}>
        <div 
          className="relative m-4 mt-2 rounded-3xl shadow-[0_40px_80px_rgba(0,0,0,0.6)] border border-white/10 overflow-hidden flex flex-col max-h-[85vh]"
          style={{
            background: 'linear-gradient(180deg, rgba(20, 18, 0, 0.95) 0%, rgba(0, 0, 0, 0.98) 100%)',
            backdropFilter: 'blur(20px)',
          }}
        >
          {/* Decorative Premium Pattern Overlay */}
          <div className="absolute inset-0 opacity-[0.05] pointer-events-none" style={{ backgroundImage: 'radial-gradient(#C9A227 1px, transparent 1px)', backgroundSize: '32px 32px' }} />
          
          <div className="relative z-10 flex flex-col h-full overflow-y-auto">
            <div className="px-5 py-6 space-y-1">
              {navLinks.map((link) => (
                <div key={link.href}>
                  <Link
                    href={link.href}
                    onClick={() => setOpen(false)}
                    className={`flex items-center px-4 py-3 rounded-2xl text-base font-bold tracking-wide transition-all ${
                      pathname === link.href 
                        ? 'text-[#F0D060] bg-white/10' 
                        : 'text-white hover:text-[#F0D060] hover:bg-white/5'
                    }`}
                  >
                    {link.label}
                  </Link>
                  {link.sub && (
                    <div className="relative pl-8 pr-2 space-y-0 mt-1 mb-2 ml-4">
                      {/* Vertical connector line */}
                      <div className="absolute left-4 top-0 bottom-4 w-[1px] bg-[#C9A227]/30" />
                      
                      {link.sub.map((sub) => (
                        <Link key={sub.href} href={sub.href} onClick={() => setOpen(false)}
                          className="relative flex items-center gap-3 py-2 text-sm font-semibold text-white/80 hover:text-[#F0D060] transition-colors"
                        >
                          {/* Horizontal connector line */}
                          <div className="absolute -left-4 top-1/2 w-3 h-[1px] bg-[#C9A227]/30" />
                          <span className="w-1 h-1 rounded-full bg-[#C9A227]/60" />
                          {sub.label}
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
            <div className="p-5 bg-black/40 border-t border-white/5 backdrop-blur-md">
              <Link href="/contact-us" onClick={() => setOpen(false)} className="relative group overflow-hidden bg-gradient-to-r from-[#C9A227] via-[#F0D060] to-[#B8860B] text-[#1A1800] font-black w-full text-center text-base py-4 rounded-2xl shadow-[0_10px_30px_rgba(201,162,39,0.4)] active:scale-95 transition-all flex items-center justify-center gap-2">
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent -translate-x-full animate-[shimmer_3s_infinite]" />
                Get Free Consultation
                <ArrowRight size={18} />
              </Link>
            </div>
          </div>
        </div>
      </div>
      </div>
    </header>
  );
}
