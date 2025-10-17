'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import Link from 'next/link';

// Import types
import type { Product, Supplier, PaymentMethod } from '@/lib/types/purchases';

// Import components
import SupplierSelector from '@/components/purchases/SupplierSelector';
import AddItemForm from '@/components/purchases/AddItemForm';
import PurchaseItemsTable from '@/components/purchases/PurchaseItemsTable';
import PaymentDetailsForm from '@/components/purchases/PaymentDetailsForm';

// Import hooks
import { usePurchaseItems } from '@/hooks/purchases/usePurchaseItems';

// Import services
import { generatePurchasePDF } from '@/lib/services/pdf.service';

// Import utils
import { calculateTotal } from '@/lib/utils/purchases';

export default function CreatePurchasePage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  
  const [products, setProducts] = useState<Product[]>([]);
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [loadingData, setLoadingData] = useState(true);
  
  const [selectedSupplierId, setSelectedSupplierId] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('cash');
  const [amountPaid, setAmountPaid] = useState('');
  const [invoiceNumber, setInvoiceNumber] = useState('');
  const [notes, setNotes] = useState('');
  
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Use custom hook for managing purchase items
  const {
    purchaseItems,
    addItem,
    removeItem,
    updateItemTaxType,
    updateItemTaxRate
  } = usePurchaseItems();

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
      const [productsRes, suppliersRes] = await Promise.all([
        fetch('/api/products'),
        fetch('/api/suppliers')
      ]);

      if (!productsRes.ok || !suppliersRes.ok) {
        throw new Error('Failed to fetch data');
      }

      const productsData = await productsRes.json();
      const suppliersData = await suppliersRes.json();

      setProducts(productsData.products || []);
      setSuppliers(suppliersData.suppliers || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoadingData(false);
    }
  };

  // Generate PDF handler
  const handleGeneratePDF = () => {
    const selectedSupplier = suppliers.find(s => s._id === selectedSupplierId);
    generatePurchasePDF({
      items: purchaseItems,
      supplier: selectedSupplier,
      invoiceNumber,
      paymentMethod,
      amountPaid,
      notes
    });
  };

  // Submit purchase order
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!selectedSupplierId) {
      setError('Please select a supplier');
      return;
    }

    if (purchaseItems.length === 0) {
      setError('Please add at least one product to the purchase order');
      return;
    }

    const paidAmount = parseFloat(amountPaid) || 0;

    if (paidAmount < 0) {
      setError('Amount paid cannot be negative');
      return;
    }

    try {
      setLoading(true);

      const response = await fetch('/api/purchases', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          supplierId: selectedSupplierId,
          items: purchaseItems.map(item => ({
            productId: item.productId,
            quantity: item.quantity,
            unitCost: item.unitCost,
            taxType: item.taxType,
            taxRate: item.taxRate,
            taxAmount: item.taxAmount,
            totalCost: item.totalCost
          })),
          paymentMethod,
          amountPaid: paidAmount,
          invoiceNumber,
          notes
        })
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to create purchase order');
      }

      router.push('/purchases');
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

  const totalAmount = calculateTotal(purchaseItems);
  const paidAmount = parseFloat(amountPaid) || 0;
  const balanceAmount = totalAmount - paidAmount;

  return (
    <div className="min-h-screen bg-slate-100">
      <div className="container mx-auto px-4 py-6 max-w-7xl">
        <div className="mb-4">
          <Link href="/purchases" className="text-blue-600 hover:text-blue-800 text-sm inline-block">
            ← Back to Purchases
          </Link>
          <h2 className="text-2xl font-bold text-slate-800 mt-2">Purchase Order</h2>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4 text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4" style={{ overflow: 'visible' }}>
          {/* Supplier Selection */}
          <div className="bg-white rounded-lg shadow border border-slate-200 p-4" style={{ overflow: 'visible' }}>
            <h3 className="text-sm font-semibold text-slate-700 mb-3 border-b border-slate-200 pb-2">Supplier Information</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4" style={{ overflow: 'visible' }}>
              <SupplierSelector
                suppliers={suppliers}
                selectedSupplierId={selectedSupplierId}
                onSupplierSelect={setSelectedSupplierId}
              />

              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">
                  Invoice Number (Optional)
                </label>
                <input
                  type="text"
                  value={invoiceNumber}
                  onChange={(e) => setInvoiceNumber(e.target.value)}
                  placeholder="Supplier's invoice #"
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

          {/* Purchase Items Table */}
          {purchaseItems.length > 0 && (
            <div className="bg-white rounded-lg shadow border border-slate-200 p-6">
              <h3 className="text-lg font-semibold text-slate-800 mb-4 border-b border-slate-200 pb-2">Purchase Items</h3>
              <PurchaseItemsTable
                items={purchaseItems}
                onUpdateTaxType={updateItemTaxType}
                onUpdateTaxRate={updateItemTaxRate}
                onRemoveItem={removeItem}
              />
            </div>
          )}

          {/* Payment Details */}
          {purchaseItems.length > 0 && (
            <PaymentDetailsForm
              paymentMethod={paymentMethod}
              amountPaid={amountPaid}
              notes={notes}
              totalAmount={totalAmount}
              onPaymentMethodChange={setPaymentMethod}
              onAmountPaidChange={setAmountPaid}
              onNotesChange={setNotes}
            />
          )}

          {/* Submit Button */}
          {purchaseItems.length > 0 && (
            <div className="flex gap-3">
              <button
                type="button"
                onClick={handleGeneratePDF}
                className="px-6 py-3 bg-slate-600 text-white rounded hover:bg-slate-700 transition-colors font-semibold"
              >
                Download PDF
              </button>
              <button
                type="submit"
                disabled={loading}
                className="flex-1 px-6 py-3 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-semibold"
              >
                {loading ? 'Creating Purchase Order...' : `Complete Purchase Order - ₹${totalAmount.toFixed(2)}`}
              </button>
            </div>
          )}
        </form>
      </div>
    </div>
  );
}
