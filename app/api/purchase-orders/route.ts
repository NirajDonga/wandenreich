import { NextRequest, NextResponse } from 'next/server';
import { 
  getPurchaseOrders,
  createPurchaseOrder,
  getPurchaseStatistics
} from '../../../services/purchaseService';
import connectDB from '../../../lib/mongodb';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const status = searchParams.get('status') || undefined;
    const supplierId = searchParams.get('supplierId') || undefined;
    
    // Handle date range filters
    let startDate, endDate;
    const startDateParam = searchParams.get('startDate');
    const endDateParam = searchParams.get('endDate');
    
    if (startDateParam) {
      startDate = new Date(startDateParam);
    }
    
    if (endDateParam) {
      endDate = new Date(endDateParam);
      // Set time to end of day
      endDate.setHours(23, 59, 59, 999);
    }

    // Check if stats are requested
    const stats = searchParams.get('stats') === 'true';
    if (stats) {
      const statistics = await getPurchaseStatistics(startDate, endDate);
      return NextResponse.json(statistics);
    }
    
    const result = await getPurchaseOrders(
      page, 
      limit, 
      status, 
      supplierId,
      startDate,
      endDate
    );
    
    return NextResponse.json(result);
  } catch (error: any) {
    console.error('Error fetching purchase orders:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch purchase orders' },
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
        { error: 'Supplier is required' },
        { status: 400 }
      );
    }
    
    if (!data.items || !Array.isArray(data.items) || data.items.length === 0) {
      return NextResponse.json(
        { error: 'At least one item is required' },
        { status: 400 }
      );
    }
    
    // Validate each item
    for (const item of data.items) {
      if (!item.productVariantId) {
        return NextResponse.json(
          { error: 'Product variant is required for each item' },
          { status: 400 }
        );
      }
      
      if (typeof item.quantity !== 'number' || item.quantity <= 0) {
        return NextResponse.json(
          { error: 'Valid quantity is required for each item' },
          { status: 400 }
        );
      }
      
      if (typeof item.unitCost !== 'number' || item.unitCost <= 0) {
        return NextResponse.json(
          { error: 'Valid unit cost is required for each item' },
          { status: 400 }
        );
      }
    }
    
    const result = await createPurchaseOrder(data);
    
    return NextResponse.json(result, { status: 201 });
  } catch (error: any) {
    console.error('Error creating purchase order:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to create purchase order' },
      { status: 500 }
    );
  }
}