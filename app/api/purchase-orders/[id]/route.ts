import { NextRequest, NextResponse } from 'next/server';
import { 
  getPurchaseOrderById,
  updatePurchaseOrder,
  deletePurchaseOrder
} from '../../../../services/purchaseService';

interface RequestContext {
  params: {
    id: string;
  };
}

export async function GET(_request: NextRequest, context: RequestContext) {
  try {
    const { id } = context.params;
    
    if (!id) {
      return NextResponse.json(
        { error: 'Purchase order ID is required' },
        { status: 400 }
      );
    }
    
    const result = await getPurchaseOrderById(id);
    
    return NextResponse.json(result);
  } catch (error: any) {
    console.error(`Error fetching purchase order ${context.params.id}:`, error);
    
    if (error.message === 'Purchase order not found') {
      return NextResponse.json(
        { error: 'Purchase order not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json(
      { error: error.message || 'Failed to fetch purchase order' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest, context: RequestContext) {
  try {
    const { id } = context.params;
    const data = await request.json();
    
    const result = await updatePurchaseOrder({
      orderId: id,
      ...data
    });
    
    return NextResponse.json(result);
  } catch (error: any) {
    console.error(`Error updating purchase order ${context.params.id}:`, error);
    
    if (error.message === 'Purchase order not found') {
      return NextResponse.json(
        { error: 'Purchase order not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json(
      { error: error.message || 'Failed to update purchase order' },
      { status: 500 }
    );
  }
}

export async function DELETE(_request: NextRequest, context: RequestContext) {
  try {
    const { id } = context.params;
    
    const result = await deletePurchaseOrder(id);
    
    return NextResponse.json(result);
  } catch (error: any) {
    console.error(`Error deleting purchase order ${context.params.id}:`, error);
    
    if (error.message === 'Purchase order not found') {
      return NextResponse.json(
        { error: 'Purchase order not found' },
        { status: 404 }
      );
    }
    
    if (error.message.includes('Cannot delete')) {
      return NextResponse.json(
        { error: error.message },
        { status: 400 }
      );
    }
    
    return NextResponse.json(
      { error: error.message || 'Failed to delete purchase order' },
      { status: 500 }
    );
  }
}