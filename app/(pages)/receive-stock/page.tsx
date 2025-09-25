'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button, Input, Select } from '../../../components/ui';

// Types
interface Supplier {
  _id: string;
  name: string;
  phone: string;
  email: string;
}

interface Product {
  _id: string;
  name: string;
  sku: string;
  sellingPrice: number;
  costPrice: number;
  unitOfMeasure: {
    name: string;
    abbreviation: string;
  };
}

interface StockItem {
  id: string; // temporary ID for form management
  productId?: string;
  productName: string;
  sku: string;
  quantity: number;
  costPrice: number;
  sellingPrice: number;
  unitName: string;
  total: number;
  isExisting: boolean; // whether product exists in catalog
}

export default function ReceiveStockPage() {
  const router = useRouter();
  
  // Form state
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [selectedSupplierId, setSelectedSupplierId] = useState('');
  const [billNumber, setBillNumber] = useState('');
  const [billDate, setBillDate] = useState(new Date().toISOString().split('T')[0]);
  const [stockItems, setStockItems] = useState<StockItem[]>([
    {
      id: '1',
      productName: '',
      sku: '',
      quantity: 0,
      costPrice: 0,
      sellingPrice: 0,
      unitName: '',
      total: 0,
      isExisting: false
    }
  ]);
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  // Load initial data
  useEffect(() => {
    loadSuppliers();
    loadProducts();
  }, []);

  const loadSuppliers = async () => {
    try {
      const response = await fetch('/api/suppliers');
      if (response.ok) {
        const data = await response.json();
        setSuppliers(Array.isArray(data) ? data : data.suppliers || []);
      }
    } catch (error) {
      console.error('Error loading suppliers:', error);
    }
  };

  const loadProducts = async () => {
    try {
      const response = await fetch('/api/products');
      if (response.ok) {
        const data = await response.json();
        setProducts(Array.isArray(data) ? data : data.products || []);
      }
    } catch (error) {
      console.error('Error loading products:', error);
    }
  };

  // Add new empty item row
  const addNewItem = () => {
    const newItem: StockItem = {
      id: Date.now().toString(),
      productName: '',
      sku: '',
      quantity: 0,
      costPrice: 0,
      sellingPrice: 0,
      unitName: '',
      total: 0,
      isExisting: false
    };
    setStockItems([...stockItems, newItem]);
  };

  // Remove item row
  const removeItem = (id: string) => {
    if (stockItems.length > 1) {
      setStockItems(stockItems.filter(item => item.id !== id));
    }
  };

  // Update item data
  const updateItem = (id: string, field: keyof StockItem, value: any) => {
    setStockItems(items => items.map(item => {
      if (item.id === id) {
        const updated = { ...item, [field]: value };
        
        // Auto-calculate total when quantity or cost price changes
        if (field === 'quantity' || field === 'costPrice') {
          updated.total = updated.quantity * updated.costPrice;
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
      setStockItems(items => items.map(item => {
        if (item.id === id) {
          return {
            ...item,
            productId: found._id,
            productName: found.name.toUpperCase(), // Always capitalize
            sku: found.sku.toUpperCase(),
            sellingPrice: found.sellingPrice,
            costPrice: found.costPrice, // Can be modified
            unitName: found.unitOfMeasure.abbreviation,
            isExisting: true,
            total: item.quantity * found.costPrice
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
    const subtotal = stockItems.reduce((sum, item) => sum + item.total, 0);
    return {
      subtotal,
      itemCount: stockItems.length,
      totalQuantity: stockItems.reduce((sum, item) => sum + item.quantity, 0)
    };
  };

  // Submit the stock entry
  const handleSubmit = async () => {
    setError('');
    
    // Validation
    if (!selectedSupplierId) {
      setError('Please select a supplier');
      return;
    }
    
    if (!billNumber.trim()) {
      setError('Please enter bill/invoice number');
      return;
    }
    
    const validItems = stockItems.filter(item => 
      item.productName.trim() && item.quantity > 0
    );
    
    if (validItems.length === 0) {
      setError('Please add at least one valid item');
      return;
    }

    try {
      setLoading(true);
      
      // Process each item
      for (const item of validItems) {
        if (!item.isExisting) {
        // Create new product first
        const productPayload = {
          name: item.productName.toUpperCase(), // Always capitalize
          sku: item.sku.toUpperCase() || `AUTO-${Date.now()}`,
          sellingPrice: item.sellingPrice,
          costPrice: item.costPrice,
          category: '677d8f9a1234567890123456', // Default category - should be configurable
          unitOfMeasure: '677d8f9a1234567890123457', // Default unit - should be configurable
          description: `Auto-created from stock receipt - ${billNumber}`
        };          const productResponse = await fetch('/api/products', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(productPayload)
          });
          
          if (productResponse.ok) {
            const newProduct = await productResponse.json();
            item.productId = newProduct._id;
          }
        }
        
        // Add stock
        if (item.productId) {
          const stockPayload = {
            product: item.productId,
            quantity: item.quantity,
            type: 'purchase',
            reason: 'purchase-receipt',
            notes: `Stock received from ${suppliers.find(s => s._id === selectedSupplierId)?.name || 'supplier'} - Bill: ${billNumber}`,
            adjustmentType: 'increase',
            costPrice: item.costPrice
          };
          
          await fetch('/api/inventory/adjust', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(stockPayload)
          });
        }
      }
      
      // Success - redirect to inventory page
      router.push('/inventory?success=stock-received');
      
    } catch (err: any) {
      setError(err.message || 'Failed to process stock receipt');
    } finally {
      setLoading(false);
    }
  };

  const { subtotal, itemCount, totalQuantity } = calculateTotals();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      {/* Page Header */}
      <div className="bg-white shadow-sm border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-slate-900">Receive Stock / Bill Entry</h1>
              <p className="mt-1 text-sm text-slate-600">
                📋 Enter supplier bill/invoice with multiple items at once
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
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Select
                label="Supplier *"
                value={selectedSupplierId}
                onChange={(e) => setSelectedSupplierId(e.target.value)}
                options={[
                  { value: '', label: 'Select Supplier' },
                  ...suppliers.map(supplier => ({
                    value: supplier._id,
                    label: `${supplier.name} - ${supplier.phone}`
                  }))
                ]}
              />
              
              <Input
                label="Bill/Invoice Number *"
                value={billNumber}
                onChange={(e) => setBillNumber(e.target.value)}
                placeholder="INV-2024-001"
              />
              
              <Input
                label="Bill Date"
                type="date"
                value={billDate}
                onChange={(e) => setBillDate(e.target.value)}
              />
            </div>
          </div>

          {/* Items Table */}
          <div className="p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold text-slate-800">Items</h2>
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
                    <th className="text-right py-3 px-2 font-semibold text-slate-700">Cost Price</th>
                    <th className="text-right py-3 px-2 font-semibold text-slate-700">Sell Price</th>
                    <th className="text-left py-3 px-2 font-semibold text-slate-700">Unit</th>
                    <th className="text-right py-3 px-2 font-semibold text-slate-700">Total</th>
                    <th className="text-center py-3 px-2 font-semibold text-slate-700">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {stockItems.map((item, index) => (
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
                        {item.isExisting && (
                          <span className="text-xs text-green-600">✓ Found in catalog</span>
                        )}
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
                          placeholder="0"
                          className="w-20 px-2 py-1 border border-slate-300 rounded text-center"
                        />
                      </td>
                      
                      <td className="py-3 px-2">
                        <input
                          type="number"
                          step="0.01"
                          value={item.costPrice}
                          onChange={(e) => updateItem(item.id, 'costPrice', parseFloat(e.target.value) || 0)}
                          placeholder="0.00"
                          className="w-24 px-2 py-1 border border-slate-300 rounded text-center"
                        />
                      </td>
                      
                      <td className="py-3 px-2">
                        <input
                          type="number"
                          step="0.01"
                          value={item.sellingPrice}
                          onChange={(e) => updateItem(item.id, 'sellingPrice', parseFloat(e.target.value) || 0)}
                          placeholder="0.00"
                          className="w-24 px-2 py-1 border border-slate-300 rounded text-center"
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
                        {stockItems.length > 1 && (
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
                <li>• Type product name or SKU to auto-fill existing products</li>
                <li>• New products will be created automatically if not found</li>
                <li>• Cost price can be different from catalog (updates on save)</li>
                <li>• Total is calculated automatically</li>
              </ul>
            </div>
          </div>

          {/* Summary & Submit */}
          <div className="p-6 border-t border-slate-200 bg-slate-50">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
              {/* Summary */}
              <div className="flex gap-6 text-sm">
                <div>
                  <span className="text-slate-600">Items: </span>
                  <span className="font-semibold">{itemCount}</span>
                </div>
                <div>
                  <span className="text-slate-600">Total Quantity: </span>
                  <span className="font-semibold">{totalQuantity}</span>
                </div>
                <div>
                  <span className="text-slate-600">Total Amount: </span>
                  <span className="font-semibold text-lg text-green-600">₹{subtotal.toFixed(2)}</span>
                </div>
              </div>

              {/* Submit Button */}
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
                  {loading ? 'Processing...' : `Receive Stock (₹${subtotal.toFixed(2)})`}
                </Button>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}