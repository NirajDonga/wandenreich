import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { connectDB } from '@/lib/mongodb';
import Customer from '@/lib/models/Customer';

// GET all customers for logged in user
export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || !session.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();

    const customers = await Customer.find({
      userId: (session.user as { id: string }).id
    }).sort({ createdAt: -1 });

    return NextResponse.json({ customers });
  } catch (error) {
    console.error('Error fetching customers:', error);
    return NextResponse.json(
      { error: 'Failed to fetch customers' },
      { status: 500 }
    );
  }
}

// POST - Create new customer
export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || !session.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();

    const data = await request.json();
    const { name, email, phone, address, gstin } = data;

    // Validation
    if (!name || !phone) {
      return NextResponse.json(
        { error: 'Customer name and phone are required' },
        { status: 400 }
      );
    }

    // Create customer
    const customer = await Customer.create({
      userId: (session.user as { id: string }).id,
      name,
      email: email || undefined,
      phone,
      address: address || undefined,
      gstin: gstin || undefined
    });

    return NextResponse.json({ customer }, { status: 201 });
  } catch (error) {
    console.error('Error creating customer:', error);
    return NextResponse.json(
      { error: 'Failed to create customer' },
      { status: 500 }
    );
  }
}

// PUT - Update customer
export async function PUT(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || !session.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();

    const data = await request.json();
    const { id, name, email, phone, address, gstin } = data;

    if (!id) {
      return NextResponse.json({ error: 'Customer ID is required' }, { status: 400 });
    }

    const customer = await Customer.findOneAndUpdate(
      { _id: id, userId: (session.user as { id: string }).id },
      {
        ...(name && { name }),
        ...(email !== undefined && { email }),
        ...(phone && { phone }),
        ...(address !== undefined && { address }),
        ...(gstin !== undefined && { gstin })
      },
      { new: true }
    );

    if (!customer) {
      return NextResponse.json({ error: 'Customer not found' }, { status: 404 });
    }

    return NextResponse.json({ customer });
  } catch (error) {
    console.error('Error updating customer:', error);
    return NextResponse.json(
      { error: 'Failed to update customer' },
      { status: 500 }
    );
  }
}

// DELETE - Delete customer
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
      return NextResponse.json({ error: 'Customer ID is required' }, { status: 400 });
    }

    const customer = await Customer.findOneAndDelete({
      _id: id,
      userId: (session.user as { id: string }).id
    });

    if (!customer) {
      return NextResponse.json({ error: 'Customer not found' }, { status: 404 });
    }

    return NextResponse.json({ message: 'Customer deleted successfully' });
  } catch (error) {
    console.error('Error deleting customer:', error);
    return NextResponse.json(
      { error: 'Failed to delete customer' },
      { status: 500 }
    );
  }
}
