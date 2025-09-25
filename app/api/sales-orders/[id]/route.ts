import { NextRequest, NextResponse } from 'next/server';
import { 
  getSalesOrderById,
  updateSalesOrderPayment,
  cancelSalesOrder
} from '../../../../services/salesService';

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
        { error: 'Sales order ID is required' },
        { status: 400 }
      );
    }
    
    const result = await getSalesOrderById(id);
    
    return NextResponse.json(result);
  } catch (error: any) {
    console.error(`Error fetching sales order ${context.params.id}:`, error);
    
    if (error.message === 'Sales order not found') {
      return NextResponse.json(
        { error: 'Sales order not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json(
      { error: error.message || 'Failed to fetch sales order' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest, context: RequestContext) {
  try {
    const { id } = context.params;
    const data = await request.json();
    
    // Check if updating payment status
    if (data.paymentStatus) {
      const result = await updateSalesOrderPayment(id, data.paymentStatus);
      return NextResponse.json(result);
    }
    
    return NextResponse.json(
      { error: 'Invalid update operation' },
      { status: 400 }
    );
  } catch (error: any) {
    console.error(`Error updating sales order ${context.params.id}:`, error);
    
    if (error.message === 'Sales order not found') {
      return NextResponse.json(
        { error: 'Sales order not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json(
      { error: error.message || 'Failed to update sales order' },
      { status: 500 }
    );
  }
}

export async function DELETE(_request: NextRequest, context: RequestContext) {
  try {
    const { id } = context.params;
    
    const result = await cancelSalesOrder(id);
    
    return NextResponse.json(result);
  } catch (error: any) {
    console.error(`Error cancelling sales order ${context.params.id}:`, error);
    
    if (error.message === 'Sales order not found') {
      return NextResponse.json(
        { error: 'Sales order not found' },
        { status: 404 }
      );
    }
    
    if (error.message.includes('already cancelled')) {
      return NextResponse.json(
        { error: error.message },
        { status: 400 }
      );
    }
    
    return NextResponse.json(
      { error: error.message || 'Failed to cancel sales order' },
      { status: 500 }
    );
  }
}