'use client';

import { useState } from 'react';
import { Product, SaleItem } from '@/lib/types/sales';
import ProductSelector from '@/components/sales/ProductSelector';

interface AddItemFormProps {
  products: Product[];
  onAddItem: (item: SaleItem) => void;
  onError: (error: string) => void;
}

export default function AddItemForm({
  products,
  onAddItem,
  onError
}: AddItemFormProps) {
  const [selectedProductId, setSelectedProductId] = useState('');
  const [itemQuantity, setItemQuantity] = useState(1);
  const [itemSellingPrice, setItemSellingPrice] = useState('');

  // Get selected product info
  const selectedProduct = products.find(p => p._id === selectedProductId);

  const handleQuantityChange = (value: string) => {
    if (value === '' || /^\d+$/.test(value)) {
      setItemQuantity(value === '' ? 0 : parseInt(value));
    }
  };

  const handleSellingPriceChange = (value: string) => {
    if (value === '' || /^\d*\.?\d*$/.test(value)) {
      setItemSellingPrice(value);
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

    const sellingPrice = parseFloat(itemSellingPrice);
    if (!sellingPrice || sellingPrice <= 0) {
      onError('Selling price must be greater than 0');
      return;
    }

    // Check stock availability
    const stockAvailable = product.currentStock || product.quantity || 0;
    if (itemQuantity > stockAvailable) {
      onError(`Insufficient stock! Available: ${stockAvailable} ${product.unitOfMeasure}`);
      return;
    }

    const displayName = product.companyName 
      ? `${product.companyName} - ${product.name}` 
      : product.name;

    const baseAmount = itemQuantity * sellingPrice;
    const taxType = 'gst'; // GST (CGST + SGST)
    const taxRate = 18; // 18% GST
    const taxAmount = (baseAmount * taxRate) / 100;
    const totalPrice = baseAmount + taxAmount;

    const newItem: SaleItem = {
      productId: product._id,
      productName: displayName,
      unitOfMeasure: product.unitOfMeasure,
      quantity: itemQuantity,
      sellingPrice,
      taxType,
      taxRate,
      taxAmount,
      totalPrice
    };

    onAddItem(newItem);

    // Reset form
    setSelectedProductId('');
    setItemQuantity(1);
    setItemSellingPrice('');
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
            Selling Price (₹)
          </label>
          <input
            type="text"
            value={itemSellingPrice}
            onChange={(e) => handleSellingPriceChange(e.target.value)}
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

      {/* Product Information Display - Always visible when product selected */}
      {selectedProduct && (
        <div className="mt-3 p-3 bg-slate-50 border border-slate-200 rounded-lg">
          <div className="flex items-center justify-between text-sm">
            <div>
              <span className="text-slate-600 font-medium">Stock Available:</span>
              <span className={`ml-2 font-bold text-lg ${(selectedProduct.quantity > 10) ? 'text-green-600' : (selectedProduct.quantity > 0) ? 'text-orange-600' : 'text-red-600'}`}>
                {selectedProduct.quantity} {selectedProduct.unitOfMeasure}
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
