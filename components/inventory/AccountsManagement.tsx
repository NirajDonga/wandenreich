'use client';

import React, { useState, useEffect } from 'react';
import { Button, Input, Select, Modal, Card } from '../ui';

// Types
interface Customer {
  _id: string;
  name: string;
  email: string;
  phone: string;
  address: string;
}

interface Supplier {
  _id: string;
  name: string;
  email: string;
  phone: string;
  address: string;
}

interface LedgerEntry {
  _id: string;
  transactionDate: string;
  transactionType: string;
  referenceNumber: string;
  debit: number;
  credit: number;
  balance: number;
  notes?: string;
}

interface AccountSummary {
  totalDebit: number;
  totalCredit: number;
  currentBalance: number;
}

interface AccountsManagementProps {
  onClose?: () => void;
}

export default function AccountsManagement({ onClose }: AccountsManagementProps) {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [selectedAccount, setSelectedAccount] = useState<any>(null);
  const [accountType, setAccountType] = useState<'customer' | 'supplier'>('customer');
  const [ledgerEntries, setLedgerEntries] = useState<LedgerEntry[]>([]);
  const [accountSummary, setAccountSummary] = useState<AccountSummary>({
    totalDebit: 0,
    totalCredit: 0,
    currentBalance: 0
  });
  
  // Modal states
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [showStatementModal, setShowStatementModal] = useState(false);
  
  // Form states
  const [paymentForm, setPaymentForm] = useState({
    amount: 0,
    paymentMethod: 'cash',
    referenceNumber: '',
    notes: ''
  });
  
  // Filter states
  const [searchTerm, setSearchTerm] = useState('');
  const [balanceFilter, setBalanceFilter] = useState<'all' | 'outstanding' | 'credit'>('all');
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Load data on component mount
  useEffect(() => {
    loadCustomers();
    loadSuppliers();
  }, []);

  const loadCustomers = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/customers');
      if (!response.ok) throw new Error('Failed to load customers');
      const data = await response.json();
      setCustomers(Array.isArray(data) ? data : data.customers || []);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const loadSuppliers = async () => {
    try {
      const response = await fetch('/api/suppliers');
      if (!response.ok) throw new Error('Failed to load suppliers');
      const data = await response.json();
      setSuppliers(Array.isArray(data) ? data : data.suppliers || []);
    } catch (err: any) {
      setError(err.message);
    }
  };

  const loadAccountStatement = async (accountId: string, type: 'customer' | 'supplier') => {
    try {
      setLoading(true);
      const endpoint = type === 'customer' 
        ? `/api/financial/customer-statement/${accountId}`
        : `/api/financial/supplier-statement/${accountId}`;
        
      const response = await fetch(endpoint);
      if (!response.ok) throw new Error('Failed to load account statement');
      
      const data = await response.json();
      setLedgerEntries(data.ledgerEntries || []);
      setAccountSummary(data.summary || { totalDebit: 0, totalCredit: 0, currentBalance: 0 });
      setShowStatementModal(true);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const recordPayment = async () => {
    if (!selectedAccount || paymentForm.amount <= 0) {
      setError('Please enter a valid payment amount');
      return;
    }

    try {
      setLoading(true);
      const endpoint = accountType === 'customer' 
        ? '/api/financial/customer-payment'
        : '/api/financial/supplier-payment';
        
      const payload = {
        [`${accountType}Id`]: selectedAccount._id,
        amount: paymentForm.amount,
        paymentMethod: paymentForm.paymentMethod,
        referenceNumber: paymentForm.referenceNumber || `PAY-${Date.now()}`,
        notes: paymentForm.notes
      };

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      
      if (!response.ok) throw new Error('Failed to record payment');
      
      setShowPaymentModal(false);
      setPaymentForm({ amount: 0, paymentMethod: 'cash', referenceNumber: '', notes: '' });
      setSelectedAccount(null);
      setError('');
      
      // Reload data
      loadCustomers();
      loadSuppliers();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const openPaymentModal = (account: any, type: 'customer' | 'supplier') => {
    setSelectedAccount(account);
    setAccountType(type);
    setShowPaymentModal(true);
  };

  const openStatementModal = (account: any, type: 'customer' | 'supplier') => {
    setSelectedAccount(account);
    setAccountType(type);
    loadAccountStatement(account._id, type);
  };

  const getFilteredAccounts = (accounts: any[], type: 'customer' | 'supplier') => {
    let filtered = accounts;

    if (searchTerm) {
      filtered = filtered.filter(account => 
        account.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        account.phone?.includes(searchTerm) ||
        account.email?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Note: In a real implementation, you'd have balance data from the API
    // For now, we'll show all accounts
    return filtered;
  };

  const formatCurrency = (amount: number) => {
    return `₹${Math.abs(amount).toFixed(2)}`;
  };

  const getBalanceColor = (balance: number) => {
    if (balance > 0) return 'text-red-600'; // They owe us
    if (balance < 0) return 'text-green-600'; // We owe them
    return 'text-slate-600'; // Even
  };

  const getBalanceLabel = (balance: number, type: 'customer' | 'supplier') => {
    if (balance === 0) return 'Settled';
    if (type === 'customer') {
      return balance > 0 ? 'Receivable' : 'Credit';
    } else {
      return balance > 0 ? 'Payable' : 'Advance';
    }
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
        <h2 className="text-2xl font-bold text-slate-900">Accounts Management</h2>
        <Button onClick={() => window.location.reload()} variant="secondary" size="sm">
          Refresh Data
        </Button>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <Input
          placeholder="Search by name, phone, or email..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="flex-1"
        />
        <Select
          value={balanceFilter}
          onChange={(e) => setBalanceFilter(e.target.value as any)}
          options={[
            { value: 'all', label: 'All Accounts' },
            { value: 'outstanding', label: 'Outstanding Only' },
            { value: 'credit', label: 'Credit Balances' }
          ]}
        />
      </div>

      {/* Account Tables */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Customer Accounts */}
        <Card title="Customer Accounts">
          {loading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
            </div>
          ) : getFilteredAccounts(customers, 'customer').length === 0 ? (
            <div className="text-center py-8 text-slate-500">
              No customers found
            </div>
          ) : (
            <div className="space-y-3">
              {getFilteredAccounts(customers, 'customer').map((customer) => (
                <div key={customer._id} className="p-4 border border-slate-200 rounded-lg hover:bg-slate-50">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <h4 className="font-semibold text-slate-900">{customer.name}</h4>
                      <p className="text-sm text-slate-600">{customer.phone}</p>
                      <p className="text-sm text-slate-600">{customer.email}</p>
                      {/* Note: In real implementation, you'd show actual balance */}
                      <p className="text-sm font-medium mt-1">
                        <span className="text-slate-500">Balance: </span>
                        <span className="text-green-600">Settled</span>
                      </p>
                    </div>
                    <div className="flex flex-col gap-1">
                      <Button
                        size="sm"
                        onClick={() => openPaymentModal(customer, 'customer')}
                        className="text-xs"
                      >
                        Record Payment
                      </Button>
                      <Button
                        size="sm"
                        variant="secondary"
                        onClick={() => openStatementModal(customer, 'customer')}
                        className="text-xs"
                      >
                        View Statement
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>

        {/* Supplier Accounts */}
        <Card title="Supplier Accounts">
          {loading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
            </div>
          ) : getFilteredAccounts(suppliers, 'supplier').length === 0 ? (
            <div className="text-center py-8 text-slate-500">
              No suppliers found
            </div>
          ) : (
            <div className="space-y-3">
              {getFilteredAccounts(suppliers, 'supplier').map((supplier) => (
                <div key={supplier._id} className="p-4 border border-slate-200 rounded-lg hover:bg-slate-50">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <h4 className="font-semibold text-slate-900">{supplier.name}</h4>
                      <p className="text-sm text-slate-600">{supplier.phone}</p>
                      <p className="text-sm text-slate-600">{supplier.email}</p>
                      {/* Note: In real implementation, you'd show actual balance */}
                      <p className="text-sm font-medium mt-1">
                        <span className="text-slate-500">Balance: </span>
                        <span className="text-green-600">Settled</span>
                      </p>
                    </div>
                    <div className="flex flex-col gap-1">
                      <Button
                        size="sm"
                        onClick={() => openPaymentModal(supplier, 'supplier')}
                        className="text-xs"
                      >
                        Record Payment
                      </Button>
                      <Button
                        size="sm"
                        variant="secondary"
                        onClick={() => openStatementModal(supplier, 'supplier')}
                        className="text-xs"
                      >
                        View Statement
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-lg border border-slate-200">
          <h3 className="text-sm font-medium text-slate-600">Total Receivables</h3>
          <p className="text-2xl font-bold text-red-600">₹0.00</p>
          <p className="text-xs text-slate-500">Amount customers owe</p>
        </div>
        
        <div className="bg-white p-4 rounded-lg border border-slate-200">
          <h3 className="text-sm font-medium text-slate-600">Total Payables</h3>
          <p className="text-2xl font-bold text-amber-600">₹0.00</p>
          <p className="text-xs text-slate-500">Amount owed to suppliers</p>
        </div>
        
        <div className="bg-white p-4 rounded-lg border border-slate-200">
          <h3 className="text-sm font-medium text-slate-600">Customer Credits</h3>
          <p className="text-2xl font-bold text-green-600">₹0.00</p>
          <p className="text-xs text-slate-500">Advance payments</p>
        </div>
        
        <div className="bg-white p-4 rounded-lg border border-slate-200">
          <h3 className="text-sm font-medium text-slate-600">Supplier Advances</h3>
          <p className="text-2xl font-bold text-blue-600">₹0.00</p>
          <p className="text-xs text-slate-500">Payments in advance</p>
        </div>
      </div>

      {/* Record Payment Modal */}
      <Modal
        isOpen={showPaymentModal}
        onClose={() => setShowPaymentModal(false)}
        title={`Record Payment - ${accountType === 'customer' ? 'Customer' : 'Supplier'}`}
        maxWidth="max-w-md"
      >
        {selectedAccount && (
          <div className="space-y-4">
            <div className="bg-slate-50 p-3 rounded">
              <h4 className="font-semibold">{selectedAccount.name}</h4>
              <p className="text-sm text-slate-600">{selectedAccount.phone}</p>
            </div>
            
            <Input
              label="Payment Amount (₹)"
              type="number"
              step="0.01"
              value={paymentForm.amount}
              onChange={(e) => setPaymentForm({ 
                ...paymentForm, 
                amount: parseFloat(e.target.value) || 0 
              })}
              placeholder="0.00"
            />
            
            <Select
              label="Payment Method"
              value={paymentForm.paymentMethod}
              onChange={(e) => setPaymentForm({ ...paymentForm, paymentMethod: e.target.value })}
              options={[
                { value: 'cash', label: 'Cash' },
                { value: 'card', label: 'Card' },
                { value: 'bank-transfer', label: 'Bank Transfer' },
                { value: 'cheque', label: 'Cheque' },
                { value: 'upi', label: 'UPI' }
              ]}
            />
            
            <Input
              label="Reference Number (Optional)"
              value={paymentForm.referenceNumber}
              onChange={(e) => setPaymentForm({ ...paymentForm, referenceNumber: e.target.value })}
              placeholder="Transaction ID, Cheque No, etc."
            />
            
            <Input
              label="Notes (Optional)"
              value={paymentForm.notes}
              onChange={(e) => setPaymentForm({ ...paymentForm, notes: e.target.value })}
              placeholder="Additional notes..."
            />
          </div>
        )}

        <div className="flex space-x-4 pt-6">
          <Button 
            variant="secondary" 
            onClick={() => setShowPaymentModal(false)} 
            className="flex-1"
            disabled={loading}
          >
            Cancel
          </Button>
          <Button onClick={recordPayment} className="flex-1" disabled={loading}>
            {loading ? 'Recording...' : 'Record Payment'}
          </Button>
        </div>
      </Modal>

      {/* Account Statement Modal */}
      <Modal
        isOpen={showStatementModal}
        onClose={() => setShowStatementModal(false)}
        title={`Account Statement - ${selectedAccount?.name}`}
        maxWidth="max-w-4xl"
      >
        {selectedAccount && (
          <div className="space-y-4">
            {/* Account Summary */}
            <div className="bg-slate-50 p-4 rounded-lg">
              <div className="grid grid-cols-3 gap-4 text-center">
                <div>
                  <p className="text-sm text-slate-600">Total Debits</p>
                  <p className="text-lg font-semibold text-red-600">
                    {formatCurrency(accountSummary.totalDebit)}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-slate-600">Total Credits</p>
                  <p className="text-lg font-semibold text-green-600">
                    {formatCurrency(accountSummary.totalCredit)}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-slate-600">Current Balance</p>
                  <p className={`text-lg font-semibold ${getBalanceColor(accountSummary.currentBalance)}`}>
                    {formatCurrency(accountSummary.currentBalance)}
                    <span className="text-sm ml-1">
                      ({getBalanceLabel(accountSummary.currentBalance, accountType)})
                    </span>
                  </p>
                </div>
              </div>
            </div>

            {/* Ledger Entries */}
            <div>
              <h4 className="font-semibold text-slate-700 mb-3">Transaction History</h4>
              {ledgerEntries.length === 0 ? (
                <div className="text-center py-8 text-slate-500">
                  No transactions found
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-slate-200">
                        <th className="text-left py-2 px-2 font-semibold text-slate-700">Date</th>
                        <th className="text-left py-2 px-2 font-semibold text-slate-700">Type</th>
                        <th className="text-left py-2 px-2 font-semibold text-slate-700">Reference</th>
                        <th className="text-right py-2 px-2 font-semibold text-slate-700">Debit</th>
                        <th className="text-right py-2 px-2 font-semibold text-slate-700">Credit</th>
                        <th className="text-right py-2 px-2 font-semibold text-slate-700">Balance</th>
                      </tr>
                    </thead>
                    <tbody>
                      {ledgerEntries.map((entry) => (
                        <tr key={entry._id} className="border-b border-slate-100">
                          <td className="py-2 px-2">
                            {new Date(entry.transactionDate).toLocaleDateString()}
                          </td>
                          <td className="py-2 px-2 capitalize">
                            {entry.transactionType.replace('-', ' ')}
                          </td>
                          <td className="py-2 px-2">{entry.referenceNumber}</td>
                          <td className="py-2 px-2 text-right text-red-600">
                            {entry.debit > 0 ? formatCurrency(entry.debit) : '-'}
                          </td>
                          <td className="py-2 px-2 text-right text-green-600">
                            {entry.credit > 0 ? formatCurrency(entry.credit) : '-'}
                          </td>
                          <td className={`py-2 px-2 text-right font-semibold ${getBalanceColor(entry.balance)}`}>
                            {formatCurrency(entry.balance)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}