'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Button, Input, Select, Modal } from '../ui';

// Types
interface UnitOfMeasure {
  _id: string;
  name: string;
  abbreviation: string;
}

interface QuickInventoryAddProps {
  onClose?: () => void;
  onSuccess?: () => void;
}

export default function QuickInventoryAdd({ onClose, onSuccess }: QuickInventoryAddProps) {
  const [unitsOfMeasure, setUnitsOfMeasure] = useState<UnitOfMeasure[]>([]);
  
  // Refs for cursor position preservation
  const nameInputRef = useRef<HTMLInputElement>(null);
  const brandInputRef = useRef<HTMLInputElement>(null);
  const skuInputRef = useRef<HTMLInputElement>(null);
  
  // Form state
  const [formData, setFormData] = useState({
    // Product details
    name: '',
    brand: '', // Replace category with brand/company
    description: '',
    unitOfMeasure: '',
    
    // Stock details
    quantity: 0,
    supplierName: '',
    notes: '',
    
    // Additional details
    barcode: '',
    sku: '',
    minStockLevel: 10 // Only minimum stock level needed
  });
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Load units only (no categories)
  useEffect(() => {
    loadUnitsOfMeasure();
  }, []);

  const loadUnitsOfMeasure = async () => {
    try {
      const response = await fetch('/api/units-of-measure');
      if (response.ok) {
        const data = await response.json();
        setUnitsOfMeasure(Array.isArray(data) ? data : data.units || []);
      }
    } catch (error) {
      console.error('Error loading units:', error);
    }
  };

  const handleInputChange = (field: string, value: string | number) => {
    // Don't convert to uppercase in JavaScript - let CSS handle display
    // Only convert when submitting to ensure data consistency
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const validateStep1 = () => {
    if (!formData.name.trim()) {
      setError('Product name is required');
      return false;
    }
    if (!formData.unitOfMeasure) {
      setError('Please select unit of measure');
      return false;
    }
    if (formData.quantity <= 0) {
      setError('Quantity must be greater than 0');
      return false;
    }
    return true;
  };

  // Reset form to initial state
  const resetForm = () => {
    setFormData({
      name: '',
      brand: '',
      description: '',
      unitOfMeasure: '',
      quantity: 0,
      supplierName: '',
      notes: '',
      barcode: '',
      sku: '',
      minStockLevel: 10
    });
    setError('');
    setSuccess('');
  };

  const submitForm = async () => {
    setError('');
    setSuccess('');
    if (!validateStep1()) return;

    try {
      setLoading(true);

      // Step 1: Create the product
      const productPayload = {
        name: formData.name.toUpperCase(), // Always capitalize
        brand: formData.brand.toUpperCase(), // Brand/company name
        description: formData.description,
        sellingPrice: 0, // Will be set later when selling
        costPrice: 0, // Default cost price, not input by user
        unitOfMeasure: formData.unitOfMeasure,
        barcode: formData.barcode || undefined,
        sku: formData.sku.toUpperCase() || undefined,
        minStockLevel: formData.minStockLevel,
        isActive: true
      };

      const productResponse = await fetch('/api/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(productPayload)
      });

      if (!productResponse.ok) {
        const errorData = await productResponse.json();
        throw new Error(errorData.error || 'Failed to create product');
      }

      const newProduct = await productResponse.json();

      // Step 2: Add initial stock
      const stockPayload = {
        product: newProduct._id,
        quantity: formData.quantity,
        type: 'adjustment',
        reason: 'initial-stock',
        notes: formData.notes || `Initial stock added - ${formData.quantity} units from ${formData.supplierName || 'supplier'}`,
        adjustmentType: 'increase'
      };

      const stockResponse = await fetch('/api/inventory/adjust', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(stockPayload)
      });

      if (!stockResponse.ok) {
        const errorData = await stockResponse.json();
        throw new Error(errorData.error || 'Failed to add stock');
      }

      // Success! Show success message and reset form
      setSuccess(`✅ Successfully added ${formData.quantity} units of "${formData.name}" to inventory!`);
      resetForm();
      
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const renderForm = () => (
    <div className="space-y-6">
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h3 className="font-semibold text-blue-800">Add New Product & Stock</h3>
        <p className="text-sm text-blue-600 mt-1">
          Add a new product and receive initial stock in one go.
        </p>
      </div>

      {/* Product Details */}
      <div className="space-y-4">
        <h4 className="font-medium text-slate-700 border-b border-slate-200 pb-2">
          Product Information
        </h4>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input
            label="Product Name *"
            value={formData.name}
            onChange={(e) => handleInputChange('name', e.target.value)}
            placeholder="Enter product name"
            className="uppercase"
          />

          <Input
            label="Brand/Company (Optional)"
            value={formData.brand}
            onChange={(e) => handleInputChange('brand', e.target.value)}
            placeholder="e.g., SURYA, SONY, SAMSUNG"
            className="uppercase"
          />

          <Select
            label="Unit of Measure *"
            value={formData.unitOfMeasure}
            onChange={(e) => handleInputChange('unitOfMeasure', e.target.value)}
            options={[
              { value: '', label: 'Select Unit' },
              ...unitsOfMeasure.map(unit => ({ 
                value: unit._id, 
                label: `${unit.name} (${unit.abbreviation})` 
              }))
            ]}
          />

          <Input
            label="SKU/Code (Optional)"
            value={formData.sku}
            onChange={(e) => handleInputChange('sku', e.target.value)}
            placeholder="Product code"
            className="uppercase"
          />
        </div>

        <Input
          label="Description (Optional)"
          value={formData.description}
          onChange={(e) => handleInputChange('description', e.target.value)}
          placeholder="Product description"
        />

        <Input
          label="Minimum Stock Level (Alert when low)"
          type="number"
          value={formData.minStockLevel}
          onChange={(e) => handleInputChange('minStockLevel', parseInt(e.target.value) || 0)}
          placeholder="10"
        />
      </div>

      {/* Stock Details */}
      <div className="space-y-4">
        <h4 className="font-medium text-slate-700 border-b border-slate-200 pb-2">
          Initial Stock
        </h4>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input
            label="Quantity Received *"
            type="number"
            value={formData.quantity}
            onChange={(e) => handleInputChange('quantity', parseInt(e.target.value) || 0)}
            placeholder="Enter quantity"
          />

          <Input
            label="Supplier Name (Optional)"
            value={formData.supplierName}
            onChange={(e) => handleInputChange('supplierName', e.target.value)}
            placeholder="Who supplied this?"
          />
        </div>

        <Input
          label="Notes (Optional)"
          value={formData.notes}
          onChange={(e) => handleInputChange('notes', e.target.value)}
          placeholder="e.g., 'Received fresh stock today from XYZ supplier'"
        />
      </div>
    </div>
  );

  // Main component return
  return (
    <div className="space-y-6">
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      )}

      {success && (
        <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded">
          {success}
        </div>
      )}

      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-slate-900">
          Quick Add New Inventory
        </h2>
      </div>

      {/* Form Content */}
      {renderForm()}

      {/* Action Buttons */}
      <div className="flex space-x-4 pt-6 border-t border-slate-200">
        <Button 
          variant="secondary" 
          onClick={resetForm} 
          className="flex-1"
          disabled={loading}
        >
          Clear Form
        </Button>
        <Button 
          onClick={submitForm} 
          className="flex-1"
          disabled={loading}
        >
          {loading ? 'Adding...' : 'Add Product & Stock'}
        </Button>
      </div>
    </div>
  );
}