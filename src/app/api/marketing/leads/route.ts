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

    // Trend data
    const trendData: { date: string; traffic: number; roi: number; conversions: number }[] = [];

    // Revenue data
    const revenueData = { total: 0, online: 0, inStore: 0, monthlyTrend: [] as { month: string; online: number; inStore: number }[] };

    return NextResponse.json({ leads, qualityCounts, sources, countries, trendData, revenueData });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch leads' }, { status: 500 });
  }
}