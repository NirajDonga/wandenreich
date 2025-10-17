'use client';

import { PurchaseItem } from '@/lib/types/purchases';
import { calculateTaxBreakdown } from '@/lib/utils/purchases';

interface PurchaseItemsTableProps {
  items: PurchaseItem[];
  onUpdateTaxType: (productId: string, taxType: 'none' | 'gst' | 'igst') => void;
  onUpdateTaxRate: (productId: string, taxRate: number) => void;
  onRemoveItem: (productId: string) => void;
}

export default function PurchaseItemsTable({
  items,
  onUpdateTaxType,
  onUpdateTaxRate,
  onRemoveItem
}: PurchaseItemsTableProps) {
  const { baseAmount, cgstAmount, sgstAmount, igstAmount } = calculateTaxBreakdown(items);
  const totalAmount = items.reduce((sum, item) => sum + item.totalCost, 0);

  return (
    <div className="mt-6 overflow-x-auto border border-slate-200 rounded">
      <table className="w-full text-sm">
        <thead className="bg-slate-50 border-b-2 border-slate-300">
          <tr>
            <th className="px-3 py-2 text-left text-xs font-semibold text-slate-700">Product</th>
            <th className="px-3 py-2 text-center text-xs font-semibold text-slate-700">Qty</th>
            <th className="px-3 py-2 text-right text-xs font-semibold text-slate-700">Rate</th>
            <th className="px-3 py-2 text-right text-xs font-semibold text-slate-700">Amount</th>
            <th className="px-3 py-2 text-center text-xs font-semibold text-slate-700">Tax Type</th>
            <th className="px-3 py-2 text-right text-xs font-semibold text-slate-700">CGST</th>
            <th className="px-3 py-2 text-right text-xs font-semibold text-slate-700">SGST</th>
            <th className="px-3 py-2 text-right text-xs font-semibold text-slate-700">IGST</th>
            <th className="px-3 py-2 text-right text-xs font-semibold text-slate-700">Total</th>
            <th className="px-3 py-2 text-center text-xs font-semibold text-slate-700">Action</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-200">
          {items.map((item) => {
            const baseAmount = item.quantity * item.unitCost;
            const cgstAmt = item.taxType === 'gst' ? item.taxAmount / 2 : 0;
            const sgstAmt = item.taxType === 'gst' ? item.taxAmount / 2 : 0;
            const igstAmt = item.taxType === 'igst' ? item.taxAmount : 0;
            
            return (
              <tr key={item.productId} className="hover:bg-slate-50">
                <td className="px-3 py-2 text-xs text-slate-800 uppercase font-medium">{item.productName}</td>
                <td className="px-3 py-2 text-center text-xs text-slate-700">
                  <div className="font-medium">{item.quantity}</div>
                  <div className="text-xs text-slate-500 uppercase">{item.unitOfMeasure}</div>
                </td>
                <td className="px-3 py-2 text-right text-xs text-slate-700">
                  ₹{item.unitCost.toFixed(2)}
                </td>
                <td className="px-3 py-2 text-right text-xs font-medium text-slate-700">
                  ₹{baseAmount.toFixed(2)}
                </td>
                <td className="px-3 py-2 text-center">
                  <div className="flex gap-1 items-center justify-center">
                    <select
                      value={item.taxType}
                      onChange={(e) => onUpdateTaxType(item.productId, e.target.value as 'none' | 'gst' | 'igst')}
                      className="w-24 px-1 py-1 text-xs border border-slate-300 rounded focus:ring-1 focus:ring-blue-500"
                    >
                      <option value="none">No Tax</option>
                      <option value="gst">CGST+SGST</option>
                      <option value="igst">IGST</option>
                    </select>
                    <select
                      value={item.taxRate}
                      onChange={(e) => onUpdateTaxRate(item.productId, parseFloat(e.target.value))}
                      disabled={item.taxType === 'none'}
                      className="w-14 px-1 py-1 text-xs border border-slate-300 rounded focus:ring-1 focus:ring-blue-500 disabled:bg-slate-100"
                    >
                      <option value="0">0%</option>
                      <option value="5">5%</option>
                      <option value="12">12%</option>
                      <option value="18">18%</option>
                      <option value="28">28%</option>
                    </select>
                  </div>
                </td>
                <td className="px-3 py-2 text-right text-xs text-slate-700">
                  {cgstAmt > 0 ? (
                    <div>
                      <div className="text-xs text-slate-500">{(item.taxRate / 2)}%</div>
                      <div className="font-medium">₹{cgstAmt.toFixed(2)}</div>
                    </div>
                  ) : (
                    <span className="text-slate-400">-</span>
                  )}
                </td>
                <td className="px-3 py-2 text-right text-xs text-slate-700">
                  {sgstAmt > 0 ? (
                    <div>
                      <div className="text-xs text-slate-500">{(item.taxRate / 2)}%</div>
                      <div className="font-medium">₹{sgstAmt.toFixed(2)}</div>
                    </div>
                  ) : (
                    <span className="text-slate-400">-</span>
                  )}
                </td>
                <td className="px-3 py-2 text-right text-xs text-slate-700">
                  {igstAmt > 0 ? (
                    <div>
                      <div className="text-xs text-slate-500">{item.taxRate}%</div>
                      <div className="font-medium">₹{igstAmt.toFixed(2)}</div>
                    </div>
                  ) : (
                    <span className="text-slate-400">-</span>
                  )}
                </td>
                <td className="px-3 py-2 text-right text-xs font-bold text-slate-800">
                  ₹{item.totalCost.toFixed(2)}
                </td>
                <td className="px-3 py-2 text-center">
                  <button
                    type="button"
                    onClick={() => onRemoveItem(item.productId)}
                    className="text-red-600 hover:text-red-800 text-xs font-medium px-2 py-1"
                  >
                    Remove
                  </button>
                </td>
              </tr>
            );
          })}
        </tbody>
        <tfoot className="bg-slate-50 border-t-2 border-slate-300">
          <tr className="font-semibold">
            <td colSpan={3} className="px-3 py-2 text-right text-xs text-slate-700">
              Subtotal:
            </td>
            <td className="px-3 py-2 text-right text-xs text-slate-800">
              ₹{baseAmount.toFixed(2)}
            </td>
            <td className="px-3 py-2"></td>
            <td className="px-3 py-2 text-right text-xs text-slate-700">
              ₹{cgstAmount.toFixed(2)}
            </td>
            <td className="px-3 py-2 text-right text-xs text-slate-700">
              ₹{sgstAmount.toFixed(2)}
            </td>
            <td className="px-3 py-2 text-right text-xs text-slate-700">
              ₹{igstAmount.toFixed(2)}
            </td>
            <td className="px-3 py-2 text-right text-sm font-bold text-blue-600">
              ₹{totalAmount.toFixed(2)}
            </td>
            <td></td>
          </tr>
        </tfoot>
      </table>
    </div>
  );
}
