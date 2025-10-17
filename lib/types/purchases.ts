// Purchase-related type definitions

export interface Product {
  _id: string;
  name: string;
  companyName?: string;
  unitOfMeasure: string;
}

export interface Supplier {
  _id: string;
  name: string;
  phone?: string;
  contactName?: string;
}

export interface PurchaseItem {
  productId: string;
  productName: string;
  unitOfMeasure: string;
  quantity: number;
  unitCost: number;
  taxType: 'none' | 'gst' | 'igst';
  taxRate: number;
  taxAmount: number;
  totalCost: number;
}

export interface TaxBreakdown {
  baseAmount: number;
  cgstAmount: number;
  sgstAmount: number;
  igstAmount: number;
}

export type PaymentMethod = 'cash' | 'card' | 'upi' | 'credit';
