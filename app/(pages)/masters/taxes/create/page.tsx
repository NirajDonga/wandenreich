'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import Link from 'next/link';

export default function CreateTaxPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    name: '',
    rate: '',
    description: '',
  });

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/signin');
    }
  }, [status, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await fetch('/api/taxes', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: formData.name,
          rate: parseFloat(formData.rate),
          description: formData.description || undefined,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        router.push('/masters/taxes');
      } else {
        setError(data.error || 'Failed to create tax');
      }
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
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-600 mx-auto"></div>
          <p className="mt-4 text-slate-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-amber-50 to-orange-100 p-8">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-2 text-sm text-slate-600 mb-2">
            <Link href="/dashboard" className="hover:text-amber-600">Dashboard</Link>
            <span>›</span>
            <Link href="/masters/taxes" className="hover:text-amber-600">Taxes</Link>
            <span>›</span>
            <span className="text-amber-600">Create</span>
          </div>
          <h1 className="text-4xl font-bold text-slate-800 mb-2">Create Tax Rate</h1>
          <p className="text-slate-600">Add a new tax or GST rate to your system</p>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl mb-6">
            {error}
          </div>
        )}

        {/* Form */}
        <div className="bg-white/90 backdrop-blur-lg rounded-xl shadow-xl p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Tax Name */}
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                Tax Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="e.g., GST 18%, CGST 9%, SGST 9%"
                className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                required
              />
            </div>

            {/* Tax Rate */}
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                Rate (%) <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                step="0.01"
                min="0"
                max="100"
                value={formData.rate}
                onChange={(e) => setFormData({ ...formData, rate: e.target.value })}
                placeholder="e.g., 18"
                className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                required
              />
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                Description (Optional)
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="e.g., Standard GST rate for most goods"
                rows={3}
                className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
              />
            </div>

            {/* Buttons */}
            <div className="flex gap-4 pt-4">
              <Link
                href="/masters/taxes"
                className="flex-1 bg-slate-200 hover:bg-slate-300 text-slate-700 px-6 py-3 rounded-lg font-semibold transition-colors text-center"
              >
                Cancel
              </Link>
              <button
                type="submit"
                disabled={loading}
                className="flex-1 bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700 text-white px-6 py-3 rounded-lg font-semibold transition-all shadow-lg disabled:opacity-50"
              >
                {loading ? 'Creating...' : 'Create Tax'}
              </button>
            </div>
          </form>
        </div>

        {/* Helper Section */}
        <div className="mt-8 bg-amber-50 border border-amber-200 rounded-xl p-6">
          <h3 className="font-semibold text-slate-800 mb-3 flex items-center gap-2">
            <span className="text-2xl">💡</span>
            Common GST Rates in India
          </h3>
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div className="bg-white p-3 rounded-lg">
              <div className="font-semibold text-amber-700">0%</div>
              <div className="text-slate-600">Essential items (grains, milk, eggs)</div>
            </div>
            <div className="bg-white p-3 rounded-lg">
              <div className="font-semibold text-amber-700">5%</div>
              <div className="text-slate-600">Necessities (sugar, tea, coffee, edible oils)</div>
            </div>
            <div className="bg-white p-3 rounded-lg">
              <div className="font-semibold text-amber-700">12%</div>
              <div className="text-slate-600">Processed foods, computers</div>
            </div>
            <div className="bg-white p-3 rounded-lg">
              <div className="font-semibold text-amber-700">18%</div>
              <div className="text-slate-600">Most goods (electronics, clothing)</div>
            </div>
            <div className="bg-white p-3 rounded-lg">
              <div className="font-semibold text-amber-700">28%</div>
              <div className="text-slate-600">Luxury items (cars, cigarettes)</div>
            </div>
            <div className="bg-white p-3 rounded-lg">
              <div className="font-semibold text-amber-700">CGST/SGST</div>
              <div className="text-slate-600">Split GST (9% + 9% = 18%)</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
