'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import Link from 'next/link';

interface Product {
  _id: string;
  name: string;
  companyName?: string;
  unitOfMeasure: string;
  quantity: number;
  minStockLevel: number;
  createdAt: string;
}

export default function ProductsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/signin');
    }
  }, [status, router]);

  useEffect(() => {
    if (session) {
      fetchProducts();
    }
  }, [session]);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/products');
      
      if (!response.ok) {
        throw new Error('Failed to fetch products');
      }

      const data = await response.json();
      setProducts(data.products || []);
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
              <span className="text-slate-700 font-medium">Products</span>
            </div>
            <Link
              href="/products/create"
              className="px-4 py-2 bg-gradient-to-r from-indigo-600 to-blue-600 text-white rounded-xl hover:shadow-lg transition-all duration-200 transform hover:scale-105"
            >
              ➕ Add Product
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-slate-800 mb-2">All Products</h2>
          <p className="text-slate-600">Manage your inventory products</p>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl mb-6">
            {error}
          </div>
        )}

        {/* Products Table */}
        <div className="bg-white/90 backdrop-blur-xl rounded-2xl shadow-xl border border-indigo-200/50 overflow-hidden">
          {products.length === 0 ? (
            <div className="text-center py-12">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-slate-100 rounded-full mb-4">
                <svg className="w-8 h-8 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-slate-800 mb-2">No products yet</h3>
              <p className="text-slate-600 mb-4">Get started by adding your first product</p>
              <Link
                href="/products/create"
                className="inline-block px-6 py-3 bg-gradient-to-r from-indigo-600 to-blue-600 text-white rounded-xl hover:shadow-lg transition-all duration-200"
              >
                ➕ Add Your First Product
              </Link>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-slate-50 border-b border-slate-200">
                  <tr>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-slate-700">Product Name</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-slate-700">Unit</th>
                    <th className="px-6 py-4 text-right text-sm font-semibold text-slate-700">Stock</th>
                    <th className="px-6 py-4 text-center text-sm font-semibold text-slate-700">Status</th>
                    <th className="px-6 py-4 text-center text-sm font-semibold text-slate-700">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {products.map((product) => {
                    const isLowStock = product.minStockLevel > 0 && product.quantity <= product.minStockLevel;
                    const isOutOfStock = product.quantity === 0;
                    
                    return (
                      <tr key={product._id} className="hover:bg-slate-50 transition-colors">
                        <td className="px-6 py-4">
                          <div className="font-medium text-slate-800 uppercase">
                            {product.companyName ? `${product.companyName} - ${product.name}` : product.name}
                          </div>
                        </td>
                        <td className="px-6 py-4 text-slate-600 uppercase">
                          {product.unitOfMeasure}
                        </td>
                        <td className="px-6 py-4 text-right">
                          <span className={`font-semibold ${
                            isOutOfStock ? 'text-red-600' : 
                            isLowStock ? 'text-orange-600' : 
                            'text-green-600'
                          }`}>
                            {product.quantity}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-center">
                          {isOutOfStock ? (
                            <span className="inline-flex px-3 py-1 rounded-full text-xs font-medium bg-red-100 text-red-700">
                              Out of Stock
                            </span>
                          ) : isLowStock ? (
                            <span className="inline-flex px-3 py-1 rounded-full text-xs font-medium bg-orange-100 text-orange-700">
                              Low Stock
                            </span>
                          ) : (
                            <span className="inline-flex px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-700">
                              In Stock
                            </span>
                          )}
                        </td>
                        <td className="px-6 py-4 text-center">
                          <button className="text-indigo-600 hover:text-indigo-800 font-medium text-sm">
                            View
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Summary Stats */}
        {products.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mt-8">
            <div className="bg-white/90 backdrop-blur-lg rounded-xl p-6 border border-slate-200/50 shadow-lg">
              <div className="text-sm text-slate-600 mb-1">Total Products</div>
              <div className="text-2xl font-bold text-slate-800">{products.length}</div>
            </div>
            <div className="bg-white/90 backdrop-blur-lg rounded-xl p-6 border border-green-200/50 shadow-lg">
              <div className="text-sm text-slate-600 mb-1">In Stock</div>
              <div className="text-2xl font-bold text-green-600">
                {products.filter(p => p.quantity > p.minStockLevel).length}
              </div>
            </div>
            <div className="bg-white/90 backdrop-blur-lg rounded-xl p-6 border border-orange-200/50 shadow-lg">
              <div className="text-sm text-slate-600 mb-1">Low Stock</div>
              <div className="text-2xl font-bold text-orange-600">
                {products.filter(p => p.quantity > 0 && p.quantity <= p.minStockLevel).length}
              </div>
            </div>
            <div className="bg-white/90 backdrop-blur-lg rounded-xl p-6 border border-red-200/50 shadow-lg">
              <div className="text-sm text-slate-600 mb-1">Out of Stock</div>
              <div className="text-2xl font-bold text-red-600">
                {products.filter(p => p.quantity === 0).length}
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
