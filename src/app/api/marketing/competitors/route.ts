import { db } from '@/lib/db';
import { NextRequest, NextResponse } from 'next/server';

// Mock Laxree data for comparison
const laxreeData = {
  name: 'Laxree',
  marketShare: 6.8,
  avgPriceRange: '₹18,000 - ₹2,80,000',
  socialFollowers: 135000,
  monthlyTraffic: 45000,
  seoAuthority: 45,
  category: 'Luxury D2C',
};

// Mock social media breakdown per brand
const socialMediaData: Record<string, { instagram: number; facebook: number; youtube: number; twitter: number }> = {
  'Laxree': { instagram: 85000, facebook: 32000, youtube: 12000, twitter: 6000 },
  'Tanishq': { instagram: 3200000, facebook: 1500000, youtube: 380000, twitter: 120000 },
  'CaratLane': { instagram: 2100000, facebook: 780000, youtube: 250000, twitter: 70000 },
  'Kalyan Jewellers': { instagram: 1800000, facebook: 720000, youtube: 220000, twitter: 60000 },
  'Malabar Gold': { instagram: 1400000, facebook: 500000, youtube: 150000, twitter: 50000 },
  'PC Jeweller': { instagram: 950000, facebook: 420000, youtube: 100000, twitter: 30000 },
  'Senco Gold': { instagram: 550000, facebook: 260000, youtube: 60000, twitter: 20000 },
  'BlueStone': { instagram: 1200000, facebook: 450000, youtube: 120000, twitter: 30000 },
  'Voylla': { instagram: 1600000, facebook: 600000, youtube: 150000, twitter: 50000 },
};

// Mock pricing comparison data
const pricingComparison = [
  { brand: 'Laxree', gold: 85000, diamond: 180000, platinum: 220000 },
  { brand: 'Tanishq', gold: 120000, diamond: 350000, platinum: 450000 },
  { brand: 'CaratLane', gold: 45000, diamond: 85000, platinum: 120000 },
  { brand: 'Kalyan Jewellers', gold: 95000, diamond: 280000, platinum: 380000 },
  { brand: 'Malabar Gold', gold: 100000, diamond: 300000, platinum: 400000 },
  { brand: 'PC Jeweller', gold: 55000, diamond: 120000, platinum: 160000 },
  { brand: 'Senco Gold', gold: 65000, diamond: 150000, platinum: 200000 },
  { brand: 'BlueStone', gold: 50000, diamond: 95000, platinum: 130000 },
  { brand: 'Voylla', gold: 2000, diamond: 8000, platinum: 12000 },
];

// Mock SWOT for Laxree
const swotData = {
  strengths: [
    'Distinctive luxury positioning with artisan craftsmanship',
    'Strong brand storytelling and heritage narrative',
    'Growing influencer and celebrity collaborations',
    'Bespoke and customization options differentiate from mass brands',
    'Premium packaging and unboxing experience',
  ],
  weaknesses: [
    'Limited brand awareness compared to Tanishq/Kalyan',
    'Small social media following (135K vs industry leaders 3M+)',
    'Low monthly web traffic (45K vs competitors 2M-18M)',
    'SEO authority score significantly below competitors (45 vs 65-82)',
    'No physical retail presence',
  ],
  opportunities: [
    'Indian luxury jewellery market growing at 12.5% CAGR',
    'Rising demand for D2C luxury brands among millennials',
    'Underserved premium segment between mass-market and ultra-luxury',
    'International market expansion via e-commerce',
    'AR/VR try-on technology for online jewellery shopping',
  ],
  threats: [
    'Tanishq and Kalyan expanding digital presence rapidly',
    'CaratLane/BlueStone dominating online jewellery mindshare',
    'Price wars from mass-market brands eroding perceived value',
    'Rising gold prices impacting consumer purchase decisions',
    'Regulatory changes in hallmarking and GST affecting margins',
  ],
};

// Mock radar chart data for Laxree vs top competitors
const radarData = [
  { metric: 'Brand Trust', Laxree: 55, Tanishq: 92, CaratLane: 72, Kalyan: 78 },
  { metric: 'Digital Presence', Laxree: 35, Tanishq: 60, CaratLane: 88, Kalyan: 40 },
  { metric: 'Price Competitiveness', Laxree: 50, Tanishq: 35, CaratLane: 75, Kalyan: 45 },
  { metric: 'Product Variety', Laxree: 45, Tanishq: 85, CaratLane: 70, Kalyan: 80 },
  { metric: 'Customer Experience', Laxree: 70, Tanishq: 65, CaratLane: 80, Kalyan: 55 },
  { metric: 'Innovation', Laxree: 60, Tanishq: 50, CaratLane: 85, Kalyan: 35 },
];

export async function GET() {
  try {
    const competitors = await db.competitor.findMany({
      orderBy: { marketShare: 'desc' },
    });

    // Calculate Laxree's position
    const allShares = [laxreeData.marketShare, ...competitors.map((c) => c.marketShare)];
    const sorted = [...allShares].sort((a, b) => b - a);
    const laxreePosition = sorted.indexOf(laxreeData.marketShare) + 1;
    const totalCompetitors = competitors.length + 1;
    const avgMarketShare = allShares.reduce((a, b) => a + b, 0) / allShares.length;

    return NextResponse.json({
      competitors,
      laxree: laxreeData,
      marketShareChart: [
        { name: 'Laxree', marketShare: laxreeData.marketShare, isLaxree: true },
        ...competitors.map((c) => ({
          name: c.name,
          marketShare: c.marketShare,
          isLaxree: false,
        })),
      ].sort((a, b) => b.marketShare - a.marketShare),
      radarData,
      socialMedia: socialMediaData,
      pricingComparison,
      swotData,
      summary: {
        totalCompetitors,
        avgMarketShare: Math.round(avgMarketShare * 100) / 100,
        laxreePosition: `${laxreePosition}${laxreePosition === 1 ? 'st' : laxreePosition === 2 ? 'nd' : laxreePosition === 3 ? 'rd' : 'th'} of ${totalCompetitors}`,
        industryGrowthRate: 12.5,
      },
    });
  } catch (error) {
    console.error('Error fetching competitors:', error);
    return NextResponse.json({ error: 'Failed to fetch competitors' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, website, category, marketShare, avgPriceRange, socialFollowers, monthlyTraffic, seoAuthority, strengths, weaknesses, notes } = body;

    if (!name) {
      return NextResponse.json({ error: 'Name is required' }, { status: 400 });
    }

    const competitor = await db.competitor.create({
      data: {
        name,
        website: website || null,
        category: category || null,
        marketShare: marketShare ?? 0,
        avgPriceRange: avgPriceRange || null,
        socialFollowers: socialFollowers ?? 0,
        monthlyTraffic: monthlyTraffic ?? 0,
        seoAuthority: seoAuthority ?? 0,
        strengths: strengths || null,
        weaknesses: weaknesses || null,
        notes: notes || null,
      },
    });

    return NextResponse.json(competitor, { status: 201 });
  } catch (error) {
    console.error('Error creating competitor:', error);
    return NextResponse.json({ error: 'Failed to create competitor' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, ...data } = body;

    if (!id) {
      return NextResponse.json({ error: 'ID is required' }, { status: 400 });
    }

    const competitor = await db.competitor.update({
      where: { id },
      data,
    });

    return NextResponse.json(competitor);
  } catch (error) {
    console.error('Error updating competitor:', error);
    return NextResponse.json({ error: 'Failed to update competitor' }, { status: 500 });
  }
}