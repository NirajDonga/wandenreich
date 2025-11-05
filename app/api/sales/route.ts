import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { connectDB } from '@/lib/mongodb';
import Sale from '@/lib/models/Sale';
import ProductSimple from '@/lib/models/ProductSimple';
import StockTransaction from '@/lib/models/StockTransaction';
import StockBatch from '@/lib/models/StockBatch';

// GET - Fetch all sales for the logged-in user
export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();
    
    const sales = await Sale.find({ userId: session.user.id })
      .populate('customerId', 'name phone')
      .populate('items.productId', 'name unitOfMeasure')
      .sort({ createdAt: -1 });

    return NextResponse.json({ sales }, { status: 200 });
  } catch (error) {
    console.error('Error fetching sales:', error);
    return NextResponse.json({ error: 'Failed to fetch sales' }, { status: 500 });
  }
}

// POST - Create a new sale
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { customerId, items, paymentMethod, amountPaid, notes } = body;

    // Validation
    if (!items || items.length === 0) {
      return NextResponse.json({ error: 'At least one item is required' }, { status: 400 });
    }

    await connectDB();

    // Calculate total and validate stock
    let totalAmount = 0;
    const saleItems = [];

    for (const item of items) {
      const { productId, quantity, sellingPrice } = item;

      if (!productId || !quantity || quantity <= 0) {
        return NextResponse.json({ error: 'Invalid item data' }, { status: 400 });
      }

      if (!sellingPrice || sellingPrice <= 0) {
        return NextResponse.json({ 
          error: 'Selling price is required for each item' 
        }, { status: 400 });
      }

      // Check product exists and has enough stock
      const product = await ProductSimple.findOne({
        _id: productId,
        userId: session.user.id
      });

      if (!product) {
        return NextResponse.json({ error: `Product not found: ${productId}` }, { status: 404 });
      }

      if (product.quantity < quantity) {
        return NextResponse.json({ 
          error: `Insufficient stock for ${product.name}. Available: ${product.quantity}` 
        }, { status: 400 });
      }

      const itemTotal = quantity * sellingPrice;
      totalAmount += itemTotal;

      saleItems.push({
        productId,
        quantity,
        sellingPrice: sellingPrice,
        totalPrice: itemTotal
      });
    }

    // Create sale record first
    const sale = await Sale.create({
      userId: session.user.id,
      customerId: customerId || null,
      items: saleItems,
      totalAmount,
      amountPaid: amountPaid || 0,
      balanceDue: totalAmount - (amountPaid || 0),
      paymentMethod: paymentMethod || 'cash',
      paymentStatus: (amountPaid >= totalAmount) ? 'paid' : (amountPaid > 0 ? 'partial' : 'unpaid'),
      notes
    });

    // Update stock and create transactions for each item
    for (const item of items) {
      const { productId, quantity, sellingPrice } = item;
      let remainingQuantity = quantity;

      // Update product stock
      const product = await ProductSimple.findOne({
        _id: productId,
        userId: session.user.id
      });

      if (product) {
        product.quantity -= quantity;
        await product.save();

        // Deduct from stock batches using FIFO (oldest first)
        const batches = await StockBatch.find({
          userId: session.user.id,
          productId,
          quantity: { $gt: 0 }
        }).sort({ purchaseDate: 1 }); // Oldest first

        for (const batch of batches) {
          if (remainingQuantity <= 0) break;

          const deductFromBatch = Math.min(batch.quantity, remainingQuantity);
          batch.quantity -= deductFromBatch;
          remainingQuantity -= deductFromBatch;
          await batch.save();
        }

        // Create stock transaction
        await StockTransaction.create({
          userId: session.user.id,
          productId,
          transactionType: 'sale',
          quantity: -quantity, // Negative for outgoing stock
          unitCost: 0,
          unitPrice: sellingPrice,
          balanceAfter: product.quantity,
          referenceId: sale._id,
          referenceModel: 'Sale',
          notes: `Sale to ${customerId ? 'customer' : 'walk-in customer'}`
        });
      }
    }

    return NextResponse.json({ 
      message: 'Sale created successfully', 
      sale 
    }, { status: 201 });

  } catch (error) {
    console.error('Error creating sale:', error);
    return NextResponse.json({ error: 'Failed to create sale' }, { status: 500 });
  }
}

// PUT - Update a sale (for editing or adding payments)
export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { saleId, amountPaid, paymentMethod, notes } = body;

    if (!saleId) {
      return NextResponse.json({ error: 'Sale ID is required' }, { status: 400 });
    }

    await connectDB();

    const sale = await Sale.findOne({
      _id: saleId,
      userId: session.user.id
    });

    if (!sale) {
      return NextResponse.json({ error: 'Sale not found' }, { status: 404 });
    }

    // Update payment information
    if (amountPaid !== undefined) {
      sale.amountPaid = amountPaid;
      sale.balanceDue = sale.totalAmount - amountPaid;
      
      if (amountPaid >= sale.totalAmount) {
        sale.paymentStatus = 'paid';
      } else if (amountPaid > 0) {
        sale.paymentStatus = 'partial';
      } else {
        sale.paymentStatus = 'unpaid';
      }
    }

    if (paymentMethod) {
      sale.paymentMethod = paymentMethod;
    }

    if (notes !== undefined) {
      sale.notes = notes;
    }

    await sale.save();

    return NextResponse.json({ 
      message: 'Sale updated successfully', 
      sale 
    }, { status: 200 });

  } catch (error) {
    console.error('Error updating sale:', error);
    return NextResponse.json({ error: 'Failed to update sale' }, { status: 500 });
  }
}

// DELETE - Delete a sale (admin only, reverses stock)
export async function DELETE(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const saleId = searchParams.get('id');

    if (!saleId) {
      return NextResponse.json({ error: 'Sale ID is required' }, { status: 400 });
    }

    await connectDB();

    const sale = await Sale.findOne({
      _id: saleId,
      userId: session.user.id
    });

    if (!sale) {
      return NextResponse.json({ error: 'Sale not found' }, { status: 404 });
    }

    // Reverse stock for each item
    for (const item of sale.items) {
      const product = await ProductSimple.findOne({
        _id: item.productId,
        userId: session.user.id
      });

      if (product) {
        // Add stock back
        product.quantity += item.quantity;
        await product.save();

        // Create reversal stock transaction
        await StockTransaction.create({
          userId: session.user.id,
          productId: item.productId,
          transactionType: 'adjustment',
          quantity: item.quantity, // Positive for incoming stock
          unitCost: 0,
          unitPrice: item.sellingPrice,
          balanceAfter: product.quantity,
          referenceId: saleId,
          referenceModel: 'Sale',
          notes: `Sale reversal - Sale ID: ${saleId}`
        });
      }
    }

    // Delete the sale
    await Sale.deleteOne({ _id: saleId });

    return NextResponse.json({ 
      message: 'Sale deleted and stock reversed successfully' 
    }, { status: 200 });

  } catch (error) {
    console.error('Error deleting sale:', error);
    return NextResponse.json({ error: 'Failed to delete sale' }, { status: 500 });
  }
}
