import { NextRequest, NextResponse } from 'next/server';

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
}

const abTests: ABTest[] = [
  {
    id: 'ab-001',
    name: 'Hero Banner — Diamond Collection CTA',
    variantA: {
      name: 'Shop Now Button (Gold)',
      impressions: 48200,
      clicks: 3856,
      conversions: 312,
      revenue: 1872000,
      cr: 0.647,
      ctr: 8.0,
    },
    variantB: {
      name: 'Explore Collection Link',
      impressions: 48900,
      clicks: 4401,
      conversions: 392,
      revenue: 2352000,
      cr: 0.802,
      ctr: 9.0,
    },
    status: 'completed',
    winner: 'variant_b',
    startDate: '2026-01-15',
    endDate: '2026-02-14',
    confidenceLevel: 96.2,
    statisticalSignificance: true,
    metricType: 'conversion',
    channel: 'Website',
  },
  {
    id: 'ab-002',
    name: 'Google Ads Headline — Akshaya Tritiya',
    variantA: {
      name: 'Exclusive Gold Offers',
      impressions: 125000,
      clicks: 7500,
      conversions: 450,
      revenue: 3150000,
      cr: 0.36,
      ctr: 6.0,
    },
    variantB: {
      name: 'Limited Edition Designs',
      impressions: 123000,
      clicks: 8610,
      conversions: 567,
      revenue: 3969000,
      cr: 0.461,
      ctr: 7.0,
    },
    status: 'completed',
    winner: 'variant_b',
    startDate: '2026-02-01',
    endDate: '2026-03-01',
    confidenceLevel: 98.7,
    statisticalSignificance: true,
    metricType: 'revenue',
    channel: 'Google Ads',
  },
  {
    id: 'ab-003',
    name: 'Instagram Ad Creative — Wedding Collection',
    variantA: {
      name: 'Carousel (6 slides)',
      impressions: 89000,
      clicks: 6230,
      conversions: 311,
      revenue: 1866000,
      cr: 0.349,
      ctr: 7.0,
    },
    variantB: {
      name: 'Reels Video (30s)',
      impressions: 92000,
      clicks: 8280,
      conversions: 497,
      revenue: 2982000,
      cr: 0.54,
      ctr: 9.0,
    },
    status: 'running',
    winner: null,
    startDate: '2026-03-10',
    endDate: null,
    confidenceLevel: 87.4,
    statisticalSignificance: true,
    metricType: 'engagement',
    channel: 'Instagram',
  },
  {
    id: 'ab-004',
    name: 'Email Subject Line — Newsletter',
    variantA: {
      name: 'Your Curated Gold Picks ✨',
      impressions: 32000,
      clicks: 3520,
      conversions: 176,
      revenue: 704000,
      cr: 0.55,
      ctr: 11.0,
    },
    variantB: {
      name: 'Unlock 20% Off This Week',
      impressions: 31500,
      clicks: 4410,
      conversions: 221,
      revenue: 884000,
      cr: 0.702,
      ctr: 14.0,
    },
    status: 'completed',
    winner: 'variant_b',
    startDate: '2026-02-20',
    endDate: '2026-03-20',
    confidenceLevel: 94.1,
    statisticalSignificance: true,
    metricType: 'ctr',
    channel: 'Email',
  },
  {
    id: 'ab-005',
    name: 'Landing Page Layout — Solitaire Rings',
    variantA: {
      name: 'Classic Grid Layout',
      impressions: 41000,
      clicks: 2870,
      conversions: 143,
      revenue: 2145000,
      cr: 0.349,
      ctr: 7.0,
    },
    variantB: {
      name: 'Storytelling Scroll Layout',
      impressions: 40500,
      clicks: 3058,
      conversions: 153,
      revenue: 2295000,
      cr: 0.378,
      ctr: 7.55,
    },
    status: 'running',
    winner: null,
    startDate: '2026-04-01',
    endDate: null,
    confidenceLevel: 72.3,
    statisticalSignificance: false,
    metricType: 'conversion',
    channel: 'Landing Page',
  },
  {
    id: 'ab-006',
    name: 'Facebook Ad Copy — Festive Sale',
    variantA: {
      name: 'Emotion-driven Copy',
      impressions: 76000,
      clicks: 5320,
      conversions: 266,
      revenue: 1330000,
      cr: 0.35,
      ctr: 7.0,
    },
    variantB: {
      name: 'Urgency-driven Copy',
      impressions: 75500,
      clicks: 5285,
      conversions: 264,
      revenue: 1320000,
      cr: 0.35,
      ctr: 7.0,
    },
    status: 'completed',
    winner: 'inconclusive',
    startDate: '2026-01-05',
    endDate: '2026-02-05',
    confidenceLevel: 48.6,
    statisticalSignificance: false,
    metricType: 'revenue',
    channel: 'Facebook',
  },
  {
    id: 'ab-007',
    name: 'CTA Button Color — Product Pages',
    variantA: {
      name: 'Gold (#D4A843)',
      impressions: 55000,
      clicks: 4400,
      conversions: 352,
      revenue: 1760000,
      cr: 0.64,
      ctr: 8.0,
    },
    variantB: {
      name: 'Rose Gold (#B76E79)',
      impressions: 54800,
      clicks: 4932,
      conversions: 444,
      revenue: 2220000,
      cr: 0.81,
      ctr: 9.0,
    },
    status: 'completed',
    winner: 'variant_b',
    startDate: '2026-03-01',
    endDate: '2026-03-31',
    confidenceLevel: 97.8,
    statisticalSignificance: true,
    metricType: 'conversion',
    channel: 'Website',
  },
  {
    id: 'ab-008',
    name: 'Google Ads Landing — Kundan Sets',
    variantA: {
      name: 'Product Grid Page',
      impressions: 38000,
      clicks: 2280,
      conversions: 114,
      revenue: 2280000,
      cr: 0.3,
      ctr: 6.0,
    },
    variantB: {
      name: 'Cinematic Story Page',
      impressions: 38200,
      clicks: 2674,
      conversions: 187,
      revenue: 3740000,
      cr: 0.489,
      ctr: 7.0,
    },
    status: 'running',
    winner: null,
    startDate: '2026-04-10',
    endDate: null,
    confidenceLevel: 91.5,
    statisticalSignificance: true,
    metricType: 'revenue',
    channel: 'Google Ads',
  },
  {
    id: 'ab-009',
    name: 'Email CTA Placement — Diwali Preview',
    variantA: {
      name: 'Top of Email',
      impressions: 28000,
      clicks: 2520,
      conversions: 126,
      revenue: 504000,
      cr: 0.45,
      ctr: 9.0,
    },
    variantB: {
      name: 'Bottom After Story',
      impressions: 28200,
      clicks: 3074,
      conversions: 184,
      revenue: 736000,
      cr: 0.652,
      ctr: 10.9,
    },
    status: 'paused',
    winner: null,
    startDate: '2026-04-05',
    endDate: null,
    confidenceLevel: 63.8,
    statisticalSignificance: false,
    metricType: 'ctr',
    channel: 'Email',
  },
  {
    id: 'ab-010',
    name: 'Instagram Story Format — New Arrivals',
    variantA: {
      name: 'Static Image + Swipe Up',
      impressions: 64000,
      clicks: 4480,
      conversions: 179,
      revenue: 1074000,
      cr: 0.28,
      ctr: 7.0,
    },
    variantB: {
      name: 'Interactive Poll + Link',
      impressions: 64500,
      clicks: 5866,
      conversions: 293,
      revenue: 1758000,
      cr: 0.454,
      ctr: 9.09,
    },
    status: 'completed',
    winner: 'variant_b',
    startDate: '2026-02-15',
    endDate: '2026-03-15',
    confidenceLevel: 99.1,
    statisticalSignificance: true,
    metricType: 'engagement',
    channel: 'Instagram',
  },
];

// Helper to compute uplift from variant A to B
function computeUplift(test: ABTest): number {
  const metricMap: Record<string, number> = {
    ctr: test.variantA.ctr,
    conversion: test.variantA.cr,
    revenue: test.variantA.revenue,
    engagement: test.variantA.ctr,
  };
  const metricMapB: Record<string, number> = {
    ctr: test.variantB.ctr,
    conversion: test.variantB.cr,
    revenue: test.variantB.revenue,
    engagement: test.variantB.ctr,
  };
  const aVal = metricMap[test.metricType] || 0;
  const bVal = metricMapB[test.metricType] || 0;
  return aVal > 0 ? ((bVal - aVal) / aVal) * 100 : 0;
}

export async function GET() {
  try {
    const testsWithUplift = abTests.map((t) => ({
      ...t,
      uplift: Math.round(computeUplift(t) * 10) / 10,
    }));

    const totalTests = abTests.length;
    const running = abTests.filter((t) => t.status === 'running').length;
    const completed = abTests.filter((t) => t.status === 'completed').length;
    const significantTests = abTests.filter((t) => t.statisticalSignificance).length;
    const sigRate = totalTests > 0 ? Math.round((significantTests / totalTests) * 100) : 0;

    const completedWithWinner = abTests.filter((t) => t.status === 'completed' && t.winner !== 'inconclusive');
    const avgUplift =
      completedWithWinner.length > 0
        ? Math.round(
            (completedWithWinner.reduce((sum, t) => sum + computeUplift(t), 0) /
              completedWithWinner.length) *
              10
          ) / 10
        : 0;

    const totalRevenueImpact = abTests
      .filter((t) => t.winner === 'variant_b')
      .reduce((sum, t) => sum + (t.variantB.revenue - t.variantA.revenue), 0);

    const upliftTrend = [
      { month: 'Jan 2026', avgUplift: 8.2 },
      { month: 'Feb 2026', avgUplift: 12.5 },
      { month: 'Mar 2026', avgUplift: 15.8 },
      { month: 'Apr 2026', avgUplift: 18.3 },
      { month: 'May 2026', avgUplift: 22.1 },
      { month: 'Jun 2026', avgUplift: 24.6 },
    ];

    // Daily conversion rate mock data for a test (used by detail dialog)
    const dailyData: Record<string, Array<{ date: string; variantA: number; variantB: number }>> = {};
    for (const test of abTests) {
      const days = test.endDate
        ? Math.ceil(
            (new Date(test.endDate).getTime() - new Date(test.startDate).getTime()) /
              (1000 * 60 * 60 * 24)
          )
        : Math.ceil((Date.now() - new Date(test.startDate).getTime()) / (1000 * 60 * 60 * 24));
      const numDays = Math.min(days, 28);
      const data: Array<{ date: string; variantA: number; variantB: number }> = [];
      const baseA = test.metricType === 'ctr' ? test.variantA.ctr : test.variantA.cr;
      const baseB = test.metricType === 'ctr' ? test.variantB.ctr : test.variantB.cr;
      for (let i = 0; i < numDays; i++) {
        const d = new Date(test.startDate);
        d.setDate(d.getDate() + i);
        const variance = (Math.random() - 0.5) * 0.4;
        const varianceB = (Math.random() - 0.5) * 0.4;
        data.push({
          date: d.toISOString().split('T')[0],
          variantA: Math.max(0, Math.round((baseA + variance) * 100) / 100),
          variantB: Math.max(0, Math.round((baseB + varianceB) * 100) / 100),
        });
      }
      dailyData[test.id] = data;
    }

    return NextResponse.json({
      tests: testsWithUplift,
      summary: {
        totalTests,
        running,
        completed,
        avgUplift,
        totalRevenueImpact,
        significanceRate: sigRate,
      },
      upliftTrend,
      dailyData,
    });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch A/B test data' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, channel, metricType, variantAName, variantADesc, variantBName, variantBDesc } = body;

    if (!name || !channel || !metricType) {
      return NextResponse.json(
        { error: 'Test name, channel, and metric type are required' },
        { status: 400 }
      );
    }

    const newTest: ABTest = {
      id: `ab-${String(abTests.length + 1).padStart(3, '0')}`,
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
      status: 'running',
      winner: null,
      startDate: new Date().toISOString().split('T')[0],
      endDate: null,
      confidenceLevel: 0,
      statisticalSignificance: false,
      metricType: metricType as ABTest['metricType'],
      channel,
    };

    abTests.push(newTest);

    return NextResponse.json(
      { ...newTest, uplift: 0 },
      { status: 201 }
    );
  } catch (error) {
    return NextResponse.json({ error: 'Failed to create A/B test' }, { status: 500 });
  }
}