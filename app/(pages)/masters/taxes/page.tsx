'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import Link from 'next/link';

interface Tax {
  _id: string;
  name: string;
  rate: number;
  description?: string;
}

export default function TaxesPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [taxes, setTaxes] = useState<Tax[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/signin');
    }
  }, [status, router]);

  useEffect(() => {
    if (session) {
      fetchTaxes();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [session]);

  const fetchTaxes = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/taxes');
      const data = await response.json();
      
      if (response.ok) {
        setTaxes(data.taxes || []);
      } else {
        setError(data.error || 'Failed to fetch taxes');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this tax?')) return;

    try {
      const response = await fetch(`/api/taxes?id=${id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        fetchTaxes();
      } else {
        const data = await response.json();
        alert(data.error || 'Failed to delete tax');
      }
    } catch (err) {
      alert(err instanceof Error ? err.message : 'An error occurred');
    }
  };

  if (status === 'loading' || loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-600 mx-auto"></div>
          <p className="mt-4 text-slate-600">Loading taxes...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-amber-50 to-orange-100 p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <div className="flex items-center gap-2 text-sm text-slate-600 mb-2">
              <Link href="/dashboard" className="hover:text-amber-600">Dashboard</Link>
              <span>›</span>
              <span className="text-slate-800 font-semibold">Masters</span>
              <span>›</span>
              <span className="text-amber-600">Taxes</span>
            </div>
            <h1 className="text-4xl font-bold text-slate-800 mb-2">Tax & GST Rates</h1>
            <p className="text-slate-600">Manage your tax rates and GST slabs (0%, 5%, 12%, 18%, 28%)</p>
          </div>
          <Link
            href="/masters/taxes/create"
            className="bg-gradient-to-r from-amber-600 to-orange-600 text-white px-6 py-3 rounded-xl font-semibold hover:from-amber-700 hover:to-orange-700 transition-all shadow-lg"
          >
            + Add Tax Rate
          </Link>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl mb-6">
            {error}
          </div>
        )}

        {/* Taxes List */}
        <div className="bg-white/90 backdrop-blur-lg rounded-xl shadow-xl overflow-hidden">
          {taxes.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">💰</div>
              <p className="text-slate-600 mb-4">No tax rates found. Add your first tax rate!</p>
              <Link
                href="/masters/taxes/create"
                className="text-amber-600 hover:text-amber-700 font-semibold"
              >
                Create Tax Rate
              </Link>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gradient-to-r from-amber-600 to-orange-600 text-white">
                  <tr>
                    <th className="px-6 py-4 text-left font-semibold">Tax Name</th>
                    <th className="px-6 py-4 text-left font-semibold">Rate (%)</th>
                    <th className="px-6 py-4 text-left font-semibold">Description</th>
                    <th className="px-6 py-4 text-right font-semibold">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {taxes.map((tax) => (
                    <tr key={tax._id} className="hover:bg-amber-50 transition-colors">
                      <td className="px-6 py-4 font-semibold text-slate-800">{tax.name}</td>
                      <td className="px-6 py-4">
                        <span className="bg-amber-100 text-amber-800 px-4 py-1.5 rounded-full text-sm font-bold">
                          {tax.rate}%
                        </span>
                      </td>
                      <td className="px-6 py-4 text-slate-600">
                        {tax.description || '-'}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <button
                          onClick={() => handleDelete(tax._id)}
                          className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg transition-colors"
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
