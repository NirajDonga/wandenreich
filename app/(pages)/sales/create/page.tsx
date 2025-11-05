'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import Link from 'next/link';

// Import types
import type { Product, Customer, PaymentMethod } from '@/lib/types/sales';

// Import components
import CustomerSelector from '@/components/sales/CustomerSelector';
import AddItemForm from '@/components/sales/AddItemForm';
import SaleItemsTable from '@/components/sales/SaleItemsTable';
import PaymentDetailsForm from '@/components/sales/PaymentDetailsForm';

// Import hooks
import { useSaleItems } from '@/hooks/sales/useSaleItems';

// Import utils
import { calculateTotal } from '@/lib/utils/sales';

export default function CreateSalePage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  
  const [products, setProducts] = useState<Product[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loadingData, setLoadingData] = useState(true);
  
  const [selectedCustomerId, setSelectedCustomerId] = useState('walk-in');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('cash');
  const [amountPaid, setAmountPaid] = useState('');
  const [invoiceNumber, setInvoiceNumber] = useState('');
  const [notes, setNotes] = useState('');
  
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Use custom hook for managing sale items
  const {
    saleItems,
    addItem,
    removeItem,
    updateItemTaxType,
    updateItemTaxRate
  } = useSaleItems();

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/signin');
    }
  }, [status, router]);

  useEffect(() => {
    if (session) {
      fetchData();
    }
  }, [session]);

  // Fetch data on mount
  const fetchData = async () => {
    try {
      setLoadingData(true);
      const [productsRes, customersRes] = await Promise.all([
        fetch('/api/products'),
        fetch('/api/customers')
      ]);

      if (!productsRes.ok || !customersRes.ok) {
        throw new Error('Failed to fetch data');
      }

      const productsData = await productsRes.json();
      const customersData = await customersRes.json();

      setProducts(productsData.products || []);
      setCustomers(customersData.customers || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoadingData(false);
    }
  };

  // Submit sale order
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!selectedCustomerId) {
      setError('Please select a customer');
      return;
    }

    if (saleItems.length === 0) {
      setError('Please add at least one product to the sale');
      return;
    }

    const totalAmount = calculateTotal(saleItems);
    const paidAmount = parseFloat(amountPaid) || 0;

    if (paidAmount < 0) {
      setError('Amount paid cannot be negative');
      return;
    }

    // Check walk-in customer full payment requirement
    if (selectedCustomerId === 'walk-in' && paidAmount < totalAmount) {
      setError('Walk-in customers must pay the full amount');
      return;
    }

    try {
      setLoading(true);

      const response = await fetch('/api/sales', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customerId: selectedCustomerId === 'walk-in' ? null : selectedCustomerId,
          items: saleItems.map(item => ({
            productId: item.productId,
            quantity: item.quantity,
            sellingPrice: item.sellingPrice,
            taxType: item.taxType,
            taxRate: item.taxRate,
            taxAmount: item.taxAmount,
            totalPrice: item.totalPrice
          })),
          paymentMethod,
          amountPaid: paidAmount,
          invoiceNumber,
          notes
        })
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to create sale');
      }

      router.push('/sales');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  if (status === 'loading' || loadingData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-orange-50 to-indigo-100 flex items-center justify-center">
        <div className="text-slate-600">Loading...</div>
      </div>
    );
  }

  const totalAmount = calculateTotal(saleItems);
  const paidAmount = parseFloat(amountPaid) || 0;
  const balanceAmount = totalAmount - paidAmount;

  return (
    <div className="min-h-screen bg-slate-100">
      <div className="container mx-auto px-4 py-6 max-w-7xl">
        <div className="mb-4">
          <Link href="/sales" className="text-blue-600 hover:text-blue-800 text-sm inline-block">
            ← Back to Sales
          </Link>
          <h2 className="text-2xl font-bold text-slate-800 mt-2">Sales Order</h2>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4 text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4" style={{ overflow: 'visible' }}>
          {/* Customer Selection */}
          <div className="bg-white rounded-lg shadow border border-slate-200 p-4" style={{ overflow: 'visible' }}>
            <h3 className="text-sm font-semibold text-slate-700 mb-3 border-b border-slate-200 pb-2">Customer Information</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4" style={{ overflow: 'visible' }}>
              <CustomerSelector
                customers={customers}
                selectedCustomerId={selectedCustomerId}
                onCustomerSelect={setSelectedCustomerId}
              />

              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">
                  Invoice Number (Optional)
                </label>
                <input
                  type="text"
                  value={invoiceNumber}
                  onChange={(e) => setInvoiceNumber(e.target.value)}
                  placeholder="Invoice #"
                  className="w-full px-2 py-1.5 text-sm border border-slate-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>
          </div>

          {/* Add Products */}
          <AddItemForm
            products={products}
            onAddItem={addItem}
            onError={setError}
          />

          {/* Sale Items Table */}
          {saleItems.length > 0 && (
            <div className="bg-white rounded-lg shadow border border-slate-200 p-6">
              <h3 className="text-lg font-semibold text-slate-800 mb-4 border-b border-slate-200 pb-2">Sale Items</h3>
              <SaleItemsTable
                items={saleItems}
                onUpdateTaxType={updateItemTaxType}
                onUpdateTaxRate={updateItemTaxRate}
                onRemoveItem={removeItem}
              />
            </div>
          )}

          {/* Payment Details */}
          {saleItems.length > 0 && (
            <PaymentDetailsForm
              paymentMethod={paymentMethod}
              amountPaid={amountPaid}
              notes={notes}
              totalAmount={totalAmount}
              isWalkInCustomer={selectedCustomerId === 'walk-in'}
              onPaymentMethodChange={setPaymentMethod}
              onAmountPaidChange={setAmountPaid}
              onNotesChange={setNotes}
            />
          )}

          {/* Submit Button */}
          {saleItems.length > 0 && (
            <div className="bg-white rounded-lg shadow border border-slate-200 p-4">
              <button
                type="submit"
                disabled={loading}
                className="w-full px-4 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium text-sm"
              >
                {loading ? 'Creating Sale...' : `Complete Sale - ₹${totalAmount.toFixed(2)}`}
              </button>
              
              {selectedCustomerId === 'walk-in' && balanceAmount > 0 && (
                <p className="text-xs text-orange-600 text-center mt-2 font-medium">
                  ⚠️ Walk-in customer requires full payment (Balance: ₹{balanceAmount.toFixed(2)})
                </p>
              )}
            </div>
          )}
        </form>
      </div>
    </div>
  );
}
