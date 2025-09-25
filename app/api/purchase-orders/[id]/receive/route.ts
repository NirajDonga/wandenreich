import { NextRequest, NextResponse } from 'next/server';
import { receivePurchaseOrder } from '../../../../../services/purchaseService';

interface RequestContext {
  params: {
    id: string;
  };
}

export async function POST(request: NextRequest, context: RequestContext) {
  try {
    const { id } = context.params;
    const data = await request.json();
    
    // Validate request data
    if (!data.receivedItems || !Array.isArray(data.receivedItems) || data.receivedItems.length === 0) {
      return NextResponse.json(
        { error: 'At least one received item is required' },
        { status: 400 }
      );
    }
    
    // Validate each received item
    for (const item of data.receivedItems) {
      if (!item.purchaseItemId) {
        return NextResponse.json(
          { error: 'Purchase item ID is required for each received item' },
          { status: 400 }
        );
      }
      
      if (typeof item.receivedQuantity !== 'number' || item.receivedQuantity <= 0) {
        return NextResponse.json(
          { error: 'Valid received quantity is required for each item' },
          { status: 400 }
        );
      }
    }
    
    const result = await receivePurchaseOrder({
      orderId: id,
      receivedItems: data.receivedItems
    });
    
    return NextResponse.json(result);
  } catch (error: any) {
    console.error(`Error receiving purchase order ${context.params.id}:`, error);
    
    if (error.message === 'Purchase order not found') {
      return NextResponse.json(
        { error: 'Purchase order not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json(
      { error: error.message || 'Failed to receive purchase order' },
      { status: 500 }
    );
  }
}