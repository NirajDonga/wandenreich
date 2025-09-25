import { NextRequest, NextResponse } from 'next/server';
import { 
  getCustomerBalances,
  getSupplierBalances,
  getFinancialOverview,
  recordCustomerAdjustment,
  recordSupplierAdjustment
} from '../../../services/financialService';
import connectDB from '../../../lib/mongodb';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const type = searchParams.get('type') || 'overview'; // 'overview', 'customers', 'suppliers'
    
    switch (type) {
      case 'customers':
        const customerBalances = await getCustomerBalances();
        return NextResponse.json({ customerBalances });
        
      case 'suppliers':
        const supplierBalances = await getSupplierBalances();
        return NextResponse.json({ supplierBalances });
        
      case 'overview':
      default:
        const overview = await getFinancialOverview();
        return NextResponse.json(overview);
    }
  } catch (error: any) {
    console.error('Error fetching financial data:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch financial data' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    await connectDB();
    
    const data = await request.json();
    
    // Validate the adjustment type
    const { type, entityId, amount, notes } = data;
    
    if (!type || (type !== 'customer' && type !== 'supplier')) {
      return NextResponse.json(
        { error: 'Valid adjustment type (customer or supplier) is required' },
        { status: 400 }
      );
    }
    
    if (!entityId) {
      return NextResponse.json(
        { error: 'Entity ID is required' },
        { status: 400 }
      );
    }
    
    if (typeof amount !== 'number') {
      return NextResponse.json(
        { error: 'Valid adjustment amount is required' },
        { status: 400 }
      );
    }
    
    if (!notes) {
      return NextResponse.json(
        { error: 'Notes explaining the adjustment are required' },
        { status: 400 }
      );
    }
    
    let result;
    if (type === 'customer') {
      result = await recordCustomerAdjustment({
        customerId: entityId,
        amount,
        notes,
        adjustmentDate: data.adjustmentDate
      });
    } else {
      result = await recordSupplierAdjustment({
        supplierId: entityId,
        amount,
        notes,
        adjustmentDate: data.adjustmentDate
      });
    }
    
    return NextResponse.json(result, { status: 201 });
  } catch (error: any) {
    console.error('Error recording ledger adjustment:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to record ledger adjustment' },
      { status: 500 }
    );
  }
}