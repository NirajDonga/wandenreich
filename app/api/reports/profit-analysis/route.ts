import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '../../../lib/mongodb';
import { SalesOrder } from '../../../models/SalesOrder';
import { PurchaseOrder } from '../../../models/PurchaseOrder';

export async function GET(request: NextRequest) {
  try {
    await dbConnect();
    
    const { searchParams } = new URL(request.url);
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');

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

    // Get sales data
    const salesOrders = await SalesOrder.find({
      ...dateFilter,
      status: { $in: ['completed', 'fulfilled'] }
    }).populate('items.product').exec();

    // Get purchase data for cost calculation
    const purchaseOrders = await PurchaseOrder.find({
      ...dateFilter,
      status: { $in: ['completed', 'received'] }
    }).populate('items.product').exec();

    // Calculate revenue and cost
    let revenue = 0;
    let cost = 0;

    // Calculate revenue from sales
    for (const order of salesOrders) {
      revenue += order.totalAmount;
      
      // Calculate cost based on product cost prices
      for (const item of order.items) {
        const productCost = item.product?.costPrice || 0;
        cost += productCost * item.quantity;
      }
    }

    const grossProfit = revenue - cost;
    const profitMargin = revenue > 0 ? (grossProfit / revenue) * 100 : 0;

    // Generate monthly breakdown
    const monthlyData = [];
    const start = new Date(startDate);
    const end = new Date(endDate);
    
    // For simplicity, we'll create 3 months of data
    // In a real implementation, you'd calculate this based on actual date ranges
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    
    for (let i = 0; i < 3; i++) {
      const monthRevenue = revenue * (0.3 + Math.random() * 0.4); // Mock distribution
      const monthCost = monthRevenue * 0.75; // Mock 25% profit margin
      const monthProfit = monthRevenue - monthCost;
      
      monthlyData.push({
        month: monthNames[(start.getMonth() + i) % 12],
        revenue: monthRevenue,
        cost: monthCost,
        profit: monthProfit
      });
    }

    const profitAnalysis = {
      period: `${startDate} to ${endDate}`,
      revenue,
      cost,
      grossProfit,
      profitMargin,
      monthlyData
    };

    return NextResponse.json(profitAnalysis);
    
  } catch (error) {
    console.error('Error generating profit analysis:', error);
    return NextResponse.json(
      { error: 'Failed to generate profit analysis' },
      { status: 500 }
    );
  }
}