import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

/* ──────────── Types ──────────── */
interface FunnelStage {
  stage: string;
  count: number;
  conversionRate: number | null;
  dropoffRate: number | null;
  avgTimeSpent: number;
  revenue: number | null;
}

interface ChannelFunnel {
  channel: string;
  stages: { stage: string; count: number }[];
}

interface Bottleneck {
  fromStage: string;
  toStage: string;
  dropoffCount: number;
  dropoffPercent: number;
  recommendation: string;
}

interface JourneyDuration {
  range: string;
  count: number;
}

interface DeviceBreakdown {
  device: string;
  percentage: number;
  conversionRate: number;
  count: number;
}

interface MonthlyFunnelTrend {
  month: string;
  stages: { stage: string; count: number }[];
}

/* ──────────── GET Handler ──────────── */
export async function GET() {
  try {
    const mainFunnel: FunnelStage[] = [];
    const funnelByChannel: ChannelFunnel[] = [];
    const bottlenecks: Bottleneck[] = [];
    const journeyDuration: JourneyDuration[] = [];
    const deviceBreakdown: DeviceBreakdown[] = [];
    const monthlyFunnelTrend: MonthlyFunnelTrend[] = [];

    return NextResponse.json({
      mainFunnel,
      funnelByChannel,
      bottlenecks,
      journeyDuration,
      deviceBreakdown,
      monthlyFunnelTrend,
    });
  } catch {
    return NextResponse.json(
      { error: 'Failed to fetch funnel data' },
      { status: 500 }
    );
  }
}