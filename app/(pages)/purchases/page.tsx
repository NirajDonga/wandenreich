'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import Link from 'next/link';

interface PurchaseItem {
  productId: {
    _id: string;
    name: string;
    unitOfMeasure: string;
  };
  quantity: number;
  unitCost: number;
  totalCost: number;
}

interface Purchase {
  _id: string;
  supplierId: {
    _id: string;
    name: string;
    phone?: string;
    contactName?: string;
  };
  items: PurchaseItem[];
  totalAmount: number;
  amountPaid: number;
  balanceDue: number;
  paymentMethod: string;
  paymentStatus: 'paid' | 'partial' | 'unpaid';
  invoiceNumber?: string;
  notes?: string;
  createdAt: string;
}

export default function PurchasesPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [purchases, setPurchases] = useState<Purchase[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/signin');
    }
  }, [status, router]);

  useEffect(() => {
    if (session) {
      fetchPurchases();
    }
  }, [session]);

  const fetchPurchases = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/purchases');
      
      if (!response.ok) {
        throw new Error('Failed to fetch purchases');
      }

      const data = await response.json();
      setPurchases(data.purchases || []);
    } catch (err) { setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getPaymentStatusBadge = (status: string) => {
    const styles = {
      paid: 'bg-green-100 text-green-700 border-green-300',
      partial: 'bg-orange-100 text-orange-700 border-orange-300',
      unpaid: 'bg-red-100 text-red-700 border-red-300'
    };
    return styles[status as keyof typeof styles] || styles.unpaid;
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
      <header className="bg-white/90 backdrop-blur-lg border-b border-orange-200/50 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-4">
              <Link href="/dashboard">
                <h1 className="text-2xl font-bold bg-gradient-to-r from-indigo-600 to-blue-600 bg-clip-text text-transparent cursor-pointer">
                  Wandenreich
                </h1>
              </Link>
              <span className="text-slate-400">/</span>
              <span className="text-slate-700 font-medium">Purchase Orders</span>
            </div>
            <Link
              href="/purchases/create"
              className="px-4 py-2 bg-gradient-to-r from-orange-600 to-orange-600 text-white rounded-xl hover:shadow-lg transition-all duration-200 transform hover:scale-105"
            >
              ➕ Add Purchase
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-slate-800 mb-2">Purchase Orders</h2>
          <p className="text-slate-600">Track all purchases from suppliers</p>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl mb-6">
            {error}
          </div>
        )}

        {/* Purchases Table */}
        <div className="bg-white/90 backdrop-blur-xl rounded-2xl shadow-xl border border-orange-200/50 overflow-hidden">
          {purchases.length === 0 ? (
            <div className="text-center py-12">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-orange-100 rounded-full mb-4">
                <svg className="w-8 h-8 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-slate-800 mb-2">No purchase orders yet</h3>
              <p className="text-slate-600 mb-4">Add your first purchase to stock inventory</p>
              <Link
                href="/purchases/create"
                className="inline-block px-6 py-3 bg-gradient-to-r from-orange-600 to-orange-600 text-white rounded-xl hover:shadow-lg transition-all duration-200"
              >
                ➕ Add Your First Purchase
              </Link>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-slate-50 border-b border-slate-200">
                  <tr>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-slate-700">Date</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-slate-700">Supplier</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-slate-700">Invoice</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-slate-700">Items</th>
                    <th className="px-6 py-4 text-right text-sm font-semibold text-slate-700">Total</th>
                    <th className="px-6 py-4 text-right text-sm font-semibold text-slate-700">Paid</th>
                    <th className="px-6 py-4 text-right text-sm font-semibold text-slate-700">Balance</th>
                    <th className="px-6 py-4 text-center text-sm font-semibold text-slate-700">Status</th>
                    <th className="px-6 py-4 text-center text-sm font-semibold text-slate-700">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {purchases.map((purchase) => (
                    <tr key={purchase._id} className="hover:bg-slate-50 transition-colors">
                      <td className="px-6 py-4 text-sm text-slate-600">
                        {formatDate(purchase.createdAt)}
                      </td>
                      <td className="px-6 py-4">
                        <div className="font-medium text-slate-800">{purchase.supplierId.name}</div>
                        {purchase.supplierId.phone && (
                          <div className="text-sm text-slate-500">{purchase.supplierId.phone}</div>
                        )}
                      </td>
                      <td className="px-6 py-4 text-sm text-slate-600">
                        {purchase.invoiceNumber ? (
                          <span className="font-mono">{purchase.invoiceNumber}</span>
                        ) : (
                          <span className="text-slate-400">-</span>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-slate-600">
                          {purchase.items.length} item{purchase.items.length !== 1 ? 's' : ''}
                        </div>
                        <div className="text-xs text-slate-500 mt-1">
                          {purchase.items.slice(0, 2).map((item, idx) => (
                            <div key={idx}>
                              {item.productId.name} ({item.quantity} {item.productId.unitOfMeasure})
                            </div>
                          ))}
                          {purchase.items.length > 2 && (
                            <div className="text-slate-400">+{purchase.items.length - 2} more...</div>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-right font-semibold text-slate-800">
                        ₹{purchase.totalAmount.toFixed(2)}
                      </td>
                      <td className="px-6 py-4 text-right text-slate-600">
                        ₹{purchase.amountPaid.toFixed(2)}
                      </td>
                      <td className="px-6 py-4 text-right">
                        {purchase.balanceDue > 0 ? (
                          <span className="text-orange-600 font-medium">
                            ₹{purchase.balanceDue.toFixed(2)}
                          </span>
                        ) : (
                          <span className="text-green-600">₹0.00</span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-center">
                        <span className={`inline-block px-3 py-1 text-xs font-semibold rounded-full border ${getPaymentStatusBadge(purchase.paymentStatus)}`}>
                          {purchase.paymentStatus.toUpperCase()}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <button className="text-orange-600 hover:text-orange-800 font-medium text-sm">
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
        {purchases.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mt-8">
            <div className="bg-white/90 backdrop-blur-lg rounded-xl p-6 border border-orange-200/50 shadow-lg">
              <div className="text-sm text-slate-600 mb-1">Total Purchases</div>
              <div className="text-2xl font-bold text-orange-600">{purchases.length}</div>
            </div>
            <div className="bg-white/90 backdrop-blur-lg rounded-xl p-6 border border-slate-200/50 shadow-lg">
              <div className="text-sm text-slate-600 mb-1">Total Cost</div>
              <div className="text-2xl font-bold text-slate-800">
                ₹{purchases.reduce((sum, p) => sum + p.totalAmount, 0).toFixed(2)}
              </div>
            </div>
            <div className="bg-white/90 backdrop-blur-lg rounded-xl p-6 border border-green-200/50 shadow-lg">
              <div className="text-sm text-slate-600 mb-1">Amount Paid</div>
              <div className="text-2xl font-bold text-green-600">
                ₹{purchases.reduce((sum, p) => sum + p.amountPaid, 0).toFixed(2)}
              </div>
            </div>
            <div className="bg-white/90 backdrop-blur-lg rounded-xl p-6 border border-orange-200/50 shadow-lg">
              <div className="text-sm text-slate-600 mb-1">Pending Balance</div>
              <div className="text-2xl font-bold text-orange-600">
                ₹{purchases.reduce((sum, p) => sum + p.balanceDue, 0).toFixed(2)}
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
