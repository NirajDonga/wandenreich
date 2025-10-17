import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { connectDB } from '@/lib/mongodb';
import Tax from '@/lib/models/Tax';

// GET all tax rates for logged in user
export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || !session.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();

    const taxes = await Tax.find({
      userId: (session.user as { id: string }).id
    }).sort({ rate: 1 });

    return NextResponse.json({ taxes });
  } catch (error) {
    console.error('Error fetching taxes:', error);
    return NextResponse.json(
      { error: 'Failed to fetch taxes' },
      { status: 500 }
    );
  }
}

// POST - Create new tax
export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || !session.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();

    const data = await request.json();
    const { name, rate, description } = data;

    if (!name || rate === undefined) {
      return NextResponse.json(
        { error: 'Name and rate are required' },
        { status: 400 }
      );
    }

    if (rate < 0 || rate > 100) {
      return NextResponse.json(
        { error: 'Tax rate must be between 0 and 100' },
        { status: 400 }
      );
    }

    // Create tax
    const tax = await Tax.create({
      userId: (session.user as { id: string }).id,
      name,
      rate,
      description: description || undefined
    });

    return NextResponse.json({ tax }, { status: 201 });
  } catch (error) {
    console.error('Error creating tax:', error);
    return NextResponse.json(
      { error: 'Failed to create tax' },
      { status: 500 }
    );
  }
}

// PUT - Update tax
export async function PUT(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || !session.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();

    const data = await request.json();
    const { id, name, rate, description } = data;

    if (!id) {
      return NextResponse.json({ error: 'Tax ID is required' }, { status: 400 });
    }

    if (rate !== undefined && (rate < 0 || rate > 100)) {
      return NextResponse.json(
        { error: 'Tax rate must be between 0 and 100' },
        { status: 400 }
      );
    }

    const tax = await Tax.findOneAndUpdate(
      { _id: id, userId: (session.user as { id: string }).id },
      {
        ...(name && { name }),
        ...(rate !== undefined && { rate }),
        ...(description !== undefined && { description })
      },
      { new: true }
    );

    if (!tax) {
      return NextResponse.json({ error: 'Tax not found' }, { status: 404 });
    }

    return NextResponse.json({ tax });
  } catch (error) {
    console.error('Error updating tax:', error);
    return NextResponse.json(
      { error: 'Failed to update tax' },
      { status: 500 }
    );
  }
}

// DELETE - Delete tax
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
      return NextResponse.json({ error: 'Tax ID is required' }, { status: 400 });
    }

    const tax = await Tax.findOneAndDelete({
      _id: id,
      userId: (session.user as { id: string }).id
    });

    if (!tax) {
      return NextResponse.json({ error: 'Tax not found' }, { status: 404 });
    }

    return NextResponse.json({ message: 'Tax deleted successfully' });
  } catch (error) {
    console.error('Error deleting tax:', error);
    return NextResponse.json(
      { error: 'Failed to delete tax' },
      { status: 500 }
    );
  }
}
