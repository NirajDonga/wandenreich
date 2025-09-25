'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { QuickInventoryAdd } from '../../../components/inventory';

export default function QuickAddPage() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      {/* Page Header */}
      <div className="bg-white shadow-sm border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-slate-900">Quick Add New Inventory</h1>
              <p className="mt-1 text-sm text-slate-600">
                🔥 Got new stock today? Add both product and stock in one easy step!
              </p>
            </div>
            <a
              href="/dashboard"
              className="px-4 py-2 text-slate-600 hover:text-slate-900 transition-colors"
            >
              ← Back to Dashboard
            </a>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-8">
          <QuickInventoryAdd 
            onClose={() => router.push('/dashboard')}
            onSuccess={() => router.push('/dashboard')}
          />
        </div>
      </main>
    </div>
  );
}