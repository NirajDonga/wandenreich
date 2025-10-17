import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { connectDB } from '@/lib/mongodb';
import Purchase from '@/lib/models/Purchase';
import ProductSimple from '@/lib/models/ProductSimple';
import StockTransaction from '@/lib/models/StockTransaction';
import mongoose from 'mongoose';

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
  const mongoSession = await mongoose.startSession();
  mongoSession.startTransaction();

  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      await mongoSession.abortTransaction();
      mongoSession.endSession();
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { supplierId, items, paymentMethod, amountPaid, invoiceNumber, notes } = body;

    // Validation
    if (!supplierId) {
      await mongoSession.abortTransaction();
      mongoSession.endSession();
      return NextResponse.json({ error: 'Supplier is required' }, { status: 400 });
    }

    if (!items || items.length === 0) {
      await mongoSession.abortTransaction();
      mongoSession.endSession();
      return NextResponse.json({ error: 'At least one item is required' }, { status: 400 });
    }

    await connectDB();

    // Calculate total and update stock
    let totalAmount = 0;
    const purchaseItems = [];

    for (const item of items) {
      const { productId, quantity, unitCost, taxType, taxRate, taxAmount, totalCost } = item;

      if (!productId || !quantity || quantity <= 0 || !unitCost || unitCost <= 0) {
        await mongoSession.abortTransaction();
        mongoSession.endSession();
        return NextResponse.json({ error: 'Invalid item data' }, { status: 400 });
      }

      // Check product exists
      const product = await ProductSimple.findOne({
        _id: productId,
        userId: session.user.id
      }).session(mongoSession);

      if (!product) {
        await mongoSession.abortTransaction();
        mongoSession.endSession();
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

      // Update product stock (increase)
      product.quantity += quantity;
      await product.save({ session: mongoSession });

      // Create stock transaction
      await StockTransaction.create([{
        userId: session.user.id,
        productId,
        transactionType: 'purchase',
        quantity: quantity, // Positive for incoming stock
        unitCost,
        unitPrice: 0, // No selling price stored in product anymore
        balanceAfter: product.quantity,
        reference: 'Purchase', // Will update with purchase ID after creation
        notes: `Purchase from supplier${invoiceNumber ? ` - Invoice: ${invoiceNumber}` : ''}`
      }], { session: mongoSession });
    }

    // Create purchase record
    const purchase = await Purchase.create([{
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
    }], { session: mongoSession });

    // Update stock transaction reference with purchase ID
    await StockTransaction.updateMany(
      {
        userId: session.user.id,
        reference: 'Purchase',
        createdAt: { $gte: new Date(Date.now() - 5000) } // Within last 5 seconds
      },
      { reference: purchase[0]._id.toString() },
      { session: mongoSession }
    );

    await mongoSession.commitTransaction();
    mongoSession.endSession();

    return NextResponse.json({ 
      message: 'Purchase order created successfully', 
      purchase: purchase[0] 
    }, { status: 201 });

  } catch (error) {
    await mongoSession.abortTransaction();
    mongoSession.endSession();
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
    const { purchaseId, amountPaid, paymentMethod, notes } = body;

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

    // Update payment information
    if (amountPaid !== undefined) {
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
  const mongoSession = await mongoose.startSession();
  mongoSession.startTransaction();

  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      await mongoSession.abortTransaction();
      mongoSession.endSession();
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const purchaseId = searchParams.get('id');

    if (!purchaseId) {
      await mongoSession.abortTransaction();
      mongoSession.endSession();
      return NextResponse.json({ error: 'Purchase ID is required' }, { status: 400 });
    }

    await connectDB();

    const purchase = await Purchase.findOne({
      _id: purchaseId,
      userId: session.user.id
    }).session(mongoSession);

    if (!purchase) {
      await mongoSession.abortTransaction();
      mongoSession.endSession();
      return NextResponse.json({ error: 'Purchase not found' }, { status: 404 });
    }

    // Reverse stock for each item
    for (const item of purchase.items) {
      const product = await ProductSimple.findOne({
        _id: item.productId,
        userId: session.user.id
      }).session(mongoSession);

      if (product) {
        // Remove stock
        product.quantity -= item.quantity;
        if (product.quantity < 0) product.quantity = 0; // Prevent negative stock
        await product.save({ session: mongoSession });

        // Create reversal stock transaction
        await StockTransaction.create([{
          userId: session.user.id,
          productId: item.productId,
          transactionType: 'adjustment',
          quantity: -item.quantity, // Negative for outgoing stock
          unitCost: item.unitCost,
          unitPrice: 0, // No selling price stored in product anymore
          balanceAfter: product.quantity,
          reference: purchaseId,
          notes: `Purchase reversal - Purchase ID: ${purchaseId}`
        }], { session: mongoSession });
      }
    }

    // Delete the purchase
    await Purchase.deleteOne({ _id: purchaseId }).session(mongoSession);

    await mongoSession.commitTransaction();
    mongoSession.endSession();

    return NextResponse.json({ 
      message: 'Purchase deleted and stock reversed successfully' 
    }, { status: 200 });

  } catch (error) {
    await mongoSession.abortTransaction();
    mongoSession.endSession();
    console.error('Error deleting purchase:', error);
    return NextResponse.json({ error: 'Failed to delete purchase' }, { status: 500 });
  }
}
