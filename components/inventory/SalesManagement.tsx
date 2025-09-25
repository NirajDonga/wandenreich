'use client';

import React, { useState, useEffect } from 'react';
import { Button, Input, Select, Modal, Card } from '../ui';

// Types
interface Customer {
  _id: string;
  name: string;
  email: string;
  phone: string;
  address: string;
}

interface ProductVariant {
  _id: string;
  name: string;
  sku: string;
  sellingPrice: number;
  productId: {
    name: string;
  };
}

interface SalesOrderItem {
  productVariantId: string;
  quantity: number;
  unitPrice: number;
  regularPrice: number;
  discount: number;
  totalPrice: number;
}

interface SalesOrder {
  _id: string;
  customerId: string;
  customer?: Customer;
  orderDate: string;
  status: 'completed' | 'pending' | 'cancelled';
  totalAmount: number;
  paymentStatus: 'paid' | 'partial' | 'unpaid';
  items: Array<{
    productVariantId: ProductVariant;
    quantity: number;
    unitPrice: number;
    totalPrice: number;
  }>;
  createdAt: string;
}

interface SalesManagementProps {
  onClose?: () => void;
}

export default function SalesManagement({ onClose }: SalesManagementProps) {
  const [salesOrders, setSalesOrders] = useState<SalesOrder[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [productVariants, setProductVariants] = useState<ProductVariant[]>([]);
  const [filteredOrders, setFilteredOrders] = useState<SalesOrder[]>([]);
  
  // Filter states
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [paymentFilter, setPaymentFilter] = useState<string>('all');
  
  // Modal states
  const [showOrderModal, setShowOrderModal] = useState(false);
  const [showCustomerModal, setShowCustomerModal] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<SalesOrder | null>(null);
  
  // Form states
  const [orderForm, setOrderForm] = useState({
    customerId: 'walk-in',
    items: [] as SalesOrderItem[]
  });
  
  const [customerForm, setCustomerForm] = useState({
    name: '',
    email: '',
    phone: '',
    address: ''
  });
  
  const [currentItem, setCurrentItem] = useState<SalesOrderItem>({
    productVariantId: '',
    quantity: 0,
    unitPrice: 0,
    regularPrice: 0,
    discount: 0,
    totalPrice: 0
  });
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Load data on component mount
  useEffect(() => {
    loadSalesOrders();
    loadCustomers();
    loadProductVariants();
  }, []);

  // Filter orders based on search and status
  useEffect(() => {
    let filtered = salesOrders;

    if (searchTerm) {
      filtered = filtered.filter(order => 
        order._id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.customer?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.customer?.phone?.includes(searchTerm)
      );
    }

    if (statusFilter !== 'all') {
      filtered = filtered.filter(order => order.status === statusFilter);
    }

    if (paymentFilter !== 'all') {
      filtered = filtered.filter(order => order.paymentStatus === paymentFilter);
    }

    setFilteredOrders(filtered);
  }, [salesOrders, searchTerm, statusFilter, paymentFilter]);

  // Update item total when quantity, price, or discount changes
  useEffect(() => {
    const subtotal = currentItem.quantity * currentItem.unitPrice;
    const discountAmount = (subtotal * currentItem.discount) / 100;
    const total = subtotal - discountAmount;
    setCurrentItem(prev => ({ ...prev, totalPrice: total }));
  }, [currentItem.quantity, currentItem.unitPrice, currentItem.discount]);

  // Update unit price when product variant is selected
  useEffect(() => {
    if (currentItem.productVariantId) {
      const variant = productVariants.find(v => v._id === currentItem.productVariantId);
      if (variant) {
        setCurrentItem(prev => ({
          ...prev,
          unitPrice: variant.sellingPrice,
          regularPrice: variant.sellingPrice
        }));
      }
    }
  }, [currentItem.productVariantId, productVariants]);

  const loadSalesOrders = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/sales-orders');
      if (!response.ok) throw new Error('Failed to load sales orders');
      const data = await response.json();
      setSalesOrders(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const loadCustomers = async () => {
    try {
      const response = await fetch('/api/customers');
      if (!response.ok) throw new Error('Failed to load customers');
      const data = await response.json();
      setCustomers(data.customers || data);
    } catch (err: any) {
      setError(err.message);
    }
  };

  const loadProductVariants = async () => {
    try {
      const response = await fetch('/api/product-variants');
      if (!response.ok) throw new Error('Failed to load product variants');
      const data = await response.json();
      setProductVariants(data);
    } catch (err: any) {
      setError(err.message);
    }
  };

  const createSalesOrder = async () => {
    if (orderForm.items.length === 0) {
      setError('Please add at least one item');
      return;
    }

    try {
      setLoading(true);
      const totalAmount = orderForm.items.reduce((sum, item) => sum + item.totalPrice, 0);
      
      const response = await fetch('/api/sales-orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...orderForm,
          totalAmount
        })
      });
      
      if (!response.ok) throw new Error('Failed to create sales order');
      
      await loadSalesOrders();
      setShowOrderModal(false);
      resetOrderForm();
      setError('');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const createCustomer = async () => {
    if (!customerForm.name) {
      setError('Customer name is required');
      return;
    }

    try {
      setLoading(true);
      const response = await fetch('/api/customers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(customerForm)
      });
      
      if (!response.ok) throw new Error('Failed to create customer');
      
      await loadCustomers();
      setShowCustomerModal(false);
      setCustomerForm({ name: '', email: '', phone: '', address: '' });
      setError('');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const addItemToOrder = () => {
    if (!currentItem.productVariantId || currentItem.quantity <= 0 || currentItem.unitPrice <= 0) {
      setError('Please fill all item details');
      return;
    }

    setOrderForm(prev => ({
      ...prev,
      items: [...prev.items, { ...currentItem }]
    }));

    setCurrentItem({
      productVariantId: '',
      quantity: 0,
      unitPrice: 0,
      regularPrice: 0,
      discount: 0,
      totalPrice: 0
    });
    setError('');
  };

  const removeItemFromOrder = (index: number) => {
    setOrderForm(prev => ({
      ...prev,
      items: prev.items.filter((_, i) => i !== index)
    }));
  };

  const resetOrderForm = () => {
    setOrderForm({
      customerId: 'walk-in',
      items: []
    });
    setCurrentItem({
      productVariantId: '',
      quantity: 0,
      unitPrice: 0,
      regularPrice: 0,
      discount: 0,
      totalPrice: 0
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getPaymentStatusColor = (status: string) => {
    switch (status) {
      case 'paid': return 'bg-green-100 text-green-800';
      case 'partial': return 'bg-yellow-100 text-yellow-800';
      case 'unpaid': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getTotalAmount = () => {
    return orderForm.items.reduce((sum, item) => sum + item.totalPrice, 0);
  };

  return (
    <div className="space-y-6">
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      )}

      {/* Header */}
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-slate-900">Sales & Billing</h2>
        <div className="flex space-x-3">
          <Button onClick={() => setShowCustomerModal(true)} variant="secondary" size="sm">
            Add Customer
          </Button>
          <Button onClick={() => setShowOrderModal(true)} size="sm">
            New Sale
          </Button>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <Input
          placeholder="Search orders or customers..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="flex-1"
        />
        <Select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          options={[
            { value: 'all', label: 'All Orders' },
            { value: 'completed', label: 'Completed' },
            { value: 'pending', label: 'Pending' },
            { value: 'cancelled', label: 'Cancelled' }
          ]}
        />
        <Select
          value={paymentFilter}
          onChange={(e) => setPaymentFilter(e.target.value)}
          options={[
            { value: 'all', label: 'All Payments' },
            { value: 'paid', label: 'Paid' },
            { value: 'partial', label: 'Partial' },
            { value: 'unpaid', label: 'Unpaid' }
          ]}
        />
      </div>

      {/* Sales Orders Table */}
      <Card title="Sales Orders">
        {loading ? (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          </div>
        ) : filteredOrders.length === 0 ? (
          <div className="text-center py-8 text-slate-500">
            No sales orders found
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-200">
                  <th className="text-left py-3 px-2 font-semibold text-slate-700">Order ID</th>
                  <th className="text-left py-3 px-2 font-semibold text-slate-700">Customer</th>
                  <th className="text-left py-3 px-2 font-semibold text-slate-700">Date</th>
                  <th className="text-right py-3 px-2 font-semibold text-slate-700">Amount</th>
                  <th className="text-center py-3 px-2 font-semibold text-slate-700">Status</th>
                  <th className="text-center py-3 px-2 font-semibold text-slate-700">Payment</th>
                  <th className="text-right py-3 px-2 font-semibold text-slate-700">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredOrders.map((order) => (
                  <tr key={order._id} className="border-b border-slate-100 hover:bg-slate-50">
                    <td className="py-3 px-2 font-medium">
                      {order._id.slice(-6)}
                    </td>
                    <td className="py-3 px-2">
                      <div>
                        <div className="font-medium">
                          {order.customerId === 'walk-in' ? 'Walk-in Customer' : order.customer?.name}
                        </div>
                        {order.customer?.phone && (
                          <div className="text-sm text-slate-500">{order.customer.phone}</div>
                        )}
                      </div>
                    </td>
                    <td className="py-3 px-2 text-slate-600">
                      {new Date(order.orderDate).toLocaleDateString()}
                    </td>
                    <td className="py-3 px-2 text-right font-semibold">
                      ₹{order.totalAmount?.toFixed(2) || '0.00'}
                    </td>
                    <td className="py-3 px-2 text-center">
                      <span className={`px-2 py-1 rounded text-xs font-medium ${getStatusColor(order.status)}`}>
                        {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                      </span>
                    </td>
                    <td className="py-3 px-2 text-center">
                      <span className={`px-2 py-1 rounded text-xs font-medium ${getPaymentStatusColor(order.paymentStatus)}`}>
                        {order.paymentStatus.charAt(0).toUpperCase() + order.paymentStatus.slice(1)}
                      </span>
                    </td>
                    <td className="py-3 px-2 text-right">
                      <Button
                        size="sm"
                        variant="secondary"
                        onClick={() => setSelectedOrder(order)}
                      >
                        View
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      {/* Create Sales Order Modal */}
      <Modal
        isOpen={showOrderModal}
        onClose={() => setShowOrderModal(false)}
        title="New Sales Order"
        maxWidth="max-w-4xl"
      >
        <div className="space-y-6">
          {/* Customer Selection */}
          <Select
            label="Customer"
            value={orderForm.customerId}
            onChange={(e) => setOrderForm({ ...orderForm, customerId: e.target.value })}
            options={[
              { value: 'walk-in', label: 'Walk-in Customer' },
              ...customers.map(customer => ({ 
                value: customer._id, 
                label: `${customer.name} (${customer.phone})` 
              }))
            ]}
          />

          {/* Add Item Section */}
          <div className="border-t pt-4">
            <h3 className="text-lg font-semibold mb-4">Add Items</h3>
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-4">
              <Select
                label="Product"
                value={currentItem.productVariantId}
                onChange={(e) => setCurrentItem({ ...currentItem, productVariantId: e.target.value })}
                options={productVariants.map(variant => ({
                  value: variant._id,
                  label: `${variant.productId.name} - ${variant.name}`
                }))}
              />
              
              <Input
                label="Quantity"
                type="number"
                value={currentItem.quantity}
                onChange={(e) => setCurrentItem({ 
                  ...currentItem, 
                  quantity: parseInt(e.target.value) || 0 
                })}
                placeholder="0"
              />
              
              <Input
                label="Unit Price (₹)"
                type="number"
                step="0.01"
                value={currentItem.unitPrice}
                onChange={(e) => setCurrentItem({ 
                  ...currentItem, 
                  unitPrice: parseFloat(e.target.value) || 0 
                })}
                placeholder="0.00"
              />
              
              <Input
                label="Discount (%)"
                type="number"
                step="0.01"
                value={currentItem.discount}
                onChange={(e) => setCurrentItem({ 
                  ...currentItem, 
                  discount: parseFloat(e.target.value) || 0 
                })}
                placeholder="0"
              />
              
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Total
                </label>
                <div className="px-3 py-2 border border-slate-300 rounded bg-slate-50 text-slate-700 font-semibold">
                  ₹{currentItem.totalPrice.toFixed(2)}
                </div>
              </div>
            </div>
            
            <Button onClick={addItemToOrder} size="sm">
              Add Item
            </Button>
          </div>

          {/* Order Items */}
          {orderForm.items.length > 0 && (
            <div className="border-t pt-4">
              <h3 className="text-lg font-semibold mb-4">Order Items</h3>
              <div className="space-y-2">
                {orderForm.items.map((item, index) => {
                  const variant = productVariants.find(v => v._id === item.productVariantId);
                  return (
                    <div key={index} className="flex justify-between items-center p-3 bg-slate-50 rounded">
                      <div>
                        <span className="font-medium">
                          {variant?.productId.name} - {variant?.name}
                        </span>
                        <div className="text-sm text-slate-600">
                          {item.quantity} × ₹{item.unitPrice}
                          {item.discount > 0 && ` (${item.discount}% off)`}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="font-semibold">₹{item.totalPrice.toFixed(2)}</span>
                        <Button
                          size="sm"
                          variant="secondary"
                          onClick={() => removeItemFromOrder(index)}
                        >
                          Remove
                        </Button>
                      </div>
                    </div>
                  );
                })}
              </div>
              
              <div className="flex justify-between items-center mt-4 p-3 bg-green-50 rounded">
                <span className="text-lg font-semibold">Total Order Amount:</span>
                <span className="text-xl font-bold text-green-600">₹{getTotalAmount().toFixed(2)}</span>
              </div>
            </div>
          )}
        </div>

        <div className="flex space-x-4 pt-6 border-t">
          <Button 
            variant="secondary" 
            onClick={() => setShowOrderModal(false)} 
            className="flex-1"
            disabled={loading}
          >
            Cancel
          </Button>
          <Button onClick={createSalesOrder} className="flex-1" disabled={loading}>
            {loading ? 'Creating...' : 'Create Sales Order'}
          </Button>
        </div>
      </Modal>

      {/* Add Customer Modal */}
      <Modal
        isOpen={showCustomerModal}
        onClose={() => setShowCustomerModal(false)}
        title="Add New Customer"
        maxWidth="max-w-md"
      >
        <div className="space-y-4">
          <Input
            label="Customer Name"
            value={customerForm.name}
            onChange={(e) => setCustomerForm({ ...customerForm, name: e.target.value })}
            placeholder="Enter customer name"
          />
          
          <Input
            label="Email"
            type="email"
            value={customerForm.email}
            onChange={(e) => setCustomerForm({ ...customerForm, email: e.target.value })}
            placeholder="customer@example.com"
          />
          
          <Input
            label="Phone"
            value={customerForm.phone}
            onChange={(e) => setCustomerForm({ ...customerForm, phone: e.target.value })}
            placeholder="+1 234 567 8900"
          />
          
          <Input
            label="Address"
            value={customerForm.address}
            onChange={(e) => setCustomerForm({ ...customerForm, address: e.target.value })}
            placeholder="Customer address"
          />
        </div>

        <div className="flex space-x-4 pt-6">
          <Button 
            variant="secondary" 
            onClick={() => setShowCustomerModal(false)} 
            className="flex-1"
            disabled={loading}
          >
            Cancel
          </Button>
          <Button onClick={createCustomer} className="flex-1" disabled={loading}>
            {loading ? 'Creating...' : 'Create Customer'}
          </Button>
        </div>
      </Modal>

      {/* View Order Modal */}
      {selectedOrder && (
        <Modal
          isOpen={!!selectedOrder}
          onClose={() => setSelectedOrder(null)}
          title={`Sales Order ${selectedOrder._id.slice(-6)}`}
          maxWidth="max-w-3xl"
        >
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <h4 className="font-semibold text-slate-700">Customer</h4>
                <p>{selectedOrder.customerId === 'walk-in' ? 'Walk-in Customer' : selectedOrder.customer?.name}</p>
                {selectedOrder.customer?.phone && (
                  <p className="text-sm text-slate-600">{selectedOrder.customer.phone}</p>
                )}
              </div>
              <div>
                <h4 className="font-semibold text-slate-700">Order Details</h4>
                <p>Date: {new Date(selectedOrder.orderDate).toLocaleDateString()}</p>
                <p>Status: <span className={`px-2 py-1 rounded text-xs ${getStatusColor(selectedOrder.status)}`}>
                  {selectedOrder.status.charAt(0).toUpperCase() + selectedOrder.status.slice(1)}
                </span></p>
                <p>Payment: <span className={`px-2 py-1 rounded text-xs ${getPaymentStatusColor(selectedOrder.paymentStatus)}`}>
                  {selectedOrder.paymentStatus.charAt(0).toUpperCase() + selectedOrder.paymentStatus.slice(1)}
                </span></p>
              </div>
            </div>
            
            <div>
              <h4 className="font-semibold text-slate-700 mb-2">Items</h4>
              <div className="space-y-2">
                {selectedOrder.items?.map((item, index) => (
                  <div key={index} className="flex justify-between p-3 bg-slate-50 rounded">
                    <div>
                      <span className="font-medium">
                        {item.productVariantId.productId?.name} - {item.productVariantId.name}
                      </span>
                      <p className="text-sm text-slate-600">SKU: {item.productVariantId.sku}</p>
                    </div>
                    <div className="text-right">
                      <p>{item.quantity} × ₹{item.unitPrice}</p>
                      <p className="font-semibold">₹{item.totalPrice}</p>
                    </div>
                  </div>
                ))}
              </div>
              
              <div className="flex justify-between items-center mt-4 p-3 bg-green-50 rounded">
                <span className="text-lg font-semibold">Total Amount:</span>
                <span className="text-xl font-bold text-green-600">
                  ₹{selectedOrder.totalAmount?.toFixed(2) || '0.00'}
                </span>
              </div>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}