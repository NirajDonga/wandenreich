'use client';

import { useSession, signOut } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import Link from 'next/link';

interface DashboardStats {
  products: {
    total: number;
    lowStock: number;
    outOfStock: number;
  };
  customers: {
    total: number;
  };
  suppliers: {
    total: number;
  };
  sales: {
    total: number;
    totalRevenue: number;
    pendingBalance: number;
  };
  purchases: {
    total: number;
    totalCost: number;
    pendingBalance: number;
  };
}

export default function DashboardPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/signin');
    }
  }, [status, router]);

  useEffect(() => {
    if (session) {
      fetchStats();
    }
  }, [session]);

  const fetchStats = async () => {
    try {
      setLoading(true);
      const [productsRes, customersRes, suppliersRes, salesRes, purchasesRes] = await Promise.all([
        fetch('/api/products'),
        fetch('/api/customers'),
        fetch('/api/suppliers'),
        fetch('/api/sales'),
        fetch('/api/purchases')
      ]);

      const productsData = await productsRes.json();
      const customersData = await customersRes.json();
      const suppliersData = await suppliersRes.json();
      const salesData = await salesRes.json();
      const purchasesData = await purchasesRes.json();

      const products = productsData.products || [];
      const sales = salesData.sales || [];
      const purchases = purchasesData.purchases || [];

      setStats({
        products: {
          total: products.length,
          lowStock: products.filter((p: { quantity: number; minStockLevel: number }) => p.quantity > 0 && p.quantity <= p.minStockLevel).length,
          outOfStock: products.filter((p: { quantity: number }) => p.quantity === 0).length
        },
        customers: {
          total: customersData.customers?.length || 0
        },
        suppliers: {
          total: suppliersData.suppliers?.length || 0
        },
        sales: {
          total: sales.length,
          totalRevenue: sales.reduce((sum: number, s: { totalAmount: number }) => sum + s.totalAmount, 0),
          pendingBalance: sales.reduce((sum: number, s: { balanceDue: number }) => sum + s.balanceDue, 0)
        },
        purchases: {
          total: purchases.length,
          totalCost: purchases.reduce((sum: number, p: { totalAmount: number }) => sum + p.totalAmount, 0),
          pendingBalance: purchases.reduce((sum: number, p: { balanceDue: number }) => sum + p.balanceDue, 0)
        }
      });
    } catch (err) {
      console.error('Error fetching stats:', err);
    } finally {
      setLoading(false);
    }
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
            <h1 className="text-2xl font-bold bg-gradient-to-r from-indigo-600 to-blue-600 bg-clip-text text-transparent">
              Wandenreich
            </h1>
            <div className="flex items-center gap-4">
              <div className="text-slate-700">
                <p className="text-sm text-slate-600">Welcome back,</p>
                <p className="font-semibold">{session.user?.name}</p>
              </div>
              <button
                onClick={() => signOut({ callbackUrl: '/' })}
                className="px-4 py-2 bg-gradient-to-r from-red-500 to-red-600 hover:shadow-lg text-white rounded-xl transition-all duration-200 transform hover:scale-105"
              >
                Sign Out
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-slate-800 mb-2">Dashboard</h2>
          <p className="text-slate-600">Overview of your inventory and business</p>
        </div>

        {loading ? (
          <div className="text-center py-12">
            <div className="text-slate-600">Loading statistics...</div>
          </div>
        ) : stats ? (
          <>
            {/* Key Metrics Overview */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              {/* Products Stats */}
              <div className="bg-white/90 backdrop-blur-lg rounded-xl p-6 border border-indigo-200/50 shadow-lg">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <p className="text-slate-600 text-sm">Total Products</p>
                    <p className="text-3xl font-bold text-indigo-600">{stats.products.total}</p>
                  </div>
                  <div className="w-12 h-12 bg-indigo-100 rounded-full flex items-center justify-center">
                    <svg className="w-6 h-6 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                    </svg>
                  </div>
                </div>
                <div className="space-y-1">
                  <div className="flex justify-between text-sm">
                    <span className="text-orange-600">Low Stock</span>
                    <span className="font-semibold">{stats.products.lowStock}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-red-600">Out of Stock</span>
                    <span className="font-semibold">{stats.products.outOfStock}</span>
                  </div>
                </div>
              </div>

              {/* Sales Stats */}
              <div className="bg-white/90 backdrop-blur-lg rounded-xl p-6 border border-purple-200/50 shadow-lg">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <p className="text-slate-600 text-sm">Total Sales</p>
                    <p className="text-3xl font-bold text-purple-600">{stats.sales.total}</p>
                  </div>
                  <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
                    <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                    </svg>
                  </div>
                </div>
                <div className="space-y-1">
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-600">Revenue</span>
                    <span className="font-semibold text-green-600">₹{stats.sales.totalRevenue.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-600">Pending</span>
                    <span className="font-semibold text-orange-600">₹{stats.sales.pendingBalance.toFixed(2)}</span>
                  </div>
                </div>
              </div>

              {/* Purchases Stats */}
              <div className="bg-white/90 backdrop-blur-lg rounded-xl p-6 border border-orange-200/50 shadow-lg">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <p className="text-slate-600 text-sm">Total Purchases</p>
                    <p className="text-3xl font-bold text-orange-600">{stats.purchases.total}</p>
                  </div>
                  <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center">
                    <svg className="w-6 h-6 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                  </div>
                </div>
                <div className="space-y-1">
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-600">Total Cost</span>
                    <span className="font-semibold text-red-600">₹{stats.purchases.totalCost.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-600">Pending</span>
                    <span className="font-semibold text-orange-600">₹{stats.purchases.pendingBalance.toFixed(2)}</span>
                  </div>
                </div>
              </div>

              {/* Contacts Stats */}
              <div className="bg-white/90 backdrop-blur-lg rounded-xl p-6 border border-green-200/50 shadow-lg">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <p className="text-slate-600 text-sm">Contacts</p>
                    <p className="text-3xl font-bold text-green-600">{stats.customers.total + stats.suppliers.total}</p>
                  </div>
                  <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                    <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                  </div>
                </div>
                <div className="space-y-1">
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-600">Customers</span>
                    <span className="font-semibold">{stats.customers.total}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-600">Suppliers</span>
                    <span className="font-semibold">{stats.suppliers.total}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Alerts Section */}
            {(stats.products.lowStock > 0 || stats.products.outOfStock > 0) && (
              <div className="mb-8">
                <div className="bg-orange-50 border border-orange-200 rounded-xl p-6">
                  <div className="flex items-start">
                    <div className="flex-shrink-0">
                      <svg className="w-6 h-6 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                      </svg>
                    </div>
                    <div className="ml-3">
                      <h3 className="text-sm font-medium text-orange-800">Stock Alerts</h3>
                      <div className="mt-2 text-sm text-orange-700">
                        {stats.products.outOfStock > 0 && (
                          <p>• {stats.products.outOfStock} product{stats.products.outOfStock !== 1 ? 's are' : ' is'} out of stock</p>
                        )}
                        {stats.products.lowStock > 0 && (
                          <p>• {stats.products.lowStock} product{stats.products.lowStock !== 1 ? 's are' : ' is'} running low</p>
                        )}
                      </div>
                      <div className="mt-3">
                        <Link href="/products" className="text-sm font-medium text-orange-800 hover:text-orange-900">
                          View Products →
                        </Link>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </>
        ) : null}

        {/* Quick Actions - Navigation Cards */}
        <div className="mb-8">
          <h3 className="text-xl font-bold text-slate-800 mb-4">Quick Actions</h3>
        </div>

        {/* Management Sections */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Products Section */}
          <div className="bg-white/90 backdrop-blur-lg rounded-xl p-6 border border-indigo-200/50 shadow-lg">
            <div className="flex items-center gap-3 mb-4">
              <div className="bg-indigo-100 p-2 rounded-lg">
                <svg className="w-5 h-5 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-slate-800">Products</h3>
            </div>
            <div className="space-y-2">
              <Link
                href="/products"
                className="block px-4 py-3 bg-slate-50 hover:bg-indigo-50 rounded-lg transition-colors text-slate-700 hover:text-indigo-600"
              >
                📋 View All Products
              </Link>
              <Link
                href="/products/create"
                className="block px-4 py-3 bg-slate-50 hover:bg-indigo-50 rounded-lg transition-colors text-slate-700 hover:text-indigo-600"
              >
                ➕ Add New Product
              </Link>
            </div>
          </div>

          {/* Customers Section */}
          <div className="bg-white/90 backdrop-blur-lg rounded-xl p-6 border border-green-200/50 shadow-lg">
            <div className="flex items-center gap-3 mb-4">
              <div className="bg-green-100 p-2 rounded-lg">
                <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-slate-800">Customers</h3>
            </div>
            <div className="space-y-2">
              <Link
                href="/customers"
                className="block px-4 py-3 bg-slate-50 hover:bg-green-50 rounded-lg transition-colors text-slate-700 hover:text-green-600"
              >
                📋 View All Customers
              </Link>
              <Link
                href="/customers/create"
                className="block px-4 py-3 bg-slate-50 hover:bg-green-50 rounded-lg transition-colors text-slate-700 hover:text-green-600"
              >
                ➕ Add New Customer
              </Link>
            </div>
          </div>

          {/* Suppliers Section */}
          <div className="bg-white/90 backdrop-blur-lg rounded-xl p-6 border border-blue-200/50 shadow-lg">
            <div className="flex items-center gap-3 mb-4">
              <div className="bg-blue-100 p-2 rounded-lg">
                <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-slate-800">Suppliers</h3>
            </div>
            <div className="space-y-2">
              <Link
                href="/suppliers"
                className="block px-4 py-3 bg-slate-50 hover:bg-blue-50 rounded-lg transition-colors text-slate-700 hover:text-blue-600"
              >
                📋 View All Suppliers
              </Link>
              <Link
                href="/suppliers/create"
                className="block px-4 py-3 bg-slate-50 hover:bg-blue-50 rounded-lg transition-colors text-slate-700 hover:text-blue-600"
              >
                ➕ Add New Supplier
              </Link>
            </div>
          </div>

          {/* Sales Section */}
          <div className="bg-white/90 backdrop-blur-lg rounded-xl p-6 border border-purple-200/50 shadow-lg">
            <div className="flex items-center gap-3 mb-4">
              <div className="bg-purple-100 p-2 rounded-lg">
                <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-slate-800">Sales</h3>
            </div>
            <div className="space-y-2">
              <Link
                href="/sales"
                className="block px-4 py-3 bg-slate-50 hover:bg-purple-50 rounded-lg transition-colors text-slate-700 hover:text-purple-600"
              >
                📋 View All Bills
              </Link>
              <Link
                href="/sales/create"
                className="block px-4 py-3 bg-slate-50 hover:bg-purple-50 rounded-lg transition-colors text-slate-700 hover:text-purple-600"
              >
                ➕ Create New Bill
              </Link>
            </div>
          </div>

          {/* Purchases Section */}
          <div className="bg-white/90 backdrop-blur-lg rounded-xl p-6 border border-orange-200/50 shadow-lg">
            <div className="flex items-center gap-3 mb-4">
              <div className="bg-orange-100 p-2 rounded-lg">
                <svg className="w-5 h-5 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-slate-800">Purchases</h3>
            </div>
            <div className="space-y-2">
              <Link
                href="/purchases"
                className="block px-4 py-3 bg-slate-50 hover:bg-orange-50 rounded-lg transition-colors text-slate-700 hover:text-orange-600"
              >
                📋 View All Purchases
              </Link>
              <Link
                href="/purchases/create"
                className="block px-4 py-3 bg-slate-50 hover:bg-orange-50 rounded-lg transition-colors text-slate-700 hover:text-orange-600"
              >
                ➕ Add Purchase Order
              </Link>
            </div>
          </div>

          {/* Reports Section */}
          <div className="bg-white/90 backdrop-blur-lg rounded-xl p-6 border border-pink-200/50 shadow-lg">
            <div className="flex items-center gap-3 mb-4">
              <div className="bg-pink-100 p-2 rounded-lg">
                <svg className="w-5 h-5 text-pink-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-slate-800">Reports</h3>
            </div>
            <div className="space-y-2">
              <Link
                href="/reports/sales"
                className="block px-4 py-3 bg-slate-50 hover:bg-pink-50 rounded-lg transition-colors text-slate-700 hover:text-pink-600"
              >
                📊 Sales Report
              </Link>
              <Link
                href="/reports/inventory"
                className="block px-4 py-3 bg-slate-50 hover:bg-pink-50 rounded-lg transition-colors text-slate-700 hover:text-pink-600"
              >
                📦 Inventory Report
              </Link>
            </div>
          </div>
        </div>

      </main>
    </div>
  );
}
