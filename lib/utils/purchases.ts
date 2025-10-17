import { PurchaseItem, TaxBreakdown } from '@/lib/types/purchases';

/**
 * Calculate total amount from purchase items
 */
export const calculateTotal = (items: PurchaseItem[]): number => {
  return items.reduce((sum, item) => sum + item.totalCost, 0);
};

/**
 * Calculate tax breakdown (CGST, SGST, IGST)
 */
export const calculateTaxBreakdown = (items: PurchaseItem[]): TaxBreakdown => {
  let baseAmount = 0;
  let cgstAmount = 0;
  let sgstAmount = 0;
  let igstAmount = 0;

  items.forEach(item => {
    const itemBaseAmount = item.quantity * item.unitCost;
    baseAmount += itemBaseAmount;

    if (item.taxType === 'gst') {
      // Split tax equally between CGST and SGST
      cgstAmount += item.taxAmount / 2;
      sgstAmount += item.taxAmount / 2;
    } else if (item.taxType === 'igst') {
      igstAmount += item.taxAmount;
    }
  });

  return { baseAmount, cgstAmount, sgstAmount, igstAmount };
};

/**
 * Calculate tax amount for an item
 */
export const calculateItemTax = (
  quantity: number,
  unitCost: number,
  taxType: 'none' | 'gst' | 'igst',
  taxRate: number
): number => {
  if (taxType === 'none') return 0;
  const baseAmount = quantity * unitCost;
  return (baseAmount * taxRate) / 100;
};

/**
 * Calculate total cost including tax for an item
 */
export const calculateItemTotal = (
  quantity: number,
  unitCost: number,
  taxType: 'none' | 'gst' | 'igst',
  taxRate: number
): number => {
  const baseAmount = quantity * unitCost;
  const taxAmount = calculateItemTax(quantity, unitCost, taxType, taxRate);
  return baseAmount + taxAmount;
};

/**
 * Update purchase item with new values
 */
export const updatePurchaseItem = (
  item: PurchaseItem,
  updates: Partial<PurchaseItem>
): PurchaseItem => {
  const updatedItem = { ...item, ...updates };
  
  // Recalculate tax and total if relevant fields changed
  if (
    updates.quantity !== undefined ||
    updates.unitCost !== undefined ||
    updates.taxType !== undefined ||
    updates.taxRate !== undefined
  ) {
    const baseAmount = updatedItem.quantity * updatedItem.unitCost;
    updatedItem.taxAmount = updatedItem.taxType === 'none' 
      ? 0 
      : (baseAmount * updatedItem.taxRate) / 100;
    updatedItem.totalCost = baseAmount + updatedItem.taxAmount;
  }
  
  return updatedItem;
};
