'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import Link from 'next/link';

export default function HomePage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === 'authenticated') {
      router.push('/dashboard');
    }
  }, [status, router]);

  if (status === 'loading') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-slate-700 text-xl">Loading...</div>
      </div>
    );
  }

  if (session) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 flex items-center justify-center px-4">
      <div className="max-w-4xl mx-auto text-center">
        <h1 className="text-6xl md:text-7xl font-bold bg-gradient-to-r from-indigo-600 to-blue-600 bg-clip-text text-transparent mb-6">
          Wandenreich
        </h1>
        <p className="text-slate-700 text-xl md:text-2xl mb-8 font-medium">
          Inventory Management System
        </p>
        <p className="text-slate-600 text-lg mb-12 max-w-2xl mx-auto">
          Complete inventory management solution with GSTIN support, stock tracking, purchase & sales orders, and comprehensive ledger management.
        </p>
        
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            href="/auth/signup"
            className="px-8 py-4 bg-gradient-to-r from-indigo-600 to-blue-600 text-white text-lg font-semibold rounded-xl hover:shadow-xl transform hover:scale-105 transition-all duration-200 shadow-lg"
          >
            Get Started
          </Link>
          <Link
            href="/auth/signin"
            className="px-8 py-4 bg-white/90 backdrop-blur-xl text-indigo-600 text-lg font-semibold rounded-xl border border-indigo-200 hover:border-indigo-400 hover:shadow-lg transition-all duration-200"
          >
            Sign In
          </Link>
        </div>
      </div>
    </div>
  );
}
