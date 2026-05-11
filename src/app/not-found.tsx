import Link from 'next/link';
import { Home, ArrowLeft } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-[#FFFEF5] flex items-center justify-center px-4">
      <div className="text-center max-w-lg">
        <div className="text-[10rem] font-bold font-[var(--font-playfair)] gold-text-gradient leading-none mb-6">
          404
        </div>
        <h1 className="text-3xl font-bold text-[#1A1800] mb-3 font-[var(--font-playfair)]">Page Not Found</h1>
        <p className="text-[#6b6450] mb-10">
          The page you&apos;re looking for doesn&apos;t exist or has been moved. Let us help you find what you need.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link href="/" className="btn-primary px-8 py-3">
            <Home size={18} /> Go Home
          </Link>
          <Link href="/properties" className="btn-outline px-8 py-3">
            <ArrowLeft size={18} /> Browse Properties
          </Link>
        </div>
      </div>
    </div>
  );
}
