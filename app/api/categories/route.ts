import { NextRequest, NextResponse } from 'next/server';
import mongoose from 'mongoose';
import Category from '@/models/Category';

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

// Default categories for small shops
const DEFAULT_CATEGORIES = [
  { name: 'GENERAL ITEMS', description: 'General products and miscellaneous items' },
  { name: 'FOOD & SNACKS', description: 'Food items, snacks, and consumables' },
  { name: 'BEVERAGES', description: 'Drinks, juices, water, and beverages' },
  { name: 'HOUSEHOLD', description: 'Daily use items and household products' },
  { name: 'PERSONAL CARE', description: 'Soap, shampoo, toothpaste, etc.' },
  { name: 'ELECTRONICS', description: 'Small electronics and accessories' },
  { name: 'STATIONERY', description: 'Pens, papers, books, and office supplies' },
  { name: 'HEALTH', description: 'Basic medicines and health products' }
];

export async function GET() {
  try {
    await connectDB();
    
    // Check if categories exist, if not create default ones
    const categoriesCount = await Category.countDocuments();
    if (categoriesCount === 0) {
      await Category.insertMany(DEFAULT_CATEGORIES);
    }
    
    const categories = await Category.find({ isActive: true }).sort({ name: 1 });
    return NextResponse.json(categories);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    await connectDB();
    
    const body = await request.json();
    const { name, description } = body;
    
    if (!name) {
      return NextResponse.json({ error: 'Category name is required' }, { status: 400 });
    }
    
    const category = new Category({
      name: name.toUpperCase(), // Always store in uppercase
      description,
      isActive: true
    });
    
    const savedCategory = await category.save();
    return NextResponse.json(savedCategory, { status: 201 });
    
  } catch (error: any) {
    if (error.code === 11000) {
      return NextResponse.json({ error: 'Category already exists' }, { status: 400 });
    }
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}