'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useToast } from '@/components/shared/ToastProvider';
import { useConfirm } from '@/components/shared/ConfirmDialog';

interface Customer {
  _id: string;
  name: string;
  email?: string;
  phone?: string;
  address?: string;
  gstin?: string;
  createdAt: string;
  balanceOwed?: number;
}

export default function CustomersPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const { showSuccess, showError } = useToast();
  const { confirm } = useConfirm();
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [totalReceivable, setTotalReceivable] = useState(0);

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
      const [customersRes, salesRes] = await Promise.all([
        fetch('/api/customers'),
        fetch('/api/sales')
      ]);
      
      if (!customersRes.ok) {
        throw new Error('Failed to fetch customers');
      }

      const customersData = await customersRes.json();
      const salesData = salesRes.ok ? await salesRes.json() : { sales: [] };

      // Calculate balance owed per customer
      const customersWithBalances = (customersData.customers || []).map((customer: Customer) => {
        const customerSales = (salesData.sales || []).filter(
          (sale: any) => sale.customerId === customer._id
        );
        const balanceOwed = customerSales.reduce((sum: number, sale: any) => sum + (sale.balanceDue || 0), 0);
        return { ...customer, balanceOwed };
      });

      setCustomers(customersWithBalances);
      
      // Calculate total receivable
      const total = customersWithBalances.reduce((sum: number, customer: Customer) => 
        sum + (customer.balanceOwed || 0), 0
      );
      setTotalReceivable(total);
    } catch (err) { setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  // Delete customer with confirmation
  const deleteCustomer = async (id: string) => {
    const confirmed = await confirm({
      title: 'Delete Customer',
      message: 'Are you sure you want to delete this customer? This action cannot be undone.',
      confirmText: 'Delete',
      cancelText: 'Cancel',
      variant: 'danger'
    });

    if (!confirmed) return;

    try {
      setLoading(true);
      const res = await fetch(`/api/customers?id=${id}`, { method: 'DELETE' });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || 'Failed to delete customer');
      }

      // Remove from UI
      setCustomers(prev => prev.filter(c => c._id !== id));
      // Recalculate total receivable
      setTotalReceivable(prev => {
        const removed = customers.find(c => c._id === id)?.balanceOwed || 0;
        return Math.max(0, +(prev - removed).toFixed(2));
      });
      showSuccess('Customer deleted successfully!');
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'An error occurred';
      setError(errorMsg);
      showError(errorMsg);
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

        {totalReceivable > 0 && (
          <div className="mb-6 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-2xl p-6 shadow-xl">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-green-100 text-sm font-medium mb-1">💰 Total Amount Customers Owe You</p>
                <p className="text-4xl font-bold">₹{totalReceivable.toFixed(2)}</p>
                <p className="text-green-100 text-sm mt-2">Outstanding receivables across all customers</p>
              </div>
              <div className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center">
                <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
          </div>
        )}

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
                    <th className="px-6 py-4 text-right text-sm font-semibold text-slate-700">Owes You</th>
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
                      <td className="px-6 py-4 text-right">
                        <span className={`text-sm font-semibold ${(customer.balanceOwed || 0) > 0 ? 'text-green-600' : 'text-slate-400'}`}>
                          ₹{(customer.balanceOwed || 0).toFixed(2)}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <div className="flex items-center justify-center gap-2">
                          <button
                            onClick={() => setSelectedCustomer(customer)}
                            className="text-green-600 hover:text-green-800 font-medium text-sm"
                          >
                            View
                          </button>
                          <Link
                            href={`/customers/edit/${customer._id}`}
                            className="text-slate-700 hover:text-slate-900 font-medium text-sm"
                          >
                            Edit
                          </Link>
                          <button
                            onClick={() => deleteCustomer(customer._id)}
                            className="text-red-600 hover:text-red-800 font-medium text-sm"
                          >
                            Delete
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
      {selectedCustomer && (
        <CustomerModal customer={selectedCustomer} onClose={() => setSelectedCustomer(null)} />
      )}
    </div>
  );
}

// Customer modal component
const CustomerModal = ({ customer, onClose }: { customer: any; onClose: () => void }) => (
  <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
    <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
      <div className="p-6 border-b flex justify-between items-center">
        <h3 className="text-xl font-bold">Customer Details</h3>
        <button onClick={onClose} className="p-2 rounded-lg hover:bg-slate-100">✕</button>
      </div>
      <div className="p-6 space-y-4">
        <div>
          <div className="text-sm text-slate-600">Name</div>
          <div className="font-medium text-slate-800 uppercase">{customer.name}</div>
        </div>
        {customer.phone && (
          <div>
            <div className="text-sm text-slate-600">Phone</div>
            <div className="text-slate-800">{customer.phone}</div>
          </div>
        )}
        {customer.email && (
          <div>
            <div className="text-sm text-slate-600">Email</div>
            <div className="text-slate-800">{customer.email}</div>
          </div>
        )}
        {customer.address && (
          <div>
            <div className="text-sm text-slate-600">Address</div>
            <div className="text-slate-800">{customer.address}</div>
          </div>
        )}
      </div>
      <div className="p-6 border-t flex justify-end">
        <button onClick={onClose} className="px-4 py-2 rounded-xl bg-white border">Close</button>
      </div>
    </div>
  </div>
);
