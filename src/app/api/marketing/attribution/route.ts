import { NextResponse } from 'next/server';

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

/* ──────────── Mock Data ──────────── */

const channelData: ChannelAttribution[] = [
  {
    channel: 'Google Ads',
    firstTouchConversions: 284,
    lastTouchConversions: 198,
    linearConversions: 241,
    timeDecayConversions: 215,
    revenue: 4272000,
    cost: 1840000,
    assistedConversions: 156,
  },
  {
    channel: 'Facebook',
    firstTouchConversions: 196,
    lastTouchConversions: 232,
    linearConversions: 214,
    timeDecayConversions: 226,
    revenue: 3480000,
    cost: 1420000,
    assistedConversions: 128,
  },
  {
    channel: 'Instagram',
    firstTouchConversions: 312,
    lastTouchConversions: 276,
    linearConversions: 294,
    timeDecayConversions: 283,
    revenue: 5268000,
    cost: 2100000,
    assistedConversions: 198,
  },
  {
    channel: 'Email',
    firstTouchConversions: 42,
    lastTouchConversions: 168,
    linearConversions: 105,
    timeDecayConversions: 142,
    revenue: 1890000,
    cost: 320000,
    assistedConversions: 224,
  },
  {
    channel: 'Organic',
    firstTouchConversions: 178,
    lastTouchConversions: 224,
    linearConversions: 201,
    timeDecayConversions: 198,
    revenue: 3612000,
    cost: 580000,
    assistedConversions: 186,
  },
  {
    channel: 'Direct',
    firstTouchConversions: 88,
    lastTouchConversions: 152,
    linearConversions: 120,
    timeDecayConversions: 138,
    revenue: 2280000,
    cost: 0,
    assistedConversions: 94,
  },
];

const modelComparison: ModelComparison[] = [
  {
    model: 'First Touch',
    totalConversions: 1100,
    totalRevenue: 20802000,
    avgCac: 5855,
    topChannel: 'Instagram',
  },
  {
    model: 'Last Touch',
    totalConversions: 1250,
    totalRevenue: 20802000,
    avgCac: 5154,
    topChannel: 'Instagram',
  },
  {
    model: 'Linear',
    totalConversions: 1175,
    totalRevenue: 20802000,
    avgCac: 5485,
    topChannel: 'Instagram',
  },
  {
    model: 'Time Decay',
    totalConversions: 1202,
    totalRevenue: 20802000,
    avgCac: 5364,
    topChannel: 'Instagram',
  },
];

const touchPointDistribution: TouchPoint[] = [
  { stage: 'Ad Impression', count: 482000, dropoff: 0 },
  { stage: 'Ad Click', count: 28920, dropoff: 94.0 },
  { stage: 'Landing Page', count: 21760, dropoff: 24.8 },
  { stage: 'Product Page', count: 14480, dropoff: 33.5 },
  { stage: 'Add to Cart', count: 5232, dropoff: 63.9 },
  { stage: 'Checkout', count: 2846, dropoff: 45.6 },
  { stage: 'Purchase', count: 1624, dropoff: 42.9 },
  { stage: 'Repeat', count: 487, dropoff: 70.0 },
];

const monthlyTrend: MonthlyAttribution[] = [
  { month: 'Nov 2025', firstTouch: 162, lastTouch: 186, linear: 174, timeDecay: 178 },
  { month: 'Dec 2025', firstTouch: 198, lastTouch: 224, linear: 211, timeDecay: 216 },
  { month: 'Jan 2026', firstTouch: 184, lastTouch: 208, linear: 196, timeDecay: 202 },
  { month: 'Feb 2026', firstTouch: 210, lastTouch: 238, linear: 224, timeDecay: 230 },
  { month: 'Mar 2026', firstTouch: 176, lastTouch: 198, linear: 187, timeDecay: 190 },
  { month: 'Apr 2026', firstTouch: 170, lastTouch: 196, linear: 183, timeDecay: 186 },
];

const roiMatrix: RoiCell[] = [
  // Google Ads
  { channel: 'Google Ads', model: 'First Touch', roi: 1.32 },
  { channel: 'Google Ads', model: 'Last Touch', roi: 0.92 },
  { channel: 'Google Ads', model: 'Linear', roi: 1.12 },
  { channel: 'Google Ads', model: 'Time Decay', roi: 1.01 },
  // Facebook
  { channel: 'Facebook', model: 'First Touch', roi: 1.38 },
  { channel: 'Facebook', model: 'Last Touch', roi: 1.63 },
  { channel: 'Facebook', model: 'Linear', roi: 1.50 },
  { channel: 'Facebook', model: 'Time Decay', roi: 1.58 },
  // Instagram
  { channel: 'Instagram', model: 'First Touch', roi: 1.50 },
  { channel: 'Instagram', model: 'Last Touch', roi: 1.33 },
  { channel: 'Instagram', model: 'Linear', roi: 1.41 },
  { channel: 'Instagram', model: 'Time Decay', roi: 1.36 },
  // Email
  { channel: 'Email', model: 'First Touch', roi: 3.90 },
  { channel: 'Email', model: 'Last Touch', roi: 15.61 },
  { channel: 'Email', model: 'Linear', roi: 5.91 },
  { channel: 'Email', model: 'Time Decay', roi: 7.97 },
  // Organic
  { channel: 'Organic', model: 'First Touch', roi: 4.03 },
  { channel: 'Organic', model: 'Last Touch', roi: 5.08 },
  { channel: 'Organic', model: 'Linear', roi: 4.56 },
  { channel: 'Organic', model: 'Time Decay', roi: 4.49 },
  // Direct
  { channel: 'Direct', model: 'First Touch', roi: 0 },
  { channel: 'Direct', model: 'Last Touch', roi: 0 },
  { channel: 'Direct', model: 'Linear', roi: 0 },
  { channel: 'Direct', model: 'Time Decay', roi: 0 },
];

/* ──────────── Handler ──────────── */

export async function GET() {
  try {
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