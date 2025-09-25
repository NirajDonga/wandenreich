import { NextRequest, NextResponse } from 'next/server';
import { 
  recordSupplierPayment,
  getSupplierAccountStatement,
  getPayments
} from '../../../services/financialService';
import connectDB from '../../../lib/mongodb';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    
    // Get parameters
    const supplierId = searchParams.get('supplierId');
    const startDateStr = searchParams.get('startDate');
    const endDateStr = searchParams.get('endDate');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    
    // Parse dates if provided
    let startDate, endDate;
    if (startDateStr) startDate = new Date(startDateStr);
    if (endDateStr) {
      endDate = new Date(endDateStr);
      // Set time to end of day for inclusive end date
      endDate.setHours(23, 59, 59, 999);
    }
    
    // If supplierId is provided, get their account statement
    if (supplierId) {
      const statement = await getSupplierAccountStatement(
        supplierId,
        startDate,
        endDate
      );
      return NextResponse.json(statement);
    }
    
    // Otherwise get paginated payments
    const payments = await getPayments({
      transactionType: 'supplier-payment',
      startDate,
      endDate,
      page,
      limit
    });
    
    return NextResponse.json(payments);
  } catch (error: any) {
    console.error('Error fetching supplier payments:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch supplier payments' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    await connectDB();
    
    const data = await request.json();
    
    // Validate required fields
    if (!data.supplierId) {
      return NextResponse.json(
        { error: 'Supplier ID is required' },
        { status: 400 }
      );
    }
    
    if (typeof data.amount !== 'number' || data.amount <= 0) {
      return NextResponse.json(
        { error: 'Valid payment amount is required' },
        { status: 400 }
      );
    }
    
    if (!data.paymentMethod) {
      return NextResponse.json(
        { error: 'Payment method is required' },
        { status: 400 }
      );
    }
    
    const payment = await recordSupplierPayment(data);
    
    return NextResponse.json(payment, { status: 201 });
  } catch (error: any) {
    console.error('Error recording supplier payment:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to record supplier payment' },
      { status: 500 }
    );
  }
}