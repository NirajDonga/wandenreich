'use client';

import React, { useState, useEffect } from 'react';
import { Button, Input, Modal, Card } from '../ui';

// Types
interface InventoryItem {
  _id: string;
  productVariantId: {
    _id: string;
    name: string;
    sku: string;
    sellingPrice: number;
    productId: {
      name: string;
      sku: string;
    };
  };
  quantity: number;
  minStockLevel: number;
  maxStockLevel: number;
  lastUpdated: string;
}

interface StockAdjustment {
  productVariantId: string;
  quantityChange: number;
  notes: string;
}

interface StockManagementProps {
  onClose?: () => void;
}

export default function StockManagement({ onClose }: StockManagementProps) {
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [lowStockItems, setLowStockItems] = useState<InventoryItem[]>([]);
  const [filteredInventory, setFilteredInventory] = useState<InventoryItem[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState<'all' | 'low-stock' | 'overstock'>('all');
  
  // Modal states
  const [showAdjustModal, setShowAdjustModal] = useState(false);
  const [showStockLevelModal, setShowStockLevelModal] = useState(false);
  const [selectedItem, setSelectedItem] = useState<InventoryItem | null>(null);
  
  // Form states
  const [adjustmentForm, setAdjustmentForm] = useState<StockAdjustment>({
    productVariantId: '',
    quantityChange: 0,
    notes: ''
  });
  
  const [stockLevelForm, setStockLevelForm] = useState({
    minStockLevel: 0,
    maxStockLevel: 0
  });
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Load data on component mount
  useEffect(() => {
    loadInventory();
    loadLowStockItems();
  }, []);

  // Filter inventory based on search and filter
  useEffect(() => {
    let filtered = inventory;

    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(item => 
        item.productVariantId.productId.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.productVariantId.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.productVariantId.sku.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Apply status filter
    if (filter === 'low-stock') {
      filtered = filtered.filter(item => item.quantity <= item.minStockLevel);
    } else if (filter === 'overstock') {
      filtered = filtered.filter(item => 
        item.maxStockLevel > 0 && item.quantity > item.maxStockLevel
      );
    }

    setFilteredInventory(filtered);
  }, [inventory, searchTerm, filter]);

  const loadInventory = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/inventory');
      if (!response.ok) throw new Error('Failed to load inventory');
      const data = await response.json();
      setInventory(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const loadLowStockItems = async () => {
    try {
      const response = await fetch('/api/inventory?type=lowStock');
      if (!response.ok) throw new Error('Failed to load low stock items');
      const data = await response.json();
      setLowStockItems(data);
    } catch (err: any) {
      setError(err.message);
    }
  };

  const adjustStock = async () => {
    if (!selectedItem || adjustmentForm.quantityChange === 0) {
      setError('Please enter a valid quantity change');
      return;
    }

    try {
      setLoading(true);
      const response = await fetch('/api/inventory', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'adjustment',
          productVariantId: selectedItem.productVariantId._id,
          quantityChange: adjustmentForm.quantityChange,
          notes: adjustmentForm.notes
        })
      });
      
      if (!response.ok) throw new Error('Failed to adjust stock');
      
      await loadInventory();
      await loadLowStockItems();
      setShowAdjustModal(false);
      setSelectedItem(null);
      setAdjustmentForm({ productVariantId: '', quantityChange: 0, notes: '' });
      setError('');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const updateStockLevels = async () => {
    if (!selectedItem) return;

    try {
      setLoading(true);
      const response = await fetch('/api/inventory', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          productVariantId: selectedItem.productVariantId._id,
          minStockLevel: stockLevelForm.minStockLevel,
          maxStockLevel: stockLevelForm.maxStockLevel
        })
      });
      
      if (!response.ok) throw new Error('Failed to update stock levels');
      
      await loadInventory();
      await loadLowStockItems();
      setShowStockLevelModal(false);
      setSelectedItem(null);
      setStockLevelForm({ minStockLevel: 0, maxStockLevel: 0 });
      setError('');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const openAdjustModal = (item: InventoryItem) => {
    setSelectedItem(item);
    setAdjustmentForm({
      productVariantId: item.productVariantId._id,
      quantityChange: 0,
      notes: ''
    });
    setShowAdjustModal(true);
  };

  const openStockLevelModal = (item: InventoryItem) => {
    setSelectedItem(item);
    setStockLevelForm({
      minStockLevel: item.minStockLevel,
      maxStockLevel: item.maxStockLevel
    });
    setShowStockLevelModal(true);
  };

  const getStockStatus = (item: InventoryItem) => {
    if (item.quantity <= item.minStockLevel) {
      return { status: 'Low Stock', color: 'text-red-600 bg-red-50' };
    } else if (item.maxStockLevel > 0 && item.quantity > item.maxStockLevel) {
      return { status: 'Overstock', color: 'text-orange-600 bg-orange-50' };
    } else {
      return { status: 'Normal', color: 'text-green-600 bg-green-50' };
    }
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
        <h2 className="text-2xl font-bold text-slate-900">Stock Management</h2>
        <Button onClick={loadInventory} variant="secondary" size="sm" disabled={loading}>
          {loading ? 'Refreshing...' : 'Refresh'}
        </Button>
      </div>

      {/* Stock Alerts */}
      {lowStockItems.length > 0 && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <h3 className="font-semibold text-yellow-800 mb-2">
            ⚠️ Low Stock Alert ({lowStockItems.length} items)
          </h3>
          <div className="text-sm text-yellow-700">
            {lowStockItems.map(item => (
              <span key={item._id} className="inline-block mr-4 mb-1">
                {item.productVariantId.productId.name} - {item.productVariantId.name} 
                ({item.quantity} remaining)
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <Input
          placeholder="Search products..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="flex-1"
        />
        <div className="flex gap-2">
          <Button
            variant={filter === 'all' ? 'primary' : 'secondary'}
            size="sm"
            onClick={() => setFilter('all')}
          >
            All Items
          </Button>
          <Button
            variant={filter === 'low-stock' ? 'primary' : 'secondary'}
            size="sm"
            onClick={() => setFilter('low-stock')}
          >
            Low Stock
          </Button>
          <Button
            variant={filter === 'overstock' ? 'primary' : 'secondary'}
            size="sm"
            onClick={() => setFilter('overstock')}
          >
            Overstock
          </Button>
        </div>
      </div>

      {/* Inventory Table */}
      <Card title="Current Inventory">
        {loading ? (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          </div>
        ) : filteredInventory.length === 0 ? (
          <div className="text-center py-8 text-slate-500">
            No inventory items found
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-200">
                  <th className="text-left py-3 px-2 font-semibold text-slate-700">Product</th>
                  <th className="text-left py-3 px-2 font-semibold text-slate-700">Variant</th>
                  <th className="text-right py-3 px-2 font-semibold text-slate-700">Stock Qty</th>
                  <th className="text-right py-3 px-2 font-semibold text-slate-700">Min Level</th>
                  <th className="text-right py-3 px-2 font-semibold text-slate-700">Max Level</th>
                  <th className="text-center py-3 px-2 font-semibold text-slate-700">Status</th>
                  <th className="text-right py-3 px-2 font-semibold text-slate-700">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredInventory.map((item) => {
                  const stockStatus = getStockStatus(item);
                  return (
                    <tr key={item._id} className="border-b border-slate-100 hover:bg-slate-50">
                      <td className="py-3 px-2">
                        <div>
                          <div className="font-medium text-slate-900">
                            {item.productVariantId.productId.name}
                          </div>
                          <div className="text-sm text-slate-500">
                            {item.productVariantId.productId.sku}
                          </div>
                        </div>
                      </td>
                      <td className="py-3 px-2">
                        <div>
                          <div className="text-slate-900">{item.productVariantId.name}</div>
                          <div className="text-sm text-slate-500">{item.productVariantId.sku}</div>
                        </div>
                      </td>
                      <td className="py-3 px-2 text-right font-semibold">
                        {item.quantity}
                      </td>
                      <td className="py-3 px-2 text-right text-slate-600">
                        {item.minStockLevel}
                      </td>
                      <td className="py-3 px-2 text-right text-slate-600">
                        {item.maxStockLevel || '-'}
                      </td>
                      <td className="py-3 px-2 text-center">
                        <span className={`px-2 py-1 rounded text-xs font-medium ${stockStatus.color}`}>
                          {stockStatus.status}
                        </span>
                      </td>
                      <td className="py-3 px-2 text-right">
                        <div className="flex justify-end gap-1">
                          <Button
                            size="sm"
                            variant="secondary"
                            onClick={() => openAdjustModal(item)}
                          >
                            Adjust
                          </Button>
                          <Button
                            size="sm"
                            variant="secondary"
                            onClick={() => openStockLevelModal(item)}
                          >
                            Levels
                          </Button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      {/* Stock Adjustment Modal */}
      <Modal
        isOpen={showAdjustModal}
        onClose={() => setShowAdjustModal(false)}
        title="Adjust Stock"
        maxWidth="max-w-md"
      >
        {selectedItem && (
          <div className="space-y-4">
            <div className="bg-slate-50 p-3 rounded">
              <h4 className="font-semibold">{selectedItem.productVariantId.productId.name}</h4>
              <p className="text-sm text-slate-600">{selectedItem.productVariantId.name}</p>
              <p className="text-sm text-slate-600">Current Stock: <strong>{selectedItem.quantity}</strong></p>
            </div>
            
            <Input
              label="Quantity Change"
              type="number"
              value={adjustmentForm.quantityChange}
              onChange={(e) => setAdjustmentForm({ 
                ...adjustmentForm, 
                quantityChange: parseInt(e.target.value) || 0 
              })}
              placeholder="Enter positive or negative number"
            />
            <p className="text-sm text-slate-500 -mt-2">
              Use positive numbers to add stock, negative to remove
            </p>
            
            <Input
              label="Notes"
              value={adjustmentForm.notes}
              onChange={(e) => setAdjustmentForm({ ...adjustmentForm, notes: e.target.value })}
              placeholder="Reason for adjustment..."
            />
            
            {adjustmentForm.quantityChange !== 0 && (
              <div className="bg-blue-50 p-3 rounded">
                <p className="text-sm text-blue-700">
                  New stock level will be: <strong>
                    {selectedItem.quantity + adjustmentForm.quantityChange}
                  </strong>
                </p>
              </div>
            )}
          </div>
        )}

        <div className="flex space-x-4 pt-6">
          <Button 
            variant="secondary" 
            onClick={() => setShowAdjustModal(false)} 
            className="flex-1"
            disabled={loading}
          >
            Cancel
          </Button>
          <Button onClick={adjustStock} className="flex-1" disabled={loading}>
            {loading ? 'Adjusting...' : 'Adjust Stock'}
          </Button>
        </div>
      </Modal>

      {/* Stock Levels Modal */}
      <Modal
        isOpen={showStockLevelModal}
        onClose={() => setShowStockLevelModal(false)}
        title="Update Stock Levels"
        maxWidth="max-w-md"
      >
        {selectedItem && (
          <div className="space-y-4">
            <div className="bg-slate-50 p-3 rounded">
              <h4 className="font-semibold">{selectedItem.productVariantId.productId.name}</h4>
              <p className="text-sm text-slate-600">{selectedItem.productVariantId.name}</p>
            </div>
            
            <Input
              label="Minimum Stock Level"
              type="number"
              value={stockLevelForm.minStockLevel}
              onChange={(e) => setStockLevelForm({ 
                ...stockLevelForm, 
                minStockLevel: parseInt(e.target.value) || 0 
              })}
              placeholder="0"
            />
            <p className="text-sm text-slate-500 -mt-2">
              Alert when stock falls below this level
            </p>
            
            <Input
              label="Maximum Stock Level"
              type="number"
              value={stockLevelForm.maxStockLevel}
              onChange={(e) => setStockLevelForm({ 
                ...stockLevelForm, 
                maxStockLevel: parseInt(e.target.value) || 0 
              })}
              placeholder="0"
            />
            <p className="text-sm text-slate-500 -mt-2">
              Alert when stock exceeds this level (optional)
            </p>
          </div>
        )}

        <div className="flex space-x-4 pt-6">
          <Button 
            variant="secondary" 
            onClick={() => setShowStockLevelModal(false)} 
            className="flex-1"
            disabled={loading}
          >
            Cancel
          </Button>
          <Button onClick={updateStockLevels} className="flex-1" disabled={loading}>
            {loading ? 'Updating...' : 'Update Levels'}
          </Button>
        </div>
      </Modal>
    </div>
  );
}