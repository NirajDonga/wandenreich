'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useToast } from '@/components/shared/ToastProvider';
import { useConfirm } from '@/components/shared/ConfirmDialog';

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
  const { showSuccess, showError } = useToast();
  const { confirm } = useConfirm();
  const [purchases, setPurchases] = useState<Purchase[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [selectedPurchase, setSelectedPurchase] = useState<Purchase | null>(null);
  const [statusUpdating, setStatusUpdating] = useState<string | null>(null);

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

  const handleDelete = async (purchaseId: string) => {
    const confirmed = await confirm({
      title: 'Delete Purchase',
      message: 'Are you sure you want to delete this purchase? This will reverse the stock changes and cannot be undone.',
      confirmText: 'Delete',
      cancelText: 'Cancel',
      variant: 'danger'
    });

    if (!confirmed) return;

    try {
      setDeletingId(purchaseId);
      const response = await fetch(`/api/purchases?id=${purchaseId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to delete purchase');
      }

      await fetchPurchases();
      showSuccess('Purchase deleted successfully!');
    } catch (err) {
      showError(err instanceof Error ? err.message : 'Failed to delete purchase');
    } finally {
      setDeletingId(null);
    }
  };

  const handleStatusUpdate = async (purchaseId: string, newStatus: string) => {
    try {
      setStatusUpdating(purchaseId);
      const response = await fetch('/api/purchases', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          purchaseId,
          paymentStatus: newStatus
        })
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to update status');
      }

      await fetchPurchases();
    } catch (err) {
      console.error('Failed to update status:', err);
      setError(err instanceof Error ? err.message : 'Failed to update status');
    } finally {
      setStatusUpdating(null);
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
                        <select
                          value={purchase.paymentStatus}
                          onChange={(e) => handleStatusUpdate(purchase._id, e.target.value)}
                          disabled={statusUpdating === purchase._id}
                          className={`px-3 py-1 text-xs font-semibold rounded-full border cursor-pointer ${getPaymentStatusBadge(purchase.paymentStatus)} disabled:opacity-50 disabled:cursor-not-allowed`}
                        >
                          <option value="unpaid">UNPAID</option>
                          <option value="partial">PARTIAL</option>
                          <option value="paid">PAID</option>
                        </select>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <div className="flex items-center justify-center gap-2">
                          <button 
                            onClick={() => setSelectedPurchase(purchase)}
                            className="text-blue-600 hover:text-blue-800 font-medium text-sm cursor-pointer"
                          >
                            View
                          </button>
                          <button
                            onClick={() => handleDelete(purchase._id)}
                            disabled={deletingId === purchase._id}
                            className="text-red-600 hover:text-red-800 font-medium text-sm cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            {deletingId === purchase._id ? 'Deleting...' : 'Delete'}
                          </button>
                        </div>
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

      {/* Purchase Details Modal */}
      {selectedPurchase && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="bg-gradient-to-r from-orange-600 to-orange-500 text-white p-6 rounded-t-2xl">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-2xl font-bold mb-2">Purchase Details</h3>
                  <p className="text-orange-100">
                    {selectedPurchase.invoiceNumber ? `Invoice: ${selectedPurchase.invoiceNumber}` : 'No Invoice Number'}
                  </p>
                </div>
                <button
                  onClick={() => setSelectedPurchase(null)}
                  className="text-white hover:bg-white/20 rounded-lg p-2 transition-colors"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-6">
              {/* Supplier Info */}
              <div className="bg-slate-50 rounded-xl p-4">
                <h4 className="font-semibold text-slate-700 mb-3">Supplier Information</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <span className="text-sm text-slate-600">Name:</span>
                    <p className="font-medium text-slate-800">{selectedPurchase.supplierId.name}</p>
                  </div>
                  {selectedPurchase.supplierId.phone && (
                    <div>
                      <span className="text-sm text-slate-600">Phone:</span>
                      <p className="font-medium text-slate-800">{selectedPurchase.supplierId.phone}</p>
                    </div>
                  )}
                  {selectedPurchase.supplierId.contactName && (
                    <div>
                      <span className="text-sm text-slate-600">Contact Person:</span>
                      <p className="font-medium text-slate-800">{selectedPurchase.supplierId.contactName}</p>
                    </div>
                  )}
                  <div>
                    <span className="text-sm text-slate-600">Date:</span>
                    <p className="font-medium text-slate-800">{formatDate(selectedPurchase.createdAt)}</p>
                  </div>
                </div>
              </div>

              {/* Items Table */}
              <div>
                <h4 className="font-semibold text-slate-700 mb-3">Items</h4>
                <div className="border border-slate-200 rounded-xl overflow-hidden">
                  <table className="w-full">
                    <thead className="bg-slate-50">
                      <tr>
                        <th className="px-4 py-3 text-left text-sm font-semibold text-slate-700">Product</th>
                        <th className="px-4 py-3 text-right text-sm font-semibold text-slate-700">Quantity</th>
                        <th className="px-4 py-3 text-right text-sm font-semibold text-slate-700">Unit Cost</th>
                        <th className="px-4 py-3 text-right text-sm font-semibold text-slate-700">Total</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200">
                      {selectedPurchase.items.map((item, idx) => (
                        <tr key={idx} className="hover:bg-slate-50">
                          <td className="px-4 py-3 text-slate-800">{item.productId.name}</td>
                          <td className="px-4 py-3 text-right text-slate-600">
                            {item.quantity} {item.productId.unitOfMeasure}
                          </td>
                          <td className="px-4 py-3 text-right text-slate-600">₹{item.unitCost.toFixed(2)}</td>
                          <td className="px-4 py-3 text-right font-medium text-slate-800">
                            ₹{item.totalCost.toFixed(2)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Payment Summary */}
              <div className="bg-slate-50 rounded-xl p-4 space-y-3">
                <h4 className="font-semibold text-slate-700 mb-3">Payment Summary</h4>
                <div className="flex justify-between items-center">
                  <span className="text-slate-600">Total Amount:</span>
                  <span className="font-semibold text-lg text-slate-800">₹{selectedPurchase.totalAmount.toFixed(2)}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-600">Amount Paid:</span>
                  <span className="font-semibold text-green-600">₹{selectedPurchase.amountPaid.toFixed(2)}</span>
                </div>
                <div className="flex justify-between items-center pt-3 border-t border-slate-300">
                  <span className="text-slate-700 font-medium">Balance Due:</span>
                  <span className="font-bold text-xl text-orange-600">₹{selectedPurchase.balanceDue.toFixed(2)}</span>
                </div>
                <div className="flex justify-between items-center pt-2">
                  <span className="text-slate-600">Payment Method:</span>
                  <span className="font-medium text-slate-800 uppercase">{selectedPurchase.paymentMethod}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-600">Payment Status:</span>
                  <span className={`px-3 py-1 text-xs font-semibold rounded-full border ${getPaymentStatusBadge(selectedPurchase.paymentStatus)}`}>
                    {selectedPurchase.paymentStatus.toUpperCase()}
                  </span>
                </div>
              </div>

              {/* Notes */}
              {selectedPurchase.notes && (
                <div className="bg-blue-50 rounded-xl p-4">
                  <h4 className="font-semibold text-slate-700 mb-2">Notes</h4>
                  <p className="text-slate-600">{selectedPurchase.notes}</p>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="bg-slate-50 p-6 rounded-b-2xl flex justify-end gap-3">
              <button
                onClick={() => setSelectedPurchase(null)}
                className="px-6 py-2 bg-white border border-slate-300 text-slate-700 rounded-xl hover:bg-slate-100 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
