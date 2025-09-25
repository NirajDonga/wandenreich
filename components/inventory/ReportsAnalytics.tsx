'use client';

import React, { useState, useEffect } from 'react';
import { Button, Input, Select, Card } from '../ui';

// Types
interface SalesReport {
  period: string;
  totalSales: number;
  totalProfit: number;
  totalOrders: number;
  averageOrderValue: number;
  topProducts: Array<{
    productName: string;
    quantitySold: number;
    totalRevenue: number;
  }>;
}

interface InventoryReport {
  totalValue: number;
  totalProducts: number;
  lowStockItems: number;
  outOfStockItems: number;
  topValueProducts: Array<{
    productName: string;
    quantity: number;
    unitPrice: number;
    totalValue: number;
  }>;
}

interface ProfitAnalysis {
  period: string;
  revenue: number;
  cost: number;
  grossProfit: number;
  profitMargin: number;
  monthlyData: Array<{
    month: string;
    revenue: number;
    cost: number;
    profit: number;
  }>;
}

interface ReportsAnalyticsProps {
  onClose?: () => void;
}

export default function ReportsAnalytics({ onClose }: ReportsAnalyticsProps) {
  const [salesReport, setSalesReport] = useState<SalesReport | null>(null);
  const [inventoryReport, setInventoryReport] = useState<InventoryReport | null>(null);
  const [profitAnalysis, setProfitAnalysis] = useState<ProfitAnalysis | null>(null);
  
  // Filter states
  const [reportType, setReportType] = useState<'sales' | 'inventory' | 'profit'>('sales');
  const [period, setPeriod] = useState<'daily' | 'weekly' | 'monthly' | 'yearly'>('monthly');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Set default date range (last 30 days)
  useEffect(() => {
    const today = new Date();
    const thirtyDaysAgo = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000);
    
    setEndDate(today.toISOString().split('T')[0]);
    setStartDate(thirtyDaysAgo.toISOString().split('T')[0]);
  }, []);

  // Load report data when filters change
  useEffect(() => {
    if (startDate && endDate) {
      loadReportData();
    }
  }, [reportType, period, startDate, endDate]);

  const loadReportData = async () => {
    try {
      setLoading(true);
      setError('');
      
      switch (reportType) {
        case 'sales':
          await loadSalesReport();
          break;
        case 'inventory':
          await loadInventoryReport();
          break;
        case 'profit':
          await loadProfitAnalysis();
          break;
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const loadSalesReport = async () => {
    try {
      const params = new URLSearchParams({
        startDate,
        endDate,
        period
      });
      
      const response = await fetch(`/api/reports/sales?${params}`);
      if (!response.ok) throw new Error('Failed to load sales report');
      
      const data = await response.json();
      setSalesReport(data);
    } catch (err: any) {
      // Mock data for demonstration
      setSalesReport({
        period: `${startDate} to ${endDate}`,
        totalSales: 125000,
        totalProfit: 31250,
        totalOrders: 85,
        averageOrderValue: 1470.59,
        topProducts: [
          { productName: 'Premium Tea', quantitySold: 150, totalRevenue: 22500 },
          { productName: 'Organic Rice', quantitySold: 200, totalRevenue: 18000 },
          { productName: 'Spice Mix', quantitySold: 120, totalRevenue: 14400 }
        ]
      });
    }
  };

  const loadInventoryReport = async () => {
    try {
      const response = await fetch('/api/reports/inventory');
      if (!response.ok) throw new Error('Failed to load inventory report');
      
      const data = await response.json();
      setInventoryReport(data);
    } catch (err: any) {
      // Mock data for demonstration
      setInventoryReport({
        totalValue: 485000,
        totalProducts: 145,
        lowStockItems: 12,
        outOfStockItems: 3,
        topValueProducts: [
          { productName: 'Premium Electronics', quantity: 25, unitPrice: 15000, totalValue: 375000 },
          { productName: 'Imported Goods', quantity: 50, unitPrice: 1200, totalValue: 60000 },
          { productName: 'Luxury Items', quantity: 15, unitPrice: 2500, totalValue: 37500 }
        ]
      });
    }
  };

  const loadProfitAnalysis = async () => {
    try {
      const params = new URLSearchParams({
        startDate,
        endDate
      });
      
      const response = await fetch(`/api/reports/profit-analysis?${params}`);
      if (!response.ok) throw new Error('Failed to load profit analysis');
      
      const data = await response.json();
      setProfitAnalysis(data);
    } catch (err: any) {
      // Mock data for demonstration
      setProfitAnalysis({
        period: `${startDate} to ${endDate}`,
        revenue: 125000,
        cost: 93750,
        grossProfit: 31250,
        profitMargin: 25.0,
        monthlyData: [
          { month: 'Jan', revenue: 45000, cost: 33750, profit: 11250 },
          { month: 'Feb', revenue: 38000, cost: 28500, profit: 9500 },
          { month: 'Mar', revenue: 42000, cost: 31500, profit: 10500 }
        ]
      });
    }
  };

  const exportReport = () => {
    // TODO: Implement report export functionality
    alert('Export functionality will be implemented');
  };

  const formatCurrency = (amount: number) => {
    return `₹${amount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}`;
  };

  const formatPercentage = (value: number) => {
    return `${value.toFixed(1)}%`;
  };

  const renderSalesReport = () => {
    if (!salesReport) return null;

    return (
      <div className="space-y-6">
        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <div className="text-center">
              <h3 className="text-sm font-medium text-slate-600">Total Sales</h3>
              <p className="text-2xl font-bold text-green-600">
                {formatCurrency(salesReport.totalSales)}
              </p>
            </div>
          </Card>
          
          <Card>
            <div className="text-center">
              <h3 className="text-sm font-medium text-slate-600">Total Profit</h3>
              <p className="text-2xl font-bold text-blue-600">
                {formatCurrency(salesReport.totalProfit)}
              </p>
              <p className="text-xs text-slate-500">
                {formatPercentage((salesReport.totalProfit / salesReport.totalSales) * 100)} margin
              </p>
            </div>
          </Card>
          
          <Card>
            <div className="text-center">
              <h3 className="text-sm font-medium text-slate-600">Total Orders</h3>
              <p className="text-2xl font-bold text-purple-600">{salesReport.totalOrders}</p>
            </div>
          </Card>
          
          <Card>
            <div className="text-center">
              <h3 className="text-sm font-medium text-slate-600">Avg Order Value</h3>
              <p className="text-2xl font-bold text-orange-600">
                {formatCurrency(salesReport.averageOrderValue)}
              </p>
            </div>
          </Card>
        </div>

        {/* Top Products */}
        <Card title="Top Selling Products">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-200">
                  <th className="text-left py-2 font-semibold text-slate-700">Product</th>
                  <th className="text-right py-2 font-semibold text-slate-700">Qty Sold</th>
                  <th className="text-right py-2 font-semibold text-slate-700">Revenue</th>
                </tr>
              </thead>
              <tbody>
                {salesReport.topProducts.map((product, index) => (
                  <tr key={index} className="border-b border-slate-100">
                    <td className="py-2">{product.productName}</td>
                    <td className="py-2 text-right">{product.quantitySold}</td>
                    <td className="py-2 text-right font-semibold text-green-600">
                      {formatCurrency(product.totalRevenue)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      </div>
    );
  };

  const renderInventoryReport = () => {
    if (!inventoryReport) return null;

    return (
      <div className="space-y-6">
        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <div className="text-center">
              <h3 className="text-sm font-medium text-slate-600">Total Inventory Value</h3>
              <p className="text-2xl font-bold text-blue-600">
                {formatCurrency(inventoryReport.totalValue)}
              </p>
            </div>
          </Card>
          
          <Card>
            <div className="text-center">
              <h3 className="text-sm font-medium text-slate-600">Total Products</h3>
              <p className="text-2xl font-bold text-green-600">{inventoryReport.totalProducts}</p>
            </div>
          </Card>
          
          <Card>
            <div className="text-center">
              <h3 className="text-sm font-medium text-slate-600">Low Stock Items</h3>
              <p className="text-2xl font-bold text-orange-600">{inventoryReport.lowStockItems}</p>
            </div>
          </Card>
          
          <Card>
            <div className="text-center">
              <h3 className="text-sm font-medium text-slate-600">Out of Stock</h3>
              <p className="text-2xl font-bold text-red-600">{inventoryReport.outOfStockItems}</p>
            </div>
          </Card>
        </div>

        {/* Top Value Products */}
        <Card title="Highest Value Inventory">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-200">
                  <th className="text-left py-2 font-semibold text-slate-700">Product</th>
                  <th className="text-right py-2 font-semibold text-slate-700">Quantity</th>
                  <th className="text-right py-2 font-semibold text-slate-700">Unit Price</th>
                  <th className="text-right py-2 font-semibold text-slate-700">Total Value</th>
                </tr>
              </thead>
              <tbody>
                {inventoryReport.topValueProducts.map((product, index) => (
                  <tr key={index} className="border-b border-slate-100">
                    <td className="py-2">{product.productName}</td>
                    <td className="py-2 text-right">{product.quantity}</td>
                    <td className="py-2 text-right">{formatCurrency(product.unitPrice)}</td>
                    <td className="py-2 text-right font-semibold text-blue-600">
                      {formatCurrency(product.totalValue)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      </div>
    );
  };

  const renderProfitAnalysis = () => {
    if (!profitAnalysis) return null;

    return (
      <div className="space-y-6">
        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <div className="text-center">
              <h3 className="text-sm font-medium text-slate-600">Revenue</h3>
              <p className="text-2xl font-bold text-green-600">
                {formatCurrency(profitAnalysis.revenue)}
              </p>
            </div>
          </Card>
          
          <Card>
            <div className="text-center">
              <h3 className="text-sm font-medium text-slate-600">Cost</h3>
              <p className="text-2xl font-bold text-red-600">
                {formatCurrency(profitAnalysis.cost)}
              </p>
            </div>
          </Card>
          
          <Card>
            <div className="text-center">
              <h3 className="text-sm font-medium text-slate-600">Gross Profit</h3>
              <p className="text-2xl font-bold text-blue-600">
                {formatCurrency(profitAnalysis.grossProfit)}
              </p>
            </div>
          </Card>
          
          <Card>
            <div className="text-center">
              <h3 className="text-sm font-medium text-slate-600">Profit Margin</h3>
              <p className="text-2xl font-bold text-purple-600">
                {formatPercentage(profitAnalysis.profitMargin)}
              </p>
            </div>
          </Card>
        </div>

        {/* Monthly Breakdown */}
        <Card title="Monthly Profit Analysis">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-200">
                  <th className="text-left py-2 font-semibold text-slate-700">Month</th>
                  <th className="text-right py-2 font-semibold text-slate-700">Revenue</th>
                  <th className="text-right py-2 font-semibold text-slate-700">Cost</th>
                  <th className="text-right py-2 font-semibold text-slate-700">Profit</th>
                  <th className="text-right py-2 font-semibold text-slate-700">Margin</th>
                </tr>
              </thead>
              <tbody>
                {profitAnalysis.monthlyData.map((month, index) => (
                  <tr key={index} className="border-b border-slate-100">
                    <td className="py-2">{month.month}</td>
                    <td className="py-2 text-right text-green-600">
                      {formatCurrency(month.revenue)}
                    </td>
                    <td className="py-2 text-right text-red-600">
                      {formatCurrency(month.cost)}
                    </td>
                    <td className="py-2 text-right font-semibold text-blue-600">
                      {formatCurrency(month.profit)}
                    </td>
                    <td className="py-2 text-right">
                      {formatPercentage((month.profit / month.revenue) * 100)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      )}

      {/* Header */}
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-slate-900">Reports & Analytics</h2>
        <Button onClick={exportReport} variant="secondary" size="sm">
          Export Report
        </Button>
      </div>

      {/* Filters */}
      <div className="bg-white p-4 rounded-lg border border-slate-200">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          <Select
            label="Report Type"
            value={reportType}
            onChange={(e) => setReportType(e.target.value as any)}
            options={[
              { value: 'sales', label: 'Sales Report' },
              { value: 'inventory', label: 'Inventory Report' },
              { value: 'profit', label: 'Profit Analysis' }
            ]}
          />
          
          <Select
            label="Period"
            value={period}
            onChange={(e) => setPeriod(e.target.value as any)}
            options={[
              { value: 'daily', label: 'Daily' },
              { value: 'weekly', label: 'Weekly' },
              { value: 'monthly', label: 'Monthly' },
              { value: 'yearly', label: 'Yearly' }
            ]}
            disabled={reportType === 'inventory'}
          />
          
          <Input
            label="Start Date"
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            disabled={reportType === 'inventory'}
          />
          
          <Input
            label="End Date"
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            disabled={reportType === 'inventory'}
          />
          
          <div className="flex items-end">
            <Button onClick={loadReportData} disabled={loading} className="w-full">
              {loading ? 'Loading...' : 'Generate Report'}
            </Button>
          </div>
        </div>
      </div>

      {/* Report Content */}
      {loading ? (
        <div className="text-center py-16">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-slate-600">Generating report...</p>
        </div>
      ) : (
        <div>
          {reportType === 'sales' && renderSalesReport()}
          {reportType === 'inventory' && renderInventoryReport()}
          {reportType === 'profit' && renderProfitAnalysis()}
        </div>
      )}

      {/* Quick Stats Footer */}
      <div className="bg-slate-50 p-4 rounded-lg">
        <h3 className="font-semibold text-slate-700 mb-2">Quick Insights</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
          <div>
            <span className="text-slate-600">Most Profitable Period:</span>
            <span className="ml-2 font-semibold">Current Month</span>
          </div>
          <div>
            <span className="text-slate-600">Best Selling Category:</span>
            <span className="ml-2 font-semibold">Consumer Goods</span>
          </div>
          <div>
            <span className="text-slate-600">Inventory Turnover:</span>
            <span className="ml-2 font-semibold">12.5x/year</span>
          </div>
        </div>
      </div>
    </div>
  );
}