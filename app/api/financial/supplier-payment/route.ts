import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '../../../lib/mongodb';
import { Supplier } from '../../../models/Supplier';
import { SupplierLedger } from '../../../models/SupplierLedger';
import { Payment } from '../../../models/Payment';

export async function POST(request: NextRequest) {
  try {
    await dbConnect();
    
    const data = await request.json();
    const { supplierId, amount, paymentMethod, referenceNumber, notes } = data;

    if (!supplierId || !amount || amount <= 0) {
      return NextResponse.json(
        { error: 'Supplier ID and valid amount are required' },
        { status: 400 }
      );
    }

    // Verify supplier exists
    const supplier = await Supplier.findById(supplierId);
    if (!supplier) {
      return NextResponse.json(
        { error: 'Supplier not found' },
        { status: 404 }
      );
    }

    // Create payment record
    const payment = new Payment({
      type: 'supplier',
      supplier: supplierId,
      amount,
      paymentMethod: paymentMethod || 'cash',
      referenceNumber: referenceNumber || `PAY-${Date.now()}`,
      notes: notes || '',
      status: 'completed'
    });

    await payment.save();

    // Create ledger entry
    const ledgerEntry = new SupplierLedger({
      supplier: supplierId,
      transactionDate: new Date(),
      transactionType: 'payment',
      referenceNumber: payment.referenceNumber,
      debit: amount, // Debit reduces what we owe to supplier
      credit: 0,
      balance: 0, // Will be calculated
      relatedDocument: payment._id,
      documentType: 'Payment',
      notes: `Payment made via ${paymentMethod}`
    });

    // Calculate running balance
    const lastEntry = await SupplierLedger.findOne({ supplier: supplierId })
      .sort({ transactionDate: -1, createdAt: -1 })
      .exec();

    const previousBalance = lastEntry ? lastEntry.balance : 0;
    ledgerEntry.balance = previousBalance - amount; // Payment reduces what we owe

    await ledgerEntry.save();

    return NextResponse.json({
      success: true,
      payment: {
        _id: payment._id,
        amount: payment.amount,
        paymentMethod: payment.paymentMethod,
        referenceNumber: payment.referenceNumber,
        createdAt: payment.createdAt
      },
      ledgerEntry: {
        _id: ledgerEntry._id,
        balance: ledgerEntry.balance
      }
    });
    
  } catch (error) {
    console.error('Error recording supplier payment:', error);
    return NextResponse.json(
      { error: 'Failed to record payment' },
      { status: 500 }
    );
  }
}