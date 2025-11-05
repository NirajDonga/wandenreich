'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Product } from '@/lib/types/sales';

interface ProductSelectorProps {
  products: Product[];
  selectedProductId: string;
  onProductSelect: (productId: string) => void;
}

export default function ProductSelector({
  products,
  selectedProductId,
  onProductSelect
}: ProductSelectorProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);

  const handleSearch = (value: string) => {
    setSearchQuery(value);
    setShowSuggestions(value.length > 0);
    if (!value) onProductSelect('');
  };

  const selectProduct = (product: Product) => {
    const displayName = product.companyName 
      ? `${product.companyName} - ${product.name}` 
      : product.name;
    setSearchQuery(displayName.toUpperCase());
    onProductSelect(product._id);
    setShowSuggestions(false);
  };

  const filteredProducts = products.filter(product => {
    const displayName = product.companyName 
      ? `${product.companyName} - ${product.name}` 
      : product.name;
    return displayName.toLowerCase().includes(searchQuery.toLowerCase()) ||
           product.unitOfMeasure.toLowerCase().includes(searchQuery.toLowerCase());
  });

  return (
    <div className="relative" style={{ overflow: 'visible' }}>
      <label className="block text-xs font-medium text-slate-600 mb-1">
        Product
      </label>
      <input
        type="text"
        value={searchQuery}
        onChange={(e) => handleSearch(e.target.value)}
        onFocus={() => setShowSuggestions(searchQuery.length > 0)}
        placeholder="Search..."
        className="w-full px-2 py-1.5 text-sm border border-slate-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-blue-500 uppercase"
      />
      
      {/* Suggestions Dropdown */}
      {showSuggestions && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-slate-300 rounded shadow-lg max-h-48 overflow-y-auto" style={{ zIndex: 1000 }}>
          {filteredProducts.length > 0 ? (
            filteredProducts.map(product => {
              const displayName = product.companyName 
                ? `${product.companyName} - ${product.name}` 
                : product.name;
              const stock = product.currentStock || product.quantity || 0;
              const stockColor = stock > 10 ? 'text-green-600' : stock > 0 ? 'text-orange-600' : 'text-red-600';
              const stockBg = stock > 10 ? 'bg-green-50' : stock > 0 ? 'bg-orange-50' : 'bg-red-50';
              
              return (
                <div
                  key={product._id}
                  onClick={() => selectProduct(product)}
                  className={`px-3 py-2 hover:bg-blue-50 cursor-pointer border-b border-slate-100 text-sm ${stock === 0 ? 'opacity-50' : ''}`}
                >
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="font-medium text-slate-800 uppercase">
                        {displayName}
                      </div>
                      <div className="text-xs text-slate-500 uppercase">
                        {product.unitOfMeasure}
                      </div>
                    </div>
                    <div className={`ml-2 px-2 py-0.5 rounded text-xs font-bold ${stockBg} ${stockColor}`}>
                      Stock: {stock}
                    </div>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="px-3 py-2 text-center text-slate-500 text-xs border-b border-slate-100">
              No products found
            </div>
          )}
          
          {/* Add Product Option */}
          <Link
            href="/products/create"
            target="_blank"
            className="block px-3 py-2 bg-blue-50 hover:bg-blue-100 transition-colors text-sm"
          >
            <div className="flex items-center gap-2 font-medium text-blue-600">
              <span>+</span>
              <span>Add New Product</span>
            </div>
          </Link>
        </div>
      )}
    </div>
  );
}

