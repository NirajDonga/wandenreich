import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { connectDB } from '@/lib/mongodb';
import ProductSimple from '@/lib/models/ProductSimple';
import StockTransaction from '@/lib/models/StockTransaction';

// GET all products for logged in user
export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || !session.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();

    const { searchParams } = new URL(request.url);
    const productId = searchParams.get('id');

    if (productId) {
      // Get single product
      const product = await ProductSimple.findOne({
        _id: productId,
        userId: (session.user as { id: string }).id
      });

      if (!product) {
        return NextResponse.json({ error: 'Product not found' }, { status: 404 });
      }

      return NextResponse.json({ product });
    }

    // Get all products
    const products = await ProductSimple.find({
      userId: (session.user as { id: string }).id
    }).sort({ createdAt: -1 });

    return NextResponse.json({ products });
  } catch (error) {
    console.error('Error fetching products:', error);
    return NextResponse.json(
      { error: 'Failed to fetch products' },
      { status: 500 }
    );
  }
}

// POST - Create new product
export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || !session.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();

    const data = await request.json();
    const { name, companyName, unitOfMeasure, customUnit, quantity, minStockLevel } = data;

    // Validation
    if (!name || quantity === undefined) {
      return NextResponse.json(
        { error: 'Product name and quantity are required' },
        { status: 400 }
      );
    }

    const finalUnit = unitOfMeasure === 'custom' ? customUnit : unitOfMeasure;

    if (!finalUnit) {
      return NextResponse.json(
        { error: 'Unit of measure is required' },
        { status: 400 }
      );
    }

    // Create product
    const product = await ProductSimple.create({
      userId: (session.user as { id: string }).id,
      name,
      companyName: companyName || '',
      unitOfMeasure: finalUnit,
      quantity: parseInt(quantity) || 0,
      minStockLevel: parseInt(minStockLevel) || 0
    });

    // Create initial stock transaction if quantity > 0
    if (parseInt(quantity) > 0) {
      await StockTransaction.create({
        userId: (session.user as { id: string }).id,
        productId: product._id,
        transactionType: 'adjustment',
        quantity: parseInt(quantity),
        notes: 'Initial stock',
        balanceAfter: parseInt(quantity)
      });
    }

    return NextResponse.json({ product }, { status: 201 });
  } catch (error) {
    console.error('Error creating product:', error);
    const errorMessage = error instanceof Error ? error.message : 'Failed to create product';
    return NextResponse.json(
      { error: 'Failed to create product', details: errorMessage },
      { status: 500 }
    );
  }
}

// PUT - Update product
export async function PUT(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || !session.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();

    const data = await request.json();
    const { id, name, companyName, unitOfMeasure, minStockLevel } = data;

    if (!id) {
      return NextResponse.json({ error: 'Product ID is required' }, { status: 400 });
    }

    const product = await ProductSimple.findOneAndUpdate(
      { _id: id, userId: (session.user as { id: string }).id },
      {
        ...(name && { name }),
        ...(companyName !== undefined && { companyName }),
        ...(unitOfMeasure && { unitOfMeasure }),
        ...(minStockLevel !== undefined && { minStockLevel: parseInt(minStockLevel) })
      },
      { new: true }
    );

    if (!product) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 });
    }

    return NextResponse.json({ product });
  } catch (error) {
    console.error('Error updating product:', error);
    return NextResponse.json(
      { error: 'Failed to update product' },
      { status: 500 }
    );
  }
}

// DELETE - Delete product
export async function DELETE(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || !session.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'Product ID is required' }, { status: 400 });
    }

    const product = await ProductSimple.findOneAndDelete({
      _id: id,
      userId: (session.user as { id: string }).id
    });

    if (!product) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 });
    }

    return NextResponse.json({ message: 'Product deleted successfully' });
  } catch (error) {
    console.error('Error deleting product:', error);
    return NextResponse.json(
      { error: 'Failed to delete product' },
      { status: 500 }
    );
  }
}
