'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useToast } from '@/components/shared/ToastProvider';
import { useConfirm } from '@/components/shared/ConfirmDialog';

interface Category {
  _id: string;
  name: string;
  description?: string;
}

export default function CategoriesPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const { showSuccess, showError } = useToast();
  const { confirm } = useConfirm();
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/signin');
    }
  }, [status, router]);

  useEffect(() => {
    if (session) {
      fetchCategories();
    }
  }, [session]);

  const fetchCategories = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/categories');
      const data = await response.json();
      
      if (response.ok) {
        setCategories(data.categories || []);
      } else {
        setError(data.error || 'Failed to fetch categories');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    const confirmed = await confirm({
      title: 'Delete Category',
      message: 'Are you sure you want to delete this category?',
      confirmText: 'Delete',
      cancelText: 'Cancel',
      variant: 'danger'
    });

    if (!confirmed) return;

    try {
      const response = await fetch(`/api/categories?id=${id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        await fetchCategories();
        showSuccess('Category deleted successfully!');
      } else {
        const data = await response.json();
        showError(data.error || 'Failed to delete category');
      }
    } catch (err) {
      showError(err instanceof Error ? err.message : 'An error occurred');
    }
  };

  if (status === 'loading' || loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto"></div>
          <p className="mt-4 text-slate-600">Loading categories...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-green-50 to-emerald-100 p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <div className="flex items-center gap-2 text-sm text-slate-600 mb-2">
              <Link href="/dashboard" className="hover:text-green-600">Dashboard</Link>
              <span>›</span>
              <span className="text-slate-800 font-semibold">Masters</span>
              <span>›</span>
              <span className="text-green-600">Categories</span>
            </div>
            <h1 className="text-4xl font-bold text-slate-800 mb-2">Product Categories</h1>
            <p className="text-slate-600">Organize your products by categories (Electronics, Food, etc.)</p>
          </div>
          <Link
            href="/masters/categories/create"
            className="bg-gradient-to-r from-green-600 to-emerald-600 text-white px-6 py-3 rounded-xl font-semibold hover:from-green-700 hover:to-emerald-700 transition-all shadow-lg"
          >
            + Add Category
          </Link>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl mb-6">
            {error}
          </div>
        )}

        {/* Categories Grid */}
        <div className="bg-white/90 backdrop-blur-lg rounded-xl shadow-xl overflow-hidden">
          {categories.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">📁</div>
              <p className="text-slate-600 mb-4">No categories found. Add your first product category!</p>
              <Link
                href="/masters/categories/create"
                className="text-green-600 hover:text-green-700 font-semibold"
              >
                Create Category
              </Link>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gradient-to-r from-green-600 to-emerald-600 text-white">
                  <tr>
                    <th className="px-6 py-4 text-left font-semibold">Name</th>
                    <th className="px-6 py-4 text-left font-semibold">Description</th>
                    <th className="px-6 py-4 text-right font-semibold">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {categories.map((category) => (
                    <tr key={category._id} className="hover:bg-green-50 transition-colors">
                      <td className="px-6 py-4">
                        <span className="font-semibold text-slate-800">{category.name}</span>
                      </td>
                      <td className="px-6 py-4 text-slate-600">
                        {category.description || '-'}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <button
                          onClick={() => handleDelete(category._id)}
                          className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg transition-colors"
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
