'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import Link from 'next/link';

interface Unit {
  _id: string;
  name: string;
  symbol: string;
  description?: string;
}

export default function UnitsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [units, setUnits] = useState<Unit[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/signin');
    }
  }, [status, router]);

  useEffect(() => {
    if (session) {
      fetchUnits();
    }
  }, [session]);

  const fetchUnits = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/units');
      const data = await response.json();
      
      if (response.ok) {
        setUnits(data.units || []);
      } else {
        setError(data.error || 'Failed to fetch units');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this unit?')) return;

    try {
      const response = await fetch(`/api/units?id=${id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        fetchUnits();
      } else {
        const data = await response.json();
        alert(data.error || 'Failed to delete unit');
      }
    } catch (err) {
      alert(err instanceof Error ? err.message : 'An error occurred');
    }
  };

  if (status === 'loading' || loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-slate-600">Loading units...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <div className="flex items-center gap-2 text-sm text-slate-600 mb-2">
              <Link href="/dashboard" className="hover:text-blue-600">Dashboard</Link>
              <span>›</span>
              <span className="text-slate-800 font-semibold">Masters</span>
              <span>›</span>
              <span className="text-blue-600">Units</span>
            </div>
            <h1 className="text-4xl font-bold text-slate-800 mb-2">Units of Measurement</h1>
            <p className="text-slate-600">Manage your product measurement units (kg, pcs, liter, etc.)</p>
          </div>
          <Link
            href="/masters/units/create"
            className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-6 py-3 rounded-xl font-semibold hover:from-blue-700 hover:to-indigo-700 transition-all shadow-lg"
          >
            + Add Unit
          </Link>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl mb-6">
            {error}
          </div>
        )}

        {/* Units List */}
        <div className="bg-white/90 backdrop-blur-lg rounded-xl shadow-xl overflow-hidden">
          {units.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">📏</div>
              <p className="text-slate-600 mb-4">No units found. Add your first unit of measurement!</p>
              <Link
                href="/masters/units/create"
                className="text-blue-600 hover:text-blue-700 font-semibold"
              >
                Create Unit
              </Link>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white">
                  <tr>
                    <th className="px-6 py-4 text-left font-semibold">Name</th>
                    <th className="px-6 py-4 text-left font-semibold">Symbol</th>
                    <th className="px-6 py-4 text-left font-semibold">Description</th>
                    <th className="px-6 py-4 text-right font-semibold">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {units.map((unit) => (
                    <tr key={unit._id} className="hover:bg-blue-50 transition-colors">
                      <td className="px-6 py-4 font-medium text-slate-800">{unit.name}</td>
                      <td className="px-6 py-4 text-slate-600">
                        <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-semibold">
                          {unit.symbol}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-slate-600">
                        {unit.description || '-'}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <button
                          onClick={() => handleDelete(unit._id)}
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
