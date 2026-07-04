import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

/* ──────────── Types ──────────── */

interface ChannelAttribution {
  channel: string;
  firstTouchConversions: number;
  lastTouchConversions: number;
  linearConversions: number;
  timeDecayConversions: number;
  revenue: number;
  cost: number;
  assistedConversions: number;
}

interface ModelComparison {
  model: string;
  totalConversions: number;
  totalRevenue: number;
  avgCac: number;
  topChannel: string;
}

interface TouchPoint {
  stage: string;
  count: number;
  dropoff: number;
}

interface MonthlyAttribution {
  month: string;
  firstTouch: number;
  lastTouch: number;
  linear: number;
  timeDecay: number;
}

interface RoiCell {
  channel: string;
  model: string;
  roi: number;
}

/* ──────────── Handler ──────────── */

export async function GET() {
  try {
    const channelData: ChannelAttribution[] = [];
    const modelComparison: ModelComparison[] = [];
    const touchPointDistribution: TouchPoint[] = [];
    const monthlyTrend: MonthlyAttribution[] = [];
    const roiMatrix: RoiCell[] = [];

    return NextResponse.json({
      channelData,
      modelComparison,
      touchPointDistribution,
      monthlyTrend,
      roiMatrix,
    });
  } catch {
    return NextResponse.json(
      { error: 'Failed to fetch attribution data' },
      { status: 500 }
    );
  }
}