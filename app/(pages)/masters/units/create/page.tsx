'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import Link from 'next/link';

export default function CreateUnitPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [name, setName] = useState('');
  const [symbol, setSymbol] = useState('');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/signin');
    }
  }, [status, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!name.trim() || !symbol.trim()) {
      setError('Name and symbol are required');
      return;
    }

    try {
      setLoading(true);

      const response = await fetch('/api/units', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: name.trim(),
          symbol: symbol.trim(),
          description: description.trim() || undefined
        })
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to create unit');
      }

      router.push('/masters/units');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  if (status === 'loading') {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-slate-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 p-8">
      <div className="max-w-2xl mx-auto">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-sm text-slate-600 mb-6">
          <Link href="/dashboard" className="hover:text-blue-600">Dashboard</Link>
          <span>›</span>
          <Link href="/masters/units" className="hover:text-blue-600">Units</Link>
          <span>›</span>
          <span className="text-blue-600">Create</span>
        </div>

        <div className="bg-white/90 backdrop-blur-lg rounded-xl shadow-xl p-8">
          <h1 className="text-3xl font-bold text-slate-800 mb-6">Add New Unit</h1>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl mb-6">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-slate-700 font-semibold mb-2">
                Unit Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="e.g., Kilogram, Piece, Liter"
                required
              />
            </div>

            <div>
              <label className="block text-slate-700 font-semibold mb-2">
                Symbol <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={symbol}
                onChange={(e) => setSymbol(e.target.value)}
                className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="e.g., kg, pcs, L"
                required
              />
            </div>

            <div>
              <label className="block text-slate-700 font-semibold mb-2">
                Description (Optional)
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Enter description"
                rows={3}
              />
            </div>

            <div className="flex gap-4">
              <button
                type="submit"
                disabled={loading}
                className="flex-1 bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-6 py-3 rounded-xl font-semibold hover:from-blue-700 hover:to-indigo-700 transition-all shadow-lg disabled:opacity-50"
              >
                {loading ? 'Creating...' : 'Create Unit'}
              </button>
              <button
                type="button"
                onClick={() => router.push('/masters/units')}
                className="px-6 py-3 border border-slate-300 rounded-xl font-semibold hover:bg-slate-50 transition-colors"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>

        {/* Common Units Reference */}
        <div className="mt-6 bg-blue-50 border border-blue-200 rounded-xl p-6">
          <h3 className="font-semibold text-blue-900 mb-3">💡 Common Units</h3>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3 text-sm text-blue-800">
            <div>• Kilogram (kg)</div>
            <div>• Gram (g)</div>
            <div>• Liter (L)</div>
            <div>• Milliliter (ml)</div>
            <div>• Piece (pcs)</div>
            <div>• Dozen (dzn)</div>
            <div>• Box (box)</div>
            <div>• Meter (m)</div>
            <div>• Square Meter (sqm)</div>
          </div>
        </div>
      </div>
    </div>
  );
}
