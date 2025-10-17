import { useState } from 'react';
import { PurchaseItem } from '@/lib/types/purchases';
import { updatePurchaseItem } from '@/lib/utils/purchases';

export const usePurchaseItems = () => {
  const [purchaseItems, setPurchaseItems] = useState<PurchaseItem[]>([]);

  const addItem = (newItem: PurchaseItem) => {
    // Check if product already exists
    const existingItemIndex = purchaseItems.findIndex(
      item => item.productId === newItem.productId
    );

    if (existingItemIndex >= 0) {
      // Update existing item - add quantities
      const updatedItems = [...purchaseItems];
      const existingItem = updatedItems[existingItemIndex];
      
      const newQuantity = existingItem.quantity + newItem.quantity;
      updatedItems[existingItemIndex] = updatePurchaseItem(existingItem, {
        quantity: newQuantity,
        unitCost: newItem.unitCost
      });
      
      setPurchaseItems(updatedItems);
    } else {
      // Add new item
      setPurchaseItems([...purchaseItems, newItem]);
    }
  };

  const removeItem = (productId: string) => {
    setPurchaseItems(purchaseItems.filter(item => item.productId !== productId));
  };

  const updateItemTaxType = (productId: string, taxType: 'none' | 'gst' | 'igst') => {
    const updatedItems = purchaseItems.map(item => {
      if (item.productId === productId) {
        const newTaxRate = taxType === 'none' ? 0 : item.taxRate || 18;
        return updatePurchaseItem(item, { taxType, taxRate: newTaxRate });
      }
      return item;
    });
    setPurchaseItems(updatedItems);
  };

  const updateItemTaxRate = (productId: string, taxRate: number) => {
    const updatedItems = purchaseItems.map(item => {
      if (item.productId === productId) {
        return updatePurchaseItem(item, { taxRate });
      }
      return item;
    });
    setPurchaseItems(updatedItems);
  };

  const clearItems = () => {
    setPurchaseItems([]);
  };

  return {
    purchaseItems,
    addItem,
    removeItem,
    updateItemTaxType,
    updateItemTaxRate,
    clearItems
  };
};
