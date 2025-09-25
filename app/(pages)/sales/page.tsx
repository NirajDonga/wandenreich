'use client';

import React from 'react';
import { SalesManagement } from '../../../components/inventory';

export default function SalesPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      {/* Page Header */}
      <div className="bg-white shadow-sm border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-slate-900">Sales & Billing</h1>
              <p className="mt-1 text-sm text-slate-600">
                Create sales orders, manage customers, and generate invoices for your business
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
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <SalesManagement />
      </main>
    </div>
  );
}