import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { connectDB } from '@/lib/mongodb';
import Unit from '@/lib/models/Unit';

// GET all units for logged in user
export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || !session.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();

    const units = await Unit.find({
      userId: (session.user as { id: string }).id
    }).sort({ name: 1 });

    return NextResponse.json({ units });
  } catch (error) {
    console.error('Error fetching units:', error);
    return NextResponse.json(
      { error: 'Failed to fetch units' },
      { status: 500 }
    );
  }
}

// POST - Create new unit
export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || !session.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();

    const data = await request.json();
    const { name, symbol, description } = data;

    if (!name || !symbol) {
      return NextResponse.json(
        { error: 'Name and symbol are required' },
        { status: 400 }
      );
    }

    // Create unit
    const unit = await Unit.create({
      userId: (session.user as { id: string }).id,
      name,
      symbol,
      description: description || undefined
    });

    return NextResponse.json({ unit }, { status: 201 });
  } catch (error) {
    console.error('Error creating unit:', error);
    return NextResponse.json(
      { error: 'Failed to create unit' },
      { status: 500 }
    );
  }
}

// PUT - Update unit
export async function PUT(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || !session.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();

    const data = await request.json();
    const { id, name, symbol, description } = data;

    if (!id) {
      return NextResponse.json({ error: 'Unit ID is required' }, { status: 400 });
    }

    const unit = await Unit.findOneAndUpdate(
      { _id: id, userId: (session.user as { id: string }).id },
      {
        ...(name && { name }),
        ...(symbol && { symbol }),
        ...(description !== undefined && { description })
      },
      { new: true }
    );

    if (!unit) {
      return NextResponse.json({ error: 'Unit not found' }, { status: 404 });
    }

    return NextResponse.json({ unit });
  } catch (error) {
    console.error('Error updating unit:', error);
    return NextResponse.json(
      { error: 'Failed to update unit' },
      { status: 500 }
    );
  }
}

// DELETE - Delete unit
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
      return NextResponse.json({ error: 'Unit ID is required' }, { status: 400 });
    }

    const unit = await Unit.findOneAndDelete({
      _id: id,
      userId: (session.user as { id: string }).id
    });

    if (!unit) {
      return NextResponse.json({ error: 'Unit not found' }, { status: 404 });
    }

    return NextResponse.json({ message: 'Unit deleted successfully' });
  } catch (error) {
    console.error('Error deleting unit:', error);
    return NextResponse.json(
      { error: 'Failed to delete unit' },
      { status: 500 }
    );
  }
}
