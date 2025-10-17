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
}

interface Customer {
  _id: string;
  name: string;
  phone?: string;
}

interface SaleItem {
  productId: string;
  productName: string;
  unitOfMeasure: string;
  quantity: number;
  sellingPrice: number;
  totalPrice: number;
}

export default function CreateSalePage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  
  const [products, setProducts] = useState<Product[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loadingData, setLoadingData] = useState(true);
  
  const [selectedCustomerId, setSelectedCustomerId] = useState('walk-in');
  const [customerSearchQuery, setCustomerSearchQuery] = useState('Walk-in Customer');
  const [showCustomerSuggestions, setShowCustomerSuggestions] = useState(false);
  const [saleItems, setSaleItems] = useState<SaleItem[]>([]);
  const [selectedProductId, setSelectedProductId] = useState('');
  const [productSearchQuery, setProductSearchQuery] = useState('');
  const [showProductSuggestions, setShowProductSuggestions] = useState(false);
  const [itemQuantity, setItemQuantity] = useState(1);
  const [itemSellingPrice, setItemSellingPrice] = useState('');
  
  const [paymentMethod, setPaymentMethod] = useState<'cash' | 'card' | 'upi' | 'credit'>('cash');
  const [amountPaid, setAmountPaid] = useState('');
  const [notes, setNotes] = useState('');
  
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

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
    } catch (err) { setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoadingData(false);
    }
  };

  const addItemToSale = () => {
    if (!selectedProductId) {
      setError('Please select a product');
      return;
    }

    const product = products.find(p => p._id === selectedProductId);
    if (!product) return;

    if (itemQuantity <= 0) {
      setError('Quantity must be greater than 0');
      return;
    }

    const sellingPrice = parseFloat(itemSellingPrice);
    if (!sellingPrice || sellingPrice <= 0) {
      setError('Selling price must be greater than 0');
      return;
    }

    if (itemQuantity > product.quantity) {
      setError(`Only ${product.quantity} ${product.unitOfMeasure} available in stock`);
      return;
    }

    // Check if product already in sale
    const existingItemIndex = saleItems.findIndex(item => item.productId === selectedProductId);
    
    if (existingItemIndex >= 0) {
      // Update existing item
      const updatedItems = [...saleItems];
      const newQuantity = updatedItems[existingItemIndex].quantity + itemQuantity;
      
      if (newQuantity > product.quantity) {
        setError(`Only ${product.quantity} ${product.unitOfMeasure} available in stock`);
        return;
      }

      updatedItems[existingItemIndex] = {
        ...updatedItems[existingItemIndex],
        quantity: newQuantity,
        sellingPrice, // Update with latest price
        totalPrice: newQuantity * sellingPrice
      };
      setSaleItems(updatedItems);
    } else {
      // Add new item
      const displayName = product.companyName 
        ? `${product.companyName} - ${product.name}` 
        : product.name;
      
      const newItem: SaleItem = {
        productId: product._id,
        productName: displayName,
        unitOfMeasure: product.unitOfMeasure,
        quantity: itemQuantity,
        sellingPrice,
        totalPrice: itemQuantity * sellingPrice
      };
      setSaleItems([...saleItems, newItem]);
    }

    // Reset selection
    setSelectedProductId('');
    setProductSearchQuery('');
    setShowProductSuggestions(false);
    setItemQuantity(1);
    setItemSellingPrice('');
    setError('');
  };

  const handleProductSearch = (value: string) => {
    setProductSearchQuery(value);
    setShowProductSuggestions(value.length > 0);
    setSelectedProductId('');
  };

  const selectProduct = (product: Product) => {
    const displayName = product.companyName 
      ? `${product.companyName} - ${product.name}` 
      : product.name;
    setProductSearchQuery(displayName.toUpperCase());
    setSelectedProductId(product._id);
    setShowProductSuggestions(false);
  };

  const filteredProducts = products.filter(product => {
    if (product.quantity <= 0) return false; // Only show in-stock products
    const displayName = product.companyName 
      ? `${product.companyName} - ${product.name}` 
      : product.name;
    return displayName.toLowerCase().includes(productSearchQuery.toLowerCase()) ||
           product.unitOfMeasure.toLowerCase().includes(productSearchQuery.toLowerCase());
  });

  const handleCustomerSearch = (value: string) => {
    setCustomerSearchQuery(value);
    setShowCustomerSuggestions(value.length > 0 && value !== 'Walk-in Customer');
    if (value === 'Walk-in Customer' || value === '') {
      setSelectedCustomerId('walk-in');
    } else {
      setSelectedCustomerId('');
    }
  };

  const selectCustomer = (customer: Customer) => {
    setCustomerSearchQuery(customer.name.toUpperCase());
    setSelectedCustomerId(customer._id);
    setShowCustomerSuggestions(false);
  };

  const selectWalkIn = () => {
    setCustomerSearchQuery('Walk-in Customer');
    setSelectedCustomerId('walk-in');
    setShowCustomerSuggestions(false);
  };

  const filteredCustomers = customers.filter(customer => {
    return customer.name.toLowerCase().includes(customerSearchQuery.toLowerCase()) ||
           (customer.phone && customer.phone.includes(customerSearchQuery));
  });

  const removeItem = (productId: string) => {
    setSaleItems(saleItems.filter(item => item.productId !== productId));
  };

  const updateItemQuantity = (productId: string, newQuantity: number) => {
    const product = products.find(p => p._id === productId);
    if (!product) return;

    if (newQuantity <= 0) {
      removeItem(productId);
      return;
    }

    if (newQuantity > product.quantity) {
      setError(`Only ${product.quantity} ${product.unitOfMeasure} available in stock`);
      return;
    }

    const updatedItems = saleItems.map(item => {
      if (item.productId === productId) {
        return {
          ...item,
          quantity: newQuantity,
          totalPrice: newQuantity * item.sellingPrice
        };
      }
      return item;
    });
    setSaleItems(updatedItems);
    setError('');
  };

  const calculateTotal = () => {
    return saleItems.reduce((sum, item) => sum + item.totalPrice, 0);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (saleItems.length === 0) {
      setError('Please add at least one product to the sale');
      return;
    }

    const totalAmount = calculateTotal();
    const paidAmount = parseFloat(amountPaid) || 0;

    if (paidAmount < 0) {
      setError('Amount paid cannot be negative');
      return;
    }

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
            sellingPrice: item.sellingPrice
          })),
          paymentMethod,
          amountPaid: paidAmount,
          notes
        })
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to create sale');
      }

      router.push('/sales');
    } catch (err) { setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  if (status === 'loading' || loadingData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-purple-50 to-indigo-100 flex items-center justify-center">
        <div className="text-slate-600">Loading...</div>
      </div>
    );
  }

  const totalAmount = calculateTotal();
  const paidAmount = parseFloat(amountPaid) || 0;
  const balanceAmount = totalAmount - paidAmount;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-purple-50 to-indigo-100">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <Link href="/sales" className="text-purple-600 hover:text-purple-800 mb-4 inline-block">
            ← Back to Sales
          </Link>
          <h2 className="text-3xl font-bold text-slate-800 mb-2">Create New Sale</h2>
          <p className="text-slate-600">Record a new sales transaction</p>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl mb-6">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Customer Selection */}
          <div className="bg-white/90 backdrop-blur-xl rounded-2xl shadow-xl border border-purple-200/50 p-6">
            <h3 className="text-lg font-semibold text-slate-800 mb-4">Customer Details</h3>
            
            <div className="relative">
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Select Customer
              </label>
              <input
                type="text"
                value={customerSearchQuery}
                onChange={(e) => handleCustomerSearch(e.target.value)}
                onFocus={() => customerSearchQuery.length > 0 && customerSearchQuery !== 'Walk-in Customer' && setShowCustomerSuggestions(true)}
                placeholder="Type to search customers..."
                className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
              {showCustomerSuggestions && (
                <div className="absolute z-10 w-full mt-1 bg-white border border-purple-200 rounded-xl shadow-lg max-h-64 overflow-y-auto">
                  {/* Walk-in Customer option */}
                  <div
                    onClick={selectWalkIn}
                    className="px-4 py-3 hover:bg-purple-50 cursor-pointer border-b border-purple-100"
                  >
                    <div className="font-medium text-slate-900">Walk-in Customer</div>
                    <div className="text-sm text-slate-600">(Cash)</div>
                  </div>
                  
                  {filteredCustomers.length > 0 ? (
                    filteredCustomers.map((customer) => (
                      <div
                        key={customer._id}
                        onClick={() => selectCustomer(customer)}
                        className="px-4 py-3 hover:bg-purple-50 cursor-pointer border-b border-purple-100 last:border-0"
                      >
                        <div className="font-medium text-slate-900">{customer.name.toUpperCase()}</div>
                        {customer.phone && (
                          <div className="text-sm text-slate-600">Phone: {customer.phone}</div>
                        )}
                      </div>
                    ))
                  ) : (
                    <div className="px-4 py-3 text-slate-500 text-center">
                      No customers found
                    </div>
                  )}
                </div>
              )}
              <p className="text-sm text-slate-500 mt-2">
                Walk-in customers must pay full amount. Select a customer for credit sales.
              </p>
            </div>
          </div>

          {/* Add Products */}
          <div className="bg-white/90 backdrop-blur-xl rounded-2xl shadow-xl border border-purple-200/50 p-6">
            <h3 className="text-lg font-semibold text-slate-800 mb-4">Add Products</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
              <div className="md:col-span-2 relative">
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Select Product
                </label>
                <input
                  type="text"
                  value={productSearchQuery}
                  onChange={(e) => handleProductSearch(e.target.value)}
                  onFocus={() => setShowProductSuggestions(productSearchQuery.length > 0)}
                  placeholder="Type to search products..."
                  className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent uppercase"
                />
                
                {/* Suggestions Dropdown */}
                {showProductSuggestions && filteredProducts.length > 0 && (
                  <div className="absolute z-10 w-full mt-1 bg-white border border-slate-300 rounded-xl shadow-lg max-h-60 overflow-y-auto">
                    {filteredProducts.map(product => {
                      const displayName = product.companyName 
                        ? `${product.companyName} - ${product.name}` 
                        : product.name;
                      return (
                        <div
                          key={product._id}
                          onClick={() => selectProduct(product)}
                          className="px-4 py-3 hover:bg-purple-50 cursor-pointer border-b border-slate-100 last:border-b-0"
                        >
                          <div className="font-medium text-slate-800 uppercase">
                            {displayName}
                          </div>
                          <div className="text-sm text-slate-500 uppercase">
                            Unit: {product.unitOfMeasure} | Stock: {product.quantity}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
                
                {showProductSuggestions && filteredProducts.length === 0 && productSearchQuery && (
                  <div className="absolute z-10 w-full mt-1 bg-white border border-slate-300 rounded-xl shadow-lg p-4 text-center text-slate-500">
                    No products found with stock
                  </div>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Quantity
                </label>
                <input
                  type="number"
                  min="1"
                  value={itemQuantity}
                  onChange={(e) => setItemQuantity(parseInt(e.target.value) || 1)}
                  className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Selling Price (₹)
                </label>
                <input
                  type="number"
                  step="0.01"
                  min="0.01"
                  value={itemSellingPrice}
                  onChange={(e) => setItemSellingPrice(e.target.value)}
                  placeholder="0.00"
                  className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
              </div>
            </div>

            <button
              type="button"
              onClick={addItemToSale}
              className="w-full px-6 py-3 bg-purple-600 text-white rounded-xl hover:bg-purple-700 transition-colors"
            >
              ➕ Add Product to Sale
            </button>

            {/* Sale Items Table */}
            {saleItems.length > 0 && (
              <div className="mt-6 overflow-x-auto border border-slate-200 rounded-xl">
                <table className="w-full">
                  <thead className="bg-slate-50">
                    <tr>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-slate-700">Product</th>
                      <th className="px-4 py-3 text-center text-sm font-semibold text-slate-700">Quantity</th>
                      <th className="px-4 py-3 text-right text-sm font-semibold text-slate-700">Price</th>
                      <th className="px-4 py-3 text-right text-sm font-semibold text-slate-700">Total</th>
                      <th className="px-4 py-3 text-center text-sm font-semibold text-slate-700">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200">
                    {saleItems.map((item) => (
                      <tr key={item.productId}>
                        <td className="px-4 py-3 text-sm text-slate-800 uppercase font-medium">{item.productName}</td>
                        <td className="px-4 py-3 text-center">
                          <input
                            type="number"
                            min="1"
                            value={item.quantity}
                            onChange={(e) => updateItemQuantity(item.productId, parseInt(e.target.value) || 0)}
                            className="w-20 px-2 py-1 border border-slate-300 rounded text-center"
                          />
                          <span className="text-sm text-slate-500 ml-2 uppercase">{item.unitOfMeasure}</span>
                        </td>
                        <td className="px-4 py-3 text-right text-sm text-slate-600">
                          ₹{item.sellingPrice.toFixed(2)}
                        </td>
                        <td className="px-4 py-3 text-right text-sm font-semibold text-slate-800">
                          ₹{item.totalPrice.toFixed(2)}
                        </td>
                        <td className="px-4 py-3 text-center">
                          <button
                            type="button"
                            onClick={() => removeItem(item.productId)}
                            className="text-red-600 hover:text-red-800 text-sm font-medium"
                          >
                            Remove
                          </button>
                        </td>
                      </tr>
                    ))}
                    <tr className="bg-purple-50">
                      <td colSpan={3} className="px-4 py-3 text-right text-base font-bold text-slate-800">
                        Total Amount:
                      </td>
                      <td className="px-4 py-3 text-right text-xl font-bold text-purple-600">
                        ₹{totalAmount.toFixed(2)}
                      </td>
                      <td></td>
                    </tr>
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Payment Details */}
          {saleItems.length > 0 && (
            <div className="bg-white/90 backdrop-blur-xl rounded-2xl shadow-xl border border-purple-200/50 p-6">
              <h3 className="text-lg font-semibold text-slate-800 mb-4">Payment Details</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Payment Method
                  </label>
                  <select
                    value={paymentMethod}
                    onChange={(e) => setPaymentMethod(e.target.value as 'cash' | 'card' | 'upi' | 'credit')}
                    className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  >
                    <option value="cash">Cash</option>
                    <option value="card">Card</option>
                    <option value="upi">UPI</option>
                    <option value="credit">Credit (On Account)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Amount Paid
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={amountPaid}
                    onChange={(e) => setAmountPaid(e.target.value)}
                    placeholder="0.00"
                    className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  />
                  {balanceAmount !== 0 && (
                    <p className={`text-sm mt-2 ${balanceAmount > 0 ? 'text-orange-600' : 'text-green-600'}`}>
                      {balanceAmount > 0 ? `Balance Due: ₹${balanceAmount.toFixed(2)}` : `Change: ₹${Math.abs(balanceAmount).toFixed(2)}`}
                    </p>
                  )}
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Notes (Optional)
                  </label>
                  <textarea
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    rows={3}
                    placeholder="Add any notes about this sale..."
                    className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Submit Button */}
          {saleItems.length > 0 && (
            <div className="bg-white/90 backdrop-blur-xl rounded-2xl shadow-xl border border-purple-200/50 p-6">
              <button
                type="submit"
                disabled={loading}
                className="w-full px-6 py-4 bg-gradient-to-r from-purple-600 to-purple-600 text-white rounded-xl hover:shadow-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed font-semibold text-lg"
              >
                {loading ? 'Creating Sale...' : `Complete Sale - ₹${totalAmount.toFixed(2)}`}
              </button>
            </div>
          )}
        </form>
      </div>
    </div>
  );
}
