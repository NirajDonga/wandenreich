'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import Link from 'next/link';

interface Customer {
  _id: string;
  name: string;
  email?: string;
  phone?: string;
  address?: string;
  gstin?: string;
  createdAt: string;
}

export default function CustomersPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/signin');
    }
  }, [status, router]);

  useEffect(() => {
    if (session) {
      fetchCustomers();
    }
  }, [session]);

  const fetchCustomers = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/customers');
      
      if (!response.ok) {
        throw new Error('Failed to fetch customers');
      }

      const data = await response.json();
      setCustomers(data.customers || []);
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
      <header className="bg-white/90 backdrop-blur-lg border-b border-green-200/50 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-4">
              <Link href="/dashboard">
                <h1 className="text-2xl font-bold bg-gradient-to-r from-indigo-600 to-blue-600 bg-clip-text text-transparent cursor-pointer">
                  Wandenreich
                </h1>
              </Link>
              <span className="text-slate-400">/</span>
              <span className="text-slate-700 font-medium">Customers</span>
            </div>
            <Link
              href="/customers/create"
              className="px-4 py-2 bg-gradient-to-r from-green-600 to-green-600 text-white rounded-xl hover:shadow-lg transition-all duration-200 transform hover:scale-105"
            >
              ➕ Add Customer
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-slate-800 mb-2">All Customers</h2>
          <p className="text-slate-600">Manage your customer directory</p>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl mb-6">
            {error}
          </div>
        )}

        {/* Customers Table */}
        <div className="bg-white/90 backdrop-blur-xl rounded-2xl shadow-xl border border-green-200/50 overflow-hidden">
          {customers.length === 0 ? (
            <div className="text-center py-12">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-4">
                <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-slate-800 mb-2">No customers yet</h3>
              <p className="text-slate-600 mb-4">Add your first customer to get started</p>
              <Link
                href="/customers/create"
                className="inline-block px-6 py-3 bg-gradient-to-r from-green-600 to-green-600 text-white rounded-xl hover:shadow-lg transition-all duration-200"
              >
                ➕ Add Your First Customer
              </Link>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-slate-50 border-b border-slate-200">
                  <tr>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-slate-700">Name</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-slate-700">Phone</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-slate-700">Email</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-slate-700">GSTIN</th>
                    <th className="px-6 py-4 text-center text-sm font-semibold text-slate-700">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {customers.map((customer) => (
                    <tr key={customer._id} className="hover:bg-slate-50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="font-medium text-slate-800 uppercase">{customer.name}</div>
                        {customer.address && (
                          <div className="text-sm text-slate-500 mt-1">{customer.address}</div>
                        )}
                      </td>
                      <td className="px-6 py-4 text-slate-600">
                        {customer.phone || '-'}
                      </td>
                      <td className="px-6 py-4 text-slate-600">
                        {customer.email || '-'}
                      </td>
                      <td className="px-6 py-4">
                        {customer.gstin ? (
                          <span className="font-mono text-sm text-slate-700">{customer.gstin}</span>
                        ) : (
                          <span className="text-slate-400">-</span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-center">
                        <button className="text-green-600 hover:text-green-800 font-medium text-sm">
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
        {customers.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
            <div className="bg-white/90 backdrop-blur-lg rounded-xl p-6 border border-green-200/50 shadow-lg">
              <div className="text-sm text-slate-600 mb-1">Total Customers</div>
              <div className="text-2xl font-bold text-green-600">{customers.length}</div>
            </div>
            <div className="bg-white/90 backdrop-blur-lg rounded-xl p-6 border border-slate-200/50 shadow-lg">
              <div className="text-sm text-slate-600 mb-1">With Email</div>
              <div className="text-2xl font-bold text-slate-800">
                {customers.filter(c => c.email).length}
              </div>
            </div>
            <div className="bg-white/90 backdrop-blur-lg rounded-xl p-6 border border-slate-200/50 shadow-lg">
              <div className="text-sm text-slate-600 mb-1">With GSTIN</div>
              <div className="text-2xl font-bold text-slate-800">
                {customers.filter(c => c.gstin).length}
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
