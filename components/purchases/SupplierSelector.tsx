'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Supplier } from '@/lib/types/purchases';

interface SupplierSelectorProps {
  suppliers: Supplier[];
  selectedSupplierId: string;
  onSupplierSelect: (supplierId: string) => void;
}

export default function SupplierSelector({
  suppliers,
  selectedSupplierId,
  onSupplierSelect
}: SupplierSelectorProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);

  const handleSearch = (value: string) => {
    setSearchQuery(value);
    setShowSuggestions(value.length > 0);
    if (!value) onSupplierSelect('');
  };

  const selectSupplier = (supplier: Supplier) => {
    setSearchQuery(supplier.name.toUpperCase());
    onSupplierSelect(supplier._id);
    setShowSuggestions(false);
  };

  const filteredSuppliers = suppliers.filter(supplier => {
    return supplier.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
           (supplier.phone && supplier.phone.includes(searchQuery)) ||
           (supplier.contactName && supplier.contactName.toLowerCase().includes(searchQuery.toLowerCase()));
  });

  return (
    <div className="relative" style={{ overflow: 'visible' }}>
      <label className="block text-xs font-medium text-slate-600 mb-1">
        Supplier Name <span className="text-red-500">*</span>
      </label>
      <input
        type="text"
        value={searchQuery}
        onChange={(e) => handleSearch(e.target.value)}
        onFocus={() => setShowSuggestions(searchQuery.length > 0)}
        placeholder="Search supplier..."
        required={!selectedSupplierId}
        className="w-full px-2 py-1.5 text-sm border border-slate-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-blue-500 uppercase"
      />
      
      {/* Supplier Suggestions Dropdown */}
      {showSuggestions && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-slate-300 rounded shadow-lg max-h-48 overflow-y-auto" style={{ zIndex: 1000 }}>
          {filteredSuppliers.length > 0 ? (
            filteredSuppliers.map(supplier => (
              <div
                key={supplier._id}
                onClick={() => selectSupplier(supplier)}
                className="px-3 py-2 hover:bg-blue-50 cursor-pointer border-b border-slate-100 text-sm"
              >
                <div className="font-medium text-slate-800 uppercase">
                  {supplier.name}
                </div>
                <div className="text-xs text-slate-500">
                  {supplier.phone && `Phone: ${supplier.phone}`}
                  {supplier.contactName && ` | Contact: ${supplier.contactName.toUpperCase()}`}
                </div>
              </div>
            ))
          ) : (
            <div className="px-3 py-2 text-center text-slate-500 text-xs border-b border-slate-100">
              No suppliers found
            </div>
          )}
          
          {/* Add Supplier Option */}
          <Link
            href="/suppliers/create"
            target="_blank"
            className="block px-3 py-2 bg-blue-50 hover:bg-blue-100 transition-colors text-sm"
          >
            <div className="flex items-center gap-2 font-medium text-blue-600">
              <span>+</span>
              <span>Add New Supplier</span>
            </div>
          </Link>
        </div>
      )}
    </div>
  );
}
