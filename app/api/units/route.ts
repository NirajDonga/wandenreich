import { NextRequest, NextResponse } from 'next/server';
import { createUnitOfMeasure, getAllUnitsOfMeasure } from '@/services/productService';

export async function GET() {
  try {
    const units = await getAllUnitsOfMeasure();
    return NextResponse.json(units);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, abbreviation } = body;

    if (!name || !abbreviation) {
      return NextResponse.json(
        { error: 'Name and abbreviation are required' },
        { status: 400 }
      );
    }

    const newUnit = await createUnitOfMeasure(name, abbreviation);
    return NextResponse.json(newUnit, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}