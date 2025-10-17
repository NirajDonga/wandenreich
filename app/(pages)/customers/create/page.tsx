'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import Link from 'next/link';

export default function CreateCustomerPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    gstin: ''
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
      const response = await fetch('/api/customers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to create customer');
      }

      router.push('/customers');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    // Convert name field to uppercase
    const finalValue = name === 'name' ? value.toUpperCase() : value;
    setFormData(prev => ({ ...prev, [name]: finalValue }));
  };

  if (status === 'loading') {
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
              <Link href="/customers" className="text-slate-600 hover:text-slate-800">Customers</Link>
              <span className="text-slate-400">/</span>
              <span className="text-slate-700 font-medium">Add Customer</span>
            </div>
            <Link
              href="/customers"
              className="px-4 py-2 text-slate-700 hover:text-green-600 transition-colors"
            >
              ← Back to Customers
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-slate-800 mb-2">Add New Customer</h2>
          <p className="text-slate-600">Add a customer to your directory</p>
        </div>

        {/* Form Card */}
        <div className="bg-white/90 backdrop-blur-xl rounded-2xl shadow-xl border border-green-200/50 p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm">
                {error}
              </div>
            )}

            <div>
              <label htmlFor="name" className="block text-sm font-medium text-slate-700 mb-2">
                Customer Name *
              </label>
              <input
                id="name"
                name="name"
                type="text"
                required
                value={formData.name}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all bg-white/50 backdrop-blur-sm"
                placeholder="e.g., Rajesh Kumar"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="phone" className="block text-sm font-medium text-slate-700 mb-2">
                  Phone Number *
                </label>
                <input
                  id="phone"
                  name="phone"
                  type="tel"
                  required
                  value={formData.phone}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all bg-white/50 backdrop-blur-sm"
                  placeholder="+91 98765 43210"
                />
              </div>

              <div>
                <label htmlFor="email" className="block text-sm font-medium text-slate-700 mb-2">
                  Email <span className="text-slate-500 font-normal">(Optional)</span>
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all bg-white/50 backdrop-blur-sm"
                  placeholder="customer@example.com"
                />
              </div>
            </div>

            <div>
              <label htmlFor="address" className="block text-sm font-medium text-slate-700 mb-2">
                Address <span className="text-slate-500 font-normal">(Optional)</span>
              </label>
              <textarea
                id="address"
                name="address"
                rows={3}
                value={formData.address}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all bg-white/50 backdrop-blur-sm resize-none"
                placeholder="123 Main Street, City, State - 400001"
              />
            </div>

            <div>
              <label htmlFor="gstin" className="block text-sm font-medium text-slate-700 mb-2">
                GST Number <span className="text-slate-500 font-normal">(Optional)</span>
              </label>
              <input
                id="gstin"
                name="gstin"
                type="text"
                value={formData.gstin}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all bg-white/50 backdrop-blur-sm font-mono uppercase"
                placeholder="27AAPFU0939F1ZV"
                maxLength={15}
              />
            </div>

            {/* Submit Buttons */}
            <div className="flex gap-4 pt-4">
              <button
                type="submit"
                disabled={loading}
                className="flex-1 py-3 px-6 bg-gradient-to-r from-green-600 to-green-600 text-white font-semibold rounded-xl hover:shadow-xl transform hover:scale-[1.02] transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
              >
                {loading ? 'Adding Customer...' : 'Add Customer'}
              </button>

              <Link
                href="/customers"
                className="px-6 py-3 bg-white/90 backdrop-blur-xl text-slate-700 font-semibold rounded-xl border border-slate-300 hover:shadow-lg transition-all duration-200 text-center"
              >
                Cancel
              </Link>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
}
