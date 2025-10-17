'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import Link from 'next/link';

interface Supplier {
  _id: string;
  name: string;
  contactName?: string;
  email?: string;
  phone?: string;
  address?: string;
  gstin?: string;
  createdAt: string;
}

export default function SuppliersPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/signin');
    }
  }, [status, router]);

  useEffect(() => {
    if (session) {
      fetchSuppliers();
    }
  }, [session]);

  const fetchSuppliers = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/suppliers');
      
      if (!response.ok) {
        throw new Error('Failed to fetch suppliers');
      }

      const data = await response.json();
      setSuppliers(data.suppliers || []);
    } catch (err) { setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-slate-700 text-xl">Loading...</div>
      </div>
    );
  }

  if (!session) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      {/* Header */}
      <header className="bg-white/90 backdrop-blur-lg border-b border-blue-200/50 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-4">
              <Link href="/dashboard">
                <h1 className="text-2xl font-bold bg-gradient-to-r from-indigo-600 to-blue-600 bg-clip-text text-transparent cursor-pointer">
                  Wandenreich
                </h1>
              </Link>
              <span className="text-slate-400">/</span>
              <span className="text-slate-700 font-medium">Suppliers</span>
            </div>
            <Link
              href="/suppliers/create"
              className="px-4 py-2 bg-gradient-to-r from-blue-600 to-blue-600 text-white rounded-xl hover:shadow-lg transition-all duration-200 transform hover:scale-105"
            >
              ➕ Add Supplier
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-slate-800 mb-2">All Suppliers</h2>
          <p className="text-slate-600">Manage your supplier directory</p>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl mb-6">
            {error}
          </div>
        )}

        {/* Suppliers Table */}
        <div className="bg-white/90 backdrop-blur-xl rounded-2xl shadow-xl border border-blue-200/50 overflow-hidden">
          {suppliers.length === 0 ? (
            <div className="text-center py-12">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 rounded-full mb-4">
                <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-slate-800 mb-2">No suppliers yet</h3>
              <p className="text-slate-600 mb-4">Add your first supplier to start purchasing</p>
              <Link
                href="/suppliers/create"
                className="inline-block px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-600 text-white rounded-xl hover:shadow-lg transition-all duration-200"
              >
                ➕ Add Your First Supplier
              </Link>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-slate-50 border-b border-slate-200">
                  <tr>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-slate-700">Company Name</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-slate-700">Contact Person</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-slate-700">Phone</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-slate-700">Email</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-slate-700">GSTIN</th>
                    <th className="px-6 py-4 text-center text-sm font-semibold text-slate-700">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {suppliers.map((supplier) => (
                    <tr key={supplier._id} className="hover:bg-slate-50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="font-medium text-slate-800 uppercase">{supplier.name}</div>
                        {supplier.address && (
                          <div className="text-sm text-slate-500 mt-1">{supplier.address}</div>
                        )}
                      </td>
                      <td className="px-6 py-4 text-slate-600 uppercase">
                        {supplier.contactName || '-'}
                      </td>
                      <td className="px-6 py-4 text-slate-600">
                        {supplier.phone || '-'}
                      </td>
                      <td className="px-6 py-4 text-slate-600">
                        {supplier.email || '-'}
                      </td>
                      <td className="px-6 py-4">
                        {supplier.gstin ? (
                          <span className="font-mono text-sm text-slate-700">{supplier.gstin}</span>
                        ) : (
                          <span className="text-slate-400">-</span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-center">
                        <button className="text-blue-600 hover:text-blue-800 font-medium text-sm">
                          View
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Summary Stats */}
        {suppliers.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
            <div className="bg-white/90 backdrop-blur-lg rounded-xl p-6 border border-blue-200/50 shadow-lg">
              <div className="text-sm text-slate-600 mb-1">Total Suppliers</div>
              <div className="text-2xl font-bold text-blue-600">{suppliers.length}</div>
            </div>
            <div className="bg-white/90 backdrop-blur-lg rounded-xl p-6 border border-slate-200/50 shadow-lg">
              <div className="text-sm text-slate-600 mb-1">With Email</div>
              <div className="text-2xl font-bold text-slate-800">
                {suppliers.filter(s => s.email).length}
              </div>
            </div>
            <div className="bg-white/90 backdrop-blur-lg rounded-xl p-6 border border-slate-200/50 shadow-lg">
              <div className="text-sm text-slate-600 mb-1">With GSTIN</div>
              <div className="text-2xl font-bold text-slate-800">
                {suppliers.filter(s => s.gstin).length}
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
