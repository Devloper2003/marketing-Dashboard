import { NextResponse } from 'next/server';

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

/* ──────────── Mock Data ──────────── */
const mainFunnel: FunnelStage[] = [
  { stage: 'Awareness', count: 50000, conversionRate: null, dropoffRate: null, avgTimeSpent: 0.5, revenue: null },
  { stage: 'Interest', count: 28000, conversionRate: 56.0, dropoffRate: 44.0, avgTimeSpent: 2.1, revenue: null },
  { stage: 'Consideration', count: 12000, conversionRate: 42.9, dropoffRate: 57.1, avgTimeSpent: 5.8, revenue: null },
  { stage: 'Intent', count: 5500, conversionRate: 45.8, dropoffRate: 54.2, avgTimeSpent: 8.3, revenue: null },
  { stage: 'Evaluation', count: 2800, conversionRate: 50.9, dropoffRate: 49.1, avgTimeSpent: 12.4, revenue: null },
  { stage: 'Purchase', count: 1200, conversionRate: 42.9, dropoffRate: 57.1, avgTimeSpent: 18.7, revenue: 29760000 },
  { stage: 'Loyalty', count: 450, conversionRate: 37.5, dropoffRate: 62.5, avgTimeSpent: 0, revenue: 8910000 },
];

const funnelByChannel: ChannelFunnel[] = [
  {
    channel: 'Google Ads',
    stages: [
      { stage: 'Awareness', count: 18000 },
      { stage: 'Interest', count: 10200 },
      { stage: 'Consideration', count: 4400 },
      { stage: 'Intent', count: 2100 },
      { stage: 'Evaluation', count: 1100 },
      { stage: 'Purchase', count: 480 },
      { stage: 'Loyalty', count: 180 },
    ],
  },
  {
    channel: 'Facebook',
    stages: [
      { stage: 'Awareness', count: 14000 },
      { stage: 'Interest', count: 7800 },
      { stage: 'Consideration', count: 3200 },
      { stage: 'Intent', count: 1400 },
      { stage: 'Evaluation', count: 680 },
      { stage: 'Purchase', count: 280 },
      { stage: 'Loyalty', count: 95 },
    ],
  },
  {
    channel: 'Instagram',
    stages: [
      { stage: 'Awareness', count: 10000 },
      { stage: 'Interest', count: 5800 },
      { stage: 'Consideration', count: 2600 },
      { stage: 'Intent', count: 1200 },
      { stage: 'Evaluation', count: 620 },
      { stage: 'Purchase', count: 270 },
      { stage: 'Loyalty', count: 105 },
    ],
  },
  {
    channel: 'Email',
    stages: [
      { stage: 'Awareness', count: 5000 },
      { stage: 'Interest', count: 2800 },
      { stage: 'Consideration', count: 1200 },
      { stage: 'Intent', count: 580 },
      { stage: 'Evaluation', count: 280 },
      { stage: 'Purchase', count: 120 },
      { stage: 'Loyalty', count: 48 },
    ],
  },
  {
    channel: 'Organic',
    stages: [
      { stage: 'Awareness', count: 3000 },
      { stage: 'Interest', count: 1400 },
      { stage: 'Consideration', count: 600 },
      { stage: 'Intent', count: 220 },
      { stage: 'Evaluation', count: 120 },
      { stage: 'Purchase', count: 50 },
      { stage: 'Loyalty', count: 22 },
    ],
  },
];

const bottlenecks: Bottleneck[] = [
  {
    fromStage: 'Awareness',
    toStage: 'Interest',
    dropoffCount: 22000,
    dropoffPercent: 44.0,
    recommendation: 'Optimize ad creatives with high-resolution product imagery and A/B test headlines targeting luxury buyers.',
  },
  {
    fromStage: 'Consideration',
    toStage: 'Intent',
    dropoffCount: 6500,
    dropoffPercent: 54.2,
    recommendation: 'Implement retargeting campaigns and offer free virtual try-on experiences to increase purchase intent.',
  },
  {
    fromStage: 'Purchase',
    toStage: 'Loyalty',
    dropoffCount: 750,
    dropoffPercent: 62.5,
    recommendation: 'Launch post-purchase engagement program with exclusive offers and personalized thank-you experiences.',
  },
  {
    fromStage: 'Interest',
    toStage: 'Consideration',
    dropoffCount: 16000,
    dropoffPercent: 57.1,
    recommendation: 'Add detailed product videos, 360° views, and customer testimonials to build trust and consideration.',
  },
  {
    fromStage: 'Evaluation',
    toStage: 'Purchase',
    dropoffCount: 1600,
    dropoffPercent: 57.1,
    recommendation: 'Simplify checkout flow, offer EMI options, and add trust badges for secure high-value transactions.',
  },
];

const journeyDuration: JourneyDuration[] = [
  { range: '< 1 min', count: 3500 },
  { range: '1-5 min', count: 8200 },
  { range: '5-15 min', count: 12400 },
  { range: '15-60 min', count: 9800 },
  { range: '1-24 hrs', count: 7600 },
  { range: '1-7 days', count: 5800 },
  { range: '> 7 days', count: 2700 },
];

const deviceBreakdown: DeviceBreakdown[] = [
  { device: 'Desktop', percentage: 45, conversionRate: 1.2, count: 22500 },
  { device: 'Mobile', percentage: 48, conversionRate: 0.8, count: 24000 },
  { device: 'Tablet', percentage: 7, conversionRate: 0.5, count: 3500 },
];

const monthlyFunnelTrend: MonthlyFunnelTrend[] = [
  {
    month: 'Aug',
    stages: [
      { stage: 'Awareness', count: 42000 },
      { stage: 'Interest', count: 23000 },
      { stage: 'Consideration', count: 9800 },
      { stage: 'Intent', count: 4500 },
      { stage: 'Evaluation', count: 2200 },
      { stage: 'Purchase', count: 920 },
      { stage: 'Loyalty', count: 340 },
    ],
  },
  {
    month: 'Sep',
    stages: [
      { stage: 'Awareness', count: 44000 },
      { stage: 'Interest', count: 24500 },
      { stage: 'Consideration', count: 10500 },
      { stage: 'Intent', count: 4800 },
      { stage: 'Evaluation', count: 2400 },
      { stage: 'Purchase', count: 1020 },
      { stage: 'Loyalty', count: 370 },
    ],
  },
  {
    month: 'Oct',
    stages: [
      { stage: 'Awareness', count: 47000 },
      { stage: 'Interest', count: 26000 },
      { stage: 'Consideration', count: 11000 },
      { stage: 'Intent', count: 5100 },
      { stage: 'Evaluation', count: 2600 },
      { stage: 'Purchase', count: 1100 },
      { stage: 'Loyalty', count: 400 },
    ],
  },
  {
    month: 'Nov',
    stages: [
      { stage: 'Awareness', count: 52000 },
      { stage: 'Interest', count: 29500 },
      { stage: 'Consideration', count: 13000 },
      { stage: 'Intent', count: 6000 },
      { stage: 'Evaluation', count: 3100 },
      { stage: 'Purchase', count: 1350 },
      { stage: 'Loyalty', count: 480 },
    ],
  },
  {
    month: 'Dec',
    stages: [
      { stage: 'Awareness', count: 55000 },
      { stage: 'Interest', count: 31000 },
      { stage: 'Consideration', count: 14000 },
      { stage: 'Intent', count: 6400 },
      { stage: 'Evaluation', count: 3300 },
      { stage: 'Purchase', count: 1480 },
      { stage: 'Loyalty', count: 520 },
    ],
  },
  {
    month: 'Jan',
    stages: [
      { stage: 'Awareness', count: 50000 },
      { stage: 'Interest', count: 28000 },
      { stage: 'Consideration', count: 12000 },
      { stage: 'Intent', count: 5500 },
      { stage: 'Evaluation', count: 2800 },
      { stage: 'Purchase', count: 1200 },
      { stage: 'Loyalty', count: 450 },
    ],
  },
];

/* ──────────── GET Handler ──────────── */
export async function GET() {
  return NextResponse.json({
    mainFunnel,
    funnelByChannel,
    bottlenecks,
    journeyDuration,
    deviceBreakdown,
    monthlyFunnelTrend,
  });
}