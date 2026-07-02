import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET() {
  try {
    const leads = await db.lead.findMany({ orderBy: { date: 'desc' } });
    const qualityCounts = {
      HOT: leads.filter(l => l.quality === 'HOT').length,
      WARM: leads.filter(l => l.quality === 'WARM').length,
      COLD: leads.filter(l => l.quality === 'COLD').length,
      NEEDS_REVIEW: leads.filter(l => l.quality === 'NEEDS_REVIEW').length,
    };
    const sources = [...new Set(leads.map(l => l.utmSource).filter(Boolean))] as string[];
    const countries = [...new Set(leads.map(l => l.country).filter(Boolean))] as string[];

    // Trend data (mock)
    const trendData = [
      { date: 'Week 1', traffic: 12500, roi: 4200, conversions: 180 },
      { date: 'Week 2', traffic: 13200, roi: 4500, conversions: 195 },
      { date: 'Week 3', traffic: 12800, roi: 4100, conversions: 172 },
      { date: 'Week 4', traffic: 14100, roi: 4800, conversions: 210 },
      { date: 'Week 5', traffic: 14800, roi: 5200, conversions: 225 },
      { date: 'Week 6', traffic: 15200, roi: 5500, conversions: 240 },
    ];

    // Revenue data (mock)
    const revenueData = {
      total: 363950,
      online: 245600,
      inStore: 118350,
      monthly: [
        { month: 'Sep', online: 182000, inStore: 95000 },
        { month: 'Oct', online: 215000, inStore: 108000 },
        { month: 'Nov', online: 248000, inStore: 132000 },
        { month: 'Dec', online: 295000, inStore: 156000 },
        { month: 'Jan', online: 245600, inStore: 118350 },
      ],
    };

    return NextResponse.json({ leads, qualityCounts, sources, countries, trendData, revenueData });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch leads' }, { status: 500 });
  }
}