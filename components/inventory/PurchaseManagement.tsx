'use client';

import React, { useState, useEffect } from 'react';
import { Button, Input, Select, Modal, Card } from '../ui';

// Types
interface Supplier {
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
  productId: {
    name: string;
  };
}

interface PurchaseOrderItem {
  productVariantId: string;
  quantity: number;
  unitCost: number;
  totalCost: number;
}

interface PurchaseOrder {
  _id: string;
  supplierId: string;
  supplier?: Supplier;
  orderDate: string;
  status: 'pending' | 'received' | 'cancelled';
  totalAmount: number;
  referenceNumber: string;
  items: Array<{
    productVariantId: ProductVariant;
    quantity: number;
    unitCost: number;
    totalCost: number;
  }>;
  createdAt: string;
}

interface PurchaseManagementProps {
  onClose?: () => void;
}

export default function PurchaseManagement({ onClose }: PurchaseManagementProps) {
  const [purchaseOrders, setPurchaseOrders] = useState<PurchaseOrder[]>([]);
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [productVariants, setProductVariants] = useState<ProductVariant[]>([]);
  const [filteredOrders, setFilteredOrders] = useState<PurchaseOrder[]>([]);
  
  // Filter states
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  
  // Modal states
  const [showOrderModal, setShowOrderModal] = useState(false);
  const [showSupplierModal, setShowSupplierModal] = useState(false);
  const [showReceiveModal, setShowReceiveModal] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<PurchaseOrder | null>(null);
  
  // Form states
  const [orderForm, setOrderForm] = useState({
    supplierId: '',
    referenceNumber: '',
    items: [] as PurchaseOrderItem[]
  });
  
  const [supplierForm, setSupplierForm] = useState({
    name: '',
    email: '',
    phone: '',
    address: ''
  });
  
  const [currentItem, setCurrentItem] = useState<PurchaseOrderItem>({
    productVariantId: '',
    quantity: 0,
    unitCost: 0,
    totalCost: 0
  });
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Load data on component mount
  useEffect(() => {
    loadPurchaseOrders();
    loadSuppliers();
    loadProductVariants();
  }, []);

  // Filter orders based on search and status
  useEffect(() => {
    let filtered = purchaseOrders;

    if (searchTerm) {
      filtered = filtered.filter(order => 
        order.referenceNumber?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.supplier?.name?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (statusFilter !== 'all') {
      filtered = filtered.filter(order => order.status === statusFilter);
    }

    setFilteredOrders(filtered);
  }, [purchaseOrders, searchTerm, statusFilter]);

  // Calculate total when item details change
  useEffect(() => {
    const total = currentItem.quantity * currentItem.unitCost;
    setCurrentItem(prev => ({ ...prev, totalCost: total }));
  }, [currentItem.quantity, currentItem.unitCost]);

  const loadPurchaseOrders = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/purchase-orders');
      if (!response.ok) throw new Error('Failed to load purchase orders');
      const data = await response.json();
      setPurchaseOrders(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const loadSuppliers = async () => {
    try {
      const response = await fetch('/api/suppliers');
      if (!response.ok) throw new Error('Failed to load suppliers');
      const data = await response.json();
      setSuppliers(data.suppliers || data);
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

  const createPurchaseOrder = async () => {
    if (!orderForm.supplierId || orderForm.items.length === 0) {
      setError('Please select a supplier and add at least one item');
      return;
    }

    try {
      setLoading(true);
      const totalAmount = orderForm.items.reduce((sum, item) => sum + item.totalCost, 0);
      
      const response = await fetch('/api/purchase-orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...orderForm,
          totalAmount
        })
      });
      
      if (!response.ok) throw new Error('Failed to create purchase order');
      
      await loadPurchaseOrders();
      setShowOrderModal(false);
      resetOrderForm();
      setError('');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const createSupplier = async () => {
    if (!supplierForm.name) {
      setError('Supplier name is required');
      return;
    }

    try {
      setLoading(true);
      const response = await fetch('/api/suppliers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(supplierForm)
      });
      
      if (!response.ok) throw new Error('Failed to create supplier');
      
      await loadSuppliers();
      setShowSupplierModal(false);
      setSupplierForm({ name: '', email: '', phone: '', address: '' });
      setError('');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const receivePurchaseOrder = async (orderId: string) => {
    try {
      setLoading(true);
      const response = await fetch(`/api/purchase-orders/${orderId}/receive`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });
      
      if (!response.ok) throw new Error('Failed to receive purchase order');
      
      await loadPurchaseOrders();
      setError('');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const addItemToOrder = () => {
    if (!currentItem.productVariantId || currentItem.quantity <= 0 || currentItem.unitCost <= 0) {
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
      unitCost: 0,
      totalCost: 0
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
      supplierId: '',
      referenceNumber: '',
      items: []
    });
    setCurrentItem({
      productVariantId: '',
      quantity: 0,
      unitCost: 0,
      totalCost: 0
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'received': return 'bg-green-100 text-green-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getTotalAmount = () => {
    return orderForm.items.reduce((sum, item) => sum + item.totalCost, 0);
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
        <h2 className="text-2xl font-bold text-slate-900">Purchase Orders</h2>
        <div className="flex space-x-3">
          <Button onClick={() => setShowSupplierModal(true)} variant="secondary" size="sm">
            Add Supplier
          </Button>
          <Button onClick={() => setShowOrderModal(true)} size="sm">
            New Purchase Order
          </Button>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <Input
          placeholder="Search orders or suppliers..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="flex-1"
        />
        <Select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          options={[
            { value: 'all', label: 'All Status' },
            { value: 'pending', label: 'Pending' },
            { value: 'received', label: 'Received' },
            { value: 'cancelled', label: 'Cancelled' }
          ]}
        />
      </div>

      {/* Purchase Orders Table */}
      <Card title="Purchase Orders">
        {loading ? (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          </div>
        ) : filteredOrders.length === 0 ? (
          <div className="text-center py-8 text-slate-500">
            No purchase orders found
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-200">
                  <th className="text-left py-3 px-2 font-semibold text-slate-700">Order #</th>
                  <th className="text-left py-3 px-2 font-semibold text-slate-700">Supplier</th>
                  <th className="text-left py-3 px-2 font-semibold text-slate-700">Date</th>
                  <th className="text-right py-3 px-2 font-semibold text-slate-700">Amount</th>
                  <th className="text-center py-3 px-2 font-semibold text-slate-700">Status</th>
                  <th className="text-right py-3 px-2 font-semibold text-slate-700">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredOrders.map((order) => (
                  <tr key={order._id} className="border-b border-slate-100 hover:bg-slate-50">
                    <td className="py-3 px-2 font-medium">
                      {order.referenceNumber || order._id.slice(-6)}
                    </td>
                    <td className="py-3 px-2">
                      {order.supplier?.name || 'Unknown Supplier'}
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
                    <td className="py-3 px-2 text-right">
                      <div className="flex justify-end gap-1">
                        {order.status === 'pending' && (
                          <Button
                            size="sm"
                            onClick={() => receivePurchaseOrder(order._id)}
                            disabled={loading}
                          >
                            Receive
                          </Button>
                        )}
                        <Button
                          size="sm"
                          variant="secondary"
                          onClick={() => setSelectedOrder(order)}
                        >
                          View
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      {/* Create Purchase Order Modal */}
      <Modal
        isOpen={showOrderModal}
        onClose={() => setShowOrderModal(false)}
        title="New Purchase Order"
        maxWidth="max-w-4xl"
      >
        <div className="space-y-6">
          {/* Order Details */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Select
              label="Supplier"
              value={orderForm.supplierId}
              onChange={(e) => setOrderForm({ ...orderForm, supplierId: e.target.value })}
              options={suppliers.map(supplier => ({ 
                value: supplier._id, 
                label: supplier.name 
              }))}
            />
            
            <Input
              label="Reference Number (Optional)"
              value={orderForm.referenceNumber}
              onChange={(e) => setOrderForm({ ...orderForm, referenceNumber: e.target.value })}
              placeholder="PO-2024-001"
            />
          </div>

          {/* Add Item Section */}
          <div className="border-t pt-4">
            <h3 className="text-lg font-semibold mb-4">Add Items</h3>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
              <Select
                label="Product Variant"
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
                label="Unit Cost (₹)"
                type="number"
                step="0.01"
                value={currentItem.unitCost}
                onChange={(e) => setCurrentItem({ 
                  ...currentItem, 
                  unitCost: parseFloat(e.target.value) || 0 
                })}
                placeholder="0.00"
              />
              
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Total Cost
                </label>
                <div className="px-3 py-2 border border-slate-300 rounded bg-slate-50 text-slate-700 font-semibold">
                  ₹{currentItem.totalCost.toFixed(2)}
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
                        <span className="text-slate-600 ml-2">
                          {item.quantity} × ₹{item.unitCost}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="font-semibold">₹{item.totalCost.toFixed(2)}</span>
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
              
              <div className="flex justify-between items-center mt-4 p-3 bg-blue-50 rounded">
                <span className="text-lg font-semibold">Total Order Amount:</span>
                <span className="text-xl font-bold text-blue-600">₹{getTotalAmount().toFixed(2)}</span>
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
          <Button onClick={createPurchaseOrder} className="flex-1" disabled={loading}>
            {loading ? 'Creating...' : 'Create Purchase Order'}
          </Button>
        </div>
      </Modal>

      {/* Add Supplier Modal */}
      <Modal
        isOpen={showSupplierModal}
        onClose={() => setShowSupplierModal(false)}
        title="Add New Supplier"
        maxWidth="max-w-md"
      >
        <div className="space-y-4">
          <Input
            label="Supplier Name"
            value={supplierForm.name}
            onChange={(e) => setSupplierForm({ ...supplierForm, name: e.target.value })}
            placeholder="Enter supplier name"
          />
          
          <Input
            label="Email"
            type="email"
            value={supplierForm.email}
            onChange={(e) => setSupplierForm({ ...supplierForm, email: e.target.value })}
            placeholder="supplier@example.com"
          />
          
          <Input
            label="Phone"
            value={supplierForm.phone}
            onChange={(e) => setSupplierForm({ ...supplierForm, phone: e.target.value })}
            placeholder="+1 234 567 8900"
          />
          
          <Input
            label="Address"
            value={supplierForm.address}
            onChange={(e) => setSupplierForm({ ...supplierForm, address: e.target.value })}
            placeholder="Supplier address"
          />
        </div>

        <div className="flex space-x-4 pt-6">
          <Button 
            variant="secondary" 
            onClick={() => setShowSupplierModal(false)} 
            className="flex-1"
            disabled={loading}
          >
            Cancel
          </Button>
          <Button onClick={createSupplier} className="flex-1" disabled={loading}>
            {loading ? 'Creating...' : 'Create Supplier'}
          </Button>
        </div>
      </Modal>

      {/* View Order Modal */}
      {selectedOrder && (
        <Modal
          isOpen={!!selectedOrder}
          onClose={() => setSelectedOrder(null)}
          title={`Purchase Order ${selectedOrder.referenceNumber || selectedOrder._id.slice(-6)}`}
          maxWidth="max-w-3xl"
        >
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <h4 className="font-semibold text-slate-700">Supplier</h4>
                <p>{selectedOrder.supplier?.name || 'Unknown'}</p>
                <p className="text-sm text-slate-600">{selectedOrder.supplier?.email}</p>
              </div>
              <div>
                <h4 className="font-semibold text-slate-700">Order Details</h4>
                <p>Date: {new Date(selectedOrder.orderDate).toLocaleDateString()}</p>
                <p>Status: <span className={`px-2 py-1 rounded text-xs ${getStatusColor(selectedOrder.status)}`}>
                  {selectedOrder.status.charAt(0).toUpperCase() + selectedOrder.status.slice(1)}
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
                      <p>{item.quantity} × ₹{item.unitCost}</p>
                      <p className="font-semibold">₹{item.totalCost}</p>
                    </div>
                  </div>
                ))}
              </div>
              
              <div className="flex justify-between items-center mt-4 p-3 bg-blue-50 rounded">
                <span className="text-lg font-semibold">Total Amount:</span>
                <span className="text-xl font-bold text-blue-600">
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