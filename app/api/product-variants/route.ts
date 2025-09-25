import { NextRequest, NextResponse } from 'next/server';
import { createProductVariant, getVariantsByProductId } from '@/services/productService';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const productId = searchParams.get('productId');

    if (!productId) {
      return NextResponse.json(
        { error: 'Product ID is required' },
        { status: 400 }
      );
    }

    const variants = await getVariantsByProductId(productId);
    return NextResponse.json(variants);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { productId, name, sku, attributes, sellingPrice } = body;

    if (!productId || !name || !sku || sellingPrice === undefined) {
      return NextResponse.json(
        { error: 'Product ID, name, SKU, and selling price are required' },
        { status: 400 }
      );
    }

    const newVariant = await createProductVariant(
      productId,
      name,
      sku,
      attributes || {},
      sellingPrice
    );

    return NextResponse.json(newVariant, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}