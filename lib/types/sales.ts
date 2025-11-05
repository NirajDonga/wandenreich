// Sales-related type definitions

export interface Product {
  _id: string;
  name: string;
  companyName?: string;
  unitOfMeasure: string;
  quantity: number;
  currentStock?: number;
  minStockLevel?: number;
  lastPurchasePrice?: number;
  averageCost?: number;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface Customer {
  _id: string;
  name: string;
  phone?: string;
  email?: string;
}

export interface SaleItem {
  productId: string;
  productName: string;
  unitOfMeasure: string;
  quantity: number;
  sellingPrice: number;
  taxType: 'none' | 'gst' | 'igst';
  taxRate: number;
  taxAmount: number;
  totalPrice: number;
}

export interface TaxBreakdown {
  baseAmount: number;
  cgstAmount: number;
  sgstAmount: number;
  igstAmount: number;
}

export type PaymentMethod = 'cash' | 'card' | 'upi' | 'credit';
