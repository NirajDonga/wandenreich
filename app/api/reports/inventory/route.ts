import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '../../../lib/mongodb';
import { Product } from '../../../models/Product';
import { Inventory } from '../../../models/Inventory';

export async function GET(request: NextRequest) {
  try {
    await dbConnect();

    // Get all products with their inventory
    const products = await Product.find().populate('inventory').exec();

    let totalValue = 0;
    let totalProducts = products.length;
    let lowStockItems = 0;
    let outOfStockItems = 0;
    const topValueProducts = [];

    for (const product of products) {
      const inventory = product.inventory;
      const currentStock = inventory ? inventory.currentStock : 0;
      const unitPrice = product.sellingPrice || 0;
      const productValue = currentStock * unitPrice;

      totalValue += productValue;

      // Check stock levels
      if (currentStock === 0) {
        outOfStockItems++;
      } else if (currentStock <= (product.minimumStock || 0)) {
        lowStockItems++;
      }

      // Track high-value products
      if (productValue > 0) {
        topValueProducts.push({
          productName: product.name,
          quantity: currentStock,
          unitPrice: unitPrice,
          totalValue: productValue
        });
      }
    }

    // Sort by total value and get top 10
    topValueProducts.sort((a, b) => b.totalValue - a.totalValue);
    const topValueProductsSliced = topValueProducts.slice(0, 10);

    const inventoryReport = {
      totalValue,
      totalProducts,
      lowStockItems,
      outOfStockItems,
      topValueProducts: topValueProductsSliced
    };

    return NextResponse.json(inventoryReport);
    
  } catch (error) {
    console.error('Error generating inventory report:', error);
    return NextResponse.json(
      { error: 'Failed to generate inventory report' },
      { status: 500 }
    );
  }
}