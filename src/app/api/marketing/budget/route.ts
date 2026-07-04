import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET() {
  try {
    const items = await db.budgetItem.findMany({ orderBy: { createdAt: 'desc' } });

    const totalAllocated = items.reduce((sum, i) => sum + i.allocated, 0);
    const totalSpent = items.reduce((sum, i) => sum + i.spent, 0);
    const remaining = totalAllocated - totalSpent;
    const utilization = totalAllocated > 0 ? (totalSpent / totalAllocated) * 100 : 0;

    // By-category breakdown
    const categoryMap = new Map<string, { allocated: number; spent: number }>();
    for (const item of items) {
      const existing = categoryMap.get(item.category) || { allocated: 0, spent: 0 };
      existing.allocated += item.allocated;
      existing.spent += item.spent;
      categoryMap.set(item.category, existing);
    }
    const byCategory = Array.from(categoryMap.entries()).map(([category, data]) => ({
      category,
      allocated: data.allocated,
      spent: data.spent,
      remaining: data.allocated - data.spent,
      utilization: data.allocated > 0 ? Math.round((data.spent / data.allocated) * 100) : 0,
    }));

    // Monthly trend
    const monthlyTrend: { month: string; allocated: number; spent: number }[] = [];

    // Budget alerts (at_risk or over_budget)
    const alerts = items
      .filter((i) => i.status === 'at_risk' || i.status === 'over_budget')
      .map((i) => {
        const util = i.allocated > 0 ? Math.round((i.spent / i.allocated) * 100) : 0;
        return {
          id: i.id,
          category: i.category,
          channel: i.channel,
          allocated: i.allocated,
          spent: i.spent,
          utilization: util,
          status: i.status,
          recommendation:
            i.status === 'over_budget'
              ? `Immediate review needed. ${i.category} has exceeded the allocated budget by ₹${(i.spent - i.allocated).toLocaleString('en-IN')}. Consider reallocating funds or pausing non-performing campaigns.`
              : `${i.category} is at ${util}% of budget with time remaining. Monitor closely and optimize spend to avoid overspend this period.`,
        };
      })
      .sort((a, b) => b.utilization - a.utilization);

    return NextResponse.json({
      items,
      summary: {
        totalAllocated,
        totalSpent,
        remaining,
        utilization: Math.round(utilization * 10) / 10,
      },
      byCategory,
      monthlyTrend,
      alerts,
    });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch budget data' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { category, channel, allocated, spent, period, status } = body;

    if (!category || allocated == null) {
      return NextResponse.json({ error: 'Category and allocated amount are required' }, { status: 400 });
    }

    const item = await db.budgetItem.create({
      data: {
        category,
        channel: channel || null,
        allocated: parseFloat(allocated),
        spent: spent ? parseFloat(spent) : 0,
        period: period || null,
        status: status || 'on_track',
      },
    });

    return NextResponse.json(item, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to create budget item' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, category, channel, allocated, spent, period, status } = body;

    if (!id) {
      return NextResponse.json({ error: 'Item ID is required' }, { status: 400 });
    }

    const item = await db.budgetItem.update({
      where: { id },
      data: {
        ...(category && { category }),
        ...(channel !== undefined && { channel: channel || null }),
        ...(allocated != null && { allocated: parseFloat(allocated) }),
        ...(spent != null && { spent: parseFloat(spent) }),
        ...(period !== undefined && { period: period || null }),
        ...(status && { status }),
      },
    });

    return NextResponse.json(item);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update budget item' }, { status: 500 });
  }
}