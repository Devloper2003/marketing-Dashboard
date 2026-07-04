import { db } from '@/lib/db';
import { NextRequest, NextResponse } from 'next/server';

// Laxree data (to be populated from DB)
const laxreeData = {
  name: 'Laxree',
  marketShare: 0,
  avgPriceRange: '',
  socialFollowers: 0,
  monthlyTraffic: 0,
  seoAuthority: 0,
  category: '',
};

// Social media breakdown per brand
const socialMediaData: Record<string, { instagram: number; facebook: number; youtube: number; twitter: number }> = {};

// Pricing comparison data
const pricingComparison: { brand: string; gold: number; diamond: number; platinum: number }[] = [];

// SWOT data
const swotData = {
  strengths: [] as string[],
  weaknesses: [] as string[],
  opportunities: [] as string[],
  threats: [] as string[],
};

// Radar chart data
const radarData: Record<string, unknown>[] = [];

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
        industryGrowthRate: 0,
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