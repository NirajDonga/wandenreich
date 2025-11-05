import { SaleItem, TaxBreakdown } from '@/lib/types/sales';

/**
 * Calculate total amount from sale items
 */
export const calculateTotal = (items: SaleItem[]): number => {
  return items.reduce((sum, item) => sum + item.totalPrice, 0);
};

/**
 * Calculate tax breakdown (CGST, SGST, IGST)
 */
export const calculateTaxBreakdown = (items: SaleItem[]): TaxBreakdown => {
  let baseAmount = 0;
  let cgstAmount = 0;
  let sgstAmount = 0;
  let igstAmount = 0;

  items.forEach(item => {
    const itemBaseAmount = item.quantity * item.sellingPrice;
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
  sellingPrice: number,
  taxType: 'none' | 'gst' | 'igst',
  taxRate: number
): number => {
  if (taxType === 'none') return 0;
  const baseAmount = quantity * sellingPrice;
  return (baseAmount * taxRate) / 100;
};

/**
 * Calculate total price including tax for an item
 */
export const calculateItemTotal = (
  quantity: number,
  sellingPrice: number,
  taxType: 'none' | 'gst' | 'igst',
  taxRate: number
): number => {
  const baseAmount = quantity * sellingPrice;
  const taxAmount = calculateItemTax(quantity, sellingPrice, taxType, taxRate);
  return baseAmount + taxAmount;
};

/**
 * Update sale item with new values
 */
export const updateSaleItem = (
  item: SaleItem,
  updates: Partial<SaleItem>
): SaleItem => {
  const updatedItem = { ...item, ...updates };
  
  // Recalculate tax and total if relevant fields changed
  if (
    updates.quantity !== undefined ||
    updates.sellingPrice !== undefined ||
    updates.taxType !== undefined ||
    updates.taxRate !== undefined
  ) {
    const baseAmount = updatedItem.quantity * updatedItem.sellingPrice;
    updatedItem.taxAmount = updatedItem.taxType === 'none' 
      ? 0 
      : (baseAmount * updatedItem.taxRate) / 100;
    updatedItem.totalPrice = baseAmount + updatedItem.taxAmount;
  }
  
  return updatedItem;
};
