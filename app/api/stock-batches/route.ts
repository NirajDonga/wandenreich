import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { connectDB } from '@/lib/mongodb';
import StockBatch from '@/lib/models/StockBatch';

// GET - Fetch stock batches for a product
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const productId = searchParams.get('productId');

    if (!productId) {
      return NextResponse.json({ error: 'Product ID is required' }, { status: 400 });
    }

    await connectDB();
    
    // Get all stock batches for this product (FIFO order - oldest first)
    // Only show batches with quantity > 0
    const batches = await StockBatch.find({
      userId: session.user.id,
      productId,
      quantity: { $gt: 0 }
    }).sort({ purchaseDate: 1 }); // Oldest first (FIFO)

    return NextResponse.json({ batches }, { status: 200 });
  } catch (error) {
    console.error('Error fetching stock batches:', error);
    return NextResponse.json({ error: 'Failed to fetch stock batches' }, { status: 500 });
  }
}
