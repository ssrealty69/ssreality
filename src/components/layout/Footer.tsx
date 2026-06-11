'use client';

import Link from 'next/link';
import Image from 'next/image';
import { Phone, Mail, MapPin, ArrowRight } from 'lucide-react';
import { usePathname } from 'next/navigation';

// Inline SVG brand icons (lucide-react v1 removed brand icons)
const FacebookIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" width="16" height="16">
    <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/>
  </svg>
);
const InstagramIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="16" height="16">
    <rect x="2" y="2" width="20" height="20" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/>
  </svg>
);
const LinkedinIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" width="16" height="16">
    <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"/><rect x="2" y="9" width="4" height="12"/><circle cx="4" cy="4" r="2"/>
  </svg>
);
const YoutubeIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" width="16" height="16">
    <path d="M22.54 6.42a2.78 2.78 0 0 0-1.95-1.96C18.88 4 12 4 12 4s-6.88 0-8.59.46A2.78 2.78 0 0 0 1.46 6.42 29 29 0 0 0 1 12a29 29 0 0 0 .46 5.58 2.78 2.78 0 0 0 1.95 1.97C5.12 20 12 20 12 20s6.88 0 8.59-.45a2.78 2.78 0 0 0 1.95-1.97A29 29 0 0 0 23 12a29 29 0 0 0-.46-5.58z"/><polygon points="9.75 15.02 15.5 12 9.75 8.98 9.75 15.02" fill="#1A1800"/>
  </svg>
);

const quickLinks = [
  { href: '/properties?priceType=sale', label: 'Properties for Sale' },
  { href: '/properties?priceType=rent', label: 'Properties for Rent' },
  { href: '/properties?propertyType=apartment', label: 'Apartments' },
  { href: '/properties?propertyType=villa', label: 'Villas & Bungalows' },
  { href: '/properties?propertyType=commercial', label: 'Commercial Spaces' },
  { href: '/properties?propertyType=plot', label: 'Plots & Land' },
];

const companyLinks = [
  { href: '/about', label: 'About Us' },
  { href: '/blog', label: 'Blog & News' },
  { href: '/contact', label: 'Contact Us' },
  { href: '/careers', label: 'Careers' },
];

const socials = [
  { href: 'https://www.facebook.com/profile.php?id=61571897675312', Icon: FacebookIcon, label: 'Facebook' },
  { href: 'https://www.instagram.com/ss_realty_official', Icon: InstagramIcon, label: 'Instagram' },
  { href: 'https://www.youtube.com/@ssrealty5270', Icon: YoutubeIcon, label: 'YouTube' },
];

export default function Footer() {
  const year = new Date().getFullYear();
  const pathname = usePathname();
  const isFloorPlanPage = pathname?.includes('/floor-plans') || pathname?.includes('/floorview');

  return (
    <footer className="bg-[#0d0c00] text-[#d4c48a]">
      {/* Top CTA Strip */}
      {!isFloorPlanPage && (
        <div className="gold-gradient py-8">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-4">
            <div>
              <h3 className="text-xl font-bold text-[#1A1800] font-[var(--font-playfair)]">
                Ready to Find Your Dream Property?
              </h3>
              <p className="text-[#5c4004] text-sm mt-1">Talk to our experts today — free consultation.</p>
            </div>
            <Link href="/contact"
              className="flex items-center gap-2 bg-[#1A1800] text-[#C9A227] font-semibold px-6 py-3 rounded-xl hover:bg-[#282618] transition-colors whitespace-nowrap"
            >
              Contact Us <ArrowRight size={16} />
            </Link>
          </div>
        </div>
      )}

      {/* Main Footer */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-10">
          {/* Brand */}
          <div className="lg:col-span-1">
            <Link href="/" className="flex items-center mb-5 group">
              <div className="relative w-40 h-14 transition-transform duration-300 group-hover:scale-105">
                <Image 
                  src="/SS Realty.png" 
                  alt="SS Realty Logo" 
                  fill
                  className="object-contain"
                />
              </div>
            </Link>
            <p className="text-sm text-[#a09060] leading-relaxed mb-6">
              Your trusted real estate partner in Delhi NCR. We help you find the perfect property — be it a home, investment, or commercial space.
            </p>
            <div className="flex items-center gap-3">
              {socials.map(({ href, Icon, label }) => (
                <a key={label} href={href} aria-label={label}
                  target="_blank" rel="noopener noreferrer"
                  className="w-9 h-9 rounded-lg bg-white/5 border border-[#C9A227]/20 flex items-center justify-center text-[#C9A227] hover:bg-[#C9A227] hover:text-[#1A1800] transition-all duration-200"
                >
                  <Icon />
                </a>
              ))}
            </div>
          </div>

          {/* Combined Properties & Company for Mobile Side-by-Side */}
          <div className="lg:col-span-2 grid grid-cols-2 lg:grid-cols-2 gap-6 lg:gap-10">
            {/* Quick Links */}
            <div>
              <h4 className="font-semibold text-white mb-5 text-sm tracking-wider uppercase">Properties</h4>
              <ul className="space-y-3">
                {quickLinks.map(({ href, label }) => (
                  <li key={href}>
                    <Link href={href}
                      className="text-sm text-[#a09060] hover:text-[#C9A227] transition-colors flex items-center gap-2 group"
                    >
                      <span className="w-1 h-1 rounded-full bg-[#C9A227]/40 group-hover:bg-[#C9A227] transition-colors" />
                      {label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Company */}
            <div>
              <h4 className="font-semibold text-white mb-5 text-sm tracking-wider uppercase">Company</h4>
              <ul className="space-y-3">
                {companyLinks.map(({ href, label }) => (
                  <li key={href}>
                    <Link href={href}
                      className="text-sm text-[#a09060] hover:text-[#C9A227] transition-colors flex items-center gap-2 group"
                    >
                      <span className="w-1 h-1 rounded-full bg-[#C9A227]/40 group-hover:bg-[#C9A227] transition-colors" />
                      {label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Contact Info */}
          <div className="lg:col-span-1">
            <h4 className="font-semibold text-white mb-5 text-sm tracking-wider uppercase">Contact</h4>
            <ul className="space-y-4">
              <li className="flex items-start gap-3">
                <MapPin size={16} className="text-[#C9A227] mt-0.5 shrink-0" />
                <a 
                  href="https://share.google/DuHqosVcJ03udejB8"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-[#a09060] hover:text-[#C9A227] transition-colors"
                >
                  Plot No-2, Dalmia Farm, Jonapur,<br />New Delhi, Delhi 110047
                </a>
              </li>
              <li>
                <a href="tel:+919311059100" className="flex items-center gap-3 text-sm text-[#a09060] hover:text-[#C9A227] transition-colors">
                  <Phone size={16} className="text-[#C9A227] shrink-0" />
                  +91 93110 59100
                </a>
              </li>
              <li>
                <a href="mailto:info@ssrealty.org" className="flex items-center gap-3 text-sm text-[#a09060] hover:text-[#C9A227] transition-colors">
                  <Mail size={16} className="text-[#C9A227] shrink-0" />
                  info@ssrealty.org
                </a>
              </li>
            </ul>
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
