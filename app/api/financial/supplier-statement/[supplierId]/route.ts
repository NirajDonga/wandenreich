import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '../../../../lib/mongodb';
import { Supplier } from '../../../../models/Supplier';
import { SupplierLedger } from '../../../../models/SupplierLedger';

export async function GET(
  request: NextRequest,
  { params }: { params: { supplierId: string } }
) {
  try {
    await dbConnect();
    
    const { supplierId } = params;

    // Verify supplier exists
    const supplier = await Supplier.findById(supplierId);
    if (!supplier) {
      return NextResponse.json(
        { error: 'Supplier not found' },
        { status: 404 }
      );
    }

    // Get supplier ledger entries
    const ledgerEntries = await SupplierLedger.find({ supplier: supplierId })
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

    currentBalance = totalCredit - totalDebit; // For suppliers, credit balance means we owe them

    const summary = {
      totalDebit,
      totalCredit,
      currentBalance
    };

    return NextResponse.json({
      supplier: {
        _id: supplier._id,
        name: supplier.name,
        email: supplier.email,
        phone: supplier.phone
      },
      summary,
      ledgerEntries
    });
    
  } catch (error) {
    console.error('Error fetching supplier statement:', error);
    return NextResponse.json(
      { error: 'Failed to fetch supplier statement' },
      { status: 500 }
    );
  }
}