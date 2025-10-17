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
}

export const generatePurchasePDF = ({
  items,
  supplier,
  invoiceNumber,
  paymentMethod,
  amountPaid,
  notes
}: GeneratePDFOptions) => {
  const doc = new jsPDF();
  const { baseAmount, cgstAmount, sgstAmount, igstAmount } = calculateTaxBreakdown(items);
  const totalAmount = calculateTotal(items);
  const paidAmount = parseFloat(amountPaid) || 0;
  const balance = totalAmount - paidAmount;
  
  const pageWidth = 210;
  const margin = 15;
  let yPos = 20;
  
  // Header Box
  doc.setLineWidth(0.5);
  doc.rect(margin, 12, pageWidth - 2 * margin, 30);
  
  // Company Name - centered with proper spacing
  doc.setFontSize(20);
  doc.setFont('helvetica', 'bold');
  doc.text('PURCHASE ORDER', pageWidth / 2, yPos, { align: 'center' });
  
  yPos += 8;
  doc.setFontSize(11);
  doc.setFont('helvetica', 'normal');
  doc.text('Tax Invoice', pageWidth / 2, yPos, { align: 'center' });
  
  // Horizontal line in header
  yPos += 4;
  doc.setLineWidth(0.3);
  doc.line(margin + 5, yPos, pageWidth - margin - 5, yPos);
  
  // Invoice Number and Date on same line with spacing
  yPos += 6;
  doc.setFontSize(10);
  doc.text('Invoice No: ' + (invoiceNumber || 'N/A'), margin + 3, yPos);
  doc.text('Date: ' + new Date().toLocaleDateString('en-IN'), pageWidth - margin - 45, yPos);
  
  // Supplier Details Box with proper spacing
  yPos += 8;
  const supplierBoxHeight = 25;
  doc.setLineWidth(0.5);
  doc.rect(margin, yPos, pageWidth - 2 * margin, supplierBoxHeight);
  
  yPos += 6;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.text('Supplier Details:', margin + 3, yPos);
  
  yPos += 6;
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  doc.text('Name: ' + (supplier?.name || 'N/A'), margin + 3, yPos);
  
  if (supplier?.phone) {
    doc.text('Phone: ' + supplier.phone, margin + 100, yPos);
  }
  
  yPos += 6;
  doc.text('Customer TRN: ' + (supplier?._id?.substring(0, 15) || 'N/A'), margin + 3, yPos);
  
  // Items Table with better spacing
  yPos += 12;
  const tableStartY = yPos;
  
  const tableData = items.map((item, index) => {
    const baseAmt = item.quantity * item.unitCost;
    const cgst = item.taxType === 'gst' ? item.taxAmount / 2 : 0;
    const sgst = item.taxType === 'gst' ? item.taxAmount / 2 : 0;
    const igst = item.taxType === 'igst' ? item.taxAmount : 0;
    
    const taxRate = item.taxType === 'none' ? '0%' : item.taxRate + '%';
    
    return [
      String(index + 1),
      item.productName,
      '₹' + item.unitCost.toFixed(2),
      String(item.quantity),
      '₹' + baseAmt.toFixed(2),
      taxRate,
      cgst > 0 ? '₹' + cgst.toFixed(2) : '-',
      sgst > 0 ? '₹' + sgst.toFixed(2) : '-',
      igst > 0 ? '₹' + igst.toFixed(2) : '-',
      '₹' + item.totalCost.toFixed(2)
    ];
  });
  
  autoTable(doc, {
    startY: tableStartY,
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
      fontSize: 9,
      cellPadding: 3,
      lineColor: [0, 0, 0],
      lineWidth: 0.3,
      textColor: [0, 0, 0],
      font: 'helvetica'
    },
    headStyles: { 
      fillColor: [240, 240, 240],
      textColor: [0, 0, 0],
      fontSize: 9,
      fontStyle: 'bold',
      halign: 'center',
      valign: 'middle',
      lineWidth: 0.5
    },
    columnStyles: {
      0: { cellWidth: 12, halign: 'center' },
      1: { cellWidth: 52, halign: 'left', cellPadding: { left: 2 } },
      2: { cellWidth: 22, halign: 'right' },
      3: { cellWidth: 12, halign: 'center' },
      4: { cellWidth: 26, halign: 'right' },
      5: { cellWidth: 14, halign: 'center' },
      6: { cellWidth: 18, halign: 'right' },
      7: { cellWidth: 18, halign: 'right' },
      8: { cellWidth: 18, halign: 'right' },
      9: { cellWidth: 24, halign: 'right', fontStyle: 'bold' }
    },
    margin: { left: margin, right: margin }
  });
  
  // Summary Section with proper boxes and spacing
  const summaryY = (doc as any).lastAutoTable.finalY + 5;
  
  // Left box - Amount in words
  const leftBoxWidth = 105;
  const summaryBoxHeight = 28;
  
  doc.setLineWidth(0.5);
  doc.rect(margin, summaryY, leftBoxWidth, summaryBoxHeight);
  
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.text('Amount in Words:', margin + 3, summaryY + 5);
  
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  const amountInWords = 'Rupees ' + Math.floor(totalAmount) + ' Only';
  const wrappedText = doc.splitTextToSize(amountInWords, leftBoxWidth - 6);
  doc.text(wrappedText, margin + 3, summaryY + 11);
  
  // Right box - Summary
  const rightBoxX = margin + leftBoxWidth;
  const rightBoxWidth = pageWidth - 2 * margin - leftBoxWidth;
  
  doc.rect(rightBoxX, summaryY, rightBoxWidth, summaryBoxHeight);
  
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.text('Summary', rightBoxX + rightBoxWidth / 2, summaryY + 5, { align: 'center' });
  
  let summaryRowY = summaryY + 11;
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  
  doc.text('Taxable Amount:', rightBoxX + 3, summaryRowY);
  doc.text('₹' + baseAmount.toFixed(2), rightBoxX + rightBoxWidth - 3, summaryRowY, { align: 'right' });
  
  summaryRowY += 5;
  if (cgstAmount > 0) {
    doc.text('CGST:', rightBoxX + 3, summaryRowY);
    doc.text('₹' + cgstAmount.toFixed(2), rightBoxX + rightBoxWidth - 3, summaryRowY, { align: 'right' });
    summaryRowY += 5;
  }
  
  if (sgstAmount > 0) {
    doc.text('SGST:', rightBoxX + 3, summaryRowY);
    doc.text('₹' + sgstAmount.toFixed(2), rightBoxX + rightBoxWidth - 3, summaryRowY, { align: 'right' });
    summaryRowY += 5;
  }
  
  if (igstAmount > 0) {
    doc.text('IGST:', rightBoxX + 3, summaryRowY);
    doc.text('₹' + igstAmount.toFixed(2), rightBoxX + rightBoxWidth - 3, summaryRowY, { align: 'right' });
    summaryRowY += 5;
  }
  
  // Total line
  doc.setLineWidth(0.3);
  doc.line(rightBoxX + 3, summaryRowY - 1, rightBoxX + rightBoxWidth - 3, summaryRowY - 1);
  
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.text('Invoice Amount:', rightBoxX + 3, summaryRowY + 4);
  doc.text('₹' + totalAmount.toFixed(2), rightBoxX + rightBoxWidth - 3, summaryRowY + 4, { align: 'right' });
  
  // Payment and Notes Section
  const bottomY = summaryY + summaryBoxHeight + 5;
  const bottomBoxHeight = 22;
  
  doc.setLineWidth(0.5);
  doc.rect(margin, bottomY, leftBoxWidth, bottomBoxHeight);
  
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.text('Payment Details:', margin + 3, bottomY + 5);
  
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.text('Method: ' + paymentMethod.toUpperCase(), margin + 3, bottomY + 11);
  doc.text('Paid: ₹' + paidAmount.toFixed(2), margin + 3, bottomY + 16);
  
  if (balance !== 0) {
    doc.setFont('helvetica', 'bold');
    doc.text((balance > 0 ? 'Due: ' : 'Refund: ') + '₹' + Math.abs(balance).toFixed(2), margin + 55, bottomY + 16);
  }
  
  // Notes box
  doc.rect(rightBoxX, bottomY, rightBoxWidth, bottomBoxHeight);
  
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.text('Notes:', rightBoxX + 3, bottomY + 5);
  
  if (notes) {
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    const notesWrapped = doc.splitTextToSize(notes, rightBoxWidth - 6);
    doc.text(notesWrapped, rightBoxX + 3, bottomY + 11);
  }
  
  // Signature Section
  const sigY = bottomY + bottomBoxHeight + 8;
  doc.setLineWidth(0.3);
  doc.line(pageWidth - margin - 50, sigY + 8, pageWidth - margin - 5, sigY + 8);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.text('Authorized Signatory', pageWidth - margin - 27, sigY + 12, { align: 'center' });
  
  // Footer
  const pageHeight = doc.internal.pageSize.height;
  doc.setLineWidth(0.5);
  doc.line(margin, pageHeight - 18, pageWidth - margin, pageHeight - 18);
  
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.text('Thank You. Visit Again.', pageWidth / 2, pageHeight - 10, { align: 'center' });
  
  // Save
  doc.save('Purchase_Order_' + (invoiceNumber || Date.now()) + '.pdf');
};
