import { NextRequest, NextResponse } from 'next/server';
import { createProduct, createCompleteProduct, getAllProducts, getProductById } from '@/services/productService';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (id) {
      const product = await getProductById(id);
      return NextResponse.json(product);
    } else {
      const products = await getAllProducts();
      return NextResponse.json(products);
    }
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Handle both simple and complete product creation
    if (body.unitOfMeasure && body.sellingPrice) {
      // Complete product creation (from QuickAdd, etc.)
      const { 
        name, 
        brand,
        unitOfMeasure, 
        description, 
        sellingPrice, 
        costPrice, 
        barcode, 
        sku,
        minStockLevel,
        isActive = true 
      } = body;

      if (!name || !unitOfMeasure) {
        return NextResponse.json(
          { error: 'Name and unit of measure are required' },
          { status: 400 }
        );
      }

      // Create complete product with capitalized name
      const newProduct = await createCompleteProduct({
        name: name.toUpperCase(), // Always capitalize
        brand: brand?.toUpperCase(), // Capitalize brand too
        unitOfMeasure,
        description,
        sellingPrice,
        costPrice,
        barcode,
        sku: sku?.toUpperCase(), // Capitalize SKU too
        minStockLevel,
        isActive
      });
      
      return NextResponse.json(newProduct, { status: 201 });
      
    } else {
      // Simple product creation (legacy)
      const { name, sku, unitOfMeasureId } = body;

      if (!name || !sku || !unitOfMeasureId) {
        return NextResponse.json(
          { error: 'Name, SKU and Unit of Measure ID are required' },
          { status: 400 }
        );
      }

      const newProduct = await createProduct(name.toUpperCase(), sku.toUpperCase(), unitOfMeasureId);
      return NextResponse.json(newProduct, { status: 201 });
    }
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}