'use client';

import { useState, ReactNode } from 'react';
import Link from 'next/link';

export interface SearchSelectOption {
  id: string;
  label: string;
  sublabel?: string;
}

interface SearchSelectProps<T extends SearchSelectOption> {
  options: T[];
  value: string;
  onChange: (id: string) => void;
  placeholder?: string;
  label?: string;
  required?: boolean;
  addNewLink?: string;
  addNewLabel?: string;
  renderOption?: (option: T) => ReactNode;
  filterFn?: (option: T, query: string) => boolean;
}

export default function SearchSelect<T extends SearchSelectOption>({
  options,
  value,
  onChange,
  placeholder = 'Search...',
  label,
  required = false,
  addNewLink,
  addNewLabel = 'Add New',
  renderOption,
  filterFn
}: SearchSelectProps<T>) {
  const [searchQuery, setSearchQuery] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);

  const handleSearch = (val: string) => {
    setSearchQuery(val);
    setShowSuggestions(val.length > 0);
    if (!val) onChange('');
  };

  const selectOption = (option: T) => {
    setSearchQuery(option.label.toUpperCase());
    onChange(option.id);
    setShowSuggestions(false);
  };

  const defaultFilter = (option: T, query: string) => {
    return option.label.toLowerCase().includes(query.toLowerCase()) ||
           (option.sublabel && option.sublabel.toLowerCase().includes(query.toLowerCase()));
  };

  const filteredOptions = options.filter(option => 
    filterFn ? filterFn(option, searchQuery) : defaultFilter(option, searchQuery)
  );

  const defaultRender = (option: T) => (
    <div>
      <div className="font-medium text-slate-800 uppercase">
        {option.label}
      </div>
      {option.sublabel && (
        <div className="text-xs text-slate-500">
          {option.sublabel}
        </div>
      )}
    </div>
  );

  return (
    <div className="relative" style={{ overflow: 'visible' }}>
      {label && (
        <label className="block text-xs font-medium text-slate-600 mb-1">
          {label} {required && <span className="text-red-500">*</span>}
        </label>
      )}
      <input
        type="text"
        value={searchQuery}
        onChange={(e) => handleSearch(e.target.value)}
        onFocus={() => setShowSuggestions(searchQuery.length > 0)}
        placeholder={placeholder}
        required={required && !value}
        className="w-full px-2 py-1.5 text-sm border border-slate-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-blue-500 uppercase"
      />
      
      {showSuggestions && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-slate-300 rounded shadow-lg max-h-48 overflow-y-auto" style={{ zIndex: 1000 }}>
          {filteredOptions.length > 0 ? (
            filteredOptions.map(option => (
              <div
                key={option.id}
                onClick={() => selectOption(option)}
                className="px-3 py-2 hover:bg-blue-50 cursor-pointer border-b border-slate-100 text-sm"
              >
                {renderOption ? renderOption(option) : defaultRender(option)}
              </div>
            ))
          ) : (
            <div className="px-3 py-2 text-center text-slate-500 text-xs border-b border-slate-100">
              No results found
            </div>
          )}
          
          {addNewLink && (
            <Link
              href={addNewLink}
              target="_blank"
              className="block px-3 py-2 bg-blue-50 hover:bg-blue-100 transition-colors text-sm"
            >
              <div className="flex items-center gap-2 font-medium text-blue-600">
                <span>+</span>
                <span>{addNewLabel}</span>
              </div>
            </Link>
          )}
        </div>
      )}
    </div>
  );
}
