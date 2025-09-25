'use client';

import React, { useState, useEffect } from 'react';
import { Button, Input, Select, Modal, Card } from '../ui';

// Types
interface Product {
  _id: string;
  name: string;
  sku: string;
  unitOfMeasure: {
    _id: string;
    name: string;
    abbreviation: string;
  };
  createdAt: string;
}

interface ProductVariant {
  _id: string;
  productId: string;
  name: string;
  sku: string;
  attributes: Record<string, any>;
  sellingPrice: number;
  createdAt: string;
}

interface UnitOfMeasure {
  _id: string;
  name: string;
  abbreviation: string;
}

interface ProductManagementProps {
  onClose?: () => void;
}

export default function ProductManagement({ onClose }: ProductManagementProps) {
  const [products, setProducts] = useState<Product[]>([]);
  const [variants, setVariants] = useState<ProductVariant[]>([]);
  const [units, setUnits] = useState<UnitOfMeasure[]>([]);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  
  // Modal states
  const [showProductModal, setShowProductModal] = useState(false);
  const [showVariantModal, setShowVariantModal] = useState(false);
  const [showUnitModal, setShowUnitModal] = useState(false);
  
  // Form states
  const [productForm, setProductForm] = useState({
    name: '',
    sku: '',
    unitOfMeasure: ''
  });
  
  const [variantForm, setVariantForm] = useState({
    name: '',
    sku: '',
    sellingPrice: 0,
    attributes: {}
  });
  
  const [unitForm, setUnitForm] = useState({
    name: '',
    abbreviation: ''
  });
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Load data on component mount
  useEffect(() => {
    loadProducts();
    loadUnits();
  }, []);

  // Load products and their variants when a product is selected
  useEffect(() => {
    if (selectedProduct) {
      loadVariants(selectedProduct._id);
    }
  }, [selectedProduct]);

  const loadProducts = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/products');
      if (!response.ok) throw new Error('Failed to load products');
      const data = await response.json();
      setProducts(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const loadVariants = async (productId: string) => {
    try {
      const response = await fetch(`/api/products/${productId}/variants`);
      if (!response.ok) throw new Error('Failed to load variants');
      const data = await response.json();
      setVariants(data);
    } catch (err: any) {
      setError(err.message);
    }
  };

  const loadUnits = async () => {
    try {
      const response = await fetch('/api/units');
      if (!response.ok) throw new Error('Failed to load units');
      const data = await response.json();
      setUnits(data);
    } catch (err: any) {
      setError(err.message);
    }
  };

  const createProduct = async () => {
    if (!productForm.name || !productForm.sku || !productForm.unitOfMeasure) {
      setError('All fields are required');
      return;
    }

    try {
      setLoading(true);
      const response = await fetch('/api/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: productForm.name,
          sku: productForm.sku,
          unitOfMeasureId: productForm.unitOfMeasure
        })
      });
      
      if (!response.ok) throw new Error('Failed to create product');
      
      await loadProducts();
      setShowProductModal(false);
      setProductForm({ name: '', sku: '', unitOfMeasure: '' });
      setError('');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const createVariant = async () => {
    if (!selectedProduct || !variantForm.name || !variantForm.sku) {
      setError('Product selection and variant details are required');
      return;
    }

    try {
      setLoading(true);
      const response = await fetch(`/api/products/${selectedProduct._id}/variants`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(variantForm)
      });
      
      if (!response.ok) throw new Error('Failed to create variant');
      
      await loadVariants(selectedProduct._id);
      setShowVariantModal(false);
      setVariantForm({ name: '', sku: '', sellingPrice: 0, attributes: {} });
      setError('');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const createUnit = async () => {
    if (!unitForm.name || !unitForm.abbreviation) {
      setError('All fields are required');
      return;
    }

    try {
      setLoading(true);
      const response = await fetch('/api/units', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(unitForm)
      });
      
      if (!response.ok) throw new Error('Failed to create unit');
      
      await loadUnits();
      setShowUnitModal(false);
      setUnitForm({ name: '', abbreviation: '' });
      setError('');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      )}

      {/* Header with Actions */}
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-slate-900">Product Management</h2>
        <div className="flex space-x-3">
          <Button onClick={() => setShowUnitModal(true)} variant="secondary" size="sm">
            Add Unit
          </Button>
          <Button onClick={() => setShowProductModal(true)} size="sm">
            Add Product
          </Button>
        </div>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Products List */}
        <Card title="Products">
          <div className="space-y-3">
            {loading ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
              </div>
            ) : products.length === 0 ? (
              <div className="text-center py-8 text-slate-500">
                No products found. Add your first product!
              </div>
            ) : (
              products.map((product) => (
                <div
                  key={product._id}
                  onClick={() => setSelectedProduct(product)}
                  className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                    selectedProduct?._id === product._id
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="font-semibold text-slate-900">{product.name}</h4>
                      <p className="text-sm text-slate-600">SKU: {product.sku}</p>
                      <p className="text-sm text-slate-600">
                        Unit: {product.unitOfMeasure?.name} ({product.unitOfMeasure?.abbreviation})
                      </p>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </Card>

        {/* Product Variants */}
        <Card title={selectedProduct ? `${selectedProduct.name} - Variants` : 'Select a Product'}>
          {selectedProduct ? (
            <div className="space-y-4">
              <Button onClick={() => setShowVariantModal(true)} size="sm" className="w-full">
                Add Variant
              </Button>
              
              <div className="space-y-3">
                {variants.length === 0 ? (
                  <div className="text-center py-8 text-slate-500">
                    No variants found. Add your first variant!
                  </div>
                ) : (
                  variants.map((variant) => (
                    <div key={variant._id} className="p-4 border border-slate-200 rounded-lg">
                      <div className="flex justify-between items-start">
                        <div>
                          <h4 className="font-semibold text-slate-900">{variant.name}</h4>
                          <p className="text-sm text-slate-600">SKU: {variant.sku}</p>
                          <p className="text-sm font-medium text-green-600">
                            ₹{variant.sellingPrice}
                          </p>
                          {Object.keys(variant.attributes).length > 0 && (
                            <div className="mt-2">
                              {Object.entries(variant.attributes).map(([key, value]) => (
                                <span
                                  key={key}
                                  className="inline-block bg-slate-100 text-slate-700 text-xs px-2 py-1 rounded mr-2"
                                >
                                  {key}: {String(value)}
                                </span>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          ) : (
            <div className="text-center py-8 text-slate-500">
              Select a product to view its variants
            </div>
          )}
        </Card>
      </div>

      {/* Add Product Modal */}
      <Modal
        isOpen={showProductModal}
        onClose={() => setShowProductModal(false)}
        title="Add New Product"
        maxWidth="max-w-md"
      >
        <div className="space-y-4">
          <Input
            label="Product Name"
            value={productForm.name}
            onChange={(e) => setProductForm({ ...productForm, name: e.target.value })}
            placeholder="e.g., Butter, Laptop, T-Shirt"
          />
          
          <Input
            label="SKU (Stock Keeping Unit)"
            value={productForm.sku}
            onChange={(e) => setProductForm({ ...productForm, sku: e.target.value })}
            placeholder="e.g., BUTTER-001"
          />
          
          <Select
            label="Unit of Measure"
            value={productForm.unitOfMeasure}
            onChange={(e) => setProductForm({ ...productForm, unitOfMeasure: e.target.value })}
            options={units.map(unit => ({ value: unit._id, label: `${unit.name} (${unit.abbreviation})` }))}
          />
        </div>

        <div className="flex space-x-4 pt-6">
          <Button 
            variant="secondary" 
            onClick={() => setShowProductModal(false)} 
            className="flex-1"
            disabled={loading}
          >
            Cancel
          </Button>
          <Button onClick={createProduct} className="flex-1" disabled={loading}>
            {loading ? 'Creating...' : 'Create Product'}
          </Button>
        </div>
      </Modal>

      {/* Add Variant Modal */}
      <Modal
        isOpen={showVariantModal}
        onClose={() => setShowVariantModal(false)}
        title="Add Product Variant"
        maxWidth="max-w-md"
      >
        <div className="space-y-4">
          <Input
            label="Variant Name"
            value={variantForm.name}
            onChange={(e) => setVariantForm({ ...variantForm, name: e.target.value })}
            placeholder="e.g., 100g Pack, Large Size"
          />
          
          <Input
            label="SKU"
            value={variantForm.sku}
            onChange={(e) => setVariantForm({ ...variantForm, sku: e.target.value })}
            placeholder="e.g., BUTTER-100G"
          />
          
          <Input
            label="Selling Price (₹)"
            type="number"
            value={variantForm.sellingPrice}
            onChange={(e) => setVariantForm({ ...variantForm, sellingPrice: parseFloat(e.target.value) || 0 })}
            placeholder="0.00"
          />
        </div>

        <div className="flex space-x-4 pt-6">
          <Button 
            variant="secondary" 
            onClick={() => setShowVariantModal(false)} 
            className="flex-1"
            disabled={loading}
          >
            Cancel
          </Button>
          <Button onClick={createVariant} className="flex-1" disabled={loading}>
            {loading ? 'Creating...' : 'Create Variant'}
          </Button>
        </div>
      </Modal>

      {/* Add Unit Modal */}
      <Modal
        isOpen={showUnitModal}
        onClose={() => setShowUnitModal(false)}
        title="Add Unit of Measure"
        maxWidth="max-w-md"
      >
        <div className="space-y-4">
          <Input
            label="Unit Name"
            value={unitForm.name}
            onChange={(e) => setUnitForm({ ...unitForm, name: e.target.value })}
            placeholder="e.g., Kilogram, Piece, Liter"
          />
          
          <Input
            label="Abbreviation"
            value={unitForm.abbreviation}
            onChange={(e) => setUnitForm({ ...unitForm, abbreviation: e.target.value })}
            placeholder="e.g., kg, pcs, L"
          />
        </div>

        <div className="flex space-x-4 pt-6">
          <Button 
            variant="secondary" 
            onClick={() => setShowUnitModal(false)} 
            className="flex-1"
            disabled={loading}
          >
            Cancel
          </Button>
          <Button onClick={createUnit} className="flex-1" disabled={loading}>
            {loading ? 'Creating...' : 'Create Unit'}
          </Button>
        </div>
      </Modal>
    </div>
  );
}