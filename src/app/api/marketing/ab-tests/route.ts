import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

interface Variant {
  name: string;
  impressions: number;
  clicks: number;
  conversions: number;
  revenue: number;
  cr: number;
  ctr: number;
}

interface ABTest {
  id: string;
  name: string;
  variantA: Variant;
  variantB: Variant;
  status: 'running' | 'completed' | 'paused';
  winner: 'variant_a' | 'variant_b' | 'inconclusive' | null;
  startDate: string;
  endDate: string | null;
  confidenceLevel: number;
  statisticalSignificance: boolean;
  metricType: 'ctr' | 'conversion' | 'revenue' | 'engagement';
  channel: string;
  uplift?: number;
}

export async function GET() {
  try {
    const tests: ABTest[] = [];
    const dailyData: Record<string, Array<{ date: string; variantA: number; variantB: number }>> = {};

    return NextResponse.json({
      tests,
      summary: {
        totalTests: 0,
        running: 0,
        completed: 0,
        avgUplift: 0,
        totalRevenueImpact: 0,
        significanceRate: 0,
      },
      upliftTrend: [],
      dailyData,
    });
  } catch {
    return NextResponse.json({ error: 'Failed to fetch A/B test data' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, channel, metricType, variantAName, variantBName } = body;

    if (!name || !channel || !metricType) {
      return NextResponse.json(
        { error: 'Test name, channel, and metric type are required' },
        { status: 400 }
      );
    }

    const newTest = {
      id: `ab-${String(Date.now()).slice(-6)}`,
      name,
      variantA: {
        name: variantAName || 'Variant A',
        impressions: 0,
        clicks: 0,
        conversions: 0,
        revenue: 0,
        cr: 0,
        ctr: 0,
      },
      variantB: {
        name: variantBName || 'Variant B',
        impressions: 0,
        clicks: 0,
        conversions: 0,
        revenue: 0,
        cr: 0,
        ctr: 0,
      },
      status: 'running' as const,
      winner: null,
      startDate: new Date().toISOString().split('T')[0],
      endDate: null,
      confidenceLevel: 0,
      statisticalSignificance: false,
      metricType: metricType as ABTest['metricType'],
      channel,
      uplift: 0,
    };

    return NextResponse.json(newTest, { status: 201 });
  } catch {
    return NextResponse.json({ error: 'Failed to create A/B test' }, { status: 500 });
  }
}