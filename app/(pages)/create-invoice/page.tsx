'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button, Input, Select } from '../../../components/ui';

// Types
interface Customer {
  _id: string;
  name: string;
  phone: string;
  email: string;
  address?: string;
}

interface Product {
  _id: string;
  name: string;
  sku: string;
  sellingPrice: number;
  costPrice: number;
  stock: number;
  unitOfMeasure: {
    name: string;
    abbreviation: string;
  };
}

interface InvoiceItem {
  id: string; // temporary ID for form management
  productId?: string;
  productName: string;
  sku: string;
  quantity: number;
  unitPrice: number;
  discount: number;
  taxRate: number;
  unitName: string;
  total: number;
  isExisting: boolean; // whether product exists in catalog
  availableStock: number;
}

export default function CreateInvoicePage() {
  const router = useRouter();
  
  // Form state
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [selectedCustomerId, setSelectedCustomerId] = useState('');
  const [invoiceNumber, setInvoiceNumber] = useState(`INV-${new Date().getFullYear()}-${String(Date.now()).slice(-6)}`);
  const [invoiceDate, setInvoiceDate] = useState(new Date().toISOString().split('T')[0]);
  const [dueDate, setDueDate] = useState(new Date(Date.now() + 30*24*60*60*1000).toISOString().split('T')[0]); // 30 days from now
  const [paymentTerms, setPaymentTerms] = useState('NET30');
  const [notes, setNotes] = useState('');
  const [invoiceItems, setInvoiceItems] = useState<InvoiceItem[]>([
    {
      id: '1',
      productName: '',
      sku: '',
      quantity: 1,
      unitPrice: 0,
      discount: 0,
      taxRate: 18, // Default GST rate
      unitName: '',
      total: 0,
      isExisting: false,
      availableStock: 0
    }
  ]);
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  // Load initial data
  useEffect(() => {
    loadCustomers();
    loadProducts();
  }, []);

  const loadCustomers = async () => {
    try {
      const response = await fetch('/api/customers');
      if (response.ok) {
        const data = await response.json();
        setCustomers(Array.isArray(data) ? data : data.customers || []);
      }
    } catch (error) {
      console.error('Error loading customers:', error);
    }
  };

  const loadProducts = async () => {
    try {
      const response = await fetch('/api/products');
      if (response.ok) {
        const data = await response.json();
        const productsData = Array.isArray(data) ? data : data.products || [];
        
        // Get stock data for each product
        const productsWithStock = await Promise.all(
          productsData.map(async (product: Product) => {
            try {
              const stockResponse = await fetch(`/api/inventory?productId=${product._id}`);
              if (stockResponse.ok) {
                const stockData = await stockResponse.json();
                const inventory = Array.isArray(stockData) ? stockData : stockData.inventory || [];
                const stockItem = inventory.find((inv: any) => inv.product._id === product._id);
                return {
                  ...product,
                  stock: stockItem ? stockItem.currentStock : 0
                };
              }
              return { ...product, stock: 0 };
            } catch {
              return { ...product, stock: 0 };
            }
          })
        );
        
        setProducts(productsWithStock);
      }
    } catch (error) {
      console.error('Error loading products:', error);
    }
  };

  // Add new empty item row
  const addNewItem = () => {
    const newItem: InvoiceItem = {
      id: Date.now().toString(),
      productName: '',
      sku: '',
      quantity: 1,
      unitPrice: 0,
      discount: 0,
      taxRate: 18,
      unitName: '',
      total: 0,
      isExisting: false,
      availableStock: 0
    };
    setInvoiceItems([...invoiceItems, newItem]);
  };

  // Remove item row
  const removeItem = (id: string) => {
    if (invoiceItems.length > 1) {
      setInvoiceItems(invoiceItems.filter(item => item.id !== id));
    }
  };

  // Update item data
  const updateItem = (id: string, field: keyof InvoiceItem, value: any) => {
    setInvoiceItems(items => items.map(item => {
      if (item.id === id) {
        const updated = { ...item, [field]: value };
        
        // Auto-calculate total when quantity, unit price, discount, or tax changes
        if (['quantity', 'unitPrice', 'discount', 'taxRate'].includes(field)) {
          const subtotal = updated.quantity * updated.unitPrice;
          const discountAmount = subtotal * (updated.discount / 100);
          const afterDiscount = subtotal - discountAmount;
          const taxAmount = afterDiscount * (updated.taxRate / 100);
          updated.total = afterDiscount + taxAmount;
        }
        
        return updated;
      }
      return item;
    }));
  };

  // Search and auto-fill product data
  const searchProduct = (id: string, searchValue: string) => {
    if (!searchValue.trim()) return;
    
    // Capitalize the search term
    const capitalizedSearch = searchValue.toUpperCase();
    
    // Search by name or SKU
    const found = products.find(p => 
      p.name.toUpperCase().includes(capitalizedSearch) ||
      p.sku.toUpperCase().includes(capitalizedSearch)
    );
    
    if (found) {
      setInvoiceItems(items => items.map(item => {
        if (item.id === id) {
          const subtotal = item.quantity * found.sellingPrice;
          const discountAmount = subtotal * (item.discount / 100);
          const afterDiscount = subtotal - discountAmount;
          const taxAmount = afterDiscount * (item.taxRate / 100);
          
          return {
            ...item,
            productId: found._id,
            productName: found.name.toUpperCase(), // Always capitalize
            sku: found.sku.toUpperCase(),
            unitPrice: found.sellingPrice,
            unitName: found.unitOfMeasure.abbreviation,
            isExisting: true,
            availableStock: found.stock,
            total: afterDiscount + taxAmount
          };
        }
        return item;
      }));
    } else {
      // Mark as new product and capitalize the name
      updateItem(id, 'productName', capitalizedSearch);
      updateItem(id, 'isExisting', false);
    }
  };

  // Calculate totals
  const calculateTotals = () => {
    const subtotal = invoiceItems.reduce((sum, item) => {
      const itemSubtotal = item.quantity * item.unitPrice;
      return sum + itemSubtotal;
    }, 0);
    
    const totalDiscount = invoiceItems.reduce((sum, item) => {
      const itemSubtotal = item.quantity * item.unitPrice;
      const discountAmount = itemSubtotal * (item.discount / 100);
      return sum + discountAmount;
    }, 0);
    
    const afterDiscount = subtotal - totalDiscount;
    
    const totalTax = invoiceItems.reduce((sum, item) => {
      const itemSubtotal = item.quantity * item.unitPrice;
      const discountAmount = itemSubtotal * (item.discount / 100);
      const afterItemDiscount = itemSubtotal - discountAmount;
      const taxAmount = afterItemDiscount * (item.taxRate / 100);
      return sum + taxAmount;
    }, 0);
    
    const finalTotal = afterDiscount + totalTax;
    
    return {
      subtotal,
      totalDiscount,
      totalTax,
      finalTotal,
      itemCount: invoiceItems.length,
      totalQuantity: invoiceItems.reduce((sum, item) => sum + item.quantity, 0)
    };
  };

  // Submit the invoice
  const handleSubmit = async () => {
    setError('');
    
    // Validation
    if (!selectedCustomerId) {
      setError('Please select a customer');
      return;
    }
    
    const validItems = invoiceItems.filter(item => 
      item.productName.trim() && item.quantity > 0
    );
    
    if (validItems.length === 0) {
      setError('Please add at least one valid item');
      return;
    }

    // Check stock availability
    const stockIssues = validItems.filter(item => 
      item.isExisting && item.quantity > item.availableStock
    );
    
    if (stockIssues.length > 0) {
      setError(`Insufficient stock for: ${stockIssues.map(item => 
        `${item.productName} (Available: ${item.availableStock}, Required: ${item.quantity})`
      ).join(', ')}`);
      return;
    }

    try {
      setLoading(true);
      const { subtotal, totalDiscount, totalTax, finalTotal } = calculateTotals();
      
      // Create sales order
      const salesPayload = {
        customer: selectedCustomerId,
        orderNumber: invoiceNumber,
        orderDate: invoiceDate,
        dueDate,
        paymentTerms,
        status: 'confirmed',
        paymentStatus: 'unpaid',
        items: validItems.map(item => ({
          product: item.productId,
          productName: item.productName.toUpperCase(), // Ensure uppercase
          quantity: item.quantity,
          unitPrice: item.unitPrice,
          discount: item.discount,
          tax: item.taxRate,
          total: item.total
        })),
        subtotal,
        discount: totalDiscount,
        tax: totalTax,
        totalAmount: finalTotal,
        notes
      };
      
      const response = await fetch('/api/sales', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(salesPayload)
      });
      
      if (response.ok) {
        const result = await response.json();
        // Redirect to sales page with success message
        router.push(`/sales?success=invoice-created&invoiceId=${result._id}`);
      } else {
        const errorData = await response.json();
        setError(errorData.error || 'Failed to create invoice');
      }
      
    } catch (err: any) {
      setError(err.message || 'Failed to create invoice');
    } finally {
      setLoading(false);
    }
  };

  const { subtotal, totalDiscount, totalTax, finalTotal, itemCount, totalQuantity } = calculateTotals();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      {/* Page Header */}
      <div className="bg-white shadow-sm border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-slate-900">Create Sales Invoice</h1>
              <p className="mt-1 text-sm text-slate-600">
                🧾 Generate professional invoice with multiple items for customer
              </p>
            </div>
            <a
              href="/dashboard"
              className="px-4 py-2 text-slate-600 hover:text-slate-900 transition-colors"
            >
              ← Back to Dashboard
            </a>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-6">
            {error}
          </div>
        )}

        <div className="bg-white rounded-xl shadow-sm border border-slate-200">
          {/* Invoice Header */}
          <div className="p-6 border-b border-slate-200">
            <h2 className="text-xl font-semibold text-slate-800 mb-4">Invoice Details</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
              <Select
                label="Customer *"
                value={selectedCustomerId}
                onChange={(e) => setSelectedCustomerId(e.target.value)}
                options={[
                  { value: '', label: 'Select Customer' },
                  ...customers.map(customer => ({
                    value: customer._id,
                    label: `${customer.name} - ${customer.phone}`
                  }))
                ]}
              />
              
              <Input
                label="Invoice Number *"
                value={invoiceNumber}
                onChange={(e) => setInvoiceNumber(e.target.value)}
                placeholder="INV-2025-001"
              />
              
              <Input
                label="Invoice Date"
                type="date"
                value={invoiceDate}
                onChange={(e) => setInvoiceDate(e.target.value)}
              />
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Input
                label="Due Date"
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
              />
              
              <Select
                label="Payment Terms"
                value={paymentTerms}
                onChange={(e) => setPaymentTerms(e.target.value)}
                options={[
                  { value: 'CASH', label: 'Cash on Delivery' },
                  { value: 'NET7', label: 'Net 7 Days' },
                  { value: 'NET15', label: 'Net 15 Days' },
                  { value: 'NET30', label: 'Net 30 Days' },
                  { value: 'NET60', label: 'Net 60 Days' }
                ]}
              />
              
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Notes
                </label>
                <input
                  type="text"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Thank you for your business!"
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                />
              </div>
            </div>
          </div>

          {/* Items Table */}
          <div className="p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold text-slate-800">Invoice Items</h2>
              <Button onClick={addNewItem} size="sm">
                + Add Item
              </Button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-200">
                    <th className="text-left py-3 px-2 font-semibold text-slate-700">Product Name/Search</th>
                    <th className="text-left py-3 px-2 font-semibold text-slate-700">SKU</th>
                    <th className="text-right py-3 px-2 font-semibold text-slate-700">Qty</th>
                    <th className="text-right py-3 px-2 font-semibold text-slate-700">Unit Price</th>
                    <th className="text-right py-3 px-2 font-semibold text-slate-700">Disc %</th>
                    <th className="text-right py-3 px-2 font-semibold text-slate-700">Tax %</th>
                    <th className="text-left py-3 px-2 font-semibold text-slate-700">Unit</th>
                    <th className="text-right py-3 px-2 font-semibold text-slate-700">Total</th>
                    <th className="text-center py-3 px-2 font-semibold text-slate-700">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {invoiceItems.map((item, index) => (
                    <tr key={item.id} className="border-b border-slate-100">
                      <td className="py-3 px-2">
                        <input
                          type="text"
                          value={item.productName}
                          onChange={(e) => updateItem(item.id, 'productName', e.target.value.toUpperCase())}
                          onBlur={(e) => searchProduct(item.id, e.target.value)}
                          placeholder="Type product name to search..."
                          className={`w-full px-3 py-2 border rounded-lg ${
                            item.isExisting ? 'border-green-300 bg-green-50' : 'border-slate-300'
                          }`}
                        />
                        <div className="flex justify-between text-xs mt-1">
                          {item.isExisting && (
                            <span className="text-green-600">✓ In stock: {item.availableStock}</span>
                          )}
                          {item.isExisting && item.quantity > item.availableStock && (
                            <span className="text-red-600">⚠ Insufficient stock</span>
                          )}
                        </div>
                      </td>
                      
                      <td className="py-3 px-2">
                        <input
                          type="text"
                          value={item.sku}
                          onChange={(e) => updateItem(item.id, 'sku', e.target.value.toUpperCase())}
                          placeholder="SKU"
                          className="w-full px-2 py-1 border border-slate-300 rounded text-center"
                        />
                      </td>
                      
                      <td className="py-3 px-2">
                        <input
                          type="number"
                          value={item.quantity}
                          onChange={(e) => updateItem(item.id, 'quantity', parseFloat(e.target.value) || 0)}
                          placeholder="1"
                          min="1"
                          className="w-20 px-2 py-1 border border-slate-300 rounded text-center"
                        />
                      </td>
                      
                      <td className="py-3 px-2">
                        <input
                          type="number"
                          step="0.01"
                          value={item.unitPrice}
                          onChange={(e) => updateItem(item.id, 'unitPrice', parseFloat(e.target.value) || 0)}
                          placeholder="0.00"
                          className="w-24 px-2 py-1 border border-slate-300 rounded text-center"
                        />
                      </td>
                      
                      <td className="py-3 px-2">
                        <input
                          type="number"
                          step="0.1"
                          value={item.discount}
                          onChange={(e) => updateItem(item.id, 'discount', parseFloat(e.target.value) || 0)}
                          placeholder="0"
                          min="0"
                          max="100"
                          className="w-16 px-2 py-1 border border-slate-300 rounded text-center"
                        />
                      </td>
                      
                      <td className="py-3 px-2">
                        <input
                          type="number"
                          step="0.1"
                          value={item.taxRate}
                          onChange={(e) => updateItem(item.id, 'taxRate', parseFloat(e.target.value) || 0)}
                          placeholder="18"
                          className="w-16 px-2 py-1 border border-slate-300 rounded text-center"
                        />
                      </td>
                      
                      <td className="py-3 px-2">
                        <input
                          type="text"
                          value={item.unitName}
                          onChange={(e) => updateItem(item.id, 'unitName', e.target.value)}
                          placeholder="pcs"
                          className="w-16 px-2 py-1 border border-slate-300 rounded text-center"
                        />
                      </td>
                      
                      <td className="py-3 px-2 text-right font-semibold">
                        ₹{item.total.toFixed(2)}
                      </td>
                      
                      <td className="py-3 px-2 text-center">
                        {invoiceItems.length > 1 && (
                          <Button
                            size="sm"
                            variant="secondary"
                            onClick={() => removeItem(item.id)}
                            className="text-red-600 hover:text-red-800"
                          >
                            ✕
                          </Button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Quick Add Suggestions */}
            <div className="mt-4 p-4 bg-slate-50 rounded-lg">
              <h3 className="font-semibold text-slate-700 mb-2">💡 Quick Tips:</h3>
              <ul className="text-sm text-slate-600 space-y-1">
                <li>• Product names are automatically CAPITALIZED</li>
                <li>• Stock availability is checked in real-time</li>
                <li>• Discount and tax are calculated automatically</li>
                <li>• Default GST rate is 18% (adjustable per item)</li>
              </ul>
            </div>
          </div>

          {/* Summary & Submit */}
          <div className="p-6 border-t border-slate-200 bg-slate-50">
            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-end gap-6">
              {/* Calculation Breakdown */}
              <div className="space-y-2 text-sm">
                <div className="flex justify-between min-w-[200px]">
                  <span className="text-slate-600">Subtotal:</span>
                  <span className="font-semibold">₹{subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-600">Total Discount:</span>
                  <span className="font-semibold text-red-600">-₹{totalDiscount.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-600">Total Tax:</span>
                  <span className="font-semibold">₹{totalTax.toFixed(2)}</span>
                </div>
                <div className="border-t pt-2 flex justify-between">
                  <span className="text-slate-800 font-semibold">Final Total:</span>
                  <span className="font-bold text-lg text-green-600">₹{finalTotal.toFixed(2)}</span>
                </div>
              </div>

              {/* Quick Stats & Submit */}
              <div className="flex flex-col items-end gap-4">
                <div className="flex gap-6 text-sm">
                  <div>
                    <span className="text-slate-600">Items: </span>
                    <span className="font-semibold">{itemCount}</span>
                  </div>
                  <div>
                    <span className="text-slate-600">Total Qty: </span>
                    <span className="font-semibold">{totalQuantity}</span>
                  </div>
                </div>

                <div className="flex gap-3">
                  <Button
                    variant="secondary"
                    onClick={() => router.push('/dashboard')}
                    disabled={loading}
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={handleSubmit}
                    disabled={loading}
                    className="bg-green-600 hover:bg-green-700"
                  >
                    {loading ? 'Creating...' : `Create Invoice (₹${finalTotal.toFixed(2)})`}
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}