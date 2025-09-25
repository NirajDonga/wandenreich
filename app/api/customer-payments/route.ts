import { NextRequest, NextResponse } from 'next/server';
import { 
  recordCustomerPayment,
  getCustomerAccountStatement,
  getPayments
} from '../../../services/financialService';
import connectDB from '../../../lib/mongodb';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    
    // Get parameters
    const customerId = searchParams.get('customerId');
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
    
    // If customerId is provided, get their account statement
    if (customerId) {
      const statement = await getCustomerAccountStatement(
        customerId,
        startDate,
        endDate
      );
      return NextResponse.json(statement);
    }
    
    // Otherwise get paginated payments
    const payments = await getPayments({
      transactionType: 'customer-payment',
      startDate,
      endDate,
      page,
      limit
    });
    
    return NextResponse.json(payments);
  } catch (error: any) {
    console.error('Error fetching customer payments:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch customer payments' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    await connectDB();
    
    const data = await request.json();
    
    // Validate required fields
    if (!data.customerId) {
      return NextResponse.json(
        { error: 'Customer ID is required' },
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
    
    const payment = await recordCustomerPayment(data);
    
    return NextResponse.json(payment, { status: 201 });
  } catch (error: any) {
    console.error('Error recording customer payment:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to record customer payment' },
      { status: 500 }
    );
  }
}