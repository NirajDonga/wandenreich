import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '../../../../lib/mongodb';
import { Customer } from '../../../../models/Customer';
import { CustomerLedger } from '../../../../models/CustomerLedger';

export async function GET(
  request: NextRequest,
  { params }: { params: { customerId: string } }
) {
  try {
    await dbConnect();
    
    const { customerId } = params;

    // Verify customer exists
    const customer = await Customer.findById(customerId);
    if (!customer) {
      return NextResponse.json(
        { error: 'Customer not found' },
        { status: 404 }
      );
    }

    // Get customer ledger entries
    const ledgerEntries = await CustomerLedger.find({ customer: customerId })
      .sort({ transactionDate: -1 })
      .exec();

    // Calculate summary
    let totalDebit = 0;
    let totalCredit = 0;
    let currentBalance = 0;

    for (const entry of ledgerEntries) {
      totalDebit += entry.debit || 0;
      totalCredit += entry.credit || 0;
    }

    currentBalance = totalDebit - totalCredit;

    const summary = {
      totalDebit,
      totalCredit,
      currentBalance
    };

    return NextResponse.json({
      customer: {
        _id: customer._id,
        name: customer.name,
        email: customer.email,
        phone: customer.phone
      },
      summary,
      ledgerEntries
    });
    
  } catch (error) {
    console.error('Error fetching customer statement:', error);
    return NextResponse.json(
      { error: 'Failed to fetch customer statement' },
      { status: 500 }
    );
  }
}