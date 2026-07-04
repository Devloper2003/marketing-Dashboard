import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET() {
  try {
    const [campaigns, goals, totalSpend, totalConversions] = await Promise.all([
      db.campaign.findMany({ orderBy: { createdAt: 'desc' } }),
      db.channelGoal.findMany(),
      db.campaign.aggregate({ _sum: { spend: true } }),
      db.campaign.aggregate({ _sum: { conversions: true } }),
    ]);

    const avgCac = campaigns.length > 0
      ? campaigns.reduce((sum, c) => sum + c.cac, 0) / campaigns.length
      : 0;

    const avgRoas = campaigns.length > 0
      ? campaigns.reduce((sum, c) => sum + c.roas, 0) / campaigns.length
      : 0;

    const onTrack = goals.filter(g => g.status === 'on_track').length;
    const atRisk = goals.filter(g => g.status === 'at_risk').length;
    const offTrack = goals.filter(g => g.status === 'off_track').length;

    // Social media stats
    const socialPosts = await db.socialPost.findMany();
    const instagramPosts = socialPosts.filter(p => p.platform === 'Instagram');
    const totalFollowers = 0;
    const totalInteractions = socialPosts.reduce((sum, p) => sum + p.likes + p.comments + p.shares + p.saves, 0);

    // Traffic data
    const trafficData: { month: string; paid: number; organic: number }[] = [];

    // Funnel data
    const funnelData: { stage: string; value: number; dropRate: number }[] = [];

    return NextResponse.json({
      kpis: {
        totalSpend: totalSpend._sum.spend || 0,
        totalConversions: totalConversions._sum.conversions || 0,
        avgCac: Math.round(avgCac * 100) / 100,
        avgRoas: Math.round(avgRoas * 100) / 100,
        totalCampaigns: campaigns.length,
        totalFollowers,
        totalInteractions,
        pageViews: 0,
        bounceRate: 0,
      },
      goalTracking: {
        onTrack,
        atRisk,
        offTrack,
        total: goals.length,
      },
      campaigns,
      goals,
      trafficData,
      funnelData,
      socialMedia: {
        instagram: { followers: 0, posts: instagramPosts.length, engagement: 0 },
        twitter: { followers: 0, posts: socialPosts.filter(p => p.platform === 'Twitter').length, engagement: 0 },
        facebook: { followers: 0, posts: socialPosts.filter(p => p.platform === 'Facebook').length, engagement: 0 },
        pinterest: { followers: 0, posts: socialPosts.filter(p => p.platform === 'Pinterest').length, engagement: 0 },
      },
    });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch overview data' }, { status: 500 });
  }
}