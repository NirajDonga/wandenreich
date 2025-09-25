import { NextRequest, NextResponse } from 'next/server';
import mongoose from 'mongoose';
import UnitOfMeasure from '@/models/UnitOfMeasure';

// Connect to MongoDB if not connected
async function connectDB() {
  if (mongoose.connections[0].readyState) return;
  
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/wandenreich');
  } catch (error) {
    console.error('Database connection error:', error);
    throw error;
  }
}

// Default units for small shops
const DEFAULT_UNITS = [
  { name: 'PIECES', abbreviation: 'PCS' },
  { name: 'KILOGRAMS', abbreviation: 'KG' },
  { name: 'GRAMS', abbreviation: 'GM' },
  { name: 'LITERS', abbreviation: 'LTR' },
  { name: 'MILLILITERS', abbreviation: 'ML' },
  { name: 'METERS', abbreviation: 'MTR' },
  { name: 'BOXES', abbreviation: 'BOX' },
  { name: 'PACKETS', abbreviation: 'PKT' },
  { name: 'BOTTLES', abbreviation: 'BTL' },
  { name: 'PAIRS', abbreviation: 'PR' }
];

export async function GET() {
  try {
    await connectDB();
    
    // Check if units exist, if not create default ones
    const unitsCount = await UnitOfMeasure.countDocuments();
    if (unitsCount === 0) {
      await UnitOfMeasure.insertMany(DEFAULT_UNITS);
    }
    
    const units = await UnitOfMeasure.find().sort({ name: 1 });
    return NextResponse.json(units);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    await connectDB();
    
    const body = await request.json();
    const { name, abbreviation } = body;
    
    if (!name || !abbreviation) {
      return NextResponse.json({ error: 'Name and abbreviation are required' }, { status: 400 });
    }
    
    const unit = new UnitOfMeasure({
      name: name.toUpperCase(),
      abbreviation: abbreviation.toUpperCase()
    });
    
    const savedUnit = await unit.save();
    return NextResponse.json(savedUnit, { status: 201 });
    
  } catch (error: any) {
    if (error.code === 11000) {
      return NextResponse.json({ error: 'Unit already exists' }, { status: 400 });
    }
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}