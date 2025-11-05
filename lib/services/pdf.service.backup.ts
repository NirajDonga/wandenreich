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
  const pageHeight = doc.internal.pageSize.height;
  const margin = 14;
  let yPos = 15;
  
  // Ultra Light, Clean Professional Theme - Minimal Dark Colors
  const primaryColor: [number, number, number] = [96, 125, 139]; // Soft blue-gray (much lighter)
  const accentColor: [number, number, number] = [66, 165, 245]; // Bright clean blue
  const successColor: [number, number, number] = [102, 187, 106]; // Soft green
  const textDark: [number, number, number] = [66, 66, 66]; // Soft dark gray (not black)
  const textMuted: [number, number, number] = [158, 158, 158]; // Light gray
  const borderColor: [number, number, number] = [224, 224, 224]; // Very light border
  const bgLight: [number, number, number] = [250, 250, 250]; // Almost white
  const bgWhite: [number, number, number] = [255, 255, 255]; // Pure white
  const headerBg: [number, number, number] = [240, 245, 250]; // Very light blue tint
  
  // Stylish Modern Header with Elegant Design
  // Background gradient simulation with layers
  doc.setFillColor(255, 255, 255);
  doc.rect(0, 0, pageWidth, 40, 'F');
  
  // Elegant accent bars - Modern design
  doc.setFillColor(66, 165, 245);
  doc.rect(0, 0, 4, 40, 'F');
  doc.rect(pageWidth - 4, 0, 4, 40, 'F');
  
  // Decorative top line
  doc.setFillColor(66, 165, 245);
  doc.rect(0, 0, pageWidth, 1, 'F');
  
  // Company Name - Large and Bold
  doc.setTextColor(44, 62, 80);
  doc.setFontSize(24);
  doc.setFont('helvetica', 'bold');
  doc.text('PURCHASE ORDER', pageWidth / 2, 16, { align: 'center' });
  
  // Decorative underline
  doc.setDrawColor(66, 165, 245);
  doc.setLineWidth(0.8);
  const titleWidth = doc.getTextWidth('PURCHASE ORDER');
  doc.line(pageWidth / 2 - titleWidth / 2, 18, pageWidth / 2 + titleWidth / 2, 18);
  
  // Subtitle with styling
  doc.setFontSize(9);
  doc.setFont('helvetica', 'italic');
  doc.setTextColor(120, 120, 120);
  doc.text('Tax Invoice', pageWidth / 2, 24, { align: 'center' });
  
  // Elegant info box for invoice details
  doc.setFillColor(250, 251, 252);
  doc.rect(margin, 28, pageWidth - 2 * margin, 9, 'F');
  doc.setDrawColor(220, 220, 220);
  doc.setLineWidth(0.3);
  doc.rect(margin, 28, pageWidth - 2 * margin, 9);
  
  // Invoice details in styled box
  yPos = 33.5;
  doc.setFontSize(8);
  doc.setTextColor(44, 62, 80);
  doc.setFont('helvetica', 'bold');
  doc.text('Invoice #:', margin + 3, yPos);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(66, 165, 245);
  doc.text(invoiceNumber || 'N/A', margin + 20, yPos);
  
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(44, 62, 80);
  doc.text('Date:', pageWidth - margin - 42, yPos);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(66, 165, 245);
  doc.text(new Date().toLocaleDateString('en-IN', { 
    day: '2-digit', 
    month: 'short', 
    year: 'numeric' 
  }), pageWidth - margin - 30, yPos);
  
  // Supplier Details Section - Stylish Card Design
  yPos = 44;
  const supplierBoxHeight = 28;
  
  // Card with subtle shadow effect
  doc.setFillColor(252, 252, 252);
  doc.rect(margin + 0.5, yPos + 0.5, pageWidth - 2 * margin, supplierBoxHeight, 'F');
  
  // Main card
  doc.setFillColor(255, 255, 255);
  doc.rect(margin, yPos, pageWidth - 2 * margin, supplierBoxHeight, 'F');
  
  // Elegant border with accent
  doc.setDrawColor(66, 165, 245);
  doc.setLineWidth(0.5);
  doc.line(margin, yPos, margin + 40, yPos); // Top left accent
  
  doc.setDrawColor(220, 220, 220);
  doc.setLineWidth(0.5);
  doc.rect(margin, yPos, pageWidth - 2 * margin, supplierBoxHeight);
  
  // Stylish header with icon-like element
  doc.setFillColor(66, 165, 245);
  doc.circle(margin + 5, yPos + 5, 1.5, 'F');
  
  doc.setTextColor(44, 62, 80);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.text('SUPPLIER DETAILS', margin + 9, yPos + 6);
  
  // Supplier details content with better styling
  yPos += 12;
  doc.setTextColor(100, 100, 100);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.5);
  doc.text('Name:', margin + 3, yPos);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(44, 62, 80);
  doc.text(supplier?.name || 'N/A', margin + 15, yPos);
  
  if (supplier?.phone) {
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(7.5);
    doc.setTextColor(100, 100, 100);
    doc.text('Phone:', pageWidth - margin - 50, yPos);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    doc.setTextColor(44, 62, 80);
    doc.text(supplier.phone, pageWidth - margin - 38, yPos);
  }
  
  yPos += 6;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.5);
  doc.setTextColor(100, 100, 100);
  doc.text('ID:', margin + 3, yPos);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(150, 150, 150);
  doc.text(supplier?._id?.substring(0, 26) || 'N/A', margin + 10, yPos);
  
  // Currency note
  yPos += 10;
  doc.setTextColor(...textMuted);
  doc.setFont('helvetica', 'italic');
  doc.setFontSize(7.5);
  doc.text('All amounts are in Indian Rupees (INR)', pageWidth - margin, yPos, { align: 'right' });
  
  // Items Table Section
  yPos += 5;
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
    theme: 'plain',
    styles: { 
      fontSize: 8,
      cellPadding: { top: 3, right: 1.5, bottom: 3, left: 1.5 },
      lineColor: borderColor,
      lineWidth: 0.5,
      textColor: textDark,
      font: 'helvetica',
      overflow: 'linebreak',
      valign: 'middle'
    },
    headStyles: { 
      fillColor: [248, 251, 254],
      textColor: [44, 62, 80],
      fontSize: 8,
      fontStyle: 'bold',
      halign: 'center',
      valign: 'middle',
      lineWidth: 0.5,
      lineColor: [66, 165, 245],
      cellPadding: { top: 3.5, right: 1, bottom: 3.5, left: 1 }
    },
    alternateRowStyles: {
      fillColor: [253, 253, 253]
    },
    bodyStyles: {
      fillColor: [255, 255, 255]
    },
    columnStyles: {
      0: { cellWidth: 8, halign: 'center', fontStyle: 'bold', textColor: textMuted },
      1: { cellWidth: 52, halign: 'left', cellPadding: { left: 2, right: 1 } },
      2: { cellWidth: 18, halign: 'right', cellPadding: { right: 1.5 } },
      3: { cellWidth: 10, halign: 'center', fontStyle: 'bold' },
      4: { cellWidth: 22, halign: 'right', cellPadding: { right: 1.5 } },
      5: { cellWidth: 12, halign: 'center', fontStyle: 'bold' },
      6: { cellWidth: 17, halign: 'right', cellPadding: { right: 1.5 } },
      7: { cellWidth: 17, halign: 'right', cellPadding: { right: 1.5 } },
      8: { cellWidth: 17, halign: 'right', cellPadding: { right: 1.5 } },
      9: { 
        cellWidth: 20, 
        halign: 'right', 
        fontStyle: 'bold',
        textColor: textDark,
        cellPadding: { right: 1.5 }
      }
    },
    margin: { left: margin, right: margin },
    tableWidth: 'auto'
  });
  
  // Summary Section - Elegant Cards with Styling
  const summaryY = (doc as any).lastAutoTable.finalY + 8;
  
  // Left box - Amount in words with shadow
  const leftBoxWidth = 100;
  const summaryBoxHeight = 30;
  
  // Shadow effect
  doc.setFillColor(245, 245, 245);
  doc.rect(margin + 0.5, summaryY + 0.5, leftBoxWidth, summaryBoxHeight, 'F');
  
  // Main card
  doc.setFillColor(255, 255, 255);
  doc.rect(margin, summaryY, leftBoxWidth, summaryBoxHeight, 'F');
  
  // Border with accent
  doc.setDrawColor(66, 165, 245);
  doc.setLineWidth(0.5);
  doc.line(margin, summaryY, margin, summaryY + 8);
  
  doc.setDrawColor(220, 220, 220);
  doc.rect(margin, summaryY, leftBoxWidth, summaryBoxHeight);
  
  // Header with icon
  doc.setFillColor(66, 165, 245);
  doc.circle(margin + 5, summaryY + 5, 1.5, 'F');
  
  doc.setTextColor(44, 62, 80);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.text('AMOUNT IN WORDS', margin + 9, summaryY + 6);
  
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(...textDark);
  const amountInWords = 'Rupees ' + Math.floor(totalAmount) + ' Only';
  const wrappedText = doc.splitTextToSize(amountInWords, leftBoxWidth - 6);
  doc.text(wrappedText, margin + 3, summaryY + 13);
  
  // Right box - Financial Summary with styling
  const rightBoxX = margin + leftBoxWidth + 3;
  const rightBoxWidth = pageWidth - 2 * margin - leftBoxWidth - 3;
  
  // Shadow effect
  doc.setFillColor(245, 245, 245);
  doc.rect(rightBoxX + 0.5, summaryY + 0.5, rightBoxWidth, summaryBoxHeight, 'F');
  
  // Main card
  doc.setFillColor(255, 255, 255);
  doc.rect(rightBoxX, summaryY, rightBoxWidth, summaryBoxHeight, 'F');
  
  // Border with accent
  doc.setDrawColor(66, 165, 245);
  doc.setLineWidth(0.5);
  doc.line(rightBoxX, summaryY, rightBoxX, summaryY + 8);
  
  doc.setDrawColor(220, 220, 220);
  doc.rect(rightBoxX, summaryY, rightBoxWidth, summaryBoxHeight);
  
  // Header with icon
  doc.setFillColor(66, 165, 245);
  doc.circle(rightBoxX + 5, summaryY + 5, 1.5, 'F');
  
  doc.setTextColor(44, 62, 80);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.text('FINANCIAL SUMMARY', rightBoxX + 9, summaryY + 6);
  
  let summaryRowY = summaryY + 11;
  doc.setTextColor(...textDark);
  doc.setFontSize(8);
  
  // Taxable Amount
  doc.setFont('helvetica', 'bold');
  doc.text('Taxable Amount:', rightBoxX + 3, summaryRowY);
  doc.setFont('helvetica', 'normal');
  doc.text('Rs. ' + baseAmount.toFixed(2), rightBoxX + rightBoxWidth - 3, summaryRowY, { align: 'right' });
  
  summaryRowY += 4.5;
  if (cgstAmount > 0) {
    doc.setFont('helvetica', 'bold');
    doc.text('CGST:', rightBoxX + 3, summaryRowY);
    doc.setFont('helvetica', 'normal');
    doc.text('Rs. ' + cgstAmount.toFixed(2), rightBoxX + rightBoxWidth - 3, summaryRowY, { align: 'right' });
    summaryRowY += 4.5;
  }
  
  if (sgstAmount > 0) {
    doc.setFont('helvetica', 'bold');
    doc.text('SGST:', rightBoxX + 3, summaryRowY);
    doc.setFont('helvetica', 'normal');
    doc.text('Rs. ' + sgstAmount.toFixed(2), rightBoxX + rightBoxWidth - 3, summaryRowY, { align: 'right' });
    summaryRowY += 4.5;
  }
  
  if (igstAmount > 0) {
    doc.setFont('helvetica', 'bold');
    doc.text('IGST:', rightBoxX + 3, summaryRowY);
    doc.setFont('helvetica', 'normal');
    doc.text('Rs. ' + igstAmount.toFixed(2), rightBoxX + rightBoxWidth - 3, summaryRowY, { align: 'right' });
    summaryRowY += 4.5;
  }
  
  // Total section - Stylish highlight
  summaryRowY += 0.5;
  doc.setDrawColor(66, 165, 245);
  doc.setLineWidth(0.8);
  doc.line(rightBoxX + 2, summaryRowY, rightBoxX + rightBoxWidth - 2, summaryRowY);
  
  summaryRowY += 1;
  // Elegant gradient effect with accent color
  doc.setFillColor(240, 248, 255);
  doc.rect(rightBoxX, summaryRowY, rightBoxWidth, 9, 'F');
  
  // Side accent bar
  doc.setFillColor(66, 165, 245);
  doc.rect(rightBoxX, summaryRowY, 2, 9, 'F');
  
  doc.setTextColor(44, 62, 80);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.text('TOTAL AMOUNT:', rightBoxX + 5, summaryRowY + 6);
  doc.setFontSize(12);
  doc.setTextColor(66, 165, 245);
  doc.text('Rs. ' + totalAmount.toFixed(2), rightBoxX + rightBoxWidth - 3, summaryRowY + 6, { align: 'right' });
  
  // Payment and Notes Section - Stylish cards
  const bottomY = summaryY + summaryBoxHeight + 5;
  const bottomBoxHeight = 24;
  
  // Payment Details Box - Shadow effect
  doc.setFillColor(230, 230, 230);
  doc.roundedRect(margin + 0.8, bottomY + 0.8, leftBoxWidth, bottomBoxHeight, 2, 2, 'F');
  
  // Main card
  doc.setFillColor(255, 255, 255);
  doc.setDrawColor(220, 220, 220);
  doc.setLineWidth(0.3);
  doc.roundedRect(margin, bottomY, leftBoxWidth, bottomBoxHeight, 2, 2, 'FD');
  
  // Header with circular icon
  doc.setFillColor(66, 165, 245);
  doc.circle(margin + 4, bottomY + 4, 1.5, 'F');
  doc.setFillColor(255, 255, 255);
  doc.setFontSize(6);
  doc.setFont('helvetica', 'bold');
  doc.text('₹', margin + 3.3, bottomY + 4.7);
  
  doc.setTextColor(44, 62, 80);
  doc.setFontSize(8);
  doc.text('PAYMENT DETAILS', margin + 8, bottomY + 4.5);
  
  // Blue accent line
  doc.setDrawColor(66, 165, 245);
  doc.setLineWidth(0.5);
  doc.line(margin + 2, bottomY + 6.5, margin + leftBoxWidth - 2, bottomY + 6.5);
  
  // Payment content
  let paymentY = bottomY + 12;
  
  doc.setTextColor(80, 80, 80);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.text('Method:', margin + 3, paymentY);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(60, 60, 60);
  doc.text(paymentMethod.toUpperCase(), margin + 20, paymentY);
  
  paymentY += 5;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(80, 80, 80);
  doc.text('Paid:', margin + 3, paymentY);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(...successColor);
  doc.text('Rs. ' + paidAmount.toFixed(2), margin + leftBoxWidth - 3, paymentY, { align: 'right' });
  
  if (balance !== 0) {
    paymentY += 5;
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8);
    doc.setTextColor(80, 80, 80);
    doc.text(balance > 0 ? 'Due:' : 'Refund:', margin + 3, paymentY);
    
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    if (balance > 0) {
      doc.setTextColor(192, 57, 43); // Subtle red
    } else {
      doc.setTextColor(...successColor);
    }
    doc.text('Rs. ' + Math.abs(balance).toFixed(2), margin + leftBoxWidth - 3, paymentY, { align: 'right' });
  }
  
  // Notes Box - Shadow effect
  doc.setFillColor(230, 230, 230);
  doc.roundedRect(rightBoxX + 0.8, bottomY + 0.8, rightBoxWidth, bottomBoxHeight, 2, 2, 'F');
  
  // Main card
  doc.setFillColor(255, 255, 255);
  doc.setDrawColor(220, 220, 220);
  doc.setLineWidth(0.3);
  doc.roundedRect(rightBoxX, bottomY, rightBoxWidth, bottomBoxHeight, 2, 2, 'FD');
  
  // Header with circular icon
  doc.setFillColor(66, 165, 245);
  doc.circle(rightBoxX + 4, bottomY + 4, 1.5, 'F');
  doc.setFillColor(255, 255, 255);
  doc.setFontSize(7);
  doc.setFont('helvetica', 'bold');
  doc.text('i', rightBoxX + 3.6, bottomY + 4.7);
  
  doc.setTextColor(44, 62, 80);
  doc.setFontSize(8);
  doc.text('NOTES', rightBoxX + 8, bottomY + 4.5);
  
  // Blue accent line
  doc.setDrawColor(66, 165, 245);
  doc.setLineWidth(0.5);
  doc.line(rightBoxX + 2, bottomY + 6.5, rightBoxX + rightBoxWidth - 2, bottomY + 6.5);
  
  if (notes) {
    doc.setTextColor(60, 60, 60);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    const notesWrapped = doc.splitTextToSize(notes, rightBoxWidth - 6);
    doc.text(notesWrapped, rightBoxX + 3, bottomY + 12);
  } else {
    doc.setTextColor(160, 160, 160);
    doc.setFont('helvetica', 'italic');
    doc.setFontSize(8);
    doc.text('No additional notes', rightBoxX + 3, bottomY + 12);
  }
  
  // Signature Section - Elegant design
  const sigY = bottomY + bottomBoxHeight + 8;
  
  // Decorative element
  doc.setDrawColor(66, 165, 245);
  doc.setLineWidth(0.3);
  doc.line(pageWidth - margin - 55, sigY, pageWidth - margin, sigY);
  
  // Signature area
  const sigBoxWidth = 50;
  const sigBoxHeight = 15;
  const sigX = pageWidth - margin - sigBoxWidth;
  
  // Light background
  doc.setFillColor(250, 252, 255);
  doc.roundedRect(sigX, sigY + 1, sigBoxWidth, sigBoxHeight, 1, 1, 'F');
  
  // Border
  doc.setDrawColor(220, 220, 220);
  doc.setLineWidth(0.3);
  doc.roundedRect(sigX, sigY + 1, sigBoxWidth, sigBoxHeight, 1, 1, 'D');
  
  // Blue accent dot
  doc.setFillColor(66, 165, 245);
  doc.circle(sigX + 3, sigY + 4, 1, 'F');
  
  // Signature line
  doc.setDrawColor(200, 200, 200);
  doc.setLineWidth(0.5);
  doc.line(sigX + 5, sigY + 11, sigX + sigBoxWidth - 5, sigY + 11);
  
  doc.setTextColor(44, 62, 80);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.text('Authorized Signatory', sigX + sigBoxWidth / 2, sigY + 14, { align: 'center' });
  
  doc.setFont('helvetica', 'italic');
  doc.setFontSize(7);
  doc.setTextColor(140, 140, 140);
  doc.text('(Signature & Stamp)', sigX + sigBoxWidth / 2, sigY + 16.5, { align: 'center' });
  
  // Elegant Footer
  const footerY = pageHeight - 18;
  
  // Decorative top line with gradient effect
  doc.setDrawColor(66, 165, 245);
  doc.setLineWidth(0.5);
  doc.line(margin, footerY, pageWidth - margin, footerY);
  
  // Accent dots
  doc.setFillColor(66, 165, 245);
  doc.circle(margin + 2, footerY, 0.5, 'F');
  doc.circle(pageWidth - margin - 2, footerY, 0.5, 'F');
  
  doc.setTextColor(60, 60, 60);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.5);
  doc.text('Thank you for your business', pageWidth / 2, footerY + 5, { align: 'center' });
  
  doc.setFont('helvetica', 'italic');
  doc.setFontSize(7);
  doc.setTextColor(140, 140, 140);
  doc.text('This is a computer-generated document and does not require a signature', pageWidth / 2, footerY + 9, { align: 'center' });
  
  // Small decorative element at bottom
  doc.setFillColor(240, 248, 255);
  doc.rect(pageWidth / 2 - 15, footerY + 11, 30, 1.5, 'F');
  doc.setFillColor(66, 165, 245);
  doc.circle(pageWidth / 2, footerY + 11.75, 1, 'F');
  
  // Save with formatted filename
  const formattedDate = new Date().toISOString().split('T')[0];
  doc.save(`Purchase_Order_${invoiceNumber || formattedDate}_${Date.now()}.pdf`);
};
