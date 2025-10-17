'use client';

import { useState } from 'react';
import ProductSelector from './ProductSelector';
import { Product, PurchaseItem } from '@/lib/types/purchases';
import { calculateItemTax } from '@/lib/utils/purchases';

interface AddItemFormProps {
  products: Product[];
  onAddItem: (item: PurchaseItem) => void;
  onError: (error: string) => void;
}

export default function AddItemForm({
  products,
  onAddItem,
  onError
}: AddItemFormProps) {
  const [selectedProductId, setSelectedProductId] = useState('');
  const [itemQuantity, setItemQuantity] = useState(1);
  const [itemUnitCost, setItemUnitCost] = useState('');

  const handleQuantityChange = (value: string) => {
    if (value === '' || /^\d+$/.test(value)) {
      setItemQuantity(value === '' ? 0 : parseInt(value));
    }
  };

  const handleUnitCostChange = (value: string) => {
    if (value === '' || /^\d*\.?\d*$/.test(value)) {
      setItemUnitCost(value);
    }
  };

  const handleAddItem = () => {
    if (!selectedProductId) {
      onError('Please select a product');
      return;
    }

    const product = products.find(p => p._id === selectedProductId);
    if (!product) return;

    if (itemQuantity <= 0) {
      onError('Quantity must be greater than 0');
      return;
    }

    const unitCost = parseFloat(itemUnitCost);
    if (!unitCost || unitCost <= 0) {
      onError('Unit cost must be greater than 0');
      return;
    }

    const displayName = product.companyName 
      ? `${product.companyName} - ${product.name}` 
      : product.name;

    const baseAmount = itemQuantity * unitCost;
    const taxType = 'none';
    const taxRate = 0;
    const taxAmount = 0;
    const totalCost = baseAmount;

    const newItem: PurchaseItem = {
      productId: product._id,
      productName: displayName,
      unitOfMeasure: product.unitOfMeasure,
      quantity: itemQuantity,
      unitCost,
      taxType,
      taxRate,
      taxAmount,
      totalCost
    };

    onAddItem(newItem);

    // Reset form
    setSelectedProductId('');
    setItemQuantity(1);
    setItemUnitCost('');
    onError('');
  };

  return (
    <div className="bg-white rounded-lg shadow border border-slate-200 p-6" style={{ overflow: 'visible' }}>
      <h3 className="text-lg font-semibold text-slate-800 mb-4 border-b border-slate-200 pb-2">Add Item</h3>
      
      <div className="grid grid-cols-12 gap-3 mb-3" style={{ overflow: 'visible' }}>
        <div className="col-span-3">
          <ProductSelector
            products={products}
            selectedProductId={selectedProductId}
            onProductSelect={setSelectedProductId}
          />
        </div>

        <div className="col-span-1">
          <label className="block text-xs font-medium text-slate-600 mb-1">
            Qty
          </label>
          <input
            type="text"
            value={itemQuantity || ''}
            onChange={(e) => handleQuantityChange(e.target.value)}
            placeholder="0"
            className="w-full px-2 py-1.5 text-sm border border-slate-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>

        <div className="col-span-2">
          <label className="block text-xs font-medium text-slate-600 mb-1">
            Unit Cost (₹)
          </label>
          <input
            type="text"
            value={itemUnitCost}
            onChange={(e) => handleUnitCostChange(e.target.value)}
            placeholder="0.00"
            className="w-full px-2 py-1.5 text-sm border border-slate-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>

        <div className="col-span-1">
          <label className="block text-xs font-medium text-slate-600 mb-1">
            &nbsp;
          </label>
          <button
            type="button"
            onClick={handleAddItem}
            className="w-full px-3 py-1.5 bg-blue-600 text-white text-sm rounded hover:bg-blue-700 transition-colors font-medium"
          >
            Add
          </button>
        </div>
      </div>
    </div>
  );
}
