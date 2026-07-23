'use client';

import Link from 'next/link';
import Image from 'next/image';
import { Phone, Mail, MapPin, ArrowRight } from 'lucide-react';
import { usePathname } from 'next/navigation';

// Inline SVG brand icons
const FacebookIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" width="16" height="16">
    <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
  </svg>
);
const InstagramIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="16" height="16">
    <rect x="2" y="2" width="20" height="20" rx="5" ry="5" /><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" /><line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
  </svg>
);
const YoutubeIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" width="16" height="16">
    <path d="M22.54 6.42a2.78 2.78 0 0 0-1.95-1.96C18.88 4 12 4 12 4s-6.88 0-8.59.46A2.78 2.78 0 0 0 1.46 6.42 29 29 0 0 0 1 12a29 29 0 0 0 .46 5.58 2.78 2.78 0 0 0 1.95 1.97C5.12 20 12 20 12 20s6.88 0 8.59-.45a2.78 2.78 0 0 0 1.95-1.97A29 29 0 0 0 23 12a29 29 0 0 0-.46-5.58z" /><polygon points="9.75 15.02 15.5 12 9.75 8.98 9.75 15.02" fill="#1A1800" />
  </svg>
);

const companyLinks = [
  { href: '/about-us', label: 'About Us' },
  { href: '/blog', label: 'Blog & News' },
  { href: '/contact-us', label: 'Contact Us' },
  { href: '/careers', label: 'Careers' },
  { href: '/emi-calculator', label: 'EMI Calculator' },
];

const socials = [
  { href: 'https://www.facebook.com/profile.php?id=61571897675312', Icon: FacebookIcon, label: 'Facebook' },
  { href: 'https://www.instagram.com/ssrealtyorg', Icon: InstagramIcon, label: 'Instagram' },
  { href: 'https://www.youtube.com/@ssrealty5270', Icon: YoutubeIcon, label: 'YouTube' },
];

export default function Footer() {
  const year = new Date().getFullYear();
  const pathname = usePathname();
  const isFloorPlanPage = pathname?.includes('/floor-plans') || pathname?.includes('/floorview');

  return (
    <footer className="bg-[#0d0c00] text-[#d4c48a]">
      {/* Top CTA Strip */}
      {!isFloorPlanPage && pathname !== '/' && (
        <div className="gold-gradient py-8">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-4">
            <div>
              <h3 className="text-xl font-bold text-[#1A1800] font-[var(--font-playfair)]">
                Ready to Find Your Dream Property?
              </h3>
              <p className="text-[#5c4004] text-sm mt-1">Talk to our experts today — free consultation.</p>
            </div>
            <Link href="/contact-us"
              className="flex items-center gap-2 bg-[#1A1800] text-[#C9A227] font-semibold px-6 py-3 rounded-xl hover:bg-[#282618] transition-colors whitespace-nowrap"
            >
              Contact Us <ArrowRight size={16} />
            </Link>
          </div>
        </div>
      )}

      {/* Main Footer Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 pb-12">
        {/* Main Grid: Brand + 4 Location & Link Columns */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-8">
          {/* Brand Info */}
          <div className="lg:col-span-1 space-y-4">
            <Link href="/" className="inline-block group">
              <div className="relative w-40 h-14 transition-transform duration-300 group-hover:scale-105">
                <Image
                  src="/SS Realty.png"
                  alt="SS Realty Logo"
                  fill
                  className="object-contain"
                />
              </div>
            </Link>
            <p className="text-xs text-[#a09060] leading-relaxed max-w-sm">
              Your trusted real estate partner based in Jonapur, serving the entirety of Delhi NCR — from Chattarpur, Mandi, Chandan Hola, and South Delhi to Gwal Pahari, Gurugram, Noida, and beyond.
            </p>
            <div className="flex items-center gap-3 pt-2">
              {socials.map(({ href, Icon, label }) => (
                <a key={label} href={href} aria-label={label}
                  target="_blank" rel="noopener noreferrer"
                  className="w-8 h-8 rounded-lg bg-white/5 border border-[#C9A227]/20 flex items-center justify-center text-[#C9A227] hover:bg-[#C9A227] hover:text-[#1A1800] transition-all duration-200"
                >
                  <Icon />
                </a>
              ))}
            </div>
          </div>

          {/* Column 1: Flats in Chattarpur */}
          <div className="space-y-3">
            <h4 className="font-bold text-white text-xs uppercase tracking-wider border-b border-[#C9A227]/30 pb-2">
              Flats in Chattarpur
            </h4>
            <ul className="space-y-2 text-xs text-[#a09060]">
              <li><Link href="/flats-in-chattarpur" className="hover:text-[#C9A227] transition-colors">Flats in Chattarpur</Link></li>
              <li><Link href="/2-bhk-flat-in-chattarpur" className="hover:text-[#C9A227] transition-colors">2 BHK Flats Chattarpur</Link></li>
              <li><Link href="/3-bhk-flats-for-sale-chattarpur" className="hover:text-[#C9A227] transition-colors">3 BHK Flats Chattarpur</Link></li>
              <li><Link href="/flats-in-chattarpur" className="hover:text-[#C9A227] transition-colors">Builder Floor Chattarpur</Link></li>
              <li><Link href="/flats-in-chattarpur" className="hover:text-[#C9A227] transition-colors">Bank Loan Flats</Link></li>
            </ul>
          </div>

          {/* Column 2: Flats in South Delhi */}
          <div className="space-y-3">
            <h4 className="font-bold text-white text-xs uppercase tracking-wider border-b border-[#C9A227]/30 pb-2">
              Flats in South Delhi
            </h4>
            <ul className="space-y-2 text-xs text-[#a09060]">
              <li><Link href="/flats-for-sale-in-south-delhi" className="hover:text-[#C9A227] transition-colors">Flats for Sale South Delhi</Link></li>
              <li><Link href="/2bhk-flats-for-sale-south-delhi" className="hover:text-[#C9A227] transition-colors">2 BHK Flats South Delhi</Link></li>
              <li><Link href="/3-bhk-flats-in-south-delhi" className="hover:text-[#C9A227] transition-colors">3 BHK Flats South Delhi</Link></li>
              <li><Link href="/flats-for-sale-in-south-delhi" className="hover:text-[#C9A227] transition-colors">Builder Floors South Delhi</Link></li>
              <li><Link href="/flats-for-sale-in-south-delhi" className="hover:text-[#C9A227] transition-colors">Flats in Jonapur Delhi</Link></li>
            </ul>
          </div>

          {/* Column 3: Nearby Locations */}
          <div className="space-y-3">
            <h4 className="font-bold text-white text-xs uppercase tracking-wider border-b border-[#C9A227]/30 pb-2">
              Nearby Locations
            </h4>
            <ul className="space-y-2 text-xs text-[#a09060]">
              <li><Link href="/flats-in-mandi" className="hover:text-[#C9A227] transition-colors">Flats in Mandi Gurgaon</Link></li>
              <li><Link href="/2-bhk-flats-in-mandi" className="hover:text-[#C9A227] transition-colors">2 BHK Flats in Mandi</Link></li>
              <li><Link href="/flats-in-gadaipur" className="hover:text-[#C9A227] transition-colors">Flats in Gadaipur</Link></li>
              <li><Link href="/flats-near-gwal-pahari-gurgaon" className="hover:text-[#C9A227] transition-colors">Flats in Gwal Pahari</Link></li>
              <li><Link href="/properties?location=Ghitorni" className="hover:text-[#C9A227] transition-colors">Flats in Ghitorni</Link></li>
            </ul>
          </div>

          {/* Column 4: Gurgaon & NCR */}
          <div className="space-y-3">
            <h4 className="font-bold text-white text-xs uppercase tracking-wider border-b border-[#C9A227]/30 pb-2">
              Gurgaon & NCR
            </h4>
            <ul className="space-y-2 text-xs text-[#a09060]">
              <li><Link href="/ready-to-move-flats-in-gurgaon" className="hover:text-[#C9A227] transition-colors">Ready to Move Gurgaon</Link></li>
              <li><Link href="/ready-to-move-flats-in-gurgaon" className="hover:text-[#C9A227] transition-colors">3 BHK Builder Floor Gurgaon</Link></li>
              <li><Link href="/ready-to-move-flats-in-gurgaon" className="hover:text-[#C9A227] transition-colors">4 BHK Builder Floor Gurgaon</Link></li>
              <li><Link href="/properties?propertyType=villa" className="hover:text-[#C9A227] transition-colors">Farmhouses & Villas</Link></li>
              <li><Link href="/properties?propertyType=plot" className="hover:text-[#C9A227] transition-colors">Plots & Land Delhi NCR</Link></li>
            </ul>
          </div>

          {/* Column 5: Company */}
          <div className="space-y-3">
            <h4 className="font-bold text-white text-xs uppercase tracking-wider border-b border-[#C9A227]/30 pb-2">
              Company
            </h4>
            <ul className="space-y-2 text-xs text-[#a09060]">
              {companyLinks.map(({ href, label }) => (
                <li key={href}>
                  <Link href={href} className="hover:text-[#C9A227] transition-colors">
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* ── Dedicated Slim Contact Details Banner ── */}
        <div className="mt-8 py-3.5 px-5 sm:px-6 rounded-xl bg-gradient-to-r from-[#171500] via-[#242100] to-[#171500] border border-[#C9A227]/30 shadow-lg">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center">
            {/* Address */}
            <a
              href="https://share.google/DuHqosVcJ03udejB8"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-3 group p-1 rounded-lg hover:bg-white/5 transition-colors"
            >
              <div className="w-9 h-9 rounded-lg bg-[#C9A227]/15 border border-[#C9A227]/30 flex items-center justify-center text-[#C9A227] shrink-0 group-hover:scale-105 transition-transform">
                <MapPin size={17} />
              </div>
              <div>
                <p className="text-[10px] font-bold uppercase tracking-wider text-[#C9A227]">Office Address</p>
                <p className="text-[11px] text-white font-medium leading-snug">
                  Plot No-2, Dalmia Farm, Jonapur, New Delhi 110047
                </p>
              </div>
            </a>

            {/* Phone */}
            <a
              href="tel:+919311059100"
              className="flex items-center gap-3 group p-1 rounded-lg hover:bg-white/5 transition-colors"
            >
              <div className="w-9 h-9 rounded-lg bg-[#C9A227]/15 border border-[#C9A227]/30 flex items-center justify-center text-[#C9A227] shrink-0 group-hover:scale-105 transition-transform">
                <Phone size={17} />
              </div>
              <div>
                <p className="text-[10px] font-bold uppercase tracking-wider text-[#C9A227]">Call Support</p>
                <p className="text-xs text-white font-bold">+91 93110 59100</p>
              </div>
            </a>

            {/* Email */}
            <a
              href="mailto:info@ssrealty.org"
              className="flex items-center gap-3 group p-1 rounded-lg hover:bg-white/5 transition-colors"
            >
              <div className="w-9 h-9 rounded-lg bg-[#C9A227]/15 border border-[#C9A227]/30 flex items-center justify-center text-[#C9A227] shrink-0 group-hover:scale-105 transition-transform">
                <Mail size={17} />
              </div>
              <div>
                <p className="text-[10px] font-bold uppercase tracking-wider text-[#C9A227]">Email Inquiries</p>
                <p className="text-xs text-white font-bold">info@ssrealty.org</p>
              </div>
            </a>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-white/8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5 flex flex-col sm:flex-row items-center justify-between gap-2">
          <p className="text-xs text-[#9a8060]">
            © {year} SS Realty. All rights reserved.
          </p>
          <div className="flex items-center gap-4">
            <Link href="/privacy" className="text-xs text-[#9a8060] hover:text-[#C9A227] transition-colors">Privacy Policy</Link>
            <Link href="/terms" className="text-xs text-[#9a8060] hover:text-[#C9A227] transition-colors">Terms of Service</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
