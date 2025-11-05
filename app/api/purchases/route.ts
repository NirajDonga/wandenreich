import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { connectDB } from '@/lib/mongodb';
import Purchase from '@/lib/models/Purchase';
import ProductSimple from '@/lib/models/ProductSimple';
import StockTransaction from '@/lib/models/StockTransaction';
import StockBatch from '@/lib/models/StockBatch';

// GET - Fetch all purchases for the logged-in user
export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();
    
    const purchases = await Purchase.find({ userId: session.user.id })
      .populate('supplierId', 'name phone contactName')
      .populate('items.productId', 'name unitOfMeasure')
      .sort({ createdAt: -1 });

    return NextResponse.json({ purchases }, { status: 200 });
  } catch (error) {
    console.error('Error fetching purchases:', error);
    return NextResponse.json({ error: 'Failed to fetch purchases' }, { status: 500 });
  }
}

// POST - Create a new purchase order
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { supplierId, items, paymentMethod, amountPaid, invoiceNumber, notes } = body;

    // Validation
    if (!supplierId) {
      return NextResponse.json({ error: 'Supplier is required' }, { status: 400 });
    }

    if (!items || items.length === 0) {
      return NextResponse.json({ error: 'At least one item is required' }, { status: 400 });
    }

    await connectDB();

    // Calculate total and prepare purchase items
    let totalAmount = 0;
    const purchaseItems = [];

    for (const item of items) {
      const { productId, quantity, unitCost, taxType, taxRate, taxAmount, totalCost } = item;

      if (!productId || !quantity || quantity <= 0 || !unitCost || unitCost <= 0) {
        return NextResponse.json({ error: 'Invalid item data' }, { status: 400 });
      }

      // Check product exists
      const product = await ProductSimple.findOne({
        _id: productId,
        userId: session.user.id
      });

      if (!product) {
        return NextResponse.json({ error: `Product not found: ${productId}` }, { status: 404 });
      }

      const itemTotal = totalCost || (quantity * unitCost);
      totalAmount += itemTotal;

      purchaseItems.push({
        productId,
        quantity,
        unitCost,
        taxType: taxType || 'none',
        taxRate: taxRate || 0,
        taxAmount: taxAmount || 0,
        totalCost: itemTotal
      });
    }

    // Create purchase record first
    const purchase = await Purchase.create({
      userId: session.user.id,
      supplierId,
      items: purchaseItems,
      totalAmount,
      amountPaid: amountPaid || 0,
      balanceDue: totalAmount - (amountPaid || 0),
      paymentMethod: paymentMethod || 'cash',
      paymentStatus: (amountPaid >= totalAmount) ? 'paid' : (amountPaid > 0 ? 'partial' : 'unpaid'),
      invoiceNumber,
      notes
    });

    // Update stock and create transactions for each item
    for (const item of items) {
      const { productId, quantity, unitCost } = item;

      // Update product stock (increase)
      const product = await ProductSimple.findOne({
        _id: productId,
        userId: session.user.id
      });

      if (product) {
        product.quantity += quantity;
        await product.save();

        // Create stock transaction
        await StockTransaction.create({
          userId: session.user.id,
          productId,
          transactionType: 'purchase',
          quantity: quantity, // Positive for incoming stock
          unitCost,
          unitPrice: 0,
          balanceAfter: product.quantity,
          referenceId: purchase._id,
          referenceModel: 'Purchase',
          notes: `Purchase from supplier${invoiceNumber ? ` - Invoice: ${invoiceNumber}` : ''}`
        });

        // Create stock batch for FIFO tracking
        await StockBatch.create({
          userId: session.user.id,
          productId,
          purchaseId: purchase._id,
          quantity: quantity, // Initial quantity
          originalQuantity: quantity,
          unitCost,
          purchaseDate: new Date()
        });
      }
    }

    return NextResponse.json({ 
      message: 'Purchase order created successfully', 
      purchase 
    }, { status: 201 });

  } catch (error) {
    console.error('Error creating purchase:', error);
    return NextResponse.json({ error: 'Failed to create purchase order' }, { status: 500 });
  }
}

// PUT - Update a purchase (for editing or adding payments)
export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { purchaseId, amountPaid, paymentMethod, notes, paymentStatus } = body;

    if (!purchaseId) {
      return NextResponse.json({ error: 'Purchase ID is required' }, { status: 400 });
    }

    await connectDB();

    const purchase = await Purchase.findOne({
      _id: purchaseId,
      userId: session.user.id
    });

    if (!purchase) {
      return NextResponse.json({ error: 'Purchase not found' }, { status: 404 });
    }

    // Direct status update (simple toggle)
    if (paymentStatus) {
      purchase.paymentStatus = paymentStatus;
    }
    // Update payment information
    else if (amountPaid !== undefined) {
      purchase.amountPaid = amountPaid;
      purchase.balanceDue = purchase.totalAmount - amountPaid;
      
      if (amountPaid >= purchase.totalAmount) {
        purchase.paymentStatus = 'paid';
      } else if (amountPaid > 0) {
        purchase.paymentStatus = 'partial';
      } else {
        purchase.paymentStatus = 'unpaid';
      }
    }

    if (paymentMethod) {
      purchase.paymentMethod = paymentMethod;
    }

    if (notes !== undefined) {
      purchase.notes = notes;
    }

    await purchase.save();

    return NextResponse.json({ 
      message: 'Purchase updated successfully', 
      purchase 
    }, { status: 200 });

  } catch (error) {
    console.error('Error updating purchase:', error);
    return NextResponse.json({ error: 'Failed to update purchase' }, { status: 500 });
  }
}

// DELETE - Delete a purchase (admin only, reverses stock)
export async function DELETE(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const purchaseId = searchParams.get('id');

    if (!purchaseId) {
      return NextResponse.json({ error: 'Purchase ID is required' }, { status: 400 });
    }

    await connectDB();

    const purchase = await Purchase.findOne({
      _id: purchaseId,
      userId: session.user.id
    });

    if (!purchase) {
      return NextResponse.json({ error: 'Purchase not found' }, { status: 404 });
    }

    // Reverse stock for each item
    for (const item of purchase.items) {
      const product = await ProductSimple.findOne({
        _id: item.productId,
        userId: session.user.id
      });

      if (product) {
        // Remove stock
        product.quantity -= item.quantity;
        if (product.quantity < 0) product.quantity = 0; // Prevent negative stock
        await product.save();

        // Create reversal stock transaction
        await StockTransaction.create({
          userId: session.user.id,
          productId: item.productId,
          transactionType: 'adjustment',
          quantity: -item.quantity, // Negative for outgoing stock
          unitCost: item.unitCost,
          unitPrice: 0,
          balanceAfter: product.quantity,
          referenceId: purchaseId,
          referenceModel: 'Purchase',
          notes: `Purchase reversal - Purchase ID: ${purchaseId}`
        });
      }
    }

    // Delete the purchase
    await Purchase.deleteOne({ _id: purchaseId });

    return NextResponse.json({ 
      message: 'Purchase deleted and stock reversed successfully' 
    }, { status: 200 });

  } catch (error) {
    console.error('Error deleting purchase:', error);
    return NextResponse.json({ error: 'Failed to delete purchase' }, { status: 500 });
  }
}
