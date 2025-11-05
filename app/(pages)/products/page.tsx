'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import Link from 'next/link';

interface Product {
  _id: string;
  name: string;
  companyName?: string;
  unitOfMeasure: string;
  quantity: number;
  minStockLevel: number;
  createdAt: string;
}

export default function ProductsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/signin');
    }
  }, [status, router]);

  useEffect(() => {
    if (session) {
      fetchProducts();
    }
  }, [session]);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/products');
      
      if (!response.ok) {
        throw new Error('Failed to fetch products');
      }

      const data = await response.json();
      setProducts(data.products || []);
    } catch (err) { setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-slate-700 text-xl">Loading...</div>
      </div>
    );
  }

  if (!session) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      {/* Header */}
      <header className="bg-white/90 backdrop-blur-lg border-b border-indigo-200/50 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-4">
              <Link href="/dashboard">
                <h1 className="text-2xl font-bold bg-gradient-to-r from-indigo-600 to-blue-600 bg-clip-text text-transparent cursor-pointer">
                  Wandenreich
                </h1>
              </Link>
              <span className="text-slate-400">/</span>
              <span className="text-slate-700 font-medium">Products</span>
            </div>
            <Link
              href="/products/create"
              className="px-4 py-2 bg-gradient-to-r from-indigo-600 to-blue-600 text-white rounded-xl hover:shadow-lg transition-all duration-200 transform hover:scale-105"
            >
              ➕ Add Product
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-slate-800 mb-2">All Products</h2>
          <p className="text-slate-600">Manage your inventory products</p>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl mb-6">
// Direct modal render helper: (will be rendered by the page component when selectedProduct is set)

            {error}
          </div>
        )}

        {/* Products Table */}
        <div className="bg-white/90 backdrop-blur-xl rounded-2xl shadow-xl border border-indigo-200/50 overflow-hidden">
          {products.length === 0 ? (
            <div className="text-center py-12">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-slate-100 rounded-full mb-4">
                <svg className="w-8 h-8 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-slate-800 mb-2">No products yet</h3>
              <p className="text-slate-600 mb-4">Get started by adding your first product</p>
              <Link
                href="/products/create"
                className="inline-block px-6 py-3 bg-gradient-to-r from-indigo-600 to-blue-600 text-white rounded-xl hover:shadow-lg transition-all duration-200"
              >
                ➕ Add Your First Product
              </Link>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-slate-50 border-b border-slate-200">
                  <tr>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-slate-700">Product Name</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-slate-700">Unit</th>
                    <th className="px-6 py-4 text-right text-sm font-semibold text-slate-700">Current Stock</th>
                    <th className="px-6 py-4 text-right text-sm font-semibold text-slate-700">Min Stock</th>
                    <th className="px-6 py-4 text-center text-sm font-semibold text-slate-700">Status</th>
                    <th className="px-6 py-4 text-center text-sm font-semibold text-slate-700">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {products.map((product) => {
                    const isLowStock = product.minStockLevel > 0 && product.quantity <= product.minStockLevel;
                    const isOutOfStock = product.quantity === 0;
                    
                    return (
                      <tr key={product._id} className="hover:bg-slate-50 transition-colors">
                        <td className="px-6 py-4">
                          <div className="font-medium text-slate-800 uppercase">
                            {product.companyName ? `${product.companyName} - ${product.name}` : product.name}
                          </div>
                        </td>
                        <td className="px-6 py-4 text-slate-600 uppercase">
                          {product.unitOfMeasure}
                        </td>
                        <td className="px-6 py-4 text-right">
                          <span className={`font-bold text-lg ${
                            isOutOfStock ? 'text-red-600' : 
                            isLowStock ? 'text-orange-600' : 
                            'text-green-600'
                          }`}>
                            {product.quantity}
                          </span>
                          <span className="text-xs text-slate-500 ml-1 uppercase">{product.unitOfMeasure}</span>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <span className="text-slate-700 font-medium">
                            {product.minStockLevel}
                          </span>
                          <span className="text-xs text-slate-500 ml-1 uppercase">{product.unitOfMeasure}</span>
                        </td>
                        <td className="px-6 py-4 text-center">
                          {isOutOfStock ? (
                            <span className="inline-flex px-3 py-1 rounded-full text-xs font-medium bg-red-100 text-red-700">
                              Out of Stock
                            </span>
                          ) : isLowStock ? (
                            <span className="inline-flex px-3 py-1 rounded-full text-xs font-medium bg-orange-100 text-orange-700">
                              Low Stock
                            </span>
                          ) : (
                            <span className="inline-flex px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-700">
                              In Stock
                            </span>
                          )}
                        </td>
                        <td className="px-6 py-4 text-center">
                          <button
                            onClick={() => setSelectedProduct(product)}
                            className="text-indigo-600 hover:text-indigo-800 font-medium text-sm"
                          >
                            View
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Summary Stats */}
        {products.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mt-8">
            <div className="bg-white/90 backdrop-blur-lg rounded-xl p-6 border border-slate-200/50 shadow-lg">
              <div className="text-sm text-slate-600 mb-1">Total Products</div>
              <div className="text-2xl font-bold text-slate-800">{products.length}</div>
            </div>
            <div className="bg-white/90 backdrop-blur-lg rounded-xl p-6 border border-green-200/50 shadow-lg">
              <div className="text-sm text-slate-600 mb-1">In Stock</div>
              <div className="text-2xl font-bold text-green-600">
                {products.filter(p => p.quantity > p.minStockLevel).length}
              </div>
            </div>
            <div className="bg-white/90 backdrop-blur-lg rounded-xl p-6 border border-orange-200/50 shadow-lg">
              <div className="text-sm text-slate-600 mb-1">Low Stock</div>
              <div className="text-2xl font-bold text-orange-600">
                {products.filter(p => p.quantity > 0 && p.quantity <= p.minStockLevel).length}
              </div>
            </div>
            <div className="bg-white/90 backdrop-blur-lg rounded-xl p-6 border border-red-200/50 shadow-lg">
              <div className="text-sm text-slate-600 mb-1">Out of Stock</div>
              <div className="text-2xl font-bold text-red-600">
                {products.filter(p => p.quantity === 0).length}
              </div>
            </div>
          </div>
        )}
      </main>

      {selectedProduct && (
        <ProductModal product={selectedProduct} onClose={() => setSelectedProduct(null)} />
      )}
    </div>
  );
}

// Product Details Modal
const ProductModal = ({ product, onClose }: { product: Product; onClose: () => void }) => {
  const [purchaseHistory, setPurchaseHistory] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPurchaseHistory = async () => {
      try {
        setLoading(true);
        const response = await fetch('/api/purchases');
        if (response.ok) {
          const data = await response.json();
          
          // Extract purchase items for this product from all purchases
          const items: any[] = [];
          data.purchases?.forEach((purchase: any) => {
            purchase.items?.forEach((item: any) => {
              // Check both string and object productId
              const itemProductId = typeof item.productId === 'object' ? item.productId._id : item.productId;
              
              if (itemProductId === product._id || itemProductId?.toString() === product._id?.toString()) {
                items.push({
                  date: purchase.createdAt || purchase.purchaseDate,
                  supplier: purchase.supplierId?.name || purchase.supplierName || 'Unknown',
                  quantity: item.quantity,
                  price: item.unitCost || item.unitPrice || 0,
                  total: item.totalCost || item.totalPrice || 0
                });
              }
            });
          });
          // Sort by date - most recent first
          items.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
          setPurchaseHistory(items);
        }
      } catch (error) {
        console.error('Error fetching purchase history:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchPurchaseHistory();
  }, [product._id]);

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b flex justify-between items-center bg-gradient-to-r from-indigo-50 to-blue-50">
          <div>
            <h3 className="text-2xl font-bold text-slate-800">📦 Product Details</h3>
            <p className="text-sm text-slate-600 mt-1">View stock and purchase history</p>
          </div>
          <button onClick={onClose} className="p-2 rounded-lg hover:bg-white/50 text-2xl text-slate-600 hover:text-slate-800">✕</button>
        </div>
        
        <div className="p-6 space-y-6">
          {/* Product Info */}
          <div className="bg-slate-50 rounded-xl p-4 border border-slate-200">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="col-span-2">
                <div className="text-xs text-slate-600 mb-1">Product Name</div>
                <div className="font-bold text-slate-800 uppercase text-lg">
                  {product.companyName ? `${product.companyName} - ${product.name}` : product.name}
                </div>
              </div>
              <div>
                <div className="text-xs text-slate-600 mb-1">Current Stock</div>
                <div className={`font-bold text-xl ${product.quantity > product.minStockLevel ? 'text-green-600' : product.quantity > 0 ? 'text-orange-600' : 'text-red-600'}`}>
                  {product.quantity} <span className="text-sm text-slate-500">{product.unitOfMeasure}</span>
                </div>
              </div>
              <div>
                <div className="text-xs text-slate-600 mb-1">Min Stock</div>
                <div className="font-semibold text-slate-700">
                  {product.minStockLevel} <span className="text-sm text-slate-500">{product.unitOfMeasure}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Current Stock Batches (FIFO) */}
          <div>
            <h4 className="text-lg font-bold text-slate-800 mb-3 flex items-center gap-2">
              <span>📜</span> Purchase History
            </h4>
            
            {loading ? (
              <div className="text-center py-8 text-slate-500">Loading purchase history...</div>
            ) : purchaseHistory.length === 0 ? (
              <div className="text-center py-8 bg-slate-50 rounded-xl border border-slate-200">
                <div className="text-slate-400 text-4xl mb-2">📋</div>
                <p className="text-slate-600">No purchase history found</p>
                <p className="text-sm text-slate-500 mt-1">This product hasn't been purchased yet</p>
              </div>
            ) : (
              <div className="border border-slate-200 rounded-xl overflow-hidden">
                <table className="w-full">
                  <thead className="bg-slate-100 border-b border-slate-200">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-slate-700">Date</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-slate-700">Supplier</th>
                      <th className="px-4 py-3 text-right text-xs font-semibold text-slate-700">Quantity</th>
                      <th className="px-4 py-3 text-right text-xs font-semibold text-slate-700">Unit Price</th>
                      <th className="px-4 py-3 text-right text-xs font-semibold text-slate-700">Total</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200">
                    {purchaseHistory.map((item, index) => (
                      <tr key={index} className="hover:bg-slate-50">
                        <td className="px-4 py-3 text-sm text-slate-700">
                          {new Date(item.date).toLocaleDateString()}
                        </td>
                        <td className="px-4 py-3 text-sm text-slate-700 uppercase">
                          {item.supplier}
                        </td>
                        <td className="px-4 py-3 text-sm text-right font-medium text-slate-800">
                          {item.quantity} {product.unitOfMeasure}
                        </td>
                        <td className="px-4 py-3 text-sm text-right font-semibold text-indigo-600">
                          ₹{item.price.toFixed(2)}
                        </td>
                        <td className="px-4 py-3 text-sm text-right font-bold text-slate-800">
                          ₹{item.total.toFixed(2)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
        
        <div className="p-6 border-t bg-slate-50 flex justify-end">
          <button onClick={onClose} className="px-6 py-2 rounded-xl bg-gradient-to-r from-indigo-600 to-blue-600 text-white hover:shadow-lg transition-all">Close</button>
        </div>
      </div>
    </div>
  );
};

// End of file
