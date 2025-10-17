'use client';

import { useEffect } from 'react';
import { signOut } from 'next-auth/react';
import Link from 'next/link';

export default function SignOutPage() {
  useEffect(() => {
    // Auto sign out after 2 seconds
    const timer = setTimeout(() => {
      signOut({ callbackUrl: '/' });
    }, 2000);

    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-indigo-100 rounded-full mb-4">
            <svg className="w-8 h-8 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
          </div>
          <h2 className="text-3xl font-bold text-slate-800 mb-2">
            Signing Out
          </h2>
          <p className="text-slate-600">
            You are being signed out of your account
          </p>
        </div>

        {/* Sign Out Card */}
        <div className="bg-white/90 backdrop-blur-xl rounded-2xl shadow-xl border border-indigo-200/50 p-8">
          <div className="text-center mb-6">
            <div className="inline-flex items-center justify-center space-x-2">
              <div className="w-2 h-2 bg-indigo-600 rounded-full animate-bounce"></div>
              <div className="w-2 h-2 bg-indigo-600 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
              <div className="w-2 h-2 bg-indigo-600 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
            </div>
            <p className="text-slate-600 mt-4">
              Please wait while we sign you out...
            </p>
          </div>

          <div className="space-y-3">
            <button
              onClick={() => signOut({ callbackUrl: '/' })}
              className="w-full py-3 px-4 bg-gradient-to-r from-indigo-600 to-blue-600 text-white font-semibold rounded-xl hover:shadow-xl transform hover:scale-[1.02] transition-all duration-200"
            >
              Sign Out Now
            </button>
            
            <Link
              href="/dashboard"
              className="block w-full py-3 px-4 bg-white/90 backdrop-blur-xl text-slate-700 font-semibold rounded-xl border border-slate-300 hover:shadow-lg transition-all duration-200 text-center"
            >
              Cancel
            </Link>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-6 text-center">
          <p className="text-xs text-slate-500">
            Thank you for using Wandenreich
          </p>
        </div>
      </div>
    </div>
  );
}
