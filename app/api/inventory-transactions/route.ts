import { NextRequest, NextResponse } from 'next/server';
import { getInventoryTransactionsByVariant } from '@/services/productService';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const variantId = searchParams.get('variantId');
    const startDateParam = searchParams.get('startDate');
    const endDateParam = searchParams.get('endDate');
    
    if (!variantId) {
      return NextResponse.json(
        { error: 'Variant ID is required' },
        { status: 400 }
      );
    }
    
    let startDate = undefined;
    let endDate = undefined;
    
    if (startDateParam) {
      startDate = new Date(startDateParam);
    }
    
    if (endDateParam) {
      endDate = new Date(endDateParam);
    }
    
    const transactions = await getInventoryTransactionsByVariant(
      variantId,
      startDate,
      endDate
    );
    
    return NextResponse.json(transactions);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}