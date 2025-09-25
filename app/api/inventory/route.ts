import { NextRequest, NextResponse } from 'next/server';
import {
  getAllInventory,
  getInventoryByVariantId,
  getLowStockItems,
  getOverstockItems,
  updateInventoryLevels,
  adjustInventory
} from '@/services/productService';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type');
    const variantId = searchParams.get('variantId');

    if (type === 'lowStock') {
      const lowStock = await getLowStockItems();
      return NextResponse.json(lowStock);
    } else if (type === 'overstock') {
      const overstock = await getOverstockItems();
      return NextResponse.json(overstock);
    } else if (variantId) {
      const inventory = await getInventoryByVariantId(variantId);
      return NextResponse.json(inventory);
    } else {
      const allInventory = await getAllInventory();
      return NextResponse.json(allInventory);
    }
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const variantId = searchParams.get('variantId');
    
    if (!variantId) {
      return NextResponse.json(
        { error: 'Variant ID is required' },
        { status: 400 }
      );
    }
    
    const body = await request.json();
    const { minStockLevel, maxStockLevel } = body;
    
    if (minStockLevel === undefined || maxStockLevel === undefined) {
      return NextResponse.json(
        { error: 'Min stock level and max stock level are required' },
        { status: 400 }
      );
    }
    
    const updatedInventory = await updateInventoryLevels(
      variantId,
      minStockLevel,
      maxStockLevel
    );
    
    return NextResponse.json(updatedInventory);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const action = searchParams.get('action');
    
    if (action !== 'adjust') {
      return NextResponse.json(
        { error: 'Invalid action' },
        { status: 400 }
      );
    }
    
    const body = await request.json();
    const { variantId, quantityChange, notes } = body;
    
    if (!variantId || quantityChange === undefined || !notes) {
      return NextResponse.json(
        { error: 'Variant ID, quantity change, and notes are required' },
        { status: 400 }
      );
    }
    
    const adjusted = await adjustInventory(
      variantId,
      quantityChange,
      notes
    );
    
    return NextResponse.json(adjusted);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}