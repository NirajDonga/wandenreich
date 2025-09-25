import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '../../../lib/mongodb';
import { Customer } from '../../../models/Customer';
import { CustomerLedger } from '../../../models/CustomerLedger';
import { Payment } from '../../../models/Payment';

export async function POST(request: NextRequest) {
  try {
    await dbConnect();
    
    const data = await request.json();
    const { customerId, amount, paymentMethod, referenceNumber, notes } = data;

    if (!customerId || !amount || amount <= 0) {
      return NextResponse.json(
        { error: 'Customer ID and valid amount are required' },
        { status: 400 }
      );
    }

    // Verify customer exists
    const customer = await Customer.findById(customerId);
    if (!customer) {
      return NextResponse.json(
        { error: 'Customer not found' },
        { status: 404 }
      );
    }

    // Create payment record
    const payment = new Payment({
      type: 'customer',
      customer: customerId,
      amount,
      paymentMethod: paymentMethod || 'cash',
      referenceNumber: referenceNumber || `PAY-${Date.now()}`,
      notes: notes || '',
      status: 'completed'
    });

    await payment.save();

    // Create ledger entry
    const ledgerEntry = new CustomerLedger({
      customer: customerId,
      transactionDate: new Date(),
      transactionType: 'payment',
      referenceNumber: payment.referenceNumber,
      credit: amount, // Credit reduces customer's debt
      debit: 0,
      balance: 0, // Will be calculated
      relatedDocument: payment._id,
      documentType: 'Payment',
      notes: `Payment received via ${paymentMethod}`
    });

    // Calculate running balance
    const lastEntry = await CustomerLedger.findOne({ customer: customerId })
      .sort({ transactionDate: -1, createdAt: -1 })
      .exec();

    const previousBalance = lastEntry ? lastEntry.balance : 0;
    ledgerEntry.balance = previousBalance - amount; // Credit reduces balance

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
    console.error('Error recording customer payment:', error);
    return NextResponse.json(
      { error: 'Failed to record payment' },
      { status: 500 }
    );
  }
}