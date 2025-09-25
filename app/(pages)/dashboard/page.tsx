'use client';

import React, { useState, useEffect } from 'react';
import { useSession, signOut } from 'next-auth/react';
import { useRouter, useSearchParams } from 'next/navigation';

// Import UI components
import { Modal } from '../../../components/ui';

// Import dashboard atomic components
import {
  DashboardHeader,
  StatsOverview,
  ActionGrid
} from '../../../components/dashboard';

export default function DashboardPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const searchParams = useSearchParams();
  
  // Dashboard stats (will be loaded from APIs)
  const [stats, setStats] = useState({
    totalProducts: 0,
    lowStockItems: 0,
    pendingOrders: 0,
    todaysSales: 0,
    totalCustomers: 0,
    totalSuppliers: 0,
    unpaidInvoices: 0,
    stockValue: 0
  });

  const [successMessage, setSuccessMessage] = useState('');

  // Authentication check
  useEffect(() => {
    if (status === 'loading') return;
    if (!session) {
      router.push('/auth/signin');
    }
    
    // Check for success messages
    const success = searchParams.get('success');
    if (success === 'stock-received') {
      setSuccessMessage('✅ Stock received successfully! Inventory has been updated.');
      setTimeout(() => setSuccessMessage(''), 5000);
    } else if (success === 'invoice-created') {
      const invoiceId = searchParams.get('invoiceId');
      setSuccessMessage(`✅ Sales invoice created successfully! Invoice ID: ${invoiceId}`);
      setTimeout(() => setSuccessMessage(''), 5000);
    }
  }, [session, status, router, searchParams]);

  // Load dashboard stats
  useEffect(() => {
    if (session) {
      loadDashboardStats();
    }
  }, [session]);

  const loadDashboardStats = async () => {
    try {
      // Load various stats in parallel
      const [
        productsRes,
        inventoryRes,
        ordersRes,
        salesRes
      ] = await Promise.all([
        fetch('/api/products'),
        fetch('/api/inventory?type=lowStock'),
        fetch('/api/purchase-orders'),
        fetch('/api/sales-orders')
      ]);

      if (productsRes.ok) {
        const products = await productsRes.json();
        setStats(prev => ({ ...prev, totalProducts: products.length }));
      }

      if (inventoryRes.ok) {
        const lowStock = await inventoryRes.json();
        setStats(prev => ({ ...prev, lowStockItems: lowStock.length }));
      }

      if (ordersRes.ok) {
        const orders = await ordersRes.json();
        const ordersArray = Array.isArray(orders) ? orders : (orders.orders || []);
        const pending = ordersArray.filter((o: any) => o.status === 'pending').length;
        setStats(prev => ({ ...prev, pendingOrders: pending }));
      }

      if (salesRes.ok) {
        const sales = await salesRes.json();
        const salesArray = Array.isArray(sales) ? sales : (sales.sales || []);
        const today = new Date().toDateString();
        const todaySales = salesArray.filter((s: any) => 
          new Date(s.orderDate).toDateString() === today
        );
        const todayAmount = todaySales.reduce((sum: number, s: any) => sum + (s.totalAmount || 0), 0);
        setStats(prev => ({ 
          ...prev, 
          todaysSales: todayAmount,
          unpaidInvoices: salesArray.filter((s: any) => s.paymentStatus === 'unpaid').length
        }));
      }
    } catch (error) {
      console.error('Error loading dashboard stats:', error);
    }
  };

  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!session) {
    return null;
  }

  const handleSignOut = () => {
    signOut({ callbackUrl: '/auth/signin' });
  };

  // Action items for the business management grid
  const actionItems = [
    {
      title: 'Quick Add New Inventory',
      description: '🔥 Got new stock today? Add both product and stock in one easy step!',
      onClick: () => router.push('/quick-add'),
      buttonText: 'Add New Stock',
      icon: '⚡',
      featured: true
    },
    {
      title: 'Receive Stock/Bill Entry',
      description: '📋 Got a supplier bill with multiple items? Enter all items at once from invoice!',
      onClick: () => router.push('/receive-stock'),
      buttonText: 'Enter Supplier Bill',
      icon: '📦',
      featured: true
    },
    {
      title: 'Create Sales Invoice',
      description: '🧾 Generate professional invoice for customer with multiple items and GST calculation!',
      onClick: () => router.push('/create-invoice'),
      buttonText: 'Create Invoice',
      icon: '🧾',
      featured: true
    },
    {
      title: 'Product Management',
      description: 'Manage your product catalog, variants, and pricing across all categories.',
      onClick: () => router.push('/products'),
      buttonText: 'Manage Products',
      icon: '📦'
    },
    {
      title: 'Stock Management',
      description: 'Track inventory levels, set stock alerts, and manage stock adjustments.',
      onClick: () => router.push('/inventory'),
      buttonText: 'View Inventory',
      icon: '📊'
    },
    {
      title: 'Purchase Orders',
      description: 'Create purchase orders, manage suppliers, and receive stock deliveries.',
      onClick: () => router.push('/purchases'),
      buttonText: 'Manage Purchases',
      icon: '🛒'
    },
    {
      title: 'Sales & Billing',
      description: 'Create sales orders, manage customers, and generate invoices for your business.',
      onClick: () => router.push('/sales'),
      buttonText: 'Process Sales',
      icon: '💰'
    },
    {
      title: 'Accounts & Payments',
      description: 'Track customer and supplier balances, record payments, and manage ledgers.',
      onClick: () => router.push('/accounts'),
      buttonText: 'View Accounts',
      icon: '📋'
    },
    {
      title: 'Reports & Analytics',
      description: 'Generate business reports, analyze sales trends, and track profitability.',
      onClick: () => router.push('/reports'),
      buttonText: 'View Reports',
      icon: '📈'
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      {/* Header */}
      <DashboardHeader
        userName={session.user?.name || undefined}
        userInitial={session.user?.name?.charAt(0)?.toUpperCase()}
        onSignOut={handleSignOut}
      />

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Success Message */}
        {successMessage && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
            <div className="flex items-center">
              <span className="text-2xl mr-3">✅</span>
              <div>
                <p className="text-green-800 font-medium">
                  {successMessage}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Business Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {/* Products */}
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-600 text-sm font-medium">Total Products</p>
                <p className="text-3xl font-bold text-slate-900">{stats.totalProducts}</p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <span className="text-2xl">📦</span>
              </div>
            </div>
          </div>

          {/* Low Stock Alert */}
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-600 text-sm font-medium">Low Stock Items</p>
                <p className={`text-3xl font-bold ${stats.lowStockItems > 0 ? 'text-red-600' : 'text-green-600'}`}>
                  {stats.lowStockItems}
                </p>
              </div>
              <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${
                stats.lowStockItems > 0 ? 'bg-red-100' : 'bg-green-100'
              }`}>
                <span className="text-2xl">{stats.lowStockItems > 0 ? '⚠️' : '✅'}</span>
              </div>
            </div>
          </div>

          {/* Today's Sales */}
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-600 text-sm font-medium">Today's Sales</p>
                <p className="text-3xl font-bold text-green-600">₹{stats.todaysSales.toFixed(0)}</p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <span className="text-2xl">💰</span>
              </div>
            </div>
          </div>

          {/* Pending Orders */}
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-600 text-sm font-medium">Pending Orders</p>
                <p className="text-3xl font-bold text-amber-600">{stats.pendingOrders}</p>
              </div>
              <div className="w-12 h-12 bg-amber-100 rounded-lg flex items-center justify-center">
                <span className="text-2xl">🛒</span>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Alerts */}
        {stats.lowStockItems > 0 && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
            <div className="flex items-center">
              <span className="text-2xl mr-3">⚠️</span>
              <div>
                <h3 className="font-semibold text-yellow-800">
                  Stock Alert: {stats.lowStockItems} items running low
                </h3>
                <p className="text-sm text-yellow-700">
                  Check your inventory and consider reordering these items.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Business Management Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {actionItems.map((action, index) => (
            <div key={index} className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 hover:shadow-md transition-shadow">
              <div className="flex items-start space-x-4">
                <div className="text-3xl">{action.icon}</div>
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-slate-900 mb-2">{action.title}</h3>
                  <p className="text-slate-600 mb-4 text-sm">{action.description}</p>
                  <button
                    onClick={action.onClick}
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition-colors"
                  >
                    {action.buttonText}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Business Health Summary */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
            <h3 className="text-lg font-semibold text-slate-900 mb-4">Unpaid Invoices</h3>
            <p className="text-3xl font-bold text-red-600">{stats.unpaidInvoices}</p>
            <p className="text-sm text-slate-600 mt-2">Outstanding customer payments</p>
          </div>
          
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
            <h3 className="text-lg font-semibold text-slate-900 mb-4">Stock Value</h3>
            <p className="text-3xl font-bold text-blue-600">₹{stats.stockValue.toLocaleString()}</p>
            <p className="text-sm text-slate-600 mt-2">Total inventory value</p>
          </div>
          
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
            <h3 className="text-lg font-semibold text-slate-900 mb-4">Business Health</h3>
            <p className="text-3xl font-bold text-green-600">Good</p>
            <p className="text-sm text-slate-600 mt-2">Overall system status</p>
          </div>
        </div>
      </main>
    </div>
  );
}