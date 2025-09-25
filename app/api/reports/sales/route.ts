import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '../../../lib/mongodb';
import { SalesOrder } from '../../../models/SalesOrder';
import { Product } from '../../../models/Product';

export async function GET(request: NextRequest) {
  try {
    await dbConnect();
    
    const { searchParams } = new URL(request.url);
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');
    const period = searchParams.get('period') || 'monthly';

    if (!startDate || !endDate) {
      return NextResponse.json(
        { error: 'Start date and end date are required' },
        { status: 400 }
      );
    }

    // Date range filter
    const dateFilter = {
      createdAt: {
        $gte: new Date(startDate),
        $lte: new Date(endDate + 'T23:59:59.999Z')
      }
    };

    // Get all sales orders in the date range
    const salesOrders = await SalesOrder.find({
      ...dateFilter,
      status: { $in: ['completed', 'fulfilled'] }
    }).populate('items.product').exec();

    // Calculate totals
    let totalSales = 0;
    let totalProfit = 0;
    let totalOrders = salesOrders.length;
    const productSales = new Map();

    for (const order of salesOrders) {
      totalSales += order.totalAmount;
      
      for (const item of order.items) {
        const profit = (item.unitPrice - (item.product?.costPrice || 0)) * item.quantity;
        totalProfit += profit;

        // Track product sales
        const productName = item.product?.name || 'Unknown Product';
        if (productSales.has(productName)) {
          const existing = productSales.get(productName);
          existing.quantitySold += item.quantity;
          existing.totalRevenue += item.unitPrice * item.quantity;
        } else {
          productSales.set(productName, {
            productName,
            quantitySold: item.quantity,
            totalRevenue: item.unitPrice * item.quantity
          });
        }
      }
    }

    // Get top products
    const topProducts = Array.from(productSales.values())
      .sort((a, b) => b.totalRevenue - a.totalRevenue)
      .slice(0, 10);

    const averageOrderValue = totalOrders > 0 ? totalSales / totalOrders : 0;

    const salesReport = {
      period: `${startDate} to ${endDate}`,
      totalSales,
      totalProfit,
      totalOrders,
      averageOrderValue,
      topProducts
    };

    return NextResponse.json(salesReport);
    
  } catch (error) {
    console.error('Error generating sales report:', error);
    return NextResponse.json(
      { error: 'Failed to generate sales report' },
      { status: 500 }
    );
  }
}