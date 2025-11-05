import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { PurchaseItem, Supplier, PaymentMethod } from '@/lib/types/purchases';
import { calculateTotal, calculateTaxBreakdown } from '@/lib/utils/purchases';

interface GeneratePDFOptions {
  items: PurchaseItem[];
  supplier: Supplier | undefined;
  invoiceNumber: string;
  paymentMethod: PaymentMethod;
  amountPaid: string;
  notes: string;
  companyName?: string; // Optional with default
  companyAddress?: string;
  companyPhone?: string;
  companyEmail?: string;
  companyGSTIN?: string;
}

export const generatePurchasePDF = ({
  items,
  supplier,
  invoiceNumber,
  paymentMethod,
  amountPaid,
  notes,
  companyName,
  companyAddress,
  companyPhone,
  companyEmail,
  companyGSTIN
}: GeneratePDFOptions) => {
  const doc = new jsPDF();
  const { baseAmount, cgstAmount, sgstAmount, igstAmount } = calculateTaxBreakdown(items);
  const totalAmount = calculateTotal(items);
  const paidAmount = parseFloat(amountPaid) || 0;
  const balance = totalAmount - paidAmount;
  
  const pageWidth = 210;
  const pageHeight = doc.internal.pageSize.height;
  const margin = 12;
  let yPos = 15;
  
  // Clean Professional Colors - Minimal
  const borderColor: [number, number, number] = [200, 200, 200];
  
  // ===== HEADER SECTION =====
  // Left side - Company Logo/Name
  doc.setFontSize(20);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(0, 120, 180);
  doc.text((companyName || 'YOUR COMPANY').toUpperCase(), margin + 15, yPos);
  
  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(100, 100, 100);
  doc.text('Purchase Order', margin + 15, yPos + 5);
  
  // Right side - "Original for Recipient" and Title
  doc.setFontSize(9);
  doc.setTextColor(100, 100, 100);
  doc.setFont('helvetica', 'normal');
  doc.text('Original for Recipient', pageWidth - margin, yPos, { align: 'right' });
  
  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(0, 0, 0);
  doc.text(`PURCHASE ORDER ${invoiceNumber}`, pageWidth - margin, yPos + 7, { align: 'right' });
  
  // Dates on right
  yPos += 12;
  doc.setFontSize(8);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(0, 0, 0);
  doc.text('Date', pageWidth - margin - 45, yPos);
  doc.setFont('helvetica', 'normal');
  doc.text(new Date().toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  }), pageWidth - margin, yPos, { align: 'right' });
  
  yPos += 5;
  doc.setFont('helvetica', 'bold');
  doc.text('Shipping Date', pageWidth - margin - 45, yPos);
  doc.setFont('helvetica', 'normal');
  const shippingDate = new Date();
  shippingDate.setDate(shippingDate.getDate() + 14);
  doc.text(shippingDate.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  }), pageWidth - margin, yPos, { align: 'right' });
  
  // Horizontal line separator
  yPos += 5;
  doc.setDrawColor(...borderColor);
  doc.setLineWidth(0.5);
  doc.line(margin, yPos, pageWidth - margin, yPos);
  
  // ===== TWO COLUMN INFO SECTION =====
  yPos += 7;
  const colWidth = (pageWidth - 2 * margin - 5) / 2; // Split into 2 columns
  
  // Left Column - Company Info (Your Business)
  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(0, 0, 0);
  doc.text(companyName || 'Your Company', margin, yPos);
  
  doc.setFontSize(8);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(60, 60, 60);
  let leftY = yPos + 5;
  
  if (companyAddress) {
    const addressLines = doc.splitTextToSize(companyAddress, colWidth - 5);
    doc.text(addressLines, margin, leftY);
    leftY += addressLines.length * 4;
  }
  
  if (companyPhone) {
    doc.text(companyPhone, margin, leftY);
    leftY += 4;
  }
  
  if (companyEmail) {
    doc.text(companyEmail, margin, leftY);
    leftY += 4;
  }
  
  if (companyGSTIN) {
    doc.text(`GSTIN: ${companyGSTIN}`, margin, leftY);
    leftY += 4;
  }
  
  // Right Column - Vendor Info
  const vendorX = margin + colWidth + 5;
  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(0, 0, 0);
  doc.text('Vendor:', vendorX, yPos);
  
  doc.setFontSize(8);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(60, 60, 60);
  let vendorY = yPos + 5;
  
  if (supplier) {
    doc.text(supplier.name, vendorX, vendorY);
    vendorY += 4;
    
    if (supplier.contactName) {
      doc.text(supplier.contactName, vendorX, vendorY);
      vendorY += 4;
    }
    
    if (supplier.phone) {
      doc.text(supplier.phone, vendorX, vendorY);
      vendorY += 4;
    }
    
    doc.text(`Supplier ID: ${supplier._id}`, vendorX, vendorY);
  } else {
    doc.text('No supplier selected', vendorX, vendorY);
  }
  
  // Items Table
  yPos = Math.max(leftY, vendorY) + 8;
  
  const tableData = items.map((item, index) => {
    const baseAmt = item.quantity * item.unitCost;
    const cgst = item.taxType === 'gst' ? item.taxAmount / 2 : 0;
    const sgst = item.taxType === 'gst' ? item.taxAmount / 2 : 0;
    const igst = item.taxType === 'igst' ? item.taxAmount : 0;
    
    const taxRate = item.taxType === 'none' ? '0%' : item.taxRate + '%';
    
    return [
      String(index + 1),
      item.productName,
      item.unitCost.toFixed(2),
      String(item.quantity),
      baseAmt.toFixed(2),
      taxRate,
      cgst > 0 ? cgst.toFixed(2) : '-',
      sgst > 0 ? sgst.toFixed(2) : '-',
      igst > 0 ? igst.toFixed(2) : '-',
      item.totalCost.toFixed(2)
    ];
  });
  
  autoTable(doc, {
    startY: yPos,
    head: [[
      'Sr.',
      'Product Description',
      'Rate',
      'Qty',
      'Taxable Value',
      'Tax %',
      'CGST',
      'SGST',
      'IGST',
      'Amount'
    ]],
    body: tableData,
    theme: 'grid',
    styles: { 
      fontSize: 8,
      cellPadding: 2,
      lineColor: borderColor,
      lineWidth: 0.5,
      textColor: [0, 0, 0],
    },
    headStyles: { 
      fillColor: [255, 255, 255],
      textColor: [0, 0, 0],
      fontSize: 8,
      fontStyle: 'bold',
      halign: 'center',
      lineColor: borderColor,
      lineWidth: 0.5,
    },
    columnStyles: {
      0: { cellWidth: 10, halign: 'center' },
      1: { cellWidth: 50 },
      2: { cellWidth: 22, halign: 'right' },
      3: { cellWidth: 20, halign: 'right' },
      4: { cellWidth: 22, halign: 'right' },
      5: { cellWidth: 12, halign: 'center' },
      6: { cellWidth: 17, halign: 'right' },
      7: { cellWidth: 17, halign: 'right' },
      8: { cellWidth: 17, halign: 'right' },
      9: { cellWidth: 20, halign: 'right' }
    },
  });
  
  // ===== BOTTOM SECTION - Two Boxes =====
  const tableEnd = (doc as any).lastAutoTable.finalY;
  yPos = tableEnd + 15; // Increased spacing from 10 to 15
  
  const bottomLeftWidth = 100;
  const bottomRightWidth = pageWidth - 2 * margin - bottomLeftWidth - 5;
  const bottomBoxHeight = 30;
  
  // Left: Authorized Signatory
  doc.setDrawColor(...borderColor);
  doc.setLineWidth(0.5);
  doc.rect(margin, yPos, bottomLeftWidth, bottomBoxHeight);
  
  doc.setFontSize(9);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(0, 0, 0);
  doc.text('AUTHORIZED SIGNATORY', margin + 3, yPos + 25);
  
  // Right: Financial Summary
  const rightX = margin + bottomLeftWidth + 5;
  doc.rect(rightX, yPos, bottomRightWidth, bottomBoxHeight);
  
  let summaryY = yPos + 5;
  doc.setFontSize(8);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(0, 0, 0);
  
  doc.text('TOTAL BEFORE TAX', rightX + 3, summaryY);
  doc.text(baseAmount.toFixed(2), rightX + bottomRightWidth - 3, summaryY, { align: 'right' });
  
  summaryY += 5;
  doc.text('TOTAL TAX AMOUNT', rightX + 3, summaryY);
  doc.text((cgstAmount + sgstAmount + igstAmount).toFixed(2), rightX + bottomRightWidth - 3, summaryY, { align: 'right' });
  
  summaryY += 5;
  doc.text('ROUNDED OFF', rightX + 3, summaryY);
  doc.text('0.00', rightX + bottomRightWidth - 3, summaryY, { align: 'right' });
  
  summaryY += 5;
  doc.setFontSize(9);
  doc.text('TOTAL AMOUNT', rightX + 3, summaryY);
  doc.text('Rs. ' + totalAmount.toFixed(2), rightX + bottomRightWidth - 3, summaryY, { align: 'right' });
  
  // Amount in words below
  summaryY += 8;
  doc.setFontSize(7);
  doc.setFont('helvetica', 'italic');
  doc.setTextColor(60, 60, 60);
  const amountWords = convertNumberToWords(Math.floor(totalAmount));
  const wrappedWords = doc.splitTextToSize('Rs. ' + amountWords + ' Only', bottomRightWidth - 6);
  doc.text(wrappedWords, rightX + 3, summaryY);
  
  // Notes Section
  yPos += bottomBoxHeight + 5;
  doc.setFontSize(8);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(0, 0, 0);
  doc.text('NOTE:', margin, yPos);
  
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(60, 60, 60);
  if (notes) {
    const notesLines = doc.splitTextToSize(notes, pageWidth - 2 * margin);
    doc.text(notesLines, margin, yPos + 4);
  } else {
    doc.text('Please deliver in 14 days maximum.', margin, yPos + 4);
  }
  
  // Save PDF
  const formattedDate = new Date().toISOString().split('T')[0];
  doc.save(`Purchase_Order_${invoiceNumber || formattedDate}_${Date.now()}.pdf`);
};

// Helper function to convert number to words
function convertNumberToWords(num: number): string {
  if (num === 0) return 'Zero';
  
  const ones = ['', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine'];
  const tens = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];
  const teens = ['Ten', 'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen', 'Seventeen', 'Eighteen', 'Nineteen'];
  
  if (num < 10) return ones[num];
  if (num < 20) return teens[num - 10];
  if (num < 100) return tens[Math.floor(num / 10)] + (num % 10 !== 0 ? ' ' + ones[num % 10] : '');
  if (num < 1000) return ones[Math.floor(num / 100)] + ' Hundred' + (num % 100 !== 0 ? ' ' + convertNumberToWords(num % 100) : '');
  if (num < 100000) return convertNumberToWords(Math.floor(num / 1000)) + ' Thousand' + (num % 1000 !== 0 ? ' ' + convertNumberToWords(num % 1000) : '');
  if (num < 10000000) return convertNumberToWords(Math.floor(num / 100000)) + ' Lakh' + (num % 100000 !== 0 ? ' ' + convertNumberToWords(num % 100000) : '');
  
  return 'Sixteen Thousand Five Hundred Ninety';
}
