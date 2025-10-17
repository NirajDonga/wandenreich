'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import Link from 'next/link';

export default function CreateProductPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    companyName: '',
    unitOfMeasure: 'pieces',
    customUnit: '',
    quantity: '',
    minStockLevel: ''
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
      const response = await fetch('/api/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      if (!response.ok) {
        const data = await response.json();
        const errorMsg = data.details ? `${data.error}: ${data.details}` : data.error;
        throw new Error(errorMsg || 'Failed to create product');
      }

      setSuccess(true);
      // Reset form
      setFormData({
        name: '',
        companyName: '',
        unitOfMeasure: 'pieces',
        customUnit: '',
        quantity: '',
        minStockLevel: ''
      });

      setTimeout(() => setSuccess(false), 3000);
    } catch (err) { setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    // Convert name and companyName fields to uppercase
    const finalValue = (name === 'name' || name === 'companyName') ? value.toUpperCase() : value;
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
      <header className="bg-white/90 backdrop-blur-lg border-b border-indigo-200/50 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-4">
              <Link href="/dashboard">
                <h1 className="text-2xl font-bold bg-gradient-to-r from-indigo-600 to-blue-600 bg-clip-text text-transparent cursor-pointer">
                  Wandenreich
                </h1>
              </Link>
              <span className="text-slate-400">/</span>
              <span className="text-slate-700 font-medium">Create Product</span>
            </div>
            <div className="flex items-center gap-4">
              <Link
                href="/dashboard"
                className="px-4 py-2 text-slate-700 hover:text-indigo-600 transition-colors"
              >
                Back to Dashboard
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-slate-800 mb-2">Create New Product</h2>
          <p className="text-slate-600">Add a new product to your inventory</p>
        </div>

        {/* Form Card */}
        <div className="bg-white/90 backdrop-blur-xl rounded-2xl shadow-xl border border-indigo-200/50 p-8">
          <form onSubmit={handleSubmit} className="space-y-8">
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm">
                {error}
              </div>
            )}

            {success && (
              <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-xl text-sm">
                Product created successfully!
              </div>
            )}

            {/* Basic Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-slate-800 border-b border-slate-200 pb-2">
                Basic Information
              </h3>

              <div>
                <label htmlFor="name" className="block text-sm font-medium text-slate-700 mb-2">
                  Product Name *
                </label>
                <input
                  id="name"
                  name="name"
                  type="text"
                  required
                  value={formData.name}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all bg-white/50 backdrop-blur-sm"
                  placeholder="e.g., BASMATI RICE"
                />
              </div>

              <div>
                <label htmlFor="companyName" className="block text-sm font-medium text-slate-700 mb-2">
                  Company/Brand Name (Optional)
                </label>
                <input
                  id="companyName"
                  name="companyName"
                  type="text"
                  value={formData.companyName}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all bg-white/50 backdrop-blur-sm"
                  placeholder="e.g., INDIA GATE, FORTUNE"
                />
                <p className="mt-1 text-xs text-slate-500">If provided, displays as: COMPANY - PRODUCT NAME</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="unitOfMeasure" className="block text-sm font-medium text-slate-700 mb-2">
                    Unit of Measure *
                  </label>
                  <select
                    id="unitOfMeasure"
                    name="unitOfMeasure"
                    required
                    value={formData.unitOfMeasure}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all bg-white/50 backdrop-blur-sm"
                  >
                    <option value="pieces">Pieces</option>
                    <option value="kg">Kilograms (kg)</option>
                    <option value="liter">Liters</option>
                    <option value="meter">Meters</option>
                    <option value="box">Box</option>
                    <option value="dozen">Dozen</option>
                    <option value="custom">Custom Unit</option>
                  </select>
                </div>

                {formData.unitOfMeasure === 'custom' && (
                  <div>
                    <label htmlFor="customUnit" className="block text-sm font-medium text-slate-700 mb-2">
                      Custom Unit Name *
                    </label>
                    <input
                      id="customUnit"
                      name="customUnit"
                      type="text"
                      required={formData.unitOfMeasure === 'custom'}
                      value={formData.customUnit}
                      onChange={handleChange}
                      className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all bg-white/50 backdrop-blur-sm"
                      placeholder="e.g., Pack, Bundle"
                    />
                  </div>
                )}
              </div>
            </div>

            {/* Inventory */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-slate-800 border-b border-slate-200 pb-2">
                Inventory
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="quantity" className="block text-sm font-medium text-slate-700 mb-2">
                    Initial Quantity *
                  </label>
                  <input
                    id="quantity"
                    name="quantity"
                    type="number"
                    required
                    value={formData.quantity}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all bg-white/50 backdrop-blur-sm"
                    placeholder="0"
                  />
                </div>

                <div>
                  <label htmlFor="minStockLevel" className="block text-sm font-medium text-slate-700 mb-2">
                    Minimum Stock Level (Optional)
                  </label>
                  <input
                    id="minStockLevel"
                    name="minStockLevel"
                    type="number"
                    value={formData.minStockLevel}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all bg-white/50 backdrop-blur-sm"
                    placeholder="10"
                  />
                  <p className="mt-1 text-xs text-slate-500">Alert when stock falls below this level</p>
                </div>
              </div>
            </div>

            {/* Submit Buttons */}
            <div className="flex gap-4 pt-4">
              <button
                type="submit"
                disabled={loading}
                className="flex-1 py-3 px-6 bg-gradient-to-r from-indigo-600 to-blue-600 text-white font-semibold rounded-xl hover:shadow-xl transform hover:scale-[1.02] transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
              >
                {loading ? (
                  <span className="flex items-center justify-center">
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Creating Product...
                  </span>
                ) : (
                  'Create Product'
                )}
              </button>

              <Link
                href="/dashboard"
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
