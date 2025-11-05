'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Customer } from '@/lib/types/sales';

interface CustomerSelectorProps {
  customers: Customer[];
  selectedCustomerId: string;
  onCustomerSelect: (customerId: string) => void;
}

export default function CustomerSelector({
  customers,
  selectedCustomerId,
  onCustomerSelect
}: CustomerSelectorProps) {
  const [searchQuery, setSearchQuery] = useState('Walk-in Customer');
  const [showSuggestions, setShowSuggestions] = useState(false);

  const handleSearch = (value: string) => {
    setSearchQuery(value);
    setShowSuggestions(value.length > 0 && value !== 'Walk-in Customer');
    if (value === 'Walk-in Customer' || value === '') {
      onCustomerSelect('walk-in');
    } else {
      onCustomerSelect('');
    }
  };

  const selectCustomer = (customer: Customer) => {
    setSearchQuery(customer.name.toUpperCase());
    onCustomerSelect(customer._id);
    setShowSuggestions(false);
  };

  const selectWalkIn = () => {
    setSearchQuery('Walk-in Customer');
    onCustomerSelect('walk-in');
    setShowSuggestions(false);
  };

  const filteredCustomers = customers.filter(customer => {
    return customer.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
           (customer.phone && customer.phone.includes(searchQuery));
  });

  return (
    <div className="relative" style={{ overflow: 'visible' }}>
      <label className="block text-xs font-medium text-slate-600 mb-1">
        Customer Name <span className="text-red-500">*</span>
      </label>
      <input
        type="text"
        value={searchQuery}
        onChange={(e) => handleSearch(e.target.value)}
        onFocus={() => searchQuery.length > 0 && searchQuery !== 'Walk-in Customer' && setShowSuggestions(true)}
        placeholder="Search customer..."
        className="w-full px-2 py-1.5 text-sm border border-slate-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-blue-500 uppercase"
      />
      
      {/* Customer Suggestions Dropdown */}
      {showSuggestions && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-slate-300 rounded shadow-lg max-h-48 overflow-y-auto" style={{ zIndex: 1000 }}>
          {/* Walk-in Customer option */}
          <div
            onClick={selectWalkIn}
            className="px-3 py-2 hover:bg-blue-50 cursor-pointer border-b border-slate-100 text-sm"
          >
            <div className="font-medium text-slate-800 uppercase">Walk-in Customer</div>
            <div className="text-xs text-slate-500">(Cash sale)</div>
          </div>

          {filteredCustomers.length > 0 ? (
            filteredCustomers.map(customer => (
              <div
                key={customer._id}
                onClick={() => selectCustomer(customer)}
                className="px-3 py-2 hover:bg-blue-50 cursor-pointer border-b border-slate-100 text-sm"
              >
                <div className="font-medium text-slate-800 uppercase">
                  {customer.name}
                </div>
                <div className="text-xs text-slate-500">
                  {customer.phone && `Phone: ${customer.phone}`}
                </div>
              </div>
            ))
          ) : (
            <div className="px-3 py-2 text-center text-slate-500 text-xs border-b border-slate-100">
              No customers found
            </div>
          )}
          
          {/* Add Customer Option */}
          <Link
            href="/customers/create"
            target="_blank"
            className="block px-3 py-2 bg-blue-50 hover:bg-blue-100 transition-colors text-sm"
          >
            <div className="flex items-center gap-2 font-medium text-blue-600">
              <span>+</span>
              <span>Add New Customer</span>
            </div>
          </Link>
        </div>
      )}
      <p className="text-xs text-slate-500 mt-1">
        Walk-in customers must pay full amount. Select a customer for credit sales.
      </p>
    </div>
  );
}
