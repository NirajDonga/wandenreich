/**
 * Validation utilities for form inputs
 */

// Email validation
export const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

// Phone validation (Indian format: 10 digits)
export const isValidPhone = (phone: string): boolean => {
  const phoneRegex = /^[6-9]\d{9}$/;
  return phoneRegex.test(phone.replace(/[\s-]/g, ''));
};

// GSTIN validation (Indian GST format)
export const isValidGSTIN = (gstin: string): boolean => {
  const gstinRegex = /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/;
  return gstinRegex.test(gstin.toUpperCase());
};

// Price/Amount validation (positive number with up to 2 decimal places)
export const isValidPrice = (price: string | number): boolean => {
  const num = typeof price === 'string' ? parseFloat(price) : price;
  return !isNaN(num) && num > 0 && Number.isFinite(num);
};

// Quantity validation (positive integer)
export const isValidQuantity = (quantity: string | number): boolean => {
  const num = typeof quantity === 'string' ? parseInt(quantity, 10) : quantity;
  return Number.isInteger(num) && num > 0;
};

// Percentage validation (0-100)
export const isValidPercentage = (percentage: string | number): boolean => {
  const num = typeof percentage === 'string' ? parseFloat(percentage) : percentage;
  return !isNaN(num) && num >= 0 && num <= 100;
};

// Name validation (no special characters except spaces, hyphens, apostrophes)
export const isValidName = (name: string): boolean => {
  const nameRegex = /^[a-zA-Z\s'-]+$/;
  return name.trim().length >= 2 && nameRegex.test(name);
};

// Invoice number validation (alphanumeric with hyphens and slashes)
export const isValidInvoiceNumber = (invoiceNum: string): boolean => {
  const invoiceRegex = /^[A-Z0-9/-]+$/i;
  return invoiceNum.trim().length >= 1 && invoiceRegex.test(invoiceNum);
};

// Format GSTIN with hyphens for display
export const formatGSTIN = (gstin: string): string => {
  if (!gstin) return '';
  const clean = gstin.toUpperCase().replace(/[^A-Z0-9]/g, '');
  if (clean.length !== 15) return gstin;
  return `${clean.slice(0, 2)}-${clean.slice(2, 7)}-${clean.slice(7, 11)}-${clean.slice(11, 12)}-${clean.slice(12, 13)}-${clean.slice(13, 14)}-${clean.slice(14, 15)}`;
};

// Format phone number for display
export const formatPhoneNumber = (phone: string): string => {
  if (!phone) return '';
  const clean = phone.replace(/\D/g, '');
  if (clean.length === 10) {
    return `${clean.slice(0, 5)}-${clean.slice(5)}`;
  }
  return phone;
};

// Sanitize string input (remove extra spaces, trim)
export const sanitizeString = (str: string): string => {
  return str.trim().replace(/\s+/g, ' ');
};

// Validation error messages
export const ValidationErrors = {
  email: 'Please enter a valid email address',
  phone: 'Please enter a valid 10-digit mobile number',
  gstin: 'Please enter a valid GSTIN (e.g., 29ABCDE1234F1Z5)',
  price: 'Please enter a valid positive amount',
  quantity: 'Please enter a valid positive quantity',
  percentage: 'Please enter a percentage between 0 and 100',
  name: 'Please enter a valid name (minimum 2 characters)',
  invoiceNumber: 'Please enter a valid invoice number',
  required: 'This field is required',
  minLength: (min: number) => `Minimum ${min} characters required`,
  maxLength: (max: number) => `Maximum ${max} characters allowed`,
};
