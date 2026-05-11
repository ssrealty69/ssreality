import Link from 'next/link';
import { ArrowRight, Phone } from 'lucide-react';

export default function CTASection() {
  return (
    <section className="section-padding relative overflow-hidden">
      <div className="absolute inset-0 gold-gradient opacity-95" />
      <div className="absolute top-[-20%] right-[-10%] w-80 h-80 rounded-full bg-white/10 pointer-events-none" />
      <div className="absolute bottom-[-20%] left-[-5%] w-64 h-64 rounded-full bg-white/8 pointer-events-none" />

      <div className="max-w-4xl mx-auto px-4 text-center relative z-10">
        <h2 className="text-4xl md:text-5xl font-[var(--font-playfair)] text-[#1A1800] mb-5">
          Ready to Find Your Dream Property?
        </h2>
        <p className="text-[#5c4004] text-lg mb-10 max-w-2xl mx-auto">
          Our expert team is ready to help you navigate the Delhi NCR real estate market. Get a free consultation today!
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link href="/properties"
            className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-[#1A1800] text-[#C9A227] font-semibold rounded-xl hover:bg-[#282618] transition-all shadow-lg hover:-translate-y-0.5 text-base"
          >
            Browse Properties <ArrowRight size={18} />
          </Link>
          <a href="tel:+919311059100"
            className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-white/90 text-[#1A1800] font-semibold rounded-xl hover:bg-white transition-all shadow-lg hover:-translate-y-0.5 text-base"
          >
            <Phone size={18} className="text-[#B8860B]" />
            Call: +91 93110 59100
          </a>
        </div>
      </div>
    </section>
  );
}
