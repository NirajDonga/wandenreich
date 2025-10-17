import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { connectDB } from '@/lib/mongodb';
import Supplier from '@/lib/models/Supplier';

// GET all suppliers for logged in user
export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || !session.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();

    const suppliers = await Supplier.find({
      userId: (session.user as { id: string }).id
    }).sort({ createdAt: -1 });

    return NextResponse.json({ suppliers });
  } catch (error) {
    console.error('Error fetching suppliers:', error);
    return NextResponse.json(
      { error: 'Failed to fetch suppliers' },
      { status: 500 }
    );
  }
}

// POST - Create new supplier
export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || !session.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();

    const data = await request.json();
    const { name, contactName, email, phone, address, gstin } = data;

    // Validation
    if (!name || !phone) {
      return NextResponse.json(
        { error: 'Supplier name and phone are required' },
        { status: 400 }
      );
    }

    // Create supplier
    const supplier = await Supplier.create({
      userId: (session.user as { id: string }).id,
      name,
      contactName: contactName || undefined,
      email: email || undefined,
      phone,
      address: address || undefined,
      gstin: gstin || undefined
    });

    return NextResponse.json({ supplier }, { status: 201 });
  } catch (error) {
    console.error('Error creating supplier:', error);
    return NextResponse.json(
      { error: 'Failed to create supplier' },
      { status: 500 }
    );
  }
}

// PUT - Update supplier
export async function PUT(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || !session.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();

    const data = await request.json();
    const { id, name, contactName, email, phone, address, gstin } = data;

    if (!id) {
      return NextResponse.json({ error: 'Supplier ID is required' }, { status: 400 });
    }

    const supplier = await Supplier.findOneAndUpdate(
      { _id: id, userId: (session.user as { id: string }).id },
      {
        ...(name && { name }),
        ...(contactName !== undefined && { contactName }),
        ...(email !== undefined && { email }),
        ...(phone && { phone }),
        ...(address !== undefined && { address }),
        ...(gstin !== undefined && { gstin })
      },
      { new: true }
    );

    if (!supplier) {
      return NextResponse.json({ error: 'Supplier not found' }, { status: 404 });
    }

    return NextResponse.json({ supplier });
  } catch (error) {
    console.error('Error updating supplier:', error);
    return NextResponse.json(
      { error: 'Failed to update supplier' },
      { status: 500 }
    );
  }
}

// DELETE - Delete supplier
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
      return NextResponse.json({ error: 'Supplier ID is required' }, { status: 400 });
    }

    const supplier = await Supplier.findOneAndDelete({
      _id: id,
      userId: (session.user as { id: string }).id
    });

    if (!supplier) {
      return NextResponse.json({ error: 'Supplier not found' }, { status: 404 });
    }

    return NextResponse.json({ message: 'Supplier deleted successfully' });
  } catch (error) {
    console.error('Error deleting supplier:', error);
    return NextResponse.json(
      { error: 'Failed to delete supplier' },
      { status: 500 }
    );
  }
}
