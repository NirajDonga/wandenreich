import { useState } from 'react';
import { SaleItem } from '@/lib/types/sales';

// Custom hook for managing sale items
export const useSaleItems = () => {
  const [saleItems, setSaleItems] = useState<SaleItem[]>([]);

  const addItem = (newItem: SaleItem) => {
    // Check if product already exists
    const existingItemIndex = saleItems.findIndex(
      item => item.productId === newItem.productId
    );

    if (existingItemIndex >= 0) {
      // Update existing item - add quantities
      const updatedItems = [...saleItems];
      const existingItem = updatedItems[existingItemIndex];
      
      const newQuantity = existingItem.quantity + newItem.quantity;
      const baseAmount = newQuantity * newItem.sellingPrice;
      const taxAmount = existingItem.taxType === 'none' 
        ? 0 
        : (baseAmount * existingItem.taxRate) / 100;
      const totalPrice = baseAmount + taxAmount;

      updatedItems[existingItemIndex] = {
        ...existingItem,
        quantity: newQuantity,
        sellingPrice: newItem.sellingPrice,
        taxAmount,
        totalPrice
      };
      
      setSaleItems(updatedItems);
    } else {
      // Add new item
      setSaleItems([...saleItems, newItem]);
    }
  };

  const removeItem = (productId: string) => {
    setSaleItems(saleItems.filter(item => item.productId !== productId));
  };

  const updateItemTaxType = (productId: string, taxType: 'none' | 'gst' | 'igst') => {
    const updatedItems = saleItems.map(item => {
      if (item.productId === productId) {
        const newTaxRate = taxType === 'none' ? 0 : item.taxRate || 18;
        const baseAmount = item.quantity * item.sellingPrice;
        const taxAmount = taxType === 'none' ? 0 : (baseAmount * newTaxRate) / 100;
        const totalPrice = baseAmount + taxAmount;
        
        return {
          ...item,
          taxType,
          taxRate: newTaxRate,
          taxAmount,
          totalPrice
        };
      }
      return item;
    });
    setSaleItems(updatedItems);
  };

  const updateItemTaxRate = (productId: string, taxRate: number) => {
    const updatedItems = saleItems.map(item => {
      if (item.productId === productId) {
        const baseAmount = item.quantity * item.sellingPrice;
        const taxAmount = item.taxType === 'none' ? 0 : (baseAmount * taxRate) / 100;
        const totalPrice = baseAmount + taxAmount;
        
        return {
          ...item,
          taxRate,
          taxAmount,
          totalPrice
        };
      }
      return item;
    });
    setSaleItems(updatedItems);
  };

  const clearItems = () => {
    setSaleItems([]);
  };

  return {
    saleItems,
    addItem,
    removeItem,
    updateItemTaxType,
    updateItemTaxRate,
    clearItems
  };
};
