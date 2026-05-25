'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { Lock, ArrowRight, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';

export default function AdminLogin() {
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password }),
      });

      if (res.ok) {
        toast.success('Login successful');
        router.push('/admin');
        router.refresh();
      } else {
        toast.error('Invalid password');
      }
    } catch (error) {
      toast.error('Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#1A1800] flex items-center justify-center p-4 relative overflow-hidden">
      {/* Decorative Premium Pattern Overlay */}
      <div className="absolute inset-0 opacity-[0.05] pointer-events-none" style={{ backgroundImage: 'radial-gradient(#C9A227 1px, transparent 1px)', backgroundSize: '32px 32px' }} />
      
      <div className="w-full max-w-md bg-black/40 backdrop-blur-xl border border-white/10 rounded-3xl shadow-2xl p-8 relative z-10">
        <div className="flex justify-center mb-8">
          <div className="relative w-48 h-16">
            <Image 
              src="/SS Realty.png" 
              alt="SS Realty Admin" 
              fill
              className="object-contain filter brightness-0 invert"
            />
          </div>
        </div>

        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-white mb-2 font-[var(--font-playfair)]">Admin Portal</h1>
          <p className="text-white/60 text-sm">Enter your secret token to access the dashboard</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-6">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <Lock className="h-5 w-5 text-[#C9A227]" />
            </div>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Admin Secret Token"
              className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-12 pr-4 text-white placeholder:text-white/40 focus:outline-none focus:border-[#C9A227] focus:ring-1 focus:ring-[#C9A227] transition-all"
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full relative group overflow-hidden bg-gradient-to-r from-[#C9A227] via-[#F0D060] to-[#B8860B] text-[#1A1800] font-bold py-3.5 rounded-xl shadow-[0_4px_20px_rgba(201,162,39,0.3)] transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-70 disabled:hover:scale-100 flex items-center justify-center gap-2"
          >
            {loading ? (
              <Loader2 className="animate-spin" size={20} />
            ) : (
              <>
                Access Dashboard
                <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
