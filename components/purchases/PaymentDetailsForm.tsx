'use client';

import { PaymentMethod } from '@/lib/types/purchases';

interface PaymentDetailsFormProps {
  paymentMethod: PaymentMethod;
  amountPaid: string;
  notes: string;
  totalAmount: number;
  onPaymentMethodChange: (method: PaymentMethod) => void;
  onAmountPaidChange: (amount: string) => void;
  onNotesChange: (notes: string) => void;
}

export default function PaymentDetailsForm({
  paymentMethod,
  amountPaid,
  notes,
  totalAmount,
  onPaymentMethodChange,
  onAmountPaidChange,
  onNotesChange
}: PaymentDetailsFormProps) {
  const paidAmount = parseFloat(amountPaid) || 0;
  const balanceAmount = totalAmount - paidAmount;

  const handleAmountChange = (value: string) => {
    if (value === '' || /^\d*\.?\d{0,2}$/.test(value)) {
      onAmountPaidChange(value);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow border border-slate-200 p-4">
      <h3 className="text-sm font-semibold text-slate-700 mb-3 border-b border-slate-200 pb-2">Payment Details</h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-medium text-slate-600 mb-1">
            Payment Method
          </label>
          <select
            value={paymentMethod}
            onChange={(e) => onPaymentMethodChange(e.target.value as PaymentMethod)}
            className="w-full px-2 py-1.5 text-sm border border-slate-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="cash">Cash</option>
            <option value="card">Card</option>
            <option value="upi">UPI</option>
            <option value="credit">Credit (On Account)</option>
          </select>
        </div>

        <div>
          <label className="block text-xs font-medium text-slate-600 mb-1">
            Amount Paid
          </label>
          <input
            type="text"
            value={amountPaid}
            onChange={(e) => handleAmountChange(e.target.value)}
            placeholder="0.00"
            className="w-full px-2 py-1.5 text-sm border border-slate-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
          />
          {balanceAmount !== 0 && (
            <p className={`text-xs mt-1 font-medium ${balanceAmount > 0 ? 'text-red-600' : 'text-green-600'}`}>
              {balanceAmount > 0 ? `Balance Due: ₹${balanceAmount.toFixed(2)}` : `Overpaid: ₹${Math.abs(balanceAmount).toFixed(2)}`}
            </p>
          )}
        </div>

        <div className="md:col-span-2">
          <label className="block text-xs font-medium text-slate-600 mb-1">
            Notes (Optional)
          </label>
          <textarea
            value={notes}
            onChange={(e) => onNotesChange(e.target.value)}
            rows={2}
            placeholder="Add any notes..."
            className="w-full px-2 py-1.5 text-sm border border-slate-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
      </div>
    </div>
  );
}
