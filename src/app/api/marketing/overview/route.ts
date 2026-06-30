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
    const totalFollowers = 135145 + 45015; // Instagram + Twitter
    const totalInteractions = socialPosts.reduce((sum, p) => sum + p.likes + p.comments + p.shares + p.saves, 0);

    // Traffic data (mock monthly data)
    const trafficData = [
      { month: 'Oct', paid: 28000, organic: 35000 },
      { month: 'Nov', paid: 32000, organic: 38000 },
      { month: 'Dec', paid: 41000, organic: 42000 },
      { month: 'Jan', paid: 36500, organic: 45000 },
      { month: 'Feb', paid: 39000, organic: 48000 },
    ];

    // Funnel data
    const funnelData = [
      { stage: 'Impressions', value: 185256, dropRate: 0 },
      { stage: 'Clicks', value: 112125, dropRate: 39.5 },
      { stage: 'Page Views', value: 65256, dropRate: 41.8 },
      { stage: 'Add to Cart', value: 18420, dropRate: 71.8 },
      { stage: 'Signups', value: 41527, dropRate: 0 },
    ];

    return NextResponse.json({
      kpis: {
        totalSpend: totalSpend._sum.spend || 0,
        totalConversions: totalConversions._sum.conversions || 0,
        avgCac: Math.round(avgCac * 100) / 100,
        avgRoas: Math.round(avgRoas * 100) / 100,
        totalCampaigns: campaigns.length,
        totalFollowers,
        totalInteractions,
        pageViews: 12450,
        bounceRate: 86.5,
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
        instagram: { followers: 135145, posts: instagramPosts.length, engagement: 4.8 },
        twitter: { followers: 45015, posts: socialPosts.filter(p => p.platform === 'Twitter').length, engagement: 2.1 },
        facebook: { followers: 28900, posts: socialPosts.filter(p => p.platform === 'Facebook').length, engagement: 3.2 },
        pinterest: { followers: 12800, posts: socialPosts.filter(p => p.platform === 'Pinterest').length, engagement: 5.6 },
      },
    });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch overview data' }, { status: 500 });
  }
}