import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import User from '@/models/User';

export async function POST(request: NextRequest) {
  try {
    const { name, email, provider } = await request.json();

    if (!name || !email || !provider) {
      return NextResponse.json(
        { error: 'Name, email, and provider are required' },
        { status: 400 }
      );
    }

    await connectDB();

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return NextResponse.json(
        { error: 'User with this email already exists' },
        { status: 400 }
      );
    }

    // Create OAuth user (no password needed)
    const user = await User.create({
      name,
      email,
      provider,
      role: 'user'
    });

    return NextResponse.json(
      { message: 'OAuth user registered successfully', userId: user._id },
      { status: 201 }
    );
  } catch (error: any) {
    console.error('OAuth registration error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}